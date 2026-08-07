// ============================================================================
// Calendar Sync API - Bidirectional sync with Google Calendar
// ============================================================================

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { supabaseAdmin } from "@/app/lib/supabase";

/**
 * POST /api/calendar/sync
 * Sync agenda to Google Calendar
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const profile = (session.user as any)?.profile;

    if (!profile || profile.status !== "approved") {
      return NextResponse.json({ error: "Not approved" }, { status: 403 });
    }

    // Get user's Google Calendar tokens
    const { data: tokens } = await supabaseAdmin
      .from("user_calendar_tokens")
      .select("*")
      .eq("user_id", profile.id)
      .single();

    if (!tokens || !tokens.access_token) {
      return NextResponse.json({
        error: "Google Calendar belum terhubung",
        connected: false,
      }, { status: 400 });
    }

    const body = await request.json();
    const { action, agenda_id, agenda_data } = body;

    // Get or refresh access token
    let accessToken = tokens.access_token;
    if (tokens.expires_at && new Date(tokens.expires_at) < new Date()) {
      const refreshed = await refreshAccessToken(tokens.refresh_token, profile.id);
      if (refreshed) {
        const { data: newTokens } = await supabaseAdmin
          .from("user_calendar_tokens")
          .select("access_token")
          .eq("user_id", profile.id)
          .single();
        accessToken = newTokens?.access_token;
      } else {
        return NextResponse.json({
          error: "Sesi Google Calendar berakhir",
          connected: false,
        }, { status: 400 });
      }
    }

    if (action === "push") {
      // Push single agenda to Google Calendar
      return await pushToGoogleCalendar(accessToken, agenda_data, profile);
    }

    if (action === "pull") {
      // Pull from Google Calendar
      return await pullFromGoogleCalendar(accessToken, profile, body);
    }

    if (action === "sync_all") {
      // Full bidirectional sync
      return await fullSync(accessToken, profile);
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error) {
    console.error("POST /api/calendar/sync error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

/**
 * Push agenda to Google Calendar
 */
async function pushToGoogleCalendar(accessToken: string, agenda: any, profile: any) {
  const event = {
    summary: agenda.title,
    description: agenda.description || '',
    location: agenda.location || '',
    start: {
      dateTime: `${agenda.date}T${agenda.time_start}:00`,
      timeZone: 'Asia/Jakarta',
    },
    end: {
      dateTime: `${agenda.date}T${agenda.time_end}:00`,
      timeZone: 'Asia/Jakarta',
    },
    extendedProperties: {
      private: {
        simpati_agenda_id: agenda.id,
        simpati_jenis: agenda.jenis,
        simpati_sub_jenis: agenda.sub_jenis || '',
      },
    },
    reminders: {
      useDefault: false,
      overrides: [
        { method: 'popup', minutes: 30 },
        { method: 'popup', minutes: 60 },
      ],
    },
  };

  const response = await fetch(
    'https://www.googleapis.com/calendar/v3/calendars/primary/events',
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(event),
    }
  );

  if (!response.ok) {
    const error = await response.json();
    console.error("Google Calendar push error:", error);
    return NextResponse.json({ error: "Gagal push ke Google Calendar" }, { status: 500 });
  }

  const googleEvent = await response.json();

  // Store Google Event ID mapping
  await supabaseAdmin
    .from("calendar_event_mapping")
    .upsert({
      agenda_id: agenda.id,
      google_event_id: googleEvent.id,
      user_id: profile.id,
      updated_at: new Date().toISOString(),
    });

  // Log activity
  await supabaseAdmin.from("activity_logs").insert({
    user_id: profile.id,
    user_name: profile.name,
    action: "sync",
    entity_type: "agenda",
    entity_id: agenda.id,
    description: `Mensinkronkan "${agenda.title}" ke Google Calendar`,
  });

  return NextResponse.json({
    success: true,
    message: "Berhasil sinkron ke Google Calendar",
    google_event_id: googleEvent.id,
  });
}

/**
 * Pull events from Google Calendar
 */
async function pullFromGoogleCalendar(accessToken: string, profile: any, params: any) {
  const { date_from, date_to } = params;

  const timeMin = date_from ? new Date(date_from).toISOString() : new Date().toISOString();
  const timeMax = date_to ? new Date(date_to).toISOString() : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();

  const response = await fetch(
    `https://www.googleapis.com/calendar/v3/calendars/primary/events?` +
    `timeMin=${encodeURIComponent(timeMin)}&` +
    `timeMax=${encodeURIComponent(timeMax)}&` +
    `singleEvents=true&orderBy=startTime`,
    {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
    }
  );

  if (!response.ok) {
    const error = await response.json();
    console.error("Google Calendar pull error:", error);
    return NextResponse.json({ error: "Gagal pull dari Google Calendar" }, { status: 500 });
  }

  const data = await response.json();

  // Filter events that were created by SIMPATI (have simpati_agenda_id)
  const simpatiEvents = data.items.filter((event: any) =>
    event.extendedProperties?.private?.simpati_agenda_id
  );

  return NextResponse.json({
    success: true,
    events: data.items,
    simpati_events: simpatiEvents,
    count: data.items.length,
  });
}

/**
 * Full bidirectional sync
 */
async function fullSync(accessToken: string, profile: any) {
  // Get all published agendas from SIMPATI
  const { data: agendas } = await supabaseAdmin
    .from("agenda")
    .select("*")
    .eq("status", "published")
    .is("deleted_at", null);

  // Get all event mappings
  const { data: mappings } = await supabaseAdmin
    .from("calendar_event_mapping")
    .select("*")
    .eq("user_id", profile.id);

  const mappedAgendaIds = new Set(mappings?.map((m: any) => m.agenda_id) || []);
  const unsyncedAgendas = (agendas || []).filter((a: any) => !mappedAgendaIds.has(a.id));

  // Push unsynced agendas
  const results = {
    synced: 0,
    failed: 0,
    errors: [] as string[],
  };

  for (const agenda of unsyncedAgendas) {
    try {
      const res = await pushToGoogleCalendar(accessToken, agenda, profile);
      if (res.ok) {
        results.synced++;
      } else {
        results.failed++;
        const data = await res.json();
        results.errors.push(data.error);
      }
    } catch {
      results.failed++;
    }
  }

  return NextResponse.json({
    success: true,
    message: `Sinkron selesai: ${results.synced} berhasil, ${results.failed} gagal`,
    results,
  });
}

/**
 * Refresh access token
 */
async function refreshAccessToken(refreshToken: string, userId: string): Promise<boolean> {
  try {
    const response = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id: process.env.GOOGLE_CLIENT_ID!,
        client_secret: process.env.GOOGLE_CLIENT_SECRET!,
        refresh_token: refreshToken,
        grant_type: 'refresh_token',
      }),
    });

    if (!response.ok) return false;

    const data = await response.json();

    await supabaseAdmin
      .from("user_calendar_tokens")
      .update({
        access_token: data.access_token,
        expires_at: new Date(Date.now() + data.expires_in * 1000).toISOString(),
      })
      .eq("user_id", userId);

    return true;
  } catch {
    return false;
  }
}
