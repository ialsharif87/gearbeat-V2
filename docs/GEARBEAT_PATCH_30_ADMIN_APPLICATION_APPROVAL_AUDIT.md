# GEARBEAT PATCH 30 — ADMIN APPLICATION APPROVAL AUDIT

## 1. Executive Summary
This audit provides a detailed mapping of the GearBeat admin application approval workflow. It tracks the lifecycle of a studio application from initial submission to final studio record creation and user activation. The workflow is split into two primary stages: initial approval (contract pending) and final activation (studio creation).

## 2. Current Application Approval Flow
- **Submission:** Applicant submits details via `/join/studio`. Data is saved in `studio_applications`.
- **Initial Review:** Admin reviews application details in `/admin/leads/[id]`.
- **Stage 1 Approval (`approveStudioApplication`):** 
    - Admin clicks "Approve". 
    - Auth user is created/updated (Role: `owner`).
    - Profile record is upserted (`account_status: approved`).
    - Application status is set to `approved`.
    - Email sent with temporary password (`GearBeat123!`).
- **Contract Signature:** Applicant logs in, redirected to `/portal/studio/contract` to download, sign, and upload the studio agreement.
- **Stage 2 Final Approval (`giveFinalApproval`):** 
    - Admin reviews signed contract.
    - Application status is set to `activated`.
    - Profile status is set to `active`.
    - `studios` record is automatically created (Initial mapping).
    - `provider_leads` status is set to `approved`.

## 3. Admin Routes Involved
- **`/admin/leads`:** List view of all studio and vendor applications.
- **`/admin/leads/[id]`:** Detailed view with actions: Approve, Reject, Request Update.
- **`/admin/studios`:** List of all studios, including those newly activated.

## 4. Studio Owner / Applicant Routes Involved
- **`/join/studio`:** Public application form.
- **`/portal/login`:** Entrance for owners after Stage 1 approval.
- **`/portal/studio/contract`:** Dedicated page for contract download and upload.
- **`/portal/studio/studios`:** Dashboard access after Stage 2 activation.

## 5. API Routes Involved
- **`/api/countries` & `/api/cities`:** Used in the `/join/studio` form for data validation.
- **Server Actions:** Logic is primarily handled via server actions in `app/admin/leads/actions.ts`.

## 6. Supabase Tables Involved
- **`studio_applications`:** Primary storage for application data, contract URLs, and internal statuses.
- **`provider_leads`:** Secondary tracking table for marketing/lead management.
- **`profiles`:** Stores user-specific metadata (role, account status).
- **`studios`:** The core entity for the marketplace.
- **`auth.users`:** Managed via Supabase Admin API during Stage 1 approval.

## 7. Current Approval Statuses Found in Code
- `pending`: Awaiting admin review.
- `approved`: Stage 1 completed; awaiting contract.
- `activated`: Stage 2 completed; studio created and user active.
- `needs_update`: Admin requested modifications from the applicant.
- `rejected`: Application declined.

## 8. Post-Approval Actions
- **User Notification:** Automated email sent via `lib/emails`.
- **Profile Update:** Role forced to `owner`.
- **Dashboard Unlock:** `/portal/studio` sub-routes become accessible based on `account_status`.

## 9. Studio Record Creation Details
In `giveFinalApproval`, a record is inserted into `studios` with the following mapping:
- `owner_auth_user_id` = `app.linked_user_id`
- `name` = `app.company_name_en || app.full_name`
- `city` = `app.country` (Note: Mapping discrepancy found here, uses country field for city name).
- `status` = `approved`
- `verified` = `true`
- `booking_enabled` = `true`

## 10. Lead-to-Studio Gap Identification
- **Data Mapping Gap:** Fields like `about_company`, `vat_number`, and `commercial_registration` are present in `studio_applications` but are not mapped to the `studios` record or linked via a foreign key for easy reference in the studio profile.
- **Multi-Studio Gap:** `planned_studios_count` is collected but ignored; only one studio is created upon activation.
- **Location Mapping Discrepancy:** The `city` field in the studio record is being populated with the `country` string from the application.
- **Security:** Hardcoded temporary passwords (`GearBeat123!`) require a forced-reset mechanism.

## 11. Risk Level
- **Risk:** **Medium**
- **Reasoning:** Functional workflow exists, but data integrity between applications and studio profiles is weak. Manual password handling is a security concern.

## 12. Recommended Fix Scope for Patch 31
- Improve data mapping in `giveFinalApproval` to populate more studio fields.
- Fix the City/Country mapping discrepancy.
- Link the signed contract and CR/VAT documents to the studio record or owner profile.
- Ensure `planned_studios_count` is visible to admins managing the studio.

## 13. Files Patch 31 May Need to Touch
- `app/admin/leads/actions.ts`: Refine the mapping logic in `giveFinalApproval`.
- `app/admin/studios/page.tsx`: Add links to original applications/contracts.
- `lib/types/studio.ts`: (If type updates are needed for new mapped fields).

## 14. Files Patch 31 Must NOT Touch
- `app/join/studio/page.tsx`
- `middleware.ts`
- `lib/auth-guards.ts`
- Any SQL migrations or RLS policies (must stay in Batch F).
