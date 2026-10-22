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
  return NextResponse.json({success:true,orders:orders.map(o=>{const d=obj(o.afterData),u=users.find(x=>x.id===o.userId);return {reference:o.entityId,amountSar:d.amountSar,bankAccountId:d.bankAccountId,rows:d.rows,status:latest.get(o.entityId||"")?.action||CREATED,createdAt:o.createdAt,customer:u?{name:[u.firstName,u.lastName].filter(Boolean).join(" "),email:u.email,phone:u.phone}:null};})},{headers:{"Cache-Control":"private, no-store"}});
 }catch(error){console.error("Admin cart payment list error",error);return fail("تعذر تحميل طلبات التحويل.",503);}
}
export async function POST(req:NextRequest){
 const session=await staff();if(!session)return fail("غير مصرح.",403);
 const body=await req.json().catch(()=>null);
 const reference=typeof body?.reference==="string"?body.reference:"";
 const decision=body?.decision;
 if(!/^CART-[0-9a-f-]{36}$/.test(reference)||!["VERIFY","REJECT"].includes(decision))return fail("قرار غير صحيح.");
 try{
  const order=await prisma.auditLog.findFirst({where:{entityType:TYPE,entityId:reference,action:CREATED}});
  if(!order)return fail("الطلب غير موجود.",404);
  const last=await prisma.auditLog.findFirst({where:{entityType:TYPE,entityId:reference,action:{in:[SUBMITTED,VERIFIED,REJECTED]}},orderBy:[{createdAt:"desc"},{id:"desc"}]});
  if(!last||last.action!==SUBMITTED)return fail("لا يوجد إيصال جديد ينتظر المراجعة.",409);
  await prisma.auditLog.create({data:{userId:session.user.id,entityType:TYPE,entityId:reference,action:decision==="VERIFY"?VERIFIED:REJECTED,afterData:{receiptAuditId:last.id,comment:typeof body.comment==="string"?body.comment.trim().slice(0,500):null}}});
  return NextResponse.json({success:true,message:decision==="VERIFY"?"تم تسجيل اعتماد التحويل من الإدارة.":"تم تسجيل رفض الإثبات؛ يمكن للعميل إعادة إرساله."},{headers:{"Cache-Control":"private, no-store"}});
 }catch(error){console.error("Admin cart payment review failed",error);return fail("تعذرت مراجعة الطلب.",503);}
}
