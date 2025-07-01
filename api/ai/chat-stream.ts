import { VercelRequest, VercelResponse } from '@vercel/node';
import { OpenAI } from 'openai';
import { z } from 'zod';
import { prisma } from '../_lib/prisma-init';
import { AuthenticatedRequest, authenticateToken } from '../_lib/auth';
import { handleCors } from '../_lib/cors';
import { decrypt } from '../_lib/encryption';

const chatRequestSchema = z.object({
  messages: z.array(z.object({
    role: z.enum(['system', 'user', 'assistant', 'function']),
    content: z.string()
  })),
  model: z.enum(['gpt-3.5-turbo', 'gpt-4', 'gpt-4-turbo', 'gpt-4o', 'gpt-4o-mini']).optional(),
  temperature: z.number().min(0).max(2).optional(),
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
    const validatedData = chatRequestSchema.parse(req.body);

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

    // Set headers for SSE
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('Access-Control-Allow-Origin', req.headers.origin || '*');

    // Create streaming completion
    const stream = await openai.chat.completions.create({
      model: validatedData.model || 'gpt-4',
      messages: validatedData.messages as any,
      temperature: validatedData.temperature ?? 0.7,
      max_tokens: validatedData.max_tokens,
      stream: true
    });

    let fullContent = '';
    let totalTokens = 0;

    // Stream the response
    for await (const chunk of stream) {
      const content = chunk.choices[0]?.delta?.content || '';
      fullContent += content;
      
      if (content) {
        res.write(`data: ${JSON.stringify({ content })}\n\n`);
      }

      // Extract usage from final chunk
      if (chunk.usage) {
        totalTokens = chunk.usage.total_tokens || 0;
      }
    }

    // Send done event
    res.write(`data: [DONE]\n\n`);

    // Track usage (estimate if not provided)
    const estimatedTokens = totalTokens || Math.ceil(fullContent.length / 4);
    const inputTokens = Math.ceil(JSON.stringify(validatedData.messages).length / 4);
    const outputTokens = estimatedTokens - inputTokens;

    await prisma.aIUsage.create({
      data: {
        userId: authenticatedReq.user!.id,
        model: validatedData.model || 'gpt-4',
        inputTokens,
        outputTokens,
        totalTokens: estimatedTokens,
        cost: calculateCost(
          validatedData.model || 'gpt-4',
          inputTokens,
          outputTokens
        )
      }
    });

    res.end();

  } catch (error: any) {
    console.error('Chat stream error:', error);
    
    // Send error as SSE
    res.write(`data: ${JSON.stringify({ 
      error: error.message || 'Stream error occurred' 
    })}\n\n`);
    res.end();
  }
}

function calculateCost(model: string, inputTokens: number, outputTokens: number): number {
  const pricing = {
    'gpt-3.5-turbo': { input: 0.0005, output: 0.0015 },
    'gpt-4': { input: 0.03, output: 0.06 },
    'gpt-4-turbo': { input: 0.01, output: 0.03 },
    'gpt-4o': { input: 0.005, output: 0.015 },
    'gpt-4o-mini': { input: 0.00015, output: 0.0006 }
  };

  const modelPricing = pricing[model as keyof typeof pricing] || pricing['gpt-4'];
  return (inputTokens * modelPricing.input / 1000) + (outputTokens * modelPricing.output / 1000);
}