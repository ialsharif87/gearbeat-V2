# GEARBEAT: SQL TABLE REQUIREMENTS MATRIX
**Agent:** Agent 3 — SQL/Database Readiness  
**Status:** DRAFT / AUDIT FRAMEWORK  
**Date:** 2026-05-15  

| Domain | Table Name | Purpose | Required Now/Later | Source of Need | Depends On | RLS Needed | Admin Access | Customer Access | Partner Access | Implementation Status |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| Auth/Roles | `profiles` | User core metadata | Now | Identity | Auth.users | Yes | Read/Write | Read/Self | Read/Self | Migrated |
| Auth/Roles | `admin_users` | Internal staff roles | Now | Security | Auth.users | Yes | Read/Write | None | None | Migrated |
| Studios | `studios` | Studio profiles | Now | Discovery | profiles | Yes | Read/Write | Read | Read/Write | Migrated |
| Bookings | `bookings` | Studio reservations | Now | Transactions | studios | Yes | Read/Write | Read/Create | Read/Update | Migrated |
| Marketplace | `marketplace_products` | Inventory items | Now | Marketplace | vendor_profiles | Yes | Read/Write | Read | Read/Write | Migrated |
| Marketplace | `marketplace_orders` | Customer purchases | Now | Transactions | profiles | Yes | Read/Write | Read/Create | Read | Migrated |
| Marketplace | `inventory_locks` | Concurrent stock lock | Later | Integrity | products | Yes | Read/Write | None | None | Drafted |
| Academy | `academy_courses` | Course definitions | Later | Academy | instructors | Yes | Read/Write | Read | Read/Write | Front-end only |
| Academy | `academy_lessons` | Lesson content | Later | Academy | courses | Yes | Read/Write | Read | Read/Write | Front-end only |
| Tickets | `event_tickets` | Ticket inventory | Later | Ticketing | studios/events| Yes | Read/Write | Read/Buy | Read/Write | Front-end only |
| Payments | `payment_transactions` | Ledger of payments | Now | Finance | orders/bookings| Yes | Read | Read/Self | Read/Self | Migrated |
| Finance | `finance_ledger` | Triple-entry records | Now | Compliance | transactions | Yes | Read/Write | None | None | Migrated |
| Certified | `certified_studios` | Trust markers | Now | Trust | studios | Yes | Read/Write | Read | Read | Migrated |
| Rewards | `loyalty_points_ledger`| Point balances | Now | Retention | profiles | Yes | Read/Write | Read/Self | None | Migrated |
| Support | `support_tickets` | Issue tracking | Later | Operations | profiles | Yes | Read/Write | Read/Create | Read/Create | Missing |
| Legal | `legal_documents` | Document versions | Later | Legal | None | Yes | Read/Write | Read | Read | Missing |
| Legal | `user_legal_consents` | Consent tracking | Later | Compliance | profiles | Yes | Read | Read/Create | Read/Create | Missing |
| Audit | `system_audit_logs` | Admin action trail | Later | Security | admin_users | Yes | Read | None | None | Missing |
| Notifications| `notifications` | User alerts | Now | Engagement | profiles | Yes | Write | Read/Delete | Read/Delete | Migrated |
| Campaigns | `analytics_events` | UX Tracking | Later | Marketing | None | Yes | Read | None | None | Missing |
