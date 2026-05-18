-- ============================================================================
-- GEARBEAT PATCH 123P: FORWARD FOUNDATION COLUMN BACKFILL MIGRATION
-- ============================================================================
-- Description: Forward-only additive migration ensuring missing compatibility columns 
--              and downstream index elements exist on historical remote schemas
--              where original bootstrap migrations were already applied.
-- Safety:      - Strict ADDITIVE statements only (ALTER TABLE IF EXISTS ADD COLUMN IF NOT EXISTS).
--              - Zero destructive mutations (NO DROP, NO TRUNCATE, NO DELETE).
-- ============================================================================

-- ============================================================================
-- 1. Profiles Table Column Backfill
-- ============================================================================
ALTER TABLE IF EXISTS public.profiles ADD COLUMN IF NOT EXISTS auth_user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE IF EXISTS public.profiles ADD COLUMN IF NOT EXISTS email text;
ALTER TABLE IF EXISTS public.profiles ADD COLUMN IF NOT EXISTS full_name text;
ALTER TABLE IF EXISTS public.profiles ADD COLUMN IF NOT EXISTS phone text;
ALTER TABLE IF EXISTS public.profiles ADD COLUMN IF NOT EXISTS role text DEFAULT 'customer';
ALTER TABLE IF EXISTS public.profiles ADD COLUMN IF NOT EXISTS created_at timestamptz DEFAULT now();
ALTER TABLE IF EXISTS public.profiles ADD COLUMN IF NOT EXISTS updated_at timestamptz DEFAULT now();
ALTER TABLE IF EXISTS public.profiles ADD COLUMN IF NOT EXISTS phone_verified boolean DEFAULT false;
ALTER TABLE IF EXISTS public.profiles ADD COLUMN IF NOT EXISTS email_verified boolean DEFAULT false;
ALTER TABLE IF EXISTS public.profiles ADD COLUMN IF NOT EXISTS identity_verification_status text DEFAULT 'not_started';
ALTER TABLE IF EXISTS public.profiles ADD COLUMN IF NOT EXISTS identity_type text;
ALTER TABLE IF EXISTS public.profiles ADD COLUMN IF NOT EXISTS identity_number text;
ALTER TABLE IF EXISTS public.profiles ADD COLUMN IF NOT EXISTS identity_locked boolean DEFAULT false;
ALTER TABLE IF EXISTS public.profiles ADD COLUMN IF NOT EXISTS identity_created_at timestamptz;
ALTER TABLE IF EXISTS public.profiles ADD COLUMN IF NOT EXISTS account_status text DEFAULT 'active';
ALTER TABLE IF EXISTS public.profiles ADD COLUMN IF NOT EXISTS deletion_requested_at timestamptz;
ALTER TABLE IF EXISTS public.profiles ADD COLUMN IF NOT EXISTS deleted_at timestamptz;
ALTER TABLE IF EXISTS public.profiles ADD COLUMN IF NOT EXISTS deleted_reason text;
ALTER TABLE IF EXISTS public.profiles ADD COLUMN IF NOT EXISTS country_code text;
ALTER TABLE IF EXISTS public.profiles ADD COLUMN IF NOT EXISTS phone_country_code text;
ALTER TABLE IF EXISTS public.profiles ADD COLUMN IF NOT EXISTS phone_e164 text;
ALTER TABLE IF EXISTS public.profiles ADD COLUMN IF NOT EXISTS membership_number text;
ALTER TABLE IF EXISTS public.profiles ADD COLUMN IF NOT EXISTS referral_code text;
ALTER TABLE IF EXISTS public.profiles ADD COLUMN IF NOT EXISTS referred_by_code text;
ALTER TABLE IF EXISTS public.profiles ADD COLUMN IF NOT EXISTS preferred_currency text;
ALTER TABLE IF EXISTS public.profiles ADD COLUMN IF NOT EXISTS preferred_language text DEFAULT 'ar';

