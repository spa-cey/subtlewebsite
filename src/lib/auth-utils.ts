import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { cookies } from 'next/headers';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'your-refresh-secret';

console.log('auth-utils.ts loaded with JWT_SECRET:', JWT_SECRET ? `${JWT_SECRET.substring(0, 10)}...` : 'UNDEFINED');
console.log('Using fallback secret?', JWT_SECRET === 'your-secret-key');

export interface JWTPayload {
  userId: string;
  email: string;
  role?: string;
  iat?: number;
  exp?: number;
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword);
}

export function generateAccessToken(payload: Omit<JWTPayload, 'iat' | 'exp'>): string {
  console.log('Generating JWT with secret:', JWT_SECRET ? `${JWT_SECRET.substring(0, 10)}...` : 'UNDEFINED');
  // Extended to 7 days for better UX - Mac app users won't need to re-login frequently
  const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
  console.log('Generated token length:', token.length);
  return token;
}

export function generateRefreshToken(payload: Omit<JWTPayload, 'iat' | 'exp'>): string {
  // Extended to 30 days for long-term session persistence
  return jwt.sign(payload, JWT_REFRESH_SECRET, { expiresIn: '30d' });
}

export async function verifyJWT(token: string): Promise<JWTPayload> {
  try {
    console.log('Verifying JWT with secret:', JWT_SECRET ? `${JWT_SECRET.substring(0, 10)}...` : 'UNDEFINED');
    const decoded = jwt.verify(token, JWT_SECRET) as JWTPayload;
    console.log('JWT verified successfully:', decoded);
    return decoded;
  } catch (error) {
    console.error('JWT verification error:', error);
    if (error instanceof jwt.TokenExpiredError) {
      throw new Error('Token expired');
    } else if (error instanceof jwt.JsonWebTokenError) {
      throw new Error('Invalid token');
    }
    throw new Error('Token verification failed');
  }
}

export async function verifyRefreshToken(token: string): Promise<JWTPayload> {
  try {
    return jwt.verify(token, JWT_REFRESH_SECRET) as JWTPayload;
  } catch (error) {
    throw new Error('Invalid refresh token');
  }
}

export async function getServerSession() {
  const cookieStore = await cookies();
  const token = cookieStore.get('accessToken')?.value;
  
  if (!token) {
    return null;
  }

  try {
    const payload = await verifyJWT(token);
    return {
      user: {
        id: payload.userId,
        email: payload.email,
        role: payload.role,
      },
    };
  } catch (error) {
    return null;
  }
}

export async function setAuthCookies(accessToken: string, refreshToken: string) {
  const cookieStore = await cookies();
  
  cookieStore.set('accessToken', accessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 7 * 24 * 60 * 60, // 7 days - matches JWT expiration
    path: '/',
  });

  cookieStore.set('refreshToken', refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 30 * 24 * 60 * 60, // 30 days - matches JWT refresh token expiration
    path: '/',
  });
}

export async function clearAuthCookies() {
  const cookieStore = await cookies();
  cookieStore.delete('accessToken');
  cookieStore.delete('refreshToken');
}