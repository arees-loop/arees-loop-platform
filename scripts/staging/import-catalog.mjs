import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import pg from "pg";
import {
  databaseIdentityFingerprint,
  getMigrationDatabaseUrl,
  PRODUCTION_PRISMA_STORE_ID,
  STAGING_PRISMA_STORE_ID,
} from "../../lib/database-target.mjs";
import { verifyLiveConnection } from "./pg-safety.mjs";

const execFileAsync = promisify(execFile);
const STAGING_PROJECT_ID = "prj_gkTSFNIfCgVwslbCUHsKtNhuwULk";
const STAGING_BLOB_STORE_ID = "store_euuB9sJFEyMP9s6Q";
const [catalogPath, mediaPath, mode = "--dry-run"] = process.argv.slice(2);
if (!catalogPath || !mediaPath || !["--dry-run", "--apply"].includes(mode)) {
  throw new Error("Usage: node scripts/staging/import-catalog.mjs <catalog.json> <media.json> [--dry-run|--apply]");
}
if (process.env.VERCEL_PROJECT_ID !== STAGING_PROJECT_ID || process.env.AREES_DATABASE_ENV !== "staging") {
  throw new Error("Catalog import is allowed only in the isolated Arees Staging project context");
}

const targetUrl = getMigrationDatabaseUrl();
const expectedHost = process.env.AREES_STAGING_DATABASE_DIRECT_HOST?.toLowerCase();
if (!targetUrl || !expectedHost) throw new Error("Dedicated staging database URL and host allowlist are required");
const target = new URL(targetUrl);
if (target.hostname.toLowerCase() !== expectedHost) throw new Error("Staging database host does not match the allowlist");

const catalogBytes = await readFile(catalogPath);
const catalogSha256 = createHash("sha256").update(catalogBytes).digest("hex");
if (!(await readFile(`${catalogPath}.sha256`, "utf8")).trim().startsWith(`${catalogSha256}  `)) {
  throw new Error("Catalog checksum is invalid");
}
const catalog = JSON.parse(catalogBytes.toString("utf8"));
const mediaBytes = await readFile(mediaPath);
const mediaSha256 = createHash("sha256").update(mediaBytes).digest("hex");
if (!(await readFile(`${mediaPath}.sha256`, "utf8")).trim().startsWith(`${mediaSha256}  `)) {
  throw new Error("Media manifest checksum is invalid");
}
const media = JSON.parse(mediaBytes.toString("utf8"));
if (
  catalog.format !== "arees-staging-catalog-v1" ||
  media.format !== "arees-staging-media-v1" ||
  media.catalogSha256 !== catalogSha256 ||
  media.targetStoreId !== STAGING_BLOB_STORE_ID ||
  catalog.staging.blobStoreId !== STAGING_BLOB_STORE_ID ||
  catalog.source.databaseStoreId !== PRODUCTION_PRISMA_STORE_ID ||
  catalog.staging.databaseStoreId !== STAGING_PRISMA_STORE_ID ||
  process.env.AREES_STAGING_DATABASE_STORE_ID !== STAGING_PRISMA_STORE_ID
) throw new Error("Catalog/media manifests do not match the dedicated staging resources");
if (
  !catalog.source.databaseIdentityFingerprint ||
  databaseIdentityFingerprint(targetUrl) === catalog.source.databaseIdentityFingerprint
) {
  throw new Error("Source and staging database connection identities must be different");
}

const imageAssets = media.assets.filter((asset) => asset.kind === "serviceImage");
const logoAssets = media.assets.filter((asset) => asset.kind === "partnerLogo");
const imagesById = new Map(imageAssets.map((asset) => [asset.imageId, asset]));
if (
  imagesById.size !== catalog.images.length ||
  catalog.images.some((image) => !imagesById.has(image.id)) ||
  logoAssets.length > 1 ||
  (Boolean(catalog.partner.logoSourceAsset) !== (logoAssets.length === 1))
) {
  throw new Error("Media copy manifest is incomplete or contains duplicate image IDs");
}
for (const service of catalog.services) {
  if (service.partnerId !== catalog.partner.id) throw new Error("Catalog contains a service outside the selected partner");
}
for (const image of catalog.images) {
  if (!catalog.services.some((service) => service.id === image.serviceId)) throw new Error("Catalog contains an orphan service image");
}

