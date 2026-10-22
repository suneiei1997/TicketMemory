-- TicketMemory: single initial migration (profiles, events, storage, RLS).
-- Safe to re-run.

-- ───────────── Tables ─────────────

create table if not exists public.profiles (
  id            uuid primary key references auth.users (id) on delete cascade,
  display_name  text not null default '',
  avatar_path   text,
  theme         text check (theme in ('light', 'dark')),         -- null = follow system
  lang          text not null default 'th' check (lang in ('th', 'en')),
  notifications boolean not null default true,
  auto_delete   boolean not null default false,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

-- Bring a pre-existing profiles table up to date.
alter table public.profiles add column if not exists display_name  text not null default '';
alter table public.profiles add column if not exists avatar_path   text;
alter table public.profiles add column if not exists theme         text check (theme in ('light', 'dark'));
alter table public.profiles add column if not exists lang          text not null default 'th' check (lang in ('th', 'en'));
alter table public.profiles add column if not exists notifications boolean not null default true;
alter table public.profiles add column if not exists auto_delete   boolean not null default false;
alter table public.profiles add column if not exists created_at    timestamptz not null default now();
alter table public.profiles add column if not exists updated_at    timestamptz not null default now();

create table if not exists public.events (
  id                uuid primary key default gen_random_uuid(),
  user_id           uuid not null default auth.uid() references auth.users (id) on delete cascade,
  title             text not null,
  artist            text not null default '',
  venue             text not null default '',
  city              text not null default '',
  date              date not null,
  time              text check (time is null or time ~ '^\d{1,2}:\d{2}$'),
  zone              text not null default '',
  section           text not null default '',
  row               text not null default '',
  seat              text not null default '',
  ticket_image_path text,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);

create index if not exists events_user_date_idx on public.events (user_id, date);

-- ───────────── Functions & triggers ─────────────

create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists profiles_set_updated_at on public.profiles;
create trigger profiles_set_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

drop trigger if exists events_set_updated_at on public.events;
create trigger events_set_updated_at
  before update on public.events
  for each row execute function public.set_updated_at();

-- Every new auth user gets a profile; the display name comes from signUp metadata.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, display_name)
  values (
    new.id,
    coalesce(nullif(new.raw_user_meta_data ->> 'display_name', ''), split_part(new.email, '@', 1))
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ───────────── Row level security ─────────────

alter table public.profiles enable row level security;
alter table public.events   enable row level security;

drop policy if exists "profiles_select_own" on public.profiles;
create policy "profiles_select_own" on public.profiles
  for select to authenticated using (id = (select auth.uid()));

drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own" on public.profiles
  for update to authenticated
  using (id = (select auth.uid()))
  with check (id = (select auth.uid()));

drop policy if exists "events_select_own" on public.events;
create policy "events_select_own" on public.events
  for select to authenticated using (user_id = (select auth.uid()));

drop policy if exists "events_insert_own" on public.events;
create policy "events_insert_own" on public.events
  for insert to authenticated with check (user_id = (select auth.uid()));

drop policy if exists "events_update_own" on public.events;
create policy "events_update_own" on public.events
  for update to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));

drop policy if exists "events_delete_own" on public.events;
create policy "events_delete_own" on public.events
  for delete to authenticated using (user_id = (select auth.uid()));

-- ───────────── Storage (private buckets, files live under <user_id>/) ─────────────

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values
  ('avatars', 'avatars', false, 5242880, array['image/*']),
  ('tickets', 'tickets', false, 5242880, array['image/*'])
on conflict (id) do nothing;

drop policy if exists "media_select_own" on storage.objects;
create policy "media_select_own" on storage.objects
  for select to authenticated
  using (bucket_id in ('avatars', 'tickets') and (storage.foldername(name))[1] = (select auth.uid())::text);

drop policy if exists "media_insert_own" on storage.objects;
create policy "media_insert_own" on storage.objects
  for insert to authenticated
  with check (bucket_id in ('avatars', 'tickets') and (storage.foldername(name))[1] = (select auth.uid())::text);

drop policy if exists "media_update_own" on storage.objects;
create policy "media_update_own" on storage.objects
  for update to authenticated
  using (bucket_id in ('avatars', 'tickets') and (storage.foldername(name))[1] = (select auth.uid())::text);

drop policy if exists "media_delete_own" on storage.objects;
create policy "media_delete_own" on storage.objects
  for delete to authenticated
  using (bucket_id in ('avatars', 'tickets') and (storage.foldername(name))[1] = (select auth.uid())::text);
