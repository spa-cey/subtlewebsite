#!/bin/bash

# Add environment variables to Vercel one by one
echo "Adding environment variables to Vercel..."

# Add each variable
vercel env add DATABASE_URL production <<< "postgres://neondb_owner:npg_Eu1bDxAm9VdC@ep-bitter-tooth-a4hv90t4-pooler.us-east-1.aws.neon.tech/neondb?sslmode=require"
vercel env add JWT_SECRET production <<< "76cb1ca2e91953636195a783ca19fe53c9753ecf38b1685659eb8e7ca11088ae"
vercel env add JWT_REFRESH_SECRET production <<< "424e6e263fd8a38dc4fe9072ba13e5ca4f1f51bd35cb9466274ac2fd6617bf9a"
vercel env add JWT_EXPIRES_IN production <<< "1h"
vercel env add JWT_REFRESH_EXPIRES_IN production <<< "7d"
vercel env add ENCRYPTION_KEY production <<< "966a1c152d7580f51373e51ee5829xyz"
vercel env add ALLOWED_ORIGINS production <<< "https://gosubtle.app,https://www.gosubtle.app,subtle://"
vercel env add FRONTEND_URL production <<< "https://gosubtle.app"
vercel env add ADMIN_EMAIL production <<< "admin@gosubtle.app"
vercel env add DEFAULT_AZURE_API_VERSION production <<< "2025-01-01-preview"
vercel env add LOG_LEVEL production <<< "info"
vercel env add RATE_LIMIT_WINDOW_MS production <<< "60000"
vercel env add RATE_LIMIT_MAX_REQUESTS production <<< "100"
vercel env add NODE_ENV production <<< "production"
vercel env add VITE_API_URL production <<< ""
vercel env add VITE_APP_URL production <<< "https://gosubtle.app"
vercel env add VITE_ENABLE_DEV_LOGGING production <<< "false"

echo "All environment variables added!"