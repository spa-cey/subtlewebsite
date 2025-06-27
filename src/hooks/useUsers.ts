import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { User, UserFilters, SortConfig, AdminNote, UserActivity, UserSession, BillingHistory, BulkAction } from '@/types/admin';
import { supabase } from '@/lib/supabase';
import { exportUsersToCSV } from '@/lib/admin/userUtils';

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
      let query = supabase.from('users').select('*', { count: 'exact' });

      // Apply search filter
      if (filters.search) {
        query = query.or(`email.ilike.%${filters.search}%,full_name.ilike.%${filters.search}%,username.ilike.%${filters.search}%`);
      }

      // Apply status filter
      if (filters.status !== 'all') {
        query = query.eq('status', filters.status);
      }

      // Apply role filter
      if (filters.role !== 'all') {
        query = query.eq('role', filters.role);
      }

      // Apply subscription filter
      if (filters.subscription !== 'all') {
        query = query.eq('subscription_tier', filters.subscription);
      }

      // Apply date range filter
      if (filters.dateRange.from) {
        query = query.gte('created_at', filters.dateRange.from.toISOString());
      }
      if (filters.dateRange.to) {
        query = query.lte('created_at', filters.dateRange.to.toISOString());
      }

      // Apply sorting
      if (sortConfig.key) {
        query = query.order(sortConfig.key, { ascending: sortConfig.direction === 'asc' });
      } else {
        query = query.order('created_at', { ascending: false });
      }

      // Apply pagination
      const from = (page - 1) * pageSize;
      const to = from + pageSize - 1;
      query = query.range(from, to);

      const { data, error, count } = await query;

      if (error) throw error;

      return {
        users: data || [],
        totalCount: count || 0,
        pageCount: Math.ceil((count || 0) / pageSize),
        currentPage: page,
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
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!userId,
  });
};

