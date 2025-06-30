import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { 
  DollarSign, 
  TrendingUp, 
  Download, 
  Calendar,
  CreditCard,
  Users,
  BarChart3,
  PieChart as PieChartIcon,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';
import { 
  LineChart, 
  Line, 
  BarChart, 
  Bar, 
  PieChart, 
  Pie, 
  Cell,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend,
  ResponsiveContainer 
} from 'recharts';
import { apiClient } from '@/lib/api';
import MetricCard from '../MetricCard';

interface BillingData {
  revenue: number;
  costs: number;
  profit: number;
  margin: number;
  mrr: number;
  churnRate: number;
  ltv: number;
  cac: number;
}

interface ChartData {
  revenueHistory: any[];
  costBreakdown: any[];
  tierRevenue: any[];
  profitMargins: any[];
  mrrGrowth: any[];
}

const BillingManager: React.FC = () => {
  const [timeRange, setTimeRange] = useState('30d');
  const [loading, setLoading] = useState(true);
  const [billingData, setBillingData] = useState<BillingData>({
    revenue: 0,
    costs: 0,
    profit: 0,
    margin: 0,
    mrr: 0,
    churnRate: 0,
    ltv: 0,
    cac: 0
  });
  const [chartData, setChartData] = useState<ChartData>({
    revenueHistory: [],
    costBreakdown: [],
    tierRevenue: [],
    profitMargins: [],
    mrrGrowth: []
  });

  useEffect(() => {
    fetchBillingData();
  }, [timeRange]);

  const fetchBillingData = async () => {
    try {
      setLoading(true);

      // Calculate date range
      const endDate = new Date();
      const startDate = new Date();
      switch (timeRange) {
        case '7d':
          startDate.setDate(startDate.getDate() - 7);
          break;
        case '30d':
          startDate.setDate(startDate.getDate() - 30);
          break;
        case '90d':
          startDate.setDate(startDate.getDate() - 90);
          break;
        case '1y':
          startDate.setFullYear(startDate.getFullYear() - 1);
          break;
      }

      // Fetch usage metrics for billing
      const { data: usageData, error } = await supabase
        .from('user_usage_metrics')
        .select('*')
        .gte('created_at', startDate.toISOString())
        .lte('created_at', endDate.toISOString());

      if (error) throw error;

      // Calculate billing metrics
      const totalCost = usageData?.reduce((sum, d) => sum + (d.cost || 0), 0) || 0;
      const revenue = totalCost * 1.5; // 50% margin
      const profit = revenue - totalCost;
      const margin = totalCost > 0 ? (profit / revenue) * 100 : 0;

      // Calculate MRR (simplified)
      const currentMonthStart = new Date();
      currentMonthStart.setDate(1);
      currentMonthStart.setHours(0, 0, 0, 0);

      const { data: mrrData } = await supabase
        .from('user_usage_metrics')
        .select('cost')
        .gte('created_at', currentMonthStart.toISOString());

      const mrr = (mrrData?.reduce((sum, d) => sum + (d.cost || 0), 0) || 0) * 1.5;

      // Mock additional metrics
      const churnRate = 2.5; // Mock 2.5% churn
      const ltv = mrr * 24; // 24 month LTV
      const cac = 50; // Mock $50 CAC

      setBillingData({
        revenue,
        costs: totalCost,
        profit,
        margin,
        mrr,
        churnRate,
        ltv,
        cac
      });

      // Process chart data
      const processedChartData = processBillingChartData(usageData || [], timeRange);
      setChartData(processedChartData);

    } catch (error) {
      console.error('Error fetching billing data:', error);
    } finally {
      setLoading(false);
    }
  };

  const processBillingChartData = (data: any[], range: string): ChartData => {
    // Group by date periods
    const groupedByDate = data.reduce((acc, record) => {
      const date = new Date(record.created_at);
      const key = range === '7d' 
        ? date.toLocaleDateString()
        : `${date.getMonth() + 1}/${date.getDate()}`;

      if (!acc[key]) {
        acc[key] = {
          date: key,
          cost: 0,
          revenue: 0,
          profit: 0
        };
      }

      const cost = record.cost || 0;
      acc[key].cost += cost;
      acc[key].revenue += cost * 1.5;
      acc[key].profit += cost * 0.5;

      return acc;
    }, {});

    const revenueHistory = Object.values(groupedByDate);

    // Mock cost breakdown
    const costBreakdown = [
      { name: 'Azure OpenAI API', value: 65, amount: billingData.costs * 0.65 },
      { name: 'Infrastructure', value: 20, amount: billingData.costs * 0.20 },
      { name: 'Support', value: 10, amount: billingData.costs * 0.10 },
      { name: 'Other', value: 5, amount: billingData.costs * 0.05 }
    ];

    // Mock tier revenue
    const tierRevenue = [
      { tier: 'Free', users: 450, revenue: 0, percentage: 0 },
      { tier: 'Starter', users: 300, revenue: 4500, percentage: 30 },
      { tier: 'Pro', users: 200, revenue: 7500, percentage: 50 },
      { tier: 'Enterprise', users: 50, revenue: 3000, percentage: 20 }
    ];

    // Mock profit margins over time
    const profitMargins = revenueHistory.map((d: any) => ({
      date: d.date,
      margin: 50 + Math.random() * 10 // 50-60% margin
    }));

    // Mock MRR growth
    const mrrGrowth = Array.from({ length: 12 }, (_, i) => {
      const date = new Date();
      date.setMonth(date.getMonth() - (11 - i));
      return {
        month: date.toLocaleDateString('en-US', { month: 'short' }),
        mrr: 10000 + (i * 1500) + Math.random() * 1000
      };
    });

    return {
      revenueHistory,
      costBreakdown,
      tierRevenue,
      profitMargins,
      mrrGrowth
    };
  };

  const exportBillingData = () => {
    // Implement CSV export
    console.log('Exporting billing data...');
  };

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444'];

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
              <CardTitle className="text-2xl">Billing & Revenue</CardTitle>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                Track revenue, costs, and profitability metrics
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Select value={timeRange} onValueChange={setTimeRange}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7d">Last 7 days</SelectItem>
                  <SelectItem value="30d">Last 30 days</SelectItem>
                  <SelectItem value="90d">Last 90 days</SelectItem>
                  <SelectItem value="1y">Last year</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" onClick={exportBillingData}>
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Total Revenue"
          value={`$${billingData.revenue.toFixed(2)}`}
          icon={DollarSign}
          trend={{ value: 15.2, isPositive: true }}
        />
        <MetricCard
          title="Profit Margin"
          value={`${billingData.margin.toFixed(1)}%`}
          icon={TrendingUp}
          trend={{ value: 2.3, isPositive: true }}
        />
        <MetricCard
          title="Monthly Recurring Revenue"
          value={`$${billingData.mrr.toFixed(2)}`}
          icon={CreditCard}
          trend={{ value: 12.5, isPositive: true }}
        />
        <MetricCard
          title="Customer Lifetime Value"
          value={`$${billingData.ltv.toFixed(2)}`}
          icon={Users}
          trend={{ value: 8.7, isPositive: true }}
        />
      </div>

      {/* Additional Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Net Profit</h3>
              <ArrowUpRight className="h-5 w-5 text-green-600" />
            </div>
            <p className="text-3xl font-bold text-green-600">
              ${billingData.profit.toFixed(2)}
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
              After all costs
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Churn Rate</h3>
              <ArrowDownRight className="h-5 w-5 text-red-600" />
            </div>
            <p className="text-3xl font-bold">
              {billingData.churnRate.toFixed(1)}%
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
              Monthly churn
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">CAC:LTV Ratio</h3>
              <BarChart3 className="h-5 w-5 text-blue-600" />
            </div>
            <p className="text-3xl font-bold">
              1:{(billingData.ltv / billingData.cac).toFixed(1)}
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
              Acquisition efficiency
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue vs Costs */}
        <Card>
          <CardHeader>
            <CardTitle>Revenue vs Costs</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData.revenueHistory}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip formatter={(value: any) => `$${value.toFixed(2)}`} />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="revenue" 
                    stroke="#10b981" 
                    name="Revenue"
                    strokeWidth={2}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="cost" 
                    stroke="#ef4444" 
                    name="Costs"
                    strokeWidth={2}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="profit" 
                    stroke="#3b82f6" 
                    name="Profit"
                    strokeWidth={2}
                    strokeDasharray="5 5"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Cost Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle>Cost Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={chartData.costBreakdown}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={(entry) => `${entry.name}: ${entry.value}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {chartData.costBreakdown.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: any, name: any, props: any) => 
                    [`$${props.payload.amount.toFixed(2)}`, name]
                  } />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Revenue by Tier */}
        <Card>
          <CardHeader>
            <CardTitle>Revenue by Tier</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData.tierRevenue}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="tier" />
                  <YAxis />
                  <Tooltip formatter={(value: any) => `$${value}`} />
                  <Bar dataKey="revenue" fill="#3b82f6" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* MRR Growth */}
        <Card>
          <CardHeader>
            <CardTitle>MRR Growth Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData.mrrGrowth}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip formatter={(value: any) => `$${value.toFixed(0)}`} />
                  <Line 
                    type="monotone" 
                    dataKey="mrr" 
                    stroke="#10b981" 
                    strokeWidth={3}
                    dot={{ fill: '#10b981', r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Metrics Table */}
      <Card>
        <CardHeader>
          <CardTitle>Tier Performance Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b">
                <tr>
                  <th className="text-left p-4">Tier</th>
                  <th className="text-left p-4">Users</th>
                  <th className="text-left p-4">Revenue</th>
                  <th className="text-left p-4">% of Total</th>
                  <th className="text-left p-4">ARPU</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {chartData.tierRevenue.map((tier, index) => (
                  <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                    <td className="p-4">
                      <Badge className="capitalize">{tier.tier}</Badge>
                    </td>
                    <td className="p-4">{tier.users}</td>
                    <td className="p-4 font-medium">${tier.revenue.toLocaleString()}</td>
                    <td className="p-4">{tier.percentage}%</td>
                    <td className="p-4">
                      ${tier.users > 0 ? (tier.revenue / tier.users).toFixed(2) : '0.00'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default BillingManager;