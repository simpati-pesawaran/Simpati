// ============================================================================
// Seed Data API - Create sample agendas
// ============================================================================

import { NextResponse } from 'next/server';
import { supabaseAdmin } from "@/app/lib/supabase";

export async function POST() {
  try {
    // Get admin user first
    const { data: adminUser } = await supabaseAdmin
      .from("profiles")
      .select("id, name")
      .eq("role", "superadmin")
      .single();

    if (!adminUser) {
      return NextResponse.json({ error: "Admin user not found. Run setup first." }, { status: 404 });
    }

    // Create sample agendas
    const today = new Date();
    const day2 = new Date(today);
    day2.setDate(today.getDate() + 2);

    const sampleAgendas = [
      {
        jenis: "kegiatan",
        title: "Rapat Koordinasi Pembangunan Infrastruktur Desa",
        description: "Pembahasan rencana pembangunan jalan desa dan jembatan di 3 lokasi",
        date: day2.toISOString().split("T")[0],
        time_start: "07:00",
        time_end: "12:00",
        location: "Aula Rumah Dinas Bupati",
        sub_jenis: "Rapat",
        pic_name: "Budi Santoso",
        pic_phone: "081234567890",
        participants_count: 25,
        dresscode: "Batik",
        status: "published",
        created_by: adminUser.id,
      },
      {
        jenis: "kegiatan",
        title: "Sosialisasi Program Keluarga Berencana",
        description: "Penyampaian informasi program KB dan alat kontrasepsi gratis",
        date: day2.toISOString().split("T")[0],
        time_start: "13:00",
        time_end: "16:00",
        location: "Balai Desa Sukamaju",
        sub_jenis: "Sosialisasi",
        pic_name: "Dewi Lestari",
        pic_phone: "081234567891",
        participants_count: 50,
        dresscode: "Seragam Merah Putih",
        status: "published",
        created_by: adminUser.id,
      },
      {
        jenis: "audiensi",
        title: "Audiensi Kepala Daerah dengan Kemendagri",
        description: "Pembahasan dana alokasi khusus dan persiapan evaluasi kinerja",
        date: day2.toISOString().split("T")[0],
        time_start: "10:00",
        time_end: "14:00",
        location: "Kantor Kemendagri, Jakarta",
        sub_jenis: "Audiensi Resmi",
        pic_name: "Ahmad Fauzi",
        pic_phone: "081234567892",
        participants_count: 8,
        dresscode: "Jas",
        status: "published",
        created_by: adminUser.id,
      },
      {
        jenis: "kegiatan",
        title: "Peninjauan Lokasi Banjir",
        description: "Tim BPBD melakukan peninjauan lokasi banjir di Kecamatan Rendang",
        date: day2.toISOString().split("T")[0],
        time_start: "07:00",
        time_end: "20:00",
        location: "Kecamatan Rendang",
        sub_jenis: "Kunjungan Lapangan",
        pic_name: "Komandan BPBD",
        pic_phone: "081234567893",
        participants_count: 15,
        dresscode: "Seragam Satpol PP",
        status: "published",
        created_by: adminUser.id,
      },
    ];

    // Insert sample agendas
    const { data, error } = await supabaseAdmin
      .from("agenda")
      .insert(sampleAgendas)
      .select();

    if (error) {
      console.error("Seed error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: `Created ${data?.length || 0} sample agendas`,
      data
    });
  } catch (error) {
    console.error("Seed error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({
    message: "POST to this endpoint to seed sample agenda data",
    usage: "POST /api/seed"
  });
}
