# FieldPulse OM Training site

Lessons for Modules 1 and 2, with a login. Every lesson a trainee opens or finishes is saved, so trainers can see who finished what.

1. index.html: sign in, then the module list.
2. m1.html, m2.html: the lessons.
3. admin.html: the Progress page (trainers only).
4. supabase/schema.sql: the database setup. Run it once.
5. supabase/admin.sql: handy queries for trainers.

Leave js/config.js blank and the site runs in demo mode. In demo mode nothing is saved online.

## What gets saved

One row each time a trainee:

1. Opens a lesson for the first time.
2. Finishes the walk-through.
3. Gets every check question right. The row also saves the first-try score.
4. Passes practice. The row also saves how many hints they used.

Each row has the time, plus the minutes they've spent on that lesson so far. Minutes only count while the tab is open and they've clicked or typed in the last 2 minutes.
A lesson is done when the walk-through, check and practice are all done.

## Setup (one time)

### Supabase (login and database)

1. Create a free project at supabase.com.
2. Open SQL Editor > New query. Paste all of supabase/schema.sql and click Run.
3. Go to Authentication > Sign In / Providers. Make sure Email is on. Turn OFF "Allow new users to sign up", so only trainers can add people.
4. Add yourself: Authentication > Users > Add user > Create new user. Enter your email and a password, and tick Auto Confirm.
5. Make yourself an admin: run query 1 from supabase/admin.sql with your email.
6. Go to Project Settings > API. Copy the Project URL and the public key (it's called "publishable" or "anon public").
7. Never copy the secret or service_role key into this repo.

### Connect the site

1. Open js/config.js. Paste the Project URL into SUPABASE_URL and the public key into SUPABASE_KEY.

### GitHub Pages (hosting)

1. Create a public repo, then upload every file in this folder: Add file > Upload files, and drag in the whole folder contents.
2. Go to Settings > Pages > Build and deployment. Set Source to "Deploy from a branch", Branch to main, and folder to / (root). Click Save.
3. After about a minute, the site is live at https://YOUR-NAME.github.io/REPO-NAME/

## Add a trainee

1. In Supabase, go to Authentication > Users > Add user > Create new user. Enter their email and a password, and tick Auto Confirm.
2. Set their name with query 2 in supabase/admin.sql.
3. Send them the site link, their email and their password.

## Things to know

1. On the free Supabase plan, a project pauses after 1 week with no activity. If the site stops letting people sign in, open the Supabase dashboard and click Resume (or Restore).
2. The lesson pages are public to anyone with the link. They use made-up practice data only. The progress records are only visible after sign-in.
3. To reset a password, go to Authentication > Users, click the user, and set a new password.
4. Times show as fixed UTC-4, labeled EDT. To change that, edit TIME_ZONE and TIME_LABEL in js/config.js.
