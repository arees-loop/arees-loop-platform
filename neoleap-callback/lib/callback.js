"use strict";

const { createDecipheriv } = require("node:crypto");
const IV = Buffer.from("PGKEYENCDECIVSPC", "utf8");

function finalReturnUrl(value) {
  if (typeof value !== "string" || !value.trim()) throw new Error("CALLBACK_RETURN_URL_MISSING");
  const url = new URL(value);
  if (url.protocol !== "https:" || !/^arees-loop-platform-[a-z0-9-]+-arees-loop\.vercel\.app$/.test(url.hostname) ||
      url.username || url.password || url.search || url.hash ||
      url.pathname !== "/api/payments/neoleap/return") {
    throw new Error("CALLBACK_RETURN_URL_INVALID");
  }
  return url.toString();
}

function decryptTrandata(hex, resourceKey) {
  if (typeof resourceKey !== "string" || ![16, 24, 32].includes(Buffer.byteLength(resourceKey, "utf8"))) {
    throw new Error("RESOURCE_KEY_INVALID");
  }
  if (typeof hex !== "string" || !/^(?:[0-9a-fA-F]{32})+$/.test(hex) || hex.length > 131072) {
    throw new Error("TRANDATA_INVALID");
  }
  const key = Buffer.from(resourceKey, "utf8");
  const decipher = createDecipheriv("aes-" + (key.length * 8) + "-cbc", key, IV);
  const decoded = Buffer.concat([
    decipher.update(Buffer.from(hex, "hex")),
    decipher.final(),
  ]).toString("utf8");
  return JSON.parse(decodeURIComponent(decoded));
}

function notificationRecord(value) {
  const item = Array.isArray(value) ? value[0] : value;
  if (!item || typeof item !== "object" || Array.isArray(item)) throw new Error("NOTIFICATION_INVALID");
  const paymentId = String(item.paymentId ?? "");
  if (!/^\d{1,30}$/.test(paymentId) || typeof item.trandata !== "string") throw new Error("NOTIFICATION_INVALID");
  return { paymentId, trandata: item.trandata };
}

function acknowledgeNotification(body, resourceKey, returnUrl) {
  const target = finalReturnUrl(returnUrl);
  const notification = notificationRecord(body);
  const decoded = decryptTrandata(notification.trandata, resourceKey);
  const plain = Array.isArray(decoded) ? decoded[0] : decoded;
  if (!plain || typeof plain !== "object" || Array.isArray(plain)) throw new Error("TRANSACTION_INVALID");
  if (String(plain.paymentId ?? "") !== notification.paymentId) throw new Error("PAYMENT_ID_MISMATCH");
  if (typeof plain.trackId !== "string" && typeof plain.trackId !== "number") throw new Error("TRACK_ID_MISSING");
  const trackId = String(plain.trackId);
  if (!/^[a-zA-Z0-9-]{1,40}$/.test(trackId)) throw new Error("TRACK_ID_INVALID");
  if (typeof plain.result !== "string" && typeof plain.error !== "string") throw new Error("TRANSACTION_STATUS_MISSING");
  // Acknowledgment is transport-only. Settlement is verified later by the main app's bank inquiry.
  return [{ status: "1", result: target }];
}

module.exports = { acknowledgeNotification, finalReturnUrl };

