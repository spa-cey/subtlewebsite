import { VercelRequest, VercelResponse } from '@vercel/node';

const allowedOrigins = (process.env.ALLOWED_ORIGINS || 'http://localhost:5173,subtle://').split(',');

export function handleCors(req: VercelRequest, res: VercelResponse): boolean {
  const origin = req.headers.origin;
  
  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', origin || '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.setHeader('Access-Control-Max-Age', '86400');
    res.status(200).end();
    return false;
  }

  // Set CORS headers for actual requests
  if (origin && (allowedOrigins.includes(origin) || allowedOrigins.includes('*'))) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Access-Control-Allow-Credentials', 'true');
  }

  return true;
}