import { NextRequest, NextResponse } from 'next/server';
import { OpenAI } from 'openai';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';

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

    // Check if using OpenAI directly or Azure OpenAI
    const useAzure = process.env.USE_AZURE_OPENAI === 'true';
    let openai: OpenAI;

    if (useAzure) {
      // Get user's Azure OpenAI config
      const apiConfig = await prisma.azureOpenAIConfig.findFirst({
        where: { userId },
      });

      if (!apiConfig) {
        return NextResponse.json(
          {
            success: false,
            error: 'No API configuration found. Please configure your Azure OpenAI settings.',
          },
          { status: 400 }
        );
      }

      // Create Azure OpenAI client
      openai = new OpenAI({
        apiKey: apiConfig.apiKey, // In production, decrypt this
        baseURL: `${apiConfig.endpoint}/openai/deployments/${apiConfig.deploymentName}`,
        defaultQuery: { 'api-version': apiConfig.apiVersion },
        defaultHeaders: {
          'api-key': apiConfig.apiKey, // In production, decrypt this
        },
      });
    } else {
      // Use standard OpenAI
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

    return NextResponse.json({
      success: true,
      data: completion.choices[0].message,
      usage: completion.usage,
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