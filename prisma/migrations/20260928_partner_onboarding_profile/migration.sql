-- CreateEnum
CREATE TYPE "PartnerType" AS ENUM ('INDIVIDUAL', 'BUSINESS', 'GOVERNMENT_NONPROFIT');

-- CreateEnum
CREATE TYPE "PartnerApplicantRole" AS ENUM ('OWNER', 'REPRESENTATIVE');

-- CreateEnum
CREATE TYPE "PartnerDocumentType" AS ENUM ('IDENTITY', 'BUSINESS_PROOF', 'COMMERCIAL_REGISTER', 'AUTHORIZATION', 'VAT_CERTIFICATE', 'IBAN_CERTIFICATE', 'GOVERNMENT_LETTER', 'OTHER');

-- CreateEnum
CREATE TYPE "PartnerDocumentStatus" AS ENUM ('PENDING', 'AI_REVIEWED', 'NEEDS_CORRECTION', 'VERIFIED', 'REJECTED');

-- AlterEnum
ALTER TYPE "PartnerStatus" ADD VALUE 'NEEDS_COMPLETION';

-- AlterTable
ALTER TABLE "Partner" ADD COLUMN     "activatedAt" TIMESTAMP(3),
ADD COLUMN     "address" TEXT,
ADD COLUMN     "applicantJobTitle" TEXT,
ADD COLUMN     "applicantRole" "PartnerApplicantRole",
ADD COLUMN     "approvedAt" TIMESTAMP(3),
ADD COLUMN     "businessEmail" TEXT,
ADD COLUMN     "businessPhone" TEXT,
ADD COLUMN     "city" TEXT,
ADD COLUMN     "completionNotes" TEXT,
ADD COLUMN     "country" TEXT,
ADD COLUMN     "descriptionAr" TEXT,
ADD COLUMN     "formattedAddress" TEXT,
ADD COLUMN     "latitude" DECIMAL(10,7),
ADD COLUMN     "locationName" TEXT,
ADD COLUMN     "longitude" DECIMAL(10,7),
ADD COLUMN     "operates24h" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "operatingHours" TEXT,
ADD COLUMN     "partnerType" "PartnerType",
ADD COLUMN     "placeId" TEXT,
ADD COLUMN     "preApprovedAt" TIMESTAMP(3),
ADD COLUMN     "proofType" TEXT,
ADD COLUMN     "publicName" TEXT,
ADD COLUMN     "receivesPayments" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "rejectedAt" TIMESTAMP(3),
ADD COLUMN     "reviewNotes" TEXT,
ADD COLUMN     "reviewedAt" TIMESTAMP(3),
ADD COLUMN     "submittedAt" TIMESTAMP(3),
ADD COLUMN     "suspendedAt" TIMESTAMP(3),
ADD COLUMN     "vatRegistered" BOOLEAN NOT NULL DEFAULT false;

-- CreateTable
CREATE TABLE "PartnerCategory" (
    "id" TEXT NOT NULL,
    "partnerId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PartnerCategory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PartnerDocument" (
    "id" TEXT NOT NULL,
    "partnerId" TEXT NOT NULL,
    "type" "PartnerDocumentType" NOT NULL,
    "label" TEXT,
    "fileUrl" TEXT NOT NULL,
    "fileName" TEXT,
    "mimeType" TEXT,
    "documentNumber" TEXT,
    "issuer" TEXT,
    "issueDate" TIMESTAMP(3),
    "expiryDate" TIMESTAMP(3),
    "status" "PartnerDocumentStatus" NOT NULL DEFAULT 'PENDING',
    "aiStatus" "PartnerDocumentStatus",
    "aiNotes" TEXT,
    "reviewNotes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PartnerDocument_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "PartnerCategory_partnerId_idx" ON "PartnerCategory"("partnerId");

-- CreateIndex
CREATE UNIQUE INDEX "PartnerCategory_partnerId_name_key" ON "PartnerCategory"("partnerId", "name");

-- CreateIndex
CREATE INDEX "PartnerDocument_partnerId_idx" ON "PartnerDocument"("partnerId");

-- CreateIndex
CREATE INDEX "PartnerDocument_type_idx" ON "PartnerDocument"("type");

-- CreateIndex
CREATE INDEX "PartnerDocument_status_idx" ON "PartnerDocument"("status");

-- CreateIndex
CREATE INDEX "Partner_status_idx" ON "Partner"("status");

-- CreateIndex
CREATE INDEX "Partner_partnerType_idx" ON "Partner"("partnerType");

-- CreateIndex
CREATE INDEX "Partner_city_idx" ON "Partner"("city");

-- CreateIndex
CREATE INDEX "PartnerMember_userId_idx" ON "PartnerMember"("userId");

-- CreateIndex
CREATE INDEX "License_partnerId_idx" ON "License"("partnerId");

-- CreateIndex
CREATE INDEX "Service_partnerId_idx" ON "Service"("partnerId");

-- CreateIndex
CREATE INDEX "Service_status_idx" ON "Service"("status");

-- CreateIndex
CREATE INDEX "Service_category_idx" ON "Service"("category");

-- CreateIndex
CREATE INDEX "ServiceImage_serviceId_idx" ON "ServiceImage"("serviceId");

-- CreateIndex
CREATE INDEX "Booking_userId_idx" ON "Booking"("userId");

-- CreateIndex
CREATE INDEX "Booking_partnerId_idx" ON "Booking"("partnerId");

-- CreateIndex
CREATE INDEX "Booking_serviceId_idx" ON "Booking"("serviceId");

-- CreateIndex
CREATE INDEX "Booking_status_idx" ON "Booking"("status");

-- CreateIndex
CREATE INDEX "Invoice_partnerId_idx" ON "Invoice"("partnerId");

-- CreateIndex
CREATE INDEX "Invoice_status_idx" ON "Invoice"("status");

-- CreateIndex
CREATE INDEX "Settlement_partnerId_idx" ON "Settlement"("partnerId");

-- CreateIndex
CREATE INDEX "Settlement_status_idx" ON "Settlement"("status");

-- CreateIndex
CREATE INDEX "Agreement_partnerId_idx" ON "Agreement"("partnerId");

-- CreateIndex
CREATE INDEX "Agreement_status_idx" ON "Agreement"("status");

-- CreateIndex
CREATE INDEX "AuditLog_userId_idx" ON "AuditLog"("userId");

-- CreateIndex
CREATE INDEX "AuditLog_entityType_entityId_idx" ON "AuditLog"("entityType", "entityId");

-- CreateIndex
CREATE INDEX "AuditLog_createdAt_idx" ON "AuditLog"("createdAt");

-- AddForeignKey
ALTER TABLE "PartnerCategory" ADD CONSTRAINT "PartnerCategory_partnerId_fkey" FOREIGN KEY ("partnerId") REFERENCES "Partner"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PartnerDocument" ADD CONSTRAINT "PartnerDocument_partnerId_fkey" FOREIGN KEY ("partnerId") REFERENCES "Partner"("id") ON DELETE CASCADE ON UPDATE CASCADE;

