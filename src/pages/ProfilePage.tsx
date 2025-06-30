import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { ProfileInformation } from '@/components/profile/ProfileInformation';
import { SubscriptionManagement } from '@/components/profile/SubscriptionManagement';
import AccountSettings from '@/components/profile/AccountSettings';
import UsageAnalytics from '@/components/profile/UsageAnalytics';
import { SecuritySettings } from '@/components/profile/SecuritySettings';
import {
  User,
  CreditCard,
  Settings,
  BarChart3,
  Shield,
  Mail,
  Calendar
} from 'lucide-react';

const ProfilePage: React.FC = () => {
  const { user, profile, loading } = useAuth();

  if (loading) {
    return (
      <div className="container mx-auto py-8 px-4 pt-24">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center space-x-4 mb-8">
            <Skeleton className="h-16 w-16 rounded-full" />
            <div className="space-y-2">
              <Skeleton className="h-6 w-48" />
              <Skeleton className="h-4 w-32" />
            </div>
          </div>
          <Skeleton className="h-12 w-full mb-4" />
          <Skeleton className="h-96 w-full" />
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="container mx-auto py-8 px-4 pt-24">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Authentication Required
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Please log in to view your profile.
          </p>
        </div>
      </div>
    );
  }

  const getUserInitials = (email: string) => {
    return email.substring(0, 2).toUpperCase();
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="container mx-auto py-8 px-4 pt-24">
      <div className="max-w-4xl mx-auto">
        {/* Profile Header */}
        <div className="flex items-center space-x-6 mb-8">
          <Avatar className="h-16 w-16">
            <AvatarImage src={profile?.avatarUrl || user.avatarUrl} />
            <AvatarFallback className="text-lg font-semibold">
              {getUserInitials(user.email || '')}
            </AvatarFallback>
          </Avatar>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              {profile?.fullName || user.fullName || user.email}
            </h1>
            <div className="flex items-center space-x-4 mt-2">
              <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                <Mail className="h-4 w-4 mr-1" />
                {user.email}
              </div>
              <Badge variant="secondary" className="text-xs">
                {profile?.subscriptionTier || 'Free'}
              </Badge>
            </div>
            {user.createdAt && (
              <div className="flex items-center text-sm text-gray-500 dark:text-gray-500 mt-1">
                <Calendar className="h-4 w-4 mr-1" />
                Member since {formatDate(user.createdAt)}
              </div>
            )}
          </div>
        </div>

        {/* Profile Tabs */}
        <Tabs defaultValue="profile" className="w-full">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="profile" className="flex items-center gap-2">
              <User className="h-4 w-4" />
              Profile
            </TabsTrigger>
            <TabsTrigger value="subscription" className="flex items-center gap-2">
              <CreditCard className="h-4 w-4" />
              Subscription
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              Settings
            </TabsTrigger>
            <TabsTrigger value="analytics" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Analytics
            </TabsTrigger>
            <TabsTrigger value="security" className="flex items-center gap-2">
              <Shield className="h-4 w-4" />
              Security
            </TabsTrigger>
          </TabsList>

          <TabsContent value="profile" className="mt-6">
            <ProfileInformation />
          </TabsContent>

          <TabsContent value="subscription" className="mt-6">
            <SubscriptionManagement />
          </TabsContent>

          <TabsContent value="settings" className="mt-6">
            <AccountSettings />
          </TabsContent>

          <TabsContent value="analytics" className="mt-6">
            <UsageAnalytics />
          </TabsContent>

          <TabsContent value="security" className="mt-6">
            <SecuritySettings userId={user.id} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default ProfilePage;