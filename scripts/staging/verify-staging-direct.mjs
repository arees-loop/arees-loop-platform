import pg from "pg";
import { getMigrationDatabaseUrl, STAGING_PRISMA_STORE_ID, STAGING_VERCEL_PROJECT_ID } from "../../lib/database-target.mjs";
import { verifyLiveConnection } from "./pg-safety.mjs";

const expectedDatabase = process.env.AREES_STAGING_DATABASE_EXPECTED_NAME;
const directUrl = getMigrationDatabaseUrl();
const parsed = new URL(directUrl);

if (process.env.VERCEL_PROJECT_ID !== STAGING_VERCEL_PROJECT_ID) {
  throw new Error("Staging verification must run in the approved staging project context");
}
if (process.env.AREES_DATABASE_ENV !== "staging") {
  throw new Error("Staging verification requires AREES_DATABASE_ENV=staging");
}
if (process.env.AREES_STAGING_DATABASE_STORE_ID !== STAGING_PRISMA_STORE_ID) {
  throw new Error("Staging verification resource ID does not match the approved Prisma store");
}
if (!expectedDatabase || parsed.hostname !== "db.prisma.io") {
  throw new Error("Set the approved Staging database name and use Prisma's direct endpoint");
}
if (decodeURIComponent(parsed.pathname.slice(1)) !== expectedDatabase) {
  throw new Error("Staging connection does not match the approved database name");
}

// Enforce certificate validation. Prisma's URL may contain sslmode=require,
// which encrypts the connection but does not, by itself, guarantee peer checks.
for (const key of ["sslmode", "ssl", "sslcert", "sslkey", "sslrootcert"]) parsed.searchParams.delete(key);
const { Client } = pg;
const client = new Client({
  connectionString: parsed.toString(),
  ssl: { rejectUnauthorized: true },
  connectionTimeoutMillis: 10000,
  query_timeout: 10000,
  application_name: "arees-loop-staging-preflight",
});

try {
  await client.connect();
  const live = await verifyLiveConnection(client, directUrl, "staging");
  if (live.database !== expectedDatabase || live.roleIdentityMatchesCredential !== true) {
    throw new Error("Live PostgreSQL database or credential identity check failed");
  }
  const permissions = await client.query(`
    SELECT r.rolsuper AS is_superuser,
           r.rolcreatedb AS can_create_database,
           r.rolcreaterole AS can_create_roles,
           r.rolreplication AS can_replicate,
           r.rolbypassrls AS bypasses_row_security,
           has_database_privilege(current_user, current_database(), 'CONNECT') AS can_connect,
           has_schema_privilege(current_user, 'public', 'USAGE') AS public_schema_usage,
           has_schema_privilege(current_user, 'public', 'CREATE') AS public_schema_create
      FROM pg_roles r WHERE r.rolname = current_user
  `);
  const role = permissions.rows[0];
  if (!role || role.is_superuser || role.can_create_database || role.can_create_roles || role.can_replicate || role.bypasses_row_security) {
    throw new Error("Staging role has elevated privileges; refusing migrations");
  }
  if (!role.can_connect || !role.public_schema_usage || !role.public_schema_create) {
    throw new Error("Staging role lacks the database/schema privileges required by Prisma migrations");
  }
  const tls = client.connection.stream;
  if (!tls?.encrypted || tls.authorized !== true) {
    throw new Error("Staging TLS is not encrypted and certificate-verified");
  }
  const result = {
    target: "staging",
    resourceId: STAGING_PRISMA_STORE_ID,
    databaseIdentityMatchesExpected: true,
    roleIdentityVerified: live.roleIdentityMatchesCredential,
    databaseOid: live.databaseOid,
    serverVersion: live.serverVersion,
    tlsEncrypted: true,
    tlsCertificateVerified: true,
    privileges: role,
    productionCredentialsUsed: false,
    writesPerformed: false,
  };
  console.log(JSON.stringify(result));
} catch (error) {
  console.error(error instanceof Error ? error.message : "Staging verification failed");
  process.exitCode = 1;
} finally {
  await client.end().catch(() => {});
}
