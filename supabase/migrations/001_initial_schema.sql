-- ============================================================================
-- SIMPATI Database Migration v2.0 (Scalability Optimized)
-- Scale: 10K agendas, 500 admins, 100K photos
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

-- TABLES
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
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT valid_approval CHECK (
        (status = 'pending' AND approved_by IS NULL) OR
        (status = 'approved' AND approved_at IS NOT NULL) OR
        (status = 'rejected' AND rejected_at IS NOT NULL)
    )
);

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
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT valid_time_range CHECK (time_end > time_start),
    CONSTRAINT valid_date CHECK (date >= CURRENT_DATE - INTERVAL '1 day')
);

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
    storage_year INTEGER GENERATED ALWAYS AS (EXTRACT(YEAR FROM created_at)) STORED,
    storage_month INTEGER GENERATED ALWAYS AS (EXTRACT(MONTH FROM created_at)) STORED,
    uploaded_by UUID NOT NULL REFERENCES profiles(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

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

CREATE TABLE IF NOT EXISTS settings (
    key TEXT PRIMARY KEY,
    value JSONB NOT NULL DEFAULT '{}',
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_by UUID REFERENCES profiles(id)
);

-- INDEXES (Optimized for 10K agendas, 100K photos, 500 users)
-- profiles
CREATE INDEX IF NOT EXISTS idx_profiles_user_id ON profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);
CREATE INDEX IF NOT EXISTS idx_profiles_status ON profiles(status);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_role_status ON profiles(role, status);

-- agenda - CRITICAL for main queries
CREATE INDEX IF NOT EXISTS idx_agenda_date ON agenda(date DESC);
CREATE INDEX IF NOT EXISTS idx_agenda_jenis ON agenda(jenis);
CREATE INDEX IF NOT EXISTS idx_agenda_status ON agenda(status);
CREATE INDEX IF NOT EXISTS idx_agenda_created_by ON agenda(created_by);
CREATE INDEX IF NOT EXISTS idx_agenda_deleted_at ON agenda(deleted_at) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_agenda_main_query ON agenda(date DESC, jenis, status) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_agenda_collision ON agenda(date, time_start, time_end) WHERE deleted_at IS NULL AND status = 'published';
CREATE INDEX IF NOT EXISTS idx_agenda_creator_date ON agenda(created_by, date DESC) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_agenda_google_pending ON agenda(id) WHERE google_event_id IS NULL AND status = 'published' AND deleted_at IS NULL;

