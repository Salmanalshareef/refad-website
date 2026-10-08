#!/usr/bin/env node
/**
 * Applies everything in db/migrations that has not run yet, in filename order.
 *
 *   npm run migrate              apply pending migrations
 *   npm run migrate -- --dry     list what would run, change nothing
 *   npm run migrate -- --baseline  record them all as applied without running
 *
 * --baseline exists for a database that was brought up to date by hand before
 * this ledger existed. Re-running those files would be wrong rather than
 * merely wasteful: 0004 adds a column that 0005 drops.
 *
 * Each file is recorded in schema_migrations once it succeeds, so running this
 * twice is a no-op. The migrations are written to be safe to re-run anyway
 * (`if not exists`, guarded `do $$` blocks), but the ledger means a fresh
 * environment does not depend on that holding.
 *
 * DATABASE_URL is read from the environment, falling back to .env.local for
 * local use. Nothing here prints the connection string.
 */
import { readdirSync, readFileSync, existsSync } from "node:fs";
import { join } from "node:path";

import { neon } from "@neondatabase/serverless";

const MIGRATIONS_DIR = "db/migrations";
const dryRun = process.argv.includes("--dry");
const baseline = process.argv.includes("--baseline");

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
 * Splits a file into statements, keeping dollar-quoted blocks whole: a `do $$
 * … end $$;` body contains semicolons that must not be treated as boundaries.
 */
function statements(source) {
  const parts = [];
  const blocks = /do \$\$[\s\S]*?end \$\$;/g;
  let last = 0;
  let match;
  while ((match = blocks.exec(source)) !== null) {
    parts.push({ plain: source.slice(last, match.index) });
    parts.push({ block: match[0] });
    last = match.index + match[0].length;
  }
  parts.push({ plain: source.slice(last) });

  const out = [];
  for (const part of parts) {
    if (part.block) {
      out.push(part.block.replace(/;$/, ""));
      continue;
    }
    for (const chunk of part.plain.split(/;\s*$/m)) {
      const clean = chunk.replace(/^\s*--.*$/gm, "").trim();
      if (clean) out.push(clean);
    }
  }
  return out;
}

const sql = neon(databaseUrl());
const run = (text) => sql(Object.assign([text], { raw: [text] }));

await run(`
  create table if not exists schema_migrations (
    filename text primary key,
    applied_at timestamptz not null default now()
  )
`);

const applied = new Set(
  (await run(`select filename from schema_migrations`)).map((r) => r.filename)
);

const files = readdirSync(MIGRATIONS_DIR)
  .filter((f) => f.endsWith(".sql"))
  .sort();

const pending = files.filter((f) => !applied.has(f));

console.log(`${files.length} migration file(s), ${applied.size} already recorded.`);

if (pending.length === 0) {
  console.log("Nothing to apply.");
  process.exit(0);
}

if (baseline) {
  console.log(`\nRecording ${pending.length} as applied, without running them:`);
  for (const file of pending) {
    await sql`INSERT INTO schema_migrations (filename) VALUES (${file})`;
    console.log(`  ${file}`);
  }
  console.log("\nDone. The ledger now matches the database.");
  process.exit(0);
}

console.log(`\n${dryRun ? "Would apply" : "Applying"} ${pending.length}:`);

for (const file of pending) {
  const source = readFileSync(join(MIGRATIONS_DIR, file), "utf8");
  const parts = statements(source);

  if (dryRun) {
    console.log(`  ${file}  (${parts.length} statement(s))`);
    continue;
  }

  process.stdout.write(`  ${file} ... `);
  try {
    for (const statement of parts) await run(statement);
    await run(
      `insert into schema_migrations (filename) values ('${file.replace(/'/g, "''")}')`
    );
    console.log("ok");
  } catch (error) {
    console.log("FAILED");
    console.error(`\n${error.message}\n`);
    console.error(
      "Stopped. Later migrations were not attempted, and this one was not recorded."
    );
    process.exit(1);
  }
}

console.log("\nDone.");
