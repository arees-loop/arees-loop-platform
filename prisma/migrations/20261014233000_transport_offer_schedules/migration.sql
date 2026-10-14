ALTER TABLE "TransportOffer"
  ADD COLUMN "scheduleType" TEXT NOT NULL DEFAULT 'SINGLE',
  ADD COLUMN "scheduleData" JSONB,
  ADD COLUMN "adultPriceSar" DECIMAL(12,2),
  ADD COLUMN "childPriceSar" DECIMAL(12,2),
  ADD COLUMN "infantPriceSar" DECIMAL(12,2);
