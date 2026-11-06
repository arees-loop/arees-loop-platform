import test from "node:test";
import assert from "node:assert/strict";
import { encryptTrandata, decryptTrandata } from "../lib/payments/arb-crypto.ts";
const key="1234567890123456";
test("AES-CBC encrypted request round trip",()=>{
  const payload=[{amt:"12.00",action:"1",currencyCode:"682",trackId:"12345"}];
  assert.deepEqual(decryptTrandata(encryptTrandata(payload,key),key),payload);
});
test("reject invalid key",()=>assert.throws(()=>encryptTrandata([], "short")));
test("reject invalid hex",()=>assert.throws(()=>decryptTrandata("xyz",key)));
test("reject invalid block length",()=>assert.throws(()=>decryptTrandata("ab".repeat(17),key)));

