# GEARBEAT PATCH 47C — SQL MIGRATION INVENTORY & PRODUCTION VERIFICATION AUDIT

## 1. Overview
This audit provides a comprehensive inventory of every SQL migration file in the GearBeat V2 repository. Given the discovery that migrations were not automatically applied to production, this document serves as the roadmap for manual verification and the establishment of a baseline for future automation.

## 2. Full SQL Inventory

| File Name | Patch | Purpose | Likely Affected Objects | Risk |
| :--- | :--- | :--- | :--- | :--- |
| `patch_16_trusted_devices.sql` | 16 | Trusted Devices | `trusted_devices` table | Med |
| `patch_42b_atomic_booking_rpc.sql` | 42B | Atomic Booking RPC | `public.create_studio_booking_v1` | High |
| `patch_46d2_rpc_booking_status_harmonization.sql` | 46D | RPC Status Cleanup | `public.create_studio_booking_v1` | High |
| `patch_70_owner_booking_management.sql` | 70 | Owner Booking Flow | `bookings` (permissions/logic) | Med |
| `patch_71_studio_availability_calendar.sql` | 71 | Availability Slots | `studio_availability` tables | High |
| `patch_72_availability_pricing_v2.sql` | 72 | Pricing Engine | `pricing_rules` | Med |
| `patch_72_commission_settings_admin.sql` | 72 | Admin Commissions | `commission_settings` | Med |
| `patch_72b_availability_exception_schema.sql` | 72B | Exception Hardening | `availability_exceptions` | Med |
| `patch_72c_availability_pricing_schema.sql` | 72C | Day/Time Pricing | `availability_pricing_slots` | Med |
| `patch_73_payouts_settlement_reports.sql` | 73 | Payout Reports | `settlement_reports` | Low |
| `patch_75_notifications_foundation.sql` | 75 | Notifications | `notifications` | Low |
| `patch_81_finance_ledger_foundation.sql` | 81 | Finance Ledger | `finance_ledger` | High |
| `patch_82_settlement_batches.sql` | 82 | Settlement Batches | `settlement_batches` | Med |
| `patch_83_payout_requests.sql` | 83 | Payout Requests | `payout_requests` | Med |
| `patch_84_refunds_adjustments.sql` | 84 | Refunds/Adjustments | `finance_adjustments` | Med |
| `patch_85_acceleration_finance.sql` | 85 | Acceleration Finance | `acceleration_orders` | Med |
| `patch_86_finance_audit_log.sql` | 86 | Finance Audit | `finance_audit_logs` | Low |
| `patch_90_marketplace_promos.sql` | 90 | Marketplace Promos | `marketplace_promos` | Low |
| `patch_100_certified_rewards_program.sql` | 100 | Rewards Program | `rewards_points` | Med |

## 3. Critical Verification Checklist (Production)

To verify the current state of production drift, run the following queries in the Supabase SQL Editor:

### A. Atomic Booking RPC
**Status:** **REPAIRED** (Manual execution performed after Patch 46D2).
```sql
select pg_get_functiondef('public.create_studio_booking_v1'::regproc);
```
*Expected: Includes 'completed' and 'pending_review' statuses.*

### B. Trusted Devices
```sql
select exists (
   select from information_schema.tables 
   where table_schema = 'public' 
   and table_name = 'trusted_devices'
);
```
*Expected: `true`*

### C. Finance Ledger
```sql
select exists (
   select from information_schema.tables 
   where table_schema = 'public' 
   and table_name = 'finance_ledger'
);
```
*Expected: `true`*

### D. Availability Pricing
```sql
select column_name 
from information_schema.columns 
where table_name = 'studio_availability' 
and column_name in ('hourly_rate', 'day_pricing');
```

## 4. Risks & Safety Guardrails
- **No Broad `db push`:** DO NOT run `supabase db push` until the production environment has a documented `schema_migrations` table reflecting the current state.
- **No `db reset`:** NEVER run `db reset` on a production environment.
- **Drift Detection:** If any critical table or function from the inventory is missing, it must be manually applied or "repaired" via the CLI before enabling full automation.

## 5. Recommended Baseline Strategy
1. **Manual Audit:** Execute the verification queries in Section 3.
2. **Migration Repair:** For any migration that exists locally but was applied manually, use `supabase migration repair <timestamp> --status applied` to sync the CLI tracking.
3. **Automation Enablement:** Only once the local and remote histories match should Patch 47B's workflow be trusted for hands-off deployment.
