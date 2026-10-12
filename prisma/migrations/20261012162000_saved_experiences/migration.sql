-- Add account-linked saved programs without changing existing onboarding interest categories.
CREATE TABLE "SavedExperience" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "serviceId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "SavedExperience_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "SavedExperience_userId_serviceId_key" ON "SavedExperience"("userId", "serviceId");
CREATE INDEX "SavedExperience_userId_createdAt_idx" ON "SavedExperience"("userId", "createdAt");
CREATE INDEX "SavedExperience_serviceId_idx" ON "SavedExperience"("serviceId");
ALTER TABLE "SavedExperience" ADD CONSTRAINT "SavedExperience_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "SavedExperience" ADD CONSTRAINT "SavedExperience_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES "Service"("id") ON DELETE CASCADE ON UPDATE CASCADE;
