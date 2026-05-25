# Patch 135D - Service Role Route-by-Route Audit

## 1. Scope

Patch 135D is a documentation-only security audit and planning patch for GearBeat V2.

No service-role code was changed in this patch. No API routes, auth logic, payment logic, Supabase helpers, package files, environment files, middleware, UI pages, database migrations, SQL, RLS, or dependencies were modified.

This is a pre-hardening audit. Its purpose is to map current `createAdminClient` and service-role usage, classify route/helper risk, and define the next safe hardening sequence before commercial launch, broad partner/admin production access, or live payment enablement.

## 2. Current Service-Role Risk Summary

`createAdminClient` uses the Supabase service-role key through `lib/supabase/admin.ts`. This bypasses Row Level Security and must be treated as a high-trust server-only capability.

Why this is sensitive:

- Service-role can read and mutate rows that normal users cannot access through RLS.
- A missing route guard can turn an API endpoint into an RLS bypass.
- A missing ownership check can allow one customer, studio owner, vendor, or partner to affect another tenant's data.
- A route that trusts `userId`, `role`, `status`, `amount`, `bookingId`, `orderId`, `studioId`, or similar client input can mutate privileged records incorrectly.
- A public route using service-role can expose private data if select fields are not minimized.
- Payment, booking, order, payout, refund, profile, partner, and admin status changes are especially sensitive.

Current posture:

- `lib/supabase/admin.ts` imports `server-only`, checks `typeof window`, requires `SUPABASE_SERVICE_ROLE_KEY`, disables auth token persistence, and is server-only by design.
- `lib/supabase/server.ts` is the user-scoped server client and uses Supabase SSR cookies.
- `lib/supabase/client.ts` is the browser client and uses the public anon key.
- `middleware.ts` refreshes Supabase sessions and applies subdomain-root redirects; it does not enforce role-level access.
- Role and tenant enforcement currently happens in route handlers, layouts, and helpers.

Inspection count:

- Runtime `createAdminClient()` call sites found: 148.
- Files with runtime `createAdminClient()` calls: 88.
- Textual `createAdminClient` matches including imports, type references, and helper definition: 247 across 90 files.
- Direct `SUPABASE_SERVICE_ROLE_KEY` references found in `lib/supabase/admin.ts` and `lib/otp/provider.ts`.
- Lowercase `service_role` matches were not found under `app` or `lib`.

## 3. Commands Run

```bash
git grep -n "createAdminClient" -- app lib
git grep -n "SERVICE_ROLE" -- app lib
git grep -n "service_role" -- app lib
git grep -n "SUPABASE_SERVICE" -- app lib
git grep -n "auth.getUser" -- app lib
git grep -n "getUser()" -- app lib
git grep -n "admin" -- app/api lib
npm.cmd run typecheck
```

Additional read-only inspection was used to count call sites and inspect guard/helper files.

## 4. Files Inspected

Primary helper/security files:

- `lib/supabase/admin.ts`
- `lib/supabase/server.ts`
- `lib/supabase/client.ts`
- `middleware.ts`
- `lib/route-guards.ts`
- `lib/auth-guards.ts`
- `lib/admin.ts`
- `lib/vendor-api-auth.ts`
- `lib/device-trust.ts`
- `lib/storage/provider-documents.ts`
- `lib/customer-profile.ts`
- `lib/otp/provider.ts`

Primary app/API areas:

- `app/api/**`
- `app/admin/**`
- `app/partner/**`
- `app/portal/**`
- `app/seller/**` check: no `app/seller` directory exists.

Recent and previous security docs:

- `docs/GEARBEAT_PATCH_135A_SECURITY_RELEASE_READINESS_OPERATING_PLAN.md`
- `docs/GEARBEAT_PATCH_135C_TAP_LIVE_PAYMENT_DISABLE_GATE_HARDENING_PLAN.md`
- `docs/GEARBEAT_PATCH_116A_MUTATING_API_ROUTE_MATRIX_SERVICE_ROLE_AUDIT.md`
- `docs/GEARBEAT_PATCH_66B_SERVICE_ROLE_RLS_SECURITY_AUDIT_DECISION_GATE.md`
- `docs/GEARBEAT_PATCH_110D_A_API_SESSION_HARDENING_AUDIT.md`
- `docs/GEARBEAT_AUDIT_101_BACKEND_DATABASE_REALITY_REPORT.md`

## 5. Critical Findings

### Critical 1 - Tap webhook public service-role mutation

File:

- `app/api/tap/webhook/route.ts`

Finding:

- Uses `createAdminClient`.
- Does not authenticate a user.
- Does not validate role or ownership.
- Accepts webhook body fields including `id`, `status`, and `metadata.booking_id`.
- Mutates `bookings.status`, `bookings.payment_status`, and `tap_charge_id`.
- Inserts notifications.
- Lacks webhook signature verification, idempotency, amount validation, currency validation, and source-of-truth validation.

