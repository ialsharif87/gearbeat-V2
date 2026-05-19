# GEARBEAT PATCH 126A — AUTH/LOGIN SEPARATION QA PLAN

This document maps out the auth boundaries, user roles, risks, and founder checklists to ensure proper separation between Customer, Studio Owner, Vendor/Seller, and Platform Operator access.

---

## 1. Intended Auth Boundaries

To secure user identities and direct traffic to appropriate workspaces, the platform defines the following routing endpoints:

* **`/signup`**: Public Customer signup ONLY. Provisions `customer` roles.
* **`/login`**: Public Customer login endpoint. Routes validated customer accounts to `/customer`.
* **`/studio-owner/signup`**: Centralized Studio Owner registration page. Provisions `owner`/`studio_owner` profiles with a `pending` status.
* **`/portal/login`**: Shared Portal Login interface for Studio Owners and Sellers/Vendors. 
* **`/staff-access`**: Exclusive login interface for Platform Administrators, Operations, and Staff. 
* **`/admin`**: Admin Command Center. Guarded strictly via `requireAdminLayoutAccess()` using the `admin_users` table.
* **`/partners/apply`**: Static onboarding intake preview directory. Does not create accounts, trigger API calls, or persist data.

---

## 2. Target Roles & Canonical DB Values

The system translates roles dynamically:

| Role Category | Canonical DB Role | Alternate/Legacy Match | Dashboard Route |
|---|---|---|---|
| **Customer** | `customer` | `user`, `""` | `/customer` |
| **Studio Owner** | `studio_owner` | `owner` | `/portal/studio` |
| **Seller / Merchant** | `vendor` | `seller` | `/portal/store` |
| **Platform Operator** | `super_admin`, `admin` | Operations, Support, Sales, Content | `/admin` |

---

## 3. QA Scenarios & Target Paths

During verification, check the following routing pathways:

1. **Customer Onboarding Flow:**
   * Path: `/signup` ➔ Fill email & password ➔ Redirect to `/login` ➔ Authenticate ➔ Land on `/customer`.
2. **Studio Owner Onboarding Flow:**
   * Path: `/studio-owner/signup` ➔ Register ➔ Profile created with role `owner` & status `pending` ➔ Verify email ➔ Log in at `/portal/login` ➔ Land on onboarding or `/portal/studio`.
3. **Staff Authentication Flow:**
   * Path: `/staff-access` ➔ Sign in with admin credentials ➔ Validated against `admin_users` table ➔ Redirection to `/admin`.
4. **Intake Safety Verification:**
   * Path: `/partners/apply` ➔ Inspect static cards ➔ Try clicking register ➔ Confirm no request is dispatched to Supabase Auth or DB.
5. **Partial Account Recovery Flow:**
   * Log in with an auth account lacking a record in the `profiles` table ➔ Automatically redirected to `/profile/repair` ➔ Avoid redirect loops.

---

## 4. Known Security & Session Risks

* **Session Domain Pollution:** Having customer and admin sessions share the same storage space might cause cross-session contamination (e.g. customer clicking `/admin` landing page). Guarded via layout redirects.
* **Role Conversion Confusion:** Legacy `user`/`owner` roles matching incorrectly in `role-routing.ts`.
* **Avatar Fallback "U":** Uninitialized or broken full name fields fallback to showing `U` instead of initials in the header.
* **Operator Interface Leakage:** Exposing `/admin` layout routes to standard profile users when the profile role is spoofed or manipulated.
* **Broken Signups Redirect Loop:** Creating a user in Auth but failing to insert a row in `profiles` causing an infinite login/redirect cycle. Enforced by `/profile/repair` guard redirects.

---

## 5. Founder Testing Checklist

- [ ] **Test 1: Fresh Customer Registration**
  - Sign up via `/signup` with a new email address.
  - Log in via `/login`.
  - Ensure redirect lands on `/customer`.
- [ ] **Test 2: Fresh Studio Owner Registration**
  - Sign up via `/studio-owner/signup`.
  - Confirm the profile gets inserted with status `pending`.
  - Log in via `/portal/login` and verify onboarding paths.
- [ ] **Test 3: Staff/Operator Authentication**
  - Navigate to `/staff-access`.
  - Sign in with active operator credentials.
  - Verify redirection to `/admin`.
  - Attempt accessing `/staff-access` from a customer login (must sign out and display Access Denied).
- [ ] **Test 4: Broken/Partial Account Check**
  - Simulate a broken user (Auth entry exists, `profiles` entry is missing).
  - Try signing in.
  - Confirm redirect lands on `/profile/repair`.

---

## 6. Next Patch Decision Gate

Analyze login outcomes:
* **Option A:** If Staff / admin login is broken or leaking access, proceed with **Patch 126B — Admin Login Boundary Fix**.
* **Option B:** If Studio Owner registration or layout route protection is broken, proceed with **Patch 126B — Studio Owner Signup/Profile Fix**.
* **Option C:** If both boundaries are failing, prioritize fixing the **Admin boundary first** (Patch 126B — Admin Login Boundary Fix).
