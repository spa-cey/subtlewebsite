import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt, { SignOptions } from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';

const router = Router();
const prisma = new PrismaClient();

// JWT configuration
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
const JWT_EXPIRES_IN: string | number = process.env.JWT_EXPIRES_IN || '1h';
const JWT_REFRESH_EXPIRES_IN: string | number = process.env.JWT_REFRESH_EXPIRES_IN || '7d';

// Helper function to generate tokens
function generateTokens(userId: string) {
  const accessTokenOptions: SignOptions = { expiresIn: JWT_EXPIRES_IN as any };
  const refreshTokenOptions: SignOptions = { expiresIn: JWT_REFRESH_EXPIRES_IN as any };
  
  const accessToken = jwt.sign({ userId }, JWT_SECRET, accessTokenOptions);
  const refreshToken = jwt.sign({ userId, type: 'refresh' }, JWT_SECRET, refreshTokenOptions);
  
  return {
    accessToken,
    refreshToken,
    expiresIn: 3600 // 1 hour in seconds
  };
}

// Register endpoint
router.post('/register', async (req, res): Promise<any> => {
  try {
    const { email, password, fullName } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: 'Email and password are required'
      });
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        error: 'User already exists with this email'
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create user
    const user = await prisma.user.create({
      data: {
        email,
        passwordHash: hashedPassword,
        fullName: fullName || null,
        subscriptionTier: 'free',
        emailVerified: true // Skip email verification for now
      }
    });

    // Generate tokens
    const tokens = generateTokens(user.id);

    // Return user and tokens
    res.status(201).json({
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
      },
      tokens
    });

  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

// Login endpoint
router.post('/login', async (req, res): Promise<any> => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: 'Email and password are required'
      });
    }

    // Find user
    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'Invalid email or password'
      });
    }

    // Check password
    const isValidPassword = await bcrypt.compare(password, user.passwordHash);

    if (!isValidPassword) {
      return res.status(401).json({
        success: false,
        error: 'Invalid email or password'
      });
    }

    // Update last sign in time
    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: { lastSignInAt: new Date() }
    });

    // Generate tokens
    const tokens = generateTokens(updatedUser.id);

    res.json({
      success: true,
      user: {
        id: updatedUser.id,
        email: updatedUser.email,
        fullName: updatedUser.fullName,
        avatarUrl: updatedUser.avatarUrl,
        subscriptionTier: updatedUser.subscriptionTier,
        emailVerified: updatedUser.emailVerified,
        lastSignInAt: updatedUser.lastSignInAt?.toISOString(),
        createdAt: updatedUser.createdAt.toISOString(),
        updatedAt: updatedUser.updatedAt.toISOString()
      },
      tokens
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

// Get current user endpoint
router.get('/me', async (req, res): Promise<any> => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader?.split(' ')[1];

    if (!token) {
      return res.status(401).json({
        success: false,
        error: 'No token provided'
      });
    }

    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId }
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'Invalid token'
      });
    }

    res.json({
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
    res.status(401).json({
      success: false,
      error: 'Invalid token'
    });
  }
});

// Refresh token endpoint
router.post('/refresh', async (req, res): Promise<any> => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({
        success: false,
        error: 'Refresh token is required'
      });
    }

    const decoded = jwt.verify(refreshToken, JWT_SECRET) as { userId: string; type: string };

    if (decoded.type !== 'refresh') {
      return res.status(401).json({
        success: false,
        error: 'Invalid refresh token'
      });
    }

    // Generate new tokens
    const tokens = generateTokens(decoded.userId);

    res.json({
      success: true,
      tokens
    });

  } catch (error) {
    console.error('Refresh token error:', error);
    res.status(401).json({
      success: false,
      error: 'Invalid refresh token'
    });
  }
});

// Logout endpoint
router.post('/logout', async (req, res) => {
  // For now, just return success since we're using stateless JWT
  // In production, you might want to maintain a blacklist of tokens
  res.json({
    success: true,
    message: 'Logged out successfully'
  });
});

export default router;