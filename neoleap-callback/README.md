# Neoleap callback bridge

This isolated project contains only the public gateway notification endpoint. It has no database, customer pages, or administrative routes. It validates the encrypted notification and acknowledges delivery only; the main application must confirm settlement with an authenticated Neoleap inquiry.

Deploy only from `feature/neoleap-payment-release-base-20261105` as a Vercel Preview. Keep `NEOLEAP_RESOURCE_KEY` as a Sensitive Preview variable scoped to that branch. `NEOLEAP_FINAL_RETURN_URL` is a non-secret branch-scoped Preview variable pointing at the main Preview's stable branch alias and return endpoint.

Run the isolated Mock suite with `npm test`. Do not send real charges through this endpoint.
