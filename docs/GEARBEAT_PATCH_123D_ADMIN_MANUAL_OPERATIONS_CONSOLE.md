# GearBeat V2 Runbook — Patch 123D: Admin Manual Operations Console

This runbook documents the architecture, implementation, and safety mechanisms established for **Patch 123D**. It introduces the **Admin Manual Operations Console**, enabling the founder to safely audit, trace, and self-test core transactions across the platform in an isolated sandboxed environment.

---

## 1. Executive Summary & Verdict Matrix

*   **Sprint Objective**: Construct a premium, highly responsive dark/gold console to serve as the founder's central sandbox terminal during pre-launch self-testing.
*   **Verification Status**:
    *   **TypeScript Verification**: `PASSED`
    *   **Next.js Production Build**: `READY`
*   **Founder Full-Journey Self-Test Status**: **GO FOR FOUNDER FULL-JOURNEY SELF-TEST**
*   **Commercial Launch Status**: **NO-GO FOR COMMERCIAL LAUNCH**

> [!IMPORTANT]
> **Strict Pre-Launch Payment Isolation**:
> All live payment mutations, TAP invoice generation, and credit card gateway actions are strictly locked. Action buttons on the review queues represent simulated workflows and are disabled to prevent any production database drift or unintended real-world financial triggers.

---

## 2. File Topology & Changes Cataloged

The following files represent the exact changes allowed and executed under this patch:

### A. Created Files

1.  📁 [app/admin/manual-ops/page.tsx](file:///c:/Users/iaals/Documents/GitHub/gearbeat-V2/app/admin/manual-ops/page.tsx)
    *   **Description**: Server-side route handler that safely executes queries against pre-existing and newly drafted tables using `try ... catch` blocks to gracefully ignore missing or unmigrated structures without throwing Next.js execution errors.
2.  📁 [app/admin/manual-ops/ManualOpsConsoleClient.tsx](file:///c:/Users/iaals/Documents/GitHub/gearbeat-V2/app/admin/manual-ops/ManualOpsConsoleClient.tsx)
    *   **Description**: Client-side presentation component featuring the GearBeat brand aesthetic, high-fidelity tab controls, clean mobile-responsive grids, safety warnings, and an interactive checklist persistent in `localStorage`.

### B. Modified Files

1.  📁 [app/admin/AdminSidebar.tsx](file:///c:/Users/iaals/Documents/GitHub/gearbeat-V2/app/admin/AdminSidebar.tsx)
    *   **Description**: Added the navigation link for "Manual Ops" under the **Overview** section so the founder can access the sandbox directly from the admin sidebar dashboard.

---

## 3. Core Functional & UI Sections Added

The console provides high-fidelity, real empty-state modules for the following operational workflows:

| # | Operational Section | Target Database Table | Pre-Live Behavioral Safeguards |
|---|---|---|---|
| **1** | **Booking Review Queue** | `public.bookings` | Lists studio bookings in `pending`, `payment_review`, or `under_review` status. Real empty states say: *"No live studio bookings yet."* |
| **2** | **Marketplace Order Review** | `public.marketplace_orders` | Tracks checkout completions awaiting validation. Pre-live simulation only. |
| **3** | **Service Booking Review** | `public.service_bookings` | Monitors independent tuning/consulting reservations. |
| **4** | **Ticket Booking Review** | `public.ticket_orders` | Tracks tickets purchased for masterclasses or workshops. |
| **5** | **Academy Lesson Review** | `public.academy_lessons` / `academy_bookings` | Monitors published lesson drafts and student seating capacity limits. |
| **6** | **Manual Payment Safety** | `public.manual_operations` | Displays simulated audit logs of billing adjustments and cash flows. |
| **7** | **Refund & Cancellation Review** | `bookings` / `marketplace_orders` (Failed/Cancelled) | Consolidates cancellation review workflows in a secure, isolated sandbox interface. |
| **8** | **Founder Self-Test Blocker Watch** | `public.founder_test_issues` | Renders a high-visibility watch panel listing high/critical severity blocker tickets reported during tests. |
| **9** | **Admin Action Checklist** | `localStorage` (Browser Persisted) | An interactive, comprehensive step-by-step checklist of founder actions. |

---

## 4. Strict Safety Guardrails

### A. Pre-Live Transaction Isolation
No payment integrations are linked on this page. All buttons implying irreversible actions (e.g. *Approve payment*, *Confirm settlement*, *Authorize refund*) are disabled by default. A prominent warning banner at the top of the console explicitly alerts the founder:
> *"TAP Payment Integration is Disabled (Pre-Launch Sandbox Mode). Real live payment mutations are locked."*

### B. Zero Fake Data Enforcement
To align with safety guidelines, no mock or fake database records are dynamically injected. Real empty-state states are utilized (e.g., *"No live operations yet"*). If the database tables are populated by real founder test sweeps, the console will dynamically display those records.

### C. Database Query Resilience
Because this console spans newly drafted vertical workflows, all queries are wrapped in individual `try ... catch` blocks. If any schema migration has not yet been applied in a specific local workspace, the server component catches the error, logs it, and falls back to a clean empty state `[]` instead of crashing.

---

## 5. Persistent Founder Checklist Tasks

The **Action Checklist** provides a structured sandbox onboarding runbook divided into four categories:

1.  **Core Setup & Roles**: Verifying Super Admin settings, Customer test signups, Vendor registrations, and Studio Owner lead approvals.
2.  **Bookings & E-Commerce**: Booking studio rooms (simulating pending unpaid statuses), executing checkout orders, and validating marketplace invoices.
3.  **Services & Academy**: Scheduling tuning/consulting appointments, verifying ticket checkouts, and publishing academy lesson capacities.
4.  **Safety & Reconciliation**: Analyzing cancellation workflows, auditing simulated credits, and signing off on successful test runs.

---

## 6. TypeScript Validation & Correctness

To run TypeScript verification:
```powershell
npm run typecheck
```
*Result: Status `PASSED` - 100% type safety aligned with pre-existing global types and the Supabase database Client definition.*
