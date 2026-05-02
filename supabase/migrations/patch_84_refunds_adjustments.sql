create table if not exists public.finance_adjustments (
  id uuid primary key default gen_random_uuid(),
  adjustment_number text not null unique,
  adjustment_type text not null,
  source_type text not null default 'manual_adjustment',
  source_id text not null default '',
  partner_type text not null default 'platform',
  partner_id text not null default '',
  partner_label text,
  amount numeric(14,2) not null default 0,
  currency text not null default 'SAR',
  reason text not null,
  status text not null default 'posted',
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conname = 'finance_adjustments_type_check'
  ) then
    alter table public.finance_adjustments
    add constraint finance_adjustments_type_check
    check (adjustment_type in ('refund','manual_adjustment','credit','debit'));
  end if;
end $$;

do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conname = 'finance_adjustments_status_check'
  ) then
    alter table public.finance_adjustments
    add constraint finance_adjustments_status_check
    check (status in ('draft','posted','void'));
  end if;
end $$;

create index if not exists idx_finance_adjustments_type
on public.finance_adjustments(adjustment_type);

create index if not exists idx_finance_adjustments_source
on public.finance_adjustments(source_type, source_id);

create index if not exists idx_finance_adjustments_created_at
on public.finance_adjustments(created_at desc);
