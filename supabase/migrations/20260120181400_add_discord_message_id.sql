-- Add column to store Discord message ID for vote sync
-- This enables updating Discord vote counts when votes are cast from the website
ALTER TABLE candidates ADD COLUMN IF NOT EXISTS discord_message_id TEXT;
