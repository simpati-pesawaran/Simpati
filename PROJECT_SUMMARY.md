# SIMPATI - Ringkasan Project

## 📋 Deskripsi Project
**SIMPATI** - Sistem Informasi Manajemen Protokol & Agenda Terintegrasi

Sistem manajemen agenda kerja dengan fitur:
- Login Google OAuth
- Approval system (pending/approved/rejected)
- CRUD Agenda & Audiensi
- Google Calendar sync (Supabase → Calendar)
- Google Sheets export
- Notifikasi real-time
- Premium mobile-first UI (Inter font, navy-purple gradient)

---

## 🔐 Kredensial & Konfigurasi

> ⚠️ **PENTING**: Semua kredensial lengkap ada di file `.env.local` (jangan push ke git!)

### 1. Vercel Deployment
```
URL: https://simpati-silk.vercel.app
Repository: github.com/simpati-pesawaran/Simpati
```

### 2. Google Cloud Console (console.cloud.google.com)
```
Project ID: simpati-app
OAuth Redirect URI:
  https://simpati-silk.vercel.app/api/auth/callback/google
```
*(Client ID & Secret ada di .env.local)*

### 3. Supabase Database
```
URL: https://xxxxxxxxxxxx.supabase.co
```
*(Anon Key & Service Role Key ada di .env.local)*

### 4. Environment Variables (.env.local) - Template
```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxxxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# NextAuth
NEXTAUTH_URL=https://simpati-silk.vercel.app
NEXTAUTH_SECRET=generate-dengan-openssl-rand-base64-32

# Google OAuth
GOOGLE_CLIENT_ID=xxx.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-xxx

# Google Calendar API
GOOGLE_CALENDAR_ID=primary
GOOGLE_SERVICE_ACCOUNT_EMAIL=xxx@simpati-app.iam.gserviceaccount.com
GOOGLE_SERVICE_ACCOUNT_KEY={"type":"service_account",...}

# Google Sheets API
GOOGLE_SHEETS_ID=xxx
```

---

## 🗄️ Database Schema (Supabase PostgreSQL)

### Table: profiles
```sql
- id UUID PRIMARY KEY (references auth.users)
- email TEXT UNIQUE NOT NULL
- name TEXT
- division TEXT
- role TEXT DEFAULT 'user' (values: 'superadmin', 'admin', 'user')
- status TEXT DEFAULT 'pending' (values: 'pending', 'approved', 'rejected')
- rejection_reason TEXT
- created_at TIMESTAMPTZ DEFAULT NOW()
- updated_at TIMESTAMPTZ DEFAULT NOW()
```

### Table: agendas
```sql
- id UUID PRIMARY KEY DEFAULT gen_random_uuid()
- title TEXT NOT NULL
- description TEXT
- type TEXT NOT NULL (values: 'agenda', 'audiensi')
- date DATE NOT NULL
- time TIME
- location TEXT
- attendees TEXT[]
- pic_id UUID REFERENCES profiles(id)
- status TEXT DEFAULT 'scheduled'
- google_event_id TEXT
- created_by UUID REFERENCES profiles(id)
- created_at TIMESTAMPTZ DEFAULT NOW()
- updated_at TIMESTAMPTZ DEFAULT NOW()
```

### Table: notifications
```sql
- id UUID PRIMARY KEY DEFAULT gen_random_uuid()
- user_id UUID REFERENCES profiles(id)
- title TEXT NOT NULL
- message TEXT
- type TEXT DEFAULT 'info'
- is_read BOOLEAN DEFAULT FALSE
- link TEXT
- created_at TIMESTAMPTZ DEFAULT NOW()
```

### Table: user_settings
```sql
- id UUID PRIMARY KEY DEFAULT gen_random_uuid()
- user_id UUID UNIQUE REFERENCES profiles(id)
- email_notifications BOOLEAN DEFAULT TRUE
- calendar_sync BOOLEAN DEFAULT FALSE
- google_calendar_token TEXT
- created_at TIMESTAMPTZ DEFAULT NOW()
- updated_at TIMESTAMPTZ DEFAULT NOW()
```

---

## 🔑 Akun Penting

### Superadmin
```
Email: siagapesarawan@gmail.com
Role: superadmin
Status: approved
Akses: Full access, approve/reject users, manage all agendas
```

---

## 📁 Struktur File Penting

