# GearBeat V2 Runbook — Supabase Actual Schema Reset Alignment & Founder Gate

This document defines the alignment and execution safeguards for **Patch 122B**, which calibrates the database reset utilities to perfectly match the actual **92 public tables** discovered via Supabase MCP in read-only mode. 

---

## 1. Executive Summary & Verdict Matrix

*   **Sprint Objective**: Align the database reset script with the actual, current Supabase schema of 92 tables, implementing the Founder Self-Test Data Gate with strict Super Admin preservation.
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
> All schema auditing was performed in **strict read-only mode**. No database mutations, SQL deletes, migrations, storage deletions, or auth user deletions were run during this patch.

---

## 2. Actual Supabase Schema Inventory (92 Tables)

The following tables have been verified in the database via Supabase MCP and grouped by their logical module constraints:

### A. User / Profile / Customer Module (8 Tables)
Handles customer accounts, administrative staff registry, KYC records, and device authorization.
*   `public.users`
*   `public.profiles`
*   `public.customers`
*   `public.admin_users`
*   `public.user_verifications`
*   `public.otp_verification_sessions`
*   `public.account_deletion_requests`
*   `public.staff_role_permissions`

### B. Studios / Listings Module (12 Tables)
Defines studio workspaces, photography carousels, equipment, availability rules, and ratings tier hierarchies.
*   `public.studios`
*   `public.studio_images`
*   `public.studio_features`
*   `public.studio_feature_links`
*   `public.studio_equipment`
*   `public.studio_availability_rules`
*   `public.studio_availability_exceptions`
*   `public.studio_applications`
*   `public.studio_tiers`
*   `public.certified_studios`
*   `public.studio_tier_rules`
*   `public.studio_certification_history`

### C. Bookings / Reviews Module (5 Tables)
Covers customer reservations of studio hours, rating submissions, and external reviews sync.
*   `public.bookings`
*   `public.reviews`
*   `public.studio_reviews`
*   `public.review_requests`
*   `public.external_review_sources`

### D. Marketplace / E-Commerce Module (15 Tables)
Powers the shop segment where physical/digital merch items, brands, carts, variant inventory, and multi-vendor logs reside.
*   `public.marketplace_categories`
*   `public.marketplace_brands`
*   `public.vendor_profiles`
*   `public.marketplace_products`
*   `public.marketplace_product_variants`
*   `public.marketplace_product_images`
*   `public.marketplace_inventory`
*   `public.marketplace_orders`
*   `public.marketplace_order_items`
*   `public.marketplace_product_reviews`
*   `public.marketplace_reviews`
*   `public.marketplace_carts`
*   `public.marketplace_cart_items`
*   `public.marketplace_product_import_batches`
*   `public.marketplace_product_import_rows`

### E. Compliance / Agreements / Banking Module (7 Tables)
Stores onboarding contracts, business verification docs, IBANs, and legal agreement records for studio owners and vendors.
*   `public.owner_compliance_profiles`
*   `public.owner_compliance_documents`
*   `public.owner_agreements`
*   `public.owner_bank_accounts`
*   `public.vendor_compliance_documents`
*   `public.business_verifications`
*   `public.verification_documents`

### F. Financials / Settlements / Invoicing Module (18 Tables)
Manages incoming payments, billing gateway transactions, split commission calculations, invoicing statements, and batch payout history.
*   `public.platform_payments`
*   `public.platform_payment_transactions`
*   `public.platform_settlements`
*   `public.platform_payouts`
*   `public.platform_payout_items`
*   `public.platform_refunds`
*   `public.platform_invoices`
*   `public.platform_invoice_items`
*   `public.commission_settings`
*   `public.studio_commissions`
*   `public.booking_commissions`
*   `public.studio_commission_rules`
*   `public.vendor_commission_rules`
*   `public.payment_provider_configs`
*   `public.checkout_payment_sessions`
*   `public.payment_transactions`
*   `public.payment_provider_events`
*   `public.payment_refunds`

### G. Loyalty / Wallets / Promotions Module (13 Tables)
Powers virtual loyalty tier points, wallet credit ledgering, discount coupons, and merchandise gift kits.
*   `public.loyalty_tiers`
*   `public.customer_wallets`
*   `public.loyalty_points_ledger`
*   `public.coupons`
*   `public.coupon_redemptions`
*   `public.offers`
*   `public.loyalty_earning_rules`
*   `public.coupon_validation_logs`
*   `public.offer_events`
*   `public.offer_claims`
*   `public.merch_fulfillment_orders`
*   `public.qr_verification_links`
*   `public.digital_badges`

### H. CRM / Support / Admin / Issues Module (4 Tables)
Tracks onboarding leads, partner tickets, API integrations, and developer logs.
*   `public.provider_leads`
*   `public.vendor_api_keys`
*   `public.vendor_api_request_logs`
*   `public.vendor_product_sync_logs`

### I. Analytics / Events Module (8 Tables)
Audits administrator/user actions, customer favorites, share clicks, list boosts, and daily performance metrics.
*   `public.audit_logs`
*   `public.customer_favorites`
*   `public.share_events`
*   `public.studio_accelerations`
*   `public.studio_performance_daily`
*   `public.marketplace_events`
*   `public.certification_audit_events`
*   `public.studio_boost_subscriptions`

### J. Geographic Lookup Reference Data (2 Tables - Excluded from Wipes)
Lookup tables providing national phone codes, currencies, and boundaries.
*   `public.countries` *(Preserved strictly to avoid breaking primary key dependencies)*
*   `public.cities` *(Preserved strictly)*

---

## 3. Operational Script Safeguards

The local reset utility is located at:
[scripts/ops/reset-self-test-data.ts](file:///c:/Users/iaals/Documents/GitHub/gearbeat-V2/scripts/ops/reset-self-test-data.ts)

It has been rebuilt to ensure clean dependency ordering and absolute safety during testing.

### Key Safeties
1.  **Super Admin Preservation**: First, the script checks if the Super Admin user exists under `SUPER_ADMIN_EMAIL` in the Auth list. If not, it halts. The Super Admin auth record, profiles row, and wallets row are strictly skipped and preserved.
2.  **Explicit Consent Gate**: EXECUTE mode crashes by design unless `CONFIRM_RESET=GEARBEAT_FULL_RESET` is explicitly declared.
3.  **Non-Interactive Environment Ready**: `tsx` has been added as a direct `devDependency` in `package.json`, preventing any interactive execution prompts or standard npx setup errors during background scripting runs.
4.  **Reference Data Immunity**: The reference lookup tables (`countries`, `cities`) are omitted from the purge sequence, preserving relational key references across the database structure.

---

## 4. Execution Commands

### A. Dry-Run Auditing (Safe)
Runs an exact count of targeted rows per table without executing any modifications:
```powershell
$env:SUPER_ADMIN_EMAIL="admin@gearbeat.com"
$env:SUPABASE_URL="https://your-proj.supabase.co"
$env:SUPABASE_SERVICE_ROLE_KEY="service-role-key-here"
npm run ops:reset-self-test:dry-run
```

### B. Execution (DO NOT RUN until manually verified and authorized)
Wipes test data and preserves Super Admin profile structures:
```powershell
# DO NOT RUN WITHOUT EXPLICIT APPROVAL
$env:SUPER_ADMIN_EMAIL="admin@gearbeat.com"
$env:SUPABASE_URL="https://your-proj.supabase.co"
$env:SUPABASE_SERVICE_ROLE_KEY="service-role-key-here"
$env:CONFIRM_RESET="GEARBEAT_FULL_RESET"
npm run ops:reset-self-test:execute
```
