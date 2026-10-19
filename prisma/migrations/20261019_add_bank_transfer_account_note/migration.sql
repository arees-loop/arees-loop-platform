-- Add the optional bank transfer account note without modifying existing records.
ALTER TABLE "BankTransferAccount"
  ADD COLUMN IF NOT EXISTS "note" TEXT;
