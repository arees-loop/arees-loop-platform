import test from "node:test";
import assert from "node:assert/strict";
import { neoleapReadiness } from "../lib/payments/neoleap-readiness.ts";

const keys=["NEOLEAP_TRANPORTAL_ID","NEOLEAP_TRANPORTAL_PASSWORD","NEOLEAP_RESOURCE_KEY","NEOLEAP_API_BASE_URL","NEOLEAP_INQUIRY_URL","NEOLEAP_CALLBACK_ORIGIN","NEOLEAP_CALLBACK_URL","FIXIE_URL"];
const saved=Object.fromEntries([...keys,"NEOLEAP_MODE","NEOLEAP_ENABLED","VERCEL_ENV","VERCEL_GIT_COMMIT_REF"].map(key=>[key,process.env[key]]));
function restore(){for(const [key,value] of Object.entries(saved)){if(value===undefined)delete process.env[key];else process.env[key]=value;}}
test.afterEach(restore);

test("stays disabled by default and requires the static egress proxy",()=>{
  for(const key of [...keys,"NEOLEAP_MODE","NEOLEAP_ENABLED"])delete process.env[key];
  process.env.VERCEL_ENV="preview";
  process.env.VERCEL_GIT_COMMIT_REF="feature/neoleap-payment-release-base-20261105";
  assert.equal(neoleapReadiness().configured,false);
  process.env.FIXIE_URL="https://proxy.example:443";
  assert.equal(neoleapReadiness().configured,false);
});

test("only enables the sandbox on its exact Preview branch with all required settings",()=>{
  for(const key of keys)process.env[key]="test-value";
  process.env.NEOLEAP_MODE="sandbox";
  process.env.NEOLEAP_ENABLED="true";
  process.env.VERCEL_ENV="preview";
  process.env.VERCEL_GIT_COMMIT_REF="feature/neoleap-payment-release-base-20261105";
  assert.equal(neoleapReadiness().configured,true);
  process.env.VERCEL_ENV="production";
  assert.equal(neoleapReadiness().configured,false);
});
