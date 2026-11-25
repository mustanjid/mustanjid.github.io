-- Claude usage summary for the home-page Claude card (run once in Supabase SQL Editor, after reactions.sql).
-- The site can only READ this table with the public key. Only your local sync script (which uses the
-- SECRET key, kept on your computer and never in the repo) can write to it.

create table if not exists public.claude_usage (
  id         text primary key check (char_length(id) between 1 and 40),
  data       jsonb not null,
  updated_at timestamptz not null default now()
);

alter table public.claude_usage enable row level security;
grant select on public.claude_usage to anon;
drop policy if exists "anyone can read claude usage" on public.claude_usage;
create policy "anyone can read claude usage" on public.claude_usage for select to anon using (true);