Risk:

- Critical.

Required future action:

- Keep live Tap blocked.
- In Patch 137A, disable or gate unsafe live webhook paths.
- In Patch 137B, implement verified webhook signature/HMAC/hash validation, idempotency, raw event logging, source-of-truth checks, and safe state transitions.

### Critical 2 - Checkout/payment routes use service-role with payment-critical client input

Files:

- `app/api/checkout/session/route.ts`
- `app/api/marketplace/checkout/create-order/route.ts`
- `app/api/studios/bookings/create/route.ts`
- `app/api/marketplace/orders/update-status/route.ts`

Finding:

- Checkout session accepts client-provided `sourceId`, provider/method, subtotal, currency, and URL fields.
- Marketplace and studio create routes authenticate users and calculate core totals server-side, but still create sensitive order/booking/payment-session records via service-role.
- Marketplace order status update can map admin status changes into `payment_status`.

Risk:

- High.

Required future action:

- Keep payment hardening separate from general service-role cleanup.
- Validate source ownership, server-side amount, currency, provider, and status transitions before live payment work.
- Add audit logs for all financial state transitions.

### Critical 3 - Document upload uses service-role storage and metadata writes

File:

- `app/api/documents/upload/route.ts`

Finding:

- Authenticates user first.
- Validates scope/type/file and bucket allowlist.
- Uses `createAdminClient` for private storage upload and `verification_documents` insert.
- Accepts `verification_scope`, `document_type`, `bucket`, and `verification_id` from form data.

Risk:

- High because documents can include sensitive provider identity/compliance material.

Required future action:

- Add explicit ownership/verification-record validation before upload.
- Keep bucket allowlists.
- Add audit logging.
- Consider sovereign storage and PDPL/data residency gate before broad partner access.

### Critical 4 - Vendor system API uses service-role behind API-key auth

Files:

- `lib/vendor-api-auth.ts`
- `app/api/v1/vendor/products/route.ts`
- `app/api/v1/vendor/inventory/route.ts`
- `app/api/v1/vendor/orders/route.ts`

Finding:

- Uses service-role to validate hashed vendor API keys and log requests.
- Vendor API routes do not use browser `auth.getUser`; they authenticate with `x-gearbeat-api-key` or bearer key.
- Permissions are checked by scope such as `products:read`, `products:write`, `inventory:write`, and `orders:read`.
- Routes constrain key operations by `auth.vendorId`, but still depend on API-level checks rather than RLS.

Risk:

- High.

Required future action:

- Add rate limits and replay/abuse monitoring.
- Ensure every route filters by vendor identity.
- Keep request logging.
- Review API key issuance/revocation and least-privilege permissions before production vendor integrations.

### Critical 5 - Broad admin and portal pages use service-role heavily

Files:

- Many `app/admin/**` pages and actions.
- Many `app/portal/store/**` and `app/portal/studio/**` pages.

Finding:

- Admin layout uses `requireAdminLayoutAccess`, which authenticates, checks `admin_users`, and returns `supabaseAdmin`.
- Store portal layout uses `requireVendorLayoutAccess`.
- Studio portal layout uses user-scoped profile checks.
- Many page-level mutations still rely on server actions or page handlers using service-role and manual ownership/status checks.

Risk:

- Medium to High depending on mutation sensitivity.

Required future action:

- Harden critical payment/admin routes first.
- Then migrate simple tenant-bound reads/writes to user-scoped clients where RLS supports it.
- Add audit logs for admin/partner/customer-sensitive mutations.

## 6. API Route Inventory

Legend:

- Auth: whether route validates user/API/cron before service-role work.
- Role/Owner: whether role, ownership, API permission, or cron secret is validated.
- Mutates: whether the route can write/update/delete data or storage.
- Risk: Critical / High / Medium / Low.