-- ============================================================================
-- 2. Admin Users Table Column Backfill
-- ============================================================================
ALTER TABLE IF EXISTS public.admin_users ADD COLUMN IF NOT EXISTS auth_user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE IF EXISTS public.admin_users ADD COLUMN IF NOT EXISTS email text;
ALTER TABLE IF EXISTS public.admin_users ADD COLUMN IF NOT EXISTS full_name text;
ALTER TABLE IF EXISTS public.admin_users ADD COLUMN IF NOT EXISTS role text DEFAULT 'admin';
ALTER TABLE IF EXISTS public.admin_users ADD COLUMN IF NOT EXISTS admin_role text DEFAULT 'admin';
ALTER TABLE IF EXISTS public.admin_users ADD COLUMN IF NOT EXISTS status text DEFAULT 'active';
ALTER TABLE IF EXISTS public.admin_users ADD COLUMN IF NOT EXISTS created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL;
ALTER TABLE IF EXISTS public.admin_users ADD COLUMN IF NOT EXISTS created_at timestamptz DEFAULT now();
ALTER TABLE IF EXISTS public.admin_users ADD COLUMN IF NOT EXISTS updated_at timestamptz DEFAULT now();

-- ============================================================================
-- 3. Studios Table Column Backfill
-- ============================================================================
ALTER TABLE IF EXISTS public.studios ADD COLUMN IF NOT EXISTS owner_auth_user_id uuid;
ALTER TABLE IF EXISTS public.studios ADD COLUMN IF NOT EXISTS name text;
ALTER TABLE IF EXISTS public.studios ADD COLUMN IF NOT EXISTS name_en text;
ALTER TABLE IF EXISTS public.studios ADD COLUMN IF NOT EXISTS name_ar text;
ALTER TABLE IF EXISTS public.studios ADD COLUMN IF NOT EXISTS title text;
ALTER TABLE IF EXISTS public.studios ADD COLUMN IF NOT EXISTS slug text;
ALTER TABLE IF EXISTS public.studios ADD COLUMN IF NOT EXISTS city text;
ALTER TABLE IF EXISTS public.studios ADD COLUMN IF NOT EXISTS district text;
ALTER TABLE IF EXISTS public.studios ADD COLUMN IF NOT EXISTS address text;
ALTER TABLE IF EXISTS public.studios ADD COLUMN IF NOT EXISTS description text;
ALTER TABLE IF EXISTS public.studios ADD COLUMN IF NOT EXISTS description_en text;
ALTER TABLE IF EXISTS public.studios ADD COLUMN IF NOT EXISTS description_ar text;
ALTER TABLE IF EXISTS public.studios ADD COLUMN IF NOT EXISTS price_from numeric DEFAULT 0;
ALTER TABLE IF EXISTS public.studios ADD COLUMN IF NOT EXISTS status text DEFAULT 'approved';
ALTER TABLE IF EXISTS public.studios ADD COLUMN IF NOT EXISTS verified boolean DEFAULT false;
ALTER TABLE IF EXISTS public.studios ADD COLUMN IF NOT EXISTS cover_image_url text;
ALTER TABLE IF EXISTS public.studios ADD COLUMN IF NOT EXISTS created_at timestamptz DEFAULT now();
ALTER TABLE IF EXISTS public.studios ADD COLUMN IF NOT EXISTS updated_at timestamptz DEFAULT now();
ALTER TABLE IF EXISTS public.studios ADD COLUMN IF NOT EXISTS google_maps_url text;
ALTER TABLE IF EXISTS public.studios ADD COLUMN IF NOT EXISTS google_reviews_url text;
ALTER TABLE IF EXISTS public.studios ADD COLUMN IF NOT EXISTS google_place_id text;
ALTER TABLE IF EXISTS public.studios ADD COLUMN IF NOT EXISTS google_rating numeric;
ALTER TABLE IF EXISTS public.studios ADD COLUMN IF NOT EXISTS google_user_ratings_total integer;
ALTER TABLE IF EXISTS public.studios ADD COLUMN IF NOT EXISTS google_rating_last_synced_at timestamptz;
ALTER TABLE IF EXISTS public.studios ADD COLUMN IF NOT EXISTS tripadvisor_url text;
ALTER TABLE IF EXISTS public.studios ADD COLUMN IF NOT EXISTS tripadvisor_rating numeric;
ALTER TABLE IF EXISTS public.studios ADD COLUMN IF NOT EXISTS tripadvisor_reviews_total integer;
ALTER TABLE IF EXISTS public.studios ADD COLUMN IF NOT EXISTS tripadvisor_rating_last_synced_at timestamptz;
ALTER TABLE IF EXISTS public.studios ADD COLUMN IF NOT EXISTS booking_enabled boolean DEFAULT false;
ALTER TABLE IF EXISTS public.studios ADD COLUMN IF NOT EXISTS owner_compliance_required boolean DEFAULT true;
ALTER TABLE IF EXISTS public.studios ADD COLUMN IF NOT EXISTS owner_compliance_status text DEFAULT 'incomplete';
ALTER TABLE IF EXISTS public.studios ADD COLUMN IF NOT EXISTS is_featured boolean DEFAULT false;
ALTER TABLE IF EXISTS public.studios ADD COLUMN IF NOT EXISTS completion_score integer DEFAULT 0;
ALTER TABLE IF EXISTS public.studios ADD COLUMN IF NOT EXISTS country_code text;
ALTER TABLE IF EXISTS public.studios ADD COLUMN IF NOT EXISTS city_id uuid;
ALTER TABLE IF EXISTS public.studios ADD COLUMN IF NOT EXISTS city_name text;
ALTER TABLE IF EXISTS public.studios ADD COLUMN IF NOT EXISTS address_line text;
ALTER TABLE IF EXISTS public.studios ADD COLUMN IF NOT EXISTS latitude numeric;
ALTER TABLE IF EXISTS public.studios ADD COLUMN IF NOT EXISTS longitude numeric;
ALTER TABLE IF EXISTS public.studios ADD COLUMN IF NOT EXISTS minimum_photos_required integer DEFAULT 6;
ALTER TABLE IF EXISTS public.studios ADD COLUMN IF NOT EXISTS owner_trust_summary text;
ALTER TABLE IF EXISTS public.studios ADD COLUMN IF NOT EXISTS instant_booking_enabled boolean DEFAULT false;
ALTER TABLE IF EXISTS public.studios ADD COLUMN IF NOT EXISTS verified_location boolean DEFAULT false;
ALTER TABLE IF EXISTS public.studios ADD COLUMN IF NOT EXISTS application_id uuid;

