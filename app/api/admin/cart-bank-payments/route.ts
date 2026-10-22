import {NextRequest,NextResponse} from "next/server";
import {get} from "@vercel/blob";
import {prisma} from "@/lib/prisma";
import {getCurrentSession} from "@/lib/session";
export const runtime="nodejs";
export const dynamic="force-dynamic";
const TYPE="CART_BANK_CHECKOUT";
const CREATED="CART_BANK_CREATED";
const SUBMITTED="CART_BANK_RECEIPT_SUBMITTED";
const VERIFIED="CART_BANK_VERIFIED";
const REJECTED="CART_BANK_REJECTED";
const fail=(message:string,status=400)=>NextResponse.json({success:false,message},{status,headers:{"Cache-Control":"private, no-store"}});
const obj=(v:unknown):Record<string,unknown>=>v&&typeof v==="object"&&!Array.isArray(v)?v as Record<string,unknown>:{};
async function staff(){
 const session=await getCurrentSession();
 const permissions=Array.isArray(session?.user.adminPermissions)?session.user.adminPermissions.map(String):[];
 if(!session||!["ADMIN","SUPER_ADMIN"].includes(session.user.role)||(session.user.role!=="SUPER_ADMIN"&&!permissions.includes("BOOKINGS")))return null;
 return session;
}
export async function GET(req:NextRequest){
 const session=await staff();if(!session)return fail("غير مصرح.",403);
 const reference=req.nextUrl.searchParams.get("reference");
 const download=req.nextUrl.searchParams.get("receipt")==="true";
 try{
  if(download){
   if(!reference)return fail("مرجع غير موجود.");
   const order=await prisma.auditLog.findFirst({where:{entityType:TYPE,entityId:reference,action:CREATED}});
   if(!order)return fail("طلب غير موجود.",404);
   const receipt=await prisma.auditLog.findFirst({where:{entityType:TYPE,entityId:reference,action:SUBMITTED},orderBy:[{createdAt:"desc"},{id:"desc"}]});
   const data=obj(receipt?.afterData),pathname=data.pathname;
   if(typeof pathname!=="string"||!pathname.startsWith("cart-receipts/"+order.userId+"/"+reference+"/"))return fail("الإيصال غير موجود.",404);
   const blob=await get(pathname,{access:"private"});
   if(!blob||blob.statusCode!==200)return fail("الإيصال غير موجود.",404);
   const type=typeof data.contentType==="string"&&["application/pdf","image/jpeg","image/png","image/webp"].includes(data.contentType)?data.contentType:"application/octet-stream";
   return new Response(blob.stream,{headers:{"Content-Type":type,"Content-Disposition":"attachment; filename=\"arees-bank-receipt\"","Cache-Control":"private, no-store","X-Content-Type-Options":"nosniff","Content-Security-Policy":"default-src 'none'; sandbox"}});
  }
  const orders=await prisma.auditLog.findMany({where:{entityType:TYPE,action:CREATED},orderBy:{createdAt:"desc"},take:100,select:{id:true,entityId:true,userId:true,afterData:true,createdAt:true}});
  const references=orders.map(x=>x.entityId).filter((x):x is string=>!!x);
  const events=references.length?await prisma.auditLog.findMany({where:{entityType:TYPE,entityId:{in:references},action:{in:[SUBMITTED,VERIFIED,REJECTED]}},orderBy:[{createdAt:"desc"},{id:"desc"}],select:{entityId:true,action:true,createdAt:true}}):[];
  const latest=new Map<string,{action:string,createdAt:Date}>();
  for(const e of events)if(e.entityId&&!latest.has(e.entityId))latest.set(e.entityId,e);
  const users=orders.length?await prisma.user.findMany({where:{id:{in:orders.map(x=>x.userId).filter((v):v is string=>!!v)}},select:{id:true,firstName:true,lastName:true,email:true,phone:true}}):[];
  const licenseDrafts=await prisma.auditLog.findMany({
   where:{entityType:"LICENSE_CART_APPLICATION",action:"LICENSE_FORM_ADDED_TO_CART"},
   orderBy:[{createdAt:"desc"},{id:"desc"}],take:100,
   select:{entityId:true,userId:true,createdAt:true,afterData:true}
  });
  const draftRefs=licenseDrafts.map(x=>x.entityId).filter((x):x is string=>!!x);
  const statuses=draftRefs.length?await prisma.auditLog.findMany({
   where:{entityType:"LICENSE_CART_APPLICATION",entityId:{in:draftRefs},
    action:{in:["LICENSE_CART_EMAIL_SENT","LICENSE_CART_EMAIL_FAILED"]}},
   select:{entityId:true,action:true},orderBy:[{createdAt:"desc"},{id:"desc"}]}):[];
  const draftStatus=new Map<string,string>();for(const x of statuses)if(x.entityId&&!draftStatus.has(x.entityId))draftStatus.set(x.entityId,x.action);
  return NextResponse.json({success:true,
    licenseDrafts:licenseDrafts.map(x=>{const d=obj(x.afterData);return {
     reference:x.entityId,name:d.name,phone:d.phone,priceSar:d.priceSar,
     status:draftStatus.get(x.entityId||"")||"UNKNOWN",createdAt:x.createdAt
    }}),
    orders:orders.map(o=>{const d=obj(o.afterData),u=users.find(x=>x.id===o.userId);return {reference:o.entityId,amountSar:d.amountSar,bankAccountId:d.bankAccountId,rows:d.rows,status:latest.get(o.entityId||"")?.action||CREATED,createdAt:o.createdAt,customer:u?{name:[u.firstName,u.lastName].filter(Boolean).join(" "),email:u.email,phone:u.phone}:null};})},{headers:{"Cache-Control":"private, no-store"}});
 }catch(error){console.error("Admin cart payment list error",error);return fail("تعذر تحميل طلبات التحويل.",503);}
}
export async function POST(req:NextRequest){
 const session=await staff();if(!session)return fail("غير مصرح.",403);
 const body=await req.json().catch(()=>null);
 const reference=typeof body?.reference==="string"?body.reference:"";
 const decision=body?.decision;
 if(!/^CART-[0-9a-f-]{36}$/.test(reference)||!["VERIFY","REJECT"].includes(decision))return fail("قرار غير صحيح.");
 try{
  await prisma.$transaction(async tx=>{
   const order=await tx.auditLog.findFirst({where:{entityType:TYPE,entityId:reference,action:CREATED}});
   if(!order)throw Error("ORDER_NOT_FOUND");
   const last=await tx.auditLog.findFirst({where:{entityType:TYPE,entityId:reference,action:{in:[SUBMITTED,VERIFIED,REJECTED]}},orderBy:[{createdAt:"desc"},{id:"desc"}]});
   if(!last||last.action!==SUBMITTED)throw Error("RECEIPT_NOT_PENDING");
   const details=obj(order.afterData);
   if(decision==="VERIFY"&&typeof details.coupon==="string"&&details.coupon){
    const rows=Array.isArray(details.rows)?details.rows.map(obj):[];
    // Coupon uses on IDP payments are accounted only after staff verifies the bank transfer.
    if(rows.some(row=>row.itemType==="DRIVING_LICENSE")){
     const coupon=await tx.coupon.findUnique({where:{code:details.coupon}});
     if(!coupon||coupon.serviceId!==null||(coupon.category!==null&&coupon.category!=="DRIVING_LICENSE"))
      throw Error("COUPON_SCOPE_INVALID");
     const already=await tx.auditLog.findFirst({where:{entityType:"CART_LICENSE_COUPON_USAGE",entityId:reference,action:"REDEEMED"}});
     if(already)throw Error("COUPON_ALREADY_USED");
     if(coupon.maxUsesPerUser!==null&&order.userId){
      const [bookings,licenseUses]=await Promise.all([
       tx.couponRedemption.count({where:{couponId:coupon.id,userId:order.userId}}),
       tx.auditLog.count({where:{entityType:"CART_LICENSE_COUPON_USAGE",action:"REDEEMED",userId:order.userId,
        afterData:{path:["couponId"],equals:coupon.id}}})
      ]);
      if(bookings+licenseUses>=coupon.maxUsesPerUser)throw Error("COUPON_PER_USER_EXHAUSTED");
     }
     const changed=await tx.coupon.updateMany({where:{id:coupon.id,
      ...(coupon.maxUses===null?{}:{usedCount:{lt:coupon.maxUses}})},data:{usedCount:{increment:1}}});
     if(changed.count!==1)throw Error("COUPON_LIMIT_EXHAUSTED");
     await tx.auditLog.create({data:{entityType:"CART_LICENSE_COUPON_USAGE",entityId:reference,
      userId:order.userId,action:"REDEEMED",afterData:{couponId:coupon.id,code:coupon.code,
       discountSar:Number(details.discount||0)}}});
    }
   }
   await tx.auditLog.create({data:{userId:session.user.id,entityType:TYPE,entityId:reference,
    action:decision==="VERIFY"?VERIFIED:REJECTED,
    afterData:{receiptAuditId:last.id,comment:typeof body.comment==="string"?body.comment.trim().slice(0,500):null}}});
  },{isolationLevel:"Serializable"});
  return NextResponse.json({success:true,message:decision==="VERIFY"?"تم تسجيل اعتماد التحويل من الإدارة.":"تم تسجيل رفض الإثبات؛ يمكن للعميل إعادة إرساله."},{headers:{"Cache-Control":"private, no-store"}});
 }catch(error){
  if(error instanceof Error&&/^(ORDER_NOT_FOUND|RECEIPT_NOT_PENDING|COUPON_SCOPE_INVALID|COUPON_ALREADY_USED|COUPON_PER_USER_EXHAUSTED|COUPON_LIMIT_EXHAUSTED)$/.test(error.message))
   return fail("تعذر اعتماد الدفع: الطلب أو الإيصال أو صلاحية الكوبون تحتاج مراجعة جديدة.",409);
  console.error("Admin cart payment review failed",error instanceof Error?error.name:"UNKNOWN");
  return fail("تعذرت مراجعة الطلب، حاول إعادة تحميله.",503);
 }
}
