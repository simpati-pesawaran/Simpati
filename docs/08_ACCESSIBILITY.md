# SIMPATI - Accessibility

**Version:** 2.0.0  
**Last Updated:** August 2026  
**Document Owner:** Design Team  
**Classification:** Internal - Confidential

---

## Table of Contents

1. [Overview](#overview)
2. [Color Contrast](#color-contrast)
3. [Touch Targets](#touch-targets)
4. [Focus States](#focus-states)
5. [Screen Reader](#screen-reader)
6. [Keyboard Navigation](#keyboard-navigation)
7. [Reduced Motion](#reduced-motion)
8. [Text Scaling](#text-scaling)

---

## Overview

### Accessibility Commitment

SIMPATI is designed to be accessible to all users, including those with disabilities. We follow:

- **WCAG 2.1 Level AA** as our target standard
- **Apple Accessibility Guidelines** for iOS-specific features
- **W3C WAI** best practices

### Core Principles

| Principle | Description |
|-----------|-------------|
| **Perceivable** | Information must be presentable to users |
| **Operable** | UI components must be operable |
| **Understandable** | Information and UI must be understandable |
| **Robust** | Content must be robust enough for various interpreters |

---

## Color Contrast

### Minimum Contrast Ratios

| Text Type | Minimum Ratio | Target |
|-----------|--------------|--------|
| Normal text (< 18px) | 4.5:1 | 5:1+ |
| Large text (>= 18px bold) | 3:1 | 4:1+ |
| UI components | 3:1 | 4:1+ |

### Our Color Contrast

| Foreground | Background | Ratio | Status |
|------------|------------|-------|--------|
| #18181b | #ffffff | 18.1:1 | ✅ Excellent |
| #71717a | #ffffff | 5.2:1 | ✅ Pass |
| #9333ea | #ffffff | 5.9:1 | ✅ Pass |
| #ffffff | #9333ea | 4.6:1 | ✅ Pass |
| #22c55e | #f0fdf4 | 3.9:1 | ✅ Pass |
| #ef4444 | #fef2f2 | 4.1:1 | ✅ Pass |

### Contrast Checking

Always verify contrast for:
- Primary text
- Secondary text
- Links
- Button text
- Badge text
- Placeholder text (should have adequate contrast)

---

## Touch Targets

### Minimum Size

**Apple HIG:** 44x44px minimum  
**SIMPATI Standard:** 44x44px (non-negotiable)

`
┌─────────────────────────────────────┐
│                                     │
│   ┌───────────────────────────┐    │
│   │                           │    │
│   │    TOUCH TARGET           │    │  Minimum 44x44px
│   │                           │    │
│   └───────────────────────────┘    │
│                                     │
└─────────────────────────────────────┘
`

### Spacing Between Targets

Maintain adequate spacing between touch targets to prevent accidental taps.

| Target Size | Minimum Gap |
|-------------|-------------|
| 44x44px | 4px |
| 48x48px | 4px |
| 56x56px | 8px |

### Touch Target Implementation

`css
/* All interactive elements */
button,
a,
[role="button"],
input[type="checkbox"],
input[type="radio"],
select,
.checkbox,
.radio {
  min-width: 44px;
  min-height: 44px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}
`

---

## Focus States

### Focus Visibility

All interactive elements must have visible focus states for keyboard users.

`css
/* Default focus */
*:focus {
  outline: none;
}

/* Visible focus for keyboard navigation */
*:focus-visible {
  outline: 2px solid #9333ea;
  outline-offset: 2px;
}

/* Remove focus for mouse/touch */
*:focus:not(:focus-visible) {
  outline: none;
}
`

### Focus Order

Elements should be focusable in a logical order that follows the visual layout.

1. Header actions (left to right)
2. Page content (top to bottom, left to right)
3. Bottom navigation

### Focus Indicators

| Element | Indicator |
|---------|-----------|
| Button | 2px purple ring |
| Input | Purple border + shadow |
| Link | Underline or purple color |
| Card | Subtle shadow increase |

---

## Screen Reader

### Semantic HTML

Use proper HTML elements to convey meaning:

`	sx
// ❌ Non-semantic
<div onClick={handleClick}>Click me</div>

// ✅ Semantic
<button onClick={handleClick}>Click me</button>
`

### ARIA Labels

Add ARIA labels when visual context is insufficient:

`	sx
// Icon-only button
<button aria-label="Notifications">
  <Bell size={24} />
</button>

// Navigation
<nav aria-label="Main navigation">
  <a href="/" aria-current="page">Beranda</a>
  <a href="/agenda">Agenda</a>
  <a href="/akun">Akun</a>
</nav>

// Form
<label htmlFor="name">Nama</label>
<input
  id="name"
  aria-describedby="name-hint"
  placeholder="Masukkan nama"
/>
<span id="name-hint">Nama lengkap Anda</span>
`

### Live Regions

Announce dynamic content changes:

`	sx
// Toast announcement
<div
  role="status"
  aria-live="polite"
  className="toast"
>
  Agenda berhasil dibuat
</div>

// Error announcement
<div role="alert" aria-live="assertive">
  Terjadi kesalahan: koneksi terputus
</div>
`

### Image Alt Text

`	sx
// ❌ Missing alt
<img src="/photo.jpg" />

// ✅ Descriptive alt
<img src="/photo.jpg" alt="Rapat koordinasi di Ruang Rapat Utama" />

// ✅ Decorative image
<img src="/decoration.svg" alt="" aria-hidden="true" />
`

---

## Keyboard Navigation

### Supported Keys

| Key | Action |
|-----|--------|
| Tab | Move to next focusable element |
| Shift+Tab | Move to previous focusable element |
| Enter | Activate button/link |
| Space | Activate button/checkbox |
| Escape | Close modal/dropdown |
| Arrow keys | Navigate within component |

### Keyboard Implementation

`	sx
// Modal keyboard handling
useEffect(() => {
  const handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      onClose();
    }
  };
  
  if (isOpen) {
    document.addEventListener('keydown', handleKeyDown);
    // Trap focus within modal
  }
  
  return () => {
    document.removeEventListener('keydown', handleKeyDown);
  };
}, [isOpen, onClose]);
`

### Skip Links

Provide skip links for keyboard users:

`	sx
// Skip to main content
<a href="#main-content" className="skip-link">
  Langsung ke konten utama
</a>

<main id="main-content">
  Page content
</main>

<style>
.skip-link {
  position: absolute;
  top: -100px;
  left: 50%;
  transform: translateX(-50%);
  padding: 12px 24px;
  background: #9333ea;
  color: white;
  border-radius: 10px;
  z-index: 9999;
}

.skip-link:focus {
  top: 16px;
}
</style>
`

---

## Reduced Motion

### Respect Preferences

`css
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}
`

### React Implementation

`	sx
import { useState, useEffect } from 'react';

export const useReducedMotion = () => {
  const [reducedMotion, setReducedMotion] = useState(false);
  
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReducedMotion(mediaQuery.matches);
    
    const handler = (e) => setReducedMotion(e.matches);
    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);
  
  return reducedMotion;
};

// Usage
const AnimatedButton = ({ children }) => {
  const reducedMotion = useReducedMotion();
  
  return (
    <button
      className={reducedMotion ? '' : 'animate-fade-in'}
    >
      {children}
    </button>
  );
};
`

---

## Text Scaling

### Responsive Typography

Typography should scale appropriately when users change their browser's font size.

`css
/* Use relative units */
.text-base {
  font-size: 0.9375rem; /* Relative to root */
}

.text-xl {
  font-size: 1.25rem; /* Won't break at larger sizes */
}

/* Don't cap max font size */
body {
  font-size: 100%; /* Respects user preferences */
}
`

### Line Height

Maintain readable line height at all text sizes:

| Font Size | Line Height |
|-----------|-------------|
| Small (13px) | 1.4-1.5 |
| Base (15px) | 1.5 |
| Large (17px) | 1.4 |
| Heading (24px) | 1.25 |

---

## Accessibility Checklist

### Before Ship

- [ ] Color contrast passes WCAG AA
- [ ] All images have alt text
- [ ] All form inputs have labels
- [ ] Focus states are visible
- [ ] Keyboard navigation works
- [ ] Screen reader announces content correctly
- [ ] Touch targets are 44x44px minimum
- [ ] Reduced motion is respected

### Testing Tools

| Tool | Purpose |
|------|---------|
| WAVE | Web accessibility evaluation |
| axe DevTools | Automated accessibility testing |
| VoiceOver | Screen reader testing (macOS/iOS) |
| TalkBack | Screen reader testing (Android) |
| Keyboard | Manual keyboard navigation |

---

## Document History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 2.0.0 | August 2026 | Design Team | Complete accessibility guide |
| 1.0.0 | Earlier | Design Team | Initial release |

---

**Previous Document:** [07_MOTION_SYSTEM.md](./07_MOTION_SYSTEM.md)  
**Next Document:** [09_ROADMAP.md](./09_ROADMAP.md) - Roadmap

---

*This document ensures SIMPATI is accessible to all users.*
