-- Splits news publishing into two independent audiences: the public website
-- and the member portal. An item can go to either, both, or neither.
--
-- Existing rows default to false: they were published to the website, and
-- whether they should also reach members inside the portal is a new editorial
-- decision rather than something to assume.
--
-- Safe to re-run.

alter table news_items
  add column if not exists is_published_to_members boolean not null default false;
