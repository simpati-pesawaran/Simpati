// ============================================================================
// Notifications API
// ============================================================================

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { supabaseAdmin } from "@/app/lib/supabase";

/**
 * GET /api/notifications
 * Get notifications for current user (or all for superadmin)
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const limit = parseInt(searchParams.get("limit") || "20");
    const offset = parseInt(searchParams.get("offset") || "0");

    const profile = (session.user as any)?.profile;
    const isSuperadmin = profile?.role === "superadmin";

    let query = supabaseAdmin
      .from("notifications")
      .select("*", { count: "exact" })
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);

    // Superadmin sees all notifications
    // Regular users see only their own
    if (!isSuperadmin && profile?.id) {
      query = query.eq("user_id", profile.id);
    }

    const { data, error, count } = await query;

    if (error) {
      console.error("Error fetching notifications:", error);
      return NextResponse.json({ error: "Database error" }, { status: 500 });
    }

    // Get unread count
    let unreadQuery = supabaseAdmin
      .from("notifications")
      .select("id", { count: "exact", head: true })
      .eq("is_read", false);

    if (!isSuperadmin && profile?.id) {
      unreadQuery = unreadQuery.eq("user_id", profile.id);
    }

    const { count: unreadCount } = await unreadQuery;

    return NextResponse.json({
      success: true,
      data: data || [],
      count: count || 0,
      unread: unreadCount || 0,
    });
  } catch (error) {
    console.error("GET /api/notifications error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
