# Authentication

## Overview

- **Method:** Google OAuth via NextAuth.js
- **Approval System:** Database-based (Supabase profiles table)

## Superadmin

```
Email: siagapesyaratan@gmail.com
Role: superadmin
Status: approved (pre-seeded in database)
```

---

## Login Flow

```
┌─────────────────────────────────────────────────────────┐
│  1. Google Login                                         │
│     User clicks "Masuk dengan Google"                   │
│     → Redirect to Google OAuth consent page             │
└─────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│  2. OAuth Callback                                      │
│     Google returns to /api/auth/callback/google         │
│     → NextAuth creates session                          │
│     → Check if user exists in profiles table           │
└─────────────────────────────────────────────────────────┘
                          ↓
              ┌───────────────────────────┐
              │  User exists in DB?      │
              └───────────────────────────┘
                     ↓              ↓
                   YES              NO
                     ↓              ↓
              ┌─────┴─────┐  ┌────┴────┐
              │ Status    │  │ Status  │
              │ = approved?│  │ = pending│
              └─────┬─────┘  └────┬────┘
                    │              ↓
                    ↓         ┌────────────────┐
              ┌─────┴────┐    │ 3. Popup:      │
              │   YES    │    │    Input Nama  │
              │    ↓     │    └────┬───────────┘
              │ Dashboard│           ↓
              │   ↓      │    ┌────────────────┐
              │ Home/    │    │ 4. Popup:      │
              │ Beranda  │    │    Input Divisi│
              └───────────┘    └────┬───────────┘
                                    ↓
                              ┌─────────────┐
                              │ Save to DB  │
                              │ Status:     │
                              │ "pending"   │
                              └──────┬──────┘
                                     ↓
                              ┌─────────────────────────────────┐
                              │ 5. Notify Superadmin            │
                              │    • Bell Notification          │
                              │    • Email Notification         │
                              └─────────────┬───────────────────┘
                                             ↓
                              ┌─────────────────────────────────┐
                              │ User sees:                      │
                              │ "Pendaftaran menunggu persetujuan"│
                              └─────────────────────────────────┘
```

---

## Registration Flow (New User)

### Step 1: Input Nama
```
┌─────────────────────────────────────────┐
│                                         │
│   Selamat Datang! 👋                    │
│                                         │
│   Apa nama Anda?                        │
│   ┌─────────────────────────────────┐   │
│   │ [________________________]      │   │
│   └─────────────────────────────────┘   │
│                                         │
│              [ Lanjut ]                 │
│                                         │
└─────────────────────────────────────────┘
```

### Step 2: Input Divisi
```
┌─────────────────────────────────────────┐
│                                         │
│   👤 Nama: John Doe                     │
│                                         │
│   Divisi mana Anda?                    │
│   ┌─────────────────────────────────┐   │
│   │ [Pilih Divisi              ▼ ]   │   │
│   └─────────────────────────────────┘   │
│                                         │
│   Atau ketik sendiri:                   │
│   ┌─────────────────────────────────┐   │
│   │ [________________________]      │   │
│   └─────────────────────────────────┘   │
│                                         │
│              [ Daftar ]                 │
│                                         │
└─────────────────────────────────────────┘
```

---

## Approval Flow (Superadmin)

### Notification Received

**Bell Notification:**
```
🔔 Bell badge shows count of pending users

Dropdown:
┌─────────────────────────────────────────┐
│  🔔 Notifikasi                          │
├─────────────────────────────────────────┤
│  👤 John Doe                            │
│     Minta akses ke SIMPATI              │
│     📧 john@email.com                    │
│     🏢 Divisi Sekretariat               │
│     [2 jam yang lalu]                   │
│                                         │
│  [ Lihat Permintaan ]                   │
├─────────────────────────────────────────┤
│  Lihat semua notifikasi                 │
└─────────────────────────────────────────┘
```

**Email Notification:**
```
Subject: [SIMPATI] Permintaan Akses Baru

Halo Superadmin,

Ada permintaan akses baru:

Nama: John Doe
Email: john@email.com
Divisi: Sekretariat
Waktu: 5 Agustus 2026, 14:30 WIB

Buka aplikasi untuk approve/reject.
```

### Approval Page (Superadmin)

```
┌─────────────────────────────────────────┐
│  ← Kembali        Permintaan Akses      │
├─────────────────────────────────────────┤
│                                         │
│  📋 Daftar Permintaan                   │
│  (3 menunggu persetujuan)               │
│                                         │
│  ┌─────────────────────────────────┐    │
│  │ 👤 John Doe                     │    │
│  │    📧 john@email.com            │    │
│  │    🏢 Sekretariat               │    │
│  │    📅 5 Agt 2026, 14:30        │    │
│  │                                 │    │
│  │  [ Tolak ]        [ Terima ]   │    │
│  └─────────────────────────────────┘    │
│                                         │
│  ┌─────────────────────────────────┐    │
│  │ 👤 Jane Smith                    │    │
│  │    📧 jane@email.com            │    │
│  │    🏢 Keuangan                  │    │
│  │    📅 4 Agt 2026, 09:15        │    │
│  │                                 │    │
│  │  [ Tolak ]        [ Terima ]   │    │
│  └─────────────────────────────────┘    │
│                                         │
└─────────────────────────────────────────┘
```

---

## Status States

| Status | Color | Description |
|--------|-------|-------------|
| pending | Amber | Menunggu approval superadmin |
| approved | Green | Berhasil login, akses penuh |
| rejected | Red | Ditolak, tidak bisa login |

---

## Page Routing

```
┌────────────────────────────────────────────────────┐
│                     LOGIN FLOW                      │
├────────────────────────────────────────────────────┤
│                                                     │
│  / (root)                                           │
│   ├── session? ──→ /dashboard (/beranda)          │
│   │                 └── IF approved                  │
│   │                                                  │
│   ├── no session ──→ /login                         │
│   │                                                  │
│   ├── new user ──→ /login/setup (nama & divisi)    │
│   │                 └── saves to DB                  │
│   │                                                  │
│   ├── pending user ──→ /login/pending               │
│   │                     └── "Menunggu persetujuan"   │
│   │                                                  │
│   └── rejected ──→ /login/rejected                  │
│                       └── show rejection reason      │
│                                                     │
└────────────────────────────────────────────────────┘
```

---

## Implementation Notes

### NextAuth Configuration
```typescript
// Key points:
- Google OAuth provider
- JWT session strategy
- Custom signIn callback
- Custom session callback
- Protect routes middleware
```

### Database Queries
```sql
-- Check user status after Google login
SELECT id, email, name, division, role, status
FROM profiles
WHERE email = $1;

-- Update user after registration
UPDATE profiles
SET name = $1, division = $2
WHERE email = $3;

-- Notify superadmin (trigger notification insert)
INSERT INTO notifications (user_id, type, title, message, data)
VALUES ($1, 'user_registered', '...', '...', $2);
```

---

*Authentication Flow v2.0 - August 2026*