```
C:\simpati\
├── app/
│   ├── layout.tsx              # Root layout (HARUS import globals.css)
│   ├── globals.css             # Design system v2.0, CSS variables, Tailwind v3
│   ├── page.tsx                # Landing/Dashboard
│   ├── providers.tsx           # NextAuth & Supabase providers
│   ├── login/
│   │   ├── page.tsx            # Login page (Google OAuth)
│   │   ├── pending/page.tsx    # Waiting approval page
│   │   └── rejected/page.tsx   # Rejected page + reapply form
│   ├── dashboard/
│   │   └── page.tsx            # Main dashboard
│   └── api/
│       ├── auth/[...nextauth]/route.ts
│       ├── auth/profile/route.ts
│       ├── agendas/route.ts
│       └── notifications/route.ts
├── lib/
│   ├── supabase/
│   │   ├── index.ts            # Supabase client
│   │   └── server.ts           # Server-side client
│   └── google/
│       ├── calendar.ts         # Google Calendar sync
│       └── sheets.ts           # Google Sheets export
├── components/
│   ├── ui/                     # Reusable UI components
│   └── ...                     # Other components
├── supabase/
│   └── migrations/
│       └── 001_initial_schema.sql
└── .env.local                  # Environment variables (di .gitignore)
```

---

## 🎨 Design System v2.0

### Color Palette
```css
/* Primary: Blue-Purple Gradient */
--color-primary: #9333ea;        /* Purple-600 */
--color-blue-accent: #3b82f6;   /* Blue-500 */
--gradient-primary: linear-gradient(135deg, #9333ea 0%, #3b82f6 100%);

/* Status Colors */
--color-success: #22c55e;
--color-warning: #f59e0b;
--color-error: #ef4444;
--color-info: #3b82f6;

/* Neutrals */
--color-text-primary: #18181b;
--color-text-secondary: #71717a;
--color-bg: #ffffff;
--color-bg-secondary: #f4f4f5;
```

### Typography
```css
--font-family: 'Inter', sans-serif;
--text-sm: 0.8125rem;   /* 13px */
--text-base: 0.9375rem; /* 15px */
--text-lg: 1.0625rem;   /* 17px */
--text-xl: 1.25rem;     /* 20px */
```

### Layout
```css
--container-max-width: 430px;  /* Mobile app container */
--radius-lg: 14px;
--radius-xl: 20px;
--radius-2xl: 28px;
```

---

## 🔧 Tech Stack

| Teknologi | Versi | Catatan |
|-----------|-------|---------|
| Next.js | 16.3.0 | Latest (App Router) |
| React | 19.x | - |
| Tailwind CSS | 3.4.0 | Downgraded from v4 (Windows compatibility) |
| Supabase | Latest | PostgreSQL + Auth |
| NextAuth.js | v4 | Google OAuth |
| TypeScript | Latest | - |
| Vercel | - | Deployment platform |

---

## ⚠️ Catatan Penting

### Windows Compatibility Issues
- Next.js 16.3.0 memiliki SWC WASM binding issues di Windows
- Workaround: `npm run build -- --webpack`
- Vercel build: Normal, tidak perlu workaround

### CSS Import Order (CRITICAL)
- `@import` untuk fonts HARUS di baris pertama
- Harus sebelum `@tailwind` directives
- Salah:
  ```css
  @tailwind base;
  @import url('...');  /* ❌ ERROR */
  ```
- Benar:
  ```css
  @import url('...');  /* ✅ FIRST */
  @tailwind base;
  @tailwind components;
  @tailwind utilities;
  ```

### Root Layout Requirement
- `app/layout.tsx` WAJIB import `globals.css`:
  ```tsx
  import "./globals.css";
  ```

---

## 📝 Changelog

### v2.0 - Premium Design System
- Inter font
- Blue-purple gradient header
- Card-based UI
- Mobile app container (430px max)
- Smooth animations

### v1.0 - Basic
- Initial setup
- Basic auth flow

---

## 🚀 Deployment Checklist

1. [x] Supabase project created
2. [x] Migration run successfully
3. [x] Google OAuth configured
4. [x] NextAuth setup
5. [x] Login page with premium UI
6. [x] Pending/Approved/Rejected pages
7. [ ] Dashboard full implementation
8. [ ] CRUD Agenda
9. [ ] Google Calendar sync
10. [ ] Google Sheets export
11. [ ] Notifications system
12. [ ] PWA optimization

---

## 🔗 Link Penting

| Service | URL |
|---------|-----|
| Vercel Dashboard | https://vercel.com/dashboard |
| Supabase Dashboard | https://supabase.com/dashboard |
| Google Cloud Console | https://console.cloud.google.com |
| GitHub Repository | https://github.com/simpati-pesawaran/Simpati |

---

*Last Updated: 2026-08-05*
*Project Owner: siagapesarawan@gmail.com*
