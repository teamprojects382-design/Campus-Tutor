# CampusTutor Authentication

Status: design document. Verify against implementation before relying on it.

## Flow

Signup:
/signup -> signUp action (Zod validate) -> Supabase Auth creates user
-> trigger creates profiles row -> /check-email (same state for new and
already-registered emails) -> user clicks email link -> /auth/confirm
(verifies token/exchanges code) -> redirect via safeRedirectPath -> /dashboard

Login:
/login -> signIn action -> session cookies set by @supabase/ssr
-> redirect via safeRedirectPath(next, '/dashboard')

Password reset:
/forgot-password -> requestPasswordReset (always same success message)
-> email link -> /auth/confirm (recovery) -> /update-password
(refuses to render without a valid recovery session) -> updatePassword -> /login

Logout:
POST via Server Action only (never a GET link) -> session cleared -> /login

## Two-layer route protection

1. proxy.ts (middleware): session refresh plus OPTIMISTIC redirects only.
   It is NOT the security boundary.
2. requireUser(): the real boundary. Called in every protected layout, page,
   server action, and route handler. It authenticates with a method that
   validates the token with Supabase Auth (getUser() or verified claims).
   getSession() must never be used to make an authorization decision on the
   server, because it only reads the cookie.

A third layer sits underneath both: RLS in Postgres. Application code can have
bugs; RLS limits the damage.

## Redirect safety

Every `next` or redirect parameter goes through safeRedirectPath():

- accepts only same-origin relative paths starting with a single "/"
- rejects "//host", "/\host", absolute URLs, javascript:, encoded variants,
  control characters, and non-strings
- falls back to /dashboard

## No account enumeration

- Login failure: one generic message ("Invalid email or password").
- Reset request: identical success message whether or not the email exists.
- Signup: identical "check your email" state for new and existing addresses.

## Logging rules

Never log passwords, tokens, or email addresses. Log error category + requestId.

## Profiles

profiles.id references auth.users(id) ON DELETE CASCADE. A SECURITY DEFINER
trigger (search_path = '', fully-qualified names) creates the row on signup,
copying only a truncated full_name. avatar_url and other user-controlled
metadata are never copied. RLS: authenticated users can SELECT and UPDATE only
their own row (USING and WITH CHECK). No INSERT or DELETE policy. anon has no
access. id and created_at are immutable.

## Hosted Supabase checklist (config.toml does not configure hosted projects)

- [ ] Site URL set to the production URL
- [ ] Redirect allow-list includes the auth callback paths (local and prod)
- [ ] Email confirmation enabled
- [ ] Minimum password length matches the Zod schema
- [ ] Custom SMTP configured before the student pilot (built-in SMTP is
      heavily rate-limited on the free tier; verify the current limit in
      Supabase docs)
- [ ] Email templates match the callback approach (token-hash vs PKCE)
