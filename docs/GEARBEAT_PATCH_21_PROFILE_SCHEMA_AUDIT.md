# Patch 21 — Profile schema audit

## Objective
Audit the current `public.profiles` schema, its interaction with Supabase Auth metadata, and identify risks of data duplication or fragmentation before future standardization.

## Files Inspected
- `app/profile/page.tsx`: Main profile management logic.
- `lib/auth-guards.ts`: Permission and role derivation system.
- `supabase/migrations/`: Database schema version history.
- `supabase/seed.sql`: Development data reference.

## Current State Summary
- **Data Duplication**: Core identity fields (full name, phone, role) are stored in both the `auth.users` metadata and the `public.profiles` table.
- **Role Fragmentation**: Authorization logic currently checks multiple sources (`app_metadata.role`, `user_metadata.role`, `profiles.role`, `app_metadata.account_type`) to determine access.
- **Client-Side Syncing**: The profile update page performs two separate updates (Auth update and Profile upsert), which increases the risk of partial failures.
- **ID Ambiguity**: The `profiles` table contains both an `id` (primary key) and an `auth_user_id` (foreign key), which creates ambiguity for joins and ownership checks.

## Field Inventory & Redundancy Audit
| Field Category | Sources Found | Redundancy Risk |
| :--- | :--- | :--- |
| **Names** | `full_name`, `name` | Multiple keys used in metadata for the same purpose. |
| **Phones** | `phone`, `phone_number`, `mobile` | Inconsistent naming across Auth metadata and Profiles. |
| **Role** | `role`, `account_type`, `type` | Overlapping concepts for user categorization. |
| **Email** | `auth.users.email`, `profiles.email` | Redundant; Auth email should be the source of truth. |
| **Identity** | `auth.users.id`, `profiles.id`, `profiles.auth_user_id` | Ambiguous mapping between Auth and Profile. |

## Current System Behavior
### Role Derivation (`lib/auth-guards.ts`)
The system uses a tiered fallback strategy to resolve a user's role:
1.  Check `app_metadata.role`.
2.  Check `user_metadata.role`.
3.  Check `app_metadata.account_type`.
4.  Check `user_metadata.account_type`.
5.  Check the `profiles` table as a final fallback.
*Result: This creates a "split-brain" risk where a user could have different roles in metadata vs. the database.*

### Profile Updates (`app/profile/page.tsx`)
Updates are processed in two steps:
1.  `supabase.auth.updateUser`: Updates metadata (names, phone, role, identity fields).
2.  `supabase.from("profiles").upsert`: Syncs the same fields to the persistent database table.

## Risks Identified
- **Mismatched State**: Auth metadata and database records can diverge if one update fails.
- **Escalation Risk**: If `user_metadata` (which users can sometimes edit directly via client libraries) is trusted for role checks, it creates a potential vulnerability.
- **Join Complexity**: Having both `profiles.id` and `profiles.auth_user_id` complicates SQL queries and RLS policy writing.
- **Maintenance Overhead**: Adding a new profile field requires updating multiple locations in the code and ensuring sync logic is preserved.

## Recommended Future Direction
- **Single Source of Truth (SSOT)**: Standardize on the `public.profiles` table as the authority for roles and permissions.
- **ID Consolidation**: Ensure `profiles.id` is the same as `auth.users.id` (Patch 22).
- **Reduced Metadata**: Use `user_metadata` only for UI-only preferences (e.g., theme, display name) and keep security-critical data in the database.
- **Server-Side Enforcement**: Move profile/metadata syncing to a database trigger or a single Server Action to ensure atomic updates.

## Explicit Out of Scope
- No SQL migrations or database changes.
- No modifications to auth guard or login logic.
- No changes to UI components or profile forms.
