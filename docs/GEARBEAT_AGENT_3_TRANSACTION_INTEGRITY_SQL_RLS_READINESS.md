# GEARBEAT V2: BOOKING & MARKETPLACE TRANSACTION INTEGRITY + SQL/RLS READINESS (PATCH-104C)
**Agent:** Agent 3 — Backend / Security / Payment / SQL Readiness  
**Status:** DRAFT / AUDIT FRAMEWORK  
**Date:** 2026-05-15  

---

## 1. BOOKING LIFECYCLE RISKS

| Step | Risk | Current Gap | Impact |
| :--- | :--- | :--- | :--- |
| **Create Booking (`/api/studios/bookings/create`)** | Availability race window before RPC call | JS‑side availability check runs **outside** a DB transaction. Two concurrent users could both see a slot as free and proceed to the RPC, which will ultimately reject one but creates unnecessary API errors. | Over‑booking, poor UX, extra load on retries. |
| **Cancel / Update** | No explicit RLS policy on `bookings` for studio owners – uses service‑role admin client. | Owner could modify another studio’s bookings if session validation fails. | Data leakage / unauthorized cancellations. |
| **State Transitions** | Booking status (`pending_payment`, `confirmed`, `cancelled`) is driven in application code only. No DB‑level constraints or triggers enforce valid transitions. | Possibility of skipping payment verification. | Financial loss, audit inconsistencies. |

## 2. MARKETPLACE CART / ORDER / INVENTORY RISKS

| Component | Risk | Current Gap | Impact |
| :--- | :--- | :--- | :--- |
| **Cart Add / Update** | No row‑level lock when decrementing `stock_quantity`. | Stock is only read, then later written in `create-order`. Concurrent checkouts can both succeed on the last unit. | Overselling, revenue reconciliation issues. |
| **Create Order (`/api/marketplace/checkout/create-order`)** | Inventory check **not atomic**; no fallback if stock changes after check. | No Postgres function / advisory lock used. | Same as above – overselling. |
| **Multi‑Vendor Orders** | No compensation logic when a vendor aborts after payment. | Finance ledger entries are created, but order fulfillment status is not reconciled. | Refund handling complexity, churn. |

## 3. MANUAL PAYMENT ROUTE RISKS

* The `/api/checkout/manual-confirm` endpoint currently allows any authenticated user to mark a payment as `paid` when the provider is set to `manual`. This bypasses real‑payment validation and can be abused to obtain services for free.
* **Required mitigation** – restrict to **admin** role **before any public release** and remove the “manual” provider flag from production configurations.

## 4. EXISTING VS MISSING TABLES / RPCs

| Area | Present | Missing / Uncertain |
| :--- | :--- | :--- |
| **Tables** | `bookings`, `studio_availability_rules`, `studio_availability_exceptions`, `marketplace_carts`, `marketplace_cart_items`, `marketplace_orders`, `marketplace_order_items`, `checkout_payment_sessions`, `payment_transactions`, `finance_ledger`, `settlement_batches` | No explicit `inventory_locks` table for advisory lock coordination; no `order_audit` table for transaction traceability. |
| **RPCs** | `create_studio_booking_v1` (atomic booking), `redeem_coupon_code`, `award_loyalty_event` | No RPC for **atomic stock deduction** (e.g., `deduct_inventory_atomic`), no RPC for **order finalisation** that validates inventory and creates finance entries in a single transaction. |
| **RLS Policies** | Enabled on most core tables (`studios`, `bookings`, `marketplace_*`). | `studio_boost_subscriptions` defined in *seed.sql* without RLS; `settlement_batches` lacks tenant isolation; `finance_ledger` policies only check `auth.uid()` but not the actor’s role (admin can see all). |

## 5. RLS GAP ANALYSIS BY DOMAIN

| Actor | Typical Access | RLS Coverage |
| :--- | :--- | :--- |
| **Customer** | View & create own bookings, view own cart/orders, make payments. | Policies generally restrict to `auth.uid() = customer_id`. **Missing**: enforcement on `settlement_batches` (customers could read others’ settlement info). |
| **Studio Owner** | Manage own studio, availability, bookings for their studio. | Policies on `studio_*` tables check `owner_id`. **Missing**: explicit denial on `bookings` where `studio_id` does not belong to owner (currently relies on service role). |
| **Vendor** (Marketplace) | List products, create orders, view own order items. | Policies on `marketplace_*` tables check `vendor_id`. **Missing**: RLS on `marketplace_cart_items` for cross‑vendor carts (allows a vendor to see another vendor’s cart items). |
| **Admin / Service Role** | Full access via admin client. | By design bypasses RLS; must be limited to internal tooling only. |

## 6. RECOMMENDED MIGRATION / IMPLEMENTATION ORDER

1. **SQL Drafts (Can be prepared now)**
   - Create **`inventory_locks`** table (id, product_variant_id, lock_token, expires_at).
   - Draft **RLS policies** for `studio_boost_subscriptions`, `settlement_batches`, and `finance_ledger` to restrict non‑admin reads.
   - Draft **security‑definer RPC** `deduct_inventory_atomic(p_variant_id uuid, qty int)` that acquires an advisory lock, checks stock, updates, and releases.
2. **Approval Gates (Require explicit sign‑off)**
   - Any changes to **auth middleware** or **service‑role utility** (`lib/supabase/admin.ts`).
   - Modifications to **payment state machine** (`app/api/checkout/*`).
   - Introduction of **new RPCs** that run with `SECURITY DEFINER`.
3. **Implementation Phases**
   - **Phase 1 – Safety Hardening (Pre‑Company Registration)**
     * Restrict `/api/checkout/manual-confirm` to admin.
     * Add missing RLS on `studio_boost_subscriptions` and `settlement_batches`.
   - **Phase 2 – Transaction Integrity (Pre‑Pilot)**
     * Deploy `deduct_inventory_atomic` RPC and update marketplace checkout to call it.
     * Add DB‑level constraints on `bookings.status` transitions.
   - **Phase 3 – Full Production Readiness (Post‑Legal Activation)**
     * Migrate the drafted SQL objects to production via Supabase migration files.
     * Conduct a full RLS audit sweep ensuring *zero* tables lack RLS.

## 7. WHAT CAN BE DRAFTED NOW
* SQL schema files for new tables/RPCs (stored in `docs/` or a design folder for review).
* Updated RLS policy snippets.
* Architecture diagram (mermaid) showing the flow of a safe booking and marketplace order.

## 8. WHAT REQUIRES EXPLICIT APPROVAL LATER
* Creation of migration files and execution via `supabase db push`.
* Modification of any API route to call new RPCs.
* Changes to `lib/supabase/admin.ts` or any service‑role helper.
* Adjustments to auth middleware for additional session validation.

---

## 9. NEXT STEPS
1. Review this Safety & Readiness plan with the security officer and product lead.
2. Approve the **draft migration SQL** (inventory locks, RLS policies).
3. Proceed to **Patch 104D**: Implement the `deduct_inventory_atomic` RPC and integrate it into the marketplace checkout flow.
