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
assert(count(header,'href="/discover?type=cruise"')>=2,"Cruise must remain accessible in desktop/mobile tourist programs");
assert(header.includes('href="/partner/government"'),"Do not silently remove government partner registration");
const customer=file("app/my-requests/page.tsx");
assert(customer.includes("CustomerCartOrderDetail")&&customer.includes('"/api/cart/bank-checkout?history=true"'),"Unified My Requests must continue including partner/cart orders");
const admin=file("app/admin/cart-bank-payments/page.tsx");
assert(admin.includes("/api/admin/cart-bank-payments")&&admin.includes("طلبات السلة"),"Admin cart orders management must remain available");
const invoice=file("app/cart/documents/[type]/page.tsx");
assert(invoice.includes("arees-integrated-solutions-logo.png"),"Company invoice logo must remain in invoice");
assert(invoice.includes('lang="en" className="text-left"'),"Bilingual invoice must keep English company details on the left");
for(const p of ["app/flights/page.tsx","app/ferries/page.tsx","app/api/cart/order-workflow/route.ts","app/api/cart/bank-checkout/route.ts"]){assert(existsSync(resolve(root,p)),"Existing booking API/page must not disappear: "+p);}
if(errors.length){console.error("AREES RELEASE CONTRACT FAILED\n"+errors.map((e,i)=>(i+1)+". "+e).join("\n"));process.exit(1);}
console.log("AREES release contract: approved nav, home and booking flows verified.");
