# Supabase Setup

Apply migrations in this order:

1. `migrations/20260617170000_core_schema.sql`
2. `migrations/20260617170100_rls_policies.sql`
3. `migrations/20260617170200_optional_legacy_posts_migration.sql` only if you want to import old prototype rows from `public.posts`.

The optional legacy migration is commented out on purpose. Before running it:

1. Create or identify the Supabase Auth user that should own the old links.
2. Replace `00000000-0000-0000-0000-000000000000` with that user's `auth.users.id`.
3. Uncomment the SQL block.

Security model:

- `auth.users` remains the source of identity.
- Every application row is scoped by `user_id`.
- RLS policies restrict reads and writes to `auth.uid() = user_id`.
- Composite foreign keys prevent linking a user's link to another user's workspace or tag.
