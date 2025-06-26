import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth } from '../contexts/AuthContext';
import { debugLogger } from '../utils/debug';
import { Loader2, AlertCircle, Bug } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ProfileDebugPanel } from '../components/ProfileDebugPanel';

const COMPONENT_NAME = 'Dashboard';

interface LoadingState {
  isLoading: boolean;
  reasons: string[];
  startTime: number;
  timeout?: NodeJS.Timeout;
}

export default function Dashboard() {
  const { user, profile, loading: authLoading, signOut } = useAuth();
  const [authError, setAuthError] = useState<string | null>(null);
  const [loadingState, setLoadingState] = useState<LoadingState>({
    isLoading: true,
    reasons: ['Initializing dashboard'],
    startTime: Date.now()
  });
  const [showDebugInfo, setShowDebugInfo] = useState(false);

  // Log component mount
  useEffect(() => {
    debugLogger.info(COMPONENT_NAME, 'Dashboard mounted', {
      user: !!user,
      profile: !!profile,
      authLoading,
      authError: authError || 'none'
    });

    return () => {
      debugLogger.info(COMPONENT_NAME, 'Dashboard unmounted');
      if (loadingState.timeout) {
        clearTimeout(loadingState.timeout);
      }
    };
  }, []);

  // Update loading state based on auth state
  useEffect(() => {
    const reasons: string[] = [];
    
    if (authLoading) {
      reasons.push('Authenticating user');
    }
    
    if (user && !profile) {
      reasons.push('Loading user profile');
    }

    const isLoading = authLoading || (user && !profile);
    const elapsedTime = Date.now() - loadingState.startTime;

    debugLogger.debug(COMPONENT_NAME, 'Loading state update', {
      isLoading,
      reasons,
      elapsedTime,
      user: !!user,
      profile: !!profile,
      authLoading
    });

    setLoadingState(prev => {
      // Clear existing timeout
      if (prev.timeout) {
        clearTimeout(prev.timeout);
      }

      // Set new timeout if still loading
      let newTimeout: NodeJS.Timeout | undefined;
      if (isLoading && elapsedTime < 10000) {
        newTimeout = setTimeout(() => {
          debugLogger.error(COMPONENT_NAME, 'Loading timeout reached', {
            reasons,
            elapsedTime: Date.now() - loadingState.startTime
          });
          setLoadingState(prev => ({
            ...prev,
            isLoading: false,
            reasons: ['Loading timeout - something went wrong']
          }));
        }, 10000 - elapsedTime);
      }

      return {
        ...prev,
        isLoading,
        reasons,
        timeout: newTimeout
      };
    });
  }, [authLoading, user, profile, loadingState.startTime]);

  // Log auth state changes
  useEffect(() => {
    debugLogger.info(COMPONENT_NAME, 'Auth state changed', {
      user: user ? { id: user.id, email: user.email } : null,
      profile: profile ? { id: profile.id, email: profile.email } : null,
      authLoading,
      authError: authError || 'none'
    });
  }, [user, profile, authLoading, authError]);

  const handleSignOut = async () => {
    debugLogger.info(COMPONENT_NAME, 'Sign out requested');
    try {
      await signOut();
    } catch (error) {
      debugLogger.error(COMPONENT_NAME, 'Sign out failed', error);
    }
  };

  // Calculate loading time
  const loadingTime = Date.now() - loadingState.startTime;
  const showTimeoutWarning = loadingTime > 5000;

  // Render logic with detailed logging
  if (!authLoading && !user) {
    debugLogger.info(COMPONENT_NAME, 'No user, redirecting to login');
    return <Navigate to="/login" replace />;
  }

  if (loadingState.isLoading || authLoading) {
    debugLogger.debug(COMPONENT_NAME, 'Rendering loading state', {
      loadingTime,
      reasons: loadingState.reasons
    });

    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Loader2 className="h-5 w-5 animate-spin" />
              Loading Dashboard
            </CardTitle>
            <CardDescription>
              {loadingState.reasons.join(' • ')}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-sm text-muted-foreground">
              Loading time: {(loadingTime / 1000).toFixed(1)}s
            </div>
            
            {showTimeoutWarning && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Taking longer than expected</AlertTitle>
                <AlertDescription>
                  The dashboard is taking unusually long to load. This might indicate a problem with the database connection.
                </AlertDescription>
              </Alert>
            )}

            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowDebugInfo(!showDebugInfo)}
              className="w-full"
            >
              <Bug className="h-4 w-4 mr-2" />
              {showDebugInfo ? 'Hide' : 'Show'} Debug Info
            </Button>

            {showDebugInfo && (
              <div className="bg-muted p-3 rounded-md text-xs font-mono space-y-1">
                <div>Auth Loading: {String(authLoading)}</div>
                <div>User: {user ? `${user.email} (${user.id})` : 'null'}</div>
                <div>Profile: {profile ? 'loaded' : 'null'}</div>
                <div>Error: {authError || 'none'}</div>
                <div>Loading Time: {loadingTime}ms</div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  if (authError) {
    debugLogger.error(COMPONENT_NAME, 'Rendering error state', { authError });

    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-destructive">Error Loading Dashboard</CardTitle>
            <CardDescription>{authError}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button onClick={() => window.location.reload()} variant="outline">
              Refresh Page
            </Button>
            <Button onClick={handleSignOut} variant="ghost">
              Sign Out
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Check if we have both user and profile
  if (!user || !profile) {
    debugLogger.warn(COMPONENT_NAME, 'Missing user or profile after loading', {
      user: !!user,
      profile: !!profile
    });

    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <div className="w-full max-w-2xl space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Profile Setup Required</CardTitle>
              <CardDescription>
                Your user profile needs to be set up. This might happen if you signed up before the system was fully configured.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-muted p-3 rounded-md text-sm">
                <p>User ID: {user?.id || 'Unknown'}</p>
                <p>Email: {user?.email || 'Unknown'}</p>
                <p>Profile Status: {profile ? 'Found' : 'Missing'}</p>
              </div>
              <Button onClick={() => window.location.reload()}>
                Retry Loading
              </Button>
              <Button onClick={handleSignOut} variant="outline">
                Sign Out
              </Button>
            </CardContent>
          </Card>
          
          {/* Add the debug panel for easier troubleshooting */}
          <ProfileDebugPanel />
        </div>
      </div>
    );
  }

  debugLogger.info(COMPONENT_NAME, 'Rendering dashboard content', {
    userId: user.id,
    userEmail: user.email,
    profileId: profile.id
  });

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <div className="flex items-center gap-4">
          {process.env.NODE_ENV === 'development' && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowDebugInfo(!showDebugInfo)}
            >
              <Bug className="h-4 w-4" />
            </Button>
          )}
          <Button onClick={handleSignOut} variant="outline">
            Sign Out
          </Button>
        </div>
      </div>

      {showDebugInfo && (
        <Alert className="mb-6">
          <Bug className="h-4 w-4" />
          <AlertTitle>Debug Information</AlertTitle>
          <AlertDescription>
            <div className="mt-2 space-y-1 text-xs font-mono">
              <div>User ID: {user.id}</div>
              <div>Email: {user.email}</div>
              <div>Profile ID: {profile.id}</div>
              <div>Profile Email: {profile.email}</div>
              <div>Subscription Tier: {profile.subscription_tier || 'free'}</div>
              <div>Created: {profile.created_at ? new Date(profile.created_at).toLocaleString() : 'Unknown'}</div>
              <div>Load Time: {(loadingTime / 1000).toFixed(2)}s</div>
            </div>
          </AlertDescription>
        </Alert>
      )}

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
  );
}