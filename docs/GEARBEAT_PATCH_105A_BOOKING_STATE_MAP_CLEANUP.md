# GearBeat Patch 105A — Booking State Map Cleanup / Canonical Booking Lifecycle

## 1. Purpose
GearBeat requires a standardized, canonical booking lifecycle to ensure consistency across the Customer, Studio Partner, and Administrative interfaces. As the platform transitions from "Manual Pilot" to "Live Readiness," these states must be strictly defined to govern access control, payment reconciliation, and automated notifications.

This document serves as the Source of Truth for booking state transitions before any UI alignment (Patch 105B) or future payment webhook implementation.

## 2. Canonical Booking Statuses

| Status | Definition |
| :--- | :--- |
| **draft** | The booking is being configured by the user but has not yet been submitted. |
| **pending_payment** | The booking request has been created and is awaiting a successful payment transaction. |
| **payment_review** | The payment is pending verification (e.g., manual bank transfer review or provider fraud check). |
| **confirmed** | Payment is verified and the studio has approved the request. The session is officially booked. |
| **in_progress** | The booking time has started; the session is currently active. |
| **completed** | The session time has expired and the booking is finalized. |
| **cancelled** | The booking was voided by either the customer, studio, or admin (requires refund if paid). |
| **failed** | The booking failed due to a payment decline or a technical conflict during creation. |
| **refunded** | The booking was cancelled and the original payment has been returned to the customer. |
| **disputed** | A customer or studio has flagged the booking for administrative review (e.g., service quality issue). |

## 3. Status Meanings & Permissions

| Status | Visible To | Meaning | Actions Allowed | Payment Status |
| :--- | :--- | :--- | :--- | :--- |
| **draft** | Customer | Incomplete request. | Edit, Delete | None |
| **pending_payment** | All | Created, waiting for cash. | Pay, Cancel (Customer) | Expected |
| **payment_review** | Admin, Studio | Money is "in the air." | Verify (Admin) | Pending |
| **confirmed** | All | Active reservation. | Cancel (with policy) | Confirmed |
| **in_progress** | All | Live session. | Check-out (Studio) | Confirmed |
| **completed** | All | Finished session. | Review (Customer) | Confirmed |
| **cancelled** | All | Voided. | None | Refund Req. |
| **failed** | Customer, Admin | Payment/Logic error. | Retry | Failed |
| **refunded** | All | Money returned. | None | Refunded |
| **disputed** | All | Under investigation. | Resolve (Admin) | Held/Blocked |

## 4. Allowed Status Transitions

- **draft** → **pending_payment** (Submission)
- **pending_payment** → **payment_review** (Transaction started/Manual upload)
- **pending_payment** → **confirmed** (Instant payment success + Auto-accept)
- **payment_review** → **confirmed** (Admin/Provider verification success)
- **confirmed** → **in_progress** (Time start/Check-in)
- **in_progress** → **completed** (Time end/Check-out)
- **pending_payment** → **failed** (Payment decline)
- **pending_payment** / **confirmed** → **cancelled** (User/Studio action)
- **completed** → **disputed** (Post-session complaint)
- **disputed** → **refunded** (Admin resolution)
- **cancelled** → **refunded** (Automated/Manual refund processing)

## 5. Forbidden Transitions

- **Customer Direct Confirmation**: A customer cannot manually move a booking to `confirmed` (Self-confirmation).
- **Frontend-Only Paid Status**: The UI cannot mark a payment as `paid` without a verified backend signal (Webhook/Admin check).
- **Draft to Completed**: A booking cannot skip the payment and verification lifecycle.
- **Refunded to Confirmed**: Once money is returned, the booking is dead; a new booking is required for a new session.
- **Cancelled to Paid**: A cancelled booking cannot accept new payments; the user must re-book the slot.

## 6. Payment Relationship
Booking status and Payment status are linked but distinct:
- **Source of Truth**: The `payment_transactions` and `checkout_payment_sessions` tables remain the authoritative source for financial status.
- **Manual Lock**: Following **Patch 104A**, manual confirmation is restricted to admins in production.
- **Deferred Live**: Following **Patch 104B**, Tap live integration remains deferred; webhooks will be the future trigger for `confirmed` transitions.

## 7. Display Labels (Suggested)

| Dashboard | `pending_payment` Label | `confirmed` Label | `cancelled` Label |
| :--- | :--- | :--- | :--- |
| **Customer** | Awaiting Payment | Confirmed | Cancelled |
| **Studio Partner** | Pending Payment | Active Booking | Cancelled |
| **Admin Ops** | UNPAID - ACTION REQ | PAID - SECURE | VOID |

## 8. Risks and Gaps
- **Inconsistent UI**: Existing dashboards may still use legacy labels like `accepted` or `pending_review`.
- **DB Constraints**: The `status` column in the `bookings` table must be verified to support all canonical enums.
- **RLS Verification**: Ensure that customers cannot update their own booking status to `confirmed` via direct SQL/API.
- **Refund Edge Cases**: Handling partial refunds for "Maestro" or "Legend" tier users who have specific fee discounts.

## 9. Next Patch Recommendation
**Patch 105B — Booking UI Status Alignment**
Focus on aligning the visible status labels and color codes in the Customer, Studio Owner, and Admin dashboards to match this canonical map, without changing the underlying database logic.
