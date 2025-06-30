# Vercel Deployment Guide

This guide explains how to deploy the Subtle website with Vercel Functions.

## Prerequisites

1. Vercel account
2. PostgreSQL database (e.g., Vercel Postgres, Supabase, or any PostgreSQL instance)
3. Vercel CLI (optional, for local testing)

## Environment Variables

Set these environment variables in your Vercel project settings:

### Required Variables

```bash
# Database
DATABASE_URL="postgresql://..."

# JWT Secrets (generate secure random strings)
JWT_SECRET="..."
JWT_REFRESH_SECRET="..."
JWT_EXPIRES_IN="1h"
JWT_REFRESH_EXPIRES_IN="7d"

# Encryption Key (exactly 32 characters)
ENCRYPTION_KEY="your-32-character-encryption-key"

# CORS (add your domains)
ALLOWED_ORIGINS="https://yourdomain.com,subtle://"

# Frontend URL
FRONTEND_URL="https://yourdomain.com"
```

### Optional Variables

```bash
# Vercel KV (for auth code storage)
KV_REST_API_URL="..."
KV_REST_API_TOKEN="..."
```

## Deployment Steps

### 1. Install Dependencies

```bash
npm install
```

### 2. Set Up Database

```bash
# Generate Prisma client
npx prisma generate

# Run migrations (make sure DATABASE_URL is set)
npx prisma migrate deploy
```

### 3. Deploy to Vercel

#### Option A: Using Vercel CLI

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Deploy to production
vercel --prod
```

#### Option B: Using GitHub Integration

1. Connect your GitHub repository to Vercel
2. Vercel will automatically deploy on push to main branch

### 4. Post-Deployment

1. Verify all API endpoints are working:
   - `/api/auth/login`
   - `/api/auth/register`
   - `/api/ai/chat`
   - etc.

2. Update your Mac app's base URL to point to the deployed website

## Local Development

To test Vercel Functions locally:

```bash
# Install Vercel CLI
npm i -g vercel

# Run development server
vercel dev
```

This will start:
- Frontend on http://localhost:3000
- API functions on http://localhost:3000/api

## API Endpoints

All backend routes have been converted to Vercel Functions:

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `POST /api/auth/refresh` - Refresh tokens
- `GET /api/auth/me` - Get current user

### Desktop Authentication
- `POST /api/auth/desktop-initiate` - Start desktop auth flow
- `POST /api/auth/desktop-exchange` - Exchange auth code for tokens

### AI Services
- `POST /api/ai/chat` - Chat completion
- `POST /api/ai/chat-stream` - Streaming chat
- `POST /api/ai/analyze-image` - Image analysis
- `GET /api/ai/quota` - Check usage quota

### Admin
- `GET/POST/PUT/DELETE /api/admin/azure-config` - Manage Azure OpenAI configuration

## Troubleshooting

### Database Connection Issues
- Ensure DATABASE_URL is properly set in Vercel environment variables
- Check if your database allows connections from Vercel's IP ranges

### CORS Issues
- Update ALLOWED_ORIGINS to include your domain
- Ensure the Mac app uses the correct URL scheme (subtle://)

### Function Timeouts
- Vercel Functions have a 60-second timeout (configured in vercel.json)
- For longer operations, consider using background jobs

### Auth Code Storage
- Without Vercel KV, auth codes use in-memory storage (won't persist across function invocations)
- For production, set up Vercel KV or use a database table for auth codes