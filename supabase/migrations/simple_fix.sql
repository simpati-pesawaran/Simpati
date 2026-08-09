-- ============================================================================
-- SIMPLE FIX: activity_logs table - NO FK changes
-- Run this to fix the empty activity log issue
-- ============================================================================

-- 1. Add missing columns (will not fail if exists)
ALTER TABLE activity_logs ADD COLUMN IF NOT EXISTS user_name TEXT;
ALTER TABLE activity_logs ADD COLUMN IF NOT EXISTS description TEXT;

-- 2. Make columns nullable
ALTER TABLE activity_logs ALTER COLUMN user_name DROP NOT NULL;
ALTER TABLE activity_logs ALTER COLUMN user_email DROP NOT NULL;
ALTER TABLE activity_logs ALTER COLUMN description DROP NOT NULL;

-- 3. Change entity_id from UUID to TEXT (for flexibility)
ALTER TABLE activity_logs ALTER COLUMN entity_id TYPE TEXT;

-- 4. Verify the structure
SELECT
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns
WHERE table_name = 'activity_logs'
ORDER BY ordinal_position;

-- 5. Test insert
DO $$
DECLARE
    test_id TEXT;
BEGIN
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
            'TEST: Verifikasi activity_logs berfungsi'
        );

        DELETE FROM activity_logs WHERE description LIKE 'TEST: %';
        RAISE NOTICE 'SUCCESS: activity_logs sudah berfungsi!';
    ELSE
        RAISE NOTICE 'WARNING: Tidak ada profile untuk test.';
    END IF;
EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'ERROR: %', SQLERRM;
END $$;
