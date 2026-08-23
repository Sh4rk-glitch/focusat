create table if not exists public.user_progress (
  user_id uuid primary key references auth.users(id) on delete cascade,
  data jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

create table if not exists public.leaderboard (
  user_id uuid primary key references auth.users(id) on delete cascade,
  name text not null default 'Learner',
  questions_answered integer not null default 0,
  leaks integer not null default 0,
  updated_at timestamptz not null default now()
);

alter table public.user_progress enable row level security;
alter table public.leaderboard enable row level security;

create policy "Users can read their own progress" on public.user_progress for select using (auth.uid() = user_id);
create policy "Users can write their own progress" on public.user_progress for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "Anyone can read leaderboard" on public.leaderboard for select using (true);
create policy "Users can write their own leaderboard row" on public.leaderboard for all using (auth.uid() = user_id) with check (auth.uid() = user_id);