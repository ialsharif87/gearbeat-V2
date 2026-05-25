# GearBeat Patch 136B - Supabase Dependency Compatibility & Security Remediation Plan

## Patch status

Patch 136B is a documentation-only Supabase dependency compatibility and security remediation plan.

No dependencies were updated in this patch. No package files, app code, API routes, auth logic, payment logic, Supabase helpers, SQL, environment files, middleware, routing, mobile files, or business logic were changed.

This patch follows Patch 136A, which updated only Next.js to `15.5.18` and left Supabase remediation for a separate scoped patch.

## Commands run

Inspection commands:

```txt
npm.cmd audit
npm.cmd outdated
npm.cmd ls @supabase/supabase-js
npm.cmd ls @supabase/auth-js
npm.cmd ls @supabase/ssr
git grep -n "@supabase/supabase-js" -- app lib components middleware.ts
git grep -n "@supabase/ssr" -- app lib components middleware.ts
git grep -n "createClient" -- app lib middleware.ts
git grep -n "createServerClient" -- app lib middleware.ts
git grep -n "auth.getUser" -- app lib middleware.ts
npm.cmd run typecheck
```

Additional read-only inspection:

```txt
git grep -n "createAdminClient" -- app lib middleware.ts
rg -n "signInWith|signUp|signOut|resetPasswordForEmail|updateUser|verifyOtp|exchangeCodeForSession" app lib components middleware.ts
```

## Current Supabase package versions

Installed package tree:

```txt
@supabase/supabase-js@2.49.4
@supabase/auth-js@2.69.1
@supabase/ssr@0.6.1
```

`@supabase/auth-js` is not a direct dependency in `package.json`. It is transitive through `@supabase/supabase-js`.

`@supabase/ssr@0.6.1` depends on and dedupes to the root `@supabase/supabase-js@2.49.4`.

## Current Supabase audit finding

`npm.cmd audit` still exits with findings after Patch 136A.

Overall audit summary:

```txt
12 vulnerabilities (4 low, 8 moderate)
```

Supabase-related finding:

```txt
@supabase/auth-js <=2.69.1
auth-js Vulnerable to Insecure Path Routing from Malformed User Input
https://github.com/advisories/GHSA-8r88-6cj9-9fh5
```

Audit path:

```txt
@supabase/supabase-js 2.41.1 - 2.49.10 || 2.58.1-canary.0
Depends on vulnerable versions of @supabase/auth-js
```

npm suggested force path:

```txt
Will install @supabase/supabase-js@2.106.2, which is outside the stated dependency range
```

Interpretation:

- The vulnerable package is transitive.
- The direct remediation target is `@supabase/supabase-js`.
- Because the app also uses `@supabase/ssr`, Supabase remediation should be treated as a package-group compatibility update, not a lockfile-only tweak.
- Do not use `npm audit fix --force`.

## Current Supabase outdated findings

`npm.cmd outdated` Supabase rows:

```txt
Package                 Current  Wanted  Latest
@supabase/ssr             0.6.1   0.6.1  0.10.3
@supabase/supabase-js    2.49.4  2.49.4  2.106.2
```

Interpretation:

- `package.json` pins both Supabase packages, so `Wanted` remains the current version.
- Latest available package versions are materially newer.
- A future update must intentionally change `package.json` and `package-lock.json`.

## Supabase client inventory

### Browser client

Helper:

```txt
lib/supabase/client.ts
```

Implementation:

- Imports `createBrowserClient` from `@supabase/ssr`.
- Uses `NEXT_PUBLIC_SUPABASE_URL`.
- Uses `NEXT_PUBLIC_SUPABASE_ANON_KEY`.

Observed browser-client import/use footprint:

```txt
29 files
```

Representative areas:

- `app/login/page.tsx`
- `app/(admin-auth)/admin/login/page.tsx`
- `app/portal/login/page.tsx`
- `app/signup/SignupClient.tsx`
- `app/studio-owner/signup/StudioOwnerSignupClient.tsx`
- `app/auth/confirm/AuthConfirmClient.tsx`
- `app/forgot-password/page.tsx`
- `app/update-password/page.tsx`
- `app/portal/update-password/page.tsx`
- `app/portal/first-login/page.tsx`
- `app/portal/store/onboarding/page.tsx`
- `app/portal/studio/onboarding/page.tsx`
- `components/login-form.tsx`
- `components/signup-form.tsx`
- `components/site-header.tsx`
- `components/logout-button.tsx`
- `components/phone-verification-manager.tsx`

Auth methods observed:

- `signInWithPassword`
- `signInWithOtp`
- `verifyOtp`
- `signUp`
- `signOut`
- `resetPasswordForEmail`
- `exchangeCodeForSession`
- `updateUser`

### Server client

Helper:

```txt
lib/supabase/server.ts
```

Implementation:

- Imports `createServerClient` from `@supabase/ssr`.
- Uses `next/headers` `cookies()`.
- Implements `getAll()` and `setAll()` cookie handlers.
- Catches cookie set failures in Server Components.

Observed server-client import/use footprint:

```txt
112 files
```

Representative areas:

