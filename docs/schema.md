# GearBeat Database Schema Notes

This file is a starting point. It must be completed after pulling the real Supabase production/staging schema.

## Required action

Use Supabase CLI or Supabase Dashboard to export the full schema, then commit it under `supabase/migrations/`.

Recommended commands:

```bash
supabase init
supabase link --project-ref YOUR_PROJECT_REF
supabase db pull
```

## Tables that must be documented

The audit found that the code references these tables without full schema documentation in the repo:

- account_deletion_requests
- admin_users
- audit_logs
- booking_commissions
- bookings
- commission_settings
- owner_agreements
- owner_bank_accounts
- owner_compliance_documents
- owner_compliance_profiles
- platform_payment_transactions
- platform_payments
- platform_payout_items
- platform_payouts
- platform_refunds
- platform_settlements
- profiles
- review_requests
- reviews
- studio_accelerations
- studio_commissions
- studio_equipment
- studio_feature_links
- studio_features
- studio_images
- studio_performance_daily
- studios

## Documentation format for each table

Use this format:

```md
## table_name

Purpose:
- What this table stores.

Main columns:
- id:
- created_at:
- updated_at:

Relationships:
- table.column -> other_table.column

RLS approach:
- SELECT:
- INSERT:
- UPDATE:
- DELETE:

Notes:
- Any special business rules.
```
