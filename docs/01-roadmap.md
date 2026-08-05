# Roadmap

## Tahap Implementasi

```
1. Setup Supabase
   ├── Create project di Supabase Dashboard
   ├── Setup storage bucket "gallery"
   ├── Configure environment variables
   └── Setup Google OAuth provider

2. Database Schema ✓ OPTIMIZED
   ├── Run: supabase/migrations/001_initial_schema.sql
   ├── 8 Enums (idempotent)
   ├── 6 Tables with constraints
   ├── 26 Indexes (optimized for 10K/100K scale)
   ├── 8 Functions (including maintenance)
   ├── 5 Triggers (auto-update, auto-signup)
   ├── 15 RLS Policies (fine-grained access)
   ├── 7 Helper Views
   └── Seed data + rollback script
   │
   └── Scale Target: 10K agendas, 500 admins, 100K photos

3. Authentication Flow
   ├── Google Login
   ├── Input Nama & Divisi
   ├── Approval System (Superadmin)
   └── Notification to Superadmin

4. Core UI & Navigation
   ├── Header (Logo + Bell)
   ├── Bottom Nav (Beranda | FAB | Akun)
   └── Page layouts

5. CRUD Agenda
   ├── List agenda (filter by jenis: Agenda/Audiensi)
   ├── Create form
   ├── Edit & Delete
   ├── Collision detection (using check_agenda_collision)
   └── Activity logging

6. Gallery
   ├── Upload dengan compression
   ├── WebP conversion
   ├── Thumbnail generation
   └── Grid view

7. Notification System
   ├── Bell dropdown
   ├── Real-time updates
   └── Email notification (Superadmin)

8. Google Calendar Sync
   ├── Create events (one-way: Supabase → Calendar)
   ├── Update events
   ├── Delete events
   └── Color coding:
       ├── Agenda = Hijau (#22c55e)
       └── Audiensi = Orange (#f97316)

9. Google Sheets Export
   ├── Export agenda
   ├── Backup functionality
   └── Report generation

10. PWA Optimization
    ├── manifest.json
    ├── Service Worker
    ├── Install Prompt
    ├── Offline Page
    ├── Splash Screen
    ├── App Icon
    ├── Background Sync
    └── Push Notification (future ready)

11. Production Deployment
    ├── Vercel production
    ├── Environment variables
    └── Performance audit
```

---

## Database Optimization Summary

### Scalability Features

| Feature | Purpose | Impact |
|---------|---------|--------|
| Composite Indexes | Optimized query patterns | <10ms query time |
| Partial Indexes | Filter only active data | 50% smaller indexes |
| Generated Columns | Future partitioning ready | No migration needed |
| Maintenance Functions | Auto-cleanup old data | Bounded table growth |
| Storage Subdirectories | Prevent filesystem overload | Balanced file distribution |

### Indexes by Table

```
profiles:         5 indexes
agenda:          9 indexes (including main_query, collision)
notifications:    5 indexes (including user pagination)
gallery:         5 indexes (including time-ordered queries)
activity_logs:   5 indexes (including audit trail)
settings:        0 (PK only)

TOTAL:           26 indexes
```

### Functions by Category

```
Core:            6 functions
Maintenance:     2 functions (archive_old_*)
Analytics:       1 function (get_agenda_heatmap)

TOTAL:           9 functions
```

---

## Phase Dependencies

```
┌──────────────┐
│   Supabase   │
│   Project    │
└──────┬───────┘
       │
       ▼
┌──────────────┐
│   Database   │◄── supabase/migrations/001_initial_schema.sql
│   Schema     │    (v2.0 - Scalability Optimized)
└──────┬───────┘
       │
       ▼
┌──────────────┐
│  Auth Flow   │
│  (Google)    │
└──────┬───────┘
       │
       ▼
┌──────────────┐
│  Core UI &   │
│  Navigation  │
└──────┬───────┘
       │
       ▼
┌──────────────┐     ┌──────────────┐
│   Agenda     │────▶│   Calendar   │
│   CRUD       │     │   Sync       │
└──────┬───────┘     └──────────────┘
       │
       ▼
┌──────────────┐
│   Gallery    │
│   & Notifs   │
└──────┬───────┘
       │
       ▼
┌──────────────┐     ┌──────────────┐
│   Sheets     │     │     PWA      │
│   Export     │     │   Optimize   │
└──────────────┘     └──────────────┘
       │
       ▼
┌──────────────┐
│  Production  │
│  Deploy      │
└──────────────┘
```

---

*Last updated: August 2026*
*Database version: v2.0 (Scalability Optimized)*
