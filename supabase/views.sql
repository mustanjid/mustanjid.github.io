-- Post / project view counter for mustanjid.github.io (run once, after reactions.sql)
-- Paste into Supabase  SQL Editor  ->  New query  ->  Run. Safe to run again.
-- Uses the same Supabase project and public key as Likes and Loves. NEVER put the secret key on the site.

create table if not exists public.views (
  item_id text   primary key check (char_length(item_id) between 1 and 120),
  total   bigint not null default 0 check (total >= 0)
);

alter table public.views enable row level security;
grant select on public.views to anon;
drop policy if exists "anyone can read views" on public.views;
create policy "anyone can read views" on public.views for select to anon using (true);

-- Adds one view. The site calls this at most once per item per browser per day.
create or replace function public.view_item(p_item text)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if p_item !~ '^[a-z0-9:_-]{1,120}$' then raise exception 'invalid item'; end if;
  insert into public.views (item_id, total) values (p_item, 1)
  on conflict (item_id) do update set total = public.views.total + 1;
end;
$$;

revoke all on function public.view_item(text) from public;
grant execute on function public.view_item(text) to anon;
