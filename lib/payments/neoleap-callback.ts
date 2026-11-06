export type GatewayNotification = { paymentId: string; trandata: string };

export function isGatewayNotification(value: unknown): value is GatewayNotification {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;
  const record = value as Record<string, unknown>;
  return (typeof record.paymentId === "string" || typeof record.paymentId === "number")
    && /^\d+$/.test(String(record.paymentId))
    && typeof record.trandata === "string"
    && record.trandata.length > 0
    && record.trandata.length <= 131072;
}

export function paymentReturnUrl(origin: string): URL {
  const base = new URL(origin);
  if (base.protocol !== "https:" || base.origin !== origin || base.username || base.password) {
    throw new Error("INVALID_CALLBACK_ORIGIN");
  }
  const result = new URL("/cart", base);
  result.searchParams.set("paymentReturn", "pending-verification");
  return result;
}

export function paymentCallbackAcknowledgement(origin: string) {
  return [{ status: "1", result: paymentReturnUrl(origin).toString() }];
}
