# Database Schema

## Overview

- **Database:** Supabase (PostgreSQL)
- **Schema:** `public`
- **Auth:** Supabase Auth (Google OAuth)
- **Storage:** Supabase Storage (gallery bucket)
- **Migration File:** `supabase/migrations/001_initial_schema.sql`
- **Scale Target:** 10,000 agendas | 500 admins | 100,000 photos

---

## Scalability Analysis

### Target Scale

| Metric | Volume | Strategy |
|--------|--------|----------|
| Agendas | 10,000 | Composite indexes, soft delete, date partitioning ready |
| Admins | 500 | Efficient user lookups, notification batching |
| Photos | 100,000 | Subdirectory storage, thumbnail lazy loading |

### Performance Considerations

#### Indexing Strategy
```
Agenda Queries:
- Main filter: (date DESC, jenis, status) → idx_agenda_main_query
- Collision check: (date, time_start, time_end) → idx_agenda_collision
- User agendas: (created_by, date DESC) → idx_agenda_creator_date

Notification Queries:
- Unread count: (user_id, is_read) WHERE NOT is_read → idx_notifications_user_unread
- Pagination: (user_id, created_at DESC) → idx_notifications_user_time

Gallery Queries:
- By agenda: (agenda_id, created_at DESC) → idx_gallery_agenda_time
- Storage: (storage_year, storage_month) → idx_gallery_storage_path
```

#### Partitioning Readiness
```sql
-- Generated columns for future partitioning
gallery.storage_year INTEGER GENERATED ALWAYS AS (EXTRACT(YEAR FROM created_at)) STORED
gallery.storage_month INTEGER GENERATED ALWAYS AS (EXTRACT(MONTH FROM created_at)) STORED

-- Future: Add PostgreSQL table partitioning when needed
-- PARTITION BY RANGE (date)
```

---

## Entity Relationship Diagram (ERD)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              SIMPATI DATABASE                               │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌─────────────────┐                                                        │
│  │   auth.users    │  (Supabase Auth - Managed)                             │
│  │─────────────────│                                                        │
│  │ id: uuid (PK)  │                                                        │
│  │ email          │                                                        │
│  │ created_at      │                                                        │
│  └────────┬────────┘                                                        │
│           │ 1:1                                                             │
│           ▼                                                                  │
│  ┌─────────────────┐                                                        │
│  │    profiles     │◄──────────────────────┐                                │
│  │─────────────────│                       │ 1:N                            │
│  │ id: uuid (PK)  │                       │                                │
│  │ user_id        │                       │                                │
│  │ email          │                       │         ┌─────────────────┐    │
│  │ name           │                       └─────────│     agenda      │    │
│  │ division       │◄───────────────────────────────  │─────────────────│    │
│  │ role           │◄──┐                               │ id: uuid (PK)  │    │
│  │ status         │   │                               │ jenis: enum     │    │
│  └────────┬────────┘   │                               │ title          │    │
│           │             │                               │ date           │    │
│           │ 1:N         │                               │ time_start     │    │
│           ▼             │                               │ time_end       │    │
│  ┌─────────────────┐    │                               │ status         │    │
│  │  notifications  │    │                               │ google_event_id│    │
│  │─────────────────│    │                               │ created_by     │    │
│  │ id: uuid (PK)  │    │                               └────────┬────────┘    │
│  │ user_id        │    │                                        │ 1:N            │
│  │ type           │    │                                        ▼                │
│  │ title          │    │                               ┌─────────────────┐    │
│  │ is_read        │    │                               │     gallery     │    │
│  │ created_at     │    │                               │─────────────────│    │
│  └─────────────────┘    │                               │ id: uuid (PK)  │    │
│                         │                               │ agenda_id      │    │
│  ┌─────────────────┐    │                               │ file_type      │    │
│  │ activity_logs   │    │                               │ storage_path    │    │
│  │─────────────────│    │                               │ storage_year    │    │
│  │ id: uuid (PK)  │────┘                               │ storage_month   │    │
│  │ user_id        │                                    │ uploaded_by     │    │
│  │ action         │                                    └─────────────────┘    │
│  │ entity_type    │                                                        │
│  │ entity_id      │                                                        │
│  └─────────────────┘                                                        │
│                                                                             │
│  ┌─────────────────┐                                                        │
│  │    settings     │                                                        │
│  │─────────────────│                                                        │
│  │ key: text (PK) │                                                        │
│  │ value: jsonb   │                                                        │
│  └─────────────────┘                                                        │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Table Summary

