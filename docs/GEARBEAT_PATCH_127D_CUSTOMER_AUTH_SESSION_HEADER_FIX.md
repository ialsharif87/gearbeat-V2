# GearBeat Patch 127D - Customer Auth Session + Header State Fix

## Scope

Patch 127D is customer-auth UI stabilization only.

No studio owner, seller, partner portal, admin approval, subdomain routing, payment, database schema, Supabase settings, OTP, or email template behavior was changed.

## Root Cause

The public header received `isLoggedIn` from the server layout and rendered from that static value only. Customer auth events that happened in the browser could therefore leave the header showing `Create Account` and `Sign In` until a fresh server render caught up.

Customer signup also accepted Supabase's returned session as-is. If Supabase returned a session immediately after `signUp`, the browser could behave as authenticated even though the visible customer journey should continue to the email confirmation state.

## Files Changed

- `components/site-header.tsx`
- `app/signup/SignupClient.tsx`
- `docs/GEARBEAT_PATCH_127D_CUSTOMER_AUTH_SESSION_HEADER_FIX.md`

## Final Customer Header Behavior

- Unauthenticated visitors see `Create Account` and `Sign In`.
- Authenticated customers do not see `Create Account` or `Sign In`.
- Authenticated customers see customer-safe account actions:
  - Customer Dashboard
  - My Account
  - Logout
- The header listens to Supabase client auth state changes and updates without waiting for a full server refresh.
- Profile lookup failures are logged with safe `console.warn` messages only. No secrets or tokens are logged.

## Final Customer Signup Behavior

- Customer signup still creates the customer profile using the existing customer profile path.
- After signup, the page shows a check-email confirmation state.
- If Supabase returns an immediate session, the client signs out before showing the check-email state so signup does not behave like a completed verified login.
- No Supabase dashboard settings or email templates were changed.

## Testing Checklist

1. Visit the public homepage while signed out and confirm `Create Account` and `Sign In` are visible.
2. Log in as a customer and confirm the public header hides signup/login.
3. Confirm the authenticated customer menu shows Customer Dashboard, My Account, and Logout.
4. Submit customer signup and confirm the page stays on the check-email state.
5. Confirm customer signup does not redirect directly to the dashboard as a completed verified login.
6. Confirm customer login still routes normally after successful authentication.

## Safety Confirmation

- No SQL was executed.
- No Supabase db push was executed.
- No `.env` files were changed.
- No auth schema changes were made.
- No email template changes were made.
- No OTP logic was changed.
- No admin, partner, studio owner, seller, or payment flows were changed.
