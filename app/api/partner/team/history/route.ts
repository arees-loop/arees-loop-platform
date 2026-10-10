import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentSession } from "@/lib/session";
import { canManagePartnerTeam } from "@/lib/partner-permissions";

/** Sensitive team changes are visible only to explicitly authorized team managers. */
export async function GET() {
  try {
    const session = await getCurrentSession();
    if (!session) return NextResponse.json({success:false,message:"يجب تسجيل الدخول أولاً."},{status:401});
    const actor = await prisma.partnerMember.findFirst({
      where:{userId:session.user.id,isActive:true},
      orderBy:{createdAt:"desc"},
      select:{partnerId:true,permissions:true,partner:{select:{status:true}}}
    });
    if (!actor || actor.partner.status!=="ACTIVE" || !canManagePartnerTeam(actor.permissions)) {
      return NextResponse.json({success:false,message:"ليس لديك صلاحية عرض سجل الصلاحيات."},{status:403});
    }
    const memberIds = (await prisma.partnerMember.findMany({
      where:{partnerId:actor.partnerId},select:{id:true}
    })).map(m=>m.id);
    const events = await prisma.auditLog.findMany({
      where:{entityType:"PartnerMember",action:"PARTNER_MEMBER_ROLE_UPDATED",entityId:{in:memberIds}},
      orderBy:{createdAt:"desc"},take:100,
      select:{id:true,entityId:true,action:true,createdAt:true,userId:true,beforeData:true,afterData:true}
    });
    return NextResponse.json({success:true,events});
  } catch(error) {
    console.error("GET /api/partner/team/history failed:",error);
    return NextResponse.json({success:false,message:"تعذر تحميل سجل الصلاحيات."},{status:500});
  }
}
