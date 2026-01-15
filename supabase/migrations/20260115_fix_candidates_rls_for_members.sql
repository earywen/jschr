-- Fix RLS policy for candidates table to allow members to view candidates
-- Drop the old restrictive policy
DROP POLICY IF EXISTS "Officers and GM can view all candidates" ON candidates;

-- Create new policy that allows members, officers, and GM to view candidates
CREATE POLICY "Members can view all candidates"
ON candidates
FOR SELECT
TO public
USING (
  EXISTS (
    SELECT 1 
    FROM members m 
    WHERE m.id = auth.uid() 
    AND m.role IN ('member', 'officer', 'gm')
  )
);

-- Add comment for clarity
COMMENT ON POLICY "Members can view all candidates" ON candidates IS 
'Allows authenticated members (member, officer, gm roles) to view all candidate applications';
