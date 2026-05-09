-- Patch 46D2: RPC Booking Status Harmonization
-- This migration updates the atomic booking RPC to harmonize conflict detection statuses.
-- It removes the invalid 'paid' status and adds 'completed' for historical integrity,
-- as well as 'pending_review' and 'pending_owner_review' for consistency with UI locks.

CREATE OR REPLACE FUNCTION public.create_studio_booking_v1(
  p_studio_id UUID,
  p_auth_user_id UUID,
  p_booking_date DATE,
  p_start_time TIME,
  p_end_time TIME,
  p_duration_hours NUMERIC,
  p_hourly_price NUMERIC,
  p_total_amount NUMERIC,
  p_booking_number TEXT,
  p_customer_name TEXT,
  p_customer_email TEXT,
  p_owner_auth_user_id UUID,
  p_notes TEXT,
  p_metadata JSONB,
  p_currency_code TEXT DEFAULT 'SAR'
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_booking_id UUID;
  v_conflict_id UUID;
BEGIN
  -- Validate time range
  IF p_start_time >= p_end_time THEN
    RETURN jsonb_build_object('ok', false, 'error', 'INVALID_RANGE', 'message', 'Start time must be before end time.');
  END IF;

  -- 1. Acquire an advisory lock for this studio and date to serialize booking attempts
  PERFORM pg_advisory_xact_lock(hashtext(p_studio_id::text), hashtext(p_booking_date::text));

  -- 2. Check for overlapping bookings in blocking statuses
  -- Updated list includes soft-locks and historical completion; removes invalid 'paid' status.
  SELECT id INTO v_conflict_id
  FROM public.bookings
  WHERE studio_id = p_studio_id
    AND booking_date = p_booking_date
    AND status IN (
      'pending_payment',
      'pending',
      'pending_review',
      'pending_owner_review',
      'accepted',
      'confirmed',
      'completed'
    )
    AND start_time < p_end_time
    AND end_time > p_start_time
  LIMIT 1;

  IF v_conflict_id IS NOT NULL THEN
    RETURN jsonb_build_object(
      'ok', false, 
      'error', 'CONFLICT', 
      'message', 'This studio is already booked for the selected time.',
      'conflict_id', v_conflict_id
    );
  END IF;

  -- 3. Insert the booking
  INSERT INTO public.bookings (
    auth_user_id,
    customer_auth_user_id,
    studio_id,
    owner_auth_user_id,
    booking_number,
    customer_name,
    customer_email,
    booking_date,
    start_time,
    end_time,
    duration_hours,
    status,
    payment_status,
    subtotal_amount,
    discount_amount,
    coupon_discount_amount,
    wallet_credit_used,
    loyalty_points_redeemed,
    total_amount,
    currency_code,
    notes,
    metadata,
    created_at,
    updated_at
  ) VALUES (
    p_auth_user_id,
    p_auth_user_id, -- customer_auth_user_id
    p_studio_id,
    p_owner_auth_user_id,
    p_booking_number,
    p_customer_name,
    p_customer_email,
    p_booking_date,
    p_start_time,
    p_end_time,
    p_duration_hours,
    'pending_payment',
    'unpaid',
    p_total_amount,
    0, -- discount_amount
    0, -- coupon_discount_amount
    0, -- wallet_credit_used
    0, -- loyalty_points_redeemed
    p_total_amount,
    p_currency_code,
    p_notes,
    p_metadata,
    now(),
    now()
  ) RETURNING id INTO v_booking_id;

  RETURN jsonb_build_object(
    'ok', true, 
    'booking_id', v_booking_id,
    'booking_number', p_booking_number
  );

EXCEPTION WHEN OTHERS THEN
  RETURN jsonb_build_object(
    'ok', false, 
    'error', 'INTERNAL_ERROR', 
    'message', SQLERRM
  );
END;
$$;
