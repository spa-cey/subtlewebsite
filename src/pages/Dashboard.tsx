import React, { useEffect, useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import {
  Loader2,
  AlertCircle,
  UserCircle,
  Settings,
  Upload,
  ShieldCheck
} from 'lucide-react';

interface NavigationItem {
  title: string;
  href: string;
  icon: React.FC<{ className?: string }>;
  description: string;
  adminOnly?: boolean;
}

const navigationItems: NavigationItem[] = [
  {
    title: 'Profile',
    href: '/profile',
    icon: UserCircle,
    description: 'User profile management'
  },
  {
    title: 'Settings',
    href: '/settings',
    icon: Settings,
    description: 'Application settings'
  },
  {
    title: 'Import',
    href: '/import',
    icon: Upload,
    description: 'Data import tools'
  },
  {
    title: 'Admin Dashboard',
    href: '/admin',
    icon: ShieldCheck,
    description: 'Admin controls',
    adminOnly: true
  }
];

export default function Dashboard() {
  const { user, profile, loading, signOut } = useAuth();
  const navigate = useNavigate();
  const [loadingTimeout, setLoadingTimeout] = useState(false);
  const [loadingStartTime] = useState(Date.now());
  const [isAdmin, setIsAdmin] = useState(false);
  const [checkingAdmin, setCheckingAdmin] = useState(true);

  useEffect(() => {
    console.log('[Dashboard] Component mounted', {
      user: !!user,
      profile: !!profile,
      loading,
      userId: user?.id,
      userEmail: user?.email
    });

    // Set a timeout to detect if profile loading is stuck
    const timeoutId = setTimeout(() => {
      if (!profile && user) {
        console.error('[Dashboard] Profile loading timeout - stuck for 10 seconds');
        setLoadingTimeout(true);
      }
    }, 10000); // 10 seconds timeout

    return () => {
      clearTimeout(timeoutId);
      const loadingDuration = Date.now() - loadingStartTime;
      console.log(`[Dashboard] Component unmounted after ${loadingDuration}ms`);
    };
  }, [profile, user, loadingStartTime]);

  useEffect(() => {
    console.log('[Dashboard] State update:', {
      loading,
      hasUser: !!user,
      hasProfile: !!profile,
      loadingTimeout
    });
  }, [loading, user, profile, loadingTimeout]);

  // Check admin status
  useEffect(() => {
    const checkAdminStatus = async () => {
      if (!user) {
        setCheckingAdmin(false);
        return;
      }

      try {
        console.log('[Dashboard] Checking admin status for user:', user.id);
        const { data, error } = await supabase
          .from('admins')
          .select('id')
          .eq('user_id', user.id)
          .single();

        if (error && error.code !== 'PGRST116') { // PGRST116 is "no rows returned"
          console.error('[Dashboard] Error checking admin status:', error);
        }

        setIsAdmin(!!data);
        console.log('[Dashboard] Admin status:', !!data);
      } catch (err) {
        console.error('[Dashboard] Failed to check admin status:', err);
      } finally {
        setCheckingAdmin(false);
      }
    };

    checkAdminStatus();
  }, [user]);

  const handleSignOut = async () => {
    await signOut();
  };

  const handleNavigate = (href: string) => {
    navigate(href);
  };

  // Initial loading state from AuthContext
  if (loading || checkingAdmin) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Initializing authentication...</p>
        </div>
      </div>
    );
  }

  // Not authenticated
  if (!user) {
    console.log('[Dashboard] No user found, redirecting to login');
    return <Navigate to="/login" replace />;
  }

  // Profile loading with timeout detection
  if (!profile) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <div className="max-w-md w-full space-y-4">
          {!loadingTimeout ? (
            <div className="text-center">
              <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
              <p className="text-muted-foreground">Loading your profile...</p>
              <p className="text-sm text-muted-foreground mt-2">
                User ID: {user.id}
              </p>
            </div>
          ) : (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Profile Loading Error</AlertTitle>
              <AlertDescription className="space-y-2">
                <p>Unable to load your profile. This could be due to:</p>
                <ul className="list-disc list-inside text-sm mt-2">
                  <li>Database connectivity issues</li>
                  <li>Row Level Security (RLS) policies blocking access</li>
                  <li>Profile data not properly linked to your auth account</li>
                </ul>
                <p className="mt-3">
                  Please check the browser console for detailed error logs.
                </p>
                <div className="mt-4 space-y-2">
                  <Button
                    onClick={() => window.location.reload()}
                    variant="outline"
                    className="w-full"
                  >
                    Refresh Page
                  </Button>
                  <Button
                    onClick={handleSignOut}
                    variant="outline"
                    className="w-full"
                  >
                    Sign Out
                  </Button>
                </div>
              </AlertDescription>
            </Alert>
          )}
        </div>
      </div>
    );
  }

  // Filter navigation items based on admin status
  const visibleNavigationItems = navigationItems.filter(
    item => !item.adminOnly || (item.adminOnly && isAdmin)
  );

  // Dashboard content
  console.log('[Dashboard] Rendering dashboard content for user:', {
    userId: user.id,
    profileId: profile.id,
    email: profile.email,
    isAdmin
  });

  return (
    <>
      <div className="container mx-auto p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <Button onClick={handleSignOut} variant="outline">
            Sign Out
          </Button>
        </div>

        <div className="grid gap-6">
          {/* Navigation Section */}
          <Card>
            <CardHeader>
              <CardTitle>Navigation</CardTitle>
              <CardDescription>Access different areas of the application</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {visibleNavigationItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <Card
                      key={item.href}
                      className="cursor-pointer hover:shadow-md transition-shadow duration-200"
                      onClick={() => handleNavigate(item.href)}
                    >
                      <CardHeader className="pb-3">
                        <div className="flex items-start space-x-3">
                          <Icon className="h-5 w-5 mt-0.5 text-primary" />
                          <div className="space-y-1">
                            <CardTitle className="text-base">{item.title}</CardTitle>
                            <CardDescription className="text-sm">
                              {item.description}
                            </CardDescription>
                          </div>
                        </div>
                      </CardHeader>
                    </Card>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Existing cards in a grid */}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle>Welcome back!</CardTitle>
                <CardDescription>
                  {profile.full_name || profile.email}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Member since {profile.created_at ? new Date(profile.created_at).toLocaleDateString() : 'Unknown'}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Account Status</CardTitle>
                <CardDescription>Your account details</CardDescription>
              </CardHeader>
              <CardContent>
                <dl className="space-y-2 text-sm">
                  <div>
                    <dt className="font-medium">Email</dt>
                    <dd className="text-muted-foreground">{profile.email}</dd>
                  </div>
                  <div>
                    <dt className="font-medium">Subscription</dt>
                    <dd className="text-muted-foreground">{profile.subscription_tier.charAt(0).toUpperCase() + profile.subscription_tier.slice(1)}</dd>
                  </div>
                  {isAdmin && (
                    <div>
                      <dt className="font-medium">Role</dt>
                      <dd className="text-muted-foreground">Administrator</dd>
                    </div>
                  )}
                </dl>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
                <CardDescription>Common tasks</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button
                  variant="outline"
                  className="w-full"
                  size="sm"
                  onClick={() => handleNavigate('/profile')}
                >
                  Edit Profile
                </Button>
                <Button
                  variant="outline"
                  className="w-full"
                  size="sm"
                  onClick={() => handleNavigate('/activity')}
                >
                  View Activity
                </Button>
                {isAdmin && (
                  <Button
                    variant="outline"
                    className="w-full"
                    size="sm"
                    onClick={() => handleNavigate('/admin')}
                  >
                    Admin Panel
                  </Button>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </>
  );
}
