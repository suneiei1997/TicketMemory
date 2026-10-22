-- TicketMemory: ticket prices + ticketing rounds (Pray tab). Safe to re-run.

-- ───────────── Ticket price & purchase channel ─────────────

alter table public.events add column if not exists price             numeric(10, 2) check (price is null or price >= 0);
alter table public.events add column if not exists currency          text not null default 'THB';
alter table public.events add column if not exists purchase_channel  text not null default '';

-- ───────────── Ticketing rounds ─────────────

create table if not exists public.ticketing_rounds (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null default auth.uid() references auth.users (id) on delete cascade,
  title       text not null,
  artist      text not null default '',
  sale_at     timestamptz not null,
  platform    text not null default '',
  url         text not null default '',
  note        text not null default '',
  prayers     integer not null default 0 check (prayers >= 0),
  result      text not null default 'pending' check (result in ('pending', 'got', 'missed')),
  event_id    uuid references public.events (id) on delete set null,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create index if not exists ticketing_rounds_user_sale_idx on public.ticketing_rounds (user_id, sale_at);

drop trigger if exists ticketing_rounds_set_updated_at on public.ticketing_rounds;
create trigger ticketing_rounds_set_updated_at
  before update on public.ticketing_rounds
  for each row execute function public.set_updated_at();

alter table public.ticketing_rounds enable row level security;

drop policy if exists "rounds_select_own" on public.ticketing_rounds;
create policy "rounds_select_own" on public.ticketing_rounds
  for select to authenticated using (user_id = (select auth.uid()));

drop policy if exists "rounds_insert_own" on public.ticketing_rounds;
create policy "rounds_insert_own" on public.ticketing_rounds
  for insert to authenticated with check (user_id = (select auth.uid()));

drop policy if exists "rounds_update_own" on public.ticketing_rounds;
create policy "rounds_update_own" on public.ticketing_rounds
  for update to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));

drop policy if exists "rounds_delete_own" on public.ticketing_rounds;
create policy "rounds_delete_own" on public.ticketing_rounds
  for delete to authenticated using (user_id = (select auth.uid()));
