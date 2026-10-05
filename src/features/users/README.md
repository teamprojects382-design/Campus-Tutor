# Users

This feature is scoped to the authenticated user's own profile.

- `getMyProfile()` reads the current user profile through the user-scoped Supabase client so RLS is enforced.
- The profile row is created automatically by the auth trigger on signup.
- Profile updates are restricted to the authenticated user only.
