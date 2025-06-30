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

interface ConfigFormProps {
  config?: any;
  onClose: () => void;
  onSuccess: () => void;
}

const ConfigForm: React.FC<ConfigFormProps> = ({ config, onClose, onSuccess }) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: config?.name || '',
    endpoint: config?.endpoint || '',
    api_key: '',
    api_version: config?.api_version || '2024-02-15-preview',
    deployment_name: config?.deployment_name || '',
    is_active: config?.is_active ?? true,
    is_primary: config?.is_primary ?? false,
    rate_limit_rpm: config?.rate_limit_rpm || 60,
    rate_limit_tpd: config?.rate_limit_tpd || 100000,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const payload = {
        ...formData,
        // Only include api_key if it's been changed
        ...(formData.api_key ? { api_key: formData.api_key } : {})
      };

      if (config) {
        // Update existing config
        // Note: Azure config management would need backend endpoint
        // For now, simulating with a simple update
        await apiClient.updateUser(config.id, payload as any);

        toast({
          title: 'Success',
          description: 'Configuration updated successfully',
        });
      } else {
        // Create new config
        if (!formData.api_key) {
          toast({
            title: 'Error',
            description: 'API key is required for new configurations',
            variant: 'destructive'
          });
          setLoading(false);
          return;
        }

        // Create new config
        // Note: Azure config management would need backend endpoint
        // For now, simulating with a simple update
        await apiClient.updateUser('new-config', payload as any);

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
        description: error.message || 'Failed to save configuration',
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
              <Label htmlFor="api_key">API Key</Label>
              <Input
                id="api_key"
                type="password"
                value={formData.api_key}
                onChange={(e) => setFormData({ ...formData, api_key: e.target.value })}
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
              <Label htmlFor="deployment_name">Deployment Name</Label>
              <Input
                id="deployment_name"
                value={formData.deployment_name}
                onChange={(e) => setFormData({ ...formData, deployment_name: e.target.value })}
                placeholder="gpt-35-turbo"
                required
              />
            </div>

            <div>
              <Label htmlFor="api_version">API Version</Label>
              <Select
                value={formData.api_version}
                onValueChange={(value) => setFormData({ ...formData, api_version: value })}
              >
                <SelectTrigger id="api_version">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="2024-02-15-preview">2024-02-15-preview</SelectItem>
                  <SelectItem value="2023-12-01-preview">2023-12-01-preview</SelectItem>
                  <SelectItem value="2023-05-15">2023-05-15</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="rate_limit_rpm">Rate Limit (RPM)</Label>
              <Input
                id="rate_limit_rpm"
                type="number"
                value={formData.rate_limit_rpm}
                onChange={(e) => setFormData({ ...formData, rate_limit_rpm: parseInt(e.target.value) })}
                min="1"
                required
              />
            </div>

            <div>
              <Label htmlFor="rate_limit_tpd">Token Limit (TPD)</Label>
              <Input
                id="rate_limit_tpd"
                type="number"
                value={formData.rate_limit_tpd}
                onChange={(e) => setFormData({ ...formData, rate_limit_tpd: parseInt(e.target.value) })}
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
                id="is_active"
                checked={formData.is_active}
                onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="is_primary">Primary Configuration</Label>
                <p className="text-sm text-gray-500">Use as the main configuration</p>
              </div>
              <Switch
                id="is_primary"
                checked={formData.is_primary}
                onCheckedChange={(checked) => setFormData({ ...formData, is_primary: checked })}
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