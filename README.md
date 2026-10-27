# ஸ்ரீ ஐஸ்வர்யம் யோகா கலையகம் — Sri Aishwaryam Yoga Kalaiyagam

Official trilingual website for the yoga studio in Batticaloa, Sri Lanka.

**Languages:** Tamil · English · Sinhala  
**Primary contacts:** 077 6064 846 / 077 6047 081  
**Main centre:** No. 16, Loyds Avenue Road, Batticaloa

## Website features

- Responsive home, about, courses, events/gallery and contact pages.
- Tamil, English and Sinhala interface strings.
- WhatsApp-based enquiries with a clear handoff: a prepared message is not treated as delivered until the visitor sends it.
- Booking request form with preferred date, time and branch. Requests remain pending until the studio confirms availability.
- Membership request form and request summary. Submitting the form is not proof of membership approval or payment.
- Student portal with Supabase Auth and per-user profile access when configured.
- Admin dashboard for events, gallery and shared announcements, protected by Supabase Auth and database Row Level Security when configured.
- Progressive Web App shell and limited public-asset caching.
- Accessibility refinements including visible keyboard focus and reduced-motion support.

## Run locally

From the repository root, use a local HTTP server (recommended for PWA/auth testing):

```bash
python -m http.server 8080
```

Open `http://localhost:8080/`.

## Configure secure authentication and database

The public website can display without a Supabase project, but central booking/member records, admin changes and student profile login require configuration.

1. Read [Supabase setup](SUPABASE_SETUP.md).
2. Apply `supabase/schema.sql` in the Supabase SQL Editor.
3. Set the project URL and **anon/publishable** key in `assets/js/supabase-config.js`.
4. Create an admin Auth user and assign `app_metadata.role = "admin"` using a trusted admin process.
5. Create student Auth users and matching `student_profiles` rows.
6. Verify Row Level Security with separate anonymous, student and admin test accounts before collecting real data.

**Never commit a Supabase service-role key, database password, or other privileged secret.** The browser-visible anon key is expected to be public; Row Level Security is what protects records.

## Security and data notes

- Admin login is disabled when Supabase configuration is missing; there is no public default admin password.
- Student demo credentials have been removed. Student access requires a server-verified Supabase Auth session and an authorized profile row.
- Membership and booking forms do not save health details or personal records to browser localStorage. With Supabase configured, they create central requests; otherwise they prepare a WhatsApp request for the visitor to send.
- A booking request is not a confirmed appointment. Staff must confirm availability.
- Contact forms prepare a WhatsApp message and do not claim that it was delivered automatically.
- See [SECURITY_AUDIT.md](SECURITY_AUDIT.md) for findings and the remaining production-readiness checklist.

## Quality checks

The GitHub Actions workflow runs:

```bash
node scripts/check-static-site.mjs
```

It checks JavaScript syntax, JSON parsing, and local file references in HTML. This is a lightweight static check, not a substitute for browser end-to-end testing or a security review.

## Repository contents

- `*.html`: website pages and request forms
- `assets/css/`: design system, animations and accessibility polish
- `assets/js/`: UI behaviour, booking/membership requests, Supabase integration and portals
- `supabase/schema.sql`: initial schema and RLS policies
- `SUPABASE_SETUP.md`: project configuration instructions
- `SECURITY_AUDIT.md`: audit findings and remediation plan

The committed `Aiswaryam_Yoga_Website.zip` is a legacy snapshot and may not match the current source. Use the GitHub source branch/release as the authoritative version.
