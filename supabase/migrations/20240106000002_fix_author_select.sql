-- Allow users to view their own candidates (fix for submission RLS error)
BEGIN;

-- Add policy for authors to view their own candidates
-- This is necessary so that 'insert(...).select()' works for the author
DROP POLICY IF EXISTS "Authors can view own candidate" ON public.candidates;

CREATE POLICY "Authors can view own candidate" 
ON public.candidates 
FOR SELECT 
USING (auth.uid() = user_id);

COMMIT;
