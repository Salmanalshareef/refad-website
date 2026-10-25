-- Lets an administrator hide any member's birth date from the family tree.
--
-- profiles.show_birth_date already exists, but it only covers members who have
-- an account and it is theirs to set. Most of the tree is people who never
-- registered — and some who have died — so there was no way to withhold a date
-- for them at all. This column sits on the tree record itself, so it covers
-- everyone in the tree.
--
-- The two are read together rather than one overriding the other: the date
-- shows only when both allow it. An administrator can therefore hide anyone's,
-- but cannot reveal a date a member chose to hide — which is what the privacy
-- policy promises them.
--
-- Defaults to true so nothing that is visible today disappears on deploy.
--
-- Safe to re-run.

alter table family_members
  add column if not exists show_birth_date boolean not null default true;
