# GEARBEAT PATCH 126E - ADMIN LOGIN LOOP STABILIZATION FIX

## Root Cause Found

Production `/admin/login` was defined at `app/admin/login/page.tsx`, which placed the login page inside `app/admin/layout.tsx`.

That admin layout calls `requireAdminLayoutAccess()` before rendering its children. For an unauthenticated visitor, the guard redirects to `/admin/login`. Because `/admin/login` was itself inside the protected admin layout, the page redirected back to itself before the login form could complete normally. This created the observed loading/spinning login loop.

A second admin-login weakness was also corrected: the client login page queried `admin_users` directly from the browser Supabase client after password sign-in. The protected admin app already uses server-side service-role access for admin checks, so the login check now uses the same safe server-side pattern through an internal route handler. This avoids exposing service-role keys to the client and avoids relying on client-side RLS visibility for `admin_users`.

## Files Changed

- `app/(admin-auth)/admin/login/page.tsx`
- `app/api/admin/login-check/route.ts`
- `app/admin/account-registry/page.tsx`
- `lib/route-guards.ts`
- `docs/GEARBEAT_PATCH_126E_ADMIN_LOGIN_LOOP_STABILIZATION_FIX.md`

## Final Admin Login Behavior

- `/admin/login` remains the final admin login URL.
- `/admin/login` is now outside the protected `app/admin/layout.tsx` branch, so it can render for unauthenticated users.
- Password sign-in still uses Supabase Auth from the browser client.
- The admin authorization check runs server-side at `/api/admin/login-check`.
- Loading state is cleared in a `finally` block for success, failure, and timeout paths.
- Sign-in and admin-check operations have timeout guards so the button cannot spin forever on a stalled request.
- Admin users with an active `admin_users` row are routed to `/admin`.
- Failed admin checks show user-safe messages and log only safe technical context through `console.warn`.
- Secrets, tokens, passwords, and service-role keys are not logged.

## Supported Admin Role Values

Patch 126E supports active `admin_users` records with these `admin_role` values:

- `admin`
- `super_admin`
- `operations`
- `support`
- `content`
- `sales`
- `finance`

The legacy/default `admin` value is included because the migrations define `admin_role text DEFAULT 'admin'`.

## Non-Admin Handling

- A signed-in user without an active `admin_users` row receives a clear access-denied message.
- The unauthorized session is signed out after a 401/403 admin-check failure.
- Customer, studio owner, and vendor users are not promoted into admin routes.
- `/admin` pages remain protected by `requireAdminLayoutAccess()`.
- `/staff-access` continues to redirect to `/admin/login`.
- No public admin signup was added.

## RLS And Schema Migration Decision

No schema migration is needed.

The expected columns were confirmed from existing migrations:

- `admin_users.auth_user_id`
- `admin_users.email`
- `admin_users.full_name`
- `admin_users.role`
- `admin_users.admin_role`
- `admin_users.status`
- `profiles.auth_user_id`
- `profiles.email`
- `profiles.full_name`
- `profiles.phone`
- `profiles.role`
- `profiles.account_status`

The browser client no longer performs the `admin_users` authorization check. The check now runs server-side with the existing `createAdminClient()` pattern, so no RLS weakening or unsafe bypass was added.

## Production Smoke Test Checklist

- Visit `/admin/login` while signed out and confirm the login form renders without a loop.
- Sign in with an active `admin_users` account and confirm redirect to `/admin`.
- Sign in with a non-admin customer account and confirm a clear access-denied message.
- Confirm non-admin users cannot visit `/admin` directly.
- Confirm `/staff-access` redirects to `/admin/login`.
- Confirm `/admin/account-registry` is accessible only after admin authentication.
- Confirm browser console warnings do not contain secrets, tokens, or passwords.

## Safety Confirmations

- No users were deleted.
- No users were created.
- No passwords were stored.
- No SQL writes were executed.
- No Supabase `db push` was executed.
- No migration files were changed.
- No payment, rewards, wallet, referral, booking, marketplace order, or payment logic was changed.
