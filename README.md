# Modform Architects — Architecture & Design Studio

Portfolio website and admin CRM for **Modform Architects** (Ar. Shrishtika Pal, Founding Principal).

---

## File Structure

```
Arch/
├── index.html          # Public portfolio website
├── style.css           # Styles for index.html
├── main.js             # JS for index.html
├── admin.html          # Admin login + dashboard
├── admin.css           # Admin styles
├── admin.js            # Admin logic (auth, CRM, ads)
├── .gitignore          # Excludes setup docs from git
├── EMAILJS_SETUP.md    # EmailJS setup guide (git-ignored)
├── SETUP_GUIDE.md      # Hosting & backend guide (git-ignored)
└── README.md           # This file
```

---

## Contact Details on Site

| Field    | Value                    |
|----------|--------------------------|
| Email    | shrishtikapal6@gmail.com |
| Phone    | +91 94528 61841          |
| WhatsApp | +91 94528 61841          |

---

## Admin Portal

### Login

| Field    | Value        |
|----------|--------------|
| URL      | `admin.html` |
| Username | `admin`      |
| Password | `Admin@123`  |

### Security model

- Password is stored as a **SHA-256 hash** in `admin.js` — plain text never appears in source
- **5 failed attempts** → 60-second lockout + alert email sent to `aryansharma73095@gmail.com`
- Alert includes: IP address, city/country, ISP, browser, timestamp
- Alert delivery uses **EmailJS** (runs in the browser, no server needed) — see `EMAILJS_SETUP.md` to activate

### How to change the password

1. Open browser console (any page), run:
   ```js
   crypto.subtle.digest('SHA-256', new TextEncoder().encode('admin:NEWPASSWORD'))
     .then(b => console.log([...new Uint8Array(b)].map(x => x.toString(16).padStart(2,'0')).join('')))
   ```
2. Copy the hash that prints out
3. Open `admin.js` → replace the value of `ADMIN_HASH` on **line 9**

---

## Admin Dashboard — What's Inside

### Overview panel
- Total leads, new leads this week, total visitors, page views
- Recent leads table with colour-coded status badges

### Leads panel
- All contact form submissions
- Filter by status: New / Contacted / Qualified / Closed
- Change status inline
- Export full list to CSV

### Visitors panel
- Every site visit logged: time, page, referrer, device/browser
- Export to CSV

### Marketing panel

**Broadcast** — compose a message and send to all leads via email or WhatsApp

**Campaign Builder** — build and launch ads on:
- Google Ads (Search / Display / Shopping)
- Meta Ads (Facebook + Instagram feed/stories)
- Instagram Ads (Explore / Reels)

Fill in campaign name, objective, audience, budget, dates → **Launch** opens the platform with fields pre-filled. **Save Draft** stores the campaign locally.

---

## Data Storage

No database. Everything lives in the browser's **localStorage**.

| Key                 | What it stores                    |
|---------------------|-----------------------------------|
| `ars_leads`         | Contact form submissions          |
| `ars_visitors`      | Visit log                         |
| `ars_admin_auth`    | Admin session (sessionStorage)    |
| `ars_lockout`       | Failed login counter + lockout    |
| `ars_campaigns`     | Saved ad campaign drafts          |
| `modform-theme`     | Dark / Light preference           |

---

## Public Site Features

| Feature                  | Detail                                                             |
|--------------------------|--------------------------------------------------------------------|
| Dark / Light theme       | Toggle in nav, preference saved to localStorage                    |
| Scroll progress bar      | Thin accent bar at top of viewport                                 |
| Smooth scroll            | Lenis v1.0.42, duration 1.1s, native on mobile                    |
| Custom cursor            | Magnetic lerp cursor (desktop only)                                |
| Scroll animations        | IntersectionObserver `.reveal`, 35% threshold                      |
| Marquee                  | GPU-composited, includes Vastu Shastra / Tropical Architecture     |
| Film grain               | CSS `::after` overlay, `will-change: transform`                    |
| **Floating WhatsApp**    | Fixed green button, visible from any section, links to +91 94528 61841 |
| **Back-to-top button**   | Appears after 600px scroll, smooth scrolls to top                 |
| **How We Work section**  | 4-step process: Listen → Vastu → Documentation → Build             |
| **Awards section**       | 18 real awards in a responsive grid                                |
| **Project detail pages** | `project.html?id=0–5` — full case study, image gallery, related projects |
| **Custom favicon**       | SVG `MF` geometric monogram, gold on dark                          |
| Contact form             | Saves to `ars_leads` + sends email via EmailJS (when configured)   |
| Visitor tracking         | Auto-logs each visit to `ars_visitors`                             |
| **PDF download**         | "Download Studio Profile" button in About — needs `studio-profile.pdf` |

---

## Performance

