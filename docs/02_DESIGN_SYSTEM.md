# SIMPATI - Design System

**Version:** 2.0.0  
**Last Updated:** August 2026  
**Document Owner:** Design Team  
**Status:** Implementation Reference

---

## Table of Contents

1. [Overview](#overview)
2. [Design Tokens](#design-tokens)
3. [Color System](#color-system)
4. [Typography System](#typography-system)
5. [Spacing System](#spacing-system)
6. [Border Radius](#border-radius)
7. [Shadow System](#shadow-system)
8. [Layout System](#layout-system)
9. [Z-Index Scale](#z-index-scale)
10. [Animation Tokens](#animation-tokens)
11. [CSS Implementation](#css-implementation)

---

## Overview

### Purpose

This document provides the **complete implementation reference** for all design decisions in SIMPATI. It contains CSS custom properties (design tokens) that should be used throughout the application.

### How to Use

1. **Import tokens** in app/globals.css
2. **Reference tokens** when creating new components
3. **Follow spacing** for consistent layouts
4. **Use typography scale** for text hierarchy

---

## Design Tokens

### CSS Variable Naming Convention

\\\css
/* Format: --[category]-[variant]-[state] */

/* Colors */
--color-primary-500
--color-primary-hover

/* Typography */
--font-size-lg
--font-weight-semibold

/* Spacing */
--space-4
--space-unit

/* Border */
--radius-lg
--radius-full

/* Shadow */
--shadow-sm
--shadow-lg

/* Animation */
--duration-fast
--ease-out
\\\

---

## Color System

### Primary Palette - Blue-Purple Gradient

This is our signature gradient for primary elements. It represents innovation and modern government.

\\\css
:root {
  /* Primary Purple */
  --color-primary-50: #faf5ff;
  --color-primary-100: #f3e8ff;
  --color-primary-200: #e9d5ff;
  --color-primary-300: #d8b4fe;
  --color-primary-400: #c084fc;
  --color-primary-500: #a855f7;
  --color-primary-600: #9333ea;    /* Primary action */
  --color-primary-700: #7e22ce;
  --color-primary-800: #6b21a8;
  --color-primary-900: #581c87;
  --color-primary-950: #3b0764;

  /* Primary Blue */
  --color-blue-50: #eff6ff;
  --color-blue-100: #dbeafe;
  --color-blue-500: #3b82f6;
  --color-blue-600: #2563eb;

  /* Gradient - THE SIGNATURE LOOK */
  --gradient-primary: linear-gradient(135deg, #9333ea 0%, #3b82f6 100%);
  --gradient-primary-hover: linear-gradient(135deg, #7e22ce 0%, #2563eb 100%);
  
  /* Primary as solid */
  --color-primary: #9333ea;
  --color-primary-hover: #7e22ce;
  --color-blue-accent: #3b82f6;
}
\\\

### Neutral Palette

\\\css
:root {
  /* Neutrals - Warm grays */
  --color-gray-0: #ffffff;
  --color-gray-50: #fafafa;
  --color-gray-100: #f4f4f5;
  --color-gray-200: #e4e4e7;
  --color-gray-300: #d4d4d8;
  --color-gray-400: #a1a1aa;
  --color-gray-500: #71717a;
  --color-gray-600: #52525b;
  --color-gray-700: #3f3f46;
  --color-gray-800: #27272a;
  --color-gray-900: #18181b;
  --color-gray-950: #09090b;
}
\\\

### Semantic Colors

\\\css
:root {
  /* Success - Green */
  --color-success-50: #f0fdf4;
  --color-success-500: #22c55e;
  --color-success-600: #16a34a;
  
  /* Warning - Amber */
  --color-warning-50: #fffbeb;
  --color-warning-500: #f59e0b;
  --color-warning-600: #d97706;
  
  /* Error - Red */
  --color-error-50: #fef2f2;
  --color-error-500: #ef4444;
  --color-error-600: #dc2626;
  
  /* Background */
  --color-bg: #ffffff;
  --color-bg-secondary: #f4f4f5;
  --color-surface: #ffffff;
  --color-border: #e4e4e7;
  
  /* Text */
  --color-text-primary: #18181b;
  --color-text-secondary: #71717a;
  --color-text-muted: #a1a1aa;
  --color-text-inverse: #ffffff;
}
\\\

### Agenda Type Colors

\\\css
:root {
  /* Agenda (Kegiatan) - Green */
  --color-agenda: #22c55e;
  --color-agenda-bg: #f0fdf4;
  --color-agenda-border: #bbf7d0;
  
  /* Audiensi - Orange */
  --color-audiensi: #f59e0b;
  --color-audiensi-bg: #fffbeb;
  --color-audiensi-border: #fde68a;
}
\\\

---

## Typography System

### Font Family

\\\css
:root {
  --font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  --font-mono: 'JetBrains Mono', 'SF Mono', Monaco, Consolas, monospace;
}
\\\

### Font Sizes (Mobile-First)

\\\css
:root {
  --text-xs: 0.6875rem;     /* 11px - Badges, labels */
  --text-sm: 0.8125rem;     /* 13px - Secondary text */
  --text-base: 0.9375rem;   /* 15px - Body text */
  --text-lg: 1.0625rem;     /* 17px - Subheadings */
  --text-xl: 1.25rem;       /* 20px - Card titles */
  --text-2xl: 1.5rem;       /* 24px - Page titles */
  --text-3xl: 1.875rem;     /* 30px - Hero text */
  
  --font-normal: 400;
  --font-medium: 500;
  --font-semibold: 600;
  --font-bold: 700;
  
  --leading-tight: 1.25;
  --leading-normal: 1.5;
}
\\\

---

## Spacing System

### Base Unit: 4px

\\\css
:root {
  --space-0: 0;
  --space-1: 4px;
  --space-2: 8px;
  --space-3: 12px;
  --space-4: 16px;
  --space-5: 20px;
  --space-6: 24px;
  --space-8: 32px;
  --space-10: 40px;
  --space-12: 48px;
}
\\\

---

## Border Radius

\\\css
:root {
  --radius-sm: 6px;       /* Tags, badges */
  --radius-md: 10px;      /* Buttons, inputs */
  --radius-lg: 14px;      /* Cards */
  --radius-xl: 20px;      /* Modals, sheets */
  --radius-2xl: 28px;     /* Large containers */
  --radius-full: 9999px;  /* Pills, avatars */
}
\\\

---

## Shadow System

### iOS-Style Soft Shadows

\\\css
:root {
  --shadow-xs: 0 1px 2px rgba(0, 0, 0, 0.04);
  --shadow-sm: 0 2px 4px rgba(0, 0, 0, 0.06);
  --shadow-md: 0 4px 8px rgba(0, 0, 0, 0.08);
  --shadow-lg: 0 8px 16px rgba(0, 0, 0, 0.10);
  --shadow-xl: 0 16px 32px rgba(0, 0, 0, 0.12);
  --shadow-primary: 0 4px 12px rgba(147, 51, 234, 0.3);
  --shadow-glass: 0 8px 32px rgba(0, 0, 0, 0.12), backdrop-blur(20px);
}
\\\

---

## Layout System

### App Container

The app has a fixed mobile width (430px) and is centered on larger screens.

\\\css
:root {
  --container-max-width: 430px;
  --header-height: 56px;
  --bottom-nav-height: 64px;
  --safe-area-top: env(safe-area-inset-top, 0px);
  --safe-area-bottom: env(safe-area-inset-bottom, 0px);
}
\\\

### Page Layout Structure

`
+-------------------------------------+
|           STATUS BAR                |  (iOS/Android)
+-------------------------------------+
|  +-------------------------------+  |
|  |  HEADER (sticky)              |  |
|  |  Height: 56px + safe-area    |  |
|  |  Logo (left) | Bell (right)  |  |
|  +-------------------------------+  |
|                                     |
|  +-------------------------------+  |
|  |                               |  |
|  |  CONTENT AREA                |  |
|  |  (scrollable)                 |  |
|  |  Padding: 16px horizontal    |  |
|  |  Padding-bottom: 100px       |  |
|  |                               |  |
|  +-------------------------------+  |
|                                     |
|  +-------------------------------+  |
|  |  BOTTOM NAV (fixed)            |  |
|  |  Height: 64px + safe-area     |  |
|  |  [Home]  [+]  [Akun]          |  |
|  +-------------------------------+  |
+-------------------------------------+
`

### Responsive Behavior

\\\css
/* Mobile: Full width */
.app-container {
  width: 100%;
  max-width: 100%;
}

/* Desktop: Centered mobile-width view */
@media (min-width: 640px) {
  .app-container {
    max-width: var(--container-max-width);
    margin: 0 auto;
    box-shadow: 0 0 60px rgba(0, 0, 0, 0.1);
    min-height: 100vh;
    border-radius: 40px;
    overflow: hidden;
  }
}
\\\

---

## Z-Index Scale

\\\css
:root {
  --z-base: 0;
  --z-dropdown: 100;
  --z-sticky: 200;
  --z-fixed: 300;
  --z-modal-backdrop: 400;
  --z-modal: 500;
  --z-toast: 800;
}
\\\

---

## Animation Tokens

\\\css
:root {
  --duration-instant: 50ms;
  --duration-fast: 100ms;
  --duration-normal: 200ms;
  --duration-slow: 300ms;
  
  --ease-out: cubic-bezier(0.33, 1, 0.68, 1);
  --ease-spring: cubic-bezier(0.34, 1.56, 0.64, 1);
}
\\\

---

## CSS Implementation

### globals.css Complete Template

\\\css
/* app/globals.css */

/* Google Fonts - Inter */
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');

/* ========================================
   DESIGN TOKENS
   ======================================== */

:root {
  /* ---- Colors: Primary Purple ---- */
  --color-primary-50: #faf5ff;
  --color-primary-100: #f3e8ff;
  --color-primary-200: #e9d5ff;
  --color-primary-300: #d8b4fe;
  --color-primary-400: #c084fc;
  --color-primary-500: #a855f7;
  --color-primary-600: #9333ea;  /* PRIMARY */
  --color-primary-700: #7e22ce;
  --color-primary-800: #6b21a8;
  --color-primary-900: #581c87;

  /* ---- Colors: Primary Blue ---- */
  --color-blue-500: #3b82f6;
  --color-blue-600: #2563eb;

  /* ---- Colors: Gradient ---- */
  --gradient-primary: linear-gradient(135deg, #9333ea 0%, #3b82f6 100%);
  --gradient-primary-hover: linear-gradient(135deg, #7e22ce 0%, #2563eb 100%);
  
  /* ---- Colors: Primary Solid ---- */
  --color-primary: #9333ea;
  --color-primary-hover: #7e22ce;
  --color-blue-accent: #3b82f6;

  /* ---- Colors: Neutrals ---- */
  --color-gray-0: #ffffff;
  --color-gray-50: #fafafa;
  --color-gray-100: #f4f4f5;
  --color-gray-200: #e4e4e7;
  --color-gray-300: #d4d4d8;
  --color-gray-400: #a1a1aa;
  --color-gray-500: #71717a;
  --color-gray-600: #52525b;
  --color-gray-700: #3f3f46;
  --color-gray-800: #27272a;
  --color-gray-900: #18181b;
  --color-gray-950: #09090b;

  /* ---- Colors: Semantic ---- */
  --color-success: #22c55e;
  --color-warning: #f59e0b;
  --color-error: #ef4444;
  --color-info: #3b82f6;

  /* ---- Colors: Background ---- */
  --color-bg: #ffffff;
  --color-bg-secondary: #f4f4f5;
  --color-surface: #ffffff;
  --color-border: #e4e4e7;

  /* ---- Colors: Text ---- */
  --color-text-primary: #18181b;
  --color-text-secondary: #71717a;
  --color-text-muted: #a1a1aa;
  --color-text-inverse: #ffffff;

  /* ---- Colors: Agenda Types ---- */
  --color-agenda: #22c55e;
  --color-agenda-bg: #f0fdf4;
  --color-audiensi: #f59e0b;
  --color-audiensi-bg: #fffbeb;

  /* ---- Typography ---- */
  --font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  --font-mono: 'JetBrains Mono', 'SF Mono', Monaco, Consolas, monospace;
  
  --text-xs: 0.6875rem;
  --text-sm: 0.8125rem;
  --text-base: 0.9375rem;
  --text-lg: 1.0625rem;
  --text-xl: 1.25rem;
  --text-2xl: 1.5rem;
  --text-3xl: 1.875rem;
  
  --font-normal: 400;
  --font-medium: 500;
  --font-semibold: 600;
  --font-bold: 700;
  
  --leading-tight: 1.25;
  --leading-normal: 1.5;

  /* ---- Spacing ---- */
  --space-0: 0;
  --space-1: 4px;
  --space-2: 8px;
  --space-3: 12px;
  --space-4: 16px;
  --space-5: 20px;
  --space-6: 24px;
  --space-8: 32px;
  --space-10: 40px;
  --space-12: 48px;

  /* ---- Border Radius ---- */
  --radius-sm: 6px;
  --radius-md: 10px;
  --radius-lg: 14px;
  --radius-xl: 20px;
  --radius-2xl: 28px;
  --radius-full: 9999px;

  /* ---- Shadows ---- */
  --shadow-xs: 0 1px 2px rgba(0, 0, 0, 0.04);
  --shadow-sm: 0 2px 4px rgba(0, 0, 0, 0.06);
  --shadow-md: 0 4px 8px rgba(0, 0, 0, 0.08);
  --shadow-lg: 0 8px 16px rgba(0, 0, 0, 0.10);
  --shadow-xl: 0 16px 32px rgba(0, 0, 0, 0.12);
  --shadow-primary: 0 4px 12px rgba(147, 51, 234, 0.3);
  --shadow-glass: 0 8px 32px rgba(0, 0, 0, 0.12), backdrop-blur(20px);

  /* ---- Layout ---- */
  --container-max-width: 430px;
  --header-height: 56px;
  --bottom-nav-height: 64px;
  --safe-area-top: env(safe-area-inset-top, 0px);
  --safe-area-bottom: env(safe-area-inset-bottom, 0px);

  /* ---- Animation ---- */
  --duration-instant: 50ms;
  --duration-fast: 100ms;
  --duration-normal: 200ms;
  --duration-slow: 300ms;
  --ease-out: cubic-bezier(0.33, 1, 0.68, 1);
  --ease-spring: cubic-bezier(0.34, 1.56, 0.64, 1);

  /* ---- Z-Index ---- */
  --z-base: 0;
  --z-dropdown: 100;
  --z-sticky: 200;
  --z-fixed: 300;
  --z-modal-backdrop: 400;
  --z-modal: 500;
  --z-toast: 800;
}

/* ========================================
   RESET & BASE
   ======================================== */

*,
*::before,
*::after {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

html {
  font-size: 16px;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-rendering: optimizeLegibility;
  scroll-behavior: smooth;
}

body {
  font-family: var(--font-family);
  font-size: var(--text-base);
  line-height: var(--leading-normal);
  color: var(--color-text-primary);
  background-color: var(--color-bg-secondary);
  min-height: 100vh;
  overscroll-behavior: none;
}

/* ========================================
   APP CONTAINER
   ======================================== */

.app-container {
  width: 100%;
  max-width: 100%;
  background: var(--color-bg);
  min-height: 100vh;
}

@media (min-width: 640px) {
  .app-container {
    max-width: var(--container-max-width);
    margin: 0 auto;
    box-shadow: 0 0 60px rgba(0, 0, 0, 0.1);
    min-height: calc(100vh - 40px);
    border-radius: 40px;
    overflow: hidden;
  }
}

/* ========================================
   UTILITY CLASSES
   ======================================== */

.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}
\\\

---

## Document History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 2.0.0 | August 2026 | Design Team | Complete redesign - mobile app experience |
| 1.0.0 | Earlier | Design Team | Initial release |

---

**Previous Document:** [01_DESIGN_BIBLE.md](./01_DESIGN_BIBLE.md)  
**Next Document:** [03_BRAND_GUIDELINE.md](./03_BRAND_GUIDELINE.md) - Brand & Logo

---

*This document is the implementation reference. For design philosophy, see the Design Bible.*
