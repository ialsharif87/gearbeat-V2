# GEARBEAT PATCH 51G — CERTIFIED SUPABASE MIGRATION EXECUTION & VERIFICATION RUNBOOK

## 1. Overview
The purpose of this runbook is to provide a controlled, step-by-step procedure for manually executing and verifying the **GearBeat Certified Foundation** SQL migration (from Patch 51F) on the production Supabase environment.

**IMPORTANT:** This patch is documentation-only. SQL execution must be performed manually and deliberately by an authorized administrator.

---

## 2. Current Status
- **Migration File:** `supabase/migrations/patch_51f_create_gearbeat_certified_foundation.sql`
- **Vercel Production:** Current / Ready.
- **SQL Execution State:** PENDING (Migration has NOT been applied to production).

---

## 3. Pre-Execution Checklist
Before running the migration, confirm the following:
- [ ] Latest `main` branch is fully deployed to Vercel.
- [ ] Vercel Production status is "Ready" with no active build failures.
- [ ] `supabase/migrations/patch_51f_create_gearbeat_certified_foundation.sql` exists and is reviewed.
- [ ] `provider-documents` storage bucket is verified PRIVATE.
- [ ] Capture a screenshot or export of the current Supabase Table list for reference.

---

## 4. Manual Execution Procedure

### Option A: Supabase SQL Editor (Recommended)
1. Log in to the [Supabase Dashboard](https://app.supabase.com/).
2. Navigate to the **SQL Editor**.
3. Create a **New Query**.
4. Name it: `Patch 51F - Certified Foundation`.
5. Copy the entire contents of `supabase/migrations/patch_51f_create_gearbeat_certified_foundation.sql`.
6. Paste the SQL into the editor.
7. **CRITICAL:** Confirm you are connected to the correct project (Production vs Staging).
8. Click **Run**.

### Option B: Supabase CLI
If the Supabase CLI is configured and linked to the project:
```bash
supabase db push
```

---

## 5. Post-Execution Verification Checklist

### 5.1 Schema Objects
- [ ] **Enums:** `certification_status` and `studio_certified_tier` exist in the `public` schema.
- [ ] **Tables:** The following 7 tables exist:
    - `studio_tiers`
    - `studio_tier_rules`
    - `certified_studios`
    - `studio_certification_history`
    - `qr_verification_links`
    - `digital_badges`
    - `certification_audit_events`
- [ ] **Indexes:** `idx_certified_studios_status`, `idx_qr_verification_token`, etc., are active.
- [ ] **Seed Data:** `studio_tiers` contains 5 rows (`verified` to `flagship`).

### 5.2 Security & RLS
- [ ] **RLS Enabled:** RLS is toggled ON for all 7 new tables.
- [ ] **Public Policies:** 
    - `studio_tiers`: Public read allowed.
    - `certified_studios`: Public read restricted to `status = 'approved'` and non-expired.
- [ ] **Admin Policies:** Full access restricted to `profiles.role = 'admin'`.
- [ ] **Audit Tables:** `certification_audit_events` has NO public read policies.

---

## 6. Verification SQL Queries
Run these snippets in the SQL Editor to verify the state:

```sql
-- 1. Check for seeded tiers
SELECT * FROM public.studio_tiers ORDER BY rank ASC;

-- 2. Verify RLS status
SELECT tablename, rowsecurity FROM pg_tables WHERE schemaname = 'public' AND tablename LIKE '%certified%';

-- 3. Verify public read policy for certified_studios
SELECT * FROM pg_policies WHERE tablename = 'certified_studios' AND policyname = 'Public can view approved active certifications';
```

---

## 7. Provider-Documents Regression Checks
Ensure the certification migration did not impact storage security:
- [ ] **Bucket Privacy:** `provider-documents` remains "Private" in the dashboard.
- [ ] **RLS:** Public `SELECT` and `INSERT` policies remain absent from the bucket.
- [ ] **Access:** Direct public URL to an object still returns `403 Forbidden` or `401 Unauthorized`.
- [ ] **Signed URLs:** `getSignedDocumentUrlAction` still returns valid, temporary access links.

---

## 8. Rollback Plan
If the migration causes instability or data corruption, execute the following to revert:
```sql
DROP TABLE IF EXISTS public.certification_audit_events CASCADE;
DROP TABLE IF EXISTS public.digital_badges CASCADE;
DROP TABLE IF EXISTS public.qr_verification_links CASCADE;
DROP TABLE IF EXISTS public.studio_certification_history CASCADE;
DROP TABLE IF EXISTS public.certified_studios CASCADE;
DROP TABLE IF EXISTS public.studio_tier_rules CASCADE;
DROP TABLE IF EXISTS public.studio_tiers CASCADE;
DROP TYPE IF EXISTS public.certification_status;
DROP TYPE IF EXISTS public.studio_certified_tier;
```

---

## 9. Final Reporting Template
*Please fill this out after manual execution:*

- **Execution Date:** 
- **Executed By:** 
- **Method:** (SQL Editor / CLI)
- **Result:** (Success / Failure)
- **Verification Logs:** (Attach or paste query results)
- **Issues Encountered:** 
