import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { prisma } from '../db/index';
import { authenticateToken, requireAdmin } from '../middleware/index';
import { encrypt, decrypt } from '../utils/encryption';
import { AzureOpenAI } from 'openai';

const router = Router();

// Apply admin middleware to all routes
router.use(authenticateToken, requireAdmin);

// Schema for validating Azure config input
const azureConfigSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  endpoint: z.string().url('Invalid endpoint URL'),
  apiKey: z.string().min(1, 'API key is required'),
  apiVersion: z.string().min(1, 'API version is required'),
  deploymentName: z.string().min(1, 'Deployment name is required'),
  isActive: z.boolean().optional().default(true),
  isPrimary: z.boolean().optional().default(false),
  rateLimitRpm: z.number().int().positive().optional().default(60),
  rateLimitTpd: z.number().int().positive().optional().default(100000),
});

// GET /admin/configs - List all Azure configurations
router.get('/configs', async (req: Request, res: Response): Promise<Response> => {
  try {
    const configs = await prisma.azureConfig.findMany({
      orderBy: { createdAt: 'desc' },
    });

    // Remove encrypted API keys from response
    const sanitizedConfigs = configs.map(config => ({
      ...config,
      apiKey: undefined, // Don't send API keys to frontend
      hasApiKey: true, // Indicate that an API key exists
    }));

    return res.json({ configs: sanitizedConfigs });
  } catch (error) {
    console.error('List configs error:', error);
    return res.status(500).json({
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to fetch configurations',
        timestamp: new Date().toISOString(),
        path: req.path
      }
    });
  }
});

// GET /admin/configs/:id - Get a single configuration
router.get('/configs/:id', async (req: Request, res: Response): Promise<Response> => {
  try {
    const { id } = req.params;

    const config = await prisma.azureConfig.findUnique({
      where: { id },
    });

    if (!config) {
      return res.status(404).json({
        error: {
          code: 'NOT_FOUND',
          message: 'Configuration not found',
          timestamp: new Date().toISOString(),
          path: req.path
        }
      });
    }

    // Remove encrypted API key from response
    const sanitizedConfig = {
      ...config,
      apiKey: undefined,
      hasApiKey: true,
    };

    return res.json({ config: sanitizedConfig });
  } catch (error) {
    console.error('Get config error:', error);
    return res.status(500).json({
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to fetch configuration',
        timestamp: new Date().toISOString(),
        path: req.path
      }
    });
  }
});

// POST /admin/configs - Create a new configuration
router.post('/configs', async (req: Request, res: Response): Promise<Response> => {
  try {
    const validatedData = azureConfigSchema.parse(req.body);

    // Check if name already exists
    const existingConfig = await prisma.azureConfig.findUnique({
      where: { name: validatedData.name },
    });

    if (existingConfig) {
      return res.status(400).json({
        error: {
          code: 'DUPLICATE_NAME',
          message: 'A configuration with this name already exists',
          timestamp: new Date().toISOString(),
          path: req.path
        }
      });
    }

    // If this is set as primary, unset other primary configs
    if (validatedData.isPrimary) {
      await prisma.azureConfig.updateMany({
        where: { isPrimary: true },
        data: { isPrimary: false },
      });
    }

    // Encrypt the API key before storing
    const encryptedApiKey = encrypt(validatedData.apiKey);

    // Create the configuration
    const config = await prisma.azureConfig.create({
      data: {
        name: validatedData.name,
        endpoint: validatedData.endpoint,
        apiKey: encryptedApiKey,
        apiVersion: validatedData.apiVersion,
        deploymentName: validatedData.deploymentName,
        isActive: validatedData.isActive,
        isPrimary: validatedData.isPrimary,
        rateLimitRpm: validatedData.rateLimitRpm,
        rateLimitTpd: validatedData.rateLimitTpd,
        healthStatus: 'unknown',
      },
    });

    // Create audit log
    await prisma.auditLog.create({
      data: {
        adminId: req.user!.id,
        action: 'CREATE_AZURE_CONFIG',
        details: { configName: config.name },
        ipAddress: req.ip,
      },
    });

    // Test the configuration
    const testResult = await testConfigurationWithDetails(config);
    
    // Update health status
    const updatedConfig = await prisma.azureConfig.update({
      where: { id: config.id },
      data: {
        healthStatus: testResult.status,
        lastHealthCheck: new Date(),
      },
    });

    // Return sanitized config
    const sanitizedConfig = {
      ...updatedConfig,
      apiKey: undefined,
      hasApiKey: true,
    };

    return res.status(201).json({ config: sanitizedConfig });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid configuration data',
          details: error.errors,
          timestamp: new Date().toISOString(),
          path: req.path
        }
      });
    }

    console.error('Create config error:', error);
    return res.status(500).json({
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to create configuration',
        timestamp: new Date().toISOString(),
        path: req.path
      }
    });
  }
});

