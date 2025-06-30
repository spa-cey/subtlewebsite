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
import { apiClient, User } from '@/lib/api';
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

const UserManager: React.FC = () => {
  const { toast } = useToast();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterTier, setFilterTier] = useState<string>('all');
  const [sortBy, setSortBy] = useState('created_at');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchUsers();
  }, [page, filterTier, sortBy, sortOrder, searchTerm]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      
      const params: any = {
        page,
        pageSize: 25,
        sortBy,
        sortOrder
      };
      
      if (searchTerm) {
        params.search = searchTerm;
      }
      
      if (filterTier !== 'all') {
        params.subscriptionTier = filterTier;
      }
      
      const response = await apiClient.getUsers(params);
      setUsers(response.users);
      setTotalPages(response.pagination.totalPages);
      
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

  const handleUserClick = (user: User) => {
    setSelectedUser(user);
    setShowDetailsModal(true);
  };

  const handleUpdateUser = async (userId: string, updates: Partial<User>) => {
    try {
      await apiClient.updateUser(userId, updates);
      toast({
        title: 'Success',
        description: 'User updated successfully'
      });
      fetchUsers();
    } catch (error) {
      console.error('Error updating user:', error);
      toast({
        title: 'Error',
        description: 'Failed to update user',
        variant: 'destructive'
      });
    }
  };

  const getTierBadge = (tier: string) => {
    const colors = {
      free: 'bg-gray-100 text-gray-800',
      pro: 'bg-blue-100 text-blue-800',
      enterprise: 'bg-purple-100 text-purple-800',
      admin: 'bg-red-100 text-red-800'
    };
    
    return (
      <Badge variant="secondary" className={colors[tier as keyof typeof colors] || colors.free}>
        {tier.charAt(0).toUpperCase() + tier.slice(1)}
      </Badge>
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  if (loading && users.length === 0) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">User Management</h2>
          <p className="text-gray-600 dark:text-gray-400 mt-1">Manage user accounts and subscriptions</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline">
            <Users className="h-4 w-4 mr-2" />
            Export Users
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex gap-4 items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search by email or name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={filterTier} onValueChange={setFilterTier}>
              <SelectTrigger className="w-[180px]">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Filter by tier" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Tiers</SelectItem>
                <SelectItem value="free">Free</SelectItem>
                <SelectItem value="pro">Pro</SelectItem>
                <SelectItem value="enterprise">Enterprise</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
              </SelectContent>
            </Select>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="createdAt">Created Date</SelectItem>
                <SelectItem value="lastSignInAt">Last Active</SelectItem>
                <SelectItem value="email">Email</SelectItem>
                <SelectItem value="subscriptionTier">Subscription</SelectItem>
              </SelectContent>
            </Select>
            <Button
              variant="outline"
              size="icon"
              onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
            >
              {sortOrder === 'asc' ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Users Table */}
      <Card>
        <CardHeader>
          <CardTitle>Users ({users.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b">
                <tr className="text-left text-sm text-gray-600 dark:text-gray-400">
                  <th className="pb-3">User</th>
                  <th className="pb-3">Subscription</th>
                  <th className="pb-3">Status</th>
                  <th className="pb-3">Joined</th>
                  <th className="pb-3">Last Active</th>
                  <th className="pb-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {users.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                    <td className="py-4">
                      <div 
                        className="flex items-center gap-3 cursor-pointer"
                        onClick={() => handleUserClick(user)}
                      >
                        <div className="h-10 w-10 rounded-full bg-gradient-to-br from-pink-500 to-red-500 flex items-center justify-center text-white font-semibold">
                          {user.email.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">{user.fullName || 'Unknown'}</p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4">
                      {getTierBadge(user.subscriptionTier)}
                    </td>
                    <td className="py-4">
                      <Badge variant={user.emailVerified ? 'default' : 'secondary'}>
                        {user.emailVerified ? 'Verified' : 'Unverified'}
                      </Badge>
                    </td>
                    <td className="py-4 text-sm text-gray-600 dark:text-gray-400">
                      {formatDate(user.createdAt)}
                    </td>
                    <td className="py-4 text-sm text-gray-600 dark:text-gray-400">
                      {user.lastSignInAt ? formatDate(user.lastSignInAt) : 'Never'}
                    </td>
                    <td className="py-4">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => handleUserClick(user)}>
                            <UserCog className="h-4 w-4 mr-2" />
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Mail className="h-4 w-4 mr-2" />
                            Send Email
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <CreditCard className="h-4 w-4 mr-2" />
                            View Billing
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="text-red-600">
                            <Shield className="h-4 w-4 mr-2" />
                            Suspend Account
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {/* Pagination */}
          <div className="flex justify-between items-center mt-6">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Page {page} of {totalPages}
            </p>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(page - 1)}
                disabled={page === 1}
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(page + 1)}
                disabled={page === totalPages}
              >
                Next
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* User Details Modal */}
      {selectedUser && (
        <UserDetailsModal
          user={selectedUser}
          isOpen={showDetailsModal}
          onClose={() => {
            setShowDetailsModal(false);
            setSelectedUser(null);
          }}
          onUpdate={handleUpdateUser}
        />
      )}
    </div>
  );
};

export default UserManager;