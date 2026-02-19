# PowerSense Technologies Ltd — Smart Power Management Demo

Software-only demo for hostel electricity monitoring.

## Stack
- React + Vite + TypeScript
- TailwindCSS
- Recharts
- React Router
- Node.js + Express + TypeScript
- SQLite with better-sqlite3
- concurrently for running client and server together

## Project Structure
- `client/` - React web app and admin dashboard
- `server/` - Express API with SQLite and seed data

## Run
```bash
npm install
npm run dev
```

Client: http://localhost:5173
Server API: http://localhost:4000/api

## Frontend quickstart (CashflowVaults dashboard)

This repo includes a Next.js App Router dashboard at `/cashflow` for the Avalanche Fuji CashflowVaults deployment.

```bash
# install frontend dependencies if needed
npm install

# run next dev server (if your setup uses a dedicated Next command)
npm run next:dev
```

Then open: `http://localhost:3000/cashflow`.

> Note: if your local scripts currently run the Vite + Express demo, add/use a Next.js dev script that starts this app directory.
