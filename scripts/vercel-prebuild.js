#!/usr/bin/env node

// Vercel pre-build script to ensure proper setup
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🔧 Running Vercel pre-build setup...');

// Ensure Prisma client is generated
console.log('📦 Generating Prisma Client...');
try {
  execSync('npx prisma generate', { stdio: 'inherit' });
  console.log('✅ Prisma Client generated successfully');
} catch (error) {
  console.error('❌ Failed to generate Prisma Client:', error);
  process.exit(1);
}

// Ensure API tsconfig exists
const apiTsConfigPath = path.join(__dirname, '..', 'api', 'tsconfig.json');
if (!fs.existsSync(apiTsConfigPath)) {
  console.log('⚠️  API tsconfig.json not found, creating...');
  const tsConfig = {
    extends: "../tsconfig.json",
    compilerOptions: {
      target: "ES2020",
      module: "commonjs",
      lib: ["ES2020"],
      moduleResolution: "node",
      esModuleInterop: true,
      allowSyntheticDefaultImports: true,
      resolveJsonModule: true,
      isolatedModules: true,
      noEmit: true,
      strict: true,
      skipLibCheck: true,
      forceConsistentCasingInFileNames: true,
      types: ["node"]
    },
    include: ["./**/*.ts"],
    exclude: ["node_modules"]
  };
  
  fs.writeFileSync(apiTsConfigPath, JSON.stringify(tsConfig, null, 2));
  console.log('✅ API tsconfig.json created');
}

console.log('✅ Vercel pre-build setup complete');