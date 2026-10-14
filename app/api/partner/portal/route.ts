import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentSession } from "@/lib/session";
import { hasPartnerPermission, type PartnerPermission } from "@/lib/partner-permissions";
const n=(v:unknown)=>v==null?null:Number(v);
export async function GET(request:Request){
 try{
  const session=await getCurrentSession();
  if(!session)return NextResponse.json({success:false,message:"يجب تسجيل الدخول أولاً."},{status:401});
  const member=await prisma.partnerMember.findFirst({where:{userId:session.user.id,isActive:true},orderBy:{createdAt:"desc"},include:{user:{select:{role:true}}}});
  if(!member)return NextResponse.json({success:false,message:"لا توجد منشأة مرتبطة بالحساب."},{status:404});
  const partnerId=member.partnerId;
  const section = new URL(request.url).searchParams.get("section") || "dashboard";
  const permissionBySection: Record<string, PartnerPermission> = {
   dashboard:"dashboard", bookings:"bookings", settlements:"settlements",
   invoices:"invoices", reports:"reports", business:"business"
  };
  const requiredPermission = permissionBySection[section];
  if(!requiredPermission) return NextResponse.json({success:false,message:"القسم المطلوب غير متاح."},{status:400});
  if(!hasPartnerPermission(member.user.role,member.permissions,requiredPermission)) return NextResponse.json({success:false,message:"ما عندك صلاحية لعرض هذا القسم."},{status:403});
  const allowed = (permission:PartnerPermission)=>hasPartnerPermission(member.user.role,member.permissions,permission);

  const [partner,services,bookings,invoices,settlements,licenses,members,agreements]=await Promise.all([
   prisma.partner.findUnique({where:{id:partnerId}}),
   prisma.service.findMany({where:{partnerId},include:{images:{orderBy:{sortOrder:"asc"}},_count:{select:{bookings:true}}},orderBy:{updatedAt:"desc"}}),
   prisma.booking.findMany({where:{partnerId},include:{service:{select:{id:true,nameAr:true,nameEn:true}}},orderBy:{createdAt:"desc"}}),
   prisma.invoice.findMany({where:{partnerId},include:{booking:{select:{reference:true,customerName:true,service:{select:{nameAr:true}}}}},orderBy:{createdAt:"desc"}}),
   prisma.settlement.findMany({where:{partnerId},orderBy:{createdAt:"desc"}}),
   prisma.license.findMany({where:{partnerId},orderBy:{updatedAt:"desc"}}),
   prisma.partnerMember.findMany({where:{partnerId},include:{user:{select:{id:true,firstName:true,lastName:true,email:true,phone:true}}},orderBy:{createdAt:"asc"}}),
   prisma.agreement.findMany({where:{partnerId},orderBy:{createdAt:"desc"}})
  ]);
  return NextResponse.json({success:true,partner:allowed("business")?{...partner,commissionRate:n(partner?.commissionRate),transferFee:n(partner?.transferFee),latitude:n(partner?.latitude),longitude:n(partner?.longitude)}:{id:partner?.id,tradeNameAr:partner?.tradeNameAr,legalNameAr:partner?.legalNameAr},services:allowed("services")||section==="dashboard"?services.map(s=>({...s,basePrice:n(s.basePrice),vatRate:n(s.vatRate),finalPrice:n(s.finalPrice),bookingCount:s._count.bookings})):[],bookings:allowed("bookings")||section==="dashboard"?bookings.map(b=>({...b,baseAmount:n(b.baseAmount),vatAmount:n(b.vatAmount),totalAmount:n(b.totalAmount)})):[],invoices:allowed("invoices")?invoices.map(i=>({...i,subtotal:n(i.subtotal),vatAmount:n(i.vatAmount),totalAmount:n(i.totalAmount)})):[],settlements:allowed("settlements")||section==="dashboard"?settlements.map(s=>({...s,grossSales:n(s.grossSales),platformCommission:n(s.platformCommission),paymentFees:n(s.paymentFees),transferFees:n(s.transferFees),refunds:n(s.refunds),adjustments:n(s.adjustments),netAmount:n(s.netAmount)})):[],licenses:allowed("business")?licenses:[],members:section==="business"?members:[],agreements:allowed("business")?agreements.map(a=>({...a,commissionRate:n(a.commissionRate)})):[]});
 }catch(error){console.error("GET /api/partner/portal failed:",error);return NextResponse.json({success:false,message:"تعذر تحميل بيانات بوابة الشريك."},{status:500});}
}