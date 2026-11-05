import { encryptTrandata, decryptTrandata } from "./arb-crypto";
export type BankCredentials = { portalId: string; password: string; resourceKey: string; endpoint: string };
export type BankOrder = { amountMinor: number; trackId: string; responseURL: string; errorURL: string };
const HOSTS = new Set(["securepayments.neoleap.com.sa"]);
const ENDPOINT_PATHS = new Set(["/pg/payment/hosted.html", "/pg/payment/tranportal.html"]);
function safeEndpoint(value: string): URL {
  const url = new URL(value);
  if (url.protocol !== "https:" || !HOSTS.has(url.hostname) || !ENDPOINT_PATHS.has(url.pathname) || url.port || url.username || url.password || url.search || url.hash) throw Error("UNAPPROVED_BANK_ENDPOINT");
  return url;
}
function validOrder(o: BankOrder) {
  if (!Number.isSafeInteger(o.amountMinor) || o.amountMinor <= 0 || o.amountMinor > 10000000) throw Error("INVALID_AMOUNT");
  if (!/^\d{1,30}$/.test(o.trackId)) throw Error("INVALID_TRACK_ID");
  for (const value of [o.responseURL, o.errorURL]) if (new URL(value).protocol !== "https:") throw Error("INVALID_CALLBACK");
}
function record(raw: unknown): Record<string, unknown> {
  const obj = Array.isArray(raw) ? raw[0] : raw;
  if (!obj || typeof obj !== "object" || Array.isArray(obj)) throw Error("INVALID_BANK_RESPONSE");
  return obj as Record<string, unknown>;
}
async function request(c: BankCredentials, payload: Record<string, string>, callback?: {responseURL:string;errorURL:string}) {
  if (!c.portalId || !c.password) throw Error("MISSING_BANK_CREDENTIALS");
  const body = [{id:c.portalId,trandata:encryptTrandata([payload],c.resourceKey),...callback}];
  const response = await fetch(safeEndpoint(c.endpoint), {
    method:"POST",headers:{"Content-Type":"application/json",Accept:"application/json"},
    body:JSON.stringify(body),redirect:"error",cache:"no-store",signal:AbortSignal.timeout(15000),
  });
  if (!response.ok) throw Error("BANK_HTTP_ERROR");
  const raw = await response.text();
  if (raw.length > 65536) throw Error("BANK_RESPONSE_TOO_LARGE");
  return record(JSON.parse(raw));
}
export async function createHostedPayment(c: BankCredentials, o: BankOrder) {
  validOrder(o);
  const payload = {amt:(o.amountMinor/100).toFixed(2),action:"1",password:c.password,id:c.portalId,
    currencyCode:"682",trackId:o.trackId,responseURL:o.responseURL,errorURL:o.errorURL,langid:"ar"};
  const response = await request(c,payload,{responseURL:o.responseURL,errorURL:o.errorURL});
  if (String(response.status) !== "1" || typeof response.result !== "string") throw Error("BANK_TOKEN_REJECTED");
  const split = response.result.indexOf(":https://");
  if (split < 1) throw Error("INVALID_BANK_TOKEN");
  const paymentId = response.result.slice(0,split);
  const page = new URL(response.result.slice(split+1));
  if (!/^\d+$/.test(paymentId) || page.protocol !== "https:" || !HOSTS.has(page.hostname)) throw Error("INVALID_PAYMENT_PAGE");
  page.searchParams.set("PaymentID",paymentId);
  return {paymentId,checkoutUrl:page.toString()};
}
export async function inquireHostedPayment(c: BankCredentials, o: {amountMinor:number;trackId:string;paymentId:string}) {
  validOrder({...o,responseURL:"https://www.areesloop.com/",errorURL:"https://www.areesloop.com/"});
  if (!/^\d+$/.test(o.paymentId)) throw Error("INVALID_PAYMENT_ID");
  const payload = {amt:(o.amountMinor/100).toFixed(2),action:"8",password:c.password,id:c.portalId,
    currencyCode:"682",trackId:o.trackId,udf5:"PaymentID",transId:o.paymentId};
  const response = await request(c,payload);
  if (String(response.status) !== "1" || typeof response.trandata !== "string") throw Error("BANK_INQUIRY_NOT_VERIFIED");
  return record(decryptTrandata(response.trandata,c.resourceKey));
}
export function decodeBankCallback(encrypted: string, resourceKey: string) {
  return record(decryptTrandata(encrypted,resourceKey));
}
