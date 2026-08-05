# SIMPATI - Iconography

**Version:** 2.0.0  
**Last Updated:** August 2026  
**Document Owner:** Design Team  
**Classification:** Internal - Confidential

---

## Table of Contents

1. [Overview](#overview)
2. [Icon Library](#icon-library)
3. [Icon Usage](#icon-usage)
4. [Custom Icons](#custom-icons)
5. [Icon Sizes](#icon-sizes)

---

## Overview

### Icon Philosophy

Icons in SIMPATI should:
- Be clear and recognizable at small sizes
- Maintain visual consistency
- Complement the overall design
- Be functional, not decorative

### Icon Source

**Primary Library:** Lucide React (https://lucide.dev)

Lucide is chosen because:
- Consistent 2px stroke weight
- Clean, modern design
- Open source (MIT)
- React-native compatible
- Tree-shakeable

---

## Icon Library

### Navigation Icons

| Icon | Name | Usage |
|------|------|-------|
| 🏠 | Home / beranda | Home navigation |
| ➕ | Plus / add | FAB, create actions |
| 👤 | User | Account navigation |
| 🔔 | Bell | Notifications |
| ⚙️ | Settings | Settings page |

### Action Icons

| Icon | Name | Usage |
|------|------|-------|
| ➕ | Plus | Add, create |
| ✏️ | Pencil | Edit |
| 🗑️ | Trash-2 | Delete |
| 👁️ | Eye | View, show |
| 👁️‍🗨️ | Eye-off | Hide |
| 📋 | Clipboard | Copy |
| ⬇️ | Download | Download, export |
| ⬆️ | Upload | Upload, import |
| 🔍 | Search | Search |
| ✕ | X | Close, cancel |
| ✓ | Check | Confirm, success |
| ← | Arrow-left | Back |
| → | Arrow-right | Forward |
| ↑ | Arrow-up | Scroll up |
| ↓ | Arrow-down | Dropdown |

### Status Icons

| Icon | Name | Usage |
|------|------|-------|
| ✓ | Check-circle | Success |
| ⚠️ | Alert-circle | Warning |
| ✕ | X-circle | Error |
| ℹ️ | Info | Information |
| ⏳ | Clock | Pending, loading |
| 🔒 | Lock | Locked, private |
| 🔓 | Unlock | Unlocked, public |

### Content Icons

| Icon | Name | Usage |
|------|------|-------|
| 📅 | Calendar | Agenda, schedule |
| 🕐 | Clock | Time |
| 📍 | Map-pin | Location |
| 📷 | Camera | Photo, camera |
| 🖼️ | Image | Gallery, image |
| 📎 | Paperclip | Attachment |
| 📝 | File-text | Document |
| 📁 | Folder | Folder |
| 🔗 | Link | Link, URL |
| 📧 | Mail | Email |
| 📱 | Smartphone | Mobile |
| 💻 | Monitor | Desktop |

### Agenda Type Icons

| Icon | Name | Type | Color |
|------|------|------|-------|
| 📅 | Calendar | Agenda | #22c55e |
| 🎤 | Mic | Audiensi | #f59e0b |

---

## Icon Usage

### Import from Lucide

`	sx
import {
  Home,
  Plus,
  User,
  Bell,
  Calendar,
  Search,
  X,
  Check,
  Trash2,
  Pencil,
  Settings,
  MapPin,
  Clock,
  AlertCircle,
  CheckCircle,
  XCircle,
  ChevronDown,
  ChevronRight,
  LogOut,
  Camera,
  Image,
  FileText,
  Download,
  Upload,
} from 'lucide-react';
`

### Usage in Components

`	sx
// Basic usage
<Bell />

// With size
<Bell size={24} />

// With color
<Bell size={24} color="#9333ea" />

// With className
<Bell size={24} className="text-primary" />

// Stroke width
<Bell size={24} strokeWidth={2} />

// With click handler
<Bell size={24} onClick={handleClick} />
`

### Icon + Text

`
┌─────────────────────────────────────────┐
│                                         │
│  ┌─────┐                               │
│  │  🗑️ │  Hapus                        │
│  └─────┘                               │
│                                         │
└─────────────────────────────────────────┘

<button className="icon-button">
  <Trash2 size={20} />
  <span>Hapus</span>
</button>

<style>
.icon-button {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 16px;
  background: transparent;
  border: none;
  cursor: pointer;
}
</style>
`

---

## Icon Sizes

### Size Scale

| Size | Pixel | Usage |
|------|-------|-------|
| xs | 16px | Badges, inline text |
| sm | 20px | Small buttons |
| md | 24px | Default, navigation |
| lg | 28px | Large buttons |
| xl | 32px | Feature icons |
| 2xl | 48px | Empty state illustrations |

### Size Usage

| Context | Size | Stroke |
|---------|------|--------|
| Navigation icons | 24px | 2px |
| Action icons | 20px | 2px |
| Button icons | 20px | 2px |
| Badge icons | 16px | 2px |
| Empty state | 48px | 1.5px |
| Logo mark | 24px | 2px |

---

## Icon Color

### Default Colors

`css
/* Navigation */
.icon-nav { color: #71717a; }
.icon-nav-active { color: #9333ea; }

/* Text */
.icon-text { color: #18181b; }
.icon-text-muted { color: #71717a; }

/* Status */
.icon-success { color: #22c55e; }
.icon-warning { color: #f59e0b; }
.icon-error { color: #ef4444; }
.icon-info { color: #3b82f6; }
`

### Icon Color in Buttons

`	sx
// Primary button - white icon
<button className="btn-primary">
  <Plus size={20} color="white" />
  <span>Baru</span>
</button>

// Ghost button - primary icon
<button className="btn-ghost">
  <Pencil size={20} />
  <span>Edit</span>
</button>
`

---

## Custom Icons

For icons not available in Lucide, create custom SVG icons.

### Creating Custom Icons

`	sx
// components/icons/CustomIcon.tsx
interface IconProps {
  size?: number;
  color?: string;
  className?: string;
}

export const CustomIcon: React.FC<IconProps> = ({
  size = 24,
  color = 'currentColor',
  className
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    {/* SVG paths here */}
    <path
      d=" " // path data
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);
`

### Custom Icon Guidelines

1. **ViewBox:** Always 24x24
2. **Stroke:** 2px (match Lucide)
3. **Line caps:** Round
4. **Line joins:** Round
5. **Color:** Use currentColor for flexibility

---

## Accessibility

### Icon-only Buttons

When using icons without text, add aria-label:

`	sx
// ❌ No accessibility
<button><Bell /></button>

// ✅ With aria-label
<button aria-label="Notifications">
  <Bell size={24} />
</button>

// ✅ With sr-only text
<button>
  <Bell size={24} />
  <span className="sr-only">Notifications</span>
</button>
`

### Icon and Text

When icons accompany text, decorative icons should be hidden:

`	sx
// ✅ Icon is decorative (hidden from screen readers)
<button>
  <span>Notifications</span>
  <Bell size={20} aria-hidden="true" />
</button>

// ✅ Icon conveys meaning (included in label)
<button aria-label="View notifications">
  <Bell size={20} />
</button>
`

---

## Document History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 2.0.0 | August 2026 | Design Team | Updated icon system |
| 1.0.0 | Earlier | Design Team | Initial release |

---

**Previous Document:** [05_COMPONENT_LIBRARY.md](./05_COMPONENT_LIBRARY.md)  
**Next Document:** [07_MOTION_SYSTEM.md](./07_MOTION_SYSTEM.md) - Animation

---

*This document defines icon usage for SIMPATI. Use Lucide React for standard icons.*
