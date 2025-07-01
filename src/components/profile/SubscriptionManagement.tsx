import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { QuotaStatus } from '@/components/subscription/QuotaStatus';
import { PlanUpgrade } from '@/components/subscription/PlanUpgrade';
import { useBillingHistory } from '@/hooks/useUsers';
import { Crown, CreditCard, Calendar, Receipt, AlertCircle } from 'lucide-react';

interface SubscriptionManagementProps {
  user: any;
  profile: any;
}

export function SubscriptionManagement({ user, profile }: SubscriptionManagementProps) {
  // Get billing history for current user
  const { data: billingHistory, isLoading: isLoadingBilling } = useBillingHistory(user?.id || '');

  // Get subscription tier from user profile
  const subscriptionTier = profile?.subscriptionTier || user?.subscriptionTier || 'free';
  const billingCycle = null; // user?.user_metadata?.billing_cycle || null;
  const nextBillingDate = null; // user?.user_metadata?.next_billing_date || null;
  const paymentMethod: any = null; // user?.user_metadata?.payment_method || null;

  // Mock usage data for QuotaStatus - in real app this would come from user context or separate hook
  const mockUsageData = {
    used: 45, // This would come from a usage tracking service in a real app
    limit: subscriptionTier === 'admin' ? 999999 : subscriptionTier === 'pro' ? 2500 : subscriptionTier === 'enterprise' ? 10000 : 100,
    resetDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days from now
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status.toLowerCase()) {
      case 'paid':
      case 'successful':
        return 'default';
      case 'pending':
        return 'secondary';
      case 'failed':
      case 'cancelled':
        return 'destructive';
      default:
        return 'outline';
    }
  };

  const getTierDisplayName = (tier: string) => {
    switch (tier) {
      case 'admin':
        return 'Administrator';
      case 'pro':
        return 'Professional';
      case 'team':
        return 'Team';
      case 'enterprise':
        return 'Enterprise';
      default:
        return 'Free';
    }
  };

  const getTierIcon = (tier: string) => {
    if (tier === 'free') return null;
    if (tier === 'admin') return <Crown className="h-4 w-4 text-red-500" />;
    return <Crown className="h-4 w-4 text-yellow-500" />;
  };

  const handlePlanSelect = (planName: string) => {
    console.log('Plan selected:', planName);
    // In a real app, this would redirect to checkout or billing portal
  };

  return (
    <div className="space-y-6">
      {/* Current Subscription Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {getTierIcon(subscriptionTier)}
            Current Subscription
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div>
              <label className="text-sm font-medium text-muted-foreground">Plan</label>
              <p className="text-lg font-semibold flex items-center gap-2">
                {getTierDisplayName(subscriptionTier)}
                {subscriptionTier !== 'free' && (
                  <Badge variant="secondary">{subscriptionTier}</Badge>
                )}
              </p>
            </div>

            {billingCycle && (
              <div>
                <label className="text-sm font-medium text-muted-foreground">Billing Cycle</label>
                <p className="text-lg font-semibold capitalize">{billingCycle}</p>
              </div>
            )}

            {nextBillingDate && (
              <div>
                <label className="text-sm font-medium text-muted-foreground">Next Billing Date</label>
                <p className="text-lg font-semibold flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  {formatDate(nextBillingDate)}
                </p>
              </div>
            )}
          </div>

          {paymentMethod && (
            <div className="mt-4 pt-4 border-t">
              <label className="text-sm font-medium text-muted-foreground">Payment Method</label>
              <div className="flex items-center gap-2 mt-1">
                <CreditCard className="h-4 w-4" />
                <span>•••• •••• •••• {paymentMethod.last4 || '••••'}</span>
                <Badge variant="outline">{paymentMethod.brand || 'Card'}</Badge>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Usage and Quota Status */}
      <Card>
        <CardHeader>
          <CardTitle>Usage & Limits</CardTitle>
        </CardHeader>
        <CardContent>
          <QuotaStatus
            used={mockUsageData.used}
            limit={mockUsageData.limit}
            resetDate={mockUsageData.resetDate}
            planName={getTierDisplayName(subscriptionTier)}
            onUpgrade={() => console.log('Upgrade clicked')}
          />
        </CardContent>
      </Card>

      {/* Plan Management - Hide for admin users */}
      {subscriptionTier !== 'admin' && (
        <Card>
          <CardHeader>
            <CardTitle>Plan Management</CardTitle>
          </CardHeader>
          <CardContent>
            <PlanUpgrade 
              currentPlan={getTierDisplayName(subscriptionTier)}
              onSelectPlan={handlePlanSelect}
            />
          </CardContent>
        </Card>
      )}

      {/* Billing History */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Receipt className="h-5 w-5" />
            Billing History
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoadingBilling ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : !billingHistory || billingHistory.length === 0 ? (
            <div className="text-center py-8">
              <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">No billing history</h3>
              <p className="text-muted-foreground mb-4">
                {subscriptionTier === 'free' 
                  ? "You're currently on the free plan with no billing history."
                  : "No billing transactions found for your account."
                }
              </p>
              {subscriptionTier === 'free' && (
                <Button variant="outline">
                  Upgrade to view billing history
                </Button>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Invoice</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {billingHistory.map((transaction: any) => (
                    <TableRow key={transaction.id}>
                      <TableCell className="font-medium">
                        {formatDate(transaction.created_at)}
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">{transaction.description}</p>
                          {transaction.billing_period_start && transaction.billing_period_end && (
                            <p className="text-sm text-muted-foreground">
                              {formatDate(transaction.billing_period_start)} - {formatDate(transaction.billing_period_end)}
                            </p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="font-medium">
                        {formatCurrency(transaction.amount / 100)}
                      </TableCell>
                      <TableCell>
                        <Badge variant={getStatusBadgeVariant(transaction.status)}>
                          {transaction.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        {transaction.invoice_url ? (
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => window.open(transaction.invoice_url, '_blank')}
                          >
                            View
                          </Button>
                        ) : (
                          <span className="text-muted-foreground text-sm">N/A</span>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {billingHistory.length > 5 && (
                <div className="text-center pt-4">
                  <Button variant="outline" size="sm">
                    View All Transactions
                  </Button>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Account Actions - Hide for admin users */}
      {subscriptionTier !== 'free' && subscriptionTier !== 'admin' && (
        <Card>
          <CardHeader>
            <CardTitle>Account Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-3">
              <Button variant="outline" size="sm">
                Update Payment Method
              </Button>
              <Button variant="outline" size="sm">
                Download All Invoices
              </Button>
              <Button variant="outline" size="sm">
                Billing Portal
              </Button>
              <Separator orientation="vertical" className="h-6" />
              <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive">
                Cancel Subscription
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}