import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from '@/lib/auth-utils';
import { prisma } from '@/lib/prisma';
import OpenAI from 'openai';

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

    const formData = await request.formData();
    const image = formData.get('image') as File;
    const prompt = formData.get('prompt') as string || 'What is in this image?';

    if (!image) {
      return NextResponse.json(
        { success: false, error: 'Image is required' },
        { status: 400 }
      );
    }

    // Validate image size (max 20MB for GPT-4 Vision)
    if (image.size > 20 * 1024 * 1024) {
      return NextResponse.json(
        { success: false, error: 'Image size must be less than 20MB' },
        { status: 400 }
      );
    }

    // Convert image to base64
    const bytes = await image.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const base64Image = buffer.toString('base64');
    const dataUrl = `data:${image.type};base64,${base64Image}`;

    // Call OpenAI Vision API
    const completion = await openai.chat.completions.create({
      model: 'gpt-4-vision-preview',
      messages: [
        {
          role: 'user',
          content: [
            { type: 'text', text: prompt },
            { type: 'image_url', image_url: { url: dataUrl } },
          ],
        },
      ],
      max_tokens: 1000,
    });

    const analysis = completion.choices[0]?.message?.content || 'No analysis available';

    // Log usage for billing
    // await prisma.aiUsage.create({
    //   data: {
    //     userId: session.user.id,
    //     model: 'gpt-4-vision-preview',
    //     promptTokens: completion.usage?.prompt_tokens || 0,
    //     completionTokens: completion.usage?.completion_tokens || 0,
    //     totalTokens: completion.usage?.total_tokens || 0,
    //     metadata: { imageSize: image.size, imageType: image.type },
    //   },
    // });

    return NextResponse.json({
      success: true,
      analysis,
      usage: {
        promptTokens: completion.usage?.prompt_tokens || 0,
        completionTokens: completion.usage?.completion_tokens || 0,
        totalTokens: completion.usage?.total_tokens || 0,
      },
    });
  } catch (error) {
    console.error('Image analysis error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to analyze image',
      },
      { status: 500 }
    );
  }
}

// Set max file size for Next.js
export const config = {
  api: {
    bodyParser: {
      sizeLimit: '20mb',
    },
  },
};