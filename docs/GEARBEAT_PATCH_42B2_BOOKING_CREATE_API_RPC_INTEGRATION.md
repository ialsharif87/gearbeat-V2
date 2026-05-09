# GEARBEAT PATCH 42B2 — BOOKING CREATE API RPC INTEGRATION

## 1. Overview
This patch integrates the atomic booking RPC (`create_studio_booking_v1`) into the studio booking creation API. This replaces the previous non-atomic "check-then-insert" flow, eliminating race conditions and ensuring that studio slots are exclusively booked.

## 2. Changes Applied

### API Route: `app/api/studios/bookings/create/route.ts` [MODIFY]
- **Removed Manual Check:** Deleted the client-side overlap check (`SELECT` from `bookings`) to rely on the database-level atomic check inside the RPC.
- **RPC Integration:** Replaced the standard Supabase `insert` call with a call to `create_studio_booking_v1`.
- **Conflict Handling:**
    - If the RPC returns a `CONFLICT` error, the API now responds with a **409 Conflict** status and a clear message.
    - This prevents duplicate charges and ensures the user is notified immediately if a slot is no longer available.
- **Post-Creation Flow:** After a successful atomic insert, the API fetches the created booking record to maintain compatibility with the existing checkout session and notification logic.

## 3. Implementation Details
- **Atomicity:** The RPC uses advisory locks to serialize concurrent requests for the same studio and date.
- **Compatibility:** All existing request validations (date, time, duration, studio status) and payment initiation logic were preserved.
- **Error Handling:** General errors are still handled with a 500 status, while specific slot conflicts are elevated to 409.

## 4. Safety & Scope
- **No Schema Changes:** This patch only modifies application logic to use the existing RPC.
- **No Side Effects:** Payment flows, authentication, and UI remain unchanged. The response shape for successful bookings is preserved.
- **Deployment Requirement:** Requires Patch 42B1 (SQL Migration) to be applied to the database before deployment.

## 5. Verification Results
- **Lint Result:** Passed (0 errors, 503 warnings).
- **Build Result:** Successful (Exit code: 0).
