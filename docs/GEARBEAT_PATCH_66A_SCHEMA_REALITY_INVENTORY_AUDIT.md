# GEARBEAT PATCH 66A — SCHEMA REALITY INVENTORY AUDIT

## 1. Overview
This is a **documentation-only** audit of the GearBeat V2 database schema usage within the application code. It maps all referenced database tables, RPC functions, and storage buckets to identified SQL migrations to establish a "Reality Inventory" of the system's data dependencies.

**Policy:** Zero mutation. No database, SQL, RLS, or API changes were performed during this audit.

---

## 2. Global Schema Inventory

### A. Core Platform Tables
| Table Name | Usage Context | Migration Reference | Status |
| :--- | :--- | :--- | :--- |
| `profiles` | User profiles, roles, contact info | Baseline (Implicit) | Confirmed |
| `studios` | Studio listings, metadata, location | Baseline (Implicit) | Confirmed |
| `admin_users` | Admin role authorization (lib/admin.ts) | Baseline (Implicit) | Confirmed |
| `vendor_profiles` | Marketplace vendor/seller data | Patch 25 (Mapping) | Confirmed |
| `bookings` | Studio booking records | Baseline / Patch 42B | Confirmed |
| `studio_features` | Studio amenities/tags | Baseline | Confirmed |
| `studio_equipment` | Studio gear inventory | Baseline | Confirmed |
| `studio_feature_links`| Linking features to studios | Baseline | Confirmed |
| `studio_reviews` | Customer reviews for studios | Baseline | Confirmed |
| `notifications` | System-wide notification log | Patch 75 | Confirmed |

### B. Marketplace & Inventory
| Table Name | Usage Context | Migration Reference | Status |
| :--- | :--- | :--- | :--- |
| `marketplace_products` | Product catalog (lib/marketplace) | Baseline (Manual?) | **Migration Gap** |
| `marketplace_categories`| Product categories | Baseline (Manual?) | **Migration Gap** |
| `marketplace_brands` | Product brands | Baseline (Manual?) | **Migration Gap** |
| `marketplace_product_variants` | Product options (size/color) | Baseline (Manual?) | **Migration Gap** |
| `marketplace_product_reviews` | Customer product reviews | Baseline (Manual?) | **Migration Gap** |
| `marketplace_carts` | Customer shopping carts | Baseline (Manual?) | **Migration Gap** |
| `marketplace_cart_items` | Cart line items | Baseline (Manual?) | **Migration Gap** |
| `marketplace_orders` | Marketplace sales records | Baseline (Manual?) | **Migration Gap** |
| `marketplace_order_items` | Order line items | Baseline (Manual?) | **Migration Gap** |
| `marketplace_promos` | Homepage banners/promos | Patch 90 | Confirmed |

### C. Finance, Loyalty & Payouts
| Table Name | Usage Context | Migration Reference | Status |
| :--- | :--- | :--- | :--- |
| `finance_ledger` | Triple-entry accounting log | Patch 81 | Confirmed |
| `finance_audit_logs` | Audit trail for financial mutations | Patch 86 | Confirmed |
| `customer_wallets` | Customer credit/wallet balances | lib/loyalty | **Migration Gap** |
| `loyalty_points_ledger` | Points earn/burn history | lib/loyalty | **Migration Gap** |
| `loyalty_tiers` | Tier definitions (customer) | Patch 100 | Confirmed |
| `payment_transactions` | Stripe/Manual payment records | lib/finance | **Migration Gap** |
| `payment_refunds` | Refund records | Patch 84 | Confirmed |
| `checkout_payment_sessions` | Temporary checkout states | Patch 42B | Confirmed |
| `coupon_redemptions` | Log of used coupons | lib/finance | **Migration Gap** |
| `coupons` | Discount codes | Baseline | Confirmed |
| `commission_settings` | Platform fee overrides | Patch 72 | Confirmed |

### D. Onboarding & CRM
| Table Name | Usage Context | Migration Reference | Status |
| :--- | :--- | :--- | :--- |
| `provider_leads` | Incoming partner leads | lib/actions.ts | Confirmed |
| `studio_applications` | Full studio onboarding apps | lib/storage | Confirmed |
| `certified_studios` | Trust/Verification records | Patch 51F / 100 | Confirmed |
| `studio_tiers` | Certification levels | Patch 51F / 100 | Confirmed |
| `review_requests` | Review invitation tokens | app/admin/review-requests | Confirmed |

---

## 3. RPC / Stored Procedures Inventory

| RPC Name | Purpose | Found In | Status |
| :--- | :--- | :--- | :--- |
| `create_studio_booking_v1` | Atomic booking & payment creation | app/api/studios/bookings | Confirmed (Patch 42B) |
| `validate_coupon_code` | Validation of discount logic | app/api/checkout/session | Confirmed |
| `redeem_coupon_code` | Redeeming a code on payment | app/api/checkout/manual-confirm | Confirmed |
| `create_checkout_payment_session` | Initializing session state | app/api/checkout/session | Confirmed |
| `award_loyalty_event` | Awarding points for events | app/api/checkout/manual-confirm | Confirmed |
| `claim_offer` | Claiming a limited offer | app/api/offers/claim | Confirmed |
| `ensure_customer_wallet` | Creating wallet if missing | app/api/admin/loyalty | Confirmed |
| `post_loyalty_points` | Adding/Removing points | app/api/admin/loyalty | Confirmed |
| `refresh_customer_wallet_tier`| Updating tier based on points | app/api/admin/loyalty | Confirmed |

---

## 4. Storage Bucket Inventory

| Bucket Name | Purpose | RLS Policy | Status |
| :--- | :--- | :--- | :--- |
| `provider-documents` | Signed contracts, ID copies | Private (Signed URLs) | Confirmed |
| `product-images` | Marketplace item photos | Public Read | Confirmed |
| `studio-images` | Studio interior photos | Public Read | Confirmed |
| `avatars` | User profile photos | Public Read | Confirmed |

---

## 5. Identified Schema Drift & Technical Debt

### A. Missing Local Migrations (The "Foundation" Gap)
Several core tables referenced in the code do not have corresponding `CREATE TABLE` statements in the `supabase/migrations/` folder. This suggests they were created via the Supabase Dashboard or pre-date the migration tracking system.
- **Action Required:** Perform `supabase db pull` to generate a baseline migration for these objects.

### B. "Phantom" Loyalty Tables
Tables like `customer_wallets` and `loyalty_points_ledger` are heavily referenced in `lib/loyalty/` and `app/api/admin/loyalty/`, but no SQL definition exists in the local repo.
- **Risk:** High. Any environment reset will break the loyalty system.

### C. Marketplace Schema Isolation
The entire marketplace infrastructure (Products, Variants, Carts, Orders) appears to be missing from the local migration history. 
- **Risk:** High. Critical for marketplace soft launch readiness.

---

## 6. Recommended Next Steps

1. **Patch 66B — Baseline Synchronization:**
   - Run `supabase db pull` to fetch all "missing" table definitions and RPCs.
   - Commit the resulting migration to the repo to close the documentation gap.

2. **Patch 67A — Service-Role / RLS / Security Audit:**
   - Audit all `supabaseAdmin` (service role) usage.
   - Implement RLS policies for the "Missing" tables identified in Section 2.
   - Transition non-critical admin operations to standard authenticated clients where possible.

3. **Phase 68 — Production Reconciliation:**
   - Verify that the production Supabase project matches the "Reality Inventory" documented here.

---
**Audit Completed By:** Antigravity AI
**Date:** 2026-05-12
**Verification Status:** READ-ONLY / NO CODE MUTATION PERFORMED.
