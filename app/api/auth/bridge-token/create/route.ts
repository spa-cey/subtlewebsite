import { NextRequest, NextResponse } from 'next/server';
import { verifyJWT } from '@/lib/auth-utils-edge';
import { prisma } from '@/lib/prisma';
import crypto from 'crypto';

export async function POST(request: NextRequest) {
  try {
    // Get access token from Authorization header or cookie
    const authHeader = request.headers.get('Authorization');
    const token = authHeader?.replace('Bearer ', '') || 
                 request.cookies.get('accessToken')?.value;
    
    if (!token) {
      return NextResponse.json(
        { success: false, error: 'No authentication token provided' },
        { status: 401 }
      );
    }

    // Verify the token
    let payload;
    try {
      payload = await verifyJWT(token);
    } catch (error) {
      return NextResponse.json(
        { success: false, error: 'Invalid or expired token' },
        { status: 401 }
      );
    }

    // Parse request body
    const body = await request.json();
    const {
      bridge_token,
      access_token,
      refresh_token,
      device_info,
      ip_address,
      user_agent
    } = body;

    // Validate required fields
    if (!bridge_token || !access_token || !refresh_token) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Check if user matches the token
    if (payload.userId !== body.user_id) {
      return NextResponse.json(
        { success: false, error: 'User ID mismatch' },
        { status: 403 }
      );
    }

    // Store the bridge token with expiration (5 minutes)
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000);
    
    await prisma.bridgeToken.create({
      data: {
        token: bridge_token,
        userId: payload.userId,
        accessToken: access_token,
        refreshToken: refresh_token,
        deviceInfo: device_info || {},
        ipAddress: ip_address || 'unknown',
        userAgent: user_agent || 'unknown',
        expiresAt,
        usedAt: null
      }
    });

    // Clean up expired bridge tokens
    await prisma.bridgeToken.deleteMany({
      where: {
        expiresAt: { lt: new Date() }
      }
    });

    return NextResponse.json({
      success: true,
      expiresAt: expiresAt.toISOString()
    });

  } catch (error) {
    console.error('Bridge token creation error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}