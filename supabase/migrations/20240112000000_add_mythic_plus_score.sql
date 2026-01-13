-- Add mythic plus score column to candidates table
ALTER TABLE "public"."candidates" 
ADD COLUMN IF NOT EXISTS "wlogs_mythic_plus_score" double precision;
