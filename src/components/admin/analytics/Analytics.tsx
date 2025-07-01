import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { 
  LineChart, 
  Line, 
  BarChart, 
  Bar, 
  PieChart, 
  Pie, 
  Cell,
  AreaChart,
  Area,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend,
  ResponsiveContainer 
} from 'recharts';
import { 
  TrendingUp, 
  Users, 
  DollarSign, 
  Activity,
  Globe,
  AlertCircle,
  Download,
  RefreshCw
} from 'lucide-react';
import { apiClient } from '@/lib/api';
import MetricCard from '../MetricCard';

interface AnalyticsData {
  requestVolume: any[];
  userGrowth: any[];
  tierDistribution: any[];
}

const Analytics: React.FC = () => {
  const [timeRange, setTimeRange] = useState('7d');
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<AnalyticsData>({
    requestVolume: [],
    userGrowth: [],
    tierDistribution: []
  });
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    fetchAnalyticsData();
  }, [timeRange]);

  const fetchAnalyticsData = async () => {
    try {
      setLoading(true);
      
      // Fetch admin stats
      const adminStats = await apiClient.getAdminStats();
      setStats(adminStats);
      
      // Generate sample analytics data based on time range
      const days = timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : 90;
      
      // Request volume data
      const requestVolume = [];
      for (let i = days - 1; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        requestVolume.push({
          date: `${date.getMonth() + 1}/${date.getDate()}`,
          requests: Math.floor(1000 + Math.random() * 500),
          errors: Math.floor(Math.random() * 50)
        });
      }
      
      // User growth data
      const userGrowth = [];
      let totalUsers = adminStats.users.total;
      for (let i = days - 1; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const growth = Math.floor(Math.random() * 10);
        totalUsers -= growth;
        userGrowth.push({
          date: `${date.getMonth() + 1}/${date.getDate()}`,
          totalUsers: totalUsers,
          newUsers: growth
        });
      }
      
      // Tier distribution
      const tierDistribution = [
        { name: 'Free', value: adminStats.subscriptions.free || 0, color: '#8B5CF6' },
        { name: 'Pro', value: adminStats.subscriptions.pro || 0, color: '#EC4899' },
        { name: 'Enterprise', value: adminStats.subscriptions.enterprise || 0, color: '#F59E0B' }
      ];
      
      setData({
        requestVolume,
        userGrowth,
        tierDistribution
      });
      
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const refreshData = () => {
    fetchAnalyticsData();
  };

  const exportData = () => {
    console.log('Exporting analytics data...');
  };

  const COLORS = ['#8B5CF6', '#EC4899', '#F59E0B', '#10B981'];

  if (loading) {
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
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Analytics & Reports</h2>
          <p className="text-gray-600 dark:text-gray-400 mt-1">Monitor system performance and user metrics</p>
        </div>
        <div className="flex gap-3">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Select period" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 90 days</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={refreshData} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button onClick={exportData} variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Total Users"
          value={stats?.users?.total?.toLocaleString() || '0'}
          icon={Users}
          trend={{ value: 15.3, isPositive: true }}
        />
        <MetricCard
          title="Active Users"
          value={stats?.users?.active?.toLocaleString() || '0'}
          icon={Activity}
          trend={{ value: 8.2, isPositive: true }}
        />
        <MetricCard
          title="Revenue"
          value={`$${((stats?.revenue?.mrr || 0) / 100).toFixed(2)}`}
          icon={DollarSign}
          trend={{ value: 12.5, isPositive: true }}
        />
        <MetricCard
          title="API Requests"
          value="45.2K"
          icon={Globe}
          trend={{ value: 2.4, isPositive: false }}
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Request Volume Chart */}
        <Card>
          <CardHeader>
            <CardTitle>API Request Volume</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={data.requestVolume}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Area type="monotone" dataKey="requests" stackId="1" stroke="#8B5CF6" fill="#8B5CF6" />
                <Area type="monotone" dataKey="errors" stackId="1" stroke="#EF4444" fill="#EF4444" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* User Growth Chart */}
        <Card>
          <CardHeader>
            <CardTitle>User Growth</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={data.userGrowth}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="totalUsers" stroke="#8B5CF6" strokeWidth={2} />
                <Line type="monotone" dataKey="newUsers" stroke="#10B981" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Subscription Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Subscription Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={data.tierDistribution}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {data.tierDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Performance Metrics */}
        <Card>
          <CardHeader>
            <CardTitle>System Performance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-600 dark:text-gray-400">Average Response Time</span>
                <span className="text-xl font-semibold">142ms</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600 dark:text-gray-400">Uptime</span>
                <span className="text-xl font-semibold text-green-600">99.98%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600 dark:text-gray-400">Error Rate</span>
                <span className="text-xl font-semibold text-red-600">0.12%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600 dark:text-gray-400">Cache Hit Rate</span>
                <span className="text-xl font-semibold">87.3%</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Additional Metrics */}
      <Card>
        <CardHeader>
          <CardTitle>Usage Patterns</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <h4 className="font-semibold mb-2">Peak Usage Hours</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">2:00 PM - 5:00 PM EST</p>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Most Active Feature</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">AI Chat Assistant</p>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Average Session Duration</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">12m 34s</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Analytics;