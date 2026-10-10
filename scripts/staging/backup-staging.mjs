import { chmod, mkdir, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { spawn } from "node:child_process";
import { getMigrationDatabaseUrl, STAGING_PRISMA_STORE_ID } from "../../lib/database-target.mjs";

const maxBytes = 50 * 1024 * 1024;
const storeId = process.env.AREES_STAGING_DATABASE_STORE_ID;
const expectedDatabase = process.env.AREES_STAGING_DATABASE_EXPECTED_NAME;
const expectedRole = process.env.AREES_STAGING_DATABASE_EXPECTED_ROLE;
const passphrase = process.env.AREES_STAGING_BACKUP_PASSPHRASE;
const url = new URL(getMigrationDatabaseUrl());
if (storeId !== STAGING_PRISMA_STORE_ID || url.hostname !== "db.prisma.io") {
  throw new Error("Backup target is not the approved direct Staging database");
}
if (!expectedDatabase || !expectedRole || decodeURIComponent(url.pathname.slice(1)) !== expectedDatabase || decodeURIComponent(url.username) !== expectedRole) {
  throw new Error("Backup target does not match the approved Staging database identity");
}
if (!passphrase || passphrase.length < 32) throw new Error("Set a unique backup encryption passphrase of at least 32 characters");

const escapePgpass = (value) => value.replaceAll("\\", "\\\\").replaceAll(":", "\\:").replaceAll("\n", "");
const tempDir = await mkdir(path.join(os.tmpdir(), `arees-stage-backup-${process.pid}`), { recursive: true }).then(() => path.join(os.tmpdir(), `arees-stage-backup-${process.pid}`));
const pgpassPath = path.join(tempDir, ".pgpass");
const dumpPath = path.join(tempDir, "staging.dump");
const artifactDir = path.resolve(process.env.RUNNER_TEMP || os.tmpdir(), "arees-stage-backup");
const encryptedPath = path.join(artifactDir, "staging-pre-migration.dump.gpg");
await mkdir(artifactDir, { recursive: true });
await writeFile(pgpassPath, `${escapePgpass(url.hostname)}:${url.port || "5432"}:${escapePgpass(expectedDatabase)}:${escapePgpass(expectedRole)}:${escapePgpass(decodeURIComponent(url.password))}\n`, { mode: 0o600 });
await chmod(pgpassPath, 0o600);

function run(command, args, options = {}) {
  return new Promise((resolve, reject) => {
    const { stdinText, ...spawnOptions } = options;
    const child = spawn(command, args, { stdio: ["pipe", "ignore", "pipe"], ...spawnOptions });
    let stderr = "";
    child.stderr.on("data", (part) => { stderr += part.toString(); });
    child.on("error", reject);
    child.on("close", (code) => code === 0 ? resolve() : reject(new Error(`${command} failed (${code}): ${stderr.slice(-2000)}`)));
    if (stdinText) child.stdin.end(stdinText);
    else child.stdin.end();
  });
}

try {
  await run("pg_dump", ["--host", url.hostname, "--port", url.port || "5432", "--username", expectedRole, "--dbname", expectedDatabase, "--format=custom", "--no-owner", "--no-acl", "--file", dumpPath], {
    env: { PATH: process.env.PATH, HOME: process.env.HOME, PGPASSFILE: pgpassPath, PGSSLMODE: "verify-full", PGCONNECT_TIMEOUT: "10", PGAPPNAME: "arees-staging-pre-migration-backup" },
  });
  const { stat } = await import("node:fs/promises");
  const info = await stat(dumpPath);
  if (info.size === 0 || info.size > maxBytes) throw new Error("Staging backup is empty or exceeds the 50 MiB Actions artifact safety limit");
  await run("gpg", ["--batch", "--yes", "--pinentry-mode", "loopback", "--passphrase-fd", "0", "--symmetric", "--cipher-algo", "AES256", "--output", encryptedPath, dumpPath], {
    stdinText: `${passphrase}\n`,
    env: { PATH: process.env.PATH, HOME: process.env.HOME },
  });
  const { createHash } = await import("node:crypto");
  const { readFile } = await import("node:fs/promises");
  const encrypted = await readFile(encryptedPath);
  console.log(JSON.stringify({ target: "staging", resourceId: STAGING_PRISMA_STORE_ID, encryptedBackup: path.basename(encryptedPath), encryptedBytes: encrypted.length, sha256: createHash("sha256").update(encrypted).digest("hex"), encryption: "GPG AES-256", includesProductionData: false, secretsPrinted: false }));
} finally {
  await rm(tempDir, { recursive: true, force: true });
  await rm(dumpPath, { force: true });
}
