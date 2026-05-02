create table if not exists public.payout_report_notes (
  id uuid primary key default gen_random_uuid(),
  report_scope text not null default 'admin',
  partner_type text,
  partner_id text,
  note text,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'payout_report_notes_partner_type_check'
  ) then
    alter table public.payout_report_notes
    add constraint payout_report_notes_partner_type_check
    check (
      partner_type is null
      or partner_type in ('studio_owner', 'vendor', 'platform')
    );
  end if;
end $$;

create index if not exists idx_payout_report_notes_partner
on public.payout_report_notes(partner_type, partner_id);

create index if not exists idx_payout_report_notes_created_at
on public.payout_report_notes(created_at desc);
