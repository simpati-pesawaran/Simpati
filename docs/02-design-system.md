# Design System

## UI Quality Target

Target kualitas UI参照：

- **Apple Human Interface Guidelines**
- **Google Calendar**
- **Linear**
- **Notion**

Karakteristik:

- Modern
- Premium
- Elegant
- Clean
- Banyak white space
- Micro-interactions yang halus

---

## Color Palette

### Primary (Navy Gradient)

```
--navy-900:    #0f172a    (Darkest)
--navy-800:    #1e3a5f    (Primary brand - HEADER)
--navy-700:    #2d5a8a    (Gradient end)
--navy-600:    #3b82f6    (Accent blue)

Gradient:      linear-gradient(135deg, #1e3a5f 0%, #2d5a8a 100%)
```

### Google Calendar Colors

```
--calendar-agenda:   #22c55e    (Green - Kegiatan)
--calendar-audensi:  #f97316    (Orange - Audiensi)
```

### Background

```
--background:        #ffffff    (White - Main background)
--surface:           #f8fafc    (Light gray - Cards)
--surface-hover:     #f1f5f9    (Hover state)
```

### Text

```
--text-primary:      #1e293b    (Main text)
--text-secondary:    #64748b    (Muted text)
--text-disabled:     #94a3b8    (Disabled)
--text-inverse:      #ffffff    (On dark backgrounds)
```

### Status

```
--success:           #22c55e    (Green)
--warning:           #f59e0b    (Amber)
--error:             #ef4444    (Red)
--info:              #3b82f6    (Blue)
```

---

## Typography

### Font Family

```
Primary:   Inter (Google Fonts)
Fallback:  -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif
```

### Font Sizes

```
text-xs:       12px / 0.75rem    (Caption)
text-sm:       14px / 0.875rem   (Small body)
text-base:     16px / 1rem       (Default - iOS safe)
text-lg:       18px / 1.125rem   (Large body)
text-xl:       20px / 1.25rem    (H3)
text-2xl:      24px / 1.5rem     (H2)
text-3xl:      30px / 1.875rem   (H1)
```

### Font Weights

```
font-normal:   400
font-medium:   500
font-semibold: 600
font-bold:     700
```

---

## Spacing

### Base Unit: 4px

```
space-1:       4px   / 0.25rem
space-2:       8px   / 0.5rem
space-3:       12px  / 0.75rem
space-4:       16px  / 1rem       (Default padding)
space-5:       20px  / 1.25rem
space-6:       24px  / 1.5rem
space-8:       32px  / 2rem
space-10:      40px  / 2.5rem
space-12:      48px  / 3rem
```

---

## Border Radius

```
rounded-sm:     4px   / 0.25rem
rounded:        8px   / 0.5rem    (Default)
rounded-lg:     12px  / 0.75rem   (Cards)
rounded-xl:     16px  / 1rem
rounded-full:   9999px              (Pills, avatars)
```

---

## Shadows

```
shadow-sm:      0 1px 2px 0 rgb(0 0 0 / 0.05)
shadow:         0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)
shadow-md:      0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)
shadow-lg:      0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)
shadow-xl:      0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)
```

---

## Layout

### Header

```
┌─────────────────────────────────────┐
│  [Logo]              [Bell Icon]   │
│  Navy Gradient                    │
│  Height: 56px                     │
│  Safe area top padding             │
└─────────────────────────────────────┘
```

- Logo: "SIMPATI" text atau icon di kiri
- Bell: Notification icon di kanan
- Background: Navy gradient (#1e3a5f → #2d5a8a)
- Sticky position

### Bottom Navigation

```
┌─────────────────────────────────────┐
│                                     │
│         CONTENT AREA                │
│                                     │
│                                     │
├─────────────────────────────────────┤
│  [Home]     [FAB]     [Account]    │
│  Beranda    Agenda     Akun         │
│             +                        │
└─────────────────────────────────────┘

Height: 64px + safe-area-bottom
Background: White
Border-top: 1px gray-200
FAB: Floating Action Button (centered)
```

### Page Container

```
Padding: 16px
Padding-bottom: 100px (for bottom nav clearance)
Background: White
```

---

## Components

### Button

#### Primary Button
```
Background: Navy gradient
Text: White
Height: 48px (touch-friendly)
Border-radius: 12px
Shadow: shadow-md with navy opacity
Hover: shadow-lg, slight lift
Active: scale(0.98)
```

#### Secondary Button
```
Background: White
Border: 1px navy-800
Text: navy-800
Height: 48px
```

#### Ghost Button
```
Background: transparent
Text: navy-800
Hover: bg-surface
```

### Card

```
Background: white
Border: 1px gray-100
Border-radius: 12px
Shadow: shadow-sm
Padding: 16px
Hover: shadow-md, translate-y(-2px)
Transition: 200ms ease
```

### Input

```
Height: 48px (touch-friendly, prevents iOS zoom)
Padding: 12px 16px
Border: 1px gray-200
Border-radius: 8px
Focus: ring-2 navy-600
Font-size: 16px (prevents iOS zoom)
```

### Badge

```
Variants:
- success: bg-green-100 text-green-700
- warning: bg-amber-100 text-amber-700
- error: bg-red-100 text-red-700
- info: bg-blue-100 text-blue-700
- default: bg-gray-100 text-gray-700

Border-radius: 9999px (pill)
Padding: 4px 12px
Font-size: 12px
```

### FAB (Floating Action Button)

```
Size: 56px diameter
Background: Navy gradient
Icon: Plus (+)
Color: White
Shadow: shadow-lg
Position: Center of bottom nav
Bottom: 80px from screen bottom
Hover: scale(1.05)
Active: scale(0.95)
```

---

## Animations

### Page Transition
```css
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(8px); }
  to { opacity: 1; transform: translateY(0); }
}
Duration: 200ms
Easing: cubic-bezier(0.4, 0, 0.2, 1)
```

### Micro-interactions
```
Button press: scale(0.98) → 150ms
Card hover: translateY(-2px) + shadow-md → 200ms
FAB hover: scale(1.05) → 150ms
Icon transition: 200ms
```

---

## iOS/Safari Optimizations

### Safe Areas
```css
padding-top: env(safe-area-inset-top);
padding-bottom: env(safe-area-inset-bottom);
```

### Input Zoom Prevention
```css
input, textarea, select {
  font-size: 16px; /* Prevents zoom on iOS */
}
```

### Touch Feedback
```css
button, a {
  -webkit-tap-highlight-color: transparent;
}
```

### Smooth Scrolling
```css
html {
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  scroll-behavior: smooth;
}
```

### Pull-to-Refresh Prevention
```css
body {
  overscroll-behavior: none;
}
```

---

## Accessibility

### Focus States
```css
*:focus-visible {
  outline: 2px solid var(--navy-600);
  outline-offset: 2px;
}
```

### Touch Targets
```
Minimum: 44px x 44px
Recommended: 48px x 48px
```

### Color Contrast
```
Primary text: #1e293b on #ffffff = 15.7:1 ✓
Secondary text: #64748b on #ffffff = 5.7:1 ✓
```

---

*Design System v2.0 - August 2026*
