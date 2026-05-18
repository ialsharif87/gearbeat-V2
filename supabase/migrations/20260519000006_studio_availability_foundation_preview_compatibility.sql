-- ============================================================================
-- GEARBEAT PATCH 123R: STUDIO AVAILABILITY FOUNDATION PREVIEW COMPATIBILITY
-- ============================================================================
-- Description: Create core availability and pricing rule tables with safe 
--              compatibility columns if they do not exist. This ensures that
--              preview/ephemeral databases apply availability schema successfully 
--              even if historical un-timestamped patch files are skipped.
-- Safety:      - Safe CREATE TABLE IF NOT EXISTS declarations.
--              - Safe ALTER TABLE ADD COLUMN IF NOT EXISTS compatibility backfills.
--              - No strict FK references to public.studios to prevent preview seed failures.
--              - Zero destructive mutations (NO DROP, NO DELETE).
-- ============================================================================

-- 1. Studio Availability Rules
CREATE TABLE IF NOT EXISTS public.studio_availability_rules (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    studio_id uuid,
    day_of_week integer,
    start_time time,
    open_time time,
    end_time time,
    close_time time,
    is_available boolean DEFAULT true,
    is_open boolean DEFAULT true,
    status text DEFAULT 'active',
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

ALTER TABLE public.studio_availability_rules ADD COLUMN IF NOT EXISTS studio_id uuid;
ALTER TABLE public.studio_availability_rules ADD COLUMN IF NOT EXISTS day_of_week integer;
ALTER TABLE public.studio_availability_rules ADD COLUMN IF NOT EXISTS start_time time;
ALTER TABLE public.studio_availability_rules ADD COLUMN IF NOT EXISTS end_time time;
ALTER TABLE public.studio_availability_rules ADD COLUMN IF NOT EXISTS is_available boolean DEFAULT true;
ALTER TABLE public.studio_availability_rules ADD COLUMN IF NOT EXISTS status text DEFAULT 'active';
ALTER TABLE public.studio_availability_rules ADD COLUMN IF NOT EXISTS created_at timestamptz DEFAULT now();
ALTER TABLE public.studio_availability_rules ADD COLUMN IF NOT EXISTS updated_at timestamptz DEFAULT now();

-- 2. Studio Availability Exceptions
CREATE TABLE IF NOT EXISTS public.studio_availability_exceptions (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    studio_id uuid,
    exception_date date,
    start_time time,
    open_time time,
    end_time time,
    close_time time,
    reason text,
    is_available boolean DEFAULT false,
    status text DEFAULT 'active',
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

ALTER TABLE public.studio_availability_exceptions ADD COLUMN IF NOT EXISTS studio_id uuid;
ALTER TABLE public.studio_availability_exceptions ADD COLUMN IF NOT EXISTS exception_date date;
ALTER TABLE public.studio_availability_exceptions ADD COLUMN IF NOT EXISTS start_time time;
ALTER TABLE public.studio_availability_exceptions ADD COLUMN IF NOT EXISTS end_time time;
ALTER TABLE public.studio_availability_exceptions ADD COLUMN IF NOT EXISTS reason text;
ALTER TABLE public.studio_availability_exceptions ADD COLUMN IF NOT EXISTS is_available boolean DEFAULT false;
ALTER TABLE public.studio_availability_exceptions ADD COLUMN IF NOT EXISTS status text DEFAULT 'active';
ALTER TABLE public.studio_availability_exceptions ADD COLUMN IF NOT EXISTS created_at timestamptz DEFAULT now();
ALTER TABLE public.studio_availability_exceptions ADD COLUMN IF NOT EXISTS updated_at timestamptz DEFAULT now();

-- 3. Studio Availability Slots
CREATE TABLE IF NOT EXISTS public.studio_availability_slots (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    studio_id uuid,
    slot_date date,
    start_time time,
    open_time time,
    end_time time,
    close_time time,
    status text DEFAULT 'available',
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

ALTER TABLE public.studio_availability_slots ADD COLUMN IF NOT EXISTS studio_id uuid;
ALTER TABLE public.studio_availability_slots ADD COLUMN IF NOT EXISTS slot_date date;
ALTER TABLE public.studio_availability_slots ADD COLUMN IF NOT EXISTS start_time time;
ALTER TABLE public.studio_availability_slots ADD COLUMN IF NOT EXISTS end_time time;
ALTER TABLE public.studio_availability_slots ADD COLUMN IF NOT EXISTS status text DEFAULT 'available';
ALTER TABLE public.studio_availability_slots ADD COLUMN IF NOT EXISTS created_at timestamptz DEFAULT now();
ALTER TABLE public.studio_availability_slots ADD COLUMN IF NOT EXISTS updated_at timestamptz DEFAULT now();

-- 4. Studio Pricing Rules
CREATE TABLE IF NOT EXISTS public.studio_pricing_rules (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    studio_id uuid,
    day_of_week integer,
    start_time time,
    open_time time,
    end_time time,
    close_time time,
    hourly_rate numeric DEFAULT 0,
    currency_code text DEFAULT 'SAR',
    status text DEFAULT 'active',
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

ALTER TABLE public.studio_pricing_rules ADD COLUMN IF NOT EXISTS studio_id uuid;
ALTER TABLE public.studio_pricing_rules ADD COLUMN IF NOT EXISTS day_of_week integer;
ALTER TABLE public.studio_pricing_rules ADD COLUMN IF NOT EXISTS start_time time;
ALTER TABLE public.studio_pricing_rules ADD COLUMN IF NOT EXISTS end_time time;
ALTER TABLE public.studio_pricing_rules ADD COLUMN IF NOT EXISTS hourly_rate numeric DEFAULT 0;
ALTER TABLE public.studio_pricing_rules ADD COLUMN IF NOT EXISTS currency_code text DEFAULT 'SAR';
ALTER TABLE public.studio_pricing_rules ADD COLUMN IF NOT EXISTS status text DEFAULT 'active';
ALTER TABLE public.studio_pricing_rules ADD COLUMN IF NOT EXISTS created_at timestamptz DEFAULT now();
ALTER TABLE public.studio_pricing_rules ADD COLUMN IF NOT EXISTS updated_at timestamptz DEFAULT now();

-- Safe compatibility indexes
ALTER TABLE public.studio_availability_rules ADD COLUMN IF NOT EXISTS is_open boolean DEFAULT true;

ALTER TABLE IF EXISTS public.studio_availability_rules ADD COLUMN IF NOT EXISTS is_open boolean DEFAULT true;
ALTER TABLE IF EXISTS public.studio_availability_rules ADD COLUMN IF NOT EXISTS open_time time;
ALTER TABLE IF EXISTS public.studio_availability_rules ADD COLUMN IF NOT EXISTS close_time time;
ALTER TABLE IF EXISTS public.studio_availability_rules ADD COLUMN IF NOT EXISTS timezone text DEFAULT 'Asia/Riyadh';
ALTER TABLE IF EXISTS public.studio_availability_rules ADD COLUMN IF NOT EXISTS slot_duration_minutes integer DEFAULT 60;
ALTER TABLE IF EXISTS public.studio_availability_rules ADD COLUMN IF NOT EXISTS buffer_minutes integer DEFAULT 0;
ALTER TABLE IF EXISTS public.studio_availability_rules ADD COLUMN IF NOT EXISTS base_hourly_rate numeric DEFAULT 0;
ALTER TABLE IF EXISTS public.studio_availability_rules ADD COLUMN IF NOT EXISTS currency_code text DEFAULT 'SAR';

UPDATE public.studio_availability_rules
SET
  is_open = COALESCE(is_open, is_available, true),
  open_time = COALESCE(open_time, start_time),
  close_time = COALESCE(close_time, end_time)
WHERE open_time IS NULL OR close_time IS NULL OR is_open IS NULL;
CREATE INDEX IF NOT EXISTS idx_studio_availability_rules_studio_id ON public.studio_availability_rules(studio_id);
CREATE INDEX IF NOT EXISTS idx_studio_availability_rules_day ON public.studio_availability_rules(studio_id, day_of_week);
CREATE INDEX IF NOT EXISTS idx_studio_availability_exceptions_studio_id ON public.studio_availability_exceptions(studio_id);
CREATE INDEX IF NOT EXISTS idx_studio_availability_slots_studio_id ON public.studio_availability_slots(studio_id);
CREATE INDEX IF NOT EXISTS idx_studio_pricing_rules_studio_id ON public.studio_pricing_rules(studio_id);
