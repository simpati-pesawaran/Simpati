# SIMPATI - Database Schema

**Version:** 2.0.0  
**Last Updated:** August 2026  
**Document Owner:** Engineering Team  
**Classification:** Internal - Confidential

---

## Table of Contents

1. [Overview](#overview)
2. [Architecture](#architecture)
3. [Schema](#schema)
4. [Enums](#enums)
5. [Tables](#tables)
6. [Functions](#functions)
7. [Triggers](#triggers)
8. [RLS Policies](#rls-policies)
9. [Indexes](#indexes)

---

## Overview

### Database System

| Attribute | Value |
|-----------|-------|
| **Provider** | Supabase (PostgreSQL) |
| **Region** | Southeast Asia |
| **Tier** | Pro |
| **Backup** | Automatic daily |

### Scale Targets

| Metric | Target |
|--------|--------|
| Users | 500 |
| Agendas | 10,000 |
| Photos | 100,000 |
| Notifications | 500,000 |

---

## Architecture

### Data Flow

`
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│   ┌─────────────┐    ┌─────────────┐    ┌─────────────┐    │
│   │   Client    │───▶│   Next.js   │───▶│  Supabase   │    │
│   │   (App)     │◀───│   API       │◀───│  PostgreSQL │    │
│   └─────────────┘    └─────────────┘    └─────────────┘    │
│                                             │               │
│                                             ▼               │
│                                    ┌─────────────┐          │
│                                    │  Supabase  │          │
│                                    │   Storage   │          │
│                                    └─────────────┘          │
│                                                             │
└─────────────────────────────────────────────────────────────┘
`

### Schema Structure

`
public/
├── profiles           # User profiles
├── agenda             # Events (kegiatan + audiensi)
├── notifications      # User notifications
├── gallery            # Photos and documents
├── activity_logs      # Audit trail
└── settings           # App configuration
`

---

## Enums

### user_role

`sql
CREATE TYPE user_role AS ENUM ('superadmin', 'admin');
`

| Value | Description |
|-------|-------------|
| superadmin | Full access, can approve users |
| admin | Standard user access |

### approval_status

`sql
CREATE TYPE approval_status AS ENUM ('pending', 'approved', 'rejected');
`

### agenda_jenis

`sql
CREATE TYPE agenda_jenis AS ENUM ('agenda', 'audiensi');
`

| Value | Description | Calendar Color |
|-------|-------------|----------------|
| agenda | Kegiatan/Event | Green (#22c55e) |
| audiensi | Audiensi/Meeting | Orange (#f59e0b) |

### agenda_status

`sql
CREATE TYPE agenda_status AS ENUM ('draft', 'published', 'cancelled');
`

### notification_type

`sql
CREATE TYPE notification_type AS ENUM (
    'user_registered',
    'user_approved',
    'user_rejected',
    'agenda_created',
    'agenda_updated',
    'agenda_deleted',
    'agenda_reminder'
);
`

---

## Tables

### profiles

User profiles linked to auth.users.

`sql
CREATE TABLE profiles (
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
`

### agenda

Unified table for kegiatan and audiensi.

`sql
CREATE TABLE agenda (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    jenis agenda_jenis NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    date DATE NOT NULL,
    time_start TIME NOT NULL,
    time_end TIME NOT NULL,
    location TEXT,
    status agenda_status NOT NULL DEFAULT 'draft',
    google_event_id TEXT,
    google_synced_at TIMESTAMPTZ,
    created_by UUID NOT NULL REFERENCES profiles(id),
    updated_by UUID REFERENCES profiles(id),
    deleted_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT valid_time_range CHECK (time_end > time_start)
);
`

### notifications

User notifications.

`sql
CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    type notification_type NOT NULL,
    title TEXT NOT NULL,
    message TEXT,
    data JSONB DEFAULT '{}',
    is_read BOOLEAN NOT NULL DEFAULT FALSE,
    read_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
`

### gallery

Photos and documents.

`sql
CREATE TABLE gallery (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    agenda_id UUID REFERENCES agenda(id) ON DELETE SET NULL,
    title TEXT,
    file_type TEXT NOT NULL,
    file_name TEXT NOT NULL,
    storage_path TEXT NOT NULL,
    thumbnail_path TEXT,
    mime_type TEXT NOT NULL,
    file_size INTEGER,
    width INTEGER,
    height INTEGER,
    storage_year INTEGER GENERATED ALWAYS AS (EXTRACT(YEAR FROM created_at)) STORED,
    storage_month INTEGER GENERATED ALWAYS AS (EXTRACT(MONTH FROM created_at)) STORED,
    uploaded_by UUID NOT NULL REFERENCES profiles(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
`

### activity_logs

Audit trail for all actions.

`sql
CREATE TABLE activity_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES profiles(id),
    user_email TEXT NOT NULL,
    action TEXT NOT NULL,
    entity_type TEXT NOT NULL,
    entity_id UUID NOT NULL,
    old_data JSONB,
    new_data JSONB,
    ip_address INET,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
`

### settings

Key-value configuration.

`sql
CREATE TABLE settings (
    key TEXT PRIMARY KEY,
    value JSONB NOT NULL DEFAULT '{}',
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_by UUID REFERENCES profiles(id)
);
`

---

## Functions

### update_updated_at_column()

Auto-updates the updated_at timestamp.

`sql
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS 
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
 LANGUAGE plpgsql;
`

### handle_new_user()

Creates profile on user signup.

`sql
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS 
BEGIN
    INSERT INTO profiles (user_id, email)
    VALUES (NEW.id, NEW.email);
    RETURN NEW;
END;
 LANGUAGE plpgsql SECURITY DEFINER;
`

### check_agenda_collision()

Detects time conflicts.

`sql
CREATE OR REPLACE FUNCTION check_agenda_collision(
    p_date DATE,
    p_time_start TIME,
    p_time_end TIME,
    p_exclude_id UUID DEFAULT NULL
) RETURNS BOOLEAN AS 
DECLARE
    collision_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO collision_count
    FROM agenda
    WHERE date = p_date
        AND deleted_at IS NULL
        AND (p_time_start, p_time_end) OVERLAPS (time_start, time_end)
        AND (p_exclude_id IS NULL OR id != p_exclude_id);
    
    RETURN collision_count > 0;
END;
 LANGUAGE plpgsql;
`

---

## Triggers

### Auto-update timestamps

`sql
CREATE TRIGGER update_profiles_updated_at
    BEFORE UPDATE ON profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_agenda_updated_at
    BEFORE UPDATE ON agenda
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_settings_updated_at
    BEFORE UPDATE ON settings
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
`

### Auto-create profile on signup

`sql
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION handle_new_user();
`

---

## RLS Policies

### Enable RLS

`sql
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE agenda ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE gallery ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;
`

### profiles

`sql
-- Users can read all profiles
CREATE POLICY profiles_select ON profiles
    FOR SELECT USING (true);

-- Users can update own profile
CREATE POLICY profiles_update_own ON profiles
    FOR UPDATE USING (auth.uid() = user_id);

-- Only superadmin can update others
CREATE POLICY profiles_update_all ON profiles
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE user_id = auth.uid() AND role = 'superadmin'
        )
    );
`

### agenda

`sql
-- Approved users can read published agenda
CREATE POLICY agenda_select ON agenda
    FOR SELECT USING (
        deleted_at IS NULL AND (
            status = 'published' OR
            created_by = auth.uid() OR
            EXISTS (SELECT 1 FROM profiles WHERE user_id = auth.uid() AND role = 'superadmin')
        )
    );

-- Approved users can create
CREATE POLICY agenda_insert ON agenda
    FOR INSERT WITH CHECK (
        EXISTS (SELECT 1 FROM profiles WHERE user_id = auth.uid() AND status = 'approved')
    );
`

### notifications

`sql
-- Users can only see own notifications
CREATE POLICY notifications_select ON notifications
    FOR SELECT USING (user_id = auth.uid());

-- Users can update own notifications (mark as read)
CREATE POLICY notifications_update ON notifications
    FOR UPDATE USING (user_id = auth.uid());
`

---

## Indexes

### profiles

`sql
CREATE INDEX idx_profiles_user_id ON profiles(user_id);
CREATE INDEX idx_profiles_email ON profiles(email);
CREATE INDEX idx_profiles_status ON profiles(status);
CREATE INDEX idx_profiles_role ON profiles(role);
`

### agenda

`sql
CREATE INDEX idx_agenda_date ON agenda(date DESC);
CREATE INDEX idx_agenda_jenis ON agenda(jenis);
CREATE INDEX idx_agenda_status ON agenda(status);
CREATE INDEX idx_agenda_creator ON agenda(created_by);
CREATE INDEX idx_agenda_deleted ON agenda(deleted_at) WHERE deleted_at IS NULL;
`

### notifications

`sql
CREATE INDEX idx_notifications_user ON notifications(user_id);
CREATE INDEX idx_notifications_unread ON notifications(user_id, is_read) WHERE NOT is_read;
`

### gallery

`sql
CREATE INDEX idx_gallery_agenda ON gallery(agenda_id);
CREATE INDEX idx_gallery_uploaded ON gallery(uploaded_by);
CREATE INDEX idx_gallery_storage ON gallery(storage_year, storage_month);
`

---

## Migration

### Location

`
supabase/migrations/
├── 001_initial_schema.sql
└── 002_indexes.sql
`

### Running Migrations

1. Open Supabase Dashboard
2. Go to SQL Editor
3. Run migration files in order
4. Verify with:

`sql
SELECT table_name FROM information_schema.tables WHERE table_schema = 'public';
`

Expected: profiles, agenda, notifications, gallery, activity_logs, settings

---

## Document History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 2.0.0 | August 2026 | Engineering | Schema redesign |
| 1.0.0 | Earlier | Engineering | Initial schema |

---

**Previous Document:** [09_ROADMAP.md](./09_ROADMAP.md)  
**Next Document:** [11_API.md](./11_API.md) - API Documentation

---

*This document defines the database schema for SIMPATI.*
