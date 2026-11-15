-- Disposable PostgreSQL fixture for the Production candidate migration.
-- Contains synthetic schema only; never connect this script to Supabase Production.

create role anon nologin;
create role authenticated nologin;
create role service_role nologin bypassrls;

create schema auth;
create table auth.users (
  id uuid primary key,
  email text unique,
  email_confirmed_at timestamptz,
  created_at timestamptz not null default now()
);

create table public.profiles (
  id uuid primary key,
  role text not null
);

create table public.registration_requests (
  id uuid primary key default gen_random_uuid(),
  user_id uuid,
  full_name text not null,
  email text not null,
  whatsapp text,
  institution text,
  payment_reference text,
  note text,
  status text not null default 'pending',
  reviewed_by uuid,
  reviewed_at timestamptz,
  created_at timestamptz not null default now()
);

create table public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  plan_code text not null,
  status text not null,
  starts_at timestamptz not null,
  expires_at timestamptz not null,
  activated_at timestamptz,
  created_at timestamptz not null default now()
);

create table public.audit_log (
  id bigint generated always as identity primary key,
  actor_id uuid,
  action text not null,
  entity_type text not null,
  entity_id text not null,
  details jsonb,
  created_at timestamptz not null default now()
);

create table public.investigations (
  id text primary key,
  owner_id uuid not null
);

create table public.cases (
  id text primary key,
  investigation_id text references public.investigations(id) on delete set null,
  owner_id uuid not null
);

create table public.contacts (
  id text primary key,
  investigation_id text references public.investigations(id) on delete set null,
  owner_id uuid not null,
  index_case_id text references public.cases(id) on delete set null
);

create table public.specimens (
  id text primary key,
  investigation_id text references public.investigations(id) on delete set null,
  owner_id uuid not null,
  case_id text references public.cases(id) on delete set null
);

create table public.field_visits (
  id text primary key,
  investigation_id text references public.investigations(id) on delete set null,
  owner_id uuid not null
);

create table public.public_surveys (
  id uuid primary key,
  investigation_id text references public.investigations(id) on delete no action,
  created_by uuid not null
);

create table public.survey_responses (
  id uuid primary key,
  survey_id uuid not null references public.public_surveys(id) on delete no action
);

grant usage on schema public, auth to anon, authenticated, service_role;
grant all on all tables in schema public, auth to service_role;
