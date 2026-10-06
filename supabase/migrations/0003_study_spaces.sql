create extension if not exists pgcrypto;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create table if not exists public.study_spaces (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  name text not null,
  description text,
  course_code text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint study_spaces_name_length_chk check (char_length(btrim(name)) between 1 and 100),
  constraint study_spaces_description_length_chk check (description is null or char_length(description) <= 500),
  constraint study_spaces_course_code_length_chk check (course_code is null or char_length(course_code) between 1 and 20)
);

create index if not exists idx_study_spaces_user_created_at on public.study_spaces (user_id, created_at desc);

create trigger trg_study_spaces_set_updated_at
before update on public.study_spaces
for each row
execute function public.set_updated_at();

alter table public.study_spaces enable row level security;

revoke all on public.study_spaces from anon;
revoke all on public.study_spaces from authenticated;

grant select on public.study_spaces to authenticated;
grant insert (user_id, name, description, course_code) on public.study_spaces to authenticated;
grant update (name, description, course_code) on public.study_spaces to authenticated;
grant delete on public.study_spaces to authenticated;

create policy "study_spaces_select_own_rows"
on public.study_spaces
for select
to authenticated
using (user_id = (select auth.uid()));

create policy "study_spaces_insert_own_rows"
on public.study_spaces
for insert
to authenticated
with check (user_id = (select auth.uid()));

create policy "study_spaces_update_own_rows"
on public.study_spaces
for update
to authenticated
using (user_id = (select auth.uid()))
with check (user_id = (select auth.uid()));

create policy "study_spaces_delete_own_rows"
on public.study_spaces
for delete
to authenticated
using (user_id = (select auth.uid()));
