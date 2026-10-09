CREATE TABLE "PartnerInvitation" (
    "id" TEXT NOT NULL,
    "partnerId" TEXT NOT NULL,
    "invitedByUserId" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "tokenHash" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "jobTitle" TEXT,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "acceptedAt" TIMESTAMP(3),
    "revokedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "PartnerInvitation_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "PartnerInvitation_tokenHash_key" ON "PartnerInvitation"("tokenHash");
CREATE INDEX "PartnerInvitation_partnerId_email_idx" ON "PartnerInvitation"("partnerId", "email");
CREATE INDEX "PartnerInvitation_expiresAt_idx" ON "PartnerInvitation"("expiresAt");
ALTER TABLE "PartnerInvitation" ADD CONSTRAINT "PartnerInvitation_partnerId_fkey" FOREIGN KEY ("partnerId") REFERENCES "Partner"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "PartnerInvitation" ADD CONSTRAINT "PartnerInvitation_invitedByUserId_fkey" FOREIGN KEY ("invitedByUserId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
