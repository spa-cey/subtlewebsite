import { VercelRequest, VercelResponse } from '@vercel/node';
import { OpenAI } from 'openai';
import { z } from 'zod';
import { prisma } from '../_lib/prisma';
import { AuthenticatedRequest, authenticateToken } from '../_lib/auth';
import { handleCors } from '../_lib/cors';
import { decrypt } from '../_lib/encryption';

const imageAnalysisSchema = z.object({
  images: z.array(z.object({
    url: z.string().url().optional(),
    base64: z.string().optional()
  })).min(1),
  prompt: z.string(),
  model: z.enum(['gpt-4-vision-preview', 'gpt-4o', 'gpt-4o-mini']).optional(),
  max_tokens: z.number().positive().optional()
});

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Handle CORS
  if (!handleCors(req, res)) return;

  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  // Authenticate request
  if (!await authenticateToken(req as AuthenticatedRequest, res)) {
    return;
  }

  try {
    const authenticatedReq = req as AuthenticatedRequest;
    const validatedData = imageAnalysisSchema.parse(req.body);

    // Get user's API config
    const apiConfig = await prisma.azureOpenAIConfig.findFirst({
      where: { userId: authenticatedReq.user!.id }
    });

    if (!apiConfig) {
      return res.status(400).json({
        success: false,
        error: 'No API configuration found. Please configure your Azure OpenAI settings.'
      });
    }

    // Decrypt API key
    const decryptedApiKey = decrypt(apiConfig.apiKey);

    // Create OpenAI client
    const openai = new OpenAI({
      apiKey: decryptedApiKey,
      baseURL: `${apiConfig.endpoint}/openai/deployments/${apiConfig.deploymentName}`,
      defaultQuery: { 'api-version': apiConfig.apiVersion },
      defaultHeaders: {
        'api-key': decryptedApiKey
      }
    });

    // Prepare messages with images
    const messages = [
      {
        role: 'user' as const,
        content: [
          { type: 'text' as const, text: validatedData.prompt },
          ...validatedData.images.map(img => ({
            type: 'image_url' as const,
            image_url: {
              url: img.base64 ? `data:image/jpeg;base64,${img.base64}` : img.url!
            }
          }))
        ]
      }
    ];

    // Make the vision request
    const completion = await openai.chat.completions.create({
      model: validatedData.model || 'gpt-4o',
      messages,
      max_tokens: validatedData.max_tokens || 500
    });

    // Track usage
    if (completion.usage) {
      await prisma.aIUsage.create({
        data: {
          userId: authenticatedReq.user!.id,
          model: validatedData.model || 'gpt-4o',
          inputTokens: completion.usage.prompt_tokens || 0,
          outputTokens: completion.usage.completion_tokens || 0,
          totalTokens: completion.usage.total_tokens || 0,
          cost: calculateCost(
            validatedData.model || 'gpt-4o',
            completion.usage.prompt_tokens || 0,
            completion.usage.completion_tokens || 0
          )
        }
      });
    }

    res.status(200).json({
      success: true,
      response: completion.choices[0].message.content,
      usage: completion.usage
    });

  } catch (error: any) {
    console.error('Image analysis error:', error);
    
    if (error.response?.status === 401) {
      return res.status(401).json({
        success: false,
        error: 'Invalid API credentials. Please check your Azure OpenAI configuration.'
      });
    }
    
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: 'Invalid request data',
        details: error.errors
      });
    }

    res.status(500).json({
      success: false,
      error: error.message || 'Internal server error'
    });
  }
}

function calculateCost(model: string, inputTokens: number, outputTokens: number): number {
  const pricing = {
    'gpt-4-vision-preview': { input: 0.01, output: 0.03 },
    'gpt-4o': { input: 0.005, output: 0.015 },
    'gpt-4o-mini': { input: 0.00015, output: 0.0006 }
  };

  const modelPricing = pricing[model as keyof typeof pricing] || pricing['gpt-4o'];
  return (inputTokens * modelPricing.input / 1000) + (outputTokens * modelPricing.output / 1000);
}