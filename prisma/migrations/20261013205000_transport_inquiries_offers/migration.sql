-- Additive-only: transport quote requests and managed offers; no change to existing bookings or customers.
-- Review database backup and pending migrations before any production migration.
CREATE TABLE "TransportRequest" (
  "id" TEXT NOT NULL,
  "reference" TEXT NOT NULL,
  "kind" TEXT NOT NULL,
  "customerName" TEXT NOT NULL,
  "customerEmail" TEXT,
  "countryCode" TEXT NOT NULL,
  "phone" TEXT NOT NULL,
  "whatsappCountryCode" TEXT,
  "whatsappPhone" TEXT,
  "origin" TEXT NOT NULL,
  "destination" TEXT NOT NULL,
  "travelDate" TIMESTAMP(3) NOT NULL,
  "adults" INTEGER NOT NULL DEFAULT 1,
  "children" INTEGER NOT NULL DEFAULT 0,
  "infants" INTEGER NOT NULL DEFAULT 0,
  "notes" TEXT,
  "status" TEXT NOT NULL DEFAULT 'NEW',
  "adminNotes" TEXT,
  "assignedToId" TEXT,
  "notificationStatus" TEXT NOT NULL DEFAULT 'PENDING',
  "emailedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "TransportRequest_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "TransportRequest_reference_key" ON "TransportRequest"("reference");
CREATE INDEX "TransportRequest_kind_status_createdAt_idx" ON "TransportRequest"("kind","status","createdAt");
CREATE INDEX "TransportRequest_phone_createdAt_idx" ON "TransportRequest"("phone","createdAt");

CREATE TABLE "TransportOffer" (
  "id" TEXT NOT NULL,
  "kind" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "description" TEXT,
  "carrierName" TEXT,
  "origin" TEXT,
  "destination" TEXT,
  "travelDate" TIMESTAMP(3),
  "amountSar" DECIMAL(12,2),
  "priceUnit" TEXT,
  "bannerUrl" TEXT,
  "isVisible" BOOLEAN NOT NULL DEFAULT true,
  "sortOrder" INTEGER NOT NULL DEFAULT 0,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "TransportOffer_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "TransportOffer_kind_isVisible_sortOrder_idx" ON "TransportOffer"("kind","isVisible","sortOrder");
