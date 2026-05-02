create table if not exists public.payout_requests (
  id uuid primary key default gen_random_uuid(),
  request_number text not null unique,
  requester_user_id uuid references auth.users(id) on delete set null,
  partner_type text not null,
  partner_id text not null default '',
  partner_label text,
  requested_amount numeric(14,2) not null default 0,
  currency text not null default 'SAR',
  status text not null default 'pending',
  payout_method text,
  payout_details text,
  requester_notes text,
  admin_notes text,
  reviewed_by uuid references auth.users(id) on delete set null,
  reviewed_at timestamptz,
  approved_at timestamptz,
  rejected_at timestamptz,
  paid_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conname = 'payout_requests_partner_type_check'
  ) then
    alter table public.payout_requests
    add constraint payout_requests_partner_type_check
    check (partner_type in ('vendor','studio_owner'));
  end if;
end $$;

do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conname = 'payout_requests_status_check'
  ) then
    alter table public.payout_requests
    add constraint payout_requests_status_check
    check (status in ('pending','reviewed','approved','rejected','paid','cancelled'));
  end if;
end $$;

create index if not exists idx_payout_requests_requester
on public.payout_requests(requester_user_id);

create index if not exists idx_payout_requests_partner
on public.payout_requests(partner_type, partner_id);

create index if not exists idx_payout_requests_status
on public.payout_requests(status);

create index if not exists idx_payout_requests_created_at
on public.payout_requests(created_at desc);