| File path | Purpose | Service-role use | Auth | Role/Owner | Mutates | Risk | Required future action |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `app/api/tap/webhook/route.ts` | Tap payment webhook updates bookings | Yes | No | No | Yes | Critical | Disable/gate live path, add signature, idempotency, source-of-truth validation |
| `app/api/tap/create-charge/route.ts` | Tap charge creation | No direct service-role | Yes | Partial ownership gap | Can create Tap charge | High | Server-side payment-session creation; never trust client amount/booking/studio |
| `app/api/checkout/session/route.ts` | Checkout session foundation | Yes | Yes | Partial | Yes | High | Recompute amount/source server-side; validate ownership/provider/currency |
| `app/api/checkout/manual-confirm/route.ts` | Deprecated manual confirmation | No | N/A | N/A | No | Low | Keep disabled until approved admin-only gateway |
| `app/api/marketplace/checkout/create-order/route.ts` | Cart to marketplace order/session | Yes | Yes | User cart ownership | Yes | High | Atomic inventory/payment-session hardening; audit logging |
| `app/api/studios/bookings/create/route.ts` | Studio booking/session creation | Yes | Yes | Studio availability validation | Yes | High | Keep RPC safety, audit service-role boundary, future payment-source validation |
| `app/api/marketplace/orders/update-status/route.ts` | Admin/vendor order status updates | Yes | Yes | Admin/vendor checks | Yes | High | Restrict payment status transitions; add audit log and provider-truth rules |
| `app/api/admin/login-check/route.ts` | Admin login eligibility check | Yes | Yes | `admin_users` active role | No | Medium | Keep minimal select; rate-limit/check audit trail if needed |
| `app/api/admin/payments/manual-refund/route.ts` | Admin manual refund | Indirect via `requireAdminLayoutAccess` | Yes | Admin guard | Yes | High | Keep manual-only, add stronger audit/reconciliation gates |
| `app/api/admin/refunds/create/route.ts` | Admin finance adjustment/refund | No direct service-role | Yes | Admin guard | Yes | Medium | Keep user-scoped if RLS supports it; ensure audit completeness |
| `app/api/admin/settlements/create/route.ts` | Admin settlement batch create | No direct service-role | Yes | Admin guard | Yes | Medium | Ensure finance-role allowlist and audit logs |
| `app/api/admin/settlements/update-status/route.ts` | Admin settlement status update | No direct service-role | Yes | Admin guard | Yes | Medium | Treat `paid` as manual/admin state; require reconciliation |
| `app/api/admin/payout-requests/update-status/route.ts` | Admin payout request status | No direct service-role | Yes | Admin guard | Yes | Medium | Add finance-role policy and audit checks |
| `app/api/admin/commission-settings/upsert/route.ts` | Admin commission settings | No direct service-role | Yes | Admin/super_admin role | Yes | Medium | Keep role allowlist and audit |
| `app/api/admin/finance-ledger/rebuild/route.ts` | Finance ledger rebuild | No direct service-role found | Expected admin | Expected admin | Yes | Medium | Confirm guard and audit in hardening pass |
| `app/api/admin/finance-audit/log/route.ts` | Finance audit log read | No direct service-role found | Expected admin | Expected admin | No | Low | Keep read-only and role-limited |
| `app/api/admin/acceleration/packages/upsert/route.ts` | Admin acceleration package update | No direct service-role found | Expected admin | Expected admin | Yes | Medium | Confirm guard and audit |
| `app/api/admin/loyalty/adjust-points/route.ts` | Admin loyalty adjustment | No direct service-role found | Expected admin | Expected admin | Yes | High | Keep finance/admin allowlist; audit every adjustment |
| `app/api/cron/bookings/cleanup-stale/route.ts` | Stale booking cleanup | Yes | Cron secret | `CRON_SECRET` helper | Yes | High | Keep strong cron secret; audit affected rows |
| `app/api/reviews/create-requests/route.ts` | Cron review request creation | Yes | Cron secret | `getCronAuthFailureResponse` | Yes | Medium | Keep cron gate and idempotency around review requests |
| `app/api/reviews/send-emails/route.ts` | Cron review email send | Yes | Cron secret | `getCronAuthFailureResponse` | Yes | Medium | Keep cron gate; avoid PII leakage in logs |
| `app/api/reviews/process/route.ts` | Cron review request create/send | Yes | Cron secret | Local cron secret checker | Yes | Medium | Consolidate cron auth helper and audit status updates |
| `app/api/documents/upload/route.ts` | Private verification document upload | Yes | Yes | Scope/type/bucket checks, ownership gap | Yes | High | Add verification ownership check and audit logs |
| `app/api/coupons/validate/route.ts` | Coupon validation | Yes | Yes | User-bound RPC inputs | No/low mutation | Medium | Ensure subtotal/source not trusted for final payment |
| `app/api/favorites/status/route.ts` | Favorite status read | Yes | Yes | User target check | No | Low | Prefer user-scoped client if RLS supports it |
| `app/api/favorites/toggle/route.ts` | Favorite toggle | Yes | Yes | User-bound target | Yes | Medium | Prefer user-scoped client with RLS |
| `app/api/marketplace/cart/add/route.ts` | Cart add | Yes | Yes | User cart ownership | Yes | Medium | Prefer user-scoped client; keep server price/product checks |
| `app/api/marketplace/cart/remove/route.ts` | Cart remove | Yes | Yes | User cart item | Yes | Medium | Prefer user-scoped client with RLS |
| `app/api/marketplace/cart/route.ts` | Cart read/sync | Yes | Yes | User cart ownership | GET no, sync yes | Medium | Split read/sync and prefer RLS-backed user client |
| `app/api/marketplace/cart/update/route.ts` | Cart quantity update | Yes | Yes | User cart item | Yes | Medium | Prefer user-scoped client; server stock validation |
| `app/api/offers/claim/route.ts` | Offer claim | Yes | Yes | User offer lookup | Yes | Medium | Audit duplicate claim/idempotency |
| `app/api/otp/send/route.ts` | OTP send session create | Yes | Yes | Authenticated user/target validation | Yes | Medium | Keep OTP secret alignment; rate-limit and audit |
| `app/api/otp/verify/route.ts` | OTP verification | Yes | Yes | Session/target/code validation | Yes | Medium | Rate-limit attempts and avoid service-key fallback for OTP secret |
| `app/api/payments/providers/route.ts` | Payment provider config read | Yes | No | No | No | Medium | Avoid public service-role config leakage; return safe public fields only |
| `app/api/portal/studios/availability/update/route.ts` | Studio availability update | Yes | Yes | Studio ownership check | Yes | High | Prefer owner-scoped RLS or stronger ownership helper/audit |
| `app/api/share/track/route.ts` | Share/referral tracking | Yes | Optional user | Input URL/referral target | Yes | Medium | Keep write scope narrow; validate target IDs |
| `app/api/v1/vendor/products/route.ts` | Vendor product API read/write | Yes | API key | Permission + vendorId | GET no, POST yes | High | Rate-limit, keep vendor filters, audit payloads |
| `app/api/v1/vendor/inventory/route.ts` | Vendor inventory API | Yes | API key | Permission + vendorId | Yes | High | Add rate limits, strict vendor SKU ownership, audit |
| `app/api/v1/vendor/orders/route.ts` | Vendor order API read | Yes | API key | Permission + vendorId | No | Medium | Keep vendor filtering, minimize returned fields |
| `app/api/vendor/integrations/api-keys/route.ts` | Vendor API key list/create | Yes | Yes | Vendor/admin role | Yes | High | Add key creation audit, avoid exposing raw key after creation |
| `app/api/vendor/integrations/api-keys/revoke/route.ts` | Vendor API key revoke | Yes | Yes | Own key by `auth_user_id` | Yes | Medium | Keep owner filter and audit revocation |
| `app/api/vendor/products/bulk-template/route.ts` | Vendor bulk template read | Yes | Route expected vendor context | Template/catalog read | No | Low | Confirm guard before production |
| `app/api/vendor/products/bulk-upload/route.ts` | Vendor bulk product upload | Yes | Yes | Vendor/admin role | Yes | High | Validate row ownership, add audit, consider queueing |
| `app/api/vendor/products/images/upload/route.ts` | Vendor product image upload | Yes | Yes | Vendor/admin role + product ownership | Yes | High | Keep ownership checks, file validation, audit |

