-- Sample content for local/demo use. Run after schema.sql.
-- The first admin account is created separately — see README.md — via the
-- bootstrap script, since it needs a bcrypt hash generated in Node.

-- ── Board of Trustees ────────────────────────────────────────────────────
insert into board_members (full_name, role_title, order_index, bio) values
  ('عبدالله آل معجب', 'رئيس مجلس الأمناء', 1, 'يقود مجلس الأمناء منذ تأسيس الصندوق، بخبرة تمتد لأكثر من عشرين عامًا في العمل المؤسسي.'),
  ('سلطان آل معجب', 'نائب رئيس مجلس الأمناء', 2, 'يشرف على متابعة تنفيذ استراتيجيات الصندوق ومبادراته.'),
  ('فهد آل معجب', 'أمين الصندوق (المسؤول المالي)', 3, 'مسؤول عن الإدارة المالية وإعداد التقارير الدورية للصندوق.'),
  ('ماجد آل معجب', 'رئيس اللجنة التنفيذية', 4, 'يتولى الإشراف على تنفيذ المبادرات والبرامج اليومية.'),
  ('نواف آل معجب', 'عضو مجلس الأمناء', 5, null),
  ('تركي آل معجب', 'عضو مجلس الأمناء', 6, null);

-- ── Initiative types & their sub-services ───────────────────────────────
insert into initiative_types (title, order_index) values
  ('الدعم الاجتماعي', 1),
  ('التفوق العلمي', 2),
  ('اللقاءات والفعاليات', 3),
  ('الاستثمار والتنمية', 4);

with t as (select id from initiative_types where title = 'الدعم الاجتماعي')
insert into initiatives (initiative_type_id, title, description, order_index)
select t.id, v.title, v.description, v.order_index
from t, (values
  ('الإغاثة الطارئة', 'دعم عاجل لأفراد الأسرة في الحالات الطارئة والظروف الاستثنائية.', 1),
  ('إعانة الزواج', 'مساهمة مالية للمقبلين على الزواج من أبناء الأسرة.', 2),
  ('المساعدة الصحية', 'دعم تكاليف العلاج للحالات الصحية غير المغطاة.', 3)
) as v(title, description, order_index);

with t as (select id from initiative_types where title = 'التفوق العلمي')
insert into initiatives (initiative_type_id, title, description, order_index)
select t.id, 'برنامج التفوق العلمي', 'تكريم الأوائل من الطلاب والمواهب الواعدة في الأسرة.', 1 from t;

with t as (select id from initiative_types where title = 'اللقاءات والفعاليات')
insert into initiatives (initiative_type_id, title, description, order_index)
select t.id, 'اللقاءات والفعاليات العائلية', 'تنظيم لقاءات دورية ومناسبات اجتماعية لتعزيز التواصل.', 1 from t;

with t as (select id from initiative_types where title = 'الاستثمار والتنمية')
insert into initiatives (initiative_type_id, title, description, order_index)
select t.id, 'الاستثمار وتنمية الأصول', 'مبادرات لتنمية أصول الصندوق وضمان استدامته المالية.', 1 from t;

-- ── Reports ──────────────────────────────────────────────────────────────
-- file_url values are placeholders; replaced with real Vercel Blob URLs
-- once report files are uploaded via the admin panel.
insert into reports (type, title, period_label, published_date, file_url) values
  ('financial', 'التقرير المالي السنوي', '2025', '2026-01-15', 'https://example.com/reports/financial-2025.pdf'),
  ('financial', 'التقرير المالي النصف سنوي', 'النصف الأول 2025', '2025-07-10', 'https://example.com/reports/financial-h1-2025.pdf'),
  ('performance', 'تقرير الإنجازات السنوي', '2025', '2026-01-20', 'https://example.com/reports/performance-2025.pdf'),
  ('minutes', 'محضر اجتماع الجمعية العمومية', 'يناير 2026', '2026-01-25', 'https://example.com/reports/minutes-2026-01.pdf');

-- ── Family branches & sample tree ────────────────────────────────────────
with root_branch as (
  insert into family_branches (name) values ('الفرع الرئيسي') returning id
)
insert into family_members (full_name, gender, birth_date, branch_id)
select 'آل معجب الجد الأول', 'male', '1930-01-01', id from root_branch;

with grandfather as (
  select id from family_members where full_name = 'آل معجب الجد الأول'
), branch as (
  select id from family_branches where name = 'الفرع الرئيسي'
)
insert into family_members (full_name, gender, birth_date, father_id, branch_id)
select v.full_name, v.gender::gender, v.birth_date::date, grandfather.id, branch.id
from grandfather, branch,
  (values
    ('عبدالله آل معجب', 'male', '1955-03-10'),
    ('سلطان آل معجب', 'male', '1958-06-22'),
    ('نورة آل معجب', 'female', '1960-09-05')
  ) as v(full_name, gender, birth_date);

with father as (
  select id from family_members where full_name = 'عبدالله آل معجب'
), branch as (
  select id from family_branches where name = 'الفرع الرئيسي'
)
insert into family_members (full_name, gender, birth_date, father_id, branch_id)
select v.full_name, v.gender::gender, v.birth_date::date, father.id, branch.id
from father, branch,
  (values
    ('فهد آل معجب', 'male', '1985-02-14'),
    ('ماجد آل معجب', 'male', '1988-11-30'),
    ('هند آل معجب', 'female', '1990-04-18')
  ) as v(full_name, gender, birth_date);
