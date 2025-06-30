# Subtle Backend

Express.js + TypeScript backend for the Subtle application.

## Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

## Scripts

- `npm run dev` - Start development server with auto-reload
- `npm run build` - Compile TypeScript to JavaScript
- `npm run start` - Start production server
- `npm run clean` - Remove build directory

## Project Structure

```
backend/
├── src/
│   ├── server.ts         # Main server file
│   ├── routes/           # API route handlers
│   ├── middleware/       # Express middleware
│   ├── utils/            # Utility functions
│   └── types/            # TypeScript type definitions
├── dist/                 # Compiled JavaScript (generated)
├── .env.example          # Environment variables template
├── tsconfig.json         # TypeScript configuration
└── package.json          # Project dependencies and scripts
```

## Environment Variables

Copy `.env.example` to `.env` and configure:

- `PORT` - Server port (default: 3001)
- `NODE_ENV` - Environment (development/production)
- `FRONTEND_URL` - Frontend URL for CORS (default: http://localhost:5173)

## API Endpoints

- `GET /api/health` - Health check endpoint
- `GET /api` - API information

## Development

The server runs on port 3001 by default and has CORS configured for the frontend running on port 5173.

Health check: http://localhost:3001/api/health