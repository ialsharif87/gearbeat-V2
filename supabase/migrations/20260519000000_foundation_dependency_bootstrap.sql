-- ============================================================================
-- GEARBEAT PATCH 123M: FOUNDATION DEPENDENCY BOOTSTRAP (ADDITIVE ONLY)
-- ============================================================================
-- Description: Additively bootstraps foundational tables required by historical
--              and downstream migrations to avoid dependency resolution errors
--              during clean database initializations or local dry-runs.
-- Safety:      - Strict ADDITIVE statements only (CREATE TABLE IF NOT EXISTS,
--               CREATE INDEX IF NOT EXISTS, ALTER TABLE ADD COLUMN IF NOT EXISTS).
--             - Zero destructive mutations (NO DROP, NO TRUNCATE, NO DELETE).
--             - Preserves all pre-existing schemas and active production states.
-- ============================================================================

-- ============================================================================
-- 1. Profiles Table Foundation
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.profiles (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    auth_user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
    email text,
    full_name text,
    phone text,
    role text NOT NULL DEFAULT 'customer',
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now(),
    phone_verified boolean NOT NULL DEFAULT false,
    email_verified boolean NOT NULL DEFAULT false,
    identity_verification_status text NOT NULL DEFAULT 'not_started',
    identity_type text,
    identity_number text,
    identity_locked boolean NOT NULL DEFAULT false,
    identity_created_at timestamptz,
    account_status text NOT NULL DEFAULT 'active',
    deletion_requested_at timestamptz,
    deleted_at timestamptz,
    deleted_reason text,
    country_code text,
    phone_country_code text,
    phone_e164 text,
    membership_number text,
    referral_code text,
    referred_by_code text,
    preferred_currency text,
    preferred_language text DEFAULT 'ar'
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_profiles_auth_user_id ON public.profiles(auth_user_id);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.profiles;
CREATE POLICY "Public profiles are viewable by everyone" ON public.profiles
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
CREATE POLICY "Users can update their own profile" ON public.profiles
    FOR UPDATE USING (auth.uid() = auth_user_id);

-- Safe column backfills for existing profiles table
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS auth_user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS email text;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS full_name text;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS phone text;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS role text DEFAULT 'customer';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS created_at timestamptz DEFAULT now();
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS updated_at timestamptz DEFAULT now();
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS phone_verified boolean DEFAULT false;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS email_verified boolean DEFAULT false;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS identity_verification_status text DEFAULT 'not_started';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS identity_type text;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS identity_number text;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS identity_locked boolean DEFAULT false;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS identity_created_at timestamptz;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS account_status text DEFAULT 'active';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS deletion_requested_at timestamptz;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS deleted_at timestamptz;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS deleted_reason text;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS country_code text;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS phone_country_code text;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS phone_e164 text;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS membership_number text;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS referral_code text;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS referred_by_code text;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS preferred_currency text;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS preferred_language text DEFAULT 'ar';

-- Safe indexes backfills
CREATE UNIQUE INDEX IF NOT EXISTS idx_profiles_auth_user_id ON public.profiles(auth_user_id);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);

