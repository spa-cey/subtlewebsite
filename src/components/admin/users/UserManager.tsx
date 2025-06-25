import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Search, 
  Users, 
  Filter,
  ChevronDown,
  ChevronUp,
  Mail,
  Calendar,
  TrendingUp,
  MoreVertical,
  UserCog,
  Shield,
  CreditCard
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import UserDetailsModal from './UserDetailsModal';
import { useToast } from '@/hooks/use-toast';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface User {
  id: string;
  email: string;
  full_name: string;
  subscription_tier: 'free' | 'starter' | 'pro' | 'enterprise';
  migration_status: 'not_started' | 'in_progress' | 'completed';
  total_requests: number;
  total_tokens: number;
  total_cost: number;
  created_at: string;
  last_active: string;
}

const UserManager: React.FC = () => {
  const { toast } = useToast();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterTier, setFilterTier] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      
      // First get profiles
      const { data: profiles, error: profileError } = await supabase
        .from('users')
        .select('*');

      if (profileError) throw profileError;

      // Get usage metrics for each user
      const usersWithMetrics = await Promise.all(
        (profiles || []).map(async (profile) => {
          const { data: metrics } = await supabase
            .from('user_usage_metrics')
            .select('total_requests, total_tokens, total_cost')
            .eq('user_id', profile.id)
            .order('created_at', { ascending: false })
            .limit(1)
            .single();

          return {
            id: profile.id,
            email: profile.email || '',
            full_name: profile.full_name || 'Unknown',
            subscription_tier: profile.subscription_tier || 'free',
            migration_status: profile.migration_status || 'not_started',
            total_requests: metrics?.total_requests || 0,
            total_tokens: metrics?.total_tokens || 0,
            total_cost: metrics?.total_cost || 0,
            created_at: profile.created_at,
            last_active: profile.updated_at || profile.created_at
          };
        })
      );

      setUsers(usersWithMetrics);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch users',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleTierChange = async (userId: string, newTier: string) => {
    try {
      const { error } = await supabase
        .from('users')
        .update({ subscription_tier: newTier })
        .eq('id', userId);

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'User tier updated successfully',
      });

      await fetchUsers();
    } catch (error) {
      console.error('Error updating tier:', error);
      toast({
        title: 'Error',
        description: 'Failed to update user tier',
        variant: 'destructive'
      });
    }
  };

  const handleBulkOperation = async (operation: string) => {
    if (selectedUsers.length === 0) {
      toast({
        title: 'No users selected',
        description: 'Please select users to perform bulk operations',
        variant: 'destructive'
      });
      return;
    }

    // Implement bulk operations based on the operation type
    console.log('Bulk operation:', operation, 'for users:', selectedUsers);
  };

  const getTierBadge = (tier: string) => {
    const colors: Record<string, string> = {
      free: 'bg-gray-100 text-gray-800',
      starter: 'bg-blue-100 text-blue-800',
      pro: 'bg-purple-100 text-purple-800',
      enterprise: 'bg-amber-100 text-amber-800'
    };

    return (
      <Badge className={`${colors[tier] || colors.free} capitalize`}>
        {tier}
      </Badge>
    );
  };

  const getMigrationBadge = (status: string) => {
    const colors: Record<string, string> = {
      not_started: 'bg-gray-100 text-gray-800',
      in_progress: 'bg-yellow-100 text-yellow-800',
      completed: 'bg-green-100 text-green-800'
    };

    const labels: Record<string, string> = {
      not_started: 'Not Started',
      in_progress: 'In Progress',
      completed: 'Completed'
    };

    return (
      <Badge className={`${colors[status] || colors.not_started}`}>
        {labels[status] || status}
      </Badge>
    );
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = 
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.full_name.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesTier = filterTier === 'all' || user.subscription_tier === filterTier;
    const matchesStatus = filterStatus === 'all' || user.migration_status === filterStatus;

    return matchesSearch && matchesTier && matchesStatus;
  });

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl">User Management</CardTitle>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                Manage users, tiers, and track migration progress
              </p>
            </div>
            <div className="flex gap-2">
              {selectedUsers.length > 0 && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline">
                      Bulk Actions ({selectedUsers.length})
                      <ChevronDown className="h-4 w-4 ml-2" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuLabel>Bulk Operations</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => handleBulkOperation('upgrade')}>
                      Upgrade Tier
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleBulkOperation('downgrade')}>
                      Downgrade Tier
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleBulkOperation('migrate')}>
                      Start Migration
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search by email or name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={filterTier} onValueChange={setFilterTier}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="All Tiers" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Tiers</SelectItem>
                <SelectItem value="free">Free</SelectItem>
                <SelectItem value="starter">Starter</SelectItem>
                <SelectItem value="pro">Pro</SelectItem>
                <SelectItem value="enterprise">Enterprise</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="All Statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="not_started">Not Started</SelectItem>
                <SelectItem value="in_progress">In Progress</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* User List */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-800 border-b">
                <tr>
                  <th className="p-4 text-left">
                    <input
                      type="checkbox"
                      checked={selectedUsers.length === filteredUsers.length}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedUsers(filteredUsers.map(u => u.id));
                        } else {
                          setSelectedUsers([]);
                        }
                      }}
                    />
                  </th>
                  <th className="p-4 text-left text-sm font-medium text-gray-900 dark:text-white">
                    User
                  </th>
                  <th className="p-4 text-left text-sm font-medium text-gray-900 dark:text-white">
                    Tier
                  </th>
                  <th className="p-4 text-left text-sm font-medium text-gray-900 dark:text-white">
                    Migration Status
                  </th>
                  <th className="p-4 text-left text-sm font-medium text-gray-900 dark:text-white">
                    Usage
                  </th>
                  <th className="p-4 text-left text-sm font-medium text-gray-900 dark:text-white">
                    Last Active
                  </th>
                  <th className="p-4 text-left text-sm font-medium text-gray-900 dark:text-white">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                    <td className="p-4">
                      <input
                        type="checkbox"
                        checked={selectedUsers.includes(user.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedUsers([...selectedUsers, user.id]);
                          } else {
                            setSelectedUsers(selectedUsers.filter(id => id !== user.id));
                          }
                        }}
                      />
                    </td>
                    <td className="p-4">
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">
                          {user.full_name}
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {user.email}
                        </p>
                      </div>
                    </td>
                    <td className="p-4">
                      {getTierBadge(user.subscription_tier)}
                    </td>
                    <td className="p-4">
                      {getMigrationBadge(user.migration_status)}
                    </td>
                    <td className="p-4">
                      <div className="text-sm">
                        <p>{user.total_requests.toLocaleString()} requests</p>
                        <p className="text-gray-600 dark:text-gray-400">
                          ${user.total_cost.toFixed(2)} cost
                        </p>
                      </div>
                    </td>
                    <td className="p-4 text-sm text-gray-600 dark:text-gray-400">
                      {new Date(user.last_active).toLocaleDateString()}
                    </td>
                    <td className="p-4">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => {
                            setSelectedUser(user);
                            setShowDetailsModal(true);
                          }}>
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => handleTierChange(user.id, 'starter')}>
                            Change to Starter
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleTierChange(user.id, 'pro')}>
                            Change to Pro
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleTierChange(user.id, 'enterprise')}>
                            Change to Enterprise
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* User Details Modal */}
      {showDetailsModal && selectedUser && (
        <UserDetailsModal
          user={selectedUser}
          onClose={() => {
            setShowDetailsModal(false);
            setSelectedUser(null);
          }}
          onUpdate={fetchUsers}
        />
      )}
    </div>
  );
};

export default UserManager;