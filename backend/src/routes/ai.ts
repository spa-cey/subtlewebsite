import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { prisma } from '../db/index';
import { authenticateToken } from '../middleware/index';
import { decrypt } from '../utils/encryption';
import { AzureOpenAI } from 'openai';
import { Stream } from 'openai/streaming';

const router = Router();

// Apply auth middleware to all routes
router.use(authenticateToken);

// Schema for chat request
const chatRequestSchema = z.object({
  messages: z.array(z.object({
    role: z.enum(['system', 'user', 'assistant']),
    content: z.string()
  })),
  temperature: z.number().min(0).max(2).optional().default(0.7),
  maxTokens: z.number().positive().optional().default(1000),
  stream: z.boolean().optional().default(false)
});

// Schema for image analysis request
const imageAnalysisSchema = z.object({
  image: z.string(), // Base64 encoded image
  prompt: z.string(),
  analysisType: z.enum(['general', 'code', 'design', 'content']).optional().default('general')
});

// Helper to get active Azure config
async function getActiveAzureConfig() {
  // First try to get primary config
  let config = await prisma.azureConfig.findFirst({
    where: {
      isActive: true,
      isPrimary: true
    }
  });

  // If no primary, get any active config
  if (!config) {
    config = await prisma.azureConfig.findFirst({
      where: {
        isActive: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
  }

  if (!config) {
    throw new Error('No active Azure OpenAI configuration found');
  }

  return config;
}

// Helper to create Azure OpenAI client
async function createAzureClient(config: any) {
  const decryptedApiKey = decrypt(config.apiKey);
  
  // Extract base endpoint URL
  let endpoint = config.endpoint;
  if (endpoint.includes('/openai/deployments/')) {
    const url = new URL(endpoint);
    endpoint = `${url.protocol}//${url.host}`;
  }
  endpoint = endpoint.replace(/\/$/, '');

  return new AzureOpenAI({
    endpoint,
    apiKey: decryptedApiKey,
    apiVersion: config.apiVersion,
    deployment: config.deploymentName,
  });
}

// Helper to track usage
async function trackUsage(userId: string, tokens: number, cost: number, featureType: string = 'chat') {
  await prisma.userUsageMetric.create({
    data: {
      userId,
      requestCount: 1,
      totalTokens: tokens,
      totalCost: cost,
      featureType
    }
  });
}

// Helper to check user quota
async function checkUserQuota(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId }
  });

  if (!user) {
    throw new Error('User not found');
  }

  // Get usage for current month
  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);

  const usage = await prisma.userUsageMetric.aggregate({
    where: {
      userId,
      createdAt: {
        gte: startOfMonth
      }
    },
    _sum: {
      requestCount: true,
      totalTokens: true,
      totalCost: true
    }
  });

  // Define quotas by tier
  const quotas = {
    free: { requests: 100, tokens: 50000, cost: 5 },
    pro: { requests: 1000, tokens: 500000, cost: 50 },
    enterprise: { requests: 10000, tokens: 5000000, cost: 500 }
  };

  const userQuota = quotas[user.subscriptionTier as keyof typeof quotas] || quotas.free;
  const currentUsage = {
    requests: usage._sum.requestCount || 0,
    tokens: usage._sum.totalTokens || 0,
    cost: Number(usage._sum.totalCost) || 0
  };

  // Check if over quota
  if (currentUsage.requests >= userQuota.requests) {
    throw new Error('Monthly request quota exceeded');
  }
  if (currentUsage.tokens >= userQuota.tokens) {
    throw new Error('Monthly token quota exceeded');
  }
  if (currentUsage.cost >= userQuota.cost) {
    throw new Error('Monthly cost quota exceeded');
  }

  return {
    tier: user.subscriptionTier,
    quota: userQuota,
    usage: currentUsage,
    remaining: {
      requests: userQuota.requests - currentUsage.requests,
      tokens: userQuota.tokens - currentUsage.tokens,
      cost: userQuota.cost - currentUsage.cost
    }
  };
}

