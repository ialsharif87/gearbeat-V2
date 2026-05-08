# Patch 25 — seller to vendor mapping

## Overview
This patch establishes **`vendor`** as the canonical role for gear sellers, moving away from the legacy `"seller"` string while maintaining full backward compatibility for existing records.

## Changes Made
- **New Signups**: The vendor signup process (`app/vendor-signup/actions.ts`) already uses the `vendor` role for new account creation. This was verified and remains the standard.
- **Role Handling**:
    - `lib/auth-guards.ts`: Updated `isVendorRole` documentation to reflect the `vendor` (canonical) and `seller` (legacy) relationship.
- **Backward Compatibility**:
    - Existing users with the `seller` role in their profile or metadata remain fully supported and will continue to access the vendor portal.
- **Leads System**:
    - The `provider_leads` table continues to use the `seller` type for lead classification (e.g., in `app/admin/page.tsx`). This preserves existing database semantics and application history.

## Future Recommendations
- **Lead Unification**: A future migration should standardize the `provider_leads.type` column to use `vendor` to align with the profile role convention.
- **Metadata Migration**: A future patch should perform a batch update of `auth.users` metadata and `public.profiles` to migrate any remaining `seller` records to `vendor`.
- **Cleanup**: Once the database and metadata are fully migrated, the legacy `"seller"` alias can be deprecated and removed from the codebase.

## Constraints
- **SQL/RLS**: No database migrations or RLS policy changes were performed in this patch.
- **Auth Flow**: The core authentication and vendor onboarding flows remain unchanged.
