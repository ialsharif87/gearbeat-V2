# GEARBEAT PATCH 46D1 — RPC BLOCKING STATUS UPDATE SAFETY PLAN

## 1. Overview
This plan defines the steps to synchronize the atomic booking RPC (`create_studio_booking_v1`) with the universal blocking status list established in the Patch 46 series. The focus is on removing dead code (`paid` status) and adding missing soft-lock and historical statuses.

## 2. Universal Blocking Status List

### Proposed RPC Blocking Statuses (CONFLICT IN...)
These statuses will trigger a `CONFLICT` error in the atomic RPC to prevent double-booking:
1.  **`pending_payment`**: Current checkout sessions.
2.  **`pending`**: Legacy/Generic pending state.
3.  **`pending_review`**: Awaiting admin review.
4.  **`pending_owner_review`**: Awaiting studio owner approval.
5.  **`accepted`**: Approved but not yet fully confirmed.
6.  **`confirmed`**: Fully booked and paid.
7.  **`completed`**: Successfully finished bookings.

### Proposed Non-Blocking Statuses
These statuses will be ignored by the conflict check, allowing the slots to be re-booked:
- `cancelled`
- `rejected`
- `declined`
- `no_show`

## 3. Key Logical Changes

### A. Removal of `paid` Status
- **Reason:** In the GearBeat schema, `paid` is a value for the `payment_status` column, not the `status` column.
- **Verification:** The `bookings_status_check` constraint does not include `paid`.
- **Action:** Remove `'paid'` from the `status IN (...)` check in the RPC.

### B. Addition of `completed` Status
- **Reason:** Ensures historical data integrity by preventing new bookings from overlapping with previously finished sessions.
- **Action:** Add `'completed'` to the conflict detection query.

### C. Addition of Soft-Lock Statuses
- **Reason:** Syncs with UI availability which already treats `pending_review` and `pending_owner_review` as blocking.
- **Action:** Add these to the RPC conflict detection.

## 4. Implementation Strategy (Patch 46D2)

### SQL Migration Details
- **File Name:** `supabase/migrations/patch_46d2_rpc_blocking_harmonization.sql`
- **Method:** `CREATE OR REPLACE FUNCTION public.create_studio_booking_v1(...)`
- **Constraint Changes:** **None required.** All proposed statuses already exist in the `bookings` table check constraint.

### Safety Checklist
- [ ] Confirm all 7 blocking statuses are present in the SQL `IN` clause.
- [ ] Confirm `'paid'` is absent from the SQL `status` check.
- [ ] Confirm `'completed'` is present.
- [ ] Verify that non-blocking statuses (`cancelled`, etc.) remain absent.

### Rollback Plan
In case of emergency, apply the original function definition from `supabase/migrations/patch_42b_atomic_booking_rpc.sql`.

## 5. Files Involved

### Likely Needed for 46D2:
- [patch_46d2_rpc_blocking_harmonization.sql](NEW)

### Must Not Touch:
- [slots/route.ts](file:///c:/Users/iaals/Documents/GitHub/gearbeat-V2/app/api/studios/availability/slots/route.ts) (Updated in 46B; next UI sync in 46E)
- [create/route.ts](file:///c:/Users/iaals/Documents/GitHub/gearbeat-V2/app/api/studios/bookings/create/route.ts)
- Tap Webhook, Manual Confirm, Auth, RLS.
