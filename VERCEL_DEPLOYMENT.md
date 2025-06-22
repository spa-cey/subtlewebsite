# Complete Vercel Deployment Guide for gosubtle.app

This is your step-by-step guide to deploy the Subtle website to Vercel and connect your `gosubtle.app` domain.

## 🚀 Step 1: Prepare Your Project

### 1.1 Test Local Build
First, ensure your project builds correctly:

```bash
# In your project directory
npm run build
npm run preview
```

Visit `http://localhost:4173` to test the production build locally.

### 1.2 Commit Your Changes
Make sure all your code is committed to Git:

```bash
git add .
git commit -m "Prepare for Vercel deployment"
git push origin main
```

### 1.3 Create Production Environment File
Update your `.env.production` with real Supabase values:

```bash
# .env.production
VITE_SUPABASE_URL=https://your-actual-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-actual-anon-key
```

## 🌐 Step 2: Deploy to Vercel

### Option A: Vercel CLI (Recommended)

#### 2.1 Install Vercel CLI
```bash
npm install -g vercel
```

#### 2.2 Login to Vercel
```bash
vercel login
```
Choose your preferred login method (GitHub, GitLab, etc.)

#### 2.3 Deploy Your Project
In your project root directory:

```bash
vercel
```

You'll be prompted with questions:

```
? Set up and deploy "~/Documents/Active Projects/SubtleWebsite"? [Y/n] Y
? Which scope do you want to deploy to? [Your Account]
? Link to existing project? [y/N] N
? What's your project's name? subtle-website
? In which directory is your code located? ./
```

#### 2.4 Configure Build Settings
Vercel will auto-detect Vite. Confirm these settings:
- **Framework Preset**: Vite
- **Build Command**: `npm run build`
- **Output Directory**: `dist`
- **Install Command**: `npm install`

### Option B: Vercel Dashboard (Alternative)

