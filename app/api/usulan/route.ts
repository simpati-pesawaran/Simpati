// ============================================================================
// Usulan API - Enhanced with more fields
// ============================================================================

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { supabaseAdmin } from "@/app/lib/supabase";

/**
 * GET /api/usulan
 * Get all usulan with filters
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const profile = (session.user as any)?.profile;
    const { searchParams } = new URL(request.url);

    let query = supabaseAdmin
      .from("usulan")
      .select("*", { count: "exact" })
      .order("date_proposed_system", { ascending: false });

    // Filter by status
    const status = searchParams.get("status");
    if (status && status !== "all") {
      if (status === "pending_approved_rejected") {
        query = query.in("status", ["pending", "approved", "rejected"]);
      } else {
        query = query.eq("status", status);
      }
    }

    // Search
    const search = searchParams.get("search");
    if (search) {
      query = query.or(`title.ilike.%${search}%,submitter_name.ilike.%${search}%`);
    }

    // Date filter
    const dateFrom = searchParams.get("date_from");
    const dateTo = searchParams.get("date_to");
    if (dateFrom) {
      query = query.gte("date_proposed_system", dateFrom);
    }
    if (dateTo) {
      query = query.lte("date_proposed_system", dateTo);
    }

    // Limit
    const limit = parseInt(searchParams.get("limit") || "50");
    const offset = parseInt(searchParams.get("offset") || "0");
    query = query.range(offset, offset + limit - 1);

    const { data, error, count } = await query;

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Get pending count
    const { count: pendingCount } = await supabaseAdmin
      .from("usulan")
      .select("*", { count: "exact", head: true })
      .eq("status", "pending");

    return NextResponse.json({
      success: true,
      data: data || [],
      count: count || 0,
      pending_count: pendingCount || 0
    });

  } catch (error) {
    console.error("GET /api/usulan error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

/**
 * POST /api/usulan
 * Submit new usulan (authenticated users only)
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const profile = (session.user as any)?.profile;

    if (!profile) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }

    const body = await request.json();
    const {
      title,
      description,
      jenis,
      location,
      category,
      date_proposed,
      time_proposed,
      submitter_name,
      submitter_phone,
    } = body;

    if (!title || !jenis) {
      return NextResponse.json(
        { error: "Judul dan jenis wajib diisi" },
        { status: 400 }
      );
    }

    const { data, error } = await supabaseAdmin
      .from("usulan")
      .insert({
        title,
        description: description || null,
        jenis,
        location: location || null,
        category: category || null,
        date_proposed: date_proposed || null,
        time_proposed: time_proposed || null,
        status: "pending",
        submitted_by: profile.id,
        submitter_name: submitter_name || profile.name,
        submitter_phone: submitter_phone || null,
        date_proposed_system: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Log activity
    await supabaseAdmin.from("activity_logs").insert({
      user_id: profile.id,
      user_name: profile.name,
      user_email: profile.email,
      action: "create",
      entity_type: "usulan",
      entity_id: data.id,
      description: `Mengusulkan ${jenis}: "${title}"`,
    });

    return NextResponse.json({
      success: true,
      message: "Usulan berhasil diajukan",
      data
    });

  } catch (error) {
    console.error("POST /api/usulan error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
