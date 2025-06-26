import { User, UserRole, UserStatus, SubscriptionTier } from '@/types/admin';

// CSV Export Function
export const exportUsersToCSV = (users: User[]) => {
  const headers = [
    'ID',
    'Email',
    'Username',
    'Full Name',
    'Role',
    'Status',
    'Subscription',
    'Created At',
    'Last Sign In',
  ];

  const rows = users.map(user => [
    user.id,
    user.email,
    user.username || '',
    user.full_name || '',
    user.role,
    user.status,
    user.subscription_tier,
    new Date(user.created_at).toLocaleDateString(),
    user.last_sign_in_at ? new Date(user.last_sign_in_at).toLocaleDateString() : '',
  ]);

  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.map(cell => `"${cell}"`).join(',')),
  ].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  link.setAttribute('href', url);
  link.setAttribute('download', `users_export_${new Date().toISOString().split('T')[0]}.csv`);
  link.style.visibility = 'hidden';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

// Format Functions
export const formatUserRole = (role: UserRole): string => {
  const roleMap: Record<UserRole, string> = {
    user: 'User',
    support: 'Support',
    admin: 'Admin',
    super_admin: 'Super Admin',
  };
  return roleMap[role];
};

export const formatUserStatus = (status: UserStatus): string => {
  const statusMap: Record<UserStatus, string> = {
    active: 'Active',
    suspended: 'Suspended',
    deleted: 'Deleted',
  };
  return statusMap[status];
};

export const formatSubscriptionTier = (tier: SubscriptionTier): string => {
  const tierMap: Record<SubscriptionTier, string> = {
    free: 'Free',
    basic: 'Basic',
    pro: 'Pro',
    enterprise: 'Enterprise',
  };
  return tierMap[tier];
};

// Color Functions
export const getRoleColor = (role: UserRole): string => {
  const colorMap: Record<UserRole, string> = {
    user: 'bg-gray-100 text-gray-700',
    support: 'bg-blue-100 text-blue-700',
    admin: 'bg-purple-100 text-purple-700',
    super_admin: 'bg-red-100 text-red-700',
  };
  return colorMap[role];
};

export const getStatusColor = (status: UserStatus): string => {
  const colorMap: Record<UserStatus, string> = {
    active: 'bg-green-100 text-green-700',
    suspended: 'bg-yellow-100 text-yellow-700',
    deleted: 'bg-red-100 text-red-700',
  };
  return colorMap[status];
};

export const getSubscriptionColor = (tier: SubscriptionTier): string => {
  const colorMap: Record<SubscriptionTier, string> = {
    free: 'bg-gray-100 text-gray-700',
    basic: 'bg-blue-100 text-blue-700',
    pro: 'bg-purple-100 text-purple-700',
    enterprise: 'bg-orange-100 text-orange-700',
  };
  return colorMap[tier];
};

