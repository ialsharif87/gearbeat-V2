# GEARBEAT MICRO BATCH A1 CONSOLIDATED AUDIT

## 1. Executive Summary
This document provides a consolidated audit of Patches 30 through 50 from the GearBeat V2 stabilization roadmap. The audit categorizes each patch by risk level and type, and proposes a safe execution strategy through micro-batching. The goal is to harden the platform while maintaining a stable production environment by isolating high-risk security and database changes.

## 2. Main Branch Status
- **Patch 29 Status:** [CONFIRMED] Patch 29 (Admin Route Hardening) has been successfully merged into the `main` branch.
- **Verification File:** `docs/GEARBEAT_PATCH_29_ADMIN_ROUTE_HARDENING.md` exists and is present in the current working tree.

## 3. Patch 30–50 Inventory

| # | Title | Objective | Risk | Type |
| :--- | :--- | :--- | :--- | :--- |
| 30 | Admin application approval audit | Review studio application workflow. | Low | audit-only |
| 31 | Lead-to-studio conversion fix | Ensure applications correctly create studio records. | Medium | helper/refactor |
| 32 | Contract consistency audit | Check if studio contracts match approved applications. | Low | audit-only |
| 33 | Contract consistency fix | Align contract data with application data. | Low | helper/refactor |
| 34 | Database schema audit document | Map all tables and relationships. | Low | docs-only |
| 35 | Storage buckets and RLS audit | Ensure private images aren't public. | Medium | SQL/RLS/database |
| 36 | Availability save error audit | Find why studio owners can't save hours. | Low | audit-only |
| 37 | Availability save error fix | Enable successful availability saving. | Medium | helper/refactor |
| 38 | Availability exception date range schema | Allow studios to close for specific dates. | Medium | SQL/RLS/database |
| 39 | Availability day/time pricing schema | Support dynamic hourly pricing. | Medium | SQL/RLS/database |
| 40 | Availability UI pricing update | Let owners set prices in the UI. | Low | UI cleanup |
| 41 | Booking overlap audit | Test conflict detection. | Medium | audit-only |
| 42 | Booking double-booking protection | Implement strict atomic slot locking. | High | helper/refactor |
| 43 | Booking status lifecycle cleanup | Unify booking states (pending, paid, completed). | Medium | SQL/RLS/database |
| 44 | Payment server-side amount audit | Ensure prices are verified on server before checkout. | High | auth/security |
| 45 | Payment webhook/idempotency risk document | Map production payment requirements. | Low | docs-only |
| 46 | Marketplace route duplication audit | Resolve Gear vs Marketplace page confusion. | Low | audit-only |
| 47 | Cart and checkout consolidation plan | Unify gear and booking carts. | Low | docs-only |
| 48 | Gear to marketplace decision and cleanup | Remove `/gear`, setup redirects. | Medium | UI cleanup |
| 49 | Studio management page improvements | UX cleanup for studio list in owner portal. | Low | UI cleanup |
| 50 | Final QA and checklist | Final sign-off and production checklist. | Low | docs-only |

## 4. Safe Grouping Table

| Batch | Name | Patches | Description |
| :--- | :--- | :--- | :--- |
| **Batch A** | Audit / Docs / Planning | 30, 32, 34, 36, 41, 45, 46, 47 | Documentation, research, and audit tasks with zero code impact. |
| **Batch B** | Safe Admin / UI Cleanup | 33, 40, 49 | Low-risk UI improvements and minor consistency fixes. |
| **Batch E** | Security / Admin / Payments | 31, 35, 42, 44 | **High Risk.** Security-critical logic and system protections. |
| **Batch F** | SQL / RLS / Database | 37, 38, 39, 43 | Database schema changes and RLS policy updates. |

## 5. Risk Classification Summary
- **Critical/High:** 42 (Booking Protection), 44 (Payment Security).
- **Medium:** 31 (Conversion Fix), 35 (RLS Audit), 37 (Availability Fix), 38-39 (Availability Schema), 43 (Status Lifecycle), 48 (Marketplace Merge).
- **Low:** All others (Audit, Docs, UI cleanup).

## 6. Items Safe to Group Later
- **Batch A** items are entirely safe to group as they do not modify application code.
- **Batch B** items can be grouped once Batch A audits are completed and verified.

## 7. Items That Must Stay Separate
- **Patch 42 (Booking Protection):** Must stay standalone due to the complexity of atomic locking and race condition risks.
- **Patch 44 (Payment Security):** Must stay standalone to ensure server-side price verification doesn't break checkout flows.
- **SQL/RLS/Database Patches (Batch F):** These must be executed independently of UI/Docs work to ensure migration integrity and easy rollback.

## 8. Deferred Items (Batch G)
The following patches are deferred from immediate implementation:
- **38, 39, 40:** Availability enhancements (wait for core reliability fix).
- **42:** Booking protection (requires deep research).
- **43:** Status lifecycle (wait for transaction stability).
- **44:** Payment audit (pending production gateway finalization).
- **48:** Gear/Marketplace merger (requires final route approval).

## 9. Recommended Next Micro Batch
**Batch A (Audit / Docs / Planning)** is the recommended next step. Completing the documentation and audits (30, 32, 34, 36, 41, 45, 46, 47) provides the necessary technical map for all subsequent fixes.

## 10. Final Recommendation
1.  **Execute Batch A first** to establish the `docs/SCHEMA_MAP.md` and verify current system discrepancies.
2.  **Execute Batch B** for immediate low-risk UI improvements.
3.  **Handle Batch E and F** with extreme caution, ensuring each SQL migration or security change is tested in isolation on a staging environment before main integration.
4.  Maintain the **Standalone** requirement for High-Risk patches (42, 44) to prevent cascading failures.
