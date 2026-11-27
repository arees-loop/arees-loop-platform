import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
const read=path=>readFileSync(path,"utf8");
const gate=read("app/components/AuthenticatedRequestGate.tsx");
const transport=read("app/transport/TransportRequestPage.tsx");
const service=read("app/components/RequestServicePage.tsx");
const license=read("app/components/InternationalLicenseForm.tsx");
const visaDetail=read("app/visas/[id]/page.tsx");
const api=read("app/api/transport/requests/route.ts");
assert.match(gate, /onSubmitCapture=\{onSubmitCapture\}/, "auth must intercept submit, not render");
assert.match(gate, /\{children\}/, "form visible to visitors");
assert.match(gate, /pending\.current.*requestSubmit\(\)/s, "login resumes the filled form");
assert.match(gate, /window\.open|target="_blank"/, "registration must retain original tab");
for (const [name,content] of [["flights/ferries",transport],["visa/license",service],["international license",license]]) {
 assert.match(content, /<AuthenticatedRequestGate><form/,name+" form must render");
 assert.match(content, /AUTH_REQUIRED/,name+" server denial handled");
 assert.doesNotMatch(content, /window\.location\.(?:href|assign)\s*\(?\s*"\/login\?next=/,name+" must not navigate away with user data on submit");
}
assert.doesNotMatch(service, /requireLoginBeforeVisaForm/, "visa request must open without sign-in");
assert.doesNotMatch(visaDetail, /fetch\("\/api\/auth\/me"/, "visa detail button must not gate entry to form");
assert.match(api, /getCurrentSession\(\)/, "server must still require a signed-in account");
assert.match(api, /code:"AUTH_REQUIRED"/, "server must reject unauthenticated submissions");
console.log("Guest forms visible; authentication required only on submission; drafts stay in tab.");
