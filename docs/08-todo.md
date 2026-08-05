# TODO - SIMPATI Development Checklist

## Authentication
- [x] Google OAuth Setup
- [ ] Input Nama Popup
- [ ] Input Divisi Popup
- [ ] Save to Database (profiles table)
- [ ] Status Pending flow
- [ ] Bell Notification to Superadmin
- [ ] Email Notification to Superadmin
- [ ] Approval Page (Superadmin)
- [ ] Reject functionality with reason
- [ ] Protected routes middleware

## Core UI & Navigation
- [ ] Header (Logo + Bell)
- [ ] Bottom Navigation (Beranda, FAB, Akun)
- [ ] FAB (Floating Action Button)
- [ ] Page transitions
- [ ] Loading states
- [ ] Error boundaries

## Database (Supabase)
- [ ] Setup Supabase project
- [ ] Create profiles table
- [ ] Create agenda table
- [ ] Create notifications table
- [ ] Create gallery table
- [ ] Create activity_logs table
- [ ] Create settings table
- [ ] Setup RLS policies
- [ ] Create indexes
- [ ] Setup triggers
- [ ] Seed superadmin

## Beranda Page
- [ ] Dashboard statistics
- [ ] Recent activities
- [ ] Upcoming agenda preview
- [ ] Quick action buttons

## Agenda CRUD
- [ ] List view (filter by Agenda/Audiensi)
- [ ] Create form (modal or page)
- [ ] Edit functionality
- [ ] Delete with confirmation
- [ ] Collision detection (date + time overlap)
- [ ] Activity logging

## Google Calendar Sync
- [ ] Create calendar event
- [ ] Update calendar event
- [ ] Delete calendar event
- [ ] Color coding (Hijau=Agenda, Orange=Audiensi)
- [ ] Sync status indicator

## Gallery
- [ ] Grid view
- [ ] Image upload
- [ ] Resize image
- [ ] Convert to WebP
- [ ] Generate thumbnail
- [ ] Upload to Supabase Storage
- [ ] Delete functionality

## Notifications
- [ ] Bell icon with badge
- [ ] Notification dropdown
- [ ] Mark as read
- [ ] Real-time updates
- [ ] Notification types

## Google Sheets Export
- [ ] Export agenda to sheet
- [ ] Backup functionality
- [ ] Export log

## Akun Page
- [ ] Profile display
- [ ] Edit profile
- [ ] Logout

## PWA
- [ ] manifest.json
- [ ] Service Worker
- [ ] Install Prompt
- [ ] Offline Page
- [ ] Splash Screen
- [ ] App Icon (192px, 512px)
- [ ] Background Sync
- [ ] Push Notification (future ready)

## Polish & Performance
- [ ] iOS Safari optimizations
- [ ] Image optimization
- [ ] Lazy loading
- [ ] Code splitting
- [ ] Lighthouse audit
- [ ] Error handling
- [ ] Accessibility audit

## Production
- [ ] Environment variables setup
- [ ] Vercel production deploy
- [ ] Domain configuration
- [ ] SSL certificate
- [ ] Monitoring setup

---

## Progress Summary

```
Authentication:          ████░░░░░░░░░░░  10%
Core UI & Navigation:    ████░░░░░░░░░░░  10%
Database:                ░░░░░░░░░░░░░░░   0%
Beranda Page:            ░░░░░░░░░░░░░░░   0%
Agenda CRUD:             ░░░░░░░░░░░░░░░   0%
Google Calendar Sync:    ░░░░░░░░░░░░░░░   0%
Gallery:                 ░░░░░░░░░░░░░░░   0%
Notifications:           ░░░░░░░░░░░░░░░   0%
Google Sheets Export:    ░░░░░░░░░░░░░░░   0%
Akun Page:               ░░░░░░░░░░░░░░░   0%
PWA:                     ░░░░░░░░░░░░░░░   0%
Polish:                  ░░░░░░░░░░░░░░░   0%
Production:              ░░░░░░░░░░░░░░░   0%

OVERALL:                 █░░░░░░░░░░░░░░   5%
```

---

*Last updated: August 2026*
