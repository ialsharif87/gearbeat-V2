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
