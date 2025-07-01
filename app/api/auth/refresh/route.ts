import { NextRequest, NextResponse } from 'next/server';
import { verifyRefreshToken, generateAccessToken, generateRefreshToken } from '@/lib/auth-utils-edge';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    // Get refresh token from cookie or body
    const refreshTokenFromCookie = request.cookies.get('refreshToken')?.value;
    const { refreshToken: refreshTokenFromBody } = await request.json().catch(() => ({}));
    const refreshToken = refreshTokenFromCookie || refreshTokenFromBody;

    if (!refreshToken) {
      return NextResponse.json(
        {
          success: false,
          error: 'Refresh token is required',
        },
        { status: 400 }
      );
    }

    // Verify refresh token
    let decoded;
    try {
      decoded = await verifyRefreshToken(refreshToken);
    } catch (error) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid or expired refresh token',
        },
        { status: 401 }
      );
    }

    // Check if refresh token exists and is not invalidated in database
    const session = await prisma.session.findUnique({
      where: { refreshToken },
    });

    if (!session || session.invalidatedAt || session.expiresAt < new Date()) {
      return NextResponse.json(
        {
          success: false,
          error: 'Session expired or invalidated',
        },
        { status: 401 }
      );
    }

    // Get user
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
    });

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          error: 'User not found',
        },
        { status: 404 }
      );
    }

    // Generate new tokens
    const newAccessToken = await generateAccessToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    const newRefreshToken = await generateRefreshToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    // Invalidate old session and create new one
    await prisma.session.update({
      where: { refreshToken },
      data: { invalidatedAt: new Date() },
    });

    // Create new session
    await prisma.session.create({
      data: {
        userId: user.id,
        refreshToken: newRefreshToken,
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
      },
    });

    // Create response
    const response = NextResponse.json({
      success: true,
      tokens: {
        accessToken: newAccessToken,
        refreshToken: newRefreshToken,
        expiresIn: 7 * 24 * 60 * 60, // 7 days in seconds
      },
    });

    // Update cookies
    response.cookies.set('accessToken', newAccessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60, // 7 days to match token expiration
      path: '/',
    });

    response.cookies.set('refreshToken', newRefreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 30 * 24 * 60 * 60, // 30 days to match token expiration
      path: '/',
    });

    return response;
  } catch (error) {
    console.error('Token refresh error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error',
      },
      { status: 500 }
    );
  }
}