// PATCH /admin/configs/:id - Update a configuration
router.patch('/configs/:id', async (req: Request, res: Response): Promise<Response> => {
  try {
    const { id } = req.params;
    
    // Partial schema for updates (all fields optional)
    const updateSchema = azureConfigSchema.partial();
    const validatedData = updateSchema.parse(req.body);

    // Check if config exists
    const existingConfig = await prisma.azureConfig.findUnique({
      where: { id },
    });

    if (!existingConfig) {
      return res.status(404).json({
        error: {
          code: 'NOT_FOUND',
          message: 'Configuration not found',
          timestamp: new Date().toISOString(),
          path: req.path
        }
      });
    }

    // Check for duplicate name if name is being changed
    if (validatedData.name && validatedData.name !== existingConfig.name) {
      const duplicateConfig = await prisma.azureConfig.findUnique({
        where: { name: validatedData.name },
      });

      if (duplicateConfig) {
        return res.status(400).json({
          error: {
            code: 'DUPLICATE_NAME',
            message: 'A configuration with this name already exists',
            timestamp: new Date().toISOString(),
            path: req.path
          }
        });
      }
    }

    // If this is set as primary, unset other primary configs
    if (validatedData.isPrimary) {
      await prisma.azureConfig.updateMany({
        where: { 
          isPrimary: true,
          NOT: { id },
        },
        data: { isPrimary: false },
      });
    }

    // Prepare update data
    const updateData: any = { ...validatedData };
    
    // Encrypt API key if provided
    if (validatedData.apiKey) {
      updateData.apiKey = encrypt(validatedData.apiKey);
    } else {
      delete updateData.apiKey; // Don't update if not provided
    }

    // Update the configuration
    const config = await prisma.azureConfig.update({
      where: { id },
      data: updateData,
    });

    // Create audit log
    await prisma.auditLog.create({
      data: {
        adminId: req.user!.id,
        action: 'UPDATE_AZURE_CONFIG',
        details: { 
          configName: config.name,
          changes: Object.keys(validatedData),
        },
        ipAddress: req.ip,
      },
    });

    // Test the configuration if endpoint/key/deployment changed
    if (validatedData.endpoint || validatedData.apiKey || validatedData.deploymentName) {
      const testResult = await testConfigurationWithDetails(config);
      
      // Update health status
      await prisma.azureConfig.update({
        where: { id: config.id },
        data: {
          healthStatus: testResult.status,
          lastHealthCheck: new Date(),
        },
      });
    }

    // Return sanitized config
    const sanitizedConfig = {
      ...config,
      apiKey: undefined,
      hasApiKey: true,
    };

    return res.json({ config: sanitizedConfig });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid configuration data',
          details: error.errors,
          timestamp: new Date().toISOString(),
          path: req.path
        }
      });
    }

    console.error('Update config error:', error);
    return res.status(500).json({
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to update configuration',
        timestamp: new Date().toISOString(),
        path: req.path
      }
    });
  }
});

