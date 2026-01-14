-- Add missing RLS policies for officer_notes table
-- This allows officers to UPDATE their own notes and GM to DELETE any notes

-- Policy: Officers can update their own notes
DROP POLICY IF EXISTS "Officers can update own notes" ON public.officer_notes;

CREATE POLICY "Officers can update own notes" 
ON public.officer_notes 
FOR UPDATE 
USING (
    EXISTS (
        SELECT 1 
        FROM public.members 
        WHERE id = auth.uid() 
        AND role IN ('officer', 'gm')
    )
    AND author_id = auth.uid()
)
WITH CHECK (
    EXISTS (
        SELECT 1 
        FROM public.members 
        WHERE id = auth.uid() 
        AND role IN ('officer', 'gm')
    )
    AND author_id = auth.uid()
);

-- Policy: GM can delete any notes
DROP POLICY IF EXISTS "GM can delete notes" ON public.officer_notes;

CREATE POLICY "GM can delete notes" 
ON public.officer_notes 
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
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd
FROM pg_policies 
WHERE tablename = 'officer_notes'
ORDER BY policyname;
