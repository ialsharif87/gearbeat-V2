# GEARBEAT PATCH 67A — BOOKING LIFECYCLE + CANCELLATION/REFUND STATE MAP

## 1. Overview
This is a **documentation and planning-only** patch for GearBeat V2. It defines the comprehensive booking lifecycle, cancellation rules, and refund states. This serves as the technical blueprint for Phase 67/68 backend hardening and Tap payment integration.

**Policy:** Documentation-only. Zero mutations to code, database, or API logic.

---

## 2. Current Booking Flow Observations
Based on the code audit (Patch 66A/66B) and current UI implementation:
- **Creation:** Bookings are created via `create_studio_booking_v1` RPC, which handles atomic conflict checks and initial record insertion.
- **Initial State:** New bookings start in `pending_owner_review` status.
- **Payment Lifecycle:** 
  - A `checkout_payment_session` is created immediately after booking creation.
  - Pilot supports **Manual Test Payment** (bypasses gateway) and **Tap Payment** (integration foundation).
- **Notification:** Both customer and owner are notified upon creation and status change.
- **Owner Control:** Owners can Accept/Reject pending bookings and Confirm/Cancel accepted ones.

---

## 3. Target Booking Lifecycle States

### A. Booking Statuses (`status`)
| State | Description |
| :--- | :--- |
| `pending_review` | Booking created, awaiting studio owner approval. |
| `accepted` | Studio owner approved, but payment is not yet confirmed. |
| `confirmed` | Paid and Approved. This is the "Ready to Record" state. |
| `rejected` | Studio owner declined the request (pre-payment). |
| `cancelled` | Cancelled by customer or owner after confirmation. |
| `in_progress` | Session currently active (checked-in). |
| `completed` | Session finished successfully. |
| `no_show` | Customer did not arrive for the session. |

### B. Payment Statuses (`payment_status`)
| State | Description |
| :--- | :--- |
| `pending` | Initial state, awaiting transaction initiation. |
| `unpaid` | Transaction failed or abandoned at gateway. |
| `paid` | Successfully captured via Tap or manual override. |
| `manual_paid` | Administrative override for cash/offline payments. |
| `failed` | Payment transaction rejected by bank/gateway. |
| `refund_pending` | Cancellation triggered, awaiting bank reversal. |
| `refunded` | Money successfully returned to customer. |

---

## 4. User Journeys

### A. Customer Journey
1.  **Selection:** Chooses studio, date, and time slot.
2.  **Draft:** Clicks "Create Booking". Record is created in `pending_review`.
3.  **Checkout:** Proceeds to payment.
4.  **Payment:** Pays via Tap or Manual (Pilot). Status becomes `confirmed` (if auto-accept) or remains `pending_review` until owner acts.
5.  **Execution:** Attends session. Status moves to `completed` after time expires or manual check-out.

### B. Studio Owner Journey
1.  **Intake:** Receives notification of new `pending_review` booking.
2.  **Decision:** Accepts or Rejects.
3.  **Preparation:** Prepares studio for `confirmed` bookings.
4.  **Closing:** Marks booking as `completed` or `no_show` if needed.

### C. Admin Journey
1.  **Monitoring:** Views all bookings globally.
2.  **Resolution:** Manually overrides payment status for disputes.
3.  **Refunds:** Triggers refund for cancelled `paid` bookings.

---

## 5. Cancellation & Refund Rules

### Cancellation Scenarios
- **Customer Cancellation (Pre-Confirmation):** No penalty, session is released.
- **Customer Cancellation (Post-Confirmation):**
  - **> 24h notice:** 100% refund (minus transaction fees).
  - **< 24h notice:** Partial refund or credit (per studio policy).
- **Studio Cancellation:** 100% refund to customer + platform penalty for owner.

### Refund Workflow (Planned)
1.  **Trigger:** Booking status set to `cancelled`.
2.  **Check:** If `payment_status` is `paid`, set `payment_status` to `refund_pending`.
3.  **Execution:** Call Tap Refund API.
4.  **Closure:** Upon webhook confirmation, set `payment_status` to `refunded`.

---

## 6. Pilot vs. Future Boundaries

| Feature | Pilot (Manual/Tap) | Future (Production) |
| :--- | :--- | :--- |
| **Acceptance** | Manual per booking | Auto-accept for trusted studios |
| **Payments** | Manual Confirm + Tap Sandbox | Tap Production + Apple/Google Pay |
| **Payouts** | Manual bank transfer | Automated Tap Connect payouts |
| **Cancellations**| Manual admin intervention | Automated rule-based refunds |

---

## 7. Risks & Blockers
1.  **Schema Drift:** High risk that `payment_status` and `status` constraints in production do not match the local `patch_70` migration.
2.  **Atomic State:** If a Tap webhook fails, the booking might remain `pending` while the money is taken. **Requirement:** Idempotent webhook processing.
3.  **Refund Liquidity:** Handling refunds for money already disbursed to studio owners.

---

## 8. Next Steps
- **Next Patch (67B):** Marketplace Order Lifecycle + Inventory State Map.
- **Phase 68:** Implementation of the state transitions defined here with full RLS protection.

---
**Plan Created By:** Antigravity AI
**Date:** 2026-05-12
**Verification Status:** DOCUMENTATION ONLY. NO CODE MUTATION.
