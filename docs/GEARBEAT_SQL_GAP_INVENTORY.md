# GEARBEAT: SQL GAP INVENTORY (SPRINT-0)
**Agent:** Agent 3 — SQL/Database Readiness  
**Status:** DRAFT / DISCOVERY COMPLETE  
**Date:** 2026-05-15  

---

## 1. EXISTING TABLES & MIGRATIONS
The following tables were identified through migration inspection and code references.

| Domain | Tables |
| :--- | :--- |
| **Identity / Profiles** | `profiles`, `verification_documents`, `trusted_devices` |
| **Studios** | `studios`, `studio_availability_rules`, `studio_availability_exceptions`, `studio_boost_subscriptions`, `studio_images`, `studio_feature_links`, `studio_equipment`, `studio_features` |
| **Bookings** | `bookings`, `provider_leads`, `studio_applications` |
| **Marketplace** | `vendor_profiles`, `marketplace_products`, `marketplace_product_variants`, `marketplace_carts`, `marketplace_cart_items`, `marketplace_orders`, `marketplace_order_items` |
| **Payments** | `checkout_payment_sessions`, `payment_transactions`, `coupon_redemptions` |
| **Finance** | `finance_ledger`, `commission_settings`, `settlement_batches`, `settlement_batch_items`, `finance_audit_log` |
| **Loyalty** | `loyalty_points_ledger`, `customer_tiers`, `vendor_tiers`, `studio_tiers` |
| **Certification** | `certified_studios` |
| **Ops / Marketing** | `notifications`, `merch_kits`, `merch_fulfillment_orders`, `pr_campaigns`, `creator_seeding`, `media_coverage` |
| **Admin** | `admin_users` |

## 2. RPCs REFERENCED BY CODE
The following stored procedures are actively called by API routes:

- `create_studio_booking_v1`: Atomic booking creation with availability validation.
- `claim_offer`: Claims a promotional offer for a user.
- `validate_coupon_code`: Validates coupon eligibility and discount amount.
- `redeem_coupon_code`: Finalizes coupon usage during checkout.
- `award_loyalty_event`: Calculates and grants points post-transaction.
- `refresh_customer_wallet_tier`: Updates user tier based on point balance.

## 3. STORAGE BUCKETS REFERENCED BY CODE
- `identity-documents`: Private storage for customer KYC.
- `business-documents`: Private storage for vendor/owner business proof.
- `studio-documents`: Private storage for studio-specific licenses.
- `vendor-documents`: Private storage for vendor-specific certifications.
- `studio-images`: Public storage for studio profile galleries (implied by `studio_images` table).
- `marketplace-products`: Public storage for product imagery (implied by `marketplace_products` table).
- `avatars`: Public storage for user profile pictures.

## 4. MISSING OR UNCERTAIN TABLES (THE GAP)
Based on domain requirements for Sprint 7 Pilot Readiness:

| Missing Domain | Table / Object Needed | Purpose |
| :--- | :--- | :--- |
| **Academy** | `academy_courses`, `academy_lessons`, `academy_enrollments` | Backend tracking for instructor-led courses currently front-end only. |
| **Tickets** | `event_tickets`, `event_ticket_variants`, `event_attendees` | Ticket inventory and attendee management. |
| **Services** | `service_catalog`, `service_bookings` | Specialized services separate from studio time (e.g., mixing, mastering). |
| **Support** | `support_tickets`, `support_ticket_messages` | In-app helpdesk and incident tracking. |
| **Legal** | `legal_documents`, `user_legal_consents` | Versioned tracking of Terms and Privacy acceptance. |
| **Integrity** | `inventory_locks` | Table for advisory lock coordination for marketplace products. |
| **Audit** | `system_audit_logs` | General purpose audit trail for sensitive administrative actions. |

## 5. RISK AREAS
- **Manual Payment Bypassing**: `api/checkout/manual-confirm` relies on client-supplied status; requires server-side validation or restricted admin access.
- **Service Role Over-usage**: Several routes in `app/api/` use `supabaseAdmin` where RLS + `supabaseUser` could provide better isolation.
- **Atomic Inventory**: Marketplace checkout lacks an atomic `deduct_inventory` RPC, risking overselling during high-concurrency events.
- **Renegade Seeds**: Tables like `studio_boost_subscriptions` are defined in `seed.sql` rather than migrations, leading to environment drift.

## 6. ITEMS REQUIRING PRODUCTION VERIFICATION
- Real-time RLS status for all `marketplace_*` tables (ensure `ALL` is not granted to `authenticated`).
- Presence of indices on `auth_user_id` across all high-volume tables (`bookings`, `order_items`).
- Storage bucket policy verification (ensure private buckets aren't publicly listable).
