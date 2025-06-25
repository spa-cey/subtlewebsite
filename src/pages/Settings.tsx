import React, { useState, useEffect } from 'react';
import { AnimatedTransition } from '@/components/AnimatedTransition';
import { useAnimateIn } from '@/lib/animations';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { User, Bell, Shield, HelpCircle, CreditCard, Zap } from 'lucide-react';
import { QuotaStatus, PlanUpgrade } from '@/components/subscription';
import { useAuth } from '@/contexts/AuthContext';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

const Settings = () => {
  const showContent = useAnimateIn(false, 300);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { subscription, refreshSubscription } = useAuth();
  const [activeTab, setActiveTab] = useState(searchParams.get('tab') || 'general');

  useEffect(() => {
    // Update active tab if URL parameter changes
    const tab = searchParams.get('tab');
    if (tab) {
      setActiveTab(tab);
    }
  }, [searchParams]);

  const handlePlanSelect = async (planName: string) => {
    // TODO: Implement plan selection and payment flow
    toast.info("Plan Selection", {
      description: `You selected the ${planName} plan. Payment integration coming soon!`,
    });
  };

  const handleUpgrade = () => {
    setActiveTab('subscription');
    navigate('/settings?tab=subscription');
  };
  
  return (
    <div className="max-w-7xl mx-auto px-4 pt-24 pb-16">
      <AnimatedTransition show={showContent} animation="slide-up">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold">Settings</h1>
          <p className="text-muted-foreground mt-2">
            Customize your digital second brain
          </p>
        </div>
        
        <div className="max-w-3xl mx-auto">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-6 mb-8">
              <TabsTrigger value="general" className="flex items-center gap-2">
                <User className="h-4 w-4" />
                <span className="hidden sm:inline">General</span>
              </TabsTrigger>
              <TabsTrigger value="subscription" className="flex items-center gap-2">
                <Zap className="h-4 w-4" />
                <span className="hidden sm:inline">Subscription</span>
              </TabsTrigger>
              <TabsTrigger value="appearance" className="flex items-center gap-2">
                <span className="hidden sm:inline">Appearance</span>
              </TabsTrigger>
              <TabsTrigger value="notifications" className="flex items-center gap-2">
                <Bell className="h-4 w-4" />
                <span className="hidden sm:inline">Notifications</span>
              </TabsTrigger>
              <TabsTrigger value="privacy" className="flex items-center gap-2">
                <Shield className="h-4 w-4" />
                <span className="hidden sm:inline">Privacy</span>
              </TabsTrigger>
              <TabsTrigger value="billing" className="flex items-center gap-2">
                <CreditCard className="h-4 w-4" />
                <span className="hidden sm:inline">Billing</span>
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="general">
              <Card>
                <CardHeader>
                  <CardTitle>General Settings</CardTitle>
                  <CardDescription>
                    Manage your account settings and preferences.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="auto-save" className="text-base">Auto-save</Label>
                      <p className="text-sm text-muted-foreground">
                        Automatically save changes as you work
                      </p>
                    </div>
                    <Switch id="auto-save" defaultChecked />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="ai-suggestions" className="text-base">AI Suggestions</Label>
                      <p className="text-sm text-muted-foreground">
                        Allow AI to provide content suggestions
                      </p>
                    </div>
                    <Switch id="ai-suggestions" defaultChecked />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="subscription" className="space-y-6">
              {subscription && (
                <>
                  <QuotaStatus
                    used={subscription.quotaUsed}
                    limit={subscription.tier.quotaLimit}
                    resetDate={subscription.quotaResetDate}
                    planName={subscription.tier.name}
                    onUpgrade={handleUpgrade}
                  />
                  
                  <Card>
                    <CardHeader>
                      <CardTitle>Upgrade Your Plan</CardTitle>
                      <CardDescription>
                        Choose a plan that fits your needs and unlock more AI requests
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <PlanUpgrade 
                        currentPlan={subscription.tier.name}
                        onSelectPlan={handlePlanSelect}
                      />
                    </CardContent>
                  </Card>
                </>
              )}
            </TabsContent>
            
            <TabsContent value="appearance">
              <Card>
                <CardHeader>
                  <CardTitle>Appearance</CardTitle>
                  <CardDescription>
                    Customize how your second brain looks
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="dark-mode" className="text-base">Dark Mode</Label>
                      <p className="text-sm text-muted-foreground">
                        Toggle between light and dark themes
                      </p>
                    </div>
                    <Switch id="dark-mode" defaultChecked />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="animations" className="text-base">Animations</Label>
                      <p className="text-sm text-muted-foreground">
                        Enable smooth transitions and animations
                      </p>
                    </div>
                    <Switch id="animations" defaultChecked />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="compact-view" className="text-base">Compact View</Label>
                      <p className="text-sm text-muted-foreground">
                        Display more content with less spacing
                      </p>
                    </div>
                    <Switch id="compact-view" />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="notifications">
              <Card>
                <CardHeader>
                  <CardTitle>Notifications</CardTitle>
                  <CardDescription>
                    Manage your notification preferences
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="email-notifications" className="text-base">Email Notifications</Label>
                      <p className="text-sm text-muted-foreground">
                        Receive updates and alerts via email
                      </p>
                    </div>
                    <Switch id="email-notifications" defaultChecked />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="usage-alerts" className="text-base">Usage Alerts</Label>
                      <p className="text-sm text-muted-foreground">
                        Get notified when approaching quota limits
                      </p>
                    </div>
                    <Switch id="usage-alerts" defaultChecked />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="privacy">
              <Card>
                <CardHeader>
                  <CardTitle>Privacy</CardTitle>
                  <CardDescription>
                    Control your privacy settings
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="analytics" className="text-base">Analytics</Label>
                      <p className="text-sm text-muted-foreground">
                        Help improve Subtle by sharing usage data
                      </p>
                    </div>
                    <Switch id="analytics" />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="data-export" className="text-base">Data Export</Label>
                      <p className="text-sm text-muted-foreground">
                        Allow exporting your data
                      </p>
                    </div>
                    <Switch id="data-export" defaultChecked />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="billing">
              <Card>
                <CardHeader>
                  <CardTitle>Billing</CardTitle>
                  <CardDescription>
                    Manage your billing information and payment methods
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Billing integration coming soon. Your current plan is: {subscription?.tier.name || 'Free'}
                  </p>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </AnimatedTransition>
    </div>
  );
};

export default Settings;
