-- Fix potential RLS issues with candidates table
BEGIN;

-- Ensure permissions are granted to roles
GRANT ALL ON TABLE public.candidates TO authenticated;
GRANT ALL ON TABLE public.candidates TO anon;
GRANT ALL ON TABLE public.candidates TO service_role;

-- Re-assert existing policies to ensure they are active
DROP POLICY IF EXISTS "Anyone can insert candidate" ON public.candidates;

-- Allow anyone to insert (Apply)
CREATE POLICY "Anyone can insert candidate" 
ON public.candidates 
FOR INSERT 
WITH CHECK (true);

COMMIT;
