-- Add UPDATE policy for members table
-- This allows GM to update member roles (e.g., promote pending to member)

-- Policy: GM can update member roles
DROP POLICY IF EXISTS "GM can update members" ON public.members;

CREATE POLICY "GM can update members" 
ON public.members 
FOR UPDATE 
USING (
    EXISTS (
        SELECT 1 
        FROM public.members 
        WHERE id = auth.uid() 
        AND role = 'gm'
    )
)
WITH CHECK (
    EXISTS (
        SELECT 1 
        FROM public.members 
        WHERE id = auth.uid() 
        AND role = 'gm'
    )
);

-- Verification query
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd
FROM pg_policies 
WHERE tablename = 'members'
ORDER BY policyname;
