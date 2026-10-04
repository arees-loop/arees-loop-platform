import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentSession } from "@/lib/session";

export async function GET() {
  try {
    const session=await getCurrentSession();
    if(!session) return NextResponse.json({success:false,message:"يجب تسجيل الدخول أولاً."},{status:401});
    const membership=await prisma.partnerMember.findFirst({where:{userId:session.user.id,isActive:true},select:{partnerId:true},orderBy:{createdAt:"desc"}});
    if(!membership) return NextResponse.json({success:false,message:"لا توجد منشأة مرتبطة بالحساب."},{status:404});
    const partnerId=membership.partnerId;
    const [services,bookings]=await Promise.all([
      prisma.service.findMany({where:{partnerId},include:{images:{orderBy:{sortOrder:"asc"}},license:true,_count:{select:{bookings:true}}},orderBy:{updatedAt:"desc"}}),
      prisma.booking.findMany({where:{partnerId},include:{service:{select:{id:true,nameAr:true,nameEn:true}}},orderBy:{createdAt:"desc"}})
    ]);
    return NextResponse.json({success:true,services:services.map(s=>({...s,basePrice:Number(s.basePrice),vatRate:Number(s.vatRate),finalPrice:Number(s.finalPrice),latitude:s.latitude?Number(s.latitude):null,longitude:s.longitude?Number(s.longitude):null,bookingCount:s._count.bookings})),bookings:bookings.map(b=>({...b,baseAmount:Number(b.baseAmount),vatAmount:Number(b.vatAmount),totalAmount:Number(b.totalAmount)}))});
  } catch(error){console.error("GET /api/partner/operations failed:",error);return NextResponse.json({success:false,message:"تعذر تحميل بيانات الشريك."},{status:500});}
}
