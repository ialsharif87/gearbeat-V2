# GEARBEAT PATCH 48D — PROVIDER DOCUMENT URL PATH MIGRATION

## 1. Overview
This patch provides the implementation draft for migrating existing provider document references from absolute public URLs to relative storage paths. This migration is the final prerequisite before the `provider-documents` storage bucket can be secured with a **PRIVATE** access policy.

## 2. Implementation Details

### SQL Migration Draft: `docs/sql-drafts/patch_48d_provider_document_url_path_migration.sql`
> [!CAUTION]
> **This SQL is a DRAFT ONLY.** It is intentionally stored in the `docs/sql-drafts/` directory to prevent it from being auto-applied by the GitHub Actions migration workflow. It **must not** be applied automatically and requires a thorough manual review before execution in any environment.

- **Targeting:** Uses PostgreSQL `split_part` to isolate the relative storage path from the legacy public URL prefix.
- **Safety:** Updates only records that match the standard Supabase public storage URL pattern (`http%/%/provider-documents/%`).
- **Idempotency:** If a record is already a relative path (does not contain the URL prefix), it will not be modified.

### Affected Fields
| Table | Fields |
|---|---|
| `studio_applications` | `cr_document_url`, `vat_certificate_url`, `national_address_url`, `bank_document_url`, `contract_url` |
| `provider_leads` | `cr_document_url`, `vat_document_url`, `national_address_url`, `bank_document_url` |

## 3. Migration Procedure

### Step 1: Pre-Migration Audit
Run the verification queries defined in `GEARBEAT_PATCH_48C` to confirm the number of records requiring migration.

### Step 2: Dry Run (Optional but Recommended)
Run the migration within a transaction and check the results before committing:
```sql
BEGIN;
-- Run contents of patch_48d SQL
SELECT cr_document_url FROM studio_applications LIMIT 10;
ROLLBACK; -- or COMMIT;
```

### Step 3: Execution
This script must be executed **manually** via the Supabase SQL Editor or CLI after verification. It is not part of the automated CI/CD pipeline.


## 4. Verification & Hardening Roadmap

### Immediate Verification
1. Verify that document links in the Admin Dashboard (Leads/Applications) still load correctly.
2. Confirm that the database values for migrated records no longer start with `http`.

### Final Hardening (Patch 48E)
Once this migration is verified in production:
1. Set the `provider-documents` bucket to **PRIVATE** in the Supabase Dashboard.
2. Verify that documents are still accessible via the signed URL logic implemented in Patch 48B1.

## 5. Safety Confirmation
- **Draft Only:** This SQL has **not** been applied to any environment. It is a implementation draft for review.
- **No Data Deletion:** The migration only modifies string prefixes; no records or files are deleted.
- **No Infrastructure Changes:** No storage bucket settings or RLS policies are modified by this patch.
