ALTER TABLE "Partner"
ADD COLUMN "mainContactPhoneVerifiedAt" TIMESTAMP(3);

CREATE TABLE "PartnerContactVerification" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "phone" TEXT NOT NULL,
  "verifiedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "PartnerContactVerification_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "PartnerContactVerification_userId_key"
ON "PartnerContactVerification"("userId");

CREATE INDEX "PartnerContactVerification_phone_idx"
ON "PartnerContactVerification"("phone");

ALTER TABLE "PartnerContactVerification"
ADD CONSTRAINT "PartnerContactVerification_userId_fkey"
FOREIGN KEY ("userId") REFERENCES "User"("id")
ON DELETE CASCADE ON UPDATE CASCADE;
