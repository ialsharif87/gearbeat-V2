# GEARBEAT PATCH 44A — MANUAL CONFIRM STATUS CONSISTENCY FIX

## 1. Overview
This patch resolves a status consistency bug identified in Patch 43. Currently, when a studio booking is paid via manual confirmation, the `payment_status` is updated to `paid`, but the `status` remains stuck in `pending_payment`. This results in stale locks in the atomic booking RPC and inconsistent data for owners and customers.

## 2. Implementation Strategy
The `linkPaymentToSource` function in the manual confirmation route will be updated to explicitly transition the `status` of the linked resource to `confirmed` upon successful payment.

### Target Files:
- `app/api/checkout/manual-confirm/route.ts` [MODIFY]

## 3. Changes Applied

### API Route: `app/api/checkout/manual-confirm/route.ts`
- **Updated `linkPaymentToSource`:**
    - For `studio_booking` and `booking` source types, the payload now includes `status: 'confirmed'`.
- **Outcome:** Manual confirmation now correctly syncs the studio booking status with the payment status, matching the behavior of the Tap payment webhook.

## 4. Safety & Verification
- **No Schema Changes:** This is a logic-only fix using existing database columns and constraints.
- **Transactional Safety:** The update is performed using the administrative client within the authenticated user's scope.
- **Compatibility:** This change does not affect the Tap webhook, which already implements the correct status transition.

## 5. Automated Tests
- `npm run lint`: Confirm 0 errors and maintenance of the 503 warning baseline.
- `npm run build`: Confirm production build success.
