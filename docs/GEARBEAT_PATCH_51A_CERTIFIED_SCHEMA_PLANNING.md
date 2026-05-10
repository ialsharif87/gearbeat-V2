# GEARBEAT PATCH 51A — CERTIFIED SCHEMA PLANNING

## 1. Overview
This patch documents the database architecture and technical planning for the **GearBeat Certified** program. Following the successful UI foundation in Patch 50, this document serves as the blueprint for the live implementation of studio trust, tier management, and QR verification logic.

**Current Status (Patch 50 Recap):**
- Public landing page (`/gearbeat-certified`) is complete.
- Public verification route (`/gearbeat-certified/[slug]`) is established with static placeholders.
- Admin management interface (`/admin/certified-studios`) is established with static placeholders.
- `StudioTierBadge` component is fully functional for all five trust levels.

---

## 2. Proposed Database Tables (Planning Only)

### 2.1 `studio_tiers`
Defines the available certification levels.
- `id`: uuid (PK)
- `name`: text (e.g., 'premium')
- `display_name_en`: text
- `display_name_ar`: text
- `description_en`: text
- `description_ar`: text
- `rank`: integer (for sorting/hierarchy)
- `color_hex`: text
- `created_at`: timestamptz

### 2.2 `certified_studios`
The core junction table linking studios to their current certification state.
- `id`: uuid (PK)
- `studio_id`: uuid (FK -> studios.id, Unique)
- `tier_id`: uuid (FK -> studio_tiers.id)
- `status`: enum (pending, approved, rejected, suspended, expired)
- `trust_score`: integer (0-100)
- `hardware_verified_at`: timestamptz
- `acoustics_verified_at`: timestamptz
- `business_verified_at`: timestamptz
- `expires_at`: timestamptz
- `created_at`: timestamptz
- `updated_at`: timestamptz

### 2.3 `studio_certification_history`
Audit trail for every status or tier change.
- `id`: uuid (PK)
- `certified_studio_id`: uuid (FK -> certified_studios.id)
- `previous_status`: text
- `new_status`: text
- `previous_tier_id`: uuid
- `new_tier_id`: uuid
- `changed_by`: uuid (FK -> profiles.id, the Admin)
- `reason_note`: text
- `created_at`: timestamptz

### 2.4 `qr_verification_links`
Secure links for physical QR badges in studios.
- `id`: uuid (PK)
- `certified_studio_id`: uuid (FK -> certified_studios.id, Unique)
- `verification_token`: uuid (Unique, for secure URL verification)
- `scan_count`: integer
- `last_scanned_at`: timestamptz
- `created_at`: timestamptz

### 2.5 `certification_audit_events`
Technical event log (e.g., "Verification Scanned", "Document Uploaded for Audit").
- `id`: uuid (PK)
- `certified_studio_id`: uuid (FK -> certified_studios.id)
- `event_type`: text
- `metadata`: jsonb (e.g., user_agent, IP, document_id)
- `created_at`: timestamptz

---

## 3. Business Logic Constants

### 3.1 Certification Statuses
- `pending`: Application submitted, waiting for admin audit.
- `approved`: Active certification, visible on public pages.
- `rejected`: Application failed audit.
- `suspended`: Temporarily hidden due to policy violation or equipment maintenance.
- `expired`: Certification validity period has passed.

### 3.2 Tier Values
- `verified`: Identity and license check only.
- `trusted`: Proven track record + License.
- `premium`: High-end gear + Acoustic audit.
- `elite`: World-class equipment + Engineering excellence.
- `flagship`: Platinum-standard acoustics + Iconic status.

---

## 4. Requirement Specifications

### 4.1 Public Verification Page Data
To replace static placeholders in `/gearbeat-certified/[slug]`, the following data must be fetched:
- Current `tier_id` and associated display metadata.
- `status` (must be 'approved' for public success banner).
- `trust_score`.
- `hardware_verified_at` / `acoustics_verified_at` for transparency.

### 4.2 Admin Control Requirements
The admin dashboard requires:
- Ability to update `status` and `tier_id`.
- Mandatory `reason_note` for status changes (logged to history).
- QR token regeneration capability.
- List of audit events for the specific studio.

---

## 5. Security & RLS Planning

### 5.1 RLS Notes
- **certified_studios**:
    - `SELECT`: Public if `status = 'approved'`. Owners can see their own regardless of status. Admins can see all.
    - `INSERT/UPDATE`: Restricted to Admins only.
- **qr_verification_links**:
    - `SELECT`: Restricted to Admins and the specific Studio Owner.
- **studio_certification_history**:
    - `SELECT`: Restricted to Admins. Owners might get read-only access in the future.

### 5.2 Risks & Mitigations
- **Risk:** QR code spoofing. 
    - **Mitigation:** Use unique `verification_token` in URLs that must match the DB record; do not rely on simple studio slugs for live verification.
- **Risk:** Unauthorized tier escalation.
    - **Mitigation:** Strict RLS enforcing that only users with `admin` role can perform UPDATE on `certified_studios`.
- **Risk:** Expired certifications appearing as active.
    - **Mitigation:** Database cron job or edge function to auto-update status to `expired` based on `expires_at`.

---

## 6. Roadmap Dependencies & Web Readiness Notes

Future implementation steps (Post-51A) must address:
- **Full Route Inventory:** Ensure all studio routes correctly display the tier badge if certified.
- **Premium Page-Quality Audit:** Final visual polish of the verification certificate.
- **Mobile/RTL Readiness:** Ensuring the certification grid and badges behave correctly on small screens and Arabic layouts.
- **Forms Validation Audit:** Secure forms for studio owners to apply for certification.
- **Empty/Error/Loading States:** Proper UI handling when a studio is not certified or the verification link is invalid.
- **Analytics & Funnel Tracking:** Tracking scans vs. bookings to measure the ROI of the certification program.
- **Admin Operations Readiness:** Training for staff on how to conduct hardware/acoustic audits.
- **SEO & Legal Placement:** Ensuring certification terms are present in the legal footer and SEO metadata.
- **Performance/Accessibility Baseline:** Ensuring high Lighthouse scores for the public verification page.

---

## 7. Rollout Plan
1. **Patch 51A (Current):** Documentation and Blueprint.
2. **Patch 51B:** SQL Migration (Tables, Enums, Relationships).
3. **Patch 51C:** RLS Policies and Security Hardening.
4. **Patch 51D:** Server Actions for Admin mutations.
5. **Patch 51E:** Frontend Data Binding (UI -> DB).

---

## 8. Acceptance Checklist (Pre-SQL)
- [ ] Table names and fields reviewed for naming consistency.
- [ ] All certification statuses accounted for in business logic.
- [ ] Tier hierarchy matches the `StudioTierBadge` component.
- [ ] RLS strategy covers both public and private data visibility.
- [ ] Audit trail requirements are met for compliance.
