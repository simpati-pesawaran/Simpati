# SIMPATI - Roadmap

**Version:** 2.0.0  
**Last Updated:** August 2026  
**Document Owner:** Product Team  
**Classification:** Internal - Confidential

---

## Table of Contents

1. [Overview](#overview)
2. [Version History](#version-history)
3. [Phase 1: Foundation](#phase-1-foundation)
4. [Phase 2: Polish](#phase-2-polish)
5. [Phase 3: Scale](#phase-3-scale)
6. [Phase 4: Ecosystem](#phase-4-ecosystem)
7. [Technical Dependencies](#technical-dependencies)

---

## Overview

### Roadmap Philosophy

SIMPATI follows an iterative development approach:

1. **Foundation First** - Build a solid core before adding features
2. **Quality Over Quantity** - Each feature must be excellent
3. **User Feedback** - Listen and adapt based on usage
4. **Technical Excellence** - Clean code, scalable architecture

### Versioning

| Version | Description |
|---------|-------------|
| 1.x | MVP with core features |
| 2.x | Polish and performance |
| 3.x | Scale and enterprise features |

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 2.0.0 | August 2026 | Complete UI/UX redesign, mobile app experience |
| 1.0.0 | Earlier | Initial release with basic CRUD |

---

## Phase 1: Foundation

**Target:** Q3 2026  
**Goal:** Complete, working MVP

### 1.1 Authentication ✓

- [x] Google OAuth setup
- [x] User registration flow
- [x] Approval system (pending/approved/rejected)
- [x] Session management
- [x] Protected routes

### 1.2 Core UI ✓

- [x] App shell (header + bottom nav)
- [x] Design system implementation
- [x] Mobile-first responsive layout
- [x] Loading states (skeleton)
- [x] Error states

### 1.3 Agenda Management ✓

- [x] Create agenda (kegiatan/audiensi)
- [x] Edit agenda
- [x] Delete agenda (soft delete)
- [x] List agenda with filters
- [x] Agenda detail view
- [x] Collision detection

### 1.4 Calendar Integration ✓

- [x] Google Calendar sync (one-way)
- [x] Color coding (green/orange)
- [x] Sync status indicator

### 1.5 Gallery ✓

- [x] Image upload
- [x] WebP conversion
- [x] Thumbnail generation
- [x] Gallery grid view

### 1.6 Notifications ✓

- [x] Bell icon with badge
- [x] Notification list
- [x] Mark as read
- [x] Real-time updates

### 1.7 PWA ✓

- [x] Manifest setup
- [x] Service worker
- [x] Install prompt
- [x] Offline support

---

## Phase 2: Polish

**Target:** Q4 2026  
**Goal:** Premium experience

### 2.1 Performance

- [ ] Image optimization
- [ ] Lazy loading
- [ ] Code splitting
- [ ] Caching strategy
- [ ] Lighthouse score > 90

### 2.2 UX Enhancements

- [ ] Pull-to-refresh
- [ ] Swipe actions on list items
- [ ] Empty state illustrations
- [ ] Onboarding flow
- [ ] Tooltips and hints

### 2.3 Features

- [ ] Recurring events
- [ ] Bulk operations
- [ ] Calendar view (week/month)
- [ ] Export to PDF
- [ ] Dark mode

### 2.4 Analytics

- [ ] User activity tracking
- [ ] Feature usage metrics
- [ ] Dashboard analytics
- [ ] Admin reports

---

## Phase 3: Scale

**Target:** Q1 2027  
**Goal:** Enterprise-ready

### 3.1 Multi-Organization

- [ ] Organization management
- [ ] Role-based permissions
- [ ] Division structure
- [ ] Cross-organization sharing

### 3.2 Advanced Features

- [ ] API access for third-party
- [ ] Webhook notifications
- [ ] Advanced search
- [ ] Filters and sorting
- [ ] Data export (CSV/Excel)

### 3.3 Security & Compliance

- [ ] Audit logs
- [ ] Data retention policies
- [ ] Backup automation
- [ ] Security audit

### 3.4 Support

- [ ] Help center
- [ ] FAQ
- [ ] Contact support form

---

## Phase 4: Ecosystem

**Target:** Q2 2027  
**Goal:** Platform expansion

### 4.1 Integrations

- [ ] WhatsApp notifications
- [ ] Email digest (weekly summary)
- [ ] Public agenda page
- [ ] Calendar file export (.ics)

### 4.2 Mobile Apps

- [ ] React Native iOS app
- [ ] React Native Android app
- [ ] Push notifications

### 4.3 Desktop

- [ ] Electron app (macOS/Windows)
- [ ] Desktop notifications

### 4.4 Developer Platform

- [ ] Public API documentation
- [ ] API key management
- [ ] Developer portal

---

## Technical Dependencies

### Phase Dependencies

`
┌─────────────┐
│   Phase 1   │ ── Foundation
│   (Done)    │
└──────┬──────┘
       │
       ▼
┌─────────────┐
│   Phase 2   │ ── Polish
│   Q4 2026   │   Requires Phase 1
└──────┬──────┘
       │
       ▼
┌─────────────┐
│   Phase 3   │ ── Scale
│   Q1 2027   │   Requires Phase 2
└──────┬──────┘
       │
       ▼
┌─────────────┐
│   Phase 4   │ ── Ecosystem
│   Q2 2027   │   Requires Phase 3
└─────────────┘
`

### Feature Dependencies

| Feature | Depends On |
|---------|------------|
| Dark mode | Design system tokens |
| Recurring events | Basic CRUD |
| Bulk operations | Basic CRUD |
| API access | Auth + permissions |
| Mobile app | PWA foundation |

---

## Backlog

### Nice to Have

- [ ] Keyboard shortcuts
- [ ] Command palette (Cmd+K)
- [ ] Calendar widget
- [ ] Widget for iOS/Android home screen
- [ ] Siri/Google Assistant integration
- [ ] Calendar watch face complication

### Future Considerations

- [ ] Multi-language support
- [ ] Offline-first architecture
- [ ] Real-time collaboration
- [ ] AI-powered scheduling suggestions

---

## Document History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 2.0.0 | August 2026 | Product Team | Updated for redesign |
| 1.0.0 | Earlier | Product Team | Initial roadmap |

---

**Previous Document:** [08_ACCESSIBILITY.md](./08_ACCESSIBILITY.md)  
**Next Document:** [10_DATABASE.md](./10_DATABASE.md) - Database

---

*This roadmap guides SIMPATI development priorities.*
