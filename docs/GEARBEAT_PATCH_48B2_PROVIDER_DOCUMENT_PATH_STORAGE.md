# GEARBEAT PATCH 48B2 — PROVIDER DOCUMENT PATH STORAGE

## 1. Overview
This patch updates the provider application workflows to store relative storage paths (keys) in the database instead of absolute public URLs. This is a critical step in the transition to a private storage policy, as it decouples the database records from the specific public access endpoint.

## 2. Changes

### Studio Join Flow: `app/join/studio/page.tsx`
- **Upload Logic:** Updated the `uploadFile` helper to return the internal `filePath` (e.g., `studio-applications/filename.pdf`) instead of the public URL.
- **Database Persistence:** New studio applications will now save these relative paths in the `cr_document_url`, `vat_certificate_url`, etc., fields.

### Seller Join Flow: `app/join/seller/page.tsx`
- **Upload Logic:** Updated the `uploadFile` helper to return the internal `filePath` (e.g., `seller-applications/filename.pdf`) instead of the public URL.
- **Database Persistence:** New seller applications will now save these relative paths in the `cr_document_url`, `vat_document_url`, etc., fields.

## 3. Compatibility & Security
- **Legacy Support:** Database records containing absolute URLs from previous versions remain fully supported. The `getDocumentStoragePath` helper (introduced in Patch 48B1) automatically detects and parses these URLs during display.
- **Signed URL Ready:** By storing relative paths, the application is now ready for the `provider-documents` bucket to be set to **PRIVATE**. The admin dashboard already uses signed URLs to access these files.
- **Zero Downtime:** The transition is transparent to users. The bucket remains public for now to ensure that any cached public URLs or in-flight applications continue to work during the rollout.

## 4. Safety Confirmation
- **No Storage Policy Changes:** No changes were made to Supabase bucket settings or RLS policies.
- **No Data Migration:** Existing records in the database were not modified. A separate migration patch (48B3) will handle the normalization of legacy URLs.
- **No UX Impact:** The user experience for studio owners and sellers remains identical; only the background data persistence format has changed.

## 5. Verification Plan
- **New Upload Test:** Submit a new application and verify that the stored database value is a path (e.g., `studio-applications/...`) and not a URL.
- **Admin Review Test:** Verify that the admin dashboard can still view the newly uploaded documents using the signed URL generation logic.
