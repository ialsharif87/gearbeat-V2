# GEARBEAT PATCH 49C — SIGNED URL UX CLEANUP

## 1. Overview
This patch improves the User Experience (UX) for viewing secured documents in the `provider-documents` bucket. It introduces clearer loading, error, and empty states while maintaining the strict server-side authorization model established in previous patches.

## 2. Key Improvements

### 2.1 Contract Uploader Component
- **Loading State:** Added a `signing` state that displays "Signing..." while the authorized signed URL is being generated.
- **Error Handling:** Implemented a user-friendly error display (in red) if the signed URL cannot be generated (e.g., authorization failure or session expiry).
- **Visual Feedback:** Updated the upload box with a transition opacity and "⌛" icon during the upload phase.
- **Security:** Continues to use `getSignedDocumentUrlAction` with mandatory `appId` and ownership verification.

### 2.2 Admin Lead Detail Page
- **Granular Loading:** Added a `docLoading` state to track the signing process for each document independently (CR, VAT, National Address, Bank Proof).
- **Informative Status:** Replaced the static "View Document" link with a "Signing..." status during retrieval and a "Not uploaded" status for missing files.
- **Relational Integrity:** Links now include `rel="noopener noreferrer"` for secure external viewing.

### 2.3 Studio Contract Page
- **Post-Upload Visibility:** Added a "View Uploaded Contract" link for studio owners who have already uploaded their agreement.
- **State Management:** Implemented the same secure signing pattern as the `ContractUploader` to provide a consistent experience.
- **Localization:** Full Arabic and English support for all new status indicators and error messages.

## 3. Security Confirmation
- **Bucket Privacy:** The `provider-documents` bucket remains **PRIVATE**.
- **No Public URLs:** All document viewing continues to require a temporary, authorized signed URL generated on the server.
- **Authorization:** Ownership and Admin role verification are strictly enforced before any URL is signed.

## 4. Conclusion
The UX cleanup ensures that users and administrators have clear feedback during the asynchronous document signing process. The platform remains secure, but feels significantly more responsive and professional.
