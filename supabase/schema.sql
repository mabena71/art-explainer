-- Art Explainer: Datenbank. Läuft vorerst im Supabase-Projekt "bena-fit" mit (gleiche Konten wie BENA Fit).
-- Alle Namen beginnen mit "art", damit nichts mit BENA Fit kollidiert.
-- Im Supabase-Dashboard unter "SQL Editor" einmal komplett ausführen; mehrfaches Ausführen schadet nicht.

-- Verbrauch pro Person und Tag (Tageslimit in der Edge Function "art")
create table if not exists public.art_usage (
  user_id uuid not null references auth.users on delete cascade,
  day date not null,
  action text not null,
  count int not null default 0,
  primary key (user_id, day, action)
);
alter table public.art_usage enable row level security;
drop policy if exists "art: eigener Verbrauch lesen" on public.art_usage;
create policy "art: eigener Verbrauch lesen" on public.art_usage for select using (auth.uid() = user_id);

-- Zählt einen Aufruf und gibt die Summe aller Aufrufe dieser Person an diesem Tag zurück.
-- Nur die Edge Function (service_role) darf das aufrufen.
create or replace function public.art_bump_usage(p_user uuid, p_day date, p_action text)
returns int language plpgsql security definer set search_path = public as $$
declare total int;
begin
  insert into public.art_usage (user_id, day, action, count) values (p_user, p_day, p_action, 1)
  on conflict (user_id, day, action) do update set count = public.art_usage.count + 1;
  select coalesce(sum(count), 0) into total from public.art_usage where user_id = p_user and day = p_day;
  return total;
end $$;
revoke all on function public.art_bump_usage(uuid, date, text) from public, anon, authenticated;

-- Sammlung (für den späteren Abgleich zwischen Geräten, TODO Nr. 7)
create table if not exists public.art_scans (
  id uuid primary key,
  user_id uuid not null references auth.users on delete cascade default auth.uid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  photo_path text,
  analysis jsonb not null,
  chat jsonb not null default '[]',
  note text,
  fav boolean not null default false,
  lat double precision,
  lng double precision
);
alter table public.art_scans add column if not exists visit jsonb;
alter table public.art_scans add column if not exists synced_at timestamptz not null default now();
create index if not exists art_scans_sync on public.art_scans (user_id, synced_at);
create or replace function public.art_touch_synced_at() returns trigger language plpgsql as $$ begin new.synced_at = now(); return new; end $$;
drop trigger if exists art_scans_synced on public.art_scans;
create trigger art_scans_synced before insert or update on public.art_scans for each row execute function public.art_touch_synced_at();
alter table public.art_scans enable row level security;
drop policy if exists "art: eigene Scans" on public.art_scans;
create policy "art: eigene Scans" on public.art_scans for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Privater Speicher für Fotos: Ordner = user_id
insert into storage.buckets (id, name, public) values ('art-photos', 'art-photos', false) on conflict do nothing;
drop policy if exists "art: eigene Fotos" on storage.objects;
create policy "art: eigene Fotos" on storage.objects for all
  using (bucket_id = 'art-photos' and (storage.foldername(name))[1] = auth.uid()::text)
  with check (bucket_id = 'art-photos' and (storage.foldername(name))[1] = auth.uid()::text);
