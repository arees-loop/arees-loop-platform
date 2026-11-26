# Neoleap hosted-payment integration — implementation gate

Status: **PREPARATION ONLY / NOT ENABLED** (2026-11-05).

## Verified merchant flow

- Bank hosted session creation uses the supplied test endpoint ending in `/pg/payment/hosted.htm`.
- Transaction inquiry uses the supplied test endpoint ending in `/pg/payment/tranportal.htm`.
- Session creation uses action `1`; inquiry uses action `8` with `udf5=PaymentID` and the gateway payment ID in `transId`.
- Requests and inquiry responses use AES-CBC `trandata` encryption with the merchant resource key.
- The bank notification endpoint must acknowledge a valid notification with status `1` and a final result URL. This acknowledgment is not proof of settlement.
- Only an authenticated server-side inquiry with matching payment ID, amount, currency, track ID, and successful authorization may mark an attempt paid.

## Required Preview configuration

- `NEOLEAP_MODE=sandbox` and `NEOLEAP_ENABLED=true` must be set for the exact feature Preview branch only. Production must remain disabled.
- Use the sandbox portal ID, Tranportal password, and resource key from the bank's secure onboarding material. Never commit them.
- Set `NEOLEAP_API_BASE_URL` to the hosted `.htm` endpoint and `NEOLEAP_INQUIRY_URL` to the tranportal `.htm` endpoint.
- Set `FIXIE_URL` to an authenticated Fixie proxy URL. Payment requests fail closed without the approved static egress proxy.
- Set `NEOLEAP_CALLBACK_ORIGIN` to the main application's exact HTTPS Feature Preview origin. It is only the browser return destination.
- Set `NEOLEAP_CALLBACK_URL` to the public callback-only Preview function endpoint. Neoleap must call this endpoint; it must not point to the SSO-protected application.
- Use a database isolated from Production before applying the card-payment migration or running checkout tests.
- Confirm Neoleap completed IP allowlisting before making a real sandbox request.

## Safety gates

- `GET /api/payments/neoleap/readiness` exposes only a boolean availability flag.
- The session route remains unavailable by default and only enables sandbox mode for the named Preview branch.
- Browser redirects and notification callbacks never mark orders paid. Authenticated server-side inquiry is the settlement authority.
- Manual bank-transfer audit records remain separate from card-payment attempts.
- Production payment initiation must remain disabled until Preview database isolation, bank allowlisting, callback reachability, and end-to-end sandbox verification are complete.

## 2026-11-26 sandbox remediation and activation gates

- `NEOLEAP_SANDBOX_BRANCH` optionally selects **one exact feature/fix Preview branch**; the original payment branch remains the default. Neither branch selection nor credentials can enable Production.
- The callback return validates HTTPS, exact path and an allowlisted Preview host or `areestravel-ksa.com`; the main session callback also accepts the stable isolated callback deployment alias.
- Bank receipt upload refuses an order once a card-payment attempt exists, preventing dual payment claims.
- The payment tabs remain switchable while an order is awaiting payment; confirmed or submitted orders remain locked.
- Real Sandbox connection still requires verified merchant test credentials, static outgoing proxy with bank allowlisting, branch-scoped isolated DB and matching callback secret. Do not copy Production customer data.
- Run `npm run test:payments` and a completed Sandbox transaction/reconcile before any production activation. The production gateway remains disabled by code, independently of environment variables, until a separate bank-approved release.
