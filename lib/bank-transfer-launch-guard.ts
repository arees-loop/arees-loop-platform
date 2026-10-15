/** Fail closed until a dedicated non-production database and approved checkout launch. */
export function bankTransferWritesAllowed() {
  return process.env.VERCEL_ENV === "production"
    && process.env.AREES_BANK_TRANSFER_LIVE_ENABLED === "true";
}
