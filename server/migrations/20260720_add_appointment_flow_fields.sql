-- Migration: Add appointment flow fields for tracking acceptance and outcomes
-- Date: 2026-07-20
-- Description: Adds acceptance_email_sent_at field to track hospital confirmation of appointments

-- Check if the column already exists before adding it
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'appointments' AND column_name = 'acceptance_email_sent_at'
    ) THEN
        -- Add the acceptance tracking field
        ALTER TABLE appointments ADD COLUMN acceptance_email_sent_at TIMESTAMPTZ;
        
        -- Add comment for documentation
        COMMENT ON COLUMN appointments.acceptance_email_sent_at IS 
        'Timestamp when hospital accepted the appointment and sent acceptance email to donor. Null means pending.';
        
        RAISE NOTICE 'Added acceptance_email_sent_at column to appointments table';
    ELSE
        RAISE NOTICE 'acceptance_email_sent_at column already exists in appointments table';
    END IF;
END $$;

-- Verify the column was added
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'appointments' AND column_name = 'acceptance_email_sent_at';
