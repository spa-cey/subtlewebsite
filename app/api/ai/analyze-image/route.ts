import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { decrypt } from '@/lib/encryption';
import OpenAI from 'openai';
import sharp from 'sharp';

function calculateCost(model: string, inputTokens: number, outputTokens: number): number {
  const rates: Record<string, { input: number; output: number }> = {
    'gpt-4-vision-preview': { input: 0.01, output: 0.03 },
    'gpt-4': { input: 0.03, output: 0.06 },
    'gpt-4-turbo': { input: 0.01, output: 0.03 },
    'gpt-4o': { input: 0.005, output: 0.015 },
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

    const body = await request.json();
    const { image: base64Image, prompt = 'What is in this image?', analysisType = 'general' } = body;

    if (!base64Image) {
      return NextResponse.json(
        { success: false, error: 'Image is required' },
        { status: 400 }
      );
    }

    // Optimize image before sending to OpenAI
    console.log('Starting image optimization...');
    const startTime = Date.now();
    
    let optimizedBase64: string;
    try {
      // Convert base64 to buffer
      const imageBuffer = Buffer.from(base64Image, 'base64');
      
      // Get image metadata to check if optimization is needed
      const metadata = await sharp(imageBuffer).metadata();
      const currentMaxDimension = Math.max(metadata.width || 0, metadata.height || 0);
      
      // Skip optimization if image is already small enough and in JPEG format
      if (currentMaxDimension <= 1536 && metadata.format === 'jpeg') {
        console.log(`Image already optimized (${currentMaxDimension}px, JPEG). Skipping additional processing.`);
        optimizedBase64 = base64Image;
      } else {
        // Optimize image: resize to max 1024px width/height and compress
        const optimizedBuffer = await sharp(imageBuffer)
          .resize(1024, 1024, {
            fit: 'inside',
            withoutEnlargement: true, // Don't upscale smaller images
          })
          .jpeg({
            quality: 85, // Good balance between quality and size
            progressive: true,
          })
          .toBuffer();
        
        // Convert back to base64
        optimizedBase64 = optimizedBuffer.toString('base64');
      }
      
      const optimizationTime = Date.now() - startTime;
      console.log(`Image optimization completed in ${optimizationTime}ms`);
      console.log(`Original size: ${base64Image.length}, Optimized size: ${optimizedBase64.length}`);
      console.log(`Size reduction: ${Math.round((1 - optimizedBase64.length / base64Image.length) * 100)}%`);
    } catch (error) {
      console.error('Image optimization failed:', error);
      // Fall back to original image if optimization fails
      optimizedBase64 = base64Image;
    }

    // Create data URL for OpenAI
    const dataUrl = `data:image/jpeg;base64,${optimizedBase64}`;

    // Get system Azure OpenAI configuration
    let openai: OpenAI;
    let modelToUse = 'gpt-4-vision-preview';
    
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
      
      modelToUse = systemAzureConfig.modelName;
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

    // Call OpenAI Vision API
    const completion = await openai.chat.completions.create({
      model: modelToUse,
      messages: [
        {
          role: 'user',
          content: [
            { type: 'text', text: prompt },
            {
              type: 'image_url',
              image_url: {
                url: dataUrl,
              },
            },
          ],
        },
      ],
      max_tokens: systemAzureConfig?.maxTokens || 300,
      temperature: systemAzureConfig?.temperature || 0.7,
    });

    const analysis = completion.choices[0]?.message?.content;

    // Track usage
    if (completion.usage) {
      await prisma.aIUsage.create({
        data: {
          userId,
          model: modelToUse,
          inputTokens: completion.usage.prompt_tokens || 0,
          outputTokens: completion.usage.completion_tokens || 0,
          totalTokens: completion.usage.total_tokens || 0,
          cost: calculateCost(
            modelToUse,
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
        modelToUse,
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

    // Calculate cost for response
    const cost = completion.usage ? calculateCost(
      modelToUse,
      completion.usage.prompt_tokens || 0,
      completion.usage.completion_tokens || 0
    ) : 0;

    return NextResponse.json({
      success: true,
      analysis,
      usage: completion.usage ? {
        prompt_tokens: completion.usage.prompt_tokens || 0,
        completion_tokens: completion.usage.completion_tokens || 0,
        total_tokens: completion.usage.total_tokens || 0,
      } : undefined,
      cost,
      quotaStatus,
      performance: {
        imageOptimizationMs: Date.now() - startTime,
        totalRequestMs: Date.now() - request.headers.get('x-request-start') as any || Date.now(),
      },
    });
  } catch (error) {
    console.error('Image analysis error:', error);
    
    // Ensure error response matches expected format
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to analyze image',
        analysis: undefined,
        usage: undefined,
        cost: 0,
      },
      { status: 500 }
    );
  }
}