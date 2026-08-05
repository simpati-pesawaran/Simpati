# SIMPATI - UX Rules

**Version:** 2.0.0  
**Last Updated:** August 2026  
**Document Owner:** Design Team  
**Classification:** Internal - Confidential

---

## Table of Contents

1. [UX Principles](#ux-principles)
2. [Navigation Patterns](#navigation-patterns)
3. [Page Layout](#page-layout)
4. [Interaction Patterns](#interaction-patterns)
5. [Form Design](#form-design)
6. [Error Handling](#error-handling)
7. [Loading States](#loading-states)
8. [Empty States](#empty-states)

---

## UX Principles

### Principle 1: App-Like Experience

SIMPATI is not a website. It is an application that runs in a browser.

| Website | App |
|---------|-----|
| URL bar visible | Full-screen immersive |
| Page reloads | Smooth transitions |
| Hover states | Touch-optimized |
| Responsive breakpoints | Fixed mobile-width |

### Principle 2: One-Handed Operation

Design for one-handed use on mobile.

- Primary actions within thumb reach
- Bottom navigation for easy access
- Pull-to-refresh in content areas
- FAB (Floating Action Button) for quick create

### Principle 3: Instant Feedback

Every interaction gets immediate feedback.

- Tap feedback: 100ms or less
- Loading states: Show immediately
- Success/error: Toast notifications
- Transitions: 200-300ms duration

---

## Navigation Patterns

### App Shell

`
┌─────────────────────────────────────────┐
│  STATUS BAR (device)                    │
├─────────────────────────────────────────┤
│                                         │
│  HEADER (sticky)                        │
│  ┌─────────────────────────────────┐   │
│  │ [LOGO]              [NOTIF]     │   │
│  └─────────────────────────────────┘   │
│                                         │
│  CONTENT (scrollable)                   │
│  ┌─────────────────────────────────┐   │
│  │                                 │   │
│  │   Page content here...          │   │
│  │                                 │   │
│  │                                 │   │
│  │                                 │   │
│  └─────────────────────────────────┘   │
│                                         │
│  BOTTOM NAV (fixed)                     │
│  ┌─────────────────────────────────┐   │
│  │  [🏠]       [+]       [👤]     │   │
│  │  Beranda   Agenda    Akun      │   │
│  └─────────────────────────────────┘   │
│                                         │
└─────────────────────────────────────────┘
`

### Header Specifications

| Attribute | Value |
|-----------|-------|
| Height | 56px + safe-area-top |
| Background | #ffffff (white) |
| Border-bottom | 1px #f4f4f5 |
| Position | Sticky |
| Left | Logo (24px icon) |
| Right | Notification bell |

### Bottom Navigation Specifications

| Attribute | Value |
|-----------|-------|
| Height | 64px + safe-area-bottom |
| Background | #ffffff |
| Border-top | 1px #f4f4f5 |
| Position | Fixed |
| Icons | 24px |
| Labels | 11px, #71717a |
| Active | #9333ea |
| Active icon | Filled variant |

### Navigation Items

| Position | Icon | Label | Route |
|----------|------|-------|-------|
| Left | Home | Beranda | /dashboard |
| Center | Plus (FAB) | Agenda | /agenda/new |
| Right | User | Akun | /akun |

### FAB (Floating Action Button)

| Attribute | Value |
|-----------|-------|
| Position | Centered on bottom nav |
| Size | 48px diameter |
| Background | Gradient primary |
| Icon | Plus, 24px, white |
| Shadow | shadow-primary |
| Top offset | -24px (half visible above nav) |

---

## Page Layout

### Content Padding

| Property | Value |
|----------|-------|
| Horizontal padding | 16px |
| Top padding | 16px |
| Bottom padding | 100px (clear bottom nav) |
| Safe area | Respect env() values |

### Page Structure

`
┌─────────────────────────────────────────┐
│                                         │
│  PAGE HEADER (optional)                 │
│  Title                    [Actions]    │
│                                         │
├─────────────────────────────────────────┤
│                                         │
│  CONTENT SECTIONS                       │
│                                         │
│  ┌─────────────────────────────────┐   │
│  │ Section Title                   │   │
│  │                                 │   │
│  │ Content...                      │   │
│  └─────────────────────────────────┘   │
│                                         │
│  ┌─────────────────────────────────┐   │
│  │ Another Section                  │   │
│  │                                 │   │
│  │ Content...                      │   │
│  └─────────────────────────────────┘   │
│                                         │
└─────────────────────────────────────────┘
`

### Card Layout

Cards are used for grouping related content.

`
┌─────────────────────────────────────────┐
│  ┌─────────────────────────────────┐   │
│  │ Card Title              [Badge] │   │
│  │                                 │   │
│  │ Description text here...        │   │
│  │                                 │   │
│  │ Meta info • More info          │   │
│  └─────────────────────────────────┘   │
└─────────────────────────────────────────┘

.card {
  background: #ffffff;
  border: 1px solid #e4e4e7;
  border-radius: 14px;
  padding: 16px;
  margin-bottom: 12px;
}
`

---

## Interaction Patterns

### Tap Feedback

Every tappable element must provide visual feedback.

`css
/* Button Press State */
button:active {
  transform: scale(0.97);
  opacity: 0.9;
  transition: transform 100ms ease-out;
}

/* Remove iOS tap highlight */
button {
  -webkit-tap-highlight-color: transparent;
}
`

### Swipe Gestures

| Direction | Element | Action |
|-----------|---------|--------|
| Pull down | Lists | Refresh |
| Swipe left | List items | Reveal delete (future) |

### Modal/Sheet

Bottom sheets for secondary actions.

`
┌─────────────────────────────────────────┐
│                                         │
│         Main Content                    │
│                                         │
├─────────────────────────────────────────┤
│  ┌─────────────────────────────────┐   │
│  │ Sheet Header              [X]  │   │
│  ├─────────────────────────────────┤   │
│  │                                 │   │
│  │ Sheet Content                   │   │
│  │                                 │   │
│  │                                 │   │
│  ├─────────────────────────────────┤   │
│  │ [Cancel]          [Confirm]    │   │
│  └─────────────────────────────────┘   │
│                                         │
└─────────────────────────────────────────┘

.sheet {
  border-radius: 20px 20px 0 0;
  animation: slideUp 200ms ease-out;
}
`

### Toast Notifications

Position: Bottom center, above bottom nav

`
┌─────────────────────────────────────────┐
│                                         │
│                                         │
│                                         │
├─────────────────────────────────────────┤
│                                         │
│  ┌─────────────────────────────────┐   │
│  │ ✓ Success! Agenda disimpan    │   │
│  └─────────────────────────────────┘   │
│                                         │
│     [🏠 Beranda]  [+]  [👤 Akun]       │
└─────────────────────────────────────────┘

.toast {
  position: fixed;
  bottom: 80px;
  left: 50%;
  transform: translateX(-50%);
  animation: fadeInUp 200ms ease-out;
}
`

---

## Form Design

### Input Fields

| Attribute | Value |
|-----------|-------|
| Height | 48px (touch-friendly) |
| Padding | 12px 16px |
| Border | 1px #e4e4e7 |
| Border-radius | 10px |
| Font-size | 16px (prevents iOS zoom) |
| Focus border | 2px #9333ea |

### Form Layout

`
┌─────────────────────────────────────────┐
│  Form Title                            │
├─────────────────────────────────────────┤
│                                         │
│  Label                                  │
│  ┌─────────────────────────────────┐   │
│  │ Input field                     │   │
│  └─────────────────────────────────┘   │
│  Helper text (optional)                │
│                                         │
│  Label *                                │
│  ┌─────────────────────────────────┐   │
│  │ Input field                     │   │
│  └─────────────────────────────────┘   │
│  ⚠️ Error message                     │
│                                         │
│  ┌─────────────────────────────────┐   │
│  │         Submit Button           │   │
│  └─────────────────────────────────┘   │
│                                         │
└─────────────────────────────────────────┘
`

### Validation

| State | Border | Text |
|-------|--------|------|
| Default | #e4e4e7 | - |
| Focus | #9333ea | - |
| Error | #ef4444 | #ef4444 |
| Success | #22c55e | #22c55e |

---

## Error Handling

### Error Message Structure

1. **What happened** - Brief, clear statement
2. **Why it happened** - If relevant, brief explanation
3. **What to do** - Clear action to resolve

### Error Message Examples

| Context | Message |
|---------|---------|
| Network | "Koneksi terputus. Periksa internet Anda dan coba lagi." |
| Auth | "Sesi berakhir. Masuk kembali untuk melanjutkan." |
| Validation | "Nama agenda harus diisi." |
| Server | "Terjadi kesalahan server. Coba lagi dalam beberapa menit." |
| Permission | "Anda tidak memiliki akses ke fitur ini." |

### Confirmation Dialogs

For destructive actions:

`
┌─────────────────────────────────────────┐
│                                         │
│         ⚠️ Hapus Agenda?                │
│                                         │
│  Anda akan menghapus:                   │
│  "Rapat Koordinasi"                     │
│                                         │
│  Tindakan ini tidak dapat dibatalkan.   │
│                                         │
├─────────────────────────────────────────┤
│                                         │
│  [Batal]           [Ya, Hapus]          │
│                                         │
└─────────────────────────────────────────┘
`

---

## Loading States

### Skeleton Screens

Prefer skeletons over spinners for content.

`
┌─────────────────────────────────────────┐
│  ┌─────────────────────────────────┐   │
│  │ ████████████  ████████████     │   │
│  │ ████████████████████████████   │   │
│  └─────────────────────────────────┘   │
│                                         │
│  ┌─────────────────────────────────┐   │
│  │ ████████  ████████████████████ │   │
│  │ ██████████████████████          │   │
│  └─────────────────────────────────┘   │
│                                         │
└─────────────────────────────────────────┘

.skeleton {
  background: linear-gradient(
    90deg,
    #f4f4f5 0%,
    #e4e4e7 50%,
    #f4f4f5 100%
  );
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
}
`

### Spinner

For small actions or buttons.

`
┌─────────────────────────────────────────┐
│  ┌─────────────────────────────────┐   │
│  │         ○ Processing...         │   │
│  └─────────────────────────────────┘   │
└─────────────────────────────────────────┘

.spinner {
  width: 20px;
  height: 20px;
  border: 2px solid #e4e4e7;
  border-top-color: #9333ea;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}
`

---

## Empty States

### Structure

1. **Visual** - Relevant icon or illustration
2. **Heading** - Brief acknowledgment
3. **Description** - Why this matters
4. **Action** - Primary CTA to resolve

### Empty State Example

`
┌─────────────────────────────────────────┐
│                                         │
│                                         │
│              📅                         │
│                                         │
│         Belum Ada Agenda                │
│                                         │
│   Saat ini belum ada agenda yang        │
│   terjadwal. Buat agenda pertama        │
│   untuk memulai.                        │
│                                         │
│   ┌─────────────────────────────────┐   │
│   │     + Buat Agenda Baru         │   │
│   └─────────────────────────────────┘   │
│                                         │
│                                         │
└─────────────────────────────────────────┘
`

---

## Document History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 2.0.0 | August 2026 | Design Team | Complete rewrite - app-like experience |
| 1.0.0 | Earlier | Design Team | Initial release |

---

**Previous Document:** [03_BRAND_GUIDELINE.md](./03_BRAND_GUIDELINE.md)  
**Next Document:** [05_COMPONENT_LIBRARY.md](./05_COMPONENT_LIBRARY.md) - Components

---

*This document defines UX patterns for SIMPATI. Always prioritize app-like experience over website patterns.*
