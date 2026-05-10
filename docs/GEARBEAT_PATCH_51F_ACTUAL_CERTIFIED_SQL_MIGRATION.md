# GEARBEAT PATCH 51F — ACTUAL CERTIFIED SQL MIGRATION

## 1. Migration Overview
- **Migration File:** `supabase/migrations/patch_51f_create_gearbeat_certified_foundation.sql`
- **Objective:** Establish the live database foundation for the GearBeat Certified program.
- **Scope:** Enums, Tables, Indexes, Constraints, and RLS Policies.

---

## 2. Database Objects Created

### 2.1 Enums & Types
- `certification_status`: `(pending, approved, rejected, suspended, expired)`
- `studio_certified_tier`: `(verified, trusted, premium, elite, flagship)`

### 2.2 Tables
- `studio_tiers`: Metadata for trust levels.
- `studio_tier_rules`: Configuration for audit requirements.
- `certified_studios`: Core junction for certification status.
- `studio_certification_history`: Audit trail for mutations.
- `qr_verification_links`: Secure tokens for verification.
- `digital_badges`: Digital trust seal metadata.
- `certification_audit_events`: Technical scan/audit logs.

### 2.3 Indexes
- Unique index on `certified_studios.studio_id`.
- Unique index on `qr_verification_links.verification_token`.
- Performance indexes on `status`, `certified_studio_id`, and `verification_token`.

---

## 3. RLS Security Enforcement

- **Public SELECT:** 
    - `studio_tiers`: Always readable.
    - `certified_studios`: Readable only if `status = 'approved'` AND not expired.
- **Studio Owner SELECT:**
    - Can read their own `certified_studios`, `qr_verification_links`, and `studio_certification_history`.
- **Admin ALL:**
    - Full management rights restricted to users with the `admin` role in the `profiles` table.
- **Global Constraints:**
    - No public INSERT/UPDATE/DELETE policies.
    - No direct public access to `certification_audit_events`.

---

## 4. Manual Execution & Deployment Notes
1. **Migration Sequence:** This migration assumes `studios` and `profiles` tables already exist in the environment.
2. **Supabase CLI:** If deploying via CLI, run `supabase db push`.
3. **Manual SQL Editor:** Copy and paste the contents of `patch_51f_create_gearbeat_certified_foundation.sql` into the Supabase SQL Editor and execute.
4. **Trigger Dependency:** The migration includes an optional trigger for `updated_at` that only attaches if the `handle_updated_at()` function exists.

---

## 5. Testing & Verification Checklist

- [ ] Verify `studio_tiers` table is seeded with the 5 official levels.
- [ ] Confirm `certified_studios` RLS blocks anonymous read of `pending` records.
- [ ] Confirm `qr_verification_links` tokens are auto-generated as UUIDs.
- [ ] Verify foreign key cascade behavior on `studios` deletion.

---

## 6. Rollback Procedure
To revert these changes, execute the following in the SQL Editor:
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

## 7. Acceptance Confirmation
- [x] Migration file created in `supabase/migrations/`.
- [x] No application UI or routing changes made.
- [x] `provider-documents` logic and storage policies remain untouched.
- [x] Schema follows Patches 51A/C/D/E planning.
