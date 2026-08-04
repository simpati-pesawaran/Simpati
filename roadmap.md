# 📋 SIMPATI - Roadmap Project

## 🎯 Project Overview

**Nama:** SIMPATI

**Deskripsi:** Sistem Informasi Manajemen Protokol & Agenda Terintegrasi

**Purpose:** Aplikasi PWA untuk input dan management agenda kegiatan organisasi dengan integrasi Google Sheets dan Google Calendar.

**Target Platform:** Mobile-first (iPhone/Safari optimized), PWA (installable)

---

## 🎨 Design System

### Color Palette
```
Primary:      #1e3a5f (Navy)
Primary Light: #2d5a8a (Navy Light)
Accent:       #3b82f6 (Blue)
Gradient:     linear-gradient(135deg, #1e3a5f 0%, #2d5a8a 100%)
Background:   #ffffff (White)
Surface:      #f8fafc (Light Gray)
Text Primary: #1e293b (Dark Slate)
Text Secondary: #64748b (Slate)
```

### Typography
```
Font Family: Inter (sans-serif)
Heading 1: 24px / Bold
Heading 2: 20px / SemiBold
Heading 3: 16px / SemiBold
Body: 14px / Regular
Caption: 12px / Regular
```

### Spacing System
```
Base: 4px
xs: 4px
sm: 8px
md: 16px
lg: 24px
xl: 32px
2xl: 48px
```

---

## 👥 User Roles

| Role | Access |
|------|--------|
| **Superadmin** | Owner, approve admin baru, full access |
| **Admin** | CRUD kegiatan, approve usul, manage galeri |
| **Publik** | Lihat agenda, usulkan kegiatan |

---

## 📅 Timeline Estimate

```
Total: 7-11 minggu (estimasi)
```

| Phase | Durasi | Fokus |
|-------|--------|-------|
| Phase 1: Foundation | 1-2 minggu | Setup, Auth, Layout |
| Phase 2: Core Features | 2-3 minggu | CRUD, Collision Detection |
| Phase 3: Public & Notifications | 1-2 minggu | Public pages, Bell notification |
| Phase 4: Google Integration | 2-3 minggu | Sheets & Calendar API |
| Phase 5: Polish & Launch | 1 minggu | iOS PWA optimization |

---

## 🏗️ Phase 1: Foundation (Week 1-2)

### 1.1 Project Setup
- [ ] Setup Next.js 14 dengan TypeScript
- [ ] Setup Tailwind CSS dengan design system
- [ ] Implementasi color palette navy gradient
- [ ] Setup folder structure (clean architecture)
- [ ] Setup ESLint & Prettier

### 1.2 Authentication (NextAuth.js)
- [ ] Setup Google OAuth provider
- [ ] Buat login page dengan Google button
- [ ] Implementasi superadmin approval flow
- [ ] Simpan approved users di Google Sheets
- [ ] Protected routes untuk admin pages

### 1.3 Layout & Navigation
- [ ] Setup global layout (white background)
- [ ] Bottom navigation bar (mobile)
- [ ] Header dengan navy gradient, bell notification
- [ ] Profile menu
- [ ] Loading states & error boundaries

---

## 📱 Phase 2: Core Features (Week 3-5)

### 2.1 Page: Kegiatan
- [ ] List view kegiatan
- [ ] Create form (modal atau page)
- [ ] Edit functionality
- [ ] Delete dengan konfirmasi
- [ ] Filter & search
- [ ] Collision detection (tanggal+waktu overlap)

### 2.2 Page: Audensi
- [ ] List view audensi
- [ ] Create form
- [ ] Edit & delete
- [ ] Filter & search
- [ ] Collision detection

### 2.3 Page: Galeri
- [ ] Grid view foto kegiatan
- [ ] Upload dengan compression (WebP)
- [ ] Upload arsip digital (PDF)
- [ ] Preview foto
- [ ] Delete dengan konfirmasi

