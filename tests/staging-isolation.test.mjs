import test from "node:test";
import assert from "node:assert/strict";
import {
  assertSeparateDatabases,
  assertBlobTokenStore,
  getDatabaseUrl,
  getMigrationDatabaseUrl,
  isAreesStagingProject,
  isDatabaseConfigured,
  STAGING_VERCEL_PROJECT_ID,
  STAGING_PRISMA_STORE_ID,
  PRODUCTION_PRISMA_STORE_ID,
} from "../lib/database-target.mjs";
import { publicServiceEligibilityWhere } from "../lib/services/public-eligibility.mjs";
import { isAiDocumentProcessingApproved } from "../lib/partners/ai-data-processing.mjs";
import { verifyLiveConnection } from "../scripts/staging/pg-safety.mjs";

const stageEnv = {
  VERCEL_PROJECT_ID: STAGING_VERCEL_PROJECT_ID,
  AREES_DATABASE_ENV: "staging",
  AREES_STAGING_DATABASE_URL: "postgresql://stage:secret@stage-db.example.test:5432/arees_stage?sslmode=require",
  AREES_STAGING_DATABASE_HOST: "stage-db.example.test",
  AREES_STAGING_DATABASE_STORE_ID: STAGING_PRISMA_STORE_ID,
};

test("only the dedicated Vercel project is labeled as a Staging license test", () => {
  assert.equal(isAreesStagingProject(stageEnv), true);
  assert.equal(isAreesStagingProject({ VERCEL_PROJECT_ID: "production-project" }), false);
});

test("Staging catalog visibility skips only the real-license relation", () => {
  const production = { partner: { status: "ACTIVE" }, license: { is: { status: "VERIFIED" } } };
  assert.deepEqual(publicServiceEligibilityWhere(true, production), { partner: { status: "ACTIVE" } });
  assert.deepEqual(publicServiceEligibilityWhere(false, production), production);
});

test("existing non-Staging projects continue to use DATABASE_URL", () => {
  assert.equal(getDatabaseUrl({ DATABASE_URL: "postgresql://app:secret@prod.example.test/app" }), "postgresql://app:secret@prod.example.test/app");
});

test("Preview deployments fail closed unless explicitly assigned an isolated database", () => {
  const preview = {
    VERCEL_ENV: "preview",
    VERCEL_PROJECT_ID: "prj_production_project",
    DATABASE_URL: "postgresql://app:secret@prod.example.test/app",
  };
  assert.throws(() => getDatabaseUrl(preview), /AREES_DATABASE_ENV=preview/);
  assert.throws(() => getDatabaseUrl({ ...preview, AREES_DATABASE_ENV: "preview" }), /dedicated database URL/);
  assert.throws(() => getDatabaseUrl({
    ...preview,
    AREES_DATABASE_ENV: "preview",
    AREES_PREVIEW_DATABASE_URL: "postgresql://app:secret@prod.example.test/app",
    AREES_PREVIEW_DATABASE_HOST: "prod.example.test",
  }), /matches DATABASE_URL/);
  assert.throws(() => getDatabaseUrl({
    ...preview,
    AREES_DATABASE_ENV: "preview",
    AREES_PREVIEW_DATABASE_URL: "postgresql://app:secret@preview.example.test/app",
    AREES_PREVIEW_DATABASE_HOST: "other.example.test",
  }), /does not match its allowlist/);
  assert.equal(getDatabaseUrl({
    ...preview,
    AREES_DATABASE_ENV: "preview",
    AREES_PREVIEW_DATABASE_URL: "postgresql://app:secret@preview.example.test/app",
    AREES_PREVIEW_DATABASE_HOST: "preview.example.test",
  }), "postgresql://app:secret@preview.example.test/app");
});

test("Staging project selects its dedicated URL even when DATABASE_URL is absent", () => {
  assert.equal(getDatabaseUrl(stageEnv), stageEnv.AREES_STAGING_DATABASE_URL);
  assert.equal(isDatabaseConfigured(stageEnv), true);
});

test("Staging accepts the Prisma integration's generated database URL key", () => {
  const generatedKeyEnv = {
    ...stageEnv,
    AREES_STAGING_DATABASE_URL: undefined,
    AREES_STAGING_DATABASE_DATABASE_URL: "postgresql://stage:secret@stage-db.example.test:5432/arees_stage",
  };
  assert.equal(getDatabaseUrl(generatedKeyEnv), generatedKeyEnv.AREES_STAGING_DATABASE_DATABASE_URL);
});

