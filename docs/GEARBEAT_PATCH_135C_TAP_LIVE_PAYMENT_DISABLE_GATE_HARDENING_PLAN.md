# Patch 135C - Tap Live-Payment Disable Gate / Hardening Plan

## 1. Scope

Patch 135C is a documentation-only payment security planning and audit patch for GearBeat V2.

No payment code was changed in this patch. No API routes, booking logic, order logic, package files, Supabase files, environment files, middleware, app pages, UI components, database migrations, SQL, or dependencies were modified.

This plan follows:

- Patch 135A - Security & Release Readiness Operating Plan.
- Patch 135B - Dependency Audit / Update Plan.
- Earlier Tap/manual-payment safety documents including Patch 104A, Patch 104B, Patch 110B, Patch 116A, and Patch 117A.

## 2. Current Payment Status

GearBeat V2 is not live-payment ready.

Current payment position:

- Tap live activation remains blocked.
- Current Tap/payment routes must be treated as pre-live, sandbox, manual-readiness, or audit-only unless proven otherwise by a later hardening patch.
- Manual public checkout confirmation is currently decommissioned and returns `410 Gone`.
- Marketplace and studio booking flows create manual checkout/session records for pilot/testing posture.
- Provider selection and payment admin surfaces exist, but they do not constitute approval for live commercial card processing.
- Any live card, Mada, Apple Pay, Tap Connect, payout, refund automation, or commercial payment claim remains blocked.

Final position for this patch:

- GO for payment hardening planning.
- NOT GO for live Tap/payment launch.
- NOT GO for commercial launch.

## 3. Commands and Files Inspected

Commands run for inspection:

```bash
git grep -n "tap" -- app lib docs
git grep -n "payment" -- app lib docs
git grep -n "checkout" -- app lib docs
git grep -n "manual-confirm" -- app lib docs
git grep -n "createAdminClient" -- app lib
npm.cmd run typecheck
```

Primary files inspected:

- `app/api/tap/webhook/route.ts`
- `app/api/tap/create-charge/route.ts`
- `app/api/checkout/manual-confirm/route.ts`
- `app/api/checkout/session/route.ts`
- `app/api/marketplace/checkout/create-order/route.ts`
- `app/api/studios/bookings/create/route.ts`
- `app/api/payments/providers/route.ts`
- `app/api/admin/payments/manual-refund/route.ts`
- `app/api/admin/refunds/create/route.ts`
- `app/api/admin/settlements/create/route.ts`
- `app/api/admin/settlements/update-status/route.ts`
- `app/api/payout-requests/create/route.ts`
- `app/api/acceleration/orders/create/route.ts`
- `app/api/marketplace/orders/update-status/route.ts`
- `app/api/owner/bookings/update-status/route.ts`
- `lib/tap/charge.ts`
- `lib/tap/config.ts`
- `lib/finance-ledger.ts`
- `lib/finance-audit.ts`
- `.env.example`
- `docs/GEARBEAT_PATCH_135A_SECURITY_RELEASE_READINESS_OPERATING_PLAN.md`
- `docs/GEARBEAT_PATCH_135B_DEPENDENCY_AUDIT_UPDATE_PLAN.md`
- `docs/GEARBEAT_PATCH_104A_MANUAL_PAYMENT_SAFETY_LOCK.md`
- `docs/GEARBEAT_PATCH_104B_TAP_WEBHOOK_SAFETY_PLAN.md`
- `docs/GEARBEAT_PATCH_110B_API_DECOMMISSIONING_GATEWAY_LOCK.md`
- `docs/GEARBEAT_PATCH_116A_MUTATING_API_ROUTE_MATRIX_SERVICE_ROLE_AUDIT.md`
- `docs/GEARBEAT_PATCH_117A_TAP_ROUTE_REALITY_AUDIT_WEBHOOK_IDEMPOTENCY_PLAN.md`

## 4. Payment Risk Inventory

### A. `/api/tap/webhook`

Current implementation status:

- Public `POST` route.
- Reads JSON body and extracts `id`, `status`, and `metadata`.
- Requires `metadata.booking_id`; otherwise returns `{ received: true }`.
- Uses `createAdminClient`.
- If `status === "CAPTURED"`, updates `bookings`:
  - `status: "confirmed"`
  - `payment_status: "paid"`
  - `tap_charge_id: id`
- Inserts a booking-confirmed notification for `metadata.customer_id`.
- If `status === "FAILED"` or `status === "CANCELLED"`, updates `bookings`:
  - `status: "cancelled"`
  - `payment_status: "failed"`

