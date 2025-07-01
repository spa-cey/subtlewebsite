// User Management Types
export interface User {
  id: string;
  email: string;
  username?: string;
  full_name?: string;
  avatar_url?: string;
  role: UserRole;
  status: UserStatus;
  subscription_tier: SubscriptionTier;
  subscription_expires_at?: string;
  last_sign_in_at?: string;
  created_at: string;
  updated_at: string;
  is_online?: boolean;
  metadata?: Record<string, any>;
}

export type UserRole = 'free' | 'pro' | 'enterprise' | 'admin';
export type UserStatus = 'active' | 'suspended' | 'deleted';
export type SubscriptionTier = 'free' | 'pro' | 'enterprise' | 'admin';

export interface UserFilters {
  search: string;
  status: UserStatus | 'all';
  role: UserRole | 'all';
  subscription: SubscriptionTier | 'all';
  dateRange: DateRange;
}

export interface DateRange {
  from: Date | null;
  to: Date | null;
}

export interface UserActivity {
  id: string;
  user_id: string;
  action: string;
  details?: Record<string, any>;
  ip_address?: string;
  user_agent?: string;
  created_at: string;
}

export interface UserSession {
  id: string;
  user_id: string;
  ip_address: string;
  user_agent: string;
  last_activity: string;
  created_at: string;
}

export interface AdminNote {
  id: string;
  user_id: string;
  admin_id: string;
  note: string;
  is_flagged: boolean;
  created_at: string;
  admin?: {
    email: string;
    full_name?: string;
  };
}

export interface BillingHistory {
  id: string;
  user_id: string;
  amount: number;
  currency: string;
  status: 'paid' | 'pending' | 'failed';
  description: string;
  created_at: string;
}

export interface SortConfig {
  key: keyof User | null;
  direction: 'asc' | 'desc';
}

export interface BulkAction {
  type: 'activate' | 'suspend' | 'delete' | 'change_subscription' | 'export' | 'email';
  payload?: any;
}

export interface TablePreferences {
  pageSize: number;
  sortConfig: SortConfig;
  columnVisibility?: Record<string, boolean>;
}

// Audit Log Types
export interface AuditLog {
  id: string;
  admin_id: string;
  user_id?: string;
  action: string;
  details: Record<string, any>;
  ip_address: string;
  created_at: string;
}

// Permission Types
export const ROLE_PERMISSIONS: Record<UserRole, string[]> = {
  free: [],
  pro: ['priority_support'],
  enterprise: ['priority_support', 'custom_integrations'],
  admin: ['view_users', 'edit_users', 'add_notes', 'change_subscription', 'suspend_users', 'delete_users', 'impersonate_users', 'change_roles', 'system_admin']
};

export const hasPermission = (userRole: UserRole, permission: string): boolean => {
  return ROLE_PERMISSIONS[userRole]?.includes(permission) || false;
};