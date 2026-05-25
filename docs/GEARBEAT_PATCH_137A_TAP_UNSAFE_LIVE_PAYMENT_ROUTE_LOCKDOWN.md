# GearBeat Patch 137A - Tap Unsafe Live Payment Route Lockdown

## Patch status

Patch 137A adds a small default-off safety gate to existing Tap routes.

This patch does not implement full Tap live payments. It does not implement webhook verification, idempotency, server-side payment session architecture, refund handling, reconciliation, or live merchant activation.

## Routes inspected

Primary Tap/payment files inspected:

- `app/api/tap/create-charge/route.ts`
- `app/api/tap/webhook/route.ts`
- `app/api/checkout/session/route.ts`
- `app/api/checkout/manual-confirm/route.ts`
- `app/api/marketplace/checkout/create-order/route.ts`
- `app/api/studios/bookings/create/route.ts`
- `app/api/payments/providers/route.ts`
- `lib/tap/charge.ts`
- `lib/tap/config.ts`
- `.env.example`

Planning and dependency docs inspected:

- `docs/GEARBEAT_PATCH_135C_TAP_LIVE_PAYMENT_DISABLE_GATE_HARDENING_PLAN.md`
- `docs/GEARBEAT_PATCH_136C_SUPABASE_SECURITY_PATCH_IMPLEMENTATION.md`

No `lib/payments/**` directory exists.

## What changed

### `/api/tap/create-charge`

Added an early `TAP_LIVE_PAYMENTS_ENABLED` gate before:

- user auth lookup
- request body parsing
- profile/studio lookup
- `createTapCharge`
- any outbound Tap API call

When Tap live payments are not explicitly enabled, the route returns:

```txt
HTTP 403
code: TAP_LIVE_PAYMENTS_DISABLED
livePaymentsEnabled: false
```

The response says Tap payments are not enabled yet and that GearBeat remains in pre-live payment mode.

### `/api/tap/webhook`

Added an early `TAP_LIVE_PAYMENTS_ENABLED` gate before:

- request body parsing
- service-role client creation
- booking mutation
- notification insert
- any payment status update

When Tap live payments are not explicitly enabled, the route returns:

```txt
HTTP 200
received: true
ignored: true
code: TAP_LIVE_PAYMENTS_DISABLED
livePaymentsEnabled: false
```

The webhook route uses `200` for the disabled response so accidental provider retries do not create noisy loops, while still ignoring the payload and performing no state mutation.

## `TAP_LIVE_PAYMENTS_ENABLED` behavior

The gate treats Tap live payments as enabled only when:

```txt
process.env.TAP_LIVE_PAYMENTS_ENABLED === "true"
```

Any missing value, empty value, `false`, `0`, `TRUE`, or other value leaves Tap live payment execution disabled.

Default documented value in `.env.example` remains:

```txt
TAP_LIVE_PAYMENTS_ENABLED=false
```

## Safety confirmations

- Tap live remains disabled by default.
- No real secrets were added.
- `.env.example` already contained the required false default, so it was not changed.
- Manual/pilot checkout foundations remain unchanged.
- `/api/checkout/manual-confirm` remains decommissioned and returns `410 Gone`.
- Marketplace and studio booking creation still create manual/pre-live checkout sessions only.
- No booking/order/payment database lifecycle was changed except blocking unsafe Tap route execution before mutation.
- No commercial payment readiness claim was added.

## Still future work

The following remain intentionally deferred:

- Tap webhook signature/HMAC/hash verification.
- Webhook idempotency.
- Raw webhook audit logging.
- Provider source-of-truth validation.
- Server-side canonical pricing for Tap charge creation.
- Booking/order/session ownership validation for live payment.
- Duplicate charge prevention.
- Refund and reconciliation workflow.
- Tap live merchant/legal/bank approval.
- Production live-payment smoke testing.

## Verification

Commands run:

```txt
git grep -n "TAP_LIVE_PAYMENTS_ENABLED" -- .
git grep -n "tap" -- app lib docs
git grep -n "create-charge" -- app lib docs
git grep -n "webhook" -- app lib docs
git grep -n "payment" -- app/api lib docs
npm.cmd run typecheck
npm.cmd run lint
npm.cmd run build
git status --short
git diff --name-only
```

Results:

- `npm.cmd run typecheck`: passed.
- `npm.cmd run lint`: passed with existing warnings.
- `npm.cmd run build`: passed.

## Changed files

- `app/api/tap/create-charge/route.ts`
- `app/api/tap/webhook/route.ts`
- `docs/GEARBEAT_PATCH_137A_TAP_UNSAFE_LIVE_PAYMENT_ROUTE_LOCKDOWN.md`

## Rollback

Rollback command after this patch is committed:

```txt
git revert <commit_hash>
```

## Final verdict

GO for Tap unsafe live route lockdown.

NOT GO for live Tap payments.

NOT GO for commercial payment launch.

Recommended next patch: 137B Tap Webhook Verification + Idempotency Plan or Implementation, only after explicit approval.
