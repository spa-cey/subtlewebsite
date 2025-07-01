import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from '@/lib/auth-utils';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession();
    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get user's subscription tier
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        subscriptionTier: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }

    // Define quota limits by tier
    const quotaLimits = {
      free: {
        dailyRequests: 5,
        monthlyTokens: 10000,
        maxTokensPerRequest: 100,
        models: ['gpt-3.5-turbo'],
      },
      pro: {
        dailyRequests: -1, // unlimited
        monthlyTokens: 1000000,
        maxTokensPerRequest: 4000,
        models: ['gpt-3.5-turbo', 'gpt-4', 'gpt-4-vision-preview'],
      },
      enterprise: {
        dailyRequests: -1,
        monthlyTokens: -1, // unlimited
        maxTokensPerRequest: 8000,
        models: ['gpt-3.5-turbo', 'gpt-4', 'gpt-4-vision-preview', 'gpt-4-turbo'],
      },
      admin: {
        dailyRequests: -1,
        monthlyTokens: -1,
        maxTokensPerRequest: -1, // unlimited
        models: ['gpt-3.5-turbo', 'gpt-4', 'gpt-4-vision-preview', 'gpt-4-turbo', 'gpt-4-turbo-preview'],
      },
    };

    const tier = user.subscriptionTier || 'free';
    const limits = quotaLimits[tier as keyof typeof quotaLimits];

    // Get current usage (mock data for demo)
    // In production, you'd query actual usage from database
    const now = new Date();
    const startOfDay = new Date(now.setHours(0, 0, 0, 0));
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    // Mock usage data
    const usage = {
      dailyRequests: 3,
      monthlyTokens: 5432,
      lastReset: startOfDay.toISOString(),
      nextReset: new Date(startOfDay.getTime() + 24 * 60 * 60 * 1000).toISOString(),
    };

    // Calculate remaining quota
    const remaining = {
      dailyRequests: limits.dailyRequests === -1 ? -1 : limits.dailyRequests - usage.dailyRequests,
      monthlyTokens: limits.monthlyTokens === -1 ? -1 : limits.monthlyTokens - usage.monthlyTokens,
    };

    return NextResponse.json({
      success: true,
      quota: {
        tier,
        limits,
        usage,
        remaining,
        isActive: true, // Always active for now
        expiresAt: null,
      },
    });
  } catch (error) {
    console.error('Quota check error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to check quota',
      },
      { status: 500 }
    );
  }
}