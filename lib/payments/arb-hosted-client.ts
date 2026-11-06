import * as http from "node:http";
import { encryptTrandata, decryptTrandata } from "./arb-crypto";
export type BankCredentials = { portalId: string; password: string; resourceKey: string; endpoint: string };
export type BankOrder = { amountMinor: number; trackId: string; responseURL: string; errorURL: string };
const HOSTS = new Set(["securepayments.neoleap.com.sa"]);
const HOSTED_ENDPOINT_PATH = "/pg/payment/hosted.htm";
const TRANPORTAL_ENDPOINT_PATH = "/pg/payment/tranportal.htm";
let configuredProxyUrl = "";
function configureFixieProxy() {
  const value = process.env.FIXIE_URL?.trim();
  if (!value) throw Error("MISSING_STATIC_EGRESS_PROXY");
  const proxy = new URL(value);
  // Fixie issues HTTP proxy URLs; HTTPS bank traffic is still tunneled with CONNECT.
  // Keep the proxy host constrained so a misconfigured value cannot redirect bank traffic.
  if (!(["http:","https:"].includes(proxy.protocol)) || !proxy.hostname.endsWith(".usefixie.com") ||
      (proxy.protocol === "http:" && proxy.port && proxy.port !== "80") ||
      (proxy.protocol === "https:" && proxy.port && proxy.port !== "443") ||
      !proxy.username || !proxy.password || (proxy.pathname !== "/" && proxy.pathname !== "") || proxy.hash || proxy.search) {
    throw Error("INVALID_STATIC_EGRESS_PROXY");
  }
  if (configuredProxyUrl === value) return;
  const setProxy = (http as typeof http & {setGlobalProxyFromEnv?: (env: Record<string,string>) => () => void}).setGlobalProxyFromEnv;
  if (typeof setProxy !== "function") throw Error("STATIC_EGRESS_PROXY_UNAVAILABLE");
  setProxy({HTTPS_PROXY:value,NO_PROXY:""});
  configuredProxyUrl = value;
}
function safeEndpoint(value: string, expectedPath: string): URL {
  const url = new URL(value);
  if (url.protocol !== "https:" || !HOSTS.has(url.hostname) || url.pathname !== expectedPath || url.port || url.username || url.password || url.search || url.hash) throw Error("UNAPPROVED_BANK_ENDPOINT");
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
async function request(c: BankCredentials, payload: Record<string, string>, callback?: {responseURL:string;errorURL:string}, endpointPath=HOSTED_ENDPOINT_PATH) {
  if (!c.portalId || !c.password) throw Error("MISSING_BANK_CREDENTIALS");
  const body = [{id:c.portalId,trandata:encryptTrandata([payload],c.resourceKey),...callback}];
  const target = safeEndpoint(c.endpoint, endpointPath);
  configureFixieProxy();
  const response = await fetch(target, {
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
  if (!/^\d+$/.test(paymentId) || page.protocol !== "https:" || !HOSTS.has(page.hostname) || page.pathname !== "/pg/paymentpage.htm" || page.port || page.username || page.password || page.hash) throw Error("INVALID_PAYMENT_PAGE");
  page.searchParams.set("PaymentID",paymentId);
  return {paymentId,checkoutUrl:page.toString()};
}
export async function inquireHostedPayment(c: BankCredentials, o: {amountMinor:number;trackId:string;paymentId:string}) {
  validOrder({...o,responseURL:"https://www.areesloop.com/",errorURL:"https://www.areesloop.com/"});
  if (!/^\d+$/.test(o.paymentId)) throw Error("INVALID_PAYMENT_ID");
  const payload = {amt:(o.amountMinor/100).toFixed(2),action:"8",password:c.password,id:c.portalId,
    currencyCode:"682",trackId:o.trackId,udf5:"PaymentID",transId:o.paymentId};
  const response = await request(c,payload,undefined,TRANPORTAL_ENDPOINT_PATH);
  if (String(response.status) !== "1" || typeof response.trandata !== "string") throw Error("BANK_INQUIRY_NOT_VERIFIED");
  return record(decryptTrandata(response.trandata,c.resourceKey));
}
export function decodeBankCallback(encrypted: string, resourceKey: string) {
  return record(decryptTrandata(encrypted,resourceKey));
}
