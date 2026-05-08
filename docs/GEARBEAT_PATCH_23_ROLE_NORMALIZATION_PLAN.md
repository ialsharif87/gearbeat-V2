# Patch 23 — Role naming normalization plan

## Objective
Audit the current fragmented role naming model and define a safe, phased migration strategy for consolidating internal technical roles into consistent, stable business roles.

## Current State
- **Role Fragmentation**: The `GearBeatRole` type currently supports multiple overlapping strings (e.g., `owner`/`studio_owner`, `vendor`/`seller`, `customer`/`user`).
- **Hybrid Support**: The `auth-guards` library currently uses logical grouping (e.g., `isOwnerRole`) to accept multiple legacy aliases for the same logical role.
- **Sync Risks**: Roles are stored in both `auth.users.user_metadata` and `public.profiles.role`, creating potential for "split-brain" states if one source is updated without the other.

## Role Inventory (Current/Observed)
- `admin`: System administrator.
- `super_admin`: Full system access (distinct from `admin`).
- `owner` / `studio_owner`: Users who own and manage music studios.
- `vendor` / `seller`: Users who sell gear or products.
- `user` / `customer`: General platform users/buyers.

## Recommended Target Role Model
The following mapping is proposed for future standardization:
- `owner` -> **`studio_owner`**
- `seller` -> **`vendor`**
- `user` -> **`customer`**
- `super_admin` -> **Keep distinct** (to be reviewed for separate authorization scopes).
- `admin` -> **`admin`**

> [!IMPORTANT]
> This is a planning document only. No role strings are being modified or deprecated in this patch.

## Impact Analysis
A future role migration will affect:
- **Authorization**: `lib/auth-guards.ts` and `lib/route-guards.ts`.
- **Database Security**: RLS policies across all domain tables (Studios, Bookings, Finance).
- **Identity Storage**: `public.profiles.role` column and `auth.users` metadata.
- **Ownership Logic**: Rewards, fulfillment, and accounting triggers.
- **UI Navigation**: Dashboard redirection and portal visibility.

## Risks
- **Authorization Denial**: If a role is renamed but an RLS policy is not updated, legitimate users may be locked out.
- **Dashboard Mismatch**: Users may be redirected to the wrong portal if metadata and profiles diverge.
- **KYC/Identity Linkage**: Role changes must ensure identity verification status (Patch 15) remains linked to the correct profile.
- **Bilingual Labels**: Normalization must maintain accurate Arabic and English naming conventions.

## Phased Migration Strategy
1.  **Phase 1 (Inventory)**: Finalize the list of every code and database reference to legacy roles.
2.  **Phase 2 (Canonical Definition)**: Establish the final canonical role enum and business-facing labels.
3.  **Phase 3 (Hybrid Support)**: Update `auth-guards` to prefer canonical roles while gracefully accepting legacy aliases.
4.  **Phase 4 (Database Migration)**: Run a controlled SQL migration to update `public.profiles.role`.
5.  **Phase 5 (Auth Migration)**: Use a secure server-side batch process (Admin API) to update `auth.users` metadata.
6.  **Phase 6 (UI Transition)**: Update dashboard labels and portal navigation only after backend consistency is verified.
7.  **Phase 7 (Deprecation)**: Remove legacy alias support from the codebase after production stability is confirmed.

## Immediate Rules
- **Do not** change role names or enums in this patch.
- **Do not** modify RLS policies.
- **Do not** merge `admin` and `super_admin` without a separate security review.
- **Do not** remove support for legacy aliases (e.g., `owner`, `seller`) from the code.

## Explicit Out of Scope
- No SQL migrations or data updates.
- No modifications to app logic, library code, or auth guards.
- No changes to existing authorization, login, or routing behavior.
