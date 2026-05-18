-- ============================================================================
-- GearBeat Patch 123P
-- Forward Studios Required Fields Compatibility Fix
-- ============================================================================

ALTER TABLE IF EXISTS public.studios
ADD COLUMN IF NOT EXISTS name text;

ALTER TABLE IF EXISTS public.studios
ADD COLUMN IF NOT EXISTS name_en text;

ALTER TABLE IF EXISTS public.studios
ADD COLUMN IF NOT EXISTS name_ar text;

ALTER TABLE IF EXISTS public.studios
ADD COLUMN IF NOT EXISTS title text;

ALTER TABLE IF EXISTS public.studios
ADD COLUMN IF NOT EXISTS slug text;

ALTER TABLE IF EXISTS public.studios
ADD COLUMN IF NOT EXISTS city text;

UPDATE public.studios
SET name = COALESCE(
  NULLIF(name, ''),
  NULLIF(name_en, ''),
  NULLIF(name_ar, ''),
  NULLIF(title, ''),
  NULLIF(slug, ''),
  'Untitled Studio'
)
WHERE name IS NULL OR name = '';

UPDATE public.studios
SET slug = COALESCE(
  NULLIF(slug, ''),
  lower(regexp_replace(COALESCE(name, name_en, title, 'untitled-studio'), '[^a-zA-Z0-9]+', '-', 'g'))
)
WHERE slug IS NULL OR slug = '';

UPDATE public.studios
SET city = COALESCE(NULLIF(city, ''), 'Unknown')
WHERE city IS NULL OR city = '';

ALTER TABLE IF EXISTS public.studios
ALTER COLUMN name SET DEFAULT 'Untitled Studio';

ALTER TABLE IF EXISTS public.studios
ALTER COLUMN slug SET DEFAULT 'untitled-studio';

ALTER TABLE IF EXISTS public.studios
ALTER COLUMN city SET DEFAULT 'Unknown';

ALTER TABLE IF EXISTS public.studios
ALTER COLUMN name DROP NOT NULL;

ALTER TABLE IF EXISTS public.studios
ALTER COLUMN slug DROP NOT NULL;

ALTER TABLE IF EXISTS public.studios
ALTER COLUMN city DROP NOT NULL;

CREATE INDEX IF NOT EXISTS idx_studios_name_en
ON public.studios(name_en);

CREATE INDEX IF NOT EXISTS idx_studios_slug
ON public.studios(slug);
