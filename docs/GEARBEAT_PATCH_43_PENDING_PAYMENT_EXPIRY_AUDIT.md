# GEARBEAT PATCH 43 — PENDING PAYMENT EXPIRY / ABANDONED BOOKING AUDIT

## 1. Overview
This audit examines the lifecycle of "Pending Payment" bookings following the activation of atomic booking protection. It specifically looks at how abandoned booking attempts (where a user starts a checkout but does not complete it) affect studio slot availability and system integrity.

## 2. Current Lifecycle Observations

### Booking Creation
- **Endpoint:** `app/api/studios/bookings/create/route.ts`.
- **Initial State:** `status: 'pending_payment'`, `payment_status: 'unpaid'`.
- **Checkout Link:** A `checkout_payment_sessions` record is created simultaneously with an `expires_at` value set to **30 minutes** from creation.

### Expiry Behavior
- **Checkout Level:** The `manual-confirm` route and checkout logic correctly reject attempts to pay for expired sessions.
- **Booking Level:** There is **no explicit expiry column** on the `bookings` table.
- **Automatic Cleanup:** No background process (Cron or Edge Function) exists to transition abandoned `pending_payment` bookings to `cancelled`.

### Conflict Handling & Blocking
- **Atomic RPC Impact:** The `create_studio_booking_v1` RPC treats `pending_payment` as a **blocking status**.
- **Stale Blockers:** Because abandoned bookings are never cancelled, they **permanently lock** the selected time slot for that studio unless manually deleted or updated by an administrator.

## 3. Payment Confirmation Inconsistency
- **Tap Webhook:** Correctly updates both `status` to `confirmed` and `payment_status` to `paid`.
- **Manual Confirmation:** Currently updates `payment_status` to `paid` but **fails to update** the booking `status` to `confirmed`. This leaves a paid booking in a `pending_payment` state, which is inconsistent with the expected lifecycle.

## 4. Risks Identified
- **Slot Denial (High Risk):** Accidental or malicious abandoned bookings will block studio slots indefinitely, leading to artificial "sold out" states and lost revenue.
- **Historical Overlaps:** `completed` bookings do not currently block slots. While acceptable for historical records, it could allow re-booking of past slots if the system allows retrospective booking.
- **Data Integrity:** The state mismatch in manual confirmation makes it difficult to reliably filter for "Active/Confirmed" bookings using the `status` column alone.

## 5. Recommended Implementation Plan (Patch 44)

### Database Level
- Add a background cleanup function (Postgres function) that cancels `pending_payment` bookings older than 60 minutes if they are not linked to a `completed` checkout session.
- Alternatively, update the atomic RPC overlap check to ignore `pending_payment` bookings that were created more than 45 minutes ago.

### Application Level
- **Fix Consistency:** Update `app/api/checkout/manual-confirm/route.ts` to set `status: 'confirmed'` when a payment is successful, matching the Tap webhook behavior.
- **Cleanup Trigger:** Consider adding a "check and cancel" step before the atomic RPC call to proactively clear stale locks for the targeted slot.

## 6. Files Involved in Future Patch
- **SQL Migration:** `supabase/migrations/patch_44_booking_cleanup_and_consistency.sql`.
- **API Update:** `app/api/checkout/manual-confirm/route.ts`.
- **RPC Update (Optional):** `supabase/migrations/patch_42b_atomic_booking_rpc.sql` (to refine the overlap check).

## 7. Files to Preserve
Do not modify auth, OTP, UI components, RLS policies, or studio management logic during the cleanup implementation.
