'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Settings,
  Trash2,
  Edit,
  TestTube,
  CheckCircle,
  AlertCircle,
  XCircle,
  RefreshCw,
  Plus,
  Star,
  Key
} from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';
import axios from 'axios';
import { formatDistanceToNow } from 'date-fns';

interface AzureConfig {
  id: string;
  name: string;
  endpoint: string;
  apiKey: string;
  deploymentName: string;
  modelName: string;
  apiVersion: string;
  isPrimary: boolean;
  isActive: boolean;
  maxTokens?: number;
  temperature: number;
  rateLimitRpm?: number;
  rateLimitTpd?: number;
  lastHealthCheck?: string;
  healthStatus?: string;
  createdAt: string;
  updatedAt: string;
}

interface AzureConfigListProps {
  configs: AzureConfig[];
  onEdit: (config: AzureConfig) => void;
  onRefresh: () => void;
}

export default function AzureConfigList({ configs, onEdit, onRefresh }: AzureConfigListProps) {
  const { toast } = useToast();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [configToDelete, setConfigToDelete] = useState<AzureConfig | null>(null);
  const [testingConfig, setTestingConfig] = useState<string | null>(null);
  const [deletingConfig, setDeletingConfig] = useState<string | null>(null);

  const handleTest = async (config: AzureConfig) => {
    setTestingConfig(config.id);
    
    try {
      const response = await axios.post('/api/admin/config/azure/test', {
        configId: config.id
      });

      if (response.data.success) {
        toast({
          title: 'Connection Successful',
          description: `Latency: ${response.data.data.latency}ms`,
        });
      } else {
        toast({
          title: 'Connection Failed',
          description: response.data.data.error,
          variant: 'destructive',
        });
      }
      
      // Refresh to get updated health status
      onRefresh();
    } catch (error: any) {
      const errorData = error.response?.data?.data;
      let errorMessage = error.response?.data?.error || 'Failed to test configuration';
      
      // If we have more detailed error information, use it
      if (errorData?.error) {
        errorMessage = errorData.error;
      }
      
      toast({
        title: 'Test Failed',
        description: errorMessage,
        variant: 'destructive',
      });
      
      // Log details for debugging
      console.error('Azure test error:', {
        error: errorMessage,
        details: errorData?.details,
        fullError: error.response?.data
      });
    } finally {
      setTestingConfig(null);
    }
  };

  const handleDelete = async () => {
    if (!configToDelete) return;
    
    setDeletingConfig(configToDelete.id);
    
    try {
      await axios.delete(`/api/admin/config/azure/${configToDelete.id}`);
      
      toast({
        title: 'Configuration Deleted',
        description: 'Azure configuration has been removed successfully.',
      });
      
      onRefresh();
    } catch (error: any) {
      toast({
        title: 'Delete Failed',
        description: error.response?.data?.error || 'Failed to delete configuration',
        variant: 'destructive',
      });
    } finally {
      setDeletingConfig(null);
      setDeleteDialogOpen(false);
      setConfigToDelete(null);
    }
  };

  const getHealthIcon = (status?: string) => {
    switch (status) {
      case 'healthy':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'degraded':
        return <AlertCircle className="h-4 w-4 text-yellow-500" />;
      case 'unhealthy':
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <AlertCircle className="h-4 w-4 text-gray-400" />;
    }
  };

  const getHealthBadge = (status?: string) => {
    switch (status) {
      case 'healthy':
        return <Badge variant="outline" className="text-green-600">Healthy</Badge>;
      case 'degraded':
        return <Badge variant="outline" className="text-yellow-600">Degraded</Badge>;
      case 'unhealthy':
        return <Badge variant="outline" className="text-red-600">Unhealthy</Badge>;
      default:
        return <Badge variant="outline" className="text-gray-600">Unknown</Badge>;
    }
  };

  if (configs.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <Settings className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium mb-2">No Azure Configurations</h3>
          <p className="text-muted-foreground text-center mb-4">
            Add your first Azure OpenAI configuration to get started.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <div className="space-y-4">
        {configs.map(config => (
          <Card key={config.id}>
            <CardHeader className="pb-4">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3">
                  {getHealthIcon(config.healthStatus)}
                  <div>
                    <div className="flex items-center gap-2">
                      <CardTitle className="text-lg">{config.name}</CardTitle>
                      {config.isPrimary && (
                        <Badge variant="default" className="gap-1">
                          <Star className="h-3 w-3" />
                          Primary
                        </Badge>
                      )}
                      {!config.isActive && (
                        <Badge variant="secondary">Inactive</Badge>
                      )}
                    </div>
                    <CardDescription className="mt-1">
                      {config.modelName} • {config.deploymentName}
                    </CardDescription>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleTest(config)}
                    disabled={testingConfig === config.id}
                  >
                    {testingConfig === config.id ? (
                      <RefreshCw className="h-4 w-4 animate-spin" />
                    ) : (
                      <TestTube className="h-4 w-4" />
                    )}
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => onEdit(config)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setConfigToDelete(config);
                      setDeleteDialogOpen(true);
                    }}
                    disabled={deletingConfig === config.id}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 text-sm">
                <div>
                  <span className="font-medium text-muted-foreground">Endpoint:</span>
                  <p className="font-mono text-xs mt-1">{config.endpoint}</p>
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <span className="font-medium text-muted-foreground">API Key:</span>
                    <p className="flex items-center gap-1 mt-1">
                      <Key className="h-3 w-3" />
                      <span className="font-mono">{config.apiKey}</span>
                    </p>
                  </div>
                  
                  <div>
                    <span className="font-medium text-muted-foreground">API Version:</span>
                    <p className="mt-1">{config.apiVersion}</p>
                  </div>
                  
                  <div>
                    <span className="font-medium text-muted-foreground">Temperature:</span>
                    <p className="mt-1">{config.temperature}</p>
                  </div>
                  
                  <div>
                    <span className="font-medium text-muted-foreground">Max Tokens:</span>
                    <p className="mt-1">{config.maxTokens || 'Default'}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <div>
                    <span className="font-medium text-muted-foreground">Rate Limit:</span>
                    <p className="mt-1">{config.rateLimitRpm ? `${config.rateLimitRpm} RPM` : 'No limit'}</p>
                  </div>
                  
                  <div>
                    <span className="font-medium text-muted-foreground">Token Limit:</span>
                    <p className="mt-1">{config.rateLimitTpd ? `${config.rateLimitTpd.toLocaleString()} TPD` : 'No limit'}</p>
                  </div>
                  
                  <div>
                    <span className="font-medium text-muted-foreground">Health Status:</span>
                    <div className="mt-1">{getHealthBadge(config.healthStatus)}</div>
                  </div>
                </div>

                {config.lastHealthCheck && (
                  <div className="text-xs text-muted-foreground">
                    Last checked {formatDistanceToNow(new Date(config.lastHealthCheck), { addSuffix: true })}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Configuration</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete the "{configToDelete?.name}" configuration? 
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}