-- Downstream/Fallback/Compatibility Columns
ALTER TABLE IF EXISTS public.studios ADD COLUMN IF NOT EXISTS country text;
ALTER TABLE IF EXISTS public.studios ADD COLUMN IF NOT EXISTS owner_id uuid;
ALTER TABLE IF EXISTS public.studios ADD COLUMN IF NOT EXISTS user_id uuid;
ALTER TABLE IF EXISTS public.studios ADD COLUMN IF NOT EXISTS is_active boolean DEFAULT true;
ALTER TABLE IF EXISTS public.studios ADD COLUMN IF NOT EXISTS starting_price numeric DEFAULT 0;
ALTER TABLE IF EXISTS public.studios ADD COLUMN IF NOT EXISTS hourly_rate numeric DEFAULT 0;
ALTER TABLE IF EXISTS public.studios ADD COLUMN IF NOT EXISTS image_url text;

-- ============================================================================
-- 4. Bookings Table Column Backfill
-- ============================================================================
ALTER TABLE IF EXISTS public.bookings ADD COLUMN IF NOT EXISTS studio_id uuid REFERENCES public.studios(id) ON DELETE CASCADE;
ALTER TABLE IF EXISTS public.bookings ADD COLUMN IF NOT EXISTS customer_auth_user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE IF EXISTS public.bookings ADD COLUMN IF NOT EXISTS booking_date date;
ALTER TABLE IF EXISTS public.bookings ADD COLUMN IF NOT EXISTS start_time time without time zone;
ALTER TABLE IF EXISTS public.bookings ADD COLUMN IF NOT EXISTS end_time time without time zone;
ALTER TABLE IF EXISTS public.bookings ADD COLUMN IF NOT EXISTS hours numeric DEFAULT 1;
ALTER TABLE IF EXISTS public.bookings ADD COLUMN IF NOT EXISTS total_amount numeric DEFAULT 0;
ALTER TABLE IF EXISTS public.bookings ADD COLUMN IF NOT EXISTS status text DEFAULT 'pending';
ALTER TABLE IF EXISTS public.bookings ADD COLUMN IF NOT EXISTS payment_status text DEFAULT 'unpaid';
ALTER TABLE IF EXISTS public.bookings ADD COLUMN IF NOT EXISTS notes text;
ALTER TABLE IF EXISTS public.bookings ADD COLUMN IF NOT EXISTS created_at timestamptz DEFAULT now();
ALTER TABLE IF EXISTS public.bookings ADD COLUMN IF NOT EXISTS admin_notes text;
ALTER TABLE IF EXISTS public.bookings ADD COLUMN IF NOT EXISTS admin_notes_updated_at timestamptz;
ALTER TABLE IF EXISTS public.bookings ADD COLUMN IF NOT EXISTS admin_notes_updated_by uuid;
ALTER TABLE IF EXISTS public.bookings ADD COLUMN IF NOT EXISTS settlement_status text DEFAULT 'not_ready';
ALTER TABLE IF EXISTS public.bookings ADD COLUMN IF NOT EXISTS payout_status text DEFAULT 'not_started';
ALTER TABLE IF EXISTS public.bookings ADD COLUMN IF NOT EXISTS payment_required_at timestamptz;
ALTER TABLE IF EXISTS public.bookings ADD COLUMN IF NOT EXISTS paid_at timestamptz;
ALTER TABLE IF EXISTS public.bookings ADD COLUMN IF NOT EXISTS completed_at timestamptz;
ALTER TABLE IF EXISTS public.bookings ADD COLUMN IF NOT EXISTS cancelled_at timestamptz;
ALTER TABLE IF EXISTS public.bookings ADD COLUMN IF NOT EXISTS refund_status text DEFAULT 'none';
ALTER TABLE IF EXISTS public.bookings ADD COLUMN IF NOT EXISTS platform_payment_id uuid;
ALTER TABLE IF EXISTS public.bookings ADD COLUMN IF NOT EXISTS payment_provider text;
ALTER TABLE IF EXISTS public.bookings ADD COLUMN IF NOT EXISTS payment_method text;
ALTER TABLE IF EXISTS public.bookings ADD COLUMN IF NOT EXISTS checkout_session_id uuid;
ALTER TABLE IF EXISTS public.bookings ADD COLUMN IF NOT EXISTS payment_transaction_id uuid;
ALTER TABLE IF EXISTS public.bookings ADD COLUMN IF NOT EXISTS provider_checkout_id text;
ALTER TABLE IF EXISTS public.bookings ADD COLUMN IF NOT EXISTS provider_payment_id text;
ALTER TABLE IF EXISTS public.bookings ADD COLUMN IF NOT EXISTS installment_provider text;
ALTER TABLE IF EXISTS public.bookings ADD COLUMN IF NOT EXISTS coupon_id uuid;
ALTER TABLE IF EXISTS public.bookings ADD COLUMN IF NOT EXISTS coupon_code text;
ALTER TABLE IF EXISTS public.bookings ADD COLUMN IF NOT EXISTS coupon_discount_amount numeric DEFAULT 0;
ALTER TABLE IF EXISTS public.bookings ADD COLUMN IF NOT EXISTS wallet_credit_used numeric DEFAULT 0;
ALTER TABLE IF EXISTS public.bookings ADD COLUMN IF NOT EXISTS loyalty_points_earned integer DEFAULT 0;
ALTER TABLE IF EXISTS public.bookings ADD COLUMN IF NOT EXISTS loyalty_points_redeemed integer DEFAULT 0;
ALTER TABLE IF EXISTS public.bookings ADD COLUMN IF NOT EXISTS auth_user_id uuid;
ALTER TABLE IF EXISTS public.bookings ADD COLUMN IF NOT EXISTS owner_auth_user_id uuid;
ALTER TABLE IF EXISTS public.bookings ADD COLUMN IF NOT EXISTS booking_number text;
ALTER TABLE IF EXISTS public.bookings ADD COLUMN IF NOT EXISTS customer_name text;
ALTER TABLE IF EXISTS public.bookings ADD COLUMN IF NOT EXISTS customer_email text;
ALTER TABLE IF EXISTS public.bookings ADD COLUMN IF NOT EXISTS duration_hours numeric DEFAULT 1;
ALTER TABLE IF EXISTS public.bookings ADD COLUMN IF NOT EXISTS subtotal_amount numeric DEFAULT 0;
ALTER TABLE IF EXISTS public.bookings ADD COLUMN IF NOT EXISTS discount_amount numeric DEFAULT 0;
ALTER TABLE IF EXISTS public.bookings ADD COLUMN IF NOT EXISTS currency_code text DEFAULT 'SAR';
ALTER TABLE IF EXISTS public.bookings ADD COLUMN IF NOT EXISTS metadata jsonb DEFAULT '{}'::jsonb;
ALTER TABLE IF EXISTS public.bookings ADD COLUMN IF NOT EXISTS updated_at timestamptz DEFAULT now();
ALTER TABLE IF EXISTS public.bookings ADD COLUMN IF NOT EXISTS owner_notes text;
ALTER TABLE IF EXISTS public.bookings ADD COLUMN IF NOT EXISTS status_changed_at timestamptz;
ALTER TABLE IF EXISTS public.bookings ADD COLUMN IF NOT EXISTS status_changed_by uuid;
ALTER TABLE IF EXISTS public.bookings ADD COLUMN IF NOT EXISTS owner_decision_at timestamptz;

