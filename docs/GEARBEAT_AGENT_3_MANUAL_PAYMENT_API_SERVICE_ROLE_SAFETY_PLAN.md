# MANUAL PAYMENT / API / SERVICE ROLE SAFETY PLAN (PATCH-103C)
**Agent:** Agent 3 — Backend / Security / Payment Readiness  
**Status:** DRAFT / SAFETY FRAMEWORK  
**Date:** 2026-05-15  

---

## 1. MANUAL PAYMENT ROUTE RISK SUMMARY

The current implementation of the "Manual Confirmation" route represents the most immediate security vulnerability in the GearBeat V2 backend.

### 1.1 The Vulnerability: `/api/checkout/manual-confirm`
*   **Mechanism:** This route accepts a `checkout_session_id` and, if the provider is "manual," it proceeds to mark the source (booking or order) as `confirmed`/`paid` and awards loyalty points.
*   **Risk:** Currently, any authenticated user can trigger this endpoint. While it checks if the session belongs to the user, the "manual" provider status can be easily selected during checkout creation, allowing users to bypass real payments entirely.
*   **Criticality:** **BLOCKER**. This must be restricted to users with `raw_user_meta_data->>'role' = 'admin'` before any public exposure.

---

## 2. API HARDENING INVENTORY

The following API routes utilize the Supabase Service Role and require hardening before commercial launch.

| Route | Purpose | Hardening Required |
| :--- | :--- | :--- |
| `checkout/manual-confirm` | Testing payment confirmation | Restrict to Admin role ONLY. |
| `marketplace/checkout/create-order` | Order & Inventory | Implement atomic stock deduction via RPC. |
| `studios/bookings/create` | Booking creation | Add advisory locking for availability exceptions. |
| `v1/vendor/*` | Public Vendor API | Implement API key rotation and rate limiting. |
| `otp/verify` | Identity Verification | Implement strict cooldowns and brute-force protection. |

---

## 3. SERVICE ROLE USAGE & GOVERNANCE

GearBeat V2 uses a "Bypass RLS" pattern via `createAdminClient()` for complex business logic. This places the burden of security entirely on the application layer.

### 3.1 Primary Risks
*   **Logical Bypassing:** A developer error in a route (e.g., missing a `user.id` check) results in the service role performing an operation on the wrong data.
*   **Metadata Reliance:** Security checks rely on `raw_user_meta_data` from the Auth session. If this metadata is tampered with or misconfigured, the backend may grant elevated privileges.

### 3.2 Mitigation Plan
*   **Logic Isolation:** Move complex multi-table mutations into `SECURITY DEFINER` Postgres functions (RPCs) where possible, rather than raw JS updates.
*   **Audit Trail:** Ensure every service role operation is logged to the `audit_log` or `finance_audit_log` with the `auth.uid()` of the initiating user.

---

## 4. PHASED FIX ORDER

### Phase 1: Security Hardening (Pre-Company Registration)
1.  **Manual Route Lock:** Immediate restriction of `manual-confirm` to Admin users.
2.  **Rate Limiting:** Implement middleware-level rate limiting for all `/api/*` endpoints.
3.  **Schema Cleanup:** Move all `seed.sql` schema definitions into formal migrations.

### Phase 2: Transaction Integrity (Pre-Pilot)
1.  **Atomic Inventory:** Migrate marketplace checkout to use a Postgres function that locks rows during stock deduction.
2.  **State Harmonization:** Standardize booking status transitions to ensure `pending_payment` cannot be bypassed without a valid transaction.

### Phase 3: Commercial Integration (Post-Legal Activation)
1.  **Live Gateway:** Replace manual testing logic with Stripe/Tap production webhooks.
2.  **Settlement Pipeline:** Activate the `settlement_batches` automation logic for vendor payouts.

---

## 5. APPROVAL GATES

No changes to the following areas are permitted without a formal **"Agent 3 - Security Review"** and user sign-off:
1.  **Auth Middleware:** Any change to session handling or cookie logic.
2.  **Service Role Utility:** Any modification to `lib/supabase/admin.ts`.
3.  **Payment Logic:** Any change to the state machine in `app/api/checkout`.
4.  **Database RPCs:** Any change to functions marked `SECURITY DEFINER`.

---

## 6. NEXT STEPS
1.  Review and approve this Safety Plan.
2.  Proceed to **Patch 103D: Admin Role Enforcement** for testing endpoints.
3.  Initiate **Patch 104: Atomic Transaction RPCs** for marketplace and bookings.
