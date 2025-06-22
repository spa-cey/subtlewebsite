#!/bin/bash

# Vercel Deployment Script for gosubtle.app
# Run this script to deploy your Subtle website to Vercel

echo "🚀 Subtle Website Deployment Script"
echo "=================================="

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: package.json not found. Make sure you're in the project root directory."
    exit 1
fi

# Check if Vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo "📦 Installing Vercel CLI..."
    npm install -g vercel
fi

# Test local build first
echo "🔧 Testing local build..."
npm run build

if [ $? -ne 0 ]; then
    echo "❌ Build failed! Please fix build errors before deploying."
    exit 1
fi

echo "✅ Build successful!"

# Check if environment variables are set
echo "🔍 Checking environment variables..."
if [ ! -f ".env.production" ]; then
    echo "⚠️  Warning: .env.production not found."
    echo "   Make sure to add your Supabase credentials in Vercel dashboard."
fi

# Deploy to Vercel
echo "🚀 Deploying to Vercel..."
vercel --prod

echo ""
echo "🎉 Deployment complete!"
echo ""
echo "Next steps:"
echo "1. 🌐 Add your domain 'gosubtle.app' in Vercel dashboard"
echo "2. 📝 Configure DNS in GoDaddy with the provided values"
echo "3. 🔐 Update Supabase authentication URLs"
echo "4. 🧪 Test your live website"
echo ""
echo "📚 See VERCEL_DEPLOYMENT.md for detailed instructions"