-- ============================================================================
-- 5. Loyalty Tiers Table Column Backfill
-- ============================================================================
ALTER TABLE IF EXISTS public.loyalty_tiers ADD COLUMN IF NOT EXISTS name_en text;
ALTER TABLE IF EXISTS public.loyalty_tiers ADD COLUMN IF NOT EXISTS name_ar text;
ALTER TABLE IF EXISTS public.loyalty_tiers ADD COLUMN IF NOT EXISTS min_points integer DEFAULT 0;
ALTER TABLE IF EXISTS public.loyalty_tiers ADD COLUMN IF NOT EXISTS min_lifetime_spend decimal(12,2) DEFAULT 0.00;
ALTER TABLE IF EXISTS public.loyalty_tiers ADD COLUMN IF NOT EXISTS earn_multiplier decimal(4,2) DEFAULT 1.0;
ALTER TABLE IF EXISTS public.loyalty_tiers ADD COLUMN IF NOT EXISTS redemption_cap_percent integer DEFAULT 100;
ALTER TABLE IF EXISTS public.loyalty_tiers ADD COLUMN IF NOT EXISTS sort_order integer DEFAULT 0;
ALTER TABLE IF EXISTS public.loyalty_tiers ADD COLUMN IF NOT EXISTS is_active boolean DEFAULT true;
ALTER TABLE IF EXISTS public.loyalty_tiers ADD COLUMN IF NOT EXISTS created_at timestamptz DEFAULT now();

