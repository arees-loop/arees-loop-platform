CREATE TYPE "LoyaltyTransactionType" AS ENUM ('EARN', 'REDEEM', 'GIFT_SENT', 'GIFT_RECEIVED', 'ADJUSTMENT');

CREATE TABLE "LoyaltyWallet" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "balance" INTEGER NOT NULL DEFAULT 0,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "LoyaltyWallet_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "LoyaltyTransaction" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "type" "LoyaltyTransactionType" NOT NULL,
  "points" INTEGER NOT NULL,
  "description" TEXT,
  "referenceId" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "LoyaltyTransaction_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "LoyaltyWallet_userId_key" ON "LoyaltyWallet"("userId");
CREATE INDEX "LoyaltyWallet_balance_idx" ON "LoyaltyWallet"("balance");
CREATE INDEX "LoyaltyTransaction_userId_createdAt_idx" ON "LoyaltyTransaction"("userId", "createdAt");
CREATE INDEX "LoyaltyTransaction_type_idx" ON "LoyaltyTransaction"("type");
CREATE INDEX "LoyaltyTransaction_referenceId_idx" ON "LoyaltyTransaction"("referenceId");

ALTER TABLE "LoyaltyWallet" ADD CONSTRAINT "LoyaltyWallet_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "LoyaltyTransaction" ADD CONSTRAINT "LoyaltyTransaction_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
