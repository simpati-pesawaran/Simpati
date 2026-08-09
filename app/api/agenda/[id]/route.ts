// ============================================================================
// Agenda Detail API - GET, PUT, DELETE
// ============================================================================

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { supabaseAdmin } from "@/app/lib/supabase";

interface RouteParams {
  params: Promise<{ id: string }>;
}

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
 * GET /api/agenda/[id]
 * Get single agenda by ID
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const { data, error } = await supabaseAdmin
      .from("agenda")
      .select(`
        *,
        creator:profiles!agenda_created_by_fkey(id, name, role)
      `)
      .eq("id", id)
      .is("deleted_at", null)
      .single();

    if (error || !data) {
      return NextResponse.json({ error: "Agenda tidak ditemukan" }, { status: 404 });
    }

    // Log view activity
    const profile = (session.user as any)?.profile;
    await logActivity(
      profile?.id || "unknown",
      profile?.name || session.user.name,
      "view",
      "agenda",
      id,
      null,
      data,
      `${profile?.name || session.user.name} melihat ${data.jenis}: ${data.title}`
    );

    return NextResponse.json({
      success: true,
      data,
    });
  } catch (error) {
    console.error("GET /api/agenda/[id] error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

/**
 * PUT /api/agenda/[id]
 * Update agenda
 */
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const profile = (session.user as any)?.profile;

    if (!profile || profile.status !== "approved") {
      return NextResponse.json({ error: "Not approved" }, { status: 403 });
    }

    const { id } = await params;

    // Get existing agenda
    const { data: existing, error: fetchError } = await supabaseAdmin
      .from("agenda")
      .select("*")
      .eq("id", id)
      .is("deleted_at", null)
      .single();

    if (fetchError || !existing) {
      return NextResponse.json({ error: "Agenda tidak ditemukan" }, { status: 404 });
    }

    // Check permission: creator or superadmin can edit
    const isCreator = existing.created_by === profile.id;
    const isSuperadmin = profile.role === "superadmin";

    if (!isCreator && !isSuperadmin) {
      return NextResponse.json({ error: "Tidak punya akses untuk edit" }, { status: 403 });
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
      status,
    } = body;

    // Build update object
    const updateData: any = {};
    if (jenis !== undefined) updateData.jenis = jenis;
    if (title !== undefined) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    if (date !== undefined) updateData.date = date;
    if (time_start !== undefined) updateData.time_start = time_start;
    if (time_end !== undefined) updateData.time_end = time_end;
    if (location !== undefined) updateData.location = location;
    if (status !== undefined) updateData.status = status;

    // Add updated_by and updated_at
    updateData.updated_by = profile.id;
    updateData.updated_at = new Date().toISOString();

    // Update agenda
    const { data: updated, error: updateError } = await supabaseAdmin
      .from("agenda")
      .update(updateData)
      .eq("id", id)
      .select(`
        *,
        creator:profiles!agenda_created_by_fkey(id, name)
      `)
      .single();

    if (updateError) {
      console.error("Error updating agenda:", updateError);
      return NextResponse.json({ error: "Update failed: " + updateError.message }, { status: 500 });
    }

    // Log activity with detailed change tracking
    const changeDetails = getChangeDetails(existing, updated);
    await logActivity(
      profile.id,
      profile.name || session.user.name,
      getActionFromStatus(status, existing.status),
      existing.jenis === "audiensi" ? "audiensi" : "agenda",
      id,
      existing,
      updated,
      `${profile.name} ${getActionVerb(status, existing.status)} ${existing.jenis}: ${existing.title}${changeDetails}`
    );

    // Create notification for superadmin if published
    if (status === "published" && existing.status !== "published") {
      const { data: superadmins } = await supabaseAdmin
        .from("profiles")
        .select("id")
        .eq("role", "superadmin");

      if (superadmins && superadmins.length > 0) {
        const notifications = superadmins.map((sa: any) => ({
          user_id: sa.id,
          type: "agenda_updated",
          title: `${jenis === "kegiatan" ? "Kegiatan" : "Audiensi"} Dipublikasi: ${title}`,
          message: `Diupdate oleh ${profile.name}`,
          data: { agenda_id: id, jenis },
        }));

        await supabaseAdmin.from("notifications").insert(notifications);
      }
    }

    return NextResponse.json({
      success: true,
      data: updated,
      message: `${existing.jenis === "kegiatan" ? "Kegiatan" : "Audiensi"} berhasil diupdate`,
    });
  } catch (error) {
    console.error("PUT /api/agenda/[id] error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

/**
 * DELETE /api/agenda/[id]
 * Soft delete agenda
 */
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const profile = (session.user as any)?.profile;

    if (!profile || profile.status !== "approved") {
      return NextResponse.json({ error: "Not approved" }, { status: 403 });
    }

    const { id } = await params;

    // Get existing agenda
    const { data: existing, error: fetchError } = await supabaseAdmin
      .from("agenda")
      .select("*")
      .eq("id", id)
      .is("deleted_at", null)
      .single();

    if (fetchError || !existing) {
      return NextResponse.json({ error: "Agenda tidak ditemukan" }, { status: 404 });
    }

    // Check permission: creator or superadmin can delete
    const isCreator = existing.created_by === profile.id;
    const isSuperadmin = profile.role === "superadmin";

    if (!isCreator && !isSuperadmin) {
      return NextResponse.json({ error: "Tidak punya akses untuk hapus" }, { status: 403 });
    }

    // Soft delete
    const { error: deleteError } = await supabaseAdmin
      .from("agenda")
      .update({
        deleted_at: new Date().toISOString(),
      })
      .eq("id", id);

    if (deleteError) {
      console.error("Error deleting agenda:", deleteError);
      return NextResponse.json({ error: "Delete failed: " + deleteError.message }, { status: 500 });
    }

    // Log activity
    await logActivity(
      profile.id,
      profile.name || session.user.name,
      "delete",
      "agenda",
      id,
      existing,
      null,
      `${profile.name} menghapus ${existing.jenis}: ${existing.title}`
    );

    return NextResponse.json({
      success: true,
      message: `${existing.jenis === "kegiatan" ? "Kegiatan" : "Audiensi"} berhasil dihapus`,
    });
  } catch (error) {
    console.error("DELETE /api/agenda/[id] error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

/**
 * Helper function to determine action type from status change
 */
function getActionFromStatus(newStatus: string, oldStatus: string): string {
  if (newStatus === "published" && oldStatus === "draft") return "publish";
  if (newStatus === "published" && oldStatus === "cancelled") return "publish";
  if (newStatus === "cancelled") return "cancel";
  return "update";
}

/**
 * Helper function to get action verb in Indonesian
 */
function getActionVerb(newStatus: string, oldStatus: string): string {
  if (newStatus === "published" && oldStatus === "draft") return "mempublikasikan";
  if (newStatus === "published" && oldStatus === "cancelled") return "mengaktifkan kembali";
  if (newStatus === "cancelled") return "membatalkan";
  return "mengedit";
}

/**
 * Helper function to get detailed change description
 */
function getChangeDetails(oldData: any, newData: any): string {
  const changes: string[] = [];

  if (oldData.date !== newData.date) {
    changes.push(`tanggal: ${oldData.date} → ${newData.date}`);
  }
  if (oldData.time_start !== newData.time_start) {
    changes.push(`waktu mulai: ${oldData.time_start} → ${newData.time_start}`);
  }
  if (oldData.time_end !== newData.time_end) {
    changes.push(`waktu selesai: ${oldData.time_end} → ${newData.time_end}`);
  }
  if (oldData.location !== newData.location) {
    changes.push(`lokasi: ${oldData.location || '-'} → ${newData.location || '-'}`);
  }
  if (oldData.pic_name !== newData.pic_name) {
    changes.push(`PIC: ${oldData.pic_name || '-'} → ${newData.pic_name || '-'}`);
  }
  if (oldData.pic_phone !== newData.pic_phone) {
    changes.push(`no. PIC berubah`);
  }
  if (oldData.status !== newData.status) {
    changes.push(`status: ${oldData.status} → ${newData.status}`);
  }

  if (changes.length === 0) return "";
  return ` (${changes.join(", ")})`;
}