-- ============================================================================
-- 6. Customer Wallets Table Column Backfill
-- ============================================================================
ALTER TABLE IF EXISTS public.customer_wallets ADD COLUMN IF NOT EXISTS auth_user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE IF EXISTS public.customer_wallets ADD COLUMN IF NOT EXISTS membership_number text;
ALTER TABLE IF EXISTS public.customer_wallets ADD COLUMN IF NOT EXISTS tier_code text DEFAULT 'listener' REFERENCES public.loyalty_tiers(code);
ALTER TABLE IF EXISTS public.customer_wallets ADD COLUMN IF NOT EXISTS points_balance integer DEFAULT 0;
ALTER TABLE IF EXISTS public.customer_wallets ADD COLUMN IF NOT EXISTS pending_points integer DEFAULT 0;
ALTER TABLE IF EXISTS public.customer_wallets ADD COLUMN IF NOT EXISTS wallet_balance decimal(12,2) DEFAULT 0.00;
ALTER TABLE IF EXISTS public.customer_wallets ADD COLUMN IF NOT EXISTS currency_code text DEFAULT 'SAR';
ALTER TABLE IF EXISTS public.customer_wallets ADD COLUMN IF NOT EXISTS lifetime_points integer DEFAULT 0;
ALTER TABLE IF EXISTS public.customer_wallets ADD COLUMN IF NOT EXISTS lifetime_spend decimal(12,2) DEFAULT 0.00;
ALTER TABLE IF EXISTS public.customer_wallets ADD COLUMN IF NOT EXISTS referral_code text;
ALTER TABLE IF EXISTS public.customer_wallets ADD COLUMN IF NOT EXISTS membership_card_status text DEFAULT 'active';
ALTER TABLE IF EXISTS public.customer_wallets ADD COLUMN IF NOT EXISTS card_style_code text DEFAULT 'default';
ALTER TABLE IF EXISTS public.customer_wallets ADD COLUMN IF NOT EXISTS joined_at timestamptz DEFAULT now();
ALTER TABLE IF EXISTS public.customer_wallets ADD COLUMN IF NOT EXISTS created_at timestamptz DEFAULT now();
ALTER TABLE IF EXISTS public.customer_wallets ADD COLUMN IF NOT EXISTS updated_at timestamptz DEFAULT now();

