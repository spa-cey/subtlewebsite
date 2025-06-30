# Vercel Setup Checklist

## 1. Local Testing with Vercel CLI

```bash
# Install Vercel CLI globally
npm install -g vercel

# Install all dependencies
cd /Users/space/Documents/Active\ Projects/Subtle/SubtleWebsite
npm install

# Generate Prisma Client
npx prisma generate

# Create a .env.local file for testing
cp .env.example .env.local
# Edit .env.local with your actual values

# Test with Vercel CLI
vercel dev
```

## 2. Vercel Dashboard Setup

### A. Create/Connect Project
1. Go to https://vercel.com/dashboard
2. Click "Add New..." → "Project"
3. Import your GitHub repository
4. Choose "SubtleWebsite" as the root directory

### B. Environment Variables (REQUIRED)
Go to Project Settings → Environment Variables and add:

```bash
# Database (Most Important!)
DATABASE_URL="postgresql://user:password@host:5432/database?sslmode=require"

# JWT Secrets (Generate secure values)
JWT_SECRET="<generate with: node -e \"console.log(require('crypto').randomBytes(32).toString('hex'))\">"
JWT_REFRESH_SECRET="<generate another random value>"
JWT_EXPIRES_IN="1h"
JWT_REFRESH_EXPIRES_IN="7d"

# Encryption (MUST be exactly 32 characters)
ENCRYPTION_KEY="12345678901234567890123456789012"

# CORS (Update with your domains)
ALLOWED_ORIGINS="https://gosubtle.app,https://www.gosubtle.app,subtle://"

# Frontend URL
FRONTEND_URL="https://gosubtle.app"
```

### C. Optional Services

#### Option 1: Vercel Postgres (Easiest)
1. Go to Storage tab in your project
2. Click "Create Database" → "Postgres"
3. It will automatically add DATABASE_URL to your env vars

#### Option 2: Existing Database
- Use your current PostgreSQL connection string
- Make sure it allows connections from Vercel IPs

#### Vercel KV (Optional, for auth codes)
1. Go to Storage tab → "Create Database" → "KV"
2. It will add KV_REST_API_URL and KV_REST_API_TOKEN automatically

## 3. Build & Deploy Settings

In Project Settings → General:

- **Framework Preset**: Vite
- **Build Command**: `npm run build`
- **Output Directory**: `dist`
- **Install Command**: `npm install`
- **Development Command**: `npm run dev`

## 4. Database Migration

After setting DATABASE_URL in Vercel:

```bash
# Run migrations against production database
npx prisma migrate deploy
```

Or use Vercel's build command to include migrations:
Update package.json:
```json
"scripts": {
  "build": "prisma generate && vite build",
  "vercel-build": "prisma generate && prisma migrate deploy && vite build"
}
```

## 5. Deployment

### First Deployment
```bash
# Deploy to preview
vercel

# Deploy to production
vercel --prod
```

### Verify Endpoints
Test these endpoints after deployment:

```bash
# Health check
curl https://your-app.vercel.app/api/auth/me

# Should return 401 (no auth) but confirms API is working
```

## 6. Common Issues & Solutions

### Issue: "No database connection"
**Solution**: Check DATABASE_URL format and SSL settings
```
postgresql://user:pass@host:5432/db?sslmode=require
```

### Issue: "Prisma Client not found"
**Solution**: Add to package.json:
```json
"scripts": {
  "postinstall": "prisma generate"
}
```

### Issue: "CORS errors from Mac app"
**Solution**: Ensure ALLOWED_ORIGINS includes `subtle://`

### Issue: "Function timeout"
**Solution**: Already configured for 60s in vercel.json

## 7. Production Checklist

- [ ] All environment variables set in Vercel
- [ ] Database connection tested
- [ ] Prisma migrations run
- [ ] API endpoints return expected responses
- [ ] CORS allows Mac app origin (subtle://)
- [ ] JWT secrets are strong random values
- [ ] Encryption key is exactly 32 characters
- [ ] Frontend uses production API URL

## 8. Update Mac App

Once deployed, update your Mac app:
1. Change API base URL to `https://your-domain.vercel.app/api`
2. Test authentication flow
3. Test AI chat functionality