Readiness status:

- NOT live-production ready.
- Critical risk for live use.
- Must be treated as sandbox/pre-live only until hardened or disabled.

Findings:

- No webhook signature verification.
- No HMAC/hash validation.
- No Tap source validation.
- No idempotency check.
- No raw event audit log before mutation.
- No lookup of internal checkout session before mutation.
- No amount validation.
- No currency validation.
- No validation that the booking belongs to the expected customer.
- No validation that the booking is in a valid payable state.
- No duplicate notification prevention.
- Uses service-role/admin client in a payment context.

Live-payment decision:

- BLOCK live Tap activation until this route is either safely disabled for live traffic or rebuilt with verified webhook processing, idempotency, and source-of-truth validation.

### B. `/api/tap/create-charge`

Current implementation status:

- Authenticated `POST` route.
- Uses session-bound Supabase client through `createClient`.
- Reads JSON body and extracts:
  - `bookingId`
  - `amount`
  - `studioId`
- Looks up user profile fields from `profiles`.
- Looks up `tap_destination_id` from `studios` using client-provided `studioId`.
- Calls `createTapCharge` with client-provided `amount`, `bookingId`, and `studioId`.
- Redirect URL includes `bookingId`.
- Returns fallback when Tap keys are not configured.
- Returns Tap `chargeUrl` when the helper succeeds.

Readiness status:

- NOT live-production ready.
- Must remain pre-live/sandbox only.

Findings:

- Client-provided `amount` is trusted.
- Client-provided `bookingId` is trusted.
- Client-provided `studioId` is trusted.
- No server-side lookup of the canonical booking or checkout session before charge creation.
- No ownership validation tying `bookingId` to the authenticated user.
- No validation that the booking is payable and not already paid, cancelled, expired, or refunded.
- No validation that `studioId` matches the booking's studio.
- No validation that amount/currency match `bookings` or `checkout_payment_sessions`.
- No idempotency lock to prevent duplicate charge creation.
- No server-generated payment session/reference binding.

Live-payment decision:

- BLOCK live Tap activation until charges are created only from a server-side source-of-truth payment session and all client-supplied payment-critical values are ignored or treated as lookup keys only.

### C. `lib/tap/charge.ts`

Current implementation status:

- Defines `createTapCharge`.
- Uses `TAP_CONFIG` and returns fallback when Tap keys are missing.
- Builds a Tap charge payload with:
  - `amount`
  - `currency`
  - `customer`
  - `metadata.booking_id`
  - `metadata.studio_id`
  - `metadata.customer_id`
  - `reference.transaction`
  - `reference.order`
  - webhook `post.url`
  - redirect URL
  - optional destination split.
- Posts to `https://api.tap.company/v2/charges`.

Readiness status:

- Useful as an integration foundation.
- Not enough for live production without upstream validation, idempotency, and route-level gates.

Findings:

- The helper trusts the caller to provide safe `amount`, `bookingId`, `studioId`, and destination data.
- `reference.transaction` and `reference.order` currently map to `bookingId`, not a canonical `checkout_payment_sessions.id`.
- The post URL points to the current unverified webhook route.
- The helper does not validate whether the current environment is sandbox or live.

Live-payment decision:

- BLOCK live use until called only from a hardened payment-session route with verified internal records and environment gates.

### D. `lib/tap/config.ts`

Current implementation status:

- Reads:
  - `TAP_SECRET_KEY`
  - `NEXT_PUBLIC_TAP_PUBLIC_KEY`
- Uses Tap base URL `https://api.tap.company/v2`.
- Uses currency `SAR`.
- `isTapConfigured` returns true when both Tap keys are present.

Readiness status:

- Environment detection is minimal.
- Not enough for live/sandbox separation.

Findings:

- `.env.example` does not currently document `TAP_SECRET_KEY` or `NEXT_PUBLIC_TAP_PUBLIC_KEY`.
- No explicit `TAP_ENV`, `TAP_WEBHOOK_SECRET`, or live-disable feature gate is represented in the inspected config.
- Key presence alone is not a safe live activation signal.

Live-payment decision:

- BLOCK live use until environment separation and webhook secret configuration are explicit and reviewed.

### E. `/api/checkout/manual-confirm`

Current implementation status:

- Public route exists but is decommissioned.
- `POST` returns `410 Gone`.
- Does not import or call Supabase.
- Does not mutate payment, booking, order, loyalty, coupon, or finance data.