-- ============================================================================
-- 7. Loyalty Points Ledger Table Column Backfill
-- ============================================================================
ALTER TABLE IF EXISTS public.loyalty_points_ledger ADD COLUMN IF NOT EXISTS auth_user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE IF EXISTS public.loyalty_points_ledger ADD COLUMN IF NOT EXISTS event_type text;
ALTER TABLE IF EXISTS public.loyalty_points_ledger ADD COLUMN IF NOT EXISTS source_type text;
ALTER TABLE IF EXISTS public.loyalty_points_ledger ADD COLUMN IF NOT EXISTS source_id text;
ALTER TABLE IF EXISTS public.loyalty_points_ledger ADD COLUMN IF NOT EXISTS points integer;
ALTER TABLE IF EXISTS public.loyalty_points_ledger ADD COLUMN IF NOT EXISTS status text DEFAULT 'posted';
ALTER TABLE IF EXISTS public.loyalty_points_ledger ADD COLUMN IF NOT EXISTS description text;
ALTER TABLE IF EXISTS public.loyalty_points_ledger ADD COLUMN IF NOT EXISTS amount_basis decimal(12,2) DEFAULT 0.00;
ALTER TABLE IF EXISTS public.loyalty_points_ledger ADD COLUMN IF NOT EXISTS created_at timestamptz DEFAULT now();
ALTER TABLE IF EXISTS public.loyalty_points_ledger ADD COLUMN IF NOT EXISTS reason text;

