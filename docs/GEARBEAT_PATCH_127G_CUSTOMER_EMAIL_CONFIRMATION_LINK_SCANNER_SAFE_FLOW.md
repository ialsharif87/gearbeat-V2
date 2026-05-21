# GearBeat Patch 127G - Customer Email Confirmation Link Scanner Safe Flow

## Scope

Patch 127G is customer email confirmation only.

No studio owner, seller, partner portal, admin, subdomain routing, payment, booking, marketplace, database schema, Supabase settings, or email template changes were made.

## Root Cause

Patch 127F supported `token_hash` confirmation links, but it verified `token_hash` immediately on page load. Email scanners and safe-link preview tools can visit the link before the customer opens it, which can consume the one-time token and leave the customer seeing an expired/invalid message.

## Confirmation Route Behavior

Canonical customer confirmation route:

`/auth/confirm?token_hash={{ .TokenHash }}&type=email`

Compatible fallback route:

`/auth/callback`

## Scanner-Safe Token Flow

When `/auth/confirm` receives `token_hash` and `type`, it now renders a confirmation page first and does not call `supabase.auth.verifyOtp` on page load.

The user must click:

- `تأكيد البريد الإلكتروني`
- `Confirm email`

Only that button click calls `verifyOtp`.

## Existing Format Support

The confirmation client still supports:

- `?code=...` with `exchangeCodeForSession`
- URL hash session fragments with `access_token` and `refresh_token`
- Existing active session fallback

## Success Behavior

After successful confirmation:

1. The customer profile ensure endpoint runs: `/api/customer/profile/ensure`.
2. The temporary confirmation session is signed out.
3. The customer is redirected to `/login?confirmed=1`.

## Failure Behavior

If confirmation fails, the customer sees:

- Arabic: `انتهت صلاحية رابط التأكيد. اطلب كود دخول جديد أو أعد إنشاء الحساب إذا لم يكتمل التسجيل.`
- English: `The confirmation link expired. Request a new login code or sign up again if registration was not completed.`

## Safety Confirmation

- No SQL was executed.
- No Supabase db push was executed.
- No `.env` files were changed.
- No auth schema changes were made.
- No email templates were changed from code.
- No admin, partner, studio owner, seller, payment, booking, marketplace, or subdomain routing changes were made.
