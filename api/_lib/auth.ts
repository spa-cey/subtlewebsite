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
  const accessToken = jwt.sign({ userId }, JWT_SECRET, { expiresIn: '1h' });
  const refreshToken = jwt.sign({ userId, type: 'refresh' }, JWT_SECRET, { expiresIn: '7d' });
  
  return {
    accessToken,
    refreshToken,
    expiresIn: 3600 // 1 hour in seconds
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
      where: { id: decoded.userId }
    });

    if (!user) {
      res.status(401).json({ success: false, error: 'Invalid token' });
      return false;
    }

    req.user = { id: user.id, email: user.email };
    return true;
  } catch (error) {
    res.status(401).json({ success: false, error: 'Invalid token' });
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