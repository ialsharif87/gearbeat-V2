-- PATCH 39: Availability Day/Time Pricing Schema
-- This migration adds support for granular time-based pricing tiers within a day 
-- and adds currency support to existing availability tables.

-- 1. Add currency support to existing availability tables
ALTER TABLE public.studio_availability_rules 
ADD COLUMN IF NOT EXISTS currency TEXT DEFAULT 'SAR';

ALTER TABLE public.studio_availability_exceptions 
ADD COLUMN IF NOT EXISTS currency TEXT DEFAULT 'SAR';

-- 2. Create studio_availability_pricing_rules for granular time-based pricing tiers
-- This table allows multiple price levels for different times on the same day (e.g., peak/off-peak)
CREATE TABLE IF NOT EXISTS public.studio_availability_pricing_rules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    studio_id UUID NOT NULL REFERENCES public.studios(id) ON DELETE CASCADE,
    day_of_week INTEGER NOT NULL CHECK (day_of_week >= 0 AND day_of_week <= 6),
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    price_per_hour DECIMAL(12,2) NOT NULL DEFAULT 0.00,
    currency TEXT NOT NULL DEFAULT 'SAR',
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT valid_time_range CHECK (start_time < end_time)
);

-- 3. Add Indexes for performance
CREATE INDEX IF NOT EXISTS idx_studio_availability_pricing_rules_studio_id 
ON public.studio_availability_pricing_rules(studio_id);

CREATE INDEX IF NOT EXISTS idx_studio_availability_pricing_rules_day_time 
ON public.studio_availability_pricing_rules(studio_id, day_of_week, start_time, end_time);

CREATE INDEX IF NOT EXISTS idx_studio_availability_pricing_rules_active 
ON public.studio_availability_pricing_rules(is_active) 
WHERE is_active = TRUE;

-- 4. Enable RLS
ALTER TABLE public.studio_availability_pricing_rules ENABLE ROW LEVEL SECURITY;

-- 5. RLS POLICIES
DROP POLICY IF EXISTS "Public can read studio pricing rules" ON public.studio_availability_pricing_rules;
DROP POLICY IF EXISTS "Owners can manage their studio pricing rules" ON public.studio_availability_pricing_rules;

CREATE POLICY "Owners can manage their studio pricing rules" 
ON public.studio_availability_pricing_rules FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM public.studios 
    WHERE public.studios.id = public.studio_availability_pricing_rules.studio_id 
    AND (
      public.studios.owner_auth_user_id = auth.uid() OR
      public.studios.owner_id::text = auth.uid()::text OR
      public.studios.user_id::text = auth.uid()::text
    )
  )
);