const partnerColumns = ["id", "partnerType", "legalNameAr", "legalNameEn", "tradeNameAr", "tradeNameEn", "descriptionAr", "logoUrl", "websiteUrl", "country", "city", "locationName", "latitude", "longitude", "publicName", "operates24h", "operatingHours", "status", "createdAt", "updatedAt"];
const serviceColumns = ["id", "partnerId", "nameAr", "nameEn", "category", "subCategory", "descriptionAr", "descriptionEn", "city", "region", "locationName", "formattedAddress", "placeId", "country", "countryCode", "latitude", "longitude", "basePrice", "vatRate", "finalPrice", "loyaltyPoints", "capacity", "cancellationPolicy", "meetingInstructions", "meetingPointName", "meetingPointAddress", "meetingLatitude", "meetingLongitude", "organizerType", "organizerName", "status", "createdAt", "updatedAt"];
const imageColumns = ["id", "serviceId", "url", "sortOrder", "createdAt"];
const partnerLogo = logoAssets[0];
const partner = {
  ...catalog.partner,
  logoUrl: partnerLogo ? `/api/media?pathname=${encodeURIComponent(partnerLogo.targetPath)}` : null,
};
const services = catalog.services;
const images = catalog.images.map((image) => ({
  ...image,
  url: `/api/media?pathname=${encodeURIComponent(imagesById.get(image.id).targetPath)}`,
}));

if (mode === "--dry-run") {
  console.log(JSON.stringify({ mode, partnerId: partner.id, services: services.length, images: images.length, targetHost: target.hostname, targetDatabase: decodeURIComponent(target.pathname.slice(1)) }));
  process.exit(0);
}

if (process.env.AREES_ALLOW_STAGING_CATALOG_IMPORT !== "YES") {
  throw new Error("Staging catalog writes require AREES_ALLOW_STAGING_CATALOG_IMPORT=YES after explicit approval");
}
const backupPath = process.env.AREES_STAGING_PREIMPORT_BACKUP;
const backupSha = process.env.AREES_STAGING_PREIMPORT_BACKUP_SHA256;
if (!backupPath || !backupSha) throw new Error("A verified pre-import staging backup path and SHA-256 are required");
const backupHash = createHash("sha256").update(await readFile(backupPath)).digest("hex");
if (backupHash !== backupSha.toLowerCase()) throw new Error("Staging backup checksum does not match");
await execFileAsync("pg_restore", ["--list", backupPath], { maxBuffer: 1024 * 1024 });

const { Client } = pg;
const client = new Client({ connectionString: targetUrl, connectionTimeoutMillis: 8000, query_timeout: 15000 });
const inserted = { Partner: 0, Service: 0, ServiceImage: 0 };

async function insertOrCheck(table, columns, row) {
  const values = columns.map((column) => row[column] ?? null);
  const quotedColumns = columns.map((column) => `"${column}"`).join(", ");
  const placeholders = values.map((_, index) => `$${index + 1}`).join(", ");
  const result = await client.query(
    `INSERT INTO "${table}" (${quotedColumns}) VALUES (${placeholders}) ON CONFLICT ("id") DO NOTHING RETURNING "id"`,
    values,
  );
  if (result.rowCount === 1) {
    inserted[table] += 1;
    return;
  }

  const existing = await client.query(`SELECT ${quotedColumns} FROM "${table}" WHERE "id" = $1`, [row.id]);
  if (existing.rowCount !== 1) throw new Error(`${table} conflict changed during import; transaction stopped`);
  const normalize = (value) => value instanceof Date ? value.toISOString() : value;
  const same = columns.every((column) => JSON.stringify(normalize(existing.rows[0][column])) === JSON.stringify(normalize(row[column] ?? null)));
  if (!same) throw new Error(`${table} ${row.id} already exists with different content; refusing to overwrite`);
}

try {
  await client.connect();
  const live = await verifyLiveConnection(client, targetUrl, "staging-import");
  await client.query("BEGIN");
  const identity = await client.query("SELECT current_database() AS database_name, current_setting('transaction_read_only') AS read_only");
  if (identity.rows[0]?.read_only !== "off") throw new Error("Staging database is unexpectedly read-only");
  if (identity.rows[0]?.database_name.toLowerCase().includes("production")) throw new Error("Refusing a database whose name identifies it as production");
  await insertOrCheck("Partner", partnerColumns, partner);
  for (const service of services) await insertOrCheck("Service", serviceColumns, service);
  for (const image of images) await insertOrCheck("ServiceImage", imageColumns, image);
  await client.query("COMMIT");
  console.log(JSON.stringify({ mode, inserted, verifiedExisting: { Partner: 1 - inserted.Partner, Service: services.length - inserted.Service, ServiceImage: images.length - inserted.ServiceImage }, targetDatabaseOid: live.databaseOid, tlsEnabled: live.tlsEnabled, backupSha256: backupHash }));
} catch (error) {
  await client.query("ROLLBACK").catch(() => {});
  console.error(error instanceof Error ? error.message : "Staging import failed");
  process.exitCode = 1;
} finally {
  await client.end().catch(() => {});
}
