# SIMPATI Roadmap v1.0

> Dokumen ini menjadi acuan pengembangan fitur. Baca **SIMPATI_Design_Bible_v2.md** terlebih dahulu sebelum implementasi.

## Aturan Umum
- Ikuti Design Bible sebagai acuan UI/UX.
- Jangan mengubah desain tanpa persetujuan.
- Fokus Mobile First (PWA).
- Semua halaman harus nyaman di iPhone, Android, dan Tablet.
- Desktop tetap menggunakan tampilan mobile yang diposisikan di tengah.

---

# STATUS PROJECT

## Selesai
- [x] Login Google OAuth
- [x] Approval User
- [x] Dashboard awal
- [x] Struktur Project
- [x] Deploy Vercel
- [x] Supabase

---

# PHASE 1 — Dashboard Premium

## Target
Membangun dashboard final sebagai wajah aplikasi.

### Todo
- [ ] Header premium
- [ ] Status bar menyatu
- [ ] Logo 3D
- [ ] Bell Notification
- [ ] Greeting
- [ ] Statistik
- [ ] Menu utama custom
- [ ] Ringkasan agenda
- [ ] Bottom Sheet detail agenda
- [ ] Animasi premium

Definition of Done:
Dashboard sudah layak sebagai halaman utama produksi.

---

# PHASE 2 — Agenda

- [ ] CRUD Agenda
- [ ] CRUD Audiensi
- [ ] Timeline
- [ ] Detail
- [ ] Edit
- [ ] Delete
- [ ] Filter
- [ ] Search

---

# PHASE 3 — Calendar

- [ ] Sinkron Google Calendar (2 arah)
- [ ] Kalender Bulanan
- [ ] Reminder

---

# PHASE 4 — Media Center

- [ ] Upload Foto
- [ ] Auto Convert WebP
- [ ] Upload PDF
- [ ] Preview PDF menjadi WebP
- [ ] Arsip Digital

---

# PHASE 5 — Usulan Kegiatan

## Public
- [ ] Form Usulan

## Admin
- [ ] Approval
- [ ] Reject
- [ ] Edit
- [ ] Konversi menjadi Agenda

---

# PHASE 6 — Log Aktivitas

- [ ] Login
- [ ] Logout
- [ ] Tambah Agenda
- [ ] Edit Agenda
- [ ] Approval
- [ ] Upload Media
- [ ] Hapus Data

---

# PHASE 7 — Fitur Global

- [ ] Global Search
- [ ] Filter Tanggal
- [ ] Offline Cache
- [ ] Empty State
- [ ] Error State

---

# PHASE 8 — Optimasi

- [ ] Optimasi Lighthouse
- [ ] Optimasi PWA
- [ ] Optimasi Loading
- [ ] Optimasi Gambar
- [ ] Optimasi Database

---

# ATURAN CLAUDE

Sebelum mengerjakan Phase berikutnya:

1. Baca SIMPATI_Design_Bible_v2.md
2. Cek roadmap ini.
3. Kerjakan hanya Phase berikutnya.
4. Jangan melompati Phase.
5. Jelaskan file yang akan diubah.
6. Jangan refactor besar tanpa izin.
7. Setelah selesai satu Phase, tunggu persetujuan user sebelum lanjut.