## 7. App Route/Page and Helper Inventory

| File path | Purpose | Service-role use | Auth | Role/Owner | Mutates | Risk | Required future action |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `app/admin/layout.tsx` | Admin shell and badge counts | Yes via guard | Yes | `requireAdminLayoutAccess` | No | Medium | Keep admin guard; minimize broad count queries |
| `app/admin/admin-actions.ts` | Publish studio override | Yes | Inherited/action context unclear | Admin page assumed | Yes | High | Add explicit admin guard inside server action |
| `app/admin/bookings/[id]/page.tsx` | Admin booking/payment lifecycle | Yes | Admin layout | Admin layout | Yes | High | Add fine-grained finance/admin permissions and audit logs |
| `app/admin/studio-payouts/page.tsx` | Admin studio payouts | Yes | Admin layout | Admin layout | Yes | High | Add finance-role allowlist and reconciliation audit |
| `app/admin/owner-bank-accounts/page.tsx` | Admin bank account review | Yes | Admin layout | Admin layout | Yes | High | Keep highly restricted; audit all changes |
| `app/admin/owner-compliance/page.tsx` | Admin owner compliance | Yes | Admin layout | Admin layout | Yes | High | Restrict by compliance/admin role and audit |
| `app/admin/account-deletion-requests/page.tsx` | Account deletion admin operations | Yes | Admin layout | Admin layout | Yes | High | Add explicit audit trail for destructive actions |
| `app/admin/team/page.tsx` | Admin team management | Yes | Admin layout | Admin layout | Yes | High | Super-admin only for team mutations |
| `app/admin/users/page.tsx` | Admin user management | Yes | Admin layout | Admin layout | Yes | High | Super-admin/support policy and audit |
| `app/admin/commissions/page.tsx` | Commission settings | Yes | Admin layout | Admin layout | Yes | Medium | Finance/admin role allowlist |
| `app/admin/leads/actions.ts` | Lead admin actions | Yes | Some auth checks observed | Admin intent | Yes | Medium | Add explicit role guard to every exported action |
| `app/admin/certified-studios/actions.ts` | Certified studio action | Yes | `auth.getUser` observed | Needs explicit role check | Yes | Medium | Add explicit admin role validation |
| `app/admin/accounting/page.tsx` | Accounting read dashboard | Yes | Admin layout | Admin layout | No | Medium | Minimize fields; keep finance-role gate if expanded |
| `app/admin/promos/page.tsx` | Promo management | Yes | Admin layout | Admin layout | Possible | Medium | Audit mutations and role gate |
| `app/admin/providers/page.tsx` | Provider config/admin view | Yes | Admin layout | Admin layout | Possible | Medium | Avoid exposing secrets; role-gate changes |
| `app/admin/review-requests/page.tsx` | Review request admin | Yes | Admin layout | Admin layout | Possible | Medium | Audit status changes |
| `app/admin/reviews/page.tsx` | Review moderation | Yes | Admin layout | Admin layout | Possible | Medium | Content/support role allowlist |
| `app/admin/sellers/page.tsx` | Seller administration | Yes | Admin layout | Admin layout | Possible | Medium | Vendor data minimization and audit |
| `app/admin/studios/page.tsx` | Studio administration | Yes | Admin layout | Admin layout | Possible | Medium | Admin role allowlist for approval changes |
| `app/admin/leads/page.tsx` | Lead admin page import | Import only in page | Admin layout | Admin layout | Unknown | Low | Confirm no direct service-role action in page |
| `app/account/delete/page.tsx` | Customer account deletion flow | Yes | Yes | Current user/account checks | Yes | High | Verify all destructive paths use current user only and audit |
| `app/customer/page.tsx` | Customer dashboard | Yes | Likely protected | Customer user | Read | Medium | Prefer user-scoped client or strict field minimization |
| `app/customer/bookings/page.tsx` | Customer bookings | Yes | Yes | Current user | Read | Medium | Prefer user-scoped client where RLS supports |
| `app/customer/bookings/[id]/review/page.tsx` | Customer review by token/booking | Yes | Yes | Current user/token | Yes | Medium | Confirm token and booking ownership |
| `app/customer/marketplace-orders/page.tsx` | Customer orders | Yes | Likely protected | Current user | Read | Medium | Prefer RLS-backed read |
| `app/customer/rewards/page.tsx` | Customer rewards | Yes | Likely protected | Current user | Read | Medium | Prefer RLS-backed read |
| `app/customer/saved/page.tsx` | Customer saved items | Yes | Yes | Current user | Read | Low | Prefer user-scoped client |
| `app/profile/page.tsx` | Profile page/update | Yes | Yes | Current user | Yes | Medium | Ensure no role/userId trust from body |
| `app/layout.tsx` | Root layout globals/countries | Yes | Optional user | N/A | No | Low | Prefer cached public read helper if possible |
| `app/marketplace/page.tsx` | Public marketplace | Yes | No/optional | Public field selection | No | Medium | Minimize fields; use public/RLS read if possible |
| `app/marketplace/products/[slug]/page.tsx` | Product detail | Yes | Optional user | Public field selection | No | Medium | Minimize private vendor fields |
| `app/marketplace/cart/page.tsx` | Marketplace cart page | Yes | Yes | Current user | Read | Medium | Prefer user-scoped client |
| `app/marketplace/checkout/page.tsx` | Marketplace checkout page | Yes | Yes | Current user | Read | Medium | Avoid trusting displayed totals for payment |
| `app/offers/page.tsx` | Offers page | Yes | Optional/current user | Public/user scoped | Read | Low | Prefer RLS/public read where possible |
| `app/order-confirmation/[id]/page.tsx` | Order confirmation | Yes | Not clearly enforced in file name alone | Must verify owner | Read | High | Ensure order ID cannot expose other users' orders |
| `app/studios/[slug]/page.tsx` | Public studio detail | Yes | Optional user | Public field selection | No | Medium | Avoid exposing owner private fields |
| `app/studios/[slug]/book/page.tsx` | Studio booking page | Yes | Public/optional | Public field selection | No | Medium | Keep no mutation; validate in API |
| `app/portal/store/integrations/page.tsx` | Vendor integrations | Yes | Store layout | Vendor layout | Read | Medium | Keep vendor ownership checks |
| `app/portal/store/orders/page.tsx` | Vendor orders | Yes | Store layout | Vendor layout | Read | Medium | Ensure vendor-only filters |
| `app/portal/store/products/[id]/edit/page.tsx` | Vendor product edit | Yes | Store layout + getUser | Vendor/product ownership | Yes | High | Add explicit ownership guard for every mutation |
| `app/portal/store/products/bulk/page.tsx` | Vendor bulk products | Yes | Store layout | Vendor layout | Read | Medium | API handles mutation; keep route gated |
| `app/portal/store/returns/page.tsx` | Vendor returns | Yes | Store layout/getUser | Vendor filters | Yes possible | High | Audit status mutations and ownership |
| `app/portal/studio/bank/page.tsx` | Studio owner bank data | Yes | Studio layout/getUser | Owner role | Yes | High | Strong owner checks and audit |
| `app/portal/studio/commission/page.tsx` | Studio commission view | Yes | Studio layout/getUser | Owner role | Read | Medium | Keep owner filters |
| `app/portal/studio/create-studio/page.tsx` | Owner studio creation | Yes | Studio layout/getUser | Owner role | Yes | High | Validate owner identity server-side |
| `app/portal/studio/reviews/page.tsx` | Studio reviews | Yes | Studio layout/getUser | Owner role | Read | Medium | Ensure studio ownership filters |
| `app/portal/studio/studios/page.tsx` | Owner studio list | Yes | Studio layout/getUser | Owner role | Yes possible | Medium | Prefer owner-scoped RLS or explicit owner filter |
| `app/portal/studio/studios/[id]/manage/page.tsx` | Studio manage page/actions | Yes | Studio layout/getUser | Owner/studio checks expected | Yes | High | Highest-priority partner hardening after payment/admin routes |
| `app/vendor-signup/actions.ts` | Vendor signup/server actions | Yes | Action context | Signup/vendor flow | Yes | High | Validate email/user ownership, add audit |
| `app/partner/page.tsx` | Partner landing | No service-role match | N/A | N/A | No | Low | No action from service-role audit |
| `app/partner/services/page.tsx` | Partner services landing | No service-role match | N/A | N/A | No | Low | No action from service-role audit |
| `app/partner/tickets/page.tsx` | Partner tickets landing | No service-role match | N/A | N/A | No | Low | No action from service-role audit |

