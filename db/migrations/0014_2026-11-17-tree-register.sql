-- Separates the fund's register of the نسب from a member's own family record.
--
-- A child can be entered two ways. On the family tree page, which is the
-- register an administrator maintains. Or inside a member's عائلة العضو, which
-- is that member's own household. Both wrote the same row, so a child entered
-- the second way joined the headline count and appeared in the أفراد الأسرة
-- table as an orphan — a first name with no father, and no mother either,
-- because that table shows mother_name while عائلة العضو sets mother_id.
--
-- in_tree tells them apart. False means the row belongs to a member's family
-- view and nowhere else: not counted, not listed in the register's table, not
-- drawn in the diagram — the standing a spouse has always had. It is still a
-- family_members row, so the member's عائلتي tab, the administrator's عائلة
-- العضو list and a mother's panel in the tree all find it unchanged. What
-- changes is where it is shown, not where it is kept.
--
-- Defaults to true, so every record already in the table stays in the register.
-- Nothing in a row says which screen created it, so children added through
-- عائلة العضو before this cannot be found retroactively; they have to be
-- removed and re-entered to be reclassified.
--
-- Safe to re-run.

alter table family_members
  add column if not exists in_tree boolean not null default true;

-- Every read of the register filters on this.
create index if not exists family_members_in_tree_idx on family_members (in_tree);
