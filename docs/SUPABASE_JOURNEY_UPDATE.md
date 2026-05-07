-- Update studio_applications schema for the full journey
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='studio_applications' AND column_name='contract_draft') THEN
        ALTER TABLE studio_applications ADD COLUMN contract_draft TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='studio_applications' AND column_name='contract_url') THEN
        ALTER TABLE studio_applications ADD COLUMN contract_url TEXT; -- This is the SIGNED version uploaded by user
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='studio_applications' AND column_name='final_approved_at') THEN
        ALTER TABLE studio_applications ADD COLUMN final_approved_at TIMESTAMPTZ;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='studio_applications' AND column_name='final_approved_by') THEN
        ALTER TABLE studio_applications ADD COLUMN final_approved_by UUID REFERENCES auth.users(id);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='studio_applications' AND column_name='updated_at') THEN
        ALTER TABLE studio_applications ADD COLUMN updated_at TIMESTAMPTZ DEFAULT NOW();
    END IF;
END $$;

-- Enable users to view their own application in the portal
DROP POLICY IF EXISTS "Allow users to see their own studio applications" ON studio_applications;
CREATE POLICY "Allow users to see their own studio applications"
ON studio_applications
FOR SELECT
TO authenticated
USING (email = auth.jwt()->>'email');

-- Allow users to update their own application (upload contract)
DROP POLICY IF EXISTS "Allow users to update their own studio applications" ON studio_applications;
CREATE POLICY "Allow users to update their own studio applications"
ON studio_applications
FOR UPDATE
TO authenticated
USING (email = auth.jwt()->>'email')
WITH CHECK (email = auth.jwt()->>'email');
