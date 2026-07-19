-- Down migration: Remove acceptance_email_sent_at from appointments table
ALTER TABLE appointments DROP COLUMN IF EXISTS acceptance_email_sent_at;
