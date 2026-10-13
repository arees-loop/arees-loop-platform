-- Additive only. NOT applied by preview builds or on production without separate approval.
CREATE TABLE "PublicEvent" (
"id" TEXT NOT NULL,
"partnerId" TEXT NOT NULL,
"createdByUserId" TEXT NOT NULL,
"kind" TEXT NOT NULL DEFAULT 'EVENT',
"nameAr" TEXT NOT NULL,
"nameEn" TEXT NOT NULL,
"descriptionAr" TEXT NOT NULL,
"descriptionEn" TEXT NOT NULL,
"includesAr" TEXT,
"includesEn" TEXT,
"excludesAr" TEXT,
"excludesEn" TEXT,
"notesAr" TEXT,
"notesEn" TEXT,
"posterUrl" TEXT,
"city" TEXT NOT NULL,
"locationName" TEXT NOT NULL,
"latitude" DECIMAL(10,7),
"longitude" DECIMAL(10,7),
"startsAt" TIMESTAMP(3) NOT NULL,
"endsAt" TIMESTAMP(3) NOT NULL,
"registrationUrl" TEXT,
"status" TEXT NOT NULL DEFAULT 'DRAFT',
"publishedAt" TIMESTAMP(3),
"createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
"updatedAt" TIMESTAMP(3) NOT NULL,
CONSTRAINT "PublicEvent_pkey" PRIMARY KEY ("id")
);
ALTER TABLE "PublicEvent" ADD CONSTRAINT "PublicEvent_partnerId_fkey" FOREIGN KEY ("partnerId") REFERENCES "Partner"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
CREATE INDEX "PublicEvent_partnerId_status_idx" ON "PublicEvent"("partnerId","status");
CREATE INDEX "PublicEvent_status_startsAt_idx" ON "PublicEvent"("status","startsAt");
