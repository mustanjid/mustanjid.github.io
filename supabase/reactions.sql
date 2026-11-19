-- Like / Love counters for mustanjid.github.io  (run once)
--
-- 1. Create a free project at https://supabase.com
-- 2. Open  SQL Editor  ->  New query, paste this whole file, click Run
-- 3. Project Settings -> API: copy the Project URL and the PUBLIC key (the "anon" or "publishable" key)
-- 4. On the site: /admin -> Site identity & social links -> Likes and Loves
--    turn it on and paste the URL and the public key.
--
-- NEVER paste the secret / service_role key anywhere in this repository.
--
-- Safe to run again: it will not delete existing counts.

create table if not exists public.reactions (
  item_id text   not null check (char_length(item_id) between 1 and 120),
  kind    text   not null check (kind in ('like', 'love')),
  total   bigint not null default 0 check (total >= 0),
  primary key (item_id, kind)
);

alter table public.reactions enable row level security;

-- Visitors may READ the counts. There is deliberately no insert/update/delete policy:
-- the only way to change a count is the react() function below.
grant select on public.reactions to anon;
drop policy if exists "anyone can read reactions" on public.reactions;
create policy "anyone can read reactions" on public.reactions for select to anon using (true);

-- Moves one visitor's reaction: takes 1 away from p_from (if given) and adds 1 to p_to (if given), atomically.
create or replace function public.react(p_item text, p_from text default null, p_to text default null)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if p_item !~ '^[a-z0-9:_-]{1,120}$' then raise exception 'invalid item'; end if;
  if p_from is not null and p_from not in ('like', 'love') then raise exception 'invalid reaction'; end if;
  if p_to   is not null and p_to   not in ('like', 'love') then raise exception 'invalid reaction'; end if;

  if p_from is not null then
    update public.reactions set total = greatest(total - 1, 0) where item_id = p_item and kind = p_from;
  end if;

  if p_to is not null then
    insert into public.reactions (item_id, kind, total) values (p_item, p_to, 1)
    on conflict (item_id, kind) do update set total = public.reactions.total + 1;
  end if;
end;
$$;

revoke all on function public.react(text, text, text) from public;
grant execute on function public.react(text, text, text) to anon;