- `app/layout.tsx`
- `app/account/delete/page.tsx`
- `app/customer/**`
- `app/admin/**`
- `app/portal/**`
- `app/marketplace/**`
- `app/studios/**`
- `app/api/**`
- `lib/actions.ts`
- `lib/route-guards.ts`
- `lib/auth-guards.ts`
- `lib/profile-completion.ts`
- `lib/storage/provider-documents.ts`

### Admin / service-role client

Helper:

```txt
lib/supabase/admin.ts
```

Implementation:

- Imports `server-only`.
- Imports `createClient` from `@supabase/supabase-js`.
- Reads `NEXT_PUBLIC_SUPABASE_URL`.
- Reads `SUPABASE_SERVICE_ROLE_KEY`.
- Sets `auth.autoRefreshToken: false`.
- Sets `auth.persistSession: false`.
- Throws if used in a browser context.

Observed files mentioning `createAdminClient`:

```txt
90 files
```

Patch 135D remains the authoritative service-role route-by-route audit. Its key count was:

```txt
148 runtime createAdminClient() call sites
88 files with runtime createAdminClient() calls
247 textual createAdminClient matches across 90 files
```

Highest-risk service-role areas from Patch 135D:

- `app/api/tap/webhook/route.ts`
- `app/api/checkout/session/route.ts`
- `app/api/marketplace/checkout/create-order/route.ts`
- `app/api/studios/bookings/create/route.ts`
- `app/api/marketplace/orders/update-status/route.ts`
- `app/api/admin/payments/manual-refund/route.ts`
- `app/api/documents/upload/route.ts`
- `app/api/v1/vendor/**`
- `app/api/vendor/**`
- `app/admin/**`
- `app/portal/store/**`
- `app/portal/studio/**`

### Middleware / session logic

Files:

```txt
middleware.ts
lib/supabase/middleware.ts
```

Implementation:

- `middleware.ts` delegates session refresh to `updateSession(request)`.
- `lib/supabase/middleware.ts` imports `createServerClient` from `@supabase/ssr`.
- Uses request/response cookie bridging with `getAll()` and `setAll()`.
- Calls `supabase.auth.getUser()` during middleware.
- Preserves refreshed cookies through subdomain-root redirects.

Observed `createServerClient` usage:

```txt
lib/supabase/middleware.ts
lib/supabase/server.ts
```

### Auth routes and pages

High-impact auth areas:

- `app/login/page.tsx`
- `app/(admin-auth)/admin/login/page.tsx`
- `app/portal/login/page.tsx`
- `app/signup/SignupClient.tsx`
- `app/studio-owner/signup/StudioOwnerSignupClient.tsx`
- `app/vendor-signup/actions.ts`
- `app/auth/confirm/AuthConfirmClient.tsx`
- `app/forgot-password/page.tsx`
- `app/update-password/page.tsx`
- `app/portal/update-password/page.tsx`
- `app/portal/first-login/page.tsx`
- `components/login-form.tsx`
- `components/signup-form.tsx`
- `components/phone-verification-manager.tsx`

### API routes

API routes use a mix of:

- User-scoped server client from `lib/supabase/server.ts`.
- Admin/service-role client from `lib/supabase/admin.ts`.
- `auth.getUser()` for request identity.
- API-key authentication for vendor API routes.
- Cron-secret checks for cron-like routes.
- Provider/webhook style routes for payment integrations.

Representative API areas:

- `app/api/customer/**`
- `app/api/marketplace/**`
- `app/api/studios/**`
- `app/api/portal/**`
- `app/api/vendor/**`
- `app/api/v1/vendor/**`
- `app/api/admin/**`
- `app/api/otp/**`
- `app/api/tap/**`
- `app/api/checkout/**`
- `app/api/reviews/**`

Observed files calling `auth.getUser`:

```txt
84 files
```

## Compatibility risk analysis

### Auth/session behavior risk

Risk: High.

GearBeat relies heavily on Supabase auth methods across customer, admin, portal, studio owner, vendor signup, OTP, password reset, and profile repair flows. Any change in auth response shape, OTP behavior, email redirect behavior, or token/session persistence can break login or onboarding.

### Cookie/session middleware risk

Risk: High.

`@supabase/ssr` is used in both `lib/supabase/server.ts` and `lib/supabase/middleware.ts`. GearBeat middleware refreshes sessions for all matched routes and preserves cookies through subdomain-root redirects. Updating `@supabase/ssr` must verify cookie get/set behavior, refreshed sessions, and redirects.

### Server/client import risk

Risk: Medium.

The project has clear helper boundaries:

- Browser client: `lib/supabase/client.ts`
- Server user-scoped client: `lib/supabase/server.ts`
- Admin client: `lib/supabase/admin.ts`

Future updates must confirm these helpers still compile and are not accidentally imported into client bundles. `lib/supabase/admin.ts` uses `server-only`, which should remain.

### Service-role/admin client risk

Risk: High.

`createAdminClient` uses `@supabase/supabase-js` directly with the service-role key. Updating `supabase-js` can affect query typing, auth admin methods, storage methods, and PostgREST behavior. Because 135D found broad service-role usage, this must be verified carefully.

