-- [PATCH 51H] GEARBEAT CERTIFIED SQL COMPATIBILITY & SECURITY FIX
-- Objective: Safely handle partial Patch 51F state, support pre-existing studio_tiers, and harden RLS.
-- Documentation: docs/GEARBEAT_PATCH_51H_CERTIFIED_SQL_COMPATIBILITY_SECURITY_FIX.md

-- 1. ENSURE ENUMS EXIST SAFELY
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'certification_status') THEN
        CREATE TYPE public.certification_status AS ENUM ('pending', 'approved', 'rejected', 'suspended', 'expired');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'studio_certified_tier') THEN
        CREATE TYPE public.studio_certified_tier AS ENUM ('verified', 'trusted', 'premium', 'elite', 'flagship');
    END IF;
END $$;

-- 2. HARDEN RLS ON PRE-EXISTING TABLES
-- Drop broad policies created by Patch 100 or partial Patch 51F
DROP POLICY IF EXISTS "Public read for tiers" ON public.studio_tiers;
DROP POLICY IF EXISTS "Public read for certified studios" ON public.certified_studios;
DROP POLICY IF EXISTS "Public can view tiers" ON public.studio_tiers;
DROP POLICY IF EXISTS "Public can view approved active certifications" ON public.certified_studios;

-- Re-enable RLS
ALTER TABLE public.studio_tiers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.certified_studios ENABLE ROW LEVEL SECURITY;

-- Add Restricted Public Policies
-- studio_tiers: Readable by everyone (public labels)
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policy WHERE polname = 'Public can view tiers') THEN
        CREATE POLICY "Public can view tiers" ON public.studio_tiers FOR SELECT USING (true);
    END IF;
END $$;

-- certified_studios: Only approved and non-expired certifications are public
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policy WHERE polname = 'Public can view approved active certifications') THEN
        CREATE POLICY "Public can view approved active certifications" ON public.certified_studios 
        FOR SELECT USING (status = 'approved' AND (expires_at IS NULL OR expires_at > now()));
    END IF;
END $$;

-- 3. ENSURE CERTIFIED_STUDIOS HAS MISSING COLUMNS
-- Use ALTER TABLE ADD COLUMN IF NOT EXISTS to survive partial execution
ALTER TABLE public.certified_studios ADD COLUMN IF NOT EXISTS hardware_verified_at TIMESTAMPTZ;
ALTER TABLE public.certified_studios ADD COLUMN IF NOT EXISTS acoustics_verified_at TIMESTAMPTZ;
ALTER TABLE public.certified_studios ADD COLUMN IF NOT EXISTS business_verified_at TIMESTAMPTZ;
ALTER TABLE public.certified_studios ADD COLUMN IF NOT EXISTS trust_score INTEGER CHECK (trust_score >= 0 AND trust_score <= 100) DEFAULT 0;

-- 4. CREATE MISSING TABLES SAFELY
-- studio_tier_rules
CREATE TABLE IF NOT EXISTS public.studio_tier_rules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tier_id UUID NOT NULL REFERENCES public.studio_tiers(id) ON DELETE CASCADE,
    rule_type TEXT NOT NULL,
    requirement_details_en TEXT,
    requirement_details_ar TEXT,
    is_mandatory BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- studio_certification_history
CREATE TABLE IF NOT EXISTS public.studio_certification_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    certified_studio_id UUID NOT NULL REFERENCES public.certified_studios(id) ON DELETE CASCADE,
    previous_status public.certification_status,
    new_status public.certification_status NOT NULL,
    previous_tier_id UUID,
    new_tier_id UUID NOT NULL,
    changed_by UUID NOT NULL REFERENCES public.profiles(id),
    reason_note TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- qr_verification_links
CREATE TABLE IF NOT EXISTS public.qr_verification_links (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    certified_studio_id UUID UNIQUE NOT NULL REFERENCES public.certified_studios(id) ON DELETE CASCADE,
    verification_token UUID UNIQUE NOT NULL DEFAULT gen_random_uuid(),
    scan_count INTEGER DEFAULT 0,
    last_scanned_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- digital_badges
CREATE TABLE IF NOT EXISTS public.digital_badges (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    certified_studio_id UUID NOT NULL REFERENCES public.certified_studios(id) ON DELETE CASCADE,
    badge_type TEXT NOT NULL,
    image_url TEXT NOT NULL,
    issued_at TIMESTAMPTZ DEFAULT now(),
    is_active BOOLEAN DEFAULT true
);

-- certification_audit_events
CREATE TABLE IF NOT EXISTS public.certification_audit_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    certified_studio_id UUID NOT NULL REFERENCES public.certified_studios(id) ON DELETE CASCADE,
    event_type TEXT NOT NULL,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 5. ENABLE RLS ON NEW TABLES
ALTER TABLE public.studio_tier_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.studio_certification_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.qr_verification_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.digital_badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.certification_audit_events ENABLE ROW LEVEL SECURITY;

-- 6. ADMIN MUTATION POLICIES
-- Restrict mutations to admin users only
DO $$ 
BEGIN
    -- General Admin Pattern for the project
    IF NOT EXISTS (SELECT 1 FROM pg_policy WHERE polname = 'Admins can manage certified foundation') THEN
        CREATE POLICY "Admins can manage certified foundation" ON public.certified_studios FOR ALL 
        TO authenticated USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policy WHERE polname = 'Admins can manage studio_tiers') THEN
        CREATE POLICY "Admins can manage studio_tiers" ON public.studio_tiers FOR ALL 
        TO authenticated USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));
    END IF;
END $$;

-- 7. OWNER TRANSPARENCY POLICIES
-- Owners can read their own certification details
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policy WHERE polname = 'Owners can view their own certification') THEN
        CREATE POLICY "Owners can view their own certification" ON public.certified_studios FOR SELECT 
        TO authenticated USING (EXISTS (SELECT 1 FROM public.studios WHERE id = certified_studios.studio_id AND owner_auth_user_id = auth.uid()));
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policy WHERE polname = 'Owners can view their own QR links') THEN
        CREATE POLICY "Owners can view their own QR links" ON public.qr_verification_links FOR SELECT 
        TO authenticated USING (EXISTS (
            SELECT 1 FROM public.certified_studios cs
            JOIN public.studios s ON s.id = cs.studio_id
            WHERE cs.id = qr_verification_links.certified_studio_id AND s.owner_auth_user_id = auth.uid()
        ));
    END IF;
END $$;

-- 8. INDEXES
CREATE INDEX IF NOT EXISTS idx_certified_studios_status ON public.certified_studios(status);
CREATE INDEX IF NOT EXISTS idx_certified_studios_studio_id ON public.certified_studios(studio_id);
CREATE INDEX IF NOT EXISTS idx_qr_verification_token ON public.qr_verification_links(verification_token);
CREATE INDEX IF NOT EXISTS idx_cert_history_studio ON public.studio_certification_history(certified_studio_id);
CREATE INDEX IF NOT EXISTS idx_audit_events_studio ON public.certification_audit_events(certified_studio_id);
