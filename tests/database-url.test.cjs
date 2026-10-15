const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const vm = require("node:vm");
const ts = require("typescript");

const source = fs.readFileSync("lib/database-url.ts", "utf8");
const js = ts.transpileModule(source, {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
  reportDiagnostics: true,
});
const errors = (js.diagnostics || []).filter(x => x.category === ts.DiagnosticCategory.Error);
assert.equal(errors.length, 0, "Database resolver must compile as TypeScript");

const exportsObject = {};
vm.runInNewContext(js.outputText, {
  exports: exportsObject,
  process: { env: {} },
  URL,
  Error,
});
const resolve = exportsObject.resolveDatabaseUrl;
const prod = "postgresql://user:pw@prod.example:5432/arees";
const isolated = "postgresql://user:pw@preview.example:5432/arees";

test("Production uses DATABASE_URL and ignores staging override", () => {
  assert.equal(resolve({ VERCEL_ENV: "production", DATABASE_URL: prod, AREES_STAGING_DATABASE_DATABASE_URL: isolated }), prod);
});
test("Preview refuses to use production URL as fallback", () => {
  assert.throws(() => resolve({ VERCEL_ENV: "preview", DATABASE_URL: prod }), /Isolated Preview/);
});
test("Preview selects separate database", () => {
  assert.equal(resolve({ VERCEL_ENV: "preview", DATABASE_URL: prod, AREES_PREVIEW_DATABASE_URL: isolated }), isolated);
});
test("Preview rejects identical target even with different credentials", () => {
  assert.throws(() => resolve({ VERCEL_ENV: "preview", DATABASE_URL: prod, AREES_PREVIEW_DATABASE_URL: "postgresql://other:pw@prod.example:5432/arees" }), /matches production/);
});
test("Preview rejects loopback database address", () => {
  assert.throws(() => resolve({ VERCEL_ENV: "preview", DATABASE_URL: prod, AREES_PREVIEW_DATABASE_URL: "postgresql://a:b@127.0.0.1:5432/arees" }), /loopback/);
});

test("Preview ignores staging override and uses explicitly isolated preview URL", () => {
  assert.equal(resolve({
    VERCEL_ENV: "preview",
    DATABASE_URL: prod,
    AREES_PREVIEW_DATABASE_URL: isolated,
    AREES_STAGING_DATABASE_DATABASE_URL: "postgresql://user:pw@staging.example:5432/arees",
  }), isolated);
});
test("Preview cannot use staging URL as fallback when preview URL is absent", () => {
  assert.throws(() => resolve({
    VERCEL_ENV: "preview",
    DATABASE_URL: prod,
    AREES_STAGING_DATABASE_DATABASE_URL: isolated,
  }), /Isolated Preview/);
});
