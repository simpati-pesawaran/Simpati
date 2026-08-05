-- ============================================================================
-- SIMPATI Database Migration v2.1 (Fixed)
-- ============================================================================

-- ENUMS (Idempotent)
DO $$ BEGIN CREATE TYPE user_role AS ENUM ('superadmin', 'admin'); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN CREATE TYPE approval_status AS ENUM ('pending', 'approved', 'rejected'); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN CREATE TYPE agenda_jenis AS ENUM ('agenda', 'audiensi'); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN CREATE TYPE agenda_status AS ENUM ('draft', 'published', 'cancelled'); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN CREATE TYPE notification_type AS ENUM ('user_registered', 'user_approved', 'user_rejected', 'agenda_created', 'agenda_updated', 'agenda_deleted', 'agenda_reminder', 'usulan_new'); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN CREATE TYPE action_type AS ENUM ('create', 'update', 'delete', 'approve', 'reject', 'login', 'logout'); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN CREATE TYPE entity_type AS ENUM ('profile', 'agenda', 'notification', 'gallery'); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN CREATE TYPE file_type AS ENUM ('image', 'document'); EXCEPTION WHEN duplicate_object THEN null; END $$;

-- profiles table
CREATE TABLE IF NOT EXISTS profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    division TEXT,
    avatar_url TEXT,
    role user_role NOT NULL DEFAULT 'admin',
    status approval_status NOT NULL DEFAULT 'pending',
    approved_by UUID REFERENCES profiles(id),
    approved_at TIMESTAMPTZ,
    rejected_by UUID REFERENCES profiles(id),
    rejected_at TIMESTAMPTZ,
    rejection_reason TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- agenda table
CREATE TABLE IF NOT EXISTS agenda (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    jenis agenda_jenis NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    date DATE NOT NULL,
    time_start TIME NOT NULL,
    time_end TIME NOT NULL,
    location TEXT,
    category TEXT,
    target_audience TEXT,
    status agenda_status NOT NULL DEFAULT 'draft',
    google_event_id TEXT,
    google_synced_at TIMESTAMPTZ,
    google_sync_error TEXT,
    created_by UUID NOT NULL REFERENCES profiles(id),
    updated_by UUID REFERENCES profiles(id),
    deleted_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- notifications table
CREATE TABLE IF NOT EXISTS notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    type notification_type NOT NULL,
    title TEXT NOT NULL,
    message TEXT,
    data JSONB DEFAULT '{}',
    is_read BOOLEAN NOT NULL DEFAULT FALSE,
    read_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    batch_id UUID
);

-- gallery table (fixed - no generated columns)
CREATE TABLE IF NOT EXISTS gallery (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    agenda_id UUID REFERENCES agenda(id) ON DELETE SET NULL,
    title TEXT,
    description TEXT,
    file_type file_type NOT NULL,
    file_name TEXT NOT NULL,
    storage_path TEXT NOT NULL,
    thumbnail_path TEXT,
    storage_bucket TEXT NOT NULL DEFAULT 'gallery',
    mime_type TEXT NOT NULL,
    file_size INTEGER,
    width INTEGER,
    height INTEGER,
    uploaded_by UUID NOT NULL REFERENCES profiles(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- activity_logs table
CREATE TABLE IF NOT EXISTS activity_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES profiles(id),
    user_email TEXT NOT NULL,
    action action_type NOT NULL,
    entity_type entity_type NOT NULL,
    entity_id UUID NOT NULL,
    old_data JSONB,
    new_data JSONB,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- settings table
CREATE TABLE IF NOT EXISTS settings (
    key TEXT PRIMARY KEY,
    value JSONB NOT NULL DEFAULT '{}',
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_by UUID REFERENCES profiles(id)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_profiles_user_id ON profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);
CREATE INDEX IF NOT EXISTS idx_profiles_status ON profiles(status);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);
CREATE INDEX IF NOT EXISTS idx_agenda_date ON agenda(date DESC);
CREATE INDEX IF NOT EXISTS idx_agenda_jenis ON agenda(jenis);
CREATE INDEX IF NOT EXISTS idx_agenda_status ON agenda(status);
CREATE INDEX IF NOT EXISTS idx_agenda_deleted_at ON agenda(deleted_at) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user_unread ON notifications(user_id, is_read) WHERE NOT is_read;
CREATE INDEX IF NOT EXISTS idx_activity_logs_user_id ON activity_logs(user_id);

-- RLS Enable
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE agenda ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE gallery ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;

-- RLS Policies (permissive for development)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE agenda ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE gallery ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "profiles_all" ON profiles FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "agenda_all" ON agenda FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "notifications_all" ON notifications FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "gallery_all" ON gallery FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "activity_logs_all" ON activity_logs FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "settings_all" ON settings FOR ALL USING (true) WITH CHECK (true);

-- Seed superadmin
INSERT INTO profiles (email, name, role, status, approved_at)
VALUES ('siagapesarawan@gmail.com', 'Superadmin', 'superadmin', 'approved', NOW())
ON CONFLICT (email) DO NOTHING;
