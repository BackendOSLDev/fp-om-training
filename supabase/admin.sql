-- Handy queries for the trainer. Run in Supabase: SQL Editor > New query.
-- Replace the emails and names before you run each one.

-- 1. Make yourself an admin (do this once, after you add yourself as a user)
update public.profiles set role = 'admin' where email = 'you@offshorelaunch.com';

-- 2. Set a trainee's display name (what shows on the Progress page)
update public.profiles set full_name = 'Darwin T' where email = 'trainee@example.com';

-- 3. Everyone and how many lessons they finished (all 3 parts)
select p.full_name, p.email, count(*) filter (where d.parts = 3) as lessons_done
from public.profiles p
left join (select user_id, lesson_id, count(distinct part) as parts
           from public.lesson_events where part <> 'open' group by user_id, lesson_id) d on d.user_id = p.id
group by p.full_name, p.email order by p.full_name;

-- 4. Set a new password for someone (the dashboard can only email a reset link,
--    and those emails only reach people on the Supabase team).
--    Type the new password between the quotes, run it, then send it to them privately.
update auth.users set encrypted_password = extensions.crypt('TYPE-NEW-PASSWORD-HERE', extensions.gen_salt('bf'))
where email = 'trainee@example.com';
