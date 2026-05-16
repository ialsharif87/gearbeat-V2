# Patch 108B — Auth Signup Password + Phone OTP + Email Verification Flow

## Objective
Refactor the GearBeat registration process to enforce email-and-password-based signup, implement a robust post-registration verification flow (Email Link + Phone SMS OTP), and align the dashboard and profile UI with the new verification status model.

## Changes

### 1. Signup Flow Overhaul (`app/signup/SignupClient.tsx`)
- **Enforced Password Mode**: Removed support for magic-link/OTP-first signup. All new users must provide a full name, email, phone number, and password.
- **Verification Guidance UI**: Replaced the immediate "success" redirect with a multi-step verification instruction screen.
- **Email Verification**: Instructs users to check their inbox for the Supabase-generated confirmation link.
- **Phone Verification Prep**: Informs users that phone verification via SMS OTP will be required after email activation and login.

### 2. Verification Status Integration
- **Auth Guards (`lib/auth-guards.ts`)**: Extended the standard User type to include `email_confirmed_at`, `phone_confirmed_at`, and `phone` fields, enabling server-side verification checks.
- **Customer Dashboard (`app/customer/page.tsx`)**: Updated to display verification badges based on actual Supabase auth status. Integrated the `PhoneVerificationManager` component.
- **Studio Dashboard (`app/portal/studio/page.tsx` & `components/studio-dashboard-view.tsx`)**: Passed the auth user object to the dashboard view and added a verification status card in the sidebar.
- **Profile Page (`app/profile/page.tsx`)**: Added verification badges next to Email and Phone fields. Integrated `PhoneVerificationManager`.

### 3. Phone Verification Manager (`components/phone-verification-manager.tsx`)
- Created a reusable client component that handles the SMS OTP flow using `supabase.auth.updateUser({ phone })` and `supabase.auth.verifyOtp({ type: 'phone_change' })`.
- Includes cooldown timers, error handling, and bilingual support.
- Note: Requires SMS provider configuration (Twilio/Vonage) in the Supabase project dashboard to function in production.

## Verification Checklist
- [x] Signup requires password.
- [x] Post-signup UI shows email verification instructions.
- [x] Dashboard shows verification status from Auth User object.
- [x] Profile page shows verification status.
- [x] Phone OTP component implemented and integrated.
- [x] Bilingual consistency maintained.
- [x] Linting and Typechecking passed.

## Technical Notes
- **Supabase Configuration**: Ensure that "Confirm Email" is enabled in Supabase Auth settings.
- **Redirection**: Signup uses `emailRedirectTo: /auth/callback`. Ensure this route is correctly handling the confirmation tokens.
- **Profile Table**: Profile creation still occurs immediately upon signup to ensure data persistence, but full access to certain features can now be gated by `email_confirmed_at` and `phone_confirmed_at`.