## 8. Library Helper Inventory

| File path | Purpose | Service-role use | Auth | Role/Owner | Mutates | Risk | Required future action |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `lib/supabase/admin.ts` | Service-role client factory | Defines service-role client | Server-only helper | N/A | N/A | High | Keep server-only, never import in client modules |
| `lib/route-guards.ts` | Layout access guards | Yes | Yes | Admin/customer/owner/vendor checks | No direct business mutation | High | Centralize and strengthen all role gates |
| `lib/vendor-api-auth.ts` | Vendor API key auth/logging | Yes | API key | Permission + vendorId | Yes logging/key last-used | High | Rate-limit, audit, enforce least privilege |
| `lib/device-trust.ts` | Trusted device token verification | Yes | Caller supplies userId | User/token match | Yes | Medium | Ensure caller uses authenticated userId only |
| `lib/storage/provider-documents.ts` | Provider document upload/sign URLs | Yes | Some actions check user | Admin or document ownership | Yes | High | Add explicit authorization before upload/signing |
| `lib/customer-profile.ts` | Ensure customer profile | Yes | Caller provides AuthUser | Metadata/profile validation | Yes | Medium | Ensure only called with verified Supabase user |
| `lib/audit.ts` | Audit helper | Yes | Caller-dependent | Caller-dependent | Yes | Medium | Keep server-only and append-only semantics |
| `lib/countries-server.ts` | Country reads | Yes | No | Public read | No | Low | Prefer public/RLS read or cache |
| `lib/locations-server.ts` | Location reads | Yes | No | Public read | No | Low | Prefer public/RLS read or cache |
| `lib/storage/signed-contracts.ts` | Signed contract storage | Yes | Caller-dependent | Caller-dependent | Yes/read | High | Verify caller permissions and document ownership |
| `lib/otp/provider.ts` | OTP hashing provider | No createAdminClient, reads service key as fallback secret | N/A | N/A | No | Medium | Use dedicated `OTP_HASH_SECRET`; avoid service key fallback long term |
| `lib/admin.ts` | Admin session helpers | No service-role; user-scoped client | Yes | `admin_users` active role | No | Medium | Prefer this pattern where RLS allows |

