import bcrypt from "bcryptjs";
import pg from "pg";
import { getMigrationDatabaseUrl, STAGING_VERCEL_PROJECT_ID } from "../../lib/database-target.mjs";
import { verifyLiveConnection } from "./pg-safety.mjs";

const [mode = "--dry-run"] = process.argv.slice(2);
if (!["--dry-run", "--apply"].includes(mode)) throw new Error("Use --dry-run or --apply");
if (process.env.VERCEL_PROJECT_ID !== STAGING_VERCEL_PROJECT_ID || process.env.AREES_DATABASE_ENV !== "staging") {
  throw new Error("Test fixtures are restricted to the isolated Arees Staging project");
}
if (mode === "--apply" && process.env.AREES_ALLOW_STAGING_SEED !== "YES") {
  throw new Error("Test fixture writes require AREES_ALLOW_STAGING_SEED=YES after approval");
}

const connectionString = getMigrationDatabaseUrl();
if (!connectionString) throw new Error("Dedicated Staging database is not configured");
const password = process.env.AREES_STAGING_TEST_PASSWORD;
if (mode === "--apply" && (!password || password.length < 16)) {
  throw new Error("Set a strong staging-only test password of at least 16 characters");
}

const fixtures = {
  partner: { id: "arees-staging-test-partner", legalNameAr: "شريك تجريبي لمنصة أريس لوب", legalNameEn: "Arees Loop Test Partner" },
  users: [
    { id: "arees-staging-customer", email: "customer@areesloop.example.test", role: "CUSTOMER", firstName: "Test", lastName: "Customer", adminPermissions: null },
    { id: "arees-staging-partner-owner", email: "owner@areesloop.example.test", role: "PARTNER_OWNER", firstName: "Test", lastName: "Owner", adminPermissions: null },
    { id: "arees-staging-partner-staff", email: "staff@areesloop.example.test", role: "PARTNER_STAFF", firstName: "Test", lastName: "Staff", adminPermissions: null },
    { id: "arees-staging-content-admin", email: "content-admin@areesloop.example.test", role: "ADMIN", firstName: "Test", lastName: "Admin", adminPermissions: ["CONTENT_EXPERIENCES"] },
  ],
  service: { id: "arees-staging-test-service", nameAr: "جولة تجريبية في المدينة", category: "HERITAGE", descriptionAr: "برنامج اصطناعي للاختبار فقط؛ لا يمثل خدمة فعلية.", price: "10.00" },
};

const stableJson = (value) => {
  if (Array.isArray(value)) return value.map(stableJson);
  if (value && typeof value === "object") {
    return Object.fromEntries(Object.keys(value).sort().map((key) => [key, stableJson(value[key])]));
  }
  return value;
};

if (mode === "--dry-run") {
  console.log(JSON.stringify({ mode, partnerId: fixtures.partner.id, serviceId: fixtures.service.id, accounts: fixtures.users.map(({ email, role }) => ({ email, role })), writesPerformed: false }));
  process.exit(0);
}

const { Client } = pg;
const client = new Client({ connectionString, connectionTimeoutMillis: 8000, query_timeout: 10000 });
const passwordHash = await bcrypt.hash(password, 12);
const now = new Date();