Readiness status:

- Current route is safe in the sense that it is disabled.
- It is not a live payment substitute.

Findings:

- Patch 110B reality is reflected in current code.
- The route does not currently expose the old manual payment bypass.

Live-payment decision:

- Keep disabled until an explicitly approved authenticated admin-only payment operations gateway exists.

### F. `/api/checkout/session`

Current implementation status:

- Authenticated `POST` route.
- Accepts body fields including:
  - `sourceType`
  - `sourceId`
  - `paymentProvider`
  - `paymentMethod`
  - `subtotalAmount`
  - `currencyCode`
  - coupon/wallet/loyalty fields
  - success/cancel/return URLs
- Uses `createAdminClient`.
- Validates coupon server-side.
- Computes payable amount from submitted subtotal minus validated coupon/wallet values.
- Calls `create_checkout_payment_session` RPC.
- Updates `checkout_payment_sessions` metadata.
- Returns `checkoutUrl: null` and a message that real payment redirection is not enabled yet.

Readiness status:

- Useful as a checkout foundation.
- Not safe as a live payment source without server-side amount/source validation.

Findings:

- `subtotalAmount` is client-provided.
- `sourceId` is client-provided.
- `paymentProvider` and `paymentMethod` are client-provided.
- Source record ownership and canonical price lookup are not fully established in this route itself.
- Checkout redirect remains intentionally disabled.
- Uses service-role/admin client in checkout context.

Live-payment decision:

- BLOCK live redirection until source records, ownership, amount, currency, discount, and payable amount are all calculated server-side from canonical tables.

### G. `/api/marketplace/checkout/create-order`

Current implementation status:

- Authenticated `POST` route with no request body.
- Loads active cart for the authenticated user.
- Loads cart items and product/variant records server-side.
- Computes product prices from server-side product/cart data.
- Creates a marketplace order with `payment_status: "unpaid"`.
- Creates a `checkout_payment_sessions` row with `provider_code: "manual"` and `payment_method: "manual"`.
- Returns message: `Marketplace order created. Manual test payment is ready.`
- Uses `createAdminClient`.

Readiness status:

- Pilot/manual checkout foundation.
- Not live payment-ready.

Findings:

- Better than client-provided amount because order totals are calculated from server-side cart/product rows.
- Still uses service-role/admin client.
- Payment provider is manual.
- Inventory stock check is not proven as an atomic live-commerce reservation/deduction gate in this route.
- No live provider session is created.

Live-payment decision:

- Keep as pilot/manual foundation. Do not use as proof of live commerce readiness.

### H. `/api/studios/bookings/create`

Current implementation status:

- Authenticated `POST` route.
- Accepts body fields including:
  - `studioId`
  - `bookingDate`
  - `startTime`
  - `durationHours`
  - `notes`
- Loads studio, availability rules, and exceptions server-side.
- Computes hourly price and total amount server-side.
- Calls `create_studio_booking_v1` RPC.
- Creates a manual `checkout_payment_sessions` row with `provider_code: "manual"` and `payment_method: "manual"`.
- Returns message: `Studio booking created. Manual test payment is ready.`
- Uses `createAdminClient`.

Readiness status:

- Stronger than client-provided charge creation because pricing is calculated server-side.
- Still pre-live/manual and not live Tap-ready.

Findings:

- Uses service-role/admin client.
- Creates manual checkout session only.
- Does not create a live Tap session.
- Future Tap route must reference the created booking/checkout session and verify ownership/status before payment.

Live-payment decision:

- Keep as manual/pilot foundation. Do not treat as live payment approval.

### I. `/api/payments/providers`

Current implementation status:

- Public `GET` route.
- Reads payment provider configuration using `createAdminClient`.
- Returns provider status, checkout enabled flag, test mode flag, capabilities, currency support, and selectable status.

Readiness status:

- Payment configuration display/query helper.
- Not a live activation gate by itself.

Findings:

- Uses service-role/admin client in a read-only public context.
- If provider records are misconfigured as enabled/selectable, UI could imply availability.
- Should be included in the service-role route audit.

Live-payment decision:

- Live payment availability must not be inferred from this route alone.

### J. `/api/admin/payments/manual-refund`

Current implementation status:

- Authenticated admin route through `requireAdminLayoutAccess`.
- Accepts:
  - `paymentTransactionId`
  - `amount`
  - `reason`
