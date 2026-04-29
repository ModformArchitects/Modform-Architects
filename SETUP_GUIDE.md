# Ar.Shristika — Complete Setup Guide

---

## Table of Contents
1. [EmailJS — Login Alert Emails](#1-emailjs--login-alert-emails)
2. [GitHub — Host Your Website Free](#2-github--host-your-website-free)
3. [Firebase Auth — Proper Backend Login](#3-firebase-auth--proper-backend-login)
4. [Supabase Auth — Alternative Backend](#4-supabase-auth--alternative-backend)
5. [Netlify — Better Hosting + Built-in Auth](#5-netlify--better-hosting--built-in-auth)
6. [Which Option Should You Choose?](#6-which-option-should-you-choose)

---

# 1. EmailJS — Login Alert Emails

**What it does:** Sends you an email alert (with IP + location) whenever someone fails login 5 times.
**Cost:** Free — 200 emails/month
**Time:** ~5 minutes

---

### Step 1.1 — Create Account

1. Go to **https://www.emailjs.com**
2. Click **Sign Up Free**
3. Sign up with Google using `aryansharma73095@gmail.com`
4. Verify your email if prompted

---

### Step 1.2 — Connect Gmail as Email Service

1. In left sidebar → click **Email Services**
2. Click **Add New Service**
3. Choose **Gmail** from the list
4. Click **Connect Account**
5. A Google popup appears → select `aryansharma73095@gmail.com`
6. Allow the permissions
7. Name it: `ArShristika_Gmail` (anything you like)
8. Click **Create Service**
9. ✅ **Copy the Service ID** (shown below the service name, e.g. `service_k3p9abc`)

---

### Step 1.3 — Create Email Template

1. Left sidebar → **Email Templates**
2. Click **Create New Template**
3. Fill in these fields:

**To Email field:**
```
aryansharma73095@gmail.com
```

**Subject field:**
```
🚨 Login Alert — Ar.Shristika Admin Portal
```

**Message body** — click the `< >` (HTML) toggle button, then paste:

```html
<div style="font-family:sans-serif;max-width:560px;margin:0 auto;padding:24px;background:#f7f4ef;border-radius:8px">
  <h2 style="color:#c8a96e;margin:0 0 4px">⚠️ Security Alert</h2>
  <p style="color:#6b6560;margin:0 0 20px;font-size:13px">Ar.Shristika Admin Portal</p>
  <p style="background:#fff;padding:16px;border-radius:6px;border-left:3px solid #e07050;color:#1a1916">
    Someone made <strong>5 failed login attempts</strong> on your admin portal and has been temporarily locked out.
  </p>
  <table style="width:100%;border-collapse:collapse;margin-top:20px;font-size:14px">
    <tr style="background:#fff">
      <td style="padding:10px 14px;color:#7a7268;border-bottom:1px solid #ede9e2;width:36%">🕐 Time</td>
      <td style="padding:10px 14px;color:#1a1916;border-bottom:1px solid #ede9e2"><strong>{{time}}</strong></td>
    </tr>
    <tr>
      <td style="padding:10px 14px;color:#7a7268;border-bottom:1px solid #ede9e2">🌐 IP Address</td>
      <td style="padding:10px 14px;color:#1a1916;border-bottom:1px solid #ede9e2"><strong>{{ip}}</strong></td>
    </tr>
    <tr style="background:#fff">
      <td style="padding:10px 14px;color:#7a7268;border-bottom:1px solid #ede9e2">📍 Location</td>
      <td style="padding:10px 14px;color:#1a1916;border-bottom:1px solid #ede9e2"><strong>{{city}}, {{region}}, {{country}}</strong></td>
    </tr>
    <tr>
      <td style="padding:10px 14px;color:#7a7268;border-bottom:1px solid #ede9e2">🏢 ISP / Org</td>
      <td style="padding:10px 14px;color:#1a1916;border-bottom:1px solid #ede9e2">{{org}}</td>
    </tr>
    <tr style="background:#fff">
      <td style="padding:10px 14px;color:#7a7268;border-bottom:1px solid #ede9e2">🕰 Timezone</td>
      <td style="padding:10px 14px;color:#1a1916;border-bottom:1px solid #ede9e2">{{timezone}}</td>
    </tr>
    <tr>
      <td style="padding:10px 14px;color:#7a7268;border-bottom:1px solid #ede9e2">💻 Browser</td>
      <td style="padding:10px 14px;color:#1a1916;border-bottom:1px solid #ede9e2">{{browser}} on {{device}}</td>
    </tr>
    <tr style="background:#fff">
      <td style="padding:10px 14px;color:#7a7268">🔗 Site</td>
      <td style="padding:10px 14px;color:#1a1916">{{site_url}}</td>
    </tr>
  </table>
  <p style="margin-top:24px;font-size:13px;color:#7a7268">
    If this was you testing the login, ignore this email.<br/>
    If it wasn't you, consider changing your admin password.
  </p>
  <p style="margin-top:16px;font-size:11px;color:#b8b0a4">— Ar.Shristika Admin Security System</p>
</div>
```

4. Click **Save Template**
5. ✅ **Copy the Template ID** (shown at top, e.g. `template_m7xabc`)

---

### Step 1.4 — Get Your Public Key

1. Click your **Account** icon (top right corner)
2. Go to **General** tab
3. Under **API Keys** section
4. ✅ **Copy the Public Key** (e.g. `xYzAbC123defGHI`)

---

### Step 1.5 — Add Keys to admin.js

Open `/Users/aryansharma/Downloads/Arch/admin.js`
Find lines 19–21 and fill in your 3 keys:

```js
var EMAILJS_PUBLIC_KEY  = 'xYzAbC123defGHI';     // ← Public Key
var EMAILJS_SERVICE_ID  = 'service_k3p9abc';      // ← Service ID
var EMAILJS_TEMPLATE_ID = 'template_m7xabc';      // ← Template ID
```

---

### Step 1.6 — Test

1. Open `admin.html` in browser
2. Type wrong password **5 times**
3. Page shows: *"Too many attempts. Locked for 60 seconds."*
4. Check Gmail — email arrives within 10 seconds ✅

---
---

# 2. GitHub — Host Your Website Free

**What it does:** Puts your website live on the internet for free.
**Cost:** Free forever for public repos
**Your site URL will be:** `https://YOUR-USERNAME.github.io/arshristika/`
**Time:** ~10 minutes

---

### Step 2.1 — Install Git (if not installed)

Check if Git is installed — open Terminal and type:
```bash
git --version
```
If you see a version number, skip to Step 2.2.
If not, download from **https://git-scm.com/download/mac** and install.

---

### Step 2.2 — Create a GitHub Account

1. Go to **https://github.com**
2. Click **Sign Up**
3. Choose a username (e.g. `arshristika` or your name)
4. Use any email
5. Verify your account

---

### Step 2.3 — Create a New Repository

1. After login, click the **+** icon (top right) → **New repository**
2. Fill in:
   - **Repository name:** `arshristika` (this becomes part of your URL)
   - **Description:** `Architecture & Design Studio Portfolio`
   - **Visibility:** ✅ Public (required for free hosting)
   - ❌ Do NOT check "Add a README file"
3. Click **Create repository**
4. You'll see a page with setup instructions — **keep this page open**

---

### Step 2.4 — Upload Your Files via Terminal

Open Terminal, then run these commands one by one:

```bash
# Go to your project folder
cd /Users/aryansharma/Downloads/Arch

# Set up Git (first time only — use your GitHub email)
git config --global user.name "Ar Shristika"
git config --global user.email "your@email.com"

# Initialise Git in the folder
git init

# Add all your website files
git add index.html style.css main.js admin.html admin.css admin.js .gitignore

# Create your first commit
git commit -m "Launch: Ar.Shristika portfolio website"

# Set the branch name to main
git branch -M main

# Connect to your GitHub repo (replace YOUR-USERNAME with your GitHub username)
git remote add origin https://github.com/YOUR-USERNAME/arshristika.git

# Push files to GitHub
git push -u origin main
```

When prompted, enter your GitHub username and password.
> Note: GitHub may ask for a Personal Access Token instead of password.
> If so: GitHub → Settings → Developer Settings → Personal Access Tokens → Generate New Token → check "repo" → copy the token and use it as password.

---

### Step 2.5 — Enable GitHub Pages

1. Go to your repository on GitHub
2. Click **Settings** tab (top of repo page)
3. Left sidebar → scroll down to **Pages**
4. Under **Source** → select **Deploy from a branch**
5. Branch: **main** | Folder: **/ (root)**
6. Click **Save**
7. Wait 2–3 minutes
8. Refresh the page — you'll see: **"Your site is live at https://YOUR-USERNAME.github.io/arshristika/"** ✅

---

### Step 2.6 — Update Files Later

Whenever you make changes, run these 3 commands:

```bash
cd /Users/aryansharma/Downloads/Arch
git add .
git commit -m "Update: describe what you changed"
git push
```

Your live site updates automatically within 1–2 minutes.

---
---

# 3. Firebase Auth — Proper Backend Login

**What it does:** Replaces the current password-in-JavaScript login with a real server-side authentication system. Password is never in your code.
**Cost:** Free (Spark plan) — unlimited email/password auth
**Works with:** GitHub Pages ✅
**Time:** ~30 minutes

---

### Step 3.1 — Create Firebase Project

1. Go to **https://console.firebase.google.com**
2. Sign in with your Google account
3. Click **Create a project**
4. Name: `arshristika-admin`
5. Disable Google Analytics (not needed)
6. Click **Create project** → wait ~30 seconds → **Continue**

---

### Step 3.2 — Enable Email/Password Authentication

1. Left sidebar → **Authentication**
2. Click **Get Started**
3. Under **Sign-in method** tab → click **Email/Password**
4. Toggle **Enable** ON
5. Click **Save**

---

### Step 3.3 — Create Your Admin User

1. Still in Authentication → click **Users** tab
2. Click **Add User**
3. Email: `aryansharma73095@gmail.com`
4. Password: `Admin@123`
5. Click **Add User** ✅
6. Copy the **User UID** shown (you'll need it to restrict access to only your account)

---

### Step 3.4 — Get Firebase Config Keys

1. Click the ⚙️ gear icon → **Project Settings**
2. Scroll to **Your apps** section
3. Click the `</>` Web icon
4. App nickname: `arshristika-web`
5. ❌ Don't enable Firebase Hosting
6. Click **Register app**
7. You'll see a code block like this — **copy the firebaseConfig object:**

```js
const firebaseConfig = {
  apiKey: "AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX",
  authDomain: "arshristika-admin.firebaseapp.com",
  projectId: "arshristika-admin",
  storageBucket: "arshristika-admin.appspot.com",
  messagingSenderId: "123456789012",
  appId: "1:123456789012:web:abcdef1234567890"
};
```

8. Click **Continue to console**

---

### Step 3.5 — Update admin.html

Add Firebase SDK before your `</head>` tag in `admin.html`:

```html
<!-- Firebase SDK -->
<script src="https://www.gstatic.com/firebasejs/10.7.0/firebase-app-compat.js"></script>
<script src="https://www.gstatic.com/firebasejs/10.7.0/firebase-auth-compat.js"></script>
```

---

### Step 3.6 — Update admin.js

Replace the top section of `admin.js` with:

```js
// Firebase config — paste your values here
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID"
};

const ADMIN_UID   = "PASTE_YOUR_USER_UID_HERE"; // Only this user can access admin
const ALERT_EMAIL = "aryansharma73095@gmail.com";

firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();

// Login
document.getElementById('loginForm').addEventListener('submit', function(e) {
  e.preventDefault();
  const email = document.getElementById('lfUser').value;
  const pass  = document.getElementById('lfPass').value;
  const errEl = document.getElementById('loginError');

  auth.signInWithEmailAndPassword(email, pass)
    .then(function(result) {
      if (result.user.uid !== ADMIN_UID) {
        auth.signOut();
        errEl.textContent = 'Access denied.';
        return;
      }
      showDashboard();
    })
    .catch(function(error) {
      errEl.textContent = 'Invalid email or password.';
    });
});

// Logout
document.getElementById('logoutBtn').addEventListener('click', function() {
  auth.signOut().then(function() { showLogin(); });
});

// Check if already logged in on page load
auth.onAuthStateChanged(function(user) {
  if (user && user.uid === ADMIN_UID) {
    showDashboard();
  } else {
    showLogin();
  }
});
```

---

### Step 3.7 — Benefits You Get

- ✅ Password stored securely on Google's servers — never in your code
- ✅ Built-in brute-force protection by Google
- ✅ Password reset via email (Firebase handles it)
- ✅ Works perfectly with GitHub Pages
- ✅ You can change password from Firebase Console anytime without touching code

---
---

# 4. Supabase Auth — Alternative Backend

**What it does:** Same as Firebase but open source. Google-free option.
**Cost:** Free — 50,000 monthly active users
**Works with:** GitHub Pages ✅
**Time:** ~30 minutes

---

### Step 4.1 — Create Supabase Account

1. Go to **https://supabase.com**
2. Click **Start your project** → Sign in with GitHub
3. Click **New Project**
4. Fill in:
   - Organisation: your name
   - Project name: `arshristika`
   - Database password: create a strong password (save it somewhere)
   - Region: **Southeast Asia (Singapore)** — closest to Mumbai
5. Click **Create new project** → wait ~2 minutes

---

### Step 4.2 — Get Your API Keys

1. Left sidebar → **Settings** → **API**
2. Copy:
   - **Project URL** (e.g. `https://xyzabc.supabase.co`)
   - **anon public key** (long string starting with `eyJ...`)

---

### Step 4.3 — Create Admin User

1. Left sidebar → **Authentication** → **Users**
2. Click **Invite User** (or Add User)
3. Email: `aryansharma73095@gmail.com`
4. They'll send a confirmation email → click the link
5. Set password to `Admin@123`

---

### Step 4.4 — Update admin.html

```html
<!-- Supabase SDK -->
<script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>
```

---

### Step 4.5 — Update admin.js

```js
const SUPABASE_URL  = 'https://xyzabc.supabase.co';  // your Project URL
const SUPABASE_ANON = 'eyJxxxxxxxxxxxxxxxxxx';         // your anon key
const ALERT_EMAIL   = 'aryansharma73095@gmail.com';

const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON);

// Login
document.getElementById('loginForm').addEventListener('submit', async function(e) {
  e.preventDefault();
  const email = document.getElementById('lfUser').value;
  const pass  = document.getElementById('lfPass').value;
  const errEl = document.getElementById('loginError');

  const { data, error } = await supabase.auth.signInWithPassword({
    email: email,
    password: pass
  });

  if (error) {
    errEl.textContent = 'Invalid email or password.';
  } else {
    showDashboard();
  }
});

// Logout
document.getElementById('logoutBtn').addEventListener('click', async function() {
  await supabase.auth.signOut();
  showLogin();
});

// Check session on load
supabase.auth.getSession().then(({ data: { session } }) => {
  if (session) { showDashboard(); } else { showLogin(); }
});
```

---
---

# 5. Netlify — Better Hosting + Built-in Auth

**What it does:** Hosts your website (better than GitHub Pages) AND has built-in authentication. Auto-deploys every time you push to GitHub.
**Cost:** Free tier — 100GB bandwidth/month, 300 build minutes
**Time:** ~15 minutes

---

### Step 5.1 — Create Netlify Account

1. Go to **https://www.netlify.com**
2. Click **Sign up** → choose **Sign up with GitHub**
3. Authorise Netlify to access GitHub

---

### Step 5.2 — Deploy Your Site

1. On Netlify dashboard → click **Add new site** → **Import an existing project**
2. Choose **Deploy with GitHub**
3. Authorise and select your `arshristika` repository
4. Settings:
   - Branch to deploy: `main`
   - Build command: *(leave empty)*
   - Publish directory: *(leave empty or type `.`)*
5. Click **Deploy site**
6. Wait ~1 minute → your site is live at a random URL like `stunning-fox-abc123.netlify.app`

---

### Step 5.3 — Set a Custom Subdomain (Free)

1. Site settings → **Domain management** → **Options** → **Edit site name**
2. Change to: `arshristika` → saves as `arshristika.netlify.app`

---

### Step 5.4 — Enable Netlify Identity (Built-in Auth)

1. Site dashboard → **Identity** tab
2. Click **Enable Identity**
3. Under **Registration** → set to **Invite only** (so only you can log in)
4. Click **Invite users** → enter `aryansharma73095@gmail.com`
5. You'll get an email → click the link → set password `Admin@123`

---

### Step 5.5 — Add Identity Widget to admin.html

```html
<!-- Netlify Identity -->
<script src="https://identity.netlify.com/v1/netlify-identity-widget.js"></script>
```

---

### Step 5.6 — Update admin.js

```js
// Netlify Identity login
netlifyIdentity.on('init', function(user) {
  if (user) { showDashboard(); } else { showLogin(); }
});

netlifyIdentity.on('login', function(user) {
  showDashboard();
  netlifyIdentity.close();
});

netlifyIdentity.on('logout', function() {
  showLogin();
});

document.getElementById('loginForm').addEventListener('submit', function(e) {
  e.preventDefault();
  netlifyIdentity.open('login');
});

document.getElementById('logoutBtn').addEventListener('click', function() {
  netlifyIdentity.logout();
});

netlifyIdentity.init();
```

---

### Step 5.7 — Auto-Deploy (The Big Advantage)

From now on, whenever you update your site:
```bash
git add .
git commit -m "Update site"
git push
```
Netlify automatically rebuilds and deploys within 30 seconds. No manual steps.

---
---

# 6. Which Option Should You Choose?

```
I just need the site live quickly
→ GitHub Pages (Section 2) ✅ Simplest

I want email alerts for failed logins  
→ EmailJS (Section 1) ✅ Add this regardless

I want proper secure login, staying on GitHub
→ Firebase Auth (Section 3) ✅ Best for GitHub Pages

I don't want to use Google services
→ Supabase (Section 4) ✅ Open source alternative

I want the best all-in-one free solution
→ Netlify hosting + Netlify Identity (Section 5) ✅ Most professional
```

---

## Recommended Path (Best Overall Setup)

```
Week 1 — Get live fast
   → Section 2: Deploy on GitHub Pages
   → Section 1: Set up EmailJS alerts

When ready to upgrade
   → Section 5: Move to Netlify
                + enables auto-deploy
                + proper Identity auth
                + free custom domain support
```

---

## Credentials Reference (Keep Private)

| Item | Value |
|---|---|
| Admin Username | admin |
| Admin Password | Admin@123 |
| Alert Email | aryansharma73095@gmail.com |
| GitHub Repo | github.com/YOUR-USERNAME/arshristika |
| Live URL (GitHub) | YOUR-USERNAME.github.io/arshristika |
| Live URL (Netlify) | arshristika.netlify.app |

---

> ⚠️ Keep this file private. Add `SETUP_GUIDE.md` to `.gitignore` before pushing to GitHub.
