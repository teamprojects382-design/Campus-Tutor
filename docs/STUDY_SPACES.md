# Study spaces

## What was built

This phase adds the study-space domain for CampusTutor without introducing cross-phase coupling. It includes an RLS-first SQL migration, a guarded service layer, server actions, and App Router pages for listing, creating, viewing, and editing study spaces.

The implementation keeps the integration seam explicit so the Phase 1 auth/profile work can be merged in later without forcing a big refactor:

- `src/features/study-spaces/server/deps.ts` is the only file in the phase that imports from `@/lib/supabase/*` and the auth helpers.
- Everything else in the study-space module relies on `requireUser()` and `getDb()` from that seam.
- The service layer validates database rows through Zod before returning domain objects.

## Seam and merge plan

1. Phase 1 lands on `main` first, then run `git fetch && git merge origin/main` in the feature branch.
2. Replace the local implementations in `src/features/study-spaces/server/deps.ts` with re-exports from the Phase 1 auth service layer and the user-scoped Supabase server client. The goal is: `requireUser` loaded from Phase 1's auth helpers; `getDb` from `src/lib/supabase/server.ts`.
3. Delete the local untracked `supabase/config.toml` before merging to avoid carrying a stale local config into the final branch.
4. Never hand-merge `pnpm-lock.yaml`; accept the version from one side of the merge and run `pnpm install` immediately afterward.
5. Add `/study-spaces` to the proxy's protected route prefixes so the app enforces authentication consistently.
6. Add a `My courses` link or call-to-action on `/dashboard` once that page exists in Phase 1.
7. Run `pnpm db:types`, then optionally type the Supabase client with the generated `Database` type.
8. Update `docs/DATABASE.md` to mark the `study_spaces` table as IMPLEMENTED and document the column grants and RLS policies.
9. Check that the final page has exactly one `<main>` element, and unskip the E2E spec after auth lands.
10. Confirm the `public.set_updated_at()` body in migration 0002 matches the canonical 0003 version and deduplicate if needed.

## Ownership pattern template

Use this pattern for future user-owned tables:

- Add `user_id uuid not null references auth.users(id) on delete cascade`.
- Enforce RLS with `user_id = (select auth.uid())` in SELECT, INSERT, UPDATE, and DELETE policies.
- Grant only the needed column-level privileges to `authenticated` and revoke from `anon`.
- Keep `id`, `user_id`, and `created_at` immutable after insert.
- For child tables such as `documents`, verify the parent record is owned by the caller before allowing inserts or updates, and cascade deletes through the parent relationship.

## Notes

The Phase 2 work deliberately avoids adding dashboard navigation, shared docs, uploads, or AI features. It is isolated to the study-space domain and preserved for a clean merge once the auth/profile phase lands.
