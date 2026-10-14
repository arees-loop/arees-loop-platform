ALTER TABLE "TransportOffer"
  ADD COLUMN "scheduleType" TEXT NOT NULL DEFAULT 'SINGLE',
  ADD COLUMN "scheduleData" JSONB;