-- ============================================================================
-- 8. Marketplace Products Table Column Backfill
-- ============================================================================
ALTER TABLE IF EXISTS public.marketplace_products ADD COLUMN IF NOT EXISTS vendor_id uuid;
ALTER TABLE IF EXISTS public.marketplace_products ADD COLUMN IF NOT EXISTS category_id uuid;
ALTER TABLE IF EXISTS public.marketplace_products ADD COLUMN IF NOT EXISTS brand_id uuid;
ALTER TABLE IF EXISTS public.marketplace_products ADD COLUMN IF NOT EXISTS name_en text;
ALTER TABLE IF EXISTS public.marketplace_products ADD COLUMN IF NOT EXISTS name_ar text;
ALTER TABLE IF EXISTS public.marketplace_products ADD COLUMN IF NOT EXISTS slug text;
ALTER TABLE IF EXISTS public.marketplace_products ADD COLUMN IF NOT EXISTS description_en text;
ALTER TABLE IF EXISTS public.marketplace_products ADD COLUMN IF NOT EXISTS description_ar text;
ALTER TABLE IF EXISTS public.marketplace_products ADD COLUMN IF NOT EXISTS short_description_en text;
ALTER TABLE IF EXISTS public.marketplace_products ADD COLUMN IF NOT EXISTS short_description_ar text;
ALTER TABLE IF EXISTS public.marketplace_products ADD COLUMN IF NOT EXISTS base_price numeric DEFAULT 0.00;
ALTER TABLE IF EXISTS public.marketplace_products ADD COLUMN IF NOT EXISTS currency text DEFAULT 'SAR';
ALTER TABLE IF EXISTS public.marketplace_products ADD COLUMN IF NOT EXISTS status text DEFAULT 'pending_review';
ALTER TABLE IF EXISTS public.marketplace_products ADD COLUMN IF NOT EXISTS is_featured boolean DEFAULT false;
ALTER TABLE IF EXISTS public.marketplace_products ADD COLUMN IF NOT EXISTS tags text[];
ALTER TABLE IF EXISTS public.marketplace_products ADD COLUMN IF NOT EXISTS meta_title text;
ALTER TABLE IF EXISTS public.marketplace_products ADD COLUMN IF NOT EXISTS meta_description text;
ALTER TABLE IF EXISTS public.marketplace_products ADD COLUMN IF NOT EXISTS sku text;
ALTER TABLE IF EXISTS public.marketplace_products ADD COLUMN IF NOT EXISTS sale_price numeric;
ALTER TABLE IF EXISTS public.marketplace_products ADD COLUMN IF NOT EXISTS stock_quantity integer DEFAULT 0;
ALTER TABLE IF EXISTS public.marketplace_products ADD COLUMN IF NOT EXISTS currency_code text DEFAULT 'SAR';
ALTER TABLE IF EXISTS public.marketplace_products ADD COLUMN IF NOT EXISTS is_active boolean DEFAULT true;
ALTER TABLE IF EXISTS public.marketplace_products ADD COLUMN IF NOT EXISTS images jsonb DEFAULT '[]'::jsonb;
ALTER TABLE IF EXISTS public.marketplace_products ADD COLUMN IF NOT EXISTS specifications jsonb DEFAULT '{}'::jsonb;
ALTER TABLE IF EXISTS public.marketplace_products ADD COLUMN IF NOT EXISTS created_at timestamptz DEFAULT now();
ALTER TABLE IF EXISTS public.marketplace_products ADD COLUMN IF NOT EXISTS updated_at timestamptz DEFAULT now();

