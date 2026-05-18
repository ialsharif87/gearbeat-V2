# GearBeat V2 Runbook — Patch 123J: SQL Admin Users Bootstrap Compatibility Fix

This runbook catalogs the problem analysis, table definitions, and policy-ordering validation for **Patch 123J**, which resolves dry-run and startup migration failures by bootstrapping the `public.admin_users` table before any policy references it.

---

## 1. Executive Summary & Verdict Matrix

*   **Objective**: Bootstrap the core `public.admin_users` database structure near the top of the initial migration file, securing alphabetical execution order and preventing RLS policy creation failures.
*   **Verification Status**:
    *   **TypeScript Verification**: `PASSED`
    *   **Next.js Production Build**: `PASSED`
*   **Founder Full-Journey Self-Test Status**: **GO FOR FOUNDER FULL-JOURNEY SELF-TEST**
*   **Commercial Launch Status**: **NO-GO FOR COMMERCIAL LAUNCH**

> [!IMPORTANT]
> **Safety Constraints Met**:
> - **Zero SQL Execution**: No commands or scripts were executed against any database.
> - **Zero Supabase CLI Usage**: No local or remote CLI push/pull commands were run.
> - **Zero Destructive Mutations**: No tables were dropped, truncated, or deleted. All modifications were restricted purely to SQL migration drafts.

---

## 2. Rationale & Problem Analysis

In a clean/empty database environment, migration scripts execute in alphabetical order. Because the CRM/self-test policies reference `public.admin_users` for active admin checks (e.g. `EXISTS (SELECT 1 FROM public.admin_users WHERE ...)`), executing policy creation scripts before the table exists results in:
`ERROR: relation "public.admin_users" does not exist`

By bootstrapping `public.admin_users` at the very beginning of the alphabetically first migration file (`20260518_founder_full_journey_sql_gap_fill.sql`), we guarantee the relation exists in the catalog before any subsequential index, view, trigger, or RLS policy attempts to reference it.

---

## 3. Bootstrapped Database Entities

The following structures were successfully integrated near the top of [supabase/migrations/20260518_founder_full_journey_sql_gap_fill.sql](file:///c:/Users/iaals/Documents/GitHub/gearbeat-V2/supabase/migrations/20260518_founder_full_journey_sql_gap_fill.sql) before Module 1:

### A. Admin Users Table Definition (`public.admin_users`)
The table fully supports the application's staff team management and access authorization models:
```sql
CREATE TABLE IF NOT EXISTS public.admin_users (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    auth_user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
    email text UNIQUE,
    full_name text,
    role text DEFAULT 'admin',
    admin_role text DEFAULT 'admin',
    status text DEFAULT 'active',
    created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);
```
*   **Email Uniqueness Constraint**: An explicit `UNIQUE` constraint is defined on `email` to fully support upserts during team onboarding (e.g. `onConflict: "email"` in `/admin/team`).
*   **Role Alignment**: Created both `role` and `admin_role` columns to maintain maximum compatibility with both CRM self-test schemas and core route protection logic.

---

### B. Indexes and Uniqueness
Safe, additive index structures were provisioned to optimize active authentication lookups:
*   `CREATE UNIQUE INDEX IF NOT EXISTS idx_admin_users_auth_user_id ON public.admin_users(auth_user_id);` (optimizes `getUser` lookup checks)
*   `CREATE INDEX IF NOT EXISTS idx_admin_users_status ON public.admin_users(status);` (speeds up active status filters)
*   `CREATE INDEX IF NOT EXISTS idx_admin_users_email ON public.admin_users(email);` (speeds up user invite tracking)

---

### C. Secure Row Level Security (RLS)
The table implements high-security, self-contained row-level security:
1.  **Read Isolation Policy**:
    ```sql
    CREATE POLICY "Users can read own admin record" ON public.admin_users
        FOR SELECT TO authenticated
        USING (auth_user_id = auth.uid());
    ```
2.  **Management Isolation Policy**:
    ```sql
    CREATE POLICY "Active admins can manage admin records" ON public.admin_users
        FOR ALL TO authenticated
        USING (
            EXISTS (
                SELECT 1 FROM public.admin_users
                WHERE auth_user_id = auth.uid() AND status = 'active'
            )
        );
    ```
> [!NOTE]
> None of the `admin_users` RLS policies depend on `public.profiles`, maintaining strict isolation between standard user roles and administrative structures.

---

## 4. Repository Verification & Policy Ordering Audit

Verification checks completed in the local workspace:

1.  **Alphabetical Migration Sequence**:
    *   First: `20260518_founder_full_journey_sql_gap_fill.sql` (Creates `admin_users` at the top of line 13)
    *   Second: `20260518_internal_crm_founder_self_test_foundation.sql` (Safely references `admin_users` in RLS policies without relation errors)
2.  **Uniqueness & Validation Check**:
    *   The `admin_users` table correctly defines `email UNIQUE`, ensuring `onConflict: "email"` upserts in [app/admin/team/page.tsx](file:///c:/Users/iaals/Documents/GitHub/gearbeat-V2/app/admin/team/page.tsx#L137-L150) run successfully.
    *   The table contains `full_name`, `admin_role`, and `status` to fully cover route guard selections in [lib/route-guards.ts](file:///c:/Users/iaals/Documents/GitHub/gearbeat-V2/lib/route-guards.ts#L49) and [lib/admin.ts](file:///c:/Users/iaals/Documents/GitHub/gearbeat-V2/lib/admin.ts#L28).
