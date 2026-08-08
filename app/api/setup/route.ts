// ============================================================================
// Database Setup API - Run this once to create all tables
// ============================================================================

import { NextResponse } from 'next/server';

// SQL Migration script
const MIGRATION_SQL = `
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ENUMS
DO $$ BEGIN
    CREATE TYPE user_role AS ENUM ('superadmin', 'admin');
EXCEPTION WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE approval_status AS ENUM ('pending', 'approved', 'rejected');
EXCEPTION WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE agenda_jenis AS ENUM ('agenda', 'audiensi');
EXCEPTION WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE agenda_status AS ENUM ('draft', 'published', 'cancelled');
EXCEPTION WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE notification_type AS ENUM ('user_registered', 'user_approved', 'user_rejected', 'agenda_created', 'agenda_updated', 'agenda_deleted', 'agenda_reminder', 'usulan_new');
EXCEPTION WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE action_type AS ENUM ('create', 'update', 'delete', 'approve', 'reject', 'login', 'logout', 'submit', 'sync', 'view', 'publish', 'cancel', 'sync_failure');
EXCEPTION WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE entity_type AS ENUM ('profile', 'agenda', 'notification', 'gallery', 'usulan', 'audiensi', 'auth', 'user');
EXCEPTION WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE file_type AS ENUM ('image', 'document');
EXCEPTION WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE gallery_category AS ENUM ('dokumentasi', 'arsip');
EXCEPTION WHEN duplicate_object THEN null;
END $$;

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
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT valid_approval CHECK (
        (status = 'pending' AND approved_by IS NULL) OR
        (status = 'approved' AND approved_at IS NOT NULL) OR
        (status = 'rejected' AND rejected_at IS NOT NULL)
    )
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
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT valid_time_range CHECK (time_end > time_start)
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

-- gallery table
CREATE TABLE IF NOT EXISTS gallery (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    agenda_id UUID REFERENCES agenda(id) ON DELETE SET NULL,
    title TEXT,
    description TEXT,
    category gallery_category NOT NULL DEFAULT 'dokumentasi',
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

-- usulan table
CREATE TABLE IF NOT EXISTS usulan (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT,
    jenis agenda_jenis NOT NULL,
    date_proposed TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    location TEXT,
    status approval_status NOT NULL DEFAULT 'pending',
    submitted_by UUID NOT NULL REFERENCES profiles(id),
    submitter_name TEXT NOT NULL,
    reviewed_by UUID REFERENCES profiles(id),
    reviewed_at TIMESTAMPTZ,
    rejection_reason TEXT,
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
CREATE INDEX IF NOT EXISTS idx_gallery_category ON gallery(category);
CREATE INDEX IF NOT EXISTS idx_usulan_status ON usulan(status);
CREATE INDEX IF NOT EXISTS idx_usulan_submitted_by ON usulan(submitted_by);

-- RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE agenda ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE gallery ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "profiles_select" ON profiles FOR SELECT USING (true);
CREATE POLICY "profiles_insert" ON profiles FOR INSERT WITH CHECK (true);
CREATE POLICY "profiles_update" ON profiles FOR UPDATE USING (true);
CREATE POLICY "profiles_delete" ON profiles FOR DELETE USING (true);

-- Agenda policies
CREATE POLICY "agenda_select" ON agenda FOR SELECT USING (true);
CREATE POLICY "agenda_insert" ON agenda FOR INSERT WITH CHECK (true);
CREATE POLICY "agenda_update" ON agenda FOR UPDATE USING (true);
CREATE POLICY "agenda_delete" ON agenda FOR DELETE USING (true);

-- Notifications policies
CREATE POLICY "notifications_select" ON notifications FOR SELECT USING (true);
CREATE POLICY "notifications_insert" ON notifications FOR INSERT WITH CHECK (true);
CREATE POLICY "notifications_update" ON notifications FOR UPDATE USING (true);
CREATE POLICY "notifications_delete" ON notifications FOR DELETE USING (true);

-- Gallery policies
CREATE POLICY "gallery_select" ON gallery FOR SELECT USING (true);
CREATE POLICY "gallery_insert" ON gallery FOR INSERT WITH CHECK (true);
CREATE POLICY "gallery_update" ON gallery FOR UPDATE USING (true);
CREATE POLICY "gallery_delete" ON gallery FOR DELETE USING (true);

-- Usulan policies
CREATE POLICY "usulan_select" ON usulan FOR SELECT USING (true);
CREATE POLICY "usulan_insert" ON usulan FOR INSERT WITH CHECK (true);
CREATE POLICY "usulan_update" ON usulan FOR UPDATE USING (true);
CREATE POLICY "usulan_delete" ON usulan FOR DELETE USING (true);

-- Activity logs policies
CREATE POLICY "activity_logs_select" ON activity_logs FOR SELECT USING (true);
CREATE POLICY "activity_logs_insert" ON activity_logs FOR INSERT WITH CHECK (true);

-- Settings policies
CREATE POLICY "settings_select" ON settings FOR SELECT USING (true);
CREATE POLICY "settings_update" ON settings FOR UPDATE USING (true);
CREATE POLICY "settings_insert" ON settings FOR INSERT WITH CHECK (true);

-- Add gallery category column if not exists (for existing tables)
DO $$
BEGIN
    -- Add category column only if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'gallery' AND column_name = 'category') THEN
        ALTER TABLE gallery ADD COLUMN category TEXT NOT NULL DEFAULT 'dokumentasi';
    END IF;
END $$;

-- Add indexes if not exist
CREATE INDEX IF NOT EXISTS idx_gallery_category ON gallery(category);
CREATE INDEX IF NOT EXISTS idx_usulan_status ON usulan(status);
CREATE INDEX IF NOT EXISTS idx_usulan_submitted_by ON usulan(submitted_by);
CREATE INDEX IF NOT EXISTS idx_activity_logs_user_id ON activity_logs(user_id);

-- Seed superadmin
INSERT INTO profiles (email, name, role, status, approved_at)
VALUES ('siagapesawaran@gmail.com', 'Superadmin', 'superadmin', 'approved', NOW())
ON CONFLICT (email) DO NOTHING;
`;

