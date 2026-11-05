CREATE TYPE "CardPaymentStatus" AS ENUM ('INITIATING', 'REDIRECT_READY', 'PENDING', 'PAID', 'FAILED');
CREATE TABLE "CardPaymentAttempt" (
 "id" TEXT NOT NULL,
 "orderReference" TEXT NOT NULL,
 "userId" TEXT NOT NULL,
 "amountMinor" INTEGER NOT NULL,
 "currency" TEXT NOT NULL DEFAULT 'SAR',
 "trackId" TEXT NOT NULL,
 "gatewayPaymentId" TEXT,
 "checkoutUrl" TEXT,
 "status" "CardPaymentStatus" NOT NULL DEFAULT 'INITIATING',
 "bankTransactionId" TEXT,
 "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
 "updatedAt" TIMESTAMP(3) NOT NULL,
 CONSTRAINT "CardPaymentAttempt_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "CardPaymentAttempt_orderReference_key" ON "CardPaymentAttempt"("orderReference");
CREATE UNIQUE INDEX "CardPaymentAttempt_trackId_key" ON "CardPaymentAttempt"("trackId");
CREATE UNIQUE INDEX "CardPaymentAttempt_gatewayPaymentId_key" ON "CardPaymentAttempt"("gatewayPaymentId");
CREATE UNIQUE INDEX "CardPaymentAttempt_bankTransactionId_key" ON "CardPaymentAttempt"("bankTransactionId");
CREATE INDEX "CardPaymentAttempt_userId_createdAt_idx" ON "CardPaymentAttempt"("userId","createdAt");
CREATE INDEX "CardPaymentAttempt_status_createdAt_idx" ON "CardPaymentAttempt"("status","createdAt");
