// ============================================================================
// Mark Notifications as Read API
// ============================================================================

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { supabaseAdmin } from "@/app/lib/supabase";

/**
 * POST /api/notifications/read
 * Mark notifications as read
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { ids } = body; // Optional: specific IDs to mark as read

    const profile = (session.user as any)?.profile;
    const isSuperadmin = profile?.role === "superadmin";

    if (ids && ids.length > 0) {
      // Mark specific notifications as read
      const { error } = await supabaseAdmin
        .from("notifications")
        .update({ is_read: true, read_at: new Date().toISOString() })
        .in("id", ids);

      if (error) {
        console.error("Error marking notifications as read:", error);
        return NextResponse.json({ error: "Update failed" }, { status: 500 });
      }
    } else {
      // Mark all as read
      let query = supabaseAdmin
        .from("notifications")
        .update({ is_read: true, read_at: new Date().toISOString() })
        .eq("is_read", false);

      if (!isSuperadmin && profile?.id) {
        query = query.eq("user_id", profile.id);
      }

      const { error } = await query;

      if (error) {
        console.error("Error marking all notifications as read:", error);
        return NextResponse.json({ error: "Update failed" }, { status: 500 });
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("POST /api/notifications/read error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
