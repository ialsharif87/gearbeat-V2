# GEARBEAT PATCH 123Q: RELAX STUDIOS OWNER AUTH FK PREVIEW COMPATIBILITY

## Rationale
During CI/CD pipelines and PR automated checks, Supabase Preview environments spin up ephemeral database instances. These preview databases apply all schema migrations and database seed files sequentially.

If seed files contain static data records for `public.studios` that reference `owner_auth_user_id` values which do not exist in the temporary `auth.users` table of the preview database, the migration or seed application fails with a foreign key violation:
`ERROR: insert or update on table "studios" violates foreign key constraint "studios_owner_auth_user_id_fkey"`

To ensure complete test environment reliability and preview compatibility, strict foreign key constraints between `public.studios`'s owner identification columns (`owner_auth_user_id`, `owner_id`, and `user_id`) and the `auth.users` system table have been dropped. 

---

## Applied Structural Changes

### 1. Active Bootstrap Migrations
The references have been removed in-place from the following active migrations to prevent constraints from ever being created on new databases:
- **`supabase/migrations/20260519000000_foundation_dependency_bootstrap.sql`**:
  - Relaxed `owner_auth_user_id` inside `CREATE TABLE public.studios`
  - Relaxed `owner_auth_user_id` inside safe column backfills
  - Relaxed `owner_id` and `user_id` in compatibility columns
- **`supabase/migrations/20260519000003_forward_foundation_column_backfills.sql`**:
  - Relaxed `owner_auth_user_id` inside `ALTER TABLE IF EXISTS public.studios`
  - Relaxed `owner_id` and `user_id` in compatibility backfills

### 2. Forward Migration
For target remote databases where migrations have already run, a new forward-only migration was created to drop existing constraints:

`supabase/migrations/20260519000005_relax_studios_owner_auth_fk_preview_compatibility.sql`

```sql
ALTER TABLE IF EXISTS public.studios DROP CONSTRAINT IF EXISTS studios_owner_auth_user_id_fkey;
ALTER TABLE IF EXISTS public.studios DROP CONSTRAINT IF EXISTS studios_owner_id_fkey;
ALTER TABLE IF EXISTS public.studios DROP CONSTRAINT IF EXISTS studios_user_id_fkey;
```

---

## Validation Status
- **Constraint Absence Check**:
  - Checked that `"owner_auth_user_id uuid REFERENCES auth.users"` does not exist for the `studios` table in migration definitions.
  - Checked that `"owner_id uuid REFERENCES auth.users"` and `"user_id uuid REFERENCES auth.users"` do not exist for the `studios` table.
- **Zero Data Loss**: No columns were dropped, and no data deletions occurred.
- **No SQL Execution**: All checks were strictly read-only repository updates.
- **BOM-Free File Writing**: New migration file contains no Byte Order Mark (BOM).