- Looks up `payment_transactions`.
- Allows only `provider_code === "manual"`.
- Validates refund amount against captured/refunded amount.
- Inserts `payment_refunds`.
- Updates `payment_transactions`.
- Updates source refund status where possible.
- Reverses loyalty/coupon effects when eligible.
- Uses service-role/admin client through the admin guard.
- Explicitly states no external payment provider is contacted.

Readiness status:

- Manual/admin refund workflow only.
- Not Tap live refund readiness.

Findings:

- Good explicit guard that only manual/testing transactions are eligible.
- Still high financial sensitivity and must remain admin-only with audit logging.
- Does not replace provider-side refund/reconciliation requirements for live payments.

Live-payment decision:

- OK for controlled manual/testing operations if admin access is trusted.
- NOT sufficient for live Tap refund workflow.

### K. `/api/admin/refunds/create`

Current implementation status:

- Admin route through `requireAdminOrRedirect`.
- Accepts client-provided amount and adjustment metadata.
- Inserts `finance_adjustments`.
- Writes finance ledger and audit log through user-scoped Supabase client.

Readiness status:

- Admin finance adjustment route.
- Not a live provider refund route.

Findings:

- Uses admin guard.
- Amount is admin-provided, so policy/audit controls are the key safety boundary.
- Should stay separate from provider refund automation.

### L. `/api/admin/settlements/create` and `/api/admin/settlements/update-status`

Current implementation status:

- Admin routes through `requireAdminOrRedirect`.
- Create/update settlement batches and write finance audit logs.
- `update-status` can mark settlement batches as `paid`.

Readiness status:

- Admin operations/settlement workflow.
- Not proof of live payout readiness.

Findings:

- Admin guarded.
- `paid` status is operational/manual state, not provider-confirmed payout settlement.
- Requires reconciliation process before commercial launch.

### M. `/api/payout-requests/create`

Current implementation status:

- Authenticated route.
- Accepts:
  - `requestedAmount`
  - `payoutMethod`
  - `payoutDetails`
  - `partnerType`
  - notes
- Inserts a `payout_requests` row using the user-scoped Supabase client.

Readiness status:

- Request intake only.
- Not payout execution.

Findings:

- Client-provided requested amount.
- Needs partner eligibility and payable-balance validation before any production payout workflow.

### N. `/api/acceleration/orders/create`

Current implementation status:

- Authenticated route.
- Accepts `packageId` and `partnerType`.
- Loads package price server-side.
- Inserts an acceleration order with `payment_status: "pending"`.

Readiness status:

- Pre-payment/pending order creation.
- Not live payment.

Findings:

- Server-side package price lookup is a good pattern.
- Still requires future payment session/provider workflow before commercial activation.

### O. `/api/marketplace/orders/update-status`

Current implementation status:

- Authenticated route.
- Admin can update full order status.
- Vendors can update item status where they own the item.
- Admin full-order status changes can derive `payment_status` from status, including `paid`, `refunded`, and `partially_refunded`.
- Uses `createAdminClient`.

Readiness status:

- Operational order status tool.
- Needs caution around payment status transitions.

Findings:

- Payment status can be changed by admin order status mapping.
- This is acceptable only as controlled admin/manual operations before live provider source-of-truth exists.
- It must not be used as a replacement for verified provider webhook payment status in live payment mode.

### P. `/api/owner/bookings/update-status`

Current implementation status:

- Authenticated owner route.
- Accepts `bookingId`, `status`, and `ownerNotes`.
- Verifies that the user owns the studio.
- Updates booking status but does not directly set payment status.
- Uses session-bound Supabase client, not service-role/admin client.

Readiness status:

- Booking lifecycle route.
- Payment status is not directly handled here.

Findings:

- Ownership check is present.
- Still relevant to payment lifecycle because booking state and payment state must not diverge in future live mode.

## 5. Routes Accepting Payment-Critical Client Input

The following inspected routes accept one or more payment-critical or lifecycle-critical values from request input:

