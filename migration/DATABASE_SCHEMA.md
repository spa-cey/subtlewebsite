# PostgreSQL Database Schema

## Complete Prisma Schema Definition

This document contains the complete Prisma schema for the PostgreSQL migration.

### File: `backend/prisma/schema.prisma`

```prisma
// This is your Prisma schema file,
// learn more about it in the docs: https://pris.ly/d/prisma-schema

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model User {
  id               String    @id @default(cuid())
  email            String    @unique
  passwordHash     String    @map("password_hash")
  fullName         String?   @map("full_name")
  avatarUrl        String?   @map("avatar_url")
  subscriptionTier String    @default("free") @map("subscription_tier")
  emailVerified    Boolean   @default(false) @map("email_verified")
  createdAt        DateTime  @default(now()) @map("created_at")
  updatedAt        DateTime  @updatedAt @map("updated_at")

  // Relationships
  sessions         Session[]
  userActivity     UserActivity[]
  adminNotesAsUser AdminNote[] @relation("UserNotes")
  adminNotesAsAdmin AdminNote[] @relation("AdminNotes") 
  usageMetrics     UserUsageMetric[]
  billingHistory   BillingHistory[]
  auditLogsAsUser  AuditLog[] @relation("UserAuditLogs")
  auditLogsAsAdmin AuditLog[] @relation("AdminAuditLogs")

  @@map("users")
}

model Session {
  id           String   @id @default(cuid())
  userId       String   @map("user_id")
  refreshToken String   @unique @map("refresh_token")
  expiresAt    DateTime @map("expires_at")
  createdAt    DateTime @default(now()) @map("created_at")

  // Relationships
  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@map("sessions")
}

model UserActivity {
  id        String   @id @default(cuid())
  userId    String   @map("user_id")
  action    String
  data      Json?
  createdAt DateTime @default(now()) @map("created_at")

  // Relationships
  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@map("user_activity")
}

model AdminNote {
  id        String   @id @default(cuid())
  userId    String   @map("user_id")
  adminId   String   @map("admin_id")
  note      String
  isFlagged Boolean  @default(false) @map("is_flagged")
  createdAt DateTime @default(now()) @map("created_at")

  // Relationships
  user  User @relation("UserNotes", fields: [userId], references: [id], onDelete: Cascade)
  admin User @relation("AdminNotes", fields: [adminId], references: [id])

  @@map("admin_notes")
}

model UserUsageMetric {
  id           String   @id @default(cuid())
  userId       String   @map("user_id")
  requestCount Int      @default(0) @map("request_count")
  totalTokens  Int      @default(0) @map("total_tokens")
  totalCost    Decimal  @default(0) @map("total_cost") @db.Decimal(10, 4)
  featureType  String?  @map("feature_type")
  createdAt    DateTime @default(now()) @map("created_at")

  // Relationships
  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@map("user_usage_metrics")
}

model BillingHistory {
  id          String   @id @default(cuid())
  userId      String   @map("user_id")
  amount      Decimal  @db.Decimal(10, 2)
  currency    String   @default("USD") @db.VarChar(3)
  status      String   @db.VarChar(50)
  description String?
  createdAt   DateTime @default(now()) @map("created_at")

  // Relationships
  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@map("billing_history")
}

model AuditLog {
  id        String   @id @default(cuid())
  adminId   String   @map("admin_id")
  userId    String?  @map("user_id")
  action    String
  details   Json?
  ipAddress String?  @map("ip_address")
  createdAt DateTime @default(now()) @map("created_at")

  // Relationships
  admin User  @relation("AdminAuditLogs", fields: [adminId], references: [id])
  user  User? @relation("UserAuditLogs", fields: [userId], references: [id])

  @@map("audit_logs")
}

// Future tables for Mac app integration (Phase 2)
// Commented out for Phase 1

// model BridgeToken {
//   id          String    @id @default(cuid())
//   token       String    @unique
//   userId      String    @map("user_id")
//   sessionData Json?     @map("session_data")
//   clientIp    String?   @map("client_ip")
//   userAgent   String?   @map("user_agent")
//   expiresAt   DateTime  @map("expires_at")
//   usedAt      DateTime? @map("used_at")
//   createdAt   DateTime  @default(now()) @map("created_at")

//   // Relationships
//   user User @relation(fields: [userId], references: [id], onDelete: Cascade)

//   @@map("bridge_tokens")
// }

// model SyncLog {
//   id           String   @id @default(cuid())
//   userId       String   @map("user_id")
//   eventType    String   @map("event_type")
//   eventSource  String   @map("event_source")
//   data         Json?
//   clientIp     String?  @map("client_ip")
//   userAgent    String?  @map("user_agent")
//   success      Boolean  @default(true)
//   errorMessage String?  @map("error_message")
//   createdAt    DateTime @default(now()) @map("created_at")

//   // Relationships
//   user User @relation(fields: [userId], references: [id], onDelete: Cascade)

//   @@map("sync_logs")
// }
```

---

## Database Indexes

Additional indexes for performance optimization:

