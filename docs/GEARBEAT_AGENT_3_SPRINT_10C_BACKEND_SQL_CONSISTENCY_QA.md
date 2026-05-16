# GEARBEAT V2: AGENT 3 — SPRINT 10C BACKEND / SQL CONSISTENCY QA
**Agent:** Agent 3 — Backend / Security / Payment / SQL Readiness  
**Status:** QA COMPLETE / CONSISTENCY VERDICT: **FRAGMENTED**  
**Date:** 2026-05-16  

---

## 1. CONSISTENCY VERDICT
The current technical state of GearBeat V2 is **Fragmented**. While a comprehensive SQL blueprint (100+ tables) has been drafted to consolidate financial, legal, and vertical logic, the actual backend implementation (API routes and Server Components) continues to rely on legacy "Reality Audit" assumptions, service-role overrides, and non-atomic state transitions.

---

## 2. KEY INCONSISTENCIES IDENTIFIED

### 2.1 Inventory & Booking Atomicity
*   **SQL Plan**: Proposes `inventory_locks` and atomic reservations to prevent overselling.
*   **API Reality**: Marketplace `create-order` and Studio `bookings/create` routes perform "Read-then-Write" availability checks in JavaScript.
*   **Gap**: High-concurrency race conditions are still possible; the backend does not yet utilize the planned PostgreSQL advisory locks or atomic RPCs.

### 2.2 Manual Payment Confirmation
*   **SQL Plan**: Proposes RLS-enforced `manual_payment_confirmations` where only verified `finance_admin` roles can trigger state changes.
*   **API Reality**: The `manual-confirm` route uses `supabaseAdmin` to bypass RLS and relies on a list of hardcoded "owner columns" (`customer_auth_user_id`, `auth_user_id`) to verify permission in JS.
*   **Gap**: Bypasses the planned RBAC (Role-Based Access Control) framework.

### 2.3 Service-Role vs. RLS Alignment
*   **SQL Plan**: Section 10 of the Master Review mandates strict isolation via RLS so vendors/partners only see their own revenue data.
*   **API Reality**: Extensive use of `createAdminClient` in `app/api/` and Server Components (e.g., `marketplace/cart`) bypasses RLS entirely.
*   **Gap**: The security model is currently application-enforced rather than database-enforced, increasing the risk of data leakage if API logic contains flaws.

### 2.4 "Draft-Only" Verticals
*   **SQL Plan**: Detailed schema drafts exist for Academy, Tickets, and Services.
*   **Backend Reality**: These verticals are largely frontend-only or static previews. There are no corresponding API routes or backend logic for capacity management, minor safety checks (Academy), or ticket issuance.
*   **Gap**: Vertical listings in the UI are not yet backed by the intended relational logic.

---

## 3. CRITICAL READINESS BLOCKERS

1.  **Atomic RPC Transition**: Backend must move from JS-side checks to PostgreSQL `SECURITY DEFINER` functions for inventory deduction and booking creation.
2.  **Manual Payment Hardening**: Restricting `manual-confirm` to verified Admin IDs or transitioning to the planned audit-logged table model.
3.  **Schema Serialization**: The 100+ draft tables must be converted into formal Supabase migrations to resolve "Renegade Seeds" (tables living in `seed.sql`).
4.  **Admin Client Audit**: Reducing `createAdminClient` usage in favor of session-authenticated `createClient` calls where RLS is present.

---

## 4. RISKS & NEXT STEPS

### 4.1 Identified Risks
*   **Data Integrity Failure**: A payment could be recorded without the vertical transaction (Booking/Order) being confirmed due to multi-step JS failure.
*   **Multi-Tenant Leakage**: Because RLS is bypassed by the admin client, a partner could potentially access another partner's financial data if API ownership logic is bypassed.

### 4.2 Recommended Next Step
**Serialized Migration Execution**: Execute Phase 1 of the Serialization Plan (`0001_core.sql`). This will establish the foundational RBAC and Identity tables needed to move away from service-role overrides.

---
*End of QA Report*
