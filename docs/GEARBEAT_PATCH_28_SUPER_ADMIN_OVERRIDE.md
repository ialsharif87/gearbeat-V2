# Patch 28 — Super admin override logic

## Overview
This patch implements a "Super Admin" override within the platform's administrative route guards, allowing users with the `super_admin` role to bypass specific functional role restrictions.

## Changes Made
- **God Mode Logic**: Updated `requireAdminLayoutAccess` in `lib/route-guards.ts` to allow users with the `admin_role === "super_admin"` to access any administrative layout, even if they are not explicitly included in the `allowedRoles` list for that section.
- **Security Perimeter Integrity**:
    - **Active Membership Required**: The override is only triggered after the user is verified to be in the `admin_users` table with an `active` status.
    - **Profile Role Isolation**: Confirmed that metadata in `public.profiles` (e.g., `role: "super_admin"`) is **not** sufficient for administrative access. Authority is strictly derived from the `admin_users` table.
    - **Functional Guarding**: Standard staff members (e.g., `support`, `finance`) continue to be strictly restricted to their designated `allowedRoles`.

## Behavioral Preservation
- **Database Policies**: No changes were made to RLS policies. Database-level overrides are not included in this application-layer patch.
- **Infrastructure**: No changes to `middleware.ts`, login flows, or trusted-device logic.
- **Destinations**: Redirection targets for unauthorized or inactive users remain unchanged.

## Future Considerations
- **UI Visibility**: Future dashboard updates should ensure that navigation links are visible to `super_admin` users even if the specific functional role is required for the underlying page.
- **Audit Logs**: Access events by `super_admin` override should be monitored to ensure platform accountability.
