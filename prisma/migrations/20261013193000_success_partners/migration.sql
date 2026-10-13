-- Additive schema; preserves all existing AREES LOOP data.
-- This migration must be reviewed and applied separately, never as part of Preview builds.
CREATE TABLE "SuccessPartner" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "logoUrl" TEXT NOT NULL,
    "websiteUrl" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "isVisible" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "SuccessPartner_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "SuccessPartner_isVisible_sortOrder_idx" ON "SuccessPartner"("isVisible", "sortOrder");

-- Start with the four distinct logos currently hard-coded on the homepage.
INSERT INTO "SuccessPartner" ("id", "name", "logoUrl", "sortOrder", "isVisible") VALUES
('seed_success_arees_travel', 'أريس للسفر والسياحة', '/Logo/arees-travel-solutions-logo.png', 0, true),
('seed_success_tarco', 'تاركو للطيران', '/Logo/tarco-aviation-logo.png', 1, true),
('seed_success_badr', 'بدر للطيران', '/Logo/badr-airlines-transparent-v2.png', 2, true),
('seed_success_sudan_airways', 'الخطوط الجوية السودانية', '/Logo/sudan-airways-transparent-v2.png', 3, true);
