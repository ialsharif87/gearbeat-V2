# GEARBEAT MASTER PATCH ROADMAP (V2)

## Overview
This document outlines the sequential hardening and feature expansion for the GearBeat platform. Each patch must be approved before implementation.

---

### Patch 0 — Full Technical Audit
- **Goal:** Comprehensive review of current codebase, security gaps, and technical debt.
- **Areas:** Entire project structure, environment variables, Supabase configuration.
- **Changes:** Documentation of existing vulnerabilities and architecture mapping.
- **DB Migration:** No
- **Risk:** Low
- **Testing:** N/A (Analytical)
- **Output:** `docs/AUDIT_REPORT.md`

### Patch 1 — Build and Client/Server Safety
- **Goal:** Prevent Supabase Service Role leakage and enforce "server-only" boundaries.
- **Areas:** `lib/supabase/admin.ts`, `lib/supabase/server.ts`, `app/signup/page.tsx`.
- **Changes:** Move admin logic to server-only files, replace direct admin imports in client components with API routes.
- **DB Migration:** No
- **Risk:** High (Build breaking)
- **Testing:** `npm run build`, manual signup flow verification.
- **Output:** `docs/PATCH_1_BUILD_SAFETY.md`

### Patch 2 — Auth, OTP, Trusted Devices, Password Visibility
- **Goal:** Hardening authentication UX and security.
- **Areas:** `app/login`, `app/signup`, `components/auth`.
- **Changes:** Add password toggle, trusted device persistent login logic, production OTP provider config.
- **DB Migration:** Maybe (Trusted device table)
- **Risk:** Medium
- **Testing:** Multi-device login tests, OTP delivery.

### Patch 3 — Profiles and Role Normalization
- **Goal:** Ensure consistent user data structure across customer/owner/vendor roles.
- **Areas:** `lib/types`, `app/profile`, Supabase `profiles` table.
- **Changes:** Standardize schema, fix role-based redirection.
- **DB Migration:** Yes
- **Risk:** Medium

### Patch 4 — Admin Security and super_admin Override
- **Goal:** Implement tiered admin access and absolute override for developers.
- **Areas:** `lib/auth-guards.ts`, Admin Portal.
- **Changes:** Middleware updates to check `is_super_admin`.
- **DB Migration:** Yes (Role column updates)
- **Risk:** Medium

### Patch 5 — Admin Application Approval and Contract Consistency
- **Goal:** Formalize studio/vendor onboarding.
- **Areas:** Admin dashboard application queue.
- **Changes:** Contract generation logic and approval workflow state management.
- **DB Migration:** Yes
- **Risk:** Medium

### Patch 6 — Database Schema Alignment
- **Goal:** Finalize foreign keys and RLS policies for all core tables.
- **Areas:** Supabase SQL.
- **Changes:** Cleanup of orphaned records, enforcing strict RLS.
- **DB Migration:** Yes
- **Risk:** High

### Patch 7A — Availability Save Fix
- **Goal:** Fix RLS/Policy issues preventing studio owners from saving hours.
- **Areas:** `lib/studio-availability.ts`.
- **Changes:** Correcting upsert logic and policy permissions.
- **DB Migration:** No
- **Risk:** Low

### Patch 7B — Availability Pricing and Exceptions V2
- **Goal:** Dynamic per-slot pricing and closure reasons (holidays/maintenance).
- **Areas:** Availability calendar components.
- **Changes:** Logic for hourly slot price overrides.
- **DB Migration:** Yes
- **Risk:** Medium

### Patch 8 — Booking Hardening
- **Goal:** Prevent double-booking and ensure atomic booking transactions.
- **Areas:** Booking API routes, Edge functions.
- **Changes:** Idempotency keys and server-side conflict checks.
- **DB Migration:** Maybe
- **Risk:** High

### Patch 9 — Payment and Finance Hardening
- **Goal:** Production-ready Stripe/HyperPay/Tabby integrations.
- **Areas:** `app/api/payments`, Webhook handlers.
- **Changes:** Webhook signature verification, VAT calculation logic.
- **DB Migration:** Yes
- **Risk:** High
- **Output:** `docs/FINANCE_FLOW.md`

### Patch 10 — Marketplace, Gear, Cart, and Checkout Consolidation
- **Goal:** Streamline physical goods purchasing.
- **Areas:** Marketplace pages, Cart state management.
- **Changes:** Unified checkout flow for both bookings and gear.
- **DB Migration:** Yes
- **Risk:** Medium

### Patch 11 — Studio Management Page Improvements
- **Goal:** Enhance owner UX for managing multiple studios.
- **Areas:** Owner dashboard.
- **Changes:** Bulk editing of availability, better analytics charts.
- **DB Migration:** No
- **Risk:** Low

### Patch 12 — Portal Cleanup
- **Goal:** Remove dead code and unify styling across Customer/Owner/Vendor portals.
- **Areas:** All portals.
- **Changes:** Component sharing, theme consistency (Premium Dark).
- **DB Migration:** No
- **Risk:** Low

### Patch 13 — Public Pages, Legal, Cookie Notice, Privacy Policy
- **Goal:** Legal compliance and SEO optimization.
- **Areas:** `/legal`, `/privacy`, `/about`.
- **Changes:** Dynamic legal pages, cookie consent banners.
- **DB Migration:** No
- **Risk:** Low

### Patch 14 — External Integrations Roadmap and Final QA
- **Goal:** Connect Google Maps, Nafath, and external shipping APIs.
- **Areas:** API integrations.
- **Changes:** Keys configuration and error handling.
- **DB Migration:** No
- **Risk:** Medium

### Patch 15 — Internal CRM Module
- **Goal:** Track user interactions and reminders for sales/support.
- **Areas:** Admin dashboard.
- **Changes:** Lead tracking and follow-up alerts.
- **DB Migration:** Yes
- **Risk:** Low

### Patch 16 — GearBeat Certified and Trust Layer
- **Goal:** Visual badges for vetted studios/vendors.
- **Areas:** Studio listing components.
- **Changes:** QR verification system for certified status.
- **DB Migration:** Yes
- **Risk:** Low

### Patch 17 — Rewards, Welcome Kits, and Merch Logic
- **Goal:** Loyalty program implementation.
- **Areas:** Customer portal rewards tab.
- **Changes:** Point redemption logic and merch inventory tracking.
- **DB Migration:** Yes
- **Risk:** Medium

### Patch 18 — PR, Campaigns, and Marketing Engine
- **Goal:** Internal tool for newsletter and promo management.
- **Areas:** Admin marketing tab.
- **Changes:** Resend integration for campaigns, promo code generator.
- **DB Migration:** Yes
- **Risk:** Medium

### Patch 19 — Analytics, Monitoring, and Admin Insights
- **Goal:** Sentry production setup and event tracking.
- **Areas:** Monitoring layer.
- **Changes:** Custom analytics events for conversions.
- **DB Migration:** No
- **Risk:** Low

### Patch 20 — Final Production Readiness Review
- **Goal:** Security stress test and launch preparation.
- **Areas:** Global.
- **Changes:** Final performance optimization, SEO audit.
- **DB Migration:** No
- **Risk:** Low
- **Output:** `docs/PRODUCTION_CHECKLIST.md`

---

## Known Missing Items to Track
- Production payment readiness (Webhook signature, Idempotency)
- VAT/Invoices & Settlements/Payouts
- Supabase Schema Documentation & RLS Audit
- Production OTP Provider (SMS Gateway)
- Google Maps / Places & Nafath Integration
- CRM Follow-up Reminders
- Certified QR verification
- Sentry Production DSN & Analytics Events
