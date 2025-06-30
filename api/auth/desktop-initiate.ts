import { VercelRequest, VercelResponse } from '@vercel/node';
import crypto from 'crypto';
import { z } from 'zod';
import { AuthenticatedRequest, authenticateToken } from '../_lib/auth';
import { handleCors } from '../_lib/cors';
import { storeAuthCode } from '../_lib/auth-codes';

const initiateSchema = z.object({
  state: z.string().min(1)
});

const AUTH_CODE_EXPIRES_IN = 5 * 60 * 1000; // 5 minutes

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Handle CORS
  if (!handleCors(req, res)) return;

  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  // Authenticate request
  if (!await authenticateToken(req as AuthenticatedRequest, res)) {
    return;
  }

  try {
    const authenticatedReq = req as AuthenticatedRequest;
    const validatedData = initiateSchema.parse(req.body);

    // Generate secure auth code
    const authCode = crypto.randomBytes(32).toString('hex');

    // Store auth code with user info
    await storeAuthCode(authCode, {
      userId: authenticatedReq.user!.id,
      state: validatedData.state,
      createdAt: new Date(),
      expiresAt: new Date(Date.now() + AUTH_CODE_EXPIRES_IN)
    });

    // Generate auth URL
    const authUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/auth/desktop?code=${authCode}&state=${encodeURIComponent(validatedData.state)}`;

    res.status(200).json({
      success: true,
      authUrl,
      expiresIn: AUTH_CODE_EXPIRES_IN / 1000 // in seconds
    });

  } catch (error: any) {
    console.error('Desktop auth initiate error:', error);
    
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