-- One-time codes for the self-service password reset sent over SMS.
--
-- The code is stored hashed, like a password: a leaked table should not hand
-- anyone a working reset. Rows are short-lived, single-use, and carry an
-- attempt counter so a six-digit code cannot be guessed by brute force within
-- its ten-minute window.
--
-- Safe to re-run.

create table if not exists password_reset_codes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users (id) on delete cascade,
  code_hash text not null,
  expires_at timestamptz not null,
  attempts int not null default 0,
  consumed_at timestamptz,
  created_at timestamptz not null default now()
);

-- Verification looks up the newest live code for a user on every attempt.
create index if not exists password_reset_codes_user_idx
  on password_reset_codes (user_id, created_at desc);
