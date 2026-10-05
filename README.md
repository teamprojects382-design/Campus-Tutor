# CampusTutor

CampusTutor is a university study assistant designed to help students revise smarter with AI-powered support, document ingestion, question generation, and structured study spaces. The project is currently in its Phase 1 authentication and security foundation stage.

## Overview

This repository contains a Next.js App Router application built with TypeScript, Tailwind, shadcn/ui, Supabase, and Zod. The app currently includes:

- a landing page
- user signup, login, logout, and password reset flows
- protected routes and server-side auth checks
- Supabase Auth integration with PostgreSQL RLS policies
- a profile table that is created automatically for each user
- environment validation for required configuration
- local development tooling for Supabase, Vitest, and Playwright

This is not a generic starter app; it is being built as a secure study platform with the authorization boundaries enforced server-side and in the database.

## Tech stack

- Next.js 16 App Router
- React 19
- TypeScript
- Tailwind CSS
- shadcn/ui primitives
- Supabase Auth and Postgres
- Supabase local CLI
- Zod validation
- Vitest for unit tests
- Playwright for end-to-end tests

## Current status

The codebase is actively building toward the study-space and AI features, but the foundation is intentionally focused on authenticated, secure access.

Current verified work includes:

- safe redirect handling for same-origin paths
- server-only route protection via auth helpers and protected pages
- Supabase profile creation via trigger on `auth.users`
- RLS policies restricting profile reads and updates to the current user
- generic auth flow messages to prevent account enumeration
- local Supabase migration setup with `pgcrypto` and `vector` extensions

## Prerequisites

Before working locally, install:

- Node.js 20+
- pnpm 9+
- Docker Desktop (for the local Supabase stack)
- a local or hosted Supabase project if you are targeting a remote environment

## Local setup

1. Install dependencies:

   ```bash
   pnpm install
   ```

2. Copy the example environment file:

   ```bash
   copy .env.example .env.local
   ```

   On macOS/Linux use `cp` instead of `copy`.

3. Fill in your values in `.env.local`.

4. Start the local Supabase stack:

   ```bash
   pnpm db:start
   ```

   or:

   ```bash
   pnpm exec supabase start
   ```

5. Start the app:

   ```bash
   pnpm dev
   ```

## Environment variables

The app validates required environment settings at runtime via `src/lib/env.ts` using Zod. Required variables are defined in `.env.example`.

Essential values include:

- `NEXT_PUBLIC_APP_URL`
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `AI_PROVIDER`
- `AI_API_KEY`
- `AI_MODEL`
- `EMBEDDING_MODEL`
- `MAX_UPLOAD_SIZE_MB`
- `MAX_GENERATIONS_PER_USER_PER_DAY`
- `LOG_LEVEL`

Important notes:

- `SKIP_ENV_VALIDATION` can be set to `true` only for local troubleshooting and should not be used in production.
- The app expects the Supabase project configuration to be valid before server actions or protected routes work correctly.

## Scripts

```bash
pnpm dev
pnpm build
pnpm start
pnpm lint
pnpm lint:fix
pnpm format
pnpm typecheck
pnpm test
pnpm test:watch
pnpm test:e2e
pnpm db:start
pnpm db:stop
pnpm db:reset
pnpm db:types
```

### Script meanings

- `pnpm dev` — run the Next.js development server
- `pnpm build` — run a production build
- `pnpm start` — serve the production build locally
- `pnpm lint` — ESLint validation
- `pnpm typecheck` — TypeScript compile validation
- `pnpm test` — run the Vitest suite
- `pnpm test:e2e` — run the Playwright browser suite
- `pnpm db:start` — start the local Supabase stack
- `pnpm db:reset` — reset the local database and reapply migrations
- `pnpm db:types` — generate Supabase TypeScript database types

## Project structure

