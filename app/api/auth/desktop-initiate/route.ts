import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { randomBytes } from 'crypto';

export async function POST(request: NextRequest) {
  try {
    const { deviceName, deviceId } = await request.json();

    if (!deviceName || !deviceId) {
      return NextResponse.json(
        {
          success: false,
          error: 'Device name and ID are required',
        },
        { status: 400 }
      );
    }

    // Generate a unique auth code for desktop pairing
    const authCode = randomBytes(16).toString('hex');
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

    // Store the auth request in database
    // In a real implementation, you'd have a DesktopAuthRequest model
    // For now, we'll simulate it
    const authRequest = {
      id: randomBytes(16).toString('hex'),
      authCode,
      deviceName,
      deviceId,
      expiresAt,
      status: 'pending',
      createdAt: new Date(),
    };

    // In production, store this in database
    // await prisma.desktopAuthRequest.create({ data: authRequest });

    return NextResponse.json({
      success: true,
      authCode,
      expiresAt: expiresAt.toISOString(),
      // URL for user to visit in browser to authorize
      authorizationUrl: `${process.env.NEXT_PUBLIC_APP_URL}/auth/desktop?code=${authCode}`,
    });
  } catch (error) {
    console.error('Desktop auth initiation error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to initiate desktop authentication',
      },
      { status: 500 }
    );
  }
}