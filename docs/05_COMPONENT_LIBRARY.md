# SIMPATI - Component Library

**Version:** 2.0.0  
**Last Updated:** August 2026  
**Document Owner:** Design Team  
**Classification:** Internal - Confidential

---

## Table of Contents

1. [Overview](#overview)
2. [Button](#button)
3. [Input](#input)
4. [Card](#card)
5. [Badge](#badge)
6. [Avatar](#avatar)
7. [Toast](#toast)
8. [Modal](#modal)
9. [BottomSheet](#bottomsheet)
10. [Skeleton](#skeleton)
11. [Header](#header)
12. [BottomNav](#bottomnav)

---

## Overview

### Component Architecture

All components follow the same structure:

`
components/
├── ui/
│   ├── Button/
│   │   ├── Button.tsx
│   │   ├── Button.css
│   │   └── index.ts
│   └── ...
`

### Design Tokens Reference

`css
/* Colors */
--color-primary: #9333ea;
--color-primary-hover: #7e22ce;
--color-gray-100: #f4f4f5;
--color-gray-200: #e4e4e7;
--color-gray-500: #71717a;
--color-gray-900: #18181b;
--color-success: #22c55e;
--color-warning: #f59e0b;
--color-error: #ef4444;
--color-text-inverse: #ffffff;

/* Border Radius */
--radius-sm: 6px;
--radius-md: 10px;
--radius-lg: 14px;
--radius-full: 9999px;

/* Shadows */
--shadow-sm: 0 2px 4px rgba(0, 0, 0, 0.06);
--shadow-md: 0 4px 8px rgba(0, 0, 0, 0.08);
--shadow-lg: 0 8px 16px rgba(0, 0, 0, 0.10);
--shadow-primary: 0 4px 12px rgba(147, 51, 234, 0.3);

/* Spacing */
--space-1: 4px;
--space-2: 8px;
--space-3: 12px;
--space-4: 16px;

/* Animation */
--duration-fast: 100ms;
--duration-normal: 200ms;
--ease-out: cubic-bezier(0.33, 1, 0.68, 1);
--ease-spring: cubic-bezier(0.34, 1.56, 0.64, 1);
`

---

## Button

### Variants

| Variant | Usage |
|---------|-------|
| Primary | Main actions, gradient background |
| Secondary | Secondary actions, outlined |
| Ghost | Tertiary actions, text only |
| Destructive | Delete actions, red |

### Button Primary

`
┌─────────────────────────────────────────┐
│                                         │
│  ┌─────────────────────────────────┐   │
│  │         Simpan                  │   │
│  └─────────────────────────────────┘   │
│                                         │
└─────────────────────────────────────────┘

.button-primary {
  /* Visual */
  background: linear-gradient(135deg, #9333ea 0%, #3b82f6 100%);
  color: #ffffff;
  border: none;
  border-radius: 10px;
  
  /* Size */
  height: 48px;
  padding: 0 24px;
  font-size: 15px;
  font-weight: 600;
  
  /* Shadow */
  box-shadow: 0 4px 12px rgba(147, 51, 234, 0.3);
  
  /* Interaction */
  cursor: pointer;
  transition: all 100ms ease-out;
}

.button-primary:hover {
  box-shadow: 0 6px 16px rgba(147, 51, 234, 0.4);
}

.button-primary:active {
  transform: scale(0.97);
  box-shadow: 0 2px 8px rgba(147, 51, 234, 0.3);
}
`

### Button Secondary

`
┌─────────────────────────────────────────┐
│                                         │
│  ┌ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ┐ │
│          Batal                       │ │
│  └ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ┘ │
│                                         │
└─────────────────────────────────────────┘

.button-secondary {
  /* Visual */
  background: transparent;
  color: #9333ea;
  border: 1.5px solid #9333ea;
  border-radius: 10px;
  
  /* Size */
  height: 48px;
  padding: 0 24px;
  font-size: 15px;
  font-weight: 600;
}

.button-secondary:hover {
  background: rgba(147, 51, 234, 0.05);
}

.button-secondary:active {
  transform: scale(0.97);
  background: rgba(147, 51, 234, 0.1);
}
`

### Button Ghost

`
┌─────────────────────────────────────────┐
│                                         │
│          Lihat Selengkapnya →           │
│                                         │
└─────────────────────────────────────────┘

.button-ghost {
  background: transparent;
  color: #9333ea;
  border: none;
  padding: 12px 16px;
  font-size: 15px;
  font-weight: 500;
}

.button-ghost:hover {
  background: rgba(147, 51, 234, 0.05);
  border-radius: 8px;
}
`

### Button Destructive

`
┌─────────────────────────────────────────┐
│                                         │
│  ┌─────────────────────────────────┐   │
│  │         Ya, Hapus                │   │
│  └─────────────────────────────────┘   │
│                                         │
└─────────────────────────────────────────┘

.button-destructive {
  background: #ef4444;
  color: #ffffff;
  border: none;
  border-radius: 10px;
  height: 48px;
  padding: 0 24px;
  font-size: 15px;
  font-weight: 600;
}

.button-destructive:hover {
  background: #dc2626;
}
`

### Button Sizes

| Size | Height | Padding | Font Size |
|------|--------|---------|-----------|
| Small | 36px | 0 12px | 13px |
| Medium | 48px | 0 24px | 15px |
| Large | 56px | 0 32px | 17px |

### Button States

| State | Visual Change |
|-------|---------------|
| Default | Normal appearance |
| Hover | Slight background shift, cursor pointer |
| Active/Pressed | scale(0.97), opacity 0.9 |
| Disabled | opacity 0.5, cursor not-allowed |
| Loading | Spinner replaces text |

---

## Input

### Text Input

`
┌─────────────────────────────────────────┐
│  Label                                  │
│  ┌─────────────────────────────────┐   │
│  │ Placeholder text                │   │
│  └─────────────────────────────────┘   │
│  Helper text                            │
└─────────────────────────────────────────┘

.input {
  /* Visual */
  background: #ffffff;
  border: 1.5px solid #e4e4e7;
  border-radius: 10px;
  
  /* Size */
  height: 48px;
  padding: 0 16px;
  font-size: 16px; /* iOS: must be 16px to prevent zoom */
  
  /* Text */
  color: #18181b;
  font-family: inherit;
  
  /* Interaction */
  transition: border-color 200ms ease-out, box-shadow 200ms ease-out;
}

.input:focus {
  outline: none;
  border-color: #9333ea;
  box-shadow: 0 0 0 3px rgba(147, 51, 234, 0.1);
}

.input:placeholder {
  color: #a1a1aa;
}

.input:disabled {
  background: #f4f4f5;
  cursor: not-allowed;
  opacity: 0.7;
}
`

### Input Error State

`
┌─────────────────────────────────────────┐
│  Label                                  │
│  ┌─────────────────────────────────┐   │
│  │ Input value                🔴   │   │
│  └─────────────────────────────────┘   │
│  ⚠️ Error message here                │
└─────────────────────────────────────────┘

.input-error {
  border-color: #ef4444;
}

.input-error:focus {
  border-color: #ef4444;
  box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.1);
}
`

### Textarea

`
┌─────────────────────────────────────────┐
│  ┌─────────────────────────────────┐   │
│  │                                 │   │
│  │ Textarea content               │   │
│  │                                 │   │
│  │                                 │   │
│  └─────────────────────────────────┘   │
└─────────────────────────────────────────┘

.textarea {
  min-height: 120px;
  padding: 12px 16px;
  resize: vertical;
  border-radius: 10px;
}
`

---

## Card

### Default Card

`
┌─────────────────────────────────────────┐
│  ┌─────────────────────────────────┐   │
│  │ [Accent bar]                    │   │
│  │                                 │   │
│  │ Card Title                      │   │
│  │ Card description text here...  │   │
│  │                                 │   │
│  │ Meta • Info                     │   │
│  └─────────────────────────────────┘   │
└─────────────────────────────────────────┘

.card {
  background: #ffffff;
  border: 1px solid #e4e4e7;
  border-radius: 14px;
  overflow: hidden;
  transition: box-shadow 200ms ease-out, transform 200ms ease-out;
}

.card:hover {
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.08);
}

.card:active {
  transform: scale(0.99);
}

/* Accent bar variant */
.card-accent {
  position: relative;
}

.card-accent::before {
  content: '';
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 4px;
  background: var(--accent-color);
}
`

### Card with Type Badge

`
┌─────────────────────────────────────────┐
│  ┌─────────────────────────────────┐   │
│  │ 🟢 Agenda                       │   │
│  │                                 │   │
│  │ Rapat Koordinasi Daerah          │   │
│  │ Senin, 15 Agt 2026              │   │
│  │ 09:00 - 11:00                    │   │
│  │ 📍 Ruang Rapat Utama            │   │
│  │                                 │   │
│  │ [12 foto]              →        │   │
│  └─────────────────────────────────┘   │
└─────────────────────────────────────────┘
`

---

## Badge

### Badge Variants

| Variant | Background | Text | Usage |
|---------|------------|------|-------|
| Default | #f4f4f5 | #71717a | Neutral |
| Primary | #f3e8ff | #9333ea | Active |
| Success | #f0fdf4 | #16a34a | Success |
| Warning | #fffbeb | #d97706 | Warning |
| Error | #fef2f2 | #dc2626 | Error |
| Agenda | #f0fdf4 | #16a34a | Agenda type |
| Audiensi | #fffbeb | #d97706 | Audiensi type |

### Badge Style

`
┌─────────────────────────────────────────┐
│                                         │
│  ┌───────────────┐                     │
│  │  🟢 Agenda    │                     │
│  └───────────────┘                     │
│                                         │
└─────────────────────────────────────────┘

.badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 4px 10px;
  font-size: 12px;
  font-weight: 500;
  border-radius: 9999px;
  white-space: nowrap;
}

.badge-primary {
  background: #f3e8ff;
  color: #9333ea;
}

.badge-success {
  background: #f0fdf4;
  color: #16a34a;
}

.badge-warning {
  background: #fffbeb;
  color: #d97706;
}
`

---

## Avatar

### Avatar Sizes

| Size | Dimension | Font Size |
|------|-----------|-----------|
| Small | 32px | 12px |
| Medium | 40px | 14px |
| Large | 48px | 16px |
| XLarge | 64px | 20px |

### Avatar Style

`
┌─────────────────────────────────────────┐
│                                         │
│     ┌──────┐                           │
│     │  👤  │  ← Avatar with image     │
│     └──────┘                           │
│                                         │
│     ┌──────┐                           │
│     │  JD  │  ← Avatar with initials   │
│     └──────┘                           │
│                                         │
└─────────────────────────────────────────┘

.avatar {
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background: linear-gradient(135deg, #9333ea 0%, #3b82f6 100%);
  color: #ffffff;
  font-weight: 600;
  overflow: hidden;
}

.avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
`

---

## Toast

### Toast Variants

| Variant | Icon | Background |
|---------|------|------------|
| Success | ✓ | #f0fdf4 border |
| Error | ✕ | #fef2f2 border |
| Warning | ⚠ | #fffbeb border |
| Info | ℹ | #eff6ff border |

### Toast Style

`
┌─────────────────────────────────────────┐
│  ┌─────────────────────────────────┐   │
│  │ ✓ Agenda berhasil dibuat        │   │
│  └─────────────────────────────────┘   │
│                                         │
└─────────────────────────────────────────┘

.toast {
  position: fixed;
  bottom: 80px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 800;
  
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  background: #ffffff;
  border-radius: 10px;
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.12);
  
  animation: toastIn 200ms ease-out;
}

@keyframes toastIn {
  from {
    opacity: 0;
    transform: translateX(-50%) translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateX(-50%) translateY(0);
  }
}
`

---

## Modal

### Modal Overlay

`
┌─────────────────────────────────────────┐
│  ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░  │
│  ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░  │
│  ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░  │
│  ░░░░░░░░░┌─────────────────────┐░░░░░  │
│  ░░░░░░░░░│      HEADER         │░░░░░  │
│  ░░░░░░░░░├─────────────────────┤░░░░░  │
│  ░░░░░░░░░│                     │░░░░░  │
│  ░░░░░░░░░│      CONTENT        │░░░░░  │
│  ░░░░░░░░░│                     │░░░░░  │
│  ░░░░░░░░░├─────────────────────┤░░░░░  │
│  ░░░░░░░░░│  [Cancel] [Confirm] │░░░░░  │
│  ░░░░░░░░░└─────────────────────┘░░░░░  │
│  ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░  │
└─────────────────────────────────────────┘

.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(4px);
  z-index: 400;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 16px;
}

.modal-content {
  background: #ffffff;
  border-radius: 20px;
  max-width: 400px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
  z-index: 500;
  
  animation: modalIn 200ms ease-out;
}

@keyframes modalIn {
  from {
    opacity: 0;
    transform: scale(0.95);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}
`

---

## BottomSheet

### Bottom Sheet Style

`
┌─────────────────────────────────────────┐
│                                         │
│                                         │
│                                         │
├─────────────────────────────────────────┤
│  ┌─────────────────────────────────┐   │
│  │                            [X]  │   │
│  ├─────────────────────────────────┤   │
│  │                                 │   │
│  │ Sheet content here...           │   │
│  │                                 │   │
│  │                                 │   │
│  ├─────────────────────────────────┤   │
│  │  [Cancel]         [Confirm]    │   │
│  └─────────────────────────────────┘   │
│  ◄──────── drag handle                │
└─────────────────────────────────────────┘

.bottom-sheet {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: #ffffff;
  border-radius: 20px 20px 0 0;
  z-index: 500;
  
  animation: sheetUp 250ms ease-out;
}

@keyframes sheetUp {
  from {
    transform: translateY(100%);
  }
  to {
    transform: translateY(0);
  }
}

.drag-handle {
  width: 36px;
  height: 4px;
  background: #e4e4e7;
  border-radius: 2px;
  margin: 8px auto;
}
`

---

## Skeleton

### Skeleton Component

`
┌─────────────────────────────────────────┐
│  ┌─────────────────────────────────┐   │
│  │  ████████████████████            │   │
│  │  ████████  ██████████████        │   │
│  └─────────────────────────────────┘   │
└─────────────────────────────────────────┘

.skeleton {
  background: linear-gradient(
    90deg,
    #f4f4f5 0%,
    #e4e4e7 50%,
    #f4f4f5 100%
  );
  background-size: 200% 100%;
  border-radius: 6px;
  animation: shimmer 1.5s infinite;
}

@keyframes shimmer {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}

/* Skeleton variants */
.skeleton-text {
  height: 16px;
  margin-bottom: 8px;
}

.skeleton-title {
  height: 24px;
  width: 60%;
  margin-bottom: 12px;
}

.skeleton-avatar {
  width: 48px;
  height: 48px;
  border-radius: 50%;
}

.skeleton-card {
  padding: 16px;
  border-radius: 14px;
  background: #ffffff;
  border: 1px solid #e4e4e7;
}
`

---

## Header

### Header Component

`
┌─────────────────────────────────────────┐
│  ┌─────────────────────────────────┐   │
│  │ [Logo]              [Bell 🔔]  │   │
│  └─────────────────────────────────┘   │
└─────────────────────────────────────────┘

.header {
  position: sticky;
  top: 0;
  z-index: 300;
  
  display: flex;
  align-items: center;
  justify-content: space-between;
  
  height: 56px;
  padding: 0 16px;
  padding-top: max(12px, env(safe-area-inset-top));
  
  background: #ffffff;
  border-bottom: 1px solid #f4f4f5;
}

.header-logo {
  height: 28px;
  width: auto;
}

.header-action {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 44px;
  height: 44px;
  border-radius: 50%;
  background: transparent;
  transition: background 100ms ease-out;
}

.header-action:hover {
  background: #f4f4f5;
}

.header-action:active {
  background: #e4e4e7;
}
`

---

## BottomNav

### Bottom Navigation Component

`
┌─────────────────────────────────────────┐
├─────────────────────────────────────────┤
│                                         │
│     [🏠]        [+]        [👤]        │
│    Beranda     Agenda      Akun         │
│                                         │
└─────────────────────────────────────────┘

.bottom-nav {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 300;
  
  display: flex;
  align-items: center;
  justify-content: space-around;
  
  height: 64px;
  padding-bottom: max(8px, env(safe-area-inset-bottom));
  
  background: #ffffff;
  border-top: 1px solid #f4f4f5;
}

.nav-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 4px;
  padding: 8px 16px;
  
  color: #71717a;
  text-decoration: none;
  transition: color 150ms ease-out;
}

.nav-item.active {
  color: #9333ea;
}

.nav-item-icon {
  font-size: 24px;
}

.nav-item-label {
  font-size: 11px;
  font-weight: 500;
}

/* FAB */
.nav-fab {
  position: relative;
  width: 48px;
  height: 48px;
  margin-top: -24px;
  
  background: linear-gradient(135deg, #9333ea 0%, #3b82f6 100%);
  border-radius: 50%;
  border: none;
  box-shadow: 0 4px 12px rgba(147, 51, 234, 0.3);
  
  color: #ffffff;
  font-size: 24px;
  
  cursor: pointer;
  transition: transform 100ms ease-out, box-shadow 100ms ease-out;
}

.nav-fab:hover {
  transform: scale(1.05);
  box-shadow: 0 6px 16px rgba(147, 51, 234, 0.4);
}

.nav-fab:active {
  transform: scale(0.95);
}
`

---

## Document History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 2.0.0 | August 2026 | Design Team | Complete component redesign |
| 1.0.0 | Earlier | Design Team | Initial release |

---

**Previous Document:** [04_UX_RULES.md](./04_UX_RULES.md)  
**Next Document:** [06_ICONOGRAPHY.md](./06_ICONOGRAPHY.md) - Icons

---

*This document defines UI components for SIMPATI. All components must follow these specifications.*
