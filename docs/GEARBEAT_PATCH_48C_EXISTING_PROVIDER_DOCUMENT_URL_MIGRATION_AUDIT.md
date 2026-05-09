# GEARBEAT PATCH 48C — EXISTING PROVIDER DOCUMENT URL MIGRATION AUDIT

## 1. Overview
As part of the storage hardening workstream (Patch 48 series), we have transitioned the application from storing absolute public URLs to storing relative storage paths (keys) for all provider documents. This audit defines the strategy for migrating existing database records to this new format, enabling the `provider-documents` bucket to be transitioned to **PRIVATE** access.

## 2. Targeted Tables and Fields

### A. `studio_applications` (Studio Owners)
- `cr_document_url`
- `vat_certificate_url`
- `national_address_url`
- `bank_document_url`
- `contract_url` (Signed contracts)

### B. `provider_leads` (Sellers)
- `cr_document_url`
- `vat_document_url`
- `national_address_url`
- `bank_document_url`

## 3. URL Pattern Recognition

### Valid Legacy Format
The migration targets URLs following the Supabase public storage pattern:
`https://[PROJECT_REF].supabase.co/storage/v1/object/public/provider-documents/[PATH]`

### Key Identifiers:
- **Domain:** `supabase.co`
- **Prefix:** `/storage/v1/object/public/`
- **Bucket:** `provider-documents`

## 4. Extraction Logic
The logic for converting a URL to a path is implemented in `lib/storage/provider-documents.ts`:
1. Check if string starts with `http`.
2. Locate the substring after `/object/public/provider-documents/`.
3. URL-decode the remaining string to get the clean storage path.
4. If no bucket match is found or format is unrecognized, the record should remain unchanged (to avoid data loss).

## 5. Migration Execution Plan (SQL)

### Pre-Migration Step (Audit Only)
Before running updates, use the following queries to count affected records:
```sql
-- studio_applications audit
SELECT count(*) 
FROM studio_applications 
WHERE cr_document_url LIKE 'http%' 
   OR vat_certificate_url LIKE 'http%' 
   OR national_address_url LIKE 'http%' 
   OR bank_document_url LIKE 'http%';

-- provider_leads audit
SELECT count(*) 
FROM provider_leads 
WHERE cr_document_url LIKE 'http%' 
   OR vat_document_url LIKE 'http%' 
   OR national_address_url LIKE 'http%' 
   OR bank_document_url LIKE 'http%';
```

### Proposed Update Logic (Concept)
The actual update will use regex replacement or substring extraction to strip the URL prefix:
```sql
UPDATE studio_applications
SET cr_document_url = split_part(cr_document_url, '/provider-documents/', 2)
WHERE cr_document_url LIKE '%/provider-documents/%';
-- Repeat for other fields and tables
```

## 6. Verification Plan

### Success Criteria:
1. No records in `studio_applications` or `provider_leads` start with `http` for the `provider-documents` bucket.
2. The Admin Dashboard (using Patch 48B1 signed-url logic) continues to correctly load documents.
3. Storage bucket `provider-documents` can be set to **PRIVATE** without breaking links.

### Data Integrity Check:
Compare a sample of paths before and after to ensure no corruption occurred during substring extraction.

## 7. Rollback Strategy
- **Database Backup:** Ensure a full backup of the targeted tables exists before execution.
- **Reverse Migration:** Legacy public URLs can be reconstructed by prefixing the relative paths with the public storage URL if necessary, though this is not recommended once the bucket is private.

## 8. Safety & Prerequisites
- **PREREQUISITE:** Patch 48B1 (Signed URL UI Support) must be deployed and verified in production.
- **PREREQUISITE:** Patch 48B2 (New Path Storage) must be active to ensure no new public URLs are created during the migration window.
- **STAY PUBLIC:** The `provider-documents` bucket **MUST remain public** until this migration is completed and verified. Transitioning to private before the database contains clean relative paths will immediately break all legacy document links.
