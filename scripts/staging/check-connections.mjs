import pg from "pg";
import {
  assertSeparateDatabases,
  databaseIdentityFingerprint,
  getMigrationDatabaseUrl,
  getStagingDatabaseUrl,
} from "../../lib/database-target.mjs";
import { assertReadOnlySourceRole, verifyLiveConnection } from "./pg-safety.mjs";

const sourceUrl = process.env.SOURCE_READ_ONLY_DATABASE_URL;
const stagingUrl = getStagingDatabaseUrl();
const migrationUrl = getMigrationDatabaseUrl();
const expectedHost = process.env.AREES_STAGING_DATABASE_HOST;
const directHost = process.env.AREES_STAGING_DATABASE_DIRECT_HOST?.toLowerCase();
if (!sourceUrl || !stagingUrl || !migrationUrl || !expectedHost || directHost !== "db.prisma.io" || !process.env.AREES_STAGING_DATABASE_STORE_ID || !process.env.AREES_SOURCE_DATABASE_STORE_ID) {
  throw new Error("Provide restricted source URL, staging URL, both verified resource IDs, and the staging host allowlist");
}
if (process.env.VERCEL_PROJECT_ID !== "prj_gkTSFNIfCgVwslbCUHsKtNhuwULk") {
  throw new Error("Connection checks must run from the isolated Arees Staging project context");
}
const resources = assertSeparateDatabases(sourceUrl, stagingUrl, expectedHost, {
  sourceStoreId: process.env.AREES_SOURCE_DATABASE_STORE_ID,
  targetStoreId: process.env.AREES_STAGING_DATABASE_STORE_ID,
});
const stagingRoleMatchesDirect = decodeURIComponent(new URL(stagingUrl).username) === decodeURIComponent(new URL(migrationUrl).username);
if (!stagingRoleMatchesDirect) {
  throw new Error("Pooled and direct Staging connections are configured for different database roles");
}
const { Client } = pg;

async function probe(label, connectionString) {
  const client = new Client({ connectionString, connectionTimeoutMillis: 8000, query_timeout: 8000 });
  try {
    await client.connect();
    const identity = await verifyLiveConnection(client, connectionString, label);
    if (label === "source") {
      await assertReadOnlySourceRole(client);
      await client.query("BEGIN READ ONLY");
      await client.query("SELECT 1");
      const { rows } = await client.query("SHOW transaction_read_only");
      if (rows[0]?.transaction_read_only !== "on") throw new Error("Source read-only transaction guard did not activate");
    } else if (identity.database.toLowerCase().includes("production")) {
      throw new Error("Staging connection resolves to a database named as production");
    }
    await client.query("ROLLBACK").catch(() => {});
    return { label, resourceId: label === "source" ? resources.sourceStoreId : resources.targetStoreId, ...identity, connected: true };
  } finally {
    await client.end().catch(() => {});
  }
}

try {
  const source = await probe("source", sourceUrl);
  const staging = await probe("staging", stagingUrl);
  const migration = await probe("staging-direct", migrationUrl);
  if (databaseIdentityFingerprint(sourceUrl) === databaseIdentityFingerprint(stagingUrl)) {
    throw new Error("Source and Staging live connection fingerprints match; isolation is not proven");
  }
  if (staging.databaseOid !== migration.databaseOid || staging.database !== migration.database || !staging.roleIdentityMatchesCredential || !migration.roleIdentityMatchesCredential) {
    throw new Error("Pooled and direct Staging connections do not resolve to the same live database identity");
  }
  console.log(JSON.stringify({ source, staging, migration, resourceIdsDiffer: source.resourceId !== staging.resourceId, writesPerformed: false, queries: "read-only identity/privilege checks only" }));
} catch (error) {
  console.error(error instanceof Error ? error.message : "Connection checks failed");
  process.exitCode = 1;
}
