# GEARBEAT PATCH 78A — CRITICAL PRE-COMMERCIAL CLEANUP PACK

## Overview
This patch implements critical security and operational cleanups to reduce risks before moving into full journey QA, pilot phases, or commercial onboarding. It focuses on neutralizing hardcoded credentials, securing mock behaviors, fixing internal routing, and isolating development utilities.

## Inspected Components
- Admin action handlers for lead/application approval.
- Communication utilities (Email, SMS, WhatsApp).
- OTP (One-Time Password) infrastructure.
- Global layout and font configurations.
- Sentry/Instrumentation setup.
- Project root for obsolete dev utilities.
- Marketplace checkout notification flows.

## Changes Made

### 1. Hardcoded Credential Removal
- **File:** `app/admin/leads/actions.ts`
- **Change:** Removed the hardcoded temporary password `GearBeat123!`.
- **New Behavior:** Replaced with a cryptographically generated 12-character random password using the existing `generatePassword` utility.

### 2. Communication Safety (Production Guards)
- **Email (`lib/emails.ts`):** Now explicitly fails with a `success: false` result in production if `RESEND_API_KEY` is missing, instead of silently pretending success.
- **SMS/WhatsApp (`lib/sms.ts`):** Added production guards that return controlled errors if no provider (Twilio/Unifonic) is configured.
- **OTP (`lib/otp/provider.ts`):** Mock provider usage in production now requires an explicit `MOCK_OTP_ENABLED=true` environment flag. If missing, it returns a "delivered: false" error state.

### 3. Internal Routing Fixes
- **Marketplace Checkout:** Updated the vendor notification `actionUrl` from the incorrect `/vendor/orders` to the correct portal path `/portal/store/orders`.
- **API Documentation:** Verified API endpoints in `app/portal/store/integrations/page.tsx` match the `/api/v1/vendor/` structure.

### 4. Build & Instrumentation Hardening
- **Fonts:** Added system-ui and sans-serif fallbacks to `next/font/google` configurations in `app/layout.tsx` and `app/brand-preview/page.tsx` to reduce build failure risks if the Google Fonts API is unreachable.
- **Sentry:** Resolved the missing `onRequestError` hook warning by exporting it from `instrumentation.ts`.
- **ESLint:** Created `.eslintignore` and updated `eslint.config.mjs` to exclude the `scripts/` directory, ensuring dev utilities do not block the build pipeline.

### 5. Dev Utility Isolation
- **Action:** Created `scripts/dev-utils/` and moved the following files from the root to this isolated location:
  - `fix_colors.js`
  - `fix_colors.ps1`
  - `scratch_check_schema.ts`
- **Note:** Fixed import paths in `scratch_check_schema.ts` to maintain functionality while isolated.

## Risk Reduction Summary
- **Credential Theft:** Neutralized the risk of leaked default passwords.
- **Silent Failures:** Prevented production users from "successfully" triggering non-existent email/SMS flows.
- **Build Fragility:** Improved resilience against external font API failures.
- **Navigation Errors:** Fixed broken portal links in automated notifications.

## Intentionally Not Changed
- **Database Schema/RLS:** No SQL or database-level changes were made.
- **Payment Logic:** No implementation of Tap or live payments was added.
- **AI/Mobile/Subdomains:** No work was performed on these future roadmap items.
- **Full Refactor:** UI and business logic remained intact except where security cleanup was required.

## Remaining Blockers Before Commercial Launch
- Full integration of real Resend/Twilio/Unifonic API keys in production environment variables.
- Verification of signed contract workflow with real PDFs in production storage.
- Final Full Journey QA (User Acceptance Testing).

---
**Note:** This patch is a cleanup pack and does not constitute final pilot approval or full journey QA certification.
