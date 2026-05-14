# Patch 87A — Company, Legal Entity, Finance & Contract Activation Gate

## 1. Executive Summary
This document defines the **Business Activation Gate** required before GearBeat V2 transitions from a technical readiness state (Phase 86) to a real-world commercial entity. This gate ensures that the legal, financial, and contractual foundations are solidified before any pilot participants, partners, or payments are processed.

---

## 2. Current Status (Post-Phase 86)
- **Technical**: Build-verified; PageSpeed 98; Analytics foundations active.
- **Product**: Academy landing page and AI safety architecture established.
- **Operations**: Invite-only pilot model and severity tracking workflows defined.
- **Legal**: Academy, Marketplace, and Privacy policies established in the Legal Hub.

---

## 3. Why This Gate is Required
Real-world execution (Pilot Go-Live) introduces risks that technical readiness alone cannot mitigate:
- **Liability**: Protection of the company and founders during live sessions (Academy/Studios).
- **Compliance**: Adherence to VAT, tax, and commercial registration laws.
- **Financial Integrity**: Ensuring a verified path for partner payouts and tax reporting.
- **Trust**: Solidifying the partner relationship through binding, professional agreements.

---

## 4. Activation Checklists

### 4.1 Company & Legal Entity Readiness
- [ ] **Commercial Record (CR)**: Valid business registration for relevant activities (Music/E-commerce/Services).
- [ ] **Establishment Card**: Official recognition for government and labor portals.
- [ ] **Legal Domicile**: Verified physical or virtual office address for service of notice.
- [ ] **Insurance Review**: Professional liability and data breach insurance assessment.

### 4.2 Finance & Tax Readiness
- [ ] **Commercial Bank Account**: Dedicated business IBAN for platform transactions.
- [ ] **VAT Registration**: Tax identification number (TIN) obtained from ZATCA/relevant authority.
- [ ] **Invoicing Workflow**: Automated or manual ZATCA-compliant e-invoicing established.
- [ ] **Accounting Tool**: Integration of bookkeeping software (e.g., Xero/QuickBooks) for audit trails.
- [ ] **Payout Model**: Finalized internal logic for vendor/partner commissions and net payouts.

### 4.3 Contractual Foundation (Templates Required)
- [ ] **Studio Partner Agreement**: Terms for listing, booking, and gear responsibility.
- [ ] **Marketplace Vendor Agreement**: Terms for shipping, returns, and inventory accuracy.
- [ ] **Service Provider Agreement**: Standards for delivery and professional conduct.
- [ ] **Academy Instructor Agreement**: Safety rules, minor supervision, and live-only delivery terms.
- [ ] **Ticketing Partner Agreement**: Revenue share and entry-management terms.
- [ ] **NDA / Confidentiality**: Standard template for all early-access pilot partners.
- [ ] **Content Permission**: Rights for GearBeat to use partner-submitted photos/videos.

---

## 5. Third-Party Dependencies
- **Tap Payments**: Final KYC (Know Your Customer) and live activation pending CR/IBAN verification.
- **Cloud Infrastructure**: Migration of PII data storage to verified regional clusters if required by data residency laws.
- **Support Tools**: Final configuration of the helpdesk CRM with official company email domains.

---

## 6. What Remains Blocked
Until this gate is satisfied (Decision: READY), the following activities remain **PROHIBITED**:
- ❌ **Contract Execution**: No binding signatures or pilot agreements.
- ❌ **Real PII Capture**: No collection of partner IDs, bank details, or CR documents.
- ❌ **Live Payment Collection**: No processing of real customer funds.
- ❌ **Order Fulfillment**: No real shipping or studio session confirmation.

---

## 7. Decision Criteria
- **READY**: CR, Bank, Tax, and all Contract Templates are finalized and signed off.
- **CONDITIONAL READY**: CR and Bank active; Payouts/Contracts in final legal review (allowed for invite-only prep).
- **NOT READY**: Missing commercial registration or basic legal protections.

---

## 8. Recommended Next Patch
**Patch 87B — Pilot Contract & KYC Workflow Finalization**:
- Finalizing the wording for the IPPR (Internal Pilot Participant Roster) agreements.
- Mapping the manual KYC verification steps for the first pilot cohort.

---

## 9. No-Risk Scope Confirmation
- This is a documentation-only business activation gate.
- No app pages, components, or backend logic were modified.
- No database, Supabase, or payment logic was altered.
- Build status is verified.
