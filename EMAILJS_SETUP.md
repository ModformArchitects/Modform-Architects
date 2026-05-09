# EmailJS Setup — Admin Login Alert

Follow these steps once to enable security alert emails.

---

## Step 1 — Create a free EmailJS account
Go to https://www.emailjs.com and sign up (free tier = 200 emails/month).

---

## Step 2 — Add Gmail as an Email Service
1. In the EmailJS dashboard → **Email Services** → **Add New Service**
2. Choose **Gmail**
3. Click **Connect Account** and sign in with `aryansharma73095@gmail.com`
4. Copy the **Service ID** (looks like `service_abc1234`)

---

## Step 3 — Create an Email Template
1. Go to **Email Templates** → **Create New Template**
2. Set these fields:

**To:** `{{to_email}}`

**Subject:**
```
🚨 Login Alert — Modform Architects Admin Portal
```

**Body (HTML):**
```html
<div style="font-family:sans-serif;max-width:560px;margin:0 auto;padding:24px;background:#f7f4ef;border-radius:8px">
  <h2 style="color:#c8a96e;margin:0 0 4px">⚠️ Security Alert</h2>
  <p style="color:#6b6560;margin:0 0 20px;font-size:13px">Modform Architects Admin Portal</p>

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

  <p style="margin-top:16px;font-size:11px;color:#b8b0a4">
    — Modform Architects Admin Security System
  </p>
</div>
```

3. Click **Save**
4. Copy the **Template ID** (looks like `template_xyz9876`)

---

## Step 4 — Get your Public Key
1. Go to **Account** → **General** tab
2. Copy the **Public Key** (looks like `abcDEF123456789`)

---

## Step 5 — Paste the keys into admin.js
Open `/Users/aryansharma/Downloads/Arch/admin.js` and fill in lines 12–14:

```js
var EMAILJS_PUBLIC_KEY  = 'abcDEF123456789';       // ← your Public Key
var EMAILJS_SERVICE_ID  = 'service_abc1234';        // ← your Service ID
var EMAILJS_TEMPLATE_ID = 'template_xyz9876';       // ← your Template ID
```

---

## Step 6 — Test it
1. Open `admin.html` in the browser
2. Enter wrong credentials 5 times
3. You should receive an alert email at `aryansharma73095@gmail.com` within ~10 seconds

---

## What the email contains
- Exact date & time of the attack
- IP address of the attacker
- City, region, country (via ipapi.co free geolocation)
- ISP / organisation name
- Timezone
- Browser and device type (Desktop/Mobile)
- Your site URL

## Notes
- Free EmailJS tier = **200 emails/month** (plenty for security alerts)
- ipapi.co free tier = **1,000 location lookups/day**
- The lockout blocks the attacker for 60 seconds per 5 attempts
- This file (`EMAILJS_SETUP.md`) should NOT be committed to a public GitHub repo as it explains your security setup
