// ============================================================================
// User Management API - Superadmin only
// Handles approval/rejection of user registrations
// ============================================================================

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../../auth/[...nextauth]/route";
import { supabaseAdmin } from "@/app/lib/supabase";

/**
 * GET /api/auth/users
 * Get all users (superadmin only)
 */
export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Check if user is superadmin
  const { data: profile } = await supabaseAdmin
    .from('profiles')
    .select('role')
    .eq('email', session.user.email)
    .single();

  if (profile?.role !== 'superadmin') {
    return NextResponse.json({ error: "Forbidden - Superadmin only" }, { status: 403 });
  }

  // Get all users (except superadmin)
  const { data: users, error } = await supabaseAdmin
    .from('profiles')
    .select('*')
    .neq('role', 'superadmin')
    .order('created_at', { ascending: false });

  if (error) {
    return NextResponse.json({ error: "Database error" }, { status: 500 });
  }

  return NextResponse.json({
    success: true,
    users: users || [],
  });
}

/**
 * POST /api/auth/users/approve
 * Approve a user registration
 */
export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Check if user is superadmin
  const { data: adminProfile } = await supabaseAdmin
    .from('profiles')
    .select('role, id')
    .eq('email', session.user.email)
    .single();

  if (adminProfile?.role !== 'superadmin') {
    return NextResponse.json({ error: "Forbidden - Superadmin only" }, { status: 403 });
  }

  const body = await request.json();
  const { user_id, action } = body;

  if (!user_id || !action) {
    return NextResponse.json({ error: "user_id and action required" }, { status: 400 });
  }

  if (action === 'approve') {
    // Approve user
    const { data: updated, error } = await supabaseAdmin
      .from('profiles')
      .update({
        status: 'approved',
        approved_by: adminProfile.id,
        approved_at: new Date().toISOString(),
      })
      .eq('id', user_id)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: "Approval failed" }, { status: 500 });
    }

    // Create notification for approved user
    await supabaseAdmin
      .from('notifications')
      .insert({
        user_id: user_id,
        type: 'approval',
        title: 'Pendaftaran Disetujui',
        message: `Pendaftaran Anda ke SIMPATI telah disetujui oleh Superadmin. Anda sekarang bisa login.`,
        data: { approved_by: adminProfile.id },
      });

    return NextResponse.json({
      success: true,
      profile: updated,
    });

  } else if (action === 'reject') {
    // Reject user
    const { reason } = body;
    const { data: updated, error } = await supabaseAdmin
      .from('profiles')
      .update({
        status: 'rejected',
        rejected_by: adminProfile.id,
        rejected_at: new Date().toISOString(),
        rejection_reason: reason || null,
      })
      .eq('id', user_id)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: "Rejection failed" }, { status: 500 });
    }

    // Create notification for rejected user
    await supabaseAdmin
      .from('notifications')
      .insert({
        user_id: user_id,
        type: 'rejection',
        title: 'Pendaftaran Ditolak',
        message: reason ? `Pendaftaran Anda ditolak dengan alasan: ${reason}` : 'Pendaftaran Anda ditolak.',
        data: { rejected_by: adminProfile.id, reason },
      });

    return NextResponse.json({
      success: true,
      profile: updated,
    });

  } else if (action === 'delete') {
    // Delete user
    const { error } = await supabaseAdmin
      .from('profiles')
      .delete()
      .eq('id', user_id);

    if (error) {
      return NextResponse.json({ error: "Delete failed" }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: "User deleted",
    });
  }

  return NextResponse.json({ error: "Invalid action" }, { status: 400 });
}