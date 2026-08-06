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
  console.log("PROFILE API");
  const session = await getServerSession(authOptions);
  console.log("session =", session);

  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

    const email = session.user.email;
    console.log('API: Checking profile for email:', email);
    console.log('API: SUPERADMIN_EMAIL:', SUPERADMIN_EMAIL);
    console.log('API: isSuperadmin check:', email.toLowerCase() === SUPERADMIN_EMAIL.toLowerCase());

    // Check if profile exists
    console.log('API: Querying Supabase profiles table...');
    const { data: profile, error } = await supabaseAdmin
      .from('profiles')
      .select('*')
      .eq('email', email)
      .single();

    console.log('API: Supabase query result - profile:', JSON.stringify(profile));
    console.log('API: Supabase query result - error:', JSON.stringify(error));

    if (error && error.code === 'PGRST116') {
      // Profile doesn't exist - new user
      console.log('API: Profile NOT FOUND (new user)');
      const response = {
        exists: false,
        isSuperadmin: email.toLowerCase() === SUPERADMIN_EMAIL.toLowerCase(),
        needsSetup: true,
      };
      console.log('API: Returning response:', JSON.stringify(response));
      return NextResponse.json(response);
    }

    if (error) {
      console.error("Error fetching profile:", error);
      console.log('API: Database error - returning 500');
      return NextResponse.json({ error: "Database error" }, { status: 500 });
    }

    const response = {
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
    };
    console.log('API: Returning success response:', JSON.stringify(response));
    return NextResponse.json(response);
  } catch (error) {
    console.error("GET /api/auth/profile error:", error);
    console.log('API: Exception caught - returning 500');
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

/**
 * POST /api/auth/profile
 * Create or update user profile (after Google login)
 */
export async function POST(request: NextRequest) {
  console.log('=== [API] /api/auth/profile POST ===');

  try {
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
        console.error("Error updating profile:", error);
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
      console.error("Error creating profile:", error);
      return NextResponse.json({ error: "Creation failed" }, { status: 500 });
    }

    // If not superadmin, notify superadmin
    if (!isSuperadmin) {
      // Get superadmin profile
      const { data: superadmin } = await supabaseAdmin
        .from('profiles')
        .select('id')
        .eq('role', 'superadmin')
        .single();

      if (superadmin) {
        // Create notification for superadmin
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
  } catch (error) {
    console.error("POST /api/auth/profile error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

/**
 * PUT /api/auth/profile
 * Re-apply after rejection
 */
export async function PUT(request: NextRequest) {
  try {
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

    // Update profile and reset status to pending
    const { data: updated, error } = await supabaseAdmin
      .from('profiles')
      .update({
        name,
        division,
        status: 'pending',
        rejected_by: null,
        rejected_at: null,
        rejection_reason: null,
        approved_by: null,
        approved_at: null,
      })
      .eq('email', email)
      .select()
      .single();

    if (error) {
      console.error("Error re-applying:", error);
      return NextResponse.json({ error: "Update failed" }, { status: 500 });
    }

    // Notify superadmin
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

    return NextResponse.json({
      success: true,
      profile: updated,
    });
  } catch (error) {
    console.error("PUT /api/auth/profile error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
