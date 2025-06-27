import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { 
  Shield, 
  Smartphone, 
  Monitor, 
  Globe, 
  AlertTriangle, 
  Clock, 
  MapPin, 
  LogOut,
  Download,
  Eye,
  EyeOff,
  Trash2,
  CheckCircle,
  XCircle
} from 'lucide-react';
import { useUserSessions } from '@/hooks/useUsers';
import { toast } from '@/hooks/use-toast';

interface SecuritySettingsProps {
  userId: string;
}

export function SecuritySettings({ userId }: SecuritySettingsProps) {
  const { sessions, sessionSyncLogs, revokeSession, revokeAllOtherSessions, isLoading } = useUserSessions(userId);
  const [showPasswords, setShowPasswords] = useState(false);
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);

  const handleRevokeSession = async (sessionId: string) => {
    try {
      await revokeSession(sessionId);
      toast({
        title: "Session revoked",
        description: "The session has been successfully terminated.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to revoke session. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleRevokeAllOther = async () => {
    try {
      await revokeAllOtherSessions();
      toast({
        title: "All other sessions revoked",
        description: "You have been signed out of all other devices.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to revoke sessions. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleExportData = () => {
    toast({
      title: "Data export initiated",
      description: "Your data export will be emailed to you within 24 hours.",
    });
  };

  const getDeviceIcon = (deviceType: string) => {
    switch (deviceType?.toLowerCase()) {
      case 'mobile':
      case 'ios':
      case 'android':
        return <Smartphone className="h-4 w-4" />;
      case 'desktop':
      case 'mac':
      case 'windows':
      case 'linux':
        return <Monitor className="h-4 w-4" />;
      default:
        return <Globe className="h-4 w-4" />;
    }
  };

  const formatLastActive = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  const getSessionStatus = (session: any) => {
    const isCurrentSession = session.is_current;
    const isMacApp = (session as any).session_bridge_tokens?.length > 0;
    const lastActive = new Date(session.last_activity);
    const now = new Date();
    const hoursInactive = (now.getTime() - lastActive.getTime()) / (1000 * 60 * 60);

    if (isCurrentSession) return { status: 'Current', variant: 'default' as const };
    if (isMacApp && hoursInactive < 24) return { status: 'Mac App Active', variant: 'secondary' as const };
    if (hoursInactive < 1) return { status: 'Active', variant: 'secondary' as const };
    if (hoursInactive < 24) return { status: 'Recent', variant: 'outline' as const };
    return { status: 'Inactive', variant: 'destructive' as const };
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid gap-4">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-muted rounded w-1/2"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  const activeSessions = sessions?.filter(s => (s as any).status === 'active') || [];
  const macAppSessions = activeSessions.filter(s => (s as any).session_bridge_tokens?.length > 0);
  const recentLoginHistory = sessions?.slice(0, 10) || [];

  return (
    <div className="space-y-6">
      {/* Active Sessions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Active Sessions
          </CardTitle>
          <CardDescription>
            Manage your active sessions and connected devices
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {activeSessions.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Shield className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No active sessions found</p>
            </div>
          ) : (
            <>
              {activeSessions.map((session) => {
                const { status, variant } = getSessionStatus(session);
                const isMacApp = (session as any).session_bridge_tokens?.length > 0;
                
                return (
                  <div key={session.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      {getDeviceIcon((session as any).device_type)}
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-medium">
                            {(session as any).device_name || (session as any).device_type || 'Unknown Device'}
                          </span>
                          <Badge variant={variant}>{status}</Badge>
                          {isMacApp && (
                            <Badge variant="outline" className="text-blue-600">
                              Mac App
                            </Badge>
                          )}
                        </div>
                        <div className="text-sm text-muted-foreground space-y-1">
                          <div className="flex items-center gap-4">
                            <span className="flex items-center gap-1">
                              <MapPin className="h-3 w-3" />
                              {session.ip_address} • {(session as any).location || 'Unknown location'}
                            </span>
                            <span className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {formatLastActive(session.last_activity)}
                            </span>
                          </div>
                          {isMacApp && (session as any).session_bridge_tokens?.length > 0 && (
                            <div className="text-xs text-blue-600">
                              Bridge tokens: {(session as any).session_bridge_tokens.length} active
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                    {!(session as any).is_current && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleRevokeSession(session.id)}
                        className="text-destructive hover:text-destructive"
                      >
                        <LogOut className="h-4 w-4 mr-1" />
                        Revoke
                      </Button>
                    )}
                  </div>
                );
              })}
              
              {activeSessions.length > 1 && (
                <div className="pt-4 border-t">
                  <Button 
                    variant="destructive" 
                    onClick={handleRevokeAllOther}
                    className="w-full"
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    Sign out all other sessions
                  </Button>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Mac App Integration Status */}
      {macAppSessions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Monitor className="h-5 w-5" />
              Mac App Integration
            </CardTitle>
            <CardDescription>
              Connected Mac applications and sync status
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {macAppSessions.map((session) => (
              <div key={session.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-3">
                  <Monitor className="h-5 w-5 text-blue-600" />
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">
                        {(session as any).device_name || 'Mac Desktop'}
                      </span>
                      <Badge variant="secondary">Connected</Badge>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Last sync: {formatLastActive(session.last_activity)}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span className="text-sm text-green-600">Synced</span>
                </div>
              </div>
            ))}
            
            {sessionSyncLogs && sessionSyncLogs.length > 0 && (
              <div className="pt-4 border-t">
                <h4 className="font-medium mb-2">Recent Sync Activity</h4>
                <div className="space-y-2">
                  {sessionSyncLogs.slice(0, 3).map((log, index) => (
                    <div key={index} className="text-sm text-muted-foreground flex items-center gap-2">
                      <CheckCircle className="h-3 w-3 text-green-600" />
                      {log.action} • {formatLastActive(log.timestamp)}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Two-Factor Authentication */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Two-Factor Authentication
          </CardTitle>
          <CardDescription>
            Add an extra layer of security to your account
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="2fa-toggle">Enable Two-Factor Authentication</Label>
              <p className="text-sm text-muted-foreground">
                Secure your account with authenticator app or SMS
              </p>
            </div>
            <Switch
              id="2fa-toggle"
              checked={twoFactorEnabled}
              onCheckedChange={setTwoFactorEnabled}
            />
          </div>
          
          {!twoFactorEnabled && (
            <div className="p-4 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-lg">
              <div className="flex items-center gap-2 text-amber-800 dark:text-amber-200">
                <AlertTriangle className="h-4 w-4" />
                <span className="font-medium">Security Recommendation</span>
              </div>
              <p className="text-sm text-amber-700 dark:text-amber-300 mt-1">
                Enable two-factor authentication to significantly improve your account security.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Login History */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Login History
          </CardTitle>
          <CardDescription>
            Recent login attempts and security events
          </CardDescription>
        </CardHeader>
        <CardContent>
          {recentLoginHistory.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Clock className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No login history available</p>
            </div>
          ) : (
            <div className="space-y-3">
              {recentLoginHistory.map((session, index) => (
                <div key={session.id || index} className="flex items-center gap-3 p-3 border rounded-lg">
                  {(session as any).status === 'active' ? (
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  ) : (
                    <XCircle className="h-4 w-4 text-gray-400" />
                  )}
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">
                        {(session as any).device_name || (session as any).device_type || 'Unknown Device'}
                      </span>
                      <Badge variant={(session as any).status === 'active' ? 'secondary' : 'outline'}>
                        {(session as any).status}
                      </Badge>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {session.ip_address} • {(session as any).location || 'Unknown location'} • {formatLastActive(session.created_at)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Privacy & Data */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Privacy & Data
          </CardTitle>
          <CardDescription>
            Manage your privacy settings and data
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="show-passwords">Show saved passwords</Label>
              <p className="text-sm text-muted-foreground">
                Display saved passwords in forms
              </p>
            </div>
            <Switch
              id="show-passwords"
              checked={showPasswords}
              onCheckedChange={setShowPasswords}
            />
          </div>
          
          <Separator />
          
          <div className="space-y-3">
            <h4 className="font-medium">Data Management</h4>
            <div className="flex gap-2">
              <Button variant="outline" onClick={handleExportData}>
                <Download className="h-4 w-4 mr-2" />
                Export Data
              </Button>
              <Button variant="outline" className="text-destructive hover:text-destructive">
                <Trash2 className="h-4 w-4 mr-2" />
                Delete Account
              </Button>
            </div>
            <p className="text-sm text-muted-foreground">
              Export your data or permanently delete your account and all associated data.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}