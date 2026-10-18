-- Create missing bank transfer account table before the existing notes migration.
-- This migration is additive; existing tables and records are untouched.
CREATE TABLE IF NOT EXISTS "BankTransferAccount" (
    "id" TEXT NOT NULL,
    "bankName" TEXT NOT NULL,
    "beneficiaryName" TEXT NOT NULL,
    "iban" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "BankTransferAccount_pkey" PRIMARY KEY ("id")
);
