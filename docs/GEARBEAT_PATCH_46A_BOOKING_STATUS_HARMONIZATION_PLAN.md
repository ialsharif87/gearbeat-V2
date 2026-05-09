# GEARBEAT PATCH 46A — BOOKING STATUS HARMONIZATION PLAN

## 1. Overview
Following the Patch 45 audit, this document outlines the implementation plan to harmonize booking blocking statuses across the system. The goal is to ensure that UI availability correctly reflects database locks and that the atomic RPC enforces consistent integrity rules.

## 2. Current State Fragmentation

### A. UI Availability (`slots/route.ts`)
- **Blocking Statuses:** `pending`, `pending_review`, `pending_owner_review`, `accepted`, `confirmed`.
- **Missing:** `pending_payment` (Critical mismatch during checkout), `completed`, `paid`.

### B. Atomic RPC (`create_studio_booking_v1`)
- **Blocking Statuses:** `pending_payment`, `pending`, `confirmed`, `paid`, `accepted`.
- **Missing:** `pending_review`, `pending_owner_review`, `completed`.
- **Logic Ghost:** `paid` is checked but does not exist as a valid `booking.status` value.

### C. Database Constraint (`bookings_status_check`)
- **Valid Values:** `pending`, `pending_payment`, `pending_review`, `pending_owner_review`, `accepted`, `confirmed`, `rejected`, `declined`, `cancelled`, `completed`, `no_show`.

## 3. Harmonization Strategy

### Proposed Universal Blocking List
The following statuses will be treated as "Occupied" in both the UI and the conflict-detection RPC:
1.  **`pending_payment`**: Slot is locked while user is in the payment flow (60 min window).
2.  **`pending`**: Initial state for manual or legacy bookings.
3.  **`pending_review`**: Awaiting administrative or system review.
4.  **`pending_owner_review`**: Awaiting studio owner approval.
5.  **`accepted`**: Approved by owner but pending final confirmation/payment.
6.  **`confirmed`**: Fully booked and paid.
7.  **`completed`**: Historically finished booking (blocks the specific past slot).

### Proposed Universal Non-Blocking List
The following statuses will be treated as "Released/Available":
1.  **`cancelled`**: Expired or aborted.
2.  **`rejected`**: Declined by owner.
3.  **`declined`**: Declined by owner.
4.  **`no_show`**: Customer did not arrive (slot remains released for history).

## 4. Implementation Steps (Patch 46B)

### Step 1: UI Availability Sync
Update `app/api/studios/availability/slots/route.ts` to include the full blocking list.
- **Specific Change:** Add `pending_payment` and `completed` to the `blockingStatuses` array.
- **Result:** Users will no longer see "Ghost Availability" for slots locked by other users' checkouts.

### Step 2: Atomic RPC Sync
Update `public.create_studio_booking_v1` SQL function.
- **Specific Change:** 
    - Update `status IN (...)` to match the universal blocking list.
    - Add `completed`, `pending_review`, and `pending_owner_review`.
    - Remove the redundant/ghost `paid` check.
- **Result:** API-level double-booking over soft-locked slots will be impossible.

## 5. Risk Assessment
| Change | Impact | Risk |
| :--- | :--- | :--- |
| Adding `pending_payment` to UI | Users see fewer available slots. | **Zero.** This is correct behavior; it prevents the "Conflict on click" UX failure. |
| Adding `completed` to blocking | Blocks historical slots. | **Low.** Historical booking is already restricted by date; this is for data integrity. |
| Removing `paid` from RPC | No change to current behavior. | **Zero.** `paid` is a `payment_status` value, not a `status` value. |
| Adding `pending_review` to RPC | Prevents API bypass. | **Low.** Ensures consistency between UI and API. |

## 6. Files Involved

### Likely Needed for 46B:
- [slots/route.ts](file:///c:/Users/iaals/Documents/GitHub/gearbeat-V2/app/api/studios/availability/slots/route.ts)
- [patch_42b_atomic_booking_rpc.sql](file:///c:/Users/iaals/Documents/GitHub/gearbeat-V2/supabase/migrations/patch_42b_atomic_booking_rpc.sql) (As reference for the SQL migration)

### Must Not Touch:
- [manual-confirm/route.ts](file:///c:/Users/iaals/Documents/GitHub/gearbeat-V2/app/api/checkout/manual-confirm/route.ts)
- [cleanup-stale/route.ts](file:///c:/Users/iaals/Documents/GitHub/gearbeat-V2/app/api/cron/bookings/cleanup-stale/route.ts)
- [webhook/route.ts](file:///c:/Users/iaals/Documents/GitHub/gearbeat-V2/app/api/tap/webhook/route.ts)
- Auth, RLS, or Payment logic.
