-- [PATCH 51F] GEARBEAT CERTIFIED FOUNDATION
-- Objective: Implement the database layer for studio certification, tiers, and QR verification.
-- Documentation Reference: docs/GEARBEAT_PATCH_51F_ACTUAL_CERTIFIED_SQL_MIGRATION.md

-- 1. ENUMS & TYPES
-- Use DO block to ensure idempotent execution for types
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'certification_status') THEN
        CREATE TYPE public.certification_status AS ENUM ('pending', 'approved', 'rejected', 'suspended', 'expired');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'studio_certified_tier') THEN
        CREATE TYPE public.studio_certified_tier AS ENUM ('verified', 'trusted', 'premium', 'elite', 'flagship');
    END IF;
END $$;

-- 2. TABLES

-- studio_tiers: Defines the hierarchy and display metadata for trust levels
CREATE TABLE IF NOT EXISTS public.studio_tiers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name public.studio_certified_tier UNIQUE NOT NULL,
    display_name_en TEXT NOT NULL,
    display_name_ar TEXT NOT NULL,
    description_en TEXT,
    description_ar TEXT,
    rank INTEGER NOT NULL DEFAULT 0,
    color_hex TEXT NOT NULL DEFAULT '#cfa86e',
    created_at TIMESTAMPTZ DEFAULT now()
);

-- studio_tier_rules: Configuration for audit requirements per tier
CREATE TABLE IF NOT EXISTS public.studio_tier_rules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tier_id UUID NOT NULL REFERENCES public.studio_tiers(id) ON DELETE CASCADE,
    rule_type TEXT NOT NULL, -- e.g., 'hardware_audit', 'acoustic_measurement'
    requirement_details_en TEXT,
    requirement_details_ar TEXT,
    is_mandatory BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- certified_studios: Links live studios to their certification status
CREATE TABLE IF NOT EXISTS public.certified_studios (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    studio_id UUID UNIQUE NOT NULL REFERENCES public.studios(id) ON DELETE CASCADE,
    tier_id UUID NOT NULL REFERENCES public.studio_tiers(id),
    status public.certification_status NOT NULL DEFAULT 'pending',
    trust_score INTEGER CHECK (trust_score >= 0 AND trust_score <= 100) DEFAULT 0,
    hardware_verified_at TIMESTAMPTZ,
    acoustics_verified_at TIMESTAMPTZ,
    business_verified_at TIMESTAMPTZ,
    expires_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- studio_certification_history: Audit trail for all status/tier mutations
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

-- qr_verification_links: Unique secure tokens for physical verification
CREATE TABLE IF NOT EXISTS public.qr_verification_links (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    certified_studio_id UUID UNIQUE NOT NULL REFERENCES public.certified_studios(id) ON DELETE CASCADE,
    verification_token UUID UNIQUE NOT NULL DEFAULT gen_random_uuid(),
    scan_count INTEGER DEFAULT 0,
    last_scanned_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- digital_badges: Metadata for digital trust seals
CREATE TABLE IF NOT EXISTS public.digital_badges (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    certified_studio_id UUID NOT NULL REFERENCES public.certified_studios(id) ON DELETE CASCADE,
    badge_type TEXT NOT NULL, -- e.g., 'trust_seal_2026'
    image_url TEXT NOT NULL,
    issued_at TIMESTAMPTZ DEFAULT now(),
    is_active BOOLEAN DEFAULT true
);

-- certification_audit_events: Technical log for scan events and audit interactions
CREATE TABLE IF NOT EXISTS public.certification_audit_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    certified_studio_id UUID NOT NULL REFERENCES public.certified_studios(id) ON DELETE CASCADE,
    event_type TEXT NOT NULL, -- e.g., 'qr_scanned', 'manual_audit_updated'
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 3. INDEXES
CREATE INDEX IF NOT EXISTS idx_certified_studios_status ON public.certified_studios(status);
CREATE INDEX IF NOT EXISTS idx_certified_studios_studio_id ON public.certified_studios(studio_id);
CREATE INDEX IF NOT EXISTS idx_qr_verification_token ON public.qr_verification_links(verification_token);
CREATE INDEX IF NOT EXISTS idx_cert_history_studio ON public.studio_certification_history(certified_studio_id);
CREATE INDEX IF NOT EXISTS idx_audit_events_studio ON public.certification_audit_events(certified_studio_id);

-- 4. RLS POLICIES

-- Enable RLS on all foundation tables
ALTER TABLE public.studio_tiers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.studio_tier_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.certified_studios ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.studio_certification_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.qr_verification_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.digital_badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.certification_audit_events ENABLE ROW LEVEL SECURITY;

-- 4.1 studio_tiers Policies
CREATE POLICY "Public can view tiers" ON public.studio_tiers
    FOR SELECT USING (true);

CREATE POLICY "Admins can manage tiers" ON public.studio_tiers
    FOR ALL TO authenticated
    USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));

-- 4.2 certified_studios Policies
CREATE POLICY "Public can view approved active certifications" ON public.certified_studios
    FOR SELECT USING (status = 'approved' AND (expires_at IS NULL OR expires_at > now()));

CREATE POLICY "Owners can view their own certification" ON public.certified_studios
    FOR SELECT TO authenticated
    USING (EXISTS (SELECT 1 FROM public.studios WHERE id = certified_studios.studio_id AND owner_auth_user_id = auth.uid()));

CREATE POLICY "Admins can manage certifications" ON public.certified_studios
    FOR ALL TO authenticated
    USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));

-- 4.3 qr_verification_links Policies
CREATE POLICY "Owners can view their own QR links" ON public.qr_verification_links
    FOR SELECT TO authenticated
    USING (EXISTS (
        SELECT 1 FROM public.certified_studios cs
        JOIN public.studios s ON s.id = cs.studio_id
        WHERE cs.id = qr_verification_links.certified_studio_id AND s.owner_auth_user_id = auth.uid()
    ));

CREATE POLICY "Admins can manage QR links" ON public.qr_verification_links
    FOR ALL TO authenticated
    USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));

-- 4.4 studio_certification_history Policies
CREATE POLICY "Admins can view history" ON public.studio_certification_history
    FOR SELECT TO authenticated
    USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));

CREATE POLICY "Owners can view their own history" ON public.studio_certification_history
    FOR SELECT TO authenticated
    USING (EXISTS (
        SELECT 1 FROM public.certified_studios cs
        JOIN public.studios s ON s.id = cs.studio_id
        WHERE cs.id = studio_certification_history.certified_studio_id AND s.owner_auth_user_id = auth.uid()
    ));

-- 5. SEED INITIAL TIER METADATA
INSERT INTO public.studio_tiers (name, display_name_en, display_name_ar, rank, color_hex)
VALUES 
    ('verified', 'Verified', 'موثق', 1, '#cfa86e'),
    ('trusted', 'Trusted', 'موثوق', 2, '#cfa86e'),
    ('premium', 'Premium', 'مميز', 3, '#cfa86e'),
    ('elite', 'Elite', 'نخبة', 4, '#cfa86e'),
    ('flagship', 'Flagship', 'رئيسي', 5, '#cfa86e')
ON CONFLICT (name) DO UPDATE SET
    display_name_en = EXCLUDED.display_name_en,
    display_name_ar = EXCLUDED.display_name_ar,
    rank = EXCLUDED.rank,
    color_hex = EXCLUDED.color_hex;
