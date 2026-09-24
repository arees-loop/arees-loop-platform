-- CreateEnum
CREATE TYPE "VisitorType" AS ENUM ('CITIZEN', 'RESIDENT', 'VISITOR');

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "visitorType" "VisitorType";
