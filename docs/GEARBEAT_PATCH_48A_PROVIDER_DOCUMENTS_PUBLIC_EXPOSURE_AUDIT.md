# GEARBEAT PATCH 48A — PROVIDER DOCUMENTS PUBLIC EXPOSURE AUDIT

## 1. Overview
This audit investigates the current security posture of the `provider-documents` storage bucket. Initial findings indicate that sensitive business documents, including Commercial Registrations (CR), VAT certificates, and banking details, are currently exposed via public storage URLs.

## 2. Current Exposure Summary

### A. Bucket Configuration
- **Bucket Name:** `provider-documents`
- **Current Access Level:** **PUBLIC**
- **Observed Policies:** 
    - Public read access is enabled for all objects.
    - Public upload access is active in the application flows without strict owner-only RLS in storage.

### B. Confirmed Sensitive File Groups
- **Studio Applications:** CR documents, National Address proofs, Bank Account screenshots.
- **Seller Applications:** Business IDs and certificates.
- **Contracts:** Signed partner agreements (partially mitigated by signed URLs in some views, but stored in a public bucket).

## 3. Vulnerability: Public URL Persistence
The `studio_applications` table currently stores absolute **Public URLs** in the following fields:
- `cr_document_url`
- `national_address_url`
- `bank_document_url`
- `vat_certificate_url`

### Risk Analysis
- **Business Confidentiality:** Private corporate documents are accessible to anyone who possesses or guesses the URL.
- **Predictability:** Storage paths often follow predictable patterns (e.g., `applications/{email}/{filename}`), making them susceptible to scraping.
- **Compliance Violation:** Storing unencrypted, publicly accessible personal and business data is a direct violation of the **Saudi Personal Data Protection Law (PDPL)** and international standards (GDPR).
- **Risk Level:** **CRITICAL**

## 4. Affected Application Flows

### Upload Flows (Vulnerable)
- `app/join/studio/page.tsx`: Uses `getPublicUrl` after upload.
- `app/join/seller/page.tsx`: Uses `getPublicUrl` after upload.
- `app/portal/first-login/page.tsx`: Uses `getPublicUrl` for missing info.

### Display Flows (Vulnerable)
- `app/admin/leads/[id]/page.tsx`: Renders documents using standard `<a>` tags with public URLs in the `DocCard` component.

### Partially Secured Flows
- `app/admin/leads/actions.ts`: Contains `getSignedContractAction`, demonstrating that secure patterns are partially implemented but not enforced across all document types.

## 5. Recommended Implementation Plan (Patch 48B)

### Storage Layer
1. **Transition to Private:** Mark the `provider-documents` bucket as **PRIVATE**.
2. **Strict RLS:** Implement storage RLS policies that restrict uploads and reads to the specific owner (authenticated) and the `service_role` (admin).

### Database Layer
1. **Data Migration:** Update existing records in `studio_applications` and `profiles` to convert absolute public URLs into **relative storage paths** (e.g., from `https://.../cr.pdf` to `applications/user_id/cr.pdf`).

### Application Layer
1. **Secure Uploads:** Update upload logic to store only the relative path in the database.
2. **Secure Reads:** Update all components (`DocCard`, etc.) to fetch a **Signed URL** with a short expiration (e.g., 10-60 minutes) instead of using a direct link.

## 6. Safety & Guardrails
- **Do Not Change Yet:** Do not make the bucket private in the production dashboard until the UI is updated to handle signed URLs, otherwise, admins will lose access to all documents immediately.
- **Documentation Only:** This patch is an audit only. No code or configuration changes are applied.
