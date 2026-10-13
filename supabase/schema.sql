-- Im Supabase Dashboard unter "SQL Editor" ausführen.
-- Vorher: Authentication > Providers > "Allow anonymous sign-ins" aktivieren.

create table public.games (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  title text not null default 'Bingo',
  size int not null default 5 check (size between 3 and 7),
  created_by uuid not null default auth.uid(),
  created_at timestamptz not null default now()
);

create table public.cards (
  id uuid primary key default gen_random_uuid(),
  game_id uuid not null references public.games (id) on delete cascade,
  user_id uuid not null default auth.uid(),
  player_name text not null,
  cells jsonb not null,
  win_line jsonb,
  won_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (game_id, user_id)
);

alter table public.games enable row level security;
alter table public.cards enable row level security;

-- Alle angemeldeten Spieler dürfen alles lesen ("gemeinsamer Tisch").
create policy "games lesen" on public.games
  for select to authenticated using (true);
create policy "games erstellen" on public.games
  for insert to authenticated with check (created_by = auth.uid());

create policy "cards lesen" on public.cards
  for select to authenticated using (true);
-- Schreiben darf jeder nur auf der eigenen Karte.
create policy "cards erstellen" on public.cards
  for insert to authenticated with check (user_id = auth.uid());
create policy "cards ändern" on public.cards
  for update to authenticated
  using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "cards löschen" on public.cards
  for delete to authenticated using (user_id = auth.uid());

-- Live-Updates aktivieren
alter publication supabase_realtime add table public.cards;
