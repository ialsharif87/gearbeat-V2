# GEARBEAT V2: BACKEND RISK PRIORITIZATION (PATCH-102A)
**Agent:** Agent 3 — Backend / Security / Payment Readiness  
**Status:** DRAFT / RISK ANALYSIS COMPLETE  
**Date:** 2026-05-15  

---

## 1. RISK CATEGORIZATION & PRIORITIZATION

This section categorizes the findings from the [AUDIT-101](file:///c:/Users/iaals/Documents/GitHub/gearbeat-V2/docs/GEARBEAT_AUDIT_101_BACKEND_DATABASE_REALITY_REPORT.md) based on their impact on production stability and security.

### 1.1 Critical Risks (Fix Immediately)
*   **[R-CRIT-01] Manual Payment Exposure:**  
    The `/api/checkout/manual-confirm` route currently lacks a role check for `admin`. Any authenticated user with a `checkout_session_id` for a "manual" provider session can mark their own order as "Paid."
    *   **Impact:** Financial loss, unauthorized access to services.

### 1.2 High Risks (Target Before Pilot Launch)
*   **[R-HIGH-01] Marketplace Inventory Race Condition:**  
    Order creation checks stock but does not lock/deduct it atomically. High-concurrency traffic could lead to over-selling.
    *   **Impact:** Customer dissatisfaction, operational overhead for refunds.
*   **[R-HIGH-02] Schema Drift (Seed-based Schema):**  
    `studio_boost_subscriptions` and its RLS policies are defined in `seed.sql`. This bypasses the migration tracking system.
    *   **Impact:** Deployment failures, inconsistent environments.

### 1.3 Medium Risks (Post-Pilot / Hardening)
*   **[R-MED-01] Hardcoded Commission Rates:**  
    `lib/finance-ledger.ts` defaults to 15%. Lack of dynamic vendor-specific lookup prevents flexible business models.
*   **[R-MED-02] Missing Settlement Automation:**  
    The `settlement_batches` tables are ready, but the logic to process them is currently manual or non-existent.
*   **[R-MED-03] RPC JSON Validation:**  
    RPC results are often trusted without deep validation, which could lead to runtime errors if the DB structure changes.

### 1.4 Low Risks (Optimization)
*   **[R-LOW-01] Notification Threading:**  
    Notifications are sent synchronously in API routes. A delay in the notification service (Resend) could slow down user response times.
*   **[R-LOW-02] Audit Log Visibility:**  
    `finance_audit_log` is populated but has no admin UI for verification.

---

## 2. FIX ORDER & ROADMAP

### Priority 1: Security & Integrity (Pre-Company Registration)
1.  **Decommission/Restrict `manual-confirm`:** Add `admin` role check to the manual confirmation route.
2.  **Formalize Schema:** Move all definitions from `seed.sql` to a new migration patch (`patch_102_schema_cleanup.sql`).
3.  **Atomic Inventory:** Implement an RPC-level stock deduction or Postgres transaction for order creation.

### Priority 2: Financial Foundation (Pre-Pilot)
1.  **Dynamic Commission Lookup:** Connect the Finance Ledger to the `commission_settings` table properly.
2.  **Settlement Logic:** Implement the backend "Finalize Batch" logic for financial close-outs.

### Priority 3: Commercial Readiness (Post-Legal Activation)
1.  **Real Payment Integration:** Switch from "Manual/Deferred" to a live provider (e.g., Stripe, Tap).
2.  **Legal Compliance:** Add VAT calculation logic and formal invoicing (Saudi Arabian requirements).

---

## 3. GOVERNANCE & SAFETY

### 3.1 Backend Tasks Requiring Explicit Approval
*   Any modification to the `/api/checkout/*` or `/api/studios/bookings/create` logic.
*   Any new SQL migration file.
*   Any change to `lib/supabase/admin.ts` or `lib/finance-ledger.ts`.

### 3.2 Current Sprint Safety Recommendation
> [!IMPORTANT]
> **No-Change Policy for Logic Files:** To maintain the stability of the current "Smart Discovery" (Frontend) sprint, Agent 3 recommends **NO CHANGES** to the actual code files in `app/api/` or `lib/` until the prioritization is approved and a dedicated "Hardening Patch" is scheduled.
> 
> The current system is sufficient for internal manual testing of the discovery and booking UI, provided the environment remains protected and non-public.

---

## 4. NEXT STEPS
1.  Review and approve this prioritization.
2.  Initiate **Patch 102B (SQL Cleanup)** to move `seed.sql` definitions into formal migrations.
3.  Initiate **Patch 103 (Security Hardening)** to protect the manual confirmation routes.
