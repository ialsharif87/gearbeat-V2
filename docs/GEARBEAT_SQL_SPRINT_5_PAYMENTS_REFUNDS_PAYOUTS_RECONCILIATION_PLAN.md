# GEARBEAT: SQL SPRINT 5 — PAYMENTS, REFUNDS, PAYOUTS & RECONCILIATION PLAN
**Agent:** Agent 3 — SQL/Database Readiness  
**Status:** DRAFT / PLANNING  
**Date:** 2026-05-15  

---

## 1. PURPOSE OF SQL SPRINT 5
This phase establishes the high-integrity financial engine of GearBeat. It consolidates all vertical-specific transactions (Studios, Marketplace, Academy, Services, Tickets) into a unified ledger, ensuring auditability, accurate commission calculations, and automated reconciliation.

## 2. DEPENDENCY ON PREVIOUS SPRINTS
- **Sprint 1 (Identity/Audit)**: Financial actions are performed by specific roles (`finance_admin`) and logged in `system_audit_logs`.
- **Verticals (Sprints 2-4)**: Every payment or refund must link back to a vertical-specific record (e.g., `studio_bookings`, `marketplace_orders`).

## 3. UNIFIED PAYMENT MODEL
- **`payment_sessions`**: The source of truth for the start of a transaction. Captures the intent before the user reaches the gateway.
- **`payment_transactions`**: The finalized record of success or failure.
- **Idempotency**: `payment_idempotency_keys` prevent double-billing during network retries or duplicate webhook events.
- **Webhooks**: `payment_webhook_events` ensures we have a verbatim log of every message from the provider (Tap/Stripe).

## 4. MANUAL PAYMENT BOUNDARY (PILOT)
For the current pilot phase, `manual_payment_confirmations` act as the primary bypass.
- **Security**: These records require an `actor_id` (admin/support) to verify that funds were received out-of-band.
- **Transition**: This boundary is designed to be easily replaced by live gateway callbacks without changing the vertical logic.

## 5. REFUND & PAYOUT LIFECYCLE
- **Refunds**: Formal `refund_requests` allow for partial or full returns, with tracking for reason and approval status.
- **Payouts**: Managed via `payout_batches`. Instead of immediate payouts per sale, funds are batched (weekly/monthly) to minimize processing fees and facilitate reconciliation.
- **Commissions**: Calculated via `commission_rules` allowing for platform-wide defaults and partner-specific overrides.

## 6. FINANCE LEDGER & RECONCILIATION
- **`finance_ledger_entries`**: The immutable, triple-entry accounting record. Every transaction, refund, and payout generates a balanced set of ledger entries.
- **`reconciliation_runs`**: Automated jobs that compare internal ledger states against external provider reports, flagging discrepancies for manual review.

## 7. RLS DIRECTION (DRAFT)
- **Finance Admin**: Full `SELECT` access to all financial tables. No `UPDATE/DELETE` allowed on finalized ledger entries.
- **Partners**: `SELECT` access to their own `payout_items`, `commission_calculations`, and sales-related ledger summaries.
- **Customers**: `SELECT` access to their own `payment_transactions` and `refund_requests`.

## 8. PRODUCTION VERIFICATION REQUIREMENTS
- **Security Audit**: Ensure `payment_sessions` do not accidentally leak PII in metadata.
- **Precision**: Verify `DECIMAL(12, 2)` handles the required SAR precision and rounding rules.
- **Constraints**: Enforce `UNIQUE` constraints on external provider reference IDs to prevent duplicate transaction entries.

## 9. MIGRATION RISKS
- **Drift**: Legacy payment references in vertical tables must be migrated to the new unified `payment_references_unified` table.
- **Atomic Failure**: Ledger entries must be wrapped in strict database transactions with the vertical state change to prevent "ghost payments" (money moved but booking not confirmed).

---

> [!WARNING]
> **DRAFT ONLY**: This document and the associated SQL file are for planning purposes. They have NOT been executed and should NOT be run against a production database without formal review. Live payments (Tap/Stripe) remain blocked until all legal, bank, and technical gates are explicitly approved.
