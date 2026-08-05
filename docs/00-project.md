# SIMPATI

## Nama
SIMPATI - Sistem Informasi Manajemen Protokol & Agenda Terintegrasi

## Tech Stack
- **Framework:** Next.js 16 (App Router)
- **Database:** Supabase (PostgreSQL)
- **Storage:** Supabase Storage
- **Authentication:** NextAuth.js + Google OAuth
- **Deployment:** Vercel
- **Google Cloud:**
  - Google Calendar API (satu arah: Supabase → Calendar)
  - Google Sheets API (export/backup saja)

## Prinsip

### Prioritas Platform
- Mobile First
- iPhone/Safari adalah prioritas utama
- PWA dengan install support

### Database
- Database utama: **Supabase**
- Google Sheets BUKAN database
- Google Sheets hanya untuk: export, backup, laporan
- Google Calendar hanya sinkronisasi satu arah (Supabase → Calendar)
- Semua perubahan agenda hanya dilakukan dari aplikasi SIMPATI

### Storage
- Semua gambar disimpan di Supabase Storage
- Format: WebP
- Pipeline: jpg/png/heic → resize → WebP → thumbnail

### UI Quality Target
- Apple Human Interface Guidelines
- Google Calendar
- Linear
- Notion

### Standar Kode
- TypeScript strict mode
- Reusable components
- Clean architecture
- Mobile First
- Safari First
- WebP untuk semua gambar

---

*Last updated: August 2026*
