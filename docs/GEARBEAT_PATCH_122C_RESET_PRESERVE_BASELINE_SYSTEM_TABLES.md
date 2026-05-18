# GearBeat V2 Runbook — Reset Script Preserve Baseline System Tables

This document defines the architecture, data structures, and safety configurations developed for **Patch 122C** to ensure the platform reset utility preserves core baseline/reference/system configuration tables while safely cleaning all customer, provider, and transactional test data.

---

## 1. Executive Summary & Verdict Matrix

*   **Sprint Objective**: Protect system reference and configuration metadata from being wiped during founder testing, ensuring a clean, fully-functioning application state immediately post-reset.
*   **Verification Status**: 
    *   **TypeScript Verification**: `PENDING`
    *   **Next.js Production Build**: `PENDING`
*   **Founder Full-Journey Self-Test Status**: **GO FOR FOUNDER FULL-JOURNEY SELF-TEST**
*   **Commercial Launch Status**: **NO-GO FOR COMMERCIAL LAUNCH**

> [!IMPORTANT]
> **Sovereign Compliance Disclaimer**:
> Manual settlement and payment boundaries remain documented for pre-launch review only. No live payment, SAMA-certified checkout, or commercial payment activation is approved in this phase.
>
> **Read-Only Supabase Safety Guard**:
> All schema audits were performed in **strict read-only mode**. No database mutations, SQL deletes, migrations, storage deletions, or auth user deletions were run during this patch.

---

## 2. Why "Zero User Data" != Wiping Baseline Reference Tables

A common pitfall in system cleanups is performing a naive `TRUNCATE` or `DELETE` across all schema tables. In a complex, data-driven platform like GearBeat V2, deleting every database row renders the application completely broken because it wipes out **system reference configurations** needed for standard operations.

For a clean post-reset state, we must strictly preserve system configuration tables. For example:
*   **Access Control**: Deleting `staff_role_permissions` would strip administrative users of their permission tokens, completely locking them out of the Admin Dashboard.
*   **E-Commerce Structure**: Deleting `marketplace_categories` and `marketplace_brands` prevents catalog items from being indexed or searched.
*   **Billing/Integrations**: Deleting `payment_provider_configs` wipes payment keys and endpoints, which breaks checkout initialization.
*   **Taxonomy Tagging**: Deleting `studio_features` and `studio_tiers` destroys the standard room equipment tag library and search filters.

Preserving these tables guarantees the platform remains bootable and immediately ready for a new, end-to-end founder self-testing cycle.

---

## 3. Data Classification Matrix (Preserved vs. Purged)

### A. Strictly Preserved Baseline Configuration (11 Tables)
These tables are omitted from the purge sequence to maintain application integrity:
1.  📁 **`countries`**: Standard geographic references, phone codes, and national boundaries.
2.  📁 **`cities`**: Standard operating city boundaries.
3.  📁 **`marketplace_categories`**: Core e-commerce catalog category tree taxonomy.
4.  📁 **`marketplace_brands`**: Core vendor brand catalog listings.
5.  📁 **`studio_features`**: Standard studio equipment tag library.
6.  📁 **`studio_tiers`**: Listing subscription rules and hierarchies.
7.  📁 **`loyalty_tiers`**: Loyalty points program multiplier tiers.
8.  📁 **`loyalty_earning_rules`**: Configured point accrual conditions.
9.  📁 **`commission_settings`**: Administrative platform take-rate boundaries.
10. 📁 **`payment_provider_configs`**: Payment gateway credentials and APIs.
11. 📁 **`staff_role_permissions`**: Access control rules defining administrative capabilities.

---

### B. Targets for Purging & Resetting (81 Tables)
The following tables are fully targeted for cleanup in safe, leaf-to-parent order:

