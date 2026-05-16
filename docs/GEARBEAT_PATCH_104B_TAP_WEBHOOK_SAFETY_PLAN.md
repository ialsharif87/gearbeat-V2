# GearBeat Patch 104B — Tap Webhook Safety Plan

## 1. Purpose
This document outlines the mandatory safety protocols and architectural requirements for the future implementation of **Tap Payments** webhooks. 

While live payment integration remains **deferred** and is not currently active, this plan establishes the "Safety Baseline" required to prevent financial fraud, data inconsistency, and duplicate transaction processing once the live environment is enabled. No live Tap activation is permitted until all rules in this document are implemented and verified.

## 2. Current Payment Safety Status
The project currently operates under a "Manual-Testing-Only" framework with the following safety gates:
- **Patch 104A (Safety Lock)**: The `api/checkout/manual-confirm` endpoint is locked behind an admin-only guard in production environments. Normal customers cannot self-confirm their own payments.
- **Patch 101B (DB Reality Gate)**: Automatic production database pushes from GitHub Actions have been disabled.
- **Patch 104B (This Patch)**: Live payment provider activation remains strictly prohibited.

## 3. Required Tap Webhook Safety Rules
Any future implementation of a Tap webhook handler (e.g., `/api/payments/tap/webhook`) must adhere to these rules:

1. **Signature Verification**: Every incoming webhook must have its signature (hash) verified against the shared Tap secret before the payload is processed.
2. **Idempotency**: Use a unique transaction or event ID from Tap as an idempotency key to prevent processing the same payment update multiple times (e.g., on webhook retries).
3. **Server-Side Truth**: Never trust payment amounts or currency codes submitted by the client-side frontend. Always use the values returned directly in the verified webhook payload.
4. **Reference Matching**: Match the Tap `charge_id` or `payment_id` against the internal `checkout_payment_sessions` record. Reject any webhook that refers to an unknown internal reference.
5. **Amount Validation**: The amount reported by Tap must exactly match the `payable_amount` stored in the database for that specific booking or order.
6. **Currency Validation**: Verify that the currency code (e.g., `SAR`) matches the expected currency of the original transaction.
7. **Safe State Transitions**: Only allow valid status transitions (e.g., a "paid" status should only be reached from a "pending_payment" state).
8. **Secure Logging**: Log all webhook attempts for audit purposes, but ensure that sensitive data (keys, personal PII) is redacted or handled according to security standards.
9. **No Frontend-Triggered Completion**: Never mark a booking or order as "paid" based on a frontend redirect. Only the verified backend-to-backend webhook is the authoritative source for payment completion.

## 4. Required Payment State Model
The database and API logic must support the following canonical payment states:
- `pending_payment`: Initial state after checkout session creation.
- `payment_review`: Transaction is under manual or provider review.
- `paid`: Successful verification of payment via webhook.
- `failed`: Payment was declined by the provider.
- `cancelled`: User cancelled the payment or the session expired.
- `refunded`: Successful processing of a full or partial refund.

## 5. Required DB Dependencies
The following tables (or equivalent structures) must be verified or created in a future migration before live payments go live:
- `payment_attempts`: Tracking every attempt made by a user.
- `payment_webhook_events`: Raw log of incoming webhook payloads for auditing and debugging.
- `payment_transactions`: Final record of successful or failed payments.
- `payment_refunds`: Tracking refund status and amounts.
- `payout_reconciliation`: Linking payments to partner payouts.

## 6. Blockers Before Tap Live Activation
Before the switch to `pk_live` and `sk_live` can be made:
- **Corporate Readiness**: Active Saudi Commercial Registration (CR) and business bank account (IBAN).
- **Merchant Approval**: Final approval from Tap Payments for the GearBeat merchant account.
- **Legal Compliance**: Finalization of "Refund & Cancellation Policy" and "Privacy Policy" on the public website.
- **Staging Verification**: Successful execution of a full "Sandbox-to-Staging" webhook lifecycle test.
- **Rollback Plan**: A written procedure for disabling live payments and reverting to manual mode if critical issues arise.
- **Admin Reconciliation**: A functional admin interface for monitoring live transactions and processing manual overrides if needed.

## 7. Next Patch Recommendation
**Patch 105A — Booking State Map Cleanup**
This recommended next step focuses on auditing and aligning all existing booking and order statuses (e.g., `confirmed` vs `paid` vs `active`) to ensure a unified state-machine transition when live payment webhooks are eventually introduced.
