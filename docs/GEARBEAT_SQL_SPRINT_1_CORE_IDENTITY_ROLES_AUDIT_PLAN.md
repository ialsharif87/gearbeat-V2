# GEARBEAT: SQL SPRINT 1 — CORE IDENTITY, ROLES & AUDIT PLAN
**Agent:** Agent 3 — SQL/Database Readiness  
**Status:** DRAFT / PLANNING  
**Date:** 2026-05-15  

---

## 1. PURPOSE OF SQL SPRINT 1
The primary objective of Sprint 1 is to establish a robust, centralized, and auditable identity foundation. This phase moves beyond simple "authenticated vs unauthenticated" checks toward a granular, role-based access control (RBAC) system that can support the complex multi-vertical requirements of GearBeat V2.

## 2. WHY CORE IDENTITY MUST COME FIRST
Core identity, roles, and audit logs are the prerequisites for all other vertical implementations (Studios, Marketplace, Academy, etc.) for the following reasons:
- **Consistent RLS**: Vertical-specific tables (like `bookings` or `marketplace_orders`) need a reliable way to check if a user is a `studio_owner` or a `vendor` without re-implementing role logic in every policy.
- **Security Boundaries**: Real-world operations require strict separation between customer data and administrative tools.
- **Auditability**: Before executing transactions or processing legal consents, the system must have a reliable trail of "who did what" to meet regulatory and investor requirements.
- **Eliminating Service-Role Dependency**: Establishing clear roles allows for more "User-Context" operations, reducing the dangerous reliance on the `supabaseAdmin` service role.

## 3. REQUIRED CORE TABLES

| Table Name | Purpose |
| :--- | :--- |
| **`profiles`** | Extends `auth.users` with application-specific metadata (name, avatar, preferred language). |
| **`role_definitions`** | The "dictionary" of available roles in the system (e.g., `customer`, `super_admin`). |
| **`user_roles`** | Mapping table linking users to one or more roles. |
| **`partner_accounts`** | Represents a business entity (Studio, Vendor, Agency) that can have multiple associated users. |
| **`system_audit_logs`** | A high-integrity trail of sensitive actions (role changes, system setting updates). |
| **`legal_consent_events`**| Immutable record of which version of Terms/Privacy a user has accepted. |

## 4. SUGGESTED ACCESS ROLES
- **customer**: Standard user; can book, buy, and manage personal profile.
- **studio_owner**: Can manage studio profiles, availability, and bookings.
- **vendor**: Can manage marketplace product listings and fulfillment.
- **service_provider**: For specialized service listings (mixing, mastering).
- **instructor**: Academy-specific role for course management.
- **ticket_organizer**: Permissions for event creation and attendee management.
- **support_agent**: Internal role for viewing tickets and assisting users.
- **finance_admin**: Specialized admin for settlements, payouts, and ledger review.
- **content_admin**: Moderation and management of public marketplace/academy content.
- **super_admin**: Full system access (restricted to core developers/ops).

## 5. RLS DIRECTION PER TABLE (DRAFT)
- **`profiles`**: `SELECT` and `UPDATE` restricted to `auth.uid() = auth_user_id`. `SELECT` public for specific fields if needed.
- **`user_roles`**: `SELECT` for self; `INSERT/UPDATE/DELETE` restricted to `super_admin` or via specialized RPC.
- **`role_definitions`**: `SELECT` public (authenticated); `Write` restricted to `super_admin`.
- **`partner_accounts`**: Restricted to members of the partner account or `super_admin`.
- **`system_audit_logs`**: Read-only for `super_admin` and `security_officer`. No `UPDATE/DELETE` allowed.
- **`legal_consent_events`**: Append-only; `SELECT` for self and `compliance_admin`.

## 6. ACCESS BOUNDARIES
- **Admin Boundary**: Accessible only to users with `admin_*` or `super_admin` roles. Must be enforced via middleware + RLS.
- **Partner Portal Boundary**: Accessible to `studio_owner`, `vendor`, and `partner_member` roles. Data must be scoped to their `partner_account_id`.
- **Customer Boundary**: The default scope for all authenticated users.

## 7. PRODUCTION VERIFICATION REQUIREMENTS
Before applying these drafts as migrations, the following must be verified in the production Supabase environment:
1. **Schema Collision**: Ensure no existing tables or triggers conflict with these names.
2. **Auth Hook Support**: Verify if Supabase "Custom Claims" or "Auth Hooks" are preferred over a separate `user_roles` table for performance.
3. **PGRST Configuration**: Ensure `pgrst.db_plan_enabled` is on to audit RLS performance of the new roles.
4. **Extension Availability**: Confirm `uuid-ossp` and `pgcrypto` are active.

## 8. RISKS & ROLLBACK
- **Risk**: Circular dependencies between `profiles` and `user_roles`.
- **Risk**: Performance degradation on complex RLS policies checking roles on every row.
- **Rollback**: Drafts include `DROP` statements (commented) to facilitate clean environment resets during testing.

---

> [!WARNING]
> **DRAFT ONLY**: This document and the associated SQL file are for planning purposes. They have NOT been executed and should NOT be run against a production database without formal review and migration serialization.
