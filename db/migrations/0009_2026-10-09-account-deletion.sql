-- Account closure as a soft delete.
--
-- Deactivating keeps the profile row and everything hanging off it — requests,
-- subscriptions, family tree links — so a member who comes back is the same
-- person rather than a new one. Deleting the row would cascade that history
-- away and make re-registration a fresh, empty account.
--
-- Safe to re-run.

alter table profiles
  add column if not exists is_active boolean not null default true;

do $$
begin
  if not exists (select 1 from pg_type where typname = 'account_deletion_request_status') then
    create type account_deletion_request_status as enum ('pending', 'approved', 'rejected');
  end if;
end $$;

create table if not exists account_deletion_requests (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references profiles (id) on delete cascade,
  reason text,
  status account_deletion_request_status not null default 'pending',
  admin_comment text,
  created_at timestamptz not null default now(),
  resolved_at timestamptz
);

-- The admin queue reads pending requests newest first.
create index if not exists account_deletion_requests_status_idx
  on account_deletion_requests (status, created_at desc);
