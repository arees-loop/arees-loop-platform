import { createCipheriv, createDecipheriv } from "node:crypto";
const IV = Buffer.from("PGKEYENCDECIVSPC", "utf8");
function keyBytes(key: string): Buffer {
  const bytes = Buffer.from(key, "utf8");
  if (![16, 24, 32].includes(bytes.length)) throw Error("INVALID_RESOURCE_KEY_LENGTH");
  return bytes;
}
export function encryptTrandata(value: unknown, resourceKey: string): string {
  const key = keyBytes(resourceKey);
  const cipher = createCipheriv("aes-" + (key.length * 8) + "-cbc", key, IV);
  return Buffer.concat([cipher.update(encodeURIComponent(JSON.stringify(value)), "utf8"), cipher.final()]).toString("hex");
}
export function decryptTrandata(hex: string, resourceKey: string): unknown {
  const key = keyBytes(resourceKey);
  if (!/^(?:[0-9a-fA-F]{32})+$/.test(hex) || hex.length > 131072) throw Error("INVALID_TRANDATA");
  const cipher = createDecipheriv("aes-" + (key.length * 8) + "-cbc", key, IV);
  const decoded = Buffer.concat([cipher.update(Buffer.from(hex, "hex")), cipher.final()]).toString("utf8");
  return JSON.parse(decodeURIComponent(decoded));
}

