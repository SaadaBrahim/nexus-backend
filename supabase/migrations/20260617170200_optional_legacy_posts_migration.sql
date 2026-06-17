-- Optional legacy migration from public.posts to public.links.
--
-- Use only after creating a Supabase Auth user and replacing the placeholder
-- UUID below with the owner user id for the imported prototype data.
--
-- This file is intentionally commented out so it cannot run accidentally.

/*
insert into public.links (
  user_id,
  url,
  normalized_url,
  title,
  is_favorite,
  metadata
)
select
  '00000000-0000-0000-0000-000000000000'::uuid as user_id,
  p.url,
  lower(trim(trailing '/' from p.url)) as normalized_url,
  nullif(trim(p.title), '') as title,
  coalesce(p.is_favorite, false) as is_favorite,
  jsonb_strip_nulls(
    jsonb_build_object(
      'legacy_id', p.id,
      'legacy_category', p.category,
      'migrated_from', 'posts'
    )
  ) as metadata
from public.posts p
where p.url is not null
on conflict (user_id, normalized_url) do nothing;
*/
