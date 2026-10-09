import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentSession } from "@/lib/session";
import { canViewPartnerFinances } from "@/lib/partner-permissions";
const n=(v:unknown)=>v==null?null:Number(v);
export async function GET(){
 try{
  const session=await getCurrentSession();
  if(!session)return NextResponse.json({success:false,message:"يجب تسجيل الدخول أولاً."},{status:401});
  const member=await prisma.partnerMember.findFirst({where:{userId:session.user.id,isActive:true},orderBy:{createdAt:"desc"},select:{partnerId:true,permissions:true,partner:{select:{status:true}}}});
  if(!member)return NextResponse.json({success:false,message:"لا توجد منشأة مرتبطة بالحساب."},{status:404});
  if(member.partner.status!=="ACTIVE")return NextResponse.json({success:false,message:"حساب الشريك غير مفعل."},{status:403});
  const partnerId=member.partnerId;
  const canViewFinances=canViewPartnerFinances(member.permissions);
  const [partner,services,bookings,invoices,settlements,licenses,members,agreements]=await Promise.all([
   prisma.partner.findUnique({where:{id:partnerId}}),
   prisma.service.findMany({where:{partnerId},include:{images:{orderBy:{sortOrder:"asc"}},_count:{select:{bookings:true}}},orderBy:{updatedAt:"desc"}}),
   prisma.booking.findMany({where:{partnerId},include:{service:{select:{id:true,nameAr:true,nameEn:true}}},orderBy:{createdAt:"desc"}}),
   canViewFinances?prisma.invoice.findMany({where:{partnerId},include:{booking:{select:{reference:true,customerName:true,service:{select:{nameAr:true}}}}},orderBy:{createdAt:"desc"}}):Promise.resolve([]),
   canViewFinances?prisma.settlement.findMany({where:{partnerId},orderBy:{createdAt:"desc"}}):Promise.resolve([]),
   prisma.license.findMany({where:{partnerId},orderBy:{updatedAt:"desc"}}),
   prisma.partnerMember.findMany({where:{partnerId},include:{user:{select:{id:true,firstName:true,lastName:true,email:true,phone:true}}},orderBy:{createdAt:"asc"}}),
   canViewFinances?prisma.agreement.findMany({where:{partnerId},orderBy:{createdAt:"desc"}}):Promise.resolve([])
  ]);
  return NextResponse.json({success:true,partner:{...partner,iban:canViewFinances?partner?.iban:null,bankName:canViewFinances?partner?.bankName:null,swiftCode:canViewFinances?partner?.swiftCode:null,beneficiaryName:canViewFinances?partner?.beneficiaryName:null,financeContactName:canViewFinances?partner?.financeContactName:null,financeContactEmail:canViewFinances?partner?.financeContactEmail:null,financeContactPhone:canViewFinances?partner?.financeContactPhone:null,commissionRate:canViewFinances?n(partner?.commissionRate):null,transferFee:canViewFinances?n(partner?.transferFee):null,latitude:n(partner?.latitude),longitude:n(partner?.longitude)},services:services.map(s=>({...s,basePrice:n(s.basePrice),vatRate:n(s.vatRate),finalPrice:n(s.finalPrice),bookingCount:s._count.bookings})),bookings:bookings.map(b=>({...b,paymentReference:canViewFinances?b.paymentReference:null,paymentMethod:canViewFinances?b.paymentMethod:null,baseAmount:canViewFinances?n(b.baseAmount):null,vatAmount:canViewFinances?n(b.vatAmount):null,totalAmount:canViewFinances?n(b.totalAmount):null})),invoices:invoices.map(i=>({...i,subtotal:n(i.subtotal),vatAmount:n(i.vatAmount),totalAmount:n(i.totalAmount)})),settlements:settlements.map(s=>({...s,grossSales:n(s.grossSales),platformCommission:n(s.platformCommission),paymentFees:n(s.paymentFees),transferFees:n(s.transferFees),refunds:n(s.refunds),adjustments:n(s.adjustments),netAmount:n(s.netAmount)})),licenses,members,agreements:canViewFinances?agreements.map(a=>({...a,commissionRate:n(a.commissionRate)})):[]});
 }catch(error){console.error("GET /api/partner/portal failed:",error);return NextResponse.json({success:false,message:"تعذر تحميل بيانات بوابة الشريك."},{status:500});}
}