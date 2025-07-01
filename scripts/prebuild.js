#!/usr/bin/env node

const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

console.log('Running prebuild script...');

// Ensure we're in the right directory
const projectRoot = path.resolve(__dirname, '..');
process.chdir(projectRoot);

// Clear any existing Prisma client
const prismaClientPath = path.join(projectRoot, 'node_modules', '.prisma');
if (fs.existsSync(prismaClientPath)) {
  try {
    execSync(`rm -rf "${prismaClientPath}"`, { stdio: 'inherit' });
    console.log('Cleared existing Prisma client');
  } catch (error) {
    console.log('Error clearing Prisma client:', error.message);
  }
}

// Set required environment variables for Vercel
process.env.PRISMA_CLI_BINARY_TARGETS = '["native", "rhel-openssl-1.0.x"]';

// Generate fresh Prisma client
try {
  console.log('Generating Prisma client...');
  execSync('npx prisma generate --no-engine-hints', { 
    stdio: 'inherit',
    env: {
      ...process.env,
      PRISMA_CLI_BINARY_TARGETS: '["native", "rhel-openssl-1.0.x"]'
    }
  });
  console.log('Generated fresh Prisma client successfully');
} catch (error) {
  console.error('Failed to generate Prisma client:', error);
  process.exit(1);
}

console.log('Prebuild script completed successfully');