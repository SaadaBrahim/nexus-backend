-- Nexus Link Collector - Row Level Security policies
-- Run after 20260617170000_core_schema.sql.

alter table public.profiles enable row level security;
alter table public.workspaces enable row level security;
alter table public.links enable row level security;
alter table public.tags enable row level security;
alter table public.link_tags enable row level security;

drop policy if exists "Users can read own profile" on public.profiles;
create policy "Users can read own profile"
on public.profiles
for select
using (auth.uid() = id);

drop policy if exists "Users can insert own profile" on public.profiles;
create policy "Users can insert own profile"
on public.profiles
for insert
with check (auth.uid() = id);

drop policy if exists "Users can update own profile" on public.profiles;
create policy "Users can update own profile"
on public.profiles
for update
using (auth.uid() = id)
with check (auth.uid() = id);

drop policy if exists "Users can read own workspaces" on public.workspaces;
create policy "Users can read own workspaces"
on public.workspaces
for select
using (auth.uid() = user_id);

drop policy if exists "Users can insert own workspaces" on public.workspaces;
create policy "Users can insert own workspaces"
on public.workspaces
for insert
with check (auth.uid() = user_id);

drop policy if exists "Users can update own workspaces" on public.workspaces;
create policy "Users can update own workspaces"
on public.workspaces
for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "Users can delete own workspaces" on public.workspaces;
create policy "Users can delete own workspaces"
on public.workspaces
for delete
using (auth.uid() = user_id);

drop policy if exists "Users can read own links" on public.links;
create policy "Users can read own links"
on public.links
for select
using (auth.uid() = user_id);

drop policy if exists "Users can insert own links" on public.links;
create policy "Users can insert own links"
on public.links
for insert
with check (auth.uid() = user_id);

drop policy if exists "Users can update own links" on public.links;
create policy "Users can update own links"
on public.links
for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "Users can delete own links" on public.links;
create policy "Users can delete own links"
on public.links
for delete
using (auth.uid() = user_id);

drop policy if exists "Users can read own tags" on public.tags;
create policy "Users can read own tags"
on public.tags
for select
using (auth.uid() = user_id);

drop policy if exists "Users can insert own tags" on public.tags;
create policy "Users can insert own tags"
on public.tags
for insert
with check (auth.uid() = user_id);

drop policy if exists "Users can update own tags" on public.tags;
create policy "Users can update own tags"
on public.tags
for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "Users can delete own tags" on public.tags;
create policy "Users can delete own tags"
on public.tags
for delete
using (auth.uid() = user_id);

drop policy if exists "Users can read own link tags" on public.link_tags;
create policy "Users can read own link tags"
on public.link_tags
for select
using (auth.uid() = user_id);

drop policy if exists "Users can insert own link tags" on public.link_tags;
create policy "Users can insert own link tags"
on public.link_tags
for insert
with check (auth.uid() = user_id);

drop policy if exists "Users can delete own link tags" on public.link_tags;
create policy "Users can delete own link tags"
on public.link_tags
for delete
using (auth.uid() = user_id);
