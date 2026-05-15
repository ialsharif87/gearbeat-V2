# GEARBEAT: SQL SPRINT 4 — SERVICES, ACADEMY & TICKETS SCHEMA PLAN
**Agent:** Agent 3 — SQL/Database Readiness  
**Status:** DRAFT / PLANNING  
**Date:** 2026-05-15  

---

## 1. PURPOSE OF SQL SPRINT 4
This phase establishes the database infrastructure for three specialized GearBeat verticals: **Services** (audio production work), **Academy** (live educational lessons), and **Tickets** (event management). Each vertical requires unique transactional logic—ranging from minor safety in Academy to capacity management in Tickets.

## 2. DEPENDENCY ON SQL SPRINT 1
- **`partner_accounts` (Sprint 1)**: All Providers, Instructors, and Organizers are anchored to a business entity.
- **`profiles` (Sprint 1)**: Identity and metadata for all actors.
- **`role_definitions`**: Policies enforce `service_provider`, `instructor`, and `ticket_organizer` access boundaries.

## 3. DOMAIN REQUIREMENTS

### 3.1 Services (Audio Production)
- **Model**: High-touch professional services (e.g., mixing, mastering, songwriting).
- **Key Objects**: `service_listings` with specialized `service_availability_rules` for project-based work.

### 3.2 Academy (Education)
- **Model**: Live, synchronous 1:1 or group lessons.
- **Safety**: Mandatory `academy_guardian_consents` for students under 18.
- **Content**: Tracks `academy_lessons` and specific `academy_lesson_sessions` (scheduled time slots).

### 3.3 Tickets (Events)
- **Model**: Physical or digital event attendance.
- **Integrity**: Strict `capacity` tracking on `ticket_types` to prevent over-selling.
- **Execution**: `ticket_checkins` for day-of-event validation.

## 4. LIFECYCLE & INTEGRITY
- **Academy Sessions**: Restricted by `max_students` capacity.
- **Ticket Orders**: Atomic check-ins via `ticket_checkins` to ensure each ticket is used only once.
- **Minor Safety**: Academy enrollments for minors are blocked at the application level until a `guardian_consent` record is verified.

## 5. PAYMENT BOUNDARIES
- **Manual Pilot**: All verticals use the `payment_references` pattern (manual verification) established in Sprint 2.
- **Future Integration**: Each vertical has a dedicated `payment_references` table with `external_id` placeholders for future live payment gateways.

## 6. RLS DIRECTION (DRAFT)
- **Admin**: Full visibility for moderation and support.
- **Partner (Provider/Instructor/Organizer)**: Full CRUD on their own listings, schedules, and attendee lists.
- **Customer**: `SELECT` for published listings; `SELECT/INSERT` for own bookings/enrollments/tickets.
- **Safety (Academy)**: Guardian consents are only readable by the parent, instructor, and admin.

## 7. PRODUCTION VERIFICATION REQUIREMENTS
- Verify that `academy_lessons` only supports live formats for MVP (no pre-recorded content storage required yet).
- Confirm event time zone handling (Riyadh/UTC).
- Audit the "Minor" flag logic in `profiles` to trigger guardian consent workflows.

## 8. MIGRATION RISKS
- **Race Conditions**: Concurrent ticket purchases on the last available seat (requires atomic reservation RPCs).
- **Consent Orphans**: Ensuring enrollments cannot exist without a valid, linked consent record for minors.

---

> [!WARNING]
> **DRAFT ONLY**: This document and the associated SQL file are for planning purposes. They have NOT been executed and should NOT be run against a production database without formal review. Capacity and check-in functions are placeholders for structural readiness.
