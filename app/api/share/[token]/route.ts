import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/app/lib/supabase";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params;

    // Find share link
    const { data: shareLink, error: shareError } = await supabaseAdmin
      .from("share_links")
      .select("*")
      .eq("token", token)
      .eq("status", "active")
      .single();

    if (shareError || !shareLink) {
      return NextResponse.json({ success: false, error: "Link tidak ditemukan" }, { status: 404 });
    }

    // Check expiration
    if (shareLink.expires_at && new Date(shareLink.expires_at) < new Date()) {
      return NextResponse.json({ success: false, error: "Link sudah kadaluarsa" }, { status: 410 });
    }

    // Update view count
    await supabaseAdmin
      .from("share_links")
      .update({ view_count: (shareLink.view_count || 0) + 1, last_viewed_at: new Date().toISOString() })
      .eq("id", shareLink.id);

    // Fetch agendas based on share link criteria
    let query = supabaseAdmin
      .from("agenda")
      .select("id, jenis, title, date, time_start, time_end, location")
      .gte("date", shareLink.start_date)
      .lte("date", shareLink.end_date)
      .order("date")
      .order("time_start");

    if (shareLink.jenis && shareLink.jenis !== "all") {
      query = query.eq("jenis", shareLink.jenis);
    }

    const { data: agendas, error: agendaError } = await query;

    if (agendaError) {
      console.error("Error fetching agendas:", agendaError);
      return NextResponse.json({ success: false, error: agendaError.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, agendas: agendas || [] });
  } catch (error) {
    console.error("Error in share/[token] API:", error);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}
