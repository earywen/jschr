-- ================================================
-- SECURITY REMEDIATION MIGRATIONS - MANUAL APPLICATION
-- Execute this in Supabase SQL Editor
-- ================================================
-- Note: officer_notes table was removed in migration 20260113174346

-- Migration 1: Add Members UPDATE policy
-- ================================================
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

-- Migration 2: Add Vote Audit Trail
-- ================================================
ALTER TABLE public.votes 
ADD COLUMN IF NOT EXISTS updated_at timestamptz DEFAULT timezone('utc'::text, now());

CREATE OR REPLACE FUNCTION public.update_vote_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS set_vote_updated_at ON public.votes;
CREATE TRIGGER set_vote_updated_at
    BEFORE UPDATE ON public.votes
    FOR EACH ROW
    EXECUTE FUNCTION public.update_vote_timestamp();

-- Backfill existing votes
UPDATE public.votes 
SET updated_at = created_at 
WHERE updated_at IS NULL;

-- Migration 3: Restrict Storage Uploads (OPTIONAL - configure via Dashboard instead)
-- ================================================
-- NOTE: You can configure this in Supabase Dashboard:
-- Storage → candidates-screenshots → Policies
-- 
-- Policy name: "Authenticated users can upload screenshots"
-- Operation: INSERT
-- Policy definition:
--   bucket_id = 'candidates-screenshots' AND auth.role() = 'authenticated'

-- ================================================
-- VERIFICATION QUERIES
-- ================================================

-- Verify Members policies
SELECT 
    policyname, 
    cmd,
    qual
FROM pg_policies 
WHERE tablename = 'members' 
ORDER BY policyname;

-- Verify Vote audit trail (should show updated_at column)
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'votes' AND table_schema = 'public'
ORDER BY ordinal_position;

-- Verify vote trigger exists
SELECT 
    trigger_name, 
    event_manipulation,
    action_statement
FROM information_schema.triggers
WHERE event_object_table = 'votes' AND trigger_schema = 'public';

-- ================================================
-- SUCCESS MESSAGE
-- ================================================
DO $$
BEGIN
    RAISE NOTICE '✅ Security migrations applied successfully!';
    RAISE NOTICE '';
    RAISE NOTICE 'Next steps:';
    RAISE NOTICE '1. Configure storage policy via Dashboard (see Migration 3 above)';
    RAISE NOTICE '2. Restart your Next.js development server';
    RAISE NOTICE '3. Test with different user roles to verify policies';
END $$;
