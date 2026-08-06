// User Management API
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from "next-auth/next";
import { authOptions } from "../[...nextauth]/route";
import { supabaseAdmin } from "@/app/lib/supabase";

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
  if (action === 'approve') {
    const { data: updated, error } = await supabaseAdmin.from('profiles').update({ status: 'approved', approved_by: adminProfile.id, approved_at: new Date().toISOString() }).eq('id', user_id).select().single();
    if (error) return NextResponse.json({ error: "Approval failed" }, { status: 500 });
    await supabaseAdmin.from('notifications').insert({ user_id, type: 'approval', title: 'Pendaftaran Disetujui', message: 'Pendaftaran Anda disetujui.' });
    return NextResponse.json({ success: true, profile: updated });
  } else if (action === 'reject') {
    const { reason } = body;
    const { data: updated, error } = await supabaseAdmin.from('profiles').update({ status: 'rejected', rejected_by: adminProfile.id, rejected_at: new Date().toISOString(), rejection_reason: reason || null }).eq('id', user_id).select().single();
    if (error) return NextResponse.json({ error: "Rejection failed" }, { status: 500 });
    await supabaseAdmin.from('notifications').insert({ user_id, type: 'rejection', title: 'Pendaftaran Ditolak', message: reason ? 'Ditolak: ' + reason : 'Pendaftaran Anda ditolak.' });
    return NextResponse.json({ success: true, profile: updated });
  } else if (action === 'delete') {
    const { error } = await supabaseAdmin.from('profiles').delete().eq('id', user_id);
    if (error) return NextResponse.json({ error: "Delete failed" }, { status: 500 });
    return NextResponse.json({ success: true });
  }
  return NextResponse.json({ error: "Invalid action" }, { status: 400 });
}