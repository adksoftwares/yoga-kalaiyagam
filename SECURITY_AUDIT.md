# Yoga Kalaiyagam — Code & Security Audit

Audit update: 2026-10-28  
Repository: `adksoftwares/yoga-kalaiyagam`  
Base reviewed: `main` at `c49d380f7407822e3cc15f77eeecd092edc08714`  
Working branch: `audit/safe-hardening`  
Review method: repository-wide static source inspection plus GitHub Actions checks. No browser end-to-end run or live Supabase penetration/RLS test was performed.

## Summary

The site is a static HTML/CSS/JavaScript PWA. This branch keeps the existing branding, pages, images and multilingual navigation while replacing insecure demo authentication patterns, making booking/membership pages usable, improving data handling and documenting the backend setup.

**Important:** secure admin/student login and central persistence only become active after a Supabase project is configured and its schema/RLS is applied. The repository cannot configure a third-party database without project access and credentials. The default public configuration intentionally contains no keys, so admin/student login fails closed instead of using a public demo password.

## File inventory

- Public pages: `index.html`, `about.html`, `courses.html`, `events.html`, `contact.html`
- Request forms: `booking.html`, `membership.html`
- Authenticated portals: `student-portal.html`, `admin.html`
- Styles: `assets/css/style.css`, `assets/css/animations.css`, `assets/css/polish.css`
- Scripts: `assets/js/main.js`, `cloud-db.js`, `admin.js`, `booking.js`, `membership.js`, `student.js`, `gallery.js`, `contact.js`, `pwa.js`, `pranayama.js`, `supabase-config.js`
- Backend schema and setup: `supabase/schema.sql`, `SUPABASE_SETUP.md`
- Repeatable checks: `scripts/check-static-site.mjs`, `.github/workflows/static-audit.yml`

## Findings and remediation

### Critical — Original admin login trusted browser storage

**Original issue:** the previous code included a known `admin123` hash and displayed the password; it treated a browser sessionStorage value as authentication. Password changes were browser-local.

**Changes in this branch:**
- Removed the default-password login path and public password hint.
- Admin login now uses Supabase Auth, verifies the access token against the Auth API, and checks `app_metadata.role === "admin"`.
- Admin actions require an in-memory verified session; cloud writes use the authenticated access token.
- Database write permissions are designed around the `public.is_yoga_admin()` RLS policy.
- If Supabase settings are absent, the admin login stays disabled.

**Still required:** set project URL/anon key in `assets/js/supabase-config.js`, create the admin Auth account, assign trusted app metadata, apply the SQL schema, and test with a non-admin account to prove write denial.

### Critical — Original student portal used demo data and phone-only matching

**Original issue:** the previous student script exposed a demo student profile and allowed local membership/phone matching. Static HTML also contained a sample meeting ID/password.

**Changes in this branch:**
- Removed the demo student credentials and profile fallback.
- Student login now uses email/password through Supabase Auth.
- The profile is loaded by authenticated user ID from `student_profiles`; RLS restricts reads to that student or an admin.
- Removed the public sample meeting credentials and fake default student ID/streak.
- Student access fails closed if Supabase is not configured or no profile is assigned.

**Still required:** create each student Auth user and a matching `student_profiles` row; configure the project and test authorization.

### High — Booking and membership pages were “Coming Soon”

**Original issue:** `booking.html` and `membership.html` did not contain the forms expected by their scripts.

**Changes in this branch:**
- Added responsive request forms and request-summary modals.
- Added WhatsApp handoff and made copy clear that a request is not a confirmed booking, membership, or payment.
- Added optional Supabase insertion for central request storage.
- Stopped saving membership/health details into localStorage. The central membership schema also excludes health details; health notes are only included in the WhatsApp draft the visitor chooses to send.
- Fixed local-date handling and reduced request-ID collision likelihood.

**Still required:** add anti-spam/rate limiting (preferably a server-side/Edge Function with CAPTCHA verification), verify date/slot availability transactionally, and have studio staff confirm requests. Direct anonymous REST inserts are not a complete abuse-prevention strategy.

### High — Cloud writes could fail silently

**Changes in this branch:**
- Added explicit HTTP response checks for event/gallery writes and deletes.
- Cloud data is now treated as empty when the server returns an empty array instead of silently reusing old local data.
- Admin record tables and statistics can read central membership/booking records with the authenticated admin token.
- Shared announcements are stored in `site_settings` and can be read publicly as plain text.
- Booking CSV export supports central records and neutralizes spreadsheet formula-leading cells.

**Still required:** deploy schema/RLS, check policies against the real Supabase project, and add backup/restore and conflict-resolution procedures. Public anon keys are expected to be visible; never use a service-role key in frontend code.

### High — Dynamic HTML could enable stored XSS

**Changes in this branch:**
- Escaped untrusted event/gallery/registration/booking values before rendering.
- Validated gallery image URL protocols.
- Changed announcement rendering from `innerHTML` to `textContent`.
- Added `noopener noreferrer` to new-tab contact links where applicable.

**Still required:** add a restrictive Content Security Policy and server-side validation; escaping in a static frontend is defense-in-depth, not a replacement for safe data policies.

### Medium — Contact form falsely claimed delivery

**Changes in this branch:** the contact form now builds a WhatsApp enquiry, displays an explicit status, and provides a fallback link. It does not claim a message was delivered before the visitor sends it.

### Medium — PWA cache scope and accessibility

**Changes in this branch:**
- Service worker caches an explicit allowlist of same-origin public assets, avoids precaching the student portal, and deletes only this app's old cache names.
- Added focus-visible styles, reduced-motion support, restrained interactions and modal styling.
- Added new scripts/styles to the cache allowlist.

### Medium — Documentation drift

**Changes in this branch:** README and setup instructions now describe the actual code paths, explain configuration, and warn that the committed ZIP is a legacy snapshot rather than the authoritative source.

## CI checks

GitHub Actions runs `node scripts/check-static-site.mjs` to validate:
- JavaScript syntax for `.js` and `.mjs` files
- JSON parsing
- Local HTML `src` and `href` references

The latest completed runs on this branch passed those static checks. This does **not** establish browser behavior, database connectivity, RLS correctness, accessibility conformance, or production security.

## Go-live checklist

- [ ] Configure `assets/js/supabase-config.js` with the project URL and anon/publishable key only.
- [ ] Apply `supabase/schema.sql` and review all policies.
- [ ] Create the admin account and set `app_metadata.role = "admin"` through a trusted admin path.
- [ ] Create student accounts and matching profiles.
- [ ] Add rate limiting/CAPTCHA for anonymous booking and membership submissions.
- [ ] Test anonymous, student, non-admin and admin access separately.
- [ ] Verify real booking submissions, WhatsApp handoff, event/gallery CRUD, empty-table behavior and backup recovery.
- [ ] Configure HTTPS, security headers/CSP, privacy/retention notice, and a monitored backup schedule.
- [ ] Regenerate or remove the legacy ZIP so it matches the reviewed source.

**Status:** code-level hardening and static CI are in place on this branch. Production readiness remains conditional on Supabase configuration, abuse controls and live authorization verification.
