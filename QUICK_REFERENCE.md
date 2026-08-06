# SIMPATI - Quick Reference

## Project
- **Nama**: SIMPATI - Sistem Informasi Manajemen Protokol & Agenda Terintegrasi
- **URL**: https://simpati-silk.vercel.app
- **Repo**: https://github.com/simpati-pesawaran/Simpati

## Akun Superadmin
`siagapesawaran@gmail.com`

## Konfigurasi Penting (cek .env.local)

### Supabase
```
URL: https://xxxxxxxxxxxx.supabase.co
```

### Google OAuth
```
Redirect: https://simpati-silk.vercel.app/api/auth/callback/google
```

## Database Tables
- `profiles` - user profiles dengan status (pending/approved/rejected)
- `agendas` - agenda & audiensi
- `notifications` - notifikasi
- `user_settings` - pengaturan user

## Tech Stack
- Next.js 16.3.0 (App Router)
- React 19
- Tailwind CSS 3.4.0 (bukan v4!)
- Supabase (PostgreSQL)
- NextAuth.js v4 (Google OAuth)
- Vercel deployment

## CSS Rules (CRITICAL)
1. `app/layout.tsx` WAJIB import `./globals.css`
2. `@import url(...)` HARUS di baris pertama globals.css, sebelum @tailwind

## Struktur Login Flow
1. `/login` - Google OAuth + setup form (name → division)
2. `/login/pending` - Waiting approval
3. `/login/rejected` - Rejected (ada form ajukan ulang)
4. `/dashboard` - Main app (approved only)

## File Penting
- `app/globals.css` - Design system (Inter font, gradient, CSS variables)
- `app/login/page.tsx` - Login page
- `supabase/migrations/001_initial_schema.sql` - Database schema
- `.env.local` - Environment variables (JANGAN push!)

## TODO
- [ ] Dashboard full implementation
- [ ] CRUD Agenda & Audiensi
- [ ] Google Calendar sync
- [ ] Google Sheets export
- [ ] Notifications bell
- [ ] PWA optimization

## Link Penting
| Service | URL |
|---------|-----|
| Vercel | https://vercel.com/dashboard |
| Supabase | https://supabase.com/dashboard |
| Google Cloud | https://console.cloud.google.com |
| GitHub | https://github.com/simpati-pesawaran/Simpati |
