# GearBeat V2 Runbook — Patch 123I: SQL Loyalty Wallet / Ledger Bootstrap Compatibility Fix

This runbook catalogs the problem analysis, table definitions, automation rules, and architectural validation for **Patch 123I**, which secures clean database setups and dry-runs by bootstrapping the rewards/loyalty ledger tables.

---

## 1. Executive Summary & Verdict Matrix

*   **Objective**: Bootstrap safe base tables (`public.loyalty_tiers`, `public.customer_wallets`, and `public.loyalty_points_ledger`) along with a view (`public.customer_wallet_summary`) in the migration pipeline.
*   **Verification Status**:
    *   **TypeScript Verification**: `PASSED`
    *   **Next.js Production Build**: `PASSED`
*   **Founder Full-Journey Self-Test Status**: **GO FOR FOUNDER FULL-JOURNEY SELF-TEST**
*   **Commercial Launch Status**: **NO-GO FOR COMMERCIAL LAUNCH**

> [!IMPORTANT]
> **Safety Constraints Met**:
> - **Zero SQL Execution**: No commands or scripts were executed against any database.
> - **Zero Supabase CLI Usage**: No local or remote CLI push/pull commands were run.
> - **Zero Destructive Modifications**: No tables were dropped, truncated, or deleted. All modifications were restricted purely to SQL migration drafts.

---

## 2. Rationale & Problem Analysis

When executing local migration test pipelines or standard dry-runs, the database starts empty. If a migration tries to run `ALTER TABLE public.loyalty_points_ledger` before the table is registered in the database, the execution fails immediately with:
`ERROR: relation "public.loyalty_points_ledger" does not exist`

To solve this, Patch 123I adds a safe, additive bootstrap layer that declares the minimum required rewards tables, indexes, views, Row-Level Security (RLS) policies, and wallet automation triggers before any alters occur.

---

## 3. Bootstrapped Database Entities

