create table if not exists public.finance_ledger (
  id uuid primary key default gen_random_uuid(),
  entry_type text not null,
  entry_group text not null default 'general',
  source_type text not null,
  source_id text not null default '',
  source_label text,
  partner_type text not null default 'platform',
  partner_id text not null default '',
  partner_label text,
  amount numeric(14,2) not null default 0,
  currency text not null default 'SAR',
  status text not null default 'pending',
  transaction_date timestamptz not null default now(),
  metadata jsonb not null default '{}'::jsonb,
  created_by uuid references auth.users(id) on delete set null,
  updated_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.finance_ledger
add column if not exists entry_type text not null default 'general';

alter table public.finance_ledger
add column if not exists entry_group text not null default 'general';

alter table public.finance_ledger
add column if not exists source_type text not null default 'manual';

alter table public.finance_ledger
add column if not exists source_id text not null default '';

alter table public.finance_ledger
add column if not exists source_label text;

alter table public.finance_ledger
add column if not exists partner_type text not null default 'platform';

alter table public.finance_ledger
add column if not exists partner_id text not null default '';

alter table public.finance_ledger
add column if not exists partner_label text;

alter table public.finance_ledger
add column if not exists amount numeric(14,2) not null default 0;

alter table public.finance_ledger
add column if not exists currency text not null default 'SAR';

alter table public.finance_ledger
add column if not exists status text not null default 'pending';

alter table public.finance_ledger
add column if not exists transaction_date timestamptz not null default now();

alter table public.finance_ledger
add column if not exists metadata jsonb not null default '{}'::jsonb;

alter table public.finance_ledger
add column if not exists created_by uuid references auth.users(id) on delete set null;

alter table public.finance_ledger
add column if not exists updated_by uuid references auth.users(id) on delete set null;

alter table public.finance_ledger
add column if not exists created_at timestamptz not null default now();

alter table public.finance_ledger
add column if not exists updated_at timestamptz not null default now();

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'finance_ledger_entry_type_check'
  ) then
    alter table public.finance_ledger
    add constraint finance_ledger_entry_type_check
    check (
      entry_type in (
        'customer_payment',
        'platform_commission',
        'vendor_payable',
        'owner_payable',
        'refund',
        'manual_adjustment',
        'payout',
        'reversal',
        'general'
      )
    );
  end if;
end $$;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'finance_ledger_entry_group_check'
  ) then
    alter table public.finance_ledger
    add constraint finance_ledger_entry_group_check
    check (
      entry_group in (
        'payment',
        'commission',
        'payable',
        'refund',
        'adjustment',
        'payout',
        'general'
      )
    );
  end if;
end $$;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'finance_ledger_source_type_check'
  ) then
    alter table public.finance_ledger
    add constraint finance_ledger_source_type_check
    check (
      source_type in (
        'marketplace_order',
        'studio_booking',
        'manual_adjustment',
        'payout_batch',
        'refund',
        'system'
      )
    );
  end if;
end $$;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'finance_ledger_partner_type_check'
  ) then
    alter table public.finance_ledger
    add constraint finance_ledger_partner_type_check
    check (
      partner_type in (
        'customer',
        'vendor',
        'studio_owner',
        'platform',
        'system'
      )
    );
  end if;
end $$;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'finance_ledger_status_check'
  ) then
    alter table public.finance_ledger
    add constraint finance_ledger_status_check
    check (
      status in (
        'pending',
        'posted',
        'void',
        'paid',
        'refunded',
        'reversed'
      )
    );
  end if;
end $$;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'finance_ledger_amount_check'
  ) then
    alter table public.finance_ledger
    add constraint finance_ledger_amount_check
    check (amount >= 0);
  end if;
end $$;

create unique index if not exists idx_finance_ledger_unique_source_entry
on public.finance_ledger (
  source_type,
  source_id,
  entry_type,
  partner_type,
  partner_id
);

create index if not exists idx_finance_ledger_entry_type
on public.finance_ledger(entry_type);

create index if not exists idx_finance_ledger_entry_group
on public.finance_ledger(entry_group);

create index if not exists idx_finance_ledger_source
on public.finance_ledger(source_type, source_id);

create index if not exists idx_finance_ledger_partner
on public.finance_ledger(partner_type, partner_id);

create index if not exists idx_finance_ledger_status
on public.finance_ledger(status);

create index if not exists idx_finance_ledger_transaction_date
on public.finance_ledger(transaction_date desc);
