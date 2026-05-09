# GEARBEAT PATCH 46C — RPC STATUS CLEANUP AUDIT

## 1. Overview
This audit evaluates the current state of the atomic booking RPC (`create_studio_booking_v1`) conflict detection logic. It specifically investigates the "ghost" `paid` status and the missing `completed` status enforcement.

## 2. Current Conflict Lists

### A. Atomic RPC (`supabase/migrations/patch_42b_atomic_booking_rpc.sql`)
- **Blocking Statuses:** `pending_payment`, `pending`, `confirmed`, `paid`, `accepted`.
- **Anomalies:**
    - `paid` is checked but is not a valid `booking.status` value (it is a `payment_status`).
    - `completed`, `pending_review`, and `pending_owner_review` are **missing**.

### B. UI Availability (`app/api/studios/availability/slots/route.ts`)
- **Blocking Statuses:** `pending_payment`, `pending`, `pending_review`, `pending_owner_review`, `accepted`, `confirmed`.
- **Anomalies:**
    - `completed` is **missing**.

### C. DB Constraint (`bookings_status_check`)
- **Valid Values:** `pending`, `pending_payment`, `pending_review`, `pending_owner_review`, `accepted`, `confirmed`, `rejected`, `declined`, `cancelled`, `completed`, `no_show`.
- **Note:** `paid` is correctly absent from this list.

## 3. Analysis of "Paid" Status
- **Usage:** `paid` is exclusively used in the `payment_status` column (set by `tap/webhook` and `manual-confirm`).
- **Risk of Leaving:** Low risk, but creates logical confusion. It never triggers a conflict because no booking can ever reach `status = 'paid'`.
- **Risk of Removal:** Zero. It is functionally dead code in the conflict check.

## 4. Policy for "Completed" Status
- **Definition:** A booking that has been successfully finished.
- **Requirement:** A completed booking must continue to occupy its historical slot to prevent overlapping records in history.
- **Harmonization:** Both the UI and the RPC should include `completed` in their blocking/occupied lists.

## 5. Recommended Patch 46D Implementation

### Goals:
1. Harmonize the RPC blocking list with the UI.
2. Remove the ghost `paid` status from the RPC.
3. Add `completed` to both UI and RPC blocking lists.

### Proposed Implementation Scope:
- **SQL Migration:**
    - Update `create_studio_booking_v1` to check for: `pending_payment`, `pending`, `pending_review`, `pending_owner_review`, `accepted`, `confirmed`, `completed`.
    - Remove `'paid'`.
- **UI Update:**
    - Add `completed` to `blockingStatuses` in `slots/route.ts`.

### Risk Assessment:
- **Safety:** This change increases system strictness. It ensures that "soft-locked" (review) and "finished" (completed) bookings are respected by the atomic double-booking protection.

## 6. Files Involved

### Likely Needed for 46D:
- [slots/route.ts](file:///c:/Users/iaals/Documents/GitHub/gearbeat-V2/app/api/studios/availability/slots/route.ts)
- [patch_46d_rpc_harmonization.sql](NEW)

### Must Not Touch:
- [manual-confirm/route.ts](file:///c:/Users/iaals/Documents/GitHub/gearbeat-V2/app/api/checkout/manual-confirm/route.ts)
- [tap/webhook/route.ts](file:///c:/Users/iaals/Documents/GitHub/gearbeat-V2/app/api/tap/webhook/route.ts)
- [cleanup-stale/route.ts](file:///c:/Users/iaals/Documents/GitHub/gearbeat-V2/app/api/cron/bookings/cleanup-stale/route.ts)
