-- BCB Partners Academy: 5-day program, practice result, final check, reflection and certificates.
-- Run once in Supabase: SQL Editor > New query > paste all of this > Run.
-- Safe to run again. It adds new tables and rules. It does not delete any saved progress.
-- It also includes the Nov 7 fix (Foundations lessons and SOP reads), in case that one was never run.

-- 0. Nov 7 fix: accept Foundations lesson ids (f-1 to f-7) and SOP library reads
alter table public.lesson_events drop constraint if exists lesson_events_lesson_id_check;
alter table public.lesson_events add constraint lesson_events_lesson_id_check
  check (lesson_id ~ '^(f|m[0-9]+)-[0-9]+$' or lesson_id ~ '^sop-[a-z]{3}-[0-9]{2}$');
alter table public.lesson_events drop constraint if exists lesson_events_part_check;
alter table public.lesson_events add constraint lesson_events_part_check
  check (part in ('open','walk','check','practice','read'));

-- 1. Practice tasks: one row per trainee, saved every time a task is ticked
create table if not exists public.practice_results (
  user_id    uuid primary key default auth.uid() references auth.users(id) on delete cascade,
  data       jsonb not null default '{}'::jsonb check (pg_column_size(data) < 200000),
  done       int  not null default 0 check (done between 0 and 1000),
  own        int  not null default 0 check (own between 0 and 1000),
  serious    int  not null default 0 check (serious between 0 and 1000),
  slips      int  not null default 0 check (slips between 0 and 1000),
  result     text not null default 'Not ready yet' check (result in ('Not ready yet','Ready with coaching','Ready')),
  updated_at timestamptz not null default now()
);

-- 2. Final review check: one row per try, so trainers can compare the first try to the next
create table if not exists public.final_checks (
  id         bigint generated always as identity primary key,
  user_id    uuid not null default auth.uid() references auth.users(id) on delete cascade,
  score      int  not null check (score between 0 and 20),
  by_day     int[] not null check (array_length(by_day, 1) = 4),
  answers    jsonb not null default '[]'::jsonb check (pg_column_size(answers) < 20000),
  created_at timestamptz not null default now()
);
create index if not exists final_checks_user on public.final_checks (user_id, id);

-- 3. Reflection: one row per trainee (three short answers)
create table if not exists public.reflections (
  user_id    uuid primary key default auth.uid() references auth.users(id) on delete cascade,
  r1         text not null default '' check (length(r1) <= 4000),
  r2         text not null default '' check (length(r2) <= 4000),
  r3         text not null default '' check (length(r3) <= 4000),
  updated_at timestamptz not null default now()
);

-- 4. Certificates: made only by the issue function below, never typed in by a trainee
create sequence if not exists public.certificate_no;
create table if not exists public.certificates (
  cert_id       text primary key,
  user_id       uuid not null unique references auth.users(id) on delete cascade,
  full_name     text not null,
  training      text not null default 'FieldPulse office operations, 5-day program',
  issued_at     timestamptz not null default now(),
  status        text not null default 'active' check (status in ('active','revoked')),
  revoked_at    timestamptz,
  revoke_reason text,
  changed_by    uuid
);
alter table public.certificates alter column training set default 'FieldPulse office operations, 5-day program';

-- every revoke and restore is kept: who, when, why
create table if not exists public.certificate_log (
  id         bigint generated always as identity primary key,
  cert_id    text not null references public.certificates(cert_id) on delete cascade,
  action     text not null check (action in ('issued','revoked','restored')),
  reason     text,
  done_by    uuid,
  created_at timestamptz not null default now()
);

-- keep updated_at honest
create or replace function public.touch_updated_at() returns trigger
language plpgsql set search_path = public as $$ begin new.updated_at := now(); return new; end $$;
drop trigger if exists practice_results_touch on public.practice_results;
create trigger practice_results_touch before insert or update on public.practice_results for each row execute function public.touch_updated_at();
drop trigger if exists reflections_touch on public.reflections;
create trigger reflections_touch before insert or update on public.reflections for each row execute function public.touch_updated_at();

