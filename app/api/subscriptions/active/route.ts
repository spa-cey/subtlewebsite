import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyJWT } from '@/lib/auth-utils-edge';

export async function GET(request: NextRequest) {
  try {
    // Get auth token from header or cookie
    const authHeader = request.headers.get('authorization');
    const token = authHeader?.replace('Bearer ', '') || request.cookies.get('accessToken')?.value;

    if (!token) {
      return new NextResponse('Authentication required', { status: 401 });
    }

    // Verify the token
    let decoded;
    try {
      decoded = await verifyJWT(token);
    } catch (error) {
      return new NextResponse('Invalid token', { status: 401 });
    }

    // Get user_id from query params
    const { searchParams } = new URL(request.url);
    const userIdParam = searchParams.get('user_id');
    
    // Use user_id from query params if provided, otherwise from token
    const userId = userIdParam || decoded.userId;

    if (!userId) {
      return new NextResponse('User ID is required', { status: 400 });
    }

    // Get user with their subscription info
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        subscriptionTier: true,
        createdAt: true,
      },
    });

    if (!user) {
      // Return empty array for user not found
      return NextResponse.json([]);
    }

    // Map database subscription tier to Mac app format
    const tierMapping: Record<string, string> = {
      free: 'free',
      pro: 'pro',
      enterprise: 'enterprise',
    };

    // Create subscription info matching Mac app's SubscriptionInfo struct
    const subscriptionInfo = {
      id: `sub_${user.id}`,
      userId: user.id,
      tier: tierMapping[user.subscriptionTier] || 'free',
      status: 'active',
      createdAt: user.createdAt.toISOString(),
      renewsAt: null,
      cancelledAt: null,
      paymentMethod: null,
      metadata: {
        source: 'website',
      },
    };

    // Return array of subscriptions (even though we only have one)
    return NextResponse.json([subscriptionInfo]);
  } catch (error) {
    console.error('Get active subscriptions error:', error);
    return new NextResponse('Internal server error', { status: 500 });
  }
}