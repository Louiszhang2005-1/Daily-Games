-- Daily Games schema (Supabase / Postgres).
-- RLS is enabled on every table with no public policies: only the server
-- (service role key) reads and writes. Auth users come from Supabase Auth.

create table if not exists users (
  id uuid primary key references auth.users (id) on delete cascade,
  display_name text not null,
  language text not null default 'en' check (language in ('en', 'fr')),
  created_at timestamptz not null default now()
);

create table if not exists daily_puzzles (
  id text primary key,                     -- game:day:variant
  game text not null,
  day date not null,                       -- Eastern Time puzzle day
  variant text not null,                   -- en | fr | en-easy | fr-medium ...
  language text not null,
  answer_key text not null,                -- used to stop repeats
  content jsonb not null,
  source text not null check (source in ('generated', 'backup')),
  status text not null default 'scheduled' check (status in ('scheduled', 'live', 'yesterday', 'archived')),
  created_at timestamptz not null default now()
);
create index if not exists daily_puzzles_game_lang on daily_puzzles (game, language, day);
create index if not exists daily_puzzles_answer on daily_puzzles (game, language, answer_key);

create table if not exists results (
  id uuid primary key,
  puzzle_id text not null,
  game text not null,
  day date not null,
  variant text not null,
  language text not null,
  level text,
  player_key text not null,                -- u:<user id> or g:<guest id>
  user_id uuid references users (id) on delete cascade,
  guest_id text,
  raw_score double precision not null,
  percentile double precision,             -- filled when the day locks
  time_ms integer,
  details jsonb not null default '{}',
  finished_at timestamptz not null default now(),
  is_catch_up boolean not null default false,
  unique (puzzle_id, player_key)
);
create index if not exists results_puzzle on results (puzzle_id);
create index if not exists results_player_day on results (player_key, day);
create index if not exists results_day on results (day);

create table if not exists answer_lists (
  puzzle_id text not null,
  prompt_index integer not null,
  canonical_id text not null,
  aliases text[] not null,
  tier text,
  share double precision,
  primary key (puzzle_id, prompt_index, canonical_id)
);

-- Live answer counts per prompt (Rare and Common Answers).
create table if not exists answer_counts (
  puzzle_id text not null,
  prompt_index integer not null,
  canonical_id text not null,
  count integer not null default 0,
  primary key (puzzle_id, prompt_index, canonical_id)
);

create table if not exists rejected_answers (
  puzzle_id text not null,
  prompt_index integer not null,
  normalized_text text not null,
  game text not null,
  language text not null,
  prompt_key text not null,
  count integer not null default 1,
  review_status text not null default 'pending' check (review_status in ('pending', 'real', 'typo', 'nonsense', 'approved', 'rejected')),
  primary key (puzzle_id, prompt_index, normalized_text)
);

-- Answers approved by the nightly review, merged into future lists only.
create table if not exists approved_answers (
  game text not null,
  language text not null,
  prompt_key text not null,
  normalized_text text not null,
  canonical_id text,
  approved_at timestamptz not null default now(),
  primary key (game, language, prompt_key, normalized_text)
);

create table if not exists backup_puzzles (
  id text primary key,
  game text not null,
  language text not null,
  variant text not null,
  answer_key text not null,
  content jsonb not null,
  used_on date
);

create table if not exists clans (
  id uuid primary key,
  name text not null,
  invite_code text not null unique,
  owner_id uuid not null references users (id) on delete cascade,
  created_at timestamptz not null default now()
);

create table if not exists clan_members (
  clan_id uuid not null references clans (id) on delete cascade,
  user_id uuid not null references users (id) on delete cascade,
  joined_at timestamptz not null default now(),
  primary key (clan_id, user_id)
);

create table if not exists challenges (
  token text primary key,
  creator_id uuid not null references users (id) on delete cascade,
  day date not null,
  language text not null,
  opponent_id uuid references users (id) on delete set null,
  created_at timestamptz not null default now()
);

create table if not exists streaks (
  user_id uuid not null references users (id) on delete cascade,
  game text not null,                       -- a game id or 'hub'
  current integer not null default 0,
  best integer not null default 0,
  last_day date,
  primary key (user_id, game)
);

alter table users enable row level security;
alter table daily_puzzles enable row level security;
alter table results enable row level security;
alter table answer_lists enable row level security;
alter table answer_counts enable row level security;
alter table rejected_answers enable row level security;
alter table approved_answers enable row level security;
alter table backup_puzzles enable row level security;
alter table clans enable row level security;
alter table clan_members enable row level security;
alter table challenges enable row level security;
alter table streaks enable row level security;

-- Atomic counter used by Rare/Common Answers.
create or replace function bump_answer_count(p_puzzle text, p_prompt integer, p_canonical text)
returns integer language sql as $$
  insert into answer_counts (puzzle_id, prompt_index, canonical_id, count)
  values (p_puzzle, p_prompt, p_canonical, 1)
  on conflict (puzzle_id, prompt_index, canonical_id)
  do update set count = answer_counts.count + 1
  returning count;
$$;
