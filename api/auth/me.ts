import { VercelRequest, VercelResponse } from '@vercel/node';
import { prisma } from '../_lib/prisma';
import { AuthenticatedRequest, authenticateToken } from '../_lib/auth';
import { handleCors } from '../_lib/cors';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Handle CORS
  if (!handleCors(req, res)) return;

  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  // Authenticate request
  if (!await authenticateToken(req as AuthenticatedRequest, res)) {
    return;
  }

  try {
    const authenticatedReq = req as AuthenticatedRequest;
    const user = await prisma.user.findUnique({
      where: { id: authenticatedReq.user!.id }
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    res.status(200).json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        avatarUrl: user.avatarUrl,
        subscriptionTier: user.subscriptionTier,
        emailVerified: user.emailVerified,
        lastSignInAt: user.lastSignInAt?.toISOString(),
        createdAt: user.createdAt.toISOString(),
        updatedAt: user.updatedAt.toISOString()
      }
    });

  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
}