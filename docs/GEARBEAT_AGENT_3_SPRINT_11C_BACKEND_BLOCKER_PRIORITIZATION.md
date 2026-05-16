# GEARBEAT V2: AGENT 3 — SPRINT 11C BACKEND BLOCKER PRIORITIZATION
**Agent:** Agent 3 — Backend / Security / Payment / SQL Readiness  
**Status:** DRAFT / PRIORITIZATION COMPLETE  
**Date:** 2026-05-16  

---

## 1. EXECUTIVE SUMMARY
This report prioritizes the backend and database blockers identified across the GearBeat V2 infrastructure audits. The goal is to establish a clear roadmap for transitioning from the current "Frontend-Heavy" prototype to a secure, atomic, and multi-tenant production environment.

---

## 2. PRIORITY 1: PILOT-CRITICAL HARDENING (BLOCKERS)
These items must be resolved before any external partners are invited to the pilot to prevent financial loss, data corruption, or security breaches.

| Blocker | Risk | Requirement |
| :--- | :--- | :--- |
| **Manual Payment Bypass** | High: Unauthorized state changes | Restrict `/api/checkout/manual-confirm` to `super_admin` role; migrate logic to RLS-enforced table. |
| **Atomic Inventory/Bookings** | Med: Race conditions & double-bookings | Implement PostgreSQL RPCs for stock deduction and slot booking (Atomic "Check-then-Write"). |
| **Foundational Serialization** | Med: Environment drift | Move core tables (`profiles`, `roles`, `partner_accounts`) from `seed.sql` to formal Supabase migrations. |
| **Service Role Mitigation** | High: RLS Bypass | Transition high-risk read/write operations from `supabaseAdmin` to session-authenticated `supabaseUser` clients. |

---

## 3. PRIORITY 2: OPERATIONAL READINESS (PRE-PILOT)
These items are required to manage the pilot effectively and ensure high-trust partner onboarding.

| Blocker | Risk | Requirement |
| :--- | :--- | :--- |
| **Unified Financial Ledger** | Med: Reconciliation errors | Deploy the triple-entry ledger schema to record all manual and test transactions. |
| **Legal Policy Versions** | Med: Legal non-compliance | Implement the backend for versioned Terms & Privacy acceptance tracking. |
| **Support Ticketing (Core)** | Low: Operational overhead | Deploy the `support_tickets` and `ticket_messages` tables for in-app issue tracking. |
| **Staff Audit Logging** | Med: Internal malpractice | Activate `admin_audit_logs` to track all Service Role and Admin UI actions. |

---

## 4. PRIORITY 3: COMMERCIAL SCALE (PRE-LAUNCH)
These items are required for full public go-live and automated financial operations.

| Blocker | Risk | Requirement |
| :--- | :--- | :--- |
| **Live Payment Gateway** | High: Commercial blocker | Integration of Stripe/Tap; removal of "Manual" payment providers from public production. |
| **Full Vertical Backend** | Med: Feature gap | Implement active backend logic for Academy enrollment, Ticket issuance, and Services capacity. |
| **Loyalty & Rewards** | Low: Growth blocker | Deployment of the referral engine and rewards points balances. |
| **Automated Settlements** | Med: Scalability issue | Backend logic for automated payout batching and bank statement reconciliation. |

---

## 5. NEXT STEPS & APPROVAL GATES

### 5.1 Immediate Technical Tasks
1.  **Draft Patch 12A**: Creation of `0001_core.sql` migration (RBAC, Profiles, Partner Accounts).
2.  **Draft Patch 12B**: Implementation of `deduct_inventory()` and `create_booking()` PostgreSQL functions.

### 5.2 Required Approvals
*   Explicit sign-off on the transition from JS-side ownership checks to Database-enforced RLS.
*   Approval of the "Manual Payment" restriction plan before pilot invitation emails are sent.

---

## 6. COMPLIANCE CONFIRMATION

*   **Branch**: `agent-3-sprint-11c-backend-blocker-prioritization`
*   **Documentation-Only**: Verified. No code, SQL drafts, or migrations were modified.
*   **No Code Changes**: Verified. No backend, API, or payment logic was altered.

---
*End of Prioritization Report*
