import { createHash } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import pg from "pg";
import {
  assertSeparateDatabases,
  databaseIdentityFingerprint,
  getStagingDatabaseUrl,
  PRODUCTION_PRISMA_STORE_ID,
  STAGING_PRISMA_STORE_ID,
} from "../../lib/database-target.mjs";
import { assertReadOnlySourceRole, verifyLiveConnection } from "./pg-safety.mjs";

const { Client } = pg;
const sourceUrl = process.env.SOURCE_READ_ONLY_DATABASE_URL;
const stagingUrl = getStagingDatabaseUrl();
const stagingHost = process.env.AREES_STAGING_DATABASE_HOST;
const partnerId = process.env.AREES_SOURCE_PARTNER_ID;
const sourceBlobStoreId = process.env.AREES_SOURCE_BLOB_STORE_ID;
const stagingBlobStoreId = process.env.AREES_STAGING_BLOB_STORE_ID;
const sourceStoreId = process.env.AREES_SOURCE_DATABASE_STORE_ID;
const stagingStoreId = process.env.AREES_STAGING_DATABASE_STORE_ID;

if (!sourceUrl || !stagingUrl || !stagingHost || !partnerId || !sourceStoreId || !stagingStoreId) {
  throw new Error("Provide restricted source URL, Staging URL/host/resource IDs, and exact source partner ID");
}
if (!sourceBlobStoreId || !stagingBlobStoreId || sourceBlobStoreId === stagingBlobStoreId) {
  throw new Error("Source and staging Blob store IDs must be provided and different");
}
if (process.env.VERCEL_PROJECT_ID !== "prj_gkTSFNIfCgVwslbCUHsKtNhuwULk") {
  throw new Error("Run catalog export only from the isolated Arees Staging project context");
}
assertSeparateDatabases(sourceUrl, stagingUrl, stagingHost, { sourceStoreId, targetStoreId: stagingStoreId });

const localAssetPath = (rawUrl) => {
  let parsed;
  try {
    parsed = new URL(rawUrl, "https://arees.invalid");
  } catch {
    throw new Error("Catalog contains an invalid image URL");
  }

  if (parsed.origin === "https://arees.invalid" && parsed.pathname === "/api/media") {
    const pathname = parsed.searchParams.get("pathname");
    if (!pathname || pathname.startsWith("/") || pathname.split("/").includes("..") || pathname.includes("\\") || !pathname.startsWith("services/")) {
      throw new Error("Catalog contains an unsafe private media path");
    }
    return { sourcePath: pathname, access: "private" };
  }

  const access = parsed.hostname === `${sourceBlobStoreId}.private.blob.vercel-storage.com`
    ? "private"
    : parsed.hostname === `${sourceBlobStoreId}.public.blob.vercel-storage.com`
      ? "public"
      : null;
  if (access && parsed.pathname.length > 1) {
    const pathname = decodeURIComponent(parsed.pathname.slice(1));
    if (pathname.startsWith("/") || pathname.split("/").includes("..") || pathname.includes("\\")) {
      throw new Error("Catalog contains an unsafe Blob path");
    }
    return { sourcePath: pathname, access };
  }

  throw new Error("Catalog contains media outside the approved source Blob store");
};

const exportDir = path.resolve(process.env.AREES_CATALOG_EXPORT_DIR || "./artifacts/staging");
const outputPath = path.join(exportDir, `catalog-${partnerId}.json`);
const client = new Client({ connectionString: sourceUrl, connectionTimeoutMillis: 8000, query_timeout: 15000 });
const stagingClient = new Client({ connectionString: stagingUrl, connectionTimeoutMillis: 8000, query_timeout: 15000 });

