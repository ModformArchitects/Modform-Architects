# Modform Architects — Architecture & Design Studio

Portfolio website and admin CRM for **Modform Architects** (Ar. Shrishtika Pal, Founding Principal).

Live site: <https://modformarchitecs.com>

---

## File Structure

```
.
├── index.html              # Public portfolio website
├── style.css               # Styles for index.html
├── main.js                 # JS for index.html (includes secret admin entry)
├── admin.html              # Admin login + dashboard
├── admin.css               # Admin styles
├── admin.js                # Admin logic (auth via Supabase, CRM, ads)
├── database.js             # Supabase Auth + REST connector
├── projects-data.js        # Portfolio project data
├── project.html            # Project detail page template
├── client-login.html       # Client portal
├── 404.html                # Branded 404 page
├── favicon.svg             # SVG favicon
├── robots.txt              # Crawler rules
├── sitemap.xml             # Sitemap
├── CNAME                   # GitHub Pages custom domain binding
├── .nojekyll               # Disables Jekyll on GitHub Pages
├── SUPABASE_SETUP.sql      # One-time DB schema + RLS policies
├── assets/                 # Logo, project images, founder portrait
└── README.md
```

---

## Contact Details on Site

| Field    | Value                       |
| -------- | --------------------------- |
| Email    | modformarchitects@gmail.com    |
| Phone    | +91 94528 61841             |
| WhatsApp | +91 94528 61841             |

---

## Admin Portal

### How to log in

1. **Hidden entry from the public site:** scroll to the "About the Studio" section → click the **founder's portrait 5 times within 3 seconds** → admin login screen appears.
2. **Direct URL:** `https://modformarchitecs.com/admin.html` (bookmark this).

### Authentication model

- Auth is handled by **Supabase Auth** (email + password).
- The plain password is never in the source code. Supabase stores a bcrypt hash server-side.
- Sessions are JWTs stored in `sessionStorage` (`modform_admin_session`) — cleared on tab close.
- 5 failed attempts → 60-second lockout + alert email (when EmailJS is configured).
- Alert payload: IP, city/country, ISP, browser, timestamp.

### How to change the admin password

**Option A — from the dashboard:**
Settings panel → "Change Admin Password" → enter new password (8+ chars) → Update. The change is live everywhere immediately.

**Option B — from Supabase:**
Supabase dashboard → Authentication → Users → select user → Reset password.

### Initial admin user setup (one-time)

1. Supabase dashboard → **Authentication → Users → Add user → Create new user**.
2. Pick an email + a strong password (8+ chars).
3. Tick **"Auto Confirm User"**.
4. Click **Create**.

You can now sign in at `/admin.html` with that email and password.

---

## Admin Dashboard — What's Inside

### Overview panel
- Total leads, new leads this week, total visitors, page views.
- Recent leads table with colour-coded status badges.

### Leads panel
- All contact form submissions.
- Filter by status: New / Contacted / Qualified / Closed.
- Change status inline.
- Export full list to CSV.

### Visitors panel
- Every site visit logged: time, page, referrer, device/browser.
- Export to CSV.

### Marketing panel
- **Broadcast** — compose a message and send to all leads via email or WhatsApp.
- **Campaign Builder** — pre-fill Google / Meta / Instagram Ads launch flows from a saved draft.

---

## Data Storage

Backend is **Supabase** (PostgreSQL with Row-Level Security). The browser keeps a local cache in `localStorage` for offline-friendliness.

### Supabase tables

| Table              | Purpose                              |
| ------------------ | ------------------------------------ |
| `leads`            | Contact form submissions             |
| `visitors`         | Visit log                            |
| `customer_profiles`| Client-portal capture                |

### RLS policy summary

| Role            | Permissions                                              |
| --------------- | -------------------------------------------------------- |
| `anon`          | INSERT only (public forms)                               |
| `authenticated` | SELECT/UPDATE/DELETE on `leads`, SELECT on the others    |

Run `SUPABASE_SETUP.sql` in the Supabase SQL Editor once to install the schema + policies.

### Browser-side keys

| Key                       | What it stores                                                  |
| ------------------------- | --------------------------------------------------------------- |
| `modform_admin_session`   | Supabase JWT for the signed-in admin (sessionStorage)           |
| `ars_leads`               | Local cache of leads                                            |
| `ars_visitors`            | Local cache of visitors                                         |
| `ars_lockout`             | Failed login counter + lockout                                  |
| `ars_ad_campaigns`        | Saved ad campaign drafts                                        |
| `modform-theme`           | Dark / Light preference                                         |

---

## Public Site Features

| Feature                  | Detail                                                                 |
| ------------------------ | ---------------------------------------------------------------------- |
| Dark / Light theme       | Toggle in nav, saved to localStorage                                   |
| Scroll progress bar      | Thin accent bar at top of viewport                                     |
| Smooth scroll            | Lenis v1.0.42 (native on mobile)                                       |
| Custom cursor            | Magnetic lerp cursor (desktop only)                                    |
| Scroll animations        | IntersectionObserver `.reveal`                                         |
| Marquee                  | Vastu Shastra / Tropical Architecture rolling banner                   |
| Film grain               | CSS overlay                                                            |
| Floating WhatsApp        | Fixed green button on every section                                    |
| Back-to-top              | Appears after 600px scroll                                             |
| Project detail pages     | `project.html?id=0–5`                                                  |
| Contact form             | Saves to Supabase `leads` + optional EmailJS notification              |
| Visitor tracking         | Auto-logs each visit to Supabase `visitors`                            |
| Hidden admin entry       | 5 rapid clicks on founder portrait → `admin.html`                      |

---

## Hosting

The site is fully static and is deployed on **GitHub Pages** at `modformarchitecs.com`.

| Component | Setup                                                            |
| --------- | ---------------------------------------------------------------- |
| Repo      | `ModformArchitects/Modform-Architects` (public)                  |
| Source    | `main` branch / root                                             |
| Domain    | `modformarchitecs.com` (GoDaddy → DNS → 4 A records to GitHub IPs + CNAME www → `modformarchitects.github.io`) |
| HTTPS     | Auto-issued by GitHub (Let's Encrypt)                            |

---

## EmailJS (optional — security alert + contact form emails)

EmailJS is currently **not configured** — alert emails and contact-form emails are silently skipped. To enable, fill in the three keys in `admin.js` (lines ~19–21) and `main.js` (the `FORM_*` constants).

Walkthrough: see `EMAILJS_SETUP.md` (kept locally, not committed).

---

## Tech Stack

| Layer          | Technology                                          |
| -------------- | --------------------------------------------------- |
| Markup         | HTML5                                               |
| Styles         | CSS3 (custom properties, grid, flexbox)             |
| Scripts        | Vanilla JS — no framework, no build step            |
| Fonts          | Google Fonts — Cormorant Garamond + DM Sans         |
| Smooth scroll  | Lenis v1.0.42                                       |
| Auth           | Supabase Auth (bcrypt server-side)                  |
| Database       | Supabase Postgres + Row-Level Security              |
| Email alerts   | EmailJS Browser SDK v4 (optional)                   |
| Geolocation    | ipapi.co (free, no key, 1000 req/day)               |

Browser support: Chrome 90+, Firefox 88+, Safari 14+, Edge 90+.

---

## Studio Reference

| What         | Value                       |
| ------------ | --------------------------- |
| Studio email | modformarchitects@gmail.com    |
| Studio phone | +91 94528 61841             |
| Site URL     | https://modformarchitecs.com |

> Admin credentials are managed in **Supabase Authentication** — not in this file or in any source file.
