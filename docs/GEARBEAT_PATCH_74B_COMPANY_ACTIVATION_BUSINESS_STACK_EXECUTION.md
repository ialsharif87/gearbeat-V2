# GEARBEAT PATCH 74B â€” COMPANY ACTIVATION + BUSINESS STACK EXECUTION

## 1. Overview
This document outlines the **Business Operations Plan** for the formal activation of the GearBeat company and the setup of the **Commercial Stack**. This phase focuses on the legal, financial, and administrative infrastructure required to support public commercial operations.

**Policy:** Documentation-only business operations plan. No mutations to app code, database, or payment logic. No live payment keys or environment variables are to be added in this patch.

---

## 2. Company Activation Objective
To transition GearBeat from a "Project/Staging" state to a "Registered Entity" state, capable of legally accepting payments, signing contracts, and employing staff.

---

## 3. Current Status
- **Technical Status:** Phase 72 Conditional Go complete.
- **Pilot Status:** Patch 74A Invite-Only Pilot Operating System established.
- **Legal Status:** Registration in progress.

---

## 4. Commercial Launch Blockers
The following must be cleared before the Public Live Launch:
- [ ] Final CR (Commercial Registration) with correct activity codes.
- [ ] Active Commercial Bank Account linked to Tap.
- [ ] Verified VAT/Tax IDs.
- [ ] Signed Master Service Agreements (MSA) with initial Studio cohort.

---

## 5. Activation Checklists

### A. Company Registration & Activation
- [ ] Commercial Registration (CR) finalized.
- [ ] Chamber of Commerce membership active.
- [ ] Municipal / Office license verified.
- [ ] National Address (Commercial) registered.

### B. Commercial Bank Account Readiness
- [ ] KYC (Know Your Customer) documentation submitted to bank.
- [ ] IBAN verified for GearBeat Company Account.
- [ ] Online banking tokens/access distributed to Finance Lead.
- [ ] Bank account linked to Tap.company account.

### C. Tap Live Payment Prerequisites
- [ ] CR and ID verification complete on Tap portal.
- [ ] Bank settlement details confirmed.
- [ ] Refund and cancellation policy approved by Tap.
- [ ] **TAP_LIVE_SECRET_KEY** readiness verified (to be injected in Phase 74C/75).

---

## 6. Official Communication & Workspace
- [ ] **Google Workspace:** `gearbeat.com` domain verified.
- [ ] **Official Emails:** 
    - `hello@gearbeat.com` (General)
    - `support@gearbeat.com` (Helpdesk)
    - `finance@gearbeat.com` (Payments/Payouts)
    - `legal@gearbeat.com` (Contracts)

---

## 7. Business Stack Setup Plans

### A. CRM & Stakeholder Management
- **Studios/Vendors:** Pipeline for onboarding and verification.
- **Creators/Users:** Segmentation for loyalty and marketing.
- **Sponsors/PR:** Outreach tracking for launch announcements.
- **Investors:** Quarterly reporting and communication logs.

### B. Accounting & Finance
- **Tool:** Xero / Zoho Books / Quickbooks.
- **Setup:** Chart of accounts, tax categories (VAT), and automated bank feeds.
- **Payouts:** Weekly manual reconciliation during soft-launch.

### C. Contracts & E-Signatures
- **Tool:** DocuSign / Adobe Sign.
- **Library:** Studio MSA, Vendor Agreement, Instructor NDA, and Contractor SOW.

### D. Support & Helpdesk
- **Tool:** Zendesk / Intercom / Help Scout.
- **Ready State:** FAQ library (20+ articles) in English and Arabic.

---

## 8. Legal Policy Review
- [ ] **Terms of Use:** Verified for compliance with local marketplace laws.
- [ ] **Privacy Policy:** GDPR/local data protection compliance review.
- [ ] **Refund Policy:** 48h/24h cancellation rules clearly defined for Studios vs. Marketplace.

---

## 9. Internal Company Folder Structure (GB-OS)
- `GB-01-GOVERNANCE` (Legal, Board Minutes)
- `GB-02-FINANCE` (Banking, Tax, Invoices)
- `GB-03-PRODUCT` (Roadmap, Design, QA)
- `GB-04-COMMERCIAL` (Sales, Partners, CRM)
- `GB-05-PEOPLE` (Staffing, Payroll)

---

## 10. Owner/Accountability Map

| Domain | Owner | Accountability |
| :--- | :--- | :--- |
| **Legal/Admin** | CEO / Legal Lead | Entity registration and compliance. |
| **Finance** | Finance Lead | Bank accounts, Tax, and Payouts. |
| **Product** | CTO / PM | Technical stability and QA. |
| **Ops/Support** | Ops Lead | Pilot execution and Helpdesk. |

---

## 11. 30-Day Execution Plan
- **Week 1:** Finalize CR and Bank KYC.
- **Week 2:** Setup Google Workspace and Official Emails.
- **Week 3:** Configure CRM and Accounting Stack.
- **Week 4:** Finalize and sign cohort contracts; activate Tap Live Staging.

---

## 12. Decision Criteria (Go / Not Ready)
- **GO:** All Severity 0/1 blockers cleared; Bank account active; Legal entity verified.
- **NOT READY:** Delayed CR; Bank KYC rejected; Critical support SOPs missing.

---

## 13. Next Phase Recommendation
**Transition to Patch 74C â€” Pilot Results + Commercial Readiness Gate.**
This will involve auditing the results from the 14-day invite-only pilot and performing the final manual verification before injecting live payment keys.

---
**Plan Created By:** Antigravity AI  
**Date:** 2026-05-13  
**Verification Status:** **BUSINESS STACK & COMPANY ACTIVATION PLAN DEFINED.**
