-- Add is_active status field to users table
-- Run this script in your Supabase SQL Editor

-- Add the is_active column to the users table
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;

-- Update existing users to be active by default
UPDATE users 
SET is_active = true 
WHERE is_active IS NULL;

-- Add a comment to the column for documentation
COMMENT ON COLUMN users.is_active IS 'Indicates whether the user account is active or inactive';

-- Optional: Create an index for better performance on status queries
CREATE INDEX IF NOT EXISTS idx_users_is_active ON users(is_active);

-- Verify the changes
SELECT 
    column_name, 
    data_type, 
    is_nullable, 
    column_default
FROM information_schema.columns 
WHERE table_name = 'users' 
AND column_name = 'is_active';
