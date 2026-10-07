import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentSession } from "@/lib/session";

async function partnerFor(userId:string){
 return prisma.partnerMember.findFirst({where:{userId,isActive:true},include:{partner:true},orderBy:{createdAt:"desc"}});
}

export async function GET(){
 try{
  const session=await getCurrentSession(); if(!session)return NextResponse.json({success:false,message:"يجب تسجيل الدخول أولاً."},{status:401});
  const membership=await partnerFor(session.user.id); if(!membership)return NextResponse.json({success:false,message:"لا توجد منشأة مرتبطة بالحساب."},{status:404});
  const coupons=await prisma.coupon.findMany({where:{service:{partnerId:membership.partnerId}},include:{service:{select:{id:true,nameAr:true,category:true}}},orderBy:{createdAt:"desc"}});
  return NextResponse.json({success:true,coupons:coupons.map(c=>({...c,discountValue:Number(c.discountValue),minOrderAmount:c.minOrderAmount?Number(c.minOrderAmount):null,maxDiscountAmount:c.maxDiscountAmount?Number(c.maxDiscountAmount):null}))});
 }catch(error){console.error("GET /api/partner/coupons failed:",error);return NextResponse.json({success:false,message:"تعذر تحميل الكوبونات."},{status:500});}
}

export async function POST(request:Request){
 try{
  const session=await getCurrentSession(); if(!session)return NextResponse.json({success:false,message:"يجب تسجيل الدخول أولاً."},{status:401});
  const membership=await partnerFor(session.user.id); if(!membership)return NextResponse.json({success:false,message:"لا توجد منشأة مرتبطة بالحساب."},{status:404});
  if(membership.partner.status!=="ACTIVE")return NextResponse.json({success:false,message:"حساب الشريك غير مفعل."},{status:403});
  const body=await request.json();
  const code=String(body.code||"").trim().toUpperCase();
  if(!/^[A-Z0-9]+$/.test(code))return NextResponse.json({success:false,message:"كود الكوبون يجب أن يحتوي على حروف إنجليزية وأرقام فقط."},{status:400});
  const discountValue=Number(body.discountValue);
  if(!(discountValue>0))return NextResponse.json({success:false,message:"أدخل قيمة خصم صحيحة."},{status:400});
  if(body.discountType==="PERCENTAGE"&&discountValue>100)return NextResponse.json({success:false,message:"نسبة الخصم لا يمكن أن تتجاوز 100%."},{status:400});
  let serviceId:string|null=null, category:string|null=null;
  if(body.scope==="SERVICE"){
   serviceId=String(body.serviceId||""); const service=await prisma.service.findFirst({where:{id:serviceId,partnerId:membership.partnerId,status:"PUBLISHED"},select:{id:true}});
   if(!service)return NextResponse.json({success:false,message:"الخدمة المحددة غير متاحة أو غير منشورة."},{status:400});
  } else if(body.scope==="CATEGORY"){
   category=String(body.category||"").trim(); if(!category)return NextResponse.json({success:false,message:"اختر التصنيف."},{status:400});
   const exists=await prisma.service.findFirst({where:{partnerId:membership.partnerId,status:"PUBLISHED",category},select:{id:true}});
   if(!exists)return NextResponse.json({success:false,message:"لا توجد خدمة منشورة في هذا التصنيف."},{status:400});
   // Anchor ownership for partner-scoped listing while category remains the actual applicability rule.
   serviceId=exists.id;
  } else {
   const exists=await prisma.service.findFirst({where:{partnerId:membership.partnerId,status:"PUBLISHED"},select:{id:true}});
   if(!exists)return NextResponse.json({success:false,message:"يجب أن يكون لديك خدمة منشورة واحدة على الأقل."},{status:400});
   serviceId=exists.id;
  }
  const startsAt=body.duration==="DATED"&&body.startsAt?new Date(body.startsAt):null;
  const expiresAt=body.duration==="DATED"&&body.expiresAt?new Date(body.expiresAt+"T23:59:59.999"):null;
  if(body.duration==="DATED"&&(!startsAt||!expiresAt||Number.isNaN(startsAt.getTime())||Number.isNaN(expiresAt.getTime())||expiresAt<startsAt))return NextResponse.json({success:false,message:"حدد تاريخ بداية ونهاية صحيح للكوبون."},{status:400});
  const duplicate=await prisma.coupon.findUnique({where:{code},select:{id:true}}); if(duplicate)return NextResponse.json({success:false,message:"كود الكوبون مستخدم مسبقاً."},{status:409});
  const coupon=await prisma.coupon.create({data:{code,discountType:body.discountType==="FIXED"?"FIXED":"PERCENTAGE",discountValue,serviceId,category,startsAt,expiresAt,isActive:true}});
  return NextResponse.json({success:true,message:"تم إنشاء الكوبون بنجاح.",coupon:{...coupon,discountValue:Number(coupon.discountValue)}},{status:201});
 }catch(error){console.error("POST /api/partner/coupons failed:",error);return NextResponse.json({success:false,message:"تعذر إنشاء الكوبون."},{status:500});}
}

export async function PATCH(request:Request){try{const session=await getCurrentSession();if(!session)return NextResponse.json({success:false,message:"يجب تسجيل الدخول أولاً."},{status:401});const membership=await partnerFor(session.user.id);if(!membership)return NextResponse.json({success:false,message:"لا توجد منشأة مرتبطة بالحساب."},{status:404});const body=await request.json();const coupon=await prisma.coupon.findFirst({where:{id:String(body.id||""),service:{partnerId:membership.partnerId}},select:{id:true}});if(!coupon)return NextResponse.json({success:false,message:"الكوبون غير موجود."},{status:404});const updated=await prisma.coupon.update({where:{id:coupon.id},data:{isActive:Boolean(body.isActive)}});return NextResponse.json({success:true,isActive:updated.isActive});}catch(error){console.error("PATCH /api/partner/coupons failed:",error);return NextResponse.json({success:false,message:"تعذر تحديث حالة الكوبون."},{status:500});}}
