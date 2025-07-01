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

const BillingManager: React.FC = () => {
  const [timeRange, setTimeRange] = useState('30d');
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
  const [loading, setLoading] = useState(false);
  const [activeSubscriptions, setActiveSubscriptions] = useState(0);

  useEffect(() => {
    fetchBillingData();
  }, [timeRange]);

  const fetchBillingData = async () => {
    try {
      setLoading(true);
      
      // Fetch admin stats
      const stats = await apiClient.getAdminStats();
      
      // Use revenue data from stats
      const { revenue } = stats;
      
      // Calculate metrics
      const totalRevenue = revenue.totalRevenue / 100; // Convert from cents
      const monthlyRevenue = revenue.mrr / 100;
      const costs = totalRevenue * 0.3; // 30% costs
      const profit = totalRevenue - costs;
      const margin = totalRevenue > 0 ? (profit / totalRevenue) * 100 : 0;

      setBillingData({
        revenue: totalRevenue,
        costs: costs,
        profit: profit,
        margin: margin,
        mrr: monthlyRevenue,
        churnRate: 2.5, // Mock 2.5% churn
        ltv: monthlyRevenue * 24, // 24 month LTV
        cac: 50 // Mock $50 CAC
      });
      
      setActiveSubscriptions(revenue.activeSubscriptions || 0);

    } catch (error) {
      console.error('Error fetching billing data:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const downloadReport = () => {
    console.log('Downloading billing report...');
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Billing & Revenue</h2>
          <p className="text-gray-600 dark:text-gray-400 mt-1">Monitor revenue, costs, and profitability</p>
        </div>
        <div className="flex gap-4">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-[140px]">
              <Calendar className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Select period" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 90 days</SelectItem>
              <SelectItem value="1y">Last year</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={downloadReport} variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export Report
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Monthly Recurring Revenue"
          value={formatCurrency(billingData.mrr)}
          icon={DollarSign}
          trend={{ value: 12.5, isPositive: true }}
        />
        <MetricCard
          title="Total Revenue"
          value={formatCurrency(billingData.revenue)}
          icon={TrendingUp}
          trend={{ value: 8.3, isPositive: true }}
        />
        <MetricCard
          title="Profit Margin"
          value={`${billingData.margin.toFixed(1)}%`}
          icon={BarChart3}
          trend={{ value: 2.1, isPositive: true }}
        />
        <MetricCard
          title="Customer Lifetime Value"
          value={formatCurrency(billingData.ltv)}
          icon={Users}
        />
      </div>

      {/* Revenue Overview */}
      <Card>
        <CardHeader>
          <CardTitle>Revenue Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-600 dark:text-gray-400">Total Revenue</span>
              <span className="text-xl font-semibold">{formatCurrency(billingData.revenue)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600 dark:text-gray-400">Total Costs</span>
              <span className="text-xl font-semibold">{formatCurrency(billingData.costs)}</span>
            </div>
            <div className="border-t pt-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-600 dark:text-gray-400">Net Profit</span>
                <span className="text-2xl font-bold text-green-600">{formatCurrency(billingData.profit)}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Subscription Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle>Subscription Tiers</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <div className="flex items-center gap-3">
                <CreditCard className="h-5 w-5 text-gray-600" />
                <div>
                  <p className="font-semibold">Pro Plan</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Active subscriptions</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-xl font-bold">{billingData.mrr > 0 ? Math.floor(billingData.mrr / 29.99) : 0}</p>
                <p className="text-sm text-gray-600">{formatCurrency(billingData.mrr * 0.7)} MRR</p>
              </div>
            </div>
            <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <div className="flex items-center gap-3">
                <CreditCard className="h-5 w-5 text-gray-600" />
                <div>
                  <p className="font-semibold">Enterprise Plan</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Active subscriptions</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-xl font-bold">{billingData.mrr > 0 ? Math.floor(billingData.mrr / 299.99) : 0}</p>
                <p className="text-sm text-gray-600">{formatCurrency(billingData.mrr * 0.3)} MRR</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Metrics Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Churn Rate</p>
                <p className="text-2xl font-bold">{billingData.churnRate}%</p>
              </div>
              <Badge variant="secondary" className="bg-red-100 text-red-800">
                <ArrowUpRight className="h-3 w-3 mr-1" />
                0.5%
              </Badge>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">LTV:CAC Ratio</p>
                <p className="text-2xl font-bold">{(billingData.ltv / billingData.cac).toFixed(1)}:1</p>
              </div>
              <Badge variant="secondary" className="bg-green-100 text-green-800">
                <ArrowUpRight className="h-3 w-3 mr-1" />
                Healthy
              </Badge>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Active Subscriptions</p>
                <p className="text-2xl font-bold">{activeSubscriptions}</p>
              </div>
              <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                <Users className="h-3 w-3 mr-1" />
                Growing
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default BillingManager;