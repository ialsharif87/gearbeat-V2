# GEARBEAT: SQL SPRINT 3 — MARKETPLACE, ORDERS & INVENTORY SCHEMA PLAN
**Agent:** Agent 3 — SQL/Database Readiness  
**Status:** DRAFT / PLANNING  
**Date:** 2026-05-15  

---

## 1. PURPOSE OF SQL SPRINT 3
This phase defines the commerce infrastructure for the GearBeat Marketplace. It establishes the relationship between Vendors (Partners), their Product Catalogs, and the transactional flow of Carts, Orders, and Inventory management.

## 2. DEPENDENCY ON SQL SPRINT 1 & 2
- **`partner_accounts` (Sprint 1)**: Vendors are associated with a `partner_account_id` for business-level ownership.
- **`profiles` (Sprint 1)**: Customers and Vendor staff are identified via their profile/auth IDs.
- **Payment Pattern (Sprint 2)**: Reuses the established `manual` vs `future-safe` reference model for transactions.

## 3. VENDOR & PRODUCT RELATIONSHIP
- **Vendors**: Represented by `marketplace_vendors` (legal/business) and `vendor_profiles` (public store-front).
- **Products**: Managed in a hierarchical structure (`product_categories`) with support for variations (`product_variants`) such as color, size, or pro-audio configurations.
- **Media**: A dedicated `product_media` table ensures high-quality galleries can be managed separately from base product metadata.

## 4. INVENTORY & TRANSACTIONAL INTEGRITY
- **Atomic Stock**: A dedicated `product_inventory` table tracks physical units. 
- **Reservations**: To prevent "race-to-checkout" issues, `inventory_reservations` allow units to be temporarily held while a customer is in the checkout flow.
- **Orders**: Multi-vendor orders are supported by splitting `marketplace_orders` into vendor-specific `marketplace_order_items`.

## 5. ORDER LIFECYCLE
1. `cart`: Items added to active cart.
2. `checkout`: Inventory reserved; payment session created.
3. `paid`: Order confirmed; inventory deduction finalized.
4. `processing`: Vendor notified; fulfillment starts.
5. `shipped`: Tracking info added; `fulfillment_shipments` record created.
6. `delivered`: Order completed.
7. `cancelled/returned`: Compensation logic triggered.

## 6. PAYMENT & PAYOUT BOUNDARIES
- **Customer Payments**: Handled via `marketplace_payment_references` (manual for pilot).
- **Vendor Payouts**: Structural readiness for `vendor_payout_references`, allowing the platform to track what is owed to vendors after commissions.

## 7. RLS DIRECTION (DRAFT)
- **`marketplace_products`**: 
  - `SELECT`: Public (published only).
  - `INSERT/UPDATE`: Vendor owners only.
- **`marketplace_orders`**:
  - `SELECT`: Customer (own orders) or Vendor (items they need to fulfill).
  - `INSERT`: Customer only.
- **`product_inventory`**:
  - `SELECT`: Public (stock availability).
  - `UPDATE`: System/Admin or Vendor owner.

## 8. PRODUCTION VERIFICATION REQUIREMENTS
- Audit existing `marketplace_products` table for column name alignment (e.g., `base_price` vs `price`).
- Confirm category hierarchy depth requirements.
- Verify SKU uniqueness constraints across different vendors.

## 9. MIGRATION RISKS
- **Stock Discrepancy**: Migrating existing stock levels without pausing transactions could lead to minor inaccuracies.
- **Cart Persistence**: Existing session-based carts may need migration to the DB-backed `carts` table for cross-device support.

---

> [!WARNING]
> **DRAFT ONLY**: This document and the associated SQL file are for planning purposes. They have NOT been executed and should NOT be run against a production database without formal review. Inventory functions (deduction/reservation) are strictly placeholders for structural readiness.
