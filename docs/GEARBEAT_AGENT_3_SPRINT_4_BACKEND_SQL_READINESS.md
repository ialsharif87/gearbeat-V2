# SPRINT 4: ACADEMY, SERVICES & TICKETS BACKEND/SQL READINESS (PATCH-104D)
**Agent:** Agent 3 — Backend / Security / Payment / SQL Readiness
**Status:** DRAFT / READINESS PLAN
**Date:** 2026-05-15

---

## 1. OBJECTIVE

This document outlines the backend, database, and API requirements for the three new verticals introduced in Sprint 4: **Academy**, **Services**, and **Tickets**.

**CRITICAL NOTICE:** All SQL migrations, API development, and payment provider integrations described below are strictly **BLOCKED** and require explicit product and security sign-off before implementation. This document serves as a readiness plan only.

---

## 2. ACADEMY LESSONS: BACKEND GAPS

The Academy vertical introduces 1:1 and group lessons for music production, vocal training, etc.

### 2.1 Future Table Requirements (Planning)
*   `academy_instructors`: Links `profiles` to instructor credentials, verification status, and availability.
*   `academy_courses`: Defines curricula, subjects, and format (online vs. in-studio).
*   `academy_cohorts`: Group classes tying a course to a specific schedule and instructor.
*   `academy_enrollments`: Links students (`customer_id`) to a cohort or 1:1 slot.

### 2.2 Future API & RLS Needs
*   **API:** Endpoints to browse instructors, view schedules, and enroll in courses.
*   **API:** Secure video link generation/storage for online lessons.
*   **RLS:** Instructors can manage their own curricula and availability. Students can only see their own enrollments.

---

## 3. SERVICES BOOKING: BACKEND GAPS

The Services vertical allows users to book mixing, mastering, production, etc., from verified studios.

### 3.1 Future Table Requirements (Planning)
*   The current data model uses `studio_features` linked to `studios`.
*   `studio_service_offerings`: A dedicated table linking a studio, a specific service (e.g., "Mixing"), pricing, and delivery timelines.
*   `service_requests` or enhancements to the `bookings` table to handle project-based milestones (e.g., "Draft 1 Delivered", "Revisions Requested").

### 3.2 Future API & RLS Needs
*   **API:** File upload endpoints (stem files, references) using Supabase Storage, ensuring strict access controls.
*   **API:** Milestone approval and release of funds (integration with `settlement_batches`).
*   **RLS:** Only the client and the studio owner can read/write to the specific `service_request` and its attached files.

---

## 4. TICKETS LIFECYCLE: BACKEND GAPS

The Tickets vertical manages entry to masterclasses, workshops, and exclusive events.

### 4.1 Future Table Requirements (Planning)
*   `events`: Organizers, dates, venues, capacities, and event metadata.
*   `ticket_tiers`: Pricing and privileges (e.g., General Admission, VIP).
*   `tickets`: Unique generated QR codes, link to `customer_id`, validation status (`issued`, `scanned`, `revoked`).

### 4.2 Future API & RLS Needs
*   **API:** Atomic ticket issuance. A transaction must deduct available capacity, process payment, and generate a secure QR hash simultaneously.
*   **API:** QR scanning endpoint for event organizers to validate tickets at the door.
*   **RLS:** Customers can view their own tickets. Organizers can view aggregate sales and validate tickets for their own events.

---

## 5. BLOCKED TASKS (REQUIRE EXPLICIT APPROVAL)

The following backend tasks are currently on hold:

1.  **NO SQL Execution:** Do not run `supabase db push` or create new `.sql` migration files.
2.  **NO Database Mutation:** Do not manually insert schema definitions or alter existing tables.
3.  **NO API Implementation:** Do not create or modify routes in `app/api/` to handle the new vertical features.
4.  **NO Live Payment / Finance Logic:** Do not integrate Stripe/Tap or modify `lib/finance-ledger.ts` for Academy/Services/Tickets yet.
5.  **NO Auth Changes:** Do not modify session logic to handle new instructor or organizer roles.

---

## 6. NEXT STEPS
1.  Review this readiness plan against business requirements for Sprint 4.
2.  Once approved, unblock SQL migration drafting (docs-only) for the new tables.
3.  Schedule security review for the secure file transfer flow required by Services.
