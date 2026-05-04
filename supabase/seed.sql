-- GEARBEAT SEED DATA
-- Purpose: Seed a test studio and availability rules for full booking flow testing.
-- HOW TO USE: Replace 'YOUR-AUTH-USER-ID' with a real user ID from Supabase Auth > Users before running.

DO $$
DECLARE
    v_studio_id UUID;
    v_owner_id UUID := '00000000-0000-0000-0000-000000000000'; -- REPLACE WITH REAL AUTH USER ID BEFORE RUNNING
BEGIN
    -- Step 1: Insert test studio
    INSERT INTO public.studios (
        name_en,
        name_ar,
        slug,
        city,
        city_name,
        district,
        price_from,
        hourly_rate,
        status,
        verified,
        booking_enabled,
        instant_booking_enabled,
        owner_compliance_status,
        cover_image_url,
        completion_score,
        owner_auth_user_id,
        created_at,
        updated_at
    ) VALUES (
        'Studio One Riyadh',
        'استوديو ون الرياض',
        'studio-one-riyadh',
        'Riyadh',
        'Riyadh',
        'Al Olaya',
        300.00,
        300.00,
        'approved',
        true,
        true,
        true,
        'approved',
        'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=800',
        90,
        v_owner_id,
        NOW(),
        NOW()
    )
    RETURNING id INTO v_studio_id;

    -- Step 2: Insert availability rules for all 7 days (0 = Sunday, 6 = Saturday)
    INSERT INTO public.studio_availability_rules (
        studio_id,
        day_of_week,
        is_open,
        open_time,
        close_time,
        slot_minutes,
        buffer_minutes,
        created_at,
        updated_at
    )
    VALUES
        (v_studio_id, 0, true, '09:00', '22:00', 60, 0, NOW(), NOW()),
        (v_studio_id, 1, true, '09:00', '22:00', 60, 0, NOW(), NOW()),
        (v_studio_id, 2, true, '09:00', '22:00', 60, 0, NOW(), NOW()),
        (v_studio_id, 3, true, '09:00', '22:00', 60, 0, NOW(), NOW()),
        (v_studio_id, 4, true, '09:00', '22:00', 60, 0, NOW(), NOW()),
        (v_studio_id, 5, true, '09:00', '22:00', 60, 0, NOW(), NOW()),
        (v_studio_id, 6, true, '09:00', '22:00', 60, 0, NOW(), NOW());

    RAISE NOTICE 'Seed completed: Test studio created with ID %', v_studio_id;
END $$;

-- BOOST SYSTEM V2
CREATE TABLE IF NOT EXISTS studio_boost_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  studio_id UUID NOT NULL REFERENCES studios(id) ON DELETE CASCADE,
  owner_auth_user_id UUID NOT NULL,
  base_commission_percent DECIMAL(5,2) NOT NULL DEFAULT 15.00,
  boost_commission_percent DECIMAL(5,2) NOT NULL DEFAULT 0.00,
  total_commission_percent DECIMAL(5,2) GENERATED ALWAYS AS 
    (base_commission_percent + boost_commission_percent) STORED,
  duration_days INTEGER NOT NULL CHECK (duration_days IN (7, 14, 30)),
  starts_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  ends_at TIMESTAMPTZ GENERATED ALWAYS AS 
    (starts_at + (duration_days || ' days')::INTERVAL) STORED,
  status TEXT DEFAULT 'active' 
    CHECK (status IN ('active', 'expired', 'cancelled')),
  terms_accepted BOOLEAN DEFAULT false,
  terms_accepted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE studio_boost_subscriptions ENABLE ROW LEVEL SECURITY;

-- Note: In a real migration these would be separate, but adding here for dev parity
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Owner can manage own boosts') THEN
    CREATE POLICY "Owner can manage own boosts" 
    ON studio_boost_subscriptions FOR ALL 
    USING (owner_auth_user_id = auth.uid());
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Public can read active boosts') THEN
    CREATE POLICY "Public can read active boosts"
    ON studio_boost_subscriptions FOR SELECT
    USING (status = 'active' AND ends_at > NOW());
  END IF;
END $$;

-- Ensure provider_leads has the contract column
ALTER TABLE provider_leads 
ADD COLUMN IF NOT EXISTS signed_contract_url TEXT;
