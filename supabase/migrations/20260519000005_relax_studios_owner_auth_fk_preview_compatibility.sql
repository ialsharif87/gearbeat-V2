-- ============================================================================
-- GEARBEAT PATCH 123Q: RELAX STUDIOS OWNER AUTH FK PREVIEW COMPATIBILITY
-- ============================================================================
-- Description: Drop strict foreign key constraints between public.studios owner columns 
--              and auth.users to ensure compatibility with Supabase Preview 
--              environments that run migrations/seeds without matching auth rows.
-- Safety:      - Additive/relaxing ONLY (drops constraints without dropping columns).
--              - Zero data loss (no column drops, no table drops).
-- ============================================================================

ALTER TABLE IF EXISTS public.studios DROP CONSTRAINT IF EXISTS studios_owner_auth_user_id_fkey;
ALTER TABLE IF EXISTS public.studios DROP CONSTRAINT IF EXISTS studios_owner_id_fkey;
ALTER TABLE IF EXISTS public.studios DROP CONSTRAINT IF EXISTS studios_user_id_fkey;