## 9. Critical Checks

### Uses service-role without authenticated user validation

Confirmed:

- `app/api/tap/webhook/route.ts`: public webhook; no user auth. Must use provider signature/idempotency instead.
- `app/api/payments/providers/route.ts`: public read route using service-role.
- Public read pages such as marketplace/studio/product pages use admin client without requiring user auth.
- Cron routes use service-role without browser user auth but are expected to use `CRON_SECRET`.
- Vendor API routes use service-role without browser user auth but use API-key authentication.

Required future action:

- For webhooks, replace user auth with provider authentication.
- For cron, keep strong `CRON_SECRET` and audit logs.
- For vendor API, keep hashed API-key auth, permissions, rate limits, and vendor filters.
- For public reads, prefer public/RLS reads or strict field allowlists.

### Uses service-role without role/permission validation

Highest concern:

- `app/api/tap/webhook/route.ts`: no provider signature permission yet.
- `app/api/payments/providers/route.ts`: public config read must expose only safe fields.
- Some server actions under `app/admin/**` may rely on the admin layout rather than an explicit role check inside the action.

Required future action:

- Add explicit guards inside exported server actions that mutate data.
- Do not rely only on page/layout context for sensitive mutations.

### Accepts client-supplied sensitive IDs or values

Routes observed accepting sensitive input include:

