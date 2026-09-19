-- Replaces the fixed collects_* checkboxes with editable field definitions, so
-- an admin can rename a field ("اسم الأم" -> anything), change what it accepts,
-- add new ones and drop them, all without a code change.
--
-- The attachment stays a separate per-type toggle rather than a field, because
-- member-entered fields are text or numeric while an attachment is a file.
--
-- Answers are stored as a snapshot on the request: each entry keeps the label
-- as it read at submission time, so renaming a field later cannot rewrite the
-- history of requests already submitted.
--
-- Safe to re-run.

do $$
begin
  if not exists (select 1 from pg_type where typname = 'member_request_field_kind') then
    create type member_request_field_kind as enum ('text', 'number', 'long_text', 'applicant_name');
  end if;
end $$;

create table if not exists member_request_type_fields (
  id uuid primary key default gen_random_uuid(),
  type_id uuid not null references member_request_types (id) on delete cascade,
  label text not null,
  kind member_request_field_kind not null default 'text',
  -- For kind = 'applicant_name': which word of the applicant's own name fills
  -- this read-only field (1 = first word, 2 = second, ...).
  applicant_name_index int,
  is_required boolean not null default true,
  order_index int not null default 0
);

create index if not exists member_request_type_fields_type_idx
  on member_request_type_fields (type_id, order_index);

alter table member_requests
  add column if not exists answers jsonb not null default '[]'::jsonb;

-- collects_image -> collects_attachment (guarded so the file can be re-run).
do $$
begin
  if exists (
    select 1 from information_schema.columns
     where table_name = 'member_request_types' and column_name = 'collects_image'
  ) then
    alter table member_request_types rename column collects_image to collects_attachment;
  end if;
end $$;

-- Turn each built-in type's fixed flags into editable field rows, once.
do $$
declare
  has_flags boolean;
begin
  select exists (
    select 1 from information_schema.columns
     where table_name = 'member_request_types' and column_name = 'collects_details'
  ) into has_flags;

  if not has_flags then
    return;
  end if;

  insert into member_request_type_fields (type_id, label, kind, applicant_name_index, is_required, order_index)
  select t.id, 'الاسم الأول', 'text', null, true, 0
    from member_request_types t
   where t.collects_person_names
     and not exists (select 1 from member_request_type_fields f where f.type_id = t.id);

  insert into member_request_type_fields (type_id, label, kind, applicant_name_index, is_required, order_index)
  select t.id, v.label, 'applicant_name', v.idx, false, v.idx
    from member_request_types t
    cross join (values ('الاسم الثاني', 1), ('الاسم الثالث', 2), ('الاسم الرابع', 3)) as v(label, idx)
   where t.collects_person_names
     and not exists (
       select 1 from member_request_type_fields f
        where f.type_id = t.id and f.kind = 'applicant_name' and f.applicant_name_index = v.idx
     );

  insert into member_request_type_fields (type_id, label, kind, applicant_name_index, is_required, order_index)
  select t.id, 'رقم الهوية الوطنية', 'number', null, true, 4
    from member_request_types t
   where t.collects_national_id
     and not exists (select 1 from member_request_type_fields f
                      where f.type_id = t.id and f.label = 'رقم الهوية الوطنية');

  insert into member_request_type_fields (type_id, label, kind, applicant_name_index, is_required, order_index)
  select t.id, 'اسم الأم كاملاً', 'text', null, true, 5
    from member_request_types t
   where t.collects_mother_name
     and not exists (select 1 from member_request_type_fields f
                      where f.type_id = t.id and f.label = 'اسم الأم كاملاً');

  insert into member_request_type_fields (type_id, label, kind, applicant_name_index, is_required, order_index)
  select t.id, 'تفاصيل الطلب', 'long_text', null, true, 6
    from member_request_types t
   where t.collects_details
     and not exists (select 1 from member_request_type_fields f
                      where f.type_id = t.id and f.kind = 'long_text');

  alter table member_request_types
    drop column collects_details,
    drop column collects_person_names,
    drop column collects_national_id,
    drop column collects_mother_name;
end $$;
