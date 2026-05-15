# Patch 104D — Sprint 4 Business, Legal & Ops Readiness Pack

## 1. Executive Summary
This document outlines the **Business/Investor/Ops/QA Readiness** for the Academy, Services, and Tickets verticals as part of Sprint 4. While the technical UI and database schemas for these verticals are established (Phase 104D), this pack defines the operational boundaries, legal requirements, and blocked actions necessary to maintain regulatory compliance and investor safety before the commercial launch.

---

## 2. Product Vertical Business Readiness

### 2.1 Academy Readiness
- **Status**: UI-ready for course browsing and simulated enrollment.
- **Business Model**: Private commercial marketplace for live, synchronous music and audio learning.
- **Legal Positioning**: Non-accredited status explicitly documented to manage regulatory expectations.
- **Support Strategy**: Live session dispute resolution and rescheduling policies defined.

### 2.2 Services Readiness
- **Status**: UI-ready for professional directory browsing.
- **Business Model**: Commission-based lead generation and booking for creative professionals (Photography, Editing, etc.).
- **Partner Standard**: Professional vetting based on portfolio and verified credentials.

### 2.3 Tickets Readiness
- **Status**: UI-ready for event discovery and simulated seat selection.
- **Business Model**: Integrated ticketing and access management for workshops and community events.
- **Ops Strategy**: QR-based entry management and revenue share logic established.

---

## 3. Operational & Legal Readiness

### 3.1 Legal & Contractual Readiness
- **Academy Instructor Agreement**: Safety rules, minor supervision, and live-only delivery terms defined.
- **Service Provider Agreement**: Standards for delivery and professional conduct.
- **Ticketing Partner Agreement**: Revenue share and entry-management terms.
- **Policy Hub**: All vertical-specific policies are integrated into the `/legal` hub.

### 3.2 Partner & Support Readiness
- **Instructor Verification**: Defined "GearBeat-verified" standards for creative professionals.
- **Helpdesk Workflow**: Support ticketing logic for partner disputes and customer inquiries.
- **KYC Preparedness**: Mapping of required documents for the first pilot cohort.

---

## 4. Evidence Required for Activation
To transition from "Technical Ready" to "Pilot Go-Live," the following evidence must be provided:
- [ ] **Commercial Record (CR)**: Valid registration for E-commerce and Educational Training activities.
- [ ] **Tax Compliance**: VAT/TIN registration from ZATCA or relevant regional authority.
- [ ] **Bank Verification**: Business IBAN associated with the legal entity.
- [ ] **Partner KYC**: Collection of partner IDs and business registration for all first-cohort vendors.

---

## 5. Prohibited Commercial Actions (Sprint 4)
To maintain the safety of the current build, the following actions remain **STRICTLY BLOCKED**:
- ❌ **Real Partner Onboarding**: No binding contracts or live partner account activation.
- ❌ **Real PII Collection**: No collection of official IDs, private bank details, or legal documents from users/partners.
- ❌ **Paid Academy Sessions**: No real funds processed for instructor lessons.
- ❌ **Live Ticket Sales**: No issuance of real, commercially binding event tickets.
- ❌ **Live Payments**: All checkout flows must remain in "Deferred/Manual" placeholder mode.

---

## 6. Sprint 4 Confirmations & Disclaimers
> [!IMPORTANT]
> **NO REAL ONBOARDING**: All partner data currently in the system is for demonstration/testing purposes only.
> 
> **NO PII COLLECTION**: No real-world Personal Identifiable Information is being collected or stored in the current phase.
> 
> **NO COMMERCIAL LAUNCH**: The platform remains a private pilot project; no public marketing or live commerce is authorized.
> 
> **DOCS-ONLY**: This patch contains no modifications to app code, backend logic, or database schemas.
