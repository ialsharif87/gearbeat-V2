# GEARBEAT PATCH 31 — LEAD-TO-STUDIO CONVERSION FIX

## 1. Overview
This patch fixes critical data mapping and role handling issues in the admin application approval workflow. It ensures that new studio owners are assigned the canonical `studio_owner` role and that their studio records are correctly prepopulated with application data while preventing duplicate studio creation.

## 2. What Was Fixed
- **Canonical Role Assignment:** New approved owners are now explicitly assigned the `studio_owner` role (as established in Patch 24) instead of the legacy `owner` role.
- **Improved Data Mapping:**
    - Corrected the `city` mapping (previously incorrectly used the `country` field).
    - Mapped the `about_company` description from the application to the studio record.
- **Duplicate Prevention:** Added logic to `giveFinalApproval` that checks for existing studio records linked to the owner before attempting to create a new one. This prevents multiple studio records for the same provider if the activation process is re-run.
- **Backward Compatibility:** Maintained support for existing users with the `owner` role via the `isOwnerRole` helper in `lib/auth-guards.ts`.

## 3. Current Lead-to-Studio Flow
1.  **Stage 1 (Initial Approval):** 
    - Admin reviews the application.
    - Admin clicks "Approve". 
    - Auth user is created/updated with `role: "studio_owner"`.
    - Profile is upserted with `role: "studio_owner"` and `account_status: "approved"`.
2.  **Stage 2 (Final Activation):** 
    - Admin reviews signed contract.
    - Admin clicks "Final Activation".
    - System checks for an existing studio for the `linked_user_id`.
    - If none exists, a new studio is created using:
        - `name_en` / `name_ar` (from Company Name)
        - `city` (from City)
        - `description` (from About Company)
    - If a studio exists, it ensures the status is `approved` and `verified: true` if it was previously `pending`.
    - User `account_status` is set to `active`.

## 4. Role Handling Decision
- **Canonical Role:** `studio_owner`.
- **Legacy Role:** `owner`.
- **Strategy:** All new approvals use `studio_owner`. All guards and UI logic continue to support both strings to ensure zero breakage for existing production users.

## 5. Duplicate Prevention Logic
The system now uses the `maybeSingle()` check on the `studios` table filtered by `owner_auth_user_id`. If a record is found, the `insert` operation is bypassed, and an `update` is optionally applied to ensure the studio is active.

## 6. Known Limitations
- **Multi-Studio Support:** Currently, the system still only auto-creates/links *one* studio. Providers planning multiple studios must add subsequent studios manually through the owner portal or admin dashboard.
- **Document Linking:** CR and VAT documents remain linked to the `studio_applications` record but are not yet explicitly linked as compliance documents in the `studios` table (this requires a future schema update).

## 7. Future SQL/RLS Requirements
- Migration to move existing `owner` users to `studio_owner` (Batch F).
- Schema update to link `studio_applications` directly to `studios` via `studio_id`.
- Compliance document relationship mapping in the `studios` table.
