# 🎨 SIMPATI - Design System

## 📋 Overview

**Nama:** SIMPATI
**Deskripsi:** Sistem Informasi Manajemen Protokol & Agenda Terintegrasi
**Theme:** Modern Elegant, Mobile-first, iOS/Safari optimized
**Color Direction:** Navy gradient biru, halaman putih bersih

---

## 🎨 Color Palette

### Primary Colors (Navy Series)

```
Navy Dark:     #0f172a
Navy Primary:   #1e3a5f    ← Main brand color
Navy Light:     #2d5a8a
Accent Blue:    #3b82f6

Gradient:       linear-gradient(135deg, #1e3a5f 0%, #2d5a8a 100%)
```

### Background Colors

```
White:          #ffffff    ← Main background (PUTIH)
Gray 50:        #f8fafc    ← Card backgrounds
Gray 100:       #f1f5f9    ← Borders, dividers
Gray 200:       #e2e8f0    ← Disabled states
```

### Text Colors

```
Text Primary:   #1e293b    ← Main text (slate)
Text Secondary: #64748b    ← Muted text
Text Inverse:   #ffffff    ← Text on dark backgrounds
```

### Status Colors

```
Success:        #22c55e    ← Green (approved)
Warning:        #f59e0b    ← Amber (pending)
Error:          #ef4444    ← Red (rejected)
Info:           #3b82f6    ← Blue (info)
```

---

## 📝 Typography

### Font Family
```
Primary:        Inter (sans-serif)
Fallback:       -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif
```

### Font Sizes

```
text-xs:        12px / 0.75rem
text-sm:        14px / 0.875rem    ← Body text
text-base:     16px / 1rem         ← Default
text-lg:       18px / 1.125rem
text-xl:       20px / 1.25rem      ← Headings
text-2xl:      24px / 1.5rem       ← Page titles
text-3xl:      30px / 1.875rem
```

### Font Weights

```
font-normal:    400
font-medium:    500
font-semibold:  600
font-bold:      700
```

---

## 📐 Spacing System

```
Base unit:      4px

space-1:        4px     / 0.25rem
space-2:        8px     / 0.5rem
space-3:        12px    / 0.75rem
space-4:        16px    / 1rem       ← Default padding
space-5:        20px    / 1.25rem
space-6:        24px    / 1.5rem
space-8:        32px    / 2rem
space-10:       40px    / 2.5rem
space-12:       48px    / 3rem
```

---

## 🔲 Border Radius

```
rounded-none:   0px
rounded-sm:     4px     / 0.25rem
rounded:        8px     / 0.5rem    ← Default
rounded-lg:     12px    / 0.75rem   ← Cards
rounded-xl:     16px    / 1rem
rounded-full:   9999px                ← Pills, avatars
```

---

## 🌫️ Shadows

```
shadow-sm:      0 1px 2px 0 rgb(0 0 0 / 0.05)
shadow:         0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)
shadow-md:      0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)
shadow-lg:      0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)
shadow-xl:      0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)
```

---

## 📱 Breakpoints

```
Mobile:         < 640px     / sm
Tablet:         640px - 1024px  / md-lg
Desktop:        > 1024px    / xl
```

### iOS Specific
```
Safe area top:     env(safe-area-inset-top)
Safe area bottom:  env(safe-area-inset-bottom)
```

---

## 🧩 Components

### 1. Header

```tsx
// Structure
<header className="sticky top-0 z-50">
  <div className="bg-gradient-to-r from-[#1e3a5f] to-[#2d5a8a]">
    <div className="px-4 py-3 flex items-center justify-between">
      {/* Logo */}
      {/* Bell Icon */}
      {/* Profile Avatar */}
    </div>
  </div>
</header>

// Style: Navy gradient, white text
// Height: 56px
// Sticky position
```

### 2. Bottom Navigation

```tsx
// Structure
<nav className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200">
  <div className="flex items-center justify-around">
    {/* Nav Items: 6 items */}
  </div>
</nav>

// Items:
// - Kegiatan    (calendar-check)
// - Audensi     (users)
// - Calendar    (calendar)
// - Galeri      (image)
// - Usulan      (inbox)
// - Profile     (user)

// Style: White bg, navy active state
// Height: 64px + safe-area
// Active: Navy color + indicator line
```

### 3. Cards

```tsx
// Activity Card
<div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
  <div className="flex items-start gap-3">
    {/* Icon */}
    <div className="flex-1">
      {/* Title */}
      {/* Meta info */}
    </div>
    {/* Status badge */}
  </div>
</div>

// Style: White bg, rounded-xl, subtle shadow
// Padding: 16px
// Border: 1px gray-100
```

### 4. Buttons

```tsx
// Primary Button
<button className="bg-[#1e3a5f] text-white px-4 py-2 rounded-lg font-medium">
  Simpan
</button>

// Secondary Button
<button className="bg-white text-[#1e3a5f] border border-[#1e3a5f] px-4 py-2 rounded-lg">
  Batal
</button>

// Ghost Button
<button className="text-[#64748b] hover:text-[#1e3a5f]">
  Link
</button>

// Sizes: sm (32px), md (40px), lg (48px)
```

### 5. Form Inputs

```tsx
// Input Field
<input 
  type="text"
  className="w-full px-4 py-3 bg-white border border-gray-200 rounded-lg
             focus:outline-none focus:ring-2 focus:ring-[#3b82f6] focus:border-transparent
             placeholder:text-gray-400"
  placeholder="Masukkan judul kegiatan"
/>

// Style: White bg, gray-200 border
// Focus: Blue ring
// Height: 48px (touch-friendly)
// Border radius: 8px
```

