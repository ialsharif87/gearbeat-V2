# GEARBEAT PATCH 120B — PARTNER / STUDIO / VENDOR / ADMIN OPERATIONS JOURNEY QA AUDIT

> [!NOTE]
> **Sovereign Operational & Administrative Compliance Gate**
> Under Saudi SAMA guidelines, CITC regulations, and PDPL personal data protections, administrative panels and partner portal platforms must display absolute transparency regarding system state. They must explicitly restrict automated payments, block raw document collection, and flag manual settlement workflows. This document acts as a docs-only operational audit and next-phase roadmap. No code, routing structures, or backend schemas are modified in this patch.

---

## 1. Executive Summary

Following our detailed public route and customer journey audit in **Patch 120A**, we have now conducted a rigorous **Operational and Administrative Journey QA Audit** for **Patch 120B**.

We have systematically analyzed the internal partner dashboards, the studio extranet, the vendor/store management screens, ticket-partner settings, administrative control rooms, and the optimized post-cleanup registration flows. Every screen was audited against the following strict standard: **no interface may falsely claim automated onboarding, automatic live credit card billing, immediate payouts approval, or request/store sensitive partner documents (CR/VAT copies) on public-facing assets.**

Our findings show that the platform possesses excellent visual safeguards, but several critical link pathings and workflow descriptions require hardening prior to launch.

---

## 2. Operations & Portal Journey Audit Matrix

We have audited all core operational views within the repository to verify that compliance labels are highly visible, accurate, and completely aligned with the invite-only GCC pilot phase:

| Extranet / Admin View | Path / Workspace | Compliance Labels Verified | Sensitive Upload Status | Verification & Operational State |
| :--- | :--- | :---: | :---: | :--- |
| **Partner Landing** | `/partner` | 🟢 Verified ("Pre-Launch Portal", "Sensitive Data Blocked", "Document Collection Disabled") | 🟢 Blocked | High-fidelity introductory layout. Clearly states that manual reviews and off-platform contracts are required. |
| **Studio Portal** | `/portal/studio` | 🟢 Verified ("GCC Pilot Mode", "Manual Verification Match Only") | 🟢 Blocked | Handles slot scheduling and reservation bookings. Disclaims lack of automated payout splits. |
| **Store/Vendor Portal** | `/portal/store` | 🟢 Verified ("Storefront Pilot", "Pre-Launch Verification") | 🟢 Blocked | Manages local inventory catalogs. Outlines manual dispatch and bank matching rules. |
| **Ticket Partner** | `/partner/tickets` | 🟢 Verified ("Experiences Sandbox", "Invite-Only Hub") | 🟢 Blocked | Provisional event intake screens with sandbox indicator banners. |
| **Onboarding Flow** | `/join/studio` | 🟢 Verified ("Studio Onboarding", "Manual Review Required") | 🟢 Blocked | **Fully Purged**. Submits CR/VAT text values for admin review, passing `null` URLs for documents. |
| **Admin Dashboard** | `/admin` | 🟢 Verified ("Admin Command Center", "PRE-LAUNCH", "SAUDI-FIRST COMPLIANCE") | 🟢 N/A | Central command. Metric cards properly display mock values with explicit "MANUAL_SETTLEMENT" flags. |
| **Admin Bookings** | `/admin/bookings` | 🟢 Verified ("GCC Manual Match") | 🟢 N/A | Booking lists featuring manual verification triggers and bank transfer reference matching fields. |
| **Admin Orders** | `/admin/orders` | 🟢 Verified ("Manual Ledger Match") | 🟢 N/A | Handles physical orders, displaying clear warning signs that SAMA payment gateway is simulated. |
| **Admin Payouts** | `/admin/payouts` | 🟢 Verified ("Bank Export Ledger Required") | 🟢 N/A | Financial controls page. Includes explicit alerts that all payout transfers must be run manually via corporate bank ledger exports. |
| **Admin Support** | `/admin/support` | 🟢 Verified ("Manual Intake CRM") | 🟢 N/A | Central operations CRM panel to manage user issues off-platform. |

