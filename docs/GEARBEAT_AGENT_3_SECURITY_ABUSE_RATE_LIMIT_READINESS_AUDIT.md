# SPRINT 6: SECURITY HEADERS, ABUSE PREVENTION, & RATE-LIMIT READINESS (PATCH-106C)
**Agent:** Agent 3 — Backend / Security / Payment / SQL Readiness  
**Status:** DRAFT / AUDIT COMPLETE  
**Date:** 2026-05-15  

---

## 1. OBJECTIVE
This document assesses GearBeat’s current posture regarding infrastructure-level security and abuse prevention. It identifies gaps in rate-limiting, CSP enforcement, and support-channel risks.

**CRITICAL NOTICE:** All infrastructure configuration changes, middleware hardening, and monitoring integrations described below are strictly **BLOCKED** and require explicit product and security sign-off before implementation.

---

## 2. SECURITY HEADERS AUDIT

| Header | Status | Current Implementation | Recommendation |
| :--- | :--- | :--- | :--- |
| **X-Frame-Options** | ✅ ACTIVE | `DENY` | Maintain. |
| **HSTS** | ✅ ACTIVE | `max-age=31536000` | Maintain. |
| **CSP** | ⚠️ REPORT-ONLY | `Content-Security-Policy-Report-Only` | Move to `Content-Security-Policy` (Enforce) after confirming no regressions. |
| **Permissions-Policy** | ✅ ACTIVE | Extensive restrictions on hardware APIs. | Maintain. |
| **X-Content-Type** | ✅ ACTIVE | `nosniff` | Maintain. |

---

## 3. ABUSE PREVENTION & RATE-LIMITING

### 3.1 Existing Posture
*   **Rate Limiting:** Currently no application-level rate limiting in `middleware.ts`.
*   **Abuse Risks:** OTP endpoints, login routes, and support contact forms are vulnerable to volume-based abuse.

### 3.2 Required Rate-Limit Tiers (Planning Only)
1.  **Auth Tier (Strict):** 5 attempts / 15 mins for `/api/auth/otp`.
2.  **Contact/Support Tier (Moderate):** 3 submissions / hour for public contact forms.
3.  **Search/Discovery Tier (Relaxed):** 100 requests / minute for studio and marketplace discovery.

---

## 4. SUPPORT & CONTACT RISK AUDIT

### 4.1 Support/Contact Form Risks
*   **Gap:** Forms that send email or create database leads lack CAPTCHA or proof-of-work validation.
*   **Risk:** Bot-driven spam filling the `provider_leads` or `support_tickets` tables.
*   **Mitigation:** Integrate Turnstile or reCAPTCHA v3 on all public-facing entry points.

### 4.2 Admin/Partner Portal Protection
*   **Risk:** Credential stuffing on the Staff Access (`/staff-access`) and Partner Login (`/portal/login`) pages.
*   **Requirement:** Mandatory Multi-Factor Authentication (MFA) for all `super_admin` accounts.

---

## 5. FUTURE MONITORING & OBSERVABILITY

*   **Sentry Integration:** Already configured in `next.config.ts`. Needs verification of "Security Header" violation reporting.
*   **Audit Logging:** Ensure all "Rate Limit Exceeded" events are logged to a central security dashboard for traffic analysis.

---

## 6. BLOCKED TASKS (REQUIRE EXPLICIT APPROVAL)

The following activities are on hold until Phase 61:
1.  **NO CSP Enforcement:** Do not switch CSP from `Report-Only` to `Enforce`.
2.  **NO Rate-Limit Middleware:** Do not implement `upstash/ratelimit` or custom middleware logic.
3.  **NO CAPTCHA Integration:** Do not add client-side or server-side bot verification.
4.  **NO MFA Enforcement:** Do not modify auth settings to require MFA for staff.

---

## 7. NEXT STEPS
1.  Review the CSP violation reports in Sentry to identify required whitelist additions.
2.  Approve the Upstash or Redis configuration for stateful rate-limiting.
3.  Initiate **Patch 107: Public Entry Point Hardening** (CAPTCHA + Rate-Limits).
