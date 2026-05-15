# GEARBEAT: PHASED DRAFT SCHEMA PLAN
**Agent:** Agent 3 — SQL/Database Readiness  
**Status:** DRAFT / PLANNING  
**Date:** 2026-05-15  

---

## Phase SQL-1: Core Identity & Audit (Safety First)
**Focus:** Establishing secure user profiles and administrative visibility.
- **Tables:** `profiles`, `admin_users`, `trusted_devices`, `system_audit_logs`.
- **Relationships:** `admin_users.auth_user_id -> auth.users.id`.
- **RLS Direction:** Strict `auth.uid()` checks for profiles; role-based checks for audit logs.
- **Blocked Notes:** Audit log trigger implementation requires `SECURITY DEFINER` approval.
- **Migration Risk:** Low.

## Phase SQL-2: Studio Foundations & Bookings
**Focus:** Enabling the primary revenue driver (Studio time).
- **Tables:** `studios`, `studio_availability_rules`, `studio_availability_exceptions`, `bookings`.
- **Relationships:** `bookings.studio_id -> studios.id`, `studios.owner_id -> profiles.id`.
- **RLS Direction:** Owner-based read/write for studio settings; customer-only visibility for personal bookings.
- **Blocked Notes:** Needs `create_studio_booking_v1` RPC for atomic integrity.
- **Migration Risk:** Medium (complex availability logic).

## Phase SQL-3: Marketplace & Inventory Integrity
**Focus:** Scaling to physical goods and multi-vendor commerce.
- **Tables:** `vendor_profiles`, `marketplace_products`, `marketplace_orders`, `inventory_locks`.
- **Relationships:** `products.vendor_id -> vendor_profiles.id`, `orders.customer_id -> profiles.id`.
- **RLS Direction:** Vendor-isolation for product management.
- **Blocked Notes:** Advisory lock coordination via `inventory_locks` table.
- **Migration Risk:** High (stock race conditions).

## Phase SQL-4: Specialized Verticals (Academy & Tickets)
**Focus:** Expanding to educational content and event management.
- **Tables:** `academy_courses`, `academy_lessons`, `event_tickets`, `event_attendees`.
- **Relationships:** `lessons.course_id -> academy_courses.id`, `attendees.ticket_id -> event_tickets.id`.
- **RLS Direction:** Enrollment-based read access for lessons.
- **Blocked Notes:** Video storage bucket policies for lesson content.
- **Migration Risk:** Medium.

## Phase SQL-5: Finance & Payout Automation
**Focus:** Moving from manual test payments to automated reconciliation.
- **Tables:** `finance_ledger`, `settlement_batches`, `payout_requests`, `refund_logs`.
- **Relationships:** `ledger.transaction_id -> payment_transactions.id`.
- **RLS Direction:** Admin-only write; Vendor-only read for own settlements.
- **Blocked Notes:** Stripe/Hyperwallet integration hooks.
- **Migration Risk:** Very High (financial accuracy).

## Phase SQL-6: Trust, Loyalty & Badges
**Focus:** Gamification and verification of the platform ecosystem.
- **Tables:** `certified_studios`, `loyalty_points_ledger`, `user_badges`.
- **Relationships:** `certified_studios.studio_id -> studios.id`.
- **RLS Direction:** System-driven point awards (RPC); Publicly readable badges.
- **Blocked Notes:** Calculation logic for tier upgrades.
- **Migration Risk:** Low.

## Phase SQL-7: Support, Legal & CRM
**Focus:** Long-term sustainability and compliance.
- **Tables:** `support_tickets`, `legal_documents`, `user_legal_consents`, `marketing_campaigns`.
- **Relationships:** `support_tickets.auth_user_id -> auth.users.id`.
- **RLS Direction:** Versioned legal consent (read-only once created).
- **Blocked Notes:** Email/Notification engine triggers.
- **Migration Risk:** Low.
