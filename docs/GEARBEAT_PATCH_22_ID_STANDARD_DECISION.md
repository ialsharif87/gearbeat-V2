# Patch 22 — profiles.id vs auth_user_id decision

## Objective
Document the architectural decision and long-term migration strategy for standardizing the relationship between the `public.profiles` table and `auth.users` identity.

## Current State
- **Profiles Table**: Contains both a primary key `id` (UUID) and a separate foreign key `auth_user_id` (UUID) mapping to `auth.users.id`.
- **Logic**: The application code and RLS policies rely heavily on `auth_user_id` or its variants (e.g., `owner_auth_user_id`, `customer_auth_user_id`) for ownership and retrieval.
- **Risk**: Immediate changes to this identity mapping are **High Risk**, as they impact core security, ownership, and authorization logic across all modules (Studios, Bookings, Finance, etc.).

## Decision: Long-Term Target
The target standard for the GearBeat architecture is to consolidate user identity into a single primary key:
**`public.profiles.id` should map exactly to `auth.users.id`.**

> [!IMPORTANT]
> This is a strategic architectural decision. No database schema changes, RLS updates, or code refactors are implemented in Patch 22.

## Rationale
- **Simplification**: Aligns with the standard Supabase profile pattern.
- **Efficiency**: Reduces join complexity and removes redundant identity columns.
- **Security**: Simplifies Row Level Security (RLS) policies (`auth.uid() = id`).
- **Standardization**: Reduces identity ambiguity across different domain tables (Studios, Rewards, Leads).
- **Future-Proofing**: Provides a cleaner foundation for advanced authorization hardening.

## Dependency Inventory (Known References)
- `app/profile/page.tsx`: Uses `auth_user_id` for profile retrieval and upserts.
- `app/customer/page.tsx`: Uses `auth_user_id` for customer dashboard data.
- `lib/auth-guards.ts`: Derives roles and account types using fragmented metadata fallbacks.
- `lib/rewards/fulfillment.ts`: Uses `owner_auth_user_id` to identify studio owners.
- `supabase/migrations/`: Multiple RLS policies depend on `owner_auth_user_id` for record ownership.

## Risks
- **Identity Mismatch**: Existing users may have an `id` that differs from their `auth_user_id`.
- **System Lockout**: Incorrectly implemented RLS changes could prevent users from accessing their own studios or bookings.
- **Data Integrity**: Incomplete migration could lead to "orphaned" records if foreign keys are not updated correctly.
- **Auth Failure**: Breaking the profile lookup will break the entire login and authorization flow.

## Phased Migration Strategy
1.  **Phase 1 (Inventory)**: Conduct a full search of all user identity references (`user_id`, `profile_id`, `auth_user_id`, etc.).
2.  **Phase 2 (Audit)**: Run SQL reports to detect any existing mismatches between `profiles.id` and `profiles.auth_user_id`.
3.  **Phase 3 (Backfill)**: Plan a safe data migration to align `profiles.id` with `auth.users.id` for legacy records.
4.  **Phase 4 (Code Transition)**: Update application reads/writes to prefer the primary `id` column.
5.  **Phase 5 (RLS Transition)**: Update security policies to use the new identity standard.
6.  **Phase 6 (Verification)**: Verify production stability before dropping deprecated columns.
7.  **Phase 7 (Cleanup)**: Remove the `auth_user_id` column in a future maintenance patch.

## Immediate Rules
- **Do not** drop `auth_user_id` in current patches.
- **Do not** change primary keys in existing tables.
- **Do not** update RLS policies to use the new standard yet.
- **Do not** refactor application code to remove `auth_user_id` references yet.

## Explicit Out of Scope
- No SQL migrations or database deployment.
- No modifications to app logic, library code, or auth guards.
- No changes to user-facing behavior or profile management.
