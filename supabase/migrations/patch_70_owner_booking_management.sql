alter table public.bookings
add column if not exists payment_status text default 'pending';

alter table public.bookings
add column if not exists owner_notes text;

alter table public.bookings
add column if not exists status_changed_at timestamptz;

alter table public.bookings
add column if not exists status_changed_by uuid references auth.users(id) on delete set null;

alter table public.bookings
add column if not exists owner_decision_at timestamptz;

alter table public.bookings
add column if not exists cancelled_at timestamptz;

alter table public.bookings
add column if not exists updated_at timestamptz not null default now();

update public.bookings
set status = 'pending_owner_review'
where status is null;

update public.bookings
set payment_status = 'pending'
where payment_status is null;

do $$
declare
  constraint_record record;
begin
  for constraint_record in
    select c.conname
    from pg_constraint c
    join pg_attribute a
      on a.attrelid = c.conrelid
     and a.attnum = any(c.conkey)
    where c.conrelid = 'public.bookings'::regclass
      and c.contype = 'c'
      and a.attname = 'status'
  loop
    execute format('alter table public.bookings drop constraint if exists %I', constraint_record.conname);
  end loop;
end $$;

alter table public.bookings
add constraint bookings_status_check
check (
  status in (
    'pending',
    'pending_review',
    'pending_owner_review',
    'accepted',
    'confirmed',
    'rejected',
    'declined',
    'cancelled',
    'completed',
    'no_show'
  )
);

do $$
declare
  constraint_record record;
begin
  for constraint_record in
    select c.conname
    from pg_constraint c
    join pg_attribute a
      on a.attrelid = c.conrelid
     and a.attnum = any(c.conkey)
    where c.conrelid = 'public.bookings'::regclass
      and c.contype = 'c'
      and a.attname = 'payment_status'
  loop
    execute format('alter table public.bookings drop constraint if exists %I', constraint_record.conname);
  end loop;
end $$;

alter table public.bookings
add constraint bookings_payment_status_check
check (
  payment_status in (
    'pending',
    'unpaid',
    'paid',
    'manual_paid',
    'failed',
    'refunded',
    'cancelled'
  )
);

create index if not exists idx_bookings_studio_id
on public.bookings(studio_id);

create index if not exists idx_bookings_status
on public.bookings(status);

create index if not exists idx_bookings_payment_status
on public.bookings(payment_status);

create index if not exists idx_bookings_created_at
on public.bookings(created_at desc);
