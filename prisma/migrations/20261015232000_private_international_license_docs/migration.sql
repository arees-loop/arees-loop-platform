-- Unapplied until isolated database and private Blob storage pass acceptance tests.
CREATE TABLE "InternationalLicenseDocument" (
 "id" TEXT NOT NULL,
 "userId" TEXT NOT NULL,
 "slot" TEXT NOT NULL,
 "blobPath" TEXT NOT NULL,
 "mimeType" TEXT NOT NULL,
 "byteSize" INTEGER NOT NULL,
 "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
 CONSTRAINT "InternationalLicenseDocument_pkey" PRIMARY KEY ("id"),
 CONSTRAINT "InternationalLicenseDocument_slot_check" CHECK ("slot" IN ('PASSPORT','LOCAL_LICENSE','PORTRAIT')),
 CONSTRAINT "InternationalLicenseDocument_mime_check" CHECK ("mimeType" IN ('image/jpeg','image/png')),
 CONSTRAINT "InternationalLicenseDocument_size_check" CHECK ("byteSize" BETWEEN 100 AND 4194304)
);
CREATE UNIQUE INDEX "InternationalLicenseDocument_blobPath_key" ON "InternationalLicenseDocument"("blobPath");
CREATE INDEX "InternationalLicenseDocument_userId_slot_createdAt_idx" ON "InternationalLicenseDocument"("userId","slot","createdAt");
ALTER TABLE "InternationalLicenseDocument" ADD CONSTRAINT "InternationalLicenseDocument_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
