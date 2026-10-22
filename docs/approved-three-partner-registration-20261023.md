# AREES LOOP — Approved registration flows (2026-10-23)

Status: APPROVED BUSINESS REQUIREMENTS — implementation and security tests PENDING. Do NOT deploy this document as evidence of functional completion.

## Global controls
- No changes to existing applications, documents or partners by migration.
- All paid commercial services and tourist-guide reservations are booked and collected through Arees Loop. Partners cannot disable collection or set commission.
- Commission is assigned according to an approved versioned agreement/admin setting, calculated and enforced server-side for each booking. Record payment, platform fees, refund, settlement, audit entries; do not equate receiving an IBAN with a verified payout.
- Never expose private IBANs or attachments in public pages. Upload documents to private object storage, validate MIME/size and permissions, and persist secure references; **not filenames only**.
- Existing draft and approved accounts need backward-compatible handling. Public launch needs isolated end-to-end tests and explicit production approval.

## 1. Tourist guide
- Short personal account and licensed guide registration: legal name, verified email/phone, city, guide license number, validity and permitted specialty, license evidence.
- Mandatory settlement beneficiary/IBAN evidence and signed terms; no opt-out.
- Tour booking, collection, refunds, commission calculation and settlement all within the platform. Pending review until administrative approval.

## 2. Company / commercial partner
- Account owner: name, verified email and mobile; role is owner/statutory signatory OR delegated representative.
- Company: legal/trading name, commercial registration and unified number where relevant, address and contact information.
- Tourism-license type field has **two display options as directed**: `خدمات السفر والسياحة` or `أخرى` with free text that matches the original license; number, issuing agency, validity. Verify exact official classification before final regulatory validation.
- Select offered service categories, validate license coverage before approval of each regulated service.
- All paid services must collect and settle via Arees Loop, IBAN/beneficiary mandatory, contractual commission fixed by approved agreement.
- All attachments in final review: commercial registration, tourism license, proof of ownership/authority (articles of association OR recent official extract for owner; proof of statutory signatory's power if different), delegation letter for delegated users, additional optional supporting documents with note field. Small, light-grey helper note: `يمكنك إرفاق مستندات إضافية تساعد فريق أريس في مراجعة طلبك، ويُفضّل دمج المستندات المرتبطة في ملف PDF واحد.`
- An individual's ownership alone does not automatically authorize signing; verify authority separately.
- Preserve structured metadata, real uploaded files and application audit trail; approval by super admin.

## 3. Government entity
- Separate genuinely short route. Institution name, account manager's name, verified official email and mobile only; account credentials/access controls as needed.
- Required attachment: **one official authorization letter** appointing account manager; optional additional attachments. Do NOT request commercial registration, foundation contract, tourism license, company bank details or the entire commercial partner wizard.
- Once administratively verified, entity can create/manage events and publish according to explicitly granted publication permissions. Paid events require a separate approved payment arrangement, not a registration-time burden.

## Critical findings in main (2026-10-23)
- `app/partner/onboarding/page.tsx`: `receivesPayments` default false, optional UI toggle, client validation only when enabled; bank and supporting document uploads currently retain filename only.
- `app/api/partner/application/route.ts`: persists `receivesPayments: Boolean(body.receivesPayments)` and unverified IBAN; partner license records accept `documentUrl` but generic registration doesn't submit uploaded content.
- `prisma/schema.prisma`: fields include `receivesPayments`, `iban`, `beneficiaryName`, and `commissionRate`; schema field presence does **not** prove a transaction-level commission enforcement.
- Existing government onboarding branch and other feature branches may hold useful work: reconcile before editing/deploying to prevent lost changes.

## Acceptance gates prior to merge/production
1. Test separate guide, company, and government paths, including mobile and RTL layouts.
2. Test rejection of paid commercial application with disabled collection through direct API tampering.
3. Test required attachments and unauthorized/private file access; ensure actual upload/retention.
4. Test government route with no company data requirements; manager verification and authorization document.
5. Test role permissions and approval workflow; no unapproved publication.
6. Test checkout, commission accounting, cancellation/refund and payout with sandbox providers.
7. Verify database isolation, CI, release branch provenance, backups and production safety before deploy.
