import { prisma } from "@/lib/prisma";

export type PartnerNameField = "legalNameAr" | "tradeNameAr";
const REASON = "PARTNER_NAME_EDIT_PERMISSION";

export async function getPartnerNameEditPermissions(partnerId: string) {
  const entries = await prisma.partnerChangeRequest.findMany({
    where: {partnerId, reason: REASON},
    orderBy: [{createdAt: "desc"}, {id: "desc"}],
    select: {changes: true},
  });
  const flags: Record<PartnerNameField, boolean> = {legalNameAr: false, tradeNameAr: false};
  const visited = new Set<string>();
  for (const entry of entries) {
    const data = entry.changes;
    if (!data || typeof data !== "object" || Array.isArray(data)) continue;
    const x = data as Record<string, unknown>;
    if ((x.field === "legalNameAr" || x.field === "tradeNameAr") && typeof x.enabled === "boolean" && !visited.has(x.field)) {
      flags[x.field] = x.enabled;
      visited.add(x.field);
    }
    if (visited.size === 2) break;
  }
  return flags;
}

export const PARTNER_NAME_PERMISSION_REASON = REASON;
