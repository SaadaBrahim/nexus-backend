-- Nexus Link Collector - Core multi-user schema
-- Run this before the RLS policies migration.

create extension if not exists pgcrypto;
create extension if not exists pg_trgm;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.workspaces (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  description text,
  color text,
  icon text,
  position integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint workspaces_name_length check (char_length(name) between 1 and 80),
  constraint workspaces_unique_name_per_user unique (user_id, name),
  constraint workspaces_id_user_id_unique unique (id, user_id)
);

create table if not exists public.links (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  workspace_id uuid,

  url text not null,
  normalized_url text not null,
  title text,
  description text,
  image_url text,
  favicon_url text,
  site_name text,

  notes text,
  is_favorite boolean not null default false,
  is_archived boolean not null default false,
  metadata jsonb not null default '{}'::jsonb,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint links_url_length check (char_length(url) between 8 and 2048),
  constraint links_normalized_url_length check (char_length(normalized_url) between 8 and 2048),
  constraint links_title_length check (title is null or char_length(title) <= 300),
  constraint links_description_length check (description is null or char_length(description) <= 1000),
  constraint links_notes_length check (notes is null or char_length(notes) <= 5000),
  constraint links_unique_normalized_url_per_user unique (user_id, normalized_url),
  constraint links_id_user_id_unique unique (id, user_id),
  constraint links_workspace_belongs_to_user
    foreign key (workspace_id, user_id)
    references public.workspaces(id, user_id)
    on delete set null (workspace_id)
);

create table if not exists public.tags (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  slug text not null,
  color text,
  created_at timestamptz not null default now(),

  constraint tags_name_length check (char_length(name) between 1 and 50),
  constraint tags_slug_length check (char_length(slug) between 1 and 60),
  constraint tags_unique_slug_per_user unique (user_id, slug),
  constraint tags_id_user_id_unique unique (id, user_id)
);

create table if not exists public.link_tags (
  link_id uuid not null references public.links(id) on delete cascade,
  tag_id uuid not null references public.tags(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),

  primary key (link_id, tag_id),
  constraint link_tags_link_belongs_to_user
    foreign key (link_id, user_id)
    references public.links(id, user_id)
    on delete cascade,
  constraint link_tags_tag_belongs_to_user
    foreign key (tag_id, user_id)
    references public.tags(id, user_id)
    on delete cascade
);

create index if not exists workspaces_user_id_idx
  on public.workspaces(user_id);

create index if not exists links_user_id_created_at_idx
  on public.links(user_id, created_at desc);

create index if not exists links_workspace_id_idx
  on public.links(workspace_id);

create index if not exists links_user_favorite_idx
  on public.links(user_id, is_favorite);

create index if not exists links_user_archived_idx
  on public.links(user_id, is_archived);

create index if not exists links_title_trgm_idx
  on public.links using gin (title gin_trgm_ops);

create index if not exists links_description_trgm_idx
  on public.links using gin (description gin_trgm_ops);

create index if not exists links_metadata_gin_idx
  on public.links using gin(metadata);

create index if not exists tags_user_id_idx
  on public.tags(user_id);

create index if not exists link_tags_user_id_idx
  on public.link_tags(user_id);

create index if not exists link_tags_tag_id_idx
  on public.link_tags(tag_id);

drop trigger if exists set_profiles_updated_at on public.profiles;
create trigger set_profiles_updated_at
before update on public.profiles
for each row execute procedure public.set_updated_at();

drop trigger if exists set_workspaces_updated_at on public.workspaces;
create trigger set_workspaces_updated_at
before update on public.workspaces
for each row execute procedure public.set_updated_at();

drop trigger if exists set_links_updated_at on public.links;
create trigger set_links_updated_at
before update on public.links
for each row execute procedure public.set_updated_at();

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, display_name)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'display_name', split_part(new.email, '@', 1))
  )
  on conflict (id) do nothing;

  insert into public.workspaces (user_id, name, icon, position)
  values (new.id, 'Inbox', 'inbox', 0)
  on conflict (user_id, name) do nothing;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute procedure public.handle_new_user();
