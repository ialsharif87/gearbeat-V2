# Patch 29 — Lock/remove debug and unsafe staff routes

## Overview
This patch hardens the production security posture of the GearBeat administrative dashboard by removing experimental, informational, and unsafe testing routes.

## Objective
The primary objective is to reduce the platform's attack surface by purging administrative utilities that reveal system internals or allow for the creation of unauthorized test accounts with hardcoded credentials.

## Routes Removed
- **`/admin/onboarding-setup`**: **Removed**. This was a critical risk as it allowed administrators to create vendor and owner accounts with hardcoded passwords (`gearbeat123`, `GearBeat2026!`).
- **`/admin/system-health`**: **Removed**. This page exposed internal database schema information and production readiness signals.
- **`/admin/roadmap`**: **Removed**. This was an informational roadmap page containing potentially outdated project planning content.

## Changes Made
- **Sidebar Cleanup**: Removed the "Test Onboarding" and "Roadmap & PDPL" navigation items from `app/admin/AdminSidebar.tsx`.
- **File Purge**: Deleted the underlying page components and associated logic for the removed routes.
- **Dependency Audit**: Verified that no remaining application logic or UI components reference the deleted paths.

## Behavioral Preservation
- **Auth & RLS**: No changes were made to authentication logic, RLS policies, or Supabase migrations.
- **Admin Permissions**: The core administrative permission model remains intact and strictly enforced via the `admin_users` table.
- **Staff Access**: The primary staff login and dashboard functionalities are unaffected.

## Future Recommendations
Any future internal tools or debug utilities should:
1. Be restricted to `super_admin` role only.
2. Be implemented as environment-aware components that are completely disabled in production builds.
3. Avoid hardcoding credentials or exposing sensitive schema details.
