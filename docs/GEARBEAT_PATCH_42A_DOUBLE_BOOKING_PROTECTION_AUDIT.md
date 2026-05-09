# GEARBEAT PATCH 42A — DOUBLE-BOOKING PROTECTION AUDIT

## 1. Overview
This audit examines the current studio booking flow to identify risks related to double-bookings and race conditions. The goal is to provide a foundation for Patch 42B, which will implement robust protection against overlapping bookings for the same studio and time slot.

## 2. Booking Entry Points
- **Creation Endpoint:** `app/api/studios/bookings/create/route.ts` (Customer-facing).
- **Payment Confirmation (Manual):** `app/api/checkout/manual-confirm/route.ts` (Testing/Internal).
- **Payment Confirmation (Webhook):** `app/api/tap/webhook/route.ts` (Production Tap Payments).
- **Status Management:** `app/api/owner/bookings/update-status/route.ts` (Owner-facing).

## 3. Booking Status Lifecycle
- **Initial Status:** `pending_payment` (with `payment_status: "unpaid"`).
- **Confirmed Status:** Updated to `confirmed` (with `payment_status: "paid"`) upon successful payment webhook.
- **Owner Decisions:** Can be updated to `accepted`, `rejected`, `cancelled`, or `completed`.
- **Conflict Logic:** The current overlap check considers bookings with statuses: `["pending_payment", "pending", "confirmed", "paid"]`.

## 4. Conflict Verification Logic
Currently, `app/api/studios/bookings/create/route.ts` performs the following check before insertion:
```typescript
const { data: overlappingBookings } = await supabaseAdmin
  .from("bookings")
  .select("id")
  .eq("studio_id", studio.id)
  .eq("booking_date", bookingDate)
  .in("status", ["pending_payment", "pending", "confirmed", "paid"])
  .lt("start_time", endTime)
  .gt("end_time", startTime)
  .limit(1);
```
- **Range Logic:** `LT(start_time, requested_end_time)` AND `GT(end_time, requested_start_time)`.
- **Validation Type:** App-level validation only.

## 5. Risk Assessment: Race Conditions
- **Vulnerability:** There is a temporal gap between the `SELECT` overlap check and the `INSERT` operation.
- **Scenario:** Two users requesting the same slot at the exact same time could both pass the overlap check before either insertion is completed, resulting in a double-booking.
- **Impact:** High risk for popular studios during peak hours; leads to customer frustration and manual refund processing.

## 6. Implementation Recommendation (Patch 42B)
- **Mechanism:** Move the "Check + Insert" logic into a single atomic database operation using a Supabase RPC function.
- **DB-Level Locking:** Use a Postgres transaction with `SERIALIZABLE` isolation level or an explicit `LOCK TABLE` to ensure no other bookings are inserted for that studio during the check.
- **Constraint Option:** Consider adding a Postgres exclusion constraint for non-overlapping ranges (requires `btree_gist` extension and schema migration).

## 7. Files for Implementation
- `supabase/migrations/patch_XXX_atomic_booking_rpc.sql` [NEW]
- `app/api/studios/bookings/create/route.ts` [MODIFY]

## 8. Files to Preserve (Do Not Touch)
- `app/api/checkout/*` (Session and confirmation logic).
- `app/api/payments/*` (Payment processing).
- `app/portal/studio/*` (Owner UI).
- `lib/auth-guards.ts` (Authentication security).
- `supabase/migrations` (Existing migrations).

## 9. Conclusion
App-level validation is insufficient for high-traffic marketplace bookings. Patch 42B should focus on an RPC-based atomic creation flow to eliminate race conditions and guarantee slot exclusivity.
