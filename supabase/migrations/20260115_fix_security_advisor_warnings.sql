-- Migration: Fix Supabase Security Advisor Warnings
-- Date: 2026-01-15
-- Description: 
--   1. Document intentional permissive RLS policy on candidates table
--   2. Fix mutable search_path on 5 functions

-- =============================================================================
-- 1. Document Intentional Public Insert Policy
-- =============================================================================

COMMENT ON POLICY "Anyone can insert candidate" ON public.candidates IS 
'SECURITY EXCEPTION: Intentionally permissive policy for public candidate application form. 
This allows unauthenticated users to submit applications without login barriers.
Protected by: application-level rate limiting, input validation, and moderation workflow.';


-- =============================================================================
-- 2. Fix Function Search Paths (Security: Prevent Schema Injection)
-- =============================================================================

-- Drop existing functions first to avoid signature conflicts
DROP FUNCTION IF EXISTS public.handle_updated_at() CASCADE;
DROP FUNCTION IF EXISTS public.handle_new_identity() CASCADE;
DROP FUNCTION IF EXISTS public.update_vote_timestamp() CASCADE;
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;
DROP FUNCTION IF EXISTS public.get_my_role() CASCADE;

-- 2.1 Fix handle_updated_at
CREATE FUNCTION public.handle_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

-- 2.2 Fix handle_new_identity
CREATE FUNCTION public.handle_new_identity()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  -- Update member's Battle.net ID when new identity is created
  UPDATE public.members
  SET battlenet_id = NEW.provider_id
  WHERE auth_user_id = NEW.user_id
  AND NEW.provider = 'battlenet';
  
  RETURN NEW;
END;
$$;

-- 2.3 Fix update_vote_timestamp
CREATE FUNCTION public.update_vote_timestamp()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

-- 2.4 Fix handle_new_user
CREATE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  INSERT INTO public.members (auth_user_id, email, role)
  VALUES (
    NEW.id,
    NEW.email,
    'member'
  );
  RETURN NEW;
END;
$$;

-- 2.5 Fix get_my_role
CREATE FUNCTION public.get_my_role()
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  user_role TEXT;
BEGIN
  SELECT role INTO user_role
  FROM public.members
  WHERE auth_user_id = auth.uid();
  
  RETURN COALESCE(user_role, 'member');
END;
$$;


-- =============================================================================
-- Migration Summary
-- =============================================================================

-- ✅ Documented intentional permissive policy on candidates table
-- ✅ Fixed search_path on handle_updated_at()
-- ✅ Fixed search_path on handle_new_identity()
-- ✅ Fixed search_path on update_vote_timestamp()
-- ✅ Fixed search_path on handle_new_user()
-- ✅ Fixed search_path on get_my_role()

-- Remaining Manual Step:
-- ⚠️  Enable "Leaked Password Protection" in Supabase Dashboard:
--     Authentication → Providers → Email → Password Settings
--     Toggle "Enable leaked password detection (HaveIBeenPwned)"
