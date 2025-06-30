import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { apiClient } from '@/lib/api';
import { Loader2 } from 'lucide-react';

interface AzureConfig {
  id: string;
  name: string;
  endpoint: string;
  api_version: string;
  deployment_name: string;
  is_active: boolean;
  is_primary: boolean;
  rate_limit_rpm: number;
  rate_limit_tpd: number;
  health_status: string;
  last_health_check: string;
}

interface ConfigFormProps {
  config?: AzureConfig | null;
  onClose: () => void;
  onSuccess: () => void;
}

const ConfigForm: React.FC<ConfigFormProps> = ({ config, onClose, onSuccess }) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: config?.name || '',
    endpoint: config?.endpoint || '',
    apiKey: '',
    apiVersion: config?.api_version || '2025-01-01-preview',
    deploymentName: config?.deployment_name || '',
    isActive: config?.is_active ?? true,
    isPrimary: config?.is_primary ?? false,
    rateLimitRpm: config?.rate_limit_rpm || 60,
    rateLimitTpd: config?.rate_limit_tpd || 100000,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (config) {
        // Update existing config
        const updateData: any = {};
        
        // Only include changed fields
        if (formData.name !== config.name) updateData.name = formData.name;
        if (formData.endpoint !== config.endpoint) updateData.endpoint = formData.endpoint;
        if (formData.apiKey) updateData.apiKey = formData.apiKey;
        if (formData.apiVersion !== config.api_version) updateData.apiVersion = formData.apiVersion;
        if (formData.deploymentName !== config.deployment_name) updateData.deploymentName = formData.deploymentName;
        if (formData.isActive !== config.is_active) updateData.isActive = formData.isActive;
        if (formData.isPrimary !== config.is_primary) updateData.isPrimary = formData.isPrimary;
        if (formData.rateLimitRpm !== config.rate_limit_rpm) updateData.rateLimitRpm = formData.rateLimitRpm;
        if (formData.rateLimitTpd !== config.rate_limit_tpd) updateData.rateLimitTpd = formData.rateLimitTpd;

        await apiClient.updateAzureConfig(config.id, updateData);

        toast({
          title: 'Success',
          description: 'Configuration updated successfully',
        });
      } else {
        // Create new config
        if (!formData.apiKey) {
          toast({
            title: 'Error',
            description: 'API key is required for new configurations',
            variant: 'destructive'
          });
          setLoading(false);
          return;
        }

        await apiClient.createAzureConfig(formData);

        toast({
          title: 'Success',
          description: 'Configuration created successfully',
        });
      }

      onSuccess();
    } catch (error: any) {
      console.error('Error saving config:', error);
      toast({
        title: 'Error',
        description: error.response?.data?.error?.message || error.message || 'Failed to save configuration',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            {config ? 'Edit Configuration' : 'Add New Configuration'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <Label htmlFor="name">Configuration Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Production Azure OpenAI"
                required
              />
            </div>

            <div className="col-span-2">
              <Label htmlFor="endpoint">Endpoint URL</Label>
              <Input
                id="endpoint"
                value={formData.endpoint}
                onChange={(e) => setFormData({ ...formData, endpoint: e.target.value })}
                placeholder="https://your-resource.openai.azure.com"
                required
              />
            </div>

            <div className="col-span-2">
              <Label htmlFor="apiKey">API Key</Label>
              <Input
                id="apiKey"
                type="password"
                value={formData.apiKey}
                onChange={(e) => setFormData({ ...formData, apiKey: e.target.value })}
                placeholder={config ? 'Leave blank to keep existing' : 'Enter API key'}
                required={!config}
              />
              {config && (
                <p className="text-sm text-gray-500 mt-1">
                  Leave blank to keep the existing API key
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="deploymentName">Deployment Name</Label>
              <Input
                id="deploymentName"
                value={formData.deploymentName}
                onChange={(e) => setFormData({ ...formData, deploymentName: e.target.value })}
                placeholder="gpt-35-turbo"
                required
              />
            </div>

            <div>
              <Label htmlFor="apiVersion">API Version</Label>
              <Select
                value={formData.apiVersion}
                onValueChange={(value) => setFormData({ ...formData, apiVersion: value })}
              >
                <SelectTrigger id="apiVersion">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="2025-01-01-preview">2025-01-01-preview</SelectItem>
                  <SelectItem value="2024-02-15-preview">2024-02-15-preview</SelectItem>
                  <SelectItem value="2023-12-01-preview">2023-12-01-preview</SelectItem>
                  <SelectItem value="2023-05-15">2023-05-15</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="rateLimitRpm">Rate Limit (RPM)</Label>
              <Input
                id="rateLimitRpm"
                type="number"
                value={formData.rateLimitRpm}
                onChange={(e) => setFormData({ ...formData, rateLimitRpm: parseInt(e.target.value) })}
                min="1"
                required
              />
            </div>

            <div>
              <Label htmlFor="rateLimitTpd">Token Limit (TPD)</Label>
              <Input
                id="rateLimitTpd"
                type="number"
                value={formData.rateLimitTpd}
                onChange={(e) => setFormData({ ...formData, rateLimitTpd: parseInt(e.target.value) })}
                min="1000"
                required
              />
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="is_active">Active</Label>
                <p className="text-sm text-gray-500">Enable this configuration for use</p>
              </div>
              <Switch
                id="isActive"
                checked={formData.isActive}
                onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="is_primary">Primary Configuration</Label>
                <p className="text-sm text-gray-500">Use as the main configuration</p>
              </div>
              <Switch
                id="isPrimary"
                checked={formData.isPrimary}
                onCheckedChange={(checked) => setFormData({ ...formData, isPrimary: checked })}
              />
            </div>
          </div>

          <div className="flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              {config ? 'Update' : 'Create'} Configuration
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ConfigForm;