1. Go to [vercel.com](https://vercel.com) and sign up/login
2. Click "New Project"
3. Import your GitHub repository
4. Configure the same build settings as above
5. Click "Deploy"

## 🔧 Step 3: Configure Environment Variables

### 3.1 Add Environment Variables in Vercel

1. Go to your Vercel project dashboard
2. Click "Settings" tab
3. Click "Environment Variables" in sidebar
4. Add these variables:

```
Name: VITE_SUPABASE_URL
Value: https://your-project-id.supabase.co
Environments: Production, Preview, Development

Name: VITE_SUPABASE_ANON_KEY  
Value: your-anon-key-here
Environments: Production, Preview, Development
```

### 3.2 Redeploy with Environment Variables
```bash
vercel --prod
```

## 🌍 Step 4: Connect Your Domain

### 4.1 Add Domain in Vercel

1. In your Vercel project dashboard, go to "Settings"
2. Click "Domains" in the sidebar
3. Click "Add" button
4. Enter `gosubtle.app`
5. Click "Add"
6. Also add `www.gosubtle.app` (for www redirect)

### 4.2 Get DNS Configuration Values

Vercel will show you the required DNS records:

```
Type: A
Name: @
Value: 76.76.19.61
TTL: Auto

Type: CNAME
Name: www
Value: cname.vercel-dns.com
TTL: Auto
```

## 🔗 Step 5: Configure GoDaddy DNS

### 5.1 Access GoDaddy DNS Manager

1. Login to your GoDaddy account
2. Go to "My Products" → "All Products and Services"
3. Find `gosubtle.app` domain
4. Click "DNS" button next to it

### 5.2 Configure DNS Records

**Delete existing A records** (if any) and add:

#### A Record for Root Domain:
```
Type: A
Name: @ (or leave blank)
Value: 76.76.19.61
TTL: 1 Hour (or 3600)
```

#### CNAME Record for www:
```
Type: CNAME
Name: www
Value: cname.vercel-dns.com
TTL: 1 Hour (or 3600)
```

### 5.3 Save DNS Changes
Click "Save" after adding each record.

**⏰ DNS Propagation**: Changes can take 24-48 hours to fully propagate worldwide.

## 🔐 Step 6: Update Supabase Configuration

### 6.1 Update Authentication URLs

In your Supabase Dashboard:

1. Go to "Authentication" → "URL Configuration"
2. Update **Site URL**: `https://gosubtle.app`
3. Add **Redirect URLs**:
   - `https://gosubtle.app/auth/callback`
   - `https://www.gosubtle.app/auth/callback`
   - `https://your-vercel-url.vercel.app/auth/callback` (keep as backup)

### 6.2 Update OAuth Provider Settings

**Google OAuth Console**:
1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Select your OAuth project
3. Go to "Credentials" → Your OAuth 2.0 Client
4. Add to **Authorized JavaScript origins**:
   - `https://gosubtle.app`
   - `https://www.gosubtle.app`
5. The redirect URI should remain: `https://your-project-id.supabase.co/auth/v1/callback`

**GitHub OAuth App**:
1. Go to GitHub → Settings → Developer settings → OAuth Apps
2. Update **Homepage URL**: `https://gosubtle.app`
3. Keep **Authorization callback URL**: `https://your-project-id.supabase.co/auth/v1/callback`

## 🧪 Step 7: Test Your Deployment

### 7.1 DNS Propagation Check
Use [DNS Checker](https://dnschecker.org) to verify your domain is pointing to Vercel globally.

### 7.2 SSL Certificate
Vercel automatically provisions SSL certificates. This usually takes 10-15 minutes after DNS propagation.

### 7.3 Test All Functionality

Visit `https://gosubtle.app` and test:

- [ ] **Homepage loads correctly**
- [ ] **Navigation works** (all pages accessible)
- [ ] **Theme toggle** (dark/light mode)
- [ ] **Sign up process** (email confirmation)
- [ ] **Login process** (email/password)
- [ ] **OAuth login** (Google/GitHub)
- [ ] **Dashboard access** (protected route)
- [ ] **Logout functionality**
- [ ] **Mobile responsiveness**

## 🔄 Step 8: Continuous Deployment

### 8.1 Automatic Deployments
Vercel automatically deploys when you push to your main branch:

```bash
# Make changes to your code
git add .
git commit -m "Update website content"
git push origin main
# Vercel automatically deploys!
```

### 8.2 Preview Deployments
Every pull request gets its own preview URL for testing.

## 📊 Step 9: Performance & Monitoring

### 9.1 Vercel Analytics (Optional)
Enable Vercel Analytics in your project settings for detailed performance metrics.

### 9.2 Speed Insights
Use [PageSpeed Insights](https://pagespeed.web.dev) to test:
- `https://gosubtle.app`

### 9.3 Performance Optimization
Your current build is already optimized with:
- ✅ Code splitting
- ✅ Asset optimization
- ✅ Gzip compression
- ✅ CDN delivery

## 🚨 Troubleshooting

### Common Issues:

#### "Domain not found" or 404 errors:
- **Solution**: Wait for DNS propagation (up to 48 hours)
- **Check**: Use `nslookup gosubtle.app` to verify DNS resolution

#### SSL Certificate not working:
- **Solution**: Wait 10-15 minutes after DNS propagation
- **Alternative**: Remove and re-add domain in Vercel

#### Authentication redirects failing:
- **Check**: Supabase redirect URLs are correct
- **Verify**: OAuth provider settings match your domain

#### Build failures:
- **Check**: Environment variables are set correctly
- **Verify**: Local build works with `npm run build`
- **Review**: Build logs in Vercel dashboard

### Getting Help:
- Vercel Dashboard → Your Project → Functions tab (check logs)
- Supabase Dashboard → Logs section
- Browser Developer Console (F12)

## 🎉 Success Checklist

Once everything is working:

- [ ] `https://gosubtle.app` loads your website
- [ ] SSL certificate is active (green lock icon)
- [ ] Authentication flows work correctly
- [ ] All pages are accessible
- [ ] Mobile version works properly
- [ ] Site is fast and responsive

## 🔄 Next Steps

1. **Set up monitoring**: Consider tools like Sentry for error tracking
2. **Analytics**: Add Google Analytics or Vercel Analytics
3. **Performance**: Monitor Core Web Vitals
4. **SEO**: Add meta tags and sitemap
5. **Content**: Update any placeholder content

## 📞 Vercel Commands Reference

```bash
# Deploy to production
vercel --prod

# Check deployment status
vercel ls

# View logs
vercel logs [deployment-url]

# Remove deployment
vercel rm [deployment-url]

# Link existing project
vercel link
```

## 🏆 Final Result

Your Subtle website will be live at:
- **Primary**: https://gosubtle.app
- **WWW**: https://www.gosubtle.app (redirects to primary)
- **Backup**: https://your-project-name.vercel.app

Congratulations! Your Subtle AI assistant website is now live on the internet! 🚀