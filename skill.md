# 🛠️ SIMPATI - Technical Specification

## 📋 Project Information

**Nama:** SIMPATI
**Deskripsi:** Sistem Informasi Manajemen Protokol & Agenda Terintegrasi
**Tech Stack:** Next.js 14, TypeScript, Tailwind CSS

---

## 🔧 Tech Stack

### Core Framework
| Package | Version | Purpose |
|---------|---------|---------|
| next | ^14.x | React framework (App Router) |
| react | ^18.x | UI library |
| react-dom | ^18.x | React DOM |
| typescript | ^5.x | Type safety |

### Styling
| Package | Version | Purpose |
|---------|---------|---------|
| tailwindcss | ^3.x | CSS framework |
| clsx | ^2.x | Conditional classNames |
| tailwind-merge | ^2.x | Tailwind class merging |

### Authentication
| Package | Version | Purpose |
|---------|---------|---------|
| next-auth | ^4.x | Authentication (Google OAuth) |

### Google APIs
| Package | Version | Purpose |
|---------|---------|---------|
| googleapis | ^130.x | Google Sheets & Calendar API |
| google-auth-library | ^9.x | OAuth2 client |

### UI Components
| Package | Version | Purpose |
|---------|---------|---------|
| @heroicons/react | ^24.x | Icon library |
| lucide-react | ^0.x | Modern icons (alternative) |

### Utilities
| Package | Version | Purpose |
|---------|---------|---------|
| date-fns | ^3.x | Date manipulation |
| browser-image-compression | ^2.x | Image compression (client) |
| sharp | ^0.33.x | Image processing (server) |

### Development
| Package | Version | Purpose |
|---------|---------|---------|
| eslint | ^8.x | Linting |
| prettier | ^3.x | Code formatting |
| autoprefixer | ^10.x | PostCSS plugin |

---

## 📁 Folder Structure

```
C:\simpati\
├── src/
│   ├── app/
│   │   ├── (auth)/
│   │   │   └── login/
│   │   │       └── page.tsx
│   │   ├── (admin)/
│   │   │   ├── layout.tsx          # Admin layout with nav
│   │   │   ├── dashboard/
│   │   │   ├── kegiatan/
│   │   │   ├── audensi/
│   │   │   ├── calendar/
│   │   │   ├── galeri/
│   │   │   ├── usulan/
│   │   │   ├── log-aktivitas/
│   │   │   └── profile/
│   │   ├── (public)/
│   │   │   ├── agenda/
│   │   │   ├── kalender/
│   │   │   └── usul/
│   │   ├── api/
│   │   │   ├── auth/
│   │   │   │   └── [...nextauth]/
│   │   │   ├── kegiatan/
│   │   │   ├── audensi/
│   │   │   ├── galeri/
│   │   │   ├── google-sheets/
│   │   │   └── google-calendar/
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   └── globals.css
│   ├── components/
│   │   ├── ui/
│   │   │   ├── Button.tsx
│   │   │   ├── Card.tsx
│   │   │   ├── Input.tsx
│   │   │   ├── Modal.tsx
│   │   │   └── Badge.tsx
│   │   ├── layout/
│   │   │   ├── Header.tsx
│   │   │   ├── BottomNav.tsx
│   │   │   └── Sidebar.tsx
│   │   ├── forms/
│   │   │   ├── KegiatanForm.tsx
│   │   │   ├── AudensiForm.tsx
│   │   │   └── UsulanForm.tsx
│   │   └── notifications/
│   │       ├── BellIcon.tsx
│   │       └── NotificationDropdown.tsx
│   ├── lib/
│   │   ├── auth.ts              # NextAuth config
│   │   ├── google-sheets.ts     # Sheets API client
│   │   ├── google-calendar.ts   # Calendar API client
│   │   ├── utils.ts             # Utility functions
│   │   └── validators.ts        # Form validation
│   ├── types/
│   │   ├── kegiatan.ts
│   │   ├── audensi.ts
│   │   ├── usulan.ts
│   │   └── user.ts
│   └── hooks/
│       ├── useAuth.ts
│       ├── useGoogleSheets.ts
│       └── useGoogleCalendar.ts
├── public/
│   ├── icons/
│   │   ├── icon-192.png
│   │   ├── icon-512.png
│   │   └── apple-touch-icon.png
│   ├── manifest.json
│   └── sw.js                    # Service Worker
├── .env.local                   # Environment variables (local)
├── .env.example                 # Template env vars
├── package.json
├── tailwind.config.ts
├── next.config.ts
├── tsconfig.json
├── eslint.config.mjs
├── postcss.config.mjs
└── README.md
```

---

