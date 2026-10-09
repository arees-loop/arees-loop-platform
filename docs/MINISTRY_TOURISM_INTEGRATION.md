# Ministry of Tourism licensing integration — pending approval

Status: **NOT CONNECTED**. Ministry access requests remain pending. This implementation must not be described as official verification.

## Current safe behavior
- Partner onboarding accepts license type, number, issue date, expiry date, and supporting document through the existing administrative review flow.
- The inquiry button is disabled and explicitly marked as awaiting activation.
- `POST /api/integrations/tourism/licensing/inquiry` requires a signed-in session and returns HTTP 503 with `MINISTRY_INTEGRATION_PENDING`, `verified:false`, and `Cache-Control:no-store`.
- No official ministry request is sent, no ministry credentials are configured, and no license validity is modified by this endpoint.

## Before enabling
1. Obtain ministry approval for licensing inquiry **and** verification, with integration credentials issued for the correct environment.
2. Obtain documented authentication/token lifetime, rate limits, license-type identifiers, exact inquiry/verification request schemas, and sample responses including expiry date, legal holder, license status, and commercial registration if available.
3. Implement server-side-only token handling and least-privilege access; do not expose credentials or raw ministry responses to browsers or logs.
4. Match legal holder, commercial registration (when available), license number, and license type; distinguish unavailable data from a confirmed match.
5. Add audit records for each lookup, explicit partner confirmation, admin escalation for discrepancies, and safe refresh rules. Never reactivate an expired license based solely on user input or AI.
6. Test with ministry sandbox credentials and disposable database. Keep Vercel preview deployments disabled until isolated from production migrations.
7. Complete TypeScript, ESLint, production build, and end-to-end tests. Obtain explicit owner approval before merging or deploying.

No assumed API endpoint or field mapping should be activated from screenshots alone.
