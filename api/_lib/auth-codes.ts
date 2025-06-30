import { kv } from '@vercel/kv';

// Auth code storage interface
interface AuthCodeData {
  userId: string;
  state: string;
  createdAt: Date;
  expiresAt: Date;
}

const AUTH_CODE_PREFIX = 'auth_code:';
const AUTH_CODE_TTL = 300; // 5 minutes in seconds

// Use Vercel KV if available, otherwise fallback to in-memory
const useKV = process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN;

// In-memory fallback for local development
const memoryStore = new Map<string, AuthCodeData>();

export async function storeAuthCode(code: string, data: AuthCodeData): Promise<void> {
  if (useKV) {
    await kv.set(
      `${AUTH_CODE_PREFIX}${code}`,
      JSON.stringify(data),
      { ex: AUTH_CODE_TTL }
    );
  } else {
    memoryStore.set(code, data);
    // Clean up expired codes
    setTimeout(() => memoryStore.delete(code), AUTH_CODE_TTL * 1000);
  }
}

export async function getAuthCode(code: string): Promise<AuthCodeData | null> {
  if (useKV) {
    const data = await kv.get(`${AUTH_CODE_PREFIX}${code}`);
    if (!data) return null;
    
    const parsed = JSON.parse(data as string);
    return {
      ...parsed,
      createdAt: new Date(parsed.createdAt),
      expiresAt: new Date(parsed.expiresAt)
    };
  } else {
    const data = memoryStore.get(code);
    if (!data || data.expiresAt < new Date()) {
      memoryStore.delete(code);
      return null;
    }
    return data;
  }
}

export async function deleteAuthCode(code: string): Promise<void> {
  if (useKV) {
    await kv.del(`${AUTH_CODE_PREFIX}${code}`);
  } else {
    memoryStore.delete(code);
  }
}