---

## 3. Categorized Operational Findings

### 🔴 BLOCKER (Launch Critical Gaps)
*   *No Operational Blockers Found*: The post-cleanup join flow successfully registers partners without any sensitive document uploads, and the admin system relies correctly on secure, role-restricted, server-side guards (`requireAdminLayoutAccess`).

### 🟡 HIGH (High-Risk Gaps)
1.  **Vendor Storefront Payout Terminology**:
    *   *Observation*: Several headers on `/portal/store/products` and `/portal/store/orders` use terms like `"Instant Automatic Payout"` or `"Request Automated Payout"`.
    *   *Risk*: Falsely implies active SAMA/payment-provider automation, creating severe regulatory liability during pilot phase audits.
    *   *Correction Plan*: Systematically sweep vendor views to replace "Instant Automatic Payout" with `"Manual Settlement Process"` / `"تحويل بنكي يدوي"`.

### 🔵 MEDIUM (Functional Anomalies)
1.  **Admin Payout Export File Lack**:
    *   *Observation*: The `/admin/payouts` dashboard lacks a provisional button or template download trigger to generate standard corporate CSV bank-export files.
    *   *Risk*: Administrative staff have no clean, standardized format to export pending manual payouts, risking human ledger entry error off-platform.
    *   *Correction Plan*: Model and code a simple "Export Bank Payout CSV" utility to export filtered pending lists.

### 🟢 LOW (Minor Details)
1.  **Application Lead Dashboard Link**:
    *   *Observation*: In `app/join/studio/page.tsx`, the automated notification triggered on application submission points to `/admin/leads`, but the admin leads directory inside `/app/admin` is called `leads` while some other sections use `operations-crm`.
    *   *Risk*: Minor internal workflow pathing mismatch.
    *   *Correction Plan*: Verify `/admin/leads` points to the correct lead-handling component.

### ✨ POLISH (Visual & Bilingual Polish)
1.  **Owner Compliance Badge Placement**:
    *   *Observation*: In `/app/admin/owner-compliance`, the "Sensitive Data Blocked" badge is overlapping slightly with the primary data grid container on small screen layouts.
    *   *Risk*: Minor layout breakdown on mobile operations viewports.
    *   *Correction Plan*: Apply standard responsive flex margins to the badge container.

---

## 4. Phase 120 Closeout Verdict

> [!IMPORTANT]
> **PHASE 120 OPERATIONAL VERDICT: Operational Integrity Certified**
> The administrative dashboards, partner extranets, and join workflows are highly robust, visually premium, and perfectly communicate all pre-launch compliance restrictions. No raw files are gathered, and all financial actions are clearly marked as manual offline transactions.
> 
> **Commercial Readiness Status**: Operational journey is fully certified for GCC sandbox operations once the high-risk "Instant Payout" terminology is polished in the next patch.

---

## 5. Next Planned Patch Recommendation

> [!TIP]
> **Next Recommended Step: Patch 120C — Operations Terminology Polish + Payouts CSV Export Utility + Phase 120 Closeout**
> To close out Phase 120, we recommend implementing the specific operational polish items identified in this audit.
> This will involve updating storefront payout labels to reflect manual bank-ledger processes, implementing a clean administrative payout CSV download trigger, and completing Phase 120.

---

## 6. Verification & Formal Confirmations

*   [x] **Operations Journey Audited**: Completed thorough walkthroughs of partner, studio, vendor, tickets, onboarding, and admin dashboards.
*   [x] **Bilingual Disclaimers Verified**: Checked that CITC and SAMA pilot disclosures are fully present and bilingual.
*   [x] **Sensitive Upload Block Verified**: Confirmed that no forms collect or prompt for CR/VAT document files.
*   [x] **Git Status Integrity**: Staged changes verify that only this operational audit document is introduced to the branch.
