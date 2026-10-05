CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text NOT NULL CHECK (char_length(trim(full_name)) BETWEEN 1 AND 100),
  university text,
  program text,
  year_of_study integer CHECK (year_of_study IS NULL OR year_of_study BETWEEN 1 AND 8),
  avatar_url text CHECK (avatar_url IS NULL OR avatar_url ~ '^https?://'),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  _full_name text;
BEGIN
  IF TG_OP <> 'INSERT' THEN
    RETURN NEW;
  END IF;

  _full_name := coalesce(trim(new.raw_user_meta_data ->> 'full_name'), 'Student');
  _full_name := left(_full_name, 100);

  INSERT INTO public.profiles (id, full_name)
  VALUES (new.id, _full_name)
  ON CONFLICT (id) DO NOTHING;

  RETURN NEW;
END;
$$;

CREATE TRIGGER profiles_set_updated_at
BEFORE UPDATE ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW
EXECUTE FUNCTION public.handle_new_user();

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "profiles_select_own"
  ON public.profiles
  FOR SELECT
  USING (id = (select auth.uid()));

CREATE POLICY "profiles_update_own"
  ON public.profiles
  FOR UPDATE
  USING (id = (select auth.uid()))
  WITH CHECK (id = (select auth.uid()));

REVOKE ALL ON public.profiles FROM anon;
REVOKE ALL ON public.profiles FROM authenticated;
GRANT SELECT, UPDATE ON public.profiles TO authenticated;
GRANT USAGE ON SCHEMA public TO authenticated;

CREATE POLICY "profiles_no_insert_or_delete"
  ON public.profiles
  FOR INSERT WITH CHECK (false);

CREATE POLICY "profiles_no_delete"
  ON public.profiles
  FOR DELETE USING (false);
