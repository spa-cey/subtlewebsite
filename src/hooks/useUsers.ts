import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { User, UserFilters, SortConfig, AdminNote, UserActivity, UserSession, BillingHistory, BulkAction } from '@/types/admin';
import { apiClient } from '@/lib/api';

// Query Keys
export const userKeys = {
  all: ['users'] as const,
  lists: () => [...userKeys.all, 'list'] as const,
  list: (filters?: UserFilters, sort?: SortConfig, page?: number) => 
    [...userKeys.lists(), { filters, sort, page }] as const,
  details: () => [...userKeys.all, 'detail'] as const,
  detail: (id: string) => [...userKeys.details(), id] as const,
  activity: (id: string) => [...userKeys.all, 'activity', id] as const,
  sessions: (id: string) => [...userKeys.all, 'sessions', id] as const,
  notes: (id: string) => [...userKeys.all, 'notes', id] as const,
  billing: (id: string) => [...userKeys.all, 'billing', id] as const,
  stats: () => [...userKeys.all, 'stats'] as const,
};

// Fetch Users Hook
export const useUsers = (
  filters: UserFilters,
  sortConfig: SortConfig,
  page: number = 1,
  pageSize: number = 25
) => {
  return useQuery({
    queryKey: userKeys.list(filters, sortConfig, page),
    queryFn: async () => {
      const params: any = {
        page,
        pageSize,
      };

      // Apply search filter
      if (filters.search) {
        params.search = filters.search;
      }

      // Apply subscription filter
      if (filters.subscription !== 'all') {
        params.subscriptionTier = filters.subscription;
      }

      // Apply date range filter
      if (filters.dateRange.from) {
        params.dateFrom = filters.dateRange.from.toISOString();
      }
      if (filters.dateRange.to) {
        params.dateTo = filters.dateRange.to.toISOString();
      }

      // Apply sorting
      if (sortConfig.key) {
        params.sortBy = sortConfig.key;
        params.sortOrder = sortConfig.direction;
      }

      const response = await apiClient.getUsers(params);

      return {
        users: response.users || [],
        totalCount: response.pagination?.total || 0,
        pageCount: response.pagination?.totalPages || 0,
        currentPage: response.pagination?.page || 1,
      };
    },
    refetchInterval: 30000, // Auto-refresh every 30 seconds
    staleTime: 10000,
  });
};

// Fetch Single User Hook
export const useUser = (userId: string) => {
  return useQuery({
    queryKey: userKeys.detail(userId),
    queryFn: async () => {
      const userData = await apiClient.getUserById(userId);
      return userData;
    },
    enabled: !!userId,
  });
};

// Update User Hook
export const useUpdateUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ userId, updates }: { userId: string; updates: Partial<User> }) => {
      const userData = await apiClient.updateUser(userId, updates);
      return userData;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: userKeys.lists() });
      queryClient.setQueryData(userKeys.detail(data.id), data);
    },
  });
};

// Delete User Hook
export const useDeleteUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (userId: string) => {
      // For now, we'll use the update API to set status as deleted
      // This may need to be adjusted based on the actual backend implementation
      await apiClient.updateUser(userId, { subscriptionTier: 'free' }); // Placeholder
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: userKeys.lists() });
    },
  });
};

// Bulk Actions Hook
export const useBulkAction = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ action, userIds }: { action: BulkAction; userIds: string[] }) => {
      const response = await apiClient.bulkAction(userIds, action);
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: userKeys.lists() });
    },
  });
};

// User Activity Hook
export const useUserActivity = (userId: string) => {
  return useQuery({
    queryKey: userKeys.activity(userId),
    queryFn: async () => {
      const response = await apiClient.getUserActivity(userId);
      return response.activities as UserActivity[];
    },
    enabled: !!userId,
  });
};

// User Sessions Hook with Mac App Integration
export const useUserSessions = (userId: string) => {
  const queryClient = useQueryClient();

  const sessionsQuery = useQuery({
    queryKey: userKeys.sessions(userId),
    queryFn: async () => {
      const response = await apiClient.getUserSessions(userId);
      
      return {
        sessions: response.sessions as UserSession[],
        sessionSyncLogs: [], // Not implemented yet
      };
    },
    enabled: !!userId,
  });

  const revokeSession = useMutation({
    mutationFn: async (sessionId: string) => {
      // Session revocation not implemented in API yet
      console.log('Session revocation not yet implemented:', sessionId);
      throw new Error('Session revocation not yet implemented');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: userKeys.sessions(userId) });
    },
  });

  const revokeAllOtherSessions = useMutation({
    mutationFn: async () => {
      // Session revocation not implemented in API yet
      console.log('Bulk session revocation not yet implemented');
      throw new Error('Bulk session revocation not yet implemented');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: userKeys.sessions(userId) });
    },
  });

  return {
    sessions: sessionsQuery.data?.sessions || [],
    sessionSyncLogs: sessionsQuery.data?.sessionSyncLogs || [],
    isLoading: sessionsQuery.isLoading,
    error: sessionsQuery.error,
    revokeSession: revokeSession.mutateAsync,
    revokeAllOtherSessions: revokeAllOtherSessions.mutateAsync,
  };
};

