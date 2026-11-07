"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");
const { createCipheriv } = require("node:crypto");
const { acknowledgeNotification, finalReturnUrl } = require("../lib/callback");
const handler = require("../api/payments/neoleap/return");

const key = "12345678901234567890123456789012";
const finalUrl = "https://arees-loop-platform-oir88xxsr-arees-loop.vercel.app/api/payments/neoleap/return";

function encrypt(value) {
  const cipher = createCipheriv("aes-256-cbc", Buffer.from(key), Buffer.from("PGKEYENCDECIVSPC"));
  return Buffer.concat([
    cipher.update(encodeURIComponent(JSON.stringify(value)), "utf8"),
    cipher.final(),
  ]).toString("hex");
}

function callback(paymentId = "123456789", result = "CAPTURED") {
  return [{ paymentId, trandata: encrypt([{ paymentId, trackId: "987654321", result, amt: "10.00" }]) }];
}

test("acknowledges an encrypted successful notification without settling it", () => {
  assert.deepEqual(acknowledgeNotification(callback(), key, finalUrl), [{ status: "1", result: finalUrl }]);
});

test("acknowledges a valid failed notification so the bank flow can finish", () => {
  assert.deepEqual(acknowledgeNotification(callback("123456789", "NOT CAPTURED"), key, finalUrl), [{ status: "1", result: finalUrl }]);
});

test("duplicate notifications produce the same transport acknowledgment and no state mutation", () => {
  const payload = callback();
  assert.deepEqual(acknowledgeNotification(payload, key, finalUrl), acknowledgeNotification(payload, key, finalUrl));
});

test("rejects a notification when outer and encrypted payment IDs differ", () => {
  const payload = callback();
  payload[0].paymentId = "123456788";
  assert.throws(() => acknowledgeNotification(payload, key, finalUrl), /PAYMENT_ID_MISMATCH/);
});

test("rejects malformed or undecryptable notifications", () => {
  assert.throws(() => acknowledgeNotification([{ paymentId: "x", trandata: "bad" }], key, finalUrl));
  assert.throws(() => acknowledgeNotification([{ paymentId: "123456789", trandata: "00".repeat(32) }], "wrong-key-wrong-key", finalUrl));
});

test("restricts the final return to the exact HTTPS Preview route", () => {
  assert.equal(finalReturnUrl(finalUrl), finalUrl);
  assert.throws(() => finalReturnUrl("https://example.org/steal"));
});

test("public POST fails closed when the rotated resource key is not configured", () => {
  const previousUrl = process.env.NEOLEAP_FINAL_RETURN_URL;
  const previousKey = process.env.NEOLEAP_RESOURCE_KEY;
  process.env.NEOLEAP_FINAL_RETURN_URL = finalUrl;
  delete process.env.NEOLEAP_RESOURCE_KEY;
  const res = {
    headers: {},
    setHeader(name, value) { this.headers[name] = value; },
    end(value) { this.body = value; },
  };
  handler({ method: "POST", headers: { "content-type": "application/json" }, body: callback() }, res);
  assert.equal(res.statusCode, 503);
  assert.deepEqual(JSON.parse(res.body), { error: "CALLBACK_NOT_CONFIGURED" });
  if (previousUrl === undefined) delete process.env.NEOLEAP_FINAL_RETURN_URL;
  else process.env.NEOLEAP_FINAL_RETURN_URL = previousUrl;
  if (previousKey === undefined) delete process.env.NEOLEAP_RESOURCE_KEY;
  else process.env.NEOLEAP_RESOURCE_KEY = previousKey;
});

