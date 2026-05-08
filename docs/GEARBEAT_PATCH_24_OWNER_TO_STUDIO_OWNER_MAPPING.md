# Patch 24 — owner to studio_owner mapping

## Overview
This patch establishes **`studio_owner`** as the canonical role for studio managers, moving away from the legacy `"owner"` string while maintaining full backward compatibility.

## Changes Made
- **New Signups**: The signup page (`app/signup/SignupClient.tsx`) now explicitly creates new accounts with the `studio_owner` role.
- **Role Handling**:
    - `lib/auth-guards.ts`: Updated `GearBeatRole` types with documentation. `isOwnerRole` continues to support both `owner` and `studio_owner`.
    - `app/login/page.tsx`: Redirection logic already supports both roles.
    - `app/profile/page.tsx`: Updated validation and UI labels to recognize both roles.
- **Backward Compatibility**:
    - Existing users with the `owner` role will still be correctly identified as studio owners.
    - Legacy URL parameters (e.g., `?account=owner`) are automatically mapped to the `studio_owner` state during signup.

## Future Recommendations
- **Metadata Migration**: A future patch should perform a batch update of `auth.users` metadata and `public.profiles` to migrate existing `owner` records to `studio_owner`.
- **Cleanup**: Once the database and metadata are fully migrated, the legacy `"owner"` alias can be deprecated and removed from the codebase.

## Constraints
- **SQL/RLS**: No database migrations or RLS policy changes were performed in this patch.
- **Auth Flow**: The core authentication and OTP flows remain unchanged.
