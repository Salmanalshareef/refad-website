-- Replaces the two publishing booleans with a single audience, so the two can
-- no longer disagree. A website-published item was always visible to members
-- in practice, which made "غير منشور للأعضاء" read as a lie next to it.
--
--   none             not published anywhere
--   site_and_members public website and the member portal
--   members_only     the member portal only
--
-- Existing rows carry over: published to the site becomes site_and_members,
-- members-only stays members_only, everything else none.
--
-- Safe to re-run.

do $$
begin
  if not exists (select 1 from pg_type where typname = 'news_audience') then
    create type news_audience as enum ('none', 'site_and_members', 'members_only');
  end if;
end $$;

alter table news_items
  add column if not exists audience news_audience not null default 'none';

do $$
begin
  if exists (
    select 1 from information_schema.columns
     where table_name = 'news_items' and column_name = 'is_published'
  ) then
    update news_items
       set audience = case
             when is_published then 'site_and_members'::news_audience
             when is_published_to_members then 'members_only'::news_audience
             else 'none'::news_audience
           end
     where audience = 'none';

    alter table news_items
      drop column is_published,
      drop column is_published_to_members;
  end if;
end $$;
