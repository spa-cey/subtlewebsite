# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Next.js 14+ web application with TypeScript and Tailwind CSS. It features a modern SaaS website for Subtle, a premium macOS AI assistant with admin panel, authentication, and Azure OpenAI integration.

## Essential Commands

```bash
# Development
npm run dev          # Start Next.js development server (default port 3000)

# Database
npx prisma migrate dev --name [migration-name]  # Create new migration
npx prisma generate  # Generate Prisma client
npx prisma studio    # Open Prisma Studio GUI
npx prisma db push   # Push schema changes without migration

# Common Tasks
npm install          # Install all dependencies
npm run postinstall  # Run after install (generates Prisma client)
```



## Development Workflows

When implementing features or fixing issues, follow one of these structured workflows based on the task:

### Workflow 1: Explore → Plan → Confirm → Code → Commit
Use this workflow for bug fixes and complex issues where the root cause needs investigation:
1. **Explore**: Investigate the codebase to understand the issue's root cause
2. **Plan**: Propose multiple solution approaches with pros/cons
3. **Confirm**: Wait for user approval on the chosen approach
4. **Code**: Implement the approved solution
5. **Commit**: Create a descriptive commit with the changes

Example: Debugging issue #983 - investigate first, propose fixes, then implement after approval.

### Workflow 2: Write Tests → Commit → Code → Iterate → Commit
Use this workflow for TDD (Test-Driven Development) when adding new features:
1. **Write Tests**: Create tests that define expected behavior (they will fail initially)
2. **Commit**: Commit the failing tests
3. **Code**: Implement functionality to make tests pass
4. **Iterate**: Refine implementation based on test results
5. **Commit**: Commit the working implementation

Example: Adding link rendering to markdown utilities - write tests first, then implement.

### Workflow 3: Write Code → Screenshot Result → Iterate
Use this workflow for UI/UX implementations that need visual verification:
1. **Write Code**: Implement the UI based on mockups or descriptions
2. **Screenshot Result**: Use tools like Puppeteer to capture the rendered output
3. **Iterate**: Compare with mockups and refine until matching

Example: Implementing a design from mock.png - build, screenshot, and iterate until pixel-perfect.