-- Migration to add clerk_user_id column to profiles table
-- Run this in your Supabase SQL Editor

-- Add clerk_user_id column to profiles table (nullable for admin/hospital users)
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS clerk_user_id TEXT;

-- Add unique index for clerk_user_id (only for non-null values)
CREATE UNIQUE INDEX IF NOT EXISTS idx_profiles_clerk_user_id 
ON profiles(clerk_user_id) 
WHERE clerk_user_id IS NOT NULL;

-- Add index for better query performance
CREATE INDEX IF NOT EXISTS idx_profiles_role_clerk_user_id 
ON profiles(role, clerk_user_id);

-- Verification query to check the column was added
SELECT 
  column_name, 
  data_type, 
  is_nullable 
FROM information_schema.columns 
WHERE table_name = 'profiles' 
  AND column_name = 'clerk_user_id';
