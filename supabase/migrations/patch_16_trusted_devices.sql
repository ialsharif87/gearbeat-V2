-- Micro Patch 16: Trusted devices migration
-- Objective: Create the trusted_devices table for persistent identity trust.

-- Ensure pgcrypto extension is available for UUID generation if needed
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 1. Create trusted_devices table
CREATE TABLE IF NOT EXISTS public.trusted_devices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    device_token_hash TEXT NOT NULL,
    device_name TEXT,
    browser TEXT,
    os TEXT,
    last_ip TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    last_used_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    expires_at TIMESTAMPTZ NOT NULL
);

-- 2. Create indexes
CREATE INDEX IF NOT EXISTS idx_trusted_devices_user_id ON public.trusted_devices(user_id);
CREATE UNIQUE INDEX IF NOT EXISTS idx_trusted_devices_token_hash ON public.trusted_devices(device_token_hash);
CREATE INDEX IF NOT EXISTS idx_trusted_devices_expires_at ON public.trusted_devices(expires_at);

-- 3. Enable RLS
ALTER TABLE public.trusted_devices ENABLE ROW LEVEL SECURITY;

-- 4. Add RLS policies
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policy WHERE polname = 'Users can view their own trusted devices'
    ) THEN
        CREATE POLICY "Users can view their own trusted devices"
        ON public.trusted_devices FOR SELECT
        TO authenticated
        USING (auth.uid() = user_id);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policy WHERE polname = 'Users can revoke their own trusted devices'
    ) THEN
        CREATE POLICY "Users can revoke their own trusted devices"
        ON public.trusted_devices FOR DELETE
        TO authenticated
        USING (auth.uid() = user_id);
    END IF;
END $$;
