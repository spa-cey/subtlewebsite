import { VercelRequest, VercelResponse } from '@vercel/node';
import jwt from 'jsonwebtoken';
import { prisma } from './prisma-init';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export interface AuthenticatedRequest extends VercelRequest {
  user?: {
    id: string;
    email: string;
  };
}

export function generateTokens(userId: string) {
  const accessToken = jwt.sign({ userId }, JWT_SECRET, { expiresIn: '7d' });
  const refreshToken = jwt.sign({ userId, type: 'refresh' }, JWT_SECRET, { expiresIn: '30d' });
  
  return {
    accessToken,
    refreshToken,
    expiresIn: 7 * 24 * 60 * 60 // 7 days in seconds
  };
}

export async function authenticateToken(
  req: AuthenticatedRequest,
  res: VercelResponse
): Promise<boolean> {
  const authHeader = req.headers.authorization;
  const token = authHeader?.split(' ')[1];

  if (!token) {
    res.status(401).json({ success: false, error: 'No token provided' });
    return false;
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };
    
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      include: {
        sessions: {
          where: {
            invalidatedAt: null,
            expiresAt: {
              gt: new Date()
            }
          },
          take: 1
        }
      }
    });

    if (!user) {
      console.log('[Auth] User not found for token:', decoded.userId);
      res.status(401).json({ success: false, error: 'User not found' });
      return false;
    }

    req.user = { id: user.id, email: user.email };
    return true;
  } catch (error) {
    console.log('[Auth] Token verification failed:', error);
    if (error instanceof jwt.TokenExpiredError) {
      res.status(401).json({ success: false, error: 'Token expired', code: 'TOKEN_EXPIRED' });
    } else if (error instanceof jwt.JsonWebTokenError) {
      res.status(401).json({ success: false, error: 'Invalid token', code: 'INVALID_TOKEN' });
    } else {
      res.status(401).json({ success: false, error: 'Authentication failed', code: 'AUTH_FAILED' });
    }
    return false;
  }
}

export async function requireAdmin(
  req: AuthenticatedRequest,
  res: VercelResponse
): Promise<boolean> {
  if (!await authenticateToken(req, res)) {
    return false;
  }

  const adminEmail = process.env.ADMIN_EMAIL || 'admin@gosubtle.app';
  
  if (req.user?.email !== adminEmail) {
    res.status(403).json({ success: false, error: 'Admin access required' });
    return false;
  }

  return true;
}