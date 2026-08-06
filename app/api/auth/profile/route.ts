// ============================================================================
// Auth Profile API
// Handles profile creation and status checks
// ============================================================================

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../auth/[...nextauth]/route";
import { supabaseAdmin } from "@/app/lib/supabase";

// Superadmin constant
const SUPERADMIN_EMAIL = "siagapesasakan@gmail.com";

/**
 * GET /api/auth/profile
 * Get current user's profile status
 */
export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const email = session.user.email;

  // Check if profile exists
  const { data: profile, error } = await supabaseAdmin
    .from('profiles')
    .select('*')
    .eq('email', email)
    .single();

  if (error && error.code === 'PGRST116') {
    // Profile doesn't exist - new user
    return NextResponse.json({
      exists: false,
      isSuperadmin: email.toLowerCase() === SUPERADMIN_EMAIL.toLowerCase(),
      needsSetup: true,
    });
  }

  if (error) {
    return NextResponse.json({ error: "Database error" }, { status: 500 });
  }

  return NextResponse.json({
    exists: true,
    isSuperadmin: email.toLowerCase() === SUPERADMIN_EMAIL.toLowerCase(),
    profile: {
      id: profile.id,
      name: profile.name,
      division: profile.division,
      role: profile.role,
      status: profile.status,
      rejection_reason: profile.rejection_reason,
    },
  });
}

/**
 * POST /api/auth/profile
 * Create or update user profile (after Google login)
 */
export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { name, division } = body;

  if (!name || !division) {
    return NextResponse.json(
      { error: "Name and division are required" },
      { status: 400 }
    );
  }

  const email = session.user.email;
  const isSuperadmin = email.toLowerCase() === SUPERADMIN_EMAIL.toLowerCase();

  // Check if profile already exists
  const { data: existingProfile } = await supabaseAdmin
    .from('profiles')
    .select('id')
    .eq('email', email)
    .single();

  if (existingProfile) {
    // Update existing profile
    const { data: updated, error } = await supabaseAdmin
      .from('profiles')
      .update({
        name,
        division,
        status: isSuperadmin ? 'approved' : 'pending',
        approved_at: isSuperadmin ? new Date().toISOString() : null,
      })
      .eq('email', email)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: "Update failed" }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      profile: updated,
      isSuperadmin,
    });
  }

  // Create new profile
  const { data: newProfile, error } = await supabaseAdmin
    .from('profiles')
    .insert({
      email,
      name,
      division,
      role: isSuperadmin ? 'superadmin' : 'admin',
      status: isSuperadmin ? 'approved' : 'pending',
      approved_at: isSuperadmin ? new Date().toISOString() : null,
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: "Creation failed" }, { status: 500 });
  }

  // If not superadmin, notify superadmin
  if (!isSuperadmin) {
    const { data: superadmin } = await supabaseAdmin
      .from('profiles')
      .select('id')
      .eq('role', 'superadmin')
      .single();

    if (superadmin) {
      await supabaseAdmin
        .from('notifications')
        .insert({
          user_id: superadmin.id,
          type: 'user_registered',
          title: 'Pendaftaran Baru',
          message: `${name} (${email}) meminta akses ke SIMPATI - Divisi ${division}`,
          data: {
            new_user_email: email,
            new_user_name: name,
            new_user_division: division,
            new_user_id: newProfile.id,
          },
        });
    }
  }

  return NextResponse.json({
    success: true,
    profile: newProfile,
    isSuperadmin,
    needsApproval: !isSuperadmin,
  });
}

/**
 * PUT /api/auth/profile
 * Update user profile (name and division)
 * Used by approved users to edit their profile
 */
export async function PUT(request: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { name, division } = body;

  if (!name && !division) {
    return NextResponse.json(
      { error: "Name or division is required" },
      { status: 400 }
    );
  }

  const email = session.user.email;

  // Get current profile
  const { data: currentProfile } = await supabaseAdmin
    .from('profiles')
    .select('status')
    .eq('email', email)
    .single();

  // Build update object
  const updateData: Record<string, string | null> = {};
  if (name !== undefined) updateData.name = name;
  if (division !== undefined) updateData.division = division;

  // If user is re-applying after rejection, reset status
  if (currentProfile?.status === 'rejected') {
    updateData.status = 'pending';
    updateData.rejected_by = null;
    updateData.rejected_at = null;
    updateData.rejection_reason = null;
  }

  // Update profile
  const { data: updated, error } = await supabaseAdmin
    .from('profiles')
    .update(updateData)
    .eq('email', email)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: "Update failed" }, { status: 500 });
  }

  // If re-applying, notify superadmin
  if (currentProfile?.status === 'rejected') {
    const { data: superadmin } = await supabaseAdmin
      .from('profiles')
      .select('id')
      .eq('role', 'superadmin')
      .single();

    if (superadmin) {
      await supabaseAdmin
        .from('notifications')
        .insert({
          user_id: superadmin.id,
          type: 'user_registered',
          title: 'Pendaftaran Ulang',
          message: `${name} (${email}) mengajukan ulang akses ke SIMPATI`,
          data: {
            new_user_email: email,
            new_user_name: name,
            new_user_division: division,
            reapply: true,
          },
        });
    }
  }

  return NextResponse.json({
    success: true,
    profile: updated,
  });
}
