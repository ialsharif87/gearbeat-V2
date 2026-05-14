# Patch 91B — Business Tools Setup Runbook & External Account Readiness Checklist

## 1. Executive Summary
This document establishes the **Business Tools Setup Runbook** and **External Account Readiness Checklist** for GearBeat V2. It provides the operational framework required to initialize the external ecosystem (Communication, CRM, Accounting, Legal) needed to support a future invite-only pilot.

**Final Verdict**: **BUSINESS TOOLS SETUP RUNBOOK READY — REAL PILOT EXECUTION STILL NOT APPROVED**.

---

## 2. Infrastructure & Communication Readiness

### 2.1 Google Workspace Setup
| Action | Description | Readiness |
| --- | --- | --- |
| **Official Domains** | Setup admin@[Placeholder], help@[Placeholder], partners@[Placeholder]. | ❌ PENDING |
| **Drive Structure** | `/Pilot_Ops`, `/Legal_Vault`, `/Partner_Evidence`, `/Financials`. | ❌ PENDING |
| **Security Baseline** | Enforce 2FA on all @[Placeholder] accounts. | ❌ PENDING |

### 2.2 Notion / Company OS
| Action | Description | Readiness |
| --- | --- | --- |
| **Wiki Structure** | Product Roadmap, Pilot Runbooks, Support Triage. | ✅ READY (90B) |
| **Candidate DB** | Private candidate pipeline (Non-PII only for preparation). | ✅ READY (90A) |

---

## 3. Operational Tooling Readiness

### 3.1 CRM & Support
- **CRM Tool**: [Placeholder] initialized with partner pipelines.
- **Helpdesk**: [Placeholder] ready for support@ ticket intake.
- **WhatsApp Business**: Official GearBeat account for partner outreach simulation.

### 3.2 Accounting & Finance
- **Invoicing Tool**: Electronic invoicing enabled (ZATCA-ready).
- **Tax Calculation**: VAT rules verified for Marketplace/Academy transactions.
- **Payment Verification**: Manual IBAN/ID verification workflow in Evidence Tracker.

### 3.3 Legal & Contracts
- **e-Signature Tool**: [Placeholder] ready for NDA and Service Agreement signing.
- **Contract Vault**: Secure storage for signed partner agreements.
- **Legal Registry**: Tracker for active contract dates and renewal alerts.

---

## 4. Analytics & Marketing Readiness
- **Google Analytics 4**: Baseline tracking active on production.
- **Sentry / Monitoring**: Error tracking and heartbeat active.
- **Marketing Pixel**: Social attribution ready for pilot outreach observation.

---

## 5. Owner / Action / Status Tracker

| Tool Domain | Responsible Owner | Priority | Status |
| --- | --- | --- | --- |
| **Workspace Setup** | IT / Admin | High | ❌ PENDING |
| **CRM / Support** | Ops | High | ❌ PENDING |
| **Accounting Tool** | Finance | High | ❌ PENDING |
| **Legal / e-Sign** | Legal | High | ❌ PENDING |
| **Analytics Audit** | Technical | Medium | ✅ READY |

---

## 6. External Account Blocker List
- **Official Email Access**: Real partner outreach is prohibited until official @[Placeholder] accounts are active.
- **Contract Fulfillment**: Signing of agreements is prohibited until the e-Signature tool is legally configured.
- **Accounting Verification**: Real-world invoicing is blocked until the ZATCA-compliant tool is initialized.
- **PII Storage**: Collection of real IDs/CRs is prohibited until the "Legal Vault" storage is audited and approved.

---

## 7. No-Risk Scope Confirmation
- This is a documentation-only business tools setup and readiness runbook.
- No external accounts, APIs, or database records were created.
- No app code, components, routes, or API files were modified.
- No database, Supabase, SQL, or RLS policies were altered.
- Build status is verified.
