-- Add wlogs_ilvl and wlogs_raid_progress columns to candidates table

ALTER TABLE candidates 
ADD COLUMN IF NOT EXISTS wlogs_ilvl INTEGER,
ADD COLUMN IF NOT EXISTS wlogs_raid_progress TEXT;
