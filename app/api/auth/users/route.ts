// User Management API
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from "next-auth/next";
import { authOptions } from "../[...nextauth]/route";
import { supabaseAdmin } from "@/app/lib/supabase";

/**
 * Log activity helper
 */
async function logActivity(
  userId: string,
  userName: string,
  userEmail: string,
  action: string,
  entityType: string,
  entityId: string,
  description: string,
  oldData: any = null,
  newData: any = null
) {
  const { error } = await supabaseAdmin.from("activity_logs").insert({
    user_id: userId,
    user_name: userName,
    user_email: userEmail,
    action: action,
    entity_type: entityType,
    entity_id: entityId,
    description: description,
    old_data: oldData,
    new_data: newData,
  });

  if (error) {
    console.error("Error logging activity:", error);
  }

  return !error;
}

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { data: profile } = await supabaseAdmin.from('profiles').select('role').eq('email', session.user.email).single();
  if (profile?.role !== 'superadmin') return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const { data: users, error } = await supabaseAdmin.from('profiles').select('*').neq('role', 'superadmin').order('created_at', { ascending: false });
  if (error) return NextResponse.json({ error: "Database error" }, { status: 500 });
  return NextResponse.json({ success: true, users: users || [] });
}

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { data: adminProfile } = await supabaseAdmin.from('profiles').select('role, id').eq('email', session.user.email).single();
  if (adminProfile?.role !== 'superadmin') return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const body = await request.json();
  const { user_id, action } = body;
  if (!user_id || !action) return NextResponse.json({ error: "user_id and action required" }, { status: 400 });

  // Get target user info for logging
  const { data: targetUser } = await supabaseAdmin.from('profiles').select('id, name, email').eq('id', user_id).single();

  if (action === 'approve') {
    const { data: updated, error } = await supabaseAdmin.from('profiles').update({ status: 'approved', approved_by: adminProfile.id, approved_at: new Date().toISOString() }).eq('id', user_id).select().single();
    if (error) return NextResponse.json({ error: "Approval failed" }, { status: 500 });

    // Log approval
    if (targetUser) {
      await logActivity(
        adminProfile.id,
        adminProfile.name,
        adminProfile.email,
        "approve",
        "profile",
        user_id,
        `Menyetujui pendaftaran: ${targetUser.name} (${targetUser.email})`,
        { status: 'pending' },
        { status: 'approved' }
      );
    }

    await supabaseAdmin.from('notifications').insert({ user_id, type: 'user_approved', title: 'Pendaftaran Disetujui', message: 'Pendaftaran Anda disetujui.' });
    return NextResponse.json({ success: true, profile: updated });
  } else if (action === 'reject') {
    const { reason } = body;
    const { data: updated, error } = await supabaseAdmin.from('profiles').update({ status: 'rejected', rejected_by: adminProfile.id, rejected_at: new Date().toISOString(), rejection_reason: reason || null }).eq('id', user_id).select().single();
    if (error) return NextResponse.json({ error: "Rejection failed" }, { status: 500 });

    // Log rejection
    if (targetUser) {
      await logActivity(
        adminProfile.id,
        adminProfile.name,
        adminProfile.email,
        "reject",
        "profile",
        user_id,
        `Menolak pendaftaran: ${targetUser.name} (${targetUser.email})` + (reason ? ` - Alasan: ${reason}` : ''),
        { status: 'pending' },
        { status: 'rejected', reason }
      );
    }

    await supabaseAdmin.from('notifications').insert({ user_id, type: 'user_rejected', title: 'Pendaftaran Ditolak', message: reason ? 'Ditolak: ' + reason : 'Pendaftaran Anda ditolak.' });
    return NextResponse.json({ success: true, profile: updated });
  } else if (action === 'delete') {
    // Log deletion
    if (targetUser) {
      await logActivity(
        adminProfile.id,
        adminProfile.name,
        adminProfile.email,
        "delete",
        "profile",
        user_id,
        `Menghapus pengguna: ${targetUser.name} (${targetUser.email})`,
        { name: targetUser.name, email: targetUser.email },
        null
      );
    }

    const { error } = await supabaseAdmin.from('profiles').delete().eq('id', user_id);
    if (error) return NextResponse.json({ error: "Delete failed" }, { status: 500 });
    return NextResponse.json({ success: true });
  }
  return NextResponse.json({ error: "Invalid action" }, { status: 400 });
}