# GEARBEAT PATCH 125F — PARTNER APPLICATION INTAKE ARCHITECTURE

This document establishes the unified application intake design and future routing roadmap for GearBeat partner ecosystems.

---

## 1. Domain & Routing Architecture

To preserve security boundaries and keep onboarding separate from the public client site, we define the following routing hierarchy:

* **Unified Intake Domain:** `partners.gearbeat.app`
  * Future centralized home for partner marketing, intake application forms, and status lookups.
* **Temporary Internal Route:** `/partners/apply`
  * Active static architecture preview and guide detailing layout requirements and domain maps.
* **Future Subdomain Routing mapping (Post-Approval):**
  * **Studio Owner:** `portal.gearbeat.app`
  * **Seller / Merchant:** `seller.gearbeat.app`
  * **Service Provider:** `providers.gearbeat.app`
  * **Academy Instructor:** `instructors.gearbeat.app`
  * **Ticket Organizer:** `organizers.gearbeat.app`

---

## 2. Partner Type Matrix

| Partner Profile | Description / Industry Fit | Dashboard Subdomain |
|---|---|---|
| **Studio Owner** | Recording facilities, rehearsal rooms, recording desk operators. | `portal.gearbeat.app` |
| **Seller / Merchant** | Music stores, audio gear dealers, brand suppliers, software/licenses. | `seller.gearbeat.app` |
| **Service Provider** | Freelance engineers, mixing/mastering experts, voiceover talent. | `providers.gearbeat.app` |
| **Academy Instructor** | Sound training centers, masterclass instructors, tutors. | `instructors.gearbeat.app` |
| **Ticket Organizer** | Local live shows, demo events, studio tour coordinators. | `organizers.gearbeat.app` |

---

## 3. Separation of Concerns & Security

* **Intake vs. Login:** The intake application pipeline is purely for capturing lead metadata. Once approved, the system generates verified auth users who authenticate via dedicated subdomains.
* **No Public Admin Signup:** Admin and operator credentials are never exposed to public registries or self-service signup interfaces.
* **No Live Automation / Pre-Launch Safety:** Approval remains manual. No automated DB updates or payment integrations are triggered during the pre-launch phase.
* **No Public Document Uploads:** In pre-launch, sensitive registration papers (e.g., Commercial Registration, permits, bank files) are collected offline or via secure admin-guided paths rather than through public intake fields.

---

## 4. Next Planned Patch

* **Patch 125G — Subdomain Routing Readiness Plan**: Document DNS configuration guidelines, middleware routing checks, and subdomain routing headers required to activate multi-tenant subdomains.
