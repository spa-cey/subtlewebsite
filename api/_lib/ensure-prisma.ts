// This module ensures Prisma Client is properly loaded in Vercel environment
// It should be imported at the top of the application to prevent ES module errors

// Set NODE_ENV if not already set
if (!process.env.NODE_ENV) {
  process.env.NODE_ENV = 'production';
}

// Ensure Prisma binary target is set for Vercel
process.env.PRISMA_CLI_BINARY_TARGETS = '["native", "rhel-openssl-1.0.x"]';

// Export everything from prisma-init
export * from './prisma-init';