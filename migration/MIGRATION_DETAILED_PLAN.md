# Detailed PostgreSQL Migration Plan

## Table of Contents
1. [Backend Infrastructure Setup](#backend-infrastructure-setup)
2. [Database Design & Migration](#database-design--migration)
3. [Authentication System](#authentication-system)
4. [API Implementation](#api-implementation)
5. [Frontend Integration](#frontend-integration)
6. [Data Migration Strategy](#data-migration-strategy)

---

## Backend Infrastructure Setup

### 1.1 Project Structure
```
backend/
├── src/
│   ├── config/
│   │   ├── database.ts      # Database connection
│   │   ├── env.ts          # Environment variables
│   │   └── auth.ts         # JWT configuration
│   ├── controllers/
│   │   ├── auth.controller.ts
│   │   ├── user.controller.ts
│   │   └── admin.controller.ts
│   ├── middleware/
│   │   ├── auth.middleware.ts
│   │   ├── error.middleware.ts
│   │   └── validation.middleware.ts
│   ├── routes/
│   │   ├── auth.routes.ts
│   │   ├── user.routes.ts
│   │   └── admin.routes.ts
│   ├── services/
│   │   ├── auth.service.ts
│   │   ├── user.service.ts
│   │   └── email.service.ts
│   ├── utils/
│   │   ├── jwt.utils.ts
│   │   └── password.utils.ts
│   ├── prisma/
│   │   └── schema.prisma
│   └── server.ts
├── package.json
├── tsconfig.json
├── .env
└── .env.example
```

### 1.2 Dependencies
```json
{
  "dependencies": {
    "express": "^4.18.2",
    "@prisma/client": "^5.8.0",
    "cors": "^2.8.5",
    "helmet": "^7.1.0",
    "jsonwebtoken": "^9.0.2",
    "bcryptjs": "^2.4.3",
    "express-validator": "^7.0.1",
    "dotenv": "^16.3.1",
    "express-rate-limit": "^7.1.5"
  },
  "devDependencies": {
    "@types/express": "^4.17.21",
    "@types/jsonwebtoken": "^9.0.5",
    "@types/bcryptjs": "^2.4.6",
    "@types/cors": "^2.8.17",
    "typescript": "^5.3.3",
    "prisma": "^5.8.0",
    "ts-node-dev": "^2.0.0",
    "@types/node": "^20.10.6"
  }
}
```

### 1.3 Environment Configuration
```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/subtle_db"

# JWT
JWT_SECRET="your-super-secret-jwt-key"
JWT_EXPIRES_IN="15m"
JWT_REFRESH_EXPIRES_IN="30d"

# Server
PORT=3001
NODE_ENV=development

# Frontend URL
FRONTEND_URL="http://localhost:5173"

# Email (for future use)
EMAIL_FROM="noreply@gosubtle.app"
```

---

## Database Design & Migration

### 2.1 Core Tables Structure

#### Users Table
```sql
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(255),
    avatar_url TEXT,
    subscription_tier VARCHAR(50) DEFAULT 'free',
    email_verified BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);
```

#### Sessions Table (for refresh tokens)
```sql
CREATE TABLE sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    refresh_token TEXT UNIQUE NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);
```

#### User Activity Table
```sql
CREATE TABLE user_activity (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    action VARCHAR(255) NOT NULL,
    data JSONB,
    created_at TIMESTAMP DEFAULT NOW()
);
```

#### Admin Notes Table
```sql
CREATE TABLE admin_notes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    admin_id UUID NOT NULL REFERENCES users(id),
    note TEXT NOT NULL,
    is_flagged BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT NOW()
);
```

#### User Usage Metrics Table
```sql
CREATE TABLE user_usage_metrics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    request_count INTEGER DEFAULT 0,
    total_tokens INTEGER DEFAULT 0,
    total_cost DECIMAL(10,4) DEFAULT 0,
    feature_type VARCHAR(100),
    created_at TIMESTAMP DEFAULT NOW()
);
```

#### Billing History Table
```sql
CREATE TABLE billing_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    amount DECIMAL(10,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'USD',
    status VARCHAR(50) NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);
```

### 2.2 Prisma Schema Configuration
See `DATABASE_SCHEMA.md` for complete schema.

### 2.3 Migration Commands
```bash
# Initialize Prisma
npx prisma init

# Create migration
npx prisma migrate dev --name initial_migration

# Generate Prisma Client
npx prisma generate

# View database
npx prisma studio
```

---

## Authentication System

### 3.1 JWT Token Strategy
- **Access Token**: 15 minutes expiry
- **Refresh Token**: 30 days expiry
- **Token Rotation**: New refresh token on each refresh

### 3.2 Authentication Flow

#### Registration
1. User submits email/password
2. Validate email uniqueness
3. Hash password with bcrypt (10 salt rounds)
4. Create user record
5. Generate JWT tokens
6. Store refresh token in sessions table
7. Return tokens and user data

#### Login
1. User submits email/password
2. Verify user exists
3. Compare password hash
4. Generate JWT tokens
5. Store refresh token in sessions table
6. Return tokens and user data

#### Token Refresh
1. Client sends refresh token
2. Verify token validity
3. Check token exists in sessions table
4. Generate new access/refresh tokens
5. Update sessions table with new refresh token
6. Return new tokens

#### Logout
1. Client sends refresh token
2. Remove token from sessions table
3. Invalidate all client tokens

### 3.3 Password Security
- Minimum 8 characters
- bcrypt with 10 salt rounds
- Password reset via email token (Phase 2)

---

## API Implementation

### 4.1 Authentication Endpoints
```typescript
POST   /api/auth/register     - User registration
POST   /api/auth/login        - User login
POST   /api/auth/logout       - User logout
POST   /api/auth/refresh      - Refresh access token
GET    /api/auth/me          - Get current user
```

### 4.2 User Management Endpoints
```typescript
GET    /api/users            - List users (admin only)
GET    /api/users/:id        - Get user details
PUT    /api/users/:id        - Update user
DELETE /api/users/:id        - Delete user (soft delete)
GET    /api/users/profile    - Get own profile
PUT    /api/users/profile    - Update own profile
```

### 4.3 Admin Endpoints
```typescript
GET    /api/admin/users                 - List all users with filters
PUT    /api/admin/users/:id             - Update any user
POST   /api/admin/users/bulk-action     - Bulk operations
GET    /api/admin/users/:id/activity    - User activity logs
GET    /api/admin/users/:id/sessions    - User sessions
GET    /api/admin/users/:id/notes       - Admin notes
POST   /api/admin/users/:id/notes       - Add admin note
GET    /api/admin/users/:id/billing     - Billing history
GET    /api/admin/stats                 - Dashboard statistics
```

### 4.4 Usage Analytics Endpoints
```typescript
GET    /api/analytics/users/:id         - User usage analytics
GET    /api/analytics/overview          - System overview
GET    /api/analytics/metrics           - Aggregated metrics
```

### 4.5 Request/Response Formats

#### Authentication Response
```typescript
interface AuthResponse {
  user: {
    id: string;
    email: string;
    full_name: string | null;
    avatar_url: string | null;
    subscription_tier: string;
    created_at: string;
  };
  tokens: {
    access_token: string;
    refresh_token: string;
    expires_in: number;
  };
}
```

#### Error Response
```typescript
interface ErrorResponse {
  error: {
    message: string;
    code: string;
    details?: any;
  };
}
```

---

## Frontend Integration

### 5.1 Frontend Package Changes

#### Remove Dependencies
```bash
npm uninstall @supabase/supabase-js
```

#### Add Dependencies
```bash
npm install axios
```

### 5.2 API Client Setup

#### Create API Client (`src/lib/api.ts`)
```typescript
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
});

// Request interceptor to add auth token
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor for token refresh
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Try to refresh token
      const refreshToken = localStorage.getItem('refresh_token');
      if (refreshToken) {
        try {
          const response = await axios.post(`${API_BASE_URL}/api/auth/refresh`, {
            refresh_token: refreshToken
          });
          
          const { access_token, refresh_token: newRefreshToken } = response.data.tokens;
          localStorage.setItem('access_token', access_token);
          localStorage.setItem('refresh_token', newRefreshToken);
          
          // Retry original request
          error.config.headers.Authorization = `Bearer ${access_token}`;
          return axios.request(error.config);
        } catch (refreshError) {
          // Refresh failed, logout user
          localStorage.removeItem('access_token');
          localStorage.removeItem('refresh_token');
          window.location.href = '/login';
        }
      }
    }
    return Promise.reject(error);
  }
);
```

### 5.3 Auth Context Migration

#### Update AuthContext (`src/contexts/AuthContext.tsx`)
```typescript
// Replace Supabase imports with API client
import { apiClient } from '@/lib/api';

// Remove all Supabase-specific code
// Replace with API calls to backend
```

### 5.4 Data Hooks Migration

#### Update useUsers hook (`src/hooks/useUsers.ts`)
```typescript
// Replace Supabase queries with API calls
import { apiClient } from '@/lib/api';

export const useUsers = (filters, sortConfig, page, pageSize) => {
  return useQuery({
    queryKey: userKeys.list(filters, sortConfig, page),
    queryFn: async () => {
      const response = await apiClient.get('/api/admin/users', {
        params: { ...filters, ...sortConfig, page, pageSize }
      });
      return response.data;
    },
    // ... rest of the configuration
  });
};
```

### 5.5 Environment Variables Update

#### Frontend `.env` updates
```env
# Remove Supabase variables
# VITE_SUPABASE_URL=
# VITE_SUPABASE_ANON_KEY=

# Add API URL
VITE_API_URL=http://localhost:3001
VITE_APP_URL=http://localhost:5173
```

---

## Data Migration Strategy

### 6.1 Export from Supabase

#### Export Users Data
```sql
-- Export users table
COPY (
  SELECT id, email, created_at, updated_at, 
         raw_user_meta_data->>'full_name' as full_name,
         raw_user_meta_data->>'avatar_url' as avatar_url,
         'free' as subscription_tier
  FROM auth.users
) TO '/tmp/users_export.csv' WITH CSV HEADER;
```

#### Export Custom Tables
```sql
-- Export each custom table
COPY users TO '/tmp/users_data.csv' WITH CSV HEADER;
COPY session_bridge_tokens TO '/tmp/bridge_tokens.csv' WITH CSV HEADER;
COPY session_sync_logs TO '/tmp/sync_logs.csv' WITH CSV HEADER;
-- ... other tables
```

### 6.2 Transform Data

#### Create transformation script (`scripts/transform_data.ts`)
```typescript
import csv from 'csv-parser';
import { createWriteStream } from 'fs';

// Transform Supabase auth users to PostgreSQL users format
function transformUsers(inputFile: string, outputFile: string) {
  // Read CSV, transform data, write new CSV
}

// Transform other tables as needed
```

### 6.3 Import to PostgreSQL

#### Import Script (`scripts/import_data.ts`)
```typescript
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function importUsers() {
  // Read transformed CSV and create users with hashed passwords
  // Note: Passwords will need to be reset or set to default
}
```

### 6.4 Password Handling

Since we can't export password hashes from Supabase auth:
1. **Option A**: Set all users to a default password and force reset
2. **Option B**: Send password reset emails to all users
3. **Option C**: Implement a one-time migration flow

---

## Implementation Timeline

### Phase 1: Backend Setup (2-3 days)
- [ ] Setup Express.js project
- [ ] Configure PostgreSQL database
- [ ] Setup Prisma ORM
- [ ] Create basic project structure
- [ ] Test database connection

### Phase 2: Database & Auth (3-4 days)
- [ ] Create complete database schema
- [ ] Implement authentication system
- [ ] Setup JWT token handling
- [ ] Create auth middleware
- [ ] Test authentication flows

### Phase 3: API Endpoints (2-3 days)
- [ ] Implement user management APIs
- [ ] Create admin functionality APIs
- [ ] Add usage analytics endpoints
- [ ] Implement error handling
- [ ] Add request validation

### Phase 4: Frontend Integration (2-3 days)
- [ ] Create API client
- [ ] Update AuthContext
- [ ] Migrate data hooks
- [ ] Update all components
- [ ] Test frontend functionality

### Phase 5: Testing & Migration (1 day)
- [ ] Export data from Supabase
- [ ] Transform and import data
- [ ] End-to-end testing
- [ ] Performance verification
- [ ] Deploy to staging

---

## Rollback Strategy

### Emergency Rollback
1. Revert environment variables to Supabase
2. Restore Supabase client in frontend
3. Switch DNS back to original setup
4. Monitor for issues

### Gradual Rollback
1. Run both systems in parallel
2. Gradually migrate users
3. Compare data consistency
4. Switch over when confident

---

## Success Criteria

- [ ] All users can login with email/password
- [ ] Admin functionality fully working
- [ ] User profiles accessible and editable
- [ ] Usage analytics displaying correctly
- [ ] Performance equal or better than Supabase
- [ ] Zero data loss during migration
- [ ] All error cases handled gracefully
- [ ] Security audit passed
