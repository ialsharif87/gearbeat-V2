# GearBeat V2 Runbook — Patch 123B: Internal CRM + Founder Self-Test SQL Foundation

This runbook catalogs the schema design, security architecture, and audit specifications established in **Patch 123B**. It delivers the database extensions and safety definitions necessary to strengthen the founder end-to-end self-testing environment and administrative CRM tracking modules.

---

## 1. Executive Summary & Verdict Matrix

*   **Sprint Objective**: Expand and strengthen the founder self-test database foundation for internal CRM workflows, demo role switching, test sessions, issue assignment/comments, and operational audits.
*   **Verification Status**:
    *   **TypeScript Verification**: `PENDING`
    *   **Next.js Production Build**: `PENDING`
*   **Founder Full-Journey Self-Test Status**: **GO FOR FOUNDER FULL-JOURNEY SELF-TEST**
*   **Commercial Launch Status**: **NO-GO FOR COMMERCIAL LAUNCH**

> [!IMPORTANT]
> **Strict Non-Destructive Design Enforced**:
> In alignment with workflow safety guidelines, this migration uses 100% additive DDL: `CREATE TABLE IF NOT EXISTS`, `ALTER TABLE ... ADD COLUMN IF NOT EXISTS`, and `CREATE INDEX IF NOT EXISTS`. No dropping, renaming, truncating, or destructive alterations of pre-existing schemas or columns are present.
> 
> **Zero Live SQL Mutation**:
> As specified in the safety guidelines, **no database mutations were executed during this patch**. All SQL commands are packaged in the review-ready local migration file [20260518_internal_crm_founder_self_test_foundation.sql](file:///c:/Users/iaals/Documents/GitHub/gearbeat-V2/supabase/migrations/20260518_internal_crm_founder_self_test_foundation.sql) to be manually checked before final deployment.

---

## 2. Table Auditing & Extension Registry

Based on the baseline structures drafted in **Patch 123A**, the following new schemas and extensions were created to avoid duplication while completely hardening key administrative operations:

### A. New Modules & Tables Added (10 Tables)

#### 1. Internal CRM Expansion (2 Tables)
Provides standard pipeline-aware routing to categorize and transition leads from brand houses and partner studios:
*   `public.crm_pipelines` — Tracks CRM onboarding/sales pipelines.
*   `public.crm_stages` — Defines workflow stages (e.g. 'new', 'contacted', 'qualified', 'closed_won') within pipelines, securing sequence ordering.

#### 2. Demo Account Role Mapping (1 Table)
Allows the founder and administrators to switch and map demo users to key system actors:
*   `public.demo_account_role_mappings` — Maps a user ID to specialized roles (`customer`, `studio_owner`, `vendor`, `admin`, `super_admin`, `crm_manager`, `support_agent`) for isolated testing.

#### 3. Founder Journey Test Sessions (1 Table)
Provides structural scoping to group test runs under distinct end-to-end founder test workflows:
*   `public.founder_test_sessions` — Groups isolated test runs, recording started operator, status, and metadata.

#### 4. Admin Issue Tracking (3 Tables)
Strengthens the pre-existing `public.admin_issues` with assignment, commenting, and historical change logging:
*   `public.admin_issue_assignments` — Maps active admins to reported system issues to prevent split efforts.
*   `public.admin_issue_comments` — Audits text-based developer discussion logs on support issues.
*   `public.admin_issue_history` — Logs all state changes and status transitions of reported issues.

#### 5. Manual Operations Auditing (2 Tables)
Implements double-authorization tracking and before/after state captures for manual database mutations:
*   `public.manual_operation_approvals` — Tracks reviews and peer authorizations of manual operations.
*   `public.manual_operation_impacts` — Documents before/after snapshots of records altered during manual operations.

#### 6. CRM Status & Note History (3 Tables)
Audits transitions, edits, and updates on contacts, tasks, and notes:
*   `public.crm_status_history` — Unified audit ledger logging the entire status change timeline of leads, contacts, or accounts.
*   `public.crm_note_revisions` — Revision log storing original contents of internal CRM notes before changes.
*   `public.crm_task_history` — Logs status transitions and reassignments on CRM tasks.

---

### B. Pre-Existing Tables Hardened (4 Tables)
Safely appended columns to pre-existing tables to preserve data integrity and prevent schema reset failures:
*   `public.crm_leads` — Added `pipeline_id` and `stage_id` columns to route leads through structured onboarding stages.
*   `public.crm_accounts` — Added `owner_id` (referencing `auth.users`) to assign contact ownership to CRM managers.
*   `public.crm_contacts` — Added `owner_id` (referencing `auth.users`) for account manager mapping.
*   `public.founder_test_runs` — Added `session_id` to link test runs to parent journey sessions.

---

## 3. Security & Row Level Security (RLS) Policy Specifications

Every new table utilizes strict Row Level Security (RLS) policies to protect operational pipelines and prevent unauthorized access or privilege escalation:

| Table Name | Policy Action | Target Role | Access Rules / Conditions |
| :--- | :--- | :--- | :--- |
| `demo_account_role_mappings` | `ALL` | `authenticated` | Accessible by admins (`profiles.role = 'admin'` or `admin_users.status = 'active'`). |
| `demo_account_role_mappings` | `SELECT` | `authenticated` | Users can view their own role mapping (`auth.uid() = user_id`). |
| `crm_pipelines` | `ALL` | `authenticated` | Accessible by active admins and operations staff. |
| `crm_stages` | `ALL` | `authenticated` | Accessible by active admins and operations staff. |
| `founder_test_sessions` | `ALL` | `authenticated` | Accessible by admins (`profiles.role = 'admin'` or `admin_users.status = 'active'`). |
| `founder_test_sessions` | `SELECT` | `authenticated` | Users can view sessions they started (`auth.uid() = started_by_user_id`). |
| `admin_issue_assignments` | `ALL` | `authenticated` | Admins only. |
| `admin_issue_comments` | `ALL` | `authenticated` | Admins only. |
| `admin_issue_history` | `ALL` | `authenticated` | Admins only. |
| `manual_operation_approvals` | `ALL` | `authenticated` | Admins only. |
| `manual_operation_impacts` | `ALL` | `authenticated` | Admins only. |
| `crm_status_history` | `ALL` | `authenticated` | Admins only. |
| `crm_note_revisions` | `ALL` | `authenticated` | Admins only. |
| `crm_task_history` | `ALL` | `authenticated` | Admins only. |

---

## 4. Non-Destructive Safe Schema Architecture

Every DDL statement is designed to survive partial execution, rollback gracefully on error, and never delete pre-existing production data:

*   **Conditional Creation**: All tables are built via `CREATE TABLE IF NOT EXISTS` with safe UUID primary keys.
*   **Safe Indexes**: Every relational key and filter path uses `CREATE INDEX IF NOT EXISTS` to support fast queries.
*   **Idempotent Policy Creation**: Policies are declared within transaction-safe anonymous PL/pgSQL blocks (`DO $$ BEGIN ... END $$;`) checking metadata directly from `pg_policy` and `pg_class`.

---

## 5. Next Steps & Recommendations

> [!TIP]
> **Recommended Workflow Execution**:
> 1. **Manual Visual Audit**: Review the generated migration file [20260518_internal_crm_founder_self_test_foundation.sql](file:///c:/Users/iaals/Documents/GitHub/gearbeat-V2/supabase/migrations/20260518_internal_crm_founder_self_test_foundation.sql) manually for schema alignment.
> 2. **Apply in Staging**: Apply the migration in a local dockerized or staging database before production deployment.
> 3. **Founder Portal Integration**: Build the React front-end views inside the Developer portal to bind demo accounts and log test sessions interactively.
