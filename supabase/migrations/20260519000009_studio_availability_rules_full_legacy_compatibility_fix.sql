-- ============================================================================
-- GearBeat Patch 123S
-- Studio Availability Rules Full Legacy Compatibility Fix
-- ============================================================================

ALTER TABLE IF EXISTS public.studio_availability_rules ADD COLUMN IF NOT EXISTS is_open boolean DEFAULT true;
ALTER TABLE IF EXISTS public.studio_availability_rules ADD COLUMN IF NOT EXISTS is_available boolean DEFAULT true;
ALTER TABLE IF EXISTS public.studio_availability_rules ADD COLUMN IF NOT EXISTS open_time time;
ALTER TABLE IF EXISTS public.studio_availability_rules ADD COLUMN IF NOT EXISTS close_time time;
ALTER TABLE IF EXISTS public.studio_availability_rules ADD COLUMN IF NOT EXISTS start_time time;
ALTER TABLE IF EXISTS public.studio_availability_rules ADD COLUMN IF NOT EXISTS end_time time;
ALTER TABLE IF EXISTS public.studio_availability_rules ADD COLUMN IF NOT EXISTS slot_minutes integer DEFAULT 60;
ALTER TABLE IF EXISTS public.studio_availability_rules ADD COLUMN IF NOT EXISTS slot_duration_minutes integer DEFAULT 60;
ALTER TABLE IF EXISTS public.studio_availability_rules ADD COLUMN IF NOT EXISTS buffer_minutes integer DEFAULT 0;
ALTER TABLE IF EXISTS public.studio_availability_rules ADD COLUMN IF NOT EXISTS timezone text DEFAULT 'Asia/Riyadh';
ALTER TABLE IF EXISTS public.studio_availability_rules ADD COLUMN IF NOT EXISTS base_hourly_rate numeric DEFAULT 0;
ALTER TABLE IF EXISTS public.studio_availability_rules ADD COLUMN IF NOT EXISTS hourly_rate numeric DEFAULT 0;
ALTER TABLE IF EXISTS public.studio_availability_rules ADD COLUMN IF NOT EXISTS currency_code text DEFAULT 'SAR';

DO $$
BEGIN
  IF to_regclass('public.studio_availability_rules') IS NOT NULL THEN
    UPDATE public.studio_availability_rules
    SET
      is_open = COALESCE(is_open, is_available, true),
      is_available = COALESCE(is_available, is_open, true),
      open_time = COALESCE(open_time, start_time),
      close_time = COALESCE(close_time, end_time),
      start_time = COALESCE(start_time, open_time),
      end_time = COALESCE(end_time, close_time),
      slot_minutes = COALESCE(slot_minutes, slot_duration_minutes, 60),
      slot_duration_minutes = COALESCE(slot_duration_minutes, slot_minutes, 60),
      timezone = COALESCE(timezone, 'Asia/Riyadh'),
      currency_code = COALESCE(currency_code, 'SAR')
    WHERE true;
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_studio_availability_rules_is_open ON public.studio_availability_rules(is_open);
CREATE INDEX IF NOT EXISTS idx_studio_availability_rules_open_time ON public.studio_availability_rules(open_time);
CREATE INDEX IF NOT EXISTS idx_studio_availability_rules_close_time ON public.studio_availability_rules(close_time);
CREATE INDEX IF NOT EXISTS idx_studio_availability_rules_slot_minutes ON public.studio_availability_rules(slot_minutes);