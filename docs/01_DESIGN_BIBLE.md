# SIMPATI - Design Bible

**Version:** 2.0.0  
**Last Updated:** August 2026  
**Document Owner:** Design Team  
**Classification:** Internal - Confidential

---

## Table of Contents

1. [Introduction](#introduction)
2. [Design Philosophy](#design-philosophy)
3. [Reference Companies](#reference-companies)
4. [Visual Language](#visual-language)
5. [Interaction Patterns](#interaction-patterns)
6. [Content Strategy](#content-strategy)
7. [Platform Adaptation](#platform-adaptation)
8. [Design Decisions](#design-decisions)

---

## Introduction

### Purpose of This Document

The Design Bible serves as the **conceptual foundation** for all visual and interaction decisions in SIMPATI. While the Design System (02_DESIGN_SYSTEM.md) provides implementation details, this document explains the **why** behind every design choice.

### Core Identity

| Attribute | Value |
|-----------|-------|
| **Theme** | Light Mode First |
| **Personality** | Modern Startup Government (Fresh, Innovative) |
| **Visual Style** | Blue-Purple Gradient (Modern Tech) |
| **Experience Type** | Mobile App (Web-based) |

### Document Relationship

```
00_PRODUCT_VISION.md
        │
        ▼
01_DESIGN_BIBLE.md (You are here)
        │
        ├──▶ 02_DESIGN_SYSTEM.md (Implementation)
        ├──▶ 03_BRAND_GUIDELINE.md (Brand identity)
        ├──▶ 04_UX_RULES.md (UX patterns)
        ├──▶ 05_COMPONENT_LIBRARY.md (Components)
        ├──▶ 06_ICONOGRAPHY.md (Icons)
        └──▶ 07_MOTION_SYSTEM.md (Animations)
```

---

## Design Philosophy

### Our Design DNA

SIMPATI's design DNA is a fusion of four inspirations:

| Inspiration | Contribution |
|-------------|--------------|
| **Apple** | Visual refinement, consistency, attention to detail, app-like feel |
| **Linear** | Information architecture, data density management, speed |
| **Notion** | Flexibility within structure, empty states, onboarding |
| **Stripe** | Documentation quality, error handling, trust, clarity |

### The "App Not Website" Manifesto

**CRITICAL:** SIMPATI is not a responsive website. It is a **mobile application that happens to run in a browser**.

| Website Thinking | App Thinking |
|-----------------|--------------|
| Responsive breakpoints | Fixed mobile-width design |
| Browser chrome visible | Full-screen immersive |
| Page reloads | SPA transitions |
| Hover states | Touch states only |
| Scroll bounce everywhere | Controlled scroll zones |
| Back button prominent | Navigation within app |

### Core Design Principles

#### 1. Clarity Over Cleverness

**Principle:** Users should never have to think about how to use the interface.

**In Practice:**
- Familiar patterns over novel solutions
- Clear labels over ambiguous icons
- Obvious affordances over hidden features
- Explicit over implicit

**Example:**
```
❌ "Sync" button with abstract icon
    → What gets synced? What happens if it fails?

✅ "Sinkronkan ke Kalender" button with clear label
    → Clear action, clear destination
    → Shows last sync time
    → Visible sync status indicator
```

#### 2. Confidence Through Feedback

**Principle:** Every action must provide immediate, clear feedback.

**In Practice:**
- Button press states are visible (not just functional)
- Loading states show what's happening
- Success/error states are unambiguous
- Pending states have clear resolution

**Example - Save Agenda:**
```
User taps "Simpan"
    │
    ├── 0ms: Button shows pressed state (scale 0.97)
    ├── 0-100ms: Button shows loading (spinner)
    ├── 100-300ms: Backend processes
    ├── 300ms: Success toast, button returns to normal
    │
    → If error: Button shows error state, error message below
```

#### 3. Respect for User Time

**Principle:** Minimize steps, maximize efficiency.

**In Practice:**
- Smart defaults for common actions
- Auto-save for forms
- Quick actions for power users
- Skippable optional fields

#### 4. Graceful Degradation

**Principle:** The app should handle edge cases and errors gracefully.

**In Practice:**
- Offline mode for critical features
- Clear error messages with recovery suggestions
- Fallback for missing data
- Undo/redo where possible

---

## Reference Companies

### Apple Human Interface Guidelines

**Why We Reference:** Apple sets the gold standard for consistency and user experience. Their guidelines are battle-tested across billions of devices.

**What We Emulate:**

| Apple Principle | SIMPATI Application |
|-----------------|---------------------|
| System clarity | Clean, uncluttered interfaces |
| Deference | Content takes priority over chrome |
| Depth | Layered navigation with clear hierarchy |
| Responsiveness | Instant feedback on all interactions |
| Familiarity | Standard iOS patterns for iOS users |
| Typography | San Francisco-inspired Inter font |
| Spacing | Generous white space, comfortable touch targets |
| Color | Subtle gradients, not flat |

**Key Takeaways:**
- Use SF Symbols-style icons (Lucide React with custom tweaks)
- Follow safe area guidelines strictly
- Support dynamic type (accessibility)
- Animations should feel physical (spring physics)

### Linear

**Why We Reference:** Linear has the best-designed B2B SaaS product in recent years. Their attention to detail and information density is exceptional.

**What We Emulate:**

| Linear Feature | SIMPATI Application |
|----------------|---------------------|
| Keyboard shortcuts | Future: Cmd+K for quick actions |
| Status badges | Agenda status indicators |
| Quick actions | Swipe to edit/delete |
| List virtualization | Performance for 1000+ items |
| Loading skeletons | Content preview during load |
| Dark mode first (their style) | Light mode first (our style) |

**Key Takeaways:**
- Performance at scale is a feature
- Keyboard-first doesn't mean mouse-last
- Density can coexist with elegance
- Empty states are design opportunities

### Notion

**Why We Reference:** Notion excels at flexibility within structure. Their onboarding and empty states are best-in-class.

**What We Emulate:**

| Notion Feature | SIMPATI Application |
|----------------|---------------------|
| Block-based content | Flexible agenda descriptions |
| Empty states | Guided creation flows |
| Quick templates | Agenda presets by type |
| Consistent spacing | 8px grid system |

**Key Takeaways:**
- Empty states should guide, not abandon
- Templates accelerate without constraining
- Flexibility shouldn't mean complexity

### Stripe

**Why We Reference:** Stripe has the best API documentation and developer experience in the industry. Their attention to clarity and trust is unmatched.

**What We Emulate:**

| Stripe Feature | SIMPATI Application |
|----------------|---------------------|
| Error message clarity | Specific, actionable error states |
| Dashboard information density | Data-rich but scannable |
| API documentation | Future: Developer documentation |
| Trust signals | Security indicators, status badges |

**Key Takeaways:**
- Documentation is a product feature
- Error states are opportunities to build trust
- Complexity should be hidden from users

---

## Visual Language

### Aesthetic Direction

**Visual Theme:** "Modern Government Tech"

SIMPATI should feel like a premium tech startup that specializes in government services—professional but innovative, trustworthy but fresh.

### Color Emotional Mapping

| Color | Hex | Emotional Association | Usage in SIMPATI |
|-------|-----|----------------------|------------------|
| Primary Purple | #7c3aed | Innovation, premium, digital | Primary buttons, active states |
| Primary Blue | #3b82f6 | Trust, technology, calm | Secondary elements, links |
| Gradient | #7c3aed → #3b82f6 | Modern, tech-forward | Headers, key elements |
| Gold Accent | #f59e0b | Prestige, government, achievement | Badges, highlights, agenda type |
| White | #ffffff | Clean, open, breathing room | Backgrounds |
| Warm Gray | #f4f4f5 | Soft, subtle, not cold | Card backgrounds, surfaces |
| Text Dark | #18181b | Clear, readable | Primary text |
| Text Muted | #71717a | Secondary, labels | Secondary text |

### Typography Emotional Mapping

| Weight | Usage | Emotional Effect |
|--------|-------|------------------|
| 400 (Regular) | Body text | Neutral, readable |
| 500 (Medium) | Labels, navigation | Clear, scannable |
| 600 (Semibold) | Headings, emphasis | Important, structured |
| 700 (Bold) | Large headings | Bold, confident |

### Spacing as Visual Hierarchy

**Why Spacing Matters:**

Proper spacing creates visual hierarchy without explicit markers. Users scan the page and instinctively understand relationships.

**Spacing Rhythm:**

| Spacing | Usage | Purpose |
|---------|-------|---------|
| 4px | Icon padding | Precise alignment |
| 8px | Inline spacing | Tight groupings |
| 12px | Component internal | Related elements |
| 16px | Component spacing | Standard gaps |
| 20px | Section gaps | Related groups |
| 24px | Page sections | Distinct areas |
| 32px | Major sections | Clear separation |

### Border Radius Philosophy

**Rule:** Border radius should feel natural, not manufactured.

| Radius | Usage | Effect |
|--------|-------|--------|
| 6px | Tags, small badges | Subtle softening |
| 10px | Buttons, inputs | Friendly, approachable |
| 14px | Cards, containers | Modern, rounded |
| 20px | Modals, sheets | Premium feel |
| 9999px | Pills, avatars | Organic, infinite |

---

## Interaction Patterns

### The Three Interaction Laws

#### 1. Law of Feedback

**Definition:** Every action must have a corresponding reaction.

**Implementation Checklist:**
- [ ] Press/active states for touch
- [ ] Loading states for async operations
- [ ] Success confirmations (toast)
- [ ] Error notifications

**Timing:**
- Instant feedback: < 100ms
- Async feedback: Show loading, complete when done
- Long operations: Show progress where possible

#### 2. Law of Continuity

**Definition:** Transitions should maintain spatial and temporal continuity.

**Implementation:**
- Page transitions: Fade + subtle slide (200ms)
- Modal open: Scale from center (250ms spring)
- List item expand: Smooth height animation (200ms)
- Tab switch: Cross-fade (150ms)

#### 3. Law of Consistency

**Definition:** Similar elements behave similarly throughout the app.

**Consistency Checklist:**
- [ ] All buttons have press states
- [ ] All forms validate on blur
- [ ] All destructive actions require confirmation
- [ ] All success states show checkmark toast
- [ ] All errors show message toast

### Touch Interaction Guidelines

#### Tap Targets

**Minimum Size:** 44x44px (Apple HIG)
**Recommended Size:** 48x48px (SIMPATI standard)

```
┌─────────────────────────────────────┐
│                                     │
│   44px minimum for ALL interactive  │
│   elements. This includes:          │
│                                     │
│   ✓ Buttons                         │
│   ✓ Icons (even icon-only buttons)  │
│   ✓ Checkboxes                      │
│   ✓ Toggle switches                 │
│                                     │
│   Exception: Text links may be      │
│   smaller if part of a sentence,    │
│   but line height must be 44px+     │
│                                     │
└─────────────────────────────────────┘
```

#### Gesture Support

| Gesture | Element | Action |
|---------|---------|--------|
| Tap | Anywhere | Primary action |
| Long press | List items | Context menu (future) |
| Swipe left | List items | Reveal delete (future) |
| Pull down | Lists | Refresh |

### Form Interaction Patterns

#### Input States

```
DEFAULT:
┌─────────────────────────────────┐
│ Label                            │
│ ┌─────────────────────────────┐  │
│ │ Input field                  │  │
│ └─────────────────────────────┘  │
│ Helper text                      │
└─────────────────────────────────┘

FOCUSED:
┌─────────────────────────────────┐
│ Label                            │
│ ┌─────────────────────────────┐  │
│ │ Input field            🔵   │  │ ← Purple focus ring
│ └─────────────────────────────┘  │
└─────────────────────────────────┘

ERROR STATE:
┌─────────────────────────────────┐
│ Label                            │
│ ┌─────────────────────────────┐  │
│ │ Input field            🔴  │  │ ← Red border
│ └─────────────────────────────┘  │
│ ⚠️ Error message here            │ ← Red text
└─────────────────────────────────┘
```

#### Validation Timing

| Validation Type | Timing | Method |
|----------------|--------|--------|
| Required check | On blur | Red border + message |
| Format validation | On blur | Red border + example |
| Duplicate check | On blur (debounced) | Red border + suggestion |
| Availability check | On submit | Error toast |

### Loading States

#### Skeleton Screens

**Prefer skeleton screens over spinners for content areas.**

**Why Skeleton:**
- Reduces perceived wait time
- Shows what content is loading
- Maintains layout stability
- Feels more premium

#### Progress Indicators

| Indicator | Usage | Timing |
|-----------|-------|--------|
| Spinner | Small actions, < 3s | Indeterminate |
| Skeleton | Content loading | Content preview |
| Toast | Background completion | After completion |

---

## Content Strategy

### Voice & Tone

#### Voice (Consistent)

SIMPATI's voice is:
- **Professional but approachable** — Not stiff, not casual
- **Clear and direct** — No jargon, no ambiguity
- **Helpful and guiding** — Assume positive intent
- **Indonesian-first** — All content in Bahasa Indonesia

#### Tone (Contextual)

| Context | Tone | Example |
|---------|------|---------|
| Welcome | Warm | "Selamat datang kembali, [Nama]!" |
| Success | Celebratory | "Agenda berhasil dibuat!" |
| Error | Concerned | "Terjadi kesalahan. Kami sudah mencatatnya." |
| Warning | Urgent but clear | "Data tidak tersimpan. Periksa koneksi." |
| Empty | Inviting | "Belum ada agenda. Buat yang pertama!" |

### Writing Guidelines

#### Label Conventions

**Be specific:**
```
❌ Details         → ✅ Detail Agenda
❌ Actions         → ✅ Tindakan
❌ Info            → ✅ Informasi
```

**Be action-oriented:**
```
❌ Delete          → ✅ Hapus
❌ Create          → ✅ Buat Baru
```

**Be consistent:**
```
Agenda (not "Event", "Kegiatan", or "Schedule")
Audiensi (not "Audiensi", "Meeting", or "Pertemuan")
Simpan (not "Submit", "Save", or "OK")
```

### Empty State Writing

Empty states should guide, not abandon.

**Structure:**
1. Acknowledge the empty state (empathetic)
2. Explain why it matters (meaningful)
3. Guide to action (actionable)

### Error Message Writing

Error messages should be:
1. Human-readable (not technical)
2. Specific (what happened)
3. Actionable (what to do next)
4. Apologetic (when appropriate)

**Template:**
```
[Something went wrong]. [Explain briefly]. [Suggest action].

Example:
"Koneksi terputus. Periksa internet Anda dan coba lagi."
```

---

## Platform Adaptation

### iOS-Specific Considerations

**Priority:** iOS/Safari is our primary platform (60%).

#### Safe Area Handling

```css
/* Always respect safe areas */
.header {
  padding-top: env(safe-area-inset-top);
}

.bottom-nav {
  padding-bottom: env(safe-area-inset-bottom);
}
```

#### iOS-Specific Behaviors

| Behavior | iOS Handling |
|----------|--------------|
| Tap highlight | Remove (use custom feedback) |
| Zoom on input | Set font-size: 16px minimum |
| Pull to refresh | Disable default, use custom |
| Momentum scroll | Keep enabled for lists |
| Bottom sheet | Use sheet from bottom, not center |
| Back gesture | Support iOS swipe-back |

### Android Considerations

**Priority:** Android is secondary (40%) but must work flawlessly.

| Behavior | Android Handling |
|----------|------------------|
| Viewport | Standard viewport meta |
| Install prompt | Show custom prompt (not default) |
| Navigation bar | Respect system navigation |

### Desktop Considerations

**IMPORTANT:** Desktop users see the mobile-width app (430px max), not a responsive website.

```
┌────────────────────────────────────────────────────────────┐
│                                                            │
│   ┌──────────────────────────────────────────────────┐     │
│   │                                                  │     │
│   │   ┌────────────────────────────────────────┐   │     │
│   │   │         MOBILE APP VIEW (430px)        │   │     │
│   │   │                                        │   │     │
│   │   │   Header (sticky)                     │   │     │
│   │   │   ─────────────────────────────────   │   │     │
│   │   │                                        │   │     │
│   │   │   Scrollable Content                   │   │     │
│   │   │                                        │   │     │
│   │   │   ─────────────────────────────────   │   │     │
│   │   │   Bottom Nav (fixed)                  │   │     │
│   │   └────────────────────────────────────────┘   │     │
│   │                                                  │     │
│   └──────────────────────────────────────────────────┘     │
│                                                            │
│   Browser Window Chrome                                     │
└────────────────────────────────────────────────────────────┘
```

This ensures:
- Consistent experience across all devices
- No responsive breakpoints to maintain
- iPhone simulator-like experience on desktop

---

## Design Decisions

### Decision 1: Fixed Mobile Width on Desktop

**Decision:** Desktop browsers show a mobile-width (430px) centered app.

**Rationale:**
- Consistent experience everywhere
- No responsive chaos
- App-like feel maintained
- Simpler development

### Decision 2: Light Mode First

**Decision:** Default to light mode, dark mode future consideration.

**Rationale:**
- More familiar to government users
- Better readability in office environments
- Professional feel
- Consistent with Apple Mail, Calendar, Notes

### Decision 3: Blue-Purple Gradient

**Decision:** Use blue-purple gradient for primary brand elements.

**Rationale:**
- Modern, tech-forward feel
- Differentiation from traditional government blue
- Premium perception
- Blue = trust, Purple = innovation

### Decision 4: Custom Icon-Only Logo

**Decision:** Logo is a geometric icon, no text or letters.

**Rationale:**
- Memorable at small sizes
- Language-neutral
- Modern, not dated
- Scalable from favicon to billboard

### Decision 5: Soft Shadows Over Harsh

**Decision:** Use iOS-style soft, diffused shadows.

**Rationale:**
- Premium feel
- Not harsh or old-fashioned
- Modern aesthetic
- Depth without heaviness

### Decision 6: Generous Border Radius

**Decision:** Consistent 10-14px border radius throughout.

**Rationale:**
- Friendly, approachable
- Modern, not dated
- Consistent with iOS/mobile patterns
- Not childish (not too round)

---

## Appendix A: Design Checklist

Use this checklist for new designs.

### Visual Design
- [ ] Follows color palette (blue-purple gradient)
- [ ] Uses correct typography scale
- [ ] Maintains spacing rhythm (8px base)
- [ ] Respects border radius conventions (10-14px)
- [ ] Provides adequate contrast (WCAG AA)

### Interaction Design
- [ ] All tappable elements ≥ 44px
- [ ] Has loading states
- [ ] Has error states
- [ ] Has success feedback (toast)
- [ ] Animations feel natural (spring physics)

### Content
- [ ] Labels are specific
- [ ] Empty states guide users
- [ ] Errors are actionable
- [ ] Bahasa Indonesia is correct

### Platform
- [ ] Safe areas respected
- [ ] Works on iOS Safari
- [ ] Works on Android Chrome
- [ ] Desktop shows mobile-width view

### Accessibility
- [ ] Focus states visible
- [ ] Touch targets adequate
- [ ] Text resizable

---

## Appendix B: Inspiration Gallery

| Product | What We Love |
|---------|--------------|
| [Linear](https://linear.app) | Speed, keyboard shortcuts, dark mode |
| [Notion](https://notion.so) | Flexibility, empty states, onboarding |
| [Apple](https://apple.com) | Consistency, polish, animations |
| [Stripe Dashboard](https://dashboard.stripe.com) | Information density, clarity |
| [Arc Browser](https://arc.net) | Innovation, vertical tabs, design |

---

## Document History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 2.0.0 | August 2026 | Design Team | Complete redesign - mobile app experience |
| 1.0.0 | Earlier | Design Team | Initial release |

---

**Previous Document:** [00_PRODUCT_VISION.md](./00_PRODUCT_VISION.md)  
**Next Document:** [02_DESIGN_SYSTEM.md](./02_DESIGN_SYSTEM.md) - Design System Implementation

---

*This document explains the "why" behind SIMPATI's design. For implementation details, see the Design System document.*
