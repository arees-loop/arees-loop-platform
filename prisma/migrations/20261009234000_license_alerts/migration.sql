CREATE TABLE "LicenseAlert" (
"id" TEXT NOT NULL,
"recipientUserId" TEXT NOT NULL,
"licenseId" TEXT NOT NULL,
"partnerId" TEXT NOT NULL,
"kind" TEXT NOT NULL,
"title" TEXT NOT NULL,
"message" TEXT NOT NULL,
"dayKey" TEXT NOT NULL,
"readAt" TIMESTAMP(3),
"createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
CONSTRAINT "LicenseAlert_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "LicenseAlert_recipientUserId_licenseId_kind_dayKey_key" ON "LicenseAlert"("recipientUserId","licenseId","kind","dayKey");
CREATE INDEX "LicenseAlert_recipientUserId_readAt_createdAt_idx" ON "LicenseAlert"("recipientUserId","readAt","createdAt");
CREATE INDEX "LicenseAlert_partnerId_createdAt_idx" ON "LicenseAlert"("partnerId","createdAt");
