-- ============================================================================
-- FIX: Add missing columns to activity_logs table
-- Run this to fix the empty activity log issue
-- ============================================================================

-- Add user_name column (will fail silently if exists)
ALTER TABLE activity_logs ADD COLUMN IF NOT EXISTS user_name TEXT;

-- Add description column (will fail silently if exists)
ALTER TABLE activity_logs ADD COLUMN IF NOT EXISTS description TEXT;

-- Verify the columns exist now
SELECT
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns
WHERE table_name = 'activity_logs'
ORDER BY ordinal_position;

-- Check if we can insert a test record
-- This will fail if columns don't exist
DO $$
BEGIN
    INSERT INTO activity_logs (user_id, user_name, user_email, action, entity_type, entity_id, description)
    VALUES (
        (SELECT id FROM profiles LIMIT 1),
        'TEST_USER',
        'test@test.com',
        'create',
        'profile',
        gen_random_uuid(),
        'TEST: This is a test log entry'
    );

    -- Delete the test record
    DELETE FROM activity_logs WHERE description = 'TEST: This is a test log entry';

    RAISE NOTICE 'SUCCESS: activity_logs table is working correctly with user_name and description columns!';
EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'ERROR: activity_logs table still has issues: %', SQLERRM;
END $$;