// Admin Notes Hook
export const useAdminNotes = (userId: string) => {
  return useQuery({
    queryKey: userKeys.notes(userId),
    queryFn: async () => {
      const response = await apiClient.getAdminNotes(userId);
      return response.notes as AdminNote[];
    },
    enabled: !!userId,
  });
};

// Add Admin Note Hook
export const useAddAdminNote = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ userId, note, isFlagged }: { userId: string; note: string; isFlagged: boolean }) => {
      const response = await apiClient.addAdminNote(userId, note, isFlagged);
      return response;
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: userKeys.notes(variables.userId) });
    },
  });
};

// Billing History Hook
export const useBillingHistory = (userId: string) => {
  return useQuery({
    queryKey: userKeys.billing(userId),
    queryFn: async () => {
      const response = await apiClient.getUserBilling(userId);
      return response.billing as BillingHistory[];
    },
    enabled: !!userId,
  });
};

// User Stats Hook
export const useUserStats = () => {
  return useQuery({
    queryKey: userKeys.stats(),
    queryFn: async () => {
      const response = await apiClient.getUserStats();
      return {
        totalUsers: response.totalUsers || 0,
        activeToday: response.activeToday || 0,
        newThisWeek: response.newThisWeek || 0,
      };
    },
    refetchInterval: 60000, // Refresh every minute
  });
};

// Reset Password Hook
export const useResetPassword = () => {
  return useMutation({
    mutationFn: async (email: string) => {
      // Password reset not implemented yet
      console.log('Password reset not yet implemented for:', email);
      throw new Error('Password reset not yet implemented');
    },
  });
};

// Impersonate User Hook
export const useImpersonateUser = () => {
  return useMutation({
    mutationFn: async (userId: string) => {
      // User impersonation not implemented yet
      console.log('User impersonation not yet implemented for:', userId);
      throw new Error('User impersonation not yet implemented');
    },
  });
};

export const useUserUsageAnalytics = (userId: string, timeRange: 'daily' | 'weekly' | 'monthly' = 'weekly') => {
  return useQuery({
    queryKey: ['user-usage-analytics', userId, timeRange],
    queryFn: async () => {
      if (!userId) return null;

      try {
        const response = await apiClient.getUserUsageAnalytics(userId, timeRange);
        return response;
      } catch (error) {
        console.error('Error fetching user usage analytics:', error);
        // Return mock data for now
        return processUserActivityData([], []);
      }
    },
    enabled: !!userId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
};

// Helper function to process raw activity data
const processUserActivityData = (usageData: any[], activityData: any[]) => {
  // Calculate totals
  const totalRequests = usageData.reduce((sum, record) => sum + (record.request_count || 0), 0);
  const totalTokens = usageData.reduce((sum, record) => sum + (record.total_tokens || 0), 0);
  const totalCost = usageData.reduce((sum, record) => sum + (record.total_cost || 0), 0);
  
  // Get last active timestamp
  const lastActive = activityData.length > 0 ? activityData[0].created_at : null;
  
  // Group usage by day for charts
  const dailyUsage = usageData.reduce((acc, record) => {
    const date = new Date(record.created_at).toDateString();
    if (!acc[date]) {
      acc[date] = { requests: 0, tokens: 0, cost: 0 };
    }
    acc[date].requests += record.request_count || 0;
    acc[date].tokens += record.total_tokens || 0;
    acc[date].cost += record.total_cost || 0;
    return acc;
  }, {});
  
  // Usage by feature
  const usageByFeature = usageData.reduce((acc, record) => {
    const feature = record.feature || 'unknown';
    if (!acc[feature]) acc[feature] = 0;
    acc[feature] += record.request_count || 0;
    return acc;
  }, {});
  
  // Recent activity
  const recentActivity = activityData.slice(0, 20).map(activity => ({
    timestamp: activity.created_at,
    action: activity.action,
    details: activity.data
  }));

  return {
    totals: {
      requests: totalRequests,
      tokens: totalTokens,
      cost: totalCost,
      lastActive
    },
    dailyUsage: Object.entries(dailyUsage).map(([date, data]) => ({
      date,
      ...(data as any)
    })),
    usageByFeature,
    recentActivity
  };
};