| Route | Client input observed | Current concern |
| --- | --- | --- |
| `/api/tap/create-charge` | `bookingId`, `amount`, `studioId` | Must not trust these values for live payment creation. |
| `/api/tap/webhook` | `id`, `status`, `metadata.booking_id`, `metadata.customer_id` | Public input from webhook body is trusted without signature/source validation. |
| `/api/checkout/session` | `sourceType`, `sourceId`, `paymentProvider`, `paymentMethod`, `subtotalAmount`, `currencyCode`, URLs, coupon/wallet/loyalty values | Must calculate and validate source, amount, ownership, currency, and provider server-side before live redirection. |
| `/api/studios/bookings/create` | `studioId`, `bookingDate`, `startTime`, `durationHours` | Server computes price, but future payment must reference resulting booking/session only. |
| `/api/marketplace/cart/add` and cart routes found by grep | `productId`, `variantId`, `quantity` | Cart composition affects checkout amount; must remain server-priced and stock-checked. |
| `/api/marketplace/orders/update-status` | `orderId`, `itemId`, `status`, `scope` | Admin status mapping can alter payment status; live provider truth must supersede manual state changes. |
| `/api/admin/payments/manual-refund` | `paymentTransactionId`, `amount`, `reason` | Admin-only manual refund; not provider refund. |
| `/api/admin/refunds/create` | `amount`, `sourceType`, `sourceId`, adjustment fields | Admin finance adjustment; not provider-confirmed refund. |
| `/api/admin/settlements/create` | `ledgerEntryIds`, title/description | Settlement selection is admin-controlled; needs reconciliation discipline. |
| `/api/admin/settlements/update-status` | `batchId`, `status` | Admin can mark settlement paid; provider/bank reconciliation must exist before commercial launch. |
| `/api/payout-requests/create` | `requestedAmount`, `payoutMethod`, `payoutDetails`, `partnerType` | Request only; must validate payable balance before production payout. |
| `/api/acceleration/orders/create` | `packageId`, `partnerType` | Price is loaded server-side, but payment remains pending/pre-live. |

## 6. Service-Role/Admin Client Usage in Payment Context

Inspected payment-related service-role/admin usage:

- `/api/tap/webhook` uses `createAdminClient` and directly mutates `bookings`.
- `/api/checkout/session` uses `createAdminClient` and calls checkout-session RPC/update paths.
- `/api/marketplace/checkout/create-order` uses `createAdminClient` to create orders, order items, checkout sessions, and cart conversion records.
- `/api/studios/bookings/create` uses `createAdminClient` to validate studio/availability, call booking RPC, create checkout sessions, and update bookings.
- `/api/payments/providers` uses `createAdminClient` for public provider configuration reads.
- `/api/admin/payments/manual-refund` uses admin access and service-role context for finance/payment mutation.
- `/api/marketplace/orders/update-status` uses `createAdminClient` and can update order/payment status from admin status changes.

Patch 135D must audit every `createAdminClient` route-by-route. Payment-sensitive routes should be first priority.

## 7. Live-Payment Blockers

Live Tap/payment launch is blocked until all of the following are complete and verified:

1. Webhook signature, HMAC, or hash verification is required.
2. Webhook idempotency is required.
3. Raw webhook event audit logging is required before any state mutation.
4. Payment amount must be calculated server-side, not trusted from client body.
5. Currency must be validated against the internal source-of-truth record.
6. Booking, order, and checkout session ownership validation is required.
7. Tap charge, reference, session, and provider transaction validation is required.
8. Payment status must use provider webhook/source-of-truth, not client confirmation or redirect success.
9. Duplicate payment prevention is required before charge creation and before webhook mutation.
10. Valid state-transition rules are required for bookings, marketplace orders, checkout sessions, transactions, refunds, and settlements.
11. Refund workflow is required.
12. Reconciliation workflow is required.
13. Admin reconciliation view or a documented manual reconciliation process is required.
14. Audit logging is required for payment creation, webhook receipt, status mutation, refund, settlement, and manual override.
15. Environment separation is required for sandbox vs live.
16. Live Tap keys must not be accepted as activation by themselves.
17. Company/legal/bank readiness is required.
18. Tap merchant activation and approval are required before live.
19. Terms, refund/cancellation policy, and payment support process must be current before commercial launch.
20. Production smoke test checklist must be completed before live activation.

## 8. Disable Gate / Safety Position

GearBeat can enable live Tap only when every item below is true:

### Business and legal gate

- Company/legal entity is ready.
- Business bank account and settlement account are ready.
- Tap merchant account is live-approved.
- Required Saudi regulatory, refund, cancellation, and customer support policies are approved.

### Environment gate

- Live Tap keys are stored securely in the production environment only.
- Sandbox keys remain separated from live keys.
- Webhook secret is configured.
- There is an explicit live-payment feature flag or equivalent disable gate.
- `.env.example` documents Tap variables safely without real secrets.

### Route hardening gate

