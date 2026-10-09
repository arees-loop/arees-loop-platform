-- Ensure only one outstanding renewal request exists per license.
-- Partial unique indexes permit historical approved/rejected requests.
CREATE UNIQUE INDEX "LicenseRenewalRequest_one_pending_per_license"
ON "LicenseRenewalRequest" ("licenseId")
WHERE "status" = 'UNDER_REVIEW';

CREATE UNIQUE INDEX "GuideLicenseRenewal_one_pending_per_application"
ON "GuideLicenseRenewal" ("applicationId")
WHERE "status" = 'UNDER_REVIEW';
