# Vercel Functions ES Module Fix

## Problem

The error "Cannot require() ES Module ... in a cycle" occurs when Vercel Functions try to use ES modules in a CommonJS context. This is a common issue with packages like `bcryptjs` and others that have moved to ES modules.

## Root Cause

1. **Module System Mismatch**: Vercel Functions run in a Node.js environment that expects CommonJS modules by default
2. **TypeScript Compilation**: The API routes were being compiled with ES module syntax
3. **Missing Configuration**: No specific tsconfig for API routes to ensure CommonJS output

## Solution Applied

### 1. API-Specific TypeScript Configuration

Created `/api/tsconfig.json` with CommonJS target:
```json
{
  "compilerOptions": {
    "target": "ES2018",
    "module": "commonjs",
    "esModuleInterop": true,
    "moduleResolution": "node"
  }
}
```

### 2. Module Compatibility Layer

Created `/api/_lib/bcrypt-compat.ts` to handle both CommonJS and ES module imports:
```typescript
export async function getBcrypt() {
  try {
    return require('bcryptjs');
  } catch {
    const mod = await import('bcryptjs');
    return mod.default || mod;
  }
}
```

### 3. API Package Configuration

Created `/api/package.json` with explicit CommonJS type:
```json
{
  "type": "commonjs",
  "dependencies": {
    "@prisma/client": "6.10.1",
    "bcryptjs": "^2.4.3"
  }
}
```

### 4. Updated Vercel Configuration

Enhanced `vercel.json` with:
- Explicit Node.js runtime version
- Prisma schema inclusion
- Proper build commands
- Custom install command for API dependencies

### 5. Build Process Improvements

- Created `vercel-prebuild.js` script to handle:
  - Prisma client generation
  - Node_modules symlink/copy for API functions
  - Schema file copying to API directory

## Deployment Steps

1. **Install Dependencies**:
   ```bash
   npm install
   ```

2. **Set Environment Variables** in Vercel:
   - All database and JWT variables
   - Ensure `DATABASE_URL` is properly set

3. **Deploy**:
   ```bash
   vercel --prod
   ```

## Why This Works

1. **CommonJS Output**: API functions are compiled to CommonJS format
2. **Runtime Compatibility**: Explicit Node.js 18.x runtime ensures consistency
3. **Module Resolution**: Compatibility layer handles both module formats
4. **Build Process**: Ensures all dependencies are available to functions

## Additional Notes

- The `bcrypt-compat.ts` pattern can be applied to other problematic ES modules
- The API directory now has its own module context
- Prisma schema is included with each function deployment
- Build process is optimized for Vercel's serverless environment

## Testing

After deployment, test all API endpoints:
- `/api/auth/login`
- `/api/auth/register`
- `/api/ai/chat`
- etc.

Each should respond without module loading errors.