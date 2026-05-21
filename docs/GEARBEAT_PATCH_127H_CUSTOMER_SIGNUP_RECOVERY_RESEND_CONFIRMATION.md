# GearBeat Patch 127H - Customer Signup Recovery + Resend Confirmation

## Scope

Patch 127H is customer signup/login recovery only.

No studio owner, seller, partner portal, admin, subdomain routing, payment, booking, marketplace, database schema, Supabase settings, or email template changes were made.

## Root Cause

The customer signup path could create a Supabase auth account and show a clean check-email state, but there was no customer-facing recovery path if the confirmation email was delayed, filtered, expired, or consumed. Customers could also retry signup with the same email and receive a confusing existing-account error instead of a safe confirmation resend option.

## Resend Confirmation Implementation

Customer signup and customer login now expose a resend confirmation action.

The resend action uses the browser Supabase client:

`supabase.auth.resend({ type: "signup", email, options: { emailRedirectTo } })`

The redirect target is the existing scanner-safe confirmation route:

`/auth/confirm`

The resolved runtime URL is:

`${window.location.origin}/auth/confirm`

## Signup Behavior

On successful signup, the page continues to show:

- Arabic: `تم إنشاء حسابك. تحقق من بريدك الإلكتروني لتفعيل الحساب.`
- English: `Your account was created. Please check your email to activate it.`

The signup success screen shows a short waiting state first, then offers:

- Arabic button: `إعادة إرسال رابط التفعيل`
- English button: `Resend confirmation email`

The signup flow still signs out any immediate Supabase session returned by `signUp`, so customers are not treated as fully logged in before confirmation.

## Existing Account Behavior

If Supabase reports that the email is already registered, or returns an existing-account style signup result, the signup page now shows:

- Arabic: `يوجد حساب بهذا البريد. إذا لم يتم التفعيل، أعد إرسال رابط التفعيل أو سجل الدخول.`
- English: `An account already exists with this email. If it is not confirmed, resend the confirmation link or sign in.`

The same panel includes a resend confirmation button and a sign-in link. Raw Supabase error text is not shown to the customer.

## Login Recovery Behavior

The login page now offers resend confirmation when:

- The URL contains `confirmation_error=1`.
- The URL contains a supported expired confirmation state.
- Supabase blocks password or OTP login with an email-not-confirmed style auth error.
- A customer enters an email and requests a new activation email.

Failure to resend is logged with `console.warn` using safe technical details only. No secrets or tokens are logged.

## Confirmation Flow Preservation

Patch 127G scanner-safe behavior is preserved:

- `/auth/confirm` does not auto-verify `token_hash` on page load.
- `verifyOtp` only runs after the customer clicks the confirm-email button.
- Successful confirmation still ensures the customer profile server-side and redirects to `/login?confirmed=1`.

## Profile Safety

No browser-side profile insert or upsert was added.

Customer profile creation/repair remains server-side through:

`/api/customer/profile/ensure`

## Test Checklist

1. Customer signup submits and shows the check-email state.
2. Signup check-email state offers resend confirmation after the short delay.
3. Resend confirmation uses `/auth/confirm` as the redirect target.
4. Signup retry with an existing email shows the safe existing-account recovery message.
5. Login invalid/expired confirmation state shows a resend option.
6. Login still routes confirmed customers normally.
7. Normal customer signup/login does not show profile repair unless server-side profile ensure cannot recover the account.

## Safety Confirmation

- No SQL was executed.
- No Supabase db push was executed.
- No `.env` files were changed.
- No auth schema changes were made.
- No email templates were changed from code.
- No users were deleted.
- No service-role key was exposed to the client.
- No admin, partner, studio owner, seller, payment, booking, marketplace, or subdomain routing changes were made.
