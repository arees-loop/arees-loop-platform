import {NextRequest,NextResponse} from "next/server";
import {prisma} from "@/lib/prisma";
import {getCurrentSession} from "@/lib/session";
import {CART_ENTITY,CART_CREATED,CART_MESSAGE,CART_DOCUMENT,CART_STATUS,CART_STATUSES,CART_VERIFIED,CART_SUBMITTED,CART_REJECTED,asRecord,cartPaymentStatus,cartStatus,cartStaff,sendCartAdminMail} from "@/lib/cart-order-workflow";
export const runtime="nodejs";
export const dynamic="force-dynamic";
const headers={"Cache-Control":"private, no-store"};
const fail=(message:string,status=400)=>NextResponse.json({success:false,message},{status,headers});
const valid=(r:string)=>/^CART-[0-9a-f-]{36}$/.test(r);
async function access(reference:string,user:{id:string;role:string;adminPermissions:unknown}) {
 const staff=cartStaff(user);
 const order=await prisma.auditLog.findFirst({where:{entityType:CART_ENTITY,entityId:reference,action:CART_CREATED,...(staff?{}:{userId:user.id})},select:{id:true,userId:true,afterData:true,createdAt:true}});
 return {order,staff};
}
export async function GET(req:NextRequest) {
 const session=await getCurrentSession();
 if(!session)return fail("يلزم تسجيل الدخول.",401);
 const reference=req.nextUrl.searchParams.get("reference")||"";
 if(!valid(reference))return fail("مرجع غير صالح.");
 try {
  const {order,staff}=await access(reference,session.user);
  if(!order)return fail("الطلب غير موجود أو لا تملك صلاحية الاطلاع عليه.",404);
  const [events,customer]=await Promise.all([
   prisma.auditLog.findMany({where:{entityType:CART_ENTITY,entityId:reference,action:{in:[CART_SUBMITTED,CART_VERIFIED,CART_REJECTED,CART_STATUS,CART_MESSAGE,CART_DOCUMENT]}},orderBy:[{createdAt:"desc"},{id:"desc"}],take:200,select:{id:true,action:true,createdAt:true,afterData:true,userId:true}}),
   staff&&order.userId?prisma.user.findUnique({where:{id:order.userId},select:{firstName:true,lastName:true,email:true,phone:true}}):Promise.resolve(null)
  ]);
  const data=asRecord(order.afterData);
  const payment=cartPaymentStatus(events);
  const status=cartStatus(events);
  const messages=events.filter(x=>x.action===CART_MESSAGE).map(x=>({id:x.id,createdAt:x.createdAt,from:asRecord(x.afterData).from,text:asRecord(x.afterData).text})).reverse();
  const documents=events.filter(x=>x.action===CART_DOCUMENT).map(x=>({id:x.id,name:asRecord(x.afterData).name,from:asRecord(x.afterData).from,createdAt:x.createdAt})).reverse();
  return NextResponse.json({success:true,order:{reference,amountSar:data.amountSar,rows:data.rows,createdAt:order.createdAt,paymentStatus:payment,status,hasReceipt:events.some(e=>e.action===CART_SUBMITTED),customer:customer?{name:[customer.firstName,customer.lastName].filter(Boolean).join(" "),email:customer.email,phone:customer.phone}:null,messages,documents,timeline:events.filter(e=>[CART_SUBMITTED,CART_VERIFIED,CART_REJECTED,CART_STATUS].includes(e.action)).map(e=>({id:e.id,action:e.action,createdAt:e.createdAt,status:asRecord(e.afterData).status})).reverse()}},{headers});
 }catch(error){console.error("Cart workflow read failed",error);return fail("تعذر قراءة تفاصيل الطلب.",503);}
}
export async function POST(req:NextRequest){
 const session=await getCurrentSession();
 if(!session||session.user.status!=="ACTIVE")return fail("يلزم تسجيل الدخول بحساب نشط.",401);
 const data=await req.json().catch(()=>null);
 const reference=typeof data?.reference==="string"?data.reference:"";
 if(!valid(reference))return fail("مرجع غير صالح.");
 const action=data?.action;
 if(!["MESSAGE","STATUS"].includes(action))return fail("إجراء غير مدعوم.");
 try {
  const {order,staff}=await access(reference,session.user);
  if(!order)return fail("الطلب غير موجود أو لا تملك صلاحية تعديله.",404);
  const events=await prisma.auditLog.findMany({where:{entityType:CART_ENTITY,entityId:reference,action:{in:[CART_SUBMITTED,CART_VERIFIED,CART_REJECTED,CART_STATUS]}},orderBy:[{createdAt:"desc"},{id:"desc"}],select:{id:true,action:true,createdAt:true,afterData:true,userId:true}});
  if(action==="STATUS"){
   if(!staff)return fail("تعديل حالة التنفيذ محصور بالإدارة.",403);
   if(cartPaymentStatus(events)!==CART_VERIFIED)return fail("يجب التحقق من وصول التحويل أولاً.",409);
   const status=data.status;
   if(!CART_STATUSES.some(x=>x===status))return fail("حالة التنفيذ غير صالحة.");
   if(cartStatus(events)===status)return fail("الحالة مسجلة مسبقاً.",409);
   await prisma.auditLog.create({data:{userId:session.user.id,entityType:CART_ENTITY,entityId:reference,action:CART_STATUS,afterData:{status}}});
   return NextResponse.json({success:true,message:"تم تحديث حالة الطلب مع الاحتفاظ بسجل التغييرات."},{headers});
  }
  const message=typeof data.text==="string"?data.text.trim():"";
  if(message.length<2||message.length>1500)return fail("أدخل رسالة من حرفين إلى 1500 حرف.");
  const sent=await prisma.auditLog.count({where:{userId:session.user.id,entityType:CART_ENTITY,action:CART_MESSAGE,createdAt:{gte:new Date(Date.now()-60*60*1000)}}});
  if(sent>=20)return fail("تم بلوغ الحد المؤقت للرسائل؛ حاول لاحقاً.",429);
  await prisma.auditLog.create({data:{userId:session.user.id,entityType:CART_ENTITY,entityId:reference,action:CART_MESSAGE,afterData:{from:staff?"ADMIN":"CUSTOMER",text:message}}});
  if(!staff){
   const d=asRecord(order.afterData);
   const user=await prisma.user.findUnique({where:{id:session.user.id},select:{firstName:true,lastName:true}});
   const rows=Array.isArray(d.rows)?d.rows:[];
   const title=rows.map(x=>String(asRecord(x).title||"خدمة")).join("، ");
   try{await sendCartAdminMail({reference,name:[user?.firstName,user?.lastName].filter(Boolean).join(" ")||"عميل أريس لوب",amountSar:Number(d.amountSar||0),title,type:"MESSAGE"});}
   catch(error){console.error("Cart customer message email failed",error);}
  }
  return NextResponse.json({success:true,message:"تم إرسال الرسالة وحفظها في سجل الطلب."},{headers});
 }catch(error){console.error("Cart workflow update failed",error);return fail("تعذر حفظ تحديث الطلب.",503);}
}
