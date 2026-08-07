// ============================================================================
// Usulan API - Usulan Kegiatan/Audiensi
// ============================================================================

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { supabaseAdmin } from "@/app/lib/supabase";

/**
 * GET /api/usulan
 * Get usulan list
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
      .select("*")
      .order("date_proposed", { ascending: false });

    // Filter by status
    const status = searchParams.get("status");
    if (status && status !== "all") {
      query = query.eq("status", status);
    }

    // Filter by user (for non-admin)
    const isMy = searchParams.get("my");
    if (isMy === "true" && profile) {
      query = query.eq("submitted_by", profile.id);
    }

    const { data, error } = await query;

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error("GET /api/usulan error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

/**
 * POST /api/usulan
 * Submit new usulan (any authenticated user)
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
    const { title, description, jenis, location } = body;

    if (!title || !jenis) {
      return NextResponse.json({ error: "Title and jenis required" }, { status: 400 });
    }

    const { data, error } = await supabaseAdmin
      .from("usulan")
      .insert({
        title,
        description: description || null,
        jenis,
        location: location || null,
        status: "pending",
        submitted_by: profile.id,
        submitter_name: profile.name,
        date_proposed: new Date().toISOString(),
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
      action: "submit",
      entity_type: "usulan",
      entity_id: data.id,
      description: `Mengusulkan ${jenis}: "${title}"`,
    });

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error("POST /api/usulan error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

/**
 * PUT /api/usulan
 * Approve or reject usulan (admin only)
 */
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const profile = (session.user as any)?.profile;

    if (!profile || profile.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    const action = searchParams.get("action");

    if (!id) {
      return NextResponse.json({ error: "ID required" }, { status: 400 });
    }

    // Get existing usulan
    const { data: existing } = await supabaseAdmin
      .from("usulan")
      .select("*")
      .eq("id", id)
      .single();

    if (!existing) {
      return NextResponse.json({ error: "Usulan not found" }, { status: 404 });
    }

    let updateData: any = {
      reviewed_by: profile.id,
      reviewed_at: new Date().toISOString(),
    };

    if (action === "approve") {
      updateData.status = "approved";
    } else if (action === "reject") {
      const body = await request.json();
      updateData.status = "rejected";
      updateData.rejection_reason = body.reason || "Tidak disebutkan";
    } else {
      return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }

    const { data, error } = await supabaseAdmin
      .from("usulan")
      .update(updateData)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Log activity
    await supabaseAdmin.from("activity_logs").insert({
      user_id: profile.id,
      user_name: profile.name,
      action: action === "approve" ? "approve" : "reject",
      entity_type: "usulan",
      entity_id: id,
      description: `${action === "approve" ? "Menyetujui" : "Menolak"} usulan: "${existing.title}"`,
    });

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error("PUT /api/usulan error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
