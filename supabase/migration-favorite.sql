-- Bestehende Datenbank erweitern (nur einmal ausführen, falls Tabelle schon existiert):
alter table public.routes add column if not exists favorite boolean not null default false;