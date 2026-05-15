# GEARBEAT: SQL MIGRATION SERIALIZATION PLAN V1
**Agent:** Agent 3 — SQL/Database Readiness  
**Status:** PLANNING / CHECKLIST  
**Date:** 2026-05-15  

---

## 1. PURPOSE & SAFETY WARNING
This document outlines the step-by-step strategy for converting the GearBeat V2 Master Schema Draft into a series of executable Supabase migrations. 

> [!CAUTION]
> **NOT A REAL MIGRATION**: This is a planning document only. It does NOT contain executable SQL and should NOT be used to modify any database without a formal staging-to-production deployment pipeline. No production database changes are authorized at this stage.

## 2. STAGING-ONLY PRINCIPLES
Before any production deployment, all migrations must be validated in a dedicated `staging` environment following these principles:
- **Clean Slate**: Staging must be reset periodically to ensure migrations are idempotent and run correctly on a fresh database.
- **Data Parity**: Staging should contain anonymized or synthetic data that mirrors the complexity of production.
- **Rollback First**: Every migration must be tested with its corresponding down-migration/rollback script.

## 3. RECOMMENDED MIGRATION BATCH ORDER
To maintain referential integrity, migrations must be executed in the following sequence:

### Batch 1: Foundations
- **0001_extensions_types.sql**: Enable `uuid-ossp`, `pgcrypto`, and define common enums.
- **0002_identity_rbac.sql**: `profiles`, `user_roles`, `partner_accounts`, `partner_members`.
- **0003_audit_core.sql**: `system_audit_logs`.

### Batch 2: Studios & Spaces
- **0004_studios_base.sql**: `studios`, `rooms`.
- **0005_studio_availability.sql**: Availability rules and standard booking tables.

### Batch 3: Marketplace
- **0006_marketplace_vendors.sql**: `marketplace_vendors`.
- **0007_marketplace_catalog.sql**: `marketplace_products`, `categories`, `media`.
- **0008_marketplace_orders.sql**: `marketplace_orders`, `order_items`, `inventory_reservations`.

### Batch 4: Academy, Services & Tickets
- **0009_academy.sql**: `instructors`, `lessons`, `enrollments`.
- **0010_services.sql**: `service_providers`, `listings`, `bookings`.
- **0011_tickets.sql**: `event_profiles`, `ticket_types`, `event_tickets`, `checkins`.

### Batch 5: Financial Core
- **0012_unified_payments.sql**: `payment_sessions`, `payment_transactions`, `manual_payment_confirmations`.
- **0013_ledger_finance.sql**: `finance_ledger_entries`, `payout_batches`, `reconciliation_runs`.

### Batch 6: Growth & Loyalty
- **0014_certified_program.sql**: `certified_entities`, `certification_tiers`.
- **0015_loyalty_rewards.sql**: `reward_balances`, `reward_events`, `reward_rules`.
- **0016_referrals.sql**: `referral_codes`, `referral_events`.

### Batch 7: Operations & Admin
- **0017_support_legal.sql**: `support_tickets`, `legal_policy_versions`, `user_policy_acceptances`.
- **0018_notifications.sql**: `notification_preferences`, `notification_outbox`.
- **0019_admin_ops.sql**: `admin_action_logs`, `internal_review_tasks`.

### Batch 8 & 9: Security & Logic
- **0020_rls_policies.sql**: Comprehensive Row-Level Security for all tables.
- **0021_rpc_functions.sql**: Database-side functions (triggers, complex business logic).

### Batch 10: Staging Data
- **0022_seed_staging.sql**: Synthetic data for QA and load testing.

## 4. PRE-MIGRATION CHECKLIST
- [ ] **Dependency Audit**: Verify all foreign keys point to tables created in earlier batches.
- [ ] **Naming Standards**: Confirm table and column names match the Master Schema Draft V1.
- [ ] **Constraint Check**: Ensure `CHECK` constraints are realistic and won't block valid data.
- [ ] **Supabase Config**: Verify `config.toml` includes all required extensions and security settings.

## 5. BACKUP & SNAPSHOT STRATEGY
- **Full Dump**: Take a full SQL dump of the existing database before any migration.
- **Snapshot**: Use Supabase/Platform-level snapshots for rapid recovery.
- **Point-in-Time Recovery (PITR)**: Ensure PITR is enabled for the environment before Batch 1.

## 6. PRODUCTION NO-GO LIST
- **DO NOT PROCEED IF**:
    - Staging environment tests fail on any batch.
    - Rollback scripts are not verified.
    - RLS policies permit unauthorized read/write on finance tables.
    - PII (emails, phone numbers) is found in unencrypted or non-PII-specific columns.
    - `manual-confirm` service-role logic is still exposed without new RLS audit trails.

## 7. VALIDATION CHECKLISTS
### RLS Validation
- [ ] Verify `auth.uid()` filters correctly on `profiles` and `transactions`.
- [ ] Confirm `partner_account` data is invisible to other partners.
- [ ] Ensure `super_admin` can override filters for audit purposes.

### Financial Validation
- [ ] Test `payment_idempotency_keys` against duplicate webhook payloads.
- [ ] Verify `finance_ledger_entries` are generated for every transaction and refund.
- [ ] Confirm `DECIMAL(12, 2)` precision handles rounding correctly.

### Legal & Consent Validation
- [ ] Verify `user_policy_acceptances` captures IP and version correctly.
- [ ] Ensure `academy_guardian_consents` blocks enrollment for minors without a linked consent.

## 8. ROLLBACK PLANNING
- Every migration batch must have a corresponding `down` script.
- **Testing**: Run 1 -> 2 -> 3, then rollback 3 -> 2 -> 1 and verify the database state is identical to the start.

## 9. FINAL DECISION GATE
Before production rollout:
1. **Security Officer Sign-off**: RLS and service-role hardening verified.
2. **Finance Head Sign-off**: Payout and ledger logic verified.
3. **Legal Counsel Sign-off**: Consent and policy versioning verified.
4. **CTO Approval**: Technical performance and stability verified.

---

> [!IMPORTANT]
> **PLANNING ONLY**: This is a strategic document to guide future implementation. It does not initiate any technical changes.
