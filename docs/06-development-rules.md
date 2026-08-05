# Development Rules

## Core Principles

### 1. Database First
- **Database utama adalah Supabase**
- Google Sheets BUKAN database
- Semua input data melalui aplikasi SIMPATI
- Supabase adalah source of truth

### 2. Code Quality
- **TypeScript strict mode** - semua warning aktif
- **Reusable components** - jangan duplicate logic
- **Clean architecture** - pisahkan concerns dengan jelas
- **Mobile First** - design untuk mobile dulu
- **Safari First** - iPhone/Safari prioritas utama

### 3. Image Handling
- **WebP only** untuk semua gambar
- Compression sebelum upload
- Generate thumbnail untuk preview
- Simpan di Supabase Storage

### 4. Git Workflow
- **Branch naming:** `feature/nama-fitur`, `fix/nama-bug`
- **Commit messages:** Clear and descriptive
- **No direct push to main** - gunakan Pull Request
- **Update docs** setelah setiap fitur selesai

---

## File Structure Rules

```
app/
├── (auth)/              # Auth-related pages
├── (admin)/             # Protected admin pages
├── api/                 # API routes
├── components/          # Reusable components
│   ├── ui/              # Base UI components
│   ├── layout/          # Layout components
│   ├── forms/           # Form components
│   └── features/        # Feature-specific components
├── lib/                 # Utilities & configs
├── hooks/               # Custom React hooks
└── types/               # TypeScript types
```

### Naming Conventions

| Type | Convention | Example |
|------|------------|---------|
| Components | PascalCase | `AgendaCard.tsx` |
| Hooks | camelCase, use prefix | `useAgenda.ts` |
| Utils | camelCase | `formatDate.ts` |
| Types | PascalCase | `AgendaType.ts` |
| Constants | SCREAMING_SNAKE | `MAX_FILE_SIZE` |
| Files | kebab-case | `api-routes.ts` |

---

## Component Rules

### 1. Reusable UI Components
```typescript
// Location: app/components/ui/
// Examples: Button, Card, Input, Badge, Modal

// Must have:
// - TypeScript interfaces
// - Forward refs where appropriate
// - Proper accessibility attributes
// - Consistent styling with design system
```

### 2. Feature Components
```typescript
// Location: app/components/features/
// Examples: AgendaForm, CalendarView, NotificationDropdown

// Must have:
// - Clear interface/props
// - Self-contained styling
// - Minimal external dependencies
```

### 3. Layout Components
```typescript
// Location: app/components/layout/
// Examples: Header, BottomNav, Sidebar

// Must have:
// - Mobile-first design
// - Safe area support
// - Responsive behavior
```

---

## API Design Rules

### Endpoint Patterns
```
GET    /api/[resource]          # List
POST   /api/[resource]           # Create
GET    /api/[resource]/[id]     # Get one
PUT    /api/[resource]/[id]     # Update
DELETE /api/[resource]/[id]      # Delete
```

### Response Format
```typescript
// Success
{
  success: true,
  data: T,
  message?: string
}

// Error
{
  success: false,
  error: {
    code: string,
    message: string,
    details?: any
  }
}
```

### Error Handling
```typescript
// Always handle:
// - Validation errors
// - Auth errors
// - Not found errors
// - Server errors
// - Network errors

// Never expose:
// - Stack traces
// - Internal paths
// - Database errors
```

---

## Database Rules

### Never Modify Schema Without Approval
- Semua perubahan database harus disetujui
- Buat migration file untuk schema changes
- Test migration di local sebelum production
- Backup data sebelum migration

### Query Best Practices
```typescript
// Use typed queries
const { data, error } = await supabase
  .from('agenda')
  .select('*, profiles(name)')
  .eq('status', 'published')
  .order('date', { ascending: true });

// Handle errors
if (error) {
  console.error('Query error:', error);
  throw new AppError('Failed to fetch agendas', 500);
}
```

### RLS (Row Level Security)
```typescript
// Always respect RLS policies
// Don't bypass with service role unless absolutely necessary
// Test access with different user roles
```

---

## Performance Rules

### Images
- Resize to max 1920px width
- Compress to WebP (quality 80%)
- Generate thumbnails (400px width)
- Use lazy loading

### Code Splitting
```typescript
// Use dynamic imports for heavy components
const AgendaForm = dynamic(() => import('@/components/features/AgendaForm'), {
  loading: () => <LoadingSpinner />,
  ssr: false
});
```

### Caching
```typescript
// Cache expensive queries
// Use SWR or React Query for client-side
// Implement ISR for static pages
```

---

## Testing Rules

### Before Commit
- [ ] No TypeScript errors
- [ ] ESLint passes
- [ ] All imports resolved
- [ ] No console.log/console.error

### After Feature
- [ ] Test on iPhone Safari
- [ ] Test on Android Chrome
- [ ] Test offline behavior
- [ ] Test responsive layouts

---

## Documentation Rules

### Update Docs After Feature
```
Setelah selesai fitur, update:
1. 08-todo.md - centang fitur yang selesai
2. 03-database.md - jika ada schema changes
3. 02-design-system.md - jika ada new components
4. 09-claude.md - jika ada new rules
```

### Code Comments
```typescript
// Use clear comments for complex logic
// Explain WHY, not WHAT
// Remove commented-out code before commit
```

---

## Security Rules

### Environment Variables
- Never commit .env files
- Use .env.example for documentation
- Prefix public vars with NEXT_PUBLIC_

### Authentication
- Always validate session server-side
- Use middleware for protected routes
- Implement proper logout flow

### Input Validation
- Validate all user inputs
- Sanitize data before storage
- Escape output for XSS prevention

---

## iOS/Safari Specific Rules

### Must Test
- [ ] Pull-to-refresh disabled
- [ ] Safe areas respected
- [ ] No zoom on input focus
- [ ] Smooth scrolling
- [ ] Native feel buttons

### Common Pitfalls to Avoid
```css
/* ❌ Don't use */
input { font-size: 14px; } /* Causes zoom on iOS */

/* ✅ Do use */
input { font-size: 16px; } /* Prevents zoom */

/* ❌ Don't use */
body { overflow-x: hidden; } /* Breaks scroll */

/* ✅ Do use */
body { overscroll-behavior: none; }
```

---

## Package Rules

### Before Installing
- Check if existing package can do the job
- Consider bundle size impact
- Check for maintenance status
- Verify TypeScript support

### Allowed Packages
```
UI:      @heroicons/react, lucide-react
State:   @tanstack/react-query (if needed)
Auth:    next-auth
Database: @supabase/supabase-js
Dates:   date-fns
Images:  sharp, browser-image-compression
Utils:   clsx, tailwind-merge
```

---

## Debugging Rules

### Development
```typescript
// Use console.warn for warnings
// Use console.error for errors
// Remove debug logs before commit

console.debug('Debug info:', data); // ❌ Remove
console.warn('Warning:', data);     // ✅ Acceptable
console.error('Error:', error);    // ✅ For errors
```

### Production
```typescript
// Use error tracking service
// Log to analytics
// Never expose sensitive data
```

---

*Development Rules v2.0 - August 2026*
