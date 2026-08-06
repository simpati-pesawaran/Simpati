# SIMPATI_Project_Overview.md

Dokumen ini adalah rangkuman PROJECT_SUMMARY.md dan QUICK_REFERENCE.md.

## Identitas Project
- Nama: SIMPATI (Sistem Informasi Manajemen Protokol & Agenda Terintegrasi)
- Deploy: Vercel
- Database: Supabase PostgreSQL
- Login: Google OAuth (NextAuth)

## Tujuan
Membangun aplikasi PWA mobile-first untuk pengelolaan agenda, audiensi, dokumentasi, dan administrasi protokol.

## Tech Stack
- Next.js App Router
- React
- Tailwind CSS
- NextAuth
- Supabase
- Vercel

## Struktur Login
/login
/login/pending
/login/rejected
/dashboard

## Database Inti
- profiles
- agendas
- notifications
- user_settings

## File Penting
- app/globals.css
- app/login/page.tsx
- supabase/migrations/001_initial_schema.sql
- .env.local

## Environment
- NEXTAUTH_SECRET
- NEXTAUTH_URL
- GOOGLE_CLIENT_ID
- GOOGLE_CLIENT_SECRET
- NEXT_PUBLIC_SUPABASE_URL
- NEXT_PUBLIC_SUPABASE_ANON_KEY
- SUPABASE_SERVICE_ROLE_KEY

## Deployment
- GitHub → Vercel Auto Deploy
- Production menggunakan Supabase.

## Status
Selesai:
- Login Google
- Approval user
- Deploy
- Struktur dasar

Berikutnya:
- Dashboard
- Agenda
- Calendar
- Media Center
- Notification
- Optimasi PWA

## Catatan
Dokumen ini hanya merangkum informasi teknis. Untuk desain gunakan SIMPATI_Design_Bible_v2.md. Untuk urutan pengembangan gunakan SIMPATI_Roadmap_v1.md.
