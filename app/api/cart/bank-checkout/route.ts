import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "node:crypto";
import {sendCartAdminMail,cartStatus,cartPaymentStatus,asRecord,CART_DOCUMENT,CART_MESSAGE,CART_STATUS} from "@/lib/cart-order-workflow";
import { put } from "@vercel/blob";
import { prisma } from "@/lib/prisma";
import { getCurrentSession } from "@/lib/session";
import { findBankTransferNotes } from "@/lib/bank-transfer-notes";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
const TYPE = "CART_BANK_CHECKOUT";
const CREATED = "CART_BANK_CREATED";
const SUBMITTED = "CART_BANK_RECEIPT_SUBMITTED";
const VERIFIED = "CART_BANK_VERIFIED";
const REJECTED = "CART_BANK_REJECTED";
const fail = (message:string,status=400) => NextResponse.json({success:false,message},{status,headers:{"Cache-Control":"private, no-store"}});
const round = (n:number) => Math.round((n+Number.EPSILON)*100)/100;
type Row = {serviceId:string;quantity:number;itemType?:"DRIVING_LICENSE";application?:Record<string,unknown>};
const jsonData = (x:unknown):Record<string,unknown> => x && typeof x==="object" && !Array.isArray(x) ? x as Record<string,unknown> : {};
async function activeBanks(){
 const accounts=await prisma.bankTransferAccount.findMany({where:{active:true},orderBy:{createdAt:"desc"},select:{id:true,bankName:true,beneficiaryName:true,iban:true}});
 const notes=await findBankTransferNotes(accounts.map(a=>a.id));
 return accounts.map(a=>({...a,note:notes[a.id]||""}));
}
async function orderFor(reference:string,userId:string){
 return prisma.auditLog.findFirst({where:{entityType:TYPE,entityId:reference,action:CREATED,userId},select:{id:true,afterData:true,createdAt:true}});
}
async function lastEvent(reference:string){
 return prisma.auditLog.findFirst({where:{entityType:TYPE,entityId:reference,action:{in:[SUBMITTED,VERIFIED,REJECTED]}},orderBy:[{createdAt:"desc"},{id:"desc"}],select:{action:true,createdAt:true,afterData:true}});
}
async function totals(items:unknown,couponRaw:unknown,userId:string){
 if(!Array.isArray(items)||items.length<1||items.length>12) throw Error("السلة غير صالحة أو تتجاوز 12 خدمة.");
 const rows:Row[]=[];
 for(const x of items){
  const v=jsonData(x),serviceId=v.serviceId,quantity=v.quantity;
  if(typeof serviceId!=="string"||serviceId.length>120||typeof quantity!=="number"||!Number.isInteger(quantity)||quantity<1||Number(quantity)>20) throw Error("الكمية أو الخدمة غير صالحة.");
  rows.push({serviceId,quantity:Number(quantity),itemType:v.itemType==="DRIVING_LICENSE"?"DRIVING_LICENSE":undefined,application:jsonData(v.application)});
 }
 if(new Set(rows.map(r=>r.serviceId)).size!==rows.length)throw Error("توجد خدمات مكررة في السلة.");
 const services=rows.filter(r=>r.itemType!=="DRIVING_LICENSE");
 const found=services.length?await prisma.service.findMany({where:{id:{in:services.map(r=>r.serviceId)},status:"PUBLISHED"},select:{id:true,nameAr:true,finalPrice:true,partnerId:true,category:true}}):[];
 if(found.length!==services.length)throw Error("إحدى الخدمات تغيرت أو لم تعد متاحة؛ حدّث السلة.");
 let licensePrice=0;
 const licenses=rows.filter(r=>r.itemType==="DRIVING_LICENSE");
 let linkedRequest:{id:string;reference:string}|null=null;
 if(licenses.length){
  if(licenses.length!==1||licenses[0].quantity!==1||licenses[0].serviceId!=="international-driving-license-1")throw Error("طلب الرخصة يجب أن يكون طلباً واحداً لكل سلة.");
  // Production checkout requires an existing completed travel request.
  // The live release has no private IDP document table; never infer upload completion.
  linkedRequest=await prisma.transportRequest.findFirst({
   where:{userId,kind:"DRIVING_LICENSE",createdAt:{gte:new Date(Date.now()-30*24*60*60*1000)}},
   orderBy:{createdAt:"desc"},select:{id:true,reference:true}
  });
  if(!linkedRequest)throw Error("أكمل وأرسل نموذج الرخصة من صفحة الخدمة قبل الدفع.");
  const attachments=await prisma.transportRequestEvent.findMany({
   where:{requestId:linkedRequest.id,action:"CUSTOMER_ATTACHMENT_UPLOADED"},take:30,
   orderBy:{createdAt:"desc"},select:{details:true}
  });
  const labels=attachments.map(x=>jsonData(x.details)).filter(d=>d.purpose==="DOCUMENT")
   .map(d=>typeof d.label==="string"?d.label:"");
  if(![/جواز|passport/i,/رخصة|licen[sc]e/i,/شخصية|portrait|personal photo/i].every(p=>labels.some(x=>p.test(x))))
    throw Error("قبل سداد الرخصة أرفق 3 صور من متابعة الطلب: جواز السفر، الرخصة المحلية، والصورة الشخصية بخلفية بيضاء.");
  const now=new Date();
  const offer=await prisma.transportOffer.findFirst({where:{kind:"DRIVING_LICENSE",isVisible:true,deletedAt:null,AND:[{OR:[{startsAt:null},{startsAt:{lte:now}}]},{OR:[{endsAt:null},{endsAt:{gte:now}}]}]},orderBy:[{sortOrder:"asc"},{createdAt:"desc"}],select:{amountSar:true,operationStatus:true}});
  if(offer?.operationStatus==="SOLD_OUT")throw Error("عرض الرخصة غير متاح حالياً.");
  licensePrice=offer?.amountSar===null||!offer?199:Number(offer.amountSar);
  if(!Number.isFinite(licensePrice)||licensePrice<=0)throw Error("تعذر تحديد سعر الرخصة الحالي.");
 }
 const savedRows=rows.map(r=>{
  if(r.itemType==="DRIVING_LICENSE"){
   return {itemType:"DRIVING_LICENSE",serviceId:r.serviceId,title:"رخصة القيادة الدولية",
    quantity:1,unitPriceSar:licensePrice,application:{licenseRequestReference:linkedRequest?.reference||""}};
  }
  const s=found.find(x=>x.id===r.serviceId)!;
  return {itemType:"SERVICE",serviceId:r.serviceId,title:s.nameAr,quantity:r.quantity,unitPriceSar:Number(s.finalPrice),partnerId:s.partnerId};
 });
 const total=round(savedRows.reduce((n,r)=>n+r.unitPriceSar*r.quantity,0));
 if(!Number.isFinite(total)||total<=0||total>100000)throw Error("قيمة السلة غير صالحة.");
 const code=typeof couponRaw==="string"?couponRaw.trim().toUpperCase():"";
 let discount=0;
 if(code){
  if(licenses.length||services.length!==1)throw Error("الكوبون في السلة المختلطة أو الرخصة غير متاح حتى اكتمال دعم الخصم.");
  const c=await prisma.coupon.findUnique({where:{code}});
  const svc=found[0],now=new Date();
  if(!c||!c.isActive||(c.startsAt&&c.startsAt>now)||(c.expiresAt&&c.expiresAt<now)||(c.maxUses!==null&&c.usedCount>=c.maxUses))throw Error("الكوبون غير صالح أو انتهت صلاحيته.");
  const anchor=c.serviceId?await prisma.service.findUnique({where:{id:c.serviceId},select:{partnerId:true}}):null;
  if(c.serviceId!==null&&c.serviceId!==svc.id&&!(anchor?.partnerId===svc.partnerId&&(!c.category||c.category===svc.category)))throw Error("الكوبون غير مخصص لهذه الخدمة.");
  if(c.category&&c.category!==svc.category)throw Error("الكوبون غير صالح لتصنيف الخدمة.");
  if(c.minOrderAmount!==null&&total<Number(c.minOrderAmount))throw Error("الحد الأدنى للكوبون غير مستوفى.");
  if(c.maxUsesPerUser!==null){
   const used=await prisma.couponRedemption.count({where:{couponId:c.id,userId}});
   if(used>=c.maxUsesPerUser)throw Error("تم استنفاد عدد استخدامات الكوبون لهذا الحساب.");
  }
  discount=round(Math.min(total,c.discountType==="PERCENTAGE"?total*Number(c.discountValue)/100:Number(c.discountValue),c.maxDiscountAmount===null?total:Number(c.maxDiscountAmount)));
 }
 return {rows:savedRows,total,discount,amountSar:round(total-discount),coupon:code||null};
}
export async function GET(req:NextRequest){
 const session=await getCurrentSession();
 if(!session||session.user.status!=="ACTIVE")return fail("سجّل الدخول لحفظ طلب التحويل البنكي.",401);
 try{
  const banks=await activeBanks();
  if(req.nextUrl.searchParams.get("history")==="true"){
   const orders=await prisma.auditLog.findMany({where:{userId:session.user.id,entityType:TYPE,action:CREATED},orderBy:{createdAt:"desc"},take:100,select:{entityId:true,createdAt:true,afterData:true}});
   const references=orders.map(o=>o.entityId).filter((s):s is string=>!!s);
   const actions=references.length?await prisma.auditLog.findMany({where:{entityType:TYPE,entityId:{in:references},action:{in:[SUBMITTED,VERIFIED,REJECTED,CART_STATUS,CART_DOCUMENT,CART_MESSAGE]}},orderBy:[{createdAt:"desc"},{id:"desc"}],take:1200,select:{id:true,entityId:true,action:true,afterData:true,createdAt:true,userId:true}}):[];
   const vouchers=references.length?await prisma.auditLog.findMany({where:{entityType:TYPE,entityId:{in:references},action:"CART_SERVICE_VOUCHER_UPLOADED"},select:{entityId:true}}):[];
   const voucherRefs=new Set(vouchers.map(x=>x.entityId));
   const eventsByRef=new Map<string,typeof actions>();
   for(const event of actions)if(event.entityId){const current=eventsByRef.get(event.entityId)||[];current.push(event);eventsByRef.set(event.entityId,current);}
   const result=orders.map(o=>{
    const data=jsonData(o.afterData),reference=o.entityId||"",events=eventsByRef.get(reference)||[];
    const status=cartStatus(events),paymentStatus=cartPaymentStatus(events);
    const latestMessage=events.find(e=>e.action===CART_MESSAGE);
    const newMessage=!!latestMessage&&asRecord(latestMessage.afterData).from==="ADMIN";
    return {reference,amountSar:data.amountSar,rows:data.rows,createdAt:o.createdAt,status,paymentStatus,needsAttention:status==="DOCUMENTS_REQUESTED"||paymentStatus===REJECTED||newMessage,hasNewMessage:newMessage,hasVoucher:voucherRefs.has(reference)};
   });
   return NextResponse.json({success:true,orders:result},{headers:{"Cache-Control":"private, no-store"}});
  }
  const reference=req.nextUrl.searchParams.get("reference");
  if(reference){
   const order=await orderFor(reference,session.user.id);
   if(!order)return fail("طلب السداد غير موجود.",404);
   const event=await lastEvent(reference),details=jsonData(order.afterData);
   return NextResponse.json({success:true,banks,order:{reference,amountSar:details.amountSar,bankAccountId:details.bankAccountId,status:event?.action||CREATED}},{headers:{"Cache-Control":"private, no-store"}});
  }
  return NextResponse.json({success:true,banks},{headers:{"Cache-Control":"private, no-store"}});
 }catch(error){console.error("Cart bank account read failed",error);return fail("تعذر تحميل الحسابات البنكية مؤقتاً.",503);}
}
export async function POST(req:NextRequest){
 const session=await getCurrentSession();
 if(!session||session.user.status!=="ACTIVE")return fail("سجّل الدخول لإكمال الطلب.",401);
 const type=req.headers.get("content-type")||"";
 if(type.includes("multipart/form-data")){
  let pathname:string|null=null;
  try{
   const data=await req.formData(),reference=String(data.get("reference")||""),bankId=String(data.get("bankAccountId")||"");
   if(!/^CART-[0-9a-f-]{36}$/.test(reference))return fail("مرجع الطلب غير صحيح.");
   const order=await orderFor(reference,session.user.id);
   if(!order)return fail("طلب السداد غير موجود.",404);
   const state=await lastEvent(reference);
   if(state&&state.action!==REJECTED)return fail("الإيصال مسجل بالفعل أو تمت مراجعته.",409);
   const orderDetails=jsonData(order.afterData);
   if(orderDetails.bankAccountId!==bankId)return fail("الحساب البنكي لا يطابق الطلب المسجل.");
   const bank=await prisma.bankTransferAccount.findFirst({where:{id:bankId,active:true},select:{id:true}});
   if(!bank)return fail("الحساب البنكي غير متاح حالياً.");
   const file=data.get("file");
   if(!(file instanceof File)||file.size<100||file.size>5*1024*1024)return fail("أرفق إثبات تحويل حتى 5 ميجابايت.");
   const ext=file.type==="application/pdf"?"pdf":file.type==="image/jpeg"?"jpg":file.type==="image/png"?"png":file.type==="image/webp"?"webp":null;
   if(!ext)return fail("ارفع PDF أو JPG أو PNG أو WebP.");
   const bytes=new Uint8Array(await file.arrayBuffer());
   const pdf=ext==="pdf"&&String.fromCharCode(...bytes.slice(0,5))==="%PDF-";
   const jpg=ext==="jpg"&&bytes[0]===255&&bytes[1]===216&&bytes[2]===255;
   const png=ext==="png"&&[137,80,78,71,13,10,26,10].every((v,i)=>bytes[i]===v);
   const webp=ext==="webp"&&String.fromCharCode(...bytes.slice(0,4))==="RIFF"&&String.fromCharCode(...bytes.slice(8,12))==="WEBP";
   if(!(pdf||jpg||png||webp))return fail("صيغة الملف لا تطابق محتواه.");
   pathname=`cart-receipts/${session.user.id}/${reference}/${randomUUID()}.${ext}`;
   await put(pathname,Buffer.from(bytes),{access:"private",contentType:file.type,addRandomSuffix:false});
   await prisma.auditLog.create({data:{userId:session.user.id,entityType:TYPE,entityId:reference,action:SUBMITTED,afterData:{pathname,contentType:file.type,size:file.size,bankAccountId:bankId}}});
   // Receipt is saved before any external email attempt. Never undo a valid payment claim on mail failure.
   try{
    const user=await prisma.user.findUnique({where:{id:session.user.id},select:{firstName:true,lastName:true}});
    const savedRows=Array.isArray(orderDetails.rows)?orderDetails.rows:[];
    const title=savedRows.map(r=>String(jsonData(r).title||"خدمة")).join("، ");
    await sendCartAdminMail({reference,name:[user?.firstName,user?.lastName].filter(Boolean).join(" ")||"عميل أريس لوب",title,amountSar:Number(orderDetails.amountSar||0),type:"RECEIPT"});
    await prisma.auditLog.create({data:{entityType:TYPE,entityId:reference,action:"CART_RECEIPT_EMAIL_SENT",afterData:{receiptPath:pathname}}});
   }catch(emailError){
    console.error("Cart receipt administrator email failed",emailError);
    await prisma.auditLog.create({data:{entityType:TYPE,entityId:reference,action:"CART_RECEIPT_EMAIL_FAILED",afterData:{receiptPath:pathname}}}).catch(()=>{});
   }

   return NextResponse.json({success:true,reference,status:"PENDING_REVIEW",message:"تم تسجيل إثبات التحويل؛ ستراجعه الإدارة قبل تأكيد استلام المبلغ."},{headers:{"Cache-Control":"private, no-store"}});
  }catch(error){console.error("Cart bank receipt submission failed",error);if(pathname){const {del}=await import("@vercel/blob");await del(pathname).catch(()=>{});}return fail("تعذر حفظ إثبات التحويل بأمان. حاول مرة أخرى.",503);}
 }
 try{
  const body=await req.json().catch(()=>null);
  if(body?.action!=="CREATE")return fail("إجراء غير مدعوم.");
  const count=await prisma.auditLog.count({where:{entityType:TYPE,action:CREATED,userId:session.user.id,createdAt:{gte:new Date(Date.now()-60*60*1000)}}});
  if(count>=6)return fail("تم تقديم عدة طلبات خلال الساعة؛ راجع الطلب السابق أولاً.",429);
  const bankId=typeof body.bankAccountId==="string"?body.bankAccountId:"";
  const bank=await prisma.bankTransferAccount.findFirst({where:{id:bankId,active:true},select:{id:true}});
  if(!bank)return fail("اختر حساباً بنكياً معتمداً.");
  const pricing=await totals(body.items,body.couponCode,session.user.id);
  if(pricing.amountSar<=0)return fail("الإجمالي صفر؛ يحتاج الطلب إلى معالجة منفصلة.");
  if(typeof body.expectedTotalSar!=="number"||Math.abs(body.expectedTotalSar-pricing.amountSar)>0.009)
   return NextResponse.json({success:false,code:"PRICE_CHANGED",amountSar:pricing.amountSar,message:"تغيّر السعر أو قيمة الخصم. راجع المبلغ الجديد قبل إنشاء الطلب."},{status:409,headers:{"Cache-Control":"private, no-store"}});
  const reference="CART-"+randomUUID();
  await prisma.auditLog.create({data:{userId:session.user.id,entityType:TYPE,entityId:reference,action:CREATED,afterData:{...pricing,reference,bankAccountId:bankId,createdAt:new Date().toISOString()}}});
  return NextResponse.json({success:true,reference,amountSar:pricing.amountSar,status:"AWAITING_TRANSFER",message:"تم إنشاء مرجع التحويل؛ حوّل المبلغ إلى الحساب المحدد ثم أرفق الإيصال."},{status:201,headers:{"Cache-Control":"private, no-store"}});
 }catch(error){const message=error instanceof Error?error.message:"تعذر تسجيل طلب السداد."; if(message.includes("تعذر")||message.includes("غير صالحة")||message.includes("الكوبون")||message.includes("مستندات")||message.includes("الخدمة")||message.includes("خدمات")||message.includes("الرخصة")||message.includes("السلة")||message.includes("الكمية")||message.includes("صفر")||message.includes("طلب"))return fail(message);console.error("Cart bank checkout failed",error);return fail("تعذر تسجيل الطلب الآن، حاول مرة أخرى.",503);}
}
