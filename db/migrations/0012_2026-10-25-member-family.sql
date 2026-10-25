-- Spouses, and a mother's link to her children.
--
-- The tree records fathers and nothing else: father_id is a reference, while
-- mother_name is free text, and a marriage is not recorded anywhere. So a
-- woman's children were not connected to her, and no member had a spouse.
--
-- spouses is its own table rather than a column because a member may have more
-- than one, and because a spouse usually marries in from another family and so
-- has no record in this tree. Name and an optional national ID are enough to
-- say who she is without inventing a tree entry for her.
--
-- mother_id sits alongside mother_name rather than replacing it: the existing
-- free text is what 212 records already carry, and rewriting it into
-- references is a data exercise, not a migration.
--
-- Note for whoever reads the tree code next: the tree itself stays strictly
-- patrilineal. mother_id tells the member's own family view who her children
-- are; it does not place a child in the tree, because a child with no father
-- recorded has no position in a male line.
--
-- Safe to re-run.

create table if not exists spouses (
  id uuid primary key default gen_random_uuid(),
  member_id uuid not null references family_members (id) on delete cascade,
  full_name text not null,
  national_id text,
  created_at timestamptz not null default now()
);

-- Every read is "the spouses of this member".
create index if not exists spouses_member_idx on spouses (member_id);

alter table family_members
  add column if not exists mother_id uuid references family_members (id) on delete set null;

-- Mirrors the father_id lookup, which the children query now also uses.
create index if not exists family_members_mother_idx on family_members (mother_id);
