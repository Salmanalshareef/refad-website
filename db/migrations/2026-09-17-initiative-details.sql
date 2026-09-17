-- Adds the initiative detail fields backing the new per-initiative page:
-- a date that is either one specific day or an application period, plus
-- age group and target audience. Safe to re-run.
--
-- Existing rows keep their end_date and become 'period' with no start_date,
-- which still renders as "التقديم حتى <date>" — the meaning they had before.

do $$
begin
  if not exists (select 1 from pg_type where typname = 'initiative_date_mode') then
    create type initiative_date_mode as enum ('single', 'period');
  end if;
end $$;

alter table initiatives
  add column if not exists date_mode initiative_date_mode not null default 'period',
  add column if not exists start_date date,
  add column if not exists age_group text,
  add column if not exists target_audience text;
