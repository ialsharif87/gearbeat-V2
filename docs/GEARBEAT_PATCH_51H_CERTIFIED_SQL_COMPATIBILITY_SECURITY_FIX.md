# GEARBEAT PATCH 51H — CERTIFIED SQL COMPATIBILITY & SECURITY FIX

## 1. Overview
This patch provides a corrective Supabase migration to resolve schema mismatches encountered during the Patch 51F execution. It ensures compatibility with the pre-existing `studio_tiers` table, completes the missing foundation objects, and hardens Row Level Security (RLS) by removing overly broad public SELECT policies.

---

## 2. Root Cause Analysis (Patch 51F Failure)
- **Error:** `ERROR 42703: column "name" of relation "studio_tiers" does not exist`.
- **Cause:** `studio_tiers` already existed (likely from an earlier unrecorded migration or Patch 100) with a schema using `level` (integer) and `name_en/ar` instead of the planned `name` (enum) and `rank`.
- **Side Effect:** Partial execution left `certified_studios` in a draft state and potentially exposed data via broad `USING (true)` policies.

---

## 3. Implementation Summary

### 3.1 Schema Compatibility
- **studio_tiers:** Source of truth is now the existing schema (`id, level, name_en, name_ar`).
- **certified_studios:** Updated via `ALTER TABLE ADD COLUMN IF NOT EXISTS` to ensure it has required audit fields (`hardware_verified_at`, `acoustics_verified_at`, `business_verified_at`, `trust_score`).
- **Missing Tables:** Safely created `studio_tier_rules`, `studio_certification_history`, `qr_verification_links`, `digital_badges`, and `certification_audit_events`.

### 3.2 Security Hardening
- **Dropped Policies:** 
    - Broad public read policies from Patch 100 or partial Patch 51F (`USING (true)`).
- **New Restricted Policies:**
    - `certified_studios`: Public read restricted to `status = 'approved'` AND non-expired.
    - `studio_tiers`: Public read allowed (labels only).
    - `Admin Mutation`: Restricted to users with `role = 'admin'` in `profiles`.
    - `Owner Read`: Restricted to authenticated studio owners for their own data.

---

## 4. Manual Execution Instructions
1. Open the [Supabase SQL Editor](https://app.supabase.com/).
2. Run the contents of `supabase/migrations/patch_51h_certified_sql_compatibility_security_fix.sql`.
3. Confirm that no errors are returned.

---

## 5. Verification Queries
Run these in the SQL Editor to confirm the fix:

```sql
-- 1. Check table existence
SELECT tablename FROM pg_tables WHERE schemaname = 'public' AND tablename LIKE '%certified%';

-- 2. Verify RLS policies (Ensure no USING true policies remain)
SELECT * FROM pg_policies WHERE tablename IN ('certified_studios', 'studio_tiers');

-- 3. Check columns in certified_studios
SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'certified_studios';
```

---

## 6. Rollback Plan
To revert the corrective changes (Note: This will NOT drop `studio_tiers` as it existed before):
```sql
DROP TABLE IF EXISTS public.certification_audit_events CASCADE;
DROP TABLE IF EXISTS public.digital_badges CASCADE;
DROP TABLE IF EXISTS public.qr_verification_links CASCADE;
DROP TABLE IF EXISTS public.studio_certification_history CASCADE;
DROP TABLE IF EXISTS public.studio_tier_rules CASCADE;
-- Do not drop certified_studios or studio_tiers if they contain production data.
```

---

## 7. Provider-Documents Regression Checks
- [ ] `provider-documents` bucket remains PRIVATE.
- [ ] Direct public access to documents is still BLOCKED.
- [ ] Signed URLs are still functional for authorized users.

---

## 8. Acceptance Checklist
- [x] Corrective migration created (Patch 51H).
- [x] Compatibility with existing `studio_tiers` ensured.
- [x] Security hardening (RLS) implemented.
- [x] No app UI or routing changes made.
- [x] Build passes verification.