// DELETE /admin/configs/:id - Delete a configuration
router.delete('/configs/:id', async (req: Request, res: Response): Promise<Response> => {
  try {
    const { id } = req.params;

    // Check if config exists
    const config = await prisma.azureConfig.findUnique({
      where: { id },
    });

    if (!config) {
      return res.status(404).json({
        error: {
          code: 'NOT_FOUND',
          message: 'Configuration not found',
          timestamp: new Date().toISOString(),
          path: req.path
        }
      });
    }

    // Don't allow deleting the primary config if it's the only active one
    if (config.isPrimary && config.isActive) {
      const activeConfigsCount = await prisma.azureConfig.count({
        where: { isActive: true },
      });

      if (activeConfigsCount === 1) {
        return res.status(400).json({
          error: {
            code: 'CANNOT_DELETE_PRIMARY',
            message: 'Cannot delete the only active configuration',
            timestamp: new Date().toISOString(),
            path: req.path
          }
        });
      }
    }

    // Delete the configuration
    await prisma.azureConfig.delete({
      where: { id },
    });

    // Create audit log
    await prisma.auditLog.create({
      data: {
        adminId: req.user!.id,
        action: 'DELETE_AZURE_CONFIG',
        details: { configName: config.name },
        ipAddress: req.ip,
      },
    });

    return res.json({ 
      message: 'Configuration deleted successfully',
      deletedConfig: { id, name: config.name },
    });
  } catch (error) {
    console.error('Delete config error:', error);
    return res.status(500).json({
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to delete configuration',
        timestamp: new Date().toISOString(),
        path: req.path
      }
    });
  }
});

