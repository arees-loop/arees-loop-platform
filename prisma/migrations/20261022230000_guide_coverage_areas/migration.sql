-- Additive, non-destructive guide coverage storage. Do not apply to production without preflight approval.
CREATE TABLE "GuideServiceArea" (
 "id" TEXT NOT NULL,
 "partnerId" TEXT NOT NULL,
 "city" TEXT NOT NULL,
 "label" TEXT NOT NULL,
 "category" TEXT NOT NULL,
 "notes" TEXT,
 "latitude" DECIMAL(10,7) NOT NULL,
 "longitude" DECIMAL(10,7) NOT NULL,
 "radiusKm" INTEGER NOT NULL DEFAULT 50,
 "isActive" BOOLEAN NOT NULL DEFAULT true,
 "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
 "updatedAt" TIMESTAMP(3) NOT NULL,
 CONSTRAINT "GuideServiceArea_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "GuideServiceArea_partnerId_isActive_idx" ON "GuideServiceArea"("partnerId", "isActive");
CREATE INDEX "GuideServiceArea_city_idx" ON "GuideServiceArea"("city");
ALTER TABLE "GuideServiceArea" ADD CONSTRAINT "GuideServiceArea_partnerId_fkey"
 FOREIGN KEY ("partnerId") REFERENCES "Partner"("id") ON DELETE CASCADE ON UPDATE CASCADE;
