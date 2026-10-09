-- Sliding-window rate limiting for the unauthenticated endpoints.
--
-- Kept in Postgres rather than in memory because the app runs serverless: each
-- invocation can be a fresh instance in a different region, so a counter held
-- in process memory would reset constantly and limit nothing. One row per
-- attempt, counted over a window, is exact across every instance.
--
-- Rows are pruned per key on write, so the table stays bounded without a cron
-- job: each insert clears anything already outside that key's window.
--
-- Safe to re-run.

create table if not exists rate_limit_events (
  id uuid primary key default gen_random_uuid(),
  bucket text not null,
  identifier text not null,
  created_at timestamptz not null default now()
);

-- Every check counts recent rows for one bucket and identifier.
create index if not exists rate_limit_events_lookup_idx
  on rate_limit_events (bucket, identifier, created_at desc);
