# BCB Partners Academy (FieldPulse office manager training)

A 5-day program with a login. Days 1 to 4 have 54 lessons and 58 practice tasks (12, 10, 16 and 16 lessons a day). Day 5 is the final review check, the reflection and the certificate. Owner reporting (Module 6) is an extra and does not count toward the certificate.

## Pages

1. index.html: sign in. An invite or reset link also lands here and asks for a new password.
2. fsm.html: choose your training (FieldPulse now, the others say coming soon).
3. home.html: the 5-day program: each day's agenda (a 15-minute start-of-day check with the trainer, then self-paced lessons and practice tasks), lesson cards by day, and Day 5 steps.
4. f.html and m1.html to m7.html: the interactive lessons (walk-through with check questions, steps, and the knowledge check: the same task on your own, hints counted).
5. library.html: the SOP Library (45 SOPs).
6. practice.html: the 58 practice tasks for Days 1 to 4, plus Owner reporting as extra. sandbox.html: free practice, no tasks.
7. final.html: the final review check (20 questions) and the reflection.
8. progress.html: My progress, with the grade for each of Days 1 to 4. certificate.html: the certificate. verify.html: public certificate check, no login.
9. team.html and certs.html: admins only (Team progress with every trainee's day grades, Certifications). admin.html sends old links to team.html.

## What gets saved

1. lesson_events: one row each time a trainee opens or finishes part of a lesson, or marks an SOP as read.
2. practice_results: one row per trainee with their practice tasks and result (Ready, Ready with coaching, Not ready yet).
3. final_checks: one row per try of the final review check, so trainers can compare the first try to the next.
4. reflections: one row per trainee (three short answers).
5. certificates: made only by the database when the rule is met. Admins can revoke (a reason is required) or restore.

Before it issues a certificate, the database checks the trainee's saved rows: a walk-through, check and practice row for all 54 lessons of Days 1 to 4 (the lesson knowledge check is saved as the "practice" part), and a practice result of Ready (58 tasks done, at least 50 on your own, no serious slips). The site saves a check row only when every answer is right. Every issue, revoke and restore is kept in certificate_log.

## Day grades (Days 1 to 4)

Worked out on the page from rows already saved, the same way for everyone. Nothing new is saved.

1. Pass: every lesson and practice task of the day done, at most 2 knowledge checks needed a hint on the first try, at most 2 practice tasks needed a hint, and no serious slips.
2. Pass with coaching: all done and no serious slips, but more hints than that.
3. Redo: a serious slip in that day's practice. Start that day over in Practice tasks (the restart is recorded for the trainer).
4. In progress or Not started otherwise.

The certificate rule does not change: it still uses the totals above.

What trainers see for each knowledge check (saved as lesson_events rows with part "open", so no database change): every Hint click (hints 1); every try left unfinished (Start over, another tab or lesson, or closing or reloading the page; a row from a closed page is sent on the next visit) (score = steps done, total = steps, hints = hints used); every finish after the first (another "practice" row). Team progress shows them per lesson, in recent activity and as two CSV columns. Practice tasks: a hint is saved when clicked, and every Start Day over is saved with what it cleared.

Trainees see only their own rows. Admins see everyone. The verify page shows only the name, training, date and status of one certificate ID.

## Setup

1. Supabase, one time: SQL Editor > New query > paste all of supabase/schema.sql > Run. Then do the same with supabase/academy_2026_11_09.sql. Both are safe to run again. A site already set up before the 4 new lessons only needs supabase/academy_2026_11_09_more_lessons.sql.
2. Supabase > Authentication > Sign In / Providers: Email on, and "Allow new users to sign up" OFF. Only people an admin adds can sign in and save progress.
3. js/config.js holds the Project URL and the public key. Never put the secret or service_role key in this repo.
4. GitHub Pages: Settings > Pages > Deploy from a branch > main > / (root).

Leave js/config.js blank and the site runs in demo mode (nothing saved online, any email with the password demo, an email with "admin" in it is an admin).

## Add a trainee

1. Supabase > Authentication > Users > Add user > Create new user. Enter their email and a password, tick Auto Confirm.
2. Set their name with query 2 in supabase/admin.sql.
3. Send them the site link, their email and their password.

## Things to know

1. On the free Supabase plan, a project pauses after 1 week with no activity. If sign-in stops working, open the Supabase dashboard and click Resume.
2. Lesson pages and free practice use made-up practice data only.
3. Free practice is kept in the trainee's browser. Practice tasks, lessons, the final check, the reflection and the certificate are saved to their account.
4. Keep staff emails out of this repo (it is public). Admin emails go in the admin_emails table from the Supabase SQL Editor.
5. Times show as fixed UTC-4, labeled EDT (TIME_ZONE and TIME_LABEL in js/config.js).
