# Patch 27 — Admin route guard cleanup

## Overview
This patch standardizes the authorization and redirection logic within the platform's route guards, ensuring full alignment with the new canonical role standards and the centralized routing system.

## Changes Made
- **Standardized Redirections**: Refactored `lib/route-guards.ts` to use the centralized `dashboardPathForRole` helper from Patch 26. This eliminates hardcoded path strings like `"/portal/studio"` and `"/admin"` across the guard layer.
- **Robust Role Verification**: Updated guards to use robust verification helpers (`isOwnerRole`, `isAdminRole`, `isCustomerRole`) instead of strict string comparisons. This ensures that guards correctly handle both canonical roles (e.g., `studio_owner`) and legacy aliases (e.g., `owner`).
- **Enhanced Admin Protection**:
    - Access to the `/admin` area continues to be strictly enforced through the `admin_users` table.
    - If a non-admin user attempts to access `/admin`, they are now gracefully redirected to their respective dashboard using the standardized routing logic, with `/staff-access` remaining as the ultimate fallback.
- **Improved Guard Interoperability**:
    - `requireOwnerLayoutAccess` now correctly handles admin users and customers by redirecting them to their appropriate zones using the unified helper.

## Behavioral Preservation
- **Admin Security**: No changes were made to the core authorization rules or the `admin_users` verification process.
- **Destination Integrity**: Users continue to reach the same functional areas, but through a more maintainable and centralized redirection logic.
- **Infrastructure**: No changes to `middleware.ts`, RLS policies, or Supabase migrations.

## Constraints
- **Circular Imports**: Verified that the cross-imports between `lib/route-guards.ts`, `lib/auth-guards.ts`, and `lib/role-routing.ts` do not create circular dependency issues.
- **Client Safety**: The core routing logic remains in the client-safe `lib/role-routing.ts`.
