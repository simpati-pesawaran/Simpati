/**
 * Google Sheets Test & Debug API
 *
 * Endpoint untuk testing koneksi Google Sheets
 * Buka: /api/sheets/test
 *
 * Spreadsheet: https://docs.google.com/spreadsheets/d/1QISdbLzLPwwErHk23db0uC2tTTYcFLCsF59ASSh5b5E/edit
 */

import { NextResponse } from 'next/server';
import { google } from 'googleapis';

const SPREADSHEET_ID = "1QISdbLzLPwwErHk23db0uC2tTTYcFLCsF59ASSh5b5E";

interface TestResult {
  timestamp: string;
  success: boolean;
  environment: {
    serviceAccountEmail: boolean;  // true if set (not showing value)
    serviceAccountKey: boolean;   // true if set (not showing value)
  };
  connection: {
    attempted: boolean;
    error?: string;
    errorCode?: string;
  };
  spreadsheet: {
    id: string;
    url: string;
    accessible: boolean;
  };
  sheets: {
    name: string;
    rowCount: number;
    columnCount: number;
    accessible: boolean;
    error?: string;
  }[];
  writeTest: {
    attempted: boolean;
    success?: boolean;
    error?: string;
    testRowCleared?: boolean;
  };
}

function getServiceAccountConfig() {
  const email = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
  const keyJson = process.env.GOOGLE_SERVICE_ACCOUNT_KEY;

  return {
    hasEmail: !!email,
    hasKey: !!keyJson,
    email: email || null,
    keyJson: keyJson || null,
  };
}

function sanitizeError(error: any): { message: string; code?: string } {
  // Remove any sensitive information from errors
  const errorObj: { message: string; code?: string } = {
    message: "Unknown error",
  };

  if (error instanceof Error) {
    errorObj.message = error.message;
  } else if (typeof error === 'string') {
    errorObj.message = error;
  }

  // Add error code if available
  if (error?.code) {
    errorObj.code = String(error.code);
  } else if (error?.status) {
    errorObj.code = String(error.status);
  }

  // Common error messages (safe to show)
  const safeMessages = [
    'invalid_credentials',
    'credentials_unavailable',
    ' sheet not found',
    'spreadsheet not found',
    'permission_denied',
    'forbidden',
    'unauthorized',
    'not_found',
  ];

  // If error message contains sensitive info, generalize it
  const lowerMessage = errorObj.message.toLowerCase();
  if (!safeMessages.some(m => lowerMessage.includes(m))) {
    // Check if it's a network/API error
    if (lowerMessage.includes('getaddrinfo') || lowerMessage.includes('connect')) {
      errorObj.message = "Network error: Unable to connect to Google API";
    } else if (lowerMessage.includes('envelope')) {
      errorObj.message = "Authentication error: Invalid credentials format";
    } else if (lowerMessage.includes('private_key')) {
      errorObj.message = "Authentication error: Invalid private key format";
    } else if (lowerMessage.includes('client_email')) {
      errorObj.message = "Authentication error: Invalid service account email";
    }
  }

  return errorObj;
}

