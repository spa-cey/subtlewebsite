import { Router, Request, Response } from 'express';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import { prisma } from '../db/index';
import { authenticateToken } from '../middleware/index';

const router = Router();

// Temporary auth codes storage (in production, use Redis or database)
const authCodes = new Map<string, {
  userId: string;
  state: string;
  createdAt: Date;
  expiresAt: Date;
}>();

// JWT configuration
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
const AUTH_CODE_EXPIRES_IN = 5 * 60 * 1000; // 5 minutes

// Schema for initiating desktop auth
const initiateAuthSchema = z.object({
  state: z.string().min(1),
  redirectUri: z.string().url().refine(url => url.startsWith('subtle://'), {
    message: 'Redirect URI must use subtle:// scheme'
  })
});

// Schema for exchanging auth code
const exchangeCodeSchema = z.object({
  code: z.string().min(1),
  state: z.string().min(1)
});

// POST /api/auth/desktop/initiate - Generate auth code for logged-in user
router.post('/initiate', authenticateToken, async (req: Request, res: Response): Promise<Response> => {
  try {
    const validatedData = initiateAuthSchema.parse(req.body);
    const userId = req.user!.id;

    // Generate secure auth code
    const authCode = crypto.randomBytes(32).toString('hex');
    
    // Store auth code with expiration
    authCodes.set(authCode, {
      userId,
      state: validatedData.state,
      createdAt: new Date(),
      expiresAt: new Date(Date.now() + AUTH_CODE_EXPIRES_IN)
    });

    // Clean up expired codes
    cleanupExpiredCodes();

    return res.json({
      success: true,
      authCode,
      expiresIn: AUTH_CODE_EXPIRES_IN / 1000, // seconds
      redirectUri: validatedData.redirectUri
    });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: 'Invalid request data',
        details: error.errors
      });
    }

    console.error('Initiate desktop auth error:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to initiate desktop authentication'
    });
  }
});

// POST /api/auth/desktop/exchange - Exchange auth code for tokens
router.post('/exchange', async (req: Request, res: Response): Promise<Response> => {
  try {
    const validatedData = exchangeCodeSchema.parse(req.body);
    
    // Get auth code data
    const authCodeData = authCodes.get(validatedData.code);
    
    if (!authCodeData) {
      return res.status(400).json({
        success: false,
        error: 'Invalid or expired auth code'
      });
    }

    // Verify state matches
    if (authCodeData.state !== validatedData.state) {
      return res.status(400).json({
        success: false,
        error: 'State parameter mismatch'
      });
    }

    // Check if code is expired
    if (new Date() > authCodeData.expiresAt) {
      authCodes.delete(validatedData.code);
      return res.status(400).json({
        success: false,
        error: 'Auth code has expired'
      });
    }

    // Delete code after use (one-time use)
    authCodes.delete(validatedData.code);

    // Get user data
    const user = await prisma.user.findUnique({
      where: { id: authCodeData.userId }
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    // Update last sign in
    await prisma.user.update({
      where: { id: user.id },
      data: { lastSignInAt: new Date() }
    });

    // Generate tokens
    const accessToken = jwt.sign(
      { userId: user.id },
      JWT_SECRET,
      { expiresIn: '1h' }
    );

    const refreshToken = jwt.sign(
      { userId: user.id, type: 'refresh' },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    // Create session record
    await prisma.session.create({
      data: {
        userId: user.id,
        refreshToken,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days
      }
    });

    return res.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        avatarUrl: user.avatarUrl,
        subscriptionTier: user.subscriptionTier,
        emailVerified: user.emailVerified,
        createdAt: user.createdAt.toISOString(),
        updatedAt: user.updatedAt.toISOString()
      },
      tokens: {
        accessToken,
        refreshToken,
        expiresIn: 3600 // 1 hour in seconds
      }
    });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: 'Invalid request data',
        details: error.errors
      });
    }

    console.error('Exchange auth code error:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to exchange auth code'
    });
  }
});

// GET /api/auth/desktop/verify - Verify desktop session
router.get('/verify', authenticateToken, async (req: Request, res: Response): Promise<Response> => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user!.id }
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    return res.json({
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
    console.error('Verify desktop session error:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to verify session'
    });
  }
});

// Helper function to clean up expired auth codes
function cleanupExpiredCodes() {
  const now = new Date();
  for (const [code, data] of authCodes.entries()) {
    if (now > data.expiresAt) {
      authCodes.delete(code);
    }
  }
}

// Clean up expired codes every minute
setInterval(cleanupExpiredCodes, 60 * 1000);

export default router;