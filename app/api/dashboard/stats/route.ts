// ============================================================================
// Dashboard Stats API
// ============================================================================

import { NextResponse } from 'next/server';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { supabaseAdmin } from "@/app/lib/supabase";

/**
 * GET /api/dashboard/stats
 * Get dashboard statistics
 */
export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get agenda stats
    const { data: agendaData, error: agendaError } = await supabaseAdmin
      .from("agenda")
      .select("jenis, status, date")
      .is("deleted_at", null);

    if (agendaError) {
      console.error("Error fetching agenda stats:", agendaError);
      return NextResponse.json({ error: "Database error" }, { status: 500 });
    }

    const today = new Date().toISOString().split("T")[0];

    const stats = {
      total: agendaData?.length || 0,
      total_kegiatan: agendaData?.filter((a) => a.jenis === "agenda").length || 0,
      total_audiensi: agendaData?.filter((a) => a.jenis === "audiensi").length || 0,
      upcoming: agendaData?.filter((a) => a.date >= today && a.status === "published")
        .length || 0,
    };

    return NextResponse.json({
      success: true,
      stats,
    });
  } catch (error) {
    console.error("GET /api/dashboard/stats error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
