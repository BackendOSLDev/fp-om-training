-- FieldPulse OM Training: progress tracking
-- Run once in Supabase: SQL Editor > New query > paste all of this > Run.
-- Safe to run again: it drops and recreates only these objects (it does NOT delete saved progress).

-- 1. Trainee and admin list (one row per login)
create table if not exists public.profiles (
  id         uuid primary key references auth.users(id) on delete cascade,
  email      text not null default '',
  full_name  text not null default '',
  role       text not null default 'trainee' check (role in ('trainee','admin')),
  created_at timestamptz not null default now()
);

-- 2. One row each time a trainee opens or finishes part of a lesson
create table if not exists public.lesson_events (
  id         bigint generated always as identity primary key,
  user_id    uuid not null default auth.uid() references auth.users(id) on delete cascade,
  lesson_id  text not null check (lesson_id ~ '^m[0-9]+-[0-9]+$'),
  part       text not null check (part in ('open','walk','check','practice')),
  score      int  check (score is null or score >= 0),
  total      int  check (total is null or total >= 0),
  hints      int  check (hints is null or hints >= 0),
  minutes    numeric(6,1) check (minutes is null or minutes >= 0),
  created_at timestamptz not null default now()
);
create index if not exists lesson_events_user_lesson on public.lesson_events (user_id, lesson_id);

-- 3. Who is an admin (used by the rules below)
create or replace function public.is_admin() returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.profiles where id = auth.uid() and role = 'admin');
$$;

-- 4. New login -> new profile row (name comes from "full_name" in user metadata, else the email)
create or replace function public.handle_new_user() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, email, full_name)
  values (new.id, coalesce(new.email,''), coalesce(nullif(new.raw_user_meta_data->>'full_name',''), split_part(coalesce(new.email,''),'@',1)))
  on conflict (id) do nothing;
  return new;
end $$;
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users
  for each row execute function public.handle_new_user();

-- 5. Rules: trainees save and see only their own rows. Admins see everyone. Nobody can edit or delete from the site.
alter table public.profiles      enable row level security;
alter table public.lesson_events enable row level security;

drop policy if exists "profiles: own or admin" on public.profiles;
create policy "profiles: own or admin" on public.profiles
  for select to authenticated using (id = auth.uid() or public.is_admin());

drop policy if exists "events: insert own" on public.lesson_events;
create policy "events: insert own" on public.lesson_events
  for insert to authenticated with check (user_id = auth.uid());

drop policy if exists "events: own or admin" on public.lesson_events;
create policy "events: own or admin" on public.lesson_events
  for select to authenticated using (user_id = auth.uid() or public.is_admin());

revoke all on public.profiles, public.lesson_events from anon, authenticated;
grant select on public.profiles to authenticated;
grant select on public.lesson_events to authenticated;
-- the site may only fill these columns; user_id and created_at are always set by the database
grant insert (lesson_id, part, score, total, hints, minutes) on public.lesson_events to authenticated;
-- the rules above call is_admin(), so signed-in users must be able to run it
grant usage on schema public to authenticated;
grant execute on function public.is_admin() to authenticated;