```sql
-- Performance indexes
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_subscription_tier ON users(subscription_tier);
CREATE INDEX idx_users_created_at ON users(created_at);

CREATE INDEX idx_sessions_user_id ON sessions(user_id);
CREATE INDEX idx_sessions_expires_at ON sessions(expires_at);

CREATE INDEX idx_user_activity_user_id ON user_activity(user_id);
CREATE INDEX idx_user_activity_created_at ON user_activity(created_at);

CREATE INDEX idx_admin_notes_user_id ON admin_notes(user_id);
CREATE INDEX idx_admin_notes_admin_id ON admin_notes(admin_id);
CREATE INDEX idx_admin_notes_is_flagged ON admin_notes(is_flagged);

CREATE INDEX idx_user_usage_metrics_user_id ON user_usage_metrics(user_id);
CREATE INDEX idx_user_usage_metrics_created_at ON user_usage_metrics(created_at);
CREATE INDEX idx_user_usage_metrics_feature_type ON user_usage_metrics(feature_type);

CREATE INDEX idx_billing_history_user_id ON billing_history(user_id);
CREATE INDEX idx_billing_history_status ON billing_history(status);
CREATE INDEX idx_billing_history_created_at ON billing_history(created_at);

CREATE INDEX idx_audit_logs_admin_id ON audit_logs(admin_id);
CREATE INDEX idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at);
```

---

## Migration Commands

### Initial Setup

```bash
# Navigate to backend directory
cd backend

# Initialize Prisma (if not done)
npx prisma init

# Generate migration
npx prisma migrate dev --name initial_schema

# Generate Prisma Client
npx prisma generate

# View database in browser
npx prisma studio
```

### Reset Database (Development Only)

```bash
# Reset database and run migrations
npx prisma migrate reset

# Force reset without confirmation
npx prisma migrate reset --force
```

---

## Database Functions

### User Statistics Function

```sql
-- Function to get user statistics
CREATE OR REPLACE FUNCTION get_user_stats()
RETURNS TABLE(
    total_users BIGINT,
    active_users_today BIGINT,
    new_users_this_week BIGINT,
    total_usage_metrics BIGINT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        (SELECT COUNT(*) FROM users) as total_users,
        (SELECT COUNT(*) FROM users WHERE created_at >= CURRENT_DATE) as active_users_today,
        (SELECT COUNT(*) FROM users WHERE created_at >= CURRENT_DATE - INTERVAL '7 days') as new_users_this_week,
        (SELECT COUNT(*) FROM user_usage_metrics) as total_usage_metrics;
END;
$$ LANGUAGE plpgsql;
```

### User Activity Summary Function

```sql
-- Function to get user activity summary
CREATE OR REPLACE FUNCTION get_user_activity_summary(user_uuid UUID)
RETURNS TABLE(
    total_actions BIGINT,
    actions_this_week BIGINT,
    last_activity TIMESTAMP,
    most_common_action TEXT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        (SELECT COUNT(*) FROM user_activity WHERE user_id = user_uuid) as total_actions,
        (SELECT COUNT(*) FROM user_activity WHERE user_id = user_uuid AND created_at >= CURRENT_DATE - INTERVAL '7 days') as actions_this_week,
        (SELECT MAX(created_at) FROM user_activity WHERE user_id = user_uuid) as last_activity,
        (SELECT action FROM user_activity WHERE user_id = user_uuid GROUP BY action ORDER BY COUNT(*) DESC LIMIT 1) as most_common_action;
END;
$$ LANGUAGE plpgsql;
```

---

## Data Types & Constraints

### User Table Constraints

```sql
-- Email validation
ALTER TABLE users ADD CONSTRAINT valid_email CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$');

-- Subscription tier validation
ALTER TABLE users ADD CONSTRAINT valid_subscription_tier CHECK (subscription_tier IN ('free', 'pro', 'enterprise'));

-- Password hash length (bcrypt hashes are 60 characters)
ALTER TABLE users ADD CONSTRAINT valid_password_hash CHECK (LENGTH(password_hash) = 60);
```

### Session Table Constraints

```sql
-- Ensure expiration is in the future when created
ALTER TABLE sessions ADD CONSTRAINT future_expiration CHECK (expires_at > created_at);
```

### Billing History Constraints

```sql
-- Ensure positive amounts
ALTER TABLE billing_history ADD CONSTRAINT positive_amount CHECK (amount > 0);

-- Valid status values
ALTER TABLE billing_history ADD CONSTRAINT valid_status CHECK (status IN ('pending', 'completed', 'failed', 'refunded'));
```

---

## Seed Data

### Development Seed Script

