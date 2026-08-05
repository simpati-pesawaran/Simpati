// ============================================================================
// Agenda API
// ============================================================================

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { supabaseAdmin } from "@/app/lib/supabase";

/**
 * GET /api/agenda
 * Get agenda list
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
    const upcoming = searchParams.get("upcoming") === "true";

    let query = supabaseAdmin
      .from("agenda")
      .select("*", { count: "exact" })
      .is("deleted_at", null)
      .order("date", { ascending: !upcoming })
      .range(offset, offset + limit - 1);

    // Filter by jenis
    if (jenis && (jenis === "agenda" || jenis === "audiensi")) {
      query = query.eq("jenis", jenis);
    }

    // Filter upcoming (date >= today and published)
    if (upcoming) {
      const today = new Date().toISOString().split("T")[0];
      query = query.eq("status", "published").gte("date", today);
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
      title,
      description,
      date,
      time_start,
      time_end,
      location,
      category,
      target_audience,
      status = "draft",
    } = body;

    // Validate required fields
    if (!jenis || !title || !date || !time_start || !time_end) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Check for time collision
    const { data: collision } = await supabaseAdmin.rpc(
      "check_agenda_collision",
      {
        p_date: date,
        p_time_start: time_start,
        p_time_end: time_end,
      }
    );

    if (collision) {
      return NextResponse.json(
        { error: "Terjadi bentrokan jadwal dengan agenda lain" },
        { status: 400 }
      );
    }

    // Create agenda
    const { data: newAgenda, error } = await supabaseAdmin
      .from("agenda")
      .insert({
        jenis,
        title,
        description,
        date,
        time_start,
        time_end,
        location,
        category,
        target_audience,
        status,
        created_by: profile.id,
      })
      .select()
      .single();

    if (error) {
      console.error("Error creating agenda:", error);
      return NextResponse.json({ error: "Creation failed" }, { status: 500 });
    }

    // Create notification for superadmin if published
    if (status === "published") {
      const { data: superadmin } = await supabaseAdmin
        .from("profiles")
        .select("id")
        .eq("role", "superadmin")
        .single();

      if (superadmin) {
        await supabaseAdmin.from("notifications").insert({
          user_id: superadmin.id,
          type: "agenda_created",
          title: `Agenda Baru: ${title}`,
          message: `Agenda ${jenis === "agenda" ? "kegiatan" : "audiensi"} baru telah dibuat`,
          data: { agenda_id: newAgenda.id },
        });
      }
    }

    return NextResponse.json({
      success: true,
      data: newAgenda,
    });
  } catch (error) {
    console.error("POST /api/agenda error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
