# SIMPATI - Development Rules

**Version:** 2.0.0  
**Last Updated:** August 2026  
**Document Owner:** Engineering Team  
**Classification:** Internal - Confidential

---

## Table of Contents

1. [Code Standards](#code-standards)
2. [File Structure](#file-structure)
3. [Component Guidelines](#component-guidelines)
4. [Styling Guidelines](#styling-guidelines)
5. [State Management](#state-management)
6. [Performance](#performance)
7. [Testing](#testing)
8. [Git Workflow](#git-workflow)

---

## Code Standards

### TypeScript

**Always use TypeScript.** No plain JavaScript allowed.

`	sx
// ❌ Any type
const handleClick = (e: any) => { };

// ✅ Proper types
const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => { };
`

### Strict Mode

`json
// tsconfig.json
{
  "compilerOptions": {
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true
  }
}
`

### Naming Conventions

| Type | Convention | Example |
|------|------------|---------|
| Components | PascalCase | AgendaCard.tsx |
| Hooks | camelCase, use prefix | useAgenda.ts |
| Utils | camelCase | ormatDate.ts |
| Types | PascalCase | AgendaType.ts |
| Constants | SCREAMING_SNAKE | MAX_FILE_SIZE |
| CSS classes | kebab-case | tn-primary |
| Files | kebab-case | pi-routes.ts |

---

## File Structure

### App Router Structure

`
app/
├── (auth)/
│   ├── layout.tsx           # Auth layout
│   ├── login/page.tsx
│   └── setup/page.tsx
├── (admin)/
│   ├── layout.tsx           # Protected layout with header/nav
│   ├── dashboard/page.tsx
│   ├── agenda/
│   │   ├── page.tsx         # List
│   │   ├── new/page.tsx     # Create
│   │   └── [id]/page.tsx    # Detail/Edit
│   ├── kalender/page.tsx
│   ├── galeri/page.tsx
│   └── akun/page.tsx
├── api/
│   ├── auth/[...nextauth]/route.ts
│   ├── agenda/route.ts
│   └── ...
├── globals.css              # Design tokens + base styles
├── layout.tsx              # Root layout
└── page.tsx                # Root page (redirects)
`

### Component Structure

`
components/
├── ui/                      # Base UI components
│   ├── Button/
│   │   ├── Button.tsx
│   │   ├── Button.css
│   │   └── index.ts
│   ├── Card/
│   ├── Input/
│   ├── Badge/
│   └── Toast/
├── layout/                  # Layout components
│   ├── Header/
│   │   ├── Header.tsx
│   │   ├── Header.css
│   │   └── index.ts
│   └── BottomNav/
│       ├── BottomNav.tsx
│       ├── BottomNav.css
│       └── index.ts
├── features/                # Feature-specific components
│   ├── Agenda/
│   │   ├── AgendaCard.tsx
│   │   ├── AgendaForm.tsx
│   │   └── AgendaList.tsx
│   └── ...
└── icons/                  # Custom icons
    └── CustomIcon.tsx
`

---

## Component Guidelines

### Component Template

`	sx
// components/ui/ComponentName/ComponentName.tsx
'use client';

import { forwardRef } from 'react';
import styles from './ComponentName.module.css';

export interface ComponentNameProps {
  /** Description of prop */
  variant?: 'primary' | 'secondary';
  /** Description of prop */
  size?: 'small' | 'medium' | 'large';
  /** Description of prop */
  disabled?: boolean;
  /** Description of prop */
  onClick?: () => void;
  /** Description of prop */
  children: React.ReactNode;
  /** Description of prop */
  className?: string;
}

export const ComponentName = forwardRef<HTMLButtonElement, ComponentNameProps>(
  ({ variant = 'primary', size = 'medium', disabled, onClick, children, className }, ref) => {
    const classNames = [
      styles.component,
      styles[variant],
      styles[size],
      disabled && styles.disabled,
      className,
    ]
      .filter(Boolean)
      .join(' ');

    return (
      <button
        ref={ref}
        className={classNames}
        disabled={disabled}
        onClick={onClick}
        type="button"
      >
        {children}
      </button>
    );
  }
);

ComponentName.displayName = 'ComponentName';
`

### Component Rules

1. **Use forwardRef** for components that need refs
2. **Export types** for all props
3. **One component per file**
4. **Co-locate styles** with component
5. **Use CSS Modules** for component styles

---

## Styling Guidelines

### CSS Modules

Use CSS Modules for component styles:

`css
/* ComponentName.module.css */

.component {
  /* Base styles */
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

/* Variants */
.primary {
  background: linear-gradient(135deg, #9333ea 0%, #3b82f6 100%);
  color: white;
}

.secondary {
  background: transparent;
  border: 1.5px solid #9333ea;
  color: #9333ea;
}

/* Sizes */
.small {
  height: 36px;
  padding: 0 12px;
  font-size: 13px;
}

.medium {
  height: 48px;
  padding: 0 24px;
  font-size: 15px;
}

.large {
  height: 56px;
  padding: 0 32px;
  font-size: 17px;
}

/* States */
.disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
`

### Design Tokens

Always use CSS custom properties from globals.css:

`css
/* ❌ Hardcoded values */
.component {
  background: #9333ea;
  border-radius: 10px;
  padding: 16px;
}

/* ✅ Using design tokens */
.component {
  background: var(--color-primary);
  border-radius: var(--radius-md);
  padding: var(--space-4);
}
`

### Global Styles

Only in globals.css:
- CSS custom properties (design tokens)
- Reset styles
- Global utilities

Never use global classes for component styles.

---

## State Management

### Local State

Use React hooks for local state:

`	sx
const [isLoading, setIsLoading] = useState(false);
const [error, setError] = useState<string | null>(null);
const [data, setData] = useState<DataType | null>(null);
`

### Server State

Use Supabase client directly for server state:

`	sx
const fetchAgenda = async () => {
  const { data, error } = await supabase
    .from('agenda')
    .select('*, profiles(name)')
    .eq('status', 'published')
    .order('date', { ascending: true });
  
  if (error) {
    setError(error.message);
    return;
  }
  
  setData(data);
};
`

### Form State

`	sx
const [formData, setFormData] = useState({
  title: '',
  date: '',
  time_start: '',
  time_end: '',
});

const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  setFormData(prev => ({
    ...prev,
    [e.target.name]: e.target.value,
  }));
};
`

---

## Performance

### Code Splitting

`	sx
// ❌ Import everything
import { HeavyComponent } from './HeavyComponent';

// ✅ Dynamic import
const HeavyComponent = dynamic(() => import('./HeavyComponent'), {
  loading: () => <Skeleton />,
  ssr: false,
});
`

### Image Optimization

`	sx
import Image from 'next/image';

// Always specify sizes
<Image
  src={src}
  alt={alt}
  width={400}
  height={300}
  sizes="(max-width: 640px) 100vw, 400px"
/>
`

### List Virtualization

For long lists, consider virtualization:

`	sx
import { useVirtualizer } from '@tanstack/react-virtual';

const virtualizer = useVirtualizer({
  count: items.length,
  getScrollElement: () => parentRef.current,
  estimateSize: () => 80,
});
`

---

## Testing

### Test Structure

`
components/
├── Button/
│   ├── Button.tsx
│   ├── Button.test.tsx
│   └── Button.module.css
`

### Test Examples

`	sx
import { render, screen, fireEvent } from '@testing-library/react';
import { Button } from './Button';

describe('Button', () => {
  it('renders children', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByText('Click me')).toBeInTheDocument();
  });

  it('calls onClick when clicked', () => {
    const handleClick = jest.fn();
    render(<Button onClick={handleClick}>Click me</Button>);
    fireEvent.click(screen.getByText('Click me'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('is disabled when disabled prop is true', () => {
    render(<Button disabled>Click me</Button>);
    expect(screen.getByText('Click me')).toBeDisabled();
  });
});
`

---

## Git Workflow

### Branch Naming

| Type | Pattern | Example |
|------|---------|---------|
| Feature | feature/description | feature/user-profile |
| Bug Fix | fix/description | fix/login-redirect |
| Chore | chore/description | chore/update-deps |
| Docs | docs/description | docs/api-guide |

### Commit Messages

`
feat: add new feature
fix: fix bug
docs: update documentation
style: formatting changes
refactor: code refactoring
perf: performance improvement
test: adding tests
chore: maintenance tasks
`

### Pull Request Process

1. Create branch from main
2. Make changes
3. Write/run tests
4. Create PR with description
5. Get code review
6. Squash and merge

---

## Document History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 2.0.0 | August 2026 | Engineering | Complete rewrite |
| 1.0.0 | Earlier | Engineering | Initial rules |

---

**Previous Document:** [11_API.md](./11_API.md)  
**Next Document:** [13_AI_RULES.md](./13_AI_RULES.md) - AI Rules

---

*This document defines development standards for SIMPATI.*
