// ============================================================================
// Gallery API - Dokumentasi & Arsip Digital
// ============================================================================

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { supabaseAdmin } from "@/app/lib/supabase";
import { createClient } from '@supabase/supabase-js';

/**
 * GET /api/gallery
 * Get gallery items by category
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const category = searchParams.get('category') || 'dokumentasi';

    const { data, error } = await supabaseAdmin
      .from("gallery")
      .select("*")
      .eq("category", category)
      .order("created_at", { ascending: false });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Transform data to include image_url from storage
    const transformedData = data?.map((item: any) => ({
      ...item,
      image_url: item.storage_path
        ? `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/${item.storage_bucket}/${item.storage_path}`
        : null,
    })) || [];

    return NextResponse.json({ success: true, data: transformedData });
  } catch (error) {
    console.error("GET /api/gallery error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

/**
 * POST /api/gallery
 * Upload new gallery item (Admin only)
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const profile = (session.user as any)?.profile;

    if (!profile || profile.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const formData = await request.formData();
    const file = formData.get("file") as File;
    const title = formData.get("title") as string;
    const description = formData.get("description") as string;
    const category = formData.get("category") as string;

    if (!file || !title) {
      return NextResponse.json({ error: "File and title required" }, { status: 400 });
    }

    // Upload image to Supabase Storage
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
    const supabase = createClient(supabaseUrl, supabaseAnonKey);
    const fileBuffer = await file.arrayBuffer();
    const fileName = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, "_")}`;

    const { error: uploadError } = await supabase.storage
      .from("gallery")
      .upload(fileName, fileBuffer, {
        contentType: file.type,
        upsert: false,
      });

    if (uploadError) {
      console.error("Upload error:", uploadError);
      return NextResponse.json({ error: "Gagal upload gambar" }, { status: 500 });
    }

    // Get public URL
    const imageUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/gallery/${fileName}`;

    // Insert to database - use existing schema columns
    const { data, error } = await supabaseAdmin
      .from("gallery")
      .insert({
        title,
        description: description || null,
        category: category || "dokumentasi",
        file_type: "image",
        file_name: file.name,
        storage_path: fileName,
        storage_bucket: "gallery",
        mime_type: file.type,
        file_size: file.size,
        uploaded_by: profile.id,
      })
      .select()
      .single();

    if (error) {
      // Clean up uploaded file if DB insert fails
      await supabase.storage.from("gallery").remove([fileName]);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Transform response
    const responseData = {
      ...data,
      image_url: imageUrl,
    };

    // Log activity
    await supabaseAdmin.from("activity_logs").insert({
      user_id: profile.id,
      user_name: profile.name,
      user_email: profile.email,
      action: "create",
      entity_type: "gallery",
      entity_id: data.id,
      description: `Menambahkan ${category === "arsip" ? "arsip digital" : "dokumentasi"}: "${title}"`,
    });

    // Notify superadmins about new media
    const { data: superadmins } = await supabaseAdmin
      .from("profiles")
      .select("id")
      .eq("role", "superadmin");

    if (superadmins && superadmins.length > 0) {
      const notifications = superadmins.map((sa: any) => ({
        user_id: sa.id,
        type: "media_uploaded",
        title: `${category === "arsip" ? "Arsip Digital" : "Dokumentasi"} Baru`,
        message: `${profile.name} menambahkan ${category === "arsip" ? "arsip digital" : "dokumentasi"}: "${title}"`,
        data: { gallery_id: data.id, category },
      }));

      await supabaseAdmin.from("notifications").insert(notifications);
    }

    return NextResponse.json({ success: true, data: responseData });
  } catch (error) {
    console.error("POST /api/gallery error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

/**
 * DELETE /api/gallery
 * Delete gallery item (Admin only)
 */
export async function DELETE(request: NextRequest) {
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

    if (!id) {
      return NextResponse.json({ error: "ID required" }, { status: 400 });
    }

    // Get item first
    const { data: item } = await supabaseAdmin
      .from("gallery")
      .select("*")
      .eq("id", id)
      .single();

    if (!item) {
      return NextResponse.json({ error: "Item not found" }, { status: 404 });
    }

    // Delete from database
    const { error } = await supabaseAdmin
      .from("gallery")
      .delete()
      .eq("id", id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Delete file from storage
    if (item.storage_path) {
      const supabase = createClient();
      await supabase.storage.from(item.storage_bucket || "gallery").remove([item.storage_path]);
    }

    // Log activity
    await supabaseAdmin.from("activity_logs").insert({
      user_id: profile.id,
      user_name: profile.name,
      user_email: profile.email,
      action: "delete",
      entity_type: "gallery",
      entity_id: id,
      description: `Menghapus ${item.category === "arsip" ? "arsip digital" : "dokumentasi"}: "${item.title}"`,
    });

    // Notify superadmins about media deletion
    const { data: superadmins } = await supabaseAdmin
      .from("profiles")
      .select("id")
      .eq("role", "superadmin");

    if (superadmins && superadmins.length > 0) {
      const notifications = superadmins.map((sa: any) => ({
        user_id: sa.id,
        type: "media_deleted",
        title: `${item.category === "arsip" ? "Arsip Digital" : "Dokumentasi"} Dihapus`,
        message: `${profile.name} menghapus ${item.category === "arsip" ? "arsip digital" : "dokumentasi"}: "${item.title}"`,
        data: { gallery_id: id, category: item.category },
      }));

      await supabaseAdmin.from("notifications").insert(notifications);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE /api/gallery error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