test("Prisma commands validate direct Staging identity without a public role variable", () => {
  const directOnlyEnv = {
    VERCEL_PROJECT_ID: STAGING_VERCEL_PROJECT_ID,
    AREES_DATABASE_ENV: "staging",
    AREES_STAGING_DATABASE_STORE_ID: STAGING_PRISMA_STORE_ID,
    AREES_STAGING_DATABASE_EXPECTED_NAME: "postgres",
    AREES_STAGING_DATABASE_DIRECT_URL: "postgresql://stage:secret@db.prisma.io:5432/postgres?sslmode=require",
  };
  assert.equal(getMigrationDatabaseUrl(directOnlyEnv), directOnlyEnv.AREES_STAGING_DATABASE_DIRECT_URL);
  const providerDirectAlias = {
    ...directOnlyEnv,
    AREES_STAGING_DATABASE_DIRECT_URL: undefined,
    AREES_STAGING_DATABASE_POSTGRES_URL: "postgresql://stage:secret@db.prisma.io:5432/postgres?sslmode=require",
  };
  assert.equal(getMigrationDatabaseUrl(providerDirectAlias), providerDirectAlias.AREES_STAGING_DATABASE_POSTGRES_URL);
  assert.throws(() => getMigrationDatabaseUrl(stageEnv), /dedicated direct database URL/);
  assert.throws(() => getMigrationDatabaseUrl({
    ...directOnlyEnv,
    AREES_STAGING_DATABASE_DIRECT_URL: "postgresql://other:secret@db.prisma.io:5432/otherdb?sslmode=require",
  }), /approved database identity/);
  assert.throws(() => getMigrationDatabaseUrl({
    ...directOnlyEnv,
    AREES_STAGING_DATABASE_STORE_ID: PRODUCTION_PRISMA_STORE_ID,
  }), /does not match the approved Vercel resource/);
});

test("live role verification compares against the secret URL without returning the role name", async () => {
  const client = {
    query: async () => ({ rows: [{
      database_name: "postgres",
      database_matches_connection: true,
      login_user_matches_credential: true,
      effective_role_matches_login: false,
      effective_role_authorized: true,
      server_version: "160004",
      database_oid: "16384",
      tls_enabled: true,
    }] }),
  };
  const result = await verifyLiveConnection(
    client,
    "postgresql://stage-sensitive-user:secret@db.prisma.io:5432/postgres?sslmode=require",
    "staging-test",
  );
  assert.equal(result.roleIdentityMatchesCredential, true);
  assert.equal(result.effectiveRoleMatchesLogin, false);
  assert.equal(result.effectiveRoleAuthorized, true);
  assert.equal(JSON.stringify(result).includes("stage-sensitive-user"), false);
  assert.equal(JSON.stringify(result).includes("secret"), false);
});

