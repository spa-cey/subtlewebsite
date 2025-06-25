import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { Loader2, Plus, Trash2, Check, X, ChevronDown, ChevronUp, Key, Globe, Brain, TestTube } from "lucide-react";
import { AzureOpenAIService, AzureOpenAIConfig } from "@/lib/azure-openai";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Badge } from "@/components/ui/badge";

const AzureOpenAISettings = () => {
  const [configs, setConfigs] = useState<AzureOpenAIConfig[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddingConfig, setIsAddingConfig] = useState(false);
  const [editingConfig, setEditingConfig] = useState<string | null>(null);
  const [testingConfig, setTestingConfig] = useState<string | null>(null);
  const [expandedConfig, setExpandedConfig] = useState<string | null>(null);

  // Form state for new config
  const [newConfig, setNewConfig] = useState<Partial<AzureOpenAIConfig>>({
    name: '',
    description: '',
    endpoint_url: '',
    api_key: '',
    api_version: '2024-02-01',
    deployments: {
      'gpt-35-turbo': '',
      'gpt-4': ''
    }
  });

  useEffect(() => {
    loadConfigs();
  }, []);

  const loadConfigs = async () => {
    setLoading(true);
    const result = await AzureOpenAIService.listConfigs();
    if (result.error) {
      toast.error(`Failed to load configurations: ${result.error}`);
    } else {
      setConfigs(result.configs || []);
    }
    setLoading(false);
  };

  const handleCreateConfig = async () => {
    if (!newConfig.name || !newConfig.endpoint_url || !newConfig.api_key) {
      toast.error("Please fill in all required fields");
      return;
    }

    // Ensure at least one deployment is configured
    const hasDeployment = Object.values(newConfig.deployments || {}).some(d => d);
    if (!hasDeployment) {
      toast.error("Please configure at least one model deployment");
      return;
    }

    setIsAddingConfig(true);
    const result = await AzureOpenAIService.createConfig(newConfig as AzureOpenAIConfig);
    
    if (result.success) {
      toast.success("Configuration created successfully");
      setNewConfig({
        name: '',
        description: '',
        endpoint_url: '',
        api_key: '',
        api_version: '2024-02-01',
        deployments: {
          'gpt-35-turbo': '',
          'gpt-4': ''
        }
      });
      await loadConfigs();
      setExpandedConfig(null);
    } else {
      toast.error(`Failed to create configuration: ${result.error}`);
    }
    
    setIsAddingConfig(false);
  };

  const handleDeleteConfig = async (id: string) => {
    if (!confirm("Are you sure you want to delete this configuration?")) {
      return;
    }

    const result = await AzureOpenAIService.deleteConfig(id);
    if (result.success) {
      toast.success("Configuration deleted successfully");
      await loadConfigs();
    } else {
      toast.error(`Failed to delete configuration: ${result.error}`);
    }
  };

  const handleSetDefault = async (id: string) => {
    const result = await AzureOpenAIService.setDefaultConfig(id);
    if (result.success) {
      toast.success("Default configuration updated");
      await loadConfigs();
    } else {
      toast.error(`Failed to set default: ${result.error}`);
    }
  };

  const handleTestConfig = async (config: AzureOpenAIConfig) => {
    setTestingConfig(config.id!);
    const result = await AzureOpenAIService.testConfig(config.id!);
    
    if (result.success) {
      toast.success("Configuration test successful!");
    } else {
      toast.error(`Test failed: ${result.error}`);
    }
    
    setTestingConfig(null);
  };

  const handleUpdateDeployment = (model: string, value: string) => {
    setNewConfig(prev => ({
      ...prev,
      deployments: {
        ...prev.deployments,
        [model]: value
      }
    }));
  };

  const handleAddCustomDeployment = () => {
    const modelName = prompt("Enter the model name (e.g., gpt-4-vision):");
    if (modelName) {
      setNewConfig(prev => ({
        ...prev,
        deployments: {
          ...prev.deployments,
          [modelName]: ''
        }
      }));
    }
  };

  const handleRemoveDeployment = (model: string) => {
    setNewConfig(prev => {
      const { [model]: removed, ...rest } = prev.deployments || {};
      return {
        ...prev,
        deployments: rest
      };
    });
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Azure OpenAI Configuration</CardTitle>
          <CardDescription>
            Configure your Azure OpenAI endpoints and API keys to use AI features
          </CardDescription>
        </CardHeader>
        <CardContent>
          {configs.length === 0 && !expandedConfig ? (
            <div className="text-center py-8">
              <Brain className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground mb-4">
                No Azure OpenAI configurations found. Add one to get started.
              </p>
              <Button onClick={() => setExpandedConfig('new')}>
                <Plus className="h-4 w-4 mr-2" />
                Add Configuration
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {configs.map((config) => (
                <Card key={config.id} className="relative">
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h4 className="font-semibold">{config.name}</h4>
                          {config.is_default && (
                            <Badge variant="secondary">Default</Badge>
                          )}
                          {config.is_active === false && (
                            <Badge variant="outline">Inactive</Badge>
                          )}
                        </div>
                        {config.description && (
                          <p className="text-sm text-muted-foreground mb-2">
                            {config.description}
                          </p>
                        )}
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Globe className="h-3 w-3" />
                            {new URL(config.endpoint_url).hostname}
                          </span>
                          <span className="flex items-center gap-1">
                            <Key className="h-3 w-3" />
                            API Key: ***
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {!config.is_default && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleSetDefault(config.id!)}
                          >
                            Set Default
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleTestConfig(config)}
                          disabled={testingConfig === config.id}
                        >
                          {testingConfig === config.id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <TestTube className="h-4 w-4" />
                          )}
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteConfig(config.id!)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    
                    {config.deployments && Object.keys(config.deployments).length > 0 && (
                      <div className="mt-4 pt-4 border-t">
                        <p className="text-sm font-medium mb-2">Configured Models:</p>
                        <div className="flex flex-wrap gap-2">
                          {Object.entries(config.deployments).map(([model, deployment]) => (
                            <Badge key={model} variant="outline">
                              {model}: {deployment}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {config.last_used_at && (
                      <div className="mt-2 text-xs text-muted-foreground">
                        Last used: {new Date(config.last_used_at).toLocaleString()}
                        {config.request_count && ` • ${config.request_count} requests`}
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
              
              {!expandedConfig && (
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => setExpandedConfig('new')}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Configuration
                </Button>
              )}
            </div>
          )}

          <Collapsible
            open={expandedConfig === 'new'}
            onOpenChange={(open) => setExpandedConfig(open ? 'new' : null)}
          >
            <CollapsibleContent className="mt-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">New Configuration</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="name">Configuration Name *</Label>
                      <Input
                        id="name"
                        placeholder="My Azure OpenAI"
                        value={newConfig.name}
                        onChange={(e) => setNewConfig({ ...newConfig, name: e.target.value })}
                      />
                    </div>
                    
                    <div className="grid gap-2">
                      <Label htmlFor="description">Description</Label>
                      <Textarea
                        id="description"
                        placeholder="Optional description for this configuration"
                        value={newConfig.description}
                        onChange={(e) => setNewConfig({ ...newConfig, description: e.target.value })}
                        rows={2}
                      />
                    </div>
                    
                    <div className="grid gap-2">
                      <Label htmlFor="endpoint">Endpoint URL *</Label>
                      <Input
                        id="endpoint"
                        placeholder="https://your-resource.openai.azure.com"
                        value={newConfig.endpoint_url}
                        onChange={(e) => setNewConfig({ ...newConfig, endpoint_url: e.target.value })}
                      />
                      <p className="text-xs text-muted-foreground">
                        Your Azure OpenAI resource endpoint
                      </p>
                    </div>
                    
                    <div className="grid gap-2">
                      <Label htmlFor="apikey">API Key *</Label>
                      <Input
                        id="apikey"
                        type="password"
                        placeholder="Your API key"
                        value={newConfig.api_key}
                        onChange={(e) => setNewConfig({ ...newConfig, api_key: e.target.value })}
                      />
                      <p className="text-xs text-muted-foreground">
                        Your API key will be encrypted and stored securely
                      </p>
                    </div>
                    
                    <div className="grid gap-2">
                      <Label htmlFor="apiversion">API Version</Label>
                      <Input
                        id="apiversion"
                        placeholder="2024-02-01"
                        value={newConfig.api_version}
                        onChange={(e) => setNewConfig({ ...newConfig, api_version: e.target.value })}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label>Model Deployments *</Label>
                      <p className="text-xs text-muted-foreground mb-2">
                        Map model names to your Azure deployment names
                      </p>
                      {Object.entries(newConfig.deployments || {}).map(([model, deployment]) => (
                        <div key={model} className="flex gap-2">
                          <Input
                            value={model}
                            disabled
                            className="w-1/3"
                          />
                          <Input
                            placeholder={`Deployment name for ${model}`}
                            value={deployment}
                            onChange={(e) => handleUpdateDeployment(model, e.target.value)}
                            className="flex-1"
                          />
                          {!['gpt-35-turbo', 'gpt-4'].includes(model) && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleRemoveDeployment(model)}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      ))}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleAddCustomDeployment}
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Add Custom Model
                      </Button>
                    </div>
                  </div>
                  
                  <div className="flex gap-2 pt-4">
                    <Button
                      onClick={handleCreateConfig}
                      disabled={isAddingConfig}
                    >
                      {isAddingConfig ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Creating...
                        </>
                      ) : (
                        <>
                          <Check className="h-4 w-4 mr-2" />
                          Create Configuration
                        </>
                      )}
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => {
                        setExpandedConfig(null);
                        setNewConfig({
                          name: '',
                          description: '',
                          endpoint_url: '',
                          api_key: '',
                          api_version: '2024-02-01',
                          deployments: {
                            'gpt-35-turbo': '',
                            'gpt-4': ''
                          }
                        });
                      }}
                    >
                      Cancel
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </CollapsibleContent>
          </Collapsible>
        </CardContent>
      </Card>
    </div>
  );
};

export default AzureOpenAISettings;