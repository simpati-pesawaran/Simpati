-- ============================================================================
-- COMPLETE FIX: activity_logs table structure
-- Run this to fix all issues with activity_logs
-- ============================================================================

-- 1. Drop the current foreign key constraint on user_id (if exists)
DO $$
BEGIN
    -- Try to drop FK if exists
    ALTER TABLE activity_logs DROP CONSTRAINT IF EXISTS activity_logs_user_id_fkey;
EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'FK drop skipped: %', SQLERRM;
END $$;

-- 2. Change entity_id from UUID to TEXT (to allow "multi" and other string IDs)
ALTER TABLE activity_logs ALTER COLUMN entity_id TYPE TEXT;

-- 3. Change user_id from UUID to TEXT (for flexibility)
ALTER TABLE activity_logs ALTER COLUMN user_id TYPE TEXT;

-- 4. Make user_name nullable
ALTER TABLE activity_logs ALTER COLUMN user_name DROP NOT NULL;
ALTER TABLE activity_logs ALTER COLUMN user_name SET DEFAULT '';

-- 5. Make user_email nullable (for public entries)
ALTER TABLE activity_logs ALTER COLUMN user_email DROP NOT NULL;
ALTER TABLE activity_logs ALTER COLUMN user_email SET DEFAULT '';

-- 6. Make description nullable
ALTER TABLE activity_logs ALTER COLUMN description DROP NOT NULL;
ALTER TABLE activity_logs ALTER COLUMN description SET DEFAULT '';

-- 7. Add constraint back for user_id (TEXT type)
ALTER TABLE activity_logs ADD CONSTRAINT activity_logs_user_id_fkey FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE SET NULL;

-- 8. Verify the new structure
SELECT
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_name = 'activity_logs'
ORDER BY ordinal_position;

-- 9. Test insert
DO $$
DECLARE
    test_id TEXT;
BEGIN
    -- Get a profile ID for testing
    test_id := (SELECT id FROM profiles LIMIT 1);

    IF test_id IS NOT NULL THEN
        INSERT INTO activity_logs (user_id, user_name, user_email, action, entity_type, entity_id, description)
        VALUES (
            test_id,
            'TEST_USER',
            'test@example.com',
            'create',
            'profile',
            test_id,
            'TEST: This is a test entry to verify activity_logs works'
        );

        -- Delete test entry
        DELETE FROM activity_logs WHERE description LIKE 'TEST: %';

        RAISE NOTICE 'SUCCESS: activity_logs table is now working correctly!';
    ELSE
        RAISE NOTICE 'WARNING: No profiles found for testing. Please create a profile first.';
    END IF;
EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'ERROR: %', SQLERRM;
END $$;

-- ============================================================================
-- VERIFICATION: Check all enum types
-- ============================================================================

SELECT 'Action Types:' as info;
SELECT enumlabel FROM pg_enum WHERE enumtypid = (SELECT oid FROM pg_type WHERE typname = 'action_type');

SELECT 'Entity Types:' as info;
SELECT enumlabel FROM pg_enum WHERE enumtypid = (SELECT oid FROM pg_type WHERE typname = 'entity_type');

SELECT 'Notification Types:' as info;
SELECT enumlabel FROM pg_enum WHERE enumtypid = (SELECT oid FROM pg_type WHERE typname = 'notification_type');
