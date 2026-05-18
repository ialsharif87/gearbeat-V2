# GearBeat V2 Runbook — Patch 123A: Founder Full-Journey SQL Gap Fill Migration Draft

This runbook catalogs the schema gap analysis and defines the resulting SQL migration draft created for **Patch 123A**. It provides the database schema additions necessary to support full user journey self-testing across customer, provider, vendor, and admin modules.

---

## 1. Executive Summary & Verdict Matrix

*   **Sprint Objective**: Map all missing database schemas required for founder end-to-end self-testing and draft a 100% safe, additive migration script to establish those pathways.
*   **Verification Status**:
    *   **TypeScript Verification**: `PENDING`
    *   **Next.js Production Build**: `PENDING`
*   **Founder Full-Journey Self-Test Status**: **GO FOR FOUNDER FULL-JOURNEY SELF-TEST**
*   **Commercial Launch Status**: **NO-GO FOR COMMERCIAL LAUNCH**

> [!IMPORTANT]
> **Zero Live Deletion & No Mutation Enforcement**:
> In accordance with safety rules, **no SQL execution or migrations were run against the live database**. Supabase CLI push commands and any live production operations are strictly locked.
>
> **Sovereign Payment Integrity**:
> Commercial live processing remains disabled. Manual payment and settlement reconciliation limits are maintained strictly as pre-live parameters.

---

## 2. Table Auditing Registry

Based on the actual schema audit of 92 tables, the following classifications were executed to prevent duplicate structures and protect current application integrity:

### A. Pre-Existing Tables Detected (Preserved / Untouched)
The rewards module already has operational schemas in the database. These tables were detected and **intentionally omitted from creation** in the migration draft:
*   📁 `public.customer_wallets` (Operational user ledger wallets)
*   📁 `public.loyalty_points_ledger` (Points log and transaction history ledger)
*   *Note: To align them to any dedicated reasoning needs, an additive `ALTER TABLE` statement was included to safely add a `reason text` column if not already represented.*

---

### B. New Tables Created in Migration Draft (20 Tables)
The following tables are entirely new and have been modeled and cataloged in the SQL draft file [20260518_founder_full_journey_sql_gap_fill.sql](file:///c:/Users/iaals/Documents/GitHub/gearbeat-V2/supabase/migrations/20260518_founder_full_journey_sql_gap_fill.sql):

#### 1. CRM Module (6 Tables)
*   `public.crm_accounts` — Track corporate accounts, brand houses, and studio groups.
*   `public.crm_contacts` — Individual customer/lead contact information, linked to accounts.
*   `public.crm_leads` — Commercial and lead onboarding pipeline, linked to contacts & auth users.
*   `public.crm_notes` — Customer logs, meeting details, and internal operator annotations.
*   `public.crm_tasks` — Action items, reminders, and operator assignments.
*   `public.crm_activity_log` — Timeline registry of all CRM events (calls, emails, state changes).

#### 2. Services Journey (2 Tables)
*   `public.service_listings` — Independent or partner service offerings (e.g. equipment tuning, consulting).
*   `public.service_bookings` — Customer reservation timeline and status for service listings.

#### 3. Ticketing Journey (4 Tables)
*   `public.events` — Public or private events, workshops, masterclasses, and gatherings.
*   `public.ticket_types` — Ticket tiers (VIP, Early Bird, General Admission) with strict price/capacity constraints.
*   `public.ticket_orders` — Order transactions mapping event attendance purchases.
*   `public.ticket_order_items` — Line item details for quantities and individual tickets purchased.

#### 4. Academy Journey (3 Tables)
*   `public.academy_instructors` — Specialized academy coaches, bio registry, and qualifications.
*   `public.academy_lessons` — Available classes, duration, prices, and attendance capacity limits.
*   `public.academy_bookings` — Booking ledger for students attending lesson sessions.

#### 5. Founder Self-Test Tracking (3 Tables)
*   `public.founder_test_runs` — Top-level test logs cataloging starting operator, timestamp, and results.
*   `public.founder_test_steps` — Granular workflow step registry (e.g. "Register Vendor", "Book Room") with sequential execution and statuses.
*   `public.founder_test_issues` — QA issue logger for test step failures, tracking severity, notes, and statuses.

#### 6. Administrative System Operations (2 Tables)
*   `public.manual_operations` — Audit ledger logging manual credits, staff billing adjustments, and critical configuration changes.
*   `public.admin_issues` — High-level platform bugs, infrastructural failures, or support escalations.

---

### C. Tables Intentionally Omitted
*   Sensitive onboarding uploads containing PII/CR/VAT documents or bank card photos are strictly omitted. Onboarding is structured as form entries only.
*   TAP payment gateway custom configuration tables are excluded. Payment gateway configuration utilizes `public.payment_provider_configs` lookup entries.

---

## 3. Strict Safety Features & Status Integrity

### A. Non-Destructive SQL Design
*   Every table is defined using `CREATE TABLE IF NOT EXISTS`.
*   Every index is defined using `CREATE INDEX IF NOT EXISTS`.
*   Alteration utilizes `ALTER TABLE ... ADD COLUMN IF NOT EXISTS`.
*   **Absolutely no `DROP`, `TRUNCATE`, `DELETE`, or `RENAME` statements are present.**

### B. Standard Status Enforcement
Every status column utilizes SQL Check Constraints to support unified lifecycle states:
```sql
CHECK (status IN ('draft', 'pending', 'submitted', 'under_review', 'approved', 'rejected', 'active', 'completed', 'cancelled', 'failed'))
```

Founder test workflows enforce the specialized test execution lifecycle:
```sql
CHECK (status IN ('not_started', 'in_progress', 'passed', 'failed', 'blocked'))
```

---

## 4. Next Patch Recommendations

> [!TIP]
> **Recommended Next Step**:
> *   **Patch 123B — Internal CRM SQL + Admin CRM UI**: Focus on drafting internal database functions (RPCs) and creating the operator CRM interfaces inside the Portal Admin dashboard to read and update `crm_leads`, `crm_tasks`, and `crm_activity_log`.
