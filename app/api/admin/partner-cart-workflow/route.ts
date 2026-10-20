import {NextRequest,NextResponse} from "next/server";
import {getCurrentSession} from "@/lib/session";
import {prisma} from "@/lib/prisma";
import {getPartnerCartRows,partnerCartReferencePattern,safeObject} from "@/lib/partner-cart-bookings";
export const runtime="nodejs";
export const dynamic="force-dynamic";
const workflowType="PARTNER_CART_WORKFLOW";
const headers={"Cache-Control":"private, no-store"};
const fail=(message:string,status=400)=>NextResponse.json({success:false,message},{status,headers});
async function permitted(){
 const session=await getCurrentSession();
 const permissions=Array.isArray(session?.user.adminPermissions)?session.user.adminPermissions.map(String):[];
 if(!session||!["SUPER_ADMIN","ADMIN"].includes(session.user.role)||
  (session.user.role!=="SUPER_ADMIN"&&!permissions.includes("BOOKINGS")))return null;
 return session;
}
export async function GET(req:NextRequest){
 const s=await permitted();if(!s)return fail("غير مصرح.",403);
 const reference=req.nextUrl.searchParams.get("reference")||"";
 const source=req.nextUrl.searchParams.get("source");
 if(reference.length>160||!["CART","BOOKING"].includes(source||""))return fail("بيانات الطلب غير صحيحة.");
 try{
  if(source==="CART"){
   if(!partnerCartReferencePattern.test(reference))return fail("مرجع الطلب غير صحيح.");
   const row=(await getPartnerCartRows()).find(x=>x.reference===reference);
   if(!row)return fail("طلب التجربة غير موجود.",404);
  }else{
   const booking=await prisma.booking.findUnique({where:{reference},select:{id:true}});
   if(!booking)return fail("الحجز غير موجود.",404);
  }
  const entityType=source==="CART"?workflowType:"PARTNER_BOOKING_WORKFLOW";
  const audit=await prisma.auditLog.findMany({where:{entityType,entityId:reference,
   action:{in:["STATUS_CHANGED","NOTES_UPDATED","CUSTOMER_UPDATED"]}},
   orderBy:[{createdAt:"desc"},{id:"desc"}],take:80,
   select:{action:true,createdAt:true,afterData:true}});
  return NextResponse.json({success:true,history:audit.map(x=>({
   action:x.action,createdAt:x.createdAt,status:String(safeObject(x.afterData).status||""),
   notes:x.action==="NOTES_UPDATED"?String(safeObject(x.afterData).notes||""):""
  }))},{headers});
 }catch(error){console.error("Partner order audit read failed",error instanceof Error?error.name:"UNKNOWN");return fail("تعذر تحميل سجل الطلب.",503);}
}
export async function PATCH(req:NextRequest){
 const s=await permitted();if(!s)return fail("غير مصرح.",403);
 const body=await req.json().catch(()=>null);
 const reference=typeof body?.reference==="string"?body.reference:"";
 const source=body?.source,action=body?.action;
 if(reference.length>160||!["CART","BOOKING"].includes(source)||!["STATUS","NOTES","CUSTOMER"].includes(action))
  return fail("إجراء أو مرجع غير صالح.");
 try{
  if(source==="CART"){
   if(!partnerCartReferencePattern.test(reference))return fail("رقم الطلب غير صحيح.");
   const row=(await getPartnerCartRows()).find(x=>x.reference===reference);
   if(!row)return fail("طلب السلة غير موجود.",404);
   if(action==="STATUS"){
    if(row.mixedWithLicense)return fail("السلة مختلطة مع الرخصة؛ يلزم فصل متابعة التنفيذ ومراجعة المعاملة الموحدة.",409);
    const target=body?.status;
    const expected=row.status==="PAID"?"IN_PROGRESS":row.status==="IN_PROGRESS"?"COMPLETED":null;
    if(!row.bankVerified||!expected||target!==expected)
     return fail("حالة التنفيذ التالية غير متاحة؛ يجب اعتماد وصول التحويل أولاً.",409);
    await prisma.auditLog.create({data:{entityType:workflowType,entityId:reference,userId:s.user.id,
     action:"STATUS_CHANGED",beforeData:{status:row.status},afterData:{status:target}}});
    return NextResponse.json({success:true,message:"تم تحديث مرحلة تنفيذ التجربة."},{headers});
   }
   if(action==="NOTES"){
    const notes=typeof body?.notes==="string"?body.notes.trim():"";
    if(notes.length>2500)return fail("الملاحظات طويلة جداً.");
    await prisma.auditLog.create({data:{entityType:workflowType,entityId:reference,userId:s.user.id,
     action:"NOTES_UPDATED",beforeData:{notes:row.notes},afterData:{notes}}});
    return NextResponse.json({success:true,message:"تم حفظ ملاحظات طلب التجربة."},{headers});
   }
   if(row.bankVerified)return fail("لا يمكن تعديل بيانات العميل بعد اعتماد السداد؛ أضف ملاحظة تنفيذية.",409);
   const name=typeof body?.name==="string"?body.name.trim():"";
   const phone=typeof body?.phone==="string"?body.phone.trim():"";
   if(name.length<2||name.length>100||(phone&&!/^\+?[0-9]{6,16}$/.test(phone)))
    return fail("تحقق من اسم العميل ورقم الهاتف.");
   await prisma.auditLog.create({data:{entityType:workflowType,entityId:reference,userId:s.user.id,
    action:"CUSTOMER_UPDATED",beforeData:{name:row.customerName,phone:row.customerPhone},
    afterData:{name,phone}}});
   return NextResponse.json({success:true,message:"تم تعديل بيانات التواصل مع حفظ الأصل في سجل الطلب."},{headers});
  }

  const booking=await prisma.booking.findUnique({where:{reference},select:{id:true,status:true}});
  if(!booking)return fail("الحجز غير موجود.",404);
  if(action==="CUSTOMER"){
   if(booking.status!=="PENDING")return fail("لا يمكن تعديل بيانات العميل بعد اعتماد أو بدء تنفيذ الحجز.",409);
   const name=typeof body?.name==="string"?body.name.trim():"";
   const phone=typeof body?.phone==="string"?body.phone.trim():"";
   if(name.length<2||name.length>100||(phone&&!/^\\+?[0-9]{6,16}$/.test(phone)))
    return fail("تحقق من اسم العميل ورقم الهاتف.");
   await prisma.$transaction(async tx=>{
    const existing=await tx.booking.findUnique({where:{id:booking.id},
     select:{customerName:true,customerPhone:true,status:true}});
    if(!existing||existing.status!=="PENDING")throw Error("STALE_BOOKING_STATUS");
    const changed=await tx.booking.updateMany({where:{id:booking.id,status:"PENDING"},
      data:{customerName:name,customerPhone:phone||null}});
    if(changed.count!==1)throw Error("STALE_BOOKING_STATUS");
    await tx.auditLog.create({data:{entityType:"PARTNER_BOOKING_WORKFLOW",entityId:reference,
     userId:s.user.id,action:"CUSTOMER_UPDATED",
     beforeData:{name:existing.customerName,phone:existing.customerPhone},
     afterData:{name,phone:phone||null}}});
   });
   return NextResponse.json({success:true,message:"تم تعديل بيانات العميل وحفظ سجل المراجعة."},{headers});
  }
  if(action==="NOTES"){
   const notes=typeof body?.notes==="string"?body.notes.trim():"";
   if(notes.length>2500)return fail("الملاحظات طويلة جداً.");
   await prisma.auditLog.create({data:{entityType:"PARTNER_BOOKING_WORKFLOW",entityId:reference,userId:s.user.id,
    action:"NOTES_UPDATED",afterData:{notes}}});
   return NextResponse.json({success:true,message:"تم حفظ ملاحظات الحجز."},{headers});
  }
  const next=["PAID","CONFIRMED"].includes(booking.status)?"IN_PROGRESS":
   booking.status==="IN_PROGRESS"?"COMPLETED":null;
  if(!next||body.status!==next)return fail("لا يمكن اعتماد السداد يدوياً أو تجاوز دورة التنفيذ.",409);
  await prisma.$transaction(async tx=>{
   const changed=await tx.booking.updateMany({where:{id:booking.id,status:booking.status},data:{status:next}});
   if(changed.count!==1)throw Error("STALE_BOOKING_STATUS");
   await tx.auditLog.create({data:{entityType:"PARTNER_BOOKING_WORKFLOW",entityId:reference,userId:s.user.id,
    action:"STATUS_CHANGED",beforeData:{status:booking.status},afterData:{status:next}}});
  });
  return NextResponse.json({success:true,message:"تم تحديث مرحلة تنفيذ الحجز."},{headers});
 }catch(error){
  if(error instanceof Error&&error.message==="STALE_BOOKING_STATUS")return fail("حالة الحجز تغيرت؛ حدّث الصفحة وحاول مجدداً.",409);
  console.error("Partner booking workflow update failed",error instanceof Error?error.name:"UNKNOWN");
  return fail("تعذر حفظ تحديث الطلب.",503);
 }
}
