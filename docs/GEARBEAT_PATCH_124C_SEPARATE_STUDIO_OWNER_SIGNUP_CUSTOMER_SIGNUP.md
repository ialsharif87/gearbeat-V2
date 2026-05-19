# GEARBEAT PATCH 124C — SEPARATE STUDIO OWNER SIGNUP FROM CUSTOMER SIGNUP

This document outlines the architecture, routing changes, root cause analysis, and self-healing recovery procedures implemented in Patch 124C.

---

## 1. Routing & Role Configuration

The registration flows, role mappings, and dashboard entrypoints are configured as follows:

| Dimension | Customer | Studio Owner |
| :--- | :--- | :--- |
| **Signup Route** | `/signup` | `/studio-owner/signup` |
| **Canonical Role Value** | `customer` | `owner` |
| **Dashboard Path** | `/customer` | `/portal/studio` |

---

## 2. Root Cause Analysis

### The Production Signup Blocker
During the pre-patch self-test journey, two issues combined to block registrations and lock users in loops:

1. **Check Constraint Violations & Partial Accounts:**
   The customer and studio owner signup paths shared the same `/signup` route. When selecting "Studio Owner", the role selected was `"studio_owner"`. 
   However, the database `profiles` check constraint restricts roles:
   ```sql
   check: role = ANY (ARRAY['customer'::text, 'owner'::text, 'vendor'::text])
   ```
   This triggered a silent DB check constraint violation, failing the `profiles` insertion while the Supabase Auth signup succeeded. This created a **partial account** (Auth user exists, but Profile record is missing).
   
2. **Infinite Redirect Loop:**
   When an authenticated user with a missing profile signed in:
   - Layout guards (e.g. `requireCustomerLayoutAccess()`) called `requireActiveProfile`, which found no profile record and redirected to `/login`.
   - The `/login` page client-side checks saw an active Auth session, resolved the role as undefined, and redirected to `/customer` (the default).
   - `/customer` layout redirected back to `/login` due to the missing profile, creating an infinite loop.

---

## 3. How to Handle Broken Partial Accounts

Rather than failing silently or trapping users in loops, we introduced a **Self-Healing Profile Repair Mechanism**:

1. **Auto-Detection:** 
   If a user is authenticated (`user` exists) but has no profile record (`profile` is null), all layout route guards and login handlers redirect them to a dedicated recovery page: `/profile/repair`.
2. **Setup Recovery Form:**
   - The `/profile/repair` page presents a clean, localized form to complete profile details.
   - It captures `full_name`, `phone` (with Saudi phone validation support), and allows selecting the intended role (mapped safely to `customer` or `owner`).
   - On submission, it creates the missing profile record and routes them directly to their role's dashboard.

---

## 4. Fresh Test Checklist

### Test Case 1: Standard Customer Registration
1. Navigate to `/signup`.
2. Confirm the dropdown menu to choose role is **removed** and the page is dedicated to customers.
3. Confirm there is a link: *"Are you a studio owner? Join as a Studio Partner"* pointing to `/studio-owner/signup`.
4. Submit the form with test credentials. Confirm the verification email is sent, and confirmation routes to the customer dashboard.

### Test Case 2: Studio Owner Registration
1. Navigate to `/studio-owner/signup`.
2. Confirm the page is themed for studio owners, and contains a link: *"Looking to book studios? Create a customer account"* pointing to `/signup`.
3. Submit the form with test credentials. Confirm the verification email is sent, and confirmation redirects the owner to the Partner Login page (`/portal/login`).

### Test Case 3: Self-Healing Profile Recovery
1. Sign up a new user via Auth directly or simulate a profile failure by deleting the `profiles` row for a test user while keeping their Auth user record.
2. Sign in using the test credentials.
3. Verify that the login page detects the missing profile and redirects to `/profile/repair`.
4. Verify that entering the name and phone number on `/profile/repair` and choosing a role creates the profile record successfully and terminates the recovery process.

---

## 5. Scope Confirmation

- **Database / Schema:** No SQL migrations, schema modifications, or Supabase database structure changes were made.
- **Payments / Checkout / Loyalty:** No payment integrations, checkout scripts, wallets, or loyalty reward logics were modified.
