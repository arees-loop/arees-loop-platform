import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentSession } from "@/lib/session";
import { canManageTransport } from "@/lib/transport-permissions";
import { canManageHotel } from "@/lib/hotel-permissions";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Key="flights"|"ferries"|"visas"|"drivingLicenses"|"hotels";
type Counters=Record<Key,number|null>;
const blank=():Counters=>({flights:null,ferries:null,visas:null,drivingLicenses:null,hotels:null});
const transport=[{kind:"FLIGHT",key:"flights"},{kind:"FERRY",key:"ferries"},
 {kind:"VISA",key:"visas"},{kind:"DRIVING_LICENSE",key:"drivingLicenses"}] as const;
const closed=["DONE","CANCELED","CANCELLED","COMPLETED","CLOSED","REJECTED"];
const inProgress=new Set(["PROCESSING","QUOTE_READY","QUOTE_SENT","PAID","EXECUTING","CONTACTED","QUOTED","UNDER_REVIEW"]);
const customerAction=new Set(["CUSTOMER_MESSAGE_SENT","CUSTOMER_OFFER_ACCEPTED","CUSTOMER_TRANSFER_SUBMITTED","CUSTOMER_ATTACHMENT_UPLOADED"]);
const h={"Cache-Control":"private, no-store"};

export async function GET(){
 const session=await getCurrentSession();
 if(!session)return NextResponse.json({success:false,message:"يلزم تسجيل الدخول."},{status:401,headers:h});
 const user=session.user;
 if(!["SUPER_ADMIN","ADMIN"].includes(user.role))return NextResponse.json({success:false,message:"غير مصرح."},{status:403,headers:h});
 const superAdmin=user.role==="SUPER_ADMIN";
 const allowed=transport.filter(t=>superAdmin||canManageTransport(user,t.kind));
 const hotelAccess=superAdmin||canManageHotel(user);
 const scope=superAdmin?{}:{assignedToId:user.id};
 const counts=blank(),processing=blank(),attention=blank(),emailFailed=blank();
 const permitted=[...allowed.map(t=>t.key),...(hotelAccess?["hotels" as const]:[])];
 for(const key of permitted){counts[key]=0;processing[key]=0;attention[key]=0;emailFailed[key]=0;}
 const recent:{id:string;reference:string;kind:string;type:string;createdAt:string;href:string}[]=[];
 const serviceLink:Record<Key,string>={
  flights:"/admin/transport/flights?view=requests",ferries:"/admin/transport/ferries?view=requests",
  visas:"/admin/transport/visas?view=requests",drivingLicenses:"/admin/transport/driving-licenses?view=requests",
  hotels:"/admin/hotels?view=requests",
 };
 try{
  // Bounded last-action scan for in-app notifications; never expose private contact data.
  const [transportRows,hotelRows]=await Promise.all([
   allowed.length?prisma.transportRequest.findMany({
    where:{kind:{in:allowed.map(x=>x.kind)},status:{notIn:closed},...scope},
    orderBy:[{updatedAt:"desc"},{id:"desc"}],take:1200,
    select:{id:true,reference:true,kind:true,status:true,notificationStatus:true,createdAt:true,
      events:{orderBy:[{createdAt:"desc"},{id:"desc"}],take:1,select:{id:true,action:true,createdAt:true}}}
   }):Promise.resolve([]),
   hotelAccess?prisma.hotelInquiry.findMany({
    where:{status:{notIn:closed},...scope},orderBy:[{updatedAt:"desc"},{id:"desc"}],take:1200,
    select:{id:true,reference:true,status:true,notificationStatus:true,createdAt:true,
      events:{orderBy:[{createdAt:"desc"},{id:"desc"}],take:1,select:{id:true,action:true,createdAt:true}}}
   }):Promise.resolve([])
  ]);
  for(const r of transportRows){
    const key=transport.find(t=>t.kind===r.kind)?.key;
    if(!key||counts[key]===null)continue;
    if(r.status==="NEW")counts[key]!++;
    if(inProgress.has(r.status))processing[key]!++;
    if(r.notificationStatus==="FAILED")emailFailed[key]!++;
    const latest=r.events[0];
    if(latest&&customerAction.has(latest.action)){
      attention[key]!++;
      recent.push({id:latest.id,reference:r.reference,kind:r.kind,type:latest.action,
        createdAt:latest.createdAt.toISOString(),href:serviceLink[key]});
    }else if(r.status==="NEW")recent.push({id:r.id,reference:r.reference,kind:r.kind,type:"NEW_REQUEST",createdAt:r.createdAt.toISOString(),href:serviceLink[key]});
  }
  for(const r of hotelRows){
    if(r.status==="NEW")counts.hotels!++;
    if(inProgress.has(r.status))processing.hotels!++;
    if(r.notificationStatus==="FAILED")emailFailed.hotels!++;
    const latest=r.events[0];
    if(latest&&customerAction.has(latest.action)){
      attention.hotels!++;
      recent.push({id:latest.id,reference:r.reference,kind:"HOTEL",type:latest.action,
        createdAt:latest.createdAt.toISOString(),href:serviceLink.hotels});
    }else if(r.status==="NEW")recent.push({id:r.id,reference:r.reference,kind:"HOTEL",type:"NEW_REQUEST",createdAt:r.createdAt.toISOString(),href:serviceLink.hotels});
  }
  // IDP applications use the same service badge and notification link as legacy travel requests.
  if(superAdmin&&counts.drivingLicenses!==null){
   const drafts=await prisma.auditLog.findMany({
    where:{entityType:"LICENSE_CART_APPLICATION",action:"LICENSE_FORM_ADDED_TO_CART",
     createdAt:{gte:new Date(Date.now()-30*24*60*60*1000)}},
    orderBy:[{createdAt:"desc"},{id:"desc"}],take:200,
    select:{id:true,entityId:true,createdAt:true}
   });
   const refs=drafts.map(x=>x.entityId).filter((x):x is string=>!!x);
   const [statuses,payments,emails]=await Promise.all([
    refs.length?prisma.auditLog.findMany({where:{entityType:"LICENSE_CART_WORKFLOW",entityId:{in:refs},action:"STATUS_CHANGED"},
     orderBy:[{createdAt:"desc"},{id:"desc"}],select:{entityId:true,afterData:true}}):Promise.resolve([]),
    prisma.auditLog.findMany({where:{entityType:"CART_BANK_CHECKOUT",action:"CART_BANK_CREATED"},
     orderBy:{createdAt:"desc"},take:300,select:{entityId:true,afterData:true}}),
    refs.length?prisma.auditLog.findMany({where:{entityType:"LICENSE_CART_APPLICATION",entityId:{in:refs},
     action:"LICENSE_CART_EMAIL_FAILED"},select:{entityId:true}}):Promise.resolve([])
   ]);
   const stateMap=new Map<string,string>();
   for(const x of statuses)if(x.entityId&&!stateMap.has(x.entityId)){
    const d=x.afterData&&typeof x.afterData==="object"&&!Array.isArray(x.afterData)?x.afterData as Record<string,unknown>:{};
    stateMap.set(x.entityId,String(d.status||""));
   }
   const bankByLicense=new Map<string,string>();
   for(const x of payments){
    const d=x.afterData&&typeof x.afterData==="object"&&!Array.isArray(x.afterData)?x.afterData as Record<string,unknown>:{};
    const items=Array.isArray(d.rows)?d.rows:[];
    for(const line of items){
     const row=line&&typeof line==="object"&&!Array.isArray(line)?line as Record<string,unknown>:{};
     const app=row.application&&typeof row.application==="object"&&!Array.isArray(row.application)?row.application as Record<string,unknown>:{};
     if(row.itemType==="DRIVING_LICENSE"&&typeof app.requestReference==="string"&&x.entityId)
      bankByLicense.set(app.requestReference,x.entityId);
    }
   }
   const bankRefs=[...bankByLicense.values()];
   const paid=bankRefs.length?await prisma.auditLog.findMany({where:{entityType:"CART_BANK_CHECKOUT",
    entityId:{in:bankRefs},action:"CART_BANK_VERIFIED"},select:{entityId:true}}):[];
   const paidRefs=new Set(paid.map(x=>x.entityId));
   const failures=new Set(emails.map(x=>x.entityId));
   for(const d of drafts){
    if(!d.entityId)continue;
    const custom=stateMap.get(d.entityId);
    const verified=paidRefs.has(bankByLicense.get(d.entityId)||"");
    const closed=custom==="CANCELED"&&!verified||custom==="DONE"&&verified;
    if(closed)continue;
    if(verified)processing.drivingLicenses!++;else counts.drivingLicenses!++;
    if(failures.has(d.entityId))emailFailed.drivingLicenses!++;
    if(!verified&&custom!=="CANCELED")
     recent.push({id:d.id,reference:d.entityId,kind:"DRIVING_LICENSE",
      type:"LICENSE_FORM_ADDED_TO_CART",createdAt:d.createdAt.toISOString(),
      href:"/admin/transport/driving-licenses?view=requests"});
   }
  }
  recent.sort((a,b)=>b.createdAt.localeCompare(a.createdAt)||b.id.localeCompare(a.id));
  const sum=(v:Counters)=>Object.values(v).reduce<number>((n,x)=>n+(x??0),0);
  const emailConfigured=Boolean(process.env.RESEND_API_KEY&&
    (process.env.EMAIL_FROM||process.env.RESEND_FROM_EMAIL)&&process.env.AREES_ADMIN_EMAILS);
  return NextResponse.json({success:true,counts,inProgress:processing,needsAttention:attention,emailFailed,
    totals:{new:sum(counts),inProgress:sum(processing),attention:sum(attention),emailFailed:sum(emailFailed)},
    recent:recent.slice(0,20),snapshotEventId:recent[0]?.id||null,
    limited:transportRows.length>=1200||hotelRows.length>=1200,
    emailConfigured,updatedAt:new Date().toISOString()}, {headers:h});
 }catch(error){
  console.error("Admin request alert counts failed",error);
  return NextResponse.json({success:false,message:"تعذر تحديث إشعارات الإدارة."},{status:503,headers:h});
 }
}
