# SPRINT 5: AUTH, ROLE, AND ACCESS-BOUNDARY AUDIT (PATCH-105C)
**Agent:** Agent 3 — Backend / Security / Payment / SQL Readiness  
**Status:** DRAFT / AUDIT COMPLETE  
**Date:** 2026-05-15  

---

## 1. OBJECTIVE
This document maps the authentication and authorization boundaries for all user segments in the GearBeat V2 ecosystem. It identifies existing role-based access control (RBAC) patterns and outlines the requirements for future vertical-specific hardening (Academy, Tickets).

**CRITICAL NOTICE:** All authentication logic changes, database role mutations, and session management implementations described below are strictly **BLOCKED** and require explicit product and security sign-off before execution.

---

## 2. JOURNEY & ACCESS MAP

| Persona | Data Source | Path Boundary | Guard Implementation |
| :--- | :--- | :--- | :--- |
| **Customer** | `profiles.role = 'customer'` | `/customer/*` | `requireCustomerLayoutAccess` |
| **Partner (Studio)** | `profiles.role = 'owner'` | `/portal/studio/*` | `requireOwnerLayoutAccess` |
| **Partner (Vendor)** | `vendor_profiles.status = 'active'` | `/portal/store/*` | `requireVendorLayoutAccess` |
| **Instructor (Academy)** | *TBD (academy_instructors)* | `/portal/academy/*` | *PLANNING: requireInstructorAccess* |
| **Event Partner** | *TBD (event_organizers)* | `/portal/events/*` | *PLANNING: requireOrganizerAccess* |
| **Admin (Staff)** | `admin_users.admin_role` | `/admin/*` | `requireAdminLayoutAccess` |

---

## 3. ROLE ASSUMPTIONS & BOUNDARIES

### 3.1 Customer Boundary
*   **Access:** Can manage own profile, view own rewards, and browse public discovery (studios, marketplace).
*   **RLS Assumption:** `profiles` table restricts non-PII read to all, but private fields (email, phone) to `auth.uid()`.

### 3.2 Partner Boundary (Studio/Vendor)
*   **Access:** Can manage their own business entities (studios or store inventory).
*   **Assumption:** A user can potentially be both a Studio Owner and a Vendor. The current system uses separate guards (`requireOwnerLayoutAccess` vs `requireVendorLayoutAccess`), which might cause session conflicts if not handled as multi-role profiles.

### 3.3 Admin (Staff) Boundary
*   **Access:** High-privilege access to platform-wide statistics, application reviews, and manual overrides.
*   **Boundary:** Uses a separate `admin_users` table to isolate staff privileges from the public `profiles` table. This is a secure pattern.

---

## 4. FUTURE RLS & SESSION HARDENING (PLANNING ONLY)

### 4.1 Multi-Role Logic
*   **Requirement:** Transition `profiles.role` from a string to a role-set or check across multiple entity tables (`studios`, `vendor_profiles`, `instructors`).
*   **RLS Pattern:** `auth.jwt() ->> 'role'` should be enriched via custom claims to reduce DB lookups during RLS checks.

### 4.2 Cross-Tenant Isolation
*   **Studio Owners:** Ensure RLS prevents `studio_A_owner` from seeing `studio_B_bookings` even if they share the same API endpoint.
*   **Vendors:** Ensure `vendor_profiles` RLS restricts inventory updates to the specific `vendor_id`.

---

## 5. BLOCKED TASKS (REQUIRE EXPLICIT APPROVAL)

The following activities are on hold until Phase 54:
1.  **NO Auth Logic Changes:** Do not modify `lib/route-guards.ts` or `lib/auth-guards.ts`.
2.  **NO Database Mutation:** Do not run SQL to add new roles or modify the `profiles` schema.
3.  **NO Metadata/JWT Hacks:** Do not implement custom JWT claims via Supabase hooks.
4.  **NO Backend Implementation:** Do not create vertical-specific access guards for Academy or Tickets.

---

## 6. NEXT STEPS
1.  Approve the Multi-Role data model for unified Partner access.
2.  Review the staff role levels (`super_admin` vs `support`) for granular permissioning in the Admin Dashboard.
3.  Initiate **Patch 106: JWT Claim Optimization** once legal/business logic for roles is finalized.
