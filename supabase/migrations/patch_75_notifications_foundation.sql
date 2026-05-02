create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  audience text not null default 'user',
  title text not null,
  body text,
  notification_type text not null default 'general',
  entity_type text,
  entity_id text,
  action_url text,
  is_read boolean not null default false,
  read_at timestamptz,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'notifications_audience_check'
  ) then
    alter table public.notifications
    add constraint notifications_audience_check
    check (
      audience in (
        'user',
        'admin',
        'owner',
        'vendor',
        'customer',
        'system'
      )
    );
  end if;
end $$;

create index if not exists idx_notifications_user_id
on public.notifications(user_id);

create index if not exists idx_notifications_audience
on public.notifications(audience);

create index if not exists idx_notifications_is_read
on public.notifications(is_read);

create index if not exists idx_notifications_created_at
on public.notifications(created_at desc);

create index if not exists idx_notifications_entity
on public.notifications(entity_type, entity_id);
