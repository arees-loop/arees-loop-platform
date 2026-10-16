import { resolveDatabaseUrl } from "@/lib/database-url";

/** Never allow a bank-transfer write without an explicit environment launch decision. */
export function bankTransferWritesAllowed() {
  if (process.env.VERCEL_ENV === "production") {
    return process.env.AREES_BANK_TRANSFER_LIVE_ENABLED === "true";
  }
  if (process.env.VERCEL_ENV !== "preview" ||
      process.env.AREES_BANK_TRANSFER_PREVIEW_ENABLED !== "true" ||
      !process.env.BLOB_READ_WRITE_TOKEN) return false;
  try {
    // Preview resolver rejects missing, loopback and identical production URLs.
    resolveDatabaseUrl();
    return true;
  } catch {
    return false;
  }
}
