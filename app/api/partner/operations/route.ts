import {sanitizeServiceHtml} from "@/lib/service-html";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentSession } from "@/lib/session";
import { canViewPartnerBookings, canViewPartnerFinances } from "@/lib/partner-permissions";

export async function GET() {
  try {
    const session=await getCurrentSession();
    if(!session) return NextResponse.json({success:false,message:"يجب تسجيل الدخول أولاً."},{status:401});
    const membership=await prisma.partnerMember.findFirst({where:{userId:session.user.id,isActive:true},select:{partnerId:true,permissions:true,partner:{select:{status:true}}},orderBy:{createdAt:"desc"}});
    if(!membership) return NextResponse.json({success:false,message:"لا توجد منشأة مرتبطة بالحساب."},{status:404});
    if(membership.partner.status!=="ACTIVE") return NextResponse.json({success:false,message:"حساب الشريك غير مفعل."},{status:403});
    const partnerId=membership.partnerId;
    const canViewBookings=canViewPartnerBookings(membership.permissions);
    const canViewFinances=canViewPartnerFinances(membership.permissions);
    const [services,bookings]=await Promise.all([
      prisma.service.findMany({where:{partnerId},include:{images:{orderBy:{sortOrder:"asc"}},license:true,_count:{select:{bookings:true}}},orderBy:{updatedAt:"desc"}}),
      canViewBookings?prisma.booking.findMany({where:{partnerId},include:{service:{select:{id:true,nameAr:true,nameEn:true}}},orderBy:{createdAt:"desc"}}):Promise.resolve([])
    ]);
    return NextResponse.json({success:true,services:services.map(s=>({...s,descriptionAr:sanitizeServiceHtml(s.descriptionAr),descriptionEn:sanitizeServiceHtml(s.descriptionEn),cancellationPolicy:sanitizeServiceHtml(s.cancellationPolicy),basePrice:canViewFinances?Number(s.basePrice):null,vatRate:canViewFinances?Number(s.vatRate):null,finalPrice:canViewFinances?Number(s.finalPrice):null,latitude:s.latitude==null?null:Number(s.latitude),longitude:s.longitude==null?null:Number(s.longitude),bookingCount:canViewBookings?s._count.bookings:null})),bookings:bookings.map(b=>({...b,paymentReference:canViewFinances?b.paymentReference:null,paymentMethod:canViewFinances?b.paymentMethod:null,baseAmount:canViewFinances?Number(b.baseAmount):null,vatAmount:canViewFinances?Number(b.vatAmount):null,totalAmount:canViewFinances?Number(b.totalAmount):null}))});
  } catch(error){console.error("GET /api/partner/operations failed:",error);return NextResponse.json({success:false,message:"تعذر تحميل بيانات الشريك."},{status:500});}
}
