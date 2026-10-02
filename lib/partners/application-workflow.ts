import { notifyPartnerApplicationSubmitted } from "@/lib/notifications/partner-emails";

export type PartnerApplicationWorkflowInput = {
  partnerId: string;
  legalNameAr: string;
  tradeNameAr?: string | null;
  partnerEmail: string;
  status: string;
  previousStatus?: string | null;
  nextAction?: string | null;
};

export async function runPartnerApplicationWorkflow(
  input: PartnerApplicationWorkflowInput
) {
  const notifications = await notifyPartnerApplicationSubmitted({
    partnerId: input.partnerId,
    legalNameAr: input.legalNameAr,
    tradeNameAr: input.tradeNameAr,
    partnerEmail: input.partnerEmail,
    status: input.status,
    previousStatus: input.previousStatus,
    nextAction: input.nextAction,
  });

  return { notifications };
}
