# GEARBEAT PATCH 37 — AVAILABILITY SAVE ERROR FIX

## 1. Overview
This patch fixes a critical error preventing studio owners from saving their operating hours and availability exceptions. The fix ensures that both legacy and new studio owners can reliably update their schedule without being blocked by Row-Level Security (RLS) constraints.

## 2. Root Cause Analysis
The save failure was caused by a mismatch between the application-layer ownership logic and the database-layer RLS policies:
- **RLS Constraint:** The `studio_availability_rules` and `studio_availability_exceptions` tables have RLS enabled, strictly checking for `owner_auth_user_id` in the `studios` table.
- **Legacy Ownership:** Many studios are linked to owners via legacy columns (`owner_id` or `user_id`) which are not recognized by the current RLS policies.
- **PostgREST Upsert Issues:** The `upsert` operation used by the user-facing Supabase client frequently failed when resolving conflicts on rows where the user lacked explicit `UPDATE` permissions due to the RLS mismatch.

## 3. Files Changed
- `app/api/portal/studios/availability/update/route.ts` [MODIFY]

## 4. Exact Fix Applied
- **Admin Client Migration:** Migrated the availability update API route to use the `supabaseAdmin` client (Service Role) for all database operations.
- **Manual Ownership Verification:** Enhanced the server-side ownership check (`userOwnsStudio`) to use the Admin client, ensuring it can verify ownership across all candidate columns (`owner_auth_user_id`, `owner_id`, `user_id`) regardless of RLS visibility.
- **Reliable Operations:** Replaced RLS-restricted `upsert` and `delete` calls with Service Role authorized operations, guaranteeing save success for all valid studio owners.
- **Cache Invalidation:** Added `revalidatePath` calls to ensure the dashboard and management pages reflect the updated availability immediately.
- **Enhanced Error Reporting:** Updated the API response to include specific context (e.g., "Rules Error", "Insert Exceptions Error") to aid in any future debugging.

## 5. What Was NOT Changed
- **No SQL Migrations:** No changes were made to the database schema or RLS policies.
- **No UI Changes:** The existing owner portal interface and the `StudioAvailabilityManager` component remain unchanged.
- **No Feature Creep:** No new availability features, dynamic pricing, or date range logic were added.

## 6. Future Recommendations
- **RLS Harmonization:** In a future SQL-focused patch (e.g., Batch F), all legacy `owner_id` and `user_id` columns in the `studios` table should be migrated to `owner_auth_user_id` to allow for clean, non-admin RLS access.
- **Constraint Cleanup:** Verify and harmonize unique constraints on `studio_availability_exceptions` to ensure they match the `start_date`/`end_date` model perfectly.
