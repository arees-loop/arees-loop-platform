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
- Set `NEOLEAP_CALLBACK_ORIGIN` to the exact HTTPS origin of the accessible Preview deployment.
- Use a database isolated from Production before applying the card-payment migration or running checkout tests.
- Confirm Neoleap completed IP allowlisting before making a real sandbox request.

## Safety gates

- `GET /api/payments/neoleap/readiness` exposes only a boolean availability flag.
- The session route remains unavailable by default and only enables sandbox mode for the named Preview branch.
- Browser redirects and notification callbacks never mark orders paid. Authenticated server-side inquiry is the settlement authority.
- Manual bank-transfer audit records remain separate from card-payment attempts.
- Production payment initiation must remain disabled until Preview database isolation, bank allowlisting, callback reachability, and end-to-end sandbox verification are complete.
