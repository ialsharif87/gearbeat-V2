create table if not exists public.settlement_batches (
  id uuid primary key default gen_random_uuid(),
  batch_number text not null unique,
  title text not null,
  description text,
  status text not null default 'draft',
  currency text not null default 'SAR',
  gross_amount numeric(14,2) not null default 0,
  commission_amount numeric(14,2) not null default 0,
  net_payable_amount numeric(14,2) not null default 0,
  item_count integer not null default 0,
  reviewed_at timestamptz,
  approved_at timestamptz,
  paid_at timestamptz,
  cancelled_at timestamptz,
  created_by uuid references auth.users(id) on delete set null,
  updated_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.settlement_batch_items (
  id uuid primary key default gen_random_uuid(),
  batch_id uuid not null references public.settlement_batches(id) on delete cascade,
  ledger_entry_id uuid not null references public.finance_ledger(id) on delete restrict,
  partner_type text not null,
  partner_id text not null default '',
  partner_label text,
  source_type text not null,
  source_id text not null default '',
  amount numeric(14,2) not null default 0,
  currency text not null default 'SAR',
  status text not null default 'included',
  created_at timestamptz not null default now(),
  unique (ledger_entry_id)
);

do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conname = 'settlement_batches_status_check'
  ) then
    alter table public.settlement_batches
    add constraint settlement_batches_status_check
    check (status in ('draft','reviewed','approved','paid','cancelled'));
  end if;
end $$;

do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conname = 'settlement_batch_items_status_check'
  ) then
    alter table public.settlement_batch_items
    add constraint settlement_batch_items_status_check
    check (status in ('included','removed','paid','cancelled'));
  end if;
end $$;

create index if not exists idx_settlement_batches_status
on public.settlement_batches(status);

create index if not exists idx_settlement_batches_created_at
on public.settlement_batches(created_at desc);

create index if not exists idx_settlement_batch_items_batch_id
on public.settlement_batch_items(batch_id);

create index if not exists idx_settlement_batch_items_partner
on public.settlement_batch_items(partner_type, partner_id);
