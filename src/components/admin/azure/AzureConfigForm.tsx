'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle, Key, Save } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import axios from 'axios';

interface AzureConfigFormProps {
  config?: any;
  onSave: () => void;
  onCancel: () => void;
}

const API_VERSIONS = [
  '2025-01-01-preview',
  '2024-04-01-preview',
  '2024-02-01',
  '2023-12-01-preview',
  '2023-05-15',
  'custom',
];

const MODELS = [
  'gpt-4.1',
  'gpt-4',
  'gpt-4-32k',
  'gpt-3.5-turbo',
  'gpt-3.5-turbo-16k',
  'custom',
];

export default function AzureConfigForm({ config, onSave, onCancel }: AzureConfigFormProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Check if the model and API version are custom values
  const isCustomModel = config?.modelName && !MODELS.slice(0, -1).includes(config.modelName);
  const isCustomApiVersion = config?.apiVersion && !API_VERSIONS.slice(0, -1).includes(config.apiVersion);
  
  const [formData, setFormData] = useState({
    name: config?.name || '',
    endpoint: config?.endpoint || '',
    apiKey: config?.apiKey || '',
    deploymentName: config?.deploymentName || '',
    modelName: isCustomModel ? 'custom' : (config?.modelName || 'gpt-4'),
    customModelName: isCustomModel ? config?.modelName : '',
    apiVersion: isCustomApiVersion ? 'custom' : (config?.apiVersion || '2024-04-01-preview'),
    customApiVersion: isCustomApiVersion ? config?.apiVersion : '',
    isPrimary: config?.isPrimary || false,
    isActive: config?.isActive !== undefined ? config.isActive : true,
    maxTokens: config?.maxTokens || '',
    temperature: config?.temperature || 0.7,
    rateLimitRpm: config?.rateLimitRpm || '',
    rateLimitTpd: config?.rateLimitTpd || '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const url = config?.id 
        ? `/api/admin/config/azure/${config.id}`
        : '/api/admin/config/azure';
      
      const method = config?.id ? 'PUT' : 'POST';
      
      const data = {
        ...formData,
        modelName: formData.modelName === 'custom' ? formData.customModelName : formData.modelName,
        apiVersion: formData.apiVersion === 'custom' ? formData.customApiVersion : formData.apiVersion,
        maxTokens: formData.maxTokens ? parseInt(formData.maxTokens) : null,
        rateLimitRpm: formData.rateLimitRpm ? parseInt(formData.rateLimitRpm) : null,
        rateLimitTpd: formData.rateLimitTpd ? parseInt(formData.rateLimitTpd) : null,
      };
      
      // Remove custom fields from data
      delete data.customModelName;
      delete data.customApiVersion;

      await axios({
        method,
        url,
        data
      });

      onSave();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to save configuration');
    } finally {
      setLoading(false);
    }
  };

  const updateFormData = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{config?.id ? 'Edit' : 'Add'} Azure OpenAI Configuration</CardTitle>
        <CardDescription>
          Configure Azure OpenAI deployment settings
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="name">Configuration Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => updateFormData('name', e.target.value)}
                placeholder="e.g., Production GPT-4"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="deploymentName">Deployment Name</Label>
              <Input
                id="deploymentName"
                value={formData.deploymentName}
                onChange={(e) => updateFormData('deploymentName', e.target.value)}
                placeholder="e.g., CIPHER-Portal-Dev-4.1"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="endpoint">Endpoint URL</Label>
            <Input
              id="endpoint"
              value={formData.endpoint}
              onChange={(e) => updateFormData('endpoint', e.target.value)}
              placeholder="https://your-resource.openai.azure.com/"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="apiKey">API Key</Label>
            <div className="relative">
              <Input
                id="apiKey"
                type="password"
                value={formData.apiKey}
                onChange={(e) => updateFormData('apiKey', e.target.value)}
                placeholder={config?.id ? 'Enter new key to update' : 'Enter your API key'}
                required={!config?.id}
              />
              <Key className="absolute right-3 top-3 h-4 w-4 text-muted-foreground" />
            </div>
            {config?.id && (
              <p className="text-sm text-muted-foreground">
                Leave blank to keep existing key
              </p>
            )}
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="modelName">Model</Label>
              <Select
                value={formData.modelName}
                onValueChange={(value) => updateFormData('modelName', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {MODELS.map(model => (
                    <SelectItem key={model} value={model}>
                      {model === 'custom' ? 'Custom Model' : model}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {formData.modelName === 'custom' && (
                <Input
                  className="mt-2"
                  value={formData.customModelName}
                  onChange={(e) => updateFormData('customModelName', e.target.value)}
                  placeholder="Enter custom model name (e.g., gpt-4.1)"
                  required
                />
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="apiVersion">API Version</Label>
              <Select
                value={formData.apiVersion}
                onValueChange={(value) => updateFormData('apiVersion', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {API_VERSIONS.map(version => (
                    <SelectItem key={version} value={version}>
                      {version === 'custom' ? 'Custom Version' : version}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {formData.apiVersion === 'custom' && (
                <Input
                  className="mt-2"
                  value={formData.customApiVersion}
                  onChange={(e) => updateFormData('customApiVersion', e.target.value)}
                  placeholder="Enter custom API version (e.g., 2025-01-01-preview)"
                  required
                />
              )}
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-sm font-medium">Advanced Settings</h3>
            
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="maxTokens">Max Tokens (optional)</Label>
                <Input
                  id="maxTokens"
                  type="number"
                  value={formData.maxTokens}
                  onChange={(e) => updateFormData('maxTokens', e.target.value)}
                  placeholder="Leave blank for default"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="temperature">Temperature</Label>
                <Input
                  id="temperature"
                  type="number"
                  step="0.1"
                  min="0"
                  max="2"
                  value={formData.temperature}
                  onChange={(e) => updateFormData('temperature', parseFloat(e.target.value))}
                />
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="rateLimitRpm">Rate Limit (RPM)</Label>
                <Input
                  id="rateLimitRpm"
                  type="number"
                  value={formData.rateLimitRpm}
                  onChange={(e) => updateFormData('rateLimitRpm', e.target.value)}
                  placeholder="Requests per minute"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="rateLimitTpd">Token Limit (TPD)</Label>
                <Input
                  id="rateLimitTpd"
                  type="number"
                  value={formData.rateLimitTpd}
                  onChange={(e) => updateFormData('rateLimitTpd', e.target.value)}
                  placeholder="Tokens per day"
                />
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="isActive">Active</Label>
                <p className="text-sm text-muted-foreground">
                  Enable this configuration for use
                </p>
              </div>
              <Switch
                id="isActive"
                checked={formData.isActive}
                onCheckedChange={(checked) => updateFormData('isActive', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="isPrimary">Primary Configuration</Label>
                <p className="text-sm text-muted-foreground">
                  Use as default deployment
                </p>
              </div>
              <Switch
                id="isPrimary"
                checked={formData.isPrimary}
                onCheckedChange={(checked) => updateFormData('isPrimary', checked)}
              />
            </div>
          </div>

          <div className="flex gap-3 justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? (
                <>
                  <Save className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Save Configuration
                </>
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}