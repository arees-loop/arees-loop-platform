import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import pg from "pg";

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

const targetUrl = process.env.AREES_STAGING_DATABASE_URL;
const expectedHost = process.env.AREES_STAGING_DATABASE_HOST?.toLowerCase();
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
  catalog.staging.blobStoreId !== STAGING_BLOB_STORE_ID
) throw new Error("Catalog/media manifests do not match the dedicated staging resources");
if (target.hostname.toLowerCase() === catalog.source.databaseHost.toLowerCase()) {
  throw new Error("Source and staging database hosts must be independent");
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
  console.log(JSON.stringify({ mode, partnerId: partner.id, services: services.length, images: images.length, targetHost: target.hostname, targetDatabase: decodeURIComponent(target.pathname.slice(1)) }wâÚ$z{-®éÜj×stableJson(permissions))) {
      throw new Error(`Test membership ${userId} conflicts with existing staging permissions`);
    }
  }

  await client.query(
    `INSERT INTO "Service" ("id", "partnerId", "nameAr", "category", "descriptionAr", "basePrice", "vatRate", "finalPrice", "status", "createdAt", "updatedAt")
     VALUES ($1, $2, $3, $4, $5, $6::numeric, 0, $6::numeric, 'PUBLISHED'::"ServiceStatus", $7, $7)
     ON CONFLICT ("id") DO NOTHING`,
    [fixtures.service.id, fixtures.partner.id, fixtures.service.nameAr, fixtures.service.category, fixtures.service.descriptionAr, fixtures.service.price, now],
  );
  const service = await client.query(`SELECT "partnerId", "nameAr" FROM "Service" WHERE "id" = $1`, [fixtures.service.id]);
  if (service.rows[0]?.partnerId !== fixtures.partner.id || service.rows[0]?.nameAr !== fixtures.service.nameAr) {
    throw new Error("Staging test service ID is already used by different data");
  }

  await client.query("COMMIT");
  console.log(JSON.stringify({ mode, partnerId: fixtures.partner.id, serviceId: fixtures.service.id, accountCount: fixtures.users.length, passwordProvidedBy: "AREES_STAGING_TEST_PASSWORD", secretsPrinted: false }));
} catch (error) {
  await client.query("ROLLBACK").catch(() => {});
  console.error(error instanceof Error ? error.message : "Staging fixtures failed");
  process.exitCode = 1;
} finally {
  await client.end().catch(() => {});
}
