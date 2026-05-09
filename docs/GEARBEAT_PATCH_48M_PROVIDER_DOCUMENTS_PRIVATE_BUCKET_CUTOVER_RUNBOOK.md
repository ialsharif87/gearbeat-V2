# GEARBEAT PATCH 48M — PROVIDER DOCUMENTS PRIVATE BUCKET CUTOVER RUNBOOK

## 1. Overview
This runbook describes the manual steps required in the Supabase Dashboard to complete the privatization of the `provider-documents` storage bucket. This follows the successful hardening of the application logic in Patches 48H through 48L.

## 2. Pre-Cutover Checklist
- [ ] Confirm `Patch 48L` audit has passed.
- [ ] Ensure all code changes are deployed to the environment being cut over.
- [ ] Verify that current users can still upload and view documents while the bucket is public.
- [ ] Notify stakeholders of a brief (5-minute) maintenance window for storage policy updates.

## 3. Manual Supabase Execution Steps

### Step 1: Bucket Settings
1. Navigate to **Storage** -> **Buckets** in the Supabase Dashboard.
2. Select the `provider-documents` bucket.
3. Click on the three dots or **Edit Bucket**.
4. **Action:** Toggle **Public Bucket** to **OFF** (Private).
5. Save changes.

### Step 2: Storage RLS Policies
1. Navigate to **Storage** -> **Policies**.
2. Locate the section for the `provider-documents` bucket.
3. **Action (SELECT):** Delete or Disable the policy that allows `public` or `anon` SELECT access.
4. **Action (INSERT):** Delete or Disable the policy that allows `public` or `anon` INSERT access.
5. **Action (ALL):** Ensure there is no `public` policy remaining.
6. **Confirmation:** Verify that the `service_role` (Supabase Admin) still has access. (This is usually a default policy or handled by the system).

## 4. Post-Cutover Validation

### 4.1 Security Verification (Negative Tests)
- [ ] **Public Read:** Try to access a known document URL directly in a browser (e.g., `https://.../storage/v1/object/public/provider-documents/studio-applications/...`).
    - **Success Criteria:** Should return `{"statusCode":"404","error":"Not Found","message":"Object not found"}` or `403 Forbidden`.
- [ ] **Public Upload:** Try to upload a file to the bucket using a client-side Supabase client without the service role.
    - **Success Criteria:** Should fail with a permission error.

### 4.2 Application Verification (Positive Tests)
- [ ] **Join Flow:** Navigate to `/join/studio` and upload a document.
    - **Success Criteria:** Upload succeeds (uses `uploadProviderDocumentAction` with service role).
- [ ] **Admin Review:** Navigate to `/admin/leads/[id]` as an admin.
    - **Success Criteria:** All document links (CR, VAT, etc.) open correctly (uses authorized signed URLs).
- [ ] **Owner Portal:** Navigate to `/portal/studio/contract` as a studio owner.
    - **Success Criteria:** Signed contract view link works (uses ownership-verified signed URL).
- [ ] **Contract Uploader:** Verify the `ContractUploader` component in any flow.
    - **Success Criteria:** Upload and immediate view both work correctly.
- [ ] **Legacy URLs:** Test a record that still has an absolute URL in the database.
    - **Success Criteria:** Signed URL is correctly generated via normalization logic.

## 5. Rollback Plan

### If Validation Fails:
1. **Action 1 (Bucket):** Re-toggle **Public Bucket** to **ON** in the bucket settings.
2. **Action 2 (Policies):** Re-create or re-enable the `public` SELECT and INSERT policies.
    - SELECT: `(bucket_id = 'provider-documents'::text)` for `anon`.
    - INSERT: `(bucket_id = 'provider-documents'::text)` for `anon`.
3. **Investigation:** Check the Edge Function logs or Server Action logs for specific permission errors.

## 6. Final Success Criteria
- [x] Bucket `provider-documents` is set to **Private**.
- [x] No `public` / `anon` RLS policies exist for this bucket.
- [x] Application continues to function normally for all document-related flows.
- [x] External unauthorized access to documents is blocked.
