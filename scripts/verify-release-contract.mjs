#!/usr/bin/env node
/**
 * AREES LOOP — approved release contract.
 * These checks protect the agreed public navigation, homepage section order,
 * and essential customer/admin order flows against unrelated cherry-picks.
 * To change an approved contract, update this file in a separate reviewed PR.
 */
import {readFileSync,existsSync} from "node:fs";
import {resolve} from "node:path";
import {fileURLToPath} from "node:url";
const root=resolve(fileURLToPath(new URL("..",import.meta.url)));
const productionOnly=process.argv.includes("--production-only");
if(productionOnly&&process.env.VERCEL_ENV!=="production"&&process.env.AREES_ENFORCE_RELEASE_GUARD!=="1"){
 console.log("AREES release contract: skipped outside production (CI runs explicit check).");
 process.exit(0);
}
const file=(p)=>{const target=resolve(root,p);if(!existsSync(target))throw Error("Missing approved file: "+p);return readFileSync(target,"utf8");};
const errors=[];
const assert=(condition,message)=>{if(!condition)errors.push(message);};
const count=(text,needle)=>text.split(needle).length-1;
const header=file("app/components/GlobalHeader.tsx");
const home=file("app/HomeClient.tsx");
const bookingsId='id="travel-bookings"',discoverId='id="discover"';
assert(count(home,bookingsId)===1,"Homepage must have exactly one air-and-sea bookings section");
assert(home.indexOf(bookingsId)<home.indexOf(discoverId)&&home.indexOf(bookingsId)>=0&&home.indexOf(discoverId)>=0,"Air/sea section must precede discover section");
assert(home.includes('href="/flights"')&&home.includes('href="/ferries"'),"Air/sea section must link to BOTH flight and ferry request pages");
assert(count(header,'href="/#travel-bookings"')===2,"Desktop and mobile header must link to the air/sea section");
assert(count(header,'<Link href="/#travel-bookings" onClick={goToAirSea}')===2&&!header.includes('<a href="/#travel-bookings"'),"Home travel bookings navigation must be client-side: no full-page reloads from Discover");
assert(!header.includes('href="/flights"')&&!header.includes('href="/ferries"'),"Header travel services must not re-introduce air/sea items");
for(const href of ["/hotels","/visas","/international-driving-license"]){
 assert(count(header,'href="'+href+'"')>=2,"Desktop and mobile travel services must expose "+href);
}
// Approved public navigation (22 Oct): hide duplicate government registration
// and cruise links from the public header; preserve their underlying routes.
assert(!header.includes('href="/discover?type=cruise"'),"Public tourism dropdown must not show Cruise — still available as a dedicated service elsewhere");
assert(!header.includes('href="/partner/government"'),"Public partner dropdown must not duplicate Government registrations");
for(const link of ["/partner/select-type","/partner/login","/discover?type=domestic","/discover?type=international"]){
 assert(count(header,'href="'+link+'"')>=2,"Keep approved desktop/mobile links: "+link);
}
// Administration, request flows and existing partner registration remain intact.
const adminLayout=file("app/admin/layout.tsx");
for(const required of ['"/admin/partners"','"/admin/bookings"','"/admin/cart-bank-payments"']){
 assert(adminLayout.includes(required),"Super Admin navigation must preserve "+required);
}
assert(existsSync(resolve(root,"app/partner/government/page.tsx")),"Do not delete the existing government registration route");
// Approved international-driving-licence workflow must never fall back
// to the generic visa/service request form.
const licensePage=file("app/international-driving-license/page.tsx");
const licenseForm=file("app/components/InternationalLicenseForm.tsx");
assert(licensePage.includes("InternationalLicenseForm")&&!licensePage.includes('RequestServicePage kind="DRIVING_LICENSE"'),"Licence route must use the dedicated approved form");
for(const field of ["PASSPORT","LOCAL_LICENSE","PORTRAIT","الطول","لون العين","عنوان التوصيل","رابط موقع التوصيل"]){
 assert(licenseForm.includes(field),"Approved licence form missing mandatory field/document "+field);
}
assert(licenseForm.includes("/api/transport/requests")&&licenseForm.includes("/api/customer/request-attachments"),"Licence requests and documents must use available production APIs");
assert(!licenseForm.includes("/api/license-cart-application")&&!licenseForm.includes("/api/license-documents"),"Licence form may not depend on absent legacy endpoints");
assert(header.includes("goToAirSea")&&home.includes('window.location.hash!=="#travel-bookings"'),"Air/sea navigation must actually scroll for both client and direct visits");
// Event-ticket commerce stays separate from government/non-profit public events.
// No unapproved provider checkout, inventory or payment is activated.
assert(count(header,'href="/event-tickets"')===2,"Event ticket link must appear on desktop and mobile headers");
const ticketPage=file("app/event-tickets/page.tsx");
assert(ticketPage.includes("تذاكر الفعاليات")&&ticketPage.includes("قريباً")&&ticketPage.includes("لم يُفتح الحجز أو الدفع بعد"),"Event ticket teaser must clearly communicate that booking/payment are not active");
assert(ticketPage.includes('robots:{index:false,follow:true}')&&!ticketPage.includes("/api/tickets/purchase"),"Pre-integration ticket page must not imply authorized inventory or live checkout");
const govEvents=file("app/events/page.tsx");
assert(govEvents.includes("GOVERNMENT_NONPROFIT")&&govEvents.includes("بدون أسعار أو عمليات دفع"),"Preserve separate government event listings and scope");
const customer=file("app/my-requests/page.tsx");
assert(customer.includes("CustomerCartOrderDetail")&&customer.includes('"/api/cart/bank-checkout?history=true"'),"Unified My Requests must continue including partner/cart orders");
// Approved 22 Oct UX: destination selectors must remain compact even with
// hundreds of cities. Existing search above the list filters the offers.
const destinations=file("app/discover/DiscoverClient.tsx");
assert(destinations.includes('id="available-destinations"')&&destinations.includes('<select')&&!destinations.includes("cities.map(x=><button"),"Destinations must be one compact select instead of one button per city");
assert(destinations.includes("const nearbyOnly=locationMode&&!showAllLocations&&!manualSearch")&&destinations.includes("setShowAllLocations(true)")&&destinations.includes("const all=()=>")&&destinations.includes("كل المواقع — جميع البرامج"),"All locations must clear proximity scope and display all applicable published programs");
assert(destinations.includes('aria-label="مهام اللوب (معاينة غير مفعلة)"')&&destinations.includes("/missions")&&existsSync(resolve(root,"app/missions/page.tsx")),"Loop Missions entry must remain visible in discovery without falsely creating missions");
// Preserve compact discovery and GPS city fallback; do not require every
// published city service to have working coordinates in order to appear.
assert(destinations.includes('aria-label="بحث الوجهات والمهام"')&&destinations.includes("const nearbyCity=")&&destinations.includes("cityKey(s.city)===cityKey(nearbyCity)"),"Compact discovery must retain confirmed-city fallback alongside GPS proximity");
assert(!destinations.includes("سلة الوجهات")&&!destinations.includes('label htmlFor="next-destination" className="mb-2 block'),"Discovery must not regress to oversized multi-panel filters");
assert(destinations.includes("setLoadError")&&destinations.includes("إعادة المحاولة"),"Discovery must distinguish API load errors from an empty published catalog");
const geolocation=file("lib/location.ts");
assert(geolocation.includes("export function getBrowserCoordinates"),"Location coordinates must be available independently of reverse geocoding");
assert(home.includes("getBrowserCoordinates({enableHighAccuracy:true")&&home.includes("void reverseGeocode(lat,lng).then")&&home.includes("setShowLocationNotice(true)"),"Show city notice on reliable GPS without waiting for the address");
assert(home.includes('near=')&&home.includes("encodeURIComponent(detectedLocationScene.nameAr)"),"Home must pass its trusted detected city to Discover");
const missions=file("app/missions/page.tsx");
assert(missions.includes("مهام تجريبية للعرض فقط")&&!missions.includes("claimMissionReward(")&&!missions.includes("onClick={onClaim}"),"Demo missions must never create client-only reward claims");
const serviceDetail=file("app/services/[id]/page.tsx");
assert(!destinations.includes("s.loyaltyPoints||150")&&!serviceDetail.includes("service.loyaltyPoints || 150"),"Do not invent a 150-point earning amount when the service has no configured points");
// Branded service loyalty offer is an approved customer-facing contract:
 // one point per whole riyal of the currently displayed final price.