export async function POST() {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !serviceKey) {
      return NextResponse.json(
        { error: 'Missing Supabase configuration' },
        { status: 500 }
      );
    }

    // Execute migration via Supabase REST API
    const response = await fetch(`${supabaseUrl}/rest/v1/rpc/exec`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        apikey: serviceKey,
        Authorization: `Bearer ${serviceKey}`,
      },
      body: JSON.stringify({ query: MIGRATION_SQL }),
    });

    // Alternative: Direct SQL via pg endpoint
    const pgResponse = await fetch(`${supabaseUrl}/rest/v1/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        apikey: serviceKey,
        Authorization: `Bearer ${serviceKey}`,
        Prefer: 'return=minimal',
        'Content-Type': 'text/plain',
      },
    });

    // Check if profiles table exists
    const checkResponse = await fetch(
      `${supabaseUrl}/rest/v1/profiles?select=id&limit=1`,
      {
        headers: {
          apikey: serviceKey,
          Authorization: `Bearer ${serviceKey}`,
        },
      }
    );

    if (checkResponse.ok) {
      return NextResponse.json({
        success: true,
        message: 'Database already configured or setup successful',
      });
    }

    return NextResponse.json({
      success: false,
      message: 'Please run the migration SQL in Supabase Dashboard',
      instructions: {
        step1: 'Go to Supabase Dashboard',
        step2: 'Open SQL Editor',
        step3: 'Copy SQL from supabase/migrations/001_initial_schema.sql',
        step4: 'Execute the SQL',
      },
    });
  } catch (error) {
    console.error('Setup error:', error);
    return NextResponse.json(
      { error: 'Failed to setup database' },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'Database setup endpoint. Use POST to initialize.',
    documentation: 'https://supabase.com/docs/guides/database/database-migrations',
  });
}
