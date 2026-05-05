-- [PATCH 90] MARKETPLACE PROMOS & BANNERS
-- Purpose: Support dynamic advertisements and seasonal offers on the homepage.

create table if not exists public.marketplace_promos (
  id uuid primary key default gen_random_uuid(),
  title_en text not null,
  title_ar text not null,
  description_en text,
  description_ar text,
  image_url text not null,
  link_url text,
  promo_type text not null default 'hero_banner', -- hero_banner, side_card, bank_offer
  priority integer not null default 0,
  is_active boolean not null default true,
  starts_at timestamptz,
  ends_at timestamptz,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Indices for performance
create index if not exists idx_marketplace_promos_active on public.marketplace_promos(is_active);
create index if not exists idx_marketplace_promos_priority on public.marketplace_promos(priority desc);

-- Seed some initial data for testing
insert into public.marketplace_promos (title_en, title_ar, description_en, description_ar, image_url, link_url, promo_type, priority)
values 
('Ramadan Sale 2026', 'عروض رمضان ٢٠٢٦', 'Up to 50% off on all music gear', 'خصم يصل إلى ٥٠٪ على جميع معدات الموسيقى', 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=1200', '/marketplace', 'hero_banner', 10),
('Al Rajhi Bank Offer', 'عرض مصرف الراجحي', 'Extra 10% discount for Al Rajhi card holders', 'خصم إضافي ١٠٪ لحاملي بطاقات الراجحي', 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=800', '/marketplace', 'bank_offer', 5);