-- notifications - CRITICAL for pagination
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user_unread ON notifications(user_id, is_read) WHERE NOT is_read;
CREATE INDEX IF NOT EXISTS idx_notifications_user_time ON notifications(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_type ON notifications(type);
CREATE INDEX IF NOT EXISTS idx_notifications_batch ON notifications(batch_id) WHERE batch_id IS NOT NULL;

-- gallery - CRITICAL for 100K photos
CREATE INDEX IF NOT EXISTS idx_gallery_agenda_id ON gallery(agenda_id);
CREATE INDEX IF NOT EXISTS idx_gallery_agenda_time ON gallery(agenda_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_gallery_uploaded_by ON gallery(uploaded_by);
CREATE INDEX IF NOT EXISTS idx_gallery_storage_path ON gallery(storage_year, storage_month);
CREATE INDEX IF NOT EXISTS idx_gallery_file_type ON gallery(file_type);

-- activity_logs
CREATE INDEX IF NOT EXISTS idx_activity_logs_user_id ON activity_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_activity_logs_user_time ON activity_logs(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_activity_logs_entity ON activity_logs(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_activity_logs_entity_time ON activity_logs(entity_type, entity_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_activity_logs_action ON activity_logs(action);

-- FUNCTIONS
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
DECLARE is_superadmin BOOLEAN; superadmin_id UUID;
BEGIN
    is_superadmin := NEW.email = 'siagapesyaratan@gmail.com';
    INSERT INTO profiles (user_id, email, name, role, status, approved_at)
    VALUES (
        NEW.id, NEW.email, COALESCE(NEW.raw_user_meta_data->>'name', 'User'),
        CASE WHEN is_superadmin THEN 'superadmin' ELSE 'admin' END,
        CASE WHEN is_superadmin THEN 'approved' ELSE 'pending' END,
        CASE WHEN is_superadmin THEN NOW() ELSE NULL END
    );
    IF NOT is_superadmin THEN
        SELECT id INTO superadmin_id FROM profiles WHERE role = 'superadmin' LIMIT 1;
        IF superadmin_id IS NOT NULL THEN
            INSERT INTO notifications (user_id, type, title, message, data)
            VALUES (superadmin_id, 'user_registered', 'Pendaftaran Baru',
                'Ada pendaftaran baru menunggu persetujuan: ' || NEW.email,
                jsonb_build_object('new_user_email', NEW.email, 'new_user_id', NEW.id));
        END IF;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION check_agenda_collision(p_date DATE, p_time_start TIME, p_time_end TIME, p_id UUID DEFAULT NULL)
RETURNS BOOLEAN AS $$
DECLARE collision_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO collision_count FROM agenda
    WHERE date = p_date AND deleted_at IS NULL AND status = 'published'
        AND id != COALESCE(p_id, '00000000-0000-0000-0000-000000000000'::UUID)
        AND time_start < p_time_end AND time_end > p_time_start;
    RETURN collision_count > 0;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION get_unread_notification_count(p_user_id UUID)
RETURNS INTEGER AS $$
DECLARE count INTEGER;
BEGIN SELECT COUNT(*) INTO count FROM notifications WHERE user_id = p_user_id AND NOT is_read; RETURN count; END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION archive_old_activity_logs(days_to_keep INTEGER DEFAULT 90)
RETURNS INTEGER AS $$
DECLARE deleted_count INTEGER; cutoff_date TIMESTAMPTZ;
BEGIN
    cutoff_date := NOW() - (days_to_keep || ' days')::INTERVAL;
    WITH deleted AS (DELETE FROM activity_logs WHERE created_at < cutoff_date RETURNING id)
    SELECT COUNT(*) INTO deleted_count FROM deleted;
    RAISE NOTICE 'Archived % activity logs older than %', deleted_count, cutoff_date;
    RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION archive_old_notifications(days_to_keep INTEGER DEFAULT 30)
RETURNS INTEGER AS $$
DECLARE deleted_count INTEGER; cutoff_date TIMESTAMPTZ;
BEGIN
    cutoff_date := NOW() - (days_to_keep || ' days')::INTERVAL;
    WITH deleted AS (DELETE FROM notifications WHERE is_read = TRUE AND read_at < cutoff_date RETURNING id)
    SELECT COUNT(*) INTO deleted_count FROM deleted;
    RAISE NOTICE 'Archived % old notifications older than %', deleted_count, cutoff_date;
    RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION generate_storage_path(p_file_type file_type)
RETURNS TEXT AS $$
DECLARE path TEXT; year_part TEXT := EXTRACT(YEAR FROM NOW())::TEXT;
    month_part TEXT := LPAD(EXTRACT(MONTH FROM NOW())::TEXT, 2, '0');
    uuid_part TEXT := gen_random_uuid()::TEXT;
BEGIN
    IF p_file_type = 'image' THEN
        path := 'images/' || year_part || '/' || month_part || '/' || uuid_part || '.webp';
    ELSE path := 'documents/' || year_part || '/' || month_part || '/' || uuid_part; END IF;
    RETURN path;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION get_agenda_heatmap(p_start_date DATE, p_end_date DATE)
RETURNS TABLE (date DATE, day_of_week INTEGER, agenda_count BIGINT, audiensi_count BIGINT) AS $$
BEGIN
    RETURN QUERY
    SELECT d::DATE, EXTRACT(DOW FROM d::DATE)::INTEGER,
        COUNT(*) FILTER (WHERE a.jenis = 'agenda')::BIGINT,
        COUNT(*) FILTER (WHERE a.jenis = 'audiensi')::BIGINT
    FROM generate_series(p_start_date, p_end_date, '1 day'::INTERVAL) d
    LEFT JOIN agenda a ON a.date = d::DATE AND a.deleted_at IS NULL AND a.status = 'published'
    GROUP BY d::DATE ORDER BY d::DATE;
END;
$$ LANGUAGE plpgsql;

-- TRIGGERS
DROP TRIGGER IF EXISTS update_profiles_updated_at ON profiles;
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_agenda_updated_at ON agenda;
CREATE TRIGGER update_agenda_updated_at BEFORE UPDATE ON agenda FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_settings_updated_at ON settings;
CREATE TRIGGER update_settings_updated_at BEFORE UPDATE ON settings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- ROW LEVEL SECURITY
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE agenda ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE gallery ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;

-- profiles policies
CREATE POLICY "profiles_select_own" ON profiles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "profiles_select_superadmin" ON profiles FOR SELECT USING (EXISTS (SELECT 1 FROM profiles WHERE user_id = auth.uid() AND role = 'superadmin'));
CREATE POLICY "profiles_update_own" ON profiles FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "profiles_update_superadmin" ON profiles FOR UPDATE USING (EXISTS (SELECT 1 FROM profiles WHERE user_id = auth.uid() AND role = 'superadmin'));
CREATE POLICY "profiles_insert_system" ON profiles FOR INSERT WITH CHECK (true);

-- agenda policies
CREATE POLICY "agenda_select" ON agenda FOR SELECT USING (
    deleted_at IS NULL AND (status = 'published' OR created_by = (SELECT id FROM profiles WHERE user_id = auth.uid()) OR EXISTS (SELECT 1 FROM profiles WHERE user_id = auth.uid() AND role = 'superadmin'))
);
CREATE POLICY "agenda_insert" ON agenda FOR INSERT WITH CHECK (
    created_by = (SELECT id FROM profiles WHERE user_id = auth.uid()) AND EXISTS (SELECT 1 FROM profiles WHERE user_id = auth.uid() AND status = 'approved')
);
CREATE POLICY "agenda_update" ON agenda FOR UPDATE USING (
    created_by = (SELECT id FROM profiles WHERE user_id = auth.uid()) OR EXISTS (SELECT 1 FROM profiles WHERE user_id = auth.uid() AND role = 'superadmin')
);
CREATE POLICY "agenda_delete" ON agenda FOR DELETE USING (
    created_by = (SELECT id FROM profiles WHERE user_id = auth.uid()) OR EXISTS (SELECT 1 FROM profiles WHERE user_id = auth.uid() AND role = 'superadmin')
);

-- notifications policies
CREATE POLICY "notifications_select" ON notifications FOR SELECT USING (user_id = (SELECT id FROM profiles WHERE user_id = auth.uid()));
CREATE POLICY "notifications_update" ON notifications FOR UPDATE USING (user_id = (SELECT id FROM profiles WHERE user_id = auth.uid()));
CREATE POLICY "notifications_insert" ON notifications FOR INSERT WITH CHECK (true);

-- gallery policies
CREATE POLICY "gallery_select" ON gallery FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "gallery_insert" ON gallery FOR INSERT WITH CHECK (
    uploaded_by = (SELECT id FROM profiles WHERE user_id = auth.uid()) AND EXISTS (SELECT 1 FROM profiles WHERE user_id = auth.uid() AND status = 'approved')
);
CREATE POLICY "gallery_delete" ON gallery FOR DELETE USING (
    uploaded_by = (SELECT id FROM profiles WHERE user_id = auth.uid()) OR EXISTS (SELECT 1 FROM profiles WHERE user_id = auth.uid() AND role = 'superadmin')
);

-- activity_logs policies
CREATE POLICY "activity_logs_select" ON activity_logs FOR SELECT USING (true);
CREATE POLICY "activity_logs_insert" ON activity_logs FOR INSERT WITH CHECK (true);

-- settings policies
CREATE POLICY "settings_select" ON settings FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "settings_update" ON settings FOR UPDATE USING (EXISTS (SELECT 1 FROM profiles WHERE user_id = auth.uid() AND role = 'superadmin'));

-- SEED DATA
INSERT INTO settings (key, value) VALUES
    ('app_name', '{"value": "SIMPATI"}'),
    ('app_version', '{"value": "1.0.0"}'),
    ('google_calendar_sync', '{"enabled": true, "color_agenda": "#22c55e", "color_audiensi": "#f97316"}'),
    ('notification_settings', '{"email_on_user_register": true, "email_on_usulan_new": true}'),
    ('maintenance', '{"activity_log_retention_days": 90, "notification_retention_days": 30}')
ON CONFLICT (key) DO NOTHING;

-- HELPER VIEWS
CREATE OR REPLACE VIEW active_users AS
SELECT p.*, au.email, au.created_at as user_created_at
FROM profiles p JOIN auth.users au ON au.id = p.user_id WHERE p.status = 'approved';

CREATE OR REPLACE VIEW agenda_with_creator AS
SELECT a.*, p.name as creator_name, p.division as creator_division, p.email as creator_email
FROM agenda a JOIN profiles p ON p.id = a.created_by WHERE a.deleted_at IS NULL;

CREATE OR REPLACE VIEW agenda_stats AS
SELECT 
    COUNT(*) FILTER (WHERE deleted_at IS NULL) as total,
    COUNT(*) FILTER (WHERE deleted_at IS NULL AND jenis = 'agenda') as total_kegiatan,
    COUNT(*) FILTER (WHERE deleted_at IS NULL AND jenis = 'audiensi') as total_audiensi,
    COUNT(*) FILTER (WHERE deleted_at IS NULL AND status = 'draft') as draft,
    COUNT(*) FILTER (WHERE deleted_at IS NULL AND status = 'published') as published,
    COUNT(*) FILTER (WHERE deleted_at IS NULL AND date >= CURRENT_DATE) as upcoming
FROM agenda;

CREATE OR REPLACE VIEW notification_summary AS
SELECT user_id, COUNT(*) as total, COUNT(*) FILTER (WHERE NOT is_read) as unread, MAX(created_at) as last_notification
FROM notifications GROUP BY user_id;

CREATE OR REPLACE VIEW gallery_with_details AS
SELECT g.*, p.name as uploader_name, p.division as uploader_division, a.title as agenda_title, a.date as agenda_date
FROM gallery g JOIN profiles p ON p.id = g.uploaded_by LEFT JOIN agenda a ON a.id = g.agenda_id;

CREATE OR REPLACE VIEW recent_activity AS
SELECT al.*, p.name as user_name, p.division as user_division
FROM activity_logs al JOIN profiles p ON p.id = al.user_id ORDER BY al.created_at DESC LIMIT 100;

CREATE OR REPLACE VIEW superadmins AS
SELECT id, email, name, avatar_url FROM profiles WHERE role = 'superadmin' AND status = 'approved';

-- STORAGE BUCKET (Execute in Supabase Dashboard > Storage)
-- INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
-- VALUES ('gallery', 'gallery', true, 10485760, ARRAY['image/jpeg', 'image/png', 'image/webp', 'application/pdf']);

-- Storage policies (for bucket 'gallery')
-- CREATE POLICY "gallery_public_read" ON storage.objects FOR SELECT USING (bucket_id = 'gallery');
-- CREATE POLICY "gallery_auth_upload" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'gallery' AND auth.role() = 'authenticated');
-- CREATE POLICY "gallery_owner_delete" ON storage.objects FOR DELETE USING (bucket_id = 'gallery' AND (auth.uid()::TEXT = (storage.foldername(name))[1] OR EXISTS (SELECT 1 FROM profiles WHERE user_id = auth.uid() AND role = 'superadmin')));

-- ROLLBACK (run only in dev/with backup)
-- DROP TRIGGER IF EXISTS update_profiles_updated_at ON profiles;
-- DROP TRIGGER IF EXISTS update_agenda_updated_at ON agenda;
-- DROP TRIGGER IF EXISTS update_settings_updated_at ON settings;
-- DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
-- DROP FUNCTION IF EXISTS update_updated_at_column();
-- DROP FUNCTION IF EXISTS handle_new_user();
-- DROP FUNCTION IF EXISTS check_agenda_collision(DATE, TIME, TIME, UUID);
-- DROP FUNCTION IF EXISTS get_unread_notification_count(UUID);
-- DROP FUNCTION IF EXISTS archive_old_activity_logs(INTEGER);
-- DROP FUNCTION IF EXISTS archive_old_notifications(INTEGER);
-- DROP FUNCTION IF EXISTS generate_storage_path(file_type);
-- DROP FUNCTION IF EXISTS get_agenda_heatmap(DATE, DATE);
-- DROP TABLE IF EXISTS activity_logs CASCADE;
-- DROP TABLE IF EXISTS gallery CASCADE;
-- DROP TABLE IF EXISTS notifications CASCADE;
-- DROP TABLE IF EXISTS agenda CASCADE;
-- DROP TABLE IF EXISTS settings CASCADE;
-- DROP TABLE IF EXISTS profiles CASCADE;
-- DROP TYPE IF EXISTS user_role;
-- DROP TYPE IF EXISTS approval_status;
-- DROP TYPE IF EXISTS agenda_jenis;
-- DROP TYPE IF EXISTS agenda_status;
-- DROP TYPE IF EXISTS notification_type;
-- DROP TYPE IF EXISTS action_type;
-- DROP TYPE IF EXISTS entity_type;
-- DROP TYPE IF EXISTS file_type;
-- ============================================================================
-- END OF MIGRATION v2.0
-- ============================================================================
