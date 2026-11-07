"use strict";

const { acknowledgeNotification, finalReturnUrl } = require("../../../lib/callback");

function sendJson(res, status, body) {
  res.statusCode = status;
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.setHeader("Cache-Control", "no-store");
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.end(JSON.stringify(body));
}

function readBody(req) {
  const body = req.body;
  if (Buffer.isBuffer(body)) {
    if (body.length > 262144) throw new Error("BODY_TOO_LARGE");
    return JSON.parse(body.toString("utf8"));
  }
  if (typeof body === "string") {
    if (Buffer.byteLength(body, "utf8") > 262144) throw new Error("BODY_TOO_LARGE");
    return JSON.parse(body);
  }
  if (!body || typeof body !== "object") throw new Error("BODY_INVALID");
  if (Buffer.byteLength(JSON.stringify(body), "utf8") > 262144) throw new Error("BODY_TOO_LARGE");
  return body;
}

module.exports = function handler(req, res) {
  let returnUrl;
  try {
    returnUrl = finalReturnUrl(process.env.NEOLEAP_FINAL_RETURN_URL);
  } catch {
    return sendJson(res, 503, { error: "CALLBACK_NOT_CONFIGURED" });
  }

  if (req.method === "GET") {
    res.statusCode = 303;
    res.setHeader("Location", returnUrl);
    res.setHeader("Cache-Control", "no-store");
    return res.end();
  }
  if (req.method !== "POST") {
    res.setHeader("Allow", "GET, POST");
    return sendJson(res, 405, { error: "METHOD_NOT_ALLOWED" });
  }
  if (!(req.headers["content-type"] || "").toLowerCase().startsWith("application/json")) {
    return sendJson(res, 415, { error: "UNSUPPORTED_CONTENT_TYPE" });
  }
  const resourceKey = process.env.NEOLEAP_RESOURCE_KEY;
  if (!resourceKey) return sendJson(res, 503, { error: "CALLBACK_NOT_CONFIGURED" });

  try {
    const acknowledgement = acknowledgeNotification(readBody(req), resourceKey, returnUrl);
    return sendJson(res, 200, acknowledgement);
  } catch {
    return sendJson(res, 400, { error: "INVALID_GATEWAY_NOTIFICATION" });
  }
};