- `app/api/tap/create-charge/route.ts`: `bookingId`, `amount`, `studioId`.
- `app/api/tap/webhook/route.ts`: `id`, `status`, `metadata.booking_id`, `metadata.customer_id`.
- `app/api/checkout/session/route.ts`: `sourceId`, `subtotalAmount`, `currencyCode`, provider/method, URLs.
- `app/api/marketplace/orders/update-status/route.ts`: `orderId`, `itemId`, `status`, `scope`.
- `app/api/admin/payments/manual-refund/route.ts`: `paymentTransactionId`, `amount`, `reason`.
- `app/api/admin/refunds/create/route.ts`: `amount`, source/partner fields.
- `app/api/admin/settlements/update-status/route.ts`: `batchId`, `status`.
- `app/api/payout-requests/create/route.ts`: `requestedAmount`, payout method/details.
- `app/api/vendor/integrations/api-keys/revoke/route.ts`: `keyId`.
- `app/api/v1/vendor/products/route.ts`: product fields, price, stock, category/brand mapping.
- `app/api/v1/vendor/inventory/route.ts`: `sku`, `stock_quantity`, `base_price`.
- `app/api/documents/upload/route.ts`: verification/document/bucket fields.

Rule:

- Never trust these values directly. Use them only as lookup keys after user, role, ownership, and state validation.

### Updates payment, booking, order, payout, refund, admin, profile, or partner status

Highest-priority examples:

- `app/api/tap/webhook/route.ts`
- `app/api/checkout/session/route.ts`
- `app/api/marketplace/checkout/create-order/route.ts`
- `app/api/studios/bookings/create/route.ts`
- `app/api/marketplace/orders/update-status/route.ts`
- `app/api/admin/payments/manual-refund/route.ts`
- `app/api/admin/refunds/create/route.ts`
- `app/api/admin/settlements/update-status/route.ts`
- `app/api/admin/payout-requests/update-status/route.ts`
- `app/admin/bookings/[id]/page.tsx`
- `app/admin/team/page.tsx`
- `app/admin/users/page.tsx`
- `app/portal/studio/studios/[id]/manage/page.tsx`
- `app/portal/store/products/[id]/edit/page.tsx`

Required future action:

- Add audit logging where missing.
- Add role-specific allowlists.
- Define valid state transitions.
- Do not allow payment status changes to replace provider source-of-truth in live mode.

### Can expose private data

Routes/pages/helpers to review:

- `app/api/payments/providers/route.ts`
- `app/api/v1/vendor/orders/route.ts`
- `app/order-confirmation/[id]/page.tsx`
- `app/marketplace/products/[slug]/page.tsx`
- `app/studios/[slug]/page.tsx`
- `lib/storage/provider-documents.ts`
- `app/admin/owner-bank-accounts/page.tsx`
- `app/admin/owner-compliance/page.tsx`
- `app/portal/store/orders/page.tsx`
- `app/portal/studio/bank/page.tsx`

Required future action:

- Minimize selected fields.
- Verify owner/customer/vendor/admin access before private data is selected.
- Use signed URLs only after explicit authorization.

### Can bypass RLS unintentionally

Any `createAdminClient` usage can bypass RLS. Highest concern is where all authorization rests in application code:

- Public webhooks.
- Payment/checkout/session creation.
- Admin finance mutations.
- Partner/studio/vendor portal mutations.
- Document storage.
- Vendor API key routes.
- Public read pages that query private tables for display.

## 10. Risk Categories

### Payment / Tap / checkout sensitive

Critical/High:

- `app/api/tap/webhook/route.ts`
- `app/api/tap/create-charge/route.ts`
- `app/api/checkout/session/route.ts`
- `app/api/marketplace/checkout/create-order/route.ts`
- `app/api/studios/bookings/create/route.ts`
- `app/api/marketplace/orders/update-status/route.ts`
- `app/api/admin/payments/manual-refund/route.ts`
- `app/api/admin/refunds/create/route.ts`
- `app/admin/bookings/[id]/page.tsx`

Primary rule:

- Payment hardening remains separate from general service-role cleanup.

### Admin operations sensitive

High/Medium:

- `app/admin/**`
- `app/api/admin/**`
- `lib/route-guards.ts`
- `app/admin/admin-actions.ts`
- `app/admin/team/page.tsx`
- `app/admin/users/page.tsx`
- `app/admin/owner-bank-accounts/page.tsx`
- `app/admin/owner-compliance/page.tsx`
- `app/admin/studio-payouts/page.tsx`

Primary rule:

- Sensitive mutations should have explicit role guards inside actions/routes, not only inherited layout protection.

### Partner / studio / vendor sensitive

High/Medium:

