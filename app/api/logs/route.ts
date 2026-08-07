// ============================================================================
// Activity Logs API
// ============================================================================

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { supabaseAdmin } from "@/app/lib/supabase";

/**
 * GET /api/logs
 * Get activity logs with filters
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const profile = (session.user as any)?.profile;

    // Only superadmin and approved users can view logs
    if (!profile || profile.status !== "approved") {
      return NextResponse.json({ error: "Not authorized" }, { status: 403 });
    }

    const searchParams = request.nextUrl.searchParams;
    const limit = parseInt(searchParams.get("limit") || "20");
    const page = parseInt(searchParams.get("page") || "1");
    const offset = (page - 1) * limit;
    const entityType = searchParams.get("entity_type");
    const action = searchParams.get("action");
    const userId = searchParams.get("user_id");
    const search = searchParams.get("search");
    const dateFrom = searchParams.get("date_from");
    const dateTo = searchParams.get("date_to");

    let query = supabaseAdmin
      .from("activity_logs")
      .select("*", { count: "exact" })
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);

    // Filter by entity type
    if (entityType) {
      query = query.eq("entity_type", entityType);
    }

    // Filter by action
    if (action) {
      query = query.eq("action", action);
    }

    // Filter by user
    if (userId) {
      query = query.eq("user_id", userId);
    }

    // Search in description
    if (search) {
      query = query.ilike("description", `%${search}%`);
    }

    // Filter by date range
    if (dateFrom) {
      query = query.gte("created_at", dateFrom);
    }
    if (dateTo) {
      // Add one day to include the entire day
      const nextDay = new Date(dateTo);
      nextDay.setDate(nextDay.getDate() + 1);
      query = query.lt("created_at", nextDay.toISOString());
    }

    const { data, error, count } = await query;

    if (error) {
      console.error("Error fetching logs:", error);
      return NextResponse.json({ error: "Database error" }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      data: data || [],
      count: count || 0,
    });
  } catch (error) {
    console.error("GET /api/logs error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
