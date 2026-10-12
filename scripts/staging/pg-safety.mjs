function parsedConnection(url) {
  const parsed = new URL(url);
  return {
    database: decodeURIComponent(parsed.pathname.replace(/^\//, "")),
    username: decodeURIComponent(parsed.username),
  };
}

/** Verify the client TLS hop and, when applicable, PostgreSQL's backend TLS view. */
export async function verifyLiveConnection(client, connectionString, label, { serverTlsPolicy = "required" } = {}) {
  const expected = parsedConnection(connectionString);
  const tlsSocket = client.connection?.stream;
  const clientTlsEncrypted = tlsSocket?.encrypted === true;
  const clientTlsCertificateVerified = tlsSocket?.authorized === true;
  if (!clientTlsEncrypted || !clientTlsCertificateVerified) {
    throw new Error(`${label} client TLS verification failed: ${JSON.stringify({
      clientTlsEncrypted,
      clientTlsCertificateVerified,
      serverReportedTls: null,
    })}`);
  }
  let result;
  try {
    result = await client.query(`
    SELECT current_database() AS database_name,
           current_database()::text = $2::text AS database_matches_connection,
           session_user::text = $1::text AS login_user_matches_credential,
           octet_length($1::text) = char_length($1::text) AS credential_username_is_ascii,
           octet_length($1::text) > current_setting('max_identifier_length')::int AS credential_username_exceeds_identifier_limit,
           octet_length(session_user::text) = current_setting('max_identifier_length')::int AS session_user_at_identifier_limit,
           (octet_length($1::text) = char_length($1::text) AND
            octet_length($1::text) > current_setting('max_identifier_length')::int AND
            octet_length(session_user::text) = current_setting('max_identifier_length')::int AND
            session_user::text = left($1::text, current_setting('max_identifier_length')::int)) AS session_user_matches_truncated_credential,
           current_user::text = session_user::text AS effective_role_matches_login,
           (current_user = session_user OR pg_has_role(session_user, current_user, 'MEMBER')) AS effective_role_authorized,
           current_setting('server_version_num') AS server_version,
           (SELECT oid::text FROM pg_database WHERE datname = current_database()) AS database_oid,
           (SELECT ssl FROM pg_stat_ssl WHERE pid = pg_backend_pid()) AS tls_enabled
    `, [expected.username, expected.database]);
  } catch {
    // Never surface provider/driver errors verbatim: some clients include the
    // connection identity in diagnostics.
    throw new Error(`${label} could not read the live PostgreSQL session identity`);
  }
  const row = result.rows[0];
  const roleIdentityMatchesCredential = row?.login_user_matches_credential === true || (
    row?.credential_username_is_ascii === true &&
    row?.credential_username_exceeds_identifier_limit === true &&
    row?.session_user_at_identifier_limit === true &&
    row?.session_user_matches_truncated_credential === true
  );
  if (!row || !row.database_matches_connection || !row.effective_role_authorized || !row.database_oid) {
    const diagnostics = {
      databaseMatchesConnection: row?.database_matches_connection === true,
      credentialUsernameMatchesSessionRole: row?.login_user_matches_credential === true,
      credentialUsernameTruncatedByPostgres: row?.session_user_matches_truncated_credential === true && row?.credential_username_is_ascii === true && row?.credential_username_exceeds_identifier_limit === true && row?.session_user_at_identifier_limit === true,
      currentUserMatchesSessionUser: row?.effective_role_matches_login === true,
      currentUserAuthorizedForSession: row?.effective_role_authorized === true,
      liveDatabaseIdentityAvailable: Boolean(row?.database_oid),
      clientTlsEncrypted,
      clientTlsCertificateVerified,
      serverReportedTls: row?.tls_enabled === true,
    };
    throw new Error(`${label} live identity check failed: ${JSON.stringify(diagnostics)}`);
  }
  let authenticationIdentityAvailable = false;
  let authenticationIdentityMatchesCredential = false;
  if (Number(row.server_version) >= 160000) {
    try {
      const auth = await client.query(`
        SELECT system_user IS NOT NULL AS authentication_identity_available,
               CASE WHEN position(':' in system_user::text) > 0
                    THEN substring(system_user::text from position(':' in system_user::text) + 1) = $1::text
                    ELSE false END AS authentication_identity_matches_credential
      `, [expected.username]);
      authenticationIdentityAvailable = auth.rows[0]?.authentication_identity_available === true;
      authenticationIdentityMatchesCredential = auth.rows[0]?.authentication_identity_matches_credential === true;
    } catch {
      // The provider may restrict this diagnostic. PostgreSQL defines
      // system_user as the authentication identity presented before a role is
      // assigned; Prisma does not document that it equals the URL username.
      // It is not a resource-binding proof, and its raw value is never returned.
    }
  }
  const tlsDiagnostics = {
    clientTlsEncrypted,
    clientTlsCertificateVerified,
    serverReportedTls: row.tls_enabled === true ? true : row.tls_enabled === false ? false : null,
    databaseMatchesConnection: row.database_matches_connection === true,
    credentialUsernameMatchesSessionRole: row.login_user_matches_credential === true,
    credentialUsernameTruncatedByPostgres: row.session_user_matches_truncated_credential === true && row.credential_username_is_ascii === true && row.credential_username_exceeds_identifier_limit === true && row.session_user_at_identifier_limit === true,
    roleIdentityMatchesCredential,
    currentUserMatchesSessionUser: row.effective_role_matches_login === true,
    currentUserAuthorizedForSession: row.effective_role_authorized === true,
    authenticationIdentityAvailable,
    authenticationIdentityMatchesCredential,
  };
  const serverReportedTls = row.tls_enabled === true ? true : row.tls_enabled === false ? false : null;
  if (serverTlsPolicy === "required" && serverReportedTls !== true) {
    throw new Error(`${label} backend TLS evidence is inconsistent; refusing database operations: ${JSON.stringify(tlsDiagnostics)}`);
  }
  if (serverTlsPolicy !== "required" && serverTlsPolicy !== "prisma-proxy") {
    throw new Error(`${label} has an unsupported TLS topology policy`);
  }
  return {
    database: row.database_name,
    // Prisma documents URL credentials as generated database-user credentials,
    // but does not document a guarantee that either PostgreSQL's assigned role
    // or system_user equals the URL username. Both comparisons are diagnostic.
    credentialUsernameMatchesSessionRole: row.login_user_matches_credential === true,
    credentialUsernameTruncatedByPostgres: row.session_user_matches_truncated_credential === true && row.credential_username_is_ascii === true && row.credential_username_exceeds_identifier_limit === true && row.session_user_at_identifier_limit === true,
    roleIdentityMatchesCredential,
    authenticationIdentityAvailable,
    authenticationIdentityMatchesCredential,
    effectiveRoleMatchesLogin: row.effective_role_matches_login === true,
    effectiveRoleAuthorized: row.effective_role_authorized === true,
    serverVersion: row.server_version,
    databaseOid: row.database_oid,
    // Prisma's Postgres-aware proxy terminates the client protocol connection
    // and opens a separate upstream connection. This is the verified client
    // hop; serverReportedTls below describes PostgreSQL's backend hop.
    tlsEnabled: clientTlsEncrypted && clientTlsCertificateVerified,
    serverReportedTls,
    clientTlsEncrypted,
    clientTlsCertificateVerified,
  };
}

/** Bind a live connection to independent identity values read in Prisma Console. */
export function assertExpectedStagingIdentity(live, env = process.env) {
  const expectedDatabase = env.AREES_STAGING_DATABASE_EXPECTED_NAME;
  const expectedDatabaseOid = env.AREES_STAGING_DATABASE_EXPECTED_OID;
  if (!expectedDatabase || (expectedDatabaseOid && !/^\d+$/.test(expectedDatabaseOid))) {
    throw new Error("Staging requires the approved database name and, when configured, a numeric OID corroboration");
  }
  const checks = {
    databaseNameMatchesExpected: live?.database === expectedDatabase,
    // PostgreSQL database OIDs are local identifiers, not globally unique.
    // If supplied, use one only as a secondary same-cluster corroboration.
    databaseOidMatchesExpected: expectedDatabaseOid ? String(live?.databaseOid) === expectedDatabaseOid : null,
    credentialUsernameMatchesSessionRole: live?.credentialUsernameMatchesSessionRole === true,
    credentialUsernameTruncatedByPostgres: live?.credentialUsernameTruncatedByPostgres === true,
    authenticationIdentityMatchesCredential: live?.authenticationIdentityMatchesCredential === true,
    roleIdentityMatchesCredential: live?.roleIdentityMatchesCredential === true || live?.authenticationIdentityMatchesCredential === true,
    sessionRoleAuthorized: live?.effectiveRoleAuthorized === true,
  };
  if (!checks.databaseNameMatchesExpected || (expectedDatabaseOid && !checks.databaseOidMatchesExpected) || !checks.roleIdentityMatchesCredential || !checks.sessionRoleAuthorized) {
    throw new Error(`Live Staging identity attestation failed: ${JSON.stringify(checks)}`);
  }
  return checks;
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
