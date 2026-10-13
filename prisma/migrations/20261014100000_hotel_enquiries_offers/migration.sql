-- Additive, non-destructive hotel quotation request and campaign tables.
-- Do not apply in Production until database backup, migration history and restore path are verified.
CREATE TABLE "HotelInquiry" (
  "id" TEXT NOT NULL,
  "reference" TEXT NOT NULL,
  "userId" TEXT,
  "trackingTokenHash" TEXT,
  "customerName" TEXT NOT NULL,
  "customerEmail" TEXT,
  "countryCode" TEXT NOT NULL,
  "phone" TEXT NOT NULL,
  "whatsappCountryCode" TEXT,
  "whatsappPhone" TEXT,
  "destination" TEXT NOT NULL,
  "hotelName" TEXT,
  "checkInDate" TIMESTAMP(3) NOT NULL,
  "checkOutDate" TIMESTAMP(3) NOT NULL,
  "rooms" INTEGER NOT NULL DEFAULT 1,
  "adults" INTEGER NOT NULL DEFAULT 1,
  "children" INTEGER NOT NULL DEFAULT 0,
  "notes" TEXT,
  "status" TEXT NOT NULL DEFAULT 'NEW',
  "assignedToId" TEXT,
  "adminNotes" TEXT,
  "customerReply" TEXT,
  "quoteAmountSar" DECIMAL(12,2),
  "quoteNotes" TEXT,
  "notificationStatus" TEXT NOT NULL DEFAULT 'PENDING',
  "emailedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "HotelInquiry_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "HotelInquiry_reference_key" ON "HotelInquiry"("reference");
CREATE UNIQUE INDEX "HotelInquiry_trackingTokenHash_key" ON "HotelInquiry"("trackingTokenHash");
CREATE INDEX "HotelInquiry_userId_createdAt_idx" ON "HotelInquiry"("userId","createdAt");
CREATE INDEX "HotelInquiry_status_createdAt_idx" ON "HotelInquiry"("status","createdAt");
CREATE INDEX "HotelInquiry_phone_createdAt_idx" ON "HotelInquiry"("phone","createdAt");

CREATE TABLE "HotelOffer" (
  "id" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "destination" TEXT,
  "hotelName" TEXT,
  "description" TEXT,
  "amountSar" DECIMAL(12,2),
  "priceUnit" TEXT,
  "bannerUrl" TEXT,
  "isVisible" BOOLEAN NOT NULL DEFAULT false,
  "startsAt" TIMESTAMP(3),
  "endsAt" TIMESTAMP(3),
  "deletedAt" TIMESTAMP(3),
  "sortOrder" INTEGER NOT NULL DEFAULT 0,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "HotelOffer_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "HotelOffer_isVisible_startsAt_endsAt_idx" ON "HotelOffer"("isVisible","startsAt","endsAt");

-- Hotel staff workflow history is additive and must not be deleted on request archival.
CREATE TABLE "HotelInquiryEvent" (
  "id" TEXT NOT NULL,
  "requestId" TEXT NOT NULL,
  "actorId" TEXT,
  "actorName" TEXT NOT NULL,
  "action" TEXT NOT NULL,
  "fromStatus" TEXT,
  "toStatus" TEXT,
  "details" JSONB,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "HotelInquiryEvent_pkey" PRIMARY KEY ("id")
);
ALTER TABLE "HotelInquiryEvent" ADD CONSTRAINT "HotelInquiryEvent_requestId_fkey"
  FOREIGN KEY ("requestId") REFERENCES "HotelInquiry"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
CREATE INDEX "HotelInquiryEvent_requestId_createdAt_idx" ON "HotelInquiryEvent"("requestId","createdAt");