- **Single scroll dispatcher** — one `requestAnimationFrame` loop shared by all scroll callbacks
- **`content-visibility: auto`** on every `.section` — off-screen sections skipped by renderer
- **`will-change: transform`** on grain overlay, marquee track, cursor, hero image
- **Film grain**: 3s / 4 steps animation (reduced from 0.8s / 7 steps)
- **`syncTouch: false`** on Lenis — native scroll speed on mobile
- Google Fonts with `display=swap` — no render blocking

---

## Hosting

The site is fully static — works on any host.

| Platform     | How                                                    | Cost |
|--------------|--------------------------------------------------------|------|
| GitHub Pages | Push to repo → Settings → Pages → Deploy from `main`  | Free |
| Netlify      | Drag & drop the folder at netlify.com/drop             | Free |
| Vercel       | `vercel` CLI or import GitHub repo                     | Free |

Full instructions with git commands are in `SETUP_GUIDE.md`.

### GitHub Pages — quick start
```bash
cd /Users/aryansharma/Downloads/Arch

git init
git add index.html style.css main.js admin.html admin.css admin.js README.md .gitignore
git commit -m "Initial deploy — Modform Architects portfolio"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/modform.git
git push -u origin main
```
Then: repo → **Settings** → **Pages** → Source: `main` / `/ (root)` → **Save**

Live URL: `https://YOUR_USERNAME.github.io/modform/`

---

## EmailJS Setup (security alert emails)

Full walkthrough in `EMAILJS_SETUP.md`. Summary:

1. Sign up at [emailjs.com](https://www.emailjs.com) — free tier (200 emails/month)
2. Add Gmail service → connect `aryansharma73095@gmail.com`
3. Create email template (HTML provided in `EMAILJS_SETUP.md`)
4. Paste three keys into `admin.js` lines 19–21:
   ```js
   var EMAILJS_PUBLIC_KEY  = 'YOUR_PUBLIC_KEY';
   var EMAILJS_SERVICE_ID  = 'service_xxxxxxx';
   var EMAILJS_TEMPLATE_ID = 'template_xxxxxxx';
   ```
5. Test: open `admin.html`, enter wrong password 5 times → check inbox

---

## Contact Form → Email Setup

The contact form saves leads to localStorage automatically. To also receive an email every time someone submits:

1. In EmailJS → **Email Templates** → **Create New Template** (separate from the login-alert template)
2. Set **To**: `{{to_email}}`  
   Set **Reply-To**: `{{reply_to}}`  
   Set **Subject**: `New Enquiry — {{project_type}} — {{from_name}}`
3. Use this **body**:
   ```
   Name: {{from_name}}
   Email: {{from_email}}
   Phone: {{phone}}
   Service interest: {{project_type}}

   Message:
   {{message}}
   ```
4. Save and copy the **Template ID**
5. Open `main.js` and fill in lines near the `initForm` function:
   ```js
   var FORM_PUBLIC_KEY  = 'YOUR_PUBLIC_KEY';   // same as admin.js
   var FORM_SERVICE_ID  = 'service_xxxxxxx';   // same as admin.js
   var FORM_TEMPLATE_ID = 'template_xxxxxxx';  // new contact template
   ```

## PDF Studio Profile

A "Download Studio Profile" button lives in the About section. To activate it:
1. Create a PDF (Canva, InDesign, or print `index.html` to PDF via browser)
2. Save it as `studio-profile.pdf` in the `Arch/` folder
3. The button links automatically — no code change needed

## Google Analytics (GA4)

1. Go to [analytics.google.com](https://analytics.google.com) → create a property → get your **Measurement ID** (`G-XXXXXXXXXX`)
2. Open `index.html` and uncomment the GA4 block in `<head>` (lines ~18–26)
3. Replace both instances of `G-XXXXXXXXXX` with your real ID

---

## Tech Stack

| Layer        | Technology                                    |
|--------------|-----------------------------------------------|
| Markup       | HTML5                                         |
| Styles       | CSS3 (custom properties, grid, flexbox)       |
| Scripts      | Vanilla JS — no framework, no build step      |
| Fonts        | Google Fonts — Cormorant Garamond + DM Sans   |
| Smooth scroll | Lenis v1.0.42                                |
| Email alerts | EmailJS Browser SDK v4                        |
| Geolocation  | ipapi.co (free, no key, 1000 req/day)         |
| Auth         | Web Crypto API SHA-256 + localStorage         |

Browser support: Chrome 90+, Firefox 88+, Safari 14+, Edge 90+

---

## Credentials Reference

| What              | Value                          |
|-------------------|--------------------------------|
| Admin username    | `admin`                        |
| Admin password    | `Admin@123`                    |
| Alert email       | aryansharma73095@gmail.com     |
| Studio email      | shrishtikapal6@gmail.com       |
| Studio phone      | +91 94528 61841                |
