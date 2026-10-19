import { randomUUID } from "node:crypto";
import { Pool } from "pg";
import { del, get, put } from "@vercel/blob";

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) throw new Error("Staging upload test has no database URL.");
if (process.env.AREES_DATABASE_ENV !== "staging") throw new Error("Upload smoke test is staging-only.");
if (process.env.AREES_STAGING_DATABASE_STORE_ID !== "store_fpCPANjbF7V7x3tT") throw new Error("Unexpected staging database store.");
if (process.env.BLOB_READ_WRITE_TOKEN === undefined) throw new Error("Private Blob token is unavailable.");

const pool = new Pool({ connectionString: databaseUrl, max: 1, connectionTimeoutMillis: 10000 });
const testId = randomUUID().replaceAll("-", "");
const userId = "license-upload-test-" + testId;
const documentId = "license-upload-test-doc-" + testId;
const email = "license-upload-" + testId + "@example.invalid";
const png = Buffer.from(
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+/A0cAAAAASUVORK5CYII=",
  "base64",
);
const payload = Buffer.concat([png, Buffer.alloc(Math.max(0, 120 - png.length))]);
let userCreated = false;
let blobPath;

try {
  await pool.query(
    'INSERT INTO "User" ("id", "email", "passwordHash", "updatedAt") VALUES ($1, $2, $3, NOW())',
    [userId, email, "automated-staging-upload-test"],
  );
  userCreated = true;

  const blob = await put(`license-applications/${userId}/${testId}.png`, payload, {
    access: "private",
    contentType: "image/png",
    addRandomSuffix: false,
  });
  blobPath = blob.pathname;
  await pool.query(
    'INSERT INTO "InternationalLicenseDocument" ("id", "userId", "slot", "blobPath", "mimeType", "byteSize") VALUES ($1, $2, $3, $4, $5, $6)',
    [documentId, userId, "PASSPORT", blobPath, "image/png", payload.length],
  );
  const saved = await pool.query(
    'SELECT "blobPath", "mimeType", "byteSize" FROM "InternationalLicenseDocument" WHERE "id" = $1 AND "userId" = $2',
    [documentId, userId],
  );
  if (saved.rowCount !== 1 || saved.rows[0].blobPath !== blobPath || saved.rows[0].mimeType !== "image/png" || saved.rows[0].byteSize !== payload.length) {
    throw new Error("Staging database did not preserve uploaded document metadata.");
  }
  const downloaded = await get(blobPath, { access: "private" });
  if (!downloaded || downloaded.statusCode !== 200) throw new Error("Private Blob read-back failed.");
  const reader = downloaded.stream.getReader();
  const { value, done } = await reader.read();
  if (done || !Buffer.from(value).equals(payload)) throw new Error("Private Blob contents do not match the uploaded test image.");
  await reader.cancel();
  console.log("Staging private-license database and Blob round-trip passed.");
} finally {
  if (blobPath) await del(blobPath).catch(() => {});
  if (userCreated) await pool.query('DELETE FROM "User" WHERE "id" = $1', [userId]).catch(() => {});
  await pool.end();
}
