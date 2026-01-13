-- RLS Policy Audit and Consolidation
-- This migration cleans up duplicate and conflicting policies

-- Votes table cleanup: remove duplicate officer view policy
-- (fix_rls_recursion.sql created "Officers view all votes" but 
--  fix_votes_rls.sql created "Officers can view all votes" with same logic)
drop policy if exists "Officers view all votes" on public.votes;
-- Keep "Officers can view all votes" from fix_votes_rls.sql

-- Also drop the old "Members can vote" from fix_rls_recursion.sql 
-- since it conflicts with "Members can insert votes" from fix_votes_rls.sql
drop policy if exists "Members can vote" on public.votes;
-- Keep "Members can insert votes" from fix_votes_rls.sql
