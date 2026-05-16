# GearBeat Patch 103B — DB Usage Map from Code

## 1. Purpose
This document provides a comprehensive mapping of GearBeat application features and API routes to their underlying database dependencies (Tables, RPCs, and Storage Buckets). Establishing this map is a prerequisite for the **Schema Baseline** (Patch 103A), as it identifies which database objects are critical for production stability and where technical debt or "schema gaps" exist in the current codebase.

## 2. Feature-to-Table Map

| Feature Area | Key Tables / RPCs |
| :--- | :--- |
| **Auth / Profiles / Roles** | `profiles`, `admin_users` |
| **Studios** | `studios`, `studio_availability_rules`, `studio_availability_exceptions`, `studio_images`, `studio_features` |
| **Bookings** | `bookings`, `create_studio_booking_v1` (RPC) |
| **Marketplace** | `marketplace_products`, `marketplace_product_variants`, `marketplace_carts`, `marketplace_cart_items` |
| **Orders** | `marketplace_orders`, `marketplace_order_items` |
| **Vendors** | `vendor_profiles` |
| **Rewards / Loyalty** | `loyalty_points_ledger`, `award_loyalty_event` (RPC) |
| **Certified / Badges** | `certified_studios` |
| **Finance** | `finance_ledger`, `commission_settings`, `payment_transactions`, `checkout_payment_sessions` |
| **Marketing / PR** | `pr_campaigns`, `creator_seeding`, `notifications` |
| **Coupons** | `coupon_redemptions`, `redeem_coupon_code` (RPC), `validate_coupon_code` (RPC) |
| **Academy** | `academy_courses`, `academy_lessons` (Likely Gaps) |
| **Tickets** | `event_tickets`, `event_attendees` (Likely Gaps) |

## 3. Route/API Usage Map

| Inspected Route / Path | Tables Referenced | RPCs Referenced | Gap Status |
| :--- | :--- | :--- | :--- |
| `api/studios/bookings/create` | `profiles`, `studios`, `bookings`, `studio_availability_rules`, `studio_availability_exceptions` | `create_studio_booking_v1` | Covered |
| `api/marketplace/checkout/create-order` | `marketplace_carts`, `marketplace_cart_items`, `marketplace_products`, `marketplace_orders`, `marketplace_order_items` | None (Direct Insert) | Covered |
| `api/checkout/manual-confirm` | `checkout_payment_sessions`, `payment_transactions`, `bookings`, `marketplace_orders`, `loyalty_points_ledger`, `coupon_redemptions`, `finance_ledger` | `award_loyalty_event`, `redeem_coupon_code` | Covered |
| `api/admin/commission-settings/upsert` | `commission_settings`, `profiles` | None | Covered |
| `Academy / Tickets / Services` | None found in active API routes | None | **GAP** |

## 4. Known DB Gaps

### Missing Tables (Referenced in logic but not confirmed in canonical migrations)
- **Academy**: `academy_courses`, `academy_lessons`, `academy_enrollments`. Current implementation appears to be UI-only or using mocked data in some zones.
- **Ticketing**: `event_tickets`, `event_ticket_variants`, `event_attendees`. Referenced in `GEARBEAT_SQL_GAP_INVENTORY.md` as missing.
- **Services**: `service_catalog`, `service_bookings`. Separate from studio time, likely missing from schema.

### Missing RPCs / Functions
- **Marketplace Inventory**: Lacks an atomic `deduct_inventory` RPC. Current logic in `api/marketplace/checkout/create-order` performs a manual check followed by an update, which is susceptible to race conditions.

### RLS Assumptions
- Many `api/` routes utilize `createAdminClient` (Service Role), bypassing RLS. While necessary for some operations, this hides potential RLS gaps that will surface if/when the app is hardened for public API access.

## 5. Risk Classification

- 🟢 **Green (Likely Covered)**:
  - Auth, Profiles, Studio Discovery, Studio Bookings (Basic), Marketplace Orders (Basic), Admin User Management.
- 🟡 **Yellow (Uncertain / Baseline Needed)**:
  - Finance Ledger (complex triggers), Loyalty Point calculations, Coupon redemption edge cases, Notification delivery.
- 🔴 **Red (Missing or Unsafe for Production)**:
  - **Academy/Ticketing**: No backend persistence found.
  - **Manual Payment Confirmation**: The endpoint `api/checkout/manual-confirm` is highly sensitive and allows client-side status injection without robust safety locks (addressed in Patch 104A).
  - **Inventory Integrity**: Lack of atomic marketplace locks.

## 6. Next Patch Recommendation
**Patch 104A — Manual Payment Safety Lock**
Focused on securing the `api/checkout/manual-confirm` endpoint by ensuring it can only be utilized by authorized roles or under specific "Testing Mode" flags, preventing accidental or malicious "forced-paid" status updates in production.
