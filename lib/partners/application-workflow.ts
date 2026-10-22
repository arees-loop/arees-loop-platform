import { prisma } from "@/lib/prisma";
import { notifyPartnerApplicationSubmitted } from "@/lib/notifications/partner-emails";

/** Human review only. Automated AI decisions are intentionally disabled
 * until the separate verification process has passed an operational audit.
 */
export type PartnerApplicationWorkflowInput = {
  partnerId:string;
  legalNameAr:string;
  tradeNameAr?:string|null;
  partnerEmail:string;
  status:string;
  previousStatus?:string|null;
};

export async function runPartnerApplicationWorkflow(input:PartnerApplicationWorkflowInput) {
  await prisma.$transaction(async tx=>{
    await tx.partner.update({
      where:{id:input.partnerId},
      data:{status:"UNDER_REVIEW",reviewNotes:null,submittedAt:new Date()},
    });
    await tx.auditLog.create({
      data:{
        action:"PARTNER_APPLICATION_SUBMITTED_FOR_HUMAN_REVIEW",
        entityType:"Partner",
        entityId:input.partnerId,
        afterData:{status:"UNDER_REVIEW",source:"manual",previousStatus:input.previousStatus||null},
      },
    });
  });
  // An email provider outage must not turn an already-submitted application
  // into an apparent client failure, prompting duplicate registrations.
  let notifications = null;
  try {
    notifications = await notifyPartnerApplicationSubmitted({
      partnerId:input.partnerId,
      legalNameAr:input.legalNameAr,
      tradeNameAr:input.tradeNameAr,
      partnerEmail:input.partnerEmail,
      status:"UNDER_REVIEW",
      previousStatus:input.previousStatus,
      nextAction:"تم استلام الطلب للمراجعة البشرية لدى أريس لوب؛ سنراسلك عند الحاجة إلى استكمال.",
      aiReview:null,
    });
  } catch (error) {
    console.error("Partner application notification failed after successful human-review submission",error);
  }
  return {status:"UNDER_REVIEW",aiReview:null,notifications};
}
