-- Add avatar URL column to candidates
ALTER TABLE public.candidates
ADD COLUMN IF NOT EXISTS avatar_url text;
