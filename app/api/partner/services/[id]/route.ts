import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentSession } from "@/lib/session";

export async function DELETE(_request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const session = await getCurrentSession();
  if (!session) return NextResponse.json({success:false,message:"يجب تسجيل الدخول أولاً."},{status:401});
  const { id } = await context.params;
  const membership = await prisma.partnerMember.findFirst({where:{userId:session.user.id,isActive:true},select:{partnerId:true}});
  if (!membership) return NextResponse.json({success:false,message:"لا توجد منشأة مرتبطة بالحساب."},{status:403});
  const service = await prisma.service.findFirst({where:{id,partnerId:membership.partnerId},include:{_count:{select:{bookings:true}}}});
  if (!service) return NextResponse.json({success:false,message:"الخدمة غير موجودة."},{status:404});
  if (service._count.bookings > 0) return NextResponse.json({success:false,message:"لا يمكن حذف هذه الخدمة لأنها مرتبطة بحجوزات. سيتم توفير الأرشفة/الإخفاء بدلاً من الحذف للحفاظ على السجل."},{status:409});
  await prisma.$transaction([
    prisma.serviceImage.deleteMany({where:{serviceId:id}}),
    prisma.service.delete({where:{id}})
  ]);
  return NextResponse.json({success:true,message:"تم حذف الخدمة نهائياً لعدم وجود حجوزات مرتبطة بها."});
}
