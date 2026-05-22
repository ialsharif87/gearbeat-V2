# Patch 129C — Customer Social Links Migration Execution Gate & Verification Runbook

This runbook defines the validation protocol and checklist for applying the schema migration to create the `public.customer_social_links` table in GearBeat V2.

> [!WARNING]
> This is a documentation/runbook patch only. 
> DO NOT execute SQL, run Supabase CLI, or connect to the database within this patch.

---

## 1. Patch Purpose

The purpose of this patch is to act as a strict quality and security gate prior to executing database modifications. By establishing clear pre-execution, execution, post-verification, and rollback boundaries, we ensure that database schema drift is controlled and that the production environment remains stable.

---

## 2. Current Status

- **Patch 129A (Model Audit)**: Merged successfully.
- **Patch 129B (Schema Draft Migration)**: Merged successfully.
- **Migration File**: The draft SQL file resides locally in the repository at [20260522000001_customer_social_links.sql](file:///c:/Users/iaals/Documents/GitHub/gearbeat-V2/supabase/migrations/20260522000001_customer_social_links.sql).
- **Supabase State**: The `public.customer_social_links` table **does not yet exist** in the live database instance and is not confirmed on staging or production.

---

## 3. Pre-Execution Checklist

Before attempting to apply the migration, the operator must verify:

1. [ ] **Working Directory is Clean**: Run `git status` to ensure there are no uncommitted local code edits.
2. [ ] **Supabase Link Check**: Confirm the local Supabase configuration is correctly linked to the targeted project environment.
3. [ ] **Migration File Match**: Confirm that [20260522000001_customer_social_links.sql](file:///c:/Users/iaals/Documents/GitHub/gearbeat-V2/supabase/migrations/20260522000001_customer_social_links.sql) is the only unapplied migration file in `supabase/migrations/`.
4. [ ] **Backup Verification**: Ensure the current database state has an active backup or snapshot available.

---

## 4. Explicit Approval Requirement

> [!CAUTION]
> **DO NOT RUN THE MIGRATION WITHOUT EXPLICIT APPROVAL.**
> The Supabase migration execution commands below must only be executed by an authorized database administrator. The AI coding agent is forbidden from executing migration commands or SQL writes directly.

---

## 5. Recommended Execution Command

*Note: The following commands are documented for reference only. Do not run these in the current agent session.*

To push the local migration to the linked database:

```bash
# Push migrations to the active remote Supabase database
npx supabase db push
```

---

## 6. Post-Execution Verification Checklist

Once the migration command completes, perform the following verifications (using the Supabase Dashboard, SQL Editor, or read-only tools):

1. [ ] **Verify Migration Record**:
   - Query the migration table to verify `20260522000001_customer_social_links` is logged as successfully applied.
2. [ ] **Verify Table Existence**:
   - Check that `public.customer_social_links` exists in the database.
3. [ ] **Verify Columns**:
   - Verify columns: `id`, `user_id`, `platform`, `url`, `handle`, `visibility`, `moderation_status`, `created_at`, `updated_at`.
4. [ ] **Verify RLS Status**:
   - Confirm Row Level Security is **ENABLED** on `public.customer_social_links`.
5. [ ] **Verify RLS Policies**:
   - Verify the presence of the following five policies:
     * `Customers can select own social links`
     * `Customers can insert own social links`
     * `Customers can update own social links`
     * `Customers can delete own social links`
     * `Admins can manage all customer social links`
6. [ ] **Verify Unique Constraint**:
   - Confirm that the unique constraint `customer_social_links_user_platform_key` on `(user_id, platform)` is active.
7. [ ] **Verify Check Constraints**:
   - Confirm `customer_social_links_platform_check` restricts `platform` to allowed values.
   - Confirm `customer_social_links_url_length` limits URLs to 300 characters.
   - Confirm `customer_social_links_url_format` enforces `http://` or `https://` prefixes.

---

## 7. Rollback & Stop Rules

- **Immediate Stop on Error**: If `npx supabase db push` fails, stop immediately. Do not attempt to run manual SQL hotfixes in the console.
- **No Destructive SQL**: Never execute `DROP TABLE`, `TRUNCATE`, or similar destructive commands unless explicitly approved and backed by a database backup.
- **Do Not Patch Blindly**: If columns or constraints fail verification, rollback to the latest clean backup before editing the migration file.

---

## 8. Development Warning

> [!WARNING]
> **DEVELOPMENT GATE WARNING:**
> Do not build or deploy any production API routes, schema integration models, or frontend UI components that read from or write to `public.customer_social_links` until this database migration is applied, verified, and signed off. Building against un-applied schemas will cause runtime database errors in development and production.

---

## 9. Next Recommended Patch

- **Patch 129D — Customer Social Links API + Validation Layer**:
  - Implement validation helper functions in TypeScript.
  - Create the API endpoints (`GET` and `PUT` at `/api/customer/social-links`) with strict session authentication and input validation.
