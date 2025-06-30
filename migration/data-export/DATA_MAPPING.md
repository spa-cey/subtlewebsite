# Data Mapping: Supabase to PostgreSQL

**Status**: REFERENCE ONLY - No Data Migration Required  
**Purpose**: Document field mappings for future reference

## Table Mappings

### 1. Users Table

| Supabase Field | PostgreSQL Field | Type | Notes |
|---|---|---|---|
| `id` | `id` | UUID/String | Primary key |
| `email` | `email` | String | Unique identifier |
| `full_name` | `fullName` | String | Camel case conversion |
| `avatar_url` | `avatar` | String | Field name simplified |
| `subscription_tier` | `subscriptionTier` | Enum | free/pro/enterprise |
| `created_at` | `createdAt` | DateTime | Camel case conversion |
| `updated_at` | `updatedAt` | DateTime | Camel case conversion |

### 2. Session Management

| Supabase Table | PostgreSQL Equivalent | Notes |
|---|---|---|
| `session_bridge_tokens` | `SessionToken` | Mac app sync tokens |
| `session_sync_logs` | `SessionSyncLog` | Event logging |

### 3. Authentication Changes

| Supabase Feature | PostgreSQL + JWT Solution |
|---|---|
| `supabase.auth.signUp()` | Custom registration endpoint |
| `supabase.auth.signInWithPassword()` | JWT-based login |
| `supabase.auth.signInWithOtp()` | Email magic link system |
| `supabase.auth.signOut()` | Token invalidation |
| `supabase.auth.getSession()` | JWT token verification |

## Key Differences

### Authentication
- **Supabase**: Built-in auth with automatic password hashing
- **PostgreSQL**: Custom bcrypt password hashing required
- **Sessions**: JWT tokens instead of Supabase sessions

### Real-time Features
- **Supabase**: Built-in real-time subscriptions
- **PostgreSQL**: Would require WebSocket implementation (not currently used)

### Edge Functions
- **Supabase**: Native edge functions for AI requests
- **PostgreSQL**: Traditional API endpoints

## Code Migration Points

### 1. Supabase Client Replacement
```typescript
// Before (Supabase)
import { supabase } from '@/lib/supabase'
const { data, error } = await supabase.from('users').select('*')

// After (PostgreSQL)
import { api } from '@/lib/api'
const users = await api.get('/users')
```

### 2. Authentication Flow
```typescript
// Before (Supabase)
const { error } = await supabase.auth.signUp({ email, password })

// After (PostgreSQL)
const response = await api.post('/auth/register', { email, password })
```

### 3. Session Management
```typescript
// Before (Supabase)
const { data: { session } } = await supabase.auth.getSession()

// After (PostgreSQL)
const token = localStorage.getItem('auth_token')
const user = await api.get('/auth/me', { headers: { Authorization: `Bearer ${token}` }})
```

## Migration Challenges Avoided

Since no data export was performed, the following challenges were avoided:
1. **Password Migration**: Supabase password hashes are not exportable
2. **User ID Mapping**: No existing user IDs to preserve
3. **Session Continuity**: No active sessions to maintain
4. **Data Validation**: No existing data integrity to verify

## Recommendations

1. **Fresh Start**: Begin with clean PostgreSQL database
2. **User Re-registration**: All users will create new accounts
3. **Gradual Migration**: Phase out Supabase dependencies incrementally
4. **Testing**: Thoroughly test new authentication flows