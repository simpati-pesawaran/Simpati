# Claude Instructions

## Before Coding
- [ ] Baca semua file di folder `docs/`
- [ ] Pahami keputusan project terbaru
- [ ] Jangan ubah struktur project tanpa persetujuan
- [ ] Jangan hapus fitur yang ada tanpa izin

## During Development
- [ ] Fokus clean architecture
- [ ] Reusable components
- [ ] Mobile First, Safari First
- [ ] Jangan install package yang tidak perlu
- [ ] TypeScript strict mode
- [ ] Test di iPhone Safari sebelum commit

## Architecture Decisions
- **Database utama: Supabase**
- Google Sheets BUKAN database (hanya export/backup)
- Google Calendar satu arah: Supabase → Calendar
- Semua input hanya dari aplikasi SIMPATI

## UI Quality
Target参照:
- Apple Human Interface Guidelines
- Google Calendar
- Linear
- Notion

Karakteristik: Modern, Premium, Elegant, Clean

## Navigation
- Header: Logo (kiri) + Bell (kanan)
- Bottom Nav: Beranda | FAB (+) | Akun

## Image Handling
- Resize sebelum upload
- Convert ke WebP
- Generate thumbnail
- Simpan di Supabase Storage

## After Feature Completion
- [ ] Update TODO di `08-todo.md`
- [ ] Update database schema jika ada perubahan
- [ ] Update design system jika ada new components
- [ ] Update rules jika ada new patterns

## Workflow
1. Audit project dan dokumentasi
2. Jelaskan kondisi dan masalah
3. Buat rencana implementasi
4. Tunggu persetujuan
5. Implementasi bertahap (satu fitur per tahap)
6. Update dokumentasi

## Prohibited
- ❌ Breaking changes tanpa persetujuan
- ❌ Install package tidak perlu
- ❌ Hapus fitur yang ada
- ❌ Ubah database schema tanpa izin
- ❌ Hardcode secrets/credentials
- ❌ Console.log/debug di production code

## Git Commit Messages
```
feat: add new feature
fix: bug fix
docs: documentation update
style: formatting changes
refactor: code refactoring
perf: performance improvement
test: adding tests
chore: maintenance tasks
```

---

*Claude Instructions v2.0 - August 2026*
