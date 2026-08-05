# Google Integration

## Overview

- **Direction:** Satu arah (Supabase → Google)
- **Calendar:** Sinkronisasi agenda ke Google Calendar
- **Sheets:** Export dan backup ke Google Sheets

```
┌─────────────────────────────────────────────────────────┐
│                                                          │
│   SUPABASE          GOOGLE CALENDAR        GOOGLE SHEETS │
│   ┌────────┐         ┌────────────┐         ┌─────────┐ │
│   │ Agenda │────────▶│  Calendar  │         │  Export │ │
│   │ Table  │  sync   │   Events   │         │  Backup │ │
│   └────────┘  ────▶  └────────────┘         └─────────┘ │
│                        (one-way)          (on-demand)    │
│                                                          │
│   All changes ONLY from SIMPATI app                      │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

---

## Google Calendar Integration

### Flow
```
User creates/updates/deletes agenda in SIMPATI
         ↓
Supabase database updated
         ↓
API route triggered (create/update/delete)
         ↓
Google Calendar API called
         ↓
Calendar event created/updated/deleted
```

### Color Coding

| Jenis | Color | Hex | Google Calendar Color ID |
|-------|-------|-----|------------------------|
| Agenda | Hijau | #22c55e | 10 (Green) |
| Audiensi | Orange | #f97316 | 6 (Orange) |

### Event Structure

```typescript
interface CalendarEvent {
  summary: string;           // Title
  description: string;        // Description + created by info
  location: string;          // Location
  start: {
    dateTime: string;        // ISO 8601 with timezone
    timeZone: string;        // "Asia/Jakarta"
  };
  end: {
    dateTime: string;
    timeZone: string;
  };
  colorId: string;          // "10" for agenda, "6" for audiensi
  extendedProperties: {
    private: {
      agendaId: string;      // UUID from Supabase
      jenis: string;         // "agenda" or "audiensi"
    };
  };
}
```

### API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/calendar/sync | Sync single agenda to calendar |
| DELETE | /api/calendar/[id] | Remove event from calendar |

### Implementation

```typescript
// Triggered after agenda create/update
async function syncToCalendar(agenda: Agenda) {
  const event = {
    summary: agenda.title,
    description: `${agenda.description}\n\nDibuat oleh: ${agenda.creator?.name}`,
    location: agenda.location,
    start: {
      dateTime: `${agenda.date}T${agenda.time_start}:00`,
      timeZone: 'Asia/Jakarta',
    },
    end: {
      dateTime: `${agenda.date}T${agenda.time_end}:00`,
      timeZone: 'Asia/Jakarta',
    },
    colorId: agenda.jenis === 'agenda' ? '10' : '6',
    extendedProperties: {
      private: {
        agendaId: agenda.id,
        jenis: agenda.jenis,
      },
    },
  };

  if (agenda.google_event_id) {
    // Update existing event
    await calendar.events.update({
      calendarId: process.env.GOOGLE_CALENDAR_ID,
      eventId: agenda.google_event_id,
      resource: event,
    });
  } else {
    // Create new event
    const response = await calendar.events.insert({
      calendarId: process.env.GOOGLE_CALENDAR_ID,
      resource: event,
    });

    // Save google_event_id to Supabase
    await supabase
      .from('agenda')
      .update({ google_event_id: response.data.id })
      .eq('id', agenda.id);
  }
}

// Triggered after agenda delete
async function removeFromCalendar(agenda: Agenda) {
  if (agenda.google_event_id) {
    await calendar.events.delete({
      calendarId: process.env.GOOGLE_CALENDAR_ID,
      eventId: agenda.google_event_id,
    });
  }
}
```

---

## Google Sheets Integration

### Purpose

- **Export:** Export agenda data to spreadsheet format
- **Backup:** Periodic backup of all data
- **Reports:** Generate reports (monthly, yearly)

### NOT for:

- ❌ Primary database
- ❌ User authentication
- ❌ Real-time sync
- ❌ Input data

### Flow
```
User clicks "Export ke Sheets"
         ↓
API route triggered
         ↓
Fetch data from Supabase
         ↓
Format as spreadsheet rows
         ↓
Append/overwrite to Google Sheet
         ↓
Return shareable link
```

### Sheet Structure

#### Sheet: "Agenda"

| A | B | C | D | E | F | G | H | I | J |
|---|---|---|---|---|---|---|---|---|---|
| ID | Jenis | Judul | Tanggal | Waktu | Lokasi | Status | Dibuat Oleh | Google Event ID | Timestamp |

#### Sheet: "Export Log"

| A | B | C | D |
|---|---|---|---|
| Tanggal Export | Total Agenda | Total Audiensi | Di-export Oleh |

### API Endpoint

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/sheets/export | Export all agendas to sheet |
| GET | /api/sheets/export/[type] | Export filtered data |

---

## Environment Variables

```env
# Google Calendar
GOOGLE_CALENDAR_ID=siagapesyaratan@gmail.com
GOOGLE_SERVICE_ACCOUNT_KEY={"type":"service_account",...}

# Google Sheets
GOOGLE_SHEET_ID=1QISdbLzLPwwErHk23db0uC2tTTYcFLCsF59ASSh5b5E
```

---

## Error Handling

### Calendar Sync Failures
```typescript
// If calendar sync fails, log error but don't block user
try {
  await syncToCalendar(agenda);
} catch (error) {
  // Log to activity_logs
  await supabase.from('activity_logs').insert({
    action: 'calendar_sync_failed',
    entity_type: 'agenda',
    entity_id: agenda.id,
    new_data: { error: error.message },
  });

  // Show warning to user but continue
  // Agenda is saved to Supabase regardless
}
```

### Sheet Export Failures
```typescript
// Sheet export failures are non-blocking
// User can retry later
// No data is lost (Supabase is source of truth)
```

---

## Sync Status Indicator

### UI Element
```
┌─────────────────────────────────────┐
│  🔄 Sync Status                     │
│                                     │
│  ☁️ Google Calendar: ✅ Synced      │
│  📊 Google Sheets: ✅ Ready         │
│                                     │
│  Last sync: 5 menit yang lalu       │
│  [ Force Sync ]                     │
└─────────────────────────────────────┘
```

---

*Google Integration v2.0 - August 2026*
