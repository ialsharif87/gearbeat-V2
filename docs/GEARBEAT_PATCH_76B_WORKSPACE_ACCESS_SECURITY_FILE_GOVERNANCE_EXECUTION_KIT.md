# GEARBEAT PATCH 76B â€” WORKSPACE / ACCESS / SECURITY / FILE GOVERNANCE EXECUTION KIT

## 1. Overview & Purpose
This document provides the **Workspace and Access Governance Framework** for GearBeat V2 Phase 76. It defines the security standards, account ownership rules, and file governance protocols required to protect company data and maintain operational integrity.

### Critical Safety Status
- **Commercial Launch:** **NOT APPROVED.**
- **Tap Live Payment Activation:** **DEFERRED.** No live production keys authorized.
- **Evidence State:** Verification of these security measures must be logged in the **Patch 75A Evidence Register**.

---

## 2. Workspace Infrastructure Setup (Google/M365)
- [ ] **Domain Verification:** `gearbeat.com` verified on the chosen workspace provider.
- [ ] **Email Structure:**
    - `ceo@gearbeat.com` (Executive)
    - `cto@gearbeat.com` (Technical)
    - `support@gearbeat.com` (Shared Group)
    - `legal@gearbeat.com` (Shared Group)
    - `finance@gearbeat.com` (Shared Group)
- [ ] **MFA Enforcement:** 100% enforcement of Multi-Factor Authentication for all accounts.

---

## 3. Shared Drive & Folder Structure
Standardized folder hierarchy for company document governance:

- **01_Legal_and_Compliance** (Restricted: Exec/Legal)
- **02_Finance_and_Tax** (Restricted: Exec/Finance)
- **03_Operations_and_Partner_Data** (Access: Ops Lead)
- **04_Technical_and_Product_Specs** (Access: Tech Lead)
- **05_Marketing_and_PR** (Access: Marketing Lead)
- **06_Support_SOPs_and_FAQs** (Access: All Staff)

---

## 4. Access Permission Levels
| Role | Folder Access | Tool Access |
| :--- | :--- | :--- |
| **Executive** | All (Read/Write) | Owner (All Tools) |
| **Tech Lead** | Technical (Write), Ops (Read) | Admin (GitHub/Vercel/Supabase) |
| **Ops Lead** | Ops (Write), Legal (Read) | Admin (CRM/Helpdesk) |
| **Staff/Agent** | Support (Write), FAQ (Read) | Agent (Helpdesk/CRM) |

---

## 5. Security & Account Governance
### A. Account Ownership Rules
1. All critical platform accounts (Tap, Supabase, Vercel, Domain) must be registered under a company-owned email (`cto@gearbeat.com` or `ceo@gearbeat.com`), never a personal account.
2. The "Recovery Email" and "Recovery Phone" must be company-controlled.

### B. Password & MFA Checklist
- [ ] **Password Manager:** Bitwarden / 1Password / LastPass company vault setup.
- [ ] **MFA:** Hardware keys (YubiKey) or Authenticator App enforced for Super Admins.
- [ ] **Rotation:** Critical keys rotated every 90 days.

---

## 6. Technical Tool Access Tracker
| Tool | Owner Account | 2FA Status | Access Level |
| :--- | :--- | :--- | :--- |
| **GitHub** | `cto@gearbeat.com` | [Enforced] | Owner |
| **Vercel** | `cto@gearbeat.com` | [Enforced] | Owner |
| **Supabase** | `cto@gearbeat.com` | [Enforced] | Owner |
| **Cloudflare** | `cto@gearbeat.com` | [Enforced] | Owner |
| **Tap.company** | `ceo@gearbeat.com` | [Enforced] | Super Admin |

---

## 7. Offboarding & Governance Rules
### A. Offboarding Checklist
- [ ] Revoke Workspace email access.
- [ ] Remove from GitHub/Vercel/Supabase teams.
- [ ] Rotate shared vault passwords in the password manager.
- [ ] Revoke CRM and Support agent seats.

### B. Naming Conventions
- **Format:** `YYYYMMDD_DocumentName_Version_Status.ext`
- **Example:** `20260513_Studio_MSA_v1.2_DRAFT.pdf`

---

## 8. Business Workspace Setup Tracker

| Action | Category | Owner | Target Date | Status |
| :--- | :--- | :--- | :--- | :--- |
| **Workspace Setup** | Infrastructure | CTO | [Date] | [Open] |
| **Password Vault** | Security | CTO | [Date] | [Open] |
| **Shared Drive Config** | Governance | Ops Lead | [Date] | [Open] |
| **MFA Audit** | Security | CEO | [Date] | [Open] |

---

## 9. Evidence Required Before Commercial Launch
1.  **Security Snapshot:** Screenshot showing 100% MFA enforcement on Workspace.
2.  **Access Log:** Audit log from Supabase/Vercel showing only authorized company emails.
3.  **Ownership Verification:** Confirmation that all production accounts are linked to `@gearbeat.com`.

---

## 10. Next Recommended Action
**Trigger Workspace Setup.**
1. Purchase and verify the `gearbeat.com` domain on the chosen workspace provider.
2. Initialize the **Super Admin** accounts with hardware MFA.
3. Configure the **Shared Drive** folder structure as defined in Section 3.

---
**Report Created By:** Antigravity AI  
**Date:** 2026-05-13  
**Verification Status:** **WORKSPACE & ACCESS GOVERNANCE DEFINED. PENDING EXECUTION.**