// POST /api/ai/chat - Chat completion
router.post('/chat', async (req: Request, res: Response): Promise<Response> => {
  try {
    const validatedData = chatRequestSchema.parse(req.body);
    const userId = req.user!.id;

    // Check user quota
    const quotaStatus = await checkUserQuota(userId);

    // Get active Azure config
    const config = await getActiveAzureConfig();
    const client = await createAzureClient(config);

    // Create chat completion
    const response = await client.chat.completions.create({
      messages: validatedData.messages as any,
      temperature: validatedData.temperature,
      max_tokens: validatedData.maxTokens,
      model: config.deploymentName,
      stream: false
    });

    // Calculate cost (rough estimation)
    const usage = response.usage || { prompt_tokens: 0, completion_tokens: 0, total_tokens: 0 };
    const costPerToken = 0.00002; // $0.02 per 1K tokens (adjust based on your model)
    const totalCost = (usage.total_tokens / 1000) * costPerToken;

    // Track usage
    await trackUsage(userId, usage.total_tokens, totalCost, 'chat');

    // Return response
    return res.json({
      success: true,
      content: response.choices[0]?.message?.content || '',
      usage: {
        promptTokens: usage.prompt_tokens,
        completionTokens: usage.completion_tokens,
        totalTokens: usage.total_tokens
      },
      quotaStatus: {
        ...quotaStatus,
        usage: {
          ...quotaStatus.usage,
          requests: quotaStatus.usage.requests + 1,
          tokens: quotaStatus.usage.tokens + usage.total_tokens,
          cost: quotaStatus.usage.cost + totalCost
        }
      }
    });

  } catch (error) {
    console.error('Chat completion error:', error);
    
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: 'Invalid request data',
        details: error.errors
      });
    }

    if (error instanceof Error) {
      if (error.message.includes('quota exceeded')) {
        return res.status(402).json({
          success: false,
          error: error.message,
          upgradeUrl: 'https://gosubtle.app/pricing'
        });
      }

      if (error.message.includes('No active Azure OpenAI configuration')) {
        return res.status(503).json({
          success: false,
          error: 'AI service temporarily unavailable'
        });
      }
    }

    return res.status(500).json({
      success: false,
      error: 'Failed to process chat request'
    });
  }
});

// POST /api/ai/chat/stream - Streaming chat completion
router.post('/chat/stream', async (req: Request, res: Response): Promise<any> => {
  try {
    const validatedData = chatRequestSchema.parse(req.body);
    const userId = req.user!.id;

    // Check user quota
    const quotaStatus = await checkUserQuota(userId);

    // Get active Azure config
    const config = await getActiveAzureConfig();
    const client = await createAzureClient(config);

    // Set headers for SSE
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    // Create streaming chat completion
    const stream = await client.chat.completions.create({
      messages: validatedData.messages as any,
      temperature: validatedData.temperature,
      max_tokens: validatedData.maxTokens,
      model: config.deploymentName,
      stream: true
    });

    let totalTokens = 0;
    let content = '';

    // Stream the response
    for await (const chunk of stream) {
      const delta = chunk.choices[0]?.delta?.content || '';
      if (delta) {
        content += delta;
        // Estimate tokens (rough approximation)
        totalTokens = Math.ceil(content.length / 4);
        
        // Send SSE event
        res.write(`data: ${JSON.stringify({ content: delta, done: false })}\n\n`);
      }
    }

    // Calculate final cost
    const costPerToken = 0.00002;
    const totalCost = (totalTokens / 1000) * costPerToken;

    // Track usage
    await trackUsage(userId, totalTokens, totalCost, 'chat');

    // Send final event with usage info
    res.write(`data: ${JSON.stringify({
      done: true,
      usage: {
        totalTokens,
        cost: totalCost
      },
      quotaStatus: {
        ...quotaStatus,
        usage: {
          ...quotaStatus.usage,
          requests: quotaStatus.usage.requests + 1,
          tokens: quotaStatus.usage.tokens + totalTokens,
          cost: quotaStatus.usage.cost + totalCost
        }
      }
    })}\n\n`);

    res.end();

  } catch (error) {
    console.error('Streaming chat error:', error);
    
    // Send error as SSE event
    res.write(`data: ${JSON.stringify({
      error: error instanceof Error ? error.message : 'Failed to process chat request',
      done: true
    })}\n\n`);
    
    res.end();
  }
});