// POST /admin/configs/:id/test - Test a configuration
router.post('/configs/:id/test', async (req: Request, res: Response): Promise<Response> => {
  try {
    const { id } = req.params;

    const config = await prisma.azureConfig.findUnique({
      where: { id },
    });

    if (!config) {
      return res.status(404).json({
        error: {
          code: 'NOT_FOUND',
          message: 'Configuration not found',
          timestamp: new Date().toISOString(),
          path: req.path
        }
      });
    }

    const startTime = Date.now();
    const result = await testConfigurationWithDetails(config);
    const responseTime = Date.now() - startTime;

    // Update health status
    await prisma.azureConfig.update({
      where: { id: config.id },
      data: {
        healthStatus: result.status,
        lastHealthCheck: new Date(),
      },
    });

    return res.json({
      success: result.status === 'healthy',
      healthStatus: result.status,
      responseTime,
      details: result.details,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Test config error:', error);
    return res.status(500).json({
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to test configuration',
        timestamp: new Date().toISOString(),
        path: req.path
      }
    });
  }
});

// Helper function to test configuration with detailed results
async function testConfigurationWithDetails(config: any): Promise<{ status: string; details: any }> {
  try {
    const decryptedApiKey = decrypt(config.apiKey);
    
    // Extract base endpoint URL if full URL is provided
    let endpoint = config.endpoint;
    if (endpoint.includes('/openai/deployments/')) {
      const url = new URL(endpoint);
      endpoint = `${url.protocol}//${url.host}`;
    }
    
    // Remove trailing slash if present
    endpoint = endpoint.replace(/\/$/, '');
    
    const testDetails = {
      endpoint,
      deployment: config.deploymentName,
      apiVersion: config.apiVersion,
      testStarted: new Date().toISOString()
    };

    console.log('Testing Azure OpenAI config:', testDetails);

    // Create Azure OpenAI client
    const client = new AzureOpenAI({
      endpoint,
      apiKey: decryptedApiKey,
      apiVersion: config.apiVersion,
      deployment: config.deploymentName,
    });

    // Test with a simple chat completion
    const response = await client.chat.completions.create({
      messages: [
        { role: 'system', content: 'You are a helpful assistant.' },
        { role: 'user', content: 'Say "test successful" in exactly those two words.' }
      ],
      max_tokens: 10,
      temperature: 0,
      model: config.deploymentName,
    });

    if (response.choices && response.choices.length > 0) {
      const responseText = response.choices[0].message.content;
      console.log('Azure OpenAI test successful:', responseText);
      return {
        status: 'healthy',
        details: {
          ...testDetails,
          testCompleted: new Date().toISOString(),
          response: responseText,
          model: response.model,
          usage: response.usage
        }
      };
    } else {
      console.log('Azure OpenAI test returned no choices');
      return {
        status: 'degraded',
        details: {
          ...testDetails,
          error: 'No response choices returned'
        }
      };
    }
  } catch (error: any) {
    console.error('Config test error:', {
      message: error.message,
      status: error.status,
      code: error.code,
      type: error.type
    });
    
    let status = 'unhealthy';
    let errorDetails: any = {
      message: error.message,
      code: error.code || error.status,
      type: error.type
    };

    if (error.status === 401 || error.code === '401') {
      status = 'unhealthy';
      errorDetails.reason = 'Authentication failed - Invalid API key';
    } else if (error.status === 429 || error.code === '429') {
      status = 'degraded';
      errorDetails.reason = 'Rate limit exceeded';
    } else if (error.code === 'ENOTFOUND' || error.code === 'ECONNREFUSED') {
      status = 'unhealthy';
      errorDetails.reason = 'Network error - Cannot reach endpoint';
    } else if (error.message?.includes('deployment')) {
      status = 'unhealthy';
      errorDetails.reason = 'Invalid deployment name';
    }

    return {
      status,
      details: {
        endpoint: config.endpoint,
        deployment: config.deploymentName,
        apiVersion: config.apiVersion,
        error: errorDetails
      }
    };
  }
}

// Helper function to test Azure OpenAI configuration
async function testConfiguration(config: any): Promise<string> {
  try {
    const decryptedApiKey = decrypt(config.apiKey);
    
    // Extract base endpoint URL if full URL is provided
    let endpoint = config.endpoint;
    if (endpoint.includes('/openai/deployments/')) {
      // Extract just the base URL
      const url = new URL(endpoint);
      endpoint = `${url.protocol}//${url.host}`;
    }
    
    // Remove trailing slash if present
    endpoint = endpoint.replace(/\/$/, '');
    
    console.log('Testing Azure OpenAI config:', {
      endpoint,
      deployment: config.deploymentName,
      apiVersion: config.apiVersion
    });

    // Create Azure OpenAI client
    const client = new AzureOpenAI({
      endpoint,
      apiKey: decryptedApiKey,
      apiVersion: config.apiVersion,
      deployment: config.deploymentName,
    });

    // Test with a simple chat completion
    const response = await client.chat.completions.create({
      messages: [
        { role: 'system', content: 'You are a helpful assistant.' },
        { role: 'user', content: 'Say "test successful" in exactly those two words.' }
      ],
      max_tokens: 10,
      temperature: 0,
      model: config.deploymentName,
    });

    if (response.choices && response.choices.length > 0) {
      console.log('Azure OpenAI test successful:', response.choices[0].message.content);
      return 'healthy';
    } else {
      console.log('Azure OpenAI test returned no choices');
      return 'degraded';
    }
  } catch (error: any) {
    console.error('Config test error:', {
      message: error.message,
      status: error.status,
      code: error.code,
      type: error.type
    });
    
    if (error.status === 401 || error.code === '401') {
      return 'unhealthy'; // Authentication failed
    } else if (error.status === 429 || error.code === '429') {
      return 'degraded'; // Rate limited
    } else if (error.code === 'ENOTFOUND' || error.code === 'ECONNREFUSED') {
      return 'unhealthy'; // Network error
    } else {
      return 'unhealthy'; // Other errors
    }
  }
}

export default router;