-- ============================================================================
-- 9. Marketplace Orders Table Column Backfill
-- ============================================================================
ALTER TABLE IF EXISTS public.marketplace_orders ADD COLUMN IF NOT EXISTS customer_auth_user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE IF EXISTS public.marketplace_orders ADD COLUMN IF NOT EXISTS order_number text;
ALTER TABLE IF EXISTS public.marketplace_orders ADD COLUMN IF NOT EXISTS subtotal_amount numeric;
ALTER TABLE IF EXISTS public.marketplace_orders ADD COLUMN IF NOT EXISTS tax_amount numeric DEFAULT 0.00;
ALTER TABLE IF EXISTS public.marketplace_orders ADD COLUMN IF NOT EXISTS shipping_amount numeric DEFAULT 0.00;
ALTER TABLE IF EXISTS public.marketplace_orders ADD COLUMN IF NOT EXISTS total_amount numeric;
ALTER TABLE IF EXISTS public.marketplace_orders ADD COLUMN IF NOT EXISTS currency text DEFAULT 'SAR';
ALTER TABLE IF EXISTS public.marketplace_orders ADD COLUMN IF NOT EXISTS status text DEFAULT 'draft';
ALTER TABLE IF EXISTS public.marketplace_orders ADD COLUMN IF NOT EXISTS payment_status text DEFAULT 'unpaid';
ALTER TABLE IF EXISTS public.marketplace_orders ADD COLUMN IF NOT EXISTS shipping_address_id uuid;
ALTER TABLE IF EXISTS public.marketplace_orders ADD COLUMN IF NOT EXISTS shipping_method text;
ALTER TABLE IF EXISTS public.marketplace_orders ADD COLUMN IF NOT EXISTS tracking_number text;
ALTER TABLE IF EXISTS public.marketplace_orders ADD COLUMN IF NOT EXISTS settlement_status text DEFAULT 'pending';
ALTER TABLE IF EXISTS public.marketplace_orders ADD COLUMN IF NOT EXISTS payout_status text DEFAULT 'pending';
ALTER TABLE IF EXISTS public.marketplace_orders ADD COLUMN IF NOT EXISTS paid_at timestamptz;
ALTER TABLE IF EXISTS public.marketplace_orders ADD COLUMN IF NOT EXISTS shipped_at timestamptz;
ALTER TABLE IF EXISTS public.marketplace_orders ADD COLUMN IF NOT EXISTS delivered_at timestamptz;
ALTER TABLE IF EXISTS public.marketplace_orders ADD COLUMN IF NOT EXISTS payment_provider text;
ALTER TABLE IF EXISTS public.marketplace_orders ADD COLUMN IF NOT EXISTS payment_method text;
ALTER TABLE IF EXISTS public.marketplace_orders ADD COLUMN IF NOT EXISTS installment_provider text;
ALTER TABLE IF EXISTS public.marketplace_orders ADD COLUMN IF NOT EXISTS provider_checkout_id text;
ALTER TABLE IF EXISTS public.marketplace_orders ADD COLUMN IF NOT EXISTS provider_payment_id text;
ALTER TABLE IF EXISTS public.marketplace_orders ADD COLUMN IF NOT EXISTS coupon_id uuid;
ALTER TABLE IF EXISTS public.marketplace_orders ADD COLUMN IF NOT EXISTS coupon_discount_amount numeric DEFAULT 0;
ALTER TABLE IF EXISTS public.marketplace_orders ADD COLUMN IF NOT EXISTS wallet_credit_used numeric DEFAULT 0;
ALTER TABLE IF EXISTS public.marketplace_orders ADD COLUMN IF NOT EXISTS loyalty_points_earned integer DEFAULT 0;
ALTER TABLE IF EXISTS public.marketplace_orders ADD COLUMN IF NOT EXISTS loyalty_points_redeemed integer DEFAULT 0;
ALTER TABLE IF EXISTS public.marketplace_orders ADD COLUMN IF NOT EXISTS checkout_session_id uuid;
ALTER TABLE IF EXISTS public.marketplace_orders ADD COLUMN IF NOT EXISTS payment_transaction_id uuid;
ALTER TABLE IF EXISTS public.marketplace_orders ADD COLUMN IF NOT EXISTS coupon_code text;
ALTER TABLE IF EXISTS public.marketplace_orders ADD COLUMN IF NOT EXISTS auth_user_id uuid;
ALTER TABLE IF EXISTS public.marketplace_orders ADD COLUMN IF NOT EXISTS customer_name text;
ALTER TABLE IF EXISTS public.marketplace_orders ADD COLUMN IF NOT EXISTS customer_email text;
ALTER TABLE IF EXISTS public.marketplace_orders ADD COLUMN IF NOT EXISTS discount_amount numeric DEFAULT 0;
ALTER TABLE IF EXISTS public.marketplace_orders ADD COLUMN IF NOT EXISTS currency_code text DEFAULT 'SAR';
ALTER TABLE IF EXISTS public.marketplace_orders ADD COLUMN IF NOT EXISTS metadata jsonb DEFAULT '{}'::jsonb;
ALTER TABLE IF EXISTS public.marketplace_orders ADD COLUMN IF NOT EXISTS created_at timestamptz DEFAULT now();
ALTER TABLE IF EXISTS public.marketplace_orders ADD COLUMN IF NOT EXISTS updated_at timestamptz DEFAULT now();

-- ============================================================================
-- 10. Downstream Safe Index Setup (executed only AFTER columns are backfilled)
-- ============================================================================
CREATE INDEX IF NOT EXISTS idx_studios_name_en ON public.studios(name_en);
CREATE INDEX IF NOT EXISTS idx_studios_slug ON public.studios(slug);
CREATE INDEX IF NOT EXISTS idx_studios_status ON public.studios(status);
CREATE INDEX IF NOT EXISTS idx_studios_owner_id ON public.studios(owner_id);
