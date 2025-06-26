import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useAuth } from '../contexts/AuthContext';
import { Loader2, AlertCircle } from 'lucide-react';

export default function Dashboard() {
  const { user, profile, loading, signOut } = useAuth();
  const [loadingTimeout, setLoadingTimeout] = useState(false);
  const [loadingStartTime] = useState(Date.now());

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

  const handleSignOut = async () => {
    await signOut();
  };

  // Initial loading state from AuthContext
  if (loading) {
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

  // Dashboard content
  console.log('[Dashboard] Rendering dashboard content for user:', {
    userId: user.id,
    profileId: profile.id,
    email: profile.email
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
              </dl>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>Common tasks</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button variant="outline" className="w-full" size="sm">
                Edit Profile
              </Button>
              <Button variant="outline" className="w-full" size="sm">
                View Activity
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}