import { createHash } from "node:crypto";
import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { get, put } from "@vercel/blob";
import { assertBlobTokenStore } from "../../lib/database-target.mjs";

const STAGING_PROJECT_ID = "prj_gkTSFNIfCgVwslbCUHsKtNhuwULk";
const STAGING_BLOB_STORE_ID = "store_euuB9sJFEyMP9s6Q";
const SOURCE_BLOB_STORE_ID = "store_8WwOhPXOPgpCID8u";
const MAX_IMAGE_BYTES = 12 * 1024 * 1024;
const extensions = { "image/jpeg": "jpg", "image/png": "png", "image/webp": "webp" };
const [catalogPath, mode = "--dry-run"] = process.argv.slice(2);

if (!catalogPath || !["--dry-run", "--apply"].includes(mode)) {
  throw new Error("Usage: node scripts/staging/copy-catalog-media.mjs <catalog.json> [--dry-run|--apply]");
}

const catalogBytes = await readFile(catalogPath);
const checksum = createHash("sha256").update(catalogBytes).digest("hex");
const checksumLine = (await readFile(`${catalogPath}.sha256`, "utf8")).trim();
if (!checksumLine.startsWith(`${checksum}  `)) throw new Error("Catalog checksum is invalid");
const catalog = JSON.parse(catalogBytes.toString("utf8"));
if (catalog.format !== "arees-staging-catalog-v1") throw new Error("Unsupported catalog export format");
if (catalog.source.blobStoreId !== SOURCE_BLOB_STORE_ID || catalog.staging.blobStoreId !== STAGING_BLOB_STORE_ID) {
  throw new Error("Catalog source or target Blob store ID does not match the isolated stores");
}

const targetPathFor = (image) => {
  for (const id of [catalog.partner.id, image.serviceId, image.id].filter(Boolean)) {
    if (!/^[A-Za-z0-9_-]{1,80}$/.test(id)) throw new Error("Catalog contains an invalid identifier");
  }
  if (image.kind === "partnerLogo") return `partners/${catalog.partner.id}/logo/${catalog.partner.id}`;
  return `catalog/${catalog.partner.id}/services/${image.serviceId}/${image.id}`;
};

if (mode === "--dry-run") {
  console.log(JSON.stringify({ mode, serviceImages: catalog.images.length, partnerLogo: Boolean(catalog.partner.logoSourceAsset), sourceStore: SOURCE_BLOB_STORE_ID, targetStore: STAGING_BLOB_STORE_ID }));
  process.exit(0);
}

if (process.env.VERCEL_PROJECT_ID !== STAGING_PROJECT_ID) {
  throw new Error("Blob copy is allowed only with the dedicated Arees Staging project and store");
}
if (process.env.AREES_ALLOW_STAGING_BLOB_WRITES !== "YES") {
  throw new Error("Blob writes require AREES_ALLOW_STAGING_BLOB_WRITES=YES after cost approval");
}
const sourceToken = process.env.AREES_SOURCE_BLOB_TOKEN;
const targetToken = process.env.AREES_STAGING_BLOB_WRITE_TOKEN || process.env.BLOB_READ_WRITE_TOKEN;
if (!sourceToken || !targetToken) throw new Error("Source Blob token and staging Blob token are required");
assertBlobTokenStore(sourceToken, SOURCE_BLOB_STORE_ID);
assertBlobTokenStore(targetToken, STAGING_BLOB_STORE_ID);

const readBuffer = async (stream) => {
  const chunks = [];
  let total = 0;
  for await (const part of stream) {
    const chunk = Buffer.from(part);
    total += chunk.length;
    if (total > MAX_IMAGE_BYTES) throw new Error("Image exceeds the 12 MB staging-copy limit");
    chunks.push(chunk);
  }
  return Buffer.concat(chunks, total);
};
const sha256 = (buffer) => createHash("sha256").update(buffer).digest("hex");
const output = [];
const assets = [
  ...catalog.images.map((image) => ({ ...image, kind: "serviceImage" })),
  ...(catalog.partner.logoSourceAsset ? [{ id: catalog.partner.id, ...catalog.partner.logoSourceAsset, kind: "partnerLogo" }] : []),
];

for (const image of assets) {
  const targetBase = targetPathFor(image);
  if (!image.sourcePath || !["public", "private"].includes(image.access)) throw new Error("Catalog has an invalid source media reference");
  const source = await get(image.sourcePath, { access: image.access, token: sourceToken });
  if (!source || source.statusCode !== 200 || !extensions[source.blob.contentType]) {
    throw new Error(`Image ${image.id} is missing or has an unsupported media type`);
  }
  const bytes = await readBuffer(source.stream);
  const digest = sha256(bytes);
  const targetPath = `${targetBase}.${extensions[source.blob.contentType]}`;
  const existing = await get(targetPath, { access: "private", token: targetToken }).catch(() => null);
  if (existing?.statusCode === 200) {
    const oldBytes = await readBuffer(existing.stream);
    if (sha256(oldBytes) !== digest) throw new Error(`Target image ${image.id} differs; refusing overwrite`);
    output.push({ kind: image.kind, imageId: image.kind === "serviceImage" ? image.id : null, partnerId: catalog.partner.id, serviceId: image.serviceId ?? null, targetPath, sha256: digest, size: bytes.length, contentType: source.blob.contentType, action: "already-identical" });
    continue;
  }

  await put(targetPath, bytes, {
    access: "private",
    token: targetToken,
    contentType: source.blob.contentType,
    addRandomSuffix: false,
    allowOverwrite: false,
  });
  output.push({ kind: image.kind, imageId: image.kind === "serviceImage" ? image.id : null, partnerId: catalog.partner.id, serviceId: image.serviceId ?? null, targetPath, sha256: digest, size: bytes.length, contentType: source.blob.contentType, action: "copied" });
}

const outputPath = path.join(path.dirname(path.resolve(catalogPath)), `media-${catalog.partner.id}.json`);
const outputJson = `${JSON.stringify({ format: "arees-staging-media-v1", catalogSha256: checksum, targetStoreId: STAGING_BLOB_STORE_ID, assets: output }, null, 2)}\n`;
const outputHash = sha256(Buffer.from(outputJson));
await writeFile(outputPath, outputJson, { mode: 0o600, flag: "wx" });
await writeFile(`${outputPath}.sha256`, `${outputHash}  ${path.basename(outputPath)}\n`, { mode: 0o600, flag: "wx" });
console.log(JSON.stringify({ mode, outputPath, assets: output.length, copied: output.filter((item) => item.action === "copied").length, alreadyIdentical: output.filter((item) => item.action === "already-identical").length, sha256: outputHash }));
