# Deployment

## Overview

- **Local:** `C:\simpati`
- **Repository:** GitHub
- **Hosting:** Vercel
- **Database:** Supabase Cloud

---

## Local Development

### Setup
```bash
# Clone repository
git clone https://github.com/simpati-pesawaran/Simpati.git

# Install dependencies
npm install

# Copy environment variables
cp .env.example .env.local

# Edit .env.local with your values

# Start development server
npm run dev
```

### Environment Variables (.env.local)

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Google OAuth
GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-client-secret

# Google Calendar
GOOGLE_CALENDAR_ID=siagapesyaratan@gmail.com
GOOGLE_SERVICE_ACCOUNT_KEY={"type":"service_account",...}

# Google Sheets
GOOGLE_SHEET_ID=your-sheet-id

# NextAuth
NEXTAUTH_SECRET=generate-with-openssl-rand-base64-32
NEXTAUTH_URL=http://localhost:3000

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

---

## Vercel Deployment

### Production URL
```
https://simpati-silk.vercel.app
```

### Setup Steps

1. **Connect GitHub Repository**
   - Go to Vercel Dashboard
   - Import project from GitHub
   - Select repository: `simpati-pesawaran/Simpati`

2. **Configure Environment Variables**
   - Add all variables from .env.example
   - Use production values for:
     - Supabase production project
     - Google OAuth (production credentials)
     - NEXTAUTH_URL: `https://simpati-silk.vercel.app`

3. **Build Settings**
   ```
   Framework: Next.js
   Build Command: npm run build
   Output Directory: .next
   Install Command: npm install
   ```

4. **Deploy**
   - Vercel auto-deploys on push to main
   - Preview deployments for PRs

### Vercel Environment Variables

| Name | Required | Description |
|------|----------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Yes | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Yes | Supabase anonymous key |
| `SUPABASE_SERVICE_ROLE_KEY` | Yes | Supabase service role key |
| `GOOGLE_CLIENT_ID` | Yes | Google OAuth Client ID |
| `GOOGLE_CLIENT_SECRET` | Yes | Google OAuth Client Secret |
| `GOOGLE_CALENDAR_ID` | Yes | Calendar ID for sync |
| `GOOGLE_SERVICE_ACCOUNT_KEY` | Yes | Service account JSON |
| `GOOGLE_SHEET_ID` | No | Sheet ID for export |
| `NEXTAUTH_SECRET` | Yes | Random secret for auth |
| `NEXTAUTH_URL` | Yes | Production URL |
| `NEXT_PUBLIC_APP_URL` | Yes | Public app URL |

---

## Supabase Setup

### Project Creation

1. Go to [Supabase](https://supabase.com)
2. Create new project
3. Note down:
   - Project URL
   - `anon` public key
   - `service_role` secret key

### Database Setup

1. **Go to SQL Editor**
2. **Run migrations** (in order):
   - `supabase/migrations/001_initial_schema.sql`
   - `supabase/migrations/002_indexes.sql`
   - `supabase/migrations/003_rls_policies.sql`
   - `supabase/migrations/004_triggers.sql`

### Storage Setup

1. **Create bucket:**
   ```sql
   INSERT INTO storage.buckets (id, name, public)
   VALUES ('gallery', 'gallery', true);
   ```

2. **Setup storage policies:**
   ```sql
   -- Allow public read
   CREATE POLICY "Public Access"
   ON storage.objects FOR SELECT
   USING (bucket_id = 'gallery');

   -- Allow authenticated upload
   CREATE POLICY "Authenticated Upload"
   ON storage.objects FOR INSERT
   WITH CHECK (bucket_id = 'gallery' AND auth.role() = 'authenticated');
   ```

### Supabase Auth Settings

1. **Authentication → Providers → Google**
2. Enable Google OAuth
3. Add credentials:
   - Client ID
   - Client Secret
4. Authorized redirect URI:
   ```
   https://your-project.supabase.co/auth/v1/callback
   ```

---

## Google Cloud Setup

### Enable APIs

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Select project or create new
3. Enable APIs:
   - Google Calendar API
   - Google Sheets API
   - Google Drive API

### OAuth Credentials

1. **Credentials → Create Credentials → OAuth client ID**
2. Application type: Web application
3. Authorized redirect URIs:
   ```
   http://localhost:3000/api/auth/callback/google
   https://simpati-silk.vercel.app/api/auth/callback/google
   ```
4. Note Client ID and Secret

### Service Account (for Server-side)

1. **IAM & Admin → Service Accounts**
2. Create new service account
3. Generate JSON key
4. Share Calendar/Sheets with service account email

### Calendar Setup

1. Open Google Calendar
2. Settings → Add calendar
3. Name: "SIMPATI"
4. Share with service account email (make it "Make changes to events")

### Sheets Setup

1. Create new spreadsheet
2. Share with service account email (Editor access)
3. Note the Sheet ID from URL

---

## PWA Deployment

### Service Worker Registration

Service worker registered in `app/layout.tsx`:
```typescript
// Register SW in production only
if ('serviceWorker' in navigator && process.env.NODE_ENV === 'production') {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js');
  });
}
```

### PWA Assets

Required files in `/public`:
```
public/
├── manifest.json
├── sw.js
├── icons/
│   ├── icon-192.png
│   ├── icon-512.png
│   └── apple-touch-icon.png
├── og-image.png
└── favicon.ico
```

### Install Prompt

PWA should show install prompt on compatible devices:
- iOS: Manual via Share → Add to Home Screen
- Android: Auto prompt (when criteria met)
- Desktop: Chrome/Edge install banner

---

## Domain & SSL

### Vercel
- SSL enabled by default
- Custom domain: Configure in Vercel Dashboard
- Redirects: www → non-www (or vice versa)

### DNS Configuration
```
Type    Name    Value                   Points to
A       @       vercel-forwarding      Your Vercel deployment
CNAME   www     cname.vercel-dns.com   Vercel
```

---

## Monitoring & Logs

### Vercel Analytics
- Built-in analytics dashboard
- Performance metrics
- User insights

### Error Tracking
- Vercel Error monitoring
- Supabase logs in Dashboard
- Custom error logging (future)

---

## Deployment Checklist

### Pre-Deployment
- [ ] All environment variables configured
- [ ] Database migrations run
- [ ] Supabase storage configured
- [ ] Google Cloud APIs enabled
- [ ] Google OAuth consent configured

### Post-Deployment
- [ ] Verify login works
- [ ] Test CRUD operations
- [ ] Test Google Calendar sync
- [ ] Test file upload
- [ ] Verify PWA installable
- [ ] Check mobile responsiveness
- [ ] Test on iPhone Safari
- [ ] Verify offline behavior

### Production Verification
```bash
# Test production URL
curl -I https://simpati-silk.vercel.app

# Should return 200 with proper headers
```

---

## Rollback

### Vercel
- Dashboard → Deployments
- Select previous deployment
- Click "Preview" → "Promote to Production"

### Database
- Use Supabase Point-in-time Recovery
- Or restore from backup in Dashboard

---

## Environment Matrix

| Environment | URL | Database | Notes |
|-------------|-----|----------|-------|
| Local | localhost:3000 | Local Supabase | Development |
| Preview | vercel.app/* | Production | PR deployments |
| Production | simpati-silk.vercel.app | Production | Live app |

---

*Deployment Guide v2.0 - August 2026*
