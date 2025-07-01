import { NextRequest, NextResponse } from 'next/server';
import { verifyPassword, setAuthCookies } from '@/lib/auth-utils';
import { generateAccessToken, generateRefreshToken } from '@/lib/auth-utils-edge';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        {
          success: false,
          error: 'Email and password are required',
        },
        { status: 400 }
      );
    }

    // Find user
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid email or password',
        },
        { status: 401 }
      );
    }

    // Check password
    const isValidPassword = await verifyPassword(password, user.passwordHash);

    if (!isValidPassword) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid email or password',
        },
        { status: 401 }
      );
    }

    // Update last sign in time
    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: { lastSignInAt: new Date() },
    });

    // Generate tokens
    const accessToken = await generateAccessToken({
      userId: updatedUser.id,
      email: updatedUser.email,
      role: updatedUser.role || 'user',
    });

    const refreshToken = await generateRefreshToken({
      userId: updatedUser.id,
      email: updatedUser.email,
      role: updatedUser.role || 'user',
    });

    // Create response with user data
    const response = NextResponse.json({
      success: true,
      user: {
        id: updatedUser.id,
        email: updatedUser.email,
        fullName: updatedUser.fullName,
        avatarUrl: updatedUser.avatarUrl,
        subscriptionTier: updatedUser.subscriptionTier,
        emailVerified: updatedUser.emailVerified,
        lastSignInAt: updatedUser.lastSignInAt?.toISOString(),
        createdAt: updatedUser.createdAt.toISOString(),
        updatedAt: updatedUser.updatedAt.toISOString(),
      },
      tokens: {
        accessToken,
        refreshToken,
      },
    });

    // Set HTTP-only cookies
    response.cookies.set('accessToken', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 15 * 60, // 15 minutes
      path: '/',
    });

    response.cookies.set('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60, // 7 days
      path: '/',
    });

    return response;
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error',
      },
      { status: 500 }
    );
  }
}