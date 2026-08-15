-- Supabase-Schema für die Laufstrecken-App
-- Im Supabase-Dashboard: SQL Editor -> New query -> hier einfügen -> Run

create table if not exists public.routes (
  id text primary key,
  name text not null,
  distance_km double precision not null,
  start_lat double precision not null,
  start_lng double precision not null,
  coords jsonb not null,
  created_at timestamptz not null default now()
);

alter table public.routes enable row level security;

-- Einzelbenutzer-App: anon-Key darf lesen, schreiben und löschen.
create policy "routes_select" on public.routes for select using (true);
create policy "routes_insert" on public.routes for insert with check (true);
create policy "routes_update" on public.routes for update using (true);
create policy "routes_delete" on public.routes for delete using (true);