The following structures were successfully integrated into [supabase/migrations/20260518_founder_full_journey_sql_gap_fill.sql](file:///c:/Users/iaals/Documents/GitHub/gearbeat-V2/supabase/migrations/20260518_founder_full_journey_sql_gap_fill.sql) before the Module 6 alters:

### A. Loyalty Tiers (`public.loyalty_tiers`)
Tracks loyalty points tiers to support admin planning and UI mapping:
```sql
CREATE TABLE IF NOT EXISTS public.loyalty_tiers (
    code text PRIMARY KEY,
    name_en text NOT NULL,
    name_ar text NOT NULL,
    min_points integer NOT NULL DEFAULT 0,
    min_lifetime_spend decimal(12,2) DEFAULT 0.00,
    earn_multiplier decimal(4,2) NOT NULL DEFAULT 1.0,
    redemption_cap_percent integer DEFAULT 100,
    sort_order integer NOT NULL DEFAULT 0,
    is_active boolean NOT NULL DEFAULT true,
    created_at timestamptz DEFAULT now()
);
```
*   **Seed Data**: Pre-seeded with the standard tiers (`listener`, `creator`, `producer`, `maestro`, `legend`) to maintain alignment with `lib/loyalty/rewards.ts`.
*   **RLS Policies**: Read-access granted to all authenticated users; full write-access restricted to admins via `public.admin_users`.

---

### B. Customer Wallets (`public.customer_wallets`)
Tracks points balance, pending points, wallet balance, and membership details:
```sql
CREATE TABLE IF NOT EXISTS public.customer_wallets (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    auth_user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
    membership_number text,
    tier_code text NOT NULL DEFAULT 'listener' REFERENCES public.loyalty_tiers(code),
    points_balance integer NOT NULL DEFAULT 0 CHECK (points_balance >= 0),
    pending_points integer NOT NULL DEFAULT 0 CHECK (pending_points >= 0),
    wallet_balance decimal(12,2) NOT NULL DEFAULT 0.00 CHECK (wallet_balance >= 0.00),
    currency_code text NOT NULL DEFAULT 'SAR',
    lifetime_points integer NOT NULL DEFAULT 0 CHECK (lifetime_points >= 0),
    lifetime_spend decimal(12,2) NOT NULL DEFAULT 0.00 CHECK (lifetime_spend >= 0.00),
    referral_code text,
    membership_card_status text NOT NULL DEFAULT 'active',
    card_style_code text NOT NULL DEFAULT 'default',
    joined_at timestamptz NOT NULL DEFAULT now(),
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);
```
*   **Safety Constraints**: All balance fields (`points_balance`, `pending_points`, `wallet_balance`, `lifetime_points`, `lifetime_spend`) are strictly non-negative.
*   **Clean Startup**: Defaults balance to zero and referral code to null, ensuring new users start cleanly with no fake points or referrals.
*   **RLS Policies**: Users can read only their own wallet rows (`auth_user_id = auth.uid()`). Admins have full access via `public.admin_users` validations.

---

### C. Loyalty Points Ledger (`public.loyalty_points_ledger`)
Immutable history tracking points allocations and manual adjustments:
```sql
CREATE TABLE IF NOT EXISTS public.loyalty_points_ledger (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    auth_user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    event_type text NOT NULL,
    source_type text,
    source_id text,
    points integer NOT NULL,
    status text NOT NULL DEFAULT 'posted',
    description text,
    amount_basis decimal(12,2) DEFAULT 0.00,
    created_at timestamptz NOT NULL DEFAULT now()
);
```
*   **Index Enhancements**: Created explicit indexes for `auth_user_id`, `created_at`, `status`, and `(source_type, source_id)` for high-performance dashboard listing.
*   **RLS Policies**: Read-access limited to users' own ledger rows. CRM/Admin updates enabled through the admin verification layer.

---

### D. Customer Wallet Summary View (`public.customer_wallet_summary`)
Unifies customer details, email addresses, and wallet parameters:
```sql
CREATE OR REPLACE VIEW public.customer_wallet_summary AS
SELECT
    w.id AS wallet_id,
    w.auth_user_id,
    COALESCE(u.raw_user_meta_data->>'full_name', u.raw_user_meta_data->>'display_name', 'Guest Member') AS full_name,
    u.email,
    w.membership_number,
    w.referral_code,
    w.tier_code,
    t.name_en AS tier_name_en,
    t.name_ar AS tier_name_ar,
    w.points_balance,
    w.pending_points,
    w.wallet_balance,
    w.currency_code,
    w.lifetime_points,
    w.lifetime_spend,
    w.membership_card_status,
    w.card_style_code,
    w.joined_at,
    w.updated_at
FROM public.customer_wallets w
JOIN auth.users u ON w.auth_user_id = u.id
LEFT JOIN public.loyalty_tiers t ON w.tier_code = t.code;
```
> [!NOTE]
> This view avoids any join on `public.profiles`, sourcing profile/identity metadata directly from standard `auth.users` properties.

---

### E. Wallet Automation Trigger & Backfill
To ensure new and existing accounts can interact with the loyalty page without empty database rows:
1.  **Automation Trigger**:
    ```sql
    CREATE OR REPLACE TRIGGER tr_on_auth_user_created_wallet
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user_wallet();
    ```
2.  **Clean Backfill**: Automatically provisions standard empty wallets for any historic/baseline accounts already loaded in `auth.users` who lack one.

---

## 4. Repository-Wide Codebase Audits & Verifications

Verification checks run in the local workspace:

### A. `customer_wallets` & `loyalty_points_ledger` Grep Results
Confirmed that the schema exactly covers all fields referenced in:
*   [app/customer/rewards/page.tsx](file:///c:/Users/iaals/Documents/GitHub/gearbeat-V2/app/customer/rewards/page.tsx#L72) — Selects and displays points, wallets, and ledger activities.
*   [app/admin/loyalty/page.tsx](file:///c:/Users/iaals/Documents/GitHub/gearbeat-V2/app/admin/loyalty/page.tsx#L69) — Selects from `customer_wallet_summary` and `loyalty_points_ledger`.
*   [scripts/ops/reset-self-test-data.ts](file:///c:/Users/iaals/Documents/GitHub/gearbeat-V2/scripts/ops/reset-self-test-data.ts#L100) — Targets the tables correctly during clean self-test purges.

### B. Remaining `public.profiles` References
*   All legacy `public.profiles` references in the new tables have been routed to direct `auth.users(id)` and `public.admin_users` lookups.
*   Historic `patch_51f` and `patch_51h` migrations are preserved in their original form to maintain historic baseline compatibility.
