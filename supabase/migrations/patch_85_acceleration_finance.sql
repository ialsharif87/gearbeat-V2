create table if not exists public.acceleration_packages (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  partner_type text not null default 'all',
  price numeric(14,2) not null default 0,
  currency text not null default 'SAR',
  duration_days integer not null default 7,
  placement text not null default 'featured',
  is_active boolean not null default true,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.acceleration_orders (
  id uuid primary key default gen_random_uuid(),
  order_number text not null unique,
  package_id uuid references public.acceleration_packages(id) on delete set null,
  partner_type text not null,
  partner_id text not null default '',
  partner_label text,
  amount numeric(14,2) not null default 0,
  currency text not null default 'SAR',
  status text not null default 'pending',
  payment_status text not null default 'pending',
  starts_at timestamptz,
  ends_at timestamptz,
  created_by uuid references auth.users(id) on delete set null,
  approved_by uuid references auth.users(id) on delete set null,
  approved_at timestamptz,
  cancelled_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conname = 'acceleration_packages_partner_type_check'
  ) then
    alter table public.acceleration_packages
    add constraint acceleration_packages_partner_type_check
    check (partner_type in ('all','vendor','studio_owner'));
  end if;
end $$;

do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conname = 'acceleration_orders_status_check'
  ) then
    alter table public.acceleration_orders
    add constraint acceleration_orders_status_check
    check (status in ('pending','approved','active','completed','cancelled'));
  end if;
end $$;

create index if not exists idx_acceleration_packages_active
on public.acceleration_packages(is_active);

create index if not exists idx_acceleration_orders_partner
on public.acceleration_orders(partner_type, partner_id);

create index if not exists idx_acceleration_orders_status
on public.acceleration_orders(status);
