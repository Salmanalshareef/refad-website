-- Lets a member keep their birth date off the family tree.
--
-- Defaults to true so nothing changes for anyone who does not touch the
-- toggle. The flag only affects the member-facing tree; the admin family
-- members screen reads the records directly and still shows everything.
--
-- Safe to re-run.

alter table profiles
  add column if not exists show_birth_date boolean not null default true;
