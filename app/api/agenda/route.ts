// ============================================================================
// Agenda API - Enhanced with Activity Logging
// ============================================================================

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { supabaseAdmin } from "@/app/lib/supabase";

/**
 * Log activity helper
 */
async function logActivity(
  userId: string,
  userName: string,
  action: string,
  entityType: string,
  entityId: string,
  oldData: any,
  newData: any,
  description: string
) {
  const { error } = await supabaseAdmin.from("activity_logs").insert({
    user_id: userId,
    user_name: userName,
    action: action,
    entity_type: entityType,
    entity_id: entityId,
    old_data: oldData,
    new_data: newData,
    description: description,
  });

  if (error) {
    console.error("Error logging activity:", error);
  }

  return !error;
}

/**
 * GET /api/agenda
 * Get agenda list with filters
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
    const jenis = searchParams.get("jenis");
    const sub_jenis = searchParams.get("sub_jenis");
    const search = searchParams.get("search");
    const upcoming = searchParams.get("upcoming") === "true";
    const date = searchParams.get("date");
    const status = searchParams.get("status");
    const today = searchParams.get("today") === "true";
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");

    let query = supabaseAdmin
      .from("agenda")
      .select(`
        *,
        creator:profiles!agenda_created_by_fkey(id, name, role)
      `, { count: "exact" })
      .is("deleted_at", null)
      .order("date", { ascending: true })
      .order("time_start", { ascending: true })
      .range(offset, offset + limit - 1);

    // Filter by date range (for share feature)
    if (startDate && endDate) {
      query = query.gte("date", startDate).lte("date", endDate);
    } else if (startDate) {
      query = query.eq("date", startDate);
    }

    // Filter by jenis (kegiatan/audiensi) - convert to DB enum
    if (jenis) {
      const dbJenis = jenis === "kegiatan" ? "agenda" : jenis;
      query = query.eq("jenis", dbJenis);
    }

    // Search by title
    if (search) {
      query = query.ilike("title", `%${search}%`);
    }

    // Filter upcoming (date >= today, not finished)
    if (upcoming) {
      const now = new Date();
      const currentTime = now.toTimeString().slice(0, 5);
      const todayDate = now.toISOString().split("T")[0];

      query = query
        .eq("status", "published")
        .or(`date.gt.${todayDate},and(date.eq.${todayDate},time_end.gt.${currentTime})`);
    }

    // Filter by specific date
    if (date) {
      query = query.eq("date", date);
    }

    // Filter by status
    if (status) {
      query = query.eq("status", status);
    }

    // Today's agenda for dashboard widget
    if (today) {
      const now = new Date();
      const currentTime = now.toTimeString().slice(0, 5);
      const todayDate = now.toISOString().split("T")[0];

      query = query
        .eq("date", todayDate)
        .or(`time_end.gt.${currentTime},and(date.gt.${todayDate})`)
        .eq("status", "published")
        .order("date", { ascending: true })
        .order("time_start", { ascending: true });
    }

    const { data, error, count } = await query;

    if (error) {
      console.error("Error fetching agenda:", error);
      return NextResponse.json({ error: "Database error" }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      data: data || [],
      count: count || 0,
    });
  } catch (error) {
    console.error("GET /api/agenda error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

/**
 * POST /api/agenda
 * Create new agenda
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

    const body = await request.json();
    const {
      jenis,
      sub_jenis,
      title,
      description,
      date,
      time_start,
      time_end,
      location,
      pic_name,
      pic_phone,
      participants_count,
      dresscode,
      attachments,
      notes,
      status = "draft",
    } = body;

    // Validate required fields
    if (!jenis || !title || !date || !time_start || !time_end) {
      return NextResponse.json(
        { error: "Field wajib: jenis, title, date, time_start, time_end" },
        { status: 400 }
      );
    }

    // Validate jenis
    if (!["kegiatan", "audiensi"].includes(jenis)) {
      return NextResponse.json(
        { error: "jenis harus 'kegiatan' atau 'audiensi'" },
        { status: 400 }
      );
    }

    // Convert frontend jenis to DB enum
    const dbJenis = jenis === "kegiatan" ? "agenda" : jenis;

    // Create agenda
    const { data: newAgenda, error } = await supabaseAdmin
      .from("agenda")
      .insert({
        jenis: dbJenis,
        title,
        description: description || null,
        date,
        time_start,
        time_end,
        location: location || null,
        target_audience: body.target_audience || null,
        status,
        created_by: profile.id,
      })
      .select(`
        *,
        creator:profiles!agenda_created_by_fkey(id, name)
      `)
      .single();

    if (error) {
      console.error("Error creating agenda:", error);
      return NextResponse.json({ error: "Creation failed: " + error.message }, { status: 500 });
    }

    // Log activity
    await logActivity(
      profile.id,
      profile.name || session.user.name,
      "create",
      "agenda",
      newAgenda.id,
      null,
      newAgenda,
      `${profile.name} membuat ${jenis === "kegiatan" ? "kegiatan" : "audiensi"}: ${title}`
    );

    // Create notification for superadmin if published
    if (status === "published") {
      const { data: superadmins } = await supabaseAdmin
        .from("profiles")
        .select("id")
        .eq("role", "superadmin");

      if (superadmins && superadmins.length > 0) {
        const notifications = superadmins.map((sa: any) => ({
          user_id: sa.id,
          type: "agenda_created",
          title: `${jenis === "kegiatan" ? "Kegiatan" : "Audiensi"} Baru: ${title}`,
          message: `Dibuat oleh ${profile.name}`,
          data: { agenda_id: newAgenda.id, jenis },
        }));

        await supabaseAdmin.from("notifications").insert(notifications);
      }
    }

    return NextResponse.json({
      success: true,
      data: newAgenda,
      message: `${jenis === "kegiatan" ? "Kegiatan" : "Audiensi"} berhasil dibuat`,
    });
  } catch (error) {
    console.error("POST /api/agenda error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