| Table | Rows (Max) | Purpose | Parent | Children |
|-------|------------|---------|--------|----------|
| `profiles` | ~500 | User profiles & approval | auth.users | agenda, notifications, gallery, activity_logs |
| `agenda` | ~10,000 | Kegiatan & Audiensi | profiles | gallery |
| `notifications` | ~100,000 | Bell notifications | profiles | - |
| `gallery` | ~100,000 | Photos & documents | profiles, agenda | - |
| `activity_logs` | ~500,000 | Audit trail | profiles | - |
| `settings` | ~20 | App configuration | - | - |

---

## Enums

### user_role
```sql
DO $$ BEGIN CREATE TYPE user_role AS ENUM ('superadmin', 'admin');
EXCEPTION WHEN duplicate_object THEN null; END $$;
```
| Value | Description |
|-------|-------------|
| `superadmin` | Full access, can approve users |
| `admin` | Standard user access |

### approval_status
```sql
DO $$ BEGIN CREATE TYPE approval_status AS ENUM ('pending', 'approved', 'rejected');
EXCEPTION WHEN duplicate_object THEN null; END $$;
```

### agenda_jenis
```sql
DO $$ BEGIN CREATE TYPE agenda_jenis AS ENUM ('agenda', 'audiensi');
EXCEPTION WHEN duplicate_object THEN null; END $$;
```
| Value | Description | Calendar Color |
|-------|-------------|----------------|
| `agenda` | Kegiatan/Event | Green (#22c55e) |
| `audiensi` | Audiensi/Meeting | Orange (#f97316) |

### agenda_status
```sql
DO $$ BEGIN CREATE TYPE agenda_status AS ENUM ('draft', 'published', 'cancelled');
EXCEPTION WHEN duplicate_object THEN null; END $$;
```

### notification_type
```sql
DO $$ BEGIN CREATE TYPE notification_type AS ENUM (
    'user_registered', 'user_approved', 'user_rejected',
    'agenda_created', 'agenda_updated', 'agenda_deleted',
    'agenda_reminder', 'usulan_new'
);
EXCEPTION WHEN duplicate_object THEN null; END $$;
```

### action_type
```sql
DO $$ BEGIN CREATE TYPE action_type AS ENUM (
    'create', 'update', 'delete', 'approve', 'reject', 'login', 'logout'
);
EXCEPTION WHEN duplicate_object THEN null; END $$;
```

### entity_type
```sql
DO $$ BEGIN CREATE TYPE entity_type AS ENUM ('profile', 'agenda', 'notification', 'gallery');
EXCEPTION WHEN duplicate_object THEN null; END $$;
```

### file_type
```sql
DO $$ BEGIN CREATE TYPE file_type AS ENUM ('image', 'document');
EXCEPTION WHEN duplicate_object THEN null; END $$;
```

---

## Tables Detail

### 1. profiles

User profiles linked 1:1 with `auth.users`.

```sql
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
    CONSTRAINT valid_approval CHECK (...)
);
```

**Indexes:**
| Index | Columns | Type | Purpose |
|-------|---------|------|---------|
| `idx_profiles_user_id` | user_id | B-tree | FK lookup |
| `idx_profiles_email` | email | B-tree | Unique constraint + login |
| `idx_profiles_status` | status | B-tree | Filter by status |
| `idx_profiles_role` | role | B-tree | Role-based queries |
| `idx_profiles_role_status` | role, status | B-tree | Superadmin + approved filter |

---

### 2. agenda

Unified table for kegiatan and audiensi.

```sql
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
```

**Indexes (Optimized for 10K rows):**
| Index | Columns | Type | Purpose |
|-------|---------|------|---------|
| `idx_agenda_date` | date DESC | B-tree | Calendar view |
| `idx_agenda_jenis` | jenis | B-tree | Filter by type |
| `idx_agenda_status` | status | B-tree | Filter by status |
| `idx_agenda_main_query` | date DESC, jenis, status | B-tree | **Main list query** |
| `idx_agenda_collision` | date, time_start, time_end | B-tree | **Overlap detection** |
| `idx_agenda_creator_date` | created_by, date DESC | B-tree | **My agendas** |
| `idx_agenda_google_pending` | id | B-tree | Google sync queue |

**Constraints:**
- `valid_time_range`: End must be after start
- `valid_date`: No past events (except 1 day buffer)

---

### 3. notifications

Bell notifications with batch support.

```sql
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
```

**Indexes (Optimized for 100K rows):**
| Index | Columns | Type | Purpose |
|-------|---------|------|---------|
| `idx_notifications_user_id` | user_id | B-tree | FK lookup |
| `idx_notifications_user_unread` | user_id, is_read | B-tree | **Unread badge** |
| `idx_notifications_user_time` | user_id, created_at DESC | B-tree | **Pagination** |
| `idx_notifications_type` | type | B-tree | Filter by type |

---

### 4. gallery

Photos and documents with storage optimization.

```sql
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
```

**Storage Path Structure:**
```
gallery/
├── images/
│   ├── 2026/
│   │   ├── 01/
│   │   │   ├── {uuid}.webp
│   │   │   └── {uuid}_thumb.webp
│   │   └── 02/
│   └── 2027/
└── documents/
    └── {year}/{month}/{uuid}
```

**Indexes (Optimized for 100K rows):**
| Index | Columns | Type | Purpose |
|-------|---------|------|---------|
| `idx_gallery_agenda_id` | agenda_id | B-tree | Gallery by agenda |
| `idx_gallery_agenda_time` | agenda_id, created_at DESC | B-tree | **Ordered gallery** |
| `idx_gallery_uploaded_by` | uploaded_by | B-tree | My uploads |
| `idx_gallery_storage_path` | storage_year, storage_month | B-tree | **Storage cleanup** |
| `idx_gallery_file_type` | file_type | B-tree | Filter by type |

---

### 5. activity_logs

Audit trail for all actions.

```sql
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
```

**Indexes:**
| Index | Columns | Type | Purpose |
|-------|---------|------|---------|
| `idx_activity_logs_user_id` | user_id | B-tree | My activities |
| `idx_activity_logs_user_time` | user_id, created_at DESC | B-tree | **My recent** |
| `idx_activity_logs_entity` | entity_type, entity_id | B-tree | Entity history |
| `idx_activity_logs_entity_time` | entity_type, entity_id, created_at DESC | B-tree | **Audit trail** |
| `idx_activity_logs_action` | action | B-tree | Action filter |

---

### 6. settings

Key-value configuration store.

```sql
CREATE TABLE IF NOT EXISTS settings (
    key TEXT PRIMARY KEY,
    value JSONB NOT NULL DEFAULT '{}',
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_by UUID REFERENCES profiles(id)
);
```

**Default Settings:**
```sql
INSERT INTO settings (key, value) VALUES
    ('app_name', '{"value": "SIMPATI"}'),
    ('app_version', '{"value": "1.0.0"}'),
    ('google_calendar_sync', '{"enabled": true, "color_agenda": "#22c55e", "color_audiensi": "#f97316"}'),
    ('notification_settings', '{"email_on_user_register": true, "email_on_usulan_new": true}'),
    ('maintenance', '{"activity_log_retention_days": 90, "notification_retention_days": 30}');
```

---

## Functions

### Core Functions

| Function | Purpose | Performance |
|----------|---------|--------------|
| `update_updated_at_column()` | Auto-timestamp trigger | O(1) |
| `handle_new_user()` | Auto-create profile on signup | O(1) + notification |
| `check_agenda_collision()` | Detect time overlap | O(n) on date filter |
| `get_unread_notification_count()` | Badge count | O(1) with index |
| `generate_storage_path()` | Create storage path | O(1) |

### Maintenance Functions

| Function | Purpose | Schedule |
|----------|---------|----------|
| `archive_old_activity_logs(days)` | Clean logs older than N days | Daily |
| `archive_old_notifications(days)` | Clean read notifications | Daily |

### Analytics Functions

| Function | Purpose |
|----------|---------|
| `get_agenda_heatmap(start, end)` | Calendar heatmap data |
| `get_agenda_stats()` | Dashboard statistics |

---

## Triggers

```sql
-- Auto-update timestamps
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_agenda_updated_at BEFORE UPDATE ON agenda FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_settings_updated_at BEFORE UPDATE ON settings FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Auto-create profile on Google signup
CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users FOR EACH ROW
    EXECUTE FUNCTION handle_new_user();
```

---

## Row Level Security (RLS)

### Security Model

```
┌─────────────────────────────────────────────────────────────┐
│                    RLS Access Matrix                         │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  profiles                                                   │
│  ├── Own profile: SELECT, UPDATE                           │
│  └── Superadmin: SELECT, UPDATE all                        │
│                                                              │
│  agenda                                                     │
│  ├── Published: SELECT (all approved users)                 │
│  ├── Own drafts: SELECT, UPDATE, DELETE                     │
│  └── Superadmin: SELECT, UPDATE, DELETE all                │
│                                                              │
│  notifications                                              │
│  └── Own: SELECT, UPDATE (mark as read)                    │
│                                                              │
│  gallery                                                    │
│  ├── All authenticated: SELECT                             │
│  ├── Approved users: INSERT                                │
│  └── Own uploads / Superadmin: DELETE                      │
│                                                              │
│  activity_logs                                              │
│  └── All users: SELECT (read-only)                         │
│                                                              │
│  settings                                                   │
│  ├── All authenticated: SELECT                             │
│  └── Superadmin: UPDATE                                    │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### Policy Best Practices

1. **Use `EXISTS` for role checks** - More efficient than JOIN
2. **Use subquery with index** - `SELECT id FROM profiles WHERE user_id = auth.uid()`
3. **Separate SELECT from UPDATE policies** - Fine-grained control

---

## Performance Optimizations

### For 10,000 Agendas

```sql
-- Main query optimization
EXPLAIN ANALYZE
SELECT a.*, p.name as creator_name
FROM agenda a
JOIN profiles p ON p.id = a.created_by
WHERE a.deleted_at IS NULL
    AND a.date >= '2026-01-01' AND a.date <= '2026-12-31'
    AND a.jenis = 'agenda'
    AND a.status = 'published'
ORDER BY a.date DESC
LIMIT 20;

-- Expected: Index Scan using idx_agenda_main_query
-- Time: < 10ms
```

### For 100,000 Notifications

```sql
-- Unread count (for badge)
SELECT get_unread_notification_count('user-uuid');

-- Paginated notification list
SELECT *
FROM notifications
WHERE user_id = 'user-uuid'
ORDER BY created_at DESC
LIMIT 20 OFFSET 0;

-- Expected: Index Scan using idx_notifications_user_time
-- Time: < 5ms
```

### For 100,000 Photos

```sql
-- Gallery by agenda (paginated)
SELECT *
FROM gallery
WHERE agenda_id = 'agenda-uuid'
ORDER BY created_at DESC
LIMIT 20;

-- Expected: Index Scan using idx_gallery_agenda_time
-- Time: < 5ms
```

---

## Data Retention & Maintenance

### Cleanup Strategy

```sql
-- Archive activity logs older than 90 days
SELECT archive_old_activity_logs(90);

-- Archive read notifications older than 30 days
SELECT archive_old_notifications(30);
```

### Recommended Cron Schedule

```
0 3 * * *  SELECT archive_old_activity_logs(90);   -- Daily 3 AM
0 4 * * *  SELECT archive_old_notifications(30);  -- Daily 4 AM
```

### Storage Cleanup

```sql
-- Find orphaned files in storage
-- (Compare gallery.storage_path with actual storage files)
-- Then delete orphaned files
```

---

## Migration File

**Location:** `supabase/migrations/001_initial_schema.sql`

**Execution:**
1. Open Supabase Dashboard → SQL Editor
2. Copy entire contents of migration file
3. Execute

**Verification:**
```sql
-- Check tables
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' ORDER BY table_name;

-- Expected: activity_logs, agenda, gallery, notifications, profiles, settings

-- Check indexes
SELECT indexname FROM pg_indexes 
WHERE tablename IN ('agenda', 'gallery', 'notifications', 'activity_logs')
ORDER BY tablename, indexname;

-- Check RLS
SELECT tablename, rowsecurity 
FROM pg_tables WHERE schemaname = 'public';
```

---

## Future Optimizations (When Scale Increases)

### 1. Table Partitioning (When > 50K rows)

```sql
-- Partition agenda by year
CREATE TABLE agenda_partitioned (...) PARTITION BY RANGE (date);

-- Create partitions
CREATE TABLE agenda_2026 PARTITION OF agenda_partitioned
    FOR VALUES FROM ('2026-01-01') TO ('2027-01-01');
```

### 2. Materialized Views (For Dashboards)

```sql
CREATE MATERIALIZED VIEW agenda_monthly_stats AS
SELECT 
    DATE_TRUNC('month', date) as month,
    jenis,
    COUNT(*) as total
FROM agenda WHERE deleted_at IS NULL
GROUP BY 1, 2;

CREATE UNIQUE INDEX ON agenda_monthly_stats (month, jenis);

REFRESH MATERIALIZED VIEW CONCURRENTLY agenda_monthly_stats;
```

### 3. Connection Pooling

Supabase handles this automatically, but monitor:
- `pg_stat_activity` for connection count
- `pg_bouncer_stats` if using PgBouncer

---

## Security Checklist

- [x] RLS enabled on all tables
- [x] Service role key protected
- [x] No raw SQL in client code
- [x] Prepared statements for dynamic queries
- [x] Input validation (application layer)
- [x] HTTPS only
- [x] CORS configured
- [x] Rate limiting (Vercel)
- [x] Audit logging (activity_logs)

---

*Database Schema v2.0 - August 2026*
*Reviewed by: Senior Database Architect*
*Scale Target: 10K agendas | 500 admins | 100K photos*
