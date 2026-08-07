// ============================================================================
// Google Calendar OAuth Callback
// ============================================================================

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { supabaseAdmin } from "@/app/lib/supabase";

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const REDIRECT_URI = `${process.env.NEXT_PUBLIC_APP_URL || 'https://simpati.vercel.app'}/api/calendar/callback`;

/**
 * GET /api/calendar/callback
 * Handle OAuth callback from Google
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const code = searchParams.get('code');
    const error = searchParams.get('error');
    const state = searchParams.get('state');

    // Handle error from Google
    if (error) {
      return NextResponse.redirect(
        new URL(`/kalender?error=${encodeURIComponent(error)}`, request.url)
      );
    }

    if (!code) {
      return NextResponse.redirect(
        new URL('/kalender?error=no_code', request.url)
      );
    }

    // Exchange code for tokens
    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id: GOOGLE_CLIENT_ID!,
        client_secret: GOOGLE_CLIENT_SECRET!,
        code,
        grant_type: 'authorization_code',
        redirect_uri: REDIRECT_URI,
      }),
    });

    if (!tokenResponse.ok) {
      const errorData = await tokenResponse.json();
      console.error("Token exchange error:", errorData);
      return NextResponse.redirect(
        new URL(`/kalender?error=token_exchange_failed`, request.url)
      );
    }

    const tokenData = await tokenResponse.json();

    // Get current user
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.redirect(
        new URL('/login?redirect=/kalender', request.url)
      );
    }

    const profile = (session.user as any)?.profile;

    if (!profile) {
      return NextResponse.redirect(
        new URL('/kalender?error=user_not_found', request.url)
      );
    }

    // Store or update tokens
    const { error: dbError } = await supabaseAdmin
      .from("user_calendar_tokens")
      .upsert({
        user_id: profile.id,
        access_token: tokenData.access_token,
        refresh_token: tokenData.refresh_token || null,
        expires_at: tokenData.expires_in
          ? new Date(Date.now() + tokenData.expires_in * 1000).toISOString()
          : null,
        calendar_id: 'primary',
        updated_at: new Date().toISOString(),
      });

    if (dbError) {
      console.error("Database error storing tokens:", dbError);
      return NextResponse.redirect(
        new URL('/kalender?error=storage_failed', request.url)
      );
    }

    // Success!
    return NextResponse.redirect(
      new URL('/kalender?success=connected', request.url)
    );
  } catch (error) {
    console.error("GET /api/calendar/callback error:", error);
    return NextResponse.redirect(
      new URL('/kalender?error=server_error', request.url)
    );
  }
}
