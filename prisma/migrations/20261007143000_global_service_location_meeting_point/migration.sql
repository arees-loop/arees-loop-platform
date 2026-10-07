ALTER TABLE "Service"
ADD COLUMN "country" TEXT,
ADD COLUMN "countryCode" TEXT,
ADD COLUMN "meetingPointName" TEXT,
ADD COLUMN "meetingPointAddress" TEXT,
ADD COLUMN "meetingLatitude" DECIMAL(10,7),
ADD COLUMN "meetingLongitude" DECIMAL(10,7);
