-- ============================================================================
-- Migration: Add missing notification types and share_links table
-- Run this in Supabase Dashboard -> SQL Editor
-- ============================================================================

-- Add new notification types
ALTER TYPE notification_type ADD VALUE IF NOT EXISTS 'sync_failed';
ALTER TYPE notification_type ADD VALUE IF NOT EXISTS 'profile_updated';
ALTER TYPE notification_type ADD VALUE IF NOT EXISTS 'share_created';
ALTER TYPE notification_type ADD VALUE IF NOT EXISTS 'media_uploaded';
ALTER TYPE notification_type ADD VALUE IF NOT EXISTS 'media_deleted';

-- Add 'share' to entity_type
ALTER TYPE entity_type ADD VALUE IF NOT EXISTS 'share';
ALTER TYPE entity_type ADD VALUE IF NOT EXISTS 'share_link';

-- Add 'share' to action_type
ALTER TYPE action_type ADD VALUE IF NOT EXISTS 'share';

-- Verify the changes
SELECT enumlabel FROM pg_enum WHERE enumtypid = (SELECT oid FROM pg_type WHERE typname = 'notification_type');
SELECT enumlabel FROM pg_enum WHERE enumtypid = (SELECT oid FROM pg_type WHERE typname = 'entity_type');
SELECT enumlabel FROM pg_enum WHERE enumtypid = (SELECT oid FROM pg_type WHERE typname = 'action_type');

-- ============================================================================
-- Create share_links table if not exists
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

-- Indexes for share_links
CREATE INDEX IF NOT EXISTS idx_share_links_token ON share_links(token);
CREATE INDEX IF NOT EXISTS idx_share_links_created_by ON share_links(created_by);
CREATE INDEX IF NOT EXISTS idx_share_links_status ON share_links(status);

-- RLS for share_links
ALTER TABLE share_links ENABLE ROW LEVEL SECURITY;

-- Allow public read for share links
CREATE POLICY "share_links_public_read" ON share_links FOR SELECT USING (true);

-- Only allow admins to insert/update/delete
CREATE POLICY "share_links_admin_write" ON share_links FOR ALL USING (
    EXISTS (
        SELECT 1 FROM profiles
        WHERE profiles.id = share_links.created_by
        AND profiles.role IN ('superadmin', 'admin')
        AND profiles.status = 'approved'
    )
);

-- ============================================================================
-- Add missing tables for Google Calendar integration
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

CREATE INDEX IF NOT EXISTS idx_calendar_event_mapping_agenda ON calendar_event_mapping(agenda_id);
CREATE INDEX IF NOT EXISTS idx_calendar_event_mapping_google ON calendar_event_mapping(google_event_id);

-- RLS for calendar_event_mapping
ALTER TABLE calendar_event_mapping ENABLE ROW LEVEL SECURITY;
CREATE POLICY "calendar_event_mapping_all" ON calendar_event_mapping FOR ALL USING (true) WITH CHECK (true);

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

-- RLS for user_calendar_tokens
ALTER TABLE user_calendar_tokens ENABLE ROW LEVEL SECURITY;
CREATE POLICY "user_calendar_tokens_owner" ON user_calendar_tokens FOR ALL USING (auth.uid() = user_id);

-- ============================================================================
-- Create indexes for better performance
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_activity_logs_user_name ON activity_logs(user_name);
CREATE INDEX IF NOT EXISTS idx_activity_logs_action ON activity_logs(action);
CREATE INDEX IF NOT EXISTS idx_activity_logs_entity_type ON activity_logs(entity_type);
CREATE INDEX IF NOT EXISTS idx_activity_logs_created_at ON activity_logs(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_notifications_user_read ON notifications(user_id, is_read);
CREATE INDEX IF NOT EXISTS idx_notifications_type ON notifications(type);
