import { PrismaClient } from '@prisma/client';

// Declare global variable for PrismaClient to prevent multiple instances in development
declare global {
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined;
}

// Initialize Prisma Client with configuration
const prisma = globalThis.prisma || new PrismaClient({
  log: ['error', 'warn'],
  datasources: {
    db: {
      url: process.env.DATABASE_URL,
    },
  },
});

// In development, store the client globally to prevent multiple instances
// due to hot reloading
if (process.env.NODE_ENV !== 'production') {
  globalThis.prisma = prisma;
}

/**
 * Connect to the database
 */
export const connectDatabase = async (): Promise<void> => {
  try {
    await prisma.$connect();
    console.log('✅ Database connected successfully');
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    throw error;
  }
};

/**
 * Disconnect from the database
 */
export const disconnectDatabase = async (): Promise<void> => {
  try {
    await prisma.$disconnect();
    console.log('✅ Database disconnected successfully');
  } catch (error) {
    console.error('❌ Database disconnection failed:', error);
    throw error;
  }
};

/**
 * Test database connection
 */
export const testDatabaseConnection = async (): Promise<boolean> => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    console.log('✅ Database connection test successful');
    return true;
  } catch (error) {
    console.error('❌ Database connection test failed:', error);
    return false;
  }
};

/**
 * Get database health status
 */
export const getDatabaseHealth = async () => {
  try {
    const result = await prisma.$queryRaw<Array<{ version: string }>>`SELECT version()`;
    const userCount = await prisma.user.count();
    
    return {
      status: 'healthy',
      version: result[0]?.version || 'unknown',
      userCount,
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    return {
      status: 'unhealthy',
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString(),
    };
  }
};

export { prisma };
export default prisma;