ALTER TABLE "Service" ADD COLUMN "loyaltyPoints" INTEGER NOT NULL DEFAULT 150;
ALTER TABLE "Service" ADD CONSTRAINT "Service_loyaltyPoints_minimum" CHECK ("loyaltyPoints" >= 150);
