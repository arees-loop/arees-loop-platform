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

/**
 * Runs non-blocking side effects after the partner application has been
 * persisted successfully. Notification failure must never roll back or
 * invalidate the application itself.
 *
 * AI review will be added to this orchestration layer next, before the
 * admin notification is enriched with the AI report.
 */
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
