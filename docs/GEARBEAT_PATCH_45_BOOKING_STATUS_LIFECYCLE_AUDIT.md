# GEARBEAT PATCH 45 — BOOKING STATUS LIFECYCLE & COMPLETED BOOKING AUDIT

## 1. Overview
This audit analyzes the studio booking status lifecycle, specifically focusing on the consistency between the UI availability generator (`app/api/studios/availability/slots/route.ts`) and the atomic booking RPC (`create_studio_booking_v1`).

## 2. Booking Status Matrix

| Status | Blocking in RPC? | Blocking in UI? | Source / Transition |
| :--- | :---: | :---: | :--- |
| `pending_payment` | ✅ Yes | ❌ No | **RPC Initial State.** Created when user starts checkout. |
| `pending` | ✅ Yes | ✅ Yes | Manual creation or legacy flows. |
| `confirmed` | ✅ Yes | ✅ Yes | **Payment Success.** Set by Tap callback or manual confirmation. |
| `accepted` | ✅ Yes | ✅ Yes | **Owner Action.** Owner accepts a pending request. |
| `pending_review` | ❌ No | ✅ Yes | **Mismatch.** Blocks UI but not atomic RPC. |
| `pending_owner_review` | ❌ No | ✅ Yes | **Mismatch.** Blocks UI but not atomic RPC. |
| `paid` | ✅ Yes | ❌ No | **Logic Ghost.** Checked in RPC but not in DB constraint. |
| `completed` | ❌ No | ❌ No | **Locked.** Booking finished. Currently non-blocking. |
| `cancelled` | ❌ No | ❌ No | **Expired/Aborted.** Released by Cron or user. |
| `rejected` | ❌ No | ❌ No | **Owner Action.** Released by owner. |
| `declined` | ❌ No | ❌ No | **Owner Action.** Released by owner. |
| `no_show` | ❌ No | ❌ No | **Owner Action.** Released by owner. |

## 3. Key Findings & Risks

### A. UI/RPC Mismatch (High Priority)
- **Problem:** `pending_payment` bookings block the RPC (preventing double-booking) but are **NOT** excluded by the UI slot generator.
- **Risk:** Users see slots as "Available" that will result in a 409 Conflict error upon clicking "Book Now" if another user is currently in the 60-minute payment window.

### B. Logical Ghost Status: `'paid'`
- **Problem:** The atomic RPC checks for `status = 'paid'`. However, the `bookings_status_check` constraint does not include `'paid'`.
- **Note:** `paid` is a valid `payment_status`, but checking it in the `status` column is a logical dead-end.

### C. Completed Bookings Non-Blocking
- **Problem:** `completed` status is excluded from both the RPC blocking list and the UI blocking list.
- **Risk:** Technically allows historical slots to appear available. While new bookings for past dates are blocked by date validation, this inconsistency could affect analytics or "re-booking" edge cases.

### D. Soft Statuses (`pending_review`)
- **Problem:** Statuses like `pending_review` block the UI but NOT the RPC. 
- **Risk:** A slot could be "visible but blocked" in the UI, but a direct API call could bypass the block and double-book.

## 4. Recommended Patch 46 Implementation Plan

### Goals:
1. Harmonize the blocking status lists between the UI and RPC.
2. Ensure `pending_payment` correctly hides slots in the UI.
3. Clean up the `'paid'` ghost status in the RPC.

### Proposed Changes:
- **`app/api/studios/availability/slots/route.ts`**:
    - Add `pending_payment`, `completed`, and `paid` (for safety) to the `blockingStatuses` array.
- **`supabase/migrations/patch_46_booking_logic_harmonization.sql`**:
    - Update `create_studio_booking_v1` to include `completed` in the conflict check.
    - Remove the redundant `status = 'paid'` check if confirmed that `paid` only lives in `payment_status`.

## 5. Files Involved

### Likely Needed:
- [slots/route.ts](file:///c:/Users/iaals/Documents/GitHub/gearbeat-V2/app/api/studios/availability/slots/route.ts)
- [patch_42b_atomic_booking_rpc.sql](file:///c:/Users/iaals/Documents/GitHub/gearbeat-V2/supabase/migrations/patch_42b_atomic_booking_rpc.sql) (As reference for Patch 46)

### Must Not Touch:
- [manual-confirm/route.ts](file:///c:/Users/iaals/Documents/GitHub/gearbeat-V2/app/api/checkout/manual-confirm/route.ts)
- [cleanup-stale/route.ts](file:///c:/Users/iaals/Documents/GitHub/gearbeat-V2/app/api/cron/bookings/cleanup-stale/route.ts)
- Auth, Payment Provider (Tap), RLS policies.
