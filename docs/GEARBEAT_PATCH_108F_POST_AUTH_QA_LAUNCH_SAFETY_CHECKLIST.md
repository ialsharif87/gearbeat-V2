# Patch 108F — Post-Auth QA / Launch Safety Checklist

This document establishes the official **Post-Auth QA and Launch Safety Checklist** for the GearBeat V2 platform following the implementation of Patch 108B (Password Enforced Signup + Phone SMS OTP + Email Verification). It outlines mandatory testing protocols, configuration rules, deferred provider guidelines, and launch blocker parameters to ensure complete security and premium UX consistency prior to invite-only pilot activation.

---

## 1. Password Strength QA Checklist

The registration flow in [SignupClient.tsx](file:///c:/Users/iaals/Documents/GitHub/gearbeat-V2/app/signup/SignupClient.tsx) implements real-time client-side password strength validation. This checklist ensures the live validator satisfies all security policies.

### Core Validation Rules
*   **Rule 1 (Length):** Password must be a minimum of **8 characters** in length.
*   **Rule 2 (Variety):** Password must contain characters from at least **3 out of 4** of the following categories:
    *   Lowercase letters (`a-z`)
    *   Uppercase letters (`A-Z`)
    *   Numbers (`0-9`)
    *   Special characters (e.g., `!@#$%^&*(),.?":{}|<>`)
*   **Rule 3 (Consecutive Repeats):** Password must not contain more than **2 identical characters in a row** (e.g., negative check of `/(.)\1\1/` to block "aaa", "111", etc.).

### QA Verification Scenarios
*   [ ] **Length Check:** Enter a password of 7 characters or fewer. Confirm that the "At least 8 characters" constraint shows as pending (muted color, no checkmark). Confirm that entering an 8th character immediately triggers a green transition (`valid` CSS class).
*   [ ] **Variety Check:** Enter `abcdefgh` (only lowercase, length 8). Confirm that the variety rule shows as pending.
*   [ ] **Variety Satisfied:** Enter `Abcdefg1` (lowercase, uppercase, number). Confirm that the variety rule transitions to valid (green checkmark).
*   [ ] **Consecutive Duplicates Block:** Enter `Abc111xyz`. Confirm that the consecutive duplicates rule fails/remains pending. Correct it to `Abc112xyz` and confirm it transitions to valid immediately.
*   [ ] **Submit Button Enforcement:** Verify that the "Create Account" submit button remains disabled (`disabled={loading || !isPasswordValid}`) as long as *any* of the three password checklist rules is unsatisfied.
*   [ ] **Bilingual Checklist:** Toggle between English and Arabic UI states. Verify that the checklist text, rules, and sub-lists are perfectly translated and respect proper text direction (LTR for English, RTL for Arabic).

---

## 2. Signup QA Checklist

Enforces that user registration in [SignupClient.tsx](file:///c:/Users/iaals/Documents/GitHub/gearbeat-V2/app/signup/SignupClient.tsx) is completely secure, and correctly captures and stores profile details immediately without leaving orphan auth accounts.

### QA Verification Scenarios
*   [ ] **Name Field Constraints:** Verify that entering a full name shorter than 2 characters throws a descriptive client-side validation error.
*   [ ] **Email Structure Validation:** Enter an invalid email address (e.g., `user@domain`). Verify that form submission is blocked and a regex error is raised.
*   [ ] **E164 Phone Formatting:** Ensure the country selector defaults to Saudi Arabia (`SA` / `+966`). Test entering various mobile patterns and ensure the `CountryPhoneFields` component correctly returns a valid E164 formatted phone number (e.g., `+9665XXXXXXXX`).
*   [ ] **Profile Database Persistence:**
    *   Create a test account.
    *   Directly inspect the `profiles` database table using the Supabase SQL editor or dashboard (to be performed by authorized DB administrators).
    *   Verify a new record was instantly inserted on conflict of `auth_user_id`.
    *   Confirm the following fields are accurately written:
        *   `id` and `auth_user_id` match the Supabase auth UUID.
        *   `email` matches the registration email.
        *   `full_name` matches the form input.
        *   `phone` & `phone_e164` store the clean E164 string.
        *   `role` accurately stores the selected role (`customer` or `studio_owner`).
        *   `account_status` is marked as `active`.
        *   `preferred_currency` is derived correctly from the country selection (e.g., `SAR` for SA).
        *   `preferred_language` defaults to `ar` (Arabic).
*   [ ] **Bilingual Multi-Step Verification Guidance:**
    *   Verify that upon successful signup, the user is **NOT** immediately redirected to a dashboard.
    *   Verify the page displays the **Verification Guidance UI** state containing explicit instructions for Email and Phone validation.
    *   Ensure both Arabic and English text blocks are correct and clear.

---

## 3. Email Verification Checklist

Ensures that the native Supabase confirmation link mechanism is correctly wired, processes redirects, and updates security flags.

### QA Verification Scenarios
*   [ ] **Redirect Verification:** Inspect the signup request network payload. Verify that `emailRedirectTo` is exactly configured to `${window.location.origin}/auth/callback`.
*   [ ] **Pre-Confirmation Login Block:** Before clicking the email link, attempt to log in using the newly created credentials. Ensure access is restricted or appropriate instructions are given to confirm the email.
*   [ ] **Confirmation Link Lifecycle:**
    *   Trigger the confirmation link sent to the test inbox.
    *   Verify the URL routes through `/auth/callback` and automatically exchanges the code for a session.
    *   Verify the user is redirected to their respective dashboard (`/customer` or `/portal/studio`).
*   [ ] **Badge Status Check:** Navigate to [app/profile/page.tsx](file:///c:/Users/iaals/Documents/GitHub/gearbeat-V2/app/profile/page.tsx). Confirm that the email field label now features the **Verified (✓ موثق)** green success badge.

---

## 4. Phone OTP Deferred-Provider Checklist

Ensures the client-side component [phone-verification-manager.tsx](file:///c:/Users/iaals/Documents/GitHub/gearbeat-V2/components/phone-verification-manager.tsx) operates correctly under both sandbox and production environments.

### Component Logic & UI Checklist
*   [ ] **Verification State Progression:** Verify that the UI correctly starts in `idle` (with "Send OTP" button) and transitions seamlessly: `idle` -> `requesting` -> `verifying` -> `success`.
*   [ ] **OTP Input Form Constraints:**
    *   Verify the code input strictly allows exactly **6 characters** maximum.
    *   Ensure the numeric field has centered styling, with expanded letter-spacing for premium readability.
    *   Verify the "Verify" button is disabled unless the input is exactly 6 digits long.
*   [ ] **Cooldown Timer Mechanics:**
    *   Click "Send OTP". Verify that the cooldown timer is initialized to **60 seconds**.
    *   Ensure the cooldown timer decrements accurately every second.
    *   Verify that the "Resend Code" link is disabled, displaying `Resend in Xs` until the countdown reaches `0s`.
    *   Verify that once the timer hits `0`, "Resend Code" becomes active, and clicking it triggers a fresh SMS OTP and resets the cooldown to 60.
*   [ ] **Error Presentation:** Trigger an error (e.g., input an invalid or expired 6-digit code). Ensure a descriptive red error message is displayed (e.g., "Invalid or expired code") and the component resets safely to let the user re-enter details.
*   [ ] **Successful Verification Reload:**
    *   Enter the correct OTP token.
    *   Verify that after successful validation with `supabase.auth.verifyOtp`, the state transitions to `success` showing a confirmation message.
    *   Verify `window.location.reload()` is immediately called, refreshing the layout to populate the server components with the updated verification badges.

---

## 5. Customer / Profile / Partner Badge Checklist

All dashboards and profile pages must reflect actual, live security statuses queried from the Supabase Auth User metadata, preventing stale or hardcoded indicators.

### Dashboard Badging Checkpoints

#### 1. Profile Page (`app/profile/page.tsx`)
*   [ ] **Email Verified Badge:** Verify the label displays:
    *   If `user.email_confirmed_at` is populated: **✓ Verified / موثق** (green success badge).
    *   If `user.email_confirmed_at` is empty: **Not Verified / غير موثق** (gray badge).
*   [ ] **Phone Verified Badge:** Verify the label displays:
    *   If `user.phone_confirmed_at` is populated: **✓ Verified / موثق** (green success badge).
    *   If `user.phone_confirmed_at` is empty: **Not Verified / غير موثق** (gray badge).
*   [ ] **PhoneVerificationManager Mount:** Ensure `PhoneVerificationManager` is mounted *only* if `user.phone_confirmed_at` is empty/falsy.
*   [ ] **Identity Details Lock:** Add identity details (`identity_type` and `identity_number`). Verify that once saved, `profile.identity_locked` becomes `true`, the fields transition to `readOnly`, and the user is blocked from changing them to prevent fraud.

#### 2. Customer Dashboard (`app/customer/page.tsx`)
*   [ ] **Live Verification Badges:** Ensure the sidebar/verification section displays:
    *   `Email verified` badge status mapped directly to `user.email_confirmed_at`.
    *   `Phone verified` badge status mapped directly to `user.phone_confirmed_at`.
    *   `Identity` verification status text (e.g. `verified`, `pending`, `not_started`) mapped to `profile.identity_verification_status`.
*   [ ] **Deferred Component Mounting:** Ensure the `PhoneVerificationManager` component mounts automatically at the bottom of the verification box if `user.phone_confirmed_at` is false/empty.

#### 3. Partner / Studio Owner Dashboard (`app/portal/studio/page.tsx`)
*   [ ] **Owner Verification Badge:** Ensure the sidebar displays a dedicated verification card displaying email and phone verification statuses synced directly with the current logged-in user session.

---

## 6. Supabase Dashboard Settings (Pre-Launch & Post-Launch Verification)

The security and functionality of the authentication system depend directly on correct configurations within the production Supabase dashboard. Authorized administrators must manually verify these settings prior to launch.

*   [ ] **Enable "Confirm Email" Toggle:** Navigate to *Auth -> Providers -> Email*. Ensure **Confirm Email** is enabled. Disabling this permits registration and login with fictitious, unconfirmed email addresses.
*   [ ] **Enable "Confirm Phone" Toggle:** Navigate to *Auth -> Providers -> Phone*. Ensure **Confirm Phone** is enabled. This forces the SMS verification flow when updating phone numbers.
*   [ ] **Redirect Whitelist Configuration:** Navigate to *Auth -> URL Configuration*.
    *   Verify that `http://localhost:3000/auth/callback` is authorized *strictly for development*.
    *   Ensure the production URL (e.g., `https://gearbeat.com/auth/callback`) is added to **Redirect URLs**.
    *   Verify that wildcards (like `*`) are completely disabled in production redirect URLs to prevent token interception attacks.
*   [ ] **SMS Provider Settings:** Navigate to *Auth -> Providers -> Phone*. Ensure "Enable Phone Provider" is turned on, and configured to utilize a secure production SMS gateway (Twilio, Vonage, or Unifonic).
*   [ ] **Custom SMTP Configuration:** Navigate to *Auth -> Email Templates*. Ensure **Enable Custom SMTP** is turned ON and populated with production mailer credentials. Relying on default Supabase sandboxed SMTP restricts email delivery to 3 per hour, blocking launch registrations.

---

## 7. Twilio / Vonage / Unifonic Deferred Setup Notes

In local development or dry-run sandboxes, triggering the SMS verification requests will log an error or return a missing configuration code. Production activation requires moving from mock setups to real-world telecom provider channels.

### Integration Architecture
GearBeat utilizes the unified Supabase Auth API to dispatch SMS. The application code makes calls directly to:
```typescript
supabase.auth.updateUser({ phone })
```
This triggers Supabase's backend service to connect to the SMS provider specified in the dashboard. The production setup requires **no frontend code alterations**.

### Provider Setup Runbooks

#### Option A: Twilio Setup
1.  Sign in to the [Twilio Console](https://console.twilio.com/).
2.  Obtain the **Account SID**, **Auth Token**, and a **Twilio Phone Number** (or Messaging Service SID).
3.  In the Supabase Dashboard, go to *Auth -> Providers -> Phone* and select **Twilio** as the provider.
4.  Input the Account SID, Auth Token, and Twilio Phone Number/Service SID. Save changes.

#### Option B: Vonage (formerly Nexmo) Setup
1.  Sign in to the [Vonage API Dashboard](https://dashboard.nexmo.com/).
2.  Retrieve your **API Key** and **API Secret**.
3.  In the Supabase Dashboard under *Phone Provider*, select **Vonage**.
4.  Input the API Key, API Secret, and set your premium **Brand Name** (e.g., `GearBeat`) which will appear as the sender name on users' handsets.

#### Option C: Unifonic Setup
1.  Sign in to the [Unifonic Developer Portal](https://cloud.unifonic.com/).
2.  Generate a secure **App SID**.
3.  In the Supabase Dashboard under *Phone Provider*, select **Unifonic**.
4.  Input the App SID and the approved **Sender ID**.

> [!IMPORTANT]
> **SMS Templates:** Customize the SMS message content in the Supabase Dashboard (*Auth -> SMS Templates*). Make sure it includes the OTP placeholder `{{ .Code }}` (e.g., `"Your GearBeat verification code is {{ .Code }} / رمز التحقق الخاص بك لـ GearBeat هو {{ .Code }}"`).

---

## 8. No Fake Verification Success Rule

> [!CAUTION]
> **CRITICAL ARCHITECTURAL MANDATE:** Under no circumstances should verification states or badges be mocked, bypassed, or marked as "successful" inside client-side components using dummy flags.

### Prohibited Patterns
*   **No Dummy Query Overrides:** Do not allow query parameters like `?verify=true` or `?mockPhone=true` to skip OTP flows or fake badge rendering.
*   **No LocalStorage Overrides:** Do not store local verification bypass variables in the browser.
*   **No Mock State Persistence:** Badges must always read directly from the user's authentic session fields: `user.email_confirmed_at` and `user.phone_confirmed_at`.
*   **No Local Database Mutations:** The status must never be client-forced; it must always be the result of a successful native Supabase handshake (`supabase.auth.verifyOtp` or native SMTP confirmation).

---

## 9. Launch Blocker Criteria

The following checklist represents **hard blockers** for production deployment. If any of these items are marked as failed, the release MUST be delayed.

| ID | Blocker Criteria | Rationale | Status |
| :--- | :--- | :--- | :---: |
| **LB-01** | Missing Custom SMTP in Production | Sandboxed SMTP limits (3 emails/hour) will lock out all users during high signup volumes. | ⏳ Pending |
| **LB-02** | Missing SMS Gateway Configuration | Without Twilio, Vonage, or Unifonic in production, users cannot complete phone verification. | ⏳ Pending |
| **LB-03** | Insecure Redirect Wildcards | Permitting insecure wildcard redirect URLs allows malicious token interception. | ⏳ Pending |
| **LB-04** | "Confirm Email" Toggle Disabled | Disabling this toggle enables signup and immediate login with fake email addresses. | ⏳ Pending |
| **LB-05** | Identity Modification Possible Post-Save | Failing to lock identity type/number after initial save permits fraudulent profile modifications. | ⏳ Pending |
| **LB-06** | Mock Verification Badges Active | Hardcoded badges mask authentic user status, leading to unverified profile access. | ⏳ Pending |

---

## 10. Summary QA Sign-Off

This sign-off sheet must be filled and signed by the QA Lead and Release Engineer prior to initiating deployment to production servers.

*   **Branch Tested:** `patch-108f-post-auth-qa-launch-safety-checklist`
*   **Commit Hash:** `[INSERT_COMMIT_HASH]`
*   **Test Date:** `2026-05-17`
*   **Signed off by QA Lead:** `_____________________`
*   **Signed off by Release Engineer:** `_____________________`