## 🔐 Environment Variables

### Local Development (.env.local)

```env
# Google OAuth
GOOGLE_CLIENT_ID=90582485017-9j5f24fon150vo1rev26ctcp335dvkqq.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-xxxxx

# Google Sheets
GOOGLE_SHEET_ID=1QISdbLzLPwwErHk23db0uC2tTTYcFLCsF59ASSh5b5E

# Google Calendar
GOOGLE_CALENDAR_ID=siagapesarawan@gmail.com

# NextAuth
NEXTAUTH_SECRET=b865e66efee0a507b5f6b1bc88025a93272b6dcb650cfe7cb7dbc0bb01113234
NEXTAUTH_URL=https://simpati-silk.vercel.app

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### Vercel Environment Variables

| Name | Value | Environments |
|------|-------|--------------|
| `GOOGLE_CLIENT_ID` | `90582485017-...apps.googleusercontent.com` | Production |
| `GOOGLE_CLIENT_SECRET` | `GOCSPX-...` | Production |
| `GOOGLE_SHEET_ID` | `1QISdbLzLPww...` | Production |
| `GOOGLE_CALENDAR_ID` | `siagapesarawan@gmail.com` | Production |
| `NEXTAUTH_SECRET` | `b865e66ef...` | Production |
| `NEXTAUTH_URL` | `https://simpati-silk.vercel.app` | Production |

---

## 📊 Google Sheets Structure

### Sheet: Kegiatan
| Column | Field | Type |
|--------|-------|------|
| A | ID | String (UUID) |
| B | Jenis | Enum: "Kegiatan" |
| C | Judul | String |
| D | Tanggal | Date (YYYY-MM-DD) |
| E | WaktuMulai | Time (HH:MM) |
| F | WaktuSelesai | Time (HH:MM) |
| G | Lokasi | String |
| H | Deskripsi | Text |
| I | Kategori | String |
| J | Status | Enum: "Draft", "Approved", "Published" |
| K | GoogleEventID | String |
| L | CreatedAt | Timestamp |
| M | CreatedBy | Email |

### Sheet: Audensi
(Sama dengan Kegiatan, Jenis = "Audensi")

| Column | Field | Type |
|--------|-------|------|
| A | ID | String (UUID) |
| B | Jenis | Enum: "Audensi" |
| C | Judul | String |
| D | Tanggal | Date |
| E | WaktuMulai | Time |
| F | WaktuSelesai | Time |
| G | Lokasi | String |
| H | Deskripsi | Text |
| I | Kategori | String |
| J | TargetAudiensi | String |
| K | Status | Enum |
| L | GoogleEventID | String |
| M | CreatedAt | Timestamp |
| N | CreatedBy | Email |

### Sheet: Usulan
| Column | Field | Type |
|--------|-------|------|
| A | ID | String (UUID) |
| B | NamaPengaju | String |
| C | Kontak | String (Email/HP) |
| D | Judul | String |
| E | TanggalWaktu | DateTime |
| F | Lokasi | String |
| G | Deskripsi | Text |
| H | Status | Enum: "Pending", "Approved", "Rejected" |
| I | CatatanAdmin | Text |
| J | Timestamp | Timestamp |

### Sheet: AdminUsers
| Column | Field | Type |
|--------|-------|------|
| A | Email | String (Primary Key) |
| B | Nama | String |
| C | Role | Enum: "Superadmin", "Admin" |
| D | Status | Enum: "Pending", "Approved", "Rejected" |
| E | ApprovedBy | Email |
| F | ApprovedAt | Timestamp |
| G | CreatedAt | Timestamp |

### Sheet: LogAktivitas
| Column | Field | Type |
|--------|-------|------|
| A | ID | String (UUID) |
| B | User | Email |
| C | Action | Enum: "Create", "Update", "Delete", "Approve", "Reject" |
| D | Entity | Enum: "Kegiatan", "Audensi", "Usulan", "Galeri" |
| E | EntityID | String |
| F | Detail | Text |
| G | Timestamp | Timestamp |

---

## 📅 Google Calendar Structure

### Calendar Name: SIMPATI

### Event Structure
```typescript
interface CalendarEvent {
  summary: string;           // Judul kegiatan
  description: string;        // Deskripsi lengkap
  location: string;           // Lokasi
  start: {
    dateTime: string;        // ISO 8601
    timeZone: string;        // "Asia/Jakarta"
  };
  end: {
    dateTime: string;
    timeZone: string;
  };
  attendees?: string[];      // Target audensi
  colorId: string;           // Color coding by jenis
  extendedProperties: {
    private: {
      eventId: string;       // UUID di Sheets
      jenis: string;         // "Kegiatan" | "Audensi"
    };
  };
}
```