### 2.4 Page: Log Aktivitas
- [ ] Display activity log
- [ ] Filter by user/date
- [ ] Read-only untuk audit trail

---

## 🔔 Phase 3: Public & Notifications (Week 6-7)

### 3.1 Page: Usulan Kegiatan (Publik)
- [ ] Form usul tanpa login
- [ ] Validasi input
- [ ] Submit ke Google Sheets "Usulan"
- [ ] Confirmation message

### 3.2 Admin: Approval Usulan
- [ ] List usulan baru
- [ ] Approve → jadi Kegiatan/Audensi
- [ ] Reject dengan alasan
- [ ] Bell notification badge

### 3.3 Notifications System
- [ ] Bell icon dengan badge counter (navy accent)
- [ ] Dropdown list notifikasi
- [ ] Email notification (usulan baru)
- [ ] Mark as read functionality

### 3.4 Public Agenda View
- [ ] List view agenda (tanpa login)
- [ ] Calendar view
- [ ] Filter (bulan, kategori, jenis)
- [ ] Search functionality

---

## 🔗 Phase 4: Google Integration (Week 8-10)

### 4.1 Google Sheets API
- [ ] Read activities dari Sheets
- [ ] Write new activities
- [ ] Update existing activities
- [ ] Delete activities
- [ ] Sync dengan local state

### 4.2 Google Calendar API
- [ ] Create events (approved activities)
- [ ] Update events (edit activities)
- [ ] Delete events (remove activities)
- [ ] Calendar view integration
- [ ] Real-time sync

### 4.3 Two-Way Sync Logic
- [ ] Periodic sync (polling)
- [ ] Conflict resolution
- [ ] Offline queue (pending changes)
- [ ] Sync status indicator

---

## ✨ Phase 5: Polish & Launch (Week 11)

### 5.1 iOS PWA Optimization
- [ ] Safari-specific CSS fixes
- [ ] PWA manifest setup
- [ ] Service worker configuration
- [ ] App icon & splash screen (navy theme)
- [ ] Standalone display mode

### 5.2 Performance
- [ ] Image optimization
- [ ] Lazy loading
- [ ] Code splitting
- [ ] Lighthouse audit

### 5.3 Error Handling
- [ ] Global error boundary
- [ ] API error handling
- [ ] User-friendly error messages
- [ ] Retry mechanisms

### 5.4 Launch Preparation
- [ ] Vercel production deploy
- [ ] Google OAuth consent (production)
- [ ] Documentation
- [ ] Testing (QA)

---

## 🎯 Milestones

| Milestone | Target | Deliverables |
|-----------|--------|--------------|
| M1: Foundation | Week 2 | Login, Navigation, Layout |
| M2: Core CRUD | Week 5 | Kegiatan, Audensi, Galeri |
| M3: Public + Notif | Week 7 | Public view, Usulan, Notifications |
| M4: Google Sync | Week 10 | Sheets & Calendar integration |
| M5: Launch | Week 11 | Production-ready PWA |

---

## 📊 Definition of Done

Setiap feature dianggap selesai jika:
- ✅ Code sudah di-push ke GitHub
- ✅ Sudah di-deploy ke Vercel staging
- ✅ Sudah di-test manual
- ✅ UI sesuai design system
- ✅ Error handling sudah di-implementasi

---

## 🔄 Development Workflow

```
1. Branch dari main: git checkout -b feature/nama
2. Development di local
3. Test local: vercel dev
4. Commit & push: git push origin feature/nama
5. Vercel auto-deploy preview
6. Code review
7. Merge ke main
8. Auto-deploy production
```

---

## 📞 Links

| Service | URL |
|---------|-----|
| **App** | https://simpati-silk.vercel.app |
| **GitHub** | https://github.com/simpati-pesawaran/Simpati |
| **Google Sheets** | [Link spreadsheet] |
| **Google Calendar** | [Link calendar] |

---

*SIMPATI - Sistem Informasi Manajemen Protokol & Agenda Terintegrasi*

*Last updated: August 2026*