- `app/portal/studio/**`
- `app/portal/store/**`
- `app/api/portal/studios/availability/update/route.ts`
- `app/api/vendor/**`
- `app/api/v1/vendor/**`
- `lib/vendor-api-auth.ts`
- `app/vendor-signup/actions.ts`

Primary rule:

- Every mutation must validate tenant ownership server-side.

### Customer / profile sensitive

High/Medium:

- `app/account/delete/page.tsx`
- `app/profile/page.tsx`
- `app/customer/**`
- `lib/customer-profile.ts`
- `lib/device-trust.ts`
- `app/api/otp/send/route.ts`
- `app/api/otp/verify/route.ts`

Primary rule:

- Use current authenticated user identity only. Do not accept user identity or role from client body.

### Read-only low risk

Low/Medium:

- `lib/countries-server.ts`
- `lib/locations-server.ts`
- Public marketplace/studio listing reads where fields are intentionally public.
- `app/api/favorites/status/route.ts` if converted to RLS-backed user read.

Primary rule:

- Prefer user-scoped or public RLS reads where possible.

### Legacy / deprecated / unknown risk

- `app/api/checkout/manual-confirm/route.ts`: currently decommissioned and returns `410 Gone`.
- Older docs mention previous manual payment risks; current code reflects the later lock.
- `app/seller/**`: no directory exists.
- `app/partner/**`: public partner pages only; no service-role matches found.

## 11. Required Hardening Rules

1. Prefer user-scoped Supabase client where possible.
2. Use service-role only in server-only routes, server actions, or helpers.
3. Never import `lib/supabase/admin.ts` into client components.
4. Always authenticate user with `auth.getUser` or an equivalent trusted provider/API/cron mechanism.
5. Always validate role and ownership server-side before service-role reads or writes.
6. Never trust `userId`, `role`, `status`, `amount`, `bookingId`, `orderId`, `studioId`, `productId`, `payment_status`, or similar sensitive values from client body.
7. Use allowlisted operations per role.
8. Add audit logging for sensitive mutations.
9. Add idempotency for financial, webhook, order, booking, and external API operations.
10. Keep payment/Tap hardening separate from general service-role cleanup.
11. Keep admin team/user/payment/payout/refund changes restricted to explicit admin sub-roles.
12. Keep partner/studio/vendor changes tenant-scoped by verified ownership.
13. Keep public read routes field-minimized and cacheable where appropriate.
14. Do not expose private storage documents without signed URL authorization.
15. Add tests and smoke checks before production enablement.

## 12. Future Patch Sequence

### Patch 135E - metadataBase + `.env.example` Alignment

Purpose:

- Align production metadata base and documented env placeholders.
- Include Tap/OTP variables safely without activating live payment.

### Patch 136A - Dependency Security Patch 1, if approved

Purpose:

- Address highest-priority dependency advisories from Patch 135B.
- Keep dependency changes separate from service-role and payment logic.

### Patch 137A - Tap Route Lockdown / Disable Unsafe Live Paths

Purpose:

- Explicitly block or gate unsafe Tap live routes before live credentials can do harm.

### Patch 138A - Service Role Hardening Pack 1: Critical Payment/Admin Routes

Purpose:

- Harden the highest-risk service-role routes:
  - Tap/payment/checkout.
  - Admin booking/payment/refund/payout/team/user mutations.
  - Explicit guards inside sensitive server actions.

### Patch 138B - Service Role Hardening Pack 2: Partner/Customer Routes

Purpose:

- Harden owner/studio/vendor/customer/account/profile/document paths.
- Convert low-risk routes to user-scoped clients where RLS is ready.

### Patch 138C - Service Role QA / Closeout Gate

Purpose:

- Verify all critical routes.
- Confirm audit logs.
- Confirm no unintended RLS bypasses.
- Produce final GO/NOT GO for broader partner/admin production access.

## 13. Explicitly Blocked in This Patch

The following were blocked and were not performed:

- No service-role code changes.
- No auth logic changes.
- No API route rewrites.
- No SQL.
- No RLS changes.
- No database changes.
- No Supabase commands.
- No environment changes.
- No dependency updates.
- No payment changes.
- No package changes.
- No app code changes.
- No production permission claims.
- No commercial launch decision.

## 14. Required Verification for This Patch

Expected changed file:

- `docs/GEARBEAT_PATCH_135D_SERVICE_ROLE_ROUTE_BY_ROUTE_AUDIT.md`

Expected unchanged areas:

- `app/api/**`
- Auth logic
- Service-role/admin client helpers
- Payment logic
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

## 15. Final Verdict

### GO

GO for service-role hardening planning.

Patch 135D may be committed as a documentation-only audit that maps the current service-role blast radius and defines the next hardening sequence.

### NOT GO

NOT GO for commercial launch.

NOT GO for live payments.

NOT GO for broad admin/partner production access until the critical payment/admin/partner/customer hardening sequence is complete.
