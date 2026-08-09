// ============================================================================
// Public Usulan API - Submit Usulan without authentication
// ============================================================================

import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from "@/app/lib/supabase";

/**
 * Log activity helper
 */
async function logPublicActivity(
  userName: string,
  userEmail: string,
  action: string,
  entityType: string,
  entityId: string,
  description: string,
  oldData: any = null,
  newData: any = null
) {
  const { error } = await supabaseAdmin.from("activity_logs").insert({
    user_id: "public",
    user_name: userName,
    user_email: userEmail,
    action: action,
    entity_type: entityType,
    entity_id: entityId,
    description: description,
    old_data: oldData,
    new_data: newData,
  });

  if (error) {
    console.error("Error logging public activity:", error);
  }

  return !error;
}

/**
 * POST /api/usulan/public
 * Submit new usulan from public (no auth required)
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      name,
      phone,
      title,
      category,
      date_proposed,
      time_proposed,
      location,
      description,
      jenis = "kegiatan"
    } = body;

    // Validate required fields
    if (!name || !phone || !title || !jenis) {
      return NextResponse.json(
        { error: "Nama, nomor WhatsApp, judul, dan jenis wajib diisi" },
        { status: 400 }
      );
    }

    // Validate phone format (Indonesian)
    const phoneRegex = /^(?:\+62|62|0)[0-9]{9,12}$/;
    if (!phoneRegex.test(phone.replace(/[\s-]/g, ''))) {
      return NextResponse.json(
        { error: "Format nomor WhatsApp tidak valid" },
        { status: 400 }
      );
    }

    // Insert into database
    const { data, error } = await supabaseAdmin
      .from("usulan")
      .insert({
        title,
        description: description || null,
        jenis: jenis,
        location: location || null,
        status: "pending",
        // Public submitter data
        submitter_name: name,
        submitter_phone: phone,
        category: category || null,
        date_proposed: date_proposed || null,
        time_proposed: time_proposed || null,
        // System fields
        date_proposed_system: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      console.error("Error creating public usulan:", error);
      return NextResponse.json(
        { error: "Gagal mengirim usulan. Silakan coba lagi." },
        { status: 500 }
      );
    }

    // Log public submission
    await logPublicActivity(
      name,
      phone,
      "submit",
      "usulan",
      data.id,
      `Mengajukan usulan: "${title}" (${jenis === "kegiatan" ? "Kegiatan" : "Audiensi"})`
    );

    // Send notification to superadmins
    try {
      const { data: superadmins } = await supabaseAdmin
        .from("profiles")
        .select("id, name")
        .eq("role", "superadmin")
        .eq("status", "approved");

      if (superadmins && superadmins.length > 0) {
        const notifications = superadmins.map((admin: any) => ({
          user_id: admin.id,
          type: "usulan_new",
          title: "Usulan Baru",
          message: `${name} mengajukan usulan "${title}"`,
          data: {
            usulan_id: data.id,
            submitter_name: name,
            submitter_phone: phone,
            jenis: jenis,
          },
        }));

        await supabaseAdmin.from("notifications").insert(notifications);
      }
    } catch (notifError) {
      console.error("Error sending notifications:", notifError);
      // Don't fail the submission if notification fails
    }

    return NextResponse.json({
      success: true,
      message: "Usulan berhasil diajukan. Tim kami akan meninjau proposal Anda.",
      data: {
        id: data.id,
        title: data.title,
      }
    });

  } catch (error) {
    console.error("POST /api/usulan/public error:", error);
    return NextResponse.json(
      { error: "Terjadi kesalahan server" },
      { status: 500 }
    );
  }
}
