-- PATCH 38: Availability Exception Date Range Schema
-- Hardening studio_availability_exceptions for better type support and status tracking

-- 1. Add new columns for better classification and status
ALTER TABLE public.studio_availability_exceptions 
ADD COLUMN IF NOT EXISTS exception_type TEXT DEFAULT 'closed',
ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT TRUE;

-- 2. Add start_time and end_time as aliases/extended fields for open_time/close_time if requested
-- We keep open_time and close_time for backward compatibility with current API
ALTER TABLE public.studio_availability_exceptions 
ADD COLUMN IF NOT EXISTS start_time TIME,
ADD COLUMN IF NOT EXISTS end_time TIME;

-- 3. Add Indexes for performance
CREATE INDEX IF NOT EXISTS idx_studio_availability_exceptions_active 
ON public.studio_availability_exceptions(is_active) 
WHERE is_active = TRUE;

CREATE INDEX IF NOT EXISTS idx_studio_availability_exceptions_range 
ON public.studio_availability_exceptions(studio_id, start_date, end_date);

CREATE INDEX IF NOT EXISTS idx_studio_availability_exceptions_type 
ON public.studio_availability_exceptions(exception_type);

-- 4. Ensure RLS Policies are robust (Policies already exist from patch_72, but we ensure they cover new columns)
-- No changes needed to policies as they are "FOR ALL" and based on studio_id ownership.
