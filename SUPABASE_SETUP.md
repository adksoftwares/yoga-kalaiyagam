# Supabase setup — Yoga Kalaiyagam

This repository is a static site. Secure login and shared booking/member records require a real Supabase project; GitHub Pages alone cannot provide server-side authentication or a private database.

## 1. Create the project
1. Create a Supabase project.
2. Open **SQL Editor** and run `supabase/schema.sql`.
3. In **Authentication → Users**, create the admin user using a strong unique password.
4. Open that user's app metadata and set `{"role":"admin"}`. Do not set this in user-editable metadata.
5. Create student users in Auth and create their matching `student_profiles` row with `user_id = auth.users.id`.
6. Review the SQL/RLS policies against your actual data handling and retention requirements before collecting real student/health information.

## 2. Configure the public site
Edit `assets/js/supabase-config.js` and set the project URL and **anon/publishable** key. Never put the service-role key or database password in frontend files or GitHub.

## 3. Important deployment notes
- RLS is the actual data boundary. A public anon key is not a secret.
- Admin API writes must use the authenticated user's access token and the admin role policy.
- Membership and booking forms create requests, not confirmed appointments. Staff should confirm availability and status.
- The static checker is not an end-to-end security test. Run the site over HTTPS and verify login, role denial, row policies, booking submission, and backups with test accounts before launch.
- Do not use localStorage as the sole source of truth for bookings, membership or health data.
