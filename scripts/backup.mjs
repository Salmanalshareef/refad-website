#!/usr/bin/env node
/**
 * Writes an independent dump of the database to ./backups.
 *
 * Neon's point-in-time restore lives inside the same account as the data, so
 * it does not cover the cases that lose everything at once: the project being
 * deleted, the account lapsing, or credentials being compromised. This produces
 * a file that exists somewhere else entirely, which is the only kind of backup
 * that survives those.
 *
 *   npm run backup          custom-format dump, compressed (restore with pg_restore)
 *   npm run backup -- --sql plain SQL instead (restore with psql, readable in an editor)
 *
 * DATABASE_URL is read from the environment, falling back to .env.local.
 */

import { spawnSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";

const OUT_DIR = "backups";

function databaseUrl() {
  if (process.env.DATABASE_URL) return process.env.DATABASE_URL;
  if (existsSync(".env.local")) {
    const match = readFileSync(".env.local", "utf8").match(
      /^DATABASE_URL\s*=\s*"?([^"\r\n]+)"?/m
    );
    if (match) return match[1];
  }
  throw new Error("DATABASE_URL is not set, and .env.local does not define it.");
}

/**
 * Neon hands out a pooled host by default, and a dump taken through the pooler
 * is not reliable — PgBouncer does not hold the single session pg_dump needs
 * for a consistent snapshot. The direct endpoint is the same host without the
 * "-pooler" suffix.
 */
function directHost(hostname) {
  return hostname.replace("-pooler", "");
}

function humanSize(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

const plainSql = process.argv.includes("--sql");

const probe = spawnSync("pg_dump", ["--version"], { encoding: "utf8", shell: true });
if (probe.status !== 0) {
  console.error(
    [
      "pg_dump was not found.",
      "",
      "It ships with the PostgreSQL client tools. On Windows the usual route is",
      "the EDB installer (postgresql.org/download/windows) — during setup you can",
      "untick the server itself and install only Command Line Tools. Afterwards add",
      "its bin folder to PATH, e.g. C:\\Program Files\\PostgreSQL\\18\\bin.",
      "",
      "Install version 18 or newer: pg_dump refuses to dump from a server newer",
      "than itself, and this database runs PostgreSQL 18.",
    ].join("\n")
  );
  process.exit(1);
}

const url = new URL(databaseUrl());
const stamp = new Date().toISOString().slice(0, 16).replace(/[:T]/g, "-");
const file = join(OUT_DIR, `refad-${stamp}.${plainSql ? "sql" : "dump"}`);

if (!existsSync(OUT_DIR)) mkdirSync(OUT_DIR, { recursive: true });

console.log(`pg_dump   ${probe.stdout.trim()}`);
console.log(`host      ${directHost(url.hostname)}`);
console.log(`database  ${url.pathname.slice(1)}`);
console.log(`output    ${file}\n`);

// The connection details go through the environment rather than the command
// line, so the password never appears in the process list.
const result = spawnSync(
  "pg_dump",
  [
    "--no-owner",
    "--no-acl",
    ...(plainSql ? ["--format=plain"] : ["--format=custom"]),
    "--file",
    file,
  ],
  {
    stdio: "inherit",
    shell: true,
    env: {
      ...process.env,
      PGHOST: directHost(url.hostname),
      PGPORT: url.port || "5432",
      PGUSER: decodeURIComponent(url.username),
      PGPASSWORD: decodeURIComponent(url.password),
      PGDATABASE: url.pathname.slice(1),
      PGSSLMODE: "require",
    },
  }
);

if (result.status !== 0) {
  console.error(
    "\nThe dump failed. If the message mentions a server version mismatch, the" +
      "\ninstalled pg_dump is older than the database and needs upgrading to 18+."
  );
  process.exit(result.status ?? 1);
}

console.log(`\nDone — ${file} (${humanSize(statSync(file).size)})`);
console.log(
  plainSql
    ? `Restore with:  psql "$DATABASE_URL" -f ${file}`
    : `Restore with:  pg_restore --no-owner --no-acl -d "$DATABASE_URL" ${file}`
);
console.log(
  "\nThis file holds every member's personal data and their password hashes." +
    "\nKeep it somewhere private; ./backups is git-ignored so it is never committed."
);
