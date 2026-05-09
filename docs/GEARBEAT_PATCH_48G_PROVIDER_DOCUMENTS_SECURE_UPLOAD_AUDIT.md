# GEARBEAT PATCH 48G — PROVIDER DOCUMENTS SECURE UPLOAD REFACTOR AUDIT

## 1. Current Upload Architecture

### Studio Join (`app/join/studio/page.tsx`)
- **Method:** `uploadFile(file: File)`
- **Mechanism:** Direct client-side upload using the public Supabase client (`@/lib/supabase/client`).
- **Authorization:** Anonymous/Public.
- **Data Saved:** Relative storage path (Key).

### Seller Join (`app/join/seller/page.tsx`)
- **Method:** `uploadFile(file: File)`
- **Mechanism:** Direct client-side upload using the public Supabase client.
- **Authorization:** Anonymous/Public.
- **Data Saved:** Relative storage path (Key).

## 2. Infrastructure Dependency: Public INSERT
Currently, the `provider-documents` bucket requires a **Public INSERT** policy because:
1. Both Join forms are accessible to unauthenticated users (prospective leads).
2. The browser-based Supabase client cannot bypass Row Level Security (RLS) or storage policies without a valid session.
3. To allow these anonymous uploads to succeed, the storage policy must allow `INSERT` for `public` access.

### Impact of Removing Public INSERT Today:
If the public `INSERT` policy is removed before refactoring the code:
- **Critical Failure:** Every new studio or seller application will fail at the upload stage.
- **UX Degradation:** Users will see generic "File upload failed" errors, preventing them from joining the platform.
- **Data Loss:** Potential leads will be unable to complete the registration process.

## 3. Recommended Secure Architecture

The goal is to move the "trust" from the client (browser) to the server (Next.js Server Action).

### Proposed Flow:
1. **Client:** Receives file from user input.
2. **Action:** Client calls a **Server Action** (e.g., `uploadDocumentAction`) passing the file data via `FormData`.
3. **Server:**
    - Receives the file.
    - Validates file type (`PDF`, `JPG`, `PNG`).
    - Validates file size (e.g., max 5MB).
    - Uses `createAdminClient()` from `lib/supabase/admin.ts` to upload the file to `provider-documents`.
    - Returns the relative `filePath` to the client.
4. **Client:** Proceeds to save the application to the database using the returned path.

### Validation Requirements:
- **File Type:** White-list only: `.pdf`, `.jpg`, `.jpeg`, `.png`.
- **File Size:** Enforce a server-side limit (e.g., 5MB - 10MB) to prevent storage abuse.
- **Bucket Path:** Enforce strict naming conventions (`studio-applications/` or `seller-applications/`) to prevent unauthorized bucket traversal.

## 4. Implementation Roadmap

### Files to be Modified:
- `lib/storage/provider-documents.ts`: Add the secure server-side upload action.
- `app/join/studio/page.tsx`: Update `uploadFile` to call the server action instead of `supabase.storage`.
- `app/join/seller/page.tsx`: Update `uploadFile` to call the server action instead of `supabase.storage`.

### Final Security Step:
Once the upload refactor is deployed and verified, the `provider-documents` bucket can be safely set to **PRIVATE**, and all public `SELECT` and `INSERT` policies can be deleted.

## 5. Safety Confirmation
- This is a documentation-only audit.
- **NO CHANGES** were made to:
    - Application code or upload logic.
    - Supabase storage bucket settings or RLS policies.
    - Database records or SQL migrations.
    - Authentication or payment systems.
