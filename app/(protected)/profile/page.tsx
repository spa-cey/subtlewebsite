'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext-nextjs';
import { ProfileInformation } from '@/components/profile/ProfileInformation';
import AccountSettings from '@/components/profile/AccountSettings';
import { SecuritySettings } from '@/components/profile/SecuritySettings';
import { SubscriptionManagement } from '@/components/profile/SubscriptionManagement';
import UsageAnalytics from '@/components/profile/UsageAnalytics';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { User, Settings, Shield, CreditCard, BarChart3 } from 'lucide-react';

export default function ProfilePage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('profile');
  const [userProfile, setUserProfile] = useState<any>(null);
  const [profileLoading, setProfileLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    // Simulate fetching user profile data
    if (user) {
      setTimeout(() => {
        setUserProfile({
          id: user.id,
          email: user.email,
          fullName: user.fullName,
          avatarUrl: user.avatarUrl,
          bio: '',
          location: '',
          website: '',
          subscriptionTier: user.subscriptionTier || 'free',
          emailNotifications: true,
          marketingEmails: false,
        });
        setProfileLoading(false);
      }, 500);
    }
  }, [user]);

  if (authLoading || profileLoading) {
    return (
      <div className="container mx-auto px-4 py-8 pt-24">
        <div className="max-w-6xl mx-auto">
          <Skeleton className="h-10 w-48 mb-8" />
          <div className="grid gap-6">
            <Skeleton className="h-[400px] w-full" />
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const tabs = [
    { value: 'profile', label: 'Profile', icon: User },
    { value: 'account', label: 'Account', icon: Settings },
    { value: 'security', label: 'Security', icon: Shield },
    { value: 'subscription', label: 'Subscription', icon: CreditCard },
    { value: 'usage', label: 'Usage', icon: BarChart3 },
  ];

  return (
    <div className="container mx-auto px-4 py-8 pt-24">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">My Profile</h1>
          <p className="text-muted-foreground">
            Manage your profile information and account settings
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid grid-cols-2 md:grid-cols-5 gap-2 h-auto p-1">
            {tabs.map((tab) => (
              <TabsTrigger
                key={tab.value}
                value={tab.value}
                className="flex items-center gap-2 py-3"
              >
                <tab.icon className="h-4 w-4" />
                <span className="hidden sm:inline">{tab.label}</span>
              </TabsTrigger>
            ))}
          </TabsList>

          <TabsContent value="profile" className="space-y-6">
            <ProfileInformation 
              user={user} 
              profile={userProfile}
              onUpdate={(updatedProfile) => setUserProfile(updatedProfile)}
            />
          </TabsContent>

          <TabsContent value="account" className="space-y-6">
            <AccountSettings 
              user={user}
              profile={userProfile}
              onUpdate={(updatedProfile) => setUserProfile(updatedProfile)}
            />
          </TabsContent>

          <TabsContent value="security" className="space-y-6">
            <SecuritySettings userId={user.id} />
          </TabsContent>

          <TabsContent value="subscription" className="space-y-6">
            <SubscriptionManagement 
              user={user}
              profile={userProfile}
            />
          </TabsContent>

          <TabsContent value="usage" className="space-y-6">
            <UsageAnalytics userId={user.id} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}