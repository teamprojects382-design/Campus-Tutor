# CampusTutor

CampusTutor is an AI revision tutor for university students. Phase 0 sets up the foundation: project scaffold, environment validation, Supabase integration, and a minimal landing page.

## Prerequisites

- Node.js 20+
- pnpm 9+
- A Supabase project or a local Supabase instance

## Setup

1. Install dependencies:
   `pnpm install`
2. Copy the example env file:
   `cp .env.example .env.local`
3. Fill in the required values for your environment.
4. Run the development server:
   `pnpm dev`

## Environment variables

The app validates required environment settings at module load. See `.env.example` for the exact required variables, including the Supabase public keys and the AI defaults.

## Running Supabase migrations

1. Start the local Supabase stack:
   `supabase start`
2. Push local migrations:
   `supabase db push`
3. Check status if needed:
   `supabase status`

## Scripts

- `pnpm dev` — start the Next.js app
- `pnpm build` — production build
- `pnpm start` — run the production build locally
- `pnpm lint` — lint the project
- `pnpm lint:fix` — autofix safe linting issues
- `pnpm format` — format files with Prettier
- `pnpm typecheck` — TypeScript validation
- `pnpm test` — run Vitest tests
- `pnpm test:watch` — watch Vitest tests
- `pnpm test:e2e` — Playwright end-to-end tests

## Project structure

- `src/app` — App Router pages and global layout
- `src/components/ui` — shadcn-compatible UI primitives
- `src/features` — domain modules for future tasks
- `src/lib` — environment, logging, errors, result wrappers, and Supabase clients
- `supabase/migrations` — SQL migrations
- `tests/unit` — unit tests
- `tests/e2e` — Playwright tests

## Deployment notes

This Phase 0 release intentionally keeps deployment assumptions minimal. Hosted deployment should only be planned after verifying the required Supabase and environment settings in the target environment.
