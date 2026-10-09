-- Add optional region/administrative area to services.
ALTER TABLE "Service" ADD COLUMN "region" TEXT;
