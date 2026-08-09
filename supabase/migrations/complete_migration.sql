-- ============================================================================
-- SIMPATI Database Migration (Idempotent Version)
-- Safe to run multiple times - won't error if already exists
-- Run this in Supabase Dashboard -> SQL Editor
-- ============================================================================

-- ============================================================================
-- 1. ADD NEW NOTIFICATION TYPES (Ignore if already exists)
-- ============================================================================

DO $$ BEGIN
  ALTER TYPE notification_type ADD VALUE IF NOT EXISTS 'sync_failed';
EXCEPTION WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  ALTER TYPE notification_type ADD VALUE IF NOT EXISTS 'profile_updated';
EXCEPTION WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  ALTER TYPE notification_type ADD VALUE IF NOT EXISTS 'share_created';
EXCEPTION WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  ALTER TYPE notification_type ADD VALUE IF NOT EXISTS 'media_uploaded';
EXCEPTION WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  ALTER TYPE notification_type ADD VALUE IF NOT EXISTS 'media_deleted';
EXCEPTION WHEN duplicate_object THEN null;
END $$;

-- ============================================================================
-- 2. ADD NEW ACTION TYPES
-- ============================================================================

DO $$ BEGIN
  ALTER TYPE action_type ADD VALUE IF NOT EXISTS 'publish';
EXCEPTION WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  ALTER TYPE action_type ADD VALUE IF NOT EXISTS 'cancel';
EXCEPTION WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  ALTER TYPE action_type ADD VALUE IF NOT EXISTS 'sync_failure';
EXCEPTION WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  ALTER TYPE action_type ADD VALUE IF NOT EXISTS 'share';
EXCEPTION WHEN duplicate_object THEN null;
END $$;

-- ============================================================================
-- 3. ADD NEW ENTITY TYPES
-- ============================================================================

DO $$ BEGIN
  ALTER TYPE entity_type ADD VALUE IF NOT EXISTS 'share';
EXCEPTION WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  ALTER TYPE entity_type ADD VALUE IF NOT EXISTS 'share_link';
EXCEPTION WHEN duplicate_object THEN null;
END $$;

-- ============================================================================
-- 4. ADD COLUMNS TO activity_logs TABLE (Ignore if already exists)
-- ============================================================================

DO $$ BEGIN
  ALTER TABLE activity_logs ADD COLUMN user_name TEXT;
EXCEPTION WHEN duplicate_column THEN null;
END $$;

DO $$ BEGIN
  ALTER TABLE activity_logs ADD COLUMN description TEXT;
EXCEPTION WHEN duplicate_column THEN null;
END $$;

-- ============================================================================
-- 5. CREATE share_links TABLE (Skip if exists)
-- ============================================================================

CREATE TABLE IF NOT EXISTS share_links (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    token TEXT NOT NULL UNIQUE,
    created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
    jenis TEXT DEFAULT 'all',
    start_date DATE,
    end_date DATE,
    status TEXT DEFAULT 'active',
    view_count INTEGER DEFAULT 0,
    expires_at TIMESTAMPTZ,
    last_viewed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================================
-- 6. CREATE calendar_event_mapping TABLE (Skip if exists)
-- ============================================================================

CREATE TABLE IF NOT EXISTS calendar_event_mapping (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    agenda_id UUID REFERENCES agenda(id) ON DELETE CASCADE,
    google_event_id TEXT NOT NULL,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(agenda_id, user_id)
);

-- ============================================================================
-- 7. CREATE user_calendar_tokens TABLE (Skip if exists)
-- ============================================================================

CREATE TABLE IF NOT EXISTS user_calendar_tokens (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    access_token TEXT,
    refresh_token TEXT,
    expires_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(user_id)
);

-- ============================================================================
-- 8. ENABLE RLS AND CREATE POLICIES (Skip if exists)
-- ============================================================================

-- share_links RLS
ALTER TABLE share_links ENABLE ROW LEVEL SECURITY;

-- Create policy only if not exists
DO $$ BEGIN
  CREATE POLICY "share_links_public_read" ON share_links FOR SELECT USING (true);
EXCEPTION WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE POLICY "share_links_admin_write" ON share_links FOR ALL USING (
      EXISTS (
          SELECT 1 FROM profiles
          WHERE profiles.id = share_links.created_by
          AND profiles.role IN ('superadmin', 'admin')
          AND profiles.status = 'approved'
      )
  );
EXCEPTION WHEN duplicate_object THEN null;
END $$;

-- calendar_event_mapping RLS
ALTER TABLE calendar_event_mapping ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  CREATE POLICY "calendar_event_mapping_all" ON calendar_event_mapping FOR ALL USING (true) WITH CHECK (true);
EXCEPTION WHEN duplicate_object THEN null;
END $$;

-- user_calendar_tokens RLS
ALTER TABLE user_calendar_tokens ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  CREATE POLICY "user_calendar_tokens_owner" ON user_calendar_tokens FOR ALL USING (auth.uid() = user_id);
EXCEPTION WHEN duplicate_object THEN null;
END $$;

-- ============================================================================
-- 9. CREATE INDEXES (Skip if exists)
-- ============================================================================

-- activity_logs indexes
CREATE INDEX IF NOT EXISTS idx_activity_logs_user_name ON activity_logs(user_name);
CREATE INDEX IF NOT EXISTS idx_activity_logs_action ON activity_logs(action);
CREATE INDEX IF NOT EXISTS idx_activity_logs_entity_type ON activity_logs(entity_type);
CREATE INDEX IF NOT EXISTS idx_activity_logs_created_at ON activity_logs(created_at DESC);

-- share_links indexes
CREATE INDEX IF NOT EXISTS idx_share_links_token ON share_links(token);
CREATE INDEX IF NOT EXISTS idx_share_links_created_by ON share_links(created_by);
CREATE INDEX IF NOT EXISTS idx_share_links_status ON share_links(status);

-- calendar_event_mapping indexes
CREATE INDEX IF NOT EXISTS idx_calendar_event_mapping_agenda ON calendar_event_mapping(agenda_id);
CREATE INDEX IF NOT EXISTS idx_calendar_event_mapping_google ON calendar_event_mapping(google_event_id);

-- notifications indexes
CREATE INDEX IF NOT EXISTS idx_notifications_user_read ON notifications(user_id, is_read);
CREATE INDEX IF NOT EXISTS idx_notifications_type ON notifications(type);

-- ============================================================================
-- 10. VERIFY CHANGES
-- ============================================================================

SELECT '=== Notification Types ===' as info;
SELECT enumlabel FROM pg_enum WHERE enumtypid = (SELECT oid FROM pg_type WHERE typname = 'notification_type');

SELECT '=== Action Types ===' as info;
SELECT enumlabel FROM pg_enum WHERE enumtypid = (SELECT oid FROM pg_type WHERE typname = 'action_type');

SELECT '=== Entity Types ===' as info;
SELECT enumlabel FROM pg_enum WHERE enumtypid = (SELECT oid FROM pg_type WHERE typname = 'entity_type');

SELECT '=== Tables Created ===' as info;
SELECT tablename FROM pg_tables WHERE schemaname = 'public' AND tablename IN ('share_links', 'calendar_event_mapping', 'user_calendar_tokens');

SELECT '=== activity_logs New Columns ===' as info;
SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'activity_logs' AND column_name IN ('user_name', 'description');

-- ============================================================================
-- DONE! Migration Complete
-- ============================================================================
