/**
 * Google Sheets Sync API
 *
 * Syncs agenda data to Google Sheets
 * Spreadsheet: https://docs.google.com/spreadsheets/d/1QISdbLzLPwwErHk23db0uC2tTTYcFLCsF59ASSh5b5E/edit
 *
 * Required Environment Variables:
 * - GOOGLE_SERVICE_ACCOUNT_EMAIL: Service account email (e.g., name@project.iam.gserviceaccount.com)
 * - GOOGLE_SERVICE_ACCOUNT_KEY: Full JSON key content from service account (not base64)
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { supabaseAdmin } from "@/app/lib/supabase";
import { google } from 'googleapis';

const SPREADSHEET_ID = "1QISdbLzLPwwErHk23db0uC2tTTYcFLCsF59ASSh5b5E";

interface GoogleServiceAccount {
  type: string;
  project_id: string;
  private_key_id: string;
  private_key: string;
  client_email: string;
  client_id: string;
  auth_uri: string;
  token_uri: string;
  auth_provider_x509_cert_url: string;
  client_x509_cert_url: string;
}

function getServiceAccountConfig(): GoogleServiceAccount | null {
  const email = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
  const keyJson = process.env.GOOGLE_SERVICE_ACCOUNT_KEY;

  if (!email || !keyJson) {
    console.warn("Google Sheets credentials not configured");
    return null;
  }

  try {
    const key = JSON.parse(keyJson);
    return {
      type: key.type || "service_account",
      project_id: key.project_id,
      private_key_id: key.private_key_id,
      private_key: key.private_key,
      client_email: key.client_email,
      client_id: key.client_id,
      auth_uri: key.auth_uri || "https://accounts.google.com/o/oauth2/auth",
      token_uri: key.token_uri || "https://oauth2.googleapis.com/token",
      auth_provider_x509_cert_url: key.auth_provider_x509_cert_url || "https://www.googleapis.com/oauth2/v1/certs",
      client_x509_cert_url: key.client_x509_cert_url,
    };
  } catch (error) {
    console.error("Error parsing service account key:", error);
    return null;
  }
}

async function getGoogleSheetsClient() {
  const config = getServiceAccountConfig();
  if (!config) return null;

  try {
    const auth = new google.auth.GoogleAuth({
      credentials: config,
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });

    const client = google.sheets({ version: 'v4', auth });
    return client;
  } catch (error) {
    console.error("Error creating Google Sheets client:", error);
    return null;
  }
}

function formatAgendaForSheet(agenda: any): (string | number)[] {
  return [
    agenda.id,
    agenda.jenis === "agenda" ? "Kegiatan" : "Audiensi",
    agenda.sub_jenis || "-",
    agenda.title,
    agenda.date,
    agenda.time_start?.slice(0, 5) || "",
    agenda.time_end?.slice(0, 5) || "",
    agenda.location || "-",
    agenda.pic_name || "-",
    agenda.pic_phone || "-",
    agenda.description || "-",
    agenda.status === "published" ? "Dipublikasi" : agenda.status === "cancelled" ? "Dibatalkan" : "Draft",
    agenda.creator?.name || "-",
    agenda.created_at ? new Date(agenda.created_at).toLocaleString("id-ID", { timeZone: "Asia/Jakarta" }) : "-",
    agenda.updated_at ? new Date(agenda.updated_at).toLocaleString("id-ID", { timeZone: "Asia/Jakarta" }) : "-",
  ];
}

/**
 * GET /api/sheets
 * Get sync status
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const config = getServiceAccountConfig();
    if (!config) {
      return NextResponse.json({
        configured: false,
        message: "Google Sheets credentials not configured",
        spreadsheetId: SPREADSHEET_ID,
        spreadsheetUrl: `https://docs.google.com/spreadsheets/d/${SPREADSHEET_ID}/edit`,
        requiredEnvVars: [
          "GOOGLE_SERVICE_ACCOUNT_EMAIL",
          "GOOGLE_SERVICE_ACCOUNT_KEY",
        ],
      });
    }

    // Try to read the sheet
    const sheets = await getGoogleSheetsClient();
    if (!sheets) {
      return NextResponse.json({
        configured: false,
        message: "Failed to connect to Google Sheets",
      });
    }

    try {
      const response = await sheets.spreadsheets.values.get({
        spreadsheetId: SPREADSHEET_ID,
        range: 'Agenda!A:A',
      });

      return NextResponse.json({
        configured: true,
        connected: true,
        rowCount: (response.data.values?.length || 1) - 1, // Minus header
        spreadsheetUrl: `https://docs.google.com/spreadsheets/d/${SPREADSHEET_ID}/edit`,
      });
    } catch (apiError: any) {
      if (apiError.code === 404) {
        return NextResponse.json({
          configured: true,
          connected: false,
          message: "Sheet 'Agenda' not found. Please create a sheet named 'Agenda' in the spreadsheet.",
          spreadsheetUrl: `https://docs.google.com/spreadsheets/d/${SPREADSHEET_ID}/edit`,
        });
      }
      throw apiError;
    }
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

    const sheets = await getGoogleSheetsClient();
    if (!sheets) {
      return NextResponse.json({
        success: false,
        message: "Google Sheets credentials not configured",
        setupGuide: {
          step1: "Go to Google Cloud Console",
          step2: "Create a project or select existing",
          step3: "Enable Google Sheets API",
          step4: "Create Service Account",
          step5: "Download JSON key",
          step6: "Share spreadsheet with service account email",
          step7: "Set environment variables",
        },
        requiredEnvVars: [
          "GOOGLE_SERVICE_ACCOUNT_EMAIL=service account email",
          "GOOGLE_SERVICE_ACCOUNT_KEY=full JSON key content",
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
    const range = `Agenda!A1:O${allRows.length}`;

    // Clear the sheet first
    try {
      await sheets.spreadsheets.values.clear({
        spreadsheetId: SPREADSHEET_ID,
        range: 'Agenda!A:O',
      });
    } catch (clearError) {
      console.warn("Clear sheet warning:", clearError);
      // Continue anyway - might be empty sheet
    }

    // Write new data
    const response = await sheets.spreadsheets.values.update({
      spreadsheetId: SPREADSHEET_ID,
      range: range,
      valueInputOption: 'RAW',
      requestBody: {
        values: allRows,
      },
    });

    // Format the header row
    try {
      await sheets.spreadsheets.values.batchUpdate({
        spreadsheetId: SPREADSHEET_ID,
        requests: [
          {
            repeatCell: {
              range: {
                sheetId: 0,
                startRowIndex: 0,
                endRowIndex: 1,
                startColumnIndex: 0,
                endColumnIndex: 15,
              },
              cell: {
                userEnteredFormat: {
                  backgroundColor: { red: 0.12, green: 0.24, blue: 0.47 },
                  textFormat: {
                    bold: true,
                    foregroundColor: { red: 1, green: 1, blue: 1 },
                  },
                  borders: {
                    top: { style: "SOLID", width: 1, color: { red: 0.1, green: 0.1, blue: 0.1 } },
                    bottom: { style: "SOLID", width: 1, color: { red: 0.1, green: 0.1, blue: 0.1 } },
                    left: { style: "SOLID", width: 1, color: { red: 0.1, green: 0.1, blue: 0.1 } },
                    right: { style: "SOLID", width: 1, color: { red: 0.1, green: 0.1, blue: 0.1 } },
                  },
                },
              },
              fields: "userEnteredFormat",
            },
          },
          {
            autoResizeDimensions: {
              dimensions: {
                sheetId: 0,
                dimension: "COLUMNS",
                startIndex: 0,
                endIndex: 15,
              },
            },
          },
        ],
      });
    } catch (formatError) {
      console.warn("Format header warning:", formatError);
      // Non-critical, continue
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
      spreadsheetUrl: `https://docs.google.com/spreadsheets/d/${SPREADSHEET_ID}/edit`,
    });
  } catch (error) {
    console.error("POST /api/sheets error:", error);
    return NextResponse.json({
      success: false,
      error: "Server error",
      message: error instanceof Error ? error.message : "Unknown error occurred"
    }, { status: 500 });
  }
}
