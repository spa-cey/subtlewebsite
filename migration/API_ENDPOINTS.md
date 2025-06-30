# API Endpoints Documentation

## Backend API Reference

This document provides complete documentation for all API endpoints in the new PostgreSQL backend.

**Base URL**: `http://localhost:3001/api`

---

## Authentication Endpoints

### POST /auth/register
Register a new user account.

**Request Body:**
```typescript
{
  email: string;        // Valid email address
  password: string;     // Minimum 8 characters
  fullName?: string;    // Optional full name
}
```

**Response (201):**
```typescript
{
  user: {
    id: string;
    email: string;
    fullName: string | null;
    subscriptionTier: string;
    emailVerified: boolean;
    createdAt: string;
  };
  tokens: {
    accessToken: string;
    refreshToken: string;
    expiresIn: number;    // Seconds until access token expires
  };
}
```

**Errors:**
- `400` - Invalid email or password too short
- `409` - Email already exists

---

### POST /auth/login
Authenticate user and return tokens.

**Request Body:**
```typescript
{
  email: string;
  password: string;
}
```

**Response (200):**
```typescript
{
  user: {
    id: string;
    email: string;
    fullName: string | null;
    avatarUrl: string | null;
    subscriptionTier: string;
    emailVerified: boolean;
    createdAt: string;
  };
  tokens: {
    accessToken: string;
    refreshToken: string;
    expiresIn: number;
  };
}
```

**Errors:**
- `401` - Invalid credentials
- `404` - User not found

---

### POST /auth/logout
Logout user and invalidate refresh token.

**Headers:**
```
Authorization: Bearer <access_token>
```

**Request Body:**
```typescript
{
  refreshToken: string;
}
```

**Response (200):**
```typescript
{
  message: "Logged out successfully";
}
```

---

### POST /auth/refresh
Refresh access token using refresh token.

**Request Body:**
```typescript
{
  refreshToken: string;
}
```

**Response (200):**
```typescript
{
  tokens: {
    accessToken: string;
    refreshToken: string;
    expiresIn: number;
  };
}
```

**Errors:**
- `401` - Invalid or expired refresh token

---

### GET /auth/me
Get current authenticated user information.

**Headers:**
```
Authorization: Bearer <access_token>
```

**Response (200):**
```typescript
{
  user: {
    id: string;
    email: string;
    fullName: string | null;
    avatarUrl: string | null;
    subscriptionTier: string;
    emailVerified: boolean;
    createdAt: string;
    updatedAt: string;
  };
}
```

---

## User Management Endpoints

### GET /users/profile
Get own user profile.

**Headers:**
```
Authorization: Bearer <access_token>
```

**Response (200):**
```typescript
{
  id: string;
  email: string;
  fullName: string | null;
  avatarUrl: string | null;
  subscriptionTier: string;
  emailVerified: boolean;
  createdAt: string;
  updatedAt: string;
}
```

---

### PUT /users/profile
Update own user profile.

**Headers:**
```
Authorization: Bearer <access_token>
```

**Request Body:**
```typescript
{
  fullName?: string;
  avatarUrl?: string;
}
```

**Response (200):**
```typescript
{
  user: {
    id: string;
    email: string;
    fullName: string | null;
    avatarUrl: string | null;
    subscriptionTier: string;
    emailVerified: boolean;
    createdAt: string;
    updatedAt: string;
  };
}
```

---

### GET /users/:id
Get user by ID (admin only or own profile).

**Headers:**
```
Authorization: Bearer <access_token>
```

**Response (200):**
```typescript
{
  id: string;
  email: string;
  fullName: string | null;
  avatarUrl: string | null;
  subscriptionTier: string;
  emailVerified: boolean;
  createdAt: string;
  updatedAt: string;
  _count: {
    userActivity: number;
    usageMetrics: number;
    adminNotes: number;
  };
}
```

---

### PUT /users/:id
Update user by ID (admin only).

**Headers:**
```
Authorization: Bearer <access_token>
```

**Request Body:**
```typescript
{
  fullName?: string;
  avatarUrl?: string;
  subscriptionTier?: "free" | "pro" | "enterprise";
  emailVerified?: boolean;
}
```

**Response (200):**
```typescript
{
  user: {
    id: string;
    email: string;
    fullName: string | null;
    avatarUrl: string | null;
    subscriptionTier: string;
    emailVerified: boolean;
    createdAt: string;
    updatedAt: string;
  };
}
```

---

## Admin Endpoints

### GET /admin/users
List all users with filtering and pagination (admin only).

**Headers:**
```
Authorization: Bearer <access_token>
```

**Query Parameters:**
```typescript
{
  page?: number;                    // Default: 1
  pageSize?: number;                // Default: 25, Max: 100
  search?: string;                  // Search email or name
  subscriptionTier?: "free" | "pro" | "enterprise" | "all";
  emailVerified?: boolean;
  sortBy?: "createdAt" | "email" | "subscriptionTier";
  sortOrder?: "asc" | "desc";       // Default: desc
  dateFrom?: string;                // ISO date string
  dateTo?: string;                  // ISO date string
}
```

