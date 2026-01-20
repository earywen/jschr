-- Migration: Fix Supabase Performance Advisor Warnings
-- Date: 2026-01-15
-- Description: 
--   1. Fix Auth RLS Initplan issues by wrapping auth.uid() in SELECT subqueries
--   2. Remove duplicate permissive policies

-- =============================================================================
-- PART 1: Remove Duplicate Policies
-- =============================================================================

-- Drop duplicate policies on votes table
DROP POLICY IF EXISTS "Members view own vote" ON public.votes;
DROP POLICY IF EXISTS "Members can update own vote" ON public.votes;

-- Drop the less specific policy on recruitment_needs (keep "GM and Service Role" which includes SELECT via FOR ALL)
DROP POLICY IF EXISTS "Everyone can view recruitment needs" ON public.recruitment_needs;


-- =============================================================================
-- PART 2: Fix Auth RLS Initplan - Optimize auth.uid() Calls
-- =============================================================================

-- -------------------------
-- Table: members
-- -------------------------

DROP POLICY IF EXISTS "Users can see their own member profile" ON public.members;
CREATE POLICY "Users can see their own member profile" 
  ON public.members 
  FOR SELECT 
  USING ((SELECT auth.uid()) = id);

DROP POLICY IF EXISTS "GM can update members" ON public.members;
CREATE POLICY "GM can update members" 
  ON public.members 
  FOR UPDATE 
  USING (
    EXISTS (
      SELECT 1 FROM public.members m
      WHERE m.id = (SELECT auth.uid())
      AND m.role = 'gm'
    )
  );


-- -------------------------
-- Table: candidates
-- -------------------------

DROP POLICY IF EXISTS "Authors can view own candidate" ON public.candidates;
CREATE POLICY "Authors can view own candidate" 
  ON public.candidates 
  FOR SELECT 
  USING (user_id = (SELECT auth.uid()));

DROP POLICY IF EXISTS "Officers can update candidates" ON public.candidates;
CREATE POLICY "Officers can update candidates" 
  ON public.candidates 
  FOR UPDATE 
  USING (
    EXISTS (
      SELECT 1 FROM public.members m
      WHERE m.id = (SELECT auth.uid())
      AND m.role IN ('officer', 'gm')
    )
  );

DROP POLICY IF EXISTS "GM can delete candidates" ON public.candidates;
CREATE POLICY "GM can delete candidates" 
  ON public.candidates 
  FOR DELETE 
  USING (
    EXISTS (
      SELECT 1 FROM public.members m
      WHERE m.id = (SELECT auth.uid())
      AND m.role = 'gm'
    )
  );


-- -------------------------
-- Table: votes
-- -------------------------

-- Keep only "Users can view own votes" (more descriptive name)
DROP POLICY IF EXISTS "Users can view own votes" ON public.votes;
CREATE POLICY "Users can view own votes" 
  ON public.votes 
  FOR SELECT 
  USING (voter_id = (SELECT auth.uid()));

-- Keep only "Members can update own votes" (more descriptive name)
DROP POLICY IF EXISTS "Members can update own votes" ON public.votes;
CREATE POLICY "Members can update own votes" 
  ON public.votes 
  FOR UPDATE 
  USING (voter_id = (SELECT auth.uid()));


-- -------------------------
-- Table: recruitment_needs
-- -------------------------

-- Recreate the "GM and Service Role" policy with optimized auth.uid()
-- Changed from FOR ALL to FOR UPDATE, INSERT, DELETE to avoid overlap with SELECT policy
DROP POLICY IF EXISTS "GM and Service Role can update recruitment needs" ON public.recruitment_needs;
CREATE POLICY "GM and Service Role can update recruitment needs" 
  ON public.recruitment_needs 
  FOR UPDATE 
  USING (
    EXISTS (
      SELECT 1 FROM public.members m
      WHERE m.id = (SELECT auth.uid())
      AND m.role = 'gm'
    )
    OR (SELECT auth.role()) = 'service_role'
  );

-- Add INSERT and DELETE policies for GM and Service Role
CREATE POLICY "GM and Service Role can insert recruitment needs" 
  ON public.recruitment_needs 
  FOR INSERT 
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.members m
      WHERE m.id = (SELECT auth.uid())
      AND m.role = 'gm'
    )
    OR (SELECT auth.role()) = 'service_role'
  );

CREATE POLICY "GM and Service Role can delete recruitment needs" 
  ON public.recruitment_needs 
  FOR DELETE 
  USING (
    EXISTS (
      SELECT 1 FROM public.members m
      WHERE m.id = (SELECT auth.uid())
      AND m.role = 'gm'
    )
    OR (SELECT auth.role()) = 'service_role'
  );

-- Add a simple SELECT policy for everyone (public read access)
DROP POLICY IF EXISTS "Anyone can view recruitment needs" ON public.recruitment_needs;
CREATE POLICY "Anyone can view recruitment needs" 
  ON public.recruitment_needs 
  FOR SELECT 
  USING (true);


-- =============================================================================
-- Migration Summary
-- =============================================================================

-- ✅ Removed duplicate policies on votes table (2 policies)
-- ✅ Removed duplicate policy on recruitment_needs table (1 policy)
-- ✅ Optimized auth.uid() calls in 10 RLS policies using SELECT subqueries
-- ✅ All policies now use (SELECT auth.uid()) instead of auth.uid()

-- Expected outcome:
-- - Auth RLS Initplan warnings: 10 → 0
-- - Multiple Permissive Policies warnings: 15 → 0