// POST /api/ai/analyze-image - Analyze image
router.post('/analyze-image', async (req: Request, res: Response): Promise<Response> => {
  try {
    const validatedData = imageAnalysisSchema.parse(req.body);
    const userId = req.user!.id;

    // Check user quota
    const quotaStatus = await checkUserQuota(userId);

    // Get active Azure config
    const config = await getActiveAzureConfig();
    const client = await createAzureClient(config);

    // Prepare messages with image
    const messages = [
      {
        role: 'system' as const,
        content: getImageAnalysisPrompt(validatedData.analysisType)
      },
      {
        role: 'user' as const,
        content: [
          {
            type: 'text' as const,
            text: validatedData.prompt
          },
          {
            type: 'image_url' as const,
            image_url: {
              url: `data:image/jpeg;base64,${validatedData.image}`
            }
          }
        ]
      }
    ];

    // Create completion
    const response = await client.chat.completions.create({
      messages: messages as any,
      temperature: 0.7,
      max_tokens: 1500,
      model: config.deploymentName
    });

    // Calculate cost (images are more expensive)
    const usage = response.usage || { total_tokens: 0 };
    const costPerToken = 0.00003; // Higher rate for vision models
    const totalCost = (usage.total_tokens / 1000) * costPerToken + 0.01; // Base cost for image

    // Track usage
    await trackUsage(userId, usage.total_tokens, totalCost, 'image-analysis');

    return res.json({
      success: true,
      analysis: response.choices[0]?.message?.content || '',
      usage: {
        totalTokens: usage.total_tokens,
        cost: totalCost
      },
      quotaStatus: {
        ...quotaStatus,
        usage: {
          ...quotaStatus.usage,
          requests: quotaStatus.usage.requests + 1,
          tokens: quotaStatus.usage.tokens + usage.total_tokens,
          cost: quotaStatus.usage.cost + totalCost
        }
      }
    });

  } catch (error) {
    console.error('Image analysis error:', error);
    
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: 'Invalid request data',
        details: error.errors
      });
    }

    if (error instanceof Error && error.message.includes('quota exceeded')) {
      return res.status(402).json({
        success: false,
        error: error.message,
        upgradeUrl: 'https://gosubtle.app/pricing'
      });
    }

    return res.status(500).json({
      success: false,
      error: 'Failed to analyze image'
    });
  }
});

// GET /api/ai/quota - Get user's quota status
router.get('/quota', async (req: Request, res: Response): Promise<Response> => {
  try {
    const userId = req.user!.id;
    const quotaStatus = await checkUserQuota(userId);

    return res.json({
      success: true,
      quota: quotaStatus
    });

  } catch (error) {
    console.error('Get quota error:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to fetch quota status'
    });
  }
});

// GET /api/ai/config - Get AI configuration info (no sensitive data)
router.get('/config', async (req: Request, res: Response): Promise<Response> => {
  try {
    const config = await getActiveAzureConfig();

    return res.json({
      success: true,
      config: {
        name: config.name,
        model: config.deploymentName,
        status: config.healthStatus,
        lastHealthCheck: config.lastHealthCheck
      }
    });

  } catch (error) {
    console.error('Get config error:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to fetch AI configuration'
    });
  }
});

// Helper function to get analysis prompt based on type
function getImageAnalysisPrompt(analysisType: string): string {
  const prompts = {
    general: 'Analyze this image and provide a comprehensive description of what you see.',
    code: 'Analyze this code screenshot. Identify the programming language, explain what the code does, and suggest any improvements.',
    design: 'Analyze this design/UI screenshot. Comment on the layout, color scheme, typography, and user experience aspects.',
    content: 'Extract and summarize the text content from this image. Format it clearly and identify key information.'
  };

  return prompts[analysisType as keyof typeof prompts] || prompts.general;
}

export default router;