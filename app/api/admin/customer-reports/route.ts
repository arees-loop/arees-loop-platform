import {NextResponse} from "next/server";
import {prisma} from "@/lib/prisma";
import {getCurrentSession} from "@/lib/session";
export async function GET(){
 const session=await getCurrentSession();
 if(!session)return NextResponse.json({success:false,message:"تسجيل الدخول مطلوب"},{status:401});
 if(session.user.role!=="SUPER_ADMIN")return NextResponse.json({success:false,message:"غير مصرح"},{status:403});
 try{
  const [users,bookings,transport,hotels,archiveEvents]=await Promise.all([
   prisma.user.findMany({where:{role:"CUSTOMER"},select:{id:true,firstName:true,lastName:true,email:true,phone:true,status:true,createdAt:true},orderBy:{createdAt:"desc"}}),
   prisma.booking.findMany({select:{userId:true,customerName:true,customerEmail:true,customerPhone:true,totalAmount:true,status:true,createdAt:true}}),
   prisma.transportRequest.findMany({select:{userId:true,customerName:true,customerEmail:true,phone:true,createdAt:true}}),
   prisma.hotelInquiry.findMany({select:{userId:true,customerName:true,customerEmail:true,phone:true,createdAt:true}}),
   prisma.auditLog.findMany({where:{entityType:"CustomerAccount",action:{in:["CUSTOMER_ARCHIVED","CUSTOMER_RESTORED"]}},orderBy:{createdAt:"asc"},select:{entityId:true,action:true,createdAt:true}})
  ]);
  type Customer={key:string;name:string;email:string;phone:string;registeredAt:string|null;orders:number;bookingValue:number;source:string;status?:string;archived?:boolean};
  const map=new Map<string,Customer>();
  const emailIndex=new Map<string,string>();
  const phoneIndex=new Map<string,string>();
  const norm=(x:string|null|undefined)=>String(x||"").trim().toLowerCase();
  const lastEvent=new Map<string,{action:string;createdAt:Date}>();for(const event of archiveEvents){if(event.entityId)lastEvent.set(event.entityId,event);}
  const archivedIds=new Set([...lastEvent].filter(([,e])=>e.action==="CUSTOMER_ARCHIVED").map(([id])=>id));
  for(const u of users){const key="u:"+u.id;map.set(key,{key,name:[u.firstName,u.lastName].filter(Boolean).join(" ")||"غير محدد",email:u.email,phone:u.phone||"",registeredAt:u.createdAt.toISOString(),orders:0,bookingValue:0,source:"حساب مسجل",status:u.status,archived:archivedIds.has(u.id)});if(u.email)emailIndex.set(norm(u.email),key);if(u.phone)phoneIndex.set(norm(u.phone),key);}
  function add(x:{userId?:string|null;customerName:string;customerEmail?:string|null;customerPhone?:string|null;phone?:string|null},value=0){
   const phone=x.customerPhone||x.phone||"";const email=norm(x.customerEmail);
   const key=(x.userId&&map.has("u:"+x.userId)?"u:"+x.userId:null)||(email&&emailIndex.get(email))||(phone&&phoneIndex.get(norm(phone)))||(email?"g:e:"+email:phone?"g:p:"+norm(phone):null);
   if(!key)return;
   let row=map.get(key);
   if(!row){row={key,name:x.customerName||"غير محدد",email:x.customerEmail||"",phone,registeredAt:null,orders:0,bookingValue:0,source:"طلب ضيف"};map.set(key,row);}
   row.orders++;row.bookingValue+=value;
  }
  for(const b of bookings)add(b,["PAID","COMPLETED"].includes(b.status)?Number(b.totalAmount):0);
  for(const t of transport)add(t);
  for(const h of hotels)add(h);
  const data=[...map.values()].filter(x=>!x.archived);
  const archived=users.filter(u=>archivedIds.has(u.id)).map(u=>({id:u.id,name:[u.firstName,u.lastName].filter(Boolean).join(" ")||"غير محدد",email:u.email,phone:u.phone||"",archivedAt:lastEvent.get(u.id)?.createdAt.toISOString()||null}));
  return NextResponse.json({success:true,data,archived,summary:{archived:archived.length,registered:users.length-archived.length,customers:data.length,orders:data.reduce((n,x)=>n+x.orders,0),bookingValue:data.reduce((n,x)=>n+x.bookingValue,0)},financialNote:"قيمة الحجوزات بحالة PAID أو COMPLETED، وليست إثباتاً لتحصيل المدفوعات أو صافي المبيعات."},{headers:{"Cache-Control":"no-store"}});
 }catch(error){console.error("Customer report error",error);return NextResponse.json({success:false,message:"تعذر تحميل التقرير"},{status:500});}
}