**Response (200):**
```typescript
{
  users: Array<{
    id: string;
    email: string;
    fullName: string | null;
    avatarUrl: string | null;
    subscriptionTier: string;
    emailVerified: boolean;
    createdAt: string;
    updatedAt: string;
    _count: {
      userActivity: number;
      usageMetrics: number;
    };
  }>;
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
  filters: {
    search?: string;
    subscriptionTier?: string;
    emailVerified?: boolean;
  };
}
```

---

### PUT /admin/users/:id
Update any user (admin only).

**Headers:**
```
Authorization: Bearer <access_token>
```

**Request Body:**
```typescript
{
  fullName?: string;
  avatarUrl?: string;
  subscriptionTier?: "free" | "pro" | "enterprise";
  emailVerified?: boolean;
}
```

**Response (200):**
```typescript
{
  user: {
    id: string;
    email: string;
    fullName: string | null;
    avatarUrl: string | null;
    subscriptionTier: string;
    emailVerified: boolean;
    createdAt: string;
    updatedAt: string;
  };
}
```

---

### POST /admin/users/bulk-action
Perform bulk actions on multiple users (admin only).

**Headers:**
```
Authorization: Bearer <access_token>
```

**Request Body:**
```typescript
{
  userIds: string[];
  action: {
    type: "activate" | "suspend" | "delete" | "change_subscription" | "export";
    payload?: {
      subscriptionTier?: "free" | "pro" | "enterprise";  // For change_subscription
    };
  };
}
```

**Response (200):**
```typescript
{
  message: string;
  affectedUsers: number;
  results?: {
    success: string[];
    failed: string[];
  };
}
```

---

### GET /admin/users/:id/activity
Get user activity logs (admin only).

**Headers:**
```
Authorization: Bearer <access_token>
```

**Query Parameters:**
```typescript
{
  page?: number;        // Default: 1
  pageSize?: number;    // Default: 50
  actionType?: string;  // Filter by action type
}
```

**Response (200):**
```typescript
{
  activities: Array<{
    id: string;
    action: string;
    data: any;
    createdAt: string;
  }>;
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
}
```

---

### GET /admin/users/:id/sessions
Get user sessions (admin only).

**Headers:**
```
Authorization: Bearer <access_token>
```

**Response (200):**
```typescript
{
  sessions: Array<{
    id: string;
    createdAt: string;
    expiresAt: string;
    isActive: boolean;
  }>;
  total: number;
}
```

---

### GET /admin/users/:id/notes
Get admin notes for user (admin only).

**Headers:**
```
Authorization: Bearer <access_token>
```

**Response (200):**
```typescript
{
  notes: Array<{
    id: string;
    note: string;
    isFlagged: boolean;
    createdAt: string;
    admin: {
      id: string;
      email: string;
      fullName: string | null;
    };
  }>;
}
```

---

### POST /admin/users/:id/notes
Add admin note for user (admin only).

**Headers:**
```
Authorization: Bearer <access_token>
```

**Request Body:**
```typescript
{
  note: string;
  isFlagged?: boolean;  // Default: false
}
```

**Response (201):**
```typescript
{
  note: {
    id: string;
    note: string;
    isFlagged: boolean;
    createdAt: string;
    admin: {
      id: string;
      email: string;
      fullName: string | null;
    };
  };
}
```

---

### GET /admin/users/:id/billing
Get user billing history (admin only).

**Headers:**
```
Authorization: Bearer <access_token>
```

**Query Parameters:**
```typescript
{
  page?: number;        // Default: 1
  pageSize?: number;    // Default: 25
  status?: "pending" | "completed" | "failed" | "refunded";
}
```

**Response (200):**
```typescript
{
  billingHistory: Array<{
    id: string;
    amount: number;
    currency: string;
    status: string;
    description: string | null;
    createdAt: string;
  }>;
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
  summary: {
    totalAmount: number;
    totalTransactions: number;
    pendingAmount: number;
  };
}
```

---

### GET /admin/stats
Get dashboard statistics (admin only).

**Headers:**
```
Authorization: Bearer <access_token>
```

**Response (200):**
```typescript
{
  users: {
    total: number;
    active: number;        // Active in last 30 days
    newThisWeek: number;
    bySubscription: {
      free: number;
      pro: number;
      enterprise: number;
    };
  };
  activity: {
    totalActions: number;
    actionsToday: number;
    actionsThisWeek: number;
  };
  billing: {
    totalRevenue: number;
    revenueThisMonth: number;
    pendingPayments: number;
  };
  usage: {
    totalRequests: number;
    totalTokens: number;
    totalCost: number;
  };
}
```

---

## Analytics Endpoints

### GET /analytics/users/:id
Get usage analytics for specific user.

**Headers:**
```
Authorization: Bearer <access_token>
```

**Query Parameters:**
```typescript
{
  timeRange?: "daily" | "weekly" | "monthly";  // Default: weekly
  startDate?: string;   // ISO date string
  endDate?: string;     // ISO date string
}
```

