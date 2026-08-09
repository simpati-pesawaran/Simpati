import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { supabaseAdmin } from "@/app/lib/supabase";

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const userId = (session.user as any).userId;
    const profile = (session.user as any)?.profile;
    if (!userId) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const { jenis, startDate, endDate } = await request.json();

    // Generate unique token
    const token = `${Date.now()}-${Math.random().toString(36).substring(2, 15)}`;

    const { data, error } = await supabaseAdmin
      .from("share_links")
      .insert({
        token,
        created_by: userId,
        jenis: jenis || "all",
        start_date: startDate,
        end_date: endDate,
        status: "active",
      })
      .select()
      .single();

    if (error) {
      console.error("Error creating share link:", error);
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    // Log activity
    await supabaseAdmin.from("activity_logs").insert({
      user_id: userId,
      user_name: profile?.name || session.user.name,
      user_email: session.user.email,
      action: "share",
      entity_type: "share",
      entity_id: data.id,
      description: `Membuat link publik untuk ${jenis === "all" ? "semua agenda" : jenis}`,
    });

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://simpati-silk.vercel.app";
    const url = `${baseUrl}/jadwal/${token}`;

    return NextResponse.json({ success: true, token, url });
  } catch (error) {
    console.error("Error in share API:", error);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}
