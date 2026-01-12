-- Add new candidate profile fields
ALTER TABLE public.candidates
ADD COLUMN IF NOT EXISTS discord_id text,
ADD COLUMN IF NOT EXISTS about_me text,
ADD COLUMN IF NOT EXISTS why_jsc text,
ADD COLUMN IF NOT EXISTS raid_experience text;
