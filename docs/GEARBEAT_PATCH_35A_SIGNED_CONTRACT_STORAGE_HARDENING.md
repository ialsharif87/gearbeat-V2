# GEARBEAT PATCH 35A — SIGNED CONTRACT STORAGE HARDENING

## 1. Overview
This patch hardens the storage of signed studio contracts by stopping the exposure of these sensitive legal documents via permanent public URLs. It introduces a signed URL generation flow for administrators and ensures that new uploads store relative storage paths rather than full public URLs.

## 2. What Was Fixed
- **Storage Path Persistence:** Updated the contract upload flow in the studio owner portal (`app/portal/studio/contract/page.tsx`) to store the relative storage path in the `contract_url` database field instead of a permanent public URL.
- **Admin Access Hardening:** Updated the admin lead detail page (`app/admin/leads/[id]/page.tsx`) to generate a short-lived (15-minute) signed URL for viewing contracts.
- **Signed URL Utility:** Introduced a centralized helper in `lib/storage/signed-contracts.ts` to handle path normalization and signed URL generation using the Supabase admin client.
- **Server Action for Access:** Added `getSignedContractAction` to the admin leads server actions to safely bridge signed URL generation to the client-side admin UI.

## 3. Legacy Support & Safety
- **No Public Fallback:** The system is strictly hardened to never expose or fall back to a raw public contract URL in the UI. 
- **Valid Legacy Support:** The `getContractStoragePath` helper extracts the storage path from existing legacy public URLs (if they belong to the `provider-documents` bucket) and serves them through the new signed URL flow.
- **Invalid URL Handling:** If a contract reference cannot be normalized into a valid storage path, the system returns `null` and displays a safe error message in the admin UI.
- **Admin Error Message:** "Unable to generate a secure contract link. Please re-upload the signed contract."

## 4. Technical Details
- **Duration:** Signed URLs expire after 900 seconds (15 minutes).
- **Client Safety:** Administrators no longer see or receive the permanent underlying storage URL; they only receive a time-limited tokenized link.
- **No Schema Changes:** This patch uses the existing `contract_url` column in `studio_applications`. No SQL migrations or RLS policy changes were required.

## 5. Files Changed
- `lib/storage/signed-contracts.ts` [NEW]
- `app/admin/leads/actions.ts` [MODIFY]
- `app/admin/leads/[id]/page.tsx` [MODIFY]
- `app/portal/studio/contract/page.tsx` [MODIFY]
- `docs/GEARBEAT_PATCH_35A_SIGNED_CONTRACT_STORAGE_HARDENING.md` [NEW]

## 6. Known Limitations
- **Other Documents:** This patch specifically targets signed contracts. Other documents (CR, VAT, ID) still use public URLs and will require a similar hardening patch in a future iteration.
- **Storage RLS:** While this patch prevents public URL generation, the underlying storage bucket policies have not been modified. Strict Storage RLS should be applied in a follow-up patch to ensure even direct path access is denied to unauthorized users.
