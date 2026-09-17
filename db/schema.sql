-- Refad Family Fund — schema for Neon Postgres
-- Run this in the Neon SQL editor (or via psql) against a fresh database.

create extension if not exists "pgcrypto";

-- ── Enums ────────────────────────────────────────────────────────────────
create type profile_role as enum ('member', 'admin');
create type report_type as enum ('financial', 'performance', 'minutes');
create type subscription_status as enum ('active', 'pending', 'expired', 'rejected');
create type support_request_status as enum ('draft', 'pending', 'rejected', 'completed');
create type contact_message_status as enum ('new', 'read', 'archived');
create type gender as enum ('male', 'female');
create type news_category as enum ('family', 'fund');
create type task_status as enum ('todo', 'in_progress', 'done');
create type member_request_type as enum ('news', 'family_member', 'other');
create type member_request_status as enum ('pending', 'rejected', 'completed');
create type registration_request_status as enum ('pending', 'approved', 'rejected');
create type initiative_date_mode as enum ('single', 'period');
create type marital_status as enum ('single', 'married', 'divorced', 'widowed');
create type education_level as enum ('secondary', 'bachelor', 'master', 'doctorate');
create type employment_status as enum (
  'public_sector', 'private_sector', 'nonprofit_sector', 'business_owner',
  'job_seeker', 'student', 'retired', 'homemaker'
);

-- ── Tables ───────────────────────────────────────────────────────────────
create table users (
  id uuid primary key default gen_random_uuid(),
  email text unique,
  password_hash text not null,
  created_at timestamptz not null default now()
);

create table family_branches (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  parent_branch_id uuid references family_branches (id) on delete set null
);

create table family_members (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid references users (id) on delete set null,
  full_name text not null,
  national_id text,
  gender gender not null,
  birth_date date,
  death_date date,
  is_living boolean not null default true,
  father_id uuid references family_members (id) on delete set null,
  mother_name text,
  branch_id uuid references family_branches (id) on delete set null,
  photo_url text
);

create table profiles (
  id uuid primary key references users (id) on delete cascade,
  member_number serial unique,
  full_name text not null,
  phone text not null unique,
  national_id text,
  gender gender,
  birth_date date,
  avatar_url text,
  marital_status marital_status,
  education_level education_level,
  employment_status employment_status,
  role profile_role not null default 'member',
  family_member_id uuid references family_members (id) on delete set null,
  created_at timestamptz not null default now()
);

create table board_members (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  role_title text not null,
  photo_url text,
  order_index int not null default 0,
  bio text
);

create table initiative_types (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  icon text,
  order_index int not null default 0,
  is_published boolean not null default true,
  is_requestable boolean not null default true
);

create table initiatives (
  id uuid primary key default gen_random_uuid(),
  initiative_type_id uuid not null references initiative_types (id) on delete cascade,
  title text not null,
  description text not null,
  requirements text,
  date_mode initiative_date_mode not null default 'period',
  start_date date,
  end_date date,
  age_group text,
  target_audience text,
  icon text,
  order_index int not null default 0,
  is_published boolean not null default true,
  is_requestable boolean not null default true
);

create table reports (
  id uuid primary key default gen_random_uuid(),
  type report_type not null,
  title text not null,
  file_url text not null,
  period_label text,
  published_date date not null default current_date
);

create sequence subscription_number_seq;

create table subscriptions (
  id uuid primary key default gen_random_uuid(),
  subscription_number int unique,
  profile_id uuid not null references profiles (id) on delete cascade,
  fiscal_year int not null,
  amount numeric(10, 2) not null,
  receipt_url text,
  notes text,
  status subscription_status not null default 'pending',
  admin_comment text,
  requested_date date not null default current_date,
  approved_date date,
  end_date date,
  created_at timestamptz not null default now()
);

create table fund_bank_info (
  id uuid primary key default gen_random_uuid(),
  account_name text not null default '',
  bank_name text not null default '',
  account_number text not null default '',
  iban text not null default '',
  updated_at timestamptz not null default now()
);

insert into fund_bank_info (account_name, bank_name, account_number, iban) values ('', '', '', '');

create table support_requests (
  id uuid primary key default gen_random_uuid(),
  request_number serial unique,
  profile_id uuid not null references profiles (id) on delete cascade,
  initiative_id uuid references initiatives (id) on delete set null,
  description text,
  attachment_url text,
  terms_accepted boolean not null default false,
  status support_request_status not null default 'pending',
  admin_comment text,
  created_at timestamptz not null default now()
);

create table contact_messages (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  mobile text not null,
  subject text not null,
  message text not null,
  status contact_message_status not null default 'new',
  created_at timestamptz not null default now()
);

create table news_items (
  id uuid primary key default gen_random_uuid(),
  category news_category not null,
  title text not null,
  body text not null,
  image_url text,
  is_published boolean not null default true,
  published_date date not null default current_date
);

create table videos (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  video_url text not null,
  is_published boolean not null default true,
  published_date date not null default current_date
);

create table magazine_issues (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  issue_label text,
  file_url text not null,
  is_published boolean not null default true,
  published_date date not null default current_date
);

create table tasks (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  assignee_id uuid references profiles (id) on delete set null,
  status task_status not null default 'todo',
  due_date date,
  created_at timestamptz not null default now()
);

create table member_requests (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references profiles (id) on delete cascade,
  type member_request_type not null,
  details text,
  image_url text,
  first_name text,
  second_name text,
  third_name text,
  fourth_name text,
  national_id text,
  mother_name text,
  status member_request_status not null default 'pending',
  admin_comment text,
  created_at timestamptz not null default now()
);

create table registration_requests (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  national_id text not null,
  phone text not null,
  email text,
  gender gender,
  birth_date date,
  password_hash text not null,
  status registration_request_status not null default 'pending',
  admin_comment text,
  created_at timestamptz not null default now()
);

-- Authorization is enforced in the application layer (lib/auth.ts), not via
-- Postgres row-level security — plain Postgres has no auth.uid() equivalent.
