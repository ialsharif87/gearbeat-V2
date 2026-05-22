-- [PATCH 129B] CUSTOMER SOCIAL LINKS SCHEMA MIGRATION DRAFT
-- Purpose: Support dynamic customer-owned social links with constraints and RLS.
-- Safety: Local draft only. Do not execute in remote databases.

-- Ensure pgcrypto extension is available for UUID generation if needed
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 1. Create customer_social_links table
CREATE TABLE IF NOT EXISTS public.customer_social_links (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    platform TEXT NOT NULL,
    url TEXT NOT NULL,
    handle TEXT,
    visibility TEXT NOT NULL DEFAULT 'public',
    moderation_status TEXT NOT NULL DEFAULT 'approved',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),

    -- Constraints
    -- Prevent duplicate platform links for the same customer.
    CONSTRAINT customer_social_links_user_platform_key UNIQUE (user_id, platform),
    
    -- Safe platform CHECK constraint.
    CONSTRAINT customer_social_links_platform_check CHECK (
        platform IN ('instagram', 'tiktok', 'x', 'youtube', 'linkedin', 'facebook', 'website')
    ),

    -- Safe URL format CHECK constraints.
    CONSTRAINT customer_social_links_url_length CHECK (char_length(url) <= 300),
    CONSTRAINT customer_social_links_url_format CHECK (url LIKE 'https://%' OR url LIKE 'http://%')
);

-- 2. Create indexes
CREATE INDEX IF NOT EXISTS idx_customer_social_links_user_id ON public.customer_social_links(user_id);
CREATE INDEX IF NOT EXISTS idx_customer_social_links_platform ON public.customer_social_links(platform);

-- 3. Enable RLS
ALTER TABLE public.customer_social_links ENABLE ROW LEVEL SECURITY;

-- 4. RLS Policies
DO $$
BEGIN
    -- Customer Select Policy
    IF NOT EXISTS (
        SELECT 1 FROM pg_policy WHERE polname = 'Customers can select own social links'
    ) THEN
        CREATE POLICY "Customers can select own social links"
        ON public.customer_social_links FOR SELECT
        TO authenticated
        USING (auth.uid() = user_id);
    END IF;

    -- Customer Insert Policy
    IF NOT EXISTS (
        SELECT 1 FROM pg_policy WHERE polname = 'Customers can insert own social links'
    ) THEN
        CREATE POLICY "Customers can insert own social links"
        ON public.customer_social_links FOR INSERT
        TO authenticated
        WITH CHECK (auth.uid() = user_id);
    END IF;

    -- Customer Update Policy
    IF NOT EXISTS (
        SELECT 1 FROM pg_policy WHERE polname = 'Customers can update own social links'
    ) THEN
        CREATE POLICY "Customers can update own social links"
        ON public.customer_social_links FOR UPDATE
        TO authenticated
        USING (auth.uid() = user_id)
        WITH CHECK (auth.uid() = user_id);
    END IF;

    -- Customer Delete Policy
    IF NOT EXISTS (
        SELECT 1 FROM pg_policy WHERE polname = 'Customers can delete own social links'
    ) THEN
        CREATE POLICY "Customers can delete own social links"
        ON public.customer_social_links FOR DELETE
        TO authenticated
        USING (auth.uid() = user_id);
    END IF;

    -- Admin Manage Policy
    IF NOT EXISTS (
        SELECT 1 FROM pg_policy WHERE polname = 'Admins can manage all customer social links'
    ) THEN
        CREATE POLICY "Admins can manage all customer social links"
        ON public.customer_social_links FOR ALL
        TO authenticated
        USING (
            EXISTS (
                SELECT 1 FROM public.admin_users
                WHERE auth_user_id = auth.uid() AND status = 'active'
            )
        );
    END IF;
END $$;