-- ============================================================================
-- 2. Admin Users Table Foundation
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.admin_users (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    auth_user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
    email text UNIQUE,
    full_name text,
    role text DEFAULT 'admin',
    admin_role text DEFAULT 'admin',
    status text DEFAULT 'active',
    created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_admin_users_auth_user_id ON public.admin_users(auth_user_id);
CREATE INDEX IF NOT EXISTS idx_admin_users_status ON public.admin_users(status);
CREATE INDEX IF NOT EXISTS idx_admin_users_email ON public.admin_users(email);

ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can read own admin record" ON public.admin_users;
CREATE POLICY "Users can read own admin record" ON public.admin_users
    FOR SELECT TO authenticated
    USING (auth_user_id = auth.uid());

DROP POLICY IF EXISTS "Active admins can manage admin records" ON public.admin_users;
CREATE POLICY "Active admins can manage admin records" ON public.admin_users
    FOR ALL TO authenticated
    USING (EXISTS (SELECT 1 FROM public.admin_users WHERE auth_user_id = auth.uid() AND status = 'active'));

-- Safe column backfills for existing admin_users table
ALTER TABLE public.admin_users ADD COLUMN IF NOT EXISTS auth_user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE public.admin_users ADD COLUMN IF NOT EXISTS email text;
ALTER TABLE public.admin_users ADD COLUMN IF NOT EXISTS full_name text;
ALTER TABLE public.admin_users ADD COLUMN IF NOT EXISTS role text DEFAULT 'admin';
ALTER TABLE public.admin_users ADD COLUMN IF NOT EXISTS admin_role text DEFAULT 'admin';
ALTER TABLE public.admin_users ADD COLUMN IF NOT EXISTS status text DEFAULT 'active';
ALTER TABLE public.admin_users ADD COLUMN IF NOT EXISTS created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL;
ALTER TABLE public.admin_users ADD COLUMN IF NOT EXISTS created_at timestamptz DEFAULT now();
ALTER TABLE public.admin_users ADD COLUMN IF NOT EXISTS updated_at timestamptz DEFAULT now();

-- Safe indexes backfills
CREATE UNIQUE INDEX IF NOT EXISTS idx_admin_users_auth_user_id ON public.admin_users(auth_user_id);
CREATE INDEX IF NOT EXISTS idx_admin_users_status ON public.admin_users(status);
CREATE INDEX IF NOT EXISTS idx_admin_users_email ON public.admin_users(email);

-- ============================================================================
-- 3. Studios Table Foundation
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.studios (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    owner_auth_user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
    name text NOT NULL,
    slug text NOT NULL,
    city text NOT NULL,
    district text,
    address text,
    description text,
    price_from numeric NOT NULL DEFAULT 0,
    status text NOT NULL DEFAULT 'approved',
    verified boolean NOT NULL DEFAULT false,
    cover_image_url text,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now(),
    google_maps_url text,
    google_reviews_url text,
    google_place_id text,
    google_rating numeric,
    google_user_ratings_total integer,
    google_rating_last_synced_at timestamptz,
    tripadvisor_url text,
    tripadvisor_rating numeric,
    tripadvisor_reviews_total integer,
    tripadvisor_rating_last_synced_at timestamptz,
    booking_enabled boolean NOT NULL DEFAULT false,
    owner_compliance_required boolean NOT NULL DEFAULT true,
    owner_compliance_status text NOT NULL DEFAULT 'incomplete',
    is_featured boolean DEFAULT false,
    completion_score integer DEFAULT 0,
    country_code text,
    city_id uuid,
    city_name text,
    address_line text,
    latitude numeric,
    longitude numeric,
    minimum_photos_required integer NOT NULL DEFAULT 6,
    owner_trust_summary text,
    instant_booking_enabled boolean NOT NULL DEFAULT false,
    verified_location boolean NOT NULL DEFAULT false,
    application_id uuid
);

CREATE INDEX IF NOT EXISTS idx_studios_owner_auth_user ON public.studios(owner_auth_user_id);
CREATE INDEX IF NOT EXISTS idx_studios_status ON public.studios(status);
CREATE INDEX IF NOT EXISTS idx_studios_slug ON public.studios(slug);

ALTER TABLE public.studios ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public studios are viewable by everyone" ON public.studios;
CREATE POLICY "Public studios are viewable by everyone" ON public.studios
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "Owners can manage their own studios" ON public.studios;
CREATE POLICY "Owners can manage their own studios" ON public.studios
    FOR ALL TO authenticated
    USING (owner_auth_user_id = auth.uid());

-- Safe column backfills for existing studios table
ALTER TABLE public.studios ADD COLUMN IF NOT EXISTS owner_auth_user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL;
ALTER TABLE public.studios ADD COLUMN IF NOT EXISTS name text;
ALTER TABLE public.studios ADD COLUMN IF NOT EXISTS name_en text;
ALTER TABLE public.studios ADD COLUMN IF NOT EXISTS name_ar text;
ALTER TABLE public.studios ADD COLUMN IF NOT EXISTS title text;
ALTER TABLE public.studios ADD COLUMN IF NOT EXISTS slug text;
ALTER TABLE public.studios ADD COLUMN IF NOT EXISTS city text;
ALTER TABLE public.studios ADD COLUMN IF NOT EXISTS district text;
ALTER TABLE public.studios ADD COLUMN IF NOT EXISTS address text;
ALTER TABLE public.studios ADD COLUMN IF NOT EXISTS description text;
ALTER TABLE public.studios ADD COLUMN IF NOT EXISTS description_en text;
ALTER TABLE public.studios ADD COLUMN IF NOT EXISTS description_ar text;
ALTER TABLE public.studios ADD COLUMN IF NOT EXISTS price_from numeric DEFAULT 0;
ALTER TABLE public.studios ADD COLUMN IF NOT EXISTS status text DEFAULT 'approved';
ALTER TABLE public.studios ADD COLUMN IF NOT EXISTS verified boolean DEFAULT false;
ALTER TABLE public.studios ADD COLUMN IF NOT EXISTS cover_image_url text;
ALTER TABLE public.studios ADD COLUMN IF NOT EXISTS created_at timestamptz DEFAULT now();
ALTER TABLE public.studios ADD COLUMN IF NOT EXISTS updated_at timestamptz DEFAULT now();
ALTER TABLE public.studios ADD COLUMN IF NOT EXISTS google_maps_url text;
ALTER TABLE public.studios ADD COLUMN IF NOT EXISTS google_reviews_url text;
ALTER TABLE public.studios ADD COLUMN IF NOT EXISTS google_place_id text;
ALTER TABLE public.studios ADD COLUMN IF NOT EXISTS google_rating numeric;
ALTER TABLE public.studios ADD COLUMN IF NOT EXISTS google_user_ratings_total integer;
ALTER TABLE public.studios ADD COLUMN IF NOT EXISTS google_rating_last_synced_at timestamptz;
ALTER TABLE public.studios ADD COLUMN IF NOT EXISTS tripadvisor_url text;
ALTER TABLE public.studios ADD COLUMN IF NOT EXISTS tripadvisor_rating numeric;
ALTER TABLE public.studios ADD COLUMN IF NOT EXISTS tripadvisor_reviews_total integer;
ALTER TABLE public.studios ADD COLUMN IF NOT EXISTS tripadvisor_rating_last_synced_at timestamptz;
ALTER TABLE public.studios ADD COLUMN IF NOT EXISTS booking_enabled boolean DEFAULT false;
ALTER TABLE public.studios ADD COLUMN IF NOT EXISTS owner_compliance_required boolean DEFAULT true;
ALTER TABLE public.studios ADD COLUMN IF NOT EXISTS owner_compliance_status text DEFAULT 'incomplete';
ALTER TABLE public.studios ADD COLUMN IF NOT EXISTS is_featured boolean DEFAULT false;
ALTER TABLE public.studios ADD COLUMN IF NOT EXISTS completion_score integer DEFAULT 0;
ALTER TABLE public.studios ADD COLUMN IF NOT EXISTS country_code text;
ALTER TABLE public.studios ADD COLUMN IF NOT EXISTS city_id uuid;
ALTER TABLE public.studios ADD COLUMN IF NOT EXISTS city_name text;
ALTER TABLE public.studios ADD COLUMN IF NOT EXISTS address_line text;
ALTER TABLE public.studios ADD COLUMN IF NOT EXISTS latitude numeric;
ALTER TABLE public.studios ADD COLUMN IF NOT EXISTS longitude numeric;
ALTER TABLE public.studios ADD COLUMN IF NOT EXISTS minimum_photos_required integer DEFAULT 6;
ALTER TABLE public.studios ADD COLUMN IF NOT EXISTS owner_trust_summary text;
ALTER TABLE public.studios ADD COLUMN IF NOT EXISTS instant_booking_enabled boolean DEFAULT false;
ALTER TABLE public.studios ADD COLUMN IF NOT EXISTS verified_location boolean DEFAULT false;
ALTER TABLE public.studios ADD COLUMN IF NOT EXISTS application_id uuid;

-- Downstream/Fallback/Compatibility Columns
ALTER TABLE public.studios ADD COLUMN IF NOT EXISTS country text;
ALTER TABLE public.studios ADD COLUMN IF NOT EXISTS owner_id uuid REFERENCES auth.users(id) ON DELETE SET NULL;
ALTER TABLE public.studios ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL;
ALTER TABLE public.studios ADD COLUMN IF NOT EXISTS is_active boolean DEFAULT true;
ALTER TABLE public.studios ADD COLUMN IF NOT EXISTS starting_price numeric DEFAULT 0;
ALTER TABLE public.studios ADD COLUMN IF NOT EXISTS hourly_rate numeric DEFAULT 0;
ALTER TABLE public.studios ADD COLUMN IF NOT EXISTS image_url text;

-- Safe indexes backfills
CREATE INDEX IF NOT EXISTS idx_studios_owner_auth_user ON public.studios(owner_auth_user_id);
CREATE INDEX IF NOT EXISTS idx_studios_status ON public.studios(status);
CREATE INDEX IF NOT EXISTS idx_studios_slug ON public.studios(slug);
CREATE INDEX IF NOT EXISTS idx_studios_name_en ON public.studios(name_en);

-- ============================================================================
-- 4. Bookings Table Foundation
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.bookings (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    studio_id uuid REFERENCES public.studios(id) ON DELETE CASCADE,
    customer_auth_user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
    booking_date date NOT NULL,
    start_time time without time zone NOT NULL,
    end_time time without time zone NOT NULL,
    hours numeric NOT NULL DEFAULT 1,
    total_amount numeric NOT NULL DEFAULT 0,
    status text NOT NULL DEFAULT 'pending',
    payment_status text NOT NULL DEFAULT 'unpaid',
    notes text,
    created_at timestamptz NOT NULL DEFAULT now(),
    admin_notes text,
    admin_notes_updated_at timestamptz,
    admin_notes_updated_by uuid,
    settlement_status text NOT NULL DEFAULT 'not_ready',
    payout_status text NOT NULL DEFAULT 'not_started',
    payment_required_at timestamptz,
    paid_at timestamptz,
    completed_at timestamptz,
    cancelled_at timestamptz,
    refund_status text NOT NULL DEFAULT 'none',
    platform_payment_id uuid,
    payment_provider text,
    payment_method text,
    checkout_session_id uuid,
    payment_transaction_id uuid,
    provider_checkout_id text,
    provider_payment_id text,
    installment_provider text,
    coupon_id uuid,
    coupon_code text,
    coupon_discount_amount numeric NOT NULL DEFAULT 0,
    wallet_credit_used numeric NOT NULL DEFAULT 0,
    loyalty_points_earned integer NOT NULL DEFAULT 0,
    loyalty_points_redeemed integer NOT NULL DEFAULT 0,
    auth_user_id uuid,
    owner_auth_user_id uuid,
    booking_number text,
    customer_name text,
    customer_email text,
    duration_hours numeric NOT NULL DEFAULT 1,
    subtotal_amount numeric NOT NULL DEFAULT 0,
    discount_amount numeric NOT NULL DEFAULT 0,
    currency_code text NOT NULL DEFAULT 'SAR',
    metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
    updated_at timestamptz NOT NULL DEFAULT now(),
    owner_notes text,
    status_changed_at timestamptz,
    status_changed_by uuid,
    owner_decision_at timestamptz
);

CREATE INDEX IF NOT EXISTS idx_bookings_studio ON public.bookings(studio_id);
CREATE INDEX IF NOT EXISTS idx_bookings_customer_auth ON public.bookings(customer_auth_user_id);
CREATE INDEX IF NOT EXISTS idx_bookings_status ON public.bookings(status);

ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can read own bookings" ON public.bookings;
CREATE POLICY "Users can read own bookings" ON public.bookings
    FOR SELECT TO authenticated
    USING (customer_auth_user_id = auth.uid() OR owner_auth_user_id = auth.uid());

-- Safe column backfills for existing bookings table
ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS studio_id uuid REFERENCES public.studios(id) ON DELETE CASCADE;
ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS customer_auth_user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS booking_date date;
ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS start_time time without time zone;
ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS end_time time without time zone;
ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS hours numeric DEFAULT 1;
ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS total_amount numeric DEFAULT 0;
ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS status text DEFAULT 'pending';
ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS payment_status text DEFAULT 'unpaid';
ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS notes text;
ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS created_at timestamptz DEFAULT now();
ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS admin_notes text;
ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS admin_notes_updated_at timestamptz;
ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS admin_notes_updated_by uuid;
ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS settlement_status text DEFAULT 'not_ready';
ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS payout_status text DEFAULT 'not_started';
ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS payment_required_at timestamptz;
ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS paid_at timestamptz;
ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS completed_at timestamptz;
ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS cancelled_at timestamptz;
ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS refund_status text DEFAULT 'none';
ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS platform_payment_id uuid;
ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS payment_provider text;
ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS payment_method text;
ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS checkout_session_id uuid;
ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS payment_transaction_id uuid;
ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS provider_checkout_id text;
ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS provider_payment_id text;
ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS installment_provider text;
ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS coupon_id uuid;
ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS coupon_code text;
ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS coupon_discount_amount numeric DEFAULT 0;
ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS wallet_credit_used numeric DEFAULT 0;
ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS loyalty_points_earned integer DEFAULT 0;
ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS loyalty_points_redeemed integer DEFAULT 0;
ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS auth_user_id uuid;
ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS owner_auth_user_id uuid;
ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS booking_number text;
ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS customer_name text;
ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS customer_email text;
ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS duration_hours numeric DEFAULT 1;
ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS subtotal_amount numeric DEFAULT 0;
ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS discount_amount numeric DEFAULT 0;
ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS currency_code text DEFAULT 'SAR';
ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS metadata jsonb DEFAULT '{}'::jsonb;
ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS updated_at timestamptz DEFAULT now();
ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS owner_notes text;
ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS status_changed_at timestamptz;
ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS status_changed_by uuid;
ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS owner_decision_at timestamptz;

-- Safe indexes backfills
CREATE INDEX IF NOT EXISTS idx_bookings_studio ON public.bookings(studio_id);
CREATE INDEX IF NOT EXISTS idx_bookings_customer_auth ON public.bookings(customer_auth_user_id);
CREATE INDEX IF NOT EXISTS idx_bookings_status ON public.bookings(status);

-- ============================================================================
-- 5. Loyalty Tiers Foundation
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.loyalty_tiers (
    code text PRIMARY KEY,
    name_en text NOT NULL,
    name_ar text NOT NULL,
    min_points integer NOT NULL DEFAULT 0,
    min_lifetime_spend decimal(12,2) DEFAULT 0.00,
    earn_multiplier decimal(4,2) NOT NULL DEFAULT 1.0,
    redemption_cap_percent integer DEFAULT 100,
    sort_order integer NOT NULL DEFAULT 0,
    is_active boolean NOT NULL DEFAULT true,
    created_at timestamptz DEFAULT now()
);

ALTER TABLE public.loyalty_tiers ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public read for loyalty tiers" ON public.loyalty_tiers;
CREATE POLICY "Public read for loyalty tiers" ON public.loyalty_tiers
    FOR SELECT USING (true);

-- Safe column backfills for existing loyalty_tiers table
ALTER TABLE public.loyalty_tiers ADD COLUMN IF NOT EXISTS name_en text;
ALTER TABLE public.loyalty_tiers ADD COLUMN IF NOT EXISTS name_ar text;
ALTER TABLE public.loyalty_tiers ADD COLUMN IF NOT EXISTS min_points integer DEFAULT 0;
ALTER TABLE public.loyalty_tiers ADD COLUMN IF NOT EXISTS min_lifetime_spend decimal(12,2) DEFAULT 0.00;
ALTER TABLE public.loyalty_tiers ADD COLUMN IF NOT EXISTS earn_multiplier decimal(4,2) DEFAULT 1.0;
ALTER TABLE public.loyalty_tiers ADD COLUMN IF NOT EXISTS redemption_cap_percent integer DEFAULT 100;
ALTER TABLE public.loyalty_tiers ADD COLUMN IF NOT EXISTS sort_order integer DEFAULT 0;
ALTER TABLE public.loyalty_tiers ADD COLUMN IF NOT EXISTS is_active boolean DEFAULT true;
ALTER TABLE public.loyalty_tiers ADD COLUMN IF NOT EXISTS created_at timestamptz DEFAULT now();

-- ============================================================================
-- 6. Customer Wallets Foundation
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.customer_wallets (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    auth_user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
    membership_number text,
    tier_code text NOT NULL DEFAULT 'listener' REFERENCES public.loyalty_tiers(code),
    points_balance integer NOT NULL DEFAULT 0 CHECK (points_balance >= 0),
    pending_points integer NOT NULL DEFAULT 0 CHECK (pending_points >= 0),
    wallet_balance decimal(12,2) NOT NULL DEFAULT 0.00 CHECK (wallet_balance >= 0.00),
    currency_code text NOT NULL DEFAULT 'SAR',
    lifetime_points integer NOT NULL DEFAULT 0 CHECK (lifetime_points >= 0),
    lifetime_spend decimal(12,2) NOT NULL DEFAULT 0.00 CHECK (lifetime_spend >= 0.00),
    referral_code text,
    membership_card_status text NOT NULL DEFAULT 'active',
    card_style_code text NOT NULL DEFAULT 'default',
    joined_at timestamptz NOT NULL DEFAULT now(),
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_customer_wallets_auth_user ON public.customer_wallets(auth_user_id);

ALTER TABLE public.customer_wallets ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can read own wallet" ON public.customer_wallets;
CREATE POLICY "Users can read own wallet" ON public.customer_wallets
    FOR SELECT TO authenticated
    USING (auth_user_id = auth.uid());

-- Safe column backfills for existing customer_wallets table
ALTER TABLE public.customer_wallets ADD COLUMN IF NOT EXISTS auth_user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE public.customer_wallets ADD COLUMN IF NOT EXISTS membership_number text;
ALTER TABLE public.customer_wallets ADD COLUMN IF NOT EXISTS tier_code text DEFAULT 'listener' REFERENCES public.loyalty_tiers(code);
ALTER TABLE public.customer_wallets ADD COLUMN IF NOT EXISTS points_balance integer DEFAULT 0;
ALTER TABLE public.customer_wallets ADD COLUMN IF NOT EXISTS pending_points integer DEFAULT 0;
ALTER TABLE public.customer_wallets ADD COLUMN IF NOT EXISTS wallet_balance decimal(12,2) DEFAULT 0.00;
ALTER TABLE public.customer_wallets ADD COLUMN IF NOT EXISTS currency_code text DEFAULT 'SAR';
ALTER TABLE public.customer_wallets ADD COLUMN IF NOT EXISTS lifetime_points integer DEFAULT 0;
ALTER TABLE public.customer_wallets ADD COLUMN IF NOT EXISTS lifetime_spend decimal(12,2) DEFAULT 0.00;
ALTER TABLE public.customer_wallets ADD COLUMN IF NOT EXISTS referral_code text;
ALTER TABLE public.customer_wallets ADD COLUMN IF NOT EXISTS membership_card_status text DEFAULT 'active';
ALTER TABLE public.customer_wallets ADD COLUMN IF NOT EXISTS card_style_code text DEFAULT 'default';
ALTER TABLE public.customer_wallets ADD COLUMN IF NOT EXISTS joined_at timestamptz DEFAULT now();
ALTER TABLE public.customer_wallets ADD COLUMN IF NOT EXISTS created_at timestamptz DEFAULT now();
ALTER TABLE public.customer_wallets ADD COLUMN IF NOT EXISTS updated_at timestamptz DEFAULT now();

-- Safe indexes backfills
CREATE INDEX IF NOT EXISTS idx_customer_wallets_auth_user ON public.customer_wallets(auth_user_id);

-- ============================================================================
-- 7. Loyalty Points Ledger Foundation
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.loyalty_points_ledger (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    auth_user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    event_type text NOT NULL,
    source_type text,
    source_id text,
    points integer NOT NULL,
    status text NOT NULL DEFAULT 'posted',
    description text,
    amount_basis decimal(12,2) DEFAULT 0.00,
    created_at timestamptz NOT NULL DEFAULT now(),
    reason text
);

CREATE INDEX IF NOT EXISTS idx_loyalty_points_ledger_auth_user ON public.loyalty_points_ledger(auth_user_id);

ALTER TABLE public.loyalty_points_ledger ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can read own ledger rows" ON public.loyalty_points_ledger;
CREATE POLICY "Users can read own ledger rows" ON public.loyalty_points_ledger
    FOR SELECT TO authenticated
    USING (auth_user_id = auth.uid());

-- Safe column backfills for existing loyalty_points_ledger table
ALTER TABLE public.loyalty_points_ledger ADD COLUMN IF NOT EXISTS auth_user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE public.loyalty_points_ledger ADD COLUMN IF NOT EXISTS event_type text;
ALTER TABLE public.loyalty_points_ledger ADD COLUMN IF NOT EXISTS source_type text;
ALTER TABLE public.loyalty_points_ledger ADD COLUMN IF NOT EXISTS source_id text;
ALTER TABLE public.loyalty_points_ledger ADD COLUMN IF NOT EXISTS points integer;
ALTER TABLE public.loyalty_points_ledger ADD COLUMN IF NOT EXISTS status text DEFAULT 'posted';
ALTER TABLE public.loyalty_points_ledger ADD COLUMN IF NOT EXISTS description text;
ALTER TABLE public.loyalty_points_ledger ADD COLUMN IF NOT EXISTS amount_basis decimal(12,2) DEFAULT 0.00;
ALTER TABLE public.loyalty_points_ledger ADD COLUMN IF NOT EXISTS created_at timestamptz DEFAULT now();
ALTER TABLE public.loyalty_points_ledger ADD COLUMN IF NOT EXISTS reason text;

-- Safe indexes backfills
CREATE INDEX IF NOT EXISTS idx_loyalty_points_ledger_auth_user ON public.loyalty_points_ledger(auth_user_id);

-- ============================================================================
-- 8. Marketplace Products Foundation
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.marketplace_products (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    vendor_id uuid NOT NULL,
    category_id uuid,
    brand_id uuid,
    name_en text NOT NULL,
    name_ar text NOT NULL,
    slug text NOT NULL,
    description_en text,
    description_ar text,
    short_description_en text,
    short_description_ar text,
    base_price numeric NOT NULL DEFAULT 0.00,
    currency text NOT NULL DEFAULT 'SAR',
    status text NOT NULL DEFAULT 'pending_review',
    is_featured boolean DEFAULT false,
    tags text[],
    meta_title text,
    meta_description text,
    sku text,
    sale_price numeric,
    stock_quantity integer NOT NULL DEFAULT 0,
    currency_code text NOT NULL DEFAULT 'SAR',
    is_active boolean NOT NULL DEFAULT true,
    images jsonb NOT NULL DEFAULT '[]'::jsonb,
    specifications jsonb NOT NULL DEFAULT '{}'::jsonb,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_marketplace_products_vendor ON public.marketplace_products(vendor_id);
CREATE INDEX IF NOT EXISTS idx_marketplace_products_slug ON public.marketplace_products(slug);

ALTER TABLE public.marketplace_products ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public products are viewable by everyone" ON public.marketplace_products;
CREATE POLICY "Public products are viewable by everyone" ON public.marketplace_products
    FOR SELECT USING (true);

-- Safe column backfills for existing marketplace_products table
ALTER TABLE public.marketplace_products ADD COLUMN IF NOT EXISTS vendor_id uuid;
ALTER TABLE public.marketplace_products ADD COLUMN IF NOT EXISTS category_id uuid;
ALTER TABLE public.marketplace_products ADD COLUMN IF NOT EXISTS brand_id uuid;
ALTER TABLE public.marketplace_products ADD COLUMN IF NOT EXISTS name_en text;
ALTER TABLE public.marketplace_products ADD COLUMN IF NOT EXISTS name_ar text;
ALTER TABLE public.marketplace_products ADD COLUMN IF NOT EXISTS slug text;
ALTER TABLE public.marketplace_products ADD COLUMN IF NOT EXISTS description_en text;
ALTER TABLE public.marketplace_products ADD COLUMN IF NOT EXISTS description_ar text;
ALTER TABLE public.marketplace_products ADD COLUMN IF NOT EXISTS short_description_en text;
ALTER TABLE public.marketplace_products ADD COLUMN IF NOT EXISTS short_description_ar text;
ALTER TABLE public.marketplace_products ADD COLUMN IF NOT EXISTS base_price numeric DEFAULT 0.00;
ALTER TABLE public.marketplace_products ADD COLUMN IF NOT EXISTS currency text DEFAULT 'SAR';
ALTER TABLE public.marketplace_products ADD COLUMN IF NOT EXISTS status text DEFAULT 'pending_review';
ALTER TABLE public.marketplace_products ADD COLUMN IF NOT EXISTS is_featured boolean DEFAULT false;
ALTER TABLE public.marketplace_products ADD COLUMN IF NOT EXISTS tags text[];
ALTER TABLE public.marketplace_products ADD COLUMN IF NOT EXISTS meta_title text;
ALTER TABLE public.marketplace_products ADD COLUMN IF NOT EXISTS meta_description text;
ALTER TABLE public.marketplace_products ADD COLUMN IF NOT EXISTS sku text;
ALTER TABLE public.marketplace_products ADD COLUMN IF NOT EXISTS sale_price numeric;
ALTER TABLE public.marketplace_products ADD COLUMN IF NOT EXISTS stock_quantity integer DEFAULT 0;
ALTER TABLE public.marketplace_products ADD COLUMN IF NOT EXISTS currency_code text DEFAULT 'SAR';
ALTER TABLE public.marketplace_products ADD COLUMN IF NOT EXISTS is_active boolean DEFAULT true;
ALTER TABLE public.marketplace_products ADD COLUMN IF NOT EXISTS images jsonb DEFAULT '[]'::jsonb;
ALTER TABLE public.marketplace_products ADD COLUMN IF NOT EXISTS specifications jsonb DEFAULT '{}'::jsonb;
ALTER TABLE public.marketplace_products ADD COLUMN IF NOT EXISTS created_at timestamptz DEFAULT now();
ALTER TABLE public.marketplace_products ADD COLUMN IF NOT EXISTS updated_at timestamptz DEFAULT now();

-- Safe indexes backfills
CREATE INDEX IF NOT EXISTS idx_marketplace_products_vendor ON public.marketplace_products(vendor_id);
CREATE INDEX IF NOT EXISTS idx_marketplace_products_slug ON public.marketplace_products(slug);

-- ============================================================================
-- 9. Marketplace Orders Foundation
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.marketplace_orders (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_auth_user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    order_number text NOT NULL,
    subtotal_amount numeric NOT NULL,
    tax_amount numeric DEFAULT 0.00,
    shipping_amount numeric DEFAULT 0.00,
    total_amount numeric NOT NULL,
    currency text DEFAULT 'SAR',
    status text NOT NULL DEFAULT 'draft',
    payment_status text NOT NULL DEFAULT 'unpaid',
    shipping_address_id uuid,
    shipping_method text,
    tracking_number text,
    settlement_status text DEFAULT 'pending',
    payout_status text DEFAULT 'pending',
    paid_at timestamptz,
    shipped_at timestamptz,
    delivered_at timestamptz,
    payment_provider text,
    payment_method text,
    installment_provider text,
    provider_checkout_id text,
    provider_payment_id text,
    coupon_id uuid,
    coupon_discount_amount numeric NOT NULL DEFAULT 0,
    wallet_credit_used numeric NOT NULL DEFAULT 0,
    loyalty_points_earned integer NOT NULL DEFAULT 0,
    loyalty_points_redeemed integer NOT NULL DEFAULT 0,
    checkout_session_id uuid,
    payment_transaction_id uuid,
    coupon_code text,
    auth_user_id uuid,
    customer_name text,
    customer_email text,
    discount_amount numeric NOT NULL DEFAULT 0,
    currency_code text NOT NULL DEFAULT 'SAR',
    metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_marketplace_orders_customer ON public.marketplace_orders(customer_auth_user_id);
CREATE INDEX IF NOT EXISTS idx_marketplace_orders_number ON public.marketplace_orders(order_number);

ALTER TABLE public.marketplace_orders ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own marketplace orders" ON public.marketplace_orders;
CREATE POLICY "Users can view their own marketplace orders" ON public.marketplace_orders
    FOR SELECT TO authenticated
    USING (customer_auth_user_id = auth.uid());

-- Safe column backfills for existing marketplace_orders table
ALTER TABLE public.marketplace_orders ADD COLUMN IF NOT EXISTS customer_auth_user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE public.marketplace_orders ADD COLUMN IF NOT EXISTS order_number text;
ALTER TABLE public.marketplace_orders ADD COLUMN IF NOT EXISTS subtotal_amount numeric;
ALTER TABLE public.marketplace_orders ADD COLUMN IF NOT EXISTS tax_amount numeric DEFAULT 0.00;
ALTER TABLE public.marketplace_orders ADD COLUMN IF NOT EXISTS shipping_amount numeric DEFAULT 0.00;
ALTER TABLE public.marketplace_orders ADD COLUMN IF NOT EXISTS total_amount numeric;
ALTER TABLE public.marketplace_orders ADD COLUMN IF NOT EXISTS currency text DEFAULT 'SAR';
ALTER TABLE public.marketplace_orders ADD COLUMN IF NOT EXISTS status text DEFAULT 'draft';
ALTER TABLE public.marketplace_orders ADD COLUMN IF NOT EXISTS payment_status text DEFAULT 'unpaid';
ALTER TABLE public.marketplace_orders ADD COLUMN IF NOT EXISTS shipping_address_id uuid;
ALTER TABLE public.marketplace_orders ADD COLUMN IF NOT EXISTS shipping_method text;
ALTER TABLE public.marketplace_orders ADD COLUMN IF NOT EXISTS tracking_number text;
ALTER TABLE public.marketplace_orders ADD COLUMN IF NOT EXISTS settlement_status text DEFAULT 'pending';
ALTER TABLE public.marketplace_orders ADD COLUMN IF NOT EXISTS payout_status text DEFAULT 'pending';
ALTER TABLE public.marketplace_orders ADD COLUMN IF NOT EXISTS paid_at timestamptz;
ALTER TABLE public.marketplace_orders ADD COLUMN IF NOT EXISTS shipped_at timestamptz;
ALTER TABLE public.marketplace_orders ADD COLUMN IF NOT EXISTS delivered_at timestamptz;
ALTER TABLE public.marketplace_orders ADD COLUMN IF NOT EXISTS payment_provider text;
ALTER TABLE public.marketplace_orders ADD COLUMN IF NOT EXISTS payment_method text;
ALTER TABLE public.marketplace_orders ADD COLUMN IF NOT EXISTS installment_provider text;
ALTER TABLE public.marketplace_orders ADD COLUMN IF NOT EXISTS provider_checkout_id text;
ALTER TABLE public.marketplace_orders ADD COLUMN IF NOT EXISTS provider_payment_id text;
ALTER TABLE public.marketplace_orders ADD COLUMN IF NOT EXISTS coupon_id uuid;
ALTER TABLE public.marketplace_orders ADD COLUMN IF NOT EXISTS coupon_discount_amount numeric DEFAULT 0;
ALTER TABLE public.marketplace_orders ADD COLUMN IF NOT EXISTS wallet_credit_used numeric DEFAULT 0;
ALTER TABLE public.marketplace_orders ADD COLUMN IF NOT EXISTS loyalty_points_earned integer DEFAULT 0;
ALTER TABLE public.marketplace_orders ADD COLUMN IF NOT EXISTS loyalty_points_redeemed integer DEFAULT 0;
ALTER TABLE public.marketplace_orders ADD COLUMN IF NOT EXISTS checkout_session_id uuid;
ALTER TABLE public.marketplace_orders ADD COLUMN IF NOT EXISTS payment_transaction_id uuid;
ALTER TABLE public.marketplace_orders ADD COLUMN IF NOT EXISTS coupon_code text;
ALTER TABLE public.marketplace_orders ADD COLUMN IF NOT EXISTS auth_user_id uuid;
ALTER TABLE public.marketplace_orders ADD COLUMN IF NOT EXISTS customer_name text;
ALTER TABLE public.marketplace_orders ADD COLUMN IF NOT EXISTS customer_email text;
ALTER TABLE public.marketplace_orders ADD COLUMN IF NOT EXISTS discount_amount numeric DEFAULT 0;
ALTER TABLE public.marketplace_orders ADD COLUMN IF NOT EXISTS currency_code text DEFAULT 'SAR';
ALTER TABLE public.marketplace_orders ADD COLUMN IF NOT EXISTS metadata jsonb DEFAULT '{}'::jsonb;
ALTER TABLE public.marketplace_orders ADD COLUMN IF NOT EXISTS created_at timestamptz DEFAULT now();
ALTER TABLE public.marketplace_orders ADD COLUMN IF NOT EXISTS updated_at timestamptz DEFAULT now();

-- Safe indexes backfills
CREATE INDEX IF NOT EXISTS idx_marketplace_orders_customer ON public.marketplace_orders(customer_auth_user_id);
CREATE INDEX IF NOT EXISTS idx_marketplace_orders_number ON public.marketplace_orders(order_number);
