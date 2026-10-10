import { databaseIdentityFingerprint } from "../../lib/database-target.mjs";

function parsedConnection(url) {
  const parsed = new URL(url);
  return {
    database: decodeURIComponent(parsed.pathname.replace(/^\//, "")),
    username: decodeURIComponent(parsed.username),
  };
}

/** Verify a live TLS PostgreSQL session matches the URL without returning credentials. */
export async function verifyLiveConnection(client, connectionString, label) {
  const expected = parsedConnection(connectionString);
  const result = await client.query(`
    SELECT current_database() AS database_name,
           current_user AS role_name,
           current_setting('server_version_num') AS server_version,
           (SELECT oid::text FROM pg_database WHERE datname = current_database()) AS database_oid,
           COALESCE((SELECT ssl FROM pg_stat_ssl WHERE pid = pg_backend_pid()), false) AS tls_enabled
  `);
  const row = result.rows[0];
  if (!row || row.database_name !== expected.database || row.role_name !== expected.username) {
    throw new Error(`${label} live database identity does not match its configured connection`);
  }
  if (row.tls_enabled !== true) throw new Error(`${label} PostgreSQL connection is not protected by TLS`);
  return {
    database: row.database_name,
    role: row.role_name,
    serverVersion: row.server_version,
    databaseOid: row.database_oid,
    identityFingerprint: databaseIdentityFingerprint(connectionString),
    tlsEnabled: true,
  };
}

/** Require a source credential whose effective PostgreSQL privileges are read-only. */
export async function assertReadOnlySourceRole(client) {
  const result = await client.query(`
    WITH effective_roles AS (
      SELECT r.oid, r.rolname, r.rolsuper, r.rolcreatedb, r.rolcreaterole,
             r.rolreplication, r.rolbypassrls
        FROM pg_roles r
       WHERE r.rolname = current_user OR pg_has_role(current_user, r.oid, 'MEMBER')
    ),
    persistent_schemas AS (
      SELECT oid FROM pg_namespace
       WHERE nspname NOT IN ('pg_catalog', 'information_schema')
         AND nspname NOT LIKE 'pg_toast%'
    ),
    persistent_tables AS (
      SELECT c.oid FROM pg_class c
      JOIN pg_namespace n ON n.oid = c.relnamespace
       WHERE n.nspname NOT IN ('pg_catalog', 'information_schema')
         AND n.nspname NOT LIKE 'pg_toast%'
         AND c.relkind IN ('r', 'p', 'v', 'm', 'f')
    ),
    persistent_sequences AS (
      SELECT c.oid FROM pg_class c
      JOIN pg_namespace n ON n.oid = c.relnamespace
       WHERE n.nspname NOT IN ('pg_catalog', 'information_schema')
         AND n.nspname NOT LIKE 'pg_toast%'
         AND c.relkind = 'S'
    )
    SELECT
      COALESCE(bool_or(rolsuper OR rolcreatedb OR rolcreaterole OR rolreplication OR rolbypassrls), false) AS elevated_role,
      has_database_privilege(current_user, current_database(), 'CREATE') AS can_create_database_objects,
      EXISTS (SELECT 1 FROM persistent_schemas s WHERE has_schema_privilege(current_user, s.oid, 'CREATE')) AS can_create_schema,
      EXISTS (SELECT 1 FROM persistent_tables t WHERE
        has_table_privilege(current_user, t.oid, 'INSERT') OR
        has_table_privilege(current_user, t.oid, 'UPDATE') OR
        has_table_privilege(current_user, t.oid, 'DELETE') OR
        has_table_privilege(current_user, t.oid, 'TRUNCATE') OR
        has_table_privilege(current_user, t.oid, 'REFERENCES') OR
        has_table_privilege(current_user, t.oid, 'TRIGGER')) AS can_modify_table,
      EXISTS (SELECT 1 FROM persistent_sequences s WHERE
        has_sequence_privilege(current_user, s.oid, 'USAGE') OR
        has_sequence_privilege(current_user, s.oid, 'UPDATE')) AS can_modify_sequence
    FROM effective_roles
  `);
  const row = result.rows[0];
  if (!row || row.elevated_role || row.can_create_database_objects || row.can_create_schema || row.can_modify_table || row.can_modify_sequence) {
    throw new Error("Production source credential has effective write or elevated privileges; use a restricted read-only role");
  }
  return { readOnlyRoleVerified: true };
}
