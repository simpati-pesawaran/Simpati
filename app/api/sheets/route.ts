/**
 * Google Sheets Sync API
 *
 * Syncs agenda and usulan data to Google Sheets
 * Spreadsheet: https://docs.google.com/spreadsheets/d/1QISdbLzLPwwErHk23db0uC2tTTYcFLCsF59ASSh5b5E/edit
 *
 * Required Environment Variables:
 * - GOOGLE_SERVICE_ACCOUNT_EMAIL: Service account email
 * - GOOGLE_SERVICE_ACCOUNT_KEY: Full JSON key content from service account
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { supabaseAdmin } from "@/app/lib/supabase";
import { google } from 'googleapis';

const SPREADSHEET_ID = "1QISdbLzLPwwErHk23db0uC2tTTYcFLCsF59ASSh5b5E";

function getServiceAccountConfig() {
  const email = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
  const keyJson = process.env.GOOGLE_SERVICE_ACCOUNT_KEY;

  if (!email || !keyJson) {
    return null;
  }

  try {
    const key = JSON.parse(keyJson);
    return {
      type: "service_account",
      project_id: key.project_id,
      private_key_id: key.private_key_id,
      private_key: key.private_key,
      client_email: key.client_email,
      client_id: key.client_id,
      auth_uri: "https://accounts.google.com/o/oauth2/auth",
      token_uri: "https://oauth2.googleapis.com/token",
      auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs",
      client_x509_cert_url: `https://www.googleapis.com/robot/v1/metadata/x509/${encodeURIComponent(email)}`,
    };
  } catch (error) {
    console.error("Error parsing service account key");
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

    return google.sheets({ version: 'v4', auth });
  } catch (error) {
    console.error("Error creating Google Sheets client");
    return null;
  }
}

function sanitizeError(error: any): string {
  if (error instanceof Error) return error.message;
  if (typeof error === 'string') return error;
  if (error?.message) return error.message;
  if (error?.errors?.[0]?.message) return error.errors[0].message;
  return "Unknown error";
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

function formatUsulanForSheet(usulan: any): (string | number)[] {
  return [
    usulan.id,
    usulan.name || "-",
    usulan.email || "-",
    usulan.phone || "-",
    usulan.instansi || "-",
    usulan.category || "-",
    usulan.title,
    usulan.description || "-",
    usulan.status === "approved" ? "Disetujui" : usulan.status === "rejected" ? "Ditolak" : "Menunggu",
    usulan.created_at ? new Date(usulan.created_at).toLocaleString("id-ID", { timeZone: "Asia/Jakarta" }) : "-",
    usulan.updated_at ? new Date(usulan.updated_at).toLocaleString("id-ID", { timeZone: "Asia/Jakarta" }) : "-",
  ];
}

async function syncSheet(
  sheets: any,
  sheetName: string,
  headerRow: string[],
  dataRows: (string | number)[][],
  formatHeader: boolean = true
): Promise<{ success: boolean; error?: string; rowsWritten: number }> {
  try {
    const allRows = [headerRow, ...dataRows];
    const lastColumn = String.fromCharCode(65 + headerRow.length - 1);
    const range = `${sheetName}!A1:${lastColumn}${allRows.length}`;

    // Clear existing data
    try {
      await sheets.spreadsheets.values.clear({
        spreadsheetId: SPREADSHEET_ID,
        range: `${sheetName}!A:${lastColumn}`,
      });
    } catch (e) {
      // Sheet might be empty, continue
    }

    // Write new data
    await sheets.spreadsheets.values.update({
      spreadsheetId: SPREADSHEET_ID,
      range: range,
      valueInputOption: 'RAW',
      requestBody: { values: allRows },
    });

    // Format header row
    if (formatHeader) {
      try {
        await sheets.spreadsheets.values.batchUpdate({
          spreadsheetId: SPREADSHEET_ID,
          requests: [{
            repeatCell: {
              range: {
                sheetId: 0,
                startRowIndex: 0,
                endRowIndex: 1,
                startColumnIndex: 0,
                endColumnIndex: headerRow.length,
              },
              cell: {
                userEnteredFormat: {
                  backgroundColor: { red: 0.12, green: 0.24, blue: 0.47 },
                  textFormat: { bold: true, foregroundColor: { red: 1, green: 1, blue: 1 } },
                },
              },
              fields: "userEnteredFormat",
            },
          }],
        });
      } catch (e) {
        // Non-critical
      }
    }

    return { success: true, rowsWritten: dataRows.length };
  } catch (error) {
    return {
      success: false,
      error: sanitizeError(error),
      rowsWritten: 0,
    };
  }
}

/**
 * GET /api/sheets
 * Get sync status and available sheets
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const sheets = await getGoogleSheetsClient();
    if (!sheets) {
      return NextResponse.json({
        configured: false,
        message: "Google Sheets credentials not configured",
      });
    }

    try {
      const metaResponse = await sheets.spreadsheets.get({
        spreadsheetId: SPREADSHEET_ID,
      });

      const sheetsList = metaResponse.data.sheets?.map((sheet: any) => ({
        name: sheet.properties?.title,
        rowCount: sheet.properties?.gridProperties?.rowCount,
        columnCount: sheet.properties?.gridProperties?.columnCount,
      })) || [];

      return NextResponse.json({
        configured: true,
        connected: true,
        spreadsheetId: SPREADSHEET_ID,
        spreadsheetUrl: `https://docs.google.com/spreadsheets/d/${SPREADSHEET_ID}/edit`,
        sheets: sheetsList,
      });
    } catch (error: any) {
      if (error.code === 404) {
        return NextResponse.json({
          configured: true,
          connected: false,
          error: "Spreadsheet not found. Check if spreadsheet ID is correct and spreadsheet is shared with service account.",
        });
      }
      throw error;
    }
  } catch (error) {
    return NextResponse.json({ error: sanitizeError(error) }, { status: 500 });
  }
}

/**
 * POST /api/sheets
 * Sync all data to Google Sheets
 *
 * Query params:
 * - sheet: "agenda" | "usulan" | "all" (default: "all")
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
      }, { status: 400 });
    }

    const searchParams = request.nextUrl.searchParams;
    const targetSheet = searchParams.get("sheet") || "all";

    const results: Record<string, any> = {};

    // Sync Agenda
    if (targetSheet === "agenda" || targetSheet === "all") {
      const { data: agendas, error: agendaError } = await supabaseAdmin
        .from("agenda")
        .select(`
          *,
          creator:profiles!agenda_created_by_fkey(id, name)
        `)
        .is("deleted_at", null)
        .order("created_at", { ascending: false });

      if (agendaError) {
        results.agenda = { success: false, error: sanitizeError(agendaError) };
      } else {
        const agendaHeader = [
          "ID", "Jenis", "Sub Jenis", "Judul Agenda", "Tanggal",
          "Waktu Mulai", "Waktu Selesai", "Lokasi", "Penanggung Jawab",
          "No. PIC", "Deskripsi", "Status", "Dibuat Oleh", "Dibuat Pada", "Diperbarui Pada"
        ];
        const agendaRows = (agendas || []).map(formatAgendaForSheet);

        results.agenda = await syncSheet(sheets, "Agenda", agendaHeader, agendaRows);
        results.agenda.message = results.agenda.success
          ? `Berhasil sinkron ${results.agenda.rowsWritten} agenda`
          : `Gagal sinkron agenda: ${results.agenda.error}`;
      }
    }

    // Sync Usulan
    if (targetSheet === "usulan" || targetSheet === "all") {
      const { data: usulans, error: usulanError } = await supabaseAdmin
        .from("usulan")
        .select("*")
        .order("created_at", { ascending: false });

      if (usulanError) {
        results.usulan = { success: false, error: sanitizeError(usulanError) };
      } else {
        const usulanHeader = [
          "ID", "Nama", "Email", "No. HP", "Instansi",
          "Kategori", "Judul Usulan", "Deskripsi", "Status", "Dibuat Pada", "Diperbarui Pada"
        ];
        const usulanRows = (usulans || []).map(formatUsulanForSheet);

        results.usulan = await syncSheet(sheets, "Usulan", usulanHeader, usulanRows);
        results.usulan.message = results.usulan.success
          ? `Berhasil sinkron ${results.usulan.rowsWritten} usulan`
          : `Gagal sinkron usulan: ${results.usulan.error}`;
      }
    }

    // Log activity
    const profile = (session.user as any)?.profile;
    if (profile && Object.values(results).some((r: any) => r.success)) {
      const syncedItems = Object.entries(results)
        .filter(([_, r]: [string, any]) => r.success)
        .map(([name, r]: [string, any]) => `${r.rowsWritten} ${name}`)
        .join(", ");

      await supabaseAdmin.from("activity_logs").insert({
        user_id: profile.id,
        user_name: profile.name || session.user.name,
        action: "sync",
        entity_type: "google_sheets",
        entity_id: "multi",
        description: `${profile.name} menyinkronkan ${syncedItems} ke Google Sheets`,
      });
    }

    const overallSuccess = Object.values(results).every((r: any) => r.success);

    return NextResponse.json({
      success: overallSuccess,
      spreadsheetUrl: `https://docs.google.com/spreadsheets/d/${SPREADSHEET_ID}/edit`,
      results,
    }, { status: overallSuccess ? 200 : 500 });

  } catch (error) {
    console.error("POST /api/sheets error:", error);
    return NextResponse.json({
      success: false,
      error: sanitizeError(error),
    }, { status: 500 });
  }
}
