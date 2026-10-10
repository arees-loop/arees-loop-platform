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
  if (live.database !== expectedDatabase || live.roleIdentityMatchesCredential !== true || live.effectiveRoleAuthorized !== true) {
    throw new Error(`Live PostgreSQL identity check failed: ${JSON.stringify({
      databaseNameMatchesExpected: live.database === expectedDatabase,
      sessionUserMatchesCredential: live.roleIdentityMatchesCredential === true,
      currentUserMatchesSessionUser: live.effectiveRoleMatchesLogin === true,
      currentUserAuthorizedForSession: live.effectiveRoleAuthorized === true,
    })}`);
  }
  const permissions = await client.query(`
    WITH reachable_roles AS (
      SELECT r.rolsuper, r.rolcreatedb, r.rolcreaterole, r.rolreplication, r.rolbypassrls
        FROM pg_roles r
       WHERE r.rolname = session_user OR pg_has_role(session_user, r.oid, 'MEMBER')
    ), effective_role AS (
      SELECT r.rolsuper, r.rolcreatedb, r.rolcreaterole, r.rolreplication, r.rolbypassrls
        FROM pg_roles r WHERE r.rolname = current_user
    )
    SELECT COALESCE(bool_or(rolsuper OR rolcreatedb OR rolcreaterole OR rolreplication OR rolbypassrls), false) AS login_role_has_elevated_membership,
           (SELECT rolsuper FROM effective_role) AS is_superuser,
           (SELECT rolcreatedb FROM effective_role) AS can_create_database,
           (SELECT rolcreaterole FROM effective_role) AS can_create_roles,
           (SELECT rolreplication FROM effective_role) AS can_replicate,
           (SELECT rolbypassrls FROM effective_role) AS bypasses_row_security,
           has_database_privilege(current_user, current_database(), 'CONNECT') AS can_connect,
           has_schema_privilege(current_user, 'public', 'USAGE') AS public_schema_usage,
           has_schema_privilege(current_user, 'public', 'CREATE') AS public_schema_create
      FROM reachable_roles
  `);
  const role = permissions.rows[0];
  if (!role || role.login_role_has_elevated_membership || role.is_superuser || role.can_create_database || role.can_create_roles || role.can_replicate || role.bypasses_row_security) {
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
    roleIdentityVerified: live.roleIdentityMatchesCredential && live.effectiveRoleAuthorized,
    effectiveRoleMatchesLogin: live.effectiveRoleMatchesLogin,
    effectiveRoleAuthorized: live.effectiveRoleAuthorized,
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
