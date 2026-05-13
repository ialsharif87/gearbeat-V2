# GEARBEAT PATCH 78B — DATABASE, BACKEND REALITY & SEO DOMAIN GATE

## Overview
This patch provides a "Reality Check" on the backend and database dependency map of GearBeat V2, while ensuring SEO domain consistency for the production environment at `https://gearbeat.app`.

## Backend & Database Reality Audit

### 1. Database Tables Reference Map
The following tables are actively referenced and required by the application code (app/api and lib):

| Category | Tables |
| --- | --- |
| **Identity & Access** | `profiles`, `admin_users`, `vendor_profiles`, `vendor_api_keys`, `device_trust` |
| **Marketplace** | `marketplace_carts`, `marketplace_cart_items`, `marketplace_products`, `marketplace_product_variants`, `marketplace_orders`, `marketplace_order_items` |
| **Studios & Bookings**| `studios`, `studio_availability_rules`, `studio_availability_exceptions`, `bookings` |
| **Onboarding** | `provider_leads`, `studio_applications` |
| **Financials** | `checkout_payment_sessions`, `payment_transactions`, `finance_ledger`, `finance_audit_log`, `settlement_batches`, `payout_requests`, `refunds` |
| **Engagement** | `notifications`, `loyalty_points_ledger`, `coupon_redemptions` |

### 2. Database Functions (RPC) Reference Map
The application relies on the following PostgreSQL functions for atomic operations:
- `create_studio_booking_v1`: Atomic studio booking creation with conflict detection.
- `redeem_coupon_code`: Validates and records coupon usage.
- `award_loyalty_event`: Calculates and awards loyalty points based on transaction value.
- `process_finance_ledger_after_payment`: (Triggered via `lib/finance-ledger.ts`) Handles multi-party splitting.

### 3. Storage Buckets Map
- `provider-documents`: Secure storage for studio/vendor verification documents.
- `signed-contracts`: Storage for legally binding partner agreements.
- `marketplace`: Public storage for product images.
- `studios`: Public storage for studio profile and gallery images.

### 4. Service-Role Usage Locations
The `createAdminClient` (Service Role) is used in privileged environments to bypass RLS for:
- Automated order/booking creation workflows.
- Payment confirmation and ledger processing.
- Administrative dashboard data aggregation.
- Notification dispatching.
- Secure document signed-URL generation.

### 5. Backend Dependencies & Flows
- **Marketplace Flow:** Depends on a strictly relational sequence from `marketplace_carts` to `marketplace_orders` and `checkout_payment_sessions`.
- **Booking Flow:** Relies on `studio_availability_rules` and `exceptions` to validate time slots before atomic `rpc` booking.
- **Payment Flow:** Uses `manual` or `tap` providers to update `checkout_payment_sessions` which then triggers `finance_ledger` entries.

## SEO & Domain Consistency Changes

### Domain Fixes
- **Sitemap (`app/sitemap.ts`):** Updated to prefer `process.env.NEXT_PUBLIC_SITE_URL` with a hardcoded fallback to `https://gearbeat.app`. This ensures consistency across local, staging, and production environments.
- **Robots (`app/robots.ts`):** Updated the `sitemap` reference URL to dynamically use the site base URL, pointing correctly to `https://gearbeat.app/sitemap.xml` in production.

## Known Uncertainties & Risks
- **Schema Parity:** There is uncertainty regarding whether the production Supabase environment contains all tables and RPCs defined in the `supabase/` migrations folder (up to Patch 90).
- **RLS Coverage:** While tables are referenced, the completeness of RLS policies for every new table needs a final dedicated security audit.
- **Manual vs Tap:** The system currently supports both `manual` (testing) and `tap` (production) payment flows; environmental toggling must be strictly verified before launch.

## Next Step Recommendations
- **Database Synchronization Audit:** Compare the live Supabase schema against the local `supabase/` folder to ensure no missing tables or functions.
- **Payment Gateway Final Test:** Execute a full end-to-end "Tap" transaction in a sandbox environment using the `https://gearbeat.app` domain.
- **Full Journey QA:** Perform a final audit of the notification links to ensure they match the unified portal structure.

---
**No-Risk Scope Confirmation:**
- No SQL migration files were edited or created.
- No Supabase RLS policies were changed.
- No booking/order/payment business logic was modified.
- No implementation of Tap, AI, or Mobile App code was added.
