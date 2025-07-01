import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    // This endpoint should be protected - only allow internal calls or admin users
    const authHeader = request.headers.get('authorization');
    const internalSecret = process.env.INTERNAL_API_SECRET;
    
    // Simple protection - in production, use proper authentication
    if (authHeader !== `Bearer ${internalSecret}` && internalSecret) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Delete expired sessions
    const expiredSessions = await prisma.session.deleteMany({
      where: {
        OR: [
          { expiresAt: { lt: new Date() } },
          { invalidatedAt: { not: null } }
        ]
      }
    });

    // Also clean up sessions older than 30 days regardless of expiration
    const oldSessions = await prisma.session.deleteMany({
      where: {
        createdAt: { lt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }
      }
    });

    return NextResponse.json({
      success: true,
      cleaned: {
        expired: expiredSessions.count,
        old: oldSessions.count,
        total: expiredSessions.count + oldSessions.count
      }
    });
  } catch (error) {
    console.error('Session cleanup error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Allow GET for easier manual triggering during development
export async function GET(request: NextRequest) {
  return POST(request);
}