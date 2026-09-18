# CampusTutor engineering rules

## Stack

- Next.js App Router + React + TypeScript + Tailwind + shadcn/ui + Supabase + Zod + Vitest + Playwright

## Hard rules

- Verify every library API against the installed package types or current docs before using it; do not invent behavior or flags.
- No `any` in TypeScript; prefer explicit types and Zod validation.
- Never commit or expose secrets; `.env*` stays ignored except `.env.example` placeholders.
- Keep database access server-side only; enforce RLS in Supabase and never bypass it.
- Validate all external input and all AI output before use.
- Scope every change to the authorized study space; do not build cross-space features or unrelated UI.

## References

- Project standards: `docs/`
- Source of truth: `CLAUDE.md`
