# GEARBEAT PATCH 48F — PROVIDER DOCUMENTS PRIVATE BUCKET READINESS AUDIT

## 1. Status Update
This audit confirms that the manual migration of legacy document URLs to relative storage paths (Patch 48D/48E) has been successfully executed and verified in the database. 

### Current State:
- **Database Records:** All `studio_applications` and `provider_leads` document fields now store relative paths (keys). The count of records starting with `http` for the `provider-documents` bucket is **0**.
- **Admin Dashboard:** Document links in the Admin Dashboard are verified to load correctly via the signed URL compatibility layer (Patch 48B1).
- **Persistence:** All new applications submitted via `/join/studio` and `/join/seller` are correctly storing relative paths (Patch 48B2).

## 2. Infrastructure Assessment

### Bucket: `provider-documents`
| Property | Current Setting | Security Status |
|---|---|---|
| **Public Access** | `true` | **INSECURE** |
| **SELECT Policy** | Public Read allowed | **INSECURE** |
| **INSERT Policy** | Public Upload allowed | **INSECURE** |

### Findings:
1. Although the application now uses secure signed URLs for display, the bucket itself remains publicly accessible. Anyone with the specific file path can still access sensitive documents (CR, VAT, Bank details) without authentication.
2. The current security risk remains high until the bucket is set to **PRIVATE**.

## 3. Roadblock: Public Client Uploads
The primary reason for keeping the bucket public at this stage is the **Client-Side Upload Flow** in `/join/studio` and `/join/seller`.

### Risks of Immediate Privacy Toggle:
- If the bucket is set to `private` or the `INSERT` policy is restricted to authenticated users, the public join forms will fail to upload documents.
- The current implementation uses the anonymous public Supabase client to perform uploads.

## 4. Readiness Conclusion
The application is **Data Ready** but not yet **Infrastructure Ready** for private storage.

### Required Actions Before Hardening:
1. **Upload Refactoring:** Transition from public client-side uploads to a secure server-side upload pattern or a "presigned upload URL" pattern to allow anonymous users to upload documents securely without requiring a public bucket.
2. **Policy Hardening:** Once upload logic is secured, the `INSERT` and `SELECT` policies for `provider-documents` must be restricted to `authenticated` users with appropriate RLS checks.

## 5. Safety Confirmation
- This is a documentation-only readiness audit.
- **NO CHANGES** were made to:
    - App code or UI
    - SQL migrations or existing records
    - Supabase storage bucket settings or policies
    - GitHub Actions or deployment workflows
    - Auth, Payment, or Booking logic
