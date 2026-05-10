# GEARBEAT PATCH 52A — OPERATIONS / CRM SCOPE & DATA MAPPING

## 1. Overview
This patch defines the scope and data mapping for the GearBeat V2 Operations and Customer Relationship Management (CRM) foundation. Building on the successful deployment of the Certified infrastructure (Phase 51), Phase 52 aims to consolidate disparate data sources into a unified administrative view for relationship management, pipeline tracking, and operational efficiency.

---

## 2. Current Confirmed State (Post-Patch 51M)
- **Certified Foundation:** Live and secured. Admin actions and public verification are functional.
- **Onboarding:** Studio and Seller application leads are captured in `studio_applications` and `provider_leads`.
- **Infrastructure:** RLS is hardened across sensitive tables; server-side guards are established for administrative mutations.

---

## 3. CRM / Operations Purpose
The internal CRM is designed to:
1. **Unify Relationship Views:** Provide a single source of truth for Vendors, Studios, and High-Value Customers.
2. **Streamline Pipelines:** Track leads from "Applied" to "Active" to "Certified" status.
3. **Operational Visibility:** Allow administrators to monitor bookings, campaign performance, and document compliance at a glance.

---

## 4. Data Sources & Mapping

### 4.1 Lead Management
- **Source Tables:** `provider_leads`, `studio_applications`.
- **CRM Integration:** Map these to a "Lead Pipeline" with stages: *New*, *Contacted*, *Auditing*, *Contracting*, *Approved/Rejected*.

### 4.2 Relationship Management
- **Source Tables:** `studios`, `vendors`, `profiles`.
- **CRM Integration:** Aggregate history including:
    - Certification level (from `certified_studios`).
    - Booking volume (from `bookings`).
    - Document status (from `provider_documents` metadata).

### 4.3 Behavioral Data
- **Source Tables:** `bookings`, `campaigns`, `certification_audit_events`.
- **CRM Integration:** Track engagement metrics for VIP account management.

---

## 5. Suggested Pipeline Stages
- **Stage 1: Prospecting / Inbound** (Initial lead capture).
- **Stage 2: Technical Audit** (Studio hardware/acoustics review).
- **Stage 3: Legal & Contracting** (Document verification and signing).
- **Stage 4: Activation** (Storefront live / Studio booking enabled).
- **Stage 5: Retention / Certification** (Moving towards Elite/Flagship status).

---

## 6. Admin CRM Fields (Proposed)
- **Relationship Owner:** Which admin is handling the account.
- **Trust Level:** Sync with `certified_studios.trust_score`.
- **Compliance Status:** Boolean flags for missing mandatory documents.
- **Last Engagement:** Timestamp of last admin note or status change.

---

## 7. Operational Direction
- **Manual for Now:** Admin notes, manual trust adjustments, and legacy email follow-ups.
- **CSV / Sheets Export:** Prioritize a "Download as CSV" feature for CRM views to support external reporting and email marketing.
- **Future SQL Approval:** Requires new tables for `crm_notes`, `crm_tasks`, and `admin_assignments`.

---

## 8. Risks & Dependencies
- **Data Privacy:** CRM views must respect existing PII protections and RLS constraints.
- **Sync Lag:** Ensure CRM views reflect real-time status changes in the Certified/Studio tables.
- **Scalability:** Avoid heavy joins in the CRM dashboard; use targeted views or optimized queries.

---

## 9. Acceptance Checklist
- [x] Defined CRM scope and purpose.
- [x] Mapped data sources (Leads, Certified, Studios).
- [x] Outlined pipeline stages and admin fields.
- [x] Established direction for manual vs automated operations.

---

## 10. Next Step
- **Patch 52B — CRM Admin Dashboard Foundation:** Creating the visual layout and initial read-only list views for the consolidated CRM dashboard.
