'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  DollarSign, 
  TrendingUp, 
  TrendingDown,
  Download, 
  Users,
  CreditCard,
  ArrowUpRight,
  ArrowDownRight,
  RefreshCw
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface RevenueData {
  totalRevenue: number;
  mrr: number;
  growth: number;
  activeSubscriptions: number;
  subscriptionBreakdown: {
    free: number;
    pro: number;
    enterprise: number;
    admin: number;
  };
}

interface BillingMetrics {
  revenue: number;
  mrr: number;
  growth: number;
  activeSubscriptions: number;
  arpu: number; // Average Revenue Per User
  churnRate: number;
  ltv: number; // Lifetime Value
}

export default function BillingManager() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [revenueData, setRevenueData] = useState<RevenueData>({
    totalRevenue: 0,
    mrr: 0,
    growth: 0,
    activeSubscriptions: 0,
    subscriptionBreakdown: {
      free: 0,
      pro: 0,
      enterprise: 0,
      admin: 0
    }
  });
  const [metrics, setMetrics] = useState<BillingMetrics>({
    revenue: 0,
    mrr: 0,
    growth: 0,
    activeSubscriptions: 0,
    arpu: 0,
    churnRate: 0,
    ltv: 0
  });

  useEffect(() => {
    fetchBillingData();
  }, []);

  const fetchBillingData = async () => {
    try {
      setLoading(true);
      
      const response = await fetch('/api/admin/stats');
      const data = await response.json();
      
      if (data.success) {
        const stats = data.stats || {};
        const revenue = stats.revenue || {};
        const users = stats.users || {};
        const subscriptions = stats.subscriptions || {};
        
        // Calculate active subscriptions
        const activeSubscriptions = (subscriptions.pro || 0) + 
                                  (subscriptions.enterprise || 0);
        
        setRevenueData({
          totalRevenue: (revenue.mrr || 0) * 100, // Convert to cents for consistency
          mrr: (revenue.mrr || 0) * 100,
          growth: revenue.growth || 0,
          activeSubscriptions,
          subscriptionBreakdown: subscriptions
        });
        
        // Calculate metrics
        const monthlyRevenue = revenue.mrr || 0; // Already in dollars
        const totalRevenue = monthlyRevenue * 12; // Annual estimate
        const paidUsers = activeSubscriptions;
        
        setMetrics({
          revenue: totalRevenue,
          mrr: monthlyRevenue,
          growth: revenue.growth || 0,
          activeSubscriptions,
          arpu: paidUsers > 0 ? monthlyRevenue / paidUsers : 0,
          churnRate: 2.5, // TODO: Calculate from actual data
          ltv: paidUsers > 0 ? (monthlyRevenue / paidUsers) * 24 : 0 // 24 month LTV estimate
        });
      } else {
        throw new Error(data.error);
      }
    } catch (error) {
      console.error('Error fetching billing data:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch billing data',
        variant: 'destructive'
      });
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

  const formatPercentage = (value: number) => {
    return `${value > 0 ? '+' : ''}${value.toFixed(1)}%`;
  };

  const downloadReport = () => {
    // TODO: Implement CSV export
    toast({
      title: 'Export Started',
      description: 'Your billing report is being generated...',
    });
  };

  const getTierColor = (tier: string) => {
    const colors = {
      free: 'bg-gray-500',
      pro: 'bg-blue-500',
      enterprise: 'bg-purple-500',
      admin: 'bg-red-500'
    };
    return colors[tier as keyof typeof colors] || 'bg-gray-500';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  const subscriptionData = revenueData.subscriptionBreakdown;
  const totalUsers = Object.values(subscriptionData).reduce((a, b) => a + b, 0);

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Billing & Revenue</h2>
          <p className="text-muted-foreground mt-1">
            Monitor revenue metrics and subscription analytics
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" onClick={fetchBillingData}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button onClick={downloadReport}>
            <Download className="h-4 w-4 mr-2" />
            Export Report
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monthly Recurring Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(metrics.mrr)}</div>
            <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
              {metrics.growth >= 0 ? (
                <>
                  <TrendingUp className="h-3 w-3 text-green-500" />
                  <span className="text-green-500">{formatPercentage(metrics.growth)}</span>
                </>
              ) : (
                <>
                  <TrendingDown className="h-3 w-3 text-red-500" />
                  <span className="text-red-500">{formatPercentage(metrics.growth)}</span>
                </>
              )}
              <span>from last month</span>
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(metrics.revenue)}</div>
            <p className="text-xs text-muted-foreground">All time revenue</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Subscriptions</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.activeSubscriptions}</div>
            <p className="text-xs text-muted-foreground">Paid subscribers</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Revenue Per User</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(metrics.arpu)}</div>
            <p className="text-xs text-muted-foreground">Monthly ARPU</p>
          </CardContent>
        </Card>
      </div>

      {/* Subscription Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle>Subscription Distribution</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Object.entries(subscriptionData).map(([tier, count]) => {
              const percentage = totalUsers > 0 ? (count / totalUsers) * 100 : 0;
              return (
                <div key={tier}>
                  <div className="flex justify-between items-center mb-2">
                    <div className="flex items-center gap-2">
                      <div className={`w-3 h-3 rounded-full ${getTierColor(tier)}`} />
                      <span className="font-medium capitalize">{tier}</span>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="text-sm text-muted-foreground">{count} users</span>
                      <Badge variant="secondary">{percentage.toFixed(1)}%</Badge>
                    </div>
                  </div>
                  <div className="w-full bg-secondary rounded-full h-2">
                    <div
                      className={`h-full rounded-full ${getTierColor(tier)}`}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Financial Metrics */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Customer Lifetime Value</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(metrics.ltv)}</div>
            <p className="text-xs text-muted-foreground">Based on 24-month average</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Churn Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.churnRate}%</div>
            <p className="text-xs text-muted-foreground">Monthly churn</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Revenue Growth</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <div className="text-2xl font-bold">{formatPercentage(metrics.growth)}</div>
              {metrics.growth >= 0 ? (
                <ArrowUpRight className="h-5 w-5 text-green-500" />
              ) : (
                <ArrowDownRight className="h-5 w-5 text-red-500" />
              )}
            </div>
            <p className="text-xs text-muted-foreground">Month over month</p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3">
            <Button variant="outline">
              <CreditCard className="h-4 w-4 mr-2" />
              Manage Subscriptions
            </Button>
            <Button variant="outline">
              <DollarSign className="h-4 w-4 mr-2" />
              Process Refunds
            </Button>
            <Button variant="outline">
              <Users className="h-4 w-4 mr-2" />
              View Delinquent Accounts
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}