### RLS/auth boundary risk

Risk: High.

Many routes intentionally use user-scoped clients while many others use service-role clients with application-level guards. A dependency update must not be treated as security hardening by itself. It only remediates the package advisory; route-level RLS/auth hardening remains a separate 138-series task.

### Customer/studio/seller/admin login risk

Risk: High.

Separate login surfaces must be tested:

- Customer login and signup.
- Admin login and admin eligibility checks.
- Portal login.
- Studio owner onboarding and first-login flows.
- Vendor/seller signup and portal store access.
- OTP and password reset.

## Recommended safe update strategy

### Package group

Recommendation: GO for a future scoped Supabase package-group update, not a lockfile-only update.

Update these packages together:

```txt
@supabase/supabase-js
@supabase/ssr
```

Reasoning:

- `@supabase/auth-js` is transitive, not direct.
- `@supabase/supabase-js` is the direct dependency that pulls `@supabase/auth-js`.
- `@supabase/ssr` depends on `@supabase/supabase-js` and owns the browser/server/middleware helper APIs used by GearBeat.
- Keeping `@supabase/ssr@0.6.1` while forcing a much newer `supabase-js` may work, but it is a less clean compatibility posture for session/cookie helpers.

### Lockfile-only remediation

Recommendation: Do not use lockfile-only remediation.

Reasons:

- `package.json` pins `@supabase/supabase-js` to `2.49.4`.
- `package.json` pins `@supabase/ssr` to `0.6.1`.
- Lockfile-only changes can be fragile and can be undone by future installs.
- The audit suggests a direct package-range move to remediate `auth-js`.

### Exact future install command if approved

Use a targeted install only:

```txt
npm.cmd install @supabase/supabase-js@2.106.2 @supabase/ssr@0.10.3 --save-exact
```

Do not run:

```txt
npm.cmd audit fix
npm.cmd audit fix --force
npm.cmd update
```

### Future implementation patch boundaries

Recommended patch:

```txt
136C Supabase Security Patch Implementation
```

Expected files to change in 136C if the install compiles cleanly:

```txt
package.json
package-lock.json
docs/GEARBEAT_PATCH_136C_SUPABASE_SECURITY_PATCH_IMPLEMENTATION.md
```

Not expected to change in 136C unless the dependency update fails typecheck and the user explicitly approves a compatibility fix:

```txt
lib/supabase/client.ts
lib/supabase/server.ts
lib/supabase/middleware.ts
lib/supabase/admin.ts
middleware.ts
app/**
```

If a helper API change is required, stop and report before broadening scope.

## Required smoke tests after any future Supabase update

Minimum manual/browser smoke test matrix:

1. Customer signup.
2. Customer login with password.
3. Customer OTP login if enabled for the environment.
4. Customer logout.
5. Password reset request.
6. Password reset callback/update.
7. Auth confirmation callback.
8. Admin login.
9. Admin unauthorized-user rejection.
10. Portal login.
11. Seller/vendor login or portal store access.
12. Studio owner login.
13. Studio owner first-login/onboarding.
14. Profile load.
15. Profile save/update.
16. Customer dashboard pages.
17. Customer bookings page.
18. Studio owner portal access.
19. Store/vendor portal access.
20. API session-protected route check with a signed-in user.
21. API session-protected route check without a signed-in user.
22. Middleware session refresh across a protected route.
23. Subdomain/root redirect cookie preservation.
24. Admin route access after session refresh.
25. Portal route access after session refresh.

Required command verification for 136C:

```txt
npm.cmd ls @supabase/supabase-js
npm.cmd ls @supabase/auth-js
npm.cmd ls @supabase/ssr
npm.cmd audit
npm.cmd outdated
npm.cmd run typecheck
npm.cmd run lint
npm.cmd run build
git status --short
git diff --name-only
```

## Final verdict

GO for a future Supabase package update, but only as a scoped implementation patch with strong verification.

Recommended future patch:

```txt
136C Supabase Security Patch Implementation
```

Exact package group to update:

```txt
@supabase/supabase-js
@supabase/ssr
```

Exact future install command:

```txt
npm.cmd install @supabase/supabase-js@2.106.2 @supabase/ssr@0.10.3 --save-exact
```

Rollback command pattern:

```txt
git revert <commit_hash>
```

Important limits:

- This GO is not a GO for commercial launch.
- This GO is not a GO for live payments.
- This GO is not a replacement for Patch 135D service-role hardening.
- This GO is not a replacement for Tap/payment hardening.

## Patch 136B verification

Results:

- `npm.cmd run typecheck`: passed.

Expected changed file:

```txt
docs/GEARBEAT_PATCH_136B_SUPABASE_DEPENDENCY_COMPATIBILITY_SECURITY_REMEDIATION_PLAN.md
```

Confirmed unchanged by this patch:

- `package.json`
- `package-lock.json`
- App code
- API routes
- Auth logic
- Payment logic
- Supabase client helpers
- Database migrations
- `.env`
- `.env.example`
- Middleware
- Mobile files
- Dependencies