- `/api/tap/webhook` verifies signature/HMAC/hash before parsing or mutating.
- `/api/tap/webhook` records raw event/audit data before mutation.
- `/api/tap/webhook` enforces idempotency.
- `/api/tap/webhook` validates Tap charge/reference/session status against provider source of truth.
- `/api/tap/create-charge` no longer trusts client-provided amount.
- Charge creation starts from a canonical server-side booking/order/checkout session.
- Booking/order ownership and payable status are verified.
- Duplicate active payment sessions/charges are blocked.
- All status changes follow a documented state machine.

### Operations gate

- Admin reconciliation view exists, or a manual reconciliation process is written and approved.
- Refund workflow exists and is verified.
- Failed, cancelled, expired, duplicate, partially paid, and disputed payment cases are handled.
- Payment audit logs can answer who/what/when/why for every financial state change.

### Production smoke test gate

- Sandbox end-to-end flow passes first.
- Production smoke test with approved small-value live transaction is explicitly authorized.
- Webhook receipt, verification, idempotency, status mutation, receipt/notification, refund, and reconciliation are checked.
- Rollback procedure to disable live payments is documented and tested.

## 9. Recommended Future Patch Sequence

Keep code changes separate from this planning patch:

### Patch 135D - Service Role Route-by-Route Audit

Purpose:

- Inventory every `createAdminClient` usage.
- Classify each by exposure, guard, ownership validation, RLS bypass risk, and mutation sensitivity.
- Prioritize payment, finance, admin, document upload, vendor API, and customer data routes.

### Patch 135E - metadataBase + `.env.example` Alignment

Purpose:

- Add production-safe metadata base alignment.
- Add Tap/OTP environment placeholders and safety notes without activating payment behavior.

### Patch 136A - Dependency Security Patch 1, if approved

Purpose:

- Address highest-priority web dependency advisories from Patch 135B.
- Keep dependency changes separate from payment logic.

### Patch 137A - Tap Route Lockdown / Disable Unsafe Live Paths

Purpose:

- Add explicit safety gates so unsafe Tap live paths cannot be accidentally used in production.
- Decide whether `/api/tap/webhook` returns a safe blocked response until verification is implemented, or only accepts sandbox-gated traffic.

### Patch 137B - Tap Webhook Verification + Idempotency Implementation

Purpose:

- Implement verified Tap webhook processing.
- Add signature/HMAC/hash validation.
- Add idempotency.
- Add raw event/audit logging.
- Validate provider event status, reference, amount, currency, booking/order/session, and source ownership before mutation.

### Patch 137C - Server-Side Payment Session Creation

Purpose:

- Replace client-provided amount/booking/studio trust with canonical payment sessions.
- Ensure charge creation starts from server-side records only.
- Enforce duplicate payment prevention before Tap charge creation.

### Patch 137D - Payment QA / Reconciliation Gate

Purpose:

- Verify sandbox lifecycle.
- Verify refunds and reconciliation.
- Produce final live-payment GO/NOT GO decision.

## 10. Explicitly Blocked in This Patch

The following were blocked and were not performed:

- No Tap live activation.
- No payment logic changes.
- No webhook rewrite.
- No API route edits.
- No booking/order/marketplace logic edits.
- No database changes.
- No SQL.
- No RLS changes.
- No Supabase commands.
- No environment changes.
- No `.env` or `.env.example` edits.
- No dependency updates.
- No package file edits.
- No production payment claims.
- No commercial launch decision.

## 11. Required Verification for This Patch

Expected changed file:

- `docs/GEARBEAT_PATCH_135C_TAP_LIVE_PAYMENT_DISABLE_GATE_HARDENING_PLAN.md`

Expected unchanged areas:

- `app/api/**`
- Payment logic
- Booking/order/marketplace logic
- `package.json`
- `package-lock.json`
- Supabase files
- `.env`
- `.env.example`
- Middleware
- UI pages/components
- Database migrations

Required commands:

```bash
git status --short
git diff --name-only
npm.cmd run typecheck
```

## 12. Final Verdict

### GO

GO for payment hardening planning.

Patch 135C can be committed as a documentation-only payment security plan that clearly keeps live Tap blocked and defines the hardening sequence.

### NOT GO

NOT GO for live Tap/payment launch.

NOT GO for commercial launch.

Live payment activation remains blocked until company/legal/bank readiness, Tap merchant approval, secure live environment configuration, verified webhook handling, idempotency, server-side payment session creation, source-of-truth validation, refund/reconciliation workflows, and production smoke-test gates are complete.