const pointsFormula=file("lib/service-loyalty-points.ts");
const pointsBanner=file("app/components/ServiceLoyaltyBanner.tsx");
assert(pointsFormula.includes("Math.floor(Math.round(finalPrice * 100) / 100)")&&pointsBanner.includes("احجز واحصل على")&&pointsBanner.includes("نقطة أريس لوب")&&pointsBanner.includes('/Logo/arees-loop-logo.png'),"Always show automatic service-price points with official logo and approved Arabic earning copy");
assert(count(home,"<ServiceLoyaltyBanner finalPrice={service.finalPrice}")===1&&count(destinations,"<ServiceLoyaltyBanner finalPrice={s.finalPrice}")===1&&count(serviceDetail,"<ServiceLoyaltyBanner finalPrice={service.finalPrice}")===1,"Approved earning banner must appear at full width in Home, Discover and details; never replace with tiny price-adjacent text");
assert(!home.includes("نقاط الخدمة:")&&!destinations.includes("نقاط الخدمة:")&&!serviceDetail.includes("نقاط الخدمة:"),"Do not regress the previously approved full earning call-to-action");
const savedButton=file("app/components/SaveExperienceButton.tsx");
assert(savedButton.includes("<svg viewBox=")&&!savedButton.includes('saved ? "♥" : "♡"'),"Favorite hearts must use consistent outlined/gold SVG rather than black font/emoji glyphs");
const serviceApi=file("app/api/services/route.ts");
const partnerCreate=file("app/api/partner/services/route.ts");
const partnerUpdate=file("app/api/partner/services/[id]/route.ts");
const reconcile=file("app/api/admin/services/loyalty-reconcile/route.ts");
assert(serviceApi.includes("loyaltyPoints: pointsFromServicePrice(Number(service.finalPrice))")&&serviceApi.includes("loyaltyPoints: pointsFromServicePrice(finalPrice)"),"Published and newly created service points must follow the visible final price");
assert(partnerCreate.includes("pointsFromServicePrice(finalPrice)")&&partnerUpdate.includes("pointsFromServicePrice(finalPrice)")&&reconcile.includes("pointsFromServicePrice(Number(s.finalPrice))"),"Partner writes and optional existing-service reconciliation must follow one price-points rule");

