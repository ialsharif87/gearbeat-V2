create table if not exists public.studio_availability_rules (
  id uuid primary key default gen_random_uuid(),
  studio_id uuid not null references public.studios(id) on delete cascade,
  day_of_week integer not null check (day_of_week >= 0 and day_of_week <= 6),
  is_open boolean not null default true,
  open_time time,
  close_time time,
  slot_minutes integer not null default 60 check (slot_minutes >= 15 and slot_minutes <= 720),
  buffer_minutes integer not null default 0 check (buffer_minutes >= 0 and buffer_minutes <= 240),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (studio_id, day_of_week)
);

create table if not exists public.studio_availability_exceptions (
  id uuid primary key default gen_random_uuid(),
  studio_id uuid not null references public.studios(id) on delete cascade,
  exception_date date not null,
  is_closed boolean not null default true,
  open_time time,
  close_time time,
  reason text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (studio_id, exception_date)
);

create index if not exists idx_studio_availability_rules_studio_id
on public.studio_availability_rules(studio_id);

create index if not exists idx_studio_availability_rules_day
on public.studio_availability_rules(studio_id, day_of_week);

create index if not exists idx_studio_availability_exceptions_studio_id
on public.studio_availability_exceptions(studio_id);

create index if not exists idx_studio_availability_exceptions_date
on public.studio_availability_exceptions(studio_id, exception_date);
