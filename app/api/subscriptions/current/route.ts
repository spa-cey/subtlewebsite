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
      // Return 404 with no body for user not found
      return new NextResponse(null, { status: 404 });
    }

    // Map database subscription tier to Mac app format
    const tierMapping: Record<string, string> = {
      free: 'free',
      pro: 'pro',
      enterprise: 'enterprise',
    };

    // Create subscription info response matching Mac app's SubscriptionInfo struct
    const subscriptionInfo = {
      id: `sub_${user.id}`, // Generate a subscription ID
      userId: user.id,
      tier: tierMapping[user.subscriptionTier] || 'free',
      status: 'active', // Always active for now since we don't track expiry yet
      createdAt: user.createdAt.toISOString(),
      renewsAt: null, // No renewal tracking yet
      cancelledAt: null,
      paymentMethod: null,
      metadata: {
        source: 'website',
      },
    };

    // Return subscription info directly (not wrapped) as expected by Mac app
    return NextResponse.json(subscriptionInfo);
  } catch (error) {
    console.error('Get subscription error:', error);
    return new NextResponse('Internal server error', { status: 500 });
  }
}