**Response (200):**
```typescript
{
  summary: {
    totalRequests: number;
    totalTokens: number;
    totalCost: number;
    lastActive: string | null;
  };
  dailyUsage: Array<{
    date: string;
    requests: number;
    tokens: number;
    cost: number;
  }>;
  usageByFeature: {
    [featureType: string]: number;
  };
  recentActivity: Array<{
    action: string;
    timestamp: string;
    tokens?: number;
    cost?: number;
    feature?: string;
  }>;
}
```

---

### GET /analytics/overview
Get system-wide analytics overview (admin only).

**Headers:**
```
Authorization: Bearer <access_token>
```

**Query Parameters:**
```typescript
{
  timeRange?: "daily" | "weekly" | "monthly";  // Default: weekly
}
```

**Response (200):**
```typescript
{
  overview: {
    totalUsers: number;
    activeUsers: number;
    totalRequests: number;
    totalTokens: number;
    totalCost: number;
  };
  trends: {
    userGrowth: Array<{
      date: string;
      newUsers: number;
      totalUsers: number;
    }>;
    usageTrends: Array<{
      date: string;
      requests: number;
      tokens: number;
      cost: number;
    }>;
  };
  topUsers: Array<{
    id: string;
    email: string;
    fullName: string | null;
    totalRequests: number;
    totalCost: number;
  }>;
}
```

---

### GET /analytics/metrics
Get aggregated metrics (admin only).

**Headers:**
```
Authorization: Bearer <access_token>
```

**Query Parameters:**
```typescript
{
  groupBy?: "day" | "week" | "month";    // Default: day
  metricType?: "requests" | "tokens" | "cost" | "users";
  startDate?: string;
  endDate?: string;
}
```

**Response (200):**
```typescript
{
  metrics: Array<{
    period: string;      // Date/week/month identifier
    value: number;
    change: number;      // Percentage change from previous period
  }>;
  aggregates: {
    total: number;
    average: number;
    peak: number;
    trend: "up" | "down" | "stable";
  };
}
```

---

## Error Responses

### Standard Error Format

All endpoints return errors in this format:

```typescript
{
  error: {
    code: string;           // Error code (e.g., "INVALID_CREDENTIALS")
    message: string;        // Human-readable error message
    details?: any;          // Additional error details (validation errors, etc.)
    timestamp: string;      // ISO timestamp
    path: string;          // Request path
  };
}
```

### Common Error Codes

- `UNAUTHORIZED` (401) - Missing or invalid authentication
- `FORBIDDEN` (403) - Insufficient permissions
- `NOT_FOUND` (404) - Resource not found
- `VALIDATION_ERROR` (400) - Request validation failed
- `DUPLICATE_EMAIL` (409) - Email already exists
- `INVALID_CREDENTIALS` (401) - Wrong email/password
- `TOKEN_EXPIRED` (401) - Access token expired
- `RATE_LIMITED` (429) - Too many requests
- `INTERNAL_ERROR` (500) - Server error

---

## Authentication & Authorization

### JWT Token Format

Access tokens contain the following payload:
```typescript
{
  sub: string;              // User ID
  email: string;            // User email
  subscriptionTier: string; // User subscription tier
  iat: number;             // Issued at
  exp: number;             // Expires at
}
```

### Authorization Levels

1. **Public** - No authentication required
2. **User** - Valid access token required
3. **Admin** - Access token + enterprise subscription tier
4. **Owner** - Access token + (own resource OR admin)

### Rate Limiting

| Endpoint Category | Rate Limit |
|------------------|------------|
| Authentication | 10 requests/minute |
| User Profile | 60 requests/minute |
| Admin Operations | 30 requests/minute |
| Analytics | 100 requests/minute |

---

## Development Notes

### Environment Variables

```env
# Backend
DATABASE_URL=postgresql://user:password@localhost:5432/subtle_db
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=30d
PORT=3001
NODE_ENV=development
FRONTEND_URL=http://localhost:5173

# Frontend
VITE_API_URL=http://localhost:3001
VITE_APP_URL=http://localhost:5173
```

### API Client Example

```typescript
// src/lib/api.ts
import axios from 'axios';

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  timeout: 10000,
});

// Auth service example
export const authService = {
  login: async (email: string, password: string) => {
    const response = await apiClient.post('/api/auth/login', {
      email,
      password
    });
    return response.data;
  },

  register: async (email: string, password: string, fullName?: string) => {
    const response = await apiClient.post('/api/auth/register', {
      email,
      password,
      fullName
    });
    return response.data;
  },

  refreshToken: async (refreshToken: string) => {
    const response = await apiClient.post('/api/auth/refresh', {
      refreshToken
    });
    return response.data;
  }
};
```

### Testing with cURL

```bash
# Register user
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123","fullName":"Test User"}'

# Login
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'

# Get profile (replace TOKEN with actual token)
curl -X GET http://localhost:3001/api/users/profile \
  -H "Authorization: Bearer TOKEN"
