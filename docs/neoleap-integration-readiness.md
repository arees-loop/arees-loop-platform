# Neoleap hosted-payment integration — implementation gate

Status: **PREPARATION ONLY / NOT ENABLED** (2026-11-05).

## Existing Arees Loop flow
- The release branch has `/api/cart/bank-checkout`, which calculates cart totals server-side and persists manual bank-transfer orders as audit-log events.
- `CartBankCheckout` displays electronic card payments as **coming soon**.
- A manual bank-transfer receipt or admin verification must not be treated as Neoleap settlement.
- Do not mutate existing transfer records or conflate them with card-payment attempts.

## Required before implementing the payment session
1. Confirm that the supplied Al Rajhi REST API guide (v1.31) applies to this specific Neoleap merchant integration, including the precise API base URL and authentication/signature scheme.
2. Confirm sandbox merchant credentials and approved callback/return URLs through the bank's secure onboarding channel. Do not commit credentials.
3. Confirm hosted payment session creation request/response fields, status inquiry, webhook signature verification, and transaction-reference uniqueness.
4. Verify Preview database isolation before any schema migration. The existing `vercel-build` script runs `prisma migrate deploy`; do not deploy this branch without confirming the target DB.
5. Add a durable payment-attempt table with unique provider reference, immutable server-calculated amount/currency and idempotency key, then implement reconciliation.
6. Only a bank-verified successful transaction with matching merchant, amount, currency, and order reference may transition an order to paid. Redirect parameters alone are not proof of payment.
7. Test failures, duplicate callbacks, retries, stale orders, refund path, and simultaneous checkout requests before requesting production enablement.

## Configuration contract (names are provisional until bank guide is validated)
- `NEOLEAP_MODE=disabled` (default)
- `NEOLEAP_ENABLED=false` (default)
- `NEOLEAP_MERCHANT_ID`
- `NEOLEAP_API_BASE_URL`
- `NEOLEAP_API_CREDENTIAL`

The readiness endpoint `GET /api/payments/neoleap/readiness` returns only a boolean sandbox availability flag. It **does not** initiate a charge or assert that bank connectivity has been tested.

Production payment initiation must remain disabled until the merchant API contract is verified and the end-to-end test suite passes.
