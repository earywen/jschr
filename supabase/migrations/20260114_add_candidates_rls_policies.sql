-- Add missing RLS policies for candidates table
-- This allows officers to UPDATE candidates and GM to DELETE them

-- Policy: Officers and GM can update candidates
DROP POLICY IF EXISTS "Officers can update candidates" ON public.candidates;
DROP POLICY IF EXISTS "GM can update candidates" ON public.candidates;

CREATE POLICY "Officers can update candidates" 
ON public.candidates 
FOR UPDATE 
USING (
    EXISTS (
        SELECT 1 
        FROM public.members 
        WHERE id = auth.uid() 
        AND role IN ('officer', 'gm')
    )
);

-- Policy: GM can delete candidates
DROP POLICY IF EXISTS "GM can delete candidates" ON public.candidates;

CREATE POLICY "GM can delete candidates" 
ON public.candidates 
FOR DELETE 
USING (
    EXISTS (
        SELECT 1 
        FROM public.members 
        WHERE id = auth.uid() 
        AND role = 'gm'
    )
);

-- Verification queries
-- These should return the newly created policies:
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual
FROM pg_policies 
WHERE tablename = 'candidates'
ORDER BY policyname;
