# GEARBEAT PATCH 81A — BUSINESS OPERATIONS + PARTNER / INSTRUCTOR READINESS

## 1. Overview
This patch establishes the **Business Operations and Partner Readiness** framework for GearBeat V2. It defines the mandatory operating model for onboarding all partner categories before any pilot or commercial activity. This is a **documentation-only** patch designed to ensure operational integrity and regulatory compliance.

## 2. Partner Categories & Scope

| Category | Primary Role | Transaction Hub |
| --- | --- | --- |
| **Studio Partners** | Providing recording & production spaces. | Studios / Bookings |
| **Marketplace Sellers** | Selling verified professional audio gear. | Marketplace |
| **Service Providers** | Offering mixing, mastering, and engineering. | Services |
| **Academy Instructors** | Leading 1:1 and group music/audio lessons. | Academy |
| **Ticketing Partners** | Hosting masterclasses, events, and launches. | Tickets |

---

## 3. Onboarding & Verification Readiness

### 3.1 Required Documents by Category
| Document | Studios | Vendors | Services | Academy | Events |
| --- | --- | --- | --- | --- | --- |
| **Commercial Reg (CR)** | Mandatory | Mandatory | Optional | No | Mandatory |
| **VAT Certificate** | Mandatory* | Mandatory* | Optional | No | Mandatory* |
| **Identity Proof (ID)** | Mandatory | Mandatory | Mandatory | Mandatory | Mandatory |
| **Professional Portfolio** | Optional | No | Mandatory | Mandatory | Optional |
| **Academic Credentials** | No | No | Optional | Mandatory | No |
| **Bank Account Proof** | Mandatory | Mandatory | Mandatory | Mandatory | Mandatory |
| **Signed MSA / Agreement** | Mandatory | Mandatory | Mandatory | Mandatory | Mandatory |
*\*If meeting government thresholds.*

### 3.2 Academy Instructor Special Requirements
- **Credentials**: Verification of degrees, certifications, or 5+ years of verified industry experience.
- **Portfolio**: Review of student testimonials or professional audio work.
- **Language**: Assessment of proficiency in English and/or Arabic for the target audience.
- **Technical Readiness**: Verification of stable internet, microphone quality, and DAW setup for online lessons.
- **Safeguarding**: Signed acknowledgment of the **GearBeat Minor Protection Policy**.

---

## 4. CRM & Pipeline Infrastructure

### 4.1 CRM Pipeline Stages (Admin View)
1.  **Lead Intake**: Web form or manual entry into `provider_leads`.
2.  **Vetting**: Operational review of credentials and facility/gear quality.
3.  **Negotiation**: Commission agreement and contract terms.
4.  **Contracting**: E-signature dispatch and document collection.
5.  **Provisioning**: Creation of the Partner Portal profile and storefront.
6.  **Certified Status**: Awarding of the "GearBeat Certified" badge (Patch 50+).
7.  **Active**: Live and ready to accept bookings/orders.

---

## 5. Support & Escalation Workflow

### 5.1 Support Tiers
- **Tier 1 (L1)**: General inquiries, navigation help, and basic account issues.
- **Tier 2 (L2)**: Partner-specific issues, booking disputes, and payout queries.
- **Tier 3 (L3)**: Technical bugs, security incidents, and database errors (Dev Escalation).

### 5.2 Manual Evidence Capture
During the pilot, all support resolutions and transaction disputes must be recorded in the **Patch 75A Evidence Register** to maintain a paper trail for commercial audit.

---

## 6. Financial & Accounting Readiness

### 6.1 Manual Invoice Workflow
- **Customer Side**: Generation of a pro-forma "Purchase Intent" document.
- **Finance Side**: Manual verification of bank transfer/STC Pay in the **Pilot Finance Tracker**.
- **Partner Side**: Manual confirmation of receipt before service/shipping is authorized.

### 6.2 Financial Boundaries
- **Tap Live Payments**: Strictly **DEFERRED**. No automated credit card processing during this readiness phase.
- **Platform Fee**: Standard 10-20% fee to be calculated manually for each pilot transaction.

---

## 7. Technical & Legal Boundaries

### 7.1 Pilot Boundaries
- **No-Real-Partner Boundary**: Onboarding in the current phase is limited to **Internal/Pilot Leads** only.
- **No-Real-Payment Boundary**: Real money should not be processed until the **82A Payment Security Gate** is cleared.

### 7.2 AI Readiness Notes
- **Data Guardrails**: AI recommendation engines must strictly use internal, verified partner data.
- **Integrity**: No synthetic partner ratings, availability, or pricing shall be generated.

### 7.3 Mobile Readiness Notes
- **Admin Access**: Partner management and vetting will remain desktop-optimized during the pilot.
- **Partner UX**: Basic responsive mobile access for instructors to view schedules.

---

## 8. Data Implementation (Future Dependencies)
The following data fields must be included in future `profiles` and `academy_mentors` table migrations:
- `verification_status`: `pending`, `vetted`, `certified`, `rejected`.
- `document_paths`: Secure URLs to `provider-documents` storage.
- `mentor_languages`: Array of supported languages.
- `safeguarding_signed`: Boolean flag for minor protection acknowledgment.

---

## 9. QA & Final Readiness Gate

### 9.1 Pre-Full-Journey QA Requirements
- All partner agreement templates must be e-signature ready.
- The **Pilot Finance Tracker** must be initialized.
- The **Support SLA** must be documented and signed-off by the Ops Lead.

### 9.2 Decision Gate
A **Final Go/No-Go Review** is required after the following patches are complete:
- **82A**: Payment Security & Hardening.
- **83A**: Conflict Resolution & Support Workflows.

---

## 10. No-Risk Scope Confirmation
- This is a documentation-only patch.
- No backend code, database schema, or live onboarding logic was modified.
- No live payment, CRM, or support desk integrations were implemented.
- No real partners have been onboarded in the production environment.
