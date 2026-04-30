-- GEARBEAT MARKETPLACE FOUNDATION SQL
-- PHASE 3: PRODUCT MARKETPLACE & VENDOR INFRASTRUCTURE

-- 1. MARKETPLACE CATEGORIES (Support Hierarchy)
CREATE TABLE IF NOT EXISTS marketplace_categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    parent_id UUID REFERENCES marketplace_categories(id) ON DELETE SET NULL,
    name_en TEXT NOT NULL,
    name_ar TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    description_en TEXT,
    description_ar TEXT,
    icon_url TEXT,
    sort_order INTEGER DEFAULT 0,
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. MARKETPLACE BRANDS
CREATE TABLE IF NOT EXISTS marketplace_brands (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name_en TEXT NOT NULL,
    name_ar TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    logo_url TEXT,
    website_url TEXT,
    description_en TEXT,
    description_ar TEXT,
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. VENDOR PROFILES (Linked to auth.users)
CREATE TABLE IF NOT EXISTS vendor_profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    business_name_en TEXT NOT NULL,
    business_name_ar TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    contact_email TEXT NOT NULL,
    contact_phone TEXT,
    logo_url TEXT,
    cover_image_url TEXT,
    vat_number TEXT,
    cr_number TEXT,
    website_url TEXT,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'suspended')),
    compliance_status TEXT NOT NULL DEFAULT 'pending' CHECK (compliance_status IN ('pending', 'approved', 'rejected')),
    agreement_status TEXT NOT NULL DEFAULT 'unsigned' CHECK (agreement_status IN ('unsigned', 'signed')),
    payout_status TEXT NOT NULL DEFAULT 'pending' CHECK (payout_status IN ('pending', 'approved', 'disabled')),
    commission_rate_default DECIMAL(5,2) DEFAULT 15.00,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. MARKETPLACE PRODUCTS
CREATE TABLE IF NOT EXISTS marketplace_products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    vendor_id UUID NOT NULL REFERENCES vendor_profiles(id) ON DELETE CASCADE,
    category_id UUID REFERENCES marketplace_categories(id) ON DELETE SET NULL,
    brand_id UUID REFERENCES marketplace_brands(id) ON DELETE SET NULL,
    name_en TEXT NOT NULL,
    name_ar TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    description_en TEXT,
    description_ar TEXT,
    short_description_en TEXT,
    short_description_ar TEXT,
    base_price DECIMAL(12,2) NOT NULL DEFAULT 0.00,
    currency TEXT NOT NULL DEFAULT 'SAR',
    status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'pending_approval', 'approved', 'rejected', 'archived')),
    is_featured BOOLEAN DEFAULT false,
    tags TEXT[], -- For SEO and search
    meta_title TEXT,
    meta_description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. MARKETPLACE PRODUCT VARIANTS (SKU Level)
CREATE TABLE IF NOT EXISTS marketplace_product_variants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID NOT NULL REFERENCES marketplace_products(id) ON DELETE CASCADE,
    name_en TEXT, -- e.g., "Matte Black", "Large"
    name_ar TEXT,
    sku TEXT NOT NULL UNIQUE,
    price_override DECIMAL(12,2),
    compare_at_price DECIMAL(12,2),
    weight_kg DECIMAL(10,2),
    dimensions_cm JSONB, -- {length, width, height}
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'out_of_stock')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. MARKETPLACE PRODUCT IMAGES
CREATE TABLE IF NOT EXISTS marketplace_product_images (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID NOT NULL REFERENCES marketplace_products(id) ON DELETE CASCADE,
    variant_id UUID REFERENCES marketplace_product_variants(id) ON DELETE CASCADE,
    image_url TEXT NOT NULL,
    sort_order INTEGER DEFAULT 0,
    is_main BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. MARKETPLACE INVENTORY
CREATE TABLE IF NOT EXISTS marketplace_inventory (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    variant_id UUID NOT NULL REFERENCES marketplace_product_variants(id) ON DELETE CASCADE UNIQUE,
    quantity INTEGER NOT NULL DEFAULT 0,
    low_stock_threshold INTEGER DEFAULT 5,
    warehouse_location TEXT,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. VENDOR COMMISSION RULES (Specific Overrides)
CREATE TABLE IF NOT EXISTS vendor_commission_rules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    vendor_id UUID REFERENCES vendor_profiles(id) ON DELETE CASCADE,
    category_id UUID REFERENCES marketplace_categories(id) ON DELETE CASCADE,
    percentage DECIMAL(5,2) NOT NULL,
    fixed_fee DECIMAL(12,2) DEFAULT 0.00,
    status TEXT NOT NULL DEFAULT 'active',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(vendor_id, category_id)
);

-- 9. VENDOR COMPLIANCE DOCUMENTS
CREATE TABLE IF NOT EXISTS vendor_compliance_documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    vendor_id UUID NOT NULL REFERENCES vendor_profiles(id) ON DELETE CASCADE,
    document_type TEXT NOT NULL, -- e.g., 'commercial_registration', 'vat_certificate'
    document_url TEXT NOT NULL,
    expiry_date DATE,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'expired')),
    rejection_reason TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 10. MARKETPLACE ORDERS (Extending Finance Layer)
