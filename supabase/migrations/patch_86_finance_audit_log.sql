create table if not exists public.finance_audit_logs (
  id uuid primary key default gen_random_uuid(),
  action_type text not null,
  entity_type text not null,
  entity_id text not null default '',
  entity_label text,
  actor_user_id uuid references auth.users(id) on delete set null,
  actor_email text,
  reason text,
  before_data jsonb not null default '{}'::jsonb,
  after_data jsonb not null default '{}'::jsonb,
  metadata jsonb not null default '{}'::jsonb,
  ip_address text,
  user_agent text,
  created_at timestamptz not null default now()
);

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'finance_audit_logs_action_type_check'
  ) then
    alter table public.finance_audit_logs
    add constraint finance_audit_logs_action_type_check
    check (
      action_type in (
        'created',
        'updated',
        'status_changed',
        'approved',
        'rejected',
        'cancelled',
        'marked_paid',
        'ledger_rebuilt',
        'adjustment_created',
        'refund_created',
        'payout_requested',
        'settlement_created',
        'acceleration_order_created',
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
    where conname = 'finance_audit_logs_entity_type_check'
  ) then
    alter table public.finance_audit_logs
    add constraint finance_audit_logs_entity_type_check
    check (
      entity_type in (
        'finance_ledger',
        'settlement_batch',
        'settlement_batch_item',
        'payout_request',
        'finance_adjustment',
        'acceleration_package',
        'acceleration_order',
        'commission_setting',
        'booking',
        'marketplace_order',
        'system'
      )
    );
  end if;
end $$;

create index if not exists idx_finance_audit_logs_action_type
on public.finance_audit_logs(action_type);

create index if not exists idx_finance_audit_logs_entity
on public.finance_audit_logs(entity_type, entity_id);

create index if not exists idx_finance_audit_logs_actor
on public.finance_audit_logs(actor_user_id);

create index if not exists idx_finance_audit_logs_created_at
on public.finance_audit_logs(created_at desc);
