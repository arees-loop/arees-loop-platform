-- Additive-only: transport quote requests and managed offers; no change to existing bookings or customers.
-- Review database backup and pending migrations before any production migration.
CREATE TABLE "TransportRequest" (
  "id" TEXT NOT NULL,
  "reference" TEXT NOT NULL,
  "userId" TEXT,
  "trackingTokenHash" TEXT,
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
  "tripType" TEXT NOT NULL DEFAULT 'ONE_WAY',
  "returnDate" TIMESTAMP(3),
  "itinerary" JSONB,
  "adults" INTEGER NOT NULL DEFAULT 1,
  "children" INTEGER NOT NULL DEFAULT 0,
  "infants" INTEGER NOT NULL DEFAULT 0,
  "notes" TEXT,
  "status" TEXT NOT NULL DEFAULT 'NEW',
  "adminNotes" TEXT,
  "assignedToId" TEXT,
  "canceledBy" TEXT,
  "cancellationReason" TEXT,
  "carrierName" TEXT,
  "quoteAmountSar" DECIMAL(12,2),
  "quoteNotes" TEXT,
  "quoteValidUntil" TIMESTAMP(3),
  "quoteUpdatedAt" TIMESTAMP(3),
  "whatsappStatus" TEXT NOT NULL DEFAULT 'NOT_SENT',
  "notificationStatus" TEXT NOT NULL DEFAULT 'PENDING',
  "emailedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "TransportRequest_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "TransportRequest_reference_key" ON "TransportRequest"("reference");
CREATE UNIQUE INDEX "TransportRequest_trackingTokenHash_key" ON "TransportRequest"("trackingTokenHash");
CREATE INDEX "TransportRequest_userId_createdAt_idx" ON "TransportRequest"("userId","createdAt");
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
  "operationStatus" TEXT NOT NULL DEFAULT 'AVAILABLE',
  "operationNote" TEXT,
  "isVisible" BOOLEAN NOT NULL DEFAULT true,
  "startsAt" TIMESTAMP(3),
  "endsAt" TIMESTAMP(3),
  "deletedAt" TIMESTAMP(3),
  "sortOrder" INTEGER NOT NULL DEFAULT 0,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "TransportOffer_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "TransportOffer_kind_isVisible_sortOrder_idx" ON "TransportOffer"("kind","isVisible","sortOrder");

CREATE TABLE "TransportRequestEvent" (
  "id" TEXT NOT NULL,
  "requestId" TEXT NOT NULL,
  "actorId" TEXT,
  "actorName" TEXT NOT NULL,
  "action" TEXT NOT NULL,
  "fromStatus" TEXT,
  "toStatus" TEXT,
  "details" JSONB,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "TransportRequestEvent_pkey" PRIMARY KEY ("id")
);
ALTER TABLE "TransportRequestEvent" ADD CONSTRAINT "TransportRequestEvent_requestId_fkey" FOREIGN KEY ("requestId") REFERENCES "TransportRequest"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
CREATE INDEX "TransportRequestEvent_requestId_createdAt_idx" ON "TransportRequestEvent"("requestId","createdAt");
CREATE INDEX "TransportRequestEvent_actorId_createdAt_idx" ON "TransportRequestEvent"("actorId","createdAt");
