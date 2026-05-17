# GEARBEAT PATCH 114C — Public Sensitive Document Upload Removal from Join Studio Flow

## 1. Overview & Objectives

In accordance with the Saudi-First Compliance Gate and the Sensitive Data Collection Blocklist established in **Patch 113B**, Patch 114C performs a secure, high-fidelity deactivation and removal of sensitive file uploads in the public-facing studio partner registration flow.

Prior to this patch, the join studio form (`app/join/studio/page.tsx`) mandated that prospective partners upload corporate documentation (Commercial Registration (CR), VAT Certificate, National Address Proof, and Bank Account Screenshot) to the staging environment. This conflicted with regional compliance restrictions under Saudi PDPL, which require local sovereign data hosting (Dammam region) for all sensitive PII and corporate documentation before general collection.

---

## 2. Changes Implemented

We have modified only the public-facing front-end registration flow and documented the changes:

### A. Code Modifications (UI & Local States)
*   **Target File**: [app/join/studio/page.tsx](file:///c:/Users/iaals/Documents/GitHub/gearbeat-V2/app/join/studio/page.tsx)
*   **Unused Action Import Removed**:
    *   Removed `uploadProviderDocumentAction` import from `@/lib/storage/provider-documents` to eliminate compiler alerts.
*   **Local State Cleanup**:
    *   Deleted `crFile`, `vatFile`, `nationalAddressFile`, and `bankFile` file states and the `uploadFile()` async helper. This prevents unused variables and avoids any client-side file upload attempts.
*   **Bypassed and Stateless Registration Submission**:
    *   Bypassed validation checks that enforced document file selections.
    *   Updated the `supabase.from("studio_applications").insert(...)` command to map `null` to `cr_document_url`, `vat_certificate_url`, `national_address_url`, and `bank_document_url` in the database. 
    *   *Result*: Studio applications successfully submit in sandbox mode for non-sensitive interest/intake details only (Name, phone, email, company names, planned studio count, about section), leaving corporate document paths unpopulated.

### B. High-Fidelity Bilingual Compliance Notice
We replaced the "Required Documents" section with a beautiful, themed dashboard alert box in the premium dark/gold HSL palette containing the required compliance disclaimers with full Arabic/English bilingual translation support:

*   **English Copy**:
    *   🛡️ **Saudi-First Compliance Protection**
    *   *"Sensitive partner documents are not collected through this public flow during pre-launch."*
    *   *"Commercial verification will happen later through an approved secure Saudi-first compliance process."*
    *   *“⚠️ Do not upload IDs, CR, VAT, IBAN, contracts, or bank documents here.”*
*   **Arabic Copy**:
    *   🛡️ **حماية الامتثال للأولوية السعودية**
    *   *"لا يتم جمع وثائق الشركاء الحساسة من خلال هذا التدفق العام خلال مرحلة ما قبل الإطلاق."*
    *   *"سيتم التحقق التجاري لاحقاً من خلال عملية امتثال معتمدة وآمنة ذات أولوية سعودية."*
    *   *“⚠️ يرجى عدم تحميل الهويات، السجل التجاري، شهادة الضريبة، الآيبان (IBAN)، العقود، أو الوثائق البنكية هنا.”*

---

## 3. Strict Compliance & Safety Verification

This patch adheres 100% to our extreme safety guidelines:
*   **Zero API / Backend Mutations**: The upload route (`app/api/documents/upload/route.ts`) and storage library (`lib/storage/provider-documents.ts`) were untouched.
*   **Zero Schema Changes**: Database tables, Supabase configuration, migrations, triggers, and RPC systems are 100% untouched.
*   **No live document collection**: We completely blocked files from being uploaded or stored.
*   **No claims of sovereign readiness**: The notices clearly state that commercial verification and document collection are deferred and pre-launch is currently active.
*   **Typecheck Stability**: Verified clean TypeScript compilation.

---

## 4. Visual QA Check

- **Theme Consistency**: Styled the alert container to match GearBeat's dark/gold scheme (using a gold HSL semi-transparent border `rgba(212, 175, 55, 0.3)` and background `rgba(212, 175, 55, 0.05)`, and a coral-colored warning notice `rgba(255, 77, 77, 0.1)`).
- **Responsive Safety**: All boxes, texts, and buttons are designed defensively with responsive grid elements to avoid text wrapping anomalies or title clipping on mobile devices.

---

## 5. Next Recommended Step

*   **Patch 115A — Admin Sensitive Data Visibility + Compliance Masking Audit**
    *   *Action*: Review the admin leads view (`app/admin/leads/page.tsx` or similar) to ensure any legacy uploaded documents (from prior dev phases) are masked or restricted behind administrative permission gates, guaranteeing absolute data safety during pre-launch.
