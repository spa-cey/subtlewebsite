import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from '@/lib/auth-utils';
import { prisma } from '@/lib/prisma';
import OpenAI from 'openai';

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession();
    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { messages, model = 'gpt-4', temperature = 0.7 } = await request.json();

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json(
        { success: false, error: 'Messages array is required' },
        { status: 400 }
      );
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
      try {
        const completion = await openai.chat.completions.create({
          model,
          messages,
          temperature,
          stream: true,
        });

        for await (const chunk of completion) {
          const content = chunk.choices[0]?.delta?.content || '';
          if (content) {
            // Format as Server-Sent Events
            const data = JSON.stringify({ content });
            await writer.write(encoder.encode(`data: ${data}\n\n`));
          }

          // Check if stream is finished
          if (chunk.choices[0]?.finish_reason) {
            await writer.write(encoder.encode(`data: [DONE]\n\n`));
            break;
          }
        }

        // Log usage for billing
        // In production, you'd track token usage here
        // await prisma.aiUsage.create({
        //   data: {
        //     userId: session.user.id,
        //     model,
        //     promptTokens: completion.usage?.prompt_tokens || 0,
        //     completionTokens: completion.usage?.completion_tokens || 0,
        //     totalTokens: completion.usage?.total_tokens || 0,
        //   },
        // });

      } catch (error) {
        console.error('OpenAI streaming error:', error);
        await writer.write(
          encoder.encode(`data: ${JSON.stringify({ error: 'Stream failed' })}\n\n`)
        );
      } finally {
        await writer.close();
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