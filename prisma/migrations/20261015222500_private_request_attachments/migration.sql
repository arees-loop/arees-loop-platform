-- A customer or staff document belongs to one request only.
-- Deliberately not applied automatically by builds or previews.
CREATE TABLE "RequestAttachment" (
 "id" TEXT NOT NULL,
 "transportRequestId" TEXT,
 "hotelInquiryId" TEXT,
 "uploaderId" TEXT NOT NULL,
 "uploaderRole" TEXT NOT NULL,
 "originalName" TEXT NOT NULL,
 "blobPath" TEXT NOT NULL,
 "mimeType" TEXT NOT NULL,
 "sizeBytes" INTEGER NOT NULL,
 "note" TEXT,
 "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
 CONSTRAINT "RequestAttachment_pkey" PRIMARY KEY ("id"),
 CONSTRAINT "RequestAttachment_one_request_chk" CHECK (
  ("transportRequestId" IS NOT NULL AND "hotelInquiryId" IS NULL)
  OR ("transportRequestId" IS NULL AND "hotelInquiryId" IS NOT NULL)
 ),
 CONSTRAINT "RequestAttachment_uploader_role_chk" CHECK ("uploaderRole" IN ('STAFF','CUSTOMER')),
 CONSTRAINT "RequestAttachment_size_chk" CHECK ("sizeBytes" BETWEEN 1 AND 8388608)
);
CREATE UNIQUE INDEX "RequestAttachment_blobPath_key" ON "RequestAttachment"("blobPath");
CREATE INDEX "RequestAttachment_transportRequestId_createdAt_idx" ON "RequestAttachment"("transportRequestId","createdAt");
CREATE INDEX "RequestAttachment_hotelInquiryId_createdAt_idx" ON "RequestAttachment"("hotelInquiryId","createdAt");
CREATE INDEX "RequestAttachment_uploaderId_createdAt_idx" ON "RequestAttachment"("uploaderId","createdAt");
ALTER TABLE "RequestAttachment" ADD CONSTRAINT "RequestAttachment_transportRequestId_fkey"
 FOREIGN KEY ("transportRequestId") REFERENCES "TransportRequest"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "RequestAttachment" ADD CONSTRAINT "RequestAttachment_hotelInquiryId_fkey"
 FOREIGN KEY ("hotelInquiryId") REFERENCES "HotelInquiry"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
