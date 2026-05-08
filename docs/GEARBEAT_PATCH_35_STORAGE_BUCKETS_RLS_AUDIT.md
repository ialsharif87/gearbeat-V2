# GEARBEAT PATCH 35 — STORAGE BUCKETS AND RLS AUDIT

## 1. Overview
This audit examines the security and architectural configuration of Supabase Storage buckets within GearBeat V2. It focuses on identifying exposure risks for sensitive documents and ensuring robust access control (RLS) for all media and assets.

## 2. Storage Buckets Inventory
The following buckets are referenced in the codebase:
- **`provider-documents`**: Stores signed studio agreements and legal contracts.
- **`studio-assets`**: Stores studio cover images and gallery media.
- **`marketplace-assets`**: Stores vendor product images for the marketplace.
- **`identity-documents`**: Referenced for customer/owner ID verification.
- **`business-documents`**: Stores CR, VAT certificates, and business licenses.
- **`studio-documents`**: Stores studio-specific licensing and permits.
- **`vendor-documents`**: Stores vendor-specific business documentation.

## 3. Upload Flows Identified
- **Direct Client-Side Upload:** Used in `app/portal/studio/contract/page.tsx` for signing contracts.
- **Server Action Upload (Admin Client):** Used in `app/portal/studio/create-studio/page.tsx` and `app/portal/store/products/new/page.tsx`. These bypass RLS and rely on server-side validation.
- **API Route Upload (Admin Client):** Centralized handler in `app/api/documents/upload/route.ts` for verification documents.

## 4. Exposure & Access Risk Analysis
| Bucket | Content Type | Visibility | Risk Level | Findings |
|---|---|---|---|---|
| `provider-documents` | Signed Contracts | Public (via Public URL) | **CRITICAL** | Code uses `getPublicUrl` for legal contracts. These should be private and served via signed URLs. |
| `identity-documents` | National IDs / Passports | Private (Admin only) | **HIGH** | Referenced in validation lib; must ensure strict RLS to prevent leaks. |
| `studio-assets` | Studio Images | Public | **LOW** | Intended for marketplace display. RLS needed to prevent unauthorized uploads. |
| `marketplace-assets` | Product Images | Public | **LOW** | Intended for marketplace display. RLS needed to prevent unauthorized uploads. |
| `business-documents` | CR / VAT Certificates | Private | **MEDIUM** | Contains sensitive business data. Should not be accessible via public URLs. |

## 5. Critical Vulnerabilities Found
- **Sensitive Data Exposure:** `app/portal/studio/contract/page.tsx` uses `getPublicUrl` for signed contracts. This means that if the bucket is public or lacks RLS, any user who knows or guesses the file path can view the signed legal agreement.
- **Client-Side Upload Path Control:** In some client-side flows, the file path is generated in the browser. A malicious user could potentially overwrite files belonging to other users if RLS policies are not strictly scoped to the `auth.uid()`.
- **Admin Client Overuse:** Extensive use of `supabaseAdmin` for uploads in server actions bypasses storage RLS. While this is secure for the server, it places the burden of security entirely on the application logic rather than the database layer.

## 6. Storage Policy Recommendations
- **`provider-documents`**: Must be `public: false`. Access should be restricted to the owner (`auth.uid() == owner_id`) and admins.
- **`studio-assets` / `marketplace-assets`**: Can be `public: true` for viewing, but `INSERT/DELETE` must be restricted to the authenticated owner of the related record.
- **Standardization**: There is an overlap between `provider-documents` and `business-documents`. These should be consolidated or clearly demarcated.

## 7. Recommended Fix Scope for Future Patch
- **Migration to Private Buckets:** Move `provider-documents` and `identity-documents` to private status.
- **Signed URL Implementation:** Replace `getPublicUrl` with `createSignedUrl` in `app/admin/leads/[id]/page.tsx` and `app/portal/studio/contract/page.tsx`.
- **RLS Hardening:** Implement/Verify storage RLS policies in a new SQL migration.

## 8. Implementation Targets
- **Files to Modify:**
    - `app/portal/studio/contract/page.tsx`
    - `app/admin/leads/[id]/page.tsx`
    - `lib/documents/storage.ts`
- **Files Not to Touch:**
    - Auth middleware.
    - Payment or booking logic.
    - Marketplace UI.