try {
  await client.connect();
  const live = await verifyLiveConnection(client, connectionString, "staging-fixtures");
  await client.query("BEGIN");
  const identity = await client.query("SELECT current_database() AS database_name, current_setting('transaction_read_only') AS read_only");
  if (identity.rows[0]?.read_only !== "off" || identity.rows[0]?.database_name.toLowerCase().includes("production")) {
    throw new Error("Refusing to seed a read-only or production-named database");
  }

  await client.query(
    `INSERT INTO "Partner" ("id", "partnerType", "legalNameAr", "legalNameEn", "publicName", "status", "createdAt", "updatedAt")
     VALUES ($1, 'BUSINESS'::"PartnerType", $2, $3, $3, 'ACTIVE'::"PartnerStatus", $4, $4)
     ON CONFLICT ("id") DO NOTHING`,
    [fixtures.partner.id, fixtures.partner.legalNameAr, fixtures.partner.legalNameEn, now],
  );
  const partner = await client.query(`SELECT "legalNameAr", "status"::text FROM "Partner" WHERE "id" = $1`, [fixtures.partner.id]);
  if (partner.rows[0]?.legalNameAr !== fixtures.partner.legalNameAr || partner.rows[0]?.status !== "ACTIVE") {
    throw new Error("Staging test partner ID is already used by different data");
  }

  for (const user of fixtures.users) {
    await client.query(
      `INSERT INTO "User" ("id", "email", "passwordHash", "firstName", "lastName", "role", "status", "adminPermissions", "emailVerifiedAt", "createdAt", "updatedAt")
       VALUES ($1, $2, $3, $4, $5, $6::"UserRole", 'ACTIVE'::"UserStatus", $7::jsonb, $8, $8, $8)
       ON CONFLICT ("id") DO NOTHING`,
      [user.id, user.email, passwordHash, user.firstName, user.lastName, user.role, JSON.stringify(user.adminPermissions), now],
    );
    const existing = await client.query(`SELECT "email", "role"::text, "status"::text, "adminPermissions" FROM "User" WHERE "id" = $1`, [user.id]);
    if (
      existing.rows[0]?.email !== user.email ||
      existing.rows[0]?.role !== user.role ||
      existing.rows[0]?.status !== "ACTIVE" ||
      JSON.stringify(stableJson(existing.rows[0]?.adminPermissions ?? null)) !== JSON.stringify(stableJson(user.adminPermissions))
    ) {
      throw new Error(`Test account ${user.id} conflicts with existing staging data`);
    }
  }

  const ownerPermissions = { role: "OWNER", services: { manage: true }, finances: { view: true }, bookings: { view: true }, team: { view: true, manage: true } };
  const staffPermissions = { role: "EMPLOYEE", services: { manage: false }, finances: { view: false }, bookings: { view: false }, team: { view: false, manage: false } };
  for (const [userId, permissions] of [["arees-staging-partner-owner", ownerPermissions], ["arees-staging-partner-staff", staffPermissions]]) {
    await client.query(
      `INSERT INTO "PartnerMember" ("id", "partnerId", "userId", "permissions", "isActive", "createdAt", "updatedAt")
       VALUES ($1, $2, $3, $4::jsonb, true, $5, $5)
       ON CONFLICT ("partnerId", "userId") DO NOTHING`,
      [`member-${userId}`, fixtures.partner.id, userId, JSON.stringify(permissions), now],
    );
    const membership = await client.query(`SELECT "permissions", "isActive" FROM "PartnerMember" WHERE "partnerId" = $1 AND "userId" = $2`, [fixtures.partner.id, userId]);
    if (!membership.rows[0]?.isActive || JSON.stringify(stableJson(membership.rows[0]?.permissions)) !== JSON.stringify(stableJson(permissions))) {
      throw new Error(`Test membership ${userId} conflicts with existing staging permissions`);
    }
  }

  await client.query(
    `INSERT INTO "Service" ("id", "partnerId", "nameAr", "category", "descriptionAr", "basePrice", "vatRate", "finalPrice", "status", "createdAt", "updatedAt")
     VALUES ($1, $2, $3, $4, $5, $6::numeric, 0, $6::numeric, 'PUBLISHED'::"ServiceStatus", $7, $7)
     ON CONFLICT ("id") DO NOTHING`,
    [fixtures.service.id, fixtures.partner.id, fixtures.service.nameAr, fixtures.service.category, fixtures.service.descriptionAr, fixtures.service.price, now],
  );
  const service = await client.query(`SELECT "partnerId", "nameAr" FROM "Service" WHERE "id" = $1`, [fixtures.service.id]);
  if (service.rows[0]?.partnerId !== fixtures.partner.id || service.rows[0]?.nameAr !== fixtures.service.nameAr) {
    throw new Error("Staging test service ID is already used by different data");
  }

  await client.query("COMMIT");
  console.log(JSON.stringify({ mode, partnerId: fixtures.partner.id, serviceId: fixtures.service.id, accountCount: fixtures.users.length, targetDatabaseOid: live.databaseOid, tlsEnabled: live.tlsEnabled, passwordProvidedBy: "AREES_STAGING_TEST_PASSWORD", secretsPrinted: false }));
} catch (error) {
  await client.query("ROLLBACK").catch(() => {});
  console.error(error instanceof Error ? error.message : "Staging fixtures failed");
  process.exitCode = 1;
} finally {
  await client.end().catch(() => {});
}
