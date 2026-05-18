-- ============================================================================
-- GearBeat Patch 123S
-- Studio Availability is_open Compatibility Fix
-- ============================================================================

ALTER TABLE IF EXISTS public.studio_availability_rules
ADD COLUMN IF NOT EXISTS is_open boolean DEFAULT true;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'studio_availability_rules'
      AND column_name = 'is_available'
  ) THEN
    EXECUTE 'UPDATE public.studio_availability_rules SET is_open = COALESCE(is_open, is_available, true) WHERE is_open IS NULL';
  ELSE
    UPDATE public.studio_availability_rules
    SET is_open = COALESCE(is_open, true)
    WHERE is_open IS NULL;
  END IF;
END $$;
