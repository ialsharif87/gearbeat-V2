-- ============================================================================
-- GearBeat Patch 123S
-- Studio Availability Legacy Column Aliases Fix
-- ============================================================================

ALTER TABLE IF EXISTS public.studio_availability_rules
ADD COLUMN IF NOT EXISTS is_open boolean DEFAULT true;

ALTER TABLE IF EXISTS public.studio_availability_rules
ADD COLUMN IF NOT EXISTS open_time time;

ALTER TABLE IF EXISTS public.studio_availability_rules
ADD COLUMN IF NOT EXISTS close_time time;

ALTER TABLE IF EXISTS public.studio_availability_rules
ADD COLUMN IF NOT EXISTS timezone text DEFAULT 'Asia/Riyadh';

ALTER TABLE IF EXISTS public.studio_availability_rules
ADD COLUMN IF NOT EXISTS slot_duration_minutes integer DEFAULT 60;

ALTER TABLE IF EXISTS public.studio_availability_rules
ADD COLUMN IF NOT EXISTS buffer_minutes integer DEFAULT 0;

ALTER TABLE IF EXISTS public.studio_availability_rules
ADD COLUMN IF NOT EXISTS base_hourly_rate numeric DEFAULT 0;

ALTER TABLE IF EXISTS public.studio_availability_rules
ADD COLUMN IF NOT EXISTS currency_code text DEFAULT 'SAR';

UPDATE public.studio_availability_rules
SET
  is_open = COALESCE(is_open, is_available, true),
  open_time = COALESCE(open_time, start_time),
  close_time = COALESCE(close_time, end_time)
WHERE open_time IS NULL OR close_time IS NULL OR is_open IS NULL;

CREATE INDEX IF NOT EXISTS idx_studio_availability_rules_open_time
ON public.studio_availability_rules(open_time);

CREATE INDEX IF NOT EXISTS idx_studio_availability_rules_close_time
ON public.studio_availability_rules(close_time);

CREATE INDEX IF NOT EXISTS idx_studio_availability_rules_is_open
ON public.studio_availability_rules(is_open);