# Profile Page Architecture Implementation Guide

## Overview
Design a comprehensive profile page at `/profile` using **100% real data** from existing authentication and user management infrastructure.

## Real Data Sources Available

### AuthContext (Primary)
```typescript
// From src/contexts/AuthContext.tsx
const { user, profile, updateProfile, updatePassword } = useAuth();

// Real data available:
profile.id              // User UUID
profile.email           // User email  
profile.full_name       // User's full name
profile.avatar_url      // Profile picture URL
profile.subscription_tier // Current subscription
profile.created_at      // Account creation date
user.email_confirmed_at // Email verification status
user.last_sign_in_at    // Last login timestamp
```

### Existing Hooks (Real Data)
```typescript
// From src/hooks/useUsers.ts
const { data: userDetails } = useUser(userId);        // Usage metrics
const { data: activity } = useUserActivity(userId);   // Activity logs
const { data: sessions } = useUserSessions(userId);   // Active sessions  
const { data: billing } = useBillingHistory(userId);  // Payment history
```

### Existing Components (Production Ready)
- `QuotaStatus` - Already has real quota data
- `UserDetailsModal` - Analytics patterns with real charts
- `AzureOpenAISettings` - Excellent form management patterns

## Architecture

```
ProfilePage
├── ProfileHeader (user info, avatar, subscription badge)
├── ProfileTabs
    ├── ProfileInfoTab (personal details, account info)
    ├── SubscriptionTab (QuotaStatus + billing history)
    ├── SettingsTab (password, notifications, preferences)
    ├── AnalyticsTab (usage metrics, activity timeline)
    └── SecurityTab (sessions, Mac app sync, security logs)
```

## Implementation Plan

### Phase 1: Infrastructure (5 min)
1. **Make profile route protected** in `src/App.tsx`:
```typescript
<Route path="/profile" element={
  <ProtectedRoute>
    <PageTransition><Profile /></PageTransition>
  </ProtectedRoute>
} />
```

2. **Transform ProfileCard** from mock to real data in `src/components/ProfileCard.tsx`

### Phase 2: Tab Components (60 min)

#### ProfileInfoTab.tsx
- Personal details form using `AzureOpenAISettings` patterns
- Real data: `profile.full_name`, `profile.avatar_url`
- Email verification status from `user.email_confirmed_at`

#### SubscriptionTab.tsx  
- Reuse existing `QuotaStatus` component (already real data)
- Add `useBillingHistory` for payment history
- Subscription management with `profile.subscription_tier`

#### AnalyticsTab.tsx
- Adapt `UserDetailsModal` metric cards patterns
- Real usage data: `total_requests`, `total_tokens`, `total_cost`
- Activity timeline using `useUserActivity`

#### SettingsTab.tsx
- Password management using `AuthContext.updatePassword`
- Notification preferences in `user.user_metadata`
- Form patterns from `AzureOpenAISettings`

#### SecurityTab.tsx
- Active sessions from `useUserSessions`
- Mac app integration via `SessionSyncService`
- Security activity logs from `useUserActivity`

## Component Patterns to Reuse

### Form Management (from AzureOpenAISettings)
```typescript
const [loading, setLoading] = useState(false);
const handleSave = async () => {
  setLoading(true);
  try {
    await updateProfile(formData);
    toast.success("Updated successfully");
  } catch (error) {
    toast.error("Update failed");
  } finally {
    setLoading(false);
  }
};
```

### Analytics Display (from UserDetailsModal)
```typescript
<div className="grid grid-cols-4 gap-4">
  <Card>
    <CardContent className="p-4">
      <div className="flex items-center gap-2 mb-2">
        <TrendingUp className="h-4 w-4 text-blue-600" />
        <p className="text-sm font-medium">Total Requests</p>
      </div>
      <p className="text-2xl font-bold">{userDetails?.total_requests || 0}</p>
    </CardContent>
  </Card>
</div>
```

## Files to Create

### Essential Components
1. `src/components/profile/ProfileInfoTab.tsx`
2. `src/components/profile/SubscriptionTab.tsx` 
3. `src/components/profile/SettingsTab.tsx`
4. `src/components/profile/AnalyticsTab.tsx`
5. `src/components/profile/SecurityTab.tsx`

### Files to Modify
1. `src/App.tsx` - Add protected route
2. `src/components/ProfileCard.tsx` - Replace mock with real data

## Key Benefits

- **100% Real Data**: No mock dependencies
- **Proven Patterns**: Reuses successful existing components
- **Type Safe**: Full TypeScript integration
- **Performance**: Built on React Query caching
- **Security**: Uses established AuthContext patterns

## Next Steps

1. Make profile route protected
2. Transform ProfileCard to real data
3. Create tab-based ProfilePage structure
4. Implement each tab using proven patterns
5. Add navigation link when user authenticated

This architecture provides a production-ready profile experience leveraging all existing infrastructure.