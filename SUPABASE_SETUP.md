# Supabase Setup Guide for Subtle Website

This guide will help you set up Supabase authentication for the Subtle website with the provided backend infrastructure.

## Prerequisites

1. A Supabase project (created from your backend setup)
2. The database schema already set up (profiles table, etc.)

## Configuration Steps

### 1. Environment Variables

Create a `.env.local` file in the root directory with your Supabase credentials:

```bash
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

You can find these values in your Supabase Dashboard → Settings → API.

### 2. Database Schema

Ensure your Supabase database has the `profiles` table with the following structure:

```sql
CREATE TABLE profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  email TEXT NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  subscription_tier subscription_tier DEFAULT 'free',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);
```

### 3. Authentication Providers

In your Supabase Dashboard → Authentication → Providers, enable:

- **Email** (default)
- **Google OAuth**: Add your Google OAuth credentials
- **GitHub OAuth**: Add your GitHub OAuth credentials
- **Apple OAuth**: Add your Apple OAuth credentials (optional)

### 4. URL Configuration

In your Supabase Dashboard → Authentication → URL Configuration:

- **Site URL**: `http://localhost:8082` (for development)
- **Redirect URLs**: Add `http://localhost:8082/auth/callback`

For production, update these to your actual domain.

### 5. Email Templates (Optional)

Customize the email templates in Supabase Dashboard → Authentication → Email Templates to match Subtle's branding.

## Features Implemented

### ✅ Authentication Pages

- **Login Page** (`/login`): Email/password and OAuth login
- **Signup Page** (`/signup`): Registration with email confirmation
- **Auth Callback** (`/auth/callback`): Handles OAuth redirects

### ✅ Protected Routes

- **Dashboard** (`/dashboard`): Protected route requiring authentication
- Automatic redirect to `/login` for unauthenticated users

### ✅ Navigation Integration

- Shows **Sign In / Sign Up** buttons when not authenticated
- Shows **Dashboard / Sign Out** buttons when authenticated
- Hides navbar on auth pages for better UX

### ✅ User Profile Management

- Automatic profile creation on signup
- Profile data synced with authentication state
- Subscription tier tracking (free/pro/enterprise)

## Usage

### Starting the Application

```bash
npm run dev
```

### Testing Authentication

1. **Sign Up**: Navigate to `/signup` and create an account
2. **Email Verification**: Check your email for confirmation link
3. **Sign In**: Use `/login` to authenticate
4. **Dashboard**: Access `/dashboard` after authentication
5. **OAuth**: Test Google/GitHub signin buttons

### Integration with Backend

The frontend is designed to work with your Supabase backend:

- **User Management**: Integrated with `profiles` table
- **Subscription Tiers**: Ready for Stripe integration
- **API Keys**: Profile supports API key management
- **Usage Tracking**: Profile structure supports usage quotas

## Next Steps

1. **Configure OAuth Apps**: Set up Google/GitHub OAuth applications
2. **Customize Styling**: Adjust glassmorphic effects and colors
3. **Add Features**: Implement profile editing, subscription management
4. **Production Deploy**: Update environment variables for production
5. **Connect Backend**: Link with your AI request endpoints

## File Structure

```
src/
├── contexts/
│   └── AuthContext.tsx          # Supabase authentication context
├── lib/
│   └── supabase.ts             # Supabase client configuration
├── pages/
│   ├── Login.tsx               # Login page with OAuth
│   ├── Signup.tsx              # Registration page
│   ├── Dashboard.tsx           # Protected dashboard
│   └── AuthCallback.tsx        # OAuth callback handler
└── components/
    └── Navbar.tsx              # Updated with auth state
```

## Troubleshooting

### Common Issues

1. **"Invalid login credentials"**: Check email/password combination
2. **OAuth redirect errors**: Verify redirect URLs in Supabase settings
3. **Profile creation fails**: Check RLS policies and database permissions
4. **Environment variables**: Ensure `.env.local` is properly configured

### Debug Mode

Add this to see authentication state in console:

```typescript
// In AuthContext.tsx, add to useEffect:
console.log('Auth state:', { user, profile, session })
```

## Security Notes

- **RLS Enabled**: Row Level Security protects user data
- **JWT Validation**: All requests use secure JWT tokens
- **OAuth Security**: Secure OAuth flow with state validation
- **Environment Variables**: Sensitive data in environment variables only

Your Subtle website now has a complete authentication system ready for production deployment!