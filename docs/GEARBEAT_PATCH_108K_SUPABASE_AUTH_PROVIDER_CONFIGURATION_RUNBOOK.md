# Patch 108K — Supabase Auth Provider Configuration Runbook

## Overview
This runbook details the mandatory configuration steps, safety constraints, and testing protocols required to verify the **Supabase Auth and Phone/Email OTP infrastructure** on the GearBeat V2 platform. Standardizing these provider settings ensures safe registration and secure account onboarding for pilot users.

---

## 1. Supabase Auth Settings Checklist
Ensure the following toggles are set inside the Supabase Studio dashboard (`Authentication > Providers`):

- [ ] **Email Provider**:
  * Status: **Enabled**
  * Confirm Email: **Enabled** (Requires users to click the confirmation link before first login).
  * Secure Email Change: **Enabled** (Requires confirmation on both new and old email addresses).
- [ ] **Phone Provider**:
  * Status: **Enabled**
  * SMS Provider: **Twilio** (or fallback Unifonic/Vonage).
  * Enable Phone Confirmation: **Enabled** (Mandates SMS OTP entry to authorize session signup).
- [ ] **Site URL & Redirects**:
  * Site URL: `https://gearbeat-v2.vercel.app` (or production custom domain).
  * Additional Redirect URLs:
    * `https://gearbeat-v2.vercel.app/**`
    * `http://localhost:3000/**` (for local sandbox QA verification).

---

## 2. Email Confirmation Template Checklist
Configure standard brand templates under `Authentication > Email Templates` exactly as follows:

* **Bilingual Welcome Copy**: Include professional greetings in both Arabic and English.
* **Placeholders**: Verify that `{{ .ConfirmationURL }}` is correctly formatted inside the template CTA.
* **Brand Styling**: Ensure no raw template defaults are active. Apply clean luxury design templates featuring standard brand copy.
* **Validity Limits**: Set the token expiration duration limit to **24 hours** (86400 seconds) to harden token lifespans.

---

## 3. Production Redirect URL Checklist
To prevent phishing or redirection vulnerabilities:
- [ ] Verify that all wildcard redirects strictly limit destinations to approved GearBeat subdomains.
- [ ] Ensure that `auth-helpers-nextjs` and Supabase client configs rely on `getURL()` dynamic prefixing to resolve target routes correctly.
- [ ] Confirm `/login` redirection parameters resolve to `account=customer` or `account=partner` respectively based on user intent.

---

## 4. Phone OTP Provider Setup Notes (Twilio Trial & Enterprise Limits)
* **Twilio Trial Restrictions**:
  * During the invite-only pilot cohort phase, Twilio trial accounts will **only** send SMS OTPs to pre-verified numbers added in the Twilio console.
  * Trial text prefix `[Sent from your Twilio trial account]` is expected.
* **Transition to Production**:
  * Once commercial activity starts, upgrade Twilio to **Paid/Upgrade** status to lift candidate verification limits and remove trial warning prefixes.
* **Regional Providers**:
  * For expanded operations inside Saudi Arabia, evaluate shifting standard API connections to **Vonage** or **Unifonic** to achieve highly consistent local carrier delivery and stable SMS gateways.

---

## 5. Security & Secret Safeguards
> [!CAUTION]
> **CRITICAL RULE**: Do not include database secrets, Twilio API Auth Tokens, Supabase Service Role keys, or password strings in code files, logs, screenshots, documentation, or commit headers. All keys must strictly reside in environment variables (`.env.local` or Vercel dashboard).

---

## 6. Required Test Scenarios (Post-Provider Setup)
Verify these exact flows on staging before opening registration:
1. **Valid Email Signup**: User registers $\rightarrow$ receives activation link $\rightarrow$ clicking link redirects to verified `/profile` dashboard.
2. **Valid Phone OTP Onboarding**: Inputting a valid number triggersTwilio SMS $\rightarrow$ correct code input triggers immediate profile state unlock.
3. **Invalid Code Resiliency**: Check that supplying an expired or invalid SMS code yields a clear localized translation error without crashing the layout.
4. **Resend Timer Constraints**: Confirm the "Resend SMS" CTA enforces a minimum **60-second cooldown** to prevent API abuse.

> [!WARNING]
> **MANDATORY POLICY**: Fake phone verification success mocks (e.g. bypass flags bypassing Twilio verification on production builds) are **strictly forbidden** to protect the ecosystem from fraudulent entries.

---

## 7. Rollback Plan (If OTP Provider Fails)
If Twilio experience outages or SMS delivery yields high failure rates:
1. Shift SMS configuration parameters inside the Supabase Dashboard to **Vonage** or the pre-configured fallback provider.
2. If temporary recovery is delayed, edit the public signup layout to temporarily disable Phone OTP and mandate Email Verification ONLY, alerting pilot users gracefully using localized banners.
3. Alert the system administration team to evaluate local carrier status and API key limits.

---

## 8. Launch Blockers
Do not deploy if any of the following items remain unaddressed:
* [ ] The email activation link redirects to a blank page instead of the verified profile dashboard.
* [ ] API credentials or service role secrets are discovered in public/private Git repositories.
* [ ] Resend timers allow unthrottled concurrent SMS requests to Twilio.
* [ ] Bypass verification hooks are left enabled on the production environment.
