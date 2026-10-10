import pg from "pg";
import { assertSeparateDatabases } from "../../lib/database-target.mjs";

const sourceUrl = process.env.SOURCE_READ_ONLY_DATABASE_URL;
const stagingUrl = process.env.AREES_STAGING_DATABASE_URL;
const expectedHost = process.env.AREES_STAGING_DATABASE_HOST;
if (!sourceUrl || !stagingUrl || !expectedHost) {
  throw new Error("Provide source read-only URL, dedicated staging URL, and staging host allowlist");
}
if (process.env.VERCEL_PROJECT_ID !== "prj_gkTSFNIfCgVwslbCUHsKtNhuwULk") {
  throw new Error("Connection checks must run from the isolated Arees Staging project context");
}
const hosts = assertSeparateDatabases(sourceUrl, stagingUrl, expectedHost);
const { Client } = pg;

async function probe(label, connectionString) {
  const client = new Client({ connectionString, connectionTimeoutMillis: 8000, query_timeout: 8000 });
  try {
    await client.connect();
    await client.query("BEGIN READ ONLY");
    const { rows } = await client.query(
      "SELECT current_database() AS database_name, current_setting('transaction_read_only') AS transaction_read_only, inet_server_addr()::text AS server_address",
    );
    if (rows[0]?.transaction_read_only !== "on") throw new Error(`${label} connection did not enter a read-only transaction`);
    if (label === "staging" && rows[0]?.database_name.toLowerCase().includes("production")) {
      throw new Error("Staging connection resolves to a database named as production");
    }
    await client.query("ROLLBACK");
    return { label, database: rows[0].database_name, configuredHost: label === "source" ? hosts.sourceHost : hosts.targetHost, connected: true };
  } finally {
    await client.end().catch(() => {});
  }
}

try {
  const source = await probe("source", sourceUrl);
  const staging = await probe("staging", stagingUrl);
  console.log(JSON.stringify({ source, staging, writesPerformed: false, queries: "SELECT only; read-only transactions" }));
} catch (error) {
  console.error(error instanceof Error ? error.message : "Connection checks failed");
  process.exitCode = 1;
}
