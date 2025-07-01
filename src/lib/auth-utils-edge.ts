import { SignJWT, jwtVerify } from 'jose';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'your-refresh-secret';

export interface JWTPayload {
  userId: string;
  email: string;
  role?: string;
  iat?: number;
  exp?: number;
}

const getJwtSecretKey = () => {
  const secret = JWT_SECRET;
  return new TextEncoder().encode(secret);
};

const getRefreshSecretKey = () => {
  const secret = JWT_REFRESH_SECRET;
  return new TextEncoder().encode(secret);
};

export async function verifyJWT(token: string): Promise<JWTPayload> {
  try {
    const { payload } = await jwtVerify(token, getJwtSecretKey());
    return payload as unknown as JWTPayload;
  } catch (error: any) {
    console.error('JWT verification error in Edge:', error);
    
    // Provide more specific error messages
    if (error?.code === 'ERR_JWT_EXPIRED') {
      throw new Error('Token expired');
    } else if (error?.code === 'ERR_JWT_INVALID') {
      throw new Error('Invalid token');
    } else if (error?.code === 'ERR_JWS_SIGNATURE_VERIFICATION_FAILED') {
      throw new Error('Token signature verification failed');
    }
    
    throw new Error('Token verification failed');
  }
}

export async function verifyRefreshToken(token: string): Promise<JWTPayload> {
  try {
    const { payload } = await jwtVerify(token, getRefreshSecretKey());
    return payload as unknown as JWTPayload;
  } catch (error) {
    throw new Error('Invalid refresh token');
  }
}

export async function generateAccessToken(payload: Omit<JWTPayload, 'iat' | 'exp'>): Promise<string> {
  const jwt = await new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d') // Extended to 7 days for better UX
    .sign(getJwtSecretKey());
  
  return jwt;
}

export async function generateRefreshToken(payload: Omit<JWTPayload, 'iat' | 'exp'>): Promise<string> {
  const jwt = await new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('30d') // Extended to 30 days for long-term persistence
    .sign(getRefreshSecretKey());
  
  return jwt;
}