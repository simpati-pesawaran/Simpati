# SIMPATI - Product Vision & Strategy

**Version:** 2.0.0  
**Last Updated:** August 2026  
**Document Owner:** Product Team  
**Classification:** Internal - Confidential

---

## Table of Contents

1. [Executive Summary](#executive-summary)
2. [Product Vision](#product-vision)
3. [Core Values](#core-values)
4. [Target Users](#target-users)
5. [Problem Statement](#problem-statement)
6. [Solution Overview](#solution-overview)
7. [Product Principles](#product-principles)
8. [Strategic Pillars](#strategic-pillars)
9. [Success Metrics](#success-metrics)
10. [Competitive Positioning](#competitive-positioning)
11. [Future Vision](#future-vision)

---

## Executive Summary

**SIMPATI** (Sistem Informasi Manajemen Protokol & Agenda Terintegrasi) adalah platform manajemen agenda dan protokol berbasis cloud yang dirancang untuk organisasi pemerintahan Indonesia. Aplikasi ini mengintegrasikan manajemen agenda kegiatan dan audiensi, sinkronisasi kalender otomatis, dokumentasi galeri, dan sistem notifikasi real-time dalam satu platform yang elegan dan mudah digunakan.

### Key Highlights

| Aspect | Value |
|--------|-------|
| **Product Type** | Enterprise Web Application (PWA) |
| **Core Function** | Agenda Management & Protocol System |
| **Target Market** | Government organizations, protocol divisions |
| **Tech Stack** | Next.js 16, Supabase, Google Calendar API |
| **Design Philosophy** | Mobile App Experience (Web-based) |
| **Platform Priority** | iOS 60% / Android 40% / Tablet Support |
| **Deployment** | Vercel Cloud |
| **Scale Target** | 500 admins, 10,000 agendas, 100,000 photos |

### Design Philosophy

> **"Jadilah aplikasi yang terasa seperti native app, bukan website yang di-wrap."**

SIMPATI bukan website responsif—ini adalah **Aplikasi Native yang berjalan di browser**. Dari pengalaman hingga interaksi, setiap detail harus terasa seperti aplikasi iOS/Android yang premium.

---

## Product Vision

### Our North Star

> **"Mengubah manajemen agenda protokoler dari tugas yang membosankan menjadi pengalaman yang menyenangkan—seperti menggunakan aplikasi favorit Anda."**

### Vision Statement

SIMPATI bertujuan untuk menjadi **sistem manajemen agenda terintegrasi nomor satu** untuk organisasi pemerintahan Indonesia. Kami percaya bahwa teknologi yang baik harus:

1. **Terlihat Premium** - Desain yang setara dengan Linear, Notion, dan Apple
2. **Terasa Native** - Pengalaman seperti aplikasi native, bukan website
3. **Terpercaya Penuh** - Data yang aman, akurat, dan selalu tersedia
4. **Terintegrasi Sempurna** - Menyatu dengan alur kerja yang sudah ada

### Design Manifesto

Kami menjadikan **Apple Human Interface Guidelines** sebagai rujukan utama karena:

- **System Clarity** - Setiap elemen memiliki tujuan yang jelas
- **Deference** - Konten lebih penting dari chrome/decorations
- **Depth** - Navigasi berlapis dengan hierarki yang jelas
- **Perceptual Responsiveness** - Feedback instant di setiap interaksi
- **Spatiality** - Elemen terorganisir dalam ruang yang bermakna

### Key Design Decisions

| Decision | Rationale |
|----------|-----------|
| **Mobile App Experience** | 60% users on iPhone, app-like feel is non-negotiable |
| **Light Mode First** | More familiar, better readability, professional feel |
| **Blue-Purple Gradient** | Modern, tech-forward, innovative government |
| **Custom Icon Logo** | Brand identity, memorable, scalable |
| **Animated Interactions** | Tactile feel, delight users, instant feedback |
| **Desktop = Mobile Width** | Consistent experience, no responsive chaos |

---

## Core Values

### 1. Excellence in Execution

Setiap detail matters. Dari spacing hingga animasi, dari error message hingga loading state—semuanya harus terasa premium.

**Manifesto:**
- Tidak ada yang namanya "cukup baik" untuk user-facing elements
- Setiap pixel memiliki tujuan
- Animasi harus terasa natural, bukan mechanical
- Error states harus membantu, bukan menakutkan

### 2. User-Centric Design

Pengguna utama adalah admin kantor protokoler yang mungkin bukan tech-savvy. Aplikasi harus bisa digunakan tanpa training.

**Manifesto:**
- Jika butuh说明书 untuk fitur dasar, kita gagal
- Orang harus bisa menebak cara pakai tanpa membaca apapun
- Konsistensi internal lebih penting dari mengikuti tren
- Feedback visual harus langsung dan jelas

### 3. Data Integrity

Database adalah source of truth. Setiap keputusan arsitektur mendukung keakuratan dan keamanan data.

**Manifesto:**
- Single source of truth: Supabase
- Immutable audit trail untuk semua perubahan
- Graceful degradation, never data loss
- Backup bukan optional—ini adalah jaring pengaman

### 4. Performance Obsession

Aplikasi harus terasa instant. Setiap interaksi harus mendapat feedback dalam 100ms.

**Manifesto:**
- < 100ms untuk interaksi UI
- < 3 detik untuk page load awal
- < 1 detik untuk operasi CRUD
- Skeleton loaders, bukan spinners untuk konten

### 5. Security & Privacy

Data organisasi adalah aset berharga. Keamanan bukan afterthought.

**Manifesto:**
- Row Level Security di semua level
- Encryption at rest dan in transit
- Minimal data collection
- Transparent tentang data yang kami simpan

---

## Target Users

### Primary User Segments

#### 1. Admin Protokol (Pengguna Utama)

| Attribute | Description |
|-----------|-------------|
| **Role** | Staff kantor protokoler |
| **Frequency** | Daily, multiple sessions |
| **Device** | iPhone 60% / Android 40% / iPad occasional |
| **Primary Tasks** | Create/edit agenda, upload photos, check notifications |
| **Technical Proficiency** | Moderate - familiar with WhatsApp, not power users |

**User Story:**
> "Setiap pagi, saya perlu tahu agenda hari ini dan besok. Saya ingin bisa membuat agenda baru dengan cepat dari HP sambil berjalan. Foto kegiatan harus langsung masuk ke agenda yang benar."

**Design Implication:**
- Large touch targets (min 44px)
- One-handed operation friendly
- Works offline for viewing
- Fast, native-like scrolling

#### 2. Superadmin / Kepala Bagian

| Attribute | Description |
|-----------|-------------|
| **Role** | Supervisor, decision maker |
| **Frequency** | Daily (morning review), weekly (approval) |
| **Device** | Desktop/iPad for office, iPhone for mobile |
| **Primary Tasks** | Approve users, review analytics, manage settings |

**User Story:**
> "Saya perlu memastikan semua staff yang aktif sudah diverifikasi. Saya juga perlu tahu berapa banyak agenda bulan ini dan kapan peak season-nya."

**Design Implication:**
- Consistent mobile experience across devices
- Desktop shows mobile-width view (iPhone simulator style)
- Quick access to approval queue
- Analytics visible at a glance

---

## Problem Statement

### Current Pain Points

#### Problem 1: Fragmented Information

**Symptoms:**
- Agenda tersimpan di Google Sheets, kalender, email, dan chat
- Tidak ada single source of truth
- Konflik jadwal sering terlewat
- Revisi tidak tersinkronisasi

#### Problem 2: Poor Mobile Experience

**Symptoms:**
- Aplikasi existing tidak mobile-friendly
- Staff harus ke kantor untuk update agenda
- Safari/iOS issues on existing tools
- Website feels like... website

#### Problem 3: Manual Documentation

**Symptoms:**
- Foto kegiatan diupload manual ke Google Drive
- Naming convention tidak konsisten
- Tidak ada metadata otomatis

#### Problem 4: Communication Gaps

**Symptoms:**
- Informasi agenda disampaikan via WhatsApp
- Tidak ada sistem notifikasi terpusat
- Tidak ada visibility untuk management

---

## Solution Overview

### How SIMPATI Solves Each Problem

#### Problem 1: Fragmented Information

**Solution: Unified Agenda Platform**

```
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│   ┌─────────────┐    ┌─────────────┐    ┌─────────────┐    │
│   │   SIMPATI   │───▶│    Google   │    │   Google    │    │
│   │   Database  │    │   Calendar  │    │   Sheets    │    │
│   │   (Primary) │    │   (Sync)    │    │   (Export)  │    │
│   └─────────────┘    └─────────────┘    └─────────────┘    │
│          │                                       │          │
│          │          Single Source of Truth       │          │
│          └───────────────────────────────────────┘          │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

#### Problem 2: Poor Mobile Experience

**Solution: True Mobile App Experience**

| Feature | Implementation |
|---------|----------------|
| App-like navigation | Fixed header, fixed bottom nav, no browser chrome feel |
| Touch interactions | Press states, swipe gestures, haptic-ready |
| Smooth animations | 60fps transitions, spring physics |
| Native scrolling | Momentum scroll, overscroll handling |
| Status bar aware | Safe area support, notch handling |
| Installable | PWA with app icon, splash screen |

#### Problem 3: Manual Documentation

**Solution: Integrated Gallery System**

```
Upload Photo
     │
     ▼
┌─────────────┐
│  Compression │  ──▶ Resize to max 1920px
└─────────────┘
     │
     ▼
┌─────────────┐
│ WebP Convert │  ──▶ Quality 85%, WebP format
└─────────────┘
     │
     ▼
┌─────────────┐
│ Thumbnail   │  ──▶ 400px thumbnail for preview
└─────────────┘
     │
     ▼
┌─────────────┐
│  Supabase   │  ──▶ Organized by year/month
│   Storage   │      Auto-metadata capture
└─────────────┘
```

#### Problem 4: Communication Gaps

**Solution: Real-time Notification System**

```
Event Triggered
     │
     ├──▶ In-App Bell (real-time)
     │
     ├──▶ Badge Count (unread)
     │
     └──▶ Email (for critical events)
```

---

## Product Principles

### Principle 1: Progressive Disclosure

**Definition:** Show only what's needed, reveal more on demand.

**Application:**
- Dashboard shows today's agenda; expand for full week
- Collapsed notifications list; full view on tap
- Mobile shows single column; tablet remains single column (app-like)

### Principle 2: Opinionated Defaults

**Definition:** Smart defaults reduce decision fatigue.

**Application:**
- New agenda defaults to "Agenda" type, today, next hour
- Photo upload auto-tags to current agenda
- Time format follows device locale

### Principle 3: Instant Feedback

**Definition:** Every action gets immediate visual confirmation.

**Application:**
- Button press: scale(0.97) + subtle shadow change in 100ms
- Form submit: loading state, then success/error toast
- Delete: confirmation dialog, then optimistic UI update

### Principle 4: Forgiveness in Design

**Definition:** Make it easy to undo, hard to destroy.

**Application:**
- Soft delete for agendas (recoverable for 30 days)
- Edit history visible to superadmin
- Confirmation dialogs for destructive actions

### Principle 5: App-Like Experience

**Definition:** This is not a website. It is an application that happens to run in a browser.

**Application:**
- Fixed navigation (header + bottom nav)
- No browser URL bar feeling
- Pull-to-refresh handled custom
- Smooth 60fps everywhere
- Native-feeling scroll

---

## Strategic Pillars

### Pillar 1: Core Agenda Management

**Objective:** Make agenda CRUD faster and more reliable than any spreadsheet.

### Pillar 2: Seamless Integration

**Objective:** Play well with existing tools, don't replace everything.

### Pillar 3: Mobile App Experience

**Objective:** The website IS the app. No difference in feel.

### Pillar 4: Enterprise Security

**Objective:** Security that satisfies government compliance.

---

## Success Metrics

### North Star Metric

> **Weekly Active Admin Rate (WAAR)**
> Percentage of approved admins who create or edit at least one agenda per week.

**Target:** 80% WAAR by Month 6 post-launch

### Supporting Metrics

| Metric | Definition | Target |
|--------|------------|--------|
| DAU/MAU | Daily active / Monthly active | > 0.4 |
| Avg Session Duration | Time from open to close | > 5 min |
| Error Rate | Failed operations / total | < 0.1% |
| Lighthouse Score | Overall performance | > 90 |

---

## Design System Foundation

This document establishes the vision. For implementation, see:

- [01_DESIGN_BIBLE.md](./01_DESIGN_BIBLE.md) - Design Philosophy & References
- [02_DESIGN_SYSTEM.md](./02_DESIGN_SYSTEM.md) - Complete Design Tokens
- [03_BRAND_GUIDELINE.md](./03_BRAND_GUIDELINE.md) - Logo & Visual Identity
- [04_UX_RULES.md](./04_UX_RULES.md) - User Experience Patterns
- [05_COMPONENT_LIBRARY.md](./05_COMPONENT_LIBRARY.md) - Component Specifications
- [06_ICONOGRAPHY.md](./06_ICONOGRAPHY.md) - Custom Icon System
- [07_MOTION_SYSTEM.md](./07_MOTION_SYSTEM.md) - Animation Specifications

---

## Document History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 2.0.0 | August 2026 | Product Team | Complete redesign - mobile app experience |
| 1.0.0 | Earlier | Product Team | Initial release |

---

**Next Document:** [01_DESIGN_BIBLE.md](./01_DESIGN_BIBLE.md) - Design Bible

---

*This document is the foundational reference for all SIMPATI product decisions.*
