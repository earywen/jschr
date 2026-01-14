-- Add vote audit trail to track when votes are changed
-- This adds an updated_at timestamp that auto-updates on vote changes

-- Add updated_at column to votes table
ALTER TABLE public.votes 
ADD COLUMN IF NOT EXISTS updated_at timestamptz DEFAULT timezone('utc'::text, now());

-- Create function to automatically update the timestamp
CREATE OR REPLACE FUNCTION public.update_vote_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to call the function on UPDATE
DROP TRIGGER IF EXISTS set_vote_updated_at ON public.votes;
CREATE TRIGGER set_vote_updated_at
    BEFORE UPDATE ON public.votes
    FOR EACH ROW
    EXECUTE FUNCTION public.update_vote_timestamp();

-- Backfill existing votes with created_at as updated_at
UPDATE public.votes 
SET updated_at = created_at 
WHERE updated_at IS NULL;

-- Verification query
SELECT 
    id,
    candidate_id,
    voter_id,
    vote,
    created_at,
    updated_at,
    updated_at > created_at AS was_modified
FROM public.votes
LIMIT 5;
