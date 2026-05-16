# AlgoRace

AlgoRace is a real-time competitive programming platform built for head-to-head coding races. It brings together authentication, live matchmaking, problem practice, race rooms, submissions, ratings, leaderboards, and player profiles into one full-stack application.

Live app: https://algorace-omega.vercel.app  
API service: https://algorace-api-lum7.onrender.com

## What Makes It Special

AlgoRace is more than a static coding dashboard. It is a production-style system with a React frontend, an Express API, PostgreSQL persistence, JWT authentication, WebSocket-based race updates, seeded problem data, and deployment across Vercel and Render.

Getting it production-ready required solving the parts that usually make full-stack projects difficult: monorepo builds, environment variables across different platforms, API routing, CORS, database provisioning, deployment outputs, and frontend builds that must point to the correct hosted backend. The final deployment now connects the Vercel frontend to the Render API cleanly.

## Features

- User registration and login
- JWT-protected API routes
- Competitive race lobby
- Real-time socket updates
- Practice problems and submissions
- Match history and rating tracking
- Leaderboard and user profiles
- PostgreSQL database schema managed with Drizzle
- Production deployment on Vercel and Render

## Tech Stack

- React, Vite, TypeScript
- Express and Socket.IO
- PostgreSQL with Drizzle ORM
- TanStack Query
- Tailwind CSS and shadcn-style UI components
- Vercel for the frontend
- Render for the API service

## Deployment

The production frontend is hosted on Vercel:

```text
https://algorace-omega.vercel.app
```

The production API is hosted on Render:

```text
https://algorace-api-lum7.onrender.com
```

The Vercel production environment uses:

```text
VITE_API_URL=https://algorace-api-lum7.onrender.com
```

The Render API expects:

```text
DATABASE_URL
JWT_SECRET
CORS_ORIGIN=https://algorace-omega.vercel.app
NODE_ENV=production
```

## Local Development

Install dependencies:

```bash
pnpm install
```

Run the API:

```bash
pnpm --filter @workspace/api-server run dev
```

Run the frontend:

```bash
pnpm --filter @workspace/algorace run dev
```

The local frontend expects `VITE_API_URL` to point at the API server, usually:

```text
VITE_API_URL=http://localhost:8080
```

## Status

AlgoRace is live and connected end to end: the Vercel frontend now talks to the correct Render backend, and the API responds with the expected authenticated JSON responses.
