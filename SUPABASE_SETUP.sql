-- EcolineArchitect database setup for Supabase
-- Run this in Supabase SQL Editor, then paste your project URL and anon key
-- into database.js.

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

alter table public.leads enable row level security;
alter table public.visitors enable row level security;
alter table public.customer_profiles enable row level security;

alter table public.visitors add column if not exists city text;
alter table public.visitors add column if not exists region text;
alter table public.visitors add column if not exists country text;
alter table public.visitors add column if not exists ip text;

drop policy if exists "public insert leads" on public.leads;
drop policy if exists "public insert visitors" on public.visitors;
drop policy if exists "public insert customer profiles" on public.customer_profiles;
drop policy if exists "static admin read leads" on public.leads;
drop policy if exists "static admin read visitors" on public.visitors;
drop policy if exists "static admin update leads" on public.leads;
drop policy if exists "static admin delete leads" on public.leads;

-- Public website forms need insert access.
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

-- The current admin page is static, so it reads with the anon key.
-- For production, move admin reads behind a server/edge function before launch.
create policy "static admin read leads"
on public.leads for select
to anon
using (true);

create policy "static admin read visitors"
on public.visitors for select
to anon
using (true);

-- Static admin status/delete actions. For production, replace these with
-- authenticated server-side admin actions or Supabase Edge Functions.
create policy "static admin update leads"
on public.leads for update
to anon
using (true)
with check (true);

create policy "static admin delete leads"
on public.leads for delete
to anon
using (true);
