# GEARBEAT PATCH 101B: SUPABASE WORKFLOW SAFETY & DB REALITY GATE

**Agent:** Agent 2 — Infrastructure & Safety  
**Status:** IMPLEMENTED / AUDIT COMPLETE  
**Date:** 2026-05-16  

---

## 1. WORKFLOW SAFETY UPGRADE

### Original Workflow Risk
The previous `.github/workflows/supabase-migrations.yml` was configured to trigger on every `push` to the `main` branch. It executed `supabase db push` automatically.  
**Critical Risk:** Any merge to main containing a flawed or destructive migration (e.g., `DROP TABLE`) would immediately execute against the production database without manual verification or a "reality gate."

### Exact Workflow Safety Change
- **Trigger Restriction:** Removed the `push` trigger for the `main` branch. The workflow is now restricted to `workflow_dispatch` (manual trigger) only.
- **Mutation Block:** Removed the `supabase db push` command.
- **Audit Mode:** Replaced mutation commands with `supabase migration list`. This allows developers to see which migrations are pending in the production environment without actually applying them.
- **Manual Input:** Added a `confirm_push` input field as a decorative safety reminder that mutation is disabled in the automated pipeline.

---

## 2. DATABASE REALITY AUDIT (HIGH-LEVEL)

### Tables Referenced by Code
The following tables are actively referenced in `app/api/**` and `lib/**` via Supabase Client calls:

| Domain | Tables |
| :--- | :--- |
| **Identity** | `profiles`, `verification_documents`, `trusted_devices`, `admin_users`, `vendor_profiles`, `vendor_api_keys` |
| **Studios** | `studios`, `studio_availability_rules`, `studio_availability_exceptions`, `studio_boost_subscriptions`, `studio_images`, `studio_feature_links`, `studio_equipment`, `studio_features`, `studio_reviews`, `studio_applications`, `provider_leads` |
| **Marketplace** | `marketplace_products`, `marketplace_product_variants`, `marketplace_product_images`, `marketplace_inventory`, `marketplace_categories`, `marketplace_brands`, `marketplace_reviews`, `marketplace_wishlists`, `marketplace_carts`, `marketplace_cart_items`, `marketplace_orders`, `marketplace_order_items`, `marketplace_product_import_batches`, `marketplace_product_import_rows` |
| **Finance** | `finance_ledger`, `finance_audit_logs`, `commission_settings`, `vendor_commission_rules`, `settlement_batches`, `settlement_batch_items`, `payout_requests`, `refunds_adjustments`, `vendor_product_sync_logs` |
| **Loyalty** | `loyalty_points_ledger`, `customer_tiers`, `vendor_tiers`, `studio_tiers` |
| **Certification** | `certified_studios` |
| **Ops / Shared** | `notifications`, `merch_kits`, `merch_fulfillment_orders`, `pr_campaigns`, `creator_seeding`, `media_coverage`, `share_events`, `audit_logs`, `cities`, `countries` |

### RPC / Functions Referenced by Code
The following stored procedures are critical for atomic operations and business logic:

- `create_studio_booking_v1`: Atomic booking creation with availability locking.
- `claim_offer`: Promotional offer redemption.
- `validate_coupon_code`: Discount validation logic.
- `redeem_coupon_code`: Finalizing coupon usage.
- `award_loyalty_event`: Post-payment point calculation.
- `refresh_customer_wallet_tier`: User tier escalation/de-escalation.
- `get_or_create_customer_wallet`: Lazy initialization of loyalty wallets.
- `add_loyalty_points_manually`: Administrative point adjustments.
- `initialize_marketplace_checkout_v1`: Marketplace session initialization.

---

## 3. MIGRATION COVERAGE & GAPS

### Existing Migration Coverage
- **Patches:** 22 SQL files in `supabase/migrations/` covering incremental updates from Patch 16 to Patch 100.
- **Foundation:** `marketplace-foundation.sql` (root) defines the core marketplace schema but is not tracked as a formal Supabase migration.
- **Drafts:** Significant schema logic exists in `docs/sql-drafts/` but has not been promoted to formal migrations.

### Known Schema / RPC Gaps
- **Academy Domain:** `academy_courses`, `academy_lessons`, and `academy_enrollments` are front-end only or reside in unexecuted drafts.
- **Ticketing Domain:** `event_tickets` and inventory management for physical/digital events are missing from the live schema.
- **Audit Divergence:** The code references `audit_logs` and `finance_audit_logs`, while documentation mentions `system_audit_logs`.
- **Integrity Gaps:** Marketplace checkout lacks an atomic `deduct_inventory` RPC, relying on client-side or multi-step logic.

---

## 4. NEXT STEPS (CRITICAL)

### Required: Staging Schema Baseline
Before ANY further migrations are attempted or the workflow is re-enabled for push:
1.  **Production Dump:** Perform a full schema dump of the current production Supabase instance.
2.  **Baseline Creation:** Create a `00000000000000_baseline.sql` migration that represents the EXACT current state of the database.
3.  **Migration Squash:** Reconcile the 22 patch files against the baseline to ensure no "re-running" of existing logic occurs.
4.  **Shadow Deployment:** Verify the baseline + patches on a clean local/staging environment before attempting a production sync.

**THIS IS A SAFETY AND AUDIT PATCH ONLY. NO DATABASE MUTATIONS WERE PERFORMED.**
