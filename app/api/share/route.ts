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
    if (!userId) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const { jenis, startDate, endDate } = await request.json();

    // Generate unique token
    const token = `${Date.now()}-${Math.random().toString(36).substring(2, 15)}`;

    const { error } = await supabaseAdmin
      .from("share_links")
      .insert({
        token,
        created_by: userId,
        jenis: jenis || "all",
        start_date: startDate,
        end_date: endDate,
        status: "active",
      });

    if (error) {
      console.error("Error creating share link:", error);
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://simpati.sragency.online";
    const url = `${baseUrl}/jadwal/${token}`;

    return NextResponse.json({ success: true, token, url });
  } catch (error) {
    console.error("Error in share API:", error);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}
