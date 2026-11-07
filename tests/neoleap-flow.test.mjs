import test from "node:test";
import assert from "node:assert/strict";
import { registerHooks } from "node:module";
registerHooks({resolve(specifier,context,nextResolve){return nextResolve(specifier==="./arb-crypto"?"./arb-crypto.ts":specifier,context);}});
const {createHostedPayment,inquireHostedPayment}=await import("../lib/payments/arb-hosted-client.ts");
const {decryptTrandata,encryptTrandata}=await import("../lib/payments/arb-crypto.ts");
const {isGatewayNotification,paymentCallbackAcknowledgement,paymentReturnUrl}=await import("../lib/payments/neoleap-callback.ts");
process.env.FIXIE_URL="http://fixie:test-token@proxy.usefixie.com:80";
const credentials={portalId:"TESTPORTAL",password:"test-password",resourceKey:"12345678901234567890123456789012",endpoint:"https://securepayments.neoleap.com.sa/pg/payment/hosted.htm"};

test("accepts the documented .htm hosted endpoint and builds the trusted payment page",async()=>{
  const original=globalThis.fetch;
  globalThis.fetch=async(_url,init)=>{
    const body=JSON.parse(String(init?.body));
    assert.equal(body[0].id,credentials.portalId);
    assert.ok(body[0].trandata);
    return new Response(JSON.stringify([{status:"1",result:"12345:https://securepayments.neoleap.com.sa/pg/paymentpage.htm"}]),{status:200});
  };
  try {
    const result=await createHostedPayment(credentials,{amountMinor:1250,trackId:"123456",responseURL:"https://preview.example/api/payments/neoleap/return",errorURL:"https://preview.example/api/payments/neoleap/return"});
    assert.equal(result.paymentId,"12345");
    assert.equal(new URL(result.checkoutUrl).pathname,"/pg/paymentpage.htm");
    assert.equal(new URL(result.checkoutUrl).searchParams.get("PaymentID"),"12345");
  } finally { globalThis.fetch=original; }
});

test("rejects an undocumented .html alias and non-hosted endpoint",async()=>{
  const invalid={...credentials,endpoint:"https://securepayments.neoleap.com.sa/pg/payment/hosted.html"};
  await assert.rejects(()=>createHostedPayment(invalid,{amountMinor:100,trackId:"123",responseURL:"https://preview.example/return",errorURL:"https://preview.example/return"}));
});

test("bank rejection never yields a hosted payment link",async()=>{
  const original=globalThis.fetch;
  globalThis.fetch=async()=>new Response(JSON.stringify([{status:"2",error:"IPAY0100124"}]),{status:200});
  try {
    await assert.rejects(
      ()=>createHostedPayment(credentials,{amountMinor:100,trackId:"123",responseURL:"https://preview.example/return",errorURL:"https://preview.example/return"}),
      error=>error.message==="BANK_TOKEN_REJECTED",
    );
  } finally { globalThis.fetch=original; }
});

test("bank network failure is surfaced without logging or fabricating success",async()=>{
  const original=globalThis.fetch;
  globalThis.fetch=async()=>{throw new Error("simulated network timeout");};
  try {
    await assert.rejects(
      ()=>createHostedPayment(credentials,{amountMinor:100,trackId:"123",responseURL:"https://preview.example/return",errorURL:"https://preview.example/return"}),
      /simulated network timeout/,
    );
  } finally { globalThis.fetch=original; }
});

test("rejects a proxy outside the Fixie domain without exposing its credentials",async()=>{
  const previous=process.env.FIXIE_URL;
  process.env.FIXIE_URL="http://private-user:private-password@proxy.example:8080";
  try {
    await assert.rejects(
      ()=>createHostedPayment(credentials,{amountMinor:100,trackId:"123",responseURL:"https://preview.example/return",errorURL:"https://preview.example/return"}),
      error=>error.message==="INVALID_STATIC_EGRESS_PROXY" && !error.message.includes("private-password"),
    );
  } finally { process.env.FIXIE_URL=previous; }
});

test("fails closed without Fixie and never calls fetch directly",async()=>{
  const previous=process.env.FIXIE_URL;
  const original=globalThis.fetch;
  delete process.env.FIXIE_URL;
  globalThis.fetch=async()=>{throw new Error("DIRECT_BANK_REQUEST_SHOULD_NOT_RUN");};
  try {
    await assert.rejects(
      ()=>createHostedPayment(credentials,{amountMinor:100,trackId:"123",responseURL:"https://preview.example/return",errorURL:"https://preview.example/return"}),
      error=>error.message==="MISSING_STATIC_EGRESS_PROXY",
    );
  } finally {
    globalThis.fetch=original;
    if(previous===undefined)delete process.env.FIXIE_URL;else process.env.FIXIE_URL=previous;
  }
});

test("builds a PaymentID inquiry on tranportal.htm and verifies its encrypted response",async()=>{
  const original=globalThis.fetch;
  const encrypted=encryptTrandata([{result:"CAPTURED",amt:"12.50",trackId:"123456",paymentId:"12345",transId:"67890",authRespCode:"00",actionCode:"8"}],credentials.resourceKey);
  globalThis.fetch=async(url,init)=>{
    assert.equal(new URL(String(url)).pathname,"/pg/payment/tranportal.htm");
    const request=JSON.parse(String(init?.body))[0];
    const payload=decryptTrandata(request.trandata,credentials.resourceKey);
    assert.equal(payload[0].action,"8");
    assert.equal(payload[0].udf5,"PaymentID");
    assert.equal(payload[0].transId,"12345");
    return new Response(JSON.stringify([{status:"1",trandata:encrypted}]),{status:200});
  };
  try {
    const bank=await inquireHostedPayment({...credentials,endpoint:"https://securepayments.neoleap.com.sa/pg/payment/tranportal.htm"},{amountMinor:1250,trackId:"123456",paymentId:"12345"});
    assert.equal(bank.result,"CAPTURED");
    assert.equal(bank.transId,"67890");
  } finally { globalThis.fetch=original; }
});

test("acknowledges a callback without treating it as settlement",()=>{
  const ack=paymentCallbackAcknowledgement("https://preview.example");
  assert.deepEqual(ack,[{status:"1",result:"https://preview.example/cart?paymentReturn=pending-verification"}]);
  assert.equal(isGatewayNotification({paymentId:"123",trandata:"encrypted"}),true);
  assert.equal(isGatewayNotification({paymentId:"123",trandata:""}),false);
});

test("rejects non-HTTPS or path-bearing callback origins",()=>{
  assert.throws(()=>paymentReturnUrl("http://preview.example"));
  assert.throws(()=>paymentReturnUrl("https://preview.example/path"));
});
