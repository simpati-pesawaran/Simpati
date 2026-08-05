# SIMPATI - API Documentation

**Version:** 2.0.0  
**Last Updated:** August 2026  
**Document Owner:** Engineering Team  
**Classification:** Internal - Confidential

---

## Table of Contents

1. [Overview](#overview)
2. [Authentication](#authentication)
3. [Endpoints](#endpoints)
4. [Request/Response](#requestresponse)
5. [Error Handling](#error-handling)
6. [Rate Limiting](#rate-limiting)

---

## Overview

### API Architecture

| Attribute | Value |
|-----------|-------|
| **Type** | REST |
| **Base URL** | /api |
| **Auth** | NextAuth.js (JWT) |
| **Format** | JSON |

### API Routes Structure

`
app/api/
├── auth/
│   └── [...nextauth]/route.ts    # NextAuth handlers
├── agenda/
│   ├── route.ts                   # GET, POST
│   └── [id]/route.ts              # GET, PUT, DELETE
├── notifications/
│   ├── route.ts                   # GET
│   └── [id]/route.ts              # PATCH (mark read)
├── gallery/
│   └── route.ts                   # POST (upload)
└── calendar/
    └── sync/route.ts              # POST (Google Calendar)
`

---

## Authentication

### NextAuth.js Setup

`	ypescript
// app/api/auth/[...nextauth]/route.ts
import NextAuth from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';

export const authOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  session: {
    strategy: 'jwt',
  },
  callbacks: {
    async jwt({ token, account, profile }) {
      if (account && profile) {
        token.accessToken = account.access_token;
      }
      return token;
    },
    async session({ session, token }) {
      session.accessToken = token.accessToken;
      return session;
    },
  },
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
`

### Protected Routes

`	ypescript
// middleware.ts
import { withAuth } from 'next-auth/middleware';

export default withAuth({
  pages: {
    signIn: '/login',
  },
});

export const config = {
  matcher: ['/dashboard/:path*', '/agenda/:path*', '/galeri/:path*'],
};
`

---

## Endpoints

### Authentication

#### POST /api/auth/signin

Initiates Google OAuth flow.

**Response:**
`json
{
  "url": "https://accounts.google.com/o/oauth2/..."
}
`

#### POST /api/auth/signout

Ends user session.

**Response:**
`json
{
  "success": true
}
`

---

### Agenda

#### GET /api/agenda

Get list of agendas.

**Query Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| jenis | string | Filter by type (agenda/audiensi) |
| status | string | Filter by status |
| date | string | Filter by date (YYYY-MM-DD) |
| page | number | Page number |
| limit | number | Items per page |

**Response:**
`json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "jenis": "agenda",
      "title": "Rapat Koordinasi",
      "date": "2026-08-15",
      "time_start": "09:00",
      "time_end": "11:00",
      "location": "Ruang Rapat Utama",
      "status": "published",
      "created_by": {
        "id": "uuid",
        "name": "John Doe",
        "avatar_url": "https://..."
      },
      "gallery_count": 12
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 100
  }
}
`

#### POST /api/agenda

Create new agenda.

**Request:**
`json
{
  "jenis": "agenda",
  "title": "Rapat Koordinasi",
  "description": "Pembahasan program kerja",
  "date": "2026-08-15",
  "time_start": "09:00",
  "time_end": "11:00",
  "location": "Ruang Rapat Utama",
  "status": "published"
}
`

**Response:**
`json
{
  "success": true,
  "data": {
    "id": "uuid",
    "jenis": "agenda",
    "title": "Rapat Koordinasi",
    ...
  }
}
`

#### GET /api/agenda/[id]

Get single agenda.

**Response:**
`json
{
  "success": true,
  "data": {
    "id": "uuid",
    "jenis": "agenda",
    "title": "Rapat Koordinasi",
    "description": "Pembahasan program kerja",
    "date": "2026-08-15",
    "time_start": "09:00",
    "time_end": "11:00",
    "location": "Ruang Rapat Utama",
    "status": "published",
    "google_event_id": "abc123",
    "google_synced_at": "2026-08-10T08:00:00Z",
    "created_by": {
      "id": "uuid",
      "name": "John Doe",
      "avatar_url": "https://..."
    },
    "gallery": [
      {
        "id": "uuid",
        "thumbnail_url": "https://...",
        "created_at": "2026-08-15T10:00:00Z"
      }
    ]
  }
}
`

#### PUT /api/agenda/[id]

Update agenda.

**Request:**
`json
{
  "title": "Updated Title",
  "description": "Updated description",
  "time_end": "12:00"
}
`

#### DELETE /api/agenda/[id]

Soft delete agenda.

**Response:**
`json
{
  "success": true,
  "message": "Agenda berhasil dihapus"
}
`

---

### Notifications

#### GET /api/notifications

Get user notifications.

**Query Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| unread_only | boolean | Show only unread |
| page | number | Page number |
| limit | number | Items per page |

**Response:**
`json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "type": "agenda_created",
      "title": "Agenda Baru",
      "message": "John Doe membuat agenda baru",
      "is_read": false,
      "created_at": "2026-08-15T08:00:00Z"
    }
  ],
  "unread_count": 5
}
`

#### PATCH /api/notifications/[id]

Mark notification as read.

**Response:**
`json
{
  "success": true,
  "data": {
    "id": "uuid",
    "is_read": true,
    "read_at": "2026-08-15T10:00:00Z"
  }
}
`

---

### Gallery

#### POST /api/gallery

Upload image/file.

**Request:** multipart/form-data

| Field | Type | Description |
|-------|------|-------------|
| file | File | Image file |
| agenda_id | string | Optional agenda ID |
| title | string | Optional title |

**Response:**
`json
{
  "success": true,
  "data": {
    "id": "uuid",
    "file_name": "photo.webp",
    "storage_path": "gallery/2026/08/uuid.webp",
    "thumbnail_path": "gallery/2026/08/uuid_thumb.webp",
    "url": "https://...",
    "thumbnail_url": "https://..."
  }
}
`

---

### Calendar Sync

#### POST /api/calendar/sync

Sync agenda to Google Calendar.

**Request:**
`json
{
  "agenda_id": "uuid"
}
`

**Response:**
`json
{
  "success": true,
  "data": {
    "google_event_id": "abc123",
    "synced_at": "2026-08-15T08:00:00Z"
  }
}
`

---

## Request/Response

### Success Response

`	ypescript
interface SuccessResponse<T> {
  success: true;
  data: T;
  message?: string;
}
`

### Error Response

`	ypescript
interface ErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    details?: any;
  };
}
`

### HTTP Status Codes

| Code | Meaning |
|------|---------|
| 200 | Success |
| 201 | Created |
| 400 | Bad Request |
| 401 | Unauthorized |
| 403 | Forbidden |
| 404 | Not Found |
| 409 | Conflict |
| 500 | Server Error |

---

## Error Handling

### Error Codes

| Code | HTTP | Description |
|------|------|-------------|
| UNAUTHORIZED | 401 | Not authenticated |
| FORBIDDEN | 403 | Not authorized |
| NOT_FOUND | 404 | Resource not found |
| VALIDATION_ERROR | 400 | Invalid input |
| COLLISION | 409 | Time conflict |
| SYNC_FAILED | 500 | Google Calendar sync failed |
| SERVER_ERROR | 500 | Internal server error |

### Error Response Example

`json
{
  "success": false,
  "error": {
    "code": "COLLISION",
    "message": "Terjadi konflik jadwal",
    "details": {
      "conflicting_agenda": {
        "id": "uuid",
        "title": "Rapat Lain",
        "time": "09:00 - 10:30"
      }
    }
  }
}
`

---

## Rate Limiting

### Limits

| Endpoint | Limit |
|----------|-------|
| POST /api/agenda | 10/minute |
| POST /api/gallery | 20/minute |
| GET /api/* | 100/minute |

### Response Headers

`
X-RateLimit-Limit: 10
X-RateLimit-Remaining: 9
X-RateLimit-Reset: 1621234567
`

### Rate Limit Exceeded

`json
{
  "success": false,
  "error": {
    "code": "RATE_LIMITED",
    "message": "Terlalu banyak permintaan. Coba lagi nanti."
  }
}
`

---

## Document History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 2.0.0 | August 2026 | Engineering | API redesign |
| 1.0.0 | Earlier | Engineering | Initial API |

---

**Previous Document:** [10_DATABASE.md](./10_DATABASE.md)  
**Next Document:** [12_DEVELOPMENT_RULES.md](./12_DEVELOPMENT_RULES.md) - Development Rules

---

*This document defines the API for SIMPATI.*
