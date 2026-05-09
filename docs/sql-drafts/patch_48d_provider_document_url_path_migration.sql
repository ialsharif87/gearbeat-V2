-- Patch 48D: Provider Document URL to Path Migration
-- This migration converts legacy absolute public Supabase URLs into relative storage paths.
-- Targeting the 'provider-documents' bucket across all applicable tables.

DO $$ 
BEGIN
    -- 1. Migrate studio_applications table
    -- Fields: cr_document_url, vat_certificate_url, national_address_url, bank_document_url, contract_url
    
    UPDATE studio_applications
    SET cr_document_url = split_part(cr_document_url, '/provider-documents/', 2)
    WHERE cr_document_url LIKE 'http%/%/provider-documents/%';

    UPDATE studio_applications
    SET vat_certificate_url = split_part(vat_certificate_url, '/provider-documents/', 2)
    WHERE vat_certificate_url LIKE 'http%/%/provider-documents/%';

    UPDATE studio_applications
    SET national_address_url = split_part(national_address_url, '/provider-documents/', 2)
    WHERE national_address_url LIKE 'http%/%/provider-documents/%';

    UPDATE studio_applications
    SET bank_document_url = split_part(bank_document_url, '/provider-documents/', 2)
    WHERE bank_document_url LIKE 'http%/%/provider-documents/%';

    UPDATE studio_applications
    SET contract_url = split_part(contract_url, '/provider-documents/', 2)
    WHERE contract_url LIKE 'http%/%/provider-documents/%';

    -- 2. Migrate provider_leads table (Sellers)
    -- Fields: cr_document_url, vat_document_url, national_address_url, bank_document_url

    UPDATE provider_leads
    SET cr_document_url = split_part(cr_document_url, '/provider-documents/', 2)
    WHERE cr_document_url LIKE 'http%/%/provider-documents/%';

    UPDATE provider_leads
    SET vat_document_url = split_part(vat_document_url, '/provider-documents/', 2)
    WHERE vat_document_url LIKE 'http%/%/provider-documents/%';

    UPDATE provider_leads
    SET national_address_url = split_part(national_address_url, '/provider-documents/', 2)
    WHERE national_address_url LIKE 'http%/%/provider-documents/%';

    UPDATE provider_leads
    SET bank_document_url = split_part(bank_document_url, '/provider-documents/', 2)
    WHERE bank_document_url LIKE 'http%/%/provider-documents/%';

END $$;
