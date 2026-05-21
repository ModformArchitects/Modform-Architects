-- ════════════════════════════════════════════════════════════
-- Modform Architects — Supabase database + RLS setup
-- Run this in your Supabase project's SQL Editor.
--
-- Security model:
--   anon         → INSERT only (public website forms)
--   authenticated → SELECT / UPDATE / DELETE on leads + SELECT on visitors
--                  (admin dashboard, after signing in via Supabase Auth)
--
-- After running this SQL, also do the one-time steps listed in
-- README.md → "Create the admin user".
-- ════════════════════════════════════════════════════════════

create table if not exists public.leads (
  id bigint primary key,
  ts timestamptz not null,
  source text,
  status text default 'new',
  name text,
  email text,
  phone text,
  project text,
  message text,
  created_at timestamptz default now()
);

create table if not exists public.visitors (
  id bigint primary key,
  ts timestamptz not null,
  page text,
  ref text,
  ua text,
  city text,
  region text,
  country text,
  ip text,
  created_at timestamptz default now()
);

create table if not exists public.customer_profiles (
  id bigint primary key,
  ts timestamptz not null,
  source text,
  name text,
  phone text,
  email text,
  stage text,
  interest text,
  created_at timestamptz default now()
);

alter table public.leads             enable row level security;
alter table public.visitors          enable row level security;
alter table public.customer_profiles enable row level security;

alter table public.visitors add column if not exists city    text;
alter table public.visitors add column if not exists region  text;
alter table public.visitors add column if not exists country text;
alter table public.visitors add column if not exists ip      text;

-- Chatbot timeline qualification (Jan 2026)
alter table public.leads add column if not exists timeline text;

-- ── Drop legacy permissive policies (re-runnable) ──
drop policy if exists "public insert leads"             on public.leads;
drop policy if exists "public insert visitors"          on public.visitors;
drop policy if exists "public insert customer profiles" on public.customer_profiles;
drop policy if exists "static admin read leads"         on public.leads;
drop policy if exists "static admin read visitors"      on public.visitors;
drop policy if exists "static admin update leads"       on public.leads;
drop policy if exists "static admin delete leads"       on public.leads;
drop policy if exists "admin read leads"                on public.leads;
drop policy if exists "admin read visitors"             on public.visitors;
drop policy if exists "admin update leads"              on public.leads;
drop policy if exists "admin delete leads"              on public.leads;
drop policy if exists "admin read customer profiles"    on public.customer_profiles;

-- ── PUBLIC: anon role can only INSERT (forms on the website) ──
create policy "public insert leads"
on public.leads for insert
to anon
with check (true);

create policy "public insert visitors"
on public.visitors for insert
to anon
with check (true);

create policy "public insert customer profiles"
on public.customer_profiles for insert
to anon
with check (true);

-- ── ADMIN: only authenticated users can read/modify ──
-- The admin dashboard signs in via Supabase Auth and uses the JWT
-- in the Authorization header.  Anyone without a valid JWT (i.e.,
-- a random visitor with just the anon key) cannot read or modify
-- any of this data.

create policy "admin read leads"
on public.leads for select
to authenticated
using (true);

create policy "admin update leads"
on public.leads for update
to authenticated
using (true)
with check (true);

create policy "admin delete leads"
on public.leads for delete
to authenticated
using (true);

create policy "admin read visitors"
on public.visitors for select
to authenticated
using (true);

create policy "admin read customer profiles"
on public.customer_profiles for select
to authenticated
using (true);
