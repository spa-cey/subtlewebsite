#!/usr/bin/env node

import crypto from 'crypto';

console.log('=== Vercel Environment Variables ===\n');
console.log('Copy these to your Vercel dashboard:\n');

// Generate JWT secrets
const jwtSecret = crypto.randomBytes(32).toString('hex');
const jwtRefreshSecret = crypto.randomBytes(32).toString('hex');

// Generate encryption key (32 chars)
const encryptionKey = crypto.randomBytes(16).toString('hex');

console.log(`JWT_SECRET="${jwtSecret}"`);
console.log(`JWT_REFRESH_SECRET="${jwtRefreshSecret}"`);
console.log(`JWT_EXPIRES_IN="1h"`);
console.log(`JWT_REFRESH_EXPIRES_IN="7d"`);
console.log(`ENCRYPTION_KEY="${encryptionKey}"`);
console.log(`ALLOWED_ORIGINS="https://gosubtle.app,https://www.gosubtle.app,subtle://"`);
console.log(`FRONTEND_URL="https://gosubtle.app"`);
console.log('\n=== Database (Add your own) ===');
console.log(`DATABASE_URL="postgresql://user:password@host:5432/database?sslmode=require"`);
console.log('\n=== Optional (Vercel KV) ===');
console.log(`# KV_REST_API_URL="..."`);
console.log(`# KV_REST_API_TOKEN="..."`);