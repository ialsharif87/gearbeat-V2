# GEARBEAT PATCH 33 — CONTRACT CONSISTENCY FIX

## 1. Overview
This patch addresses the contract workflow inconsistencies identified in Patch 32. It hardens the approval process by enforcing contract requirements and clarifying the nature of the legal agreement for both administrators and studio owners.

## 2. What Was Fixed
- **Mandatory Contract Check:** Added a strict guard to the `giveFinalApproval` server action. Administrators can no longer grant final approval or activate a studio account unless a signed contract has been uploaded (`contract_url` must be present).
- **Misleading UI Removal:** The "Contract Draft" section in the admin lead detail page has been converted from an editable textarea to a read-only "Internal Contract Reference" box. 
    - This removes the false impression that edits made in this box are saved or transmitted to the client.
    - Added a disclaimer noting that owners currently sign the standard agreement and that custom term persistence is a future requirement.
- **Owner-Side Clarification:** Updated the studio owner portal to explicitly label the download as the "Standard Studio Agreement". This ensures owners understand they are signing a generic document rather than a customized draft.

## 3. Current Contract Flow
1.  **Initial Approval:** Admin reviews application and approves. Metadata and profiles are updated.
2.  **Contract Phase:** Owner logs in and is directed to the contract page.
3.  **Signature:** Owner downloads the **Standard Studio Agreement PDF**, signs it, and uploads it.
4.  **Final Review:** Admin reviews the uploaded file.
5.  **Activation Guard:** Admin clicks "Confirm & Activate". The system verifies `contract_url` exists before proceeding with studio record creation and account activation.

## 4. What is Still Static
- The contract document itself remains a static PDF file located at `/contracts/studio-agreement.pdf`.
- Commission rates and studio limits are communicated via email but are not yet dynamically injected into the legal document.

## 5. Known Limitations
- **Custom Term Persistence:** There is currently no database field to store the "Contract Draft" text edited by admins. Adding this field would require a SQL migration, which was excluded from this patch.
- **Contract Versioning:** The system only stores the most recent contract URL; there is no historical versioning of signed documents.

## 6. Future SQL/RLS Requirements
- **`contract_draft` Column:** Add a text column to `studio_applications` to allow admins to save and persist custom contract terms.
- **`awaiting_review` Status:** Introduce a new status value to the `studio_applications_status` enum to allow filtering for applications that have uploaded a contract but haven't received final approval.
- **Studio-Contract Link:** Add a `contract_url` field to the `studios` table for direct access to the signed agreement from the studio management view.
