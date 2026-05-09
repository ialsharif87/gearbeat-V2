# GEARBEAT PATCH 48E — PROVIDER DOCUMENT MIGRATION EXECUTION CHECKLIST

## 1. Overview
This document outlines the mandatory steps for manually executing the provider document URL-to-path migration. This process is intentionally manual to ensure data integrity before the storage bucket is secured.

## 2. Safety Verification
- [ ] **SQL Isolation:** Confirm that `patch_48d_provider_document_url_path_migration.sql` is located in `docs/sql-drafts/` and **NOT** in `supabase/migrations/`.
- [ ] **Automation Check:** Verify that GitHub Actions will not auto-apply the migration (the workflow is limited to files in `supabase/migrations/**`).
- [ ] **Bucket Status:** Confirm the `provider-documents` storage bucket is still **PUBLIC**.

## 3. Pre-Execution Phase
- [ ] **Database Backup:** Create a manual backup of the `studio_applications` and `provider_leads` tables via the Supabase Dashboard or pg_dump.
- [ ] **Baseline Audit:** Run the following queries and record the counts of records starting with `http`:

```sql
-- Count legacy URLs in studio_applications
SELECT count(*) FROM studio_applications 
WHERE cr_document_url LIKE 'http%' 
   OR vat_certificate_url LIKE 'http%' 
   OR national_address_url LIKE 'http%' 
   OR bank_document_url LIKE 'http%'
   OR contract_url LIKE 'http%';

-- Count legacy URLs in provider_leads
SELECT count(*) FROM provider_leads 
WHERE cr_document_url LIKE 'http%' 
   OR vat_document_url LIKE 'http%' 
   OR national_address_url LIKE 'http%' 
   OR bank_document_url LIKE 'http%';
```

## 4. Execution Phase (Manual)
- [ ] **Editor Access:** Open the Supabase SQL Editor.
- [ ] **Transaction Wrap:** Copy the contents of `docs/sql-drafts/patch_48d_provider_document_url_path_migration.sql` into the editor.
- [ ] **Run:** Execute the SQL script.

## 5. Post-Execution Verification
- [ ] **Migration Check:** Run the baseline audit queries again. All counts should now be **0**.
- [ ] **Path Check:** Run the following query to verify paths are correctly formatted (e.g., they should start with `studio-applications/` or `seller-applications/`):
```sql
SELECT cr_document_url FROM studio_applications WHERE cr_document_url IS NOT NULL LIMIT 5;
SELECT cr_document_url FROM provider_leads WHERE cr_document_url IS NOT NULL LIMIT 5;
```
- [ ] **UI Verification:** Log in to the Admin Dashboard as a Superuser and verify that document links for several old leads still open correctly (using the signed URL logic).

## 6. Critical Rules
- **DO NOT** set the `provider-documents` bucket to private during this phase.
- **DO NOT** delete, move, or rename any files in the storage bucket.
- **DO NOT** modify the SQL logic without a new audit.

## 7. Rollback Notes
If UI verification fails:
- Use the pre-execution backup to restore the `studio_applications` and `provider_leads` tables immediately.
- Document the failure reasons and wait for a new patch.

## 8. Next Steps
Once manual verification is complete and documented, proceed to **Patch 48F: Private Bucket Readiness Audit** to prepare for the final security transition.
