-- Migration: Add secondary_specs column to candidates table
-- Description: Stores secondary / off-specs chosen by the candidate during application

ALTER TABLE public.candidates
ADD COLUMN IF NOT EXISTS secondary_specs text[] DEFAULT '{}';

COMMENT ON COLUMN public.candidates.secondary_specs IS 'Array of secondary/off-specializations played by the candidate';
