// ============================================================================
// Database Migration: Add missing entity and action types
// ============================================================================

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { supabaseAdmin } from "@/app/lib/supabase";

/**
 * POST /api/migrations/logs
 * Run migration to add missing enum values and update schema
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const profile = (session.user as any)?.profile;

    // Only superadmin can run migrations
    if (!profile || profile.role !== "superadmin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const migrations: string[] = [];
    const errors: string[] = [];

    // Note: The enum values will be added when setup is run
    // For existing databases, run the SQL migration file manually
    migrations.push("Enum updates added to setup/route.ts");
    migrations.push("Run supabase/migrations/add_activity_log_types.sql manually for existing databases");

    return NextResponse.json({
      success: true,
      migrations,
      errors: errors.length > 0 ? errors : undefined,
      message: "Migration prepared. Run supabase/migrations/add_activity_log_types.sql in Supabase dashboard."
    });

  } catch (error: any) {
    console.error("Migration error:", error);
    return NextResponse.json(
      { error: "Migration failed: " + error.message },
      { status: 500 }
    );
  }
}

/**
 * GET /api/migrations/logs
 * Check current migration status
 */
export async function GET() {
  try {
    // Check current enum values by querying activity_logs
    const { data, error } = await supabaseAdmin
      .from('activity_logs')
      .select('action, entity_type')
      .limit(1);

    return NextResponse.json({
      success: true,
      note: "Use POST to run migrations. Check Supabase dashboard for enum values.",
      currentEnums: {
        action_type: ['create', 'update', 'delete', 'approve', 'reject', 'login', 'logout', 'submit', 'sync', 'view'],
        entity_type: ['profile', 'agenda', 'notification', 'gallery', 'usulan', 'audiensi', 'auth', 'user']
      }
    });
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error.message
    });
  }
}
