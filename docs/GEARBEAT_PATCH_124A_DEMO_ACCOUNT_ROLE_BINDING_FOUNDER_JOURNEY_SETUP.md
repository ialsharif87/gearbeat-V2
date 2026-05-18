# GEARBEAT PATCH 124A: DEMO ACCOUNT ROLE BINDING + FOUNDER JOURNEY SETUP

## Overview
To facilitate a comprehensive and realistic **Founder Full-Journey Self-Test**, this patch establishes the sandbox framework to run multi-role journey tests across isolated, real user profiles without polluting production channels or involving external test users.

All user roles are strictly segmented to mimic a complete enterprise-scale market run under premium sandbox security isolation.

---

## 🔑 Demo Account Matrix by Role

| Target Account | Assigned Role | Required Purpose / Testing Focus | Key Operations Bound |
| :--- | :--- | :--- | :--- |
| **`admin@gearbeat.com`** | Super Admin / Operator | Full-platform manual ops console, catalog reviews, booking approvals, payment clearance audits, and self-test blocker overrides. | Approval queues, ledgers, refund gates |
| **`customer@gearbeat.com`** | Customer (End User) | Studio booking reservations, ticket purchases, marketplace product orders, loyalty points earning checks, and academy enrollments. | Studio calendar, ticketing, checkouts |
| **`owner@gearbeat.com`** | Studio Owner | Registering studio spaces, managing weekday availability rules, reviewing received bookings, and viewing payout settlement logs. | Studio slots, calendar exception rules |
| **`vendor@gearbeat.com`** | Merchant / Vendor | Drafting marketplace catalogs, product specs, tracking fulfillment status, and coordinating settlements. | Merch catalog, product specifications |
| **`organizer@gearbeat.com`**| Event Ticket Organizer| Creating target events, setting ticket prices, tracking ticket orders, and checking gate capacity. | Event creation, ticket registries |

---

## 🛡️ Allowed Founder Self-Test Journeys

Founders can securely simulate the following full-lifecycle paths inside the local sandbox:
1. **The Booking Journey**: Test Customer reserves a studio slot -> Studio Owner sees pending reservation -> Super Admin manually audits and simulates approval -> Booking marked paid and slot closes.
2. **The Merch Purchase Journey**: Vendor creates catalog product -> Customer adds to cart and simulates order checkout -> Vendor tracks fulfillment -> Admin clears payout settlement.
3. **The Event Ticketing Journey**: Organizer drafts a live show event -> Customer purchases a ticket entry -> Organizer reviews gate attendance capacity.
4. **The Academy Journey**: Instructor schedules lesson slot -> Student books attendance -> System audits capacities.

---

## 🛑 Strict Safety Boundaries

### 1. No Live Payment Boundary
* All credit card checkouts and TAP payment processor configurations remain locked under **Safe Sandbox Test Mode (`OFFLINE / TEST KEYS`)**.
* No real payment tokens can be submitted or debited.

### 2. No Fake Rewards, Points, or Referrals Rule
* Only realistic baseline loyalty states matching real SQL definitions are tracked.
* No arbitrary credit increases, fake balances, or artificial point generation are allowed. Everything follows standard system transaction records.

### 3. No External Pilot Users Rule
* Self-testing is limited to the defined demo accounts within internal, local, or preview environments.
* No live customer pilot runs or external test signups will be carried out until final production signoff is cleared.

### 4. Supabase CLI & Migration-Only Database Policy
* Database roles must be assigned strictly via database migrations and seed definitions.
* Direct manual mutations of database records or RLS configurations using the raw SQL Editor are strictly forbidden.

---

## 🏗️ Role Binding Rules & Blocker Assessment (Proposing Patch 124B)

> [!WARNING]
> **Role Binding Database Constraint Blocker**
> Assigning standard roles to `customer@gearbeat.com`, `owner@gearbeat.com`, `vendor@gearbeat.com`, and `organizer@gearbeat.com` requires mapping standard UUID keys from the `auth.users` schema onto `public.profiles` or `public.user_roles` records.
>
> In Supabase Preview/Local setups, if seed profiles are preloaded without matching `auth.users` records, strict foreign key constraints will fail.
>
> **Proposed Solution (Patch 124B)**:
> In the next patch (**Patch 124B**), we will implement a safe, forward-only SQL migration (`supabase/migrations/20260519000007_demo_user_role_binding_seed.sql`) containing standard mock `auth.users` inserts wrapped in a `postgres` profile-link block. This will safely bind these five demo identities directly during boot.

---

## 📋 Exact Manual Verification Checklist before Testing

Follow these manual checks inside your local environment:
- [ ] **Step 1**: Register accounts `admin@gearbeat.com`, `customer@gearbeat.com`, `owner@gearbeat.com`, `vendor@gearbeat.com`, and `organizer@gearbeat.com` via the local auth signup gate.
- [ ] **Step 2**: Open the **Manual Operations Console** at `/admin/manual-ops` using the Admin account.
- [ ] **Step 3**: Navigate to the **Action Checklist** tab.
- [ ] **Step 4**: Complete the **Founder Demo Account Setup & Role Bindings** checks.
- [ ] **Step 5**: Proceed to execute the simulated booking and marketplace journeys inside the sandbox.
