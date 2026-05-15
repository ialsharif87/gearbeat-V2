# SPRINT 7: PRE-PILOT BACKEND BLOCKER LIST (PATCH-107C)
**Agent:** Agent 3 — Backend / Security / Payment / SQL Readiness  
**Status:** DRAFT / BLOCKER ANALYSIS COMPLETE  
**Date:** 2026-05-15  

---

## 1. EXECUTIVE SUMMARY
This document outlines the critical backend and security blockers that must be resolved before the GearBeat V2 invite-only pilot. It categorizes requirements based on their necessity for a safe, high-trust demo environment versus full commercial readiness.

**CRITICAL NOTICE:** All technical implementations (SQL, RLS, API, or Payment logic) described below are strictly **BLOCKED** and require explicit product and security approval before being moved into the execution phase.

---

## 2. BLOCKER CLASSIFICATION

### 2.1 Must Fix Before Real Pilot (Non-Negotiable)
These items are required to prevent data loss, security breaches, or major financial inaccuracies during the pilot phase.

| Vertical | Blocker | Requirement |
| :--- | :--- | :--- |
| **Security** | **Manual Payment Bypass** | Restrict `/api/checkout/manual-confirm` to `admin` role ONLY. |
| **Marketplace** | **Inventory Race Condition** | Implement atomic stock deduction via Postgres RPC (e.g., `deduct_inventory_atomic`). |
| **Bookings** | **Atomic Availability** | Move availability checks into a DB transaction/advisory lock to prevent double-bookings. |
| **RLS** | **Sensitive Table Protection** | Enable and enforce RLS on `settlement_batches` and `finance_ledger` for cross-tenant isolation. |
| **Academy** | **Content Access Boundary** | Ensure lesson content is gated by active profile/enrollment status (no public direct URL access). |
| **Tickets** | **Issuance Engine** | Foundation for secure QR/Ticket ID generation that cannot be guessed or brute-forced. |

### 2.2 Can Remain Manual During Demo (Operational Workarounds)
These items can be handled by the GearBeat Ops team during the pilot to reduce technical complexity in the short term.

| Vertical | Item | Workaround |
| :--- | :--- | :--- |
| **Finance** | **Settlement Payouts** | Manual processing of `settlement_batches` via bank transfer / direct deposit. |
| **Support** | **Spam Prevention** | Manual cleanup of `provider_leads` if spam occurs (No CAPTCHA yet). |
| **Marketing** | **Referral Tracking** | Manual point awarding for referrals based on sign-up email matching. |
| **Marketplace** | **Partial Refunds** | Manual ledger adjustments for multi-vendor order cancellations. |

### 2.3 Deferred Until Commercial Launch (Post-Pilot)
These items are complex and depend on legal, tax, or live payment provider activation.

| Vertical | Item | Reason for Deferral |
| :--- | :--- | :--- |
| **Payments** | **Live Gateway Switch** | Requires formal company registration and Stripe/Tap account activation. |
| **Finance** | **Tax/VAT Calculation** | Requires finalized Saudi ZATCA compliance requirements. |
| **Auth** | **Custom JWT Claims** | Optimization for RLS performance; not required for functional pilot. |
| **Security** | **CSP Enforcement** | Move from `Report-Only` to `Enforce` after pilot traffic analysis. |

---

## 3. INFRASTRUCTURE & SQL READINESS (BLOCKED)

### 3.1 Migration Cleanup
*   **Blocker:** `studio_boost_subscriptions` and its policies currently live in `seed.sql`.
*   **Task:** Migrate these definitions to a formal migration patch (e.g., `patch_107_schema_migration.sql`).

### 3.2 Missing Logic/RPCs
*   **Task:** Draft the `deduct_inventory_atomic` security-definer function.
*   **Task:** Draft the `check_booking_availability_locked` security-definer function.

---

## 4. GOVERNANCE & SAFETY

1.  **NO SQL Execution:** No `supabase db push` or manual SQL entry allowed.
2.  **NO Logic Changes:** No modifications to `app/api/` or `lib/` files.
3.  **NO Env Changes:** No additions of production API keys or secrets.
4.  **PR Title Enforcement:** All readiness PRs must start with `Agent 3 —`.

---

## 5. NEXT STEPS
1.  Review the "Must Fix" list with the product lead to prioritize development tasks.
2.  Approve the drafting of the **Atomic Inventory & Booking** SQL functions.
3.  Initiate **Patch 108: Pre-Pilot Security Hardening** (Manual Confirm Restriction + RLS Sweep).
