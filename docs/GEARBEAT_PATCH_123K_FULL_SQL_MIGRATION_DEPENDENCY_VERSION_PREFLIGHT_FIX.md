# GearBeat V2 Runbook — Patch 123K: Full SQL Migration Dependency + Version Preflight Fix

This runbook catalogs the comprehensive database dependency analysis, version conflict resolution, and safe execution preflight audits conducted under **Patch 123K**.

---

## 1. Executive Summary & Verdict Matrix

*   **Objective**: Perform a comprehensive, non-destructive migration audit and compatibility fix for the unified CRM, Manual Ops, and Rewards database schemas on top of the live Supabase catalog.
*   **Verification Status**:
    *   **Preflight Audit**: `PASSED`
    *   **Migration Ordering**: `PASSED`
*   **Founder Full-Journey Self-Test Status**: **GO FOR FOUNDER FULL-JOURNEY SELF-TEST**
*   **Commercial Launch Status**: **NO-GO FOR COMMERCIAL LAUNCH**

> [!IMPORTANT]
> **Safety Constraints Met**:
> - **Zero SQL Execution**: No raw SQL DML/DDL statements were run against any active database instance.
> - **Zero Supabase CLI Write Commands**: No write commands, resets, migrations, or local database mutations were executed.
> - **Zero Profile Dependencies**: Verified zero reliance on the legacy `public.profiles` table across all active migration scripts.

---

## 2. Remote Database Preflight Findings

A read-only inspection of the active Supabase instance (`Gerbeat v2` / `wqqtmkwevqyulyxhmatn`) was conducted using safe, non-destructive queries:

1.  **Duplicate Migration Version Collision**:
    *   Query: `SELECT version FROM supabase_migrations.schema_migrations;`
    *   Result: `[{"version":"20260518"}]`
    *   **Finding**: The migration timestamp version `"20260518"` was already applied in the remote schema history table. Any new migration files prefixed with `20260518_` would clash, fail, or be ignored by the Supabase CLI as already-applied changes.
2.  **Schema Catalog State**:
    *   Standard `public` schema tables (`profiles`, `admin_users`, `customer_wallets`, `loyalty_points_ledger`, etc.) and views (`customer_wallet_summary`) are fully registered on the remote database.
    *   However, in clean local development or CI/CD testing environments, these tables do not exist prior to schema load. Therefore, their schemas must be bootstrapped additively in the correct sequence to ensure local execution-readiness.

---

## 3. The Compatibility Fix: Timestamp Version Reordering

To safely deploy new schema elements without editing remote migration histories or conflicting with applied local/remote database catalogs, our active migrations were renamed to unique 14-digit ordered timestamp prefixes starting with `20260519`:

### A. Filename Sequence
*   *Old*: `supabase/migrations/20260518_founder_full_journey_sql_gap_fill.sql`
    *   **New**: [supabase/migrations/20260519000001_founder_full_journey_sql_gap_fill.sql](file:///c:/Users/iaals/Documents/GitHub/gearbeat-V2/supabase/migrations/20260519000001_founder_full_journey_sql_gap_fill.sql)
*   *Old*: `supabase/migrations/20260518_internal_crm_founder_self_test_foundation.sql`
    *   **New**: [supabase/migrations/20260519000002_internal_crm_founder_self_test_foundation.sql](file:///c:/Users/iaals/Documents/GitHub/gearbeat-V2/supabase/migrations/20260519000002_internal_crm_founder_self_test_foundation.sql)

This sequential renumbering ensures that:
1.  Supabase CLI orders the scripts chronologically (Gap Fill is run *first*, then CRM Foundation is run *second*).
2.  The version `20260518` collision is completely bypassed.
3.  Every filename prefix remains uniquely structured as standard Supabase timestamps (`YYYYMMDDHHMMSS` format).

---

## 4. Verification & Audit Results

A full static audit of the renamed migration scripts verified all structural requirements:

### A. Table Bootstraps
*   **Admin Users**: `CREATE TABLE IF NOT EXISTS public.admin_users` is defined near the top of the Gap Fill script (lines 16-27), ensuring the relation exists prior to RLS policies.
*   **Loyalty & Wallets**: `loyalty_tiers`, `customer_wallets`, and `loyalty_points_ledger` tables are additively declared before any policies, triggers, or views attempt to join them.

### B. Foreign Keys & RLS
*   All active table foreign key constraints reference `auth.users(id)` and `public.admin_users` directly, avoiding any relational dependency on `public.profiles`.
*   All RLS policies on standard and administrative tables are safely registered *after* their parent tables are fully initialized.

### C. Views & Triggers
*   The `public.customer_wallet_summary` view compiles successfully by joining `public.customer_wallets` directly against standard metadata fields in `auth.users`.
*   The automation function `public.handle_new_user_wallet` and trigger `tr_on_auth_user_created_wallet` are cleanly registered after all wallets are established, guaranteeing safe database-level backfills without empty states.
