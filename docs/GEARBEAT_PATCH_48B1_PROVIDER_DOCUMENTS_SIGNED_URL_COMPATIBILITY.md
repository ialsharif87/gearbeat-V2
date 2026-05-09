# GEARBEAT PATCH 48B1 — PROVIDER DOCUMENTS SIGNED URL COMPATIBILITY

## 1. Overview
This patch establishes the technical foundation for migrating the `provider-documents` storage bucket from public to private access. It implements a compatibility layer that securely handles both legacy absolute URLs and future relative storage paths, ensuring uninterrupted access for administrators during the transition.

## 2. Infrastructure Changes

### New Utility: `lib/storage/provider-documents.ts`
- **Normalization:** Automatically detects if a reference is a full Supabase URL or a relative path.
- **Path Extraction:** Safely parses the storage path from legacy public URLs.
- **Signed URL Generation:** Provides a unified interface for generating short-lived (1-hour) signed URLs using the Supabase Admin client.

### Admin Leads Actions: `app/admin/leads/actions.ts`
- Added `getSignedDocumentUrlAction`: A server action that wraps the new storage utility, enabling the client-side UI to request secure access links for any provider document.

### Admin Leads UI: `app/admin/leads/[id]/page.tsx`
- **Security Upgrade:** Replaced direct public URL links with a dynamic signed URL fetching mechanism.
- **Deferred Loading:** Documents are now loaded via signed URLs on page mount, ensuring that even if the bucket is made private, the admin dashboard remains fully functional.
- **Affected Documents:**
    - Commercial Registration (`cr_document_url`)
    - VAT Certificate (`vat_certificate_url`)
    - National Address (`national_address_url`)
    - Bank Account Screenshot (`bank_document_url`)

## 3. Compatibility Logic
The system now handles document references in two formats:
1. **Legacy (Absolute):** `https://[project].supabase.co/storage/v1/object/public/provider-documents/applications/file.pdf`
2. **Future (Relative):** `applications/user_id/file.pdf`

The helper function `getDocumentStoragePath` identifies the format and extracts the necessary path for the `createSignedUrl` operation.

## 4. Safety & Security
- **No Fallbacks:** The system never falls back to raw public URLs if signed URL generation fails, preventing accidental exposure once the bucket is private.
- **Short Expiration:** Signed URLs are set to expire in 3600 seconds (1 hour), minimizing the window of opportunity for link sharing.
- **Documentation Only:** This patch does not modify the storage bucket settings or SQL policies. The bucket remains public for now to ensure a smooth transition.

## 5. Next Steps (Patch 48B2)
1. **Bucket Privacy:** Mark the `provider-documents` bucket as **PRIVATE** in the Supabase Dashboard.
2. **Upload Logic Update:** Update the join flows to store only relative paths instead of full URLs.
3. **Data Migration:** Run a script to convert all existing absolute URLs in `studio_applications` to relative paths.
