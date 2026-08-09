// ============================================================================
// Usulan Actions API - Approve, Reject, Reschedule with History
// ============================================================================

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { supabaseAdmin } from "@/app/lib/supabase";

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * GET /api/usulan/[id]
 * Get single usulan with history
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    // Get usulan
    const { data: usulan, error } = await supabaseAdmin
      .from("usulan")
      .select("*")
      .eq("id", id)
      .single();

    if (error || !usulan) {
      return NextResponse.json({ error: "Usulan tidak ditemukan" }, { status: 404 });
    }

    // Get history
    const { data: history } = await supabaseAdmin
      .from("usulan_history")
      .select("*")
      .eq("usulan_id", id)
      .order("created_at", { ascending: true });

    return NextResponse.json({
      success: true,
      data: {
        ...usulan,
        history: history || []
      }
    });

  } catch (error) {
    console.error("GET /api/usulan/[id] error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

/**
 * PUT /api/usulan/[id]
 * Approve, Reject, or Reschedule
 */
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const profile = (session.user as any)?.profile;

    if (!profile || profile.role !== "superadmin") {
      return NextResponse.json({ error: "Hanya superadmin yang dapat memproses usulan" }, { status: 403 });
    }

    const { id } = await params;
    const body = await request.json();
    const { action, reason, new_date, new_time, new_location } = body;

    // Get existing
    const { data: existing } = await supabaseAdmin
      .from("usulan")
      .select("*")
      .eq("id", id)
      .single();

    if (!existing) {
      return NextResponse.json({ error: "Usulan tidak ditemukan" }, { status: 404 });
    }

    const oldStatus = existing.status;
    let newStatus = oldStatus;
    let statusLabel = "";
    let notificationMessage = "";

    // Determine new status and message
    switch (action) {
      case "approve":
        newStatus = "approved";
        statusLabel = "Disetujui";
        notificationMessage = `Halo ${existing.submitter_name}, usulan agenda "${existing.title}" telah disetujui.\n\nJadwal: ${existing.date_proposed || ' Akan diinfokan lebih lanjut'}\nWaktu: ${existing.time_proposed || ' - '}\nLokasi: ${existing.location || ' - '}\n\nTerima kasih atas partisipasi Anda!`;
        break;

      case "reject":
        newStatus = "rejected";
        statusLabel = "Ditolak";
        notificationMessage = `Halo ${existing.submitter_name}, terima kasih atas partisipasi Anda.\n\nUsulan "${existing.title}" belum dapat kami setujui pada kesempatan ini.\n\n${reason ? `Keterangan: ${reason}` : ""}\n\nSilakan hubungi kami jika ada pertanyaan.`;
        break;

      case "reschedule":
        newStatus = "rescheduled";
        statusLabel = "Dijadwalkan Ulang";
        notificationMessage = `Halo ${existing.submitter_name}, usulan "${existing.title}" telah dijadwalkan ulang.\n\nJadwal baru: ${new_date || existing.date_proposed}\nWaktu baru: ${new_time || existing.time_proposed}\nLokasi: ${new_location || existing.location || ' - '}\n\nTerima kasih atas kesabarannya!`;
        break;

      default:
        return NextResponse.json({ error: "Aksi tidak valid" }, { status: 400 });
    }

    // Update status
    const updateData: any = {
      status: newStatus,
      reviewed_by: profile.id,
      reviewed_at: new Date().toISOString(),
    };

    if (action === "reject") {
      updateData.rejection_reason = reason || "Tidak disebutkan";
    }

    if (action === "reschedule") {
      if (new_date) updateData.date_proposed = new_date;
      if (new_time) updateData.time_proposed = new_time;
      if (new_location) updateData.location = new_location;
    }

    const { data: updated, error: updateError } = await supabaseAdmin
      .from("usulan")
      .update(updateData)
      .eq("id", id)
      .select()
      .single();

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 500 });
    }

    // Add to history
    await supabaseAdmin.from("usulan_history").insert({
      usulan_id: id,
      action: action,
      old_status: oldStatus,
      new_status: newStatus,
      performed_by: profile.id,
      performed_by_name: profile.name,
      reason: reason || null,
      new_date: new_date || null,
      new_time: new_time || null,
      new_location: new_location || null,
    });

    // Log activity
    await supabaseAdmin.from("activity_logs").insert({
      user_id: profile.id,
      user_name: profile.name,
      user_email: profile.email,
      action: action,
      entity_type: "usulan",
      entity_id: id,
      description: `${profile.name} ${action === 'approve' ? 'menyetujui' : action === 'reject' ? 'menolak' : 'menjadwalkan ulang'} usulan: "${existing.title}"`,
    });

    // Generate WhatsApp link
    let whatsappLink = "";
    if (updated.submitter_phone) {
      const cleanPhone = updated.submitter_phone.replace(/[\s-]/g, '').replace(/^0/, '62');
      const encodedMessage = encodeURIComponent(notificationMessage);
      whatsappLink = `https://wa.me/${cleanPhone}?text=${encodedMessage}`;
    }

    return NextResponse.json({
      success: true,
      message: `Usulan berhasil ${action === 'approve' ? 'disetujui' : action === 'reject' ? 'ditolak' : 'dijadwalkan ulang'}`,
      data: updated,
      whatsapp: {
        phone: updated.submitter_phone,
        message: notificationMessage,
        link: whatsappLink
      }
    });

  } catch (error) {
    console.error("PUT /api/usulan/[id] error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
