import test from "node:test";
import assert from "node:assert/strict";
import {
  assertSeparateDatabases,
  assertBlobTokenStore,
  getDatabaseUrl,
  isAreesStagingProject,
  isDatabaseConfigured,
  STAGING_VERCEL_PROJECT_ID,
} from "../lib/database-target.mjs";
import { publicServiceEligibilityWhere } from "../lib/services/public-eligibility.mjs";
import { isAiDocumentProcessingApproved } from "../lib/partners/ai-data-processing.mjs";

const stageEnv = {
  VERCEL_PROJECT_ID: STAGING_VERCEL_PROJECT_ID,
  AREES_DATABASE_ENV: "staging",
  AREES_STAGING_DATABASE_URL: "postgresql://stage:secret@stage-db.example.test:5432/arees_stage",
  AREES_STAGING_DATABASE_HOST: "stage-db.example.test",
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

test("transfer tools reject the same database host and enforce the Staging host allowlist", () => {
  assert.throws(
    () => assertSeparateDatabases("postgresql://ro:secret@db.example.test/prod", "postgresql://stage:secret@db.example.test/stage", "db.example.test"),
    /separate database hosts/,
  );
  assert.throws(
    () => assertSeparateDatabases("postgresql://ro:secret@prod.example.test/prod", "postgresql://stage:secret@stage.example.test/stage", "other.example.test"),
    /host does not match/,
  );
  assert.doesNotThrow(
    () => assertSeparateDatabases("postgresql://ro:secret@prod.example.test/prod", "postgresql://stage:secret@stage.example.test/stage", "stage.example.test"),
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