CREATE TABLE IF NOT EXISTS marketplace_orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_auth_user_id UUID NOT NULL REFERENCES auth.users(id),
    order_number TEXT NOT NULL UNIQUE,
    subtotal_amount DECIMAL(12,2) NOT NULL,
    tax_amount DECIMAL(12,2) DEFAULT 0.00,
    shipping_amount DECIMAL(12,2) DEFAULT 0.00,
    total_amount DECIMAL(12,2) NOT NULL,
    currency TEXT DEFAULT 'SAR',
    status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'pending_payment', 'paid', 'vendor_confirmation_required', 'confirmed', 'processing', 'ready_to_ship', 'shipped', 'delivered', 'cancelled', 'refunded')),
    payment_status TEXT NOT NULL DEFAULT 'unpaid',
    shipping_address_id UUID, -- Links to a future addresses table
    shipping_method TEXT,
    tracking_number TEXT,
    settlement_status TEXT DEFAULT 'pending',
    payout_status TEXT DEFAULT 'pending',
    paid_at TIMESTAMPTZ,
    shipped_at TIMESTAMPTZ,
    delivered_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 11. MARKETPLACE ORDER ITEMS
CREATE TABLE IF NOT EXISTS marketplace_order_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID NOT NULL REFERENCES marketplace_orders(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES marketplace_products(id),
    variant_id UUID NOT NULL REFERENCES marketplace_product_variants(id),
    vendor_id UUID NOT NULL REFERENCES vendor_profiles(id),
    quantity INTEGER NOT NULL,
    unit_price DECIMAL(12,2) NOT NULL,
    total_price DECIMAL(12,2) NOT NULL,
    commission_percentage DECIMAL(5,2),
    commission_amount DECIMAL(12,2),
    vendor_net_amount DECIMAL(12,2),
    status TEXT DEFAULT 'pending', -- Can track status per item (e.g. for multi-vendor orders)
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ENABLE RLS
ALTER TABLE marketplace_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE marketplace_brands ENABLE ROW LEVEL SECURITY;
ALTER TABLE vendor_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE marketplace_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE marketplace_product_variants ENABLE ROW LEVEL SECURITY;
ALTER TABLE marketplace_product_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE marketplace_inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE marketplace_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE marketplace_order_items ENABLE ROW LEVEL SECURITY;

-- PUBLIC READ POLICIES
CREATE POLICY "Categories are viewable by everyone" ON marketplace_categories FOR SELECT USING (status = 'active');
CREATE POLICY "Brands are viewable by everyone" ON marketplace_brands FOR SELECT USING (status = 'active');
CREATE POLICY "Approved products are viewable by everyone" ON marketplace_products FOR SELECT USING (status = 'approved');
CREATE POLICY "Active variants are viewable by everyone" ON marketplace_product_variants FOR SELECT USING (status = 'active');
CREATE POLICY "Product images are viewable by everyone" ON marketplace_product_images FOR SELECT USING (true);

-- INDEXES FOR PERFORMANCE
CREATE INDEX idx_products_vendor ON marketplace_products(vendor_id);
CREATE INDEX idx_products_category ON marketplace_products(category_id);
CREATE INDEX idx_products_brand ON marketplace_products(brand_id);
CREATE INDEX idx_variants_product ON marketplace_product_variants(product_id);
CREATE INDEX idx_order_customer ON marketplace_orders(customer_auth_user_id);
CREATE INDEX idx_order_items_order ON marketplace_order_items(order_id);
CREATE INDEX idx_order_items_vendor ON marketplace_order_items(vendor_id);
