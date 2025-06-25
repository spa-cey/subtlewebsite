# SaaS Migration - Web Application Changes

This document outlines the changes made to the web application to support the new SaaS model with centralized AI configuration.

## Changes Made

### 1. Updated Azure OpenAI Library (`src/lib/azure-openai.ts`)
- Removed all user-specific Azure configuration logic
- Updated to use the new `ai-request-v3` edge function endpoint
- Removed config fetching and storage logic
- Added quota information handling in responses
- Added `getQuotaStatus()` method for fetching current usage
- Fixed environment variable access (removed Deno reference)

### 2. Updated useAzureOpenAI Hook (`src/hooks/useAzureOpenAI.ts`)
- Removed config management (no more user configs)
- Added quota status fetching on mount and after requests
- Added quota exceeded and rate limit error handling
- Added upgrade prompts in error states using toast notifications
- Added quota calculation methods (`calculateQuotaPercentage`, `isQuotaExceeded`)
- Added `refreshQuota` method for manual quota updates

### 3. Removed Azure Settings Components
- Removed import of `AzureOpenAISettings.tsx` from Settings page
- Updated `Settings.tsx` page to remove Azure config section
- Added new "Subscription" tab showing plan and quota information

### 4. Created New Components

#### QuotaStatus Component (`src/components/subscription/QuotaStatus.tsx`)
- Displays current quota usage with progress bar
- Shows plan name and reset date
- Displays warnings when approaching or exceeding quota
- Includes upgrade button when needed

#### PlanUpgrade Component (`src/components/subscription/PlanUpgrade.tsx`)
- Shows available subscription plans (Free, Pro, Team)
- Highlights recommended plan
- Displays features for each plan
- Handles plan selection (payment integration pending)

### 5. Updated AuthContext (`src/contexts/AuthContext.tsx`)
- Added `UserSubscription` interface with tier and quota information
- Added `subscription` state to track user's current plan
- Added `fetchSubscription` method to load subscription details
- Added `refreshSubscription` method for manual updates
- Fetches subscription on login and session changes
- Uses correct database tables: `saas_tier_quotas`, `saas_usage_metrics`

## Usage Example

```typescript
import { useAzureOpenAI } from '@/hooks/useAzureOpenAI';

function ChatComponent() {
  const { sendMessage, isLoading, quota, isQuotaExceeded } = useAzureOpenAI({
    onComplete: (response) => {
      console.log('AI Response:', response);
    },
    onError: (error) => {
      console.error('AI Error:', error);
    }
  });

  if (isQuotaExceeded) {
    return <div>Quota exceeded. Please upgrade your plan.</div>;
  }

  // Show quota status
  if (quota) {
    console.log(`Used ${quota.used} of ${quota.limit} requests`);
  }

  // Send a message
  const handleSend = async () => {
    await sendMessage([
      { role: 'user', content: 'Hello, AI!' }
    ]);
  };

  return (
    <button onClick={handleSend} disabled={isLoading}>
      Send Message
    </button>
  );
}
```

## Migration Notes

1. **No User Configuration Required**: Users no longer need to provide their own Azure OpenAI keys or endpoints
2. **Automatic Quota Management**: The system automatically tracks and enforces usage quotas
3. **Centralized Configuration**: All AI configuration is managed server-side
4. **Upgrade Prompts**: Users are prompted to upgrade when they hit quota limits
5. **Subscription Tiers**: Three tiers available - Free (100 requests), Pro (2,500 requests), Team (10,000 requests)

## Pending Work

1. **Payment Integration**: The plan selection currently shows a toast message. Payment processing needs to be integrated.
2. **Webhook Handling**: Subscription status updates from payment provider need to be handled.
3. **Admin Dashboard**: Admin interface for managing AI configurations is available but may need additional features.

## Key Files Changed

- `src/lib/azure-openai.ts` - Core Azure OpenAI client
- `src/hooks/useAzureOpenAI.ts` - React hook for AI operations
- `src/contexts/AuthContext.tsx` - Authentication context with subscription
- `src/pages/Settings.tsx` - Settings page with new subscription tab
- `src/components/subscription/QuotaStatus.tsx` - Quota display component
- `src/components/subscription/PlanUpgrade.tsx` - Plan selection component
- `src/components/subscription/index.ts` - Subscription components export

## Removed Files/Features

- Azure OpenAI Settings component (user config management)
- User-specific API key storage
- Configuration management edge functions (for users)