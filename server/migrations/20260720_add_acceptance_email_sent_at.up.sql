-- Up migration: Add acceptance_email_sent_at to appointments table
ALTER TABLE appointments ADD COLUMN IF NOT EXISTS acceptance_email_sent_at TIMESTAMPTZ;
COMMENT ON COLUMN appointments.acceptance_email_sent_at IS 'Timestamp when hospital accepted the appointment and sent acceptance email to donor. Null means pending.';