try {
  await client.connect();
  const liveSource = await verifyLiveConnection(client, sourceUrl, "source");
  await assertReadOnlySourceRole(client);
  await stagingClient.connect();
  await verifyLiveConnection(stagingClient, stagingUrl, "staging");
  if (databaseIdentityFingerprint(sourceUrl) === databaseIdentityFingerprint(stagingUrl)) {
    throw new Error("Source and Staging live connection fingerprints match; export stopped");
  }
  await stagingClient.end();
  await client.query("BEGIN READ ONLY");
  const { rows: readOnlyRows } = await client.query("SHOW transaction_read_only");
  if (readOnlyRows[0]?.transaction_read_only !== "on") {
    throw new Error("Source transaction is not read-only; export stopped");
  }

  const partnerResult = await client.query(
    `SELECT "id", "partnerType"::text, "legalNameAr", "legalNameEn", "tradeNameAr", "tradeNameEn",
            "descriptionAr", "logoUrl", "websiteUrl", "country", "city", "locationName",
            "latitude"::text, "longitude"::text, "publicName", "operates24h", "operatingHours",
            "status"::text, "createdAt", "updatedAt"
       FROM "Partner"
      WHERE "id" = $1
        AND "status" = 'ACTIVE'::"PartnerStatus"
        AND (
          COALESCE("legalNameAr", '') ILIKE ANY (ARRAY['%أريس%', '%اريس%']) OR
          COALESCE("tradeNameAr", '') ILIKE ANY (ARRAY['%أريس%', '%اريس%']) OR
          COALESCE("publicName", '') ILIKE ANY (ARRAY['%أريس%', '%اريس%']) OR
          COALESCE("legalNameEn", '') ILIKE ANY (ARRAY['%arees%', '%ares%']) OR
          COALESCE("tradeNameEn", '') ILIKE ANY (ARRAY['%arees%', '%ares%'])
        )`,
    [partnerId],
  );
  if (partnerResult.rowCount !== 1) {
    throw new Error("The specified partner is absent or not ACTIVE; no export was written");
  }

  const servicesResult = await client.query(
    `SELECT "id", "partnerId", "nameAr", "nameEn", "category", "subCategory", "descriptionAr", "descriptionEn",
            "city", "region", "locationName", "formattedAddress", "placeId", "country", "countryCode",
            "latitude"::text, "longitude"::text, "basePrice"::text, "vatRate"::text, "finalPrice"::text,
            "loyaltyPoints", "capacity", "cancellationPolicy", "meetingInstructions", "meetingPointName",
            "meetingPointAddress", "meetingLatitude"::text, "meetingLongitude"::text, "organizerType",
            "organizerName", "status"::text, "createdAt", "updatedAt"
       FROM "Service"
      WHERE "partnerId" = $1
        AND "status" = 'PUBLISHED'::"ServiceStatus"
      ORDER BY "createdAt", "id"`,
    [partnerId],
  );
  const serviceIds = servicesResult.rows.map((row) => row.id);
  const imagesResult = serviceIds.length
    ? await client.query(
        `SELECT "id", "serviceId", "url", "sortOrder", "createdAt"
           FROM "ServiceImage"
          WHERE "serviceId" = ANY($1::text[])
          ORDER BY "serviceId", "sortOrder", "createdAt", "id"`,
        [serviceIds],
      )
    : { rows: [] };

  const images = imagesResult.rows.map(({ id, serviceId, url, sortOrder, createdAt }) => ({
    id,
    serviceId,
    ...localAssetPath(url),
    sortOrder,
    createdAt,
  }));
  const partner = partnerResult.rows[0];
  const catalog = {
    format: "arees-staging-catalog-v1",
    generatedAt: new Date().toISOString(),
    source: {
      databaseHost: new URL(sourceUrl).hostname,
      databaseName: decodeURIComponent(new URL(sourceUrl).pathname.slice(1)),
      databaseStoreId: sourceStoreId,
      liveDatabaseOid: liveSource.databaseOid,
      liveServerVersion: liveSource.serverVersion,
      databaseIdentityFingerprint: databaseIdentityFingerprint(sourceUrl),
      blobStoreId: sourceBlobStoreId,
    },
    staging: {
      databaseHost: new URL(stagingUrl).hostname,
      databaseStoreId: stagingStoreId,
      databaseIdentityFingerprint: databaseIdentityFingerprint(stagingUrl),
      blobStoreId: stagingBlobStoreId,
    },
    partner: {
      ...partner,
      logoSourceAsset: partner.logoUrl ? localAssetPath(partner.logoUrl) : null,
      logoUrl: null,
    },
    services: servicesResult.rows,
    images,
    exclusions: [
      "users and customer profiles",
      "bookings and payment references",
      "partner members and invitations",
      "partner documents, licenses, bank and contact details",
      "service license IDs and license/approval numbers",
    ],
  };
  if (catalog.source.databaseStoreId !== PRODUCTION_PRISMA_STORE_ID || catalog.staging.databaseStoreId !== STAGING_PRISMA_STORE_ID) {
    throw new Error("Catalog database resource IDs are not the approved Production/ Staging resources");
  }
  const json = `${JSON.stringify(catalog, null, 2)}\n`;
  const checksum = createHash("sha256").update(json).digest("hex");
  await client.query("COMMIT");
  await mkdir(exportDir, { recursive: true, mode: 0o700 });
  await writeFile(outputPath, json, { mode: 0o600, flag: "wx" });
  await writeFile(`${outputPath}.sha256`, `${checksum}  ${path.basename(outputPath)}\n`, { mode: 0o600, flag: "wx" });
  console.log(JSON.stringify({ outputPath, sha256: checksum, services: catalog.services.length, images: images.length }));
} catch (error) {
  await client.query("ROLLBACK").catch(() => {});
  console.error(error instanceof Error ? error.message : "Catalog export failed");
  process.exitCode = 1;
} finally {
  await stagingClient.end().catch(() => {});
  await client.end().catch(() => {});
}
