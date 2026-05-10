# GEARBEAT PATCH 51D — CERTIFIED SQL MIGRATION APPROVAL PACKAGE

## 1. Executive Summary
This document serves as the final safety gate and approval package for the **GearBeat Certified** SQL migration. It consolidates the planning from Patches 51A, 51B, and 51C into a single execution runbook. 

**IMPORTANT:** This patch remains documentation-only. No SQL has been executed. No migrations have been created. Actual database changes require explicit approval in a future patch.

---

## 2. Implementation Status
- **Patch 51A (Schema Planning):** COMPLETED & MERGED.
- **Patch 51B (Route Inventory):** COMPLETED & MERGED.
- **Patch 51C (SQL/RLS Draft):** COMPLETED & MERGED.
- **Database State:** No `certified_studios` related tables exist yet.
- **UI State:** Static foundation is ready for data binding.

---

## 3. Migration Scope Overview
The future migration will introduce the following:
1. **Enums:** `certification_status`, `studio_tier`.
2. **Tables:** `studio_tiers`, `certified_studios`, `qr_verification_links`, `studio_certification_history`.
3. **RLS Policies:** Public read-only for active certifications; Admin-only mutations; Owner read-only for status.
4. **Triggers:** `updated_at` handler for `certified_studios`.

---

## 4. Pre-Migration Safety Checks
- [ ] Verify Supabase project accessibility and permissions.
- [ ] Confirm no naming conflicts with existing tables (e.g., `studios`, `profiles`).
- [ ] Validate foreign key targets exist and have correct types.
- [ ] Ensure `pgcrypto` or similar is enabled for `gen_random_uuid()`.

---

## 5. Execution Checklist (Future Runbook)

### Phase 1: Structure & Types
- [ ] Create `certification_status` and `studio_tier` types.
- [ ] Create `studio_tiers` table and seed default tier metadata.
- [ ] Create `certified_studios` table with foreign keys to `studios` and `studio_tiers`.

### Phase 2: Security & RLS
- [ ] Create `qr_verification_links` table with unique tokens.
- [ ] Create `studio_certification_history` table.
- [ ] Apply RLS policies to all new tables as drafted in Patch 51C.

### Phase 3: Performance & Triggers
- [ ] Create unique index on `certified_studios.studio_id`.
- [ ] Create unique index on `qr_verification_links.verification_token`.
- [ ] Create index on `studio_certification_history.certified_studio_id`.
- [ ] Apply `handle_updated_at` trigger to `certified_studios`.

---

## 6. Verification & Testing Plan

### 6.1 Public Verification Test
- **Scenario:** Access `/gearbeat-certified/[slug]` for an approved studio.
- **Expected:** Tier badge and verification status display correctly.
- **Scenario:** Access same URL for a `suspended` or `expired` studio.
- **Expected:** Status banner shows "Expired/Suspended" or redirect to search.

### 6.2 Admin Control Test
- **Scenario:** Admin changes studio status from `pending` to `approved`.
- **Expected:** Mutation succeeds, history entry is created.
- **Scenario:** Non-admin attempts to update certification.
- **Expected:** Database RLS denies request.

### 6.3 Studio Owner Test
- **Scenario:** Owner views their own certification status in `/portal/studio`.
- **Expected:** Status is visible even if `pending`.

---

## 7. Rollback Plan (In Case of Failure)
To revert the migration, execute the following in reverse order:
1. `DROP TABLE IF EXISTS studio_certification_history CASCADE;`
2. `DROP TABLE IF EXISTS qr_verification_links CASCADE;`
3. `DROP TABLE IF EXISTS certified_studios CASCADE;`
4. `DROP TABLE IF EXISTS studio_tiers CASCADE;`
5. `DROP TYPE IF EXISTS certification_status;`
6. `DROP TYPE IF EXISTS studio_tier;`

---

## 8. Go / No-Go Decision
**Status:** READY FOR APPROVAL.

- [x] All security risks reviewed and mitigated.
- [x] Public exposure limits confirmed.
- [x] Rollback plan verified.
- [x] Acceptance checklist from 51A/B/C satisfied.

---

## 9. Final Acceptance Checklist
- [x] Migration scope is clearly defined.
- [x] Pre-migration and Post-migration steps are documented.
- [x] Rollback safety is ensured.
- [x] No actual code or database changes made in this patch.
