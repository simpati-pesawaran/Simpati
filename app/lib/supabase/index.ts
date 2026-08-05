// ============================================================================
// Supabase Client Setup
// ============================================================================

import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/app/types/database';

// Environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// Check if environment variables are configured
export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

// ============================================================================
// Client-side Supabase client (for browser)
// ============================================================================

export const supabase = isSupabaseConfigured
  ? createClient<Database>(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
      },
    })
  : createClient<Database>('https://placeholder.supabase.co', 'placeholder-key');

// ============================================================================
// Server-side Supabase client (for API routes)
// Uses service role key for admin operations
// ============================================================================

export const supabaseAdmin = isSupabaseConfigured
  ? createClient<Database>(supabaseUrl, supabaseServiceKey, {
      auth: {
        persistSession: false,
      },
    })
  : createClient<Database>('https://placeholder.supabase.co', 'placeholder-key');

// ============================================================================
// Helper functions
// ============================================================================

/**
 * Get the current user from Supabase
 */
export async function getCurrentUser() {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}

/**
 * Get user profile from profiles table
 */
export async function getUserProfile(userId: string) {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('user_id', userId)
    .single();

  if (error) {
    console.error('Error fetching profile:', error);
    return null;
  }

  return data;
}

/**
 * Get user profile by email
 */
export async function getUserProfileByEmail(email: string) {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('email', email.toLowerCase())
    .single();

  if (error) {
    console.error('Error fetching profile by email:', error);
    return null;
  }

  return data;
}

/**
 * Check if user is superadmin
 */
export function isSuperadmin(email: string): boolean {
  return email.toLowerCase() === 'siagapesyaratan@gmail.com';
}

/**
 * Update user profile
 */
export async function updateProfile(
  userId: string,
  updates: Partial<{
    name: string;
    division: string;
    avatar_url: string;
  }>
) {
  const { data, error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('user_id', userId)
    .select()
    .single();

  if (error) {
    console.error('Error updating profile:', error);
    return { success: false, error };
  }

  return { success: true, data };
}

/**
 * Get unread notification count for a user
 */
export async function getUnreadNotificationCount(userId: string): Promise<number> {
  const { count, error } = await supabase
    .from('notifications')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)
    .eq('is_read', false);

  if (error) {
    console.error('Error getting notification count:', error);
    return 0;
  }

  return count ?? 0;
}

/**
 * Get notifications for a user
 */
export async function getNotifications(
  userId: string,
  options: { limit?: number; offset?: number } = {}
) {
  const { limit = 20, offset = 0 } = options;

  const { data, error, count } = await supabase
    .from('notifications')
    .select('*', { count: 'exact' })
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) {
    console.error('Error fetching notifications:', error);
    return { data: [], count: 0, error };
  }

  return { data, count: count ?? 0 };
}

/**
 * Mark notifications as read
 */
export async function markNotificationsAsRead(
  userId: string,
  notificationIds?: string[]
) {
  if (notificationIds && notificationIds.length > 0) {
    const { error } = await supabase
      .from('notifications')
      .update({ is_read: true, read_at: new Date().toISOString() })
      .eq('user_id', userId)
      .in('id', notificationIds);

    if (error) {
      console.error('Error marking notifications as read:', error);
      return { success: false, error };
    }
  } else {
    // Mark all as read
    const { error } = await supabase
      .from('notifications')
      .update({ is_read: true, read_at: new Date().toISOString() })
      .eq('user_id', userId)
      .eq('is_read', false);

    if (error) {
      console.error('Error marking all notifications as read:', error);
      return { success: false, error };
    }
  }

  return { success: true };
}
