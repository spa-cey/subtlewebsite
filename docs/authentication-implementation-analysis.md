# Subtle Website Authentication Implementation Analysis

## Overview

The Subtle website uses **Supabase** for authentication and user management. The implementation is centralized around a React Context pattern that provides authentication state and methods throughout the application.

## Core Architecture

### 1. Authentication Context (`AuthContext.tsx`)

The heart of the authentication system is the `AuthContext`, which provides:

#### State Management
```typescript
interface AuthContextType {
  user: User | null                    // Supabase Auth user
  profile: Profile | null              // Custom user profile from 'users' table
  session: Session | null              // Active Supabase session
  loading: boolean                     // Loading state
  error: AuthError | null              // Error state
  subscription?: SubscriptionData      // User subscription info
  // ... auth methods
}
```

#### Key Methods
- `signUp(email, password, fullName?)` - Creates new user account
- `signIn(email, password, rememberMe?)` - Email/password authentication
- `signInWithMagicLink(email)` - Passwordless authentication
- `signInWithProvider(provider)` - OAuth authentication (Google, GitHub, Apple)
- `signOut()` - Logs out user
- `updateProfile(updates)` - Updates user profile
- `resetPassword(email)` - Initiates password reset
- `updatePassword(newPassword)` - Updates user password
- `refreshSession()` - Refreshes auth token
- `refreshSubscription()` - Updates subscription data

### 2. Supabase Configuration (`lib/supabase.ts`)

```typescript
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
})
```

The configuration enables:
- Automatic token refresh
- Session persistence across browser sessions
- URL-based auth callback detection

### 3. Database Schema

The `users` table schema:
```typescript
type Profile = {
  id: string                           // UUID, matches Supabase Auth user ID
  email: string
  full_name: string | null
  avatar_url: string | null
  subscription_tier: 'free' | 'pro' | 'enterprise'
  created_at: string
  updated_at: string
}
```

## Authentication Flow

### 1. Initial Load & Session Recovery

On app initialization:
1. AuthContext checks for existing session via `supabase.auth.getSession()`
2. If session exists, fetches user profile from `users` table
3. Handles temporary sessions (for "remember me" functionality)
4. Sets up auth state change listener

### 2. Sign Up Flow

1. User submits email, password, and optional full name
2. `supabase.auth.signUp()` creates auth account
3. Email confirmation sent (redirect to `/auth/callback`)
4. Profile automatically created in `users` table on first sign-in

### 3. Sign In Flow

Multiple authentication methods supported:

#### Email/Password
```typescript
const { error } = await supabase.auth.signInWithPassword({
  email,
  password
})
```

#### Magic Link
```typescript
const { error } = await supabase.auth.signInWithOtp({
  email,
  options: {
    emailRedirectTo: `${window.location.origin}/auth/callback`
  }
})
```

#### OAuth Providers
```typescript
const { error } = await supabase.auth.signInWithOAuth({
  provider: 'google' | 'github' | 'apple',
  options: {
    redirectTo: `${window.location.origin}/auth/callback`
  }
})
```

### 4. Protected Routes

Protected routes are implemented using a `ProtectedRoute` component:

```typescript
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  
  if (loading) return <LoadingSpinner />;
  if (!user) return <Navigate to="/login" replace />;
  
  return <>{children}</>;
};
```

Protected routes in the app:
- `/dashboard` - Main user dashboard
- `/settings` - User settings
- `/admin/*` - Admin panel (additional role check)
- `/diagnostic` - Diagnostic dashboard

### 5. Session Management

#### Session Persistence
- Uses `persistSession: true` in Supabase config
- Sessions stored in localStorage by default
- "Remember Me" feature uses sessionStorage flags

#### Token Refresh
- Automatic refresh enabled via `autoRefreshToken: true`
- Manual refresh every 30 seconds if token expires within 60 seconds
- `refreshSession()` method available for manual refresh

#### Session Cleanup
- `signOut()` clears both Supabase session and local storage
- `beforeunload` event handler cleans up temporary session flags

## Authentication UI Components

### 1. Login Page (`pages/Login.tsx`)

