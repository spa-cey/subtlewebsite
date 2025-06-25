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
import { supabase } from '@/lib/supabase';
import MetricCard from '../MetricCard';

interface AnalyticsData {
  requestVolume: any[];
  tokenUsage: any[];
  costAnalysis: any[];
  errorRates: any[];
  performanceMetrics: any[];
  geographicData: any[];
  tierDistribution: any[];
}

const Analytics: React.FC = () => {
  const [timeRange, setTimeRange] = useState('7d');
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<AnalyticsData>({
    requestVolume: [],
    tokenUsage: [],
    costAnalysis: [],
    errorRates: [],
    performanceMetrics: [],
    geographicData: [],
    tierDistribution: []
  });
  const [metrics, setMetrics] = useState({
    totalRequests: 0,
    avgResponseTime: 0,
    errorRate: 0,
    totalRevenue: 0
  });

  useEffect(() => {
    fetchAnalytics();
  }, [timeRange]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);

      // Calculate date range
      const endDate = new Date();
      const startDate = new Date();
      switch (timeRange) {
        case '24h':
          startDate.setHours(startDate.getHours() - 24);
          break;
        case '7d':
          startDate.setDate(startDate.getDate() - 7);
          break;
        case '30d':
          startDate.setDate(startDate.getDate() - 30);
          break;
        case '90d':
          startDate.setDate(startDate.getDate() - 90);
          break;
      }

      // Fetch usage metrics
      const { data: usageData, error: usageError } = await supabase
        .from('user_usage_metrics')
        .select('*')
        .gte('created_at', startDate.toISOString())
        .lte('created_at', endDate.toISOString());

      if (usageError) throw usageError;

      // Process data for charts
      const processedData = processUsageData(usageData || [], timeRange);
      setData(processedData);

      // Calculate summary metrics
      const totalRequests = usageData?.reduce((sum, d) => sum + (d.request_count || 0), 0) || 0;
      const totalCost = usageData?.reduce((sum, d) => sum + (d.cost || 0), 0) || 0;
      const avgResponseTime = 245; // Mock data - would come from real metrics
      const errorRate = 0.23; // Mock data - would come from real metrics

      setMetrics({
        totalRequests,
        avgResponseTime,
        errorRate,
        totalRevenue: totalCost * 1.5 // 50% margin
      });

    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const processUsageData = (data: any[], range: string): AnalyticsData => {
    // Group data by time periods based on range
    const groupedByDate = data.reduce((acc, record) => {
      const date = new Date(record.created_at);
      const key = range === '24h' 
        ? `${date.getHours()}:00`
        : date.toLocaleDateString();

      if (!acc[key]) {
        acc[key] = {
          date: key,
          requests: 0,
          tokens: 0,
          cost: 0,
          errors: 0,
          responseTime: 0
        };
      }

      acc[key].requests += record.request_count || 0;
      acc[key].tokens += record.token_count || 0;
      acc[key].cost += record.cost || 0;

      return acc;
    }, {});

    const timeSeriesData = Object.values(groupedByDate);

    // Mock tier distribution data
    const tierDistribution = [
      { name: 'Free', value: 45, count: 450 },
      { name: 'Starter', value: 30, count: 300 },
      { name: 'Pro', value: 20, count: 200 },
      { name: 'Enterprise', value: 5, count: 50 }
    ];

    // Mock geographic data
    const geographicData = [
      { country: 'United States', requests: 4500, percentage: 45 },
      { country: 'United Kingdom', requests: 1500, percentage: 15 },
      { country: 'Germany', requests: 1200, percentage: 12 },
      { country: 'France', requests: 800, percentage: 8 },
      { country: 'Japan', requests: 700, percentage: 7 },
      { country: 'Others', requests: 1300, percentage: 13 }
    ];

    // Add mock error rates and performance metrics
    const errorRates = timeSeriesData.map((d: any) => ({
      ...d,
      errorRate: Math.random() * 2 // Mock 0-2% error rate
    }));

    const performanceMetrics = timeSeriesData.map((d: any) => ({
      ...d,
      avgResponseTime: 200 + Math.random() * 100, // Mock 200-300ms
      p95ResponseTime: 400 + Math.random() * 200  // Mock 400-600ms
    }));

    return {
      requestVolume: timeSeriesData,
      tokenUsage: timeSeriesData,
      costAnalysis: timeSeriesData,
      errorRates,
      performanceMetrics,
      geographicData,
      tierDistribution
    };
  };

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444'];

  const exportData = () => {
    // Implement CSV export functionality
    console.log('Exporting analytics data...');
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center h-64">
            <RefreshCw className="h-8 w-8 animate-spin text-gray-400" />
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
              <CardTitle className="text-2xl">Analytics Dashboard</CardTitle>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                Monitor system performance and usage metrics
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Select value={timeRange} onValueChange={setTimeRange}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="24h">Last 24h</SelectItem>
                  <SelectItem value="7d">Last 7 days</SelectItem>
                  <SelectItem value="30d">Last 30 days</SelectItem>
                  <SelectItem value="90d">Last 90 days</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" onClick={exportData}>
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Summary Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Total Requests"
          value={metrics.totalRequests.toLocaleString()}
          icon={Activity}
          trend={{ value: 12.5, isPositive: true }}
        />
        <MetricCard
          title="Avg Response Time"
          value={`${metrics.avgResponseTime}ms`}
          icon={TrendingUp}
          trend={{ value: 5.2, isPositive: false }}
        />
        <MetricCard
          title="Error Rate"
          value={`${metrics.errorRate.toFixed(2)}%`}
          icon={AlertCircle}
          trend={{ value: 0.1, isPositive: false }}
        />
        <MetricCard
          title="Total Revenue"
          value={`$${metrics.totalRevenue.toFixed(2)}`}
          icon={DollarSign}
          trend={{ value: 18.3, isPositive: true }}
        />
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Request Volume */}
        <Card>
          <CardHeader>
            <CardTitle>Request Volume Over Time</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data.requestVolume}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Area 
                    type="monotone" 
                    dataKey="requests" 
                    stroke="#3b82f6" 
                    fill="#3b82f6" 
                    fillOpacity={0.6}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Token Usage by Tier */}
        <Card>
          <CardHeader>
            <CardTitle>Token Usage by Tier</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.tokenUsage}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="tokens" fill="#10b981" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Cost Analysis */}
        <Card>
          <CardHeader>
            <CardTitle>Cost Analysis</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data.costAnalysis}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip formatter={(value: any) => `$${value.toFixed(2)}`} />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="cost" 
                    stroke="#f59e0b" 
                    name="Cost"
                    strokeWidth={2}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Error Rates */}
        <Card>
          <CardHeader>
            <CardTitle>Error Rates Visualization</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data.errorRates}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip formatter={(value: any) => `${value.toFixed(2)}%`} />
                  <Line 
                    type="monotone" 
                    dataKey="errorRate" 
                    stroke="#ef4444" 
                    strokeWidth={2}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Performance Metrics */}
        <Card>
          <CardHeader>
            <CardTitle>Performance Metrics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data.performanceMetrics}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip formatter={(value: any) => `${value.toFixed(0)}ms`} />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="avgResponseTime" 
                    stroke="#3b82f6" 
                    name="Avg Response Time"
                    strokeWidth={2}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="p95ResponseTime" 
                    stroke="#10b981" 
                    name="P95 Response Time"
                    strokeWidth={2}
                    strokeDasharray="5 5"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Tier Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>User Tier Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={data.tierDistribution}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={(entry) => `${entry.name}: ${entry.value}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {data.tierDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Geographic Distribution */}
      <Card>
        <CardHeader>
          <CardTitle>Geographic Distribution</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.geographicData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis dataKey="country" type="category" />
                  <Tooltip />
                  <Bar dataKey="requests" fill="#3b82f6" />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                <Globe className="h-5 w-5" />
                <span className="font-medium">Top Countries by Usage</span>
              </div>
              {data.geographicData.map((country, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <span className="font-medium">{country.country}</span>
                  <div className="flex items-center gap-3">
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      {country.requests.toLocaleString()} requests
                    </span>
                    <span className="font-semibold">{country.percentage}%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Analytics;