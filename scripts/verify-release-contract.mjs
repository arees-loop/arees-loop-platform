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
const customer=file("app/my-requests/page.tsx");
assert(customer.includes("CustomerCartOrderDetail")&&customer.includes('"/api/cart/bank-checkout?history=true"'),"Unified My Requests must continue including partner/cart orders");
// Approved 22 Oct UX: destination selectors must remain compact even with
// hundreds of cities. Existing search above the list filters the offers.
const destinations=file("app/discover/DiscoverClient.tsx");
assert(destinations.includes('id="available-destinations"')&&destinations.includes('<select')&&!destinations.includes("cities.map(x=><button"),"Destinations must be one compact select instead of one button per city");
assert(destinations.includes("const nearbyOnly=locationMode&&!showAllLocations&&!manualSearch")&&destinations.includes("setShowAllLocations(true)")&&destinations.includes("كل المواقع — عرض جميع البرامج"),"All locations must clear proximity scope and display all applicable published programs");
assert(destinations.includes('aria-label="مهام اللوب"')&&destinations.includes("/missions")&&existsSync(resolve(root,"app/missions/page.tsx")),"Loop Missions entry must remain visible in discovery without falsely creating missions");
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