test("live identity diagnostics identify failed comparisons without disclosing role names", async () => {
  const client = {
    query: async () => ({ rows: [{
      database_name: "postgres",
      database_matches_connection: true,
      login_user_matches_credential: false,
      effective_role_matches_login: false,
      effective_role_authorized: true,
      tls_enabled: true,
    }] }),
  };
  await assert.rejects(
    verifyLiveConnection(client, "postgresql://secret-user:secret@db.prisma.io:5432/postgres", "staging-test"),
    (error) => {
      assert.match(error.message, /databaseMatchesConnection":true/);
      assert.match(error.message, /sessionUserMatchesCredential":false/);
      assert.match(error.message, /currentUserMatchesSessionUser":false/);
      assert.equal(error.message.includes("secret-user"), false);
      assert.equal(error.message.includes("secret@"), false);
      return true;
    },
  );
});

test("database availability checks use the same isolated Staging target", () => {
  assert.equal(isDatabaseConfigured({}), false);
  assert.equal(isDatabaseConfigured({ DATABASE_URL: "postgresql://app:secret@prod.example.test/app" }), true);
  assert.throws(() => isDatabaseConfigured({ ...stageEnv, AREES_STAGING_DATABASE_URL: undefined }), /dedicated database URL/);
});

test("Staging refuses missing environment marker, URL, or host allowlist", () => {
  assert.throws(() => getDatabaseUrl({ ...stageEnv, AREES_DATABASE_ENV: "production" }), /AREES_DATABASE_ENV/);
  assert.throws(() => getDatabaseUrl({ ...stageEnv, AREES_STAGING_DATABASE_URL: undefined }), /dedicated database URL/);
  assert.throws(() => getDatabaseUrl({ ...stageEnv, AREES_STAGING_DATABASE_HOST: undefined }), /dedicated database URL/);
});

test("Staging refuses a host mismatch and a conflicting generic DATABASE_URL", () => {
  assert.throws(() => getDatabaseUrl({ ...stageEnv, AREES_STAGING_DATABASE_HOST: "prod-db.example.test" }), /host does not match/);
  assert.throws(() => getDatabaseUrl({ ...stageEnv, DATABASE_URL: "postgresql://app:secret@prod-db.example.test/app" }), /conflicting DATABASE_URL/);
});

test("Staging requires the already-approved Prisma resource ID, even on shared provider hosts", () => {
  const sharedHostEnv = {
    ...stageEnv,
    AREES_STAGING_DATABASE_URL: "postgresql://stage:secret@pooled.db.prisma.io:5432/postgres?sslmode=require",
    AREES_STAGING_DATABASE_HOST: "pooled.db.prisma.io",
  };
  assert.equal(getDatabaseUrl(sharedHostEnv), sharedHostEnv.AREES_STAGING_DATABASE_URL);
  assert.throws(() => getDatabaseUrl({ ...sharedHostEnv, AREES_STAGING_DATABASE_STORE_ID: PRODUCTION_PRISMA_STORE_ID }), /does not match the approved/);
  assert.throws(() => getDatabaseUrl({ ...sharedHostEnv, AREES_STAGING_DATABASE_STORE_ID: undefined }), /resource ID/);
});

test("transfer tools reject the same database host and enforce the Staging host allowlist", () => {
  const approvedStores = { sourceStoreId: PRODUCTION_PRISMA_STORE_ID, targetStoreId: STAGING_PRISMA_STORE_ID };
  assert.throws(
    () => assertSeparateDatabases("postgresql://same:secret@db.example.test/postgres", "postgresql://same:secret@db.example.test/postgres", "db.example.test", approvedStores),
    /connection identities must be different/,
  );
  assert.throws(
    () => assertSeparateDatabases("postgresql://same:secret@db.prisma.io:5432/postgres", "postgresql://same:secret@pooled.db.prisma.io:5432/postgres", "pooled.db.prisma.io", approvedStores),
    /connection identities must be different/,
  );
  assert.throws(
    () => assertSeparateDatabases("postgresql://ro:secret@prod.example.test/prod", "postgresql://stage:secret@stage.example.test/stage", "other.example.test", approvedStores),
    /host does not match/,
  );
  assert.doesNotThrow(
    () => assertSeparateDatabases("postgresql://ro:source-secret@pooled.db.prisma.io:5432/postgres?sslmode=require", "postgresql://stage:stage-secret@pooled.db.prisma.io:5432/postgres?sslmode=require", "pooled.db.prisma.io", approvedStores),
  );
  assert.throws(
    () => assertSeparateDatabases("postgresql://ro:source-secret@pooled.db.prisma.io:5432/postgres?sslmode=require", "postgresql://stage:stage-secret@pooled.db.prisma.io:5432/postgres?sslmode=require", "pooled.db.prisma.io", { sourceStoreId: STAGING_PRISMA_STORE_ID, targetStoreId: STAGING_PRISMA_STORE_ID }),
    /Source database resource ID/,
  );
});

test("Blob transfer rejects tokens scoped to the wrong store", () => {
  assert.equal(assertBlobTokenStore("vercel_blob_rw_euuB9sJFEyMP9s6Q_secret", "store_euuB9sJFEyMP9s6Q"), true);
  assert.throws(() => assertBlobTokenStore("vercel_blob_rw_8WwOhPXOPgpCID8u_secret", "store_euuB9sJFEyMP9s6Q"), /does not belong/);
  assert.throws(() => assertBlobTokenStore("not-a-blob-token", "store_euuB9sJFEyMP9s6Q"), /does not belong/);
});

test("AI document processing stays disabled unless explicitly approved", () => {
  assert.equal(isAiDocumentProcessingApproved({}), false);
  assert.equal(isAiDocumentProcessingApproved({ AI_DOCUMENT_PROCESSING_APPROVED: "false" }), false);
  assert.equal(isAiDocumentProcessingApproved({ AI_DOCUMENT_PROCESSING_APPROVED: "true" }), true);
});
