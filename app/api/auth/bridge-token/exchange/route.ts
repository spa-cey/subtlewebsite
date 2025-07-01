import { NextRequest, NextResponse } from 'next/server';
import { setAuthCookies } from '@/lib/auth-utils';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const { bridge_token } = await request.json();

    if (!bridge_token) {
      return NextResponse.json(
        { success: false, error: 'Bridge token is required' },
        { status: 400 }
      );
    }

    // Find the bridge token
    const bridgeTokenRecord = await prisma.bridgeToken.findUnique({
      where: { token: bridge_token },
      include: { user: true }
    });

    if (!bridgeTokenRecord) {
      return NextResponse.json(
        { success: false, error: 'Invalid bridge token' },
        { status: 401 }
      );
    }

    // Check if token is expired
    if (bridgeTokenRecord.expiresAt < new Date()) {
      await prisma.bridgeToken.delete({
        where: { id: bridgeTokenRecord.id }
      });
      
      return NextResponse.json(
        { success: false, error: 'Bridge token has expired' },
        { status: 401 }
      );
    }

    // Check if token has already been used
    if (bridgeTokenRecord.usedAt) {
      return NextResponse.json(
        { success: false, error: 'Bridge token has already been used' },
        { status: 401 }
      );
    }

    // Mark token as used
    await prisma.bridgeToken.update({
      where: { id: bridgeTokenRecord.id },
      data: { usedAt: new Date() }
    });

    // Create response with user data
    const response = NextResponse.json({
      success: true,
      user: {
        id: bridgeTokenRecord.user.id,
        email: bridgeTokenRecord.user.email,
        fullName: bridgeTokenRecord.user.fullName,
        avatarUrl: bridgeTokenRecord.user.avatarUrl,
        subscriptionTier: bridgeTokenRecord.user.subscriptionTier,
        emailVerified: bridgeTokenRecord.user.emailVerified,
        lastSignInAt: bridgeTokenRecord.user.lastSignInAt?.toISOString(),
        createdAt: bridgeTokenRecord.user.createdAt.toISOString(),
        updatedAt: bridgeTokenRecord.user.updatedAt.toISOString(),
      }
    });

    // Set auth cookies using the stored tokens
    response.cookies.set('accessToken', bridgeTokenRecord.accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60, // 7 days
      path: '/',
    });

    response.cookies.set('refreshToken', bridgeTokenRecord.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 30 * 24 * 60 * 60, // 30 days
      path: '/',
    });

    // Update user's last sign in
    await prisma.user.update({
      where: { id: bridgeTokenRecord.userId },
      data: { lastSignInAt: new Date() }
    });

    // Clean up the used token
    await prisma.bridgeToken.delete({
      where: { id: bridgeTokenRecord.id }
    });

    return response;

  } catch (error) {
    console.error('Bridge token exchange error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}