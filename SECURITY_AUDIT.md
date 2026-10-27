# Yoga Kalaiyagam — Repository Audit

Audit date: 2026-10-28  
Branch reviewed: `main` at `c49d380f7407822e3cc15f77eeecd092edc08714`  
Scope: tracked HTML, CSS, JavaScript, PWA manifest/service worker, README, and bundled ZIP metadata.  
Method: static code inspection. This is not a penetration test or an end-to-end browser test.

## Executive summary

The repository is a static HTML/CSS/JavaScript website with a PWA shell and optional browser-side Supabase REST integration. There is no application server, server-side session validation, automated test suite, or deployment/security-header configuration in the current source tree. The current version should **not** be treated as production-safe for admin management or private student data.

## Repository inventory

- Public pages: `index.html`, `about.html`, `courses.html`, `events.html`, `contact.html`
- User workflows: `booking.html`, `membership.html`, `student-portal.html`
- Admin UI: `admin.html`
- Styles: `assets/css/style.css`, `assets/css/animations.css`
- Browser scripts: `assets/js/main.js`, `cloud-db.js`, `admin.js`, `booking.js`, `membership.js`, `student.js`, `gallery.js`, `pranayama.js`, `pwa.js`
- PWA: `manifest.json`, `sw.js`, `assets/images/icons/*`
- Media: `assets/images/*`
- A bundled ZIP, `Aiswaryam_Yoga_Website.zip`, is committed alongside the source. It can drift from the actual source and should be regenerated from the reviewed version when distributing.

## Findings by severity

### Critical — Admin authentication is client-side only

Files: `admin.html`, `assets/js/admin.js`

- The source contains a known SHA-256 hash for the password `admin123`, and the login page explicitly displays that password.
- The username is hard-coded to `admin`.
- A value in `sessionStorage` is treated as an authenticated session without server verification; a visitor can set browser storage from developer tools.
- Password changes are stored only in `localStorage`, so they are browser-specific and do not secure the site for other visitors.
- SHA-256 alone is not an appropriate password-storage system. More importantly, hashing in public JavaScript cannot protect an admin account.

**Required fix:** move authentication and authorization to a server-side service; store passwords using a modern password-hashing algorithm (Argon2id or bcrypt), use secure session cookies, rate-limit login attempts, and check authorization on every write/delete endpoint. Until that exists, do not use this dashboard to manage sensitive or business-critical data on a public deployment.

### Critical — Student portal has a public demo bypass

Files: `student-portal.html`, `assets/js/student.js`

- Demo student ID and phone values are embedded in the page and JavaScript.
- The login checks locally stored membership records and can match either the registration ID or phone field; this is not proof of identity.
- Student profile/session data is stored in `sessionStorage` and is never verified by a server.

**Required fix:** remove demo access from production; add server-side student authentication, verified account recovery, and per-student authorization. Never return another student's profile based only on an ID or phone number.

### High — Booking and membership are browser-local, not centralized

Files: `assets/js/booking.js`, `assets/js/membership.js`, `assets/js/admin.js`, `assets/js/cloud-db.js`

- Bookings and memberships are written to `localStorage`; data does not automatically reach the studio or another device.
- Browser clearing, private mode, device changes, or storage failures can remove or hide records.
- Admin tables read these records from the same browser, so they are not a reliable central register.
- The booking form's WhatsApp action opens a pre-filled message; that is not a server-confirmed booking or slot reservation.

**Required fix:** persist records in a central database through an authorized backend/API; validate fields on the server; define booking statuses; prevent duplicate/over-capacity slots transactionally; send explicit confirmation only after persistence succeeds. Treat phone numbers and registration details as personal data.

### High — Cloud synchronization can silently diverge

File: `assets/js/cloud-db.js`

