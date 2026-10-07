-- CreateEnum
CREATE TYPE "LoyaltyScope" AS ENUM ('ALL', 'CATEGORY', 'SERVICE');

-- CreateTable
CREATE TABLE "PartnerLoyaltySetting" (
    "id" TEXT NOT NULL,
    "partnerId" TEXT NOT NULL,
    "scope" "LoyaltyScope" NOT NULL,
    "category" TEXT,
    "serviceId" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PartnerLoyaltySetting_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "PartnerLoyaltySetting_partnerId_idx" ON "PartnerLoyaltySetting"("partnerId");

-- CreateIndex
CREATE INDEX "PartnerLoyaltySetting_partnerId_isActive_idx" ON "PartnerLoyaltySetting"("partnerId", "isActive");

-- CreateIndex
CREATE INDEX "PartnerLoyaltySetting_serviceId_idx" ON "PartnerLoyaltySetting"("serviceId");

-- CreateIndex
CREATE INDEX "PartnerLoyaltySetting_category_idx" ON "PartnerLoyaltySetting"("category");

-- AddForeignKey
ALTER TABLE "PartnerLoyaltySetting" ADD CONSTRAINT "PartnerLoyaltySetting_partnerId_fkey" FOREIGN KEY ("partnerId") REFERENCES "Partner"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PartnerLoyaltySetting" ADD CONSTRAINT "PartnerLoyaltySetting_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES "Service"("id") ON DELETE CASCADE ON UPDATE CASCADE;
