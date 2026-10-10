CREATE TABLE "GuideLicenseAlert" (
"id" TEXT NOT NULL,
"recipientUserId" TEXT NOT NULL,
"applicationId" TEXT NOT NULL,
"kind" TEXT NOT NULL,
"title" TEXT NOT NULL,
"message" TEXT NOT NULL,
"dayKey" TEXT NOT NULL,
"readAt" TIMESTAMP(3),
"createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
CONSTRAINT "GuideLicenseAlert_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "GuideLicenseAlert_recipientUserId_applicationId_kind_dayKey_key" ON "GuideLicenseAlert"("recipientUserId","applicationId","kind","dayKey");
CREATE INDEX "GuideLicenseAlert_recipientUserId_readAt_createdAt_idx" ON "GuideLicenseAlert"("recipientUserId","readAt","createdAt");