export async function GET() {
  const result: TestResult = {
    timestamp: new Date().toISOString(),
    success: false,
    environment: {
      serviceAccountEmail: false,
      serviceAccountKey: false,
    },
    connection: {
      attempted: false,
    },
    spreadsheet: {
      id: SPREADSHEET_ID,
      url: `https://docs.google.com/spreadsheets/d/${SPREADSHEET_ID}/edit`,
      accessible: false,
    },
    sheets: [],
    writeTest: {
      attempted: false,
    },
  };

  // Step 1: Check environment variables
  const config = getServiceAccountConfig();
  result.environment.serviceAccountEmail = config.hasEmail;
  result.environment.serviceAccountKey = config.hasKey;

  if (!config.hasEmail || !config.hasKey) {
    return NextResponse.json({
      ...result,
      success: false,
      connection: {
        attempted: false,
        error: "Environment variables not configured",
      },
    }, { status: 400 });
  }

  // Step 2: Try to create Google Sheets client
  let sheets: any = null;

  try {
    const auth = new google.auth.GoogleAuth({
      credentials: {
        type: "service_account",
        project_id: JSON.parse(config.keyJson!).project_id,
        private_key_id: JSON.parse(config.keyJson!).private_key_id,
        private_key: JSON.parse(config.keyJson!).private_key,
        client_email: config.email,
        client_id: JSON.parse(config.keyJson!).client_id,
        auth_uri: "https://accounts.google.com/o/oauth2/auth",
        token_uri: "https://oauth2.googleapis.com/token",
        auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs",
        client_x509_cert_url: `https://www.googleapis.com/robot/v1/metadata/x509/${encodeURIComponent(config.email!)}`,
      },
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });

    sheets = google.sheets({ version: 'v4', auth });
    result.connection.attempted = true;
  } catch (error: any) {
    const sanitized = sanitizeError(error);
    result.connection.error = sanitized.message;
    if (sanitized.code) result.connection.errorCode = sanitized.code;

    return NextResponse.json({
      ...result,
      success: false,
    }, { status: 500 });
  }

  // Step 3: Check spreadsheet access
  try {
    const metaResponse = await sheets.spreadsheets.get({
      spreadsheetId: SPREADSHEET_ID,
    });

    result.spreadsheet.accessible = true;

    // Get sheet information
    if (metaResponse.data.sheets) {
      for (const sheet of metaResponse.data.sheets) {
        const sheetInfo = {
          name: sheet.properties?.title || "Unknown",
          rowCount: sheet.properties?.gridProperties?.rowCount || 0,
          columnCount: sheet.properties?.gridProperties?.columnCount || 0,
          accessible: false,
        };

        // Try to read first column to verify access
        try {
          await sheets.spreadsheets.values.get({
            spreadsheetId: SPREADSHEET_ID,
            range: `${sheetInfo.name}!A1`,
          });
          sheetInfo.accessible = true;
        } catch (sheetError: any) {
          sheetInfo.error = sanitizeError(sheetError).message;
        }

        result.sheets.push(sheetInfo);
      }
    }
  } catch (error: any) {
    const sanitized = sanitizeError(error);
    result.connection.error = sanitized.message;
    if (sanitized.code) result.connection.errorCode = sanitized.code;

    // Check specific error types
    if (sanitized.code === '404' || sanitized.message.includes('not found')) {
      result.connection.error = `Spreadsheet not found or not accessible. Make sure the spreadsheet is shared with: ${config.email}`;
    } else if (sanitized.code === '403' || sanitized.message.includes('permission')) {
      result.connection.error = `Permission denied. Share spreadsheet with: ${config.email}`;
    }

    return NextResponse.json({
      ...result,
      success: false,
    }, { status: 403 });
  }

  // Step 4: Write test to Agenda sheet
  result.writeTest.attempted = true;

  try {
    // Find Agenda sheet
    const agendaSheet = result.sheets.find(s => s.name === 'Agenda');

    if (!agendaSheet) {
      result.writeTest.error = "Sheet 'Agenda' not found in spreadsheet";
    } else {
      // Write a test row
      const testRange = 'Agenda!P1:P3';
      const testTimestamp = new Date().toISOString();

      // First, clear test area
      try {
        await sheets.spreadsheets.values.clear({
          spreadsheetId: SPREADSHEET_ID,
          range: testRange,
        });
        result.writeTest.testRowCleared = true;
      } catch (e) {
        // Non-critical
      }

      // Write test data
      await sheets.spreadsheets.values.update({
        spreadsheetId: SPREADSHEET_ID,
        range: testRange,
        valueInputOption: 'RAW',
        requestBody: {
          values: [
            ['TEST_CONNECTION'],
            [testTimestamp],
            ['SIMPATI - Connection Test Successful'],
          ],
        },
      });

      result.writeTest.success = true;

      // Clear test data after 10 seconds (manual cleanup)
      setTimeout(async () => {
        try {
          await sheets.spreadsheets.values.clear({
            spreadsheetId: SPREADSHEET_ID,
            range: testRange,
          });
        } catch (e) {
          // Ignore cleanup errors
        }
      }, 10000);
    }
  } catch (error: any) {
    const sanitized = sanitizeError(error);
    result.writeTest.error = sanitized.message;
    if (sanitized.code) result.writeTest.errorCode = sanitized.code;
  }

  // Determine overall success
  result.success =
    result.connection.attempted &&
    result.spreadsheet.accessible &&
    result.writeTest.success === true;

  return NextResponse.json(result, {
    status: result.success ? 200 : 500,
  });
}
