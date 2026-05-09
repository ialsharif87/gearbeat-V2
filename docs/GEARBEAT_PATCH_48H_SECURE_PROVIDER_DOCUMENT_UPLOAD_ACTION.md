# GEARBEAT PATCH 48H — SECURE PROVIDER DOCUMENT UPLOAD ACTION

## 1. Overview
This patch implements a secure server-side upload path for the `provider-documents` storage bucket. By utilizing a Server Action powered by the Supabase Service Role client, the application can now bypass public storage policies, allowing for the eventual transition to a fully **PRIVATE** bucket.

## 2. Implementation: `lib/storage/provider-documents.ts`

### New Action: `uploadProviderDocumentAction`
A secure Server Action that handles the physical upload of documents to Supabase storage.

### Security Features:
1. **Server-Side Execution:** Bypasses client-side Row Level Security (RLS) by using `supabaseAdmin`.
2. **File Type Validation:** Restricts uploads to `PDF`, `PNG`, `JPG`, and `JPEG` only.
3. **File Size Enforcement:** Implements a strict 10MB limit per file.
4. **Folder Isolation:** Only allows uploads to authorized subdirectories:
    - `studio-applications`
    - `seller-applications`
    - `contracts`
5. **Path Normalization:** Returns only the relative storage path (key), ensuring database records remain decoupled from the public storage endpoint.

## 3. Deployment & Transition Strategy
- **Baseline Readiness:** This action serves as the technical foundation for the next phase of security hardening.
- **Join Flow Refactor (Patch 48I):** The next patch will refactor the Studio and Seller join pages to utilize this server action, replacing the current insecure client-side `supabase.storage.upload` calls.
- **Bucket Lock-down:** Once the refactor is verified, the `provider-documents` bucket will be set to **PRIVATE**, and all public `INSERT` and `SELECT` policies will be permanently removed.

## 4. Safety Confirmation
- **Non-Breaking:** Existing join flows and public storage policies remain untouched and fully functional during this phase.
- **No Infrastructure Changes:** No changes were made to Supabase storage bucket settings, RLS policies, or SQL migrations.
- **No Data Migration:** Existing storage files and database records were not modified.
