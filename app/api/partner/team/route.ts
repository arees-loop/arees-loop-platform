import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentSession } from "@/lib/session";
import { canManagePartnerTeam, getPartnerAccessRole, partnerPermissionPreset } from "@/lib/partner-permissions";

/** Updates an existing employee only. Ownership transfers and new invitations require separate verified flows. */
export async function PATCH(request: Request) {
  try {
    const session = await getCurrentSession();
    if (!session) return NextResponse.json({success:false,message:"يجب تسجيل الدخول أولاً."},{status:401});
    const body = await request.json().catch(()=>null);
    const memberId = typeof body?.memberId === "string" ? body.memberId.trim() : "";
    const role = body?.role;
    if (!memberId || (role !== "MANAGER" && role !== "EMPLOYEE")) {
      return NextResponse.json({success:false,message:"حدد الموظف والدور الصحيح."},{status:400});
    }
    const actor = await prisma.partnerMember.findFirst({
      where:{userId:session.user.id,isActive:true},
      orderBy:{createdAt:"desc"},
      select:{id:true,partnerId:true,permissions:true,partner:{select:{status:true}}}
    });
    if (!actor || actor.partner.status !== "ACTIVE" || !canManagePartnerTeam(actor.permissions)) {
      return NextResponse.json({success:false,message:"ليس لديك صلاحية تعديل فريق العمل."},{status:403});
    }
    if (actor.id === memberId) return NextResponse.json({success:false,message:"لا يمكن تعديل صلاحيات حسابك بنفسك."},{status:403});
    const actorRole = getPartnerAccessRole(actor.permissions);
    if (actorRole !== "OWNER" && role === "MANAGER") {
      return NextResponse.json({success:false,message:"تعيين المدير من صلاحيات المالك فقط."},{status:403});
    }
    const result = await prisma.$transaction(async tx => {
      const target = await tx.partnerMember.findFirst({
        where:{id:memberId,partnerId:actor.partnerId,isActive:true},
        select:{id:true,permissions:true,userId:true}
      });
      if (!target) return "NOT_FOUND" as const;
      const previousRole = getPartnerAccessRole(target.permissions);
      if (previousRole === "OWNER" || previousRole === "LEGACY" || (actorRole !== "OWNER" && previousRole !== "EMPLOYEE")) return "FORBIDDEN" as const;
      const permissions = partnerPermissionPreset(role);
      await tx.partnerMember.update({where:{id:target.id},data:{permissions}});
      await tx.auditLog.create({data:{
        userId:session.user.id,action:"PARTNER_MEMBER_ROLE_UPDATED",entityType:"PartnerMember",entityId:target.id,
        beforeData:{partnerId:actor.partnerId,role:previousRole},
        afterData:{partnerId:actor.partnerId,role}
      }});
      return "UPDATED" as const;
    });
    if(result === "NOT_FOUND") return NextResponse.json({success:false,message:"الموظف غير موجود."},{status:404});
    if(result === "FORBIDDEN") return NextResponse.json({success:false,message:"لا يمكن تعديل دور المالك أو الحسابات غير المصنفة."},{status:403});
    return NextResponse.json({success:true,message:"تم تحديث دور الموظف."});
  } catch(error) {
    console.error("PATCH /api/partner/team failed:",error);
    return NextResponse.json({success:false,message:"تعذر تحديث صلاحيات الموظف."},{status:500});
  }
}