// Update User Hook
export const useUpdateUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ userId, updates }: { userId: string; updates: Partial<User> }) => {
      const { data, error } = await supabase
        .from('users')
        .update(updates)
        .eq('id', userId)
        .select()
        .single();

      if (error) throw error;
      return data;
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
      const { error } = await supabase
        .from('users')
        .update({ status: 'deleted' })
        .eq('id', userId);

      if (error) throw error;
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
      switch (action.type) {
        case 'activate':
          await supabase
            .from('users')
            .update({ status: 'active' })
            .in('id', userIds);
          break;
        
        case 'suspend':
          await supabase
            .from('users')
            .update({ status: 'suspended' })
            .in('id', userIds);
          break;
        
        case 'delete':
          await supabase
            .from('users')
            .update({ status: 'deleted' })
            .in('id', userIds);
          break;
        
        case 'change_subscription':
          await supabase
            .from('users')
            .update({ subscription_tier: action.payload.tier })
            .in('id', userIds);
          break;
        
        case 'export':
          const { data } = await supabase
            .from('users')
            .select('*')
            .in('id', userIds);
          
          if (data) {
            exportUsersToCSV(data);
          }
          break;
      }
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
      const { data, error } = await supabase
        .from('user_activity')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      return data as UserActivity[];
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
      // Fetch sessions with related bridge tokens
      const { data: sessions, error: sessionsError } = await supabase
        .from('user_sessions')
        .select(`
          *,
          session_bridge_tokens:session_bridge_tokens(*)
        `)
        .eq('user_id', userId)
        .order('last_activity', { ascending: false });

      if (sessionsError) throw sessionsError;

      // Fetch session sync logs
      const { data: syncLogs, error: syncError } = await supabase
        .from('session_sync_logs')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(20);

      if (syncError) console.warn('Error fetching sync logs:', syncError);

      return {
        sessions: sessions as UserSession[],
        sessionSyncLogs: syncLogs || [],
      };
    },
    enabled: !!userId,
  });

  const revokeSession = useMutation({
    mutationFn: async (sessionId: string) => {
      const { error } = await supabase
        .from('user_sessions')
        .update({ status: 'revoked', revoked_at: new Date().toISOString() })
        .eq('id', sessionId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: userKeys.sessions(userId) });
    },
  });

  const revokeAllOtherSessions = useMutation({
    mutationFn: async () => {
      // Get current session ID (this would be from auth context in real app)
      const { data: currentUser } = await supabase.auth.getUser();
      
      const { error } = await supabase
        .from('user_sessions')
        .update({ status: 'revoked', revoked_at: new Date().toISOString() })
        .eq('user_id', userId)
        .neq('id', currentUser?.user?.id); // Don't revoke current session

      if (error) throw error;
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
      const { data, error } = await supabase
        .from('admin_notes')
        .select(`
          *,
          admin:admin_id (
            email,
            full_name
          )
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as AdminNote[];
    },
    enabled: !!userId,
  });
};

// Add Admin Note Hook
export const useAddAdminNote = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ userId, note, isFlagged }: { userId: string; note: string; isFlagged: boolean }) => {
      const { data: userData } = await supabase.auth.getUser();
      
      const { data, error } = await supabase
        .from('admin_notes')
        .insert({
          user_id: userId,
          admin_id: userData?.user?.id,
          note,
          is_flagged: isFlagged,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: userKeys.notes(data.user_id) });
    },
  });
};

// Billing History Hook
export const useBillingHistory = (userId: string) => {
  return useQuery({
    queryKey: userKeys.billing(userId),
    queryFn: async () => {
      const { data, error } = await supabase
        .from('billing_history')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as BillingHistory[];
    },
    enabled: !!userId,
  });
};

// User Stats Hook
export const useUserStats = () => {
  return useQuery({
    queryKey: userKeys.stats(),
    queryFn: async () => {
      const now = new Date();
      const todayStart = new Date(now.setHours(0, 0, 0, 0));
      const weekAgo = new Date(now.setDate(now.getDate() - 7));

      const [totalResult, activeResult, newResult] = await Promise.all([
        supabase.from('users').select('*', { count: 'exact', head: true }),
        supabase
          .from('users')
          .select('*', { count: 'exact', head: true })
          .gte('last_sign_in_at', todayStart.toISOString()),
        supabase
          .from('users')
          .select('*', { count: 'exact', head: true })
          .gte('created_at', weekAgo.toISOString()),
      ]);

      return {
        totalUsers: totalResult.count || 0,
        activeToday: activeResult.count || 0,
        newThisWeek: newResult.count || 0,
      };
    },
    refetchInterval: 60000, // Refresh every minute
  });
};

// Reset Password Hook
export const useResetPassword = () => {
  return useMutation({
    mutationFn: async (email: string) => {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) throw error;
    },
  });
};

// Impersonate User Hook
export const useImpersonateUser = () => {
  return useMutation({
    mutationFn: async (userId: string) => {
      // This would typically involve creating a special admin session
      // For now, we'll just log the action
      console.log('Impersonating user:', userId);
      
      // Create audit log
      const { data: userData } = await supabase.auth.getUser();
      await supabase.from('audit_logs').insert({
        admin_id: userData?.user?.id,
        user_id: userId,
        action: 'impersonate_user',
        details: { impersonated_user_id: userId },
        ip_address: window.location.hostname,
      });
    },
  });
};

export const useUserUsageAnalytics = (userId: string, timeRange: 'daily' | 'weekly' | 'monthly' = 'weekly') => {
  return useQuery({
    queryKey: ['user-usage-analytics', userId, timeRange],
    queryFn: async () => {
      if (!userId) return null

      // Get the date range based on timeRange
      const now = new Date()
      let startDate = new Date()
      
      switch (timeRange) {
        case 'daily':
          startDate.setDate(now.getDate() - 30) // Last 30 days
          break
        case 'weekly':
          startDate.setDate(now.getDate() - 90) // Last ~3 months
          break
        case 'monthly':
          startDate.setMonth(now.getMonth() - 12) // Last 12 months
          break
      }

      // Fetch usage metrics
      const { data: usageData, error: usageError } = await supabase
        .from('user_usage_metrics')
        .select('*')
        .eq('user_id', userId)
        .gte('created_at', startDate.toISOString())
        .order('created_at', { ascending: true })

      if (usageError) {
        console.error('Error fetching usage data:', usageError)
      }

      // Fetch recent activity from user_sessions or activity logs
      const { data: activityData, error: activityError } = await supabase
        .from('user_sessions')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(50)

      if (activityError) {
        console.error('Error fetching activity data:', activityError)
      }

      // Process and aggregate the data
      const processedData = processUserActivityData(usageData || [], activityData || [])
      
      return processedData
    },
    enabled: !!userId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  })
}

// Helper function to process raw activity data
const processUserActivityData = (usageData: any[], activityData: any[]) => {
  // Calculate totals
  const totalRequests = usageData.reduce((sum, record) => sum + (record.request_count || 0), 0)
  const totalTokens = usageData.reduce((sum, record) => sum + (record.total_tokens || 0), 0)
  const totalCost = usageData.reduce((sum, record) => sum + (record.total_cost || 0), 0)
  
  // Get last active timestamp
  const lastActive = activityData.length > 0 ? activityData[0].created_at : null

  // Group usage by day for trends
  const dailyUsage = usageData.reduce((acc, record) => {
    const date = new Date(record.created_at).toISOString().split('T')[0]
    if (!acc[date]) {
      acc[date] = { date, requests: 0, tokens: 0, cost: 0 }
    }
    acc[date].requests += record.request_count || 0
    acc[date].tokens += record.total_tokens || 0
    acc[date].cost += record.total_cost || 0
    return acc
  }, {} as Record<string, any>)

  // Convert to array and sort
  const dailyUsageArray = Object.values(dailyUsage).sort((a: any, b: any) =>
    new Date(a.date).getTime() - new Date(b.date).getTime()
  )

  // Group by feature type if available
  const usageByFeature = usageData.reduce((acc, record) => {
    const feature = record.feature_type || 'general'
    acc[feature] = (acc[feature] || 0) + (record.request_count || 0)
    return acc
  }, {} as Record<string, number>)

  // Format recent activity
  const recentActivity = activityData.slice(0, 20).map(activity => ({
    action: activity.action || 'API Request',
    timestamp: activity.created_at,
    tokens: activity.tokens_used,
    cost: activity.cost,
    feature: activity.feature_type
  }))

  return {
    totalRequests,
    totalTokens,
    totalCost,
    lastActive,
    dailyUsage: dailyUsageArray,
    recentActivity,
    usageByFeature
  }
}