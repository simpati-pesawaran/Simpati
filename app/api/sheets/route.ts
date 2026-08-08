/**
 * Google Sheets Sync API
 *
 * Syncs agenda data to Google Sheets
 * Spreadsheet: https://docs.google.com/spreadsheets/d/1QISdbLzLPwwErHk23db0uC2tTTYcFLCsF59ASSh5b5E/edit
 *
 * Required Environment Variables:
 * - GOOGLE_SERVICE_ACCOUNT_EMAIL: Service account email
 * - GOOGLE_SERVICE_ACCOUNT_KEY: Base64 encoded service account key
 *
 * Or for simple API key approach:
 * - GOOGLE_SHEETS_API_KEY: API key with Sheets access
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { supabaseAdmin } from "@/app/lib/supabase";

const SPREADSHEET_ID = "1QISdbLzLPwwErHk23db0uC2tTTYcFLCsF59ASSh5b5E";
const SHEET_NAME = "Agenda";

// Google Sheets API endpoint
const SHEETS_API_URL = `https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}/values/${SHEET_NAME}`;

interface AgendaRow {
  id: string;
  jenis: string;
  sub_jenis: string | null;
  title: string;
  date: string;
  time_start: string;
  time_end: string;
  location: string | null;
  pic_name: string | null;
  pic_phone: string | null;
  description: string | null;
  status: string;
  created_by: string;
  created_at: string;
  updated_at: string;
}

async function getGoogleAccessToken(): Promise<string | null> {
  // Check if service account credentials are configured
  const serviceAccountEmail = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
  const serviceAccountKey = process.env.GOOGLE_SERVICE_ACCOUNT_KEY;

  if (!serviceAccountEmail || !serviceAccountKey) {
    console.warn("Google Sheets credentials not configured");
    return null;
  }

  try {
    // For production, use google-auth-library
    // This is a simplified version - in production, use proper JWT auth
    const key = JSON.parse(Buffer.from(serviceAccountKey, 'base64').toString());

    // JWT token generation would go here
    // For now, return null and log warning
    console.log("Google Sheets: Service account configured, using API key approach");
    return process.env.GOOGLE_SHEETS_API_KEY || null;
  } catch (error) {
    console.error("Error getting Google access token:", error);
    return null;
  }
}

function formatAgendaForSheet(agenda: any): (string | number)[] {
  return [
    agenda.id,
    agenda.jenis === "agenda" ? "Kegiatan" : "Audiensi",
    agenda.sub_jenis || "",
    agenda.title,
    agenda.date,
    agenda.time_start?.slice(0, 5) || "",
    agenda.time_end?.slice(0, 5) || "",
    agenda.location || "",
    agenda.pic_name || "",
    agenda.pic_phone || "",
    agenda.description || "",
    agenda.status === "published" ? "Dipublikasi" : agenda.status === "cancelled" ? "Dibatalkan" : "Draft",
    agenda.creator?.name || "",
    agenda.created_at ? new Date(agenda.created_at).toLocaleString("id-ID") : "",
    agenda.updated_at ? new Date(agenda.updated_at).toLocaleString("id-ID") : "",
  ];
}

function formatSheetRowToAgenda(row: (string | number)[]): Partial<AgendaRow> {
  return {
    id: String(row[0] || ""),
    jenis: String(row[1] || "").toLowerCase() === "kegiatan" ? "agenda" : "audiensi",
    sub_jenis: row[2] ? String(row[2]) : null,
    title: String(row[3] || ""),
    date: String(row[4] || ""),
    time_start: String(row[5] || ""),
    time_end: String(row[6] || ""),
    location: row[7] ? String(row[7]) : null,
    pic_name: row[8] ? String(row[8]) : null,
    pic_phone: row[9] ? String(row[9]) : null,
    description: row[10] ? String(row[10]) : null,
    status: String(row[11] || "").toLowerCase().includes("publik") ? "published" :
            String(row[11] || "").toLowerCase().includes("batal") ? "cancelled" : "draft",
    created_by: String(row[12] || ""),
    created_at: String(row[13] || ""),
    updated_at: String(row[14] || ""),
  };
}

/**
 * GET /api/sheets
 * Get sync status and last sync info
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const apiKey = await getGoogleAccessToken();
    if (!apiKey) {
      return NextResponse.json({
        configured: false,
        message: "Google Sheets API not configured. Please set GOOGLE_SERVICE_ACCOUNT_EMAIL and GOOGLE_SERVICE_ACCOUNT_KEY environment variables.",
        spreadsheetId: SPREADSHEET_ID,
        requiredEnvVars: [
          "GOOGLE_SERVICE_ACCOUNT_EMAIL",
          "GOOGLE_SERVICE_ACCOUNT_KEY (base64 encoded JSON)",
        ],
      });
    }

    // Get current sheet data
    const response = await fetch(`${SHEETS_API_URL}?key=${apiKey}`);
    const data = await response.json();

    return NextResponse.json({
      configured: true,
      lastRow: data.values?.length || 0,
      lastSync: data.values?.[data.values?.length - 1]?.[14] || null,
    });
  } catch (error) {
    console.error("GET /api/sheets error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

/**
 * POST /api/sheets
 * Sync all agendas to Google Sheets
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const apiKey = await getGoogleAccessToken();
    if (!apiKey) {
      return NextResponse.json({
        success: false,
        message: "Google Sheets API not configured",
        requiredEnvVars: [
          "GOOGLE_SERVICE_ACCOUNT_EMAIL",
          "GOOGLE_SERVICE_ACCOUNT_KEY",
        ],
      }, { status: 400 });
    }

    // Fetch all agendas from database
    const { data: agendas, error } = await supabaseAdmin
      .from("agenda")
      .select(`
        *,
        creator:profiles!agenda_created_by_fkey(id, name)
      `)
      .is("deleted_at", null)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching agendas:", error);
      return NextResponse.json({ error: "Database error" }, { status: 500 });
    }

    // Prepare header row
    const headerRow = [
      "ID",
      "Jenis",
      "Sub Jenis",
      "Judul Agenda",
      "Tanggal",
      "Waktu Mulai",
      "Waktu Selesai",
      "Lokasi",
      "Penanggung Jawab",
      "No. PIC",
      "Deskripsi",
      "Status",
      "Dibuat Oleh",
      "Dibuat Pada",
      "Diperbarui Pada",
    ];

    // Prepare data rows
    const dataRows = (agendas || []).map(formatAgendaForSheet);

    // Combine header and data
    const allRows = [headerRow, ...dataRows];
    const range = `${SHEET_NAME}!A1:O${allRows.length}`;

    // Clear and rewrite the sheet
    const clearResponse = await fetch(`${SHEETS_API_URL}/clear?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    });

    // Write new data
    const updateResponse = await fetch(`${SHEETS_API_URL}?valueInputOption=RAW&insertDataOption=INSERT_ROWS&key=${apiKey}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ values: allRows }),
    });

    if (!updateResponse.ok) {
      const errorData = await updateResponse.text();
      console.error("Google Sheets API error:", errorData);
      return NextResponse.json({
        success: false,
        message: "Failed to sync to Google Sheets",
        error: errorData,
      }, { status: 500 });
    }

    // Log the sync activity
    const profile = (session.user as any)?.profile;
    if (profile) {
      await supabaseAdmin.from("activity_logs").insert({
        user_id: profile.id,
        user_name: profile.name || session.user.name,
        action: "sync",
        entity_type: "agenda",
        entity_id: "google_sheets",
        description: `${profile.name} menyinkronkan ${agendas?.length || 0} agenda ke Google Sheets`,
      });
    }

    return NextResponse.json({
      success: true,
      message: `Berhasil menyinkronkan ${agendas?.length || 0} agenda ke Google Sheets`,
      syncedCount: agendas?.length || 0,
    });
  } catch (error) {
    console.error("POST /api/sheets error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
