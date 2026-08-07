// ============================================================================
// Google Calendar OAuth API
// ============================================================================

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { supabaseAdmin } from "@/app/lib/supabase";

// Google Calendar API credentials (from env)
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const REDIRECT_URI = `${process.env.NEXT_PUBLIC_APP_URL || 'https://simpati.vercel.app'}/api/calendar/callback`;

// Scopes for Google Calendar API
const SCOPES = [
  'https://www.googleapis.com/auth/calendar',
  'https://www.googleapis.com/auth/calendar.events',
].join(' ');

/**
 * GET /api/calendar
 * Check if user has connected Google Calendar
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const profile = (session.user as any)?.profile;

    if (!profile || profile.status !== "approved") {
      return NextResponse.json({ error: "Not approved" }, { status: 403 });
    }

    // Check if user has stored tokens
    const { data: calendarData } = await supabaseAdmin
      .from("user_calendar_tokens")
      .select("*")
      .eq("user_id", profile.id)
      .single();

    if (!calendarData || !calendarData.access_token) {
      return NextResponse.json({
        connected: false,
        message: "Google Calendar belum terhubung",
      });
    }

    // Verify token is still valid
    const isValid = await verifyAccessToken(calendarData.access_token);

    if (!isValid && calendarData.refresh_token) {
      // Try to refresh token
      const refreshed = await refreshAccessToken(calendarData.refresh_token, profile.id);
      if (refreshed) {
        return NextResponse.json({
          connected: true,
          message: "Google Calendar terhubung",
        });
      }
    }

    if (!isValid) {
      // Token expired and couldn't refresh
      return NextResponse.json({
        connected: false,
        message: "Sesi Google Calendar berakhir, silakan hubungkan ulang",
      });
    }

    return NextResponse.json({
      connected: true,
      message: "Google Calendar terhubung",
    });
  } catch (error) {
    console.error("GET /api/calendar error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

/**
 * POST /api/calendar
 * Initiate Google OAuth flow
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET) {
      return NextResponse.json({
        error: "Google Calendar belum dikonfigurasi",
        setup: true,
      }, { status: 500 });
    }

    // Generate state token for CSRF protection
    const state = generateStateToken();

    // Build OAuth URL
    const authUrl = new URL('https://accounts.google.com/o/oauth2/v2/auth');
    authUrl.searchParams.set('client_id', GOOGLE_CLIENT_ID);
    authUrl.searchParams.set('redirect_uri', REDIRECT_URI);
    authUrl.searchParams.set('response_type', 'code');
    authUrl.searchParams.set('scope', SCOPES);
    authUrl.searchParams.set('access_type', 'offline');
    authUrl.searchParams.set('prompt', 'consent');
    authUrl.searchParams.set('state', state);

    return NextResponse.json({
      success: true,
      authUrl: authUrl.toString(),
      state,
    });
  } catch (error) {
    console.error("POST /api/calendar error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

/**
 * DELETE /api/calendar
 * Disconnect Google Calendar
 */
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const profile = (session.user as any)?.profile;

    if (!profile) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Delete stored tokens
    await supabaseAdmin
      .from("user_calendar_tokens")
      .delete()
      .eq("user_id", profile.id);

    return NextResponse.json({
      success: true,
      message: "Google Calendar berhasil disconnect",
    });
  } catch (error) {
    console.error("DELETE /api/calendar error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

// Helper functions
function generateStateToken(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < 32; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

async function verifyAccessToken(token: string): Promise<boolean> {
  try {
    const response = await fetch('https://www.googleapis.com/oauth2/v3/tokeninfo', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: `access_token=${token}`,
    });
    return response.ok;
  } catch {
    return false;
  }
}

async function refreshAccessToken(refreshToken: string, userId: string): Promise<boolean> {
  try {
    const response = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id: GOOGLE_CLIENT_ID!,
        client_secret: GOOGLE_CLIENT_SECRET!,
        refresh_token: refreshToken,
        grant_type: 'refresh_token',
      }),
    });

    if (!response.ok) return false;

    const data = await response.json();

    // Update stored tokens
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
