# GEARBEAT PATCH 66B — SERVICE ROLE / RLS / SECURITY AUDIT & DECISION GATE

## 1. Overview
This is a **documentation-only** security audit of GearBeat V2, focusing on the usage of the Supabase Service Role (`supabaseAdmin`), Row Level Security (RLS) boundaries, and authentication assumptions. This document serves as the final technical audit for Phase 66 before proceeding to hardening.

**Policy:** Zero mutation. No code, database, or API changes were performed.

---

## 2. Service Role & Admin Client Usage Patterns

### A. Core Usage Statistics
- **Privileged Client (`supabaseAdmin`):** Referenced ~37 times in `app/` and `lib/`.
- **Standard Client (`supabase`):** Referenced ~27 times in `app/` and `lib/`.

### B. High-Risk Patterns Identified
1.  **Portal Mutation via Service Role:** The Partner Portal (e.g., `ManageStudioPage` and associated server actions) uses `supabaseAdmin` for almost all database updates (pricing, equipment, features). This completely bypasses RLS and relies entirely on manual `verifyStudioOwnership` checks in the code.
2.  **Public Page Privilege Escalation:** Public pages like `/studios/[slug]` use the admin client to fetch owner profile details (email, phone verification status) that are hidden from the standard anonymous/customer client.
3.  **Payment & Finance Foundation:** The entire payment confirmation pipeline (`/api/checkout/manual-confirm`) and financial ledger processing (`lib/finance-ledger.ts`) run exclusively via the service role. There are currently no RLS policies protecting these tables from direct manipulation if a service key is leaked or a server action is compromised.
4.  **Loyalty System Bypassing:** All loyalty point adjustments and wallet creation logic run via `supabaseAdmin`, as these tables lack a public-facing RLS interface.

---

## 3. RLS & Security Boundary Risks

| Boundary | Risk Level | Finding |
| :--- | :--- | :--- |
| **Admin vs. User** | Medium | Admin routes are protected by `requireAdminLayoutAccess`, but many "Admin" tables lack RLS policies because the app assumes they are only accessed via `supabaseAdmin`. |
| **Partner vs. Partner** | **High** | Multi-tenant isolation for studios and marketplace vendors relies on manual `eq("owner_id", user.id)` filters in server actions using the service role, rather than native PostgreSQL RLS policies. |
| **Public vs. Private** | Medium | Storage buckets (e.g., `provider-documents`) are correctly private, but the metadata for these files is stored in tables (`provider_leads`, `studio_applications`) that rely on service-role access. |
| **Marketplace Integrity** | **High** | Checkout sessions and order items can be created/modified via the service role without secondary RLS verification. |

---

## 4. Auth & Session Assumptions

- **Admin Logic:** The system assumes a user is an admin if they exist in the `admin_users` table. There is a "Super Admin" override in `app/studios/[slug]/page.tsx` that bypasses status checks to allow viewing hidden profiles.
- **Middleware:** `middleware.ts` only refreshes the session. It does **not** enforce role-based access; this is delegated to layouts/guards (`lib/route-guards.ts`).
- **Profile Roles:** The `profiles.role` column is used for UI redirection but the actual permissioning often relies on secondary tables (`admin_users`, `vendor_profiles`).

---

## 5. Critical Risks & Vulnerabilities

1.  **CRITICAL: RLS Under-Utilization:** The application is architected as a "Trusted Server" model rather than a "Secure Database" model. While safe within the Next.js environment, it makes the system extremely vulnerable to SQL injection or service-key exposure if any server action has a logical flaw.
2.  **CRITICAL: Migration Gaps:** (Carried from 66A) The lack of local migration files for Marketplace and Loyalty tables implies these tables likely have `DISABLE RLS` or `PERMISSIVE` policies on production to allow the current code to work.
3.  **MEDIUM: Storage Metadata exposure:** While files are private, the *existence* and *names* of documents in `provider-documents` are visible via the lead management UI to anyone with admin access, regardless of specific sub-role.

---

## 6. Phase 66 Closeout Summary

### Patch 66A (Inventory Audit) - COMPLETED
- Mapped 40+ tables and 9 RPCs.
- Identified major "Migration Gaps" in Marketplace and Loyalty modules.
- Confirmed "Triple-Entry" accounting ledger is the core financial truth.

### Patch 66B (Security Audit) - COMPLETED
- Verified heavy reliance on Service Role (`supabaseAdmin`) for multi-tenant isolation.
- Identified lack of RLS as the primary technical debt for launch-readiness.
- Confirmed that Auth/Session handling is correctly centralized but relies on privileged lookups.

---

## 7. Decision Gate: Phase 66 Result

### **GO/NO-GO STATUS: GO (WITH CONDITIONS)**

**Conditions for Soft Launch:**
1.  **RLS Hardening (Next Phase):** We MUST transition the Partner Portal from "Manual Ownership Checks" to "RLS-Enforced Isolation" before any non-pilot partners are onboarded.
2.  **Baseline Pull:** The "Migration Gaps" identified in 66A must be filled by a `db pull` to ensure we have a record of the production RLS state.
3.  **Service Role Reduction:** We must audit and reduce the number of places `supabaseAdmin` is used for simple READ operations that should be public.

---
**Audit Completed By:** Antigravity AI
**Date:** 2026-05-12
**Verification Status:** READ-ONLY / NO CODE MUTATION PERFORMED.
