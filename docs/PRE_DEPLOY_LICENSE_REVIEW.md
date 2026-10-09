# AREES Loop — Pre-deployment review (2026-10-09)

This is a review checklist, **not** a test execution report. No production deployment or database migration is authorized by this file.

## Verified by source inspection
- Public service listing gates on published service, active partner, verified and date-valid license.
- Admin service approval now checks partner/license and review status.
- Partner service creation and publication require a verified, date-valid license.
- Guide public directory gates on approved guide and valid expiry.
- License renewals for partner/guide require admin review before changing expiry.
- Cron job is protected by CRON_SECRET and scheduled daily at 04:00 UTC.
- Customer bookings endpoint currently only reads existing bookings; no booking creation/payment route was found in the inspected API tree.

## Release blockers / risks
1. Run Prisma validate, generate, migration diff, TypeScript check, lint and production build against a safe nonproduction database.
2. Confirm existing migration chain applies cleanly, especially GuideApplication, LicenseRenewalRequest, LicenseAlert, GuideLicenseRenewal and GuideLicenseAlert.
3. Check admin permission model: renewal APIs currently use ADMIN/SUPER_ADMIN roles, whereas navigation uses granular permissions.
4. Check partner legacy permissions: canManagePartnerServices grants LEGACY access. Decide whether license renewal requires verified OWNER or explicit delegation.
5. Add automated tests for license expires today, expired yesterday, pending/rejected/suspended license, inactive partner, service approval and renewal rejection.
6. Cron scans at most 1000 partner licenses and 1000 guides per run and performs sequential upserts. Implement pagination/batching before scale and validate function timeout limits.
7. Cron stores in-app alerts only; no proactive email/SMS expiry reminders are implemented by this cron.
8. Service status remains PUBLISHED in database on expiry; public listing hides it dynamically. Verify all future detail, checkout and payment routes reuse the same predicate inside their booking transaction.
9. Check blob document authorization, retention, upload failure cleanup and renewal submission race conditions.
10. Confirm Vercel Hobby cron quota/availability and configure CRON_SECRET, database and blob/email secrets in the correct environment.
11. Do not run prisma migrate deploy against production until backup, migration review and explicit owner approval.
12. Test that new admin and guide renewal links are accessible to authorized users and hidden from unauthorized users.

## Deployment hold
Do not merge tracked branch or deploy Vercel until checks are complete, the owner receives the change summary, and the owner explicitly approves.
