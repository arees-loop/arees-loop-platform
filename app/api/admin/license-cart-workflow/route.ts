import {NextRequest,NextResponse} from "next/server";
import {prisma} from "@/lib/prisma";
import {getCurrentSession} from "@/lib/session";
export const runtime="nodejs";
export const dynamic="force-dynamic";
const h={"Cache-Control":"private, no-store"};
const fail=(message:string,status=400)=>NextResponse.json({success:false,message},{status,headers:h});
const obj=(v:unknown):Record<string,unknown>=>v&&typeof v==="object"&&!Array.isArray(v)?v as Record<string,unknown>:{};
const valid=(x:string)=>/^LICC-[0-9a-f-]{36}$/.test(x);
const created="LICENSE_FORM_ADDED_TO_CART";
const root="LICENSE_CART_APPLICATION";
const workflow="LICENSE_CART_WORKFLOW";
const bank="CART_BANK_CHECKOUT";
export type LicenseRow={id:string;reference:string;kind:"DRIVING_LICENSE";customerName:string;customerEmail:string|null;phone:string;
 createdAt:string;status:string;priceSar:number;amountSar:number;bankReference:string|null;
 bankStatus:string|null;bankVerified:boolean;hasVoucher:boolean;notes:string;deliveryAddress:string;
 deliveryLink:string;eyeColor:string;height:string;emailStatus:string;email:string|null;history:{action:string;status:string;notes:string;createdAt:string}[]};
