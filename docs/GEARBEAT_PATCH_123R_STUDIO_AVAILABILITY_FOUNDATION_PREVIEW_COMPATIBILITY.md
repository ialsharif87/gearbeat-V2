# GEARBEAT PATCH 123R: STUDIO AVAILABILITY FOUNDATION PREVIEW COMPATIBILITY

## Why this Patch is Required
During automated CI/CD checks (such as the "Supabase Preview" workflows), temporary/ephemeral databases are spun up to validate the migrations and seed data.

However, historical availability setup migrations like `patch_71_studio_availability_calendar.sql` and `patch_72_availability_pricing_v2.sql` are skipped by Supabase's migrations engine because they do not start with a 14-digit timestamp.

As a result:
1. Preview databases never create the tables `public.studio_availability_rules`, `public.studio_availability_exceptions`, `public.studio_availability_slots`, or `public.studio_pricing_rules`.
2. Downstream migrations or RPC definitions referring to these tables fail immediately with:
   `ERROR: relation "public.studio_availability_rules" does not exist`

To ensure full test suite reliability and preview compatibility, we have introduced a forward-only timestamped migration to bootstrap these availability tables.

---

## Applied Structural Changes

### 1. New Forward-Only Migration
A new, timestamped forward migration has been created:

`supabase/migrations/20260519000006_studio_availability_foundation_preview_compatibility.sql`

This file declares safe `CREATE TABLE IF NOT EXISTS` and `ALTER TABLE ADD COLUMN IF NOT EXISTS` blocks for the following tables:
- **`public.studio_availability_rules`**: Stores baseline weekday operational hours.
- **`public.studio_availability_exceptions`**: Stores date-specific blockouts, vacations, and special availability shifts.
- **`public.studio_availability_slots`**: Pre-generated booking slot states.
- **`public.studio_pricing_rules`**: Peak, off-peak, and weekday-specific price overrides.

### 2. Strict Safety Guidelines
* **No strict FK constraints to `public.studios`**: Ensures preview seed files can load without triggering constraint checks on non-existent records.
* **No destructive commands**: No tables are dropped, and no data is deleted.
* **No mock seeds**: Only pristine schema foundations are declared.
* **No app code/admin CRM changes**: The app layout, CRM operations, and transaction layers are completely untouched.

---

## Validation Status
* **Constraint and Table Safety Check**: Safe column builders are verified.
* **BOM-Free Writing**: New migration is fully BOM-free.
* **Dry-Run Readiness**: Safe for deployment across both preview and production databases.
