import { VercelRequest, VercelResponse } from '@vercel/node';
import { z } from 'zod';
import { prisma } from '../_lib/prisma-init';
import { AuthenticatedRequest, authenticateToken } from '../_lib/auth';
import { handleCors } from '../_lib/cors';
import { encrypt } from '../_lib/encryption';

const azureConfigSchema = z.object({
  endpoint: z.string().url(),
  apiKey: z.string().min(1),
  deploymentName: z.string().min(1),
  apiVersion: z.string().min(1)
});

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Handle CORS
  if (!handleCors(req, res)) return;

  // Authenticate request
  if (!await authenticateToken(req as AuthenticatedRequest, res)) {
    return;
  }

  const authenticatedReq = req as AuthenticatedRequest;
  const userId = authenticatedReq.user!.id;

  switch (req.method) {
    case 'GET':
      return handleGet(userId, res);
    case 'POST':
      return handlePost(userId, req, res);
    case 'PUT':
      return handlePut(userId, req, res);
    case 'DELETE':
      return handleDelete(userId, res);
    default:
      return res.status(405).json({ success: false, error: 'Method not allowed' });
  }
}

async function handleGet(userId: string, res: VercelResponse) {
  try {
    const config = await prisma.azureOpenAIConfig.findFirst({
      where: { userId }
    });

    if (!config) {
      return res.status(404).json({
        success: false,
        error: 'No Azure OpenAI configuration found'
      });
    }

    res.status(200).json({
      success: true,
      config: {
        id: config.id,
        endpoint: config.endpoint,
        deploymentName: config.deploymentName,
        apiVersion: config.apiVersion,
        // Don't send the API key
        hasApiKey: true,
        createdAt: config.createdAt.toISOString(),
        updatedAt: config.updatedAt.toISOString()
      }
    });
  } catch (error) {
    console.error('Get Azure config error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
}

async function handlePost(userId: string, req: VercelRequest, res: VercelResponse) {
  try {
    const validatedData = azureConfigSchema.parse(req.body);

    // Check if config already exists
    const existingConfig = await prisma.azureOpenAIConfig.findFirst({
      where: { userId }
    });

    if (existingConfig) {
      return res.status(400).json({
        success: false,
        error: 'Configuration already exists. Use PUT to update.'
      });
    }

    // Encrypt the API key
    const encryptedApiKey = encrypt(validatedData.apiKey);

    // Create new config
    const config = await prisma.azureOpenAIConfig.create({
      data: {
        userId,
        endpoint: validatedData.endpoint,
        apiKey: encryptedApiKey,
        deploymentName: validatedData.deploymentName,
        apiVersion: validatedData.apiVersion
      }
    });

    res.status(201).json({
      success: true,
      config: {
        id: config.id,
        endpoint: config.endpoint,
        deploymentName: config.deploymentName,
        apiVersion: config.apiVersion,
        hasApiKey: true,
        createdAt: config.createdAt.toISOString(),
        updatedAt: config.updatedAt.toISOString()
      }
    });

  } catch (error: any) {
    console.error('Create Azure config error:', error);
    
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: 'Invalid configuration data',
        details: error.errors
      });
    }

    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
}

async function handlePut(userId: string, req: VercelRequest, res: VercelResponse) {
  try {
    const validatedData = azureConfigSchema.parse(req.body);

    // Check if config exists
    const existingConfig = await prisma.azureOpenAIConfig.findFirst({
      where: { userId }
    });

    if (!existingConfig) {
      return res.status(404).json({
        success: false,
        error: 'No configuration found. Use POST to create.'
      });
    }

    // Encrypt the API key
    const encryptedApiKey = encrypt(validatedData.apiKey);

    // Update config
    const config = await prisma.azureOpenAIConfig.update({
      where: { id: existingConfig.id },
      data: {
        endpoint: validatedData.endpoint,
        apiKey: encryptedApiKey,
        deploymentName: validatedData.deploymentName,
        apiVersion: validatedData.apiVersion
      }
    });

    res.status(200).json({
      success: true,
      config: {
        id: config.id,
        endpoint: config.endpoint,
        deploymentName: config.deploymentName,
        apiVersion: config.apiVersion,
        hasApiKey: true,
        createdAt: config.createdAt.toISOString(),
        updatedAt: config.updatedAt.toISOString()
      }
    });

  } catch (error: any) {
    console.error('Update Azure config error:', error);
    
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: 'Invalid configuration data',
        details: error.errors
      });
    }

    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
}

async function handleDelete(userId: string, res: VercelResponse) {
  try {
    const config = await prisma.azureOpenAIConfig.findFirst({
      where: { userId }
    });

    if (!config) {
      return res.status(404).json({
        success: false,
        error: 'No configuration found'
      });
    }

    await prisma.azureOpenAIConfig.delete({
      where: { id: config.id }
    });

    res.status(200).json({
      success: true,
      message: 'Configuration deleted successfully'
    });

  } catch (error) {
    console.error('Delete Azure config error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
}