### 6. Badges

```tsx
// Status Badge
<span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-700">
  Approved
</span>

// Colors:
// - Approved:  bg-green-100 text-green-700
// - Pending:   bg-amber-100 text-amber-700
// - Rejected:  bg-red-100 text-red-700
// - Published: bg-blue-100 text-blue-700
```

### 7. Modal / Dialog

```tsx
// Overlay
<div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
  {/* Modal */}
  <div className="bg-white rounded-2xl w-full max-w-md max-h-[90vh] overflow-auto">
    {/* Header */}
    {/* Content */}
    {/* Footer */}
  </div>
</div>

// Style: Centered, white bg, rounded-2xl
// Overlay: Black 50% opacity
// Max width: 448px
```

### 8. Empty State

```tsx
<div className="flex flex-col items-center justify-center py-12 text-center">
  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
    {/* Icon */}
  </div>
  <h3 className="text-lg font-semibold text-gray-900 mb-2">
    Belum ada kegiatan
  </h3>
  <p className="text-gray-500 mb-4">
    Tambahkan kegiatan pertama Anda
  </p>
</div>
```

---

## 📄 Page Layouts

### Admin Dashboard Layout

```
┌─────────────────────────────────────┐
│  HEADER (Navy Gradient, 56px)       │
│  [Logo] [Title]      [Bell][Avatar] │
├─────────────────────────────────────┤
│                                     │
│  CONTENT AREA                       │
│  (Scrollable, white bg)             │
│                                     │
│  padding: 16px                     │
│  padding-bottom: 80px              │
│  (for bottom nav clearance)        │
│                                     │
├─────────────────────────────────────┤
│  BOTTOM NAV (Fixed, 64px)           │
│  [ Keg ] [ Aud ] [ Cal ]           │
│  [ Gal ] [ Usu ] [ Pro ]           │
└─────────────────────────────────────┘
```

### Public Page Layout

```
┌─────────────────────────────────────┐
│  HEADER (Transparent/White, 56px)   │
│  [Logo]              [Bell]          │
├─────────────────────────────────────┤
│                                     │
│  TABS                               │
│  [ Agenda ] [ Kalender ] [ Usul+ ]  │
│                                     │
├─────────────────────────────────────┤
│                                     │
│  CONTENT                            │
│  (White bg)                         │
│                                     │
└─────────────────────────────────────┘
```

---

## 🔮 Animations & Transitions

```css
/* Page transitions */
.page-enter {
  opacity: 0;
  transform: translateY(10px);
}
.page-enter-active {
  opacity: 1;
  transform: translateY(0);
  transition: opacity 200ms, transform 200ms;
}

/* Button press effect */
.button-press:active {
  transform: scale(0.98);
}

/* Card hover */
.card-hover:hover {
  shadow-md;
  transform: translateY(-2px);
}

/* Timing */
duration-fast:    150ms
duration-normal:  200ms
duration-slow:    300ms

easing-default:   cubic-bezier(0.4, 0, 0.2, 1)
easing-bounce:    cubic-bezier(0.68, -0.55, 0.265, 1.55)
```

---

## 🌐 iOS/Safari Optimizations

```css
/* Prevent overscroll */
html, body {
  overscroll-behavior: none;
}

/* iOS safe areas */
padding-bottom: env(safe-area-inset-bottom);
padding-top: env(safe-area-inset-top);

/* Disable pull-to-refresh */
body {
  overscroll-behavior-y: contain;
}

/* iOS button styling */
button {
  -webkit-appearance: none;
  -webkit-tap-highlight-color: transparent;
}

/* iOS input rounding fix */
input, textarea, select {
  font-size: 16px; /* Prevents zoom on focus */
}

/* Smooth scrolling */
html {
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}
```

---

## 📐 PWA Specifications

### App Icon
```
Format:     PNG
Sizes:      192x192, 512x512
Background: White
Icon:       Navy (#1e3a5f)
Corner:     rounded-lg (20px)
```

### Splash Screen (iOS)
```
Background: #1e3a5f (Navy)
Text:       SIMPATI (White, 24px, semibold)
Logo:       Centered
```

### Manifest Colors
```json
{
  "name": "SIMPATI",
  "short_name": "SIMPATI",
  "background_color": "#ffffff",
  "theme_color": "#1e3a5f",
  "display": "standalone",
  "orientation": "portrait"
}
```

---

## ♿ Accessibility

```css
/* Focus visible */
*:focus-visible {
  outline: 2px solid #3b82f6;
  outline-offset: 2px;
}

/* Color contrast */
.text-primary:     #1e293b (ratio: 15.7:1) ✓
.text-secondary:   #64748b (ratio: 5.7:1) ✓

/* Touch targets */
min-height:  44px
min-width:   44px

/* Screen reader */
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  border: 0;
}
```

---

## 🎯 Implementation Guidelines

### Do's
- ✅ White background for content areas
- ✅ Navy gradient for headers and CTAs
- ✅ 48px minimum height for form inputs
- ✅ 44px minimum for touch targets
- ✅ Inter font family
- ✅ Consistent 16px base padding
- ✅ iOS safe area support

### Don'ts
- ❌ Dark backgrounds for main content
- ❌ Inconsistent border radius
- ❌ Text smaller than 14px
- ❌ Less than 44px touch targets
- ❌ jarring color transitions

---

*SIMPATI - Sistem Informasi Manajemen Protokol & Agenda Terintegrasi*

*Design System v1.0 - August 2026*