### Color Coding
| Jenis | Color ID |
|-------|----------|
| Kegiatan | 1 (Lavender) |
| Audensi | 2 (Sage) |

---

## 🔑 Google Cloud Setup Summary

### Project: SIMPATI

### Enabled APIs
- [x] Google Sheets API
- [x] Google Calendar API
- [x] Google Drive API

### OAuth Scopes
```javascript
const SCOPES = [
  'https://www.googleapis.com/auth/spreadsheets',      // Full access to Sheets
  'https://www.googleapis.com/auth/calendar.events',  // Manage calendar events
  'https://www.googleapis.com/auth/userinfo.email',    // Read email
  'https://www.googleapis.com/auth/userinfo.profile', // Read profile
];
```

### Authorized Redirect URIs
```
http://localhost:3000/api/auth/callback/google
https://simpati-silk.vercel.app/api/auth/callback/google
```

---

## 📦 API Routes

### Authentication
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/auth/[...nextauth]` | GET/POST | NextAuth handlers |

### Kegiatan
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/kegiatan` | GET | List all kegiatan |
| `/api/kegiatan` | POST | Create kegiatan |
| `/api/kegiatan/[id]` | GET | Get kegiatan by ID |
| `/api/kegiatan/[id]` | PUT | Update kegiatan |
| `/api/kegiatan/[id]` | DELETE | Delete kegiatan |

### Audensi
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/audensi` | GET | List all audensi |
| `/api/audensi` | POST | Create audensi |
| `/api/audensi/[id]` | GET | Get audensi by ID |
| `/api/audensi/[id]` | PUT | Update audensi |
| `/api/audensi/[id]` | DELETE | Delete audensi |

### Usulan
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/usulan` | GET | List all usulan |
| `/api/usulan` | POST | Create usulan (public) |
| `/api/usulan/[id]` | PUT | Approve/Reject |
| `/api/usulan/[id]` | DELETE | Delete |

### Google Integration
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/google-sheets/sync` | POST | Force sync with Sheets |
| `/api/google-calendar/sync` | POST | Force sync with Calendar |
| `/api/google-calendar/events` | GET | Get calendar events |

---

## 🧩 Collision Detection Logic

```typescript
function isCollision(
  newStart: Date,
  newEnd: Date,
  existingEvents: { start: Date; end: Date }[]
): boolean {
  return existingEvents.some((event) => {
    return (
      (newStart >= event.start && newStart < event.end) ||
      (newEnd > event.start && newEnd <= event.end) ||
      (newStart <= event.start && newEnd >= event.end)
    );
  });
}
```

### Collision = Same Date AND Time Overlap
```
Event A: 09:00 - 10:00
Event B: 09:30 - 10:30  ← COLLISION (overlap)
Event C: 10:30 - 11:30  ← OK (back-to-back)
```

---

## 🔒 Security Rules

### Protected Routes (Admin)
- Semua route di `(admin)/` butuh authentication
- Superadmin bisa approve admin baru
- Admin harus ada di sheet "AdminUsers" dengan status "Approved"

### Public Routes
- `(public)/` - Bisa diakses tanpa login
- `/api/usulan` POST - Bisa diakses tanpa login (untuk usul publik)
- `/api/auth/*` - OAuth callbacks

### Data Access
- Admin hanya bisa lihat/edit data yang dibuatnya (atau sesuai role)
- Superadmin bisa lihat/edit semua data

---

## 📱 PWA Configuration

### manifest.json
```json
{
  "name": "SIMPATI",
  "short_name": "SIMPATI",
  "description": "Sistem Informasi Manajemen Protokol & Agenda Terintegrasi",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#ffffff",
  "theme_color": "#1e3a5f",
  "icons": [
    {
      "src": "/icons/icon-192.png",
      "sizes": "192x192",
      "type": "image/png"
    },
    {
      "src": "/icons/icon-512.png",
      "sizes": "512x512",
      "type": "image/png"
    }
  ]
}
```

---

## 🚀 Deployment

### Vercel
- **Production URL:** https://simpati-silk.vercel.app
- **Framework:** Next.js 14 (App Router)
- **Build Command:** `npm run build`
- **Output Directory:** `.next`

### Required Environment Variables (Production)
- GOOGLE_CLIENT_ID
- GOOGLE_CLIENT_SECRET
- GOOGLE_SHEET_ID
- GOOGLE_CALENDAR_ID
- NEXTAUTH_SECRET
- NEXTAUTH_URL

---

*SIMPATI - Sistem Informasi Manajemen Protokol & Agenda Terintegrasi*

*Last updated: August 2026*
