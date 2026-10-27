-- Staging-only additive operational schema foundation.
-- No existing rows are deleted or rewritten.
begin;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  role text not null default 'petugas',
  full_name text,
  facility text,
  created_at timestamptz not null default now()
);
create table if not exists public.diseases (
  id text primary key, name text, metadata jsonb not null default '{}'::jsonb
);

alter table public.investigations
  add column if not exists outbreak_type text,
  add column if not exists disease_id text,
  add column if not exists province text,
  add column if not exists district text,
  add column if not exists subdistrict text,
  add column if not exists village text,
  add column if not exists facility text,
  add column if not exists start_date date,
  add column if not exists status text,
  add column if not exists metadata jsonb not null default '{}'::jsonb;
alter table public.cases add column if not exists metadata jsonb not null default '{}'::jsonb;

create table if not exists public.contacts (
  id text primary key, owner_id uuid references auth.users(id) on delete set null,
  investigation_id text not null references public.investigations(id) on delete cascade,
  index_case_id text references public.cases(id) on delete set null,
  contact_name text, relation text, last_contact_date date, monitoring_status text,
  follow_up text, metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);
create table if not exists public.specimens (
  id text primary key, owner_id uuid references auth.users(id) on delete set null,
  investigation_id text not null references public.investigations(id) on delete cascade,
  case_id text references public.cases(id) on delete set null,
  specimen_type text, collected_at date, lab_name text, result text, status text,
  metadata jsonb not null default '{}'::jsonb, created_at timestamptz not null default now()
);
create table if not exists public.field_visits (
  id text primary key, owner_id uuid references auth.users(id) on delete set null,
  investigation_id text not null references public.investigations(id) on delete cascade,
  activity text, subject text, visit_at date, officer_name text,
  latitude double precision, longitude double precision, location_text text,
  finding text, action_taken text, media jsonb not null default '[]'::jsonb,
  sync_status text not null default 'pending', metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);
create table if not exists public.alerts (
  id text primary key, owner_id uuid references auth.users(id) on delete set null,
  disease_id text, epi_week text, alert_date date, reporting_facility text,
  count integer not null default 0, verification_result text,
  metadata jsonb not null default '{}'::jsonb, created_at timestamptz not null default now()
);

alter table public.questionnaires
  add column if not exists disease_id text,
  add column if not exists source_reference text,
  add column if not exists created_by uuid references auth.users(id) on delete set null;
alter table public.public_surveys
  add column if not exists created_by uuid references auth.users(id) on delete set null;
alter table public.public_surveys
  alter column public_token set default replace(gen_random_uuid()::text, '-', '');

create table if not exists public.registration_requests (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null,
  full_name text not null, email text not null, whatsapp text, institution text,
  payment_reference text, payment_amount numeric, note text,
  status text not null default 'pending', created_at timestamptz not null default now()
);
create table if not exists public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  plan_code text not null default 'free', status text not null default 'pending',
  starts_at timestamptz, expires_at timestamptz, activated_at timestamptz,
  created_at timestamptz not null default now()
);
create table if not exists public.audit_log (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid references auth.users(id) on delete set null,
  action text not null, entity_type text, entity_id text,
  metadata jsonb not null default '{}'::jsonb, created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;
alter table public.diseases enable row level security;
alter table public.contacts enable row level security;
alter table public.specimens enable row level security;
alter table public.field_visits enable row level security;
alter table public.alerts enable row level security;
alter table public.registration_requests enable row level security;
alter table public.subscriptions enable row level security;
alter table public.audit_log enable row level security;
commit;
