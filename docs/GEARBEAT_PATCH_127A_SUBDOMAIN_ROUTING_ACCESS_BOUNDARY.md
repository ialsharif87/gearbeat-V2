# GearBeat Patch 127A: Subdomain Routing & Access Boundary Foundation

## Objective

Add a safe, centralized host-based routing foundation so configured subdomains map to the correct root experience without changing auth schema, OTP flow, payment logic, or database behavior.

## Implemented Subdomain Map

- `admin.gearbeat.app` -> `/admin`
- `partners.gearbeat.app` -> `/partners/apply`
- `portal.gearbeat.app` -> `/portal/studio`
- `seller.gearbeat.app` -> `/portal/store`
- `gearbeat.app` remains the public/customer site

## Files Changed

- `lib/subdomain-routing.ts` (new)
- `middleware.ts` (updated)

## What Was Added

### 1) Central map and domain constants

Created `lib/subdomain-routing.ts` with:

- Public/customer domain constant
- Admin domain constant
- Partners application domain constant
- Studio portal domain constant
- Seller portal domain constant
- Central `SUBDOMAIN_ROOT_ROUTE_MAP`

### 2) Access-boundary comments

Added explicit comments in the new map file to mark domain intent:

- `partners.gearbeat.app` is intake-only
- `portal.gearbeat.app` is approved studio owner portal only
- `seller.gearbeat.app` is approved seller portal only
- `admin.gearbeat.app` is internal admin only

### 3) Minimal middleware host-root rewrite

Updated `middleware.ts` to apply only for root path (`/`) requests:

- `admin.gearbeat.app /` rewrites to `/admin`
- `partners.gearbeat.app /` rewrites to `/partners/apply`
- `portal.gearbeat.app /` rewrites to `/portal/studio`
- `seller.gearbeat.app /` rewrites to `/portal/store`

For non-root routes, middleware behavior remains unchanged.

## Local Development Safety

Local hosts are excluded from rewrite behavior:

- `localhost`
- `127.0.0.1`
- `0.0.0.0`
- `::1`
- `*.localhost`

This preserves direct local route usage such as:

- `/admin`
- `/partners/apply`
- `/portal/studio`
- `/portal/store`
- `/login`
- `/portal/login`

## Session/Cookie Handling

Middleware still runs Supabase session refresh logic (`updateSession`) and preserves cookies when a rewrite occurs.

## Not Changed (By Design)

- No OTP/login/signup flow changes
- No auth schema changes
- No SQL changes
- No Supabase db push
- No `.env` changes
- No payment/rewards/wallet/referral/order logic changes
- No account status or admin lead approval logic changes

