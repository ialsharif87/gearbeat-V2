-- GEARBEAT CERTIFIED & REWARDS PROGRAM FOUNDATION
-- PR LAUNCH & MARKETING ENGINE INFRASTRUCTURE

-- 1. STUDIO TIERS
CREATE TABLE IF NOT EXISTS studio_tiers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    level INTEGER NOT NULL UNIQUE CHECK (level >= 1 AND level <= 5),
    name_en TEXT NOT NULL,
    name_ar TEXT NOT NULL,
    rules_json JSONB DEFAULT '{}', -- Criteria for this tier
    reward_kit_type TEXT, -- Reference to merch_kits
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. CUSTOMER TIERS
CREATE TABLE IF NOT EXISTS customer_tiers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    level INTEGER NOT NULL UNIQUE CHECK (level >= 1 AND level <= 5),
    name_en TEXT NOT NULL,
    name_ar TEXT NOT NULL,
    rules_json JSONB DEFAULT '{}',
    reward_kit_type TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. VENDOR TIERS
CREATE TABLE IF NOT EXISTS vendor_tiers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    level INTEGER NOT NULL UNIQUE CHECK (level >= 1 AND level <= 5),
    name_en TEXT NOT NULL,
    name_ar TEXT NOT NULL,
    rules_json JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. CERTIFIED STUDIOS
CREATE TABLE IF NOT EXISTS certified_studios (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    studio_id UUID NOT NULL REFERENCES studios(id) ON DELETE CASCADE UNIQUE,
    tier_id UUID REFERENCES studio_tiers(id) ON DELETE SET NULL,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'suspended', 'expired')),
    last_verified_date TIMESTAMPTZ DEFAULT NOW(),
    certificate_url TEXT,
    qr_link_id TEXT UNIQUE, -- Slug or short link for verification
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. MERCH KITS
CREATE TABLE IF NOT EXISTS merch_kits (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name_en TEXT NOT NULL,
    name_ar TEXT NOT NULL,
    kit_type TEXT NOT NULL UNIQUE, -- e.g. 'welcome_kit', 'pro_kit', 'flagship_box'
    items_json JSONB DEFAULT '[]', -- List of physical items included
    estimated_cost DECIMAL(12,2) DEFAULT 0.00,
    inventory_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. MERCH FULFILLMENT ORDERS
CREATE TABLE IF NOT EXISTS merch_fulfillment_orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    studio_id UUID REFERENCES studios(id) ON DELETE SET NULL,
    kit_id UUID NOT NULL REFERENCES merch_kits(id),
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'packed', 'shipped', 'delivered', 'cancelled')),
    tracking_number TEXT,
    shipping_details JSONB DEFAULT '{}',
    shipped_at TIMESTAMPTZ,
    delivered_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. PR CAMPAIGNS
CREATE TABLE IF NOT EXISTS pr_campaigns (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    type TEXT NOT NULL, -- e.g. 'launch', 'studio_activation', 'merch_drop'
    status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'paused', 'completed', 'cancelled')),
    start_date DATE,
    end_date DATE,
    budget DECIMAL(12,2) DEFAULT 0.00,
    campaign_code TEXT UNIQUE,
    target_audience TEXT,
    utm_source TEXT,
    results_json JSONB DEFAULT '{}', -- KPIs like reach, bookings, etc.
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. CREATOR SEEDING
CREATE TABLE IF NOT EXISTS creator_seeding (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    campaign_id UUID REFERENCES pr_campaigns(id) ON DELETE CASCADE,
    creator_name TEXT NOT NULL,
    social_handle TEXT,
    status TEXT NOT NULL DEFAULT 'contacted' CHECK (status IN ('contacted', 'visit_scheduled', 'kit_sent', 'content_published', 'cancelled')),
    visit_studio_id UUID REFERENCES studios(id),
    reward_given_kit_id UUID REFERENCES merch_kits(id),
    content_links TEXT[],
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. MEDIA COVERAGE
CREATE TABLE IF NOT EXISTS media_coverage (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    campaign_id UUID REFERENCES pr_campaigns(id) ON DELETE CASCADE,
    outlet_name TEXT NOT NULL,
    article_title TEXT,
    article_link TEXT,
    published_date DATE,
    status TEXT NOT NULL DEFAULT 'pitched' CHECK (status IN ('pitched', 'published', 'rejected')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- SEED INITIAL TIERS

INSERT INTO studio_tiers (level, name_en, name_ar, reward_kit_type) VALUES
(1, 'Verified Studio', 'استوديو موثّق', 'welcome_kit'),
(2, 'Trusted Studio', 'استوديو موثوق', 'premium_sticker_kit'),
(3, 'Premium Studio', 'استوديو مميز', 'premium_partner_box'),
(4, 'Elite Studio', 'استوديو نخبة', 'luxury_black_box'),
(5, 'GearBeat Flagship Studio', 'استوديو رئيسي معتمد من GearBeat', 'flagship_kit');

INSERT INTO customer_tiers (level, name_en, name_ar, reward_kit_type) VALUES
(1, 'First Beat', 'أول نبضة', 'welcome_sticker_pack'),
(2, 'Beat Seeker', 'باحث عن الإيقاع', 'merch_kit_1'),
(3, 'Studio Regular', 'زائر الاستوديوهات', 'merch_kit_2'),
(4, 'Pro Creator', 'مبدع محترف', 'merch_kit_3'),
(5, 'GearBeat Insider', 'عضو GearBeat الخاص', 'insider_luxury_kit');

-- RLS POLICIES
ALTER TABLE studio_tiers ENABLE ROW LEVEL SECURITY;
ALTER TABLE customer_tiers ENABLE ROW LEVEL SECURITY;
ALTER TABLE vendor_tiers ENABLE ROW LEVEL SECURITY;
ALTER TABLE certified_studios ENABLE ROW LEVEL SECURITY;
ALTER TABLE merch_kits ENABLE ROW LEVEL SECURITY;
ALTER TABLE merch_fulfillment_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE pr_campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE creator_seeding ENABLE ROW LEVEL SECURITY;
ALTER TABLE media_coverage ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read for tiers" ON studio_tiers FOR SELECT USING (true);
CREATE POLICY "Public read for customer tiers" ON customer_tiers FOR SELECT USING (true);
CREATE POLICY "Public read for certified studios" ON certified_studios FOR SELECT USING (true);
CREATE POLICY "Admin full access for certified studios" ON certified_studios FOR ALL USING (EXISTS (SELECT 1 FROM auth.users WHERE id = auth.uid() AND raw_user_meta_data->>'role' = 'admin'));

-- INDEXES
CREATE INDEX idx_certified_studios_studio ON certified_studios(studio_id);
CREATE INDEX idx_merch_fulfillment_user ON merch_fulfillment_orders(user_id);
CREATE INDEX idx_merch_fulfillment_studio ON merch_fulfillment_orders(studio_id);
CREATE INDEX idx_creator_seeding_campaign ON creator_seeding(campaign_id);
CREATE INDEX idx_media_coverage_campaign ON media_coverage(campaign_id);
