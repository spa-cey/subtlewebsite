import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { decrypt } from '@/lib/encryption';
import OpenAI from 'openai';
import sharp from 'sharp';

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

    const { messages, model = 'gpt-4', temperature = 0.7, image } = await request.json();

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json(
        { success: false, error: 'Messages array is required' },
        { status: 400 }
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

    // Create a TransformStream for streaming response
    const encoder = new TextEncoder();
    const stream = new TransformStream();
    const writer = stream.writable.getWriter();

    // Start the streaming response
    const response = new Response(stream.readable, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });

    // Stream the OpenAI response
    (async () => {
      let totalTokens = 0;
      let promptTokens = 0;
      let completionTokens = 0;

      try {
        // Process image if provided
        let processedMessages = [...messages];
        if (image) {
          console.log('Processing image for chat-stream...');
          const startTime = Date.now();
          
          try {
            // Convert base64 to buffer
            const imageBuffer = Buffer.from(image, 'base64');
            
            // Get image metadata to check if optimization is needed
            const metadata = await sharp(imageBuffer).metadata();
            const currentMaxDimension = Math.max(metadata.width || 0, metadata.height || 0);
            
            let optimizedBase64: string;
            
            // Skip optimization if image is already small enough and in JPEG format
            if (currentMaxDimension <= 1536 && metadata.format === 'jpeg') {
              console.log(`Image already optimized (${currentMaxDimension}px, JPEG). Skipping additional processing.`);
              optimizedBase64 = image;
            } else {
              // Optimize image: resize to max 1024px width/height and compress
              const optimizedBuffer = await sharp(imageBuffer)
                .resize(1024, 1024, {
                  fit: 'inside',
                  withoutEnlargement: true,
                })
                .jpeg({
                  quality: 85,
                  progressive: true,
                })
                .toBuffer();
              
              // Convert back to base64
              optimizedBase64 = optimizedBuffer.toString('base64');
            }
            
            const dataUrl = `data:image/jpeg;base64,${optimizedBase64}`;
            
            const optimizationTime = Date.now() - startTime;
            console.log(`Image optimization completed in ${optimizationTime}ms`);
            console.log(`Size reduction: ${Math.round((1 - optimizedBase64.length / image.length) * 100)}%`);
            
            // Find the last user message and add image to it
            const lastUserMessageIndex = processedMessages.findLastIndex(msg => msg.role === 'user');
            if (lastUserMessageIndex !== -1) {
              const userMessage = processedMessages[lastUserMessageIndex];
              processedMessages[lastUserMessageIndex] = {
                role: 'user',
                content: [
                  { type: 'text', text: userMessage.content },
                  {
                    type: 'image_url',
                    image_url: {
                      url: dataUrl,
                    },
                  },
                ],
              };
            }
          } catch (error) {
            console.error('Image processing failed:', error);
            // Continue without image if processing fails
          }
        }

        // Always use the model from Azure configuration
        const modelToUse = systemAzureConfig ? systemAzureConfig.modelName : model;
        
        console.log(`Using model: ${modelToUse}${image ? ' (image attached)' : ''}`);
        
        const completion = await openai.chat.completions.create({
          model: modelToUse,
          messages: processedMessages,
          temperature: systemAzureConfig?.temperature ?? temperature,
          max_tokens: systemAzureConfig?.maxTokens || undefined,
          stream: true,
        });

        // Send initial quota status
        const quotaStatus = {
          tier: subscriptionTier,
          usage: {
            requests: todayUsage._count + 1,
            tokens: todayUsage._sum.totalTokens || 0,
            cost: Number(todayUsage._sum.cost || 0),
          },
          limits: userLimits,
          remaining: {
            requests: userLimits.dailyRequests - (todayUsage._count + 1),
            tokens: userLimits.dailyTokens - (todayUsage._sum.totalTokens || 0),
            cost: userLimits.dailyCost - Number(todayUsage._sum.cost || 0),
          },
          resetAt: new Date(today.getTime() + 24 * 60 * 60 * 1000).toISOString(),
        };

        await writer.write(
          encoder.encode(`data: ${JSON.stringify({ type: 'quota', quotaStatus })}\n\n`)
        );

        for await (const chunk of completion) {
          const content = chunk.choices[0]?.delta?.content || '';
          if (content) {
            // Format as Server-Sent Events
            const data = JSON.stringify({ type: 'content', content });
            await writer.write(encoder.encode(`data: ${data}\n\n`));
          }

          // Track token usage from chunks if available
          if (chunk.usage) {
            promptTokens = chunk.usage.prompt_tokens || promptTokens;
            completionTokens = chunk.usage.completion_tokens || completionTokens;
            totalTokens = chunk.usage.total_tokens || totalTokens;
          }

          // Check if stream is finished
          if (chunk.choices[0]?.finish_reason) {
            // Send completion signal without closing the stream yet
            try {
              await writer.write(encoder.encode(`data: ${JSON.stringify({ type: 'done', finish_reason: chunk.choices[0].finish_reason })}\n\n`));
              await writer.write(encoder.encode(`data: [DONE]\n\n`));
            } catch (writeError) {
              console.error('Error writing completion to stream:', writeError);
            }
            break;
          }
        }

        // Estimate tokens if not provided (rough estimation)
        if (totalTokens === 0) {
          // Rough estimation: ~4 characters per token
          const messageText = messages.map(m => m.content).join(' ');
          promptTokens = Math.ceil(messageText.length / 4);
          // Assume similar length for completion
          completionTokens = promptTokens;
          totalTokens = promptTokens + completionTokens;
        }

        // Calculate cost
        const cost = calculateCost(model, promptTokens, completionTokens);

        // Log usage for billing
        await prisma.aIUsage.create({
          data: {
            userId,
            model: systemAzureConfig ? systemAzureConfig.modelName : model,
            inputTokens: promptTokens,
            outputTokens: completionTokens,
            totalTokens: totalTokens,
            cost,
          },
        });

      } catch (error) {
        console.error('OpenAI streaming error:', error);
        // Only write error if stream is still open
        if (writer.desiredSize !== null) {
          try {
            await writer.write(
              encoder.encode(`data: ${JSON.stringify({ type: 'error', error: 'Stream failed' })}\n\n`)
            );
          } catch (writeError) {
            console.error('Error writing to closed stream:', writeError);
          }
        }
      } finally {
        // Only close if the writer hasn't been closed yet
        if (writer.desiredSize !== null) {
          try {
            await writer.close();
          } catch (closeError) {
            console.error('Error closing writer:', closeError);
          }
        }
      }
    })();

    return response;
  } catch (error) {
    console.error('Chat stream error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to process chat stream',
      },
      { status: 500 }
    );
  }
}

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