# Deployment Guide: Connecting gosubtle.app to Your Subtle Website

This guide will help you deploy your Subtle website and connect your GoDaddy domain `gosubtle.app`.

## 🚀 Recommended Deployment Options

### Option 1: Vercel (Recommended for React/Vite)
**Best for**: Easy deployment, automatic builds, great performance

#### Steps:
1. **Deploy to Vercel**:
   ```bash
   npm install -g vercel
   vercel
   ```

2. **Configure Domain in Vercel**:
   - Go to Vercel Dashboard → Your Project → Settings → Domains
   - Add `gosubtle.app` and `www.gosubtle.app`
   - Vercel will provide DNS records

3. **GoDaddy DNS Configuration**:
   ```
   Type: A Record
   Name: @
   Value: 76.76.19.61 (Vercel's IP)
   
   Type: CNAME
   Name: www
   Value: cname.vercel-dns.com
   ```

### Option 2: Netlify
**Best for**: Continuous deployment, forms, edge functions

#### Steps:
1. **Deploy to Netlify**:
   - Connect GitHub repo to Netlify
   - Build command: `npm run build`
   - Publish directory: `dist`

2. **Configure Domain**:
   - Netlify Dashboard → Domain Settings
   - Add custom domain: `gosubtle.app`

3. **GoDaddy DNS Configuration**:
   ```
   Type: A Record
   Name: @
   Value: 75.2.60.5 (Netlify's IP)
   
   Type: CNAME
   Name: www
   Value: [your-site-name].netlify.app
   ```

### Option 3: GitHub Pages
**Best for**: Free hosting, simple setup

#### Steps:
1. **Enable GitHub Pages**:
   - Repository → Settings → Pages
   - Source: Deploy from a branch (gh-pages)

2. **Install gh-pages**:
   ```bash
   npm install --save-dev gh-pages
   ```

3. **Update package.json**:
   ```json
   {
     "homepage": "https://gosubtle.app",
     "scripts": {
       "predeploy": "npm run build",
       "deploy": "gh-pages -d dist -o origin -b gh-pages"
     }
   }
   ```

4. **GoDaddy DNS Configuration**:
   ```
   Type: A Record
   Name: @
   Value: 185.199.108.153
   
   Type: A Record  
   Name: @
   Value: 185.199.109.153
   
   Type: A Record
   Name: @
   Value: 185.199.110.153
   
   Type: A Record
   Name: @
   Value: 185.199.111.153
   
   Type: CNAME
   Name: www
   Value: [your-username].github.io
   ```

## 🔧 GoDaddy DNS Configuration Steps

### Accessing GoDaddy DNS Settings:
1. Login to GoDaddy account
2. Go to "My Products"
3. Find your domain `gosubtle.app`
4. Click "DNS" or "Manage DNS"

### DNS Records to Configure:
Based on your chosen deployment platform, add the appropriate records above.

### Common DNS Records Explained:
- **A Record**: Points domain to IP address
- **CNAME**: Points subdomain to another domain
- **@**: Represents the root domain (gosubtle.app)
- **www**: Represents www.gosubtle.app

## 📱 Production Environment Setup

### 1. Update Environment Variables

Create production environment file:

```bash
# .env.production
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-production-anon-key
```

### 2. Update Supabase Configuration

In Supabase Dashboard → Authentication → URL Configuration:
- **Site URL**: `https://gosubtle.app`
- **Redirect URLs**: 
  - `https://gosubtle.app/auth/callback`
  - `https://www.gosubtle.app/auth/callback`

### 3. OAuth Provider Updates

Update OAuth app configurations:

**Google OAuth Console**:
- Authorized domains: Add `gosubtle.app`
- Redirect URIs: `https://your-project-id.supabase.co/auth/v1/callback`

**GitHub OAuth App**:
- Homepage URL: `https://gosubtle.app`
- Authorization callback URL: `https://your-project-id.supabase.co/auth/v1/callback`

## 🛠 Build Configuration

### Update Vite Config for Production

```typescript
// vite.config.ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          router: ['react-router-dom'],
          ui: ['lucide-react'],
          supabase: ['@supabase/supabase-js']
        }
      }
    }
  },
  base: '/'
})
```

## 🔐 SSL Certificate

Most modern hosting platforms (Vercel, Netlify) provide automatic SSL certificates. For custom setups:

1. **Let's Encrypt** (Free): Most hosts support automatic setup
2. **Cloudflare** (Free): Add your domain to Cloudflare for SSL + CDN

## 📊 Performance Optimization

### 1. Build the project:
```bash
npm run build
```

### 2. Test the production build locally:
```bash
npm run preview
```

### 3. Performance checklist:
- ✅ Bundle size optimization
- ✅ Image optimization
- ✅ Code splitting
- ✅ CSS minification
- ✅ Gzip compression

## 🧪 Testing Your Deployment

### Pre-deployment Checklist:
- [ ] Environment variables configured
- [ ] Supabase URLs updated
- [ ] OAuth providers configured
- [ ] Build completes successfully
- [ ] All routes work correctly
- [ ] Authentication flows work
- [ ] Responsive design tested

### Post-deployment Testing:
1. **Domain Resolution**: Visit `https://gosubtle.app`
2. **SSL Certificate**: Check for secure connection
3. **Authentication**: Test login/signup flows
4. **Performance**: Use PageSpeed Insights
5. **Mobile**: Test on various devices

## 🚨 Troubleshooting

### Common Issues:

**DNS Propagation Delay**:
- Can take 24-48 hours to fully propagate
- Use `https://dnschecker.org` to check status

**SSL Certificate Issues**:
- Wait for automatic provision (usually 10-15 minutes)
- Check hosting platform documentation

**Authentication Redirect Errors**:
- Verify Supabase redirect URLs are correct
- Check OAuth app configurations

**Build Failures**:
- Check for TypeScript errors
- Verify all dependencies are installed
- Check environment variables

## 📞 Next Steps

1. **Choose Deployment Platform**: I recommend Vercel for ease of use
2. **Configure DNS**: Set up the appropriate records in GoDaddy
3. **Update Environment**: Configure production Supabase settings
4. **Test Everything**: Verify all functionality works on live domain
5. **Monitor**: Set up analytics and error tracking

## 🎯 Quick Start (Vercel Recommended)

```bash
# 1. Install Vercel CLI
npm install -g vercel

# 2. Deploy
vercel

# 3. Add domain in Vercel dashboard
# 4. Configure DNS in GoDaddy with provided values
# 5. Update Supabase URLs
# 6. Test everything!
```

Your `gosubtle.app` domain will be live and ready for users! 🚀