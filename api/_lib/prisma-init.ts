// This file ensures Prisma Client is properly initialized for Vercel
// Import this at the top of any API route that uses Prisma

import { prisma } from './prisma';

// Force initialization
export async function ensurePrismaConnection() {
  try {
    // Simple query to ensure connection is established
    await prisma.$queryRaw`SELECT 1`;
    return true;
  } catch (error) {
    console.error('Failed to initialize Prisma connection:', error);
    return false;
  }
}

// Export the prisma instance to ensure consistent imports
export { prisma };