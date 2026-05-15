# GEARBEAT: SQL SPRINT 6 — CERTIFIED, REWARDS, REFERRALS, BADGES & CAMPAIGNS PLAN
**Agent:** Agent 3 — SQL/Database Readiness  
**Status:** DRAFT / PLANNING  
**Date:** 2026-05-15  

---

## 1. PURPOSE OF SQL SPRINT 6
This phase defines the "Trust, Growth, and Loyalty" ecosystem of GearBeat. It establishes the infrastructure for the **GearBeat Certified** program (quality assurance), the **Loyalty & Rewards** engine (user retention), and the **Campaign & Referral** framework (organic growth and marketing attribution).

## 2. DEPENDENCY ON PREVIOUS SPRINTS
- **Sprint 1 (Identity/Audit)**: All badges and rewards are anchored to `profiles`. Admin actions are tracked in `system_audit_logs`.
- **Sprint 2, 3, & 4 (Vertical Transactions)**: Rewards and tier progress are triggered by completed `studio_bookings`, paid `marketplace_orders`, and `academy_enrollments`.
- **Sprint 5 (Payments & Finance)**: Financial integrity for reward redemptions and referral payouts is managed via the unified finance ledger.

## 3. GEARBEAT CERTIFIED STUDIOS
- **Standards**: Tracks Hardware, Acoustic, and Business legitimacy audits.
- **History**: `studio_certification_history` maintains an immutable record of audits, status changes, and suspension/reinstatement events.
- **Tiers**: `studio_tiers` define levels from basic "Verified" to "Flagship" status, affecting search visibility and platform benefits.

## 4. LOYALTY & REWARDS SYSTEM
- **Multi-Stakeholder Tiers**:
    - `customer_tiers`: Focused on booking frequency and purchase volume.
    - `vendor_tiers`: Focused on sales performance and fulfillment reliability.
- **Reward Rules**: `reward_rules` define the "earning logic" (e.g., points per 100 SAR spent).
- **Accounts**: `loyalty_reward_accounts` maintain real-time point balances separate from financial ledgers to facilitate high-frequency updates.

## 5. BADGES & DIGITAL VERIFICATION
- **Digital Badges**: Unified `digital_badges` system for achievements (e.g., "First Booking", "Master Mixer").
- **Assignment**: Scoped mapping for `user_badges`, `studio_badges`, and `vendor_badges` to ensure relevant trust markers are displayed in the correct context.

## 6. REFERRALS & VIRAL GROWTH
- **Attribution**: `referral_codes` generated for all users to track viral loops.
- **Events**: `referral_events` track the conversion funnel from "Link Clicked" to "Qualified Transaction".
- **Payouts**: `referral_rewards` are processed as platform credits or finance ledger entries once criteria are met.

## 7. CAMPAIGNS & ELIGIBILITY
- **Marketing Tracking**: `campaigns` track the efficacy of specific growth initiatives (e.g., "Riyadh Launch 2026").
- **Eligibility**: `campaign_eligibility` rules define target segments (e.g., "First 100 Studio Owners in Jeddah").
- **Attribution**: `campaign_codes` link user sign-ups and transactions back to specific marketing spend.

## 8. OPERATIONS & WELCOME KITS
- **Physical Brand**: `welcome_kit_rewards` and `merch` fulfillment track the delivery of physical assets (window decals, branded gear) to certified partners and elite customers.
- **Fulfillment**: `reward_fulfillment_references` link back to external logistics providers.

## 9. RLS DIRECTION (DRAFT)
- **Public**: `SELECT` access to `certified_studios` and `digital_badges` to allow unauthenticated trust verification.
- **User/Partner**: `SELECT` access to their own `loyalty_reward_accounts`, `referral_codes`, and `user_badges`.
- **Admin**: Full control over `reward_rules`, `campaign_eligibility`, and certification status.

## 10. PRODUCTION VERIFICATION REQUIREMENTS
- **Performance**: Audit the performance of reward calculation triggers on high-frequency transaction tables.
- **Fraud**: Verify the "Review Required" logic for referral events to prevent gaming of the reward system.
- **Entropy**: Ensure QR/Verification tokens generated for certified studios are cryptographically secure.

---

> [!WARNING]
> **DRAFT ONLY**: This document and the associated SQL file are for planning purposes. They have NOT been executed and should NOT be run against a production database without formal review. Rewards, referrals, and certification benefits remain inactive until explicit business logic gates are approved.
