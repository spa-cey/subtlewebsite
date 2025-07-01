import { NextRequest, NextResponse } from 'next/server';
import { clearAuthCookies } from '@/lib/auth-utils';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    // Get refresh token from cookie to invalidate the session
    const refreshToken = request.cookies.get('refreshToken')?.value;
    
    if (refreshToken) {
      // Invalidate the session in database
      await prisma.session.updateMany({
        where: { refreshToken },
        data: { invalidatedAt: new Date() },
      });
    }

    // Create response
    const response = NextResponse.json({
      success: true,
      message: 'Logged out successfully',
    });

    // Clear auth cookies
    response.cookies.delete('accessToken');
    response.cookies.delete('refreshToken');

    return response;
  } catch (error) {
    console.error('Logout error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error',
      },
      { status: 500 }
    );
  }
}