```text
.
├── .env.example
├── AGENTS.md
├── CLAUDE.md
├── docs/
│   ├── AUTH.md
│   ├── DATABASE.md
│   ├── DEPLOYMENT.md
│   └── DEVELOPMENT.md
├── public/
├── src/
│   ├── app/
│   ├── components/
│   ├── features/
│   │   ├── ai/
│   │   ├── analytics/
│   │   ├── attempts/
│   │   ├── auth/
│   │   ├── document-processing/
│   │   ├── documents/
│   │   ├── exports/
│   │   ├── ingestion/
│   │   ├── mastery/
│   │   ├── questions/
│   │   ├── quizzes/
│   │   ├── rag/
│   │   ├── recommendations/
│   │   ├── study-spaces/
│   │   └── users/
│   └── lib/
├── supabase/
│   ├── config.toml
│   ├── migrations/
│   └── README.md
├── tests/
│   ├── e2e/
│   └── unit/
├── package.json
├── next.config.ts
├── vitest.config.ts
├── playwright.config.ts
├── tsconfig.json
└── README.md
```

## Authentication and security model

The auth layer is the critical foundation of this project.

### Auth flow

- `signup` creates a Supabase Auth user
- a trigger creates a matching row in `public.profiles`
- the user is redirected to a confirmation/check-email state
- the email link confirms authentication and redirects via a safe redirect helper
- `login` sets session cookies using Supabase SSR
- password reset follows the same confirmation pattern and ends at `/update-password`
- logout is handled via a server action and clears the session

### Security rules

The implementation follows protected, defense-in-depth patterns:

- `requireUser()` is the real server-side authorization boundary
- `getSession()` is not used as an authorization decision point
- all redirect targets are sanitized using `safeRedirectPath()`
- login and reset flows intentionally use generic messages to reduce enumeration risk
- database-level RLS restricts profile reads and writes to the authenticated user
- `public.profiles` prohibits inserts and deletes directly by policy

### Important auth files

- `src/features/auth/actions/auth.ts` — server actions for signup, signin, signout, reset, and password update
- `src/features/auth/schemas/auth.ts` — Zod validation and redirect guard logic
- `src/features/auth/services/auth.ts` — auth helpers and role checks
- `src/lib/supabase/server.ts` — server-side Supabase client creation
- `src/app/auth/callback/route.ts` — callback handling for Supabase auth flows

## Database and Supabase workflow

The project uses Supabase Postgres as the data layer and relies on SQL migrations under `supabase/migrations/`.

### Local database commands

```bash
pnpm db:start
pnpm db:reset
pnpm exec supabase status
pnpm db:types
```

### Current migration intent

The initial migration setup includes the required database extensions and the `public.profiles` table. The `profiles` table includes:

- `id` referencing `auth.users(id)`
- `full_name`
- `university`
- `program`
- `year_of_study`
- `avatar_url`
- `created_at`
- `updated_at`

A trigger creates the profile on user creation and keeps `updated_at` current.

## Documentation map

This repo includes the design docs that are considered the source of truth for the domain and security decisions:

- `docs/AUTH.md` — authentication and security design
- `docs/DATABASE.md` — database/entity model design
- `docs/DEVELOPMENT.md` — local workflow and contribution guidance
- `docs/DEPLOYMENT.md` — host and environment planning notes

## Verification and quality gates

Before merging or shipping changes, the project should pass:

```bash
pnpm typecheck
pnpm lint
pnpm test
pnpm build
```

The current repo includes both unit and browser-based checks, and the app has been validated in the local Supabase environment.

## Notes for contributors

- Keep app-side auth logic server-side and avoid using client-only access for authorization decisions.
- Never bypass Postgres RLS.
- Validate external input and AI output before using it.
- Keep changes scoped to the study-space and security work currently in progress.
- Do not commit secrets or production credentials.

## Deployment note

The project is intentionally structured for secure local development and future deployment, but hosted deployment is not treated as a casual default. Use the project docs and environment validation before pushing to a cloud environment.