Features:
- Tabbed interface (Password vs Magic Link)
- OAuth provider buttons (Google, GitHub)
- Remember Me checkbox
- Password visibility toggle
- Form validation
- Error handling with user-friendly messages
- Support for desktop app authentication flow

### 2. Signup Page (`pages/Signup.tsx`)

Features:
- Full name, email, password fields
- Password strength requirements display
- Real-time password validation
- OAuth signup options
- Automatic plan selection (from URL params)
- Success state with email confirmation message

### 3. Auth Callback (`pages/AuthCallback.tsx`)

Handles:
- OAuth provider redirects
- Magic link confirmations
- Session establishment
- Redirect to dashboard or error handling

### 4. Desktop Login Flow (`pages/DesktopLogin.tsx`)

Special authentication flow for desktop app:
1. Validates state and redirect_uri parameters
2. Ensures redirect URI starts with `subtle://`
3. If authenticated, passes access token back to desktop app
4. If not authenticated, redirects to login with return URL

## User State Management

### Profile Fetching

The `fetchProfile` method includes:
- Deduplication to prevent multiple simultaneous fetches
- 5-second timeout protection
- Automatic profile creation if missing
- Comprehensive error handling and logging

### State Synchronization

Auth state changes trigger:
- Profile refetch
- Subscription data update
- UI state updates across all components

### Error Handling

Comprehensive error handling for:
- Network failures
- Invalid credentials
- Email not confirmed
- Session expiration
- Profile fetch timeouts

## Security Features

### 1. Row Level Security (RLS)
- Database policies restrict access to user's own data
- Admin checks for elevated permissions

### 2. Token Security
- Access tokens never stored in plain text
- Automatic token refresh prevents expiration
- Secure token passing for desktop authentication

### 3. Password Requirements
- Minimum 6 characters
- Must contain uppercase letter
- Must contain lowercase letter
- Must contain number

## Admin Features

### Admin Detection
```typescript
const { data } = await supabase
  .from('admins')
  .select('id')
  .eq('user_id', user.id)
  .single();
```

### Admin-Only Routes
- `/admin/*` - Admin dashboard
- Additional UI elements shown for admin users

## Key Implementation Details

### 1. Loading States
- Initial auth loading state
- Profile loading with timeout detection
- Graceful handling of slow database queries

### 2. Error Recovery
- Automatic retry for profile creation
- User-friendly error messages
- Fallback options (refresh, sign out)

### 3. Performance Optimizations
- Profile fetch deduplication
- Conditional profile updates
- Efficient auth state change handling

## Integration Points

### 1. Navigation Component
- Shows different options based on auth state
- Sign In/Sign Up buttons when logged out
- User menu with Sign Out when logged in

### 2. Dashboard Component
- Displays user profile information
- Shows subscription status
- Admin-specific features when applicable

### 3. Settings Page
- Profile management
- Subscription details and upgrades
- Account preferences

## Best Practices Implemented

1. **Centralized Auth State**: Single source of truth via Context API
2. **Type Safety**: Full TypeScript support with proper interfaces
3. **Error Boundaries**: Graceful error handling throughout
4. **Loading States**: Clear UI feedback during async operations
5. **Security First**: Secure token handling and RLS policies
6. **User Experience**: Multiple auth methods and clear feedback

## Replication Guidelines for Mac App

To replicate this authentication pattern in the Mac app:

1. **Use Supabase Swift SDK** with similar configuration
2. **Implement similar state management** (e.g., using Combine or SwiftUI state)
3. **Mirror the auth flow**: Sign up → Email confirmation → Profile creation
4. **Implement secure token storage** using Keychain
5. **Handle deep links** for OAuth callbacks (`subtle://auth/callback`)
6. **Create similar UI components** for login/signup
7. **Implement auto-refresh** and session persistence
8. **Add profile fetching** with timeout protection
9. **Support desktop-to-web auth flow** for seamless integration

## Environment Configuration

Required environment variables:
```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

## Summary

The Subtle website authentication implementation provides a robust, secure, and user-friendly authentication system using Supabase. The architecture is well-structured with clear separation of concerns, comprehensive error handling, and excellent user experience features. The implementation can serve as a blueprint for the Mac app authentication system.