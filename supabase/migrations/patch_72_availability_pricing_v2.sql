-- AVAILABILITY & PRICING V2
-- Tasks: Time-based pricing, Date range exceptions, and RLS Fixes

-- 1. Update studio_availability_rules
ALTER TABLE public.studio_availability_rules 
ADD COLUMN IF NOT EXISTS price_per_hour DECIMAL(12,2) DEFAULT 0.00;

-- 2. Update studio_availability_exceptions to handle date ranges
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='studio_availability_exceptions' AND column_name='start_date') THEN
    ALTER TABLE public.studio_availability_exceptions RENAME COLUMN exception_date TO start_date;
  END IF;
END $$;

ALTER TABLE public.studio_availability_exceptions 
ADD COLUMN IF NOT EXISTS end_date DATE,
ADD COLUMN IF NOT EXISTS price_per_hour DECIMAL(12,2);

-- Populate end_date with start_date for existing records
UPDATE public.studio_availability_exceptions 
SET end_date = start_date 
WHERE end_date IS NULL;

-- Make end_date NOT NULL after population
ALTER TABLE public.studio_availability_exceptions 
ALTER COLUMN end_date SET NOT NULL;

-- 3. ENABLE RLS
ALTER TABLE public.studio_availability_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.studio_availability_exceptions ENABLE ROW LEVEL SECURITY;

-- 4. RLS POLICIES

-- studio_availability_rules
DROP POLICY IF EXISTS "Public can read studio rules" ON public.studio_availability_rules;
CREATE POLICY "Public can read studio rules" 
ON public.studio_availability_rules FOR SELECT 
USING (true);

DROP POLICY IF EXISTS "Owners can manage their studio rules" ON public.studio_availability_rules;
CREATE POLICY "Owners can manage their studio rules" 
ON public.studio_availability_rules FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM public.studios 
    WHERE public.studios.id = public.studio_availability_rules.studio_id 
    AND public.studios.owner_auth_user_id = auth.uid()
  )
);

-- studio_availability_exceptions
DROP POLICY IF EXISTS "Public can read studio exceptions" ON public.studio_availability_exceptions;
CREATE POLICY "Public can read studio exceptions" 
ON public.studio_availability_exceptions FOR SELECT 
USING (true);

DROP POLICY IF EXISTS "Owners can manage their studio exceptions" ON public.studio_availability_exceptions;
CREATE POLICY "Owners can manage their studio exceptions" 
ON public.studio_availability_exceptions FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM public.studios 
    WHERE public.studios.id = public.studio_availability_exceptions.studio_id 
    AND public.studios.owner_auth_user_id = auth.uid()
  )
);