-- 5. Rules: trainees save and see only their own rows. Admins see everyone.
alter table public.practice_results enable row level security;
alter table public.final_checks     enable row level security;
alter table public.reflections      enable row level security;
alter table public.certificates     enable row level security;
alter table public.certificate_log  enable row level security;

drop policy if exists "practice: own or admin" on public.practice_results;
create policy "practice: own or admin" on public.practice_results for select to authenticated using (user_id = auth.uid() or public.is_admin());
drop policy if exists "practice: insert own" on public.practice_results;
create policy "practice: insert own" on public.practice_results for insert to authenticated with check (user_id = auth.uid());
drop policy if exists "practice: update own" on public.practice_results;
create policy "practice: update own" on public.practice_results for update to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());

drop policy if exists "final: own or admin" on public.final_checks;
create policy "final: own or admin" on public.final_checks for select to authenticated using (user_id = auth.uid() or public.is_admin());
drop policy if exists "final: insert own" on public.final_checks;
create policy "final: insert own" on public.final_checks for insert to authenticated with check (user_id = auth.uid());

drop policy if exists "reflection: own or admin" on public.reflections;
create policy "reflection: own or admin" on public.reflections for select to authenticated using (user_id = auth.uid() or public.is_admin());
drop policy if exists "reflection: insert own" on public.reflections;
create policy "reflection: insert own" on public.reflections for insert to authenticated with check (user_id = auth.uid());
drop policy if exists "reflection: update own" on public.reflections;
create policy "reflection: update own" on public.reflections for update to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());

drop policy if exists "certs: own or admin" on public.certificates;
create policy "certs: own or admin" on public.certificates for select to authenticated using (user_id = auth.uid() or public.is_admin());

drop policy if exists "cert log: admin" on public.certificate_log;
create policy "cert log: admin" on public.certificate_log for select to authenticated using (public.is_admin());

revoke all on public.practice_results, public.final_checks, public.reflections, public.certificates, public.certificate_log from anon, authenticated;
revoke all on sequence public.certificate_no from anon, authenticated;
grant select on public.practice_results, public.final_checks, public.reflections, public.certificates, public.certificate_log to authenticated;
-- the site may only fill these columns; user_id and the times are set by the database
grant insert (data, done, own, serious, slips, result) on public.practice_results to authenticated;
grant update (data, done, own, serious, slips, result) on public.practice_results to authenticated;
grant insert (score, by_day, answers) on public.final_checks to authenticated;
grant insert (r1, r2, r3) on public.reflections to authenticated;
grant update (r1, r2, r3) on public.reflections to authenticated;

