import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card } from '@/components/ui/card';
import { Shield, Users, BarChart3, CreditCard, Settings } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import ConfigurationManager from '@/components/admin/config/ConfigurationManager';
import UserManager from '@/components/admin/users/UserManager';
import Analytics from '@/components/admin/analytics/Analytics';
import BillingManager from '@/components/admin/billing/BillingManager';
import MetricCard from '@/components/admin/MetricCard';
import { supabase } from '@/lib/supabase';

interface DashboardMetrics {
  totalUsers: number;
  activeConfigs: number;
  monthlyRevenue: number;
  requestsToday: number;
}

const AdminDashboard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [metrics, setMetrics] = useState<DashboardMetrics>({
    totalUsers: 0,
    activeConfigs: 0,
    monthlyRevenue: 0,
    requestsToday: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAdminAccess();
    fetchDashboardMetrics();
  }, [user]);

  const checkAdminAccess = async () => {
    if (!user) {
      navigate('/login');
      return;
    }

    try {
      const { data, error } = await supabase
        .from('admins')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (error || !data) {
        navigate('/');
        return;
      }
    } catch (error) {
      console.error('Error checking admin access:', error);
      navigate('/');
    }
  };

  const fetchDashboardMetrics = async () => {
    try {
      setLoading(true);
      
      // Fetch total users
      const { count: userCount } = await supabase
        .from('users')
        .select('*', { count: 'exact', head: true });
      
      // Fetch active configurations
      const { count: configCount } = await supabase
        .from('admin_azure_configs')
        .select('*', { count: 'exact', head: true })
        .eq('is_active', true);
      
      // Fetch monthly revenue (simplified - you'd calculate this from billing data)
      const { data: revenueData } = await supabase
        .from('user_usage_metrics')
        .select('total_cost')
        .gte('created_at', new Date(new Date().setDate(1)).toISOString());
      
      const monthlyRevenue = revenueData?.reduce((sum, record) => sum + (record.total_cost || 0), 0) || 0;
      
      // Fetch today's requests
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const { count: requestCount } = await supabase
        .from('user_usage_metrics')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', today.toISOString());
      
      setMetrics({
        totalUsers: userCount || 0,
        activeConfigs: configCount || 0,
        monthlyRevenue: monthlyRevenue * 1.5, // 50% margin
        requestsToday: requestCount || 0
      });
    } catch (error) {
      console.error('Error fetching dashboard metrics:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Shield className="h-8 w-8 text-blue-600 dark:text-blue-400" />
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Admin Dashboard
            </h1>
          </div>
          <p className="text-gray-600 dark:text-gray-400">
            Manage configurations, users, and monitor system performance
          </p>
        </div>

        {/* Overview Metrics */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <MetricCard
              title="Total Users"
              value={metrics.totalUsers.toLocaleString()}
              icon={Users}
              trend={{ value: 12, isPositive: true }}
              loading={loading}
            />
            <MetricCard
              title="Active Configs"
              value={metrics.activeConfigs.toLocaleString()}
              icon={Settings}
              loading={loading}
            />
            <MetricCard
              title="Monthly Revenue"
              value={`$${metrics.monthlyRevenue.toFixed(2)}`}
              icon={CreditCard}
              trend={{ value: 8.5, isPositive: true }}
              loading={loading}
            />
            <MetricCard
              title="Requests Today"
              value={metrics.requestsToday.toLocaleString()}
              icon={BarChart3}
              trend={{ value: 15, isPositive: true }}
              loading={loading}
            />
          </div>
        )}

        {/* Main Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid grid-cols-5 w-full max-w-2xl">
            <TabsTrigger value="overview" className="gap-2">
              <Shield className="h-4 w-4" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="configs" className="gap-2">
              <Settings className="h-4 w-4" />
              Configs
            </TabsTrigger>
            <TabsTrigger value="users" className="gap-2">
              <Users className="h-4 w-4" />
              Users
            </TabsTrigger>
            <TabsTrigger value="analytics" className="gap-2">
              <BarChart3 className="h-4 w-4" />
              Analytics
            </TabsTrigger>
            <TabsTrigger value="billing" className="gap-2">
              <CreditCard className="h-4 w-4" />
              Billing
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4">System Overview</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-medium mb-2">Recent Activity</h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    Monitor recent system activity and user actions
                  </p>
                </div>
                <div>
                  <h3 className="text-lg font-medium mb-2">Quick Actions</h3>
                  <div className="space-y-2">
                    <button 
                      onClick={() => setActiveTab('configs')}
                      className="text-blue-600 hover:text-blue-700 dark:text-blue-400"
                    >
                      → Manage Configurations
                    </button>
                    <button 
                      onClick={() => setActiveTab('users')}
                      className="text-blue-600 hover:text-blue-700 dark:text-blue-400 block"
                    >
                      → View User Management
                    </button>
                  </div>
                </div>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="configs">
            <ConfigurationManager />
          </TabsContent>

          <TabsContent value="users">
            <UserManager />
          </TabsContent>

          <TabsContent value="analytics">
            <Analytics />
          </TabsContent>

          <TabsContent value="billing">
            <BillingManager />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AdminDashboard;