#!/bin/bash

# Migration script for Vite to Next.js

echo "🚀 Starting Vite to Next.js migration..."

# Step 1: Backup current package.json
echo "📦 Backing up package.json..."
cp package.json package-vite-backup.json

# Step 2: Switch to Next.js package.json
echo "📦 Switching to Next.js package.json..."
cp package-nextjs.json package.json

# Step 3: Switch TypeScript config
echo "🔧 Switching to Next.js TypeScript config..."
if [ -f "tsconfig.json" ]; then
    cp tsconfig.json tsconfig-vite-backup.json
fi
cp tsconfig-nextjs.json tsconfig.json

# Step 4: Clean and install dependencies
echo "🧹 Cleaning node_modules and installing dependencies..."
rm -rf node_modules package-lock.json
npm install

# Step 5: Generate Prisma client
echo "🗄️ Generating Prisma client..."
npx prisma generate

# Step 6: Create .env.local from .env
echo "🔐 Setting up environment variables..."
if [ -f ".env" ]; then
    cp .env .env.local
    # Update variable names for Next.js
    sed -i '' 's/VITE_/NEXT_PUBLIC_/g' .env.local
    echo "DATABASE_URL=$DATABASE_URL" >> .env.local
    echo "JWT_SECRET=$JWT_SECRET" >> .env.local
    echo "JWT_REFRESH_SECRET=$JWT_REFRESH_SECRET" >> .env.local
    echo "OPENAI_API_KEY=$OPENAI_API_KEY" >> .env.local
fi

# Step 7: Create Next.js specific files if they don't exist
echo "📄 Creating Next.js specific files..."
touch next-env.d.ts

# Step 8: Run the build to check for errors
echo "🏗️ Testing Next.js build..."
npm run build

echo "✅ Migration setup complete!"
echo ""
echo "Next steps:"
echo "1. Review and update environment variables in .env.local"
echo "2. Test the application with: npm run dev"
echo "3. Complete component migrations as needed"
echo "4. Update API client calls to use new endpoints"
echo ""
echo "To rollback:"
echo "1. cp package-vite-backup.json package.json"
echo "2. cp tsconfig-vite-backup.json tsconfig.json"
echo "3. rm -rf node_modules && npm install"