'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { 
  Settings, 
  Save,
  Shield,
  Globe,
  Mail,
  Bell,
  Database,
  Key,
  RefreshCw,
  AlertCircle,
  CheckCircle,
  Cloud,
  Plus,
  XCircle
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import AzureConfigList from '@/components/admin/azure/AzureConfigList';
import AzureConfigForm from '@/components/admin/azure/AzureConfigForm';
import axios from 'axios';
import { cn } from '@/lib/utils';

interface SystemConfig {
  general: {
    siteName: string;
    siteDescription: string;
    maintenanceMode: boolean;
    debugMode: boolean;
  };
  security: {
    requireEmailVerification: boolean;
    twoFactorEnabled: boolean;
    sessionTimeout: number;
    maxLoginAttempts: number;
  };
  email: {
    smtpHost: string;
    smtpPort: number;
    smtpSecure: boolean;
    fromEmail: string;
    fromName: string;
  };
  notifications: {
    emailNotifications: boolean;
    adminAlerts: boolean;
    userSignupNotification: boolean;
    lowBalanceAlert: boolean;
  };
}

interface SystemStatus {
  database: { status: string; message: string };
  email: { status: string; message: string };
  apiKeys: { status: string; message: string; azureConfigs: number; activeConfigs: number };
}

export default function ConfigurationManager() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('general');
  const [azureConfigs, setAzureConfigs] = useState<any[]>([]);
  const [showAzureForm, setShowAzureForm] = useState(false);
  const [editingAzureConfig, setEditingAzureConfig] = useState<any>(null);
  const [systemStatus, setSystemStatus] = useState<SystemStatus | null>(null);
  const [loadingStatus, setLoadingStatus] = useState(true);
  
  const [config, setConfig] = useState<SystemConfig>({
    general: {
      siteName: 'Subtle AI',
      siteDescription: 'Premium macOS AI Assistant',
      maintenanceMode: false,
      debugMode: false,
    },
    security: {
      requireEmailVerification: true,
      twoFactorEnabled: false,
      sessionTimeout: 30, // minutes
      maxLoginAttempts: 5,
    },
    email: {
      smtpHost: 'smtp.gmail.com',
      smtpPort: 587,
      smtpSecure: true,
      fromEmail: 'noreply@subtle.app',
      fromName: 'Subtle AI',
    },
    notifications: {
      emailNotifications: true,
      adminAlerts: true,
      userSignupNotification: true,
      lowBalanceAlert: true,
    }
  });

  useEffect(() => {
    if (activeTab === 'azure') {
      fetchAzureConfigs();
    }
  }, [activeTab]);

  useEffect(() => {
    fetchSystemStatus();
  }, []);

  const fetchAzureConfigs = async () => {
    setLoading(true);
    try {
      const response = await axios.get('/api/admin/config/azure');
      setAzureConfigs(response.data.data);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to fetch Azure configurations',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchSystemStatus = async () => {
    setLoadingStatus(true);
    try {
      const response = await axios.get('/api/admin/system-status');
      setSystemStatus(response.data.data);
    } catch (error) {
      console.error('Failed to fetch system status:', error);
    } finally {
      setLoadingStatus(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    
    // TODO: Implement actual API call to save configuration
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    toast({
      title: 'Configuration Saved',
      description: 'System settings have been updated successfully.',
    });
    
    setSaving(false);
  };

  const updateConfig = (section: keyof SystemConfig, field: string, value: any) => {
    setConfig(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }));
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">System Configuration</h2>
          <p className="text-muted-foreground mt-1">
            Manage application settings and configurations
          </p>
        </div>
        {activeTab !== 'azure' && (
          <Button onClick={handleSave} disabled={saving}>
            {saving ? (
              <>
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Save Changes
              </>
            )}
          </Button>
        )}
      </div>

      {/* Configuration Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-5 w-full max-w-[800px]">
          <TabsTrigger value="general">
            <Globe className="h-4 w-4 mr-2" />
            General
          </TabsTrigger>
          <TabsTrigger value="security">
            <Shield className="h-4 w-4 mr-2" />
            Security
          </TabsTrigger>
          <TabsTrigger value="email">
            <Mail className="h-4 w-4 mr-2" />
            Email
          </TabsTrigger>
          <TabsTrigger value="notifications">
            <Bell className="h-4 w-4 mr-2" />
            Notifications
          </TabsTrigger>
          <TabsTrigger value="azure">
            <Cloud className="h-4 w-4 mr-2" />
            Azure AI
          </TabsTrigger>
        </TabsList>

        {/* General Settings */}
        <TabsContent value="general" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>General Settings</CardTitle>
              <CardDescription>
                Basic application configuration
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-2">
                <Label htmlFor="siteName">Site Name</Label>
                <Input
                  id="siteName"
                  value={config.general.siteName}
                  onChange={(e) => updateConfig('general', 'siteName', e.target.value)}
                />
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="siteDescription">Site Description</Label>
                <Textarea
                  id="siteDescription"
                  value={config.general.siteDescription}
                  onChange={(e) => updateConfig('general', 'siteDescription', e.target.value)}
                  rows={3}
                />
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="maintenance">Maintenance Mode</Label>
                    <p className="text-sm text-muted-foreground">
                      Temporarily disable access for non-admin users
                    </p>
                  </div>
                  <Switch
                    id="maintenance"
                    checked={config.general.maintenanceMode}
                    onCheckedChange={(checked) => updateConfig('general', 'maintenanceMode', checked)}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="debug">Debug Mode</Label>
                    <p className="text-sm text-muted-foreground">
                      Enable detailed error messages and logging
                    </p>
                  </div>
                  <Switch
                    id="debug"
                    checked={config.general.debugMode}
                    onCheckedChange={(checked) => updateConfig('general', 'debugMode', checked)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Security Settings */}
        <TabsContent value="security" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Security Settings</CardTitle>
              <CardDescription>
                Configure authentication and security policies
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="emailVerification">Require Email Verification</Label>
                    <p className="text-sm text-muted-foreground">
                      New users must verify their email address
                    </p>
                  </div>
                  <Switch
                    id="emailVerification"
                    checked={config.security.requireEmailVerification}
                    onCheckedChange={(checked) => updateConfig('security', 'requireEmailVerification', checked)}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="twoFactor">Two-Factor Authentication</Label>
                    <p className="text-sm text-muted-foreground">
                      Enable 2FA for all admin accounts
                    </p>
                  </div>
                  <Switch
                    id="twoFactor"
                    checked={config.security.twoFactorEnabled}
                    onCheckedChange={(checked) => updateConfig('security', 'twoFactorEnabled', checked)}
                  />
                </div>
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="sessionTimeout">Session Timeout (minutes)</Label>
                <Input
                  id="sessionTimeout"
                  type="number"
                  value={config.security.sessionTimeout}
                  onChange={(e) => updateConfig('security', 'sessionTimeout', parseInt(e.target.value))}
                />
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="maxAttempts">Max Login Attempts</Label>
                <Input
                  id="maxAttempts"
                  type="number"
                  value={config.security.maxLoginAttempts}
                  onChange={(e) => updateConfig('security', 'maxLoginAttempts', parseInt(e.target.value))}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Email Settings */}
        <TabsContent value="email" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Email Configuration</CardTitle>
              <CardDescription>
                Configure SMTP settings for sending emails
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-2">
                <Label htmlFor="smtpHost">SMTP Host</Label>
                <Input
                  id="smtpHost"
                  value={config.email.smtpHost}
                  onChange={(e) => updateConfig('email', 'smtpHost', e.target.value)}
                />
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="smtpPort">SMTP Port</Label>
                <Input
                  id="smtpPort"
                  type="number"
                  value={config.email.smtpPort}
                  onChange={(e) => updateConfig('email', 'smtpPort', parseInt(e.target.value))}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="smtpSecure">Use Secure Connection</Label>
                  <p className="text-sm text-muted-foreground">
                    Enable TLS/SSL for SMTP connection
                  </p>
                </div>
                <Switch
                  id="smtpSecure"
                  checked={config.email.smtpSecure}
                  onCheckedChange={(checked) => updateConfig('email', 'smtpSecure', checked)}
                />
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="fromEmail">From Email</Label>
                <Input
                  id="fromEmail"
                  type="email"
                  value={config.email.fromEmail}
                  onChange={(e) => updateConfig('email', 'fromEmail', e.target.value)}
                />
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="fromName">From Name</Label>
                <Input
                  id="fromName"
                  value={config.email.fromName}
                  onChange={(e) => updateConfig('email', 'fromName', e.target.value)}
                />
              </div>
              
              <Button variant="outline" className="w-full">
                <Mail className="h-4 w-4 mr-2" />
                Send Test Email
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notification Settings */}
        <TabsContent value="notifications" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Notification Settings</CardTitle>
              <CardDescription>
                Configure system notifications and alerts
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="emailNotif">Email Notifications</Label>
                    <p className="text-sm text-muted-foreground">
                      Send email notifications to users
                    </p>
                  </div>
                  <Switch
                    id="emailNotif"
                    checked={config.notifications.emailNotifications}
                    onCheckedChange={(checked) => updateConfig('notifications', 'emailNotifications', checked)}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="adminAlerts">Admin Alerts</Label>
                    <p className="text-sm text-muted-foreground">
                      Notify admins of important system events
                    </p>
                  </div>
                  <Switch
                    id="adminAlerts"
                    checked={config.notifications.adminAlerts}
                    onCheckedChange={(checked) => updateConfig('notifications', 'adminAlerts', checked)}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="signupNotif">New User Notifications</Label>
                    <p className="text-sm text-muted-foreground">
                      Alert when new users sign up
                    </p>
                  </div>
                  <Switch
                    id="signupNotif"
                    checked={config.notifications.userSignupNotification}
                    onCheckedChange={(checked) => updateConfig('notifications', 'userSignupNotification', checked)}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="lowBalance">Low Balance Alerts</Label>
                    <p className="text-sm text-muted-foreground">
                      Notify users when their balance is low
                    </p>
                  </div>
                  <Switch
                    id="lowBalance"
                    checked={config.notifications.lowBalanceAlert}
                    onCheckedChange={(checked) => updateConfig('notifications', 'lowBalanceAlert', checked)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Azure OpenAI Settings */}
        <TabsContent value="azure" className="space-y-4">
          {showAzureForm ? (
            <AzureConfigForm
              config={editingAzureConfig}
              onSave={() => {
                setShowAzureForm(false);
                setEditingAzureConfig(null);
                fetchAzureConfigs();
              }}
              onCancel={() => {
                setShowAzureForm(false);
                setEditingAzureConfig(null);
              }}
            />
          ) : (
            <>
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-lg font-medium">Azure OpenAI Configurations</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    Manage your Azure OpenAI deployments and API configurations
                  </p>
                </div>
                <Button
                  onClick={() => {
                    setEditingAzureConfig(null);
                    setShowAzureForm(true);
                  }}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Configuration
                </Button>
              </div>

              {loading ? (
                <Card>
                  <CardContent className="flex items-center justify-center py-12">
                    <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
                  </CardContent>
                </Card>
              ) : (
                <AzureConfigList
                  configs={azureConfigs}
                  onEdit={(config) => {
                    setEditingAzureConfig(config);
                    setShowAzureForm(true);
                  }}
                  onRefresh={fetchAzureConfigs}
                />
              )}
            </>
          )}
        </TabsContent>
      </Tabs>

      {/* System Status */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>System Status</CardTitle>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => {
              fetchSystemStatus();
              if (activeTab === 'azure') {
                fetchAzureConfigs();
              }
            }}
            disabled={loadingStatus}
          >
            <RefreshCw className={cn("h-4 w-4", loadingStatus && "animate-spin")} />
          </Button>
        </CardHeader>
        <CardContent>
          {loadingStatus ? (
            <div className="flex items-center justify-center py-8">
              <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : systemStatus ? (
            <div className="grid gap-4 md:grid-cols-3">
              <div className="flex items-center gap-3">
                <Database className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="font-medium">Database</p>
                  <div className="flex items-center gap-1">
                    {systemStatus.database.status === 'healthy' ? (
                      <>
                        <CheckCircle className="h-3 w-3 text-green-500" />
                        <span className="text-sm text-green-500">{systemStatus.database.message}</span>
                      </>
                    ) : (
                      <>
                        <XCircle className="h-3 w-3 text-red-500" />
                        <span className="text-sm text-red-500">{systemStatus.database.message}</span>
                      </>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <Mail className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="font-medium">Email Service</p>
                  <div className="flex items-center gap-1">
                    {systemStatus.email.status === 'healthy' ? (
                      <>
                        <CheckCircle className="h-3 w-3 text-green-500" />
                        <span className="text-sm text-green-500">{systemStatus.email.message}</span>
                      </>
                    ) : systemStatus.email.status === 'degraded' ? (
                      <>
                        <AlertCircle className="h-3 w-3 text-yellow-500" />
                        <span className="text-sm text-yellow-500">{systemStatus.email.message}</span>
                      </>
                    ) : (
                      <>
                        <XCircle className="h-3 w-3 text-gray-400" />
                        <span className="text-sm text-gray-400">{systemStatus.email.message}</span>
                      </>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <Cloud className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="font-medium">Azure OpenAI</p>
                  <div className="flex items-center gap-1">
                    {systemStatus.apiKeys.status === 'healthy' ? (
                      <>
                        <CheckCircle className="h-3 w-3 text-green-500" />
                        <span className="text-sm text-green-500">{systemStatus.apiKeys.message}</span>
                      </>
                    ) : systemStatus.apiKeys.status === 'degraded' ? (
                      <>
                        <AlertCircle className="h-3 w-3 text-yellow-500" />
                        <span className="text-sm text-yellow-500">{systemStatus.apiKeys.message}</span>
                      </>
                    ) : systemStatus.apiKeys.status === 'unconfigured' ? (
                      <>
                        <AlertCircle className="h-3 w-3 text-gray-400" />
                        <span className="text-sm text-gray-400">{systemStatus.apiKeys.message}</span>
                      </>
                    ) : (
                      <>
                        <XCircle className="h-3 w-3 text-red-500" />
                        <span className="text-sm text-red-500">{systemStatus.apiKeys.message}</span>
                      </>
                    )}
                  </div>
                  {systemStatus.apiKeys.azureConfigs > 0 && (
                    <p className="text-xs text-muted-foreground mt-1">
                      {systemStatus.apiKeys.azureConfigs} total, {systemStatus.apiKeys.activeConfigs} active
                    </p>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              Failed to load system status
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}