-- 6. Issue a certificate. The database checks the trainee's saved rows before it issues one:
--    a walk-through, check and practice row for all 54 lessons of Days 1 to 4, and a practice result of Ready
--    (58 tasks done, at least 50 on your own, no serious slips). Nov 9: 4 lessons added (m4-6, m4-7, m4-8, m5-8). Owner reporting (Module 6) is extra and not needed.
--    The site saves a check row only when every answer is right. Keep sign-ups off so only people you add can save rows.
create or replace function public.issue_my_certificate() returns public.certificates
language plpgsql security definer set search_path = public as $$
declare me uuid := auth.uid(); c public.certificates; nles int; pr public.practice_results; nm text;
begin
  if me is null then raise exception 'Not signed in'; end if;
  select * into c from public.certificates where user_id = me;
  if found then return c; end if;
  select count(*) into nles from (
    select lesson_id from public.lesson_events
    where user_id = me and part in ('walk','check','practice')
      and lesson_id in ('f-1','f-2','f-3','f-4','f-5','f-6','f-7',
        'm1-1','m1-2','m1-3','m1-4','m1-5','m1-6','m1-7','m1-8','m1-9',
        'm2-1','m2-2','m2-3','m2-4','m2-5','m2-6',
        'm3-1','m3-2','m3-3','m3-4','m3-5','m3-6','m3-7','m3-8','m3-9','m3-10',
        'm4-1','m4-2','m4-3','m4-4','m4-5','m4-6','m4-7','m4-8',
        'm5-1','m5-2','m5-3','m5-4','m5-5','m5-6','m5-7','m5-8',
        'm7-1','m7-2','m7-3','m7-4','m7-5','m7-6')
    group by lesson_id having count(distinct part) = 3) x;
  if nles < 54 then raise exception 'Not ready: % of 54 lessons done', nles; end if;
  select * into pr from public.practice_results where user_id = me;
  if not found or pr.result <> 'Ready' or pr.done < 58 or pr.own < 50 or pr.serious > 0 then
    raise exception 'Not ready: practice result is not Ready yet'; end if;
  select coalesce(nullif(full_name,''), email) into nm from public.profiles where id = me;
  begin
    insert into public.certificates (cert_id, user_id, full_name)
    -- the random end means nobody can list certified names by counting through the numbers
    values ('BCB-FP-' || to_char(now() at time zone 'Etc/GMT+4', 'YYYY') || '-' || lpad(nextval('public.certificate_no')::text, 4, '0') || '-'
            || translate(upper(substr(md5(random()::text || clock_timestamp()::text), 1, 4)), '01', 'XY'), me, coalesce(nm, 'Trainee'))
    returning * into c;
  exception when unique_violation then
    select * into c from public.certificates where user_id = me;   -- issued a moment ago in another tab
    return c;
  end;
  insert into public.certificate_log (cert_id, action, done_by) values (c.cert_id, 'issued', me);
  return c;
end $$;

-- 7. Public check of a certificate ID (the verify page). Shows only name, training, date and status.
create or replace function public.verify_certificate(p_id text)
returns table (cert_id text, full_name text, training text, issued_at timestamptz, status text, revoked_at timestamptz)
language sql stable security definer set search_path = public as $$
  select c.cert_id, c.full_name, c.training, c.issued_at, c.status, c.revoked_at
  from public.certificates c where c.cert_id = upper(trim(p_id)) limit 1;
$$;

-- 8. Admins revoke (a reason is required) or restore a certificate
create or replace function public.admin_set_certificate(p_id text, p_status text, p_reason text default null)
returns public.certificates
language plpgsql security definer set search_path = public as $$
declare c public.certificates;
begin
  if not public.is_admin() then raise exception 'Admins only'; end if;
  if p_status not in ('active','revoked') then raise exception 'Bad status'; end if;
  if p_status = 'revoked' and coalesce(trim(p_reason),'') = '' then raise exception 'A reason is required to revoke'; end if;
  update public.certificates set status = p_status,
    revoked_at = case when p_status = 'revoked' then now() else null end,
    revoke_reason = case when p_status = 'revoked' then trim(p_reason) else null end,
    changed_by = auth.uid()
  where cert_id = upper(trim(p_id)) returning * into c;
  if not found then raise exception 'No such certificate'; end if;
  insert into public.certificate_log (cert_id, action, reason, done_by)
  values (c.cert_id, case when p_status = 'revoked' then 'revoked' else 'restored' end, nullif(trim(coalesce(p_reason,'')),''), auth.uid());
  return c;
end $$;

revoke all on function public.issue_my_certificate() from public, anon;
revoke all on function public.verify_certificate(text) from public;
revoke all on function public.admin_set_certificate(text, text, text) from public, anon;
grant execute on function public.issue_my_certificate() to authenticated;
grant execute on function public.verify_certificate(text) to anon, authenticated;
grant execute on function public.admin_set_certificate(text, text, text) to authenticated;

-- Check it worked: should list the 5 new tables.
select table_name from information_schema.tables
where table_schema = 'public' and table_name in ('practice_results','final_checks','reflections','certificates','certificate_log') order by 1;
