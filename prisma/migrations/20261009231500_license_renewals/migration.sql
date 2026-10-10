CREATE TABLE "LicenseRenewalRequest" (
"id" TEXT NOT NULL,
"licenseId" TEXT NOT NULL,
"partnerId" TEXT NOT NULL,
"submittedById" TEXT NOT NULL,
"requestedExpiryDate" TIMESTAMP(3) NOT NULL,
"documentPath" TEXT NOT NULL,
"status" TEXT NOT NULL DEFAULT 'UNDER_REVIEW',
"reviewedById" TEXT,
"reviewedAt" TIMESTAMP(3),
"reviewNotes" TEXT,
"createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
"updatedAt" TIMESTAMP(3) NOT NULL,
CONSTRAINT "LicenseRenewalRequest_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "LicenseRenewalRequest_licenseId_status_idx" ON "LicenseRenewalRequest"("licenseId","status");
CREATE INDEX "LicenseRenewalRequest_partnerId_status_idx" ON "LicenseRenewalRequest"("partnerId","status");
