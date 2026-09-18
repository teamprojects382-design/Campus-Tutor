# Supabase

## Local migrations

1. Start the local Supabase stack with the CLI:
   `supabase start`
2. Apply migrations:
   `supabase db push`
3. Inspect the project status:
   `supabase status`

## Hosted project workflow

1. Log in to Supabase:
   `supabase login`
2. Link your project:
   `supabase link --project-ref <project-ref>`
3. Push local migrations:
   `supabase db push`
4. Review the migration history in the Supabase dashboard.

The initial migration in `supabase/migrations/0001_extensions.sql` enables the `vector` and `pgcrypto` extensions only. No application tables are created in Phase 0.
