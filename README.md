# AlgoRace

AlgoRace is a coding race app. You log in, pick a problem, race another player, submit code, and watch the match move in real time.

It is live here:

**App:** https://algorace-omega.vercel.app  
**API:** https://algorace-api-lum7.onrender.com

## Why I Built This

I wanted AlgoRace to feel closer to an actual competitive coding arena than a normal practice page. Not just "solve a problem and see a result", but a proper race flow with users, ratings, matchmaking, live updates, match history, and a backend that actually runs outside my laptop.

The hard part was not only building the screens. The tough part was making the whole thing behave like one real product:

- frontend on Vercel
- API on Render
- PostgreSQL database
- JWT auth
- Socket.IO for live race state
- Drizzle schema and seeded problems
- CORS and production env vars wired correctly
- Vite build pointing to the real hosted API, not localhost

That deployment fight was honestly a big part of the project. Getting the Vercel app and Render API to finally talk to each other cleanly was the moment it started feeling real.

## What It Has

- Register and login
- Protected user sessions
- Dashboard with player stats
- Problem list and practice mode
- Race lobby
- Real-time match updates
- Code submissions
- Ratings, wins, losses, and match history
- Leaderboard
- User profiles
- Friends and challenges

## Stack

Frontend:

- React
- Vite
- TypeScript
- Tailwind CSS
- TanStack Query
- shadcn-style components

Backend:

- Express
- Socket.IO
- PostgreSQL
- Drizzle ORM
- JWT auth
- bcrypt password hashing

Deployment:

- Vercel for the frontend
- Render for the API
- Neon/Postgres-compatible database setup

## Running Locally

Install dependencies:

```bash
pnpm install
```

Start the API:

```bash
pnpm --filter @workspace/api-server run dev
```

Start the app:

```bash
pnpm --filter @workspace/algorace run dev
```

For local frontend development, use:

```text
VITE_API_URL=http://localhost:8080
```

For production, Vercel uses:

```text
VITE_API_URL=https://algorace-api-lum7.onrender.com
```

## Current Status

AlgoRace is deployed and working end to end. The frontend is live on Vercel, the API is live on Render, login works, and the production app is connected to the correct backend.
