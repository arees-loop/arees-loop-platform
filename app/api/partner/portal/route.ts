import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentSession } from "@/lib/session";
const n=(v:unknown)=>v==null?null:Number(v);
export async function GET(){
 try{
  const session=await getCurrentSession();
  if(!session)return NextResponse.json({success:false,message:"يجب تسجيل الدخول أولاً."},{status:401});
  const member=await prisma.partnerMember.findFirst({where:{userId:session.user.id,isActive:true},orderBy:{createdAt:"desc"},select:{partnerId:true}});
  if(!member)return NextResponse.json({success:false,message:"لا توجد منشأة مرتبطة بالحساب."},{status:404});
  const partnerId=member.partnerId;
  const [partner,services,bookings,invoices,settlements,licenses,members,agreements]=await Promise.all([
   prisma.partner.findUnique({where:{id:partnerId}}),
   prisma.service.findMany({where:{partnerId},include:{images:{orderBy:{sortOrder:"asc"}},_count:{select:{bookings:true}}},orderBy:{updatedAt:"desc"}}),
   prisma.booking.findMany({where:{partnerId},include:{service:{select:{id:true,nameAr:true,nameEn:true}}},orderBy:{createdAt:"desc"}}),
   prisma.invoice.findMany({where:{partnerId},include:{booking:{select:{reference:true,customerName:true,service:{select:{nameAr:true}}}}},orderBy:{createdAt:"desc"}}),
   prisma.settlement.findMany({where:{partnerId},orderBy:{createdAt:"desc"}}),
   prisma.license.findMany({where:{partnerId},orderBy:{updatedAt:"desc"}}),
   prisma.partnerMember.findMany({where:{partnerId},include:{user:{select:{id:true,name:true,email:true,phone:true}}},orderBy:{createdAt:"asc"}}),
   prisma.agreement.findMany({where:{partnerId},orderBy:{createdAt:"desc"}})
  ]);
  return NextResponse.json({success:true,partner:{...partner,commissionRate:n(partner?.commissionRate),transferFee:n(partner?.transferFee),latitude:n(partner?.latitude),longitude:n(partner?.longitude)},services:services.map(s=>({...s,basePrice:n(s.basePrice),vatRate:n(s.vatRate),finalPrice:n(s.finalPrice),bookingCount:s._count.bookings})),bookings:bookings.map(b=>({...b,baseAmount:n(b.baseAmount),vatAmount:n(b.vatAmount),totalAmount:n(b.totalAmount)})),invoices:invoices.map(i=>({...i,subtotal:n(i.subtotal),vatAmount:n(i.vatAmount),totalAmount:n(i.totalAmount)})),settlements:settlements.map(s=>({...s,grossSales:n(s.grossSales),platformCommission:n(s.platformCommission),paymentFees:n(s.paymentFees),transferFees:n(s.transferFees),refunds:n(s.refunds),adjustments:n(s.adjustments),netAmount:n(s.netAmount)})),licenses,members,agreements:agreements.map(a=>({...a,commissionRate:n(a.commissionRate)})});
 }catch(error){console.error("GET /api/partner/portal failed:",error);return NextResponse.json({success:false,message:"تعذر تحميل بيانات بوابة الشريك."},{status:500});}
}