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

// User Sessions Hook
export const useUserSessions = (userId: string) => {
  return useQuery({
    queryKey: userKeys.sessions(userId),
    queryFn: async () => {
      const { data, error } = await supabase
        .from('user_sessions')
        .select('*')
        .eq('user_id', userId)
        .order('last_activity', { ascending: false });

      if (error) throw error;
      return data as UserSession[];
    },
    enabled: !!userId,
  });
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