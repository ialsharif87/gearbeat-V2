# GEARBEAT PATCH 48J — PROVIDER DOCUMENTS PRIVATE BUCKET READINESS AUDIT

## 1. Overview
This audit evaluates the current state of the `provider-documents` storage bucket and identifies all remaining dependencies that rely on public access. This is a critical prerequisite for Patch 48K, which will enforce a **PRIVATE** bucket policy.

## 2. Audit Findings

### A. Public Read Dependencies
| Location | Usage | Status |
|---|---|---|
| `studio_applications` (Legacy) | Absolute Supabase URLs in DB | **MIGRATION PENDING** (See Patch 48C) |
| `provider_leads` (Legacy) | Absolute Supabase URLs in DB | **MIGRATION PENDING** (See Patch 48C) |
| `components/contract-uploader.tsx` | `getPublicUrl` used for display | **BLOCKER** |
| `app/portal/first-login/page.tsx` | `getPublicUrl` used for display | **BLOCKER** |
| `app/admin/leads/[id]/page.tsx` | `getSignedDocumentUrl` | **READY** |
| `lib/storage/signed-contracts.ts` | Signed URL logic | **READY** |

### B. Public Upload Dependencies
| Location | Mechanism | Status |
|---|---|---|
| `app/join/studio/page.tsx` | `uploadProviderDocumentAction` | **READY** (Patch 48I) |
| `app/join/seller/page.tsx` | `uploadProviderDocumentAction` | **READY** (Patch 48I) |
| `components/contract-uploader.tsx` | Client-side `storage.upload` | **BLOCKER** |
| `app/portal/first-login/page.tsx` | Client-side `storage.upload` | **BLOCKER** |
| `app/portal/studio/contract/page.tsx` | Client-side `storage.upload` | **BLOCKER** |

## 3. Analysis of Blockers

### Blocker 1: Insecure Contract Uploads
The `ContractUploader` component and `FirstLoginPage` both perform client-side uploads using the public Supabase client. These operations currently depend on a public `INSERT` policy on the `provider-documents` bucket. Additionally, they generate absolute public URLs via `getPublicUrl`, which will break immediately once the bucket is privatized.

### Blocker 2: Legacy Database Records
Records created before Patch 48B2 still contain absolute public Supabase URLs. These must be normalized to relative paths (as defined in Patch 48C/48D) before the bucket is made private, as the absolute URLs will stop resolving.

## 4. Recommendations

### Readiness Status: **NOT READY**

### Mandatory Steps Before Patch 48K (Privatization):
1. **Refactor Contract Uploads:**
   - Update `ContractUploader`, `FirstLoginPage`, and `StudioContractPage` to use the secure `uploadProviderDocumentAction`.
   - Ensure these components store relative storage paths in the database, not absolute URLs.
2. **Complete Data Migration:**
   - Execute the SQL migration defined in Patch 48D to convert all legacy absolute URLs to relative paths.
3. **Audit Removal:**
   - Verify that no calls to `.getPublicUrl("provider-documents", ...)` remain in the codebase.

## 5. Safety Confirmation
- This is a documentation-only audit.
- **NO CHANGES** were made to:
    - Bucket privacy settings or storage policies.
    - SQL migrations, RLS, or database records.
    - Application logic or UI components.
