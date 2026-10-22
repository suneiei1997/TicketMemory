-- TicketMemory: per-ticket colour (key of a mesh palette in the app). Safe to re-run.
alter table public.events add column if not exists color text
  check (color is null or char_length(color) <= 24);
