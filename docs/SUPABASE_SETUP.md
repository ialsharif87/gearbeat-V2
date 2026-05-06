# Supabase Setup Guide for GearBeat V2

## Studio Applications Security & Schema

To enable public studio registration and ensure the database supports all required documents, run the following SQL in the Supabase SQL Editor:

```sql
-- 1. Enable RLS
ALTER TABLE studio_applications ENABLE ROW LEVEL SECURITY;

-- 2. Allow anyone to submit an application (Insert only)
DROP POLICY IF EXISTS "Allow public studio applications" ON studio_applications;
CREATE POLICY "Allow public studio applications"
ON studio_applications
FOR INSERT
TO anon
WITH CHECK (true);

-- 3. Ensure all schema columns exist for new registration form
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='studio_applications' AND column_name='cr_document_url') THEN
        ALTER TABLE studio_applications ADD COLUMN cr_document_url TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='studio_applications' AND column_name='national_address_url') THEN
        ALTER TABLE studio_applications ADD COLUMN national_address_url TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='studio_applications' AND column_name='bank_document_url') THEN
        ALTER TABLE studio_applications ADD COLUMN bank_document_url TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='studio_applications' AND column_name='country') THEN
        ALTER TABLE studio_applications ADD COLUMN country TEXT;
    END IF;
END $$;
```

## Storage Buckets

Ensure the `provider-documents` bucket exists and has public read access for URLs to work, or adjust the `getPublicUrl` logic to use signed URLs if private.

Recommended Policy for `provider-documents` bucket:
- **SELECT**: Public
- **INSERT**: Anon (Public)
- **UPDATE/DELETE**: Authenticated (Admin only)