```sql
-- Insert admin user (password: 'admin123')
INSERT INTO users (email, password_hash, full_name, subscription_tier, email_verified) VALUES
('admin@gosubtle.app', '$2b$10$rZ5ZjNRYGnJkZrqGF2.ZJeHqZ5wN5z5GZ5ZjNRYGnJkZrqGF2.ZJe', 'Admin User', 'enterprise', true);

-- Insert test users
INSERT INTO users (email, password_hash, full_name, subscription_tier, email_verified) VALUES
('user1@example.com', '$2b$10$rZ5ZjNRYGnJkZrqGF2.ZJeHqZ5wN5z5GZ5ZjNRYGnJkZrqGF2.ZJe', 'Test User 1', 'free', true),
('user2@example.com', '$2b$10$rZ5ZjNRYGnJkZrqGF2.ZJeHqZ5wN5z5GZ5ZjNRYGnJkZrqGF2.ZJe', 'Test User 2', 'pro', true);

-- Insert sample usage metrics
INSERT INTO user_usage_metrics (user_id, request_count, total_tokens, total_cost, feature_type) 
SELECT 
    u.id,
    FLOOR(RANDOM() * 100 + 1)::INT,
    FLOOR(RANDOM() * 10000 + 100)::INT,
    ROUND((RANDOM() * 50 + 1)::NUMERIC, 2),
    CASE FLOOR(RANDOM() * 3)
        WHEN 0 THEN 'chat'
        WHEN 1 THEN 'completion'
        ELSE 'analysis'
    END
FROM users u;
```

---

## Backup & Recovery

### Backup Script

```bash
#!/bin/bash
# backup_database.sh

DB_NAME="subtle_db"
BACKUP_DIR="./backups"
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="$BACKUP_DIR/subtle_db_backup_$DATE.sql"

# Create backup directory
mkdir -p $BACKUP_DIR

# Create backup
pg_dump $DB_NAME > $BACKUP_FILE

echo "Backup created: $BACKUP_FILE"
```

### Restore Script

```bash
#!/bin/bash
# restore_database.sh

DB_NAME="subtle_db"
BACKUP_FILE=$1

if [ -z "$BACKUP_FILE" ]; then
    echo "Usage: ./restore_database.sh <backup_file>"
    exit 1
fi

# Drop and recreate database
dropdb $DB_NAME
createdb $DB_NAME

# Restore from backup
psql $DB_NAME < $BACKUP_FILE

echo "Database restored from: $BACKUP_FILE"
```

---

## Performance Optimization

### Connection Pooling Configuration

```typescript
// backend/src/config/database.ts
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL,
    },
  },
  log: ['query', 'error', 'warn'],
});

// Connection pool configuration in DATABASE_URL
// postgresql://user:password@localhost:5432/subtle_db?connection_limit=10&pool_timeout=20
```

### Query Optimization

```typescript
// Efficient user listing with pagination
async function getUsersWithPagination(page: number, pageSize: number) {
  const [users, total] = await Promise.all([
    prisma.user.findMany({
      skip: (page - 1) * pageSize,
      take: pageSize,
      select: {
        id: true,
        email: true,
        fullName: true,
        subscriptionTier: true,
        createdAt: true,
        _count: {
          select: {
            userActivity: true,
            usageMetrics: true,
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    }),
    prisma.user.count()
  ]);

  return {
    users,
    total,
    totalPages: Math.ceil(total / pageSize),
    currentPage: page
  };
}
```

---

## Security Considerations

### Row Level Security (Future Enhancement)

```sql
-- Enable RLS on users table
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only see their own data
CREATE POLICY user_own_data ON users
    FOR ALL USING (id = current_setting('app.current_user_id')::UUID);

-- Policy: Admins can see all data
CREATE POLICY admin_all_data ON users
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE id = current_setting('app.current_user_id')::UUID 
            AND subscription_tier = 'enterprise'
        )
    );
```

### Data Encryption

```sql
-- Encrypt sensitive fields (future enhancement)
-- Install pgcrypto extension
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Example: Encrypt avatar URLs if they contain sensitive data
-- ALTER TABLE users ADD COLUMN avatar_url_encrypted BYTEA;
```

---

## Monitoring Queries

### Database Health Check

```sql
-- Check database connections
SELECT 
    pid,
    usename,
    application_name,
    client_addr,
    state,
    query_start,
    query
FROM pg_stat_activity 
WHERE datname = 'subtle_db';

-- Check table sizes
SELECT 
    schemaname,
    tablename,
    pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as size
FROM pg_tables 
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;

-- Check index usage
SELECT 
    schemaname,
    tablename,
    attname,
    n_distinct,
    correlation
FROM pg_stats 
WHERE schemaname = 'public';
```

---

## Migration Notes

### Changes from Supabase Schema

1. **User Authentication**: Moved from `auth.users` to custom `users` table
2. **UUIDs**: Using `cuid()` instead of `uuid()` for better performance
3. **Naming**: Snake_case in database, camelCase in Prisma models
4. **Relationships**: Explicit foreign key relationships
5. **Constraints**: Added validation constraints for data integrity
6. **Indexes**: Added performance indexes for common queries

### Phase 1 vs Phase 2 Tables

**Phase 1 (Current)**:
- users
- sessions 
- user_activity
- admin_notes
- user_usage_metrics
- billing_history
- audit_logs

**Phase 2 (Future)**:
- bridge_tokens (Mac app integration)
- sync_logs (Real-time sync)
- Additional session management tables