- Supabase REST calls are made from the browser. An anon/public key is visible by design, so strict Supabase Row Level Security (RLS) and least-privilege policies are mandatory; a public key is not an admin secret.
- Save/delete paths do not consistently check HTTP response status, so a failed REST request can be logged or ignored while the local copy has already changed.
- Fetch logic only returns cloud arrays when they contain at least one row. An intentionally empty cloud table may therefore fall back to stale local data.
- The schema, constraints, RLS policies, backups, and actual project configuration were not available for verification.

**Required fix:** define and version the schema, verify RLS for every table, check all HTTP statuses and response bodies, surface sync failures in the UI, define a deterministic cloud-vs-cache policy, and add backup/restore tests. Do not place a Supabase service-role key in browser code.

### High — Stored XSS risk in dynamic rendering

Files: `assets/js/admin.js`, `assets/js/gallery.js`, `assets/js/main.js`

- Event/gallery fields and the announcement are interpolated into `innerHTML`.
- Data can originate from admin input, local storage, or cloud rows. If untrusted markup is rendered, it may execute in a visitor's browser.

**Changes in this audit branch:** added HTML escaping for dynamic event/gallery fields in admin/public renderers, validated image URL protocols, and changed announcements to render as plain text. These are defence-in-depth fixes, not a substitute for server validation or a restrictive Content Security Policy.

### Medium — Contact form reports success without delivery

File: `contact.html`

- The form's inline submit handler displays a success alert and resets the form, but no server, email provider, or WhatsApp handoff is called.

**Required fix:** connect the form to an actual delivery mechanism, report success only after it succeeds, show errors on failure, and add server-side validation and abuse protection.

### Medium — PWA cache policy was too broad

File: `sw.js`

- The previous fetch handler could cache arbitrary successful GET responses, including cross-origin responses.
- Cache cleanup could delete unrelated cache names from the same origin.
- The student portal was in the precache list.

**Changes in this audit branch:** cache only an explicit list of same-origin public static assets; exclude the student portal from precaching; only delete old caches with this app's prefix; add a public-home fallback for offline navigation.

### Medium — Documentation and verification gaps

Files: `README.md`, repository root

- README advertises the default admin credentials and has feature descriptions that need to be checked against the actual page flows.
- There is no existing automated test/lint script or CI workflow in the tracked source.
- The repository includes a ZIP alongside editable source, creating a risk that the distributed ZIP will not match later fixes.

**Changes in this audit branch:** added a lightweight Node-based static checker and a GitHub Actions workflow for JavaScript syntax, JSON parsing, and local HTML asset links.

## Changes included in this audit branch

1. `sw.js`: scoped cache handling to public same-origin assets and app-owned cache names.
2. `assets/js/main.js`: render announcement text with `textContent`, not `innerHTML`.
3. `assets/js/admin.js`: escape event/gallery values and validate image URL protocols before rendering.
4. `assets/js/gallery.js`: escape event/gallery content and validate image URL protocols.
5. `scripts/check-static-site.mjs` and `.github/workflows/static-audit.yml`: repeatable static checks.
6. This report documents findings and remaining work.

## Recommended remediation sequence

1. **Before production:** replace client-only admin/student login with server-side authentication and authorization; remove demo credentials and public default access.
2. Implement central booking/membership APIs and a database schema; apply RLS/permissions, server validation, rate limiting, logging, and backups.
3. Fix cloud sync semantics: empty-table handling, HTTP errors, retry policy, conflict resolution, and clear user feedback.
4. Wire contact delivery and confirmation workflows.
5. Verify multilingual page coverage, responsive layouts, accessibility, navigation, broken assets, PWA update/offline behaviour, and data export/import.
6. Run CI checks, then perform browser end-to-end tests on desktop and mobile with test data before merging/deployment.
7. Rebuild the bundled ZIP from the reviewed source or remove the ZIP from source control and publish generated releases instead.

## Verification status

- Static code review: performed for the files listed above.
- Browser end-to-end testing: not performed in this audit.
- Supabase schema/RLS/project settings: not independently verified.
- Production readiness: **not yet approved** until the Critical and High remaining backend/data findings are resolved.