// Date Functions
export const formatDate = (date: string): string => {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

export const formatDateTime = (date: string): string => {
  return new Date(date).toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

export const getRelativeTime = (date: string): string => {
  const now = new Date();
  const then = new Date(date);
  const diffInSeconds = Math.floor((now.getTime() - then.getTime()) / 1000);

  if (diffInSeconds < 60) return 'just now';
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
  if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;
  
  return formatDate(date);
};

// Alias for backward compatibility
export const formatRelativeTime = getRelativeTime;

// Online Status Helper
export const getOnlineStatus = (lastSignInAt?: string): boolean => {
  if (!lastSignInAt) return false;
  
  const now = new Date();
  const lastSignIn = new Date(lastSignInAt);
  const diffInMinutes = (now.getTime() - lastSignIn.getTime()) / (1000 * 60);
  
  // Consider online if signed in within last 5 minutes
  return diffInMinutes < 5;
};

// Validation Functions
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const isStrongPassword = (password: string): boolean => {
  // At least 8 characters, one uppercase, one lowercase, one number, one special character
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
  return passwordRegex.test(password);
};

// Search Functions
export const searchUsers = (users: User[], searchTerm: string): User[] => {
  const term = searchTerm.toLowerCase();
  return users.filter(user =>
    user.email.toLowerCase().includes(term) ||
    user.username?.toLowerCase().includes(term) ||
    user.full_name?.toLowerCase().includes(term) ||
    user.id.toLowerCase().includes(term)
  );
};

// Sort Functions
export const sortUsers = (users: User[], key: keyof User, direction: 'asc' | 'desc'): User[] => {
  return [...users].sort((a, b) => {
    const aValue = a[key];
    const bValue = b[key];

    if (aValue === null || aValue === undefined) return 1;
    if (bValue === null || bValue === undefined) return -1;

    if (typeof aValue === 'string' && typeof bValue === 'string') {
      return direction === 'asc' 
        ? aValue.localeCompare(bValue)
        : bValue.localeCompare(aValue);
    }

    if (aValue < bValue) return direction === 'asc' ? -1 : 1;
    if (aValue > bValue) return direction === 'asc' ? 1 : -1;
    return 0;
  });
};

// Bulk Selection Helpers
export const getSelectedCount = (selectedIds: Set<string>): number => {
  return selectedIds.size;
};

export const toggleSelection = (selectedIds: Set<string>, userId: string): Set<string> => {
  const newSet = new Set(selectedIds);
  if (newSet.has(userId)) {
    newSet.delete(userId);
  } else {
    newSet.add(userId);
  }
  return newSet;
};

export const selectAll = (users: User[]): Set<string> => {
  return new Set(users.map(user => user.id));
};

export const clearSelection = (): Set<string> => {
  return new Set();
};

// Activity Helpers
export const formatActivity = (action: string): string => {
  const actionMap: Record<string, string> = {
    login: 'Logged in',
    logout: 'Logged out',
    update_profile: 'Updated profile',
    change_password: 'Changed password',
    enable_2fa: 'Enabled 2FA',
    disable_2fa: 'Disabled 2FA',
    subscription_upgrade: 'Upgraded subscription',
    subscription_downgrade: 'Downgraded subscription',
  };
  return actionMap[action] || action;
};

// Session Helpers
export const isSessionActive = (lastActivity: string): boolean => {
  const now = new Date();
  const last = new Date(lastActivity);
  const diffInMinutes = (now.getTime() - last.getTime()) / (1000 * 60);
  return diffInMinutes < 30; // Consider active if activity within last 30 minutes
};

// Note Helpers
export const truncateNote = (note: string, maxLength: number = 100): string => {
  if (note.length <= maxLength) return note;
  return note.substring(0, maxLength) + '...';
};

// Subscription Helpers
export const isSubscriptionActive = (expiresAt?: string): boolean => {
  if (!expiresAt) return false;
  return new Date(expiresAt) > new Date();
};

export const getDaysUntilExpiry = (expiresAt: string): number => {
  const now = new Date();
  const expiry = new Date(expiresAt);
  const diffInMs = expiry.getTime() - now.getTime();
  return Math.ceil(diffInMs / (1000 * 60 * 60 * 24));
};

// User Display Helpers
export const getUserDisplayName = (user: User): string => {
  return user.full_name || user.username || user.email;
};

export const getUserInitials = (user: User): string => {
  const name = getUserDisplayName(user);
  const parts = name.split(' ');
  
  if (parts.length >= 2) {
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }
  
  return name.substring(0, 2).toUpperCase();
};

// Table Preference Helpers
export const saveTablePreferences = (preferences: any): void => {
  localStorage.setItem('userTablePreferences', JSON.stringify(preferences));
};

export const loadTablePreferences = (): any => {
  const saved = localStorage.getItem('userTablePreferences');
  return saved ? JSON.parse(saved) : null;
};

// Keyboard Shortcut Helpers
export const handleKeyboardShortcuts = (event: KeyboardEvent, callbacks: Record<string, () => void>): void => {
  const key = event.key.toLowerCase();
  const ctrlOrCmd = event.ctrlKey || event.metaKey;

  if (key === '/' && !ctrlOrCmd) {
    event.preventDefault();
    callbacks.focusSearch?.();
  } else if (key === 'a' && ctrlOrCmd) {
    event.preventDefault();
    callbacks.selectAll?.();
  } else if (key === 'escape') {
    event.preventDefault();
    callbacks.clearSelection?.();
  } else if (key === 'e' && ctrlOrCmd) {
    event.preventDefault();
    callbacks.exportSelected?.();
  }
};