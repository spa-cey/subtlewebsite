import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { generateAccessToken, generateRefreshToken } from '@/lib/auth-utils-edge';

export async function POST(request: NextRequest) {
  try {
    const { authCode, deviceId } = await request.json();

    if (!authCode || !deviceId) {
      return NextResponse.json(
        {
          success: false,
          error: 'Auth code and device ID are required',
        },
        { status: 400 }
      );
    }

    // In a real implementation, verify the auth code from database
    // const authRequest = await prisma.desktopAuthRequest.findFirst({
    //   where: {
    //     authCode,
    //     deviceId,
    //     status: 'approved',
    //     expiresAt: { gt: new Date() },
    //   },
    //   include: { user: true },
    // });

    // For demo purposes, we'll simulate a successful auth
    // In production, you'd validate the auth code and get the associated user
    const mockUser = {
      id: 'demo-user-id',
      email: 'demo@example.com',
      role: 'user',
    };

    if (!mockUser) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid or expired auth code',
        },
        { status: 401 }
      );
    }

    // Generate tokens for the desktop app
    const accessToken = await generateAccessToken({
      userId: mockUser.id,
      email: mockUser.email,
      role: mockUser.role as string,
    });

    const refreshToken = await generateRefreshToken({
      userId: mockUser.id,
      email: mockUser.email,
      role: mockUser.role as string,
    });

    // Mark auth request as completed
    // await prisma.desktopAuthRequest.update({
    //   where: { id: authRequest.id },
    //   data: { status: 'completed' },
    // });

    return NextResponse.json({
      success: true,
      tokens: {
        accessToken,
        refreshToken,
      },
      user: {
        id: mockUser.id,
        email: mockUser.email,
        role: mockUser.role,
      },
    });
  } catch (error) {
    console.error('Desktop auth exchange error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to complete desktop authentication',
      },
      { status: 500 }
    );
  }
}