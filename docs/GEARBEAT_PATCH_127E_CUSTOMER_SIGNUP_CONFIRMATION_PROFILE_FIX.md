# GearBeat Patch 127E - Customer Signup Confirmation + Profile Completion Fix

## Scope

Patch 127E fixes the customer signup, confirmation, login, and profile fallback journey only.

It does not change studio owner signup, seller flow, partner application, admin approval, portal login, seller login, OTP validation, subdomain routing, payment logic, Supabase schema, Supabase settings, or email templates.

## Root Cause

Customer signup created the Supabase Auth user, then immediately attempted to create a `profiles` row from the browser. The current `profiles` RLS foundation has public SELECT and authenticated UPDATE, but no client INSERT policy. When email confirmation is enabled, signup also may not have an authenticated session yet. That made the profile insert fail and surfaced a scary red support error even though the Auth account and confirmation email were created.

The signup confirmation URL pointed to `/auth/callback`, but the app had no `app/auth/callback` route, so the confirmation link landed on a 404.

Login routed users without a profile directly to `/profile/repair`. Because the normal signup profile insert could fail before email confirmation, standard customers could land in a recovery flow after confirming or logging in.

## Files Changed

- `app/signup/SignupClient.tsx`
- `app/login/page.tsx`
- `app/profile/repair/ProfileRepairClient.tsx`
- `app/auth/callback/route.ts`
- `app/api/customer/profile/ensure/route.ts`
- `lib/customer-profile.ts`
- `docs/GEARBEAT_PATCH_127E_CUSTOMER_SIGNUP_CONFIRMATION_PROFILE_FIX.md`

## Confirmation Callback Route

Customer signup continues to use:

`/auth/callback`

The new callback route exchanges the Supabase confirmation code, safely attempts customer profile creation from signup metadata, and redirects to:

`/login?confirmed=1`

If the callback is invalid or expired, it redirects to:

`/login?confirmation_error=1`

## Customer Profile Creation

Customer signup now stores enough Auth metadata to repair the profile after confirmation:

- full name
- email
- phone / E.164 phone
- country code
- phone country code
- account type `customer`
- preferred currency
- preferred language

Browser-side profile creation remains best-effort only. If RLS or missing session blocks it, signup still shows the clean check-email state.

The server-only customer profile ensure path uses the existing server admin-client pattern without exposing service role keys to the browser. It only upserts the currently authenticated user's own customer profile and refuses admin/vendor/non-customer accounts.

## Final Customer Journey

1. Customer submits `/signup`.
2. Auth account is created.
3. Profile creation is attempted but no scary error is shown if deferred.
4. Customer sees: `Your account was created. Please check your email to activate it.`
5. Email confirmation link opens `/auth/callback`, not a 404.
6. Callback exchanges the code and attempts customer profile repair.
7. Login and profile repair both try automatic customer profile repair before showing manual repair.
8. Normal customers route to `/customer`.
9. Header behavior from Patch 127D is preserved.

## Manual Repair Fallback

The manual profile repair page is now reserved for cases where automatic repair fails or required customer metadata is missing.

## Safety Confirmation

- No SQL was executed.
- No Supabase db push was executed.
- No `.env` files were changed.
- No auth schema changes were made.
- No email template changes were made.
- No OTP logic was changed.
- No admin, partner, studio owner, seller, subdomain routing, or payment flows were changed.
