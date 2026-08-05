# SIMPATI - Motion System

**Version:** 2.0.0  
**Last Updated:** August 2026  
**Document Owner:** Design Team  
**Classification:** Internal - Confidential

---

## Table of Contents

1. [Motion Philosophy](#motion-philosophy)
2. [Animation Tokens](#animation-tokens)
3. [Common Animations](#common-animations)
4. [CSS Animations](#css-animations)
5. [React Animation](#react-animation)
6. [Animation Guidelines](#animation-guidelines)

---

## Motion Philosophy

### Why Animation Matters

Animation in SIMPATI serves three purposes:

1. **Feedback** - Confirms user actions instantly
2. **Continuity** - Maintains context during transitions
3. **Delight** - Creates a premium, polished feel

### Animation Principles

| Principle | Description |
|-----------|-------------|
| **Instant** | Feedback within 100ms |
| **Purposeful** | Every animation has meaning |
| **Quick** | Never more than 300ms |
| **Natural** | Use easing, not linear |
| **Consistent** | Same animations for same actions |

---

## Animation Tokens

### Duration Scale

`css
:root {
  /* Instant - immediate feedback */
  --duration-instant: 50ms;
  
  /* Fast - quick interactions */
  --duration-fast: 100ms;
  
  /* Normal - most transitions */
  --duration-normal: 200ms;
  
  /* Slow - emphasis, large movements */
  --duration-slow: 300ms;
  
  /* Slower - very large elements */
  --duration-slower: 400ms;
}
`

### Easing Functions

`css
:root {
  /* Linear - rarely used */
  --ease-linear: linear;
  
  /* Standard - most transitions */
  --ease-out: cubic-bezier(0.33, 1, 0.68, 1);
  
  /* Entry - start fast, end slow */
  --ease-in: cubic-bezier(0.32, 0, 0.67, 0);
  
  /* Symmetric - start and end balanced */
  --ease-in-out: cubic-bezier(0.65, 0, 0.35, 1);
  
  /* Spring - bouncy, playful */
  --ease-spring: cubic-bezier(0.34, 1.56, 0.64, 1);
  
  /* Smooth spring - less bounce */
  --ease-spring-out: cubic-bezier(0.34, 1.2, 0.64, 1);
}
`

### Easing Visual Guide

`
Linear:          ●━━━━━━━━━━━━━━━━━━●  (robotic)
                 
Ease-out:        ●━━━━━━━━━━━━━━━━●    (natural deceleration)
                 
Ease-in:           ●━━━━━━━━━━━━━━━━●  (natural acceleration)
                 
Ease-in-out:    ●━━━━━━━━━━━━━━━━━━━━●  (smooth all around)
                 
Ease-spring:      ●━━━━━━━━━━━━●      (overshoot and settle)
`

---

## Common Animations

### Button Press

Triggered on tap/click.

`css
.button {
  transition: transform 100ms ease-out, box-shadow 100ms ease-out;
}

.button:active {
  transform: scale(0.97);
}
`

**When:** All buttons, clickable cards  
**Duration:** 100ms  
**Easing:** ease-out  
**Effect:** scale(0.97)

---

### Button Hover

Triggered on mouse hover (desktop only).

`css
.button:hover {
  /* Add subtle lift */
  transform: translateY(-1px);
  box-shadow: 0 6px 16px rgba(147, 51, 234, 0.3);
}
`

**When:** Desktop hover states  
**Duration:** 150ms  
**Easing:** ease-out

---

### Fade In

Content appearing.

`css
@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

.fade-in {
  animation: fadeIn 200ms ease-out forwards;
}
`

**When:** Page content, modal content  
**Duration:** 200ms  
**Easing:** ease-out

---

### Fade In Up

Content appearing with upward motion.

`css
@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.fade-in-up {
  animation: fadeInUp 200ms ease-out forwards;
}
`

**When:** Toast notifications, cards entering  
**Duration:** 200ms  
**Easing:** ease-out  
**Distance:** 10px

---

### Slide Up

Bottom sheet, modal appearing.

`css
@keyframes slideUp {
  from {
    transform: translateY(100%);
  }
  to {
    transform: translateY(0);
  }
}

.slide-up {
  animation: slideUp 250ms ease-out forwards;
}
`

**When:** Bottom sheets  
**Duration:** 250ms  
**Easing:** ease-out

---

### Scale In

Modal, dialog appearing.

`css
@keyframes scaleIn {
  from {
    opacity: 0;
    transform: scale(0.95);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

.scale-in {
  animation: scaleIn 200ms ease-out forwards;
}
`

**When:** Modals, tooltips  
**Duration:** 200ms  
**Easing:** ease-out  
**Scale:** 0.95 → 1

---

### Skeleton Shimmer

Loading placeholder animation.

`css
@keyframes shimmer {
  0% {
    background-position: 200% 0;
  }
  100% {
    background-position: -200% 0;
  }
}

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

**When:** Content loading  
**Duration:** 1.5s (loop)  
**Easing:** linear

---

### Spinner

Loading indicator.

`css
@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

.spinner {
  width: 20px;
  height: 20px;
  border: 2px solid #e4e4e7;
  border-top-color: #9333ea;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}
`

**When:** Button loading, inline loading  
**Duration:** 0.8s per rotation  
**Easing:** linear

---

### Toast Enter/Exit

Toast notification animations.

`css
/* Enter */
@keyframes toastEnter {
  from {
    opacity: 0;
    transform: translateX(-50%) translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateX(-50%) translateY(0);
  }
}

/* Exit */
@keyframes toastExit {
  from {
    opacity: 1;
    transform: translateX(-50%) translateY(0);
  }
  to {
    opacity: 0;
    transform: translateX(-50%) translateY(10px);
  }
}

.toast-enter {
  animation: toastEnter 200ms ease-out forwards;
}

.toast-exit {
  animation: toastExit 150ms ease-in forwards;
}
`

---

## CSS Animations

### Animation CSS File

Create pp/styles/animations.css:

`css
/* ========================================
   ANIMATION TOKENS
   ======================================== */

:root {
  /* Duration */
  --duration-instant: 50ms;
  --duration-fast: 100ms;
  --duration-normal: 200ms;
  --duration-slow: 300ms;
  
  /* Easing */
  --ease-linear: linear;
  --ease-out: cubic-bezier(0.33, 1, 0.68, 1);
  --ease-in: cubic-bezier(0.32, 0, 0.67, 0);
  --ease-in-out: cubic-bezier(0.65, 0, 0.35, 1);
  --ease-spring: cubic-bezier(0.34, 1.56, 0.64, 1);
}

/* ========================================
   KEYFRAMES
   ======================================== */

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes fadeOut {
  from { opacity: 1; }
  to { opacity: 0; }
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes fadeInDown {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes scaleIn {
  from {
    opacity: 0;
    transform: scale(0.95);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

@keyframes slideUp {
  from { transform: translateY(100%); }
  to { transform: translateY(0); }
}

@keyframes slideDown {
  from { transform: translateY(-100%); }
  to { transform: translateY(0); }
}

@keyframes shimmer {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

/* ========================================
   ANIMATION CLASSES
   ======================================== */

.animate-fade-in {
  animation: fadeIn var(--duration-normal) var(--ease-out) forwards;
}

.animate-fade-out {
  animation: fadeOut var(--duration-normal) var(--ease-in) forwards;
}

.animate-fade-in-up {
  animation: fadeInUp var(--duration-normal) var(--ease-out) forwards;
}

.animate-scale-in {
  animation: scaleIn var(--duration-normal) var(--ease-out) forwards;
}

.animate-slide-up {
  animation: slideUp var(--duration-slow) var(--ease-out) forwards;
}

.animate-shimmer {
  background: linear-gradient(
    90deg,
    #f4f4f5 0%,
    #e4e4e7 50%,
    #f4f4f5 100%
  );
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
}

.animate-spin {
  animation: spin 0.8s linear infinite;
}

.animate-pulse {
  animation: pulse 2s ease-in-out infinite;
}

/* ========================================
   TRANSITION UTILITIES
   ======================================== */

.transition-fast {
  transition: all var(--duration-fast) var(--ease-out);
}

.transition-normal {
  transition: all var(--duration-normal) var(--ease-out);
}

.transition-slow {
  transition: all var(--duration-slow) var(--ease-out);
}

.transition-spring {
  transition: all var(--duration-normal) var(--ease-spring);
}
`

---

## React Animation

### Using CSS Classes

`	sx
// Simple animation with className
const Toast = ({ message, onClose }) => (
  <div className="toast animate-fade-in-up">
    <span>{message}</span>
    <button onClick={onClose}>✕</button>
  </div>
);
`

### Using Inline Styles

`	sx
// Dynamic animation
const [isVisible, setIsVisible] = useState(false);

const modalStyle = {
  animation: isVisible ? 'scaleIn 200ms ease-out forwards' : 'scaleIn 200ms ease-out reverse',
};

return (
  <div style={modalStyle} className="modal">
    Content
  </div>
);
`

### Staggered Animation

`	sx
// Animate children with delay
const items = ['Item 1', 'Item 2', 'Item 3'];

return (
  <div className="card-list">
    {items.map((item, index) => (
      <div
        key={item}
        className="card animate-fade-in-up"
        style={{ animationDelay: ${index * 50}ms }}
      >
        {item}
      </div>
    ))}
  </div>
);
`

---

## Animation Guidelines

### DO

- ✅ Use animation for feedback (instant)
- ✅ Use animation for transitions (200-300ms)
- ✅ Use ease-out for most animations
- ✅ Use spring easing for playful elements
- ✅ Animate opacity and transform (performant)
- ✅ Respect reduced-motion preferences

### DON'T

- ❌ Animate properties that trigger layout (width, height)
- ❌ Use animation for decoration only
- ❌ Make animations too slow (>500ms)
- ❌ Use linear easing (feels robotic)
- ❌ Animate background-color (janky)

### Reduced Motion

Respect user preferences:

`css
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
`

`	sx
// React: Check reduced motion
const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

useEffect(() => {
  const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
  setPrefersReducedMotion(mediaQuery.matches);
  
  const handler = (e) => setPrefersReducedMotion(e.matches);
  mediaQuery.addEventListener('change', handler);
  return () => mediaQuery.removeEventListener('change', handler);
}, []);

const animationClass = prefersReducedMotion ? '' : 'animate-fade-in-up';
`

---

## Document History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 2.0.0 | August 2026 | Design Team | Complete motion system |
| 1.0.0 | Earlier | Design Team | Initial release |

---

**Previous Document:** [06_ICONOGRAPHY.md](./06_ICONOGRAPHY.md)  
**Next Document:** [08_ACCESSIBILITY.md](./08_ACCESSIBILITY.md) - Accessibility

---

*This document defines motion and animation for SIMPATI. Always provide instant feedback and respect user preferences.*
