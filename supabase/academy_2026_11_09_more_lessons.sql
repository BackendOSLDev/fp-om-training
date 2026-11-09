-- BCB Partners Academy, Nov 9 2026 update: 4 lessons added (m4-6, m4-7, m4-8, m5-8), 4 practice tasks added.
-- The certificate now needs 54 lessons and a Ready practice result of 58 tasks (at least 50 on your own).
-- Run once in Supabase: SQL Editor > New query > paste all of this > Run. Safe to run again. No data is changed.

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

revoke all on function public.issue_my_certificate() from public, anon;
grant execute on function public.issue_my_certificate() to authenticated;

-- Check it worked: should return true
select position('nles < 54' in pg_get_functiondef('public.issue_my_certificate()'::regprocedure)) > 0 as updated;
