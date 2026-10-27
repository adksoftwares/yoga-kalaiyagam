-- Yoga Kalaiyagam: initial Supabase schema
-- Apply in Supabase SQL Editor. Review policies before using real student data.
create extension if not exists pgcrypto;

create or replace function public.is_yoga_admin()
returns boolean
language sql
stable
as $$
  select coalesce((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin', false);
$$;

create table if not exists public.events (
  id bigint primary key,
  titleTa text not null,
  titleEn text not null,
  titleSi text not null,
  date date not null,
  time text,
  location text not null,
  category text not null,
  img text,
  desc text,
  created_at timestamptz not null default now()
);

create table if not exists public.gallery (
  id bigint primary key,
  title text not null,
  meta text,
  category text not null,
  img text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.memberships (
  id uuid primary key default gen_random_uuid(),
  reg_id text not null unique,
  full_name text not null,
  phone text not null,
  email text,
  age integer,
  gender text,
  batch text not null,
  branch text,
  selected_plan text not null,
  health text,
  address text,
  status text not null default 'pending' check (status in ('pending','approved','rejected')),
  created_at timestamptz not null default now()
);

create table if not exists public.bookings (
  id uuid primary key default gen_random_uuid(),
  booking_id text not null unique,
  full_name text not null,
  phone text not null,
  session_type text not null,
  booking_date date not null,
  slot text not null,
  branch text not null,
  notes text,
  status text not null default 'pending' check (status in ('pending','confirmed','cancelled')),
  created_at timestamptz not null default now()
);

create table if not exists public.student_profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  student_id text not null unique,
  full_name text not null,
  phone text,
  course text,
  batch text,
  branch text,
  status text not null default 'active',
  created_at timestamptz not null default now()
);

alter table public.events enable row level security;
alter table public.gallery enable row level security;
alter table public.memberships enable row level security;
alter table public.bookings enable row level security;
alter table public.student_profiles enable row level security;

drop policy if exists "Public can read events" on public.events;
create policy "Public can read events" on public.events for select to anon, authenticated using (true);
drop policy if exists "Admins manage events" on public.events;
create policy "Admins manage events" on public.events for all to authenticated using (public.is_yoga_admin()) with check (public.is_yoga_admin());

drop policy if exists "Public can read gallery" on public.gallery;
create policy "Public can read gallery" on public.gallery for select to anon, authenticated using (true);
drop policy if exists "Admins manage gallery" on public.gallery;
create policy "Admins manage gallery" on public.gallery for all to authenticated using (public.is_yoga_admin()) with check (public.is_yoga_admin());

drop policy if exists "Public can submit membership requests" on public.memberships;
create policy "Public can submit membership requests" on public.memberships for insert to anon, authenticated with check (
  length(trim(full_name)) between 2 and 120 and length(trim(phone)) between 7 and 20
);
drop policy if exists "Admins manage membership requests" on public.memberships;
create policy "Admins manage membership requests" on public.memberships for all to authenticated using (public.is_yoga_admin()) with check (public.is_yoga_admin());

drop policy if exists "Public can submit booking requests" on public.bookings;
create policy "Public can submit booking requests" on public.bookings for insert to anon, authenticated with check (
  length(trim(full_name)) between 2 and 120 and length(trim(phone)) between 7 and 20 and booking_date >= current_date
);
drop policy if exists "Admins manage booking requests" on public.bookings;
create policy "Admins manage booking requests" on public.bookings for all to authenticated using (public.is_yoga_admin()) with check (public.is_yoga_admin());

drop policy if exists "Students read own profile" on public.student_profiles;
create policy "Students read own profile" on public.student_profiles for select to authenticated using (auth.uid() = user_id or public.is_yoga_admin());
drop policy if exists "Admins manage student profiles" on public.student_profiles;
create policy "Admins manage student profiles" on public.student_profiles for all to authenticated using (public.is_yoga_admin()) with check (public.is_yoga_admin());

grant select on public.events, public.gallery to anon, authenticated;
grant insert, update, delete on public.events, public.gallery to authenticated;
grant insert on public.memberships, public.bookings to anon, authenticated;
grant select, update, delete on public.memberships, public.bookings to authenticated;
grant select on public.student_profiles to authenticated;
grant insert, update, delete on public.student_profiles to authenticated;
