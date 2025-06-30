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
    const userId = authenticatedReq.user!.id;

    // Get user
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    // Get current month's usage
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const usage = await prisma.aIUsage.aggregate({
      where: {
        userId,
        createdAt: {
          gte: startOfMonth
        }
      },
      _sum: {
        totalTokens: true,
        cost: true
      },
      _count: {
        id: true
      }
    });

    // Define quotas based on subscription tier
    const quotas = {
      free: { tokens: 100000, cost: 5 },
      basic: { tokens: 1000000, cost: 50 },
      pro: { tokens: 5000000, cost: 250 },
      enterprise: { tokens: -1, cost: -1 } // Unlimited
    };

    const userQuota = quotas[user.subscriptionTier as keyof typeof quotas] || quotas.free;

    res.status(200).json({
      success: true,
      quota: {
        tier: user.subscriptionTier,
        limits: {
          tokens: userQuota.tokens,
          cost: userQuota.cost
        },
        usage: {
          tokens: usage._sum.totalTokens || 0,
          cost: usage._sum.cost || 0,
          requests: usage._count.id || 0
        },
        remaining: {
          tokens: userQuota.tokens === -1 ? -1 : Math.max(0, userQuota.tokens - (usage._sum.totalTokens || 0)),
          cost: userQuota.cost === -1 ? -1 : Math.max(0, userQuota.cost - (usage._sum.cost || 0))
        },
        periodStart: startOfMonth.toISOString(),
        periodEnd: new Date(startOfMonth.getFullYear(), startOfMonth.getMonth() + 1, 0).toISOString()
      }
    });

  } catch (error) {
    console.error('Quota check error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
}