import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Plus, 
  Search, 
  Settings, 
  CheckCircle, 
  AlertCircle, 
  XCircle,
  RefreshCw,
  Edit,
  Trash2,
  TestTube
} from 'lucide-react';
import { apiClient } from '@/lib/api';
import ConfigForm from './ConfigForm';
import { useToast } from '@/hooks/use-toast';

interface AzureConfig {
  id: string;
  name: string;
  endpoint: string;
  api_version: string;
  is_active: boolean;
  is_primary: boolean;
  rate_limit_rpm: number;
  rate_limit_tpd: number;
  health_status: 'healthy' | 'degraded' | 'unhealthy';
  last_health_check: string;
  created_at: string;
  updated_at: string;
}

const ConfigurationManager: React.FC = () => {
  const { toast } = useToast();
  const [configs, setConfigs] = useState<AzureConfig[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showConfigForm, setShowConfigForm] = useState(false);
  const [editingConfig, setEditingConfig] = useState<AzureConfig | null>(null);
  const [testingConfig, setTestingConfig] = useState<string | null>(null);

  useEffect(() => {
    fetchConfigs();
  }, []);

  const fetchConfigs = async () => {
    try {
      setLoading(true);
      const response = await apiClient.getAzureConfigs();
      // Map the API response to match our interface
      const mappedConfigs: AzureConfig[] = response.configs.map(config => ({
        id: config.id,
        name: config.name,
        endpoint: config.endpoint,
        api_version: config.apiVersion,
        is_active: config.isActive,
        is_primary: config.isPrimary,
        rate_limit_rpm: config.rateLimitRpm,
        rate_limit_tpd: config.rateLimitTpd,
        health_status: config.healthStatus as 'healthy' | 'degraded' | 'unhealthy',
        last_health_check: config.lastHealthCheck || '',
        created_at: config.createdAt,
        updated_at: config.updatedAt,
      }));
      setConfigs(mappedConfigs);
    } catch (error) {
      console.error('Error fetching configs:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch configurations',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleTestConfig = async (configId: string) => {
    try {
      setTestingConfig(configId);
      
      const result = await apiClient.testAzureConfig(configId);

      const toastDescription = result.success 
        ? `Configuration tested successfully. Response time: ${result.responseTime}ms`
        : result.details?.error?.reason || `Configuration test failed. Status: ${result.healthStatus}`;
      
      toast({
        title: result.success ? 'Test Successful' : 'Test Failed',
        description: toastDescription,
        variant: result.success ? 'default' : 'destructive'
      });
      
      // Log details for debugging
      console.log('Test result:', result);

      // Refresh to get updated health status
      await fetchConfigs();
    } catch (error) {
      console.error('Error testing config:', error);
      toast({
        title: 'Test Failed',
        description: 'Failed to test configuration',
        variant: 'destructive'
      });
    } finally {
      setTestingConfig(null);
    }
  };

  const handleDeleteConfig = async (configId: string) => {
    if (!confirm('Are you sure you want to delete this configuration?')) return;

    try {
      const result = await apiClient.deleteAzureConfig(configId);

      toast({
        title: 'Success',
        description: `Configuration "${result.deletedConfig.name}" deleted successfully`,
      });

      await fetchConfigs();
    } catch (error) {
      console.error('Error deleting config:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete configuration',
        variant: 'destructive'
      });
    }
  };

  const getHealthIcon = (status: string) => {
    switch (status) {
      case 'healthy':
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'degraded':
        return <AlertCircle className="h-5 w-5 text-yellow-600" />;
      case 'unhealthy':
        return <XCircle className="h-5 w-5 text-red-600" />;
      default:
        return <AlertCircle className="h-5 w-5 text-gray-400" />;
    }
  };

  const getHealthBadge = (status: string) => {
    const variants: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
      healthy: 'default',
      degraded: 'secondary',
      unhealthy: 'destructive'
    };

    return (
      <Badge variant={variants[status] || 'outline'} className="capitalize">
        {status}
      </Badge>
    );
  };

  const filteredConfigs = configs.filter(config =>
    config.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    config.endpoint.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center h-64">
            <RefreshCw className="h-8 w-8 animate-spin text-gray-400" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl">Azure OpenAI Configurations</CardTitle>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                Manage Azure OpenAI endpoints and rate limits
              </p>
            </div>
            <Button onClick={() => {
              setEditingConfig(null);
              setShowConfigForm(true);
            }}>
              <Plus className="h-4 w-4 mr-2" />
              Add Configuration
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search configurations..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Configuration List */}
      <div className="grid gap-4">
        {filteredConfigs.map((config) => (
          <Card key={config.id} className="hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    {getHealthIcon(config.health_status)}
                    <h3 className="text-lg font-semibold">{config.name}</h3>
                    {config.is_primary && (
                      <Badge variant="default" className="bg-blue-600">
                        Primary
                      </Badge>
                    )}
                    {config.is_active ? (
                      <Badge variant="default" className="bg-green-600">
                        Active
                      </Badge>
                    ) : (
                      <Badge variant="secondary">Inactive</Badge>
                    )}
                    {getHealthBadge(config.health_status)}
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Endpoint</p>
                      <p className="text-sm font-mono">{config.endpoint}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">API Version</p>
                      <p className="text-sm">{config.api_version}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Rate Limits</p>
                      <p className="text-sm">
                        {config.rate_limit_rpm} RPM / {config.rate_limit_tpd.toLocaleString()} TPD
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Last Health Check</p>
                      <p className="text-sm">
                        {new Date(config.last_health_check).toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex gap-2 ml-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleTestConfig(config.id)}
                    disabled={testingConfig === config.id}
                  >
                    {testingConfig === config.id ? (
                      <RefreshCw className="h-4 w-4 animate-spin" />
                    ) : (
                      <TestTube className="h-4 w-4" />
                    )}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setEditingConfig(config);
                      setShowConfigForm(true);
                    }}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDeleteConfig(config.id)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredConfigs.length === 0 && (
        <Card>
          <CardContent className="p-12 text-center">
            <Settings className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No configurations found</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              {searchTerm ? 'Try adjusting your search' : 'Get started by adding your first configuration'}
            </p>
            {!searchTerm && (
              <Button onClick={() => setShowConfigForm(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add Configuration
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      {/* Configuration Form Modal */}
      {showConfigForm && (
        <ConfigForm
          config={editingConfig}
          onClose={() => {
            setShowConfigForm(false);
            setEditingConfig(null);
          }}
          onSuccess={() => {
            setShowConfigForm(false);
            setEditingConfig(null);
            fetchConfigs();
          }}
        />
      )}
    </div>
  );
};

export default ConfigurationManager;