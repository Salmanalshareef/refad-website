-- Says whether a spouse is a husband or a wife.
--
-- Without it the label had to be inferred, and there was nothing to infer it
-- from: the spouses table carries a name, not a sex, so every entry read as
-- "زوج" whoever it was.
--
-- Stored on the marriage rather than derived from the member's own sex,
-- because the record is about the person being named, and because a record
-- that states a fact is easier to trust than one that calculates it from
-- something else that may itself be wrong.
--
-- The default exists only so the column can be NOT NULL on a table that may
-- already hold rows; it is dropped immediately afterwards, so every insert
-- from here on has to say which it is rather than quietly falling back to
-- "wife".
--
-- Safe to re-run.

do $$
begin
  if not exists (select 1 from pg_type where typname = 'spouse_relation') then
    create type spouse_relation as enum ('husband', 'wife');
  end if;
end $$;

alter table spouses
  add column if not exists relation spouse_relation not null default 'wife';

alter table spouses
  alter column relation drop default;
