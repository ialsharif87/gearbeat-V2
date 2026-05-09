# GEARBEAT PATCH 46B — UI AVAILABILITY PENDING PAYMENT FIX

## 1. Overview
This patch resolves the "Ghost Availability" issue identified in Patch 45 and planned in Patch 46A. It ensures that the studio availability slots API respects bookings that are currently in the 60-minute payment window (`pending_payment`).

## 2. Changes

### API Layer: `app/api/studios/availability/slots/route.ts`
- **Updated Blocking Statuses:** Added `pending_payment` to the list of statuses that mark a studio slot as unavailable.
- **Final Blocking List:**
    - `pending_payment` (Added)
    - `pending`
    - `pending_review`
    - `pending_owner_review`
    - `accepted`
    - `confirmed`

## 3. Impact
- **UX Improvement:** Customers will no longer see slots as "Available" if another user is actively attempting to pay for them.
- **Error Reduction:** This change significantly reduces the frequency of `409 Conflict` errors during the final step of the booking process.
- **Safety:** The availability generator now correctly mirrors the logic enforced by the atomic booking RPC (`create_studio_booking_v1`).

## 4. Implementation Notes
- **Scope:** This patch is limited to the UI availability layer.
- **Preservation:** No changes were made to pricing, booking creation, or payment processing logic.
- **Future Tasks:** Harmonization of `completed` and cleanup of the `paid` status in the RPC are reserved for subsequent patches.

## 5. Verification
- **Build/Lint:** `npm run lint` and `npm run build` verify that the code changes are syntactically correct and don't break page generation.
