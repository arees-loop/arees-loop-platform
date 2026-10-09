CREATE TABLE "GuideApplication" (
"id" TEXT NOT NULL,
"userId" TEXT NOT NULL,
"fullName" TEXT NOT NULL,
"email" TEXT NOT NULL,
"phone" TEXT NOT NULL,
"gender" TEXT NOT NULL,
"countries" TEXT[] NOT NULL,
"city" TEXT NOT NULL,
"licenseCategory" TEXT NOT NULL,
"licenseNumber" TEXT NOT NULL,
"licenseExpiresAt" TIMESTAMP(3) NOT NULL,
"specialization" TEXT,
"languages" TEXT[] NOT NULL,
"bio" TEXT,
"photoPath" TEXT,
"licensePath" TEXT NOT NULL,
"photoPublicationConsent" BOOLEAN NOT NULL DEFAULT false,
"policyAcceptedAt" TIMESTAMP(3) NOT NULL,
"status" TEXT NOT NULL DEFAULT 'UNDER_REVIEW',
"reviewedAt" TIMESTAMP(3),
"reviewNotes" TEXT,
"createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
"updatedAt" TIMESTAMP(3) NOT NULL,
CONSTRAINT "GuideApplication_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "GuideApplication_userId_idx" ON "GuideApplication"("userId");
CREATE INDEX "GuideApplication_status_idx" ON "GuideApplication"("status");