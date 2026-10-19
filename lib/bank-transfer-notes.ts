import { prisma } from "@/lib/prisma";

/**
 * Bank transfer instructions are stored as append-only administrative events.
 * This uses the existing indexed AuditLog table, so production does not need
 * a schema migration. Never overwrite or repurpose historical audit records.
 */
export const BANK_NOTE_ENTITY = "BANK_TRANSFER_ACCOUNT_NOTE";
export const BANK_NOTE_ACTION = "BANK_NOTE_UPDATED";
export const BANK_NOTE_MAX_LENGTH = 1500;

export async function findBankTransferNotes(ids: string[]): Promise<Record<string, string>> {
  if (ids.length === 0) return {};
  const pairs = await Promise.all(ids.map(async (id) => {
    const log = await prisma.auditLog.findFirst({
      where: { entityType: BANK_NOTE_ENTITY, entityId: id, action: BANK_NOTE_ACTION },
      orderBy: [{ createdAt: "desc" }, { id: "desc" }],
      select: { afterData: true },
    });
    const value = log?.afterData;
    const note = value && typeof value === "object" && !Array.isArray(value) &&
      "note" in value && typeof value.note === "string" ? value.note : "";
    return [id, note] as const;
  }));
  return Object.fromEntries(pairs);
}
