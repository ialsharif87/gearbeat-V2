# GEARBEAT V2: BACKEND & DATABASE REALITY AUDIT (AUDIT-101)
**Version:** 1.0.0  
**Status:** DRAFT / AUDIT COMPLETE  
**Agent:** Agent 3 — Backend / Database Reality Audit  
**Date:** 2026-05-15  

---

## 1. EXECUTIVE SUMMARY
This audit provides a "ground truth" assessment of the GearBeat V2 backend architecture, database schema, and security posture. While the foundation is robust, utilizing modern Supabase features (RLS, RPCs, advisory locks), there are significant "shortcuts" currently implemented for testing (e.g., manual payment confirmation) that represent high-severity production blockers.

---

## 2. DATABASE SCHEMA INVENTORY

### 2.1 Tables Identified in Migrations
The following tables are defined across the 22+ migration patches:

| Domain | Tables |
| :--- | :--- |
| **Core / Studios** | `studios`, `studio_availability_rules`, `studio_availability_exceptions`, `studio_boost_subscriptions` |
| **Bookings** | `bookings`, `provider_leads` |
| **Marketplace** | `marketplace_products`, `marketplace_product_variants`, `marketplace_carts`, `marketplace_cart_items`, `marketplace_orders`, `marketplace_order_items` |
| **Payments** | `checkout_payment_sessions`, `payment_transactions`, `coupon_redemptions` |
| **Finance** | `finance_ledger`, `commission_settings`, `settlement_batches`, `settlement_batch_items`, `finance_audit_log` |
| **Identity/Loyalty** | `profiles`, `loyalty_points_ledger`, `trusted_devices` |
| **Certification** | `studio_tiers`, `customer_tiers`, `vendor_tiers`, `certified_studios` |
| **Marketing/Ops** | `notifications`, `merch_kits`, `merch_fulfillment_orders`, `pr_campaigns`, `creator_seeding`, `media_coverage` |

### 2.2 Stored Procedures & RPCs
*   `create_studio_booking_v1`: Atomic booking creation with advisory locking (`SECURITY DEFINER`).
*   `redeem_coupon_code`: Validates and applies discounts.
*   `award_loyalty_event`: Calculates and grants points post-transaction.
*   `processFinanceLedgerAfterPayment`: (JS-side utility) Automates ledger entries.

---

## 3. SECURITY & ACCESS RISK ASSESSMENT

### 3.1 RLS (Row Level Security) Analysis
*   **Status:** Most core tables have `ENABLE ROW LEVEL SECURITY`.
*   **Risk:** `seed.sql` contains `CREATE TABLE` and `CREATE POLICY` statements for `studio_boost_subscriptions`. Schema definitions in seed files can lead to environment drift.
*   **Tenant Isolation:** Most policies correctly check `auth.uid() = auth_user_id`. However, complex joins in `studio_availability_rules` RLS policies (checking studio ownership) add performance overhead and potential leak points if not indexed properly.

### 3.2 Service Role Usage
*   **Pattern:** API routes in `app/api/` (e.g., `bookings/create`, `manual-confirm`) use `createAdminClient()` (Service Role) to bypass RLS.
*   **Risk:** This is architectural "blind trust" in the API logic. If an API route fails to check `supabase.auth.getUser()`, any unauthenticated request could theoretically mutate data.
*   **Audit Result:** Currently, most audited routes properly verify the session user before switching to the admin client.

### 3.3 Auth & Session Risks
*   **Middleware:** Standard `@supabase/ssr` implementation.
*   **Risk:** No explicit "Session Poisoning" protection found, but standard Supabase tokens are used.

---

## 4. FUNCTIONAL REALITY CHECK

### 4.1 Payment Route Risks (CRITICAL)
*   **Blocker:** `app/api/checkout/manual-confirm/route.ts` allows any user with a `checkout_session_id` to mark an order/booking as `paid` if the provider is set to `manual`.
*   **Context:** This was built for the "Deferred Payment" testing phase but MUST be removed or restricted to `admin` roles before production go-live.

### 4.2 Booking Lifecycle Risks
*   **Atomic Logic:** `create_studio_booking_v1` is well-protected with advisory locks.
*   **Validation Gap:** Availability checks happen in JS (`app/api/studios/bookings/create/route.ts`) before the RPC call. There is a micro-window for race conditions where availability could change, though the RPC would likely catch it as a "CONFLICT".

### 4.3 Marketplace Order/Inventory Risks
*   **Inventory:** The `create-order` route checks stock but does not lock it during the transaction. Two users could simultaneously checkout the last item.
*   **Partial Fulfillment:** No logic currently exists to handle multi-vendor orders where one vendor cancels (Finance Ledger handles it manually but the UI/API lacks automation).

---

## 5. TOP 10 PRODUCTION BLOCKERS

1.  **[High] Manual Payment Confirmation:** `api/checkout/manual-confirm` allows bypassing real payment gateways.
2.  **[High] Schema Drift:** `seed.sql` defining production tables (`studio_boost_subscriptions`).
3.  **[Medium] Inventory Race Conditions:** Lack of atomic stock deduction in marketplace checkout.
4.  **[Medium] Hardcoded Rates:** Default 15% commission rate in `lib/finance-ledger.ts` instead of dynamic vendor-specific lookup.
5.  **[Medium] Service Role Exposure:** Over-reliance on `supabaseAdmin` in non-critical paths where RLS could suffice.
6.  **[Medium] Missing Settlement Automation:** `settlement_batches` exist but require manual admin triggers; no automated payout pipeline.
7.  **[Low] Error Handling:** RPC results (JSONB) are occasionally parsed without deep structure validation.
8.  **[Low] Notification Reliability:** Notifications are fired after DB updates but before response; a failure in notification logic could hang the response.
9.  **[Low] PII Storage:** `profiles` table stores PII; needs verification of encryption-at-rest (Supabase standard but should be confirmed).
10. **[Low] Audit Logs:** `finance_audit_log` is populated but not yet exposed to any admin UI for verification.

---

## 6. RECOMMENDED NEXT PHASES

### Phase 102: Security Hardening (Immediate)
*   Decommission `manual-confirm` for non-admin users.
*   Migrate all schema from `seed.sql` to formal migrations.
*   Standardize RPC error response validation.

### Phase 103: Finance & Inventory Polish
*   Implement atomic stock deduction for marketplace.
*   Connect `settlement_batches` to a payout provider (e.g., Stripe/Hyperwallet) or finalized manual workflow.
*   Implement vendor-specific commission overrides.

### Phase 104: Production Readiness Audit
*   Full RLS coverage sweep (ensure *zero* tables have RLS disabled).
*   Environment variable audit for production keys.
