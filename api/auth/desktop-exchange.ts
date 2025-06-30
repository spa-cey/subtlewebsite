import { VercelRequest, VercelResponse } from '@vercel/node';
import { z } from 'zod';
import { prisma } from '../_lib/prisma';
import { generateTokens } from '../_lib/auth';
import { handleCors } from '../_lib/cors';
import { getAuthCode, deleteAuthCode } from '../_lib/auth-codes';

const exchangeSchema = z.object({
  code: z.string().min(1),
  state: z.string().min(1)
});

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Handle CORS
  if (!handleCors(req, res)) return;

  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  try {
    const validatedData = exchangeSchema.parse(req.body);

    // Validate auth code
    const authData = await getAuthCode(validatedData.code);
    
    if (!authData) {
      return res.status(401).json({
        success: false,
        error: 'Invalid or expired authorization code'
      });
    }

    // Validate state parameter
    if (authData.state !== validatedData.state) {
      await deleteAuthCode(validatedData.code);
      return res.status(401).json({
        success: false,
        error: 'Invalid state parameter'
      });
    }

    // Check expiration
    if (authData.expiresAt < new Date()) {
      await deleteAuthCode(validatedData.code);
      return res.status(401).json({
        success: false,
        error: 'Authorization code has expired'
      });
    }

    // Delete the auth code (one-time use)
    await deleteAuthCode(validatedData.code);

    // Get user
    const user = await prisma.user.findUnique({
      where: { id: authData.userId }
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    // Generate tokens
    const tokens = generateTokens(user.id);

    res.status(200).json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        avatarUrl: user.avatarUrl,
        subscriptionTier: user.subscriptionTier,
        emailVerified: user.emailVerified
      },
      tokens
    });

  } catch (error: any) {
    console.error('Desktop auth exchange error:', error);
    
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: 'Invalid request data',
        details: error.errors
      });
    }

    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
}