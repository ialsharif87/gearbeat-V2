# GEARBEAT PATCH 32 — CONTRACT CONSISTENCY AUDIT

## 1. Overview
This audit examines the consistency and integrity of the contract workflow in GearBeat V2. It tracks how contracts are generated, delivered to studio owners, signed, and verified by administrators.

## 2. Current Contract Workflow
- **Step 1 (Admin Approval):** Admin reviews application in `/admin/leads/[id]`. A "Contract Draft" textarea is populated with default terms.
- **Step 2 (The Gap):** When the admin clicks "Approve", the `contractDraft` content is passed to the server action but is **not saved** to the database or included in the notification email.
- **Step 3 (Owner Access):** The owner receives an email and logs into `/portal/studio/contract`.
- **Step 4 (Download):** The owner downloads a static file from `/contracts/studio-agreement.pdf`. This is a generic document and does not reflect any customizations made by the admin during the approval stage.
- **Step 5 (Upload):** The owner uploads a signed copy. This is stored in the `provider-documents` bucket, and the URL is saved to `studio_applications.contract_url`.
- **Step 6 (Final Approval):** Admin reviews the uploaded file in `/admin/leads/[id]` and clicks "Confirm & Activate Account".

## 3. Key Routes & Storage
- **Owner Download/Upload Route:** `/portal/studio/contract`
- **Admin Review Route:** `/admin/leads/[id]`
- **Contract URL Storage:** `studio_applications.contract_url`
- **File Storage Bucket:** `provider-documents` (Supabase Storage)

## 4. Status Transitions
- **Initial Submission:** `status: pending`
- **Stage 1 Approval:** `status: approved` (Set by `approveStudioApplication`)
- **Contract Upload:** `status: approved` (No status change occurs upon upload; the system relies on the presence of `contract_url`).
- **Stage 2 Final Approval:** `status: activated` (Set by `giveFinalApproval`)

## 5. Data Consistency Gaps
- **Contract Personalization:** Custom terms (Commission Rate, Studio Limit) entered by the admin in the "Contract Draft" are lost. The owner signs a generic agreement.
- **Linkage:** The `studios` record created upon activation does not have a foreign key or direct URL link to the signed contract. It only links to the owner via `owner_auth_user_id`.
- **Validation:** There is no automated validation that the uploaded file is a valid signature or matches the application details.

## 6. Identified Weak Points
- **Status Ambiguity:** There is no "Under Review" or "Contract Uploaded" status. Admins must manually check each "Approved" application to see if a contract has been uploaded.
- **Static vs. Dynamic:** The mismatch between the editable draft in the admin UI and the static PDF download is a significant functional flaw.
- **Re-activation Risk:** Although Patch 31 added duplicate prevention, re-running final activation does not re-verify the contract data against the studio record.

## 7. Recommended Fix Scope for Patch 33
- **Save Contract Draft:** Update `approveStudioApplication` to save the `contract_draft` to the `studio_applications` table.
- **Dynamic Terms:** If possible, show the specific commission rate and studio limit on the owner's contract page so they know what they are signing.
- **Status Update:** Automatically update the application status to a sub-status or update a flag when a contract is uploaded so admins can filter for "Awaiting Final Review".
- **Studio Linking:** Add a `contract_url` or `application_id` field to the `studios` table (if safe) or at least ensure the admin studio view can link back to the application.

## 8. Files Patch 33 May Need to Touch
- `app/admin/leads/actions.ts` (Save draft, update status on upload).
- `app/portal/studio/contract/page.tsx` (Show terms, update status on upload).
- `app/admin/leads/page.tsx` (Filter for awaiting review).
- `docs/GEARBEAT_PATCH_33_CONTRACT_WORKFLOW_HARDENING.md` (New documentation).

## 9. Files Patch 33 Must NOT Touch
- `auth` logic or middleware.
- OTP or trusted devices logic.
- Payment or booking logic.
- SQL migrations or RLS policies.