#### 1. User & Account Data
*   Non-super-admin auth users (deleted gracefully via Admin Auth API).
*   Non-super-admin `profiles`, `customers`, and `users` records.
*   `user_verifications`, `otp_verification_sessions`, and `account_deletion_requests`.
*   *Note: Super Admin auth user, profile record, and customer wallet are explicitly filtered and preserved.*

#### 2. Booking & Review Data
*   `bookings` and booking exceptions (`studio_availability_exceptions`, `studio_availability_rules`).
*   `reviews`, `studio_reviews`, `review_requests`, and `external_review_sources`.

#### 3. Marketplace E-Commerce Test Data
*   `marketplace_products`, `marketplace_product_variants`, `marketplace_product_images`, and `marketplace_inventory`.
*   `marketplace_carts` and `marketplace_cart_items`.
*   `marketplace_orders` and `marketplace_order_items`.
*   `marketplace_product_reviews` and `marketplace_reviews`.
*   `marketplace_product_import_batches` and `marketplace_product_import_rows`.

#### 4. Compliance & Agreements Test Data
*   `owner_compliance_documents`, `owner_compliance_profiles` (non-super-admin), `owner_agreements`, and `owner_bank_accounts`.
*   `vendor_compliance_documents`.
*   `business_verifications` and `verification_documents`.

#### 5. Financials, Settlements & Invoicing Test Data
*   `platform_payments`, `platform_payment_transactions`, and `platform_settlements`.
*   `platform_payouts`, `platform_payout_items`, and `platform_refunds`.
*   `platform_invoices` and `platform_invoice_items`.
*   `checkout_payment_sessions`, `payment_transactions`, `payment_provider_events`, and `payment_refunds`.
*   `studio_commissions`, `booking_commissions`, and `studio_commission_rules`.
*   `vendor_commission_rules`.

#### 6. Loyalty & Wallets Test Data
*   `customer_wallets` (Super Admin wallet balance reset to 0, non-admin wallets purged).
*   `loyalty_points_ledger`, `coupon_redemptions`, `coupon_validation_logs`, and `coupons`.
*   `offers`, `offer_claims`, and `offer_events`.
*   `merch_fulfillment_orders`.

#### 7. CRM, Support & Logs Test Data
*   `provider_leads`.
*   `vendor_api_keys`, `vendor_api_request_logs`, and `vendor_product_sync_logs`.
*   `audit_logs`, `customer_favorites`, `share_events`, `studio_accelerations`, `studio_performance_daily`, `marketplace_events`, and `certification_audit_events`.
*   `studio_boost_subscriptions`, `studio_applications`, `certified_studios`, `studio_tier_rules`, `studio_certification_history`, `qr_verification_links`, and `digital_badges`.

---

## 4. Execution Guard & Commands

To enforce maximum caution:
1.  **Strict Consent Gate**: Execution remains blocked until the dry-run is manually reviewed, and requires `CONFIRM_RESET=GEARBEAT_FULL_RESET` in the shell environment.
2.  **Dry-Run-First Mandate**: Executors must check row count projections in dry-run mode before proceeding.

### A. Dry-Run Auditing (Safe)
Calculate and print row counts for targeted tables without making modifications:
```powershell
$env:SUPER_ADMIN_EMAIL="admin@gearbeat.com"
$env:SUPABASE_URL="https://your-proj.supabase.co"
$env:SUPABASE_SERVICE_ROLE_KEY="service-role-key-here"
npm.cmd run ops:reset-self-test:dry-run
```

### B. Execution (DO NOT RUN until authorized)
Wipes transactional/test rows while strictly preserving baseline system reference files:
```powershell
# DO NOT RUN WITHOUT EXPLICIT APPROVAL
$env:SUPER_ADMIN_EMAIL="admin@gearbeat.com"
$env:SUPABASE_URL="https://your-proj.supabase.co"
$env:SUPABASE_SERVICE_ROLE_KEY="service-role-key-here"
$env:CONFIRM_RESET="GEARBEAT_FULL_RESET"
npm.cmd run ops:reset-self-test:execute
```
