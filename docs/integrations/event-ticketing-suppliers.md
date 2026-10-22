# AREES LOOP — Event tickets supplier integration decision (22 Oct 2026)

## Approved scope
- New independent public route: `/event-tickets`, linked in desktop and mobile public header.
- Never replace `/events`: it is the existing government/non-profit event catalogue without payment.
- Until a signed distribution/affiliate agreement and confirmed inventory exist, no ticket prices, seat availability, tickets, customer checkout, or earned commissions may be claimed.
- Do not alter existing cart, payment, booking, admin permissions, partner onboarding or production data merely to introduce the events page.
- Page stays `noindex` while there is no commercial inventory.

## Verified partnership discovery (supplier sites)
| Supplier | Official pathway | Confirmed business model | Integration caveat |
|---|---|---|---|
| webook.com | https://webook.com/business/ar/solutions/affiliate-program | Affiliate tracked links, sale and payment on webook, commission on referral orders; access selective | A separate distribution partner ecosystem exists but API eligibility, KSA inventory rights, commercial terms need written agreement: https://webook.com/business/en/technology/distribution-partner-ecosystem |
| Platinumlist | https://platinumlist.net/for-organisers/ar/affiliate-program/ | Affiliate payout up to 10%, 60-day attribution; terms vary | Organizer API documentation must not be mistaken for reseller/checkout API access |
| Fever Distributors | https://business.feverup.com/en/partner-programs/experience-distribution-platform/ | Wholesale/reseller margin; supplier checkout option or direct resale; offers transactional API | Confirm which Saudi events are actually in contracted sellable catalogue, settlement, support, cancellations |
| GlobalTix | https://globaltix.com/resellers/ | B2B commission/resale and API | https://apiconnect.globaltix.com/ covers availability, reserve, confirm, ticket retrieval; verify Saudi live-event coverage |
| Ticketmaster Affiliate | https://developer.ticketmaster.com/partners/distribution-partners/affiliate-sign-up/ | Affiliate program explicitly lists Saudi Arabia | Approved markets and rates vary under local contracts; do not infer access to Partner API from affiliate acceptance |

## Go-live gating
1. Written confirmation of approved reseller/referral agreement, licensing responsibilities and events permitted for resale in KSA, plus official assets/content-use rights.
2. Sample Saudi inventory and supplier IDs, inventory freshness, ticket rules, seat maps, taxes, cancellation/refund, payout timing, chargebacks, commission/margins.
3. Confirm which checkout model applies: external provider checkout + affiliate redirect attribution, **or** API reservation / payment / fulfillment inside Arees Loop.
4. For API mode: require sandbox, idempotent reservation + booking, server-side payment verification, webhook authentication, private QR/PDF delivery, protected customer booking links, cancel/refund handling, vendor-specific reconciliation.
5. No cross-provider dedupe based on name/date alone; avoid inventing live availability or prices.
6. Production staging/DB isolation verified; no Preview real payment/SMS; explicit production deployment approval and automated regression checks.
7. Verify that company ticket-selling license scope and authority's applicable vendor/reporting technical terms cover the intended resale arrangement.

## Initial commercial recommendation
- Saudi event demand: approach webook affiliate/distribution first, then Platinumlist affiliate.
- For customers who must book end-to-end in Arees Loop: evaluate Fever Distributors' transactional integration and GlobalTix; request catalog-specific Saudi samples before engineering.
- Do not specify a commission rate other than Platinumlist's advertised `up to 10%`, and do not treat it as AREES's approved rate.

This decision is an integration research record, not approval to collect ticket payments or deploy the page.
