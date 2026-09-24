-- CreateEnum
CREATE TYPE "InterestCode" AS ENUM ('HERITAGE', 'ADVENTURE', 'FOOD', 'EVENTS', 'SHOPPING', 'GUIDES', 'STAYS', 'NATURE', 'FAMILY', 'SPORTS', 'TECHNOLOGY', 'SEASONAL');

-- CreateTable
CREATE TABLE "UserInterest" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "code" "InterestCode" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UserInterest_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "UserInterest_userId_idx" ON "UserInterest"("userId");

-- CreateIndex
CREATE INDEX "UserInterest_code_idx" ON "UserInterest"("code");

-- CreateIndex
CREATE UNIQUE INDEX "UserInterest_userId_code_key" ON "UserInterest"("userId", "code");

-- AddForeignKey
ALTER TABLE "UserInterest" ADD CONSTRAINT "UserInterest_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
