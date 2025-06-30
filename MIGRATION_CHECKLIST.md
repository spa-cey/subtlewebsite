# Supabase to PostgreSQL Migration Checklist (Simplified & Focused)

This document tracks the migration from Supabase to a local PostgreSQL database with simple email/password authentication.

## Overview
- **Current Stack**: React + Vite + Supabase (Auth + Database)
- **Target Stack**: React + Vite + Express.js API + PostgreSQL + JWT Auth
- **Estimated Timeline**: 10-12 days
- **Database Choice**: PostgreSQL (free, open-source, minimal refactoring needed)
- **Auth Solution**: Custom JWT with bcrypt (simple, controlled)

## Key Simplifications
- ✅ Using Express.js + JWT instead of NextAuth.js
- ✅ Keeping Vite + React frontend unchanged
- ✅ No OAuth/third-party logins (only email/password)
- ✅ No magic links (Phase 1)
- ✅ No Mac app integration (Phase 2)
- ✅ Simplified to core website functionality first

## Migration Documentation

### Complete Documentation Set
- [📋 MIGRATION_SUMMARY.md](migration/MIGRATION_SUMMARY.md) - High-level overview
- [📝 MIGRATION_DETAILED_PLAN.md](migration/MIGRATION_DETAILED_PLAN.md) - Technical implementation
- [✅ MIGRATION_PROGRESS.md](migration/MIGRATION_PROGRESS.md) - Progress tracking checklist
- [🗄️ DATABASE_SCHEMA.md](migration/DATABASE_SCHEMA.md) - Complete PostgreSQL schema
- [🚀 API_ENDPOINTS.md](migration/API_ENDPOINTS.md) - Backend API documentation

## Quick Start Migration Process

### Phase 1: Backend Setup (2-3 days)
```bash
# 1. Create backend directory
mkdir backend && cd backend

# 2. Initialize Express.js project
npm init -y
npm install express @prisma/client cors helmet jsonwebtoken bcryptjs express-validator dotenv express-rate-limit
npm install -D @types/express @types/jsonwebtoken @types/bcryptjs @types/cors typescript prisma ts-node-dev @types/node

# 3. Setup PostgreSQL database
createdb subtle_db

# 4. Initialize Prisma
npx prisma init
```

### Phase 2: Database & Auth (3-4 days)
```bash
# 1. Setup Prisma schema (see DATABASE_SCHEMA.md)
# 2. Run migrations
npx prisma migrate dev --name initial_schema
npx prisma generate

# 3. Implement authentication system
# 4. Create JWT utilities and middleware
```

### Phase 3: API Endpoints (2-3 days)
```bash
# 1. Implement all API routes (see API_ENDPOINTS.md)
# 2. Add admin functionality
# 3. Create usage analytics endpoints
```

### Phase 4: Frontend Integration (2-3 days)
```bash
# 1. Remove Supabase
npm uninstall @supabase/supabase-js

# 2. Add API client
npm install axios

# 3. Update auth context and data hooks
# 4. Test all functionality
```

### Phase 5: Data Migration (1 day)
```bash
# 1. Export from Supabase
# 2. Transform data format
# 3. Import to PostgreSQL
# 4. End-to-end testing
```

## Environment Variables

### Backend (.env)
```env
DATABASE_URL="postgresql://user:password@localhost:5432/subtle_db"
JWT_SECRET="your-super-secret-jwt-key"
JWT_EXPIRES_IN="15m"
JWT_REFRESH_EXPIRES_IN="30d"
PORT=3001
NODE_ENV=development
FRONTEND_URL="http://localhost:5173"
```

### Frontend (.env)
```env
# Remove these
# VITE_SUPABASE_URL=
# VITE_SUPABASE_ANON_KEY=

# Add these
VITE_API_URL=http://localhost:3001
VITE_APP_URL=http://localhost:5173
```

## Technology Stack Changes

### Remove
- `@supabase/supabase-js`
- Supabase realtime features
- OAuth providers (Phase 1)
- Magic link authentication (Phase 1)

### Add
- Express.js + TypeScript backend
- Prisma ORM + PostgreSQL
- JWT authentication with refresh tokens
- bcryptjs for password hashing
- Axios for API calls

### Keep Everything Else
- Vite + React + TypeScript
- TailwindCSS + Shadcn/ui
- React Query for state management
- React Router for navigation
- All existing components and pages

## Success Criteria

### Infrastructure Complete ✅
- [x] Backend server operational ✅ (Port 3001)
- [x] PostgreSQL database running ✅ (subtle_db)
- [x] Prisma ORM configured ✅ (All tables created)
- [x] Development environment stable ✅ (Auto-reload working)
- [x] Database connectivity verified ✅ (test-db.ts passed)
- [x] CORS configured for frontend ✅ (Port 5173)
- [x] Health check endpoint ✅ (/api/health)

### Must Have (Pending API Development) ⏳
- [ ] Users can register with email/password
- [ ] Users can login and logout
- [ ] User sessions persist across page reloads
- [ ] User profile data accessible and editable
- [ ] Admin dashboard fully functional
- [ ] Usage analytics working
- [x] Zero data loss during migration ✅ (No production data to lose)
- [ ] Performance equal or better than Supabase

### Phase 2 (Future) 🔮
- [ ] Mac app bridge integration
- [ ] Real-time session synchronization
- [ ] OAuth providers (Google, GitHub, Apple)
- [ ] Magic link authentication
- [ ] Email verification system

## Architecture Comparison

### Before (Supabase)
```
Vite + React ←→ Supabase (Auth + DB + Realtime)
```

### After (Phase 1)
```
Vite + React ←→ Express.js API ←→ PostgreSQL
                      ↓
                 JWT Auth + bcrypt
```

### After (Phase 2)
```
Vite + React ←→ Express.js API ←→ PostgreSQL
       ↓              ↓
   Socket.io    Mac App Bridge
```

## Key Benefits

1. **Cost Savings**: No monthly Supabase fees
2. **Full Control**: Complete ownership of auth and data
3. **Performance**: Local database for development
4. **Simplicity**: Focus on core features first
5. **Flexibility**: Custom implementation for specific needs
6. **Learning**: Better understanding of auth and database systems

## Risk Mitigation

- Keep Vite/React frontend unchanged (low risk)
- Phase-based implementation (controlled rollout)
- Complete documentation and planning
- Maintain Supabase as backup during migration
- Comprehensive testing at each phase
- Clear rollback strategy

## Getting Started

1. **Read the documentation**: Start with [MIGRATION_SUMMARY.md](migration/MIGRATION_SUMMARY.md)
2. **Review the plan**: Check [MIGRATION_DETAILED_PLAN.md](migration/MIGRATION_DETAILED_PLAN.md)
3. **Track progress**: Use [MIGRATION_PROGRESS.md](migration/MIGRATION_PROGRESS.md)
4. **Reference schema**: See [DATABASE_SCHEMA.md](migration/DATABASE_SCHEMA.md)
5. **API reference**: Use [API_ENDPOINTS.md](migration/API_ENDPOINTS.md)

## Important Notes

- **Phase 1 Focus**: Website functionality only, no Mac app
- **Data Safety**: Multiple backups before any migration
- **Testing**: Comprehensive testing at each step
- **Documentation**: Keep all files updated during migration
- **Rollback**: Always have a way back to Supabase if needed

---

**Ready to start?** Begin with Phase 1 backend setup in [MIGRATION_DETAILED_PLAN.md](migration/MIGRATION_DETAILED_PLAN.md)!