async function access(){
 const s=await getCurrentSession();
 if(!s||s.user.role!=="SUPER_ADMIN")return null;
 return s;
}
async function fetchRows(){
 const drafts=await prisma.auditLog.findMany({where:{entityType:root,action:created},orderBy:[{createdAt:"desc"},{id:"desc"}],take:250,
  select:{entityId:true,userId:true,createdAt:true,afterData:true}});
 const refs=drafts.map(x=>x.entityId).filter((x):x is string=>!!x&&valid(x));
 const ids=[...new Set(drafts.map(x=>x.userId).filter((x):x is string=>!!x))];
 const [users,payments,states,emailEvents]=await Promise.all([
  ids.length?prisma.user.findMany({where:{id:{in:ids}},select:{id:true,firstName:true,lastName:true,email:true,phone:true}}):Promise.resolve([]),
  prisma.auditLog.findMany({where:{entityType:bank,action:"CART_BANK_CREATED"},orderBy:{createdAt:"desc"},take:400,
   select:{entityId:true,afterData:true,createdAt:true}}),
  refs.length?prisma.auditLog.findMany({where:{entityType:workflow,entityId:{in:refs},action:{in:["STATUS_CHANGED","NOTES_UPDATED"]}},
   orderBy:[{createdAt:"desc"},{id:"desc"}],select:{entityId:true,action:true,afterData:true,createdAt:true}}):Promise.resolve([]),
  refs.length?prisma.auditLog.findMany({where:{entityType:root,entityId:{in:refs},
   action:{in:["LICENSE_CART_EMAIL_SENT","LICENSE_CART_EMAIL_FAILED"]}},orderBy:[{createdAt:"desc"},{id:"desc"}],
   select:{entityId:true,action:true}}):Promise.resolve([])
 ]);
 const matched=new Map<string,{reference:string;amountSar:number}>();
 for(const payment of payments){
  if(!payment.entityId)continue;
  const data=obj(payment.afterData),rows=Array.isArray(data.rows)?data.rows:[];
  for(const entry of rows){
   const row=obj(entry),app=obj(row.application),ref=app.requestReference;
   if(row.itemType==="DRIVING_LICENSE"&&typeof ref==="string"&&valid(ref)&&!matched.has(ref))
    matched.set(ref,{reference:payment.entityId,amountSar:Number(data.amountSar||0)});
  }
 }
 const bankRefs=[...new Set([...matched.values()].map(x=>x.reference))];
 const [paymentEvents,vouchers]=await Promise.all([
  bankRefs.length?prisma.auditLog.findMany({where:{entityType:bank,entityId:{in:bankRefs},
   action:{in:["CART_BANK_RECEIPT_SUBMITTED","CART_BANK_VERIFIED","CART_BANK_REJECTED"]}},
   orderBy:[{createdAt:"desc"},{id:"desc"}],select:{entityId:true,action:true}}):Promise.resolve([]),
  bankRefs.length?prisma.auditLog.findMany({where:{entityType:bank,entityId:{in:bankRefs},action:"CART_SERVICE_VOUCHER_UPLOADED"},
   select:{entityId:true}}):Promise.resolve([])
 ]);
 const latestPay=new Map<string,string>();
 for(const e of paymentEvents)if(e.entityId&&!latestPay.has(e.entityId))latestPay.set(e.entityId,e.action);
 const voucherSet=new Set(vouchers.map(x=>x.entityId));
 const emailMap=new Map<string,string>();
 for(const e of emailEvents)if(e.entityId&&!emailMap.has(e.entityId))emailMap.set(e.entityId,e.action);
 const stateMap=new Map<string,typeof states>();
 for(const e of states)if(e.entityId)stateMap.set(e.entityId,[...(stateMap.get(e.entityId)||[]),e]);
 return drafts.filter(x=>x.entityId&&valid(x.entityId)).map(d=>{
  const info=obj(d.afterData),ref=d.entityId!,payment=matched.get(ref),user=users.find(u=>u.id===d.userId);
  const bankStatus=payment?latestPay.get(payment.reference)||"CART_BANK_CREATED":null;
  const verified=bankStatus==="CART_BANK_VERIFIED";
  const ev=stateMap.get(ref)||[];
  const lastStatus=ev.find(x=>x.action==="STATUS_CHANGED");
  const custom=String(obj(lastStatus?.afterData).status||"");
  const status=custom==="CANCELED"&&!verified?"CANCELED":
   verified&&["EXECUTING","DONE"].includes(custom)?custom:verified?"PAID":"NEW";
  const note=ev.find(x=>x.action==="NOTES_UPDATED");
  const edited=obj(ev.find(x=>x.action==="DETAILS_UPDATED")?.afterData);
  return {id:ref,reference:ref,kind:"DRIVING_LICENSE" as const,customerName:String(edited.name||info.name||[user?.firstName,user?.lastName].filter(Boolean).join(" ")||"عميل"),
   customerEmail:user?.email||null,phone:String(edited.phone||info.phone||user?.phone||""),createdAt:d.createdAt.toISOString(),
   status,priceSar:Number(info.priceSar||199),amountSar:payment?.amountSar??Number(info.priceSar||199),
   bankReference:payment?.reference||null,bankStatus,bankVerified:verified,hasVoucher:!!payment&&voucherSet.has(payment.reference),
   notes:String(obj(note?.afterData).notes||""),deliveryAddress:String(edited.deliveryAddress??info.deliveryAddress??""),
   deliveryLink:String(edited.deliveryLink??info.deliveryLink??""),eyeColor:String(edited.eyeColor??info.eyeColor??""),height:String(edited.height??info.height??""),
   emailStatus:emailMap.get(ref)||"UNKNOWN",email:user?.email||null,
   history:ev.slice(0,30).map(x=>({action:x.action,status:String(obj(x.afterData).status||""),
    notes:String(obj(x.afterData).notes||""),createdAt:x.createdAt.toISOString()}))}
 });
}
export async function GET(req:NextRequest){
 const session=await access();if(!session)return fail("غير مصرح بعرض طلبات الرخصة.",403);
 try{
  const rows=await fetchRows(),reference=req.nextUrl.searchParams.get("reference");
  if(reference){if(!valid(reference))return fail("المرجع غير صحيح.");
   const found=rows.find(x=>x.reference===reference);return found?NextResponse.json({success:true,order:found},{headers:h}):fail("الطلب غير موجود.",404);
  }
  return NextResponse.json({success:true,data:rows},{headers:h});
 }catch(e){console.error("License admin requests failed",e instanceof Error?e.name:"UNKNOWN");return fail("تعذر تحميل طلبات الرخصة.",503);}
}
export async function PATCH(req:NextRequest){
 const session=await access();if(!session)return fail("غير مصرح بتعديل طلبات الرخصة.",403);
 const body=await req.json().catch(()=>null),ref=typeof body?.reference==="string"?body.reference:"";
 if(!valid(ref))return fail("مرجع الرخصة غير صحيح.");
 try{
  const rows=await fetchRows(),current=rows.find(x=>x.reference===ref);
  if(!current)return fail("الطلب غير موجود.",404);
  if(body.action==="DETAILS"){
   if(current.bankVerified)return fail("بعد اعتماد السداد لا يمكن تعديل بيانات الطلب الأصلية؛ أضف ملاحظة تنفيذية بدلاً من ذلك.",409);
   const details=body.details&&typeof body.details==="object"&&!Array.isArray(body.details)?
    body.details as Record<string,unknown>:{};
   const name=typeof details.name==="string"?details.name.trim():"";
   const phone=typeof details.phone==="string"?details.phone.trim():"";
   const height=typeof details.height==="string"?details.height.trim():"";
   const eyeColor=typeof details.eyeColor==="string"?details.eyeColor.trim():"";
   const deliveryAddress=typeof details.deliveryAddress==="string"?details.deliveryAddress.trim():"";
   const deliveryLink=typeof details.deliveryLink==="string"?details.deliveryLink.trim():"";
   if(name.length<2||name.length>100||!/^\\+?\\d{8,17}$/.test(phone)||height.length>8||
    eyeColor.length>80||deliveryAddress.length>300||
    (deliveryLink&&(!deliveryLink.startsWith("https://")||deliveryLink.length>500)))
    return fail("تأكد من الاسم والهاتف وعنوان التوصيل والرابط الصحيح.");
   const updated={name,phone,height,eyeColor,deliveryAddress,deliveryLink};
   await prisma.auditLog.create({data:{entityType:workflow,entityId:ref,userId:session.user.id,
    action:"DETAILS_UPDATED",
    beforeData:{name:current.customerName,phone:current.phone,height:current.height,
     eyeColor:current.eyeColor,deliveryAddress:current.deliveryAddress,deliveryLink:current.deliveryLink},
    afterData:updated}});
   return NextResponse.json({success:true,message:"تم حفظ تعديل بيانات الطلب مع الاحتفاظ بسجل التغييرات."},{headers:h});
  }
  if(body.action==="NOTES"){
   const notes=typeof body.notes==="string"?body.notes.trim():"";
   if(notes.length>2500)return fail("الملاحظات لا تتجاوز 2500 حرف.");
   await prisma.auditLog.create({data:{entityType:workflow,entityId:ref,userId:session.user.id,
     action:"NOTES_UPDATED",beforeData:{notes:current.notes},afterData:{notes}}});
   return NextResponse.json({success:true,message:"تم حفظ الملاحظات الداخلية."},{headers:h});
  }
  if(body.action!=="STATUS")return fail("إجراء غير معروف.");
  const status=body.status;
  const allowed:Record<string,string[]>={NEW:["CANCELED"],PAID:["EXECUTING"],EXECUTING:["DONE"],DONE:[],CANCELED:[]};
  if(status==="CANCELED"&&current.bankReference)return fail("لا يمكن إلغاء طلب بدأ تحويله إلا بعد مراجعة مالية منفصلة.",409);
  if(!allowed[current.status]?.includes(status))
   return fail("لا يمكن الانتقال لهذه الحالة. اعتماد السداد يتم فقط بعد التحقق من التحويل البنكي.",409);
  if((status==="EXECUTING"||status==="DONE")&&!current.bankVerified)
   return fail("يجب التحقق من وصول التحويل قبل التنفيذ.",409);
  await prisma.auditLog.create({data:{entityType:workflow,entityId:ref,userId:session.user.id,
   action:"STATUS_CHANGED",beforeData:{status:current.status},
   afterData:{status,notes:typeof body.notes==="string"?body.notes.slice(0,2500):null}}});
  return NextResponse.json({success:true,message:"تم تحديث حالة الطلب وحفظ الإجراء."},{headers:h});
 }catch(e){console.error("License admin status failed",e instanceof Error?e.name:"UNKNOWN");return fail("تعذر تحديث الطلب.",503);}
}
