-- Turns the three hardcoded administrative request types into managed rows so
-- an admin can add, rename, reorder and hide them without a code change.
--
-- The `member_requests.type` enum column is kept as the behaviour key (which
-- bespoke form to render); `type_id` records the type actually chosen. A type
-- an admin creates has no key and is composed from the collects_* flags, all
-- of which map onto columns member_requests already has.
--
-- Safe to re-run.

create table if not exists member_request_types (
  id uuid primary key default gen_random_uuid(),
  key member_request_type unique,
  title text not null,
  notice text,
  collects_details boolean not null default true,
  collects_image boolean not null default false,
  collects_person_names boolean not null default false,
  collects_national_id boolean not null default false,
  collects_mother_name boolean not null default false,
  order_index int not null default 0,
  is_published boolean not null default true
);

alter table member_requests
  add column if not exists type_id uuid references member_request_types (id) on delete set null;

-- Seed the built-ins with exactly the fields each one collects today.
insert into member_request_types (key, title, notice, collects_details, collects_image,
                                  collects_person_names, collects_national_id,
                                  collects_mother_name, order_index)
values
  ('news', 'إضافة خبر', null, true, true, false, false, false, 0),
  ('family_member', 'إضافة فرد للعائلة (غير مسجل)',
   'لضمان قبول طلب إضافة فرد العائلة، يجب أن تتم إضافته من قِبل والده.',
   false, false, true, true, true, 1),
  ('other', 'طلب آخر', null, true, false, false, false, false, 2)
on conflict (key) do nothing;

-- Point existing requests at their type.
update member_requests r
   set type_id = t.id
  from member_request_types t
 where t.key = r.type
   and r.type_id is null;
