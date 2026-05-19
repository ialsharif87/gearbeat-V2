# GEARBEAT PATCH 126D — AUTH JOURNEY STABILIZATION & PROFILE CREATION FIX

This patch diagnoses and resolves the root cause of the profile creation failure during signup and locks down account creation boundaries to prevent role confusion.

---

## 1. Blocker Root Cause Diagnosis

### The Problem
During signup, users received the error:
`“Account created but profile setup failed. Please contact support.”`

### Technical Cause
1. In `app/studio-owner/signup/StudioOwnerSignupClient.tsx` (Line 145) and `app/profile/repair/ProfileRepairClient.tsx` (Line 115), profile creation inserted rows with `account_status: "pending"`.
2. The database schema constraint check on `profiles.account_status` strictly permits only:
   - `'active'`
   - `'pending_deletion'`
   - `'deleted'`
   - `'suspended'`
3. The invalid status value `"pending"` violated this constraint, resulting in a database insert failure. This halted profile creation, triggering the frontend fallback warning.
4. Next.js route guards (`lib/route-guards.ts`) verify that `profile.account_status === "active"` before allowing access. Thus, studio owners and customers must start as `"active"` in their main profile, while onboarding/applications status is separately tracked in provider lead tables (e.g., `provider_leads`, `studio_applications`).

---

## 2. Implemented Fixes

### A. Studio Owner Signup Fix
* File: `app/studio-owner/signup/StudioOwnerSignupClient.tsx`
* Updated the profile creation payload to set `account_status: "active"` (replaces `"pending"`).

### B. Profile Repair Client Fix
* File: `app/profile/repair/ProfileRepairClient.tsx`
* Updated the profile creation payload to set `account_status: "active"` (replaces the ternary mapping which set `"pending"` for owners).

---

## 3. Account Registry Page & Security Boundaries

### Admin Account Registry Preview
* Route: `/admin/account-registry`
* Safe implementation: Runs as a secure Next.js Server Component (`app/admin/account-registry/page.tsx`), protecting sensitive keys.
* Audits the separation between `auth.users` (GoTrue, containing sensitive authentication details and metadata) and `public.profiles` (synchronized client-safe representation).
* Exposes synced accounts read-only using `createAdminClient` with standard security guards, preventing direct client-side query vulnerabilities.

### Sidebar Link Integration
* Added NavItems to `app/admin/AdminSidebar.tsx` to display **User Management** and **Account Registry** under the General control section.

---

## 4. Verification & Testing

1. **Compilation Validation:**
   - Ran `npm run typecheck` - Compiles cleanly with zero errors.
   - Ran `npm run build` - Production bundle generated successfully (Exit code: 0).
2. **Post-Authentication Target Map:**
   - **Customer:** `/signup` -> writes role `"customer"`, status `"active"` -> redirects to `/customer`.
   - **Studio Owner:** `/studio-owner/signup` -> writes role `"owner"`, status `"active"` -> redirects to `/portal/first-login`.
   - **Admin / Super Admin:** Restricted to `/admin/login` and `/admin` routes.
