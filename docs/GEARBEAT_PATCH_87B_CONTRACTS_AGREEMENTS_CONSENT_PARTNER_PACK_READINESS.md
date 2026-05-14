# Patch 87B — Contracts, Agreements, Consent & Partner Pack Readiness

## 1. Executive Summary
This document defines the **Partner Pack Readiness** required for the GearBeat V2 ecosystem. It outlines the mandatory contracts, consents, and verification documents required before any partner (Studio, Vendor, Instructor, etc.) is activated for the invite-only pilot or live commercial operations.

**Disclaimer**: This document is for **readiness and planning purposes only**. It does not constitute legal advice and is not a substitute for final, lawyer-approved contract sets.

---

## 2. Current Status (Post-87A)
- **Company Governance**: Business activation gate (87A) established; CR/Bank/Tax dependencies identified.
- **Vertical Readiness**: Academy safety (86A) and AI data architecture (86B) closed.
- **Technical Status**: Build-verified; no transactional blockers in UI.

---

## 3. The GearBeat Partner Pack
The Partner Pack is a standardized collection of legal agreements tailored to each business vertical.

### 3.1 Vertical-Specific Agreements

| Agreement | Signatory | Requirement Gate | Key Clauses | Status |
| --- | --- | --- | --- | --- |
| **Studio Partner Agreement** | Studio Owner | Pre-Discovery | Availability, Gear Accuracy, Liability. | DRAFT |
| **Marketplace Vendor Agreement** | Shop Manager | Pre-Inventory | Shipping SLA, Returns, Authenticity. | DRAFT |
| **Service Provider Agreement** | Individual Pro | Pre-Listing | Quality, Communication, File Delivery. | DRAFT |
| **Academy Instructor Agreement** | Instructor | Pre-Enrollment | Safety, Minor Rules, Live-Only sessions. | DRAFT |
| **Ticketing Partner Agreement** | Event Organizer | Pre-Sale | Entry Triage, Payout Share, No-Show. | DRAFT |

### 3.2 Global Consent & Utility Agreements

| Agreement | Signatory | Purpose | Key Clauses | Status |
| --- | --- | --- | --- | --- |
| **NDA / Confidentiality** | All Partners | Pilot Security | Data Protection, No Leakage. | DRAFT |
| **Content / Photo Permission** | All Partners | Marketing | GearBeat usage rights for media. | DRAFT |
| **Brand Usage Permission** | All Partners | Certified Pillar | Use of "GearBeat Certified" logos. | DRAFT |
| **Academy Minor Consent** | Parent/Guardian | Safety | Mandatory for students < 18 years. | DRAFT |
| **Terms Acknowledgement** | Customer | Platform Use | Core T&C and Privacy acceptance. | ACTIVE |

---

## 4. Academy-Specific Consent Requirements
As established in 86A, Academy operations have heightened safety dependencies:
- **Age Verification**: Confirmation of age for students (18+ independent / < 18 with guardian).
- **Guardian Supervision**: Explicit agreement for adult supervision during live video calls for minors.
- **No-Recording Policy**: Strict prohibition of session recording unless written multi-party consent exists.
- **Accreditation Disclaimer**: Signed acknowledgement that no official government certificates are offered.

---

## 5. Evidence & Storage Standards

### 5.1 Verification Evidence
Before a partner is "Active" in the CRM, the following evidence must be uploaded to the private admin vault:
- **ID Verification**: National ID or Passport of the signatory.
- **Business Verification**: Copy of Commercial Record (CR) or equivalent.
- **Bank Verification**: IBAN confirmation (e.g., bank statement header).
- **Insurance (If Applicable)**: Copy of professional liability policy.

### 5.2 Document Naming & CRM
- **Format**: `[Partner_ID]_[Document_Type]_[Year].pdf`
- **CRM Tracking**: Each partner record must have "Contract Signed" and "Evidence Verified" boolean flags.

---

## 6. What Remains Blocked
The following remains **PROHIBITED** until the Partner Pack has passed final legal review:
- ❌ **Real Partner Onboarding**: No binding signatures or PII collection.
- ❌ **E-Signature Deployment**: No automated contract sending.
- ❌ **Pilot Execution**: No real sessions or orders for pilot participants.
- ❌ **Marketing Evidence**: No public use of partner-submitted media for commercial gain.

---

## 7. Recommended Next Patch
**Patch 87C — KYC, Document Capture & Admin Verification Workflow**:
- Defining the server-side logic for secure document storage paths.
- Mapping the manual verification steps for administrative sign-off in the Partner Portal.

---

## 8. No-Risk Scope Confirmation
- This is a documentation-only business readiness pack.
- No app pages, components, or API routes were modified.
- No database, Supabase, SQL, or RLS policies were altered.
- No payment, auth, AI, or mobile logic was changed.
- Build status is verified.
