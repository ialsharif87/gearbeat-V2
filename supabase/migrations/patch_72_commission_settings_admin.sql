create table if not exists public.commission_settings (
  id uuid primary key default gen_random_uuid(),
  scope_type text not null,
  scope_id text,
  scope_label text,
  commission_rate numeric(5,2) not null default 15.00,
  is_active boolean not null default true,
  notes text,
  created_by uuid references auth.users(id) on delete set null,
  updated_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'commission_settings_scope_type_check'
  ) then
    alter table public.commission_settings
    add constraint commission_settings_scope_type_check
    check (
      scope_type in (
        'global',
        'studio',
        'vendor',
        'product',
        'service_type'
      )
    );
  end if;
end $$;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'commission_settings_rate_check'
  ) then
    alter table public.commission_settings
    add constraint commission_settings_rate_check
    check (
      commission_rate >= 10
      and commission_rate <= 30
    );
  end if;
end $$;

create unique index if not exists idx_commission_settings_unique_scope
on public.commission_settings (
  scope_type,
  coalesce(scope_id, '__global__')
);

create index if not exists idx_commission_settings_scope_type
on public.commission_settings(scope_type);

create index if not exists idx_commission_settings_scope_id
on public.commission_settings(scope_id);

create index if not exists idx_commission_settings_is_active
on public.commission_settings(is_active);

insert into public.commission_settings (
  scope_type,
  scope_id,
  scope_label,
  commission_rate,
  is_active,
  notes
)
select
  'global',
  null,
  'Global default commission',
  15.00,
  true,
  'Default GearBeat commission rate.'
where not exists (
  select 1
  from public.commission_settings
  where scope_type = 'global'
    and scope_id is null
);