const sealCss=file("app/globals.css");
assert(sealCss.includes("transform: scale(.72) !important;")&&sealCss.includes("z-index: 20 !important;")&&!sealCss.includes(".sbc-verify-seal { display: none !important; }"),"Official Saudi Business seal must remain floating, smaller and below account controls on mobile");
const layout=file("app/layout.tsx"), verification=file("app/components/SaudiBusinessVerification.tsx");
assert(layout.includes("<SaudiBusinessVerification />")&&!layout.includes("EAuthSealApi/seal.js"),"Root layout must delegate the verification widget to the responsive controller");
assert(verification.includes("EAuthSealApi/seal.js")&&verification.includes("sbc-verify-seal")&&!verification.includes("{desktop&&"),"Restore the authentic official floating verification seal for all viewports without replacing its artwork");
const savedHearts=file("app/components/SaveExperienceButton.tsx");
assert(savedHearts.includes("pendingSavedRead")&&savedHearts.includes("function fetchSavedIds()")&&savedHearts.includes("if (!available)"),"Save buttons must deduplicate their reads and retry transient failures instead of permanently disabling");
const prismaClient=file("lib/prisma.ts");
assert(prismaClient.includes("globalForPrisma.prisma = prisma;")&&prismaClient.includes("max: 1,"),"Warm production instances must share the Prisma Client and cap database pool connections");
assert(home.includes("inDetectedCity")&&home.includes("servicesLoadError")&&home.includes("service.distance===null"),"Nearby discovery must retain same-city offers even with missing coordinates and show truthful error/distance states");
assert(!home.includes("service.loyaltyPoints || 150"),"Homepage must not invent loyalty points for unconfigured services");
const splash=file("app/components/InitialSplash.tsx");
assert(splash.includes("window.sessionStorage.setItem(SPLASH_SEEN_KEY")&&splash.includes('pathname === "/" && !seen')&&splash.includes('if (!visible || pathname !== "/"'),"Initial splash should appear once on first home entry, not during internal navigation");
assert(destinations.includes('h-[48px]')&&destinations.includes("w-[106px]")&&!destinations.includes('onClick={all} className="h-10 shrink-0"'),"Mobile discover filters must stay within a compact one-row 48px toolbar");
assert(home.includes("selectedSceneDiscoverHref")&&count(home,"href={selectedSceneDiscoverHref}")===3,"Homepage Discover CTAs must preserve selected destination instead of resetting to all");

const notifications=file("app/notifications/page.tsx");
assert(!notifications.includes("cartAlerts")&&!notifications.includes("/api/cart/bank-checkout?history=true"),"Customer cart document requests must not duplicate in standalone Notifications");
assert(customer.includes("arees-cart-order-updated"),"My Requests must refresh when a cart attachment is uploaded");
const cartDetails=file("app/components/CustomerCartOrderDetail.tsx");
assert(cartDetails.includes('dispatchEvent(new Event("arees-cart-order-updated"))')&&cartDetails.includes('DOCUMENTS_SUBMITTED'),"Successful customer attachment upload must clear red attention by refreshing the order status");
const dashboard=file("app/admin/dashboard/page.tsx");
assert(dashboard.includes("إجمالي الخدمات والتجارب")&&dashboard.includes("servicesLoaded?services.length"),"Super Admin must show total services and experiences from the live service list");
const admin=file("app/admin/cart-bank-payments/page.tsx");
assert(admin.includes("/api/admin/cart-bank-payments")&&admin.includes("طلبات السلة"),"Admin cart orders management must remain available");
const invoice=file("app/cart/documents/[type]/page.tsx");
assert(invoice.includes("arees-integrated-solutions-logo.png"),"Company invoice logo must remain in invoice");
assert(invoice.includes('lang="en" className="text-left"'),"Bilingual invoice must keep English company details on the left");
for(const p of ["app/flights/page.tsx","app/ferries/page.tsx","app/api/cart/order-workflow/route.ts","app/api/cart/bank-checkout/route.ts"]){assert(existsSync(resolve(root,p)),"Existing booking API/page must not disappear: "+p);}
if(errors.length){console.error("AREES RELEASE CONTRACT FAILED\n"+errors.map((e,i)=>(i+1)+". "+e).join("\n"));process.exit(1);}
console.log("AREES release contract: approved nav, home and booking flows verified.");
