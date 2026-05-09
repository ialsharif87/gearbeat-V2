# GEARBEAT PATCH 44B — PENDING PAYMENT BOOKING EXPIRY CLEANUP

## 1. Overview
This patch addresses the "Denial of Service" risk identified in Patch 43, where abandoned studio bookings stuck in the `pending_payment` state would permanently block studio slots in the atomic booking RPC. This implementation adds a secure background cleanup API that transitions stale abandoned bookings to a cancelled state.

## 2. Implementation Strategy
A new server-only cron route is established to periodically identify and expire abandoned bookings.

### Target Files:
- `app/api/cron/bookings/cleanup-stale/route.ts` [NEW]

## 3. Changes Applied

### New Cleanup API: `app/api/cron/bookings/cleanup-stale/route.ts`
- **Security:** Protected by `CRON_SECRET` using the `isAuthorizedCronRequest` utility from `lib/cron-auth.ts`.
- **Target Selection:**
    - `status = 'pending_payment'`
    - `payment_status != 'paid'` (Safety check to avoid cancelling paid bookings with sync issues)
    - `created_at < NOW() - 60 minutes` (Expiry window: 60 minutes)
- **Transition:** Stale records are moved to `status: 'cancelled'`.
- **Auditability:** Updates includes a metadata flag `cancelled_reason: 'Stale pending payment expired'`.
- **Atomicity:** Updates are performed in a single bulk operation using the administrative Supabase client.

## 4. Expiry Configuration
- **Window:** 60 Minutes (Choice provides a 30-minute buffer beyond the standard checkout session expiry).
- **Statuses Affected:** Only `pending_payment` bookings transition to `cancelled`.
- **Excluded Statuses:** `confirmed`, `accepted`, `completed`, `paid`, `cancelled`, `rejected`, `declined`, or `no_show` are never touched.

## 5. Verification Plan
- **Security:** Verify the endpoint returns 401 if the `CRON_SECRET` is missing or incorrect.
- **Safety:** Verify that bookings created within the last 59 minutes are NOT affected.
- **Logic:** Verify that `pending_payment` bookings older than 60 minutes transition to `cancelled`.
- **Build/Lint:** `npm run lint` and `npm run build` must pass.

## 6. Files to Preserve
Do not modify SQL migrations, RLS policies, studio management UI, or the core booking creation RPC.
