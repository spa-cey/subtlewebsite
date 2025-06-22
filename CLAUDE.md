# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a React-based web application built with Vite, TypeScript, and Tailwind CSS. It was created using Lovable.dev and features a modern SaaS/product website with landing pages, user management, and various UI components.

## Essential Commands

```bash
# Development
npm run dev          # Start development server on http://localhost:5173

# Building
npm run build        # Production build
npm run build:dev    # Development build
npm run preview      # Preview production build

# Code Quality
npm run lint         # Run ESLint for code quality checks
```

## Architecture and Code Patterns

### Component Organization
Components are organized by feature in `src/components/`:
- `ui/` - Shadcn UI primitives and base components
- `landing/` - Landing page specific components
- `manage/` - Management feature components
- `projects/` - Project-related components
- `search/` - Search functionality components

### Key Architectural Patterns

1. **Routing**: Centralized React Router v6 setup in App.tsx with PageTransition wrapper for all routes
2. **State Management**: 
   - React Context for global state (Auth, Theme)
   - React Query for server state
   - Local component state with useState
3. **Styling**: Tailwind CSS with cn() utility for className merging
4. **Components**: Shadcn UI components with CVA for variants
5. **Animation**: AnimatedTransition wrapper and useAnimateIn hook for staggered reveals

### Context Provider Hierarchy
```tsx
QueryClientProvider
  └── ThemeProvider
      └── AuthProvider
          └── TooltipProvider
              └── App content
```

### Important Conventions

1. **TypeScript**: Project uses TypeScript with relaxed settings (no implicit any allowed)
2. **Imports**: Use `@/` alias for src directory imports
3. **Component Props**: All components should have TypeScript interfaces
4. **Animations**: Use existing animation utilities and patterns
5. **Forms**: Use React Hook Form with Zod validation

### Current Limitations

- No backend API integration implemented (only frontend)
- No testing framework configured
- No environment variables setup
- Waitlist form only logs to console (TODO: backend integration)

### File Structure Patterns

- Feature-based component grouping
- Centralized types in `src/types/`
- Mock data colocated with components
- Custom hooks in `src/hooks/`
- Utility functions split between `src/utils/` and `src/lib/`

When making changes, follow the existing patterns for consistency, especially for component structure, animation usage, and TypeScript conventions.