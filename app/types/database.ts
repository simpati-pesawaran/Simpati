// ============================================================================
// SIMPATI Database Types
// Generated from database schema
// ============================================================================

// Enums
export type UserRole = 'superadmin' | 'admin';
export type ApprovalStatus = 'pending' | 'approved' | 'rejected';
export type AgendaJenis = 'agenda' | 'audiensi';
export type AgendaStatus = 'draft' | 'published' | 'cancelled';
export type NotificationType =
  | 'user_registered'
  | 'user_approved'
  | 'user_rejected'
  | 'agenda_created'
  | 'agenda_updated'
  | 'agenda_deleted'
  | 'agenda_reminder'
  | 'usulan_new'
  | 'sync_failed'
  | 'profile_updated'
  | 'share_created'
  | 'media_uploaded'
  | 'media_deleted';
export type ActionType = 'create' | 'update' | 'delete' | 'approve' | 'reject' | 'login' | 'logout' | 'view' | 'sync' | 'submit' | 'publish' | 'cancel' | 'sync_failure' | 'share';
export type EntityType = 'profile' | 'agenda' | 'notification' | 'gallery' | 'auth' | 'usulan' | 'google_sheets' | 'share' | 'share_link';
export type FileType = 'image' | 'document';

// Database Tables
export interface Profile {
  id: string;
  user_id: string | null;
  email: string;
  name: string;
  division: string | null;
  avatar_url: string | null;
  role: UserRole;
  status: ApprovalStatus;
  approved_by: string | null;
  approved_at: string | null;
  rejected_by: string | null;
  rejected_at: string | null;
  rejection_reason: string | null;
  created_at: string;
  updated_at: string;
}

export interface Agenda {
  id: string;
  jenis: AgendaJenis;
  title: string;
  description: string | null;
  date: string;
  time_start: string;
  time_end: string;
  location: string | null;
  category: string | null;
  target_audience: string | null;
  status: AgendaStatus;
  google_event_id: string | null;
  google_synced_at: string | null;
  google_sync_error: string | null;
  created_by: string;
  updated_by: string | null;
  deleted_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface Notification {
  id: string;
  user_id: string;
  type: NotificationType;
  title: string;
  message: string | null;
  data: Record<string, unknown>;
  is_read: boolean;
  read_at: string | null;
  created_at: string;
  batch_id: string | null;
}

export interface Gallery {
  id: string;
  agenda_id: string | null;
  title: string | null;
  description: string | null;
  file_type: FileType;
  file_name: string;
  storage_path: string;
  thumbnail_path: string | null;
  storage_bucket: string;
  mime_type: string;
  file_size: number | null;
  width: number | null;
  height: number | null;
  storage_year: number;
  storage_month: number;
  uploaded_by: string;
  created_at: string;
}

export interface ActivityLog {
  id: string;
  user_id: string;
  user_name: string;
  user_email: string;
  action: ActionType;
  entity_type: EntityType;
  entity_id: string;
  description: string | null;
  old_data: Record<string, unknown> | null;
  new_data: Record<string, unknown> | null;
  ip_address: string | null;
  user_agent: string | null;
  created_at: string;
}

export interface Settings {
  key: string;
  value: Record<string, unknown>;
  updated_at: string;
  updated_by: string | null;
}

// Extended Types (with joins)
export interface AgendaWithCreator extends Agenda {
  creator_name: string;
  creator_division: string | null;
  creator_email: string;
}

export interface NotificationWithUser extends Notification {
  user_name?: string;
}

export interface GalleryWithDetails extends Gallery {
  uploader_name: string;
  uploader_division: string | null;
  agenda_title: string | null;
  agenda_date: string | null;
}

// API Response Types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: unknown;
  };
}

export interface PaginatedResponse<T> {
  data: T[];
  count: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

// Form Types
export interface LoginSetupForm {
  name: string;
  division: string;
}

export interface ApprovalForm {
  userId: string;
  action: 'approve' | 'reject';
  reason?: string;
}

// Dashboard Stats
export interface AgendaStats {
  total: number;
  total_kegiatan: number;
  total_audiensi: number;
  draft: number;
  published: number;
  upcoming: number;
}

// Superadmin constant
export const SUPERADMIN_EMAIL = 'siagapesyaratan@gmail.com';
