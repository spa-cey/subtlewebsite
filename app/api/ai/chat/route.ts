import { NextRequest, NextResponse } from 'next/server';
import { OpenAI } from 'openai';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { decrypt } from '@/lib/encryption';

const chatRequestSchema = z.object({
  messages: z.array(
    z.object({
      role: z.enum(['system', 'user', 'assistant', 'function']),
      content: z.string(),
    })
  ),
  model: z.enum(['gpt-3.5-turbo', 'gpt-4', 'gpt-4-turbo', 'gpt-4o', 'gpt-4o-mini']).optional(),
  temperature: z.number().min(0).max(2).optional(),
  max_tokens: z.number().positive().optional(),
  stream: z.boolean().optional(),
});

function calculateCost(model: string, inputTokens: number, outputTokens: number): number {
  const rates: Record<string, { input: number; output: number }> = {
    'gpt-3.5-turbo': { input: 0.0005, output: 0.0015 },
    'gpt-4': { input: 0.03, output: 0.06 },
    'gpt-4-turbo': { input: 0.01, output: 0.03 },
    'gpt-4o': { input: 0.005, output: 0.015 },
    'gpt-4o-mini': { input: 0.00015, output: 0.0006 },
  };

  const rate = rates[model] || rates['gpt-4'];
  return (inputTokens * rate.input + outputTokens * rate.output) / 1000;
}

export async function POST(request: NextRequest) {
  try {
    // Get user ID from middleware
    const userId = request.headers.get('x-user-id');
    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Validate request body
    const body = await request.json();
    const validatedData = chatRequestSchema.parse(body);

    // Get user with subscription info
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }

    // Check subscription tier
    const subscriptionTier = user.subscriptionTier || 'free';
    
    // Free tier users don't have access to AI
    if (subscriptionTier === 'free') {
      return NextResponse.json(
        {
          success: false,
          error: 'AI features require a Pro or Enterprise subscription',
          upgradeUrl: '/pricing',
        },
        { status: 402 } // Payment Required
      );
    }

    // Check user's daily quota
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const todayUsage = await prisma.aIUsage.aggregate({
      where: {
        userId,
        createdAt: {
          gte: today,
        },
      },
      _count: true,
      _sum: {
        totalTokens: true,
        cost: true,
      },
    });

    // Define limits based on subscription tier
    const limits = {
      pro: { dailyRequests: 1000, dailyTokens: 500000, dailyCost: 50 },
      enterprise: { dailyRequests: 10000, dailyTokens: 5000000, dailyCost: 500 },
    };

    const userLimits = limits[subscriptionTier as keyof typeof limits] || limits.pro;

    if (todayUsage._count >= userLimits.dailyRequests) {
      return NextResponse.json(
        {
          success: false,
          error: 'Daily request limit exceeded',
          quotaStatus: {
            tier: subscriptionTier,
            usage: {
              requests: todayUsage._count,
              tokens: todayUsage._sum.totalTokens || 0,
              cost: Number(todayUsage._sum.cost || 0),
            },
            limits: userLimits,
            resetAt: new Date(today.getTime() + 24 * 60 * 60 * 1000).toISOString(),
          },
        },
        { status: 429 }
      );
    }

    // Get system Azure OpenAI configuration
    let openai: OpenAI;
    
    // Check if we should use Azure OpenAI
    const systemAzureConfig = await prisma.systemAzureConfig.findFirst({
      where: { 
        isPrimary: true,
        isActive: true,
      },
    });

    if (systemAzureConfig) {
      // Decrypt the API key
      const decryptedApiKey = decrypt(systemAzureConfig.apiKey);
      
      // Create Azure OpenAI client
      openai = new OpenAI({
        apiKey: decryptedApiKey,
        baseURL: `${systemAzureConfig.endpoint}/openai/deployments/${systemAzureConfig.deploymentName}`,
        defaultQuery: { 'api-version': systemAzureConfig.apiVersion },
        defaultHeaders: {
          'api-key': decryptedApiKey,
        },
      });
    } else {
      // Fallback to standard OpenAI
      if (!process.env.OPENAI_API_KEY) {
        return NextResponse.json(
          {
            success: false,
            error: 'AI service not configured. Please contact support.',
          },
          { status: 503 }
        );
      }
      
      openai = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY,
      });
    }

    // Make the chat completion request
    const completion = await openai.chat.completions.create({
      model: validatedData.model || 'gpt-4',
      messages: validatedData.messages as any,
      temperature: validatedData.temperature ?? 0.7,
      max_tokens: validatedData.max_tokens,
    });

    // Track usage
    if (completion.usage) {
      await prisma.aIUsage.create({
        data: {
          userId,
          model: validatedData.model || 'gpt-4',
          inputTokens: completion.usage.prompt_tokens || 0,
          outputTokens: completion.usage.completion_tokens || 0,
          totalTokens: completion.usage.total_tokens || 0,
          cost: calculateCost(
            validatedData.model || 'gpt-4',
            completion.usage.prompt_tokens || 0,
            completion.usage.completion_tokens || 0
          ),
        },
      });
    }

    // Calculate updated quota status
    const updatedUsage = {
      requests: todayUsage._count + 1,
      tokens: (todayUsage._sum.totalTokens || 0) + (completion.usage?.total_tokens || 0),
      cost: Number(todayUsage._sum.cost || 0) + calculateCost(
        validatedData.model || 'gpt-4',
        completion.usage?.prompt_tokens || 0,
        completion.usage?.completion_tokens || 0
      ),
    };

    const quotaStatus = {
      tier: subscriptionTier,
      usage: updatedUsage,
      limits: userLimits,
      remaining: {
        requests: userLimits.dailyRequests - updatedUsage.requests,
        tokens: userLimits.dailyTokens - updatedUsage.tokens,
        cost: userLimits.dailyCost - updatedUsage.cost,
      },
      resetAt: new Date(today.getTime() + 24 * 60 * 60 * 1000).toISOString(),
    };

    return NextResponse.json({
      success: true,
      content: completion.choices[0].message.content,
      usage: completion.usage,
      quotaStatus,
    });
  } catch (error) {
    console.error('Chat error:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid request data',
          details: error.errors,
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error',
      },
      { status: 500 }
    );
  }
}