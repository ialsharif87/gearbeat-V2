# Patch 26 — Dashboard redirect cleanup

## Overview
This patch centralizes the dashboard redirection logic into a client-safe utility, ensuring consistent routing across the platform and reducing redundancy in the login flow.

## Changes Made
- **Centralized Logic**: Created `lib/role-routing.ts`, a client-safe utility that calculates the correct dashboard path based on a user's role.
- **Login Refactor**: Updated `app/login/page.tsx` to use `dashboardPathForRole()` instead of repeating hardcoded redirection blocks. This affected:
    - Initial session check (auto-redirect).
    - Standard password login.
    - OTP verification success flow.
- **Server Guard Alignment**: Updated `lib/auth-guards.ts` to delegate its `dashboardPathForRole` function to the new centralized utility, ensuring a single source of truth for both client and server.

## Behavioral Preservation
- **Routes**: Redirect destinations remain identical:
    - `admin` / `super_admin` -> `/admin`
    - `owner` / `studio_owner` -> `/portal/studio`
    - `vendor` / `seller` -> `/portal/store`
    - `customer` / `user` / `null` -> `/customer`
- **Auth Flow**: No changes were made to authentication, OTP, or trusted device logic.
- **UI**: No visual changes were introduced to the login or portal pages.

## Constraints
- **Client Safety**: `lib/role-routing.ts` is strictly decoupled from server-only logic, making it safe for use in `"use client"` components.
- **Backward Compatibility**: Supported role aliases (`owner`, `seller`, `user`) are preserved in the path calculation.
