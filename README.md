# Commit Coach

Commit Coach is a hackathon-ready Next.js project that turns resolutions into weekly wins with AI agents orchestrated by Opik.

## Stack
- Next.js App Router + TypeScript + Tailwind
- Opik for AI agent orchestration + tracing
- Opik for AI agent orchestration
- Supabase for auth + storage

## Getting started

```bash
npm install
```

Copy the environment template and fill in your keys:

```bash
cp .env.example .env.local
```

Run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Export brand PNGs

```bash
npm run export:brand
```

This generates `icon-512.png` and `icon-1024.png` from `public/brand/icon.svg`.

## Project routes
- `/` marketing landing page
- `/app` dashboard
- `/app/onboarding` onboarding flow
- `/app/goal/[id]` goal details
- `/app/review` weekly review

## Agent API routes

All routes expect JSON and return structured JSON validated by Zod.

- `POST /api/agents/intake`
- `POST /api/agents/planner`
- `POST /api/agents/accountability`
- `POST /api/agents/reflection`

## Opik agent plan (starter)
- Intake agent → converts the resolution into a SMART goal.
- Planner agent → builds weekly milestones + daily tasks.
- Accountability agent → runs check-ins and nudges.
- Reflection agent → summarizes wins and adjusts the plan.
