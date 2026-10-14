import { NextRequest,NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentSession } from "@/lib/session";
import { canManageHotel } from "@/lib/hotel-permissions";
export const runtime="nodejs";
const fail=(message:string,status=400)=>NextResponse.json({success:false,message},{status});
function parseOfferImages(value:unknown,fallback:string|null,previous?:unknown){
  const input=value===undefined?previous:value;
  if(input===undefined||input===null)return fallback?[fallback]:[];
  if(!Array.isArray(input)||input.length>10)throw new Error("يمكن إضافة 10 صور كحد أقصى لكل عرض.");
  const urls=input.map(item=>clean(item,500));
  if(urls.some(url=>!url||(!url.startsWith("/Image/")&&!url.startsWith("/api/media?pathname="))))throw new Error("تأكد من روابط صور العرض.");
  return [...new Set(urls)];
}
const clean=(x:unknown,max=2500)=>String(x??"").trim().slice(0,max);
const money=(x:unknown)=>{
  if(x===""||x===null||x===undefined)return null;
  const n=Number(x);
  if(!Number.isFinite(n)||n<0||n>1000000||Math.round(n*100)!==n*100)throw new Error("السعر غير صحيح.");
  return n;
};
const day=(x:unknown,end=false)=>{
  const value=clean(x,20);
  if(!value)return null;
  if(!/^\d{4}-\d{2}-\d{2}$/.test(value))throw new Error("التاريخ غير صحيح.");
  const d=new Date(value+(end?"T23:59:59.999+03:00":"T00:00:00.000+03:00"));
  if(Number.isNaN(d.getTime()))throw new Error("التاريخ غير صحيح.");
  return d;
};
const transitions:Record<string,string[]>={
  NEW:["PROCESSING","CANCELED"],PROCESSING:["QUOTE_READY","CANCELED"],
  QUOTE_READY:["QUOTE_SENT","PROCESSING","CANCELED"],
  QUOTE_SENT:["PAID","PROCESSING","CANCELED"],
  PAID:["EXECUTING","CANCELED"],EXECUTING:["DONE","CANCELED"],
  DONE:[],CANCELED:[],
};
async function access(superOnly=false){
  const session=await getCurrentSession();
  if(!session)return {error:fail("يجب تسجيل الدخول.",401)};
  if(!canManageHotel(session.user)||(superOnly&&session.user.role!=="SUPER_ADMIN"))return {error:fail("لا توجد صلاحية لإدارة الفنادق.",403)};
  return {user:session.user};
}
const name=(u:{firstName?:string|null;lastName?:string|null;email?:string|null})=>[u.firstName,u.lastName].filter(Boolean).join(" ")||u.email||"موظف أريس";
export async function GET(request:NextRequest){
  const actor=await access();if(actor.error)return actor.error;
  try{
    const mode=request.nextUrl.searchParams.get("mode");
    if(mode==="offers"){
      if(actor.user?.role!=="SUPER_ADMIN")return NextResponse.json({success:true,data:[]});
      const items=await prisma.hotelOffer.findMany({where:{deletedAt:null},orderBy:[{sortOrder:"asc"},{createdAt:"desc"}],take:200});
      return NextResponse.json({success:true,data:items.map(x=>({...x,imageUrls:Array.isArray(x.imageUrls)?x.imageUrls:(x.bannerUrl?[x.bannerUrl]:[]),amountSar:x.amountSar===null?null:Number(x.amountSar)}))},{headers:{"Cache-Control":"no-store"}});
    }
    if(mode==="staff"){
      if(actor.user?.role!=="SUPER_ADMIN")return fail("إسناد الموظفين للسوبر أدمن.",403);
      const users=await prisma.user.findMany({where:{role:{in:["SUPER_ADMIN","ADMIN"]},status:"ACTIVE"},select:{id:true,firstName:true,lastName:true,email:true,role:true,adminPermissions:true},take:200});
      return NextResponse.json({success:true,data:users.filter(x=>canManageHotel(x))});
    }
    const where=actor.user?.role==="SUPER_ADMIN"?{}:{assignedToId:actor.user?.id};
    if(mode==="history"){
      const id=request.nextUrl.searchParams.get("id")||"";
      const owned=await prisma.hotelInquiry.findFirst({where:{id,...where},select:{id:true}});
      if(!owned)return fail("الطلب غير متاح.",404);
      const items=await prisma.hotelInquiryEvent.findMany({where:{requestId:id},orderBy:{createdAt:"asc"},take:300});
      return NextResponse.json({success:true,data:items});
    }
    const items=await prisma.hotelInquiry.findMany({where,orderBy:{createdAt:"desc"},take:250});
    return NextResponse.json({success:true,data:items.map(x=>({...x,quoteAmountSar:x.quoteAmountSar===null?null:Number(x.quoteAmountSar)}))},{headers:{"Cache-Control":"no-store"}});
  }catch(error){console.error("GET admin hotels failed",error);return fail("تعذر قراءة طلبات الفنادق.",503);}
}
export async function PATCH(request:NextRequest){
  const actor=await access();if(actor.error)return actor.error;
  const u=actor.user!;
  try{
    const body=await request.json();
    const id=clean(body.id,100),action=clean(body.action,60);
    const current=await prisma.hotelInquiry.findUnique({where:{id}});
    if(!current)return fail("الطلب غير موجود.",404);
    if(u.role!=="SUPER_ADMIN"&&current.assignedToId!==u.id)return fail("هذا الطلب غير مسند إليك.",403);
    if(action==="ASSIGN"){
      if(u.role!=="SUPER_ADMIN")return fail("الإسناد للسوبر أدمن فقط.",403);
      const assignedToId=clean(body.assignedToId,100)||null;
      if(assignedToId){
        const staff=await prisma.user.findUnique({where:{id:assignedToId},select:{role:true,adminPermissions:true,status:true}});
        if(!staff||staff.status!=="ACTIVE"||!canManageHotel(staff))return fail("اختر موظفاً مخولاً بإدارة الفنادق.",400);
      }
      const [updated]=await prisma.$transaction([
        prisma.hotelInquiry.update({where:{id},data:{assignedToId}}),
        prisma.hotelInquiryEvent.create({data:{requestId:id,actorId:u.id,actorName:name(u),action:"ASSIGNED",fromStatus:current.status,toStatus:current.status,details:{from:current.assignedToId,to:assignedToId}}}),
      ]);
      return NextResponse.json({success:true,data:updated});
    }
    if(action==="REPLY"){
      const reply=clean(body.customerReply);
      if(!reply)return fail("الرد على العميل مطلوب.");
      const [updated]=await prisma.$transaction([
        prisma.hotelInquiry.update({where:{id},data:{customerReply:reply}}),
        prisma.hotelInquiryEvent.create({data:{requestId:id,actorId:u.id,actorName:name(u),action:"REPLY_PUBLISHED",fromStatus:current.status,toStatus:current.status,details:{chars:reply.length}}}),
      ]);
      return NextResponse.json({success:true,data:{...updated,quoteAmountSar:updated.quoteAmountSar===null?null:Number(updated.quoteAmountSar)}});
    }
    if(action==="QUOTE"){
      if(["DONE","CANCELED"].includes(current.status))return fail("الطلب مغلق.",409);
      const amount=money(body.quoteAmountSar),quoteNotes=clean(body.quoteNotes);
      if(amount===null)return fail("أدخل السعر الإجمالي لإعداد عرض الفندق.");
      const [updated]=await prisma.$transaction([
        prisma.hotelInquiry.update({where:{id},data:{status:"QUOTE_READY",quoteAmountSar:amount,quoteNotes:quoteNotes||null}}),
        prisma.hotelInquiryEvent.create({data:{requestId:id,actorId:u.id,actorName:name(u),action:"QUOTE_SAVED",fromStatus:current.status,toStatus:"QUOTE_READY",details:{amountSar:amount}}}),
      ]);
      return NextResponse.json({success:true,data:{...updated,quoteAmountSar:amount}});
    }
    if(action==="STATUS"){
      const status=clean(body.status,30);
      if(!transitions[current.status]?.includes(status))return fail("الانتقال بين حالات الطلب غير مسموح.",409);
      const reason=clean(body.reason,1500);
      if(status==="CANCELED"&&reason.length<5)return fail("سبب الإلغاء مطلوب (5 حروف على الأقل).");
      const [updated]=await prisma.$transaction([
        prisma.hotelInquiry.update({where:{id},data:{status,adminNotes:status==="CANCELED"?reason:current.adminNotes}}),
        prisma.hotelInquiryEvent.create({data:{requestId:id,actorId:u.id,actorName:name(u),action:status==="CANCELED"?"CANCELED":"STATUS_CHANGED",fromStatus:current.status,toStatus:status,details:status==="CANCELED"?{reason}:undefined}}),
      ]);
      return NextResponse.json({success:true,data:{...updated,quoteAmountSar:updated.quoteAmountSar===null?null:Number(updated.quoteAmountSar)}});
    }
    return fail("الإجراء غير معروف.");
  }catch(error){console.error("PATCH admin hotel failed",error);return fail(error instanceof Error&&/السعر|التاريخ/.test(error.message)?error.message:"تعذر تحديث الطلب.",500);}
}
export async function POST(request:NextRequest){
  const actor=await access(true);if(actor.error)return actor.error;
  try{
    const body=await request.json();
    const title=clean(body.title,160);
    if(!title)return fail("اسم العرض مطلوب.");
    const startsAt=day(body.startsAt),endsAt=day(body.endsAt,true);
    if(startsAt&&endsAt&&startsAt>endsAt) return fail("نهاية العرض قبل البداية.");
    const amountSar=money(body.amountSar);
    const bannerUrl=clean(body.bannerUrl,500)||null;
    if(bannerUrl&&!bannerUrl.startsWith("/Image/")&&!bannerUrl.startsWith("/api/media?pathname="))return fail("رابط الصورة غير صالح.");
    const imageUrls=parseOfferImages(body.imageUrls,bannerUrl);
    const offer=await prisma.hotelOffer.create({data:{
      title,destination:clean(body.destination,100)||null,hotelName:clean(body.hotelName,160)||null,
      description:clean(body.description)||null,amountSar,priceUnit:clean(body.priceUnit,50)||null,
      bannerUrl,imageUrls:imageUrls as never,startsAt,endsAt,isVisible:body.isVisible===true,sortOrder:Number.isInteger(body.sortOrder)?Math.max(0,Math.min(9999,body.sortOrder)):0,
    }});
    await prisma.auditLog.create({data:{userId:actor.user!.id,action:"HOTEL_OFFER_ADDED",entityType:"HotelOffer",entityId:offer.id}}).catch(()=>{});
    return NextResponse.json({success:true,data:offer},{status:201});
  }catch(error){console.error("POST hotel offers failed",error);return fail("تعذر حفظ العرض.",500);}
}
export async function PUT(request:NextRequest){
  const actor=await access(true);if(actor.error)return actor.error;
  try{
    const body=await request.json();
    const id=clean(body.id,100);
    const previous=await prisma.hotelOffer.findFirst({where:{id,deletedAt:null}});
    if(!previous)return fail("العرض غير موجود.",404);
    const title=clean(body.title,160);
    if(!title)return fail("اسم العرض مطلوب.");
    const startsAt=day(body.startsAt),endsAt=day(body.endsAt,true);
    if(startsAt&&endsAt&&startsAt>endsAt)return fail("تاريخ انتهاء العرض قبل بدايته.");
    const bannerUrl=clean(body.bannerUrl,500)||null;
    if(bannerUrl&&!bannerUrl.startsWith("/Image/")&&!bannerUrl.startsWith("/api/media?pathname="))return fail("رابط صورة غير صالح.");
    const imageUrls=parseOfferImages(body.imageUrls,bannerUrl,previous.imageUrls);
    const updated=await prisma.hotelOffer.update({where:{id},data:{
      title,destination:clean(body.destination,100)||null,hotelName:clean(body.hotelName,160)||null,
      description:clean(body.description)||null,amountSar:money(body.amountSar),priceUnit:clean(body.priceUnit,50)||null,
      bannerUrl,startsAt,endsAt,isVisible:body.isVisible===true,sortOrder:Number.isInteger(body.sortOrder)?Math.max(0,Math.min(9999,body.sortOrder)):previous.sortOrder,
    }});
    await prisma.auditLog.create({data:{userId:actor.user!.id,action:"HOTEL_OFFER_UPDATED",entityType:"HotelOffer",entityId:id}}).catch(()=>{});
    return NextResponse.json({success:true,data:updated});
  }catch(error){console.error("PUT hotel offers failed",error);return fail("تعذر تعديل العرض.",500);}
}
export async function DELETE(request:NextRequest){
  const actor=await access(true);if(actor.error)return actor.error;
  try{
    const {id}=await request.json();
    const previous=await prisma.hotelOffer.findFirst({where:{id,deletedAt:null}});
    if(!previous)return fail("العرض غير موجود.",404);
    await prisma.hotelOffer.update({where:{id},data:{deletedAt:new Date(),isVisible:false}});
    await prisma.auditLog.create({data:{userId:actor.user!.id,action:"HOTEL_OFFER_ARCHIVED",entityType:"HotelOffer",entityId:id}}).catch(()=>{});
    return NextResponse.json({success:true,message:"تمت أرشفة العرض دون حذف بياناته."});
  }catch(error){console.error("DELETE hotel offer failed",error);return fail("تعذر أرشفة العرض.",500);}
}
