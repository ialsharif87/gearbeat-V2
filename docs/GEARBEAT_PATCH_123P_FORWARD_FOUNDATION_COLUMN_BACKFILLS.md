# GEARBEAT PATCH 123P: FORWARD FOUNDATION COLUMN BACKFILLS

## Why a Forward Migration is Required
In PostgreSQL environments managed by Supabase, once a migration version (like `20260519000000_foundation_dependency_bootstrap.sql`) is executed, it is registered in the database's `schema_migrations` catalog.

If that migration originally ran on a target database where the tables (such as `public.studios`) already existed historically:
1. The `CREATE TABLE IF NOT EXISTS` blocks were safely bypassed/skipped.
2. The columns inside the `CREATE TABLE` declaration (e.g., `name_en`, `name_ar`) were **never** created.
3. Editing the historical `20260519000000_foundation_dependency_bootstrap.sql` migration file locally **does not re-run** it on target environments where it has already been applied.

Therefore, to guarantee that missing compatibility columns exist on both fresh and pre-existing databases, we must introduce a **forward-only, additive migration**:

`supabase/migrations/20260519000003_forward_foundation_column_backfills.sql`

---

## Applied Tables and Column Backfills
This new forward migration additively runs `ALTER TABLE IF EXISTS public.<table> ADD COLUMN IF NOT EXISTS` for:

1. **`public.profiles`**: Backfills all core metadata, verification, referral, and setting fields.
2. **`public.admin_users`**: Backfills administrative tracking and role structures.
3. **`public.studios`**: Backfills all compatibility columns including:
   - Language: `name_en`, `name_ar`, `description_en`, `description_ar`
   - Ratings: Google Place/rating parameters and TripAdvisor integrations
   - Status & Compliance: Compliance indicators, feature flags, starting rates, cover image URL, etc.
   - Foreign Keys: `owner_id`, `user_id`
4. **`public.bookings`**: Backfills currency, checkout session IDs, coupon details, status log details.
5. **`public.loyalty_tiers`**: Backfills multi-lingual translations and multiplier variables.
6. **`public.customer_wallets`**: Backfills wallet balances, point balances, referral parameters.
7. **`public.loyalty_points_ledger`**: Backfills reason text, event references, amount bases.
8. **`public.marketplace_products`**: Backfills brand, category, name languages, specifications, SKU.
9. **`public.marketplace_orders`**: Backfills shipping tracker numbers, settlement, payouts.

---

## Downstream Index Safeguards
To prevent migration crashes, the downstream index definitions are executed **only after** all missing columns are fully backfilled:
- `idx_studios_name_en` ON `public.studios(name_en)`
- `idx_studios_slug` ON `public.studios(slug)`
- `idx_studios_status` ON `public.studios(status)`
- `idx_studios_owner_id` ON `public.studios(owner_id)`

---

## Validation Status
- **Unique Migration Version**: Verified `20260519000003_forward_foundation_column_backfills.sql` exists and is a distinct forward file.
- **Historical Migration Integrity**: Historical migration files remain completely unchanged.
- **Strict Read-Only execution**: No SQL mutations were run on target databases.
