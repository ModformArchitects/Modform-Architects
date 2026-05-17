/* ════════════════════════════════════════════════════════════
   Modform Architects — Admin Dashboard
   ════════════════════════════════════════════════════════════ */

'use strict';

/* Authentication is handled by Supabase Auth (see database.js).
   The admin password is hashed server-side by Supabase (bcrypt) and never
   reaches the browser as plaintext or hash — there is nothing to inspect. */
var LEADS_KEY    = 'ars_leads';
var VISITORS_KEY = 'ars_visitors';
var LOCKOUT_KEY  = 'ars_lockout';

/* ── EmailJS config ──────────────────────────────────────────
   Fill these in after setting up EmailJS (see README below).
   Leave blank to disable email alerts.
   ─────────────────────────────────────────────────────────── */
var EMAILJS_PUBLIC_KEY  = '';          // e.g. 'user_xxxxxxxxxxxxxxx'
var EMAILJS_SERVICE_ID  = '';          // e.g. 'service_xxxxxxx'
var EMAILJS_TEMPLATE_ID = '';          // e.g. 'template_xxxxxxx'
var ALERT_EMAIL         = 'aryansharma73095@gmail.com';

var DEMO_LEADS = [
  { id: 1700000001000, ts: new Date(Date.now() - 1 * 864e5).toISOString(), source: 'website_form', status: 'new',       name: 'Arjun Mehta',   email: 'arjun.mehta@gmail.com',      phone: '+91 98765 43210', project: 'Architectural Design',  message: 'Looking for a 3BHK villa design in Lonavala. Budget approx 2Cr.' },
  { id: 1700000002000, ts: new Date(Date.now() - 2 * 864e5).toISOString(), source: 'whatsapp',    status: 'contacted',  name: 'Sonal Kapoor',  email: 'sonal.k@outlook.com',        phone: '+91 88001 12233', project: 'Interior Architecture', message: 'Need interior design for office in BKC. 4000 sqft.' },
  { id: 1700000003000, ts: new Date(Date.now() - 3 * 864e5).toISOString(), source: 'website_form', status: 'qualified', name: 'Rajesh Iyer',   email: 'r.iyer@iyerconstruction.in', phone: '+91 93400 55678', project: 'Urban Planning',         message: 'Residential township project in Navi Mumbai. 12 acres.' },
  { id: 1700000004000, ts: new Date(Date.now() - 5 * 864e5).toISOString(), source: 'email',       status: 'new',        name: 'Priya Desai',   email: 'priya.desai@tatahousing.com',phone: '+91 79900 11223', project: 'Architectural Design',  message: 'Interested in affordable housing design consultation.' },
  { id: 1700000005000, ts: new Date(Date.now() - 7 * 864e5).toISOString(), source: 'phone',       status: 'closed',     name: 'Vikram Anand',  email: 'v.anand@anandrealty.com',    phone: '+91 98001 44556', project: 'Landscape & Environment', message: 'Waterfront promenade for Powai lake-facing project.' },
  { id: 1700000006000, ts: new Date(Date.now() - 9 * 864e5).toISOString(), source: 'website_form', status: 'contacted', name: 'Meera Shah',    email: 'meerashah@icloud.com',       phone: '+91 80045 67890', project: 'Interior Architecture', message: 'Renovation of ancestral bungalow in Juhu.' },
];

/* ═══════════════════════════════════════════════════════════
   SHA-256 (Web Crypto API — built into every modern browser)
   ═══════════════════════════════════════════════════════════ */
function sha256(str) {
  var data = new TextEncoder().encode(str);
  return crypto.subtle.digest('SHA-256', data).then(function(buf) {
    return Array.from(new Uint8Array(buf))
      .map(function(b) { return b.toString(16).padStart(2, '0'); })
      .join('');
  });
}

/* ═══════════════════════════════════════════════════════════
   BRUTE-FORCE LOCKOUT + EMAIL ALERT
   5 wrong attempts → 60s lockout + alert email to admin
   ═══════════════════════════════════════════════════════════ */
function getLockout() {
  try { return JSON.parse(localStorage.getItem(LOCKOUT_KEY) || '{}'); } catch(e) { return {}; }
}
function clearLockout() {
  try { localStorage.removeItem(LOCKOUT_KEY); } catch(e) {}
}

function recordFailedAttempt(errEl) {
  var d = getLockout();
  d.attempts = (d.attempts || 0) + 1;
  var remaining = 5 - d.attempts;

  if (d.attempts >= 5) {
    d.until    = Date.now() + 60000;
    d.attempts = 0;
    try { localStorage.setItem(LOCKOUT_KEY, JSON.stringify(d)); } catch(e) {}
    if (errEl) errEl.textContent = 'Too many attempts. Locked for 60 seconds.';
    /* Fire alert — fetch location first, then email */
    fetchLocationAndAlert();
  } else {
    try { localStorage.setItem(LOCKOUT_KEY, JSON.stringify(d)); } catch(e) {}
    if (errEl) {
      errEl.textContent = 'Invalid credentials. '
        + remaining + ' attempt' + (remaining === 1 ? '' : 's') + ' remaining.';
    }
  }
}

/* Fetch IP + location via ipapi.co (free, no API key, 1k req/day) */
function fetchLocationAndAlert() {
  fetch('https://ipapi.co/json/')
    .then(function(r) { return r.json(); })
    .then(function(geo) {
      sendAlertEmail({
        ip:       geo.ip       || 'Unknown',
        city:     geo.city     || 'Unknown',
        region:   geo.region   || '',
        country:  geo.country_name || 'Unknown',
        org:      geo.org      || 'Unknown ISP',
        timezone: geo.timezone || '',
      });
    })
    .catch(function() {
      /* Location fetch failed — still send email without location */
      sendAlertEmail({ ip: 'Unknown', city: 'Unknown', region: '', country: 'Unknown', org: '', timezone: '' });
    });
}

function sendAlertEmail(geo) {
  /* Skip if EmailJS not configured */
  if (!EMAILJS_PUBLIC_KEY || !EMAILJS_SERVICE_ID || !EMAILJS_TEMPLATE_ID) {
    console.warn('[Admin Alert] EmailJS not configured — skipping alert email.');
    return;
  }

  /* Init EmailJS with public key */
  if (typeof emailjs !== 'undefined') {
    emailjs.init({ publicKey: EMAILJS_PUBLIC_KEY });
  } else {
    console.warn('[Admin Alert] EmailJS SDK not loaded.');
    return;
  }

  var now   = new Date();
  var time  = now.toLocaleString('en-IN', {
    weekday: 'short', day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit', second: '2-digit', timeZoneName: 'short'
  });

  var ua     = navigator.userAgent;
  var device = /Mobi|Android/i.test(ua) ? 'Mobile' : 'Desktop';
  var browser = (function() {
    if (/Firefox/.test(ua))        return 'Firefox';
    if (/Edg/.test(ua))            return 'Microsoft Edge';
    if (/Chrome/.test(ua))         return 'Chrome';
    if (/Safari/.test(ua))         return 'Safari';
    return 'Unknown Browser';
  })();

  var params = {
    to_email:  ALERT_EMAIL,
    time:      time,
    ip:        geo.ip,
    city:      geo.city,
    region:    geo.region,
    country:   geo.country,
    org:       geo.org,
    timezone:  geo.timezone,
    browser:   browser,
    device:    device,
    site_url:  window.location.origin,
  };

  emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, params)
    .then(function() {
      console.info('[Admin Alert] Security alert sent to ' + ALERT_EMAIL);
    })
    .catch(function(err) {
      console.error('[Admin Alert] Email failed:', err);
    });
}

/* ═══════════════════════════════════════════════════════════
   LOCAL CONFIG KEYS (non-auth)
   ═══════════════════════════════════════════════════════════ */
var EMAILJS_CFG_KEY   = 'ars_emailjs_cfg';
var STUDIO_CFG_KEY    = 'ars_studio_cfg';

function getEmailJsCfg() {
  try {
    var s = JSON.parse(localStorage.getItem(EMAILJS_CFG_KEY) || '{}');
    return {
      publicKey:  s.publicKey  || EMAILJS_PUBLIC_KEY,
      serviceId:  s.serviceId  || EMAILJS_SERVICE_ID,
      templateId: s.templateId || EMAILJS_TEMPLATE_ID,
    };
  } catch(e) { return { publicKey: EMAILJS_PUBLIC_KEY, serviceId: EMAILJS_SERVICE_ID, templateId: EMAILJS_TEMPLATE_ID }; }
}
function getStudioCfg() {
  try {
    var s = JSON.parse(localStorage.getItem(STUDIO_CFG_KEY) || '{}');
    return { email: s.email || 'modformarchitects@gmail.com', phone: s.phone || '919452861841' };
  } catch(e) { return { email: 'modformarchitects@gmail.com', phone: '919452861841' }; }
}

/* ═══════════════════════════════════════════════════════════
   TOAST NOTIFICATIONS
   ═══════════════════════════════════════════════════════════ */
function showToast(msg, type) {
  var container = document.getElementById('toastContainer');
  if (!container) return;
  var toast = document.createElement('div');
  toast.className = 'toast toast-' + (type || 'info');
  toast.textContent = msg;
  container.appendChild(toast);
  requestAnimationFrame(function() {
    requestAnimationFrame(function() { toast.classList.add('show'); });
  });
  setTimeout(function() {
    toast.classList.remove('show');
    setTimeout(function() { if (toast.parentNode) toast.parentNode.removeChild(toast); }, 320);
  }, 3200);
}

/* ═══════════════════════════════════════════════════════════
   CONFIRM MODAL — replaces window.confirm()
   ═══════════════════════════════════════════════════════════ */
function showConfirm(msg, onConfirm) {
  var modal   = document.getElementById('confirmModal');
  var msgEl   = document.getElementById('confirmMsg');
  var okBtn   = document.getElementById('confirmOk');
  var cancelBtn = document.getElementById('confirmCancel');
  if (!modal) { if (window.confirm(msg)) onConfirm(); return; }

  if (msgEl) msgEl.textContent = msg;
  modal.removeAttribute('hidden');

  function cleanup() {
    modal.setAttribute('hidden', '');
    okBtn.removeEventListener('click', onOk);
    cancelBtn.removeEventListener('click', onCancel);
  }
  function onOk()     { cleanup(); onConfirm(); }
  function onCancel() { cleanup(); }
  okBtn.addEventListener('click', onOk);
  cancelBtn.addEventListener('click', onCancel);
}

/* ═══════════════════════════════════════════════════════════
   HELPERS
   ═══════════════════════════════════════════════════════════ */
function $(id) { return document.getElementById(id); }

function esc(str) {
  return String(str || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function getLeads() {
  try { return JSON.parse(localStorage.getItem(LEADS_KEY) || '[]'); } catch(e) { return []; }
}
function saveLeads(arr) {
  try { localStorage.setItem(LEADS_KEY, JSON.stringify(arr)); } catch(e) {}
}
function getVisitors() {
  try { return JSON.parse(localStorage.getItem(VISITORS_KEY) || '[]'); } catch(e) { return []; }
}
function saveVisitors(arr) {
  try { localStorage.setItem(VISITORS_KEY, JSON.stringify(arr)); } catch(e) {}
}

function sortNewestFirst(arr) {
  return arr.slice().sort(function(a, b) {
    return new Date(b.ts || 0).getTime() - new Date(a.ts || 0).getTime();
  });
}

function mergeRecords(localRows, remoteRows, limit) {
  var map = {};
  (remoteRows || []).forEach(function(row) {
    if (row && row.id) map[String(row.id)] = row;
  });
  (localRows || []).forEach(function(row) {
    if (!row || !row.id) return;
    var key = String(row.id);
    map[key] = Object.assign({}, map[key] || {}, row);
  });
  return sortNewestFirst(Object.keys(map).map(function(key) { return map[key]; })).slice(0, limit || 500);
}

function refreshActivePanel() {
  renderOverview();
  var active = document.querySelector('.sb-link.active');
  var panelId = active ? active.dataset.panel : 'overview';
  if (panelId === 'leads') renderLeadsPanel($('leadsFilter') ? $('leadsFilter').value : 'all');
  if (panelId === 'visitors') renderVisitorsPanel();
  if (panelId === 'marketing') renderMarketing();
}

function syncDatabaseData(silent) {
  if (!window.ModformDB || !window.ModformDB.enabled) return Promise.resolve(false);
  return Promise.all([
    window.ModformDB.fetchLeads(500),
    window.ModformDB.fetchVisitors(500),
  ]).then(function(results) {
    var remoteLeads = results[0] || [];
    var remoteVisitors = results[1] || [];
    var changed = remoteLeads.length || remoteVisitors.length;

    if (remoteLeads.length) saveLeads(mergeRecords(getLeads(), remoteLeads, 500));
    if (remoteVisitors.length) saveVisitors(mergeRecords(getVisitors(), remoteVisitors, 500));

    if (changed && !silent) showToast('Database data synced.', 'success');
    return Boolean(changed);
  }).catch(function(err) {
    if (!silent) showToast('Database sync failed. Local data is still available.', 'error');
    if (window.console && console.warn) console.warn('[ModformDB] sync failed:', err);
    return false;
  });
}

function isToday(ts) {
  var d = new Date(ts), t = new Date();
  return d.getFullYear() === t.getFullYear() && d.getMonth() === t.getMonth() && d.getDate() === t.getDate();
}
function isThisWeek(ts) {
  return new Date(ts) >= new Date(Date.now() - 7 * 864e5);
}
function fmtDate(ts) {
  var d = new Date(ts);
  return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
       + ' ' + d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
}
function shortenUA(ua) {
  if (!ua) return 'Unknown';
  if (/iPhone|iPad/.test(ua)) return 'iOS Safari';
  if (/Android/.test(ua) && /Chrome/.test(ua)) return 'Android Chrome';
  if (/Firefox/.test(ua)) return 'Firefox';
  if (/Chrome/.test(ua)) return 'Chrome';
  if (/Safari/.test(ua)) return 'Safari';
  return 'Other';
}
function visitorLocation(v) {
  var parts = [];
  if (v.city) parts.push(v.city);
  if (v.region && v.region !== v.city) parts.push(v.region);
  if (!parts.length && v.country) parts.push(v.country);
  return parts.join(', ') || 'Unknown';
}
function statusBadge(s) {
  return '<span class="status-badge ' + esc(s || 'new') + '">' + esc(s || 'new') + '</span>';
}
function sourceLabel(s) {
  var labels = {
    website_form: 'Website Form',
    client_login: 'Client Login',
    chatbot: 'Chatbot',
    whatsapp: 'WhatsApp',
    phone: 'Phone',
    email: 'Email',
  };
  return labels[s] || s || 'Form';
}
function countBy(arr, key) {
  var map = {};
  arr.forEach(function(item) {
    var v = item[key] || 'Other';
    map[v] = (map[v] || 0) + 1;
  });
  return map;
}

/* ═══════════════════════════════════════════════════════════
   AUTH — backed by Supabase Auth (see database.js)
   ═══════════════════════════════════════════════════════════ */
function isLoggedIn() {
  return Boolean(window.ModformDB && window.ModformDB.isAuthenticated && window.ModformDB.isAuthenticated());
}
function clearAuth() {
  if (window.ModformDB && window.ModformDB.signOutAdmin) {
    window.ModformDB.signOutAdmin();
  }
}

function showDashboard() {
  var ls = $('loginScreen');
  var db = $('dashboard');
  if (ls) ls.style.display = 'none';
  if (db) { db.style.display = 'flex'; db.removeAttribute('hidden'); }
  renderOverview();
  syncDatabaseData(true).then(function(synced) {
    if (synced) refreshActivePanel();
  });
}

function showLogin() {
  var ls = $('loginScreen');
  var db = $('dashboard');
  if (ls) ls.style.display = '';
  if (db) { db.style.display = 'none'; db.setAttribute('hidden', ''); }
}

document.addEventListener('DOMContentLoaded', function() {

  /* ── Theme ── */
  var savedTheme = 'dark';
  try { savedTheme = localStorage.getItem('modform-theme') || 'dark'; } catch(e) {}
  document.documentElement.setAttribute('data-theme', savedTheme);

  var themeBtn = $('themeToggleDash');
  if (themeBtn) {
    themeBtn.addEventListener('click', function() {
      var cur = document.documentElement.getAttribute('data-theme');
      var next = cur === 'dark' ? 'light' : 'dark';
      document.documentElement.setAttribute('data-theme', next);
      try { localStorage.setItem('modform-theme', next); } catch(e) {}
    });
  }

  /* ── Login ── */
  var loginForm = $('loginForm');
  if (loginForm) {
    loginForm.addEventListener('submit', function(e) {
      e.preventDefault();
      var userEl  = $('lfUser');
      var passEl  = $('lfPass');
      var errEl   = $('loginError');
      var btnEl   = loginForm.querySelector('.login-btn');
      var email   = userEl ? userEl.value.trim() : '';
      var pass    = passEl ? passEl.value : '';

      /* ── Lockout check ── */
      var lockout = getLockout();
      if (lockout.until && Date.now() < lockout.until) {
        var secs = Math.ceil((lockout.until - Date.now()) / 1000);
        if (errEl) errEl.textContent = 'Too many attempts. Try again in ' + secs + 's.';
        return;
      }

      if (!email || !pass) {
        if (errEl) errEl.textContent = 'Enter your email and password.';
        return;
      }
      if (!window.ModformDB || !window.ModformDB.signInAdmin) {
        if (errEl) errEl.textContent = 'Auth service unavailable. Check your connection.';
        return;
      }

      if (btnEl) { btnEl.disabled = true; btnEl.textContent = 'Verifying…'; }

      window.ModformDB.signInAdmin(email, pass).then(function() {
        clearLockout();
        if (errEl) errEl.textContent = '';
        showDashboard();
      }).catch(function(err) {
        recordFailedAttempt(errEl);
        if (errEl && err && err.message && !errEl.textContent.indexOf('Too many')) {
          /* keep lockout message if present, otherwise show server error */
        }
        if (passEl) { passEl.value = ''; passEl.focus(); }
      }).finally(function() {
        if (btnEl) { btnEl.disabled = false; btnEl.textContent = 'Sign In'; }
      });
    });
  }

  /* ── Logout ── */
  var logoutBtn = $('logoutBtn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', function() {
      clearAuth();
      showLogin();
    });
  }

  /* ── Init view ── */
  if (isLoggedIn()) { showDashboard(); } else { showLogin(); }

  /* ── Sidebar toggle (mobile) ── */
  var sidebar  = $('sidebar');
  var sbToggle = $('sbToggle');
  if (sbToggle && sidebar) {
    sbToggle.addEventListener('click', function() {
      sidebar.classList.toggle('open');
    });
    document.addEventListener('click', function(e) {
      if (sidebar.classList.contains('open') &&
          !sidebar.contains(e.target) &&
          !sbToggle.contains(e.target)) {
        sidebar.classList.remove('open');
      }
    });
  }

  /* ── Sidebar nav ── */
  document.querySelectorAll('.sb-link').forEach(function(btn) {
    btn.addEventListener('click', function() { switchPanel(btn.dataset.panel); });
  });
  document.querySelectorAll('.view-all-btn').forEach(function(btn) {
    btn.addEventListener('click', function() { switchPanel(btn.dataset.panel); });
  });

  /* ── Leads filter ── */
  var leadsFilter = $('leadsFilter');
  if (leadsFilter) {
    leadsFilter.addEventListener('change', function() { renderLeadsPanel(leadsFilter.value); });
  }

  /* ── Lead search ── */
  var leadsSearch = $('leadsSearch');
  if (leadsSearch) {
    leadsSearch.addEventListener('input', function() {
      var q = this.value.toLowerCase().trim();
      var rows = document.querySelectorAll('#allLeadsTbody tr');
      rows.forEach(function(row) {
        row.style.display = (q && row.textContent.toLowerCase().indexOf(q) === -1) ? 'none' : '';
      });
    });
  }

  /* ── Clear leads ── */
  var clearLeadsBtn = $('clearLeadsBtn');
  if (clearLeadsBtn) {
    clearLeadsBtn.addEventListener('click', function() {
      showConfirm('Delete all leads? This cannot be undone.', function() {
        saveLeads([]);
        renderLeadsPanel();
        renderOverview();
        showToast('All leads cleared.', 'success');
      });
    });
  }

  /* ── Export leads ── */
  var exportLeadsBtn = $('exportLeadsBtn');
  if (exportLeadsBtn) {
    exportLeadsBtn.addEventListener('click', exportCSV);
  }
  var qaExportBtn = $('qaExportBtn');
  if (qaExportBtn) {
    qaExportBtn.addEventListener('click', exportCSV);
  }

  /* ── Seed demo data ── */
  var seedBtn = $('seedBtn');
  if (seedBtn) {
    seedBtn.addEventListener('click', function() {
      saveLeads(DEMO_LEADS);
      var sw = $('seedWrap');
      if (sw) sw.style.display = 'none';
      renderLeadsPanel();
      renderOverview();
      renderMarketing();
    });
  }

  /* ── Clear visitors ── */
  var clearVisBtn = $('clearVisitorsBtn');
  if (clearVisBtn) {
    clearVisBtn.addEventListener('click', function() {
      showConfirm('Clear all visitor history?', function() {
        try { localStorage.removeItem(VISITORS_KEY); } catch(e) {}
        renderVisitorsPanel();
        renderOverview();
        showToast('Visitor history cleared.', 'success');
      });
    });
  }

  /* ── Modal close ── */
  var modalClose = $('modalClose');
  var leadModal  = $('leadModal');
  if (modalClose && leadModal) {
    modalClose.addEventListener('click', function() { leadModal.hidden = true; });
    leadModal.addEventListener('click', function(e) {
      if (e.target === leadModal) leadModal.hidden = true;
    });
  }
  document.addEventListener('keydown', function(e) {
    var m = $('leadModal');
    if (e.key === 'Escape' && m && !m.hidden) m.hidden = true;
  });

  /* ── Marketing tabs ── */
  document.querySelectorAll('.mkt-tab').forEach(function(tab) {
    tab.addEventListener('click', function() {
      document.querySelectorAll('.mkt-tab').forEach(function(t) { t.classList.remove('active'); });
      tab.classList.add('active');
      var channel = tab.dataset.channel;
      var subjectWrap = $('emailSubjectWrap');
      if (subjectWrap) subjectWrap.hidden = (channel !== 'email');
      var pw = $('mktPreviewWrap');
      if (pw) pw.hidden = true;
    });
  });

  /* ── Marketing preview ── */
  var mktPreviewBtn = $('mktPreviewBtn');
  if (mktPreviewBtn) {
    mktPreviewBtn.addEventListener('click', function() {
      var activeTab = document.querySelector('.mkt-tab.active');
      var channel   = activeTab ? activeTab.dataset.channel : 'email';
      var subject   = $('mktSubject') ? $('mktSubject').value : '';
      var msg       = $('mktMessage') ? $('mktMessage').value : '';
      var recipSel  = $('mktRecipients');
      var recip     = recipSel ? recipSel.value : 'all';
      var leads     = getLeads();
      var n = recip === 'all' ? leads.length : leads.filter(function(l) { return l.status === recip; }).length;

      var wrap = $('mktPreviewWrap');
      var prev = $('mktPreview');
      if (!wrap || !prev) return;
      var header = channel === 'email'
        ? 'To: ' + n + ' lead(s)\nSubject: ' + subject + '\n' + '─'.repeat(40) + '\n'
        : 'WhatsApp Broadcast to ' + n + ' contact(s):\n' + '─'.repeat(40) + '\n';
      prev.textContent = header + (msg || '(empty message)');
      wrap.hidden = false;
    });
  }

  /* ── Marketing send ── */
  var mktSendBtn = $('mktSendBtn');
  if (mktSendBtn) {
    mktSendBtn.addEventListener('click', function() {
      var msg = $('mktMessage') ? $('mktMessage').value.trim() : '';
      if (!msg) { showToast('Please write a message first.', 'error'); return; }
      var recipSel = $('mktRecipients');
      var recip    = recipSel ? recipSel.value : 'all';
      var leads    = getLeads();
      var n = recip === 'all' ? leads.length : leads.filter(function(l) { return l.status === recip; }).length;
      showToast('Demo: Message queued for ' + n + ' recipient(s). Connect SendGrid or Twilio to send live.', 'info');
    });
  }

  /* ── Ads: character counters ── */
  function bindCharCount(inputId, countId) {
    var el  = $(inputId);
    var cnt = $(countId);
    if (!el || !cnt) return;
    var max = el.getAttribute('maxlength') || '100';
    el.addEventListener('input', function() { cnt.textContent = el.value.length + '/' + max; });
  }
  bindCharCount('gHeadline', 'gHeadlineCount');
  bindCharCount('iCaption',  'iCaptionCount');

  /* ── Ads: launch buttons ── */
  document.querySelectorAll('.ads-launch-btn').forEach(function(btn) {
    btn.addEventListener('click', function() { launchAdCampaign(btn.dataset.platform); });
  });

  /* ── Ads: save draft buttons ── */
  document.querySelectorAll('.ads-save-btn').forEach(function(btn) {
    btn.addEventListener('click', function() { saveAdDraft(btn.dataset.platform); });
  });

  /* ── Ads: clear campaigns ── */
  var clearCampaignsBtn = $('clearCampaignsBtn');
  if (clearCampaignsBtn) {
    clearCampaignsBtn.addEventListener('click', function() {
      showConfirm('Delete all saved campaigns?', function() {
        try { localStorage.removeItem('ars_ad_campaigns'); } catch(e) {}
        renderCampaigns();
        showToast('Campaigns cleared.', 'success');
      });
    });
  }

  /* ── Settings panel ── */
  initSettingsPanel();

  /* ── Confirm modal close on overlay click ── */
  var confirmModal = $('confirmModal');
  if (confirmModal) {
    confirmModal.addEventListener('click', function(e) {
      if (e.target === confirmModal) {
        confirmModal.setAttribute('hidden', '');
      }
    });
  }

});

/* ═══════════════════════════════════════════════════════════
   PANEL SWITCHING
   ═══════════════════════════════════════════════════════════ */
function switchPanel(panelId) {
  document.querySelectorAll('.panel').forEach(function(p) { p.classList.remove('active'); });
  var target = $('panel-' + panelId);
  if (target) target.classList.add('active');

  document.querySelectorAll('.sb-link').forEach(function(l) {
    l.classList.toggle('active', l.dataset.panel === panelId);
  });

  var sidebar = $('sidebar');
  if (window.innerWidth <= 768 && sidebar) sidebar.classList.remove('open');

  if (panelId === 'leads')     renderLeadsPanel();
  if (panelId === 'visitors')  renderVisitorsPanel();
  if (panelId === 'marketing') renderMarketing();
  if (panelId === 'settings')  renderSettingsPanel();
}

/* ═══════════════════════════════════════════════════════════
   OVERVIEW
   ═══════════════════════════════════════════════════════════ */
function renderOverview() {
  var leads    = getLeads();
  var visitors = getVisitors();
  var todayL   = leads.filter(function(l) { return isToday(l.ts); });
  var contacted = leads.filter(function(l) { return l.status === 'contacted' || l.status === 'qualified'; });

  var sTotal = $('sTotal'); if (sTotal) sTotal.textContent = leads.length;
  var sToday = $('sToday'); if (sToday) sToday.textContent = todayL.length;
  var sCont  = $('sContacted'); if (sCont) sCont.textContent = contacted.length;
  var sVis   = $('sVisitors'); if (sVis) sVis.textContent = visitors.length;

  /* Trend badges — this week vs last week */
  var now = Date.now();
  var thisWeekLeads = leads.filter(function(l) { return now - new Date(l.ts).getTime() < 7 * 864e5; }).length;
  var lastWeekLeads = leads.filter(function(l) { var a = now - new Date(l.ts).getTime(); return a >= 7*864e5 && a < 14*864e5; }).length;
  var delta = thisWeekLeads - lastWeekLeads;
  var trendEl = $('leadsTrend');
  if (trendEl) {
    if (delta > 0)      { trendEl.textContent = '↑ ' + delta + ' vs last week'; trendEl.className = 'stat-trend up'; }
    else if (delta < 0) { trendEl.textContent = '↓ ' + Math.abs(delta) + ' vs last week'; trendEl.className = 'stat-trend down'; }
    else                { trendEl.textContent = 'Same as last week'; trendEl.className = 'stat-trend'; }
  }

  var dateEl = $('overviewDate');
  if (dateEl) dateEl.textContent = new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });

  var tbody  = $('recentLeadsTbody');
  var emptyEl = $('recentEmpty');
  if (!tbody) return;

  var recent = leads.slice(0, 5);
  if (!recent.length) {
    tbody.innerHTML = '';
    if (emptyEl) emptyEl.hidden = false;
    return;
  }
  if (emptyEl) emptyEl.hidden = true;
  tbody.innerHTML = recent.map(function(l) {
    return '<tr>'
      + '<td>' + esc(l.name) + '</td>'
      + '<td>' + esc(l.email) + '</td>'
      + '<td>' + esc(l.project) + '</td>'
      + '<td>' + esc(sourceLabel(l.source)) + '</td>'
      + '<td>' + fmtDate(l.ts) + '</td>'
      + '<td>' + statusBadge(l.status) + '</td>'
      + '</tr>';
  }).join('');

  renderBars('sourceBars',  countBy(leads, 'source'),  ['website_form','client_login','chatbot','email','whatsapp','phone']);
  renderBars('serviceBars', countBy(leads, 'project'), null);
  renderWeeklyChart(leads);
  renderRemindersWidget();
}

function renderWeeklyChart(leads) {
  var el = $('weeklyChart');
  if (!el) return;
  var now = new Date();
  var days = [];
  for (var i = 6; i >= 0; i--) {
    var d = new Date(now);
    d.setDate(d.getDate() - i);
    var ds = d.toISOString().split('T')[0];
    var dn = ['Su','Mo','Tu','We','Th','Fr','Sa'][d.getDay()];
    var count = leads.filter(function(l) { return l.ts && l.ts.indexOf(ds) === 0; }).length;
    days.push({ label: dn, count: count, isToday: i === 0 });
  }
  var max = Math.max.apply(null, days.map(function(d) { return d.count; })) || 1;
  el.innerHTML = days.map(function(d) {
    var h = d.count > 0 ? Math.max(8, Math.round((d.count / max) * 100)) : 3;
    return '<div class="wc-col' + (d.isToday ? ' today' : '') + '">'
      + '<div class="wc-bar-wrap">'
      + '<div class="wc-bar' + (d.count === 0 ? ' empty' : '') + '" style="height:' + h + '%">'
      + (d.count > 0 ? '<span class="wc-num">' + d.count + '</span>' : '')
      + '</div></div>'
      + '<span class="wc-day">' + d.label + '</span>'
      + '</div>';
  }).join('');
}

var BAR_COLORS = ['accent', 'accent2', 'green', 'blue', 'accent', 'accent2'];

function renderBars(containerId, countMap, order) {
  var el = $(containerId);
  if (!el) return;
  var total = 0;
  Object.keys(countMap).forEach(function(k) { total += countMap[k]; });
  total = total || 1;

  var keys = order
    ? order.filter(function(k) { return countMap[k]; })
    : Object.keys(countMap).sort(function(a,b){ return countMap[b]-countMap[a]; }).slice(0, 6);

  if (!keys.length) {
    el.innerHTML = '<p style="font-size:.75rem;color:var(--muted)">No data yet.</p>';
    return;
  }

  el.innerHTML = keys.map(function(k, i) {
    var n   = countMap[k] || 0;
    var pct = Math.round((n / total) * 100);
    return '<div class="src-row">'
      + '<div class="src-label"><span>' + esc(sourceLabel(k)) + '</span><span>' + n + '</span></div>'
      + '<div class="src-bar-wrap"><div class="src-bar ' + BAR_COLORS[i % BAR_COLORS.length] + '" style="width:' + pct + '%"></div></div>'
      + '</div>';
  }).join('');
}

/* ═══════════════════════════════════════════════════════════
   LEADS PANEL
   ═══════════════════════════════════════════════════════════ */
function renderLeadsPanel(filter) {
  filter = filter || 'all';
  var leads   = getLeads();
  var tbody   = $('allLeadsTbody');
  var emptyEl = $('allLeadsEmpty');
  var seedWrap = $('seedWrap');

  if (seedWrap) seedWrap.style.display = leads.length ? 'none' : '';

  var filtered = filter === 'all' ? leads : leads.filter(function(l) { return l.status === filter; });

  if (!tbody) return;
  if (!filtered.length) {
    tbody.innerHTML = '';
    if (emptyEl) emptyEl.hidden = false;
    return;
  }
  if (emptyEl) emptyEl.hidden = true;

  tbody.innerHTML = filtered.map(function(l) {
    var msgShort = (l.message || '').slice(0, 50) + ((l.message || '').length > 50 ? '…' : '');
    return '<tr>'
      + '<td>' + esc(l.name) + '</td>'
      + '<td><a href="mailto:' + esc(l.email) + '" style="color:var(--accent)">' + esc(l.email) + '</a></td>'
      + '<td><a href="tel:' + esc(l.phone) + '" style="color:var(--muted)">' + esc(l.phone) + '</a></td>'
      + '<td>' + esc(l.project) + '</td>'
      + '<td class="tbl-msg" title="' + esc(l.message) + '">' + esc(msgShort) + '</td>'
      + '<td>' + esc(sourceLabel(l.source)) + '</td>'
      + '<td>' + fmtDate(l.ts) + '</td>'
      + '<td>' + statusBadge(l.status) + '</td>'
      + '<td><div class="tbl-actions">'
      + '<button class="tbl-btn" onclick="openLeadModal(' + l.id + ')">View</button>'
      + '<button class="tbl-btn" onclick="cycleStatus(' + l.id + ')">Status</button>'
      + (l.phone ? '<a class="tbl-btn wa-btn" href="https://wa.me/' + l.phone.replace(/\D/g,'') + '" target="_blank" rel="noopener">WA</a>' : '')
      + (l.email ? '<a class="tbl-btn em-btn" href="mailto:' + esc(l.email) + '">Email</a>' : '')
      + '<button class="tbl-btn danger" onclick="deleteLead(' + l.id + ')">Del</button>'
      + '</div></td>'
      + '</tr>';
  }).join('');
}

function cycleStatus(id) {
  var CYCLE = ['new', 'contacted', 'qualified', 'closed'];
  var leads = getLeads();
  for (var i = 0; i < leads.length; i++) {
    if (leads[i].id === id) {
      var idx = CYCLE.indexOf(leads[i].status || 'new');
      leads[i].status = CYCLE[(idx + 1) % CYCLE.length];
      if (window.ModformDB && window.ModformDB.enabled) {
        window.ModformDB.updateLeadStatus(id, leads[i].status);
      }
      break;
    }
  }
  saveLeads(leads);
  var lf = $('leadsFilter');
  renderLeadsPanel(lf ? lf.value : 'all');
  renderOverview();
}

function deleteLead(id) {
  showConfirm('Delete this lead?', function() {
    saveLeads(getLeads().filter(function(l) { return l.id !== id; }));
    if (window.ModformDB && window.ModformDB.enabled) window.ModformDB.deleteLead(id);
    var lf = $('leadsFilter');
    renderLeadsPanel(lf ? lf.value : 'all');
    renderOverview();
    showToast('Lead deleted.', 'success');
  });
}

/* ═══════════════════════════════════════════════════════════
   LEAD MODAL
   ═══════════════════════════════════════════════════════════ */
function openLeadModal(id) {
  var leads = getLeads();
  var lead  = null;
  for (var i = 0; i < leads.length; i++) { if (leads[i].id === id) { lead = leads[i]; break; } }
  if (!lead) return;

  var leadModal = $('leadModal');
  var modalBody = $('modalBody');
  if (!leadModal || !modalBody) return;

  var wa = lead.phone ? 'https://wa.me/' + lead.phone.replace(/\D/g, '') : null;

  modalBody.innerHTML = '<h2 class="modal-title">' + esc(lead.name || 'Unknown') + '</h2>'
    + '<p class="modal-label">Status</p><p class="modal-val">' + statusBadge(lead.status) + '</p>'
    + '<p class="modal-label">Email</p><p class="modal-val">'
      + (lead.email ? '<a href="mailto:' + esc(lead.email) + '" style="color:var(--accent)">' + esc(lead.email) + '</a>' : '—') + '</p>'
    + '<p class="modal-label">Phone / WhatsApp</p><p class="modal-val">'
      + (lead.phone ? '<a href="tel:' + esc(lead.phone) + '" style="color:var(--muted)">' + esc(lead.phone) + '</a>' : '—') + '</p>'
    + '<p class="modal-label">Service Requested</p><p class="modal-val">' + esc(lead.project || '—') + '</p>'
    + '<p class="modal-label">Source</p><p class="modal-val">' + esc(sourceLabel(lead.source)) + '</p>'
    + '<p class="modal-label">Submitted</p><p class="modal-val">' + fmtDate(lead.ts) + '</p>'
    + '<p class="modal-label">Message</p><div class="modal-msg">' + esc(lead.message || '—') + '</div>'
    + '<div class="modal-actions">'
      + (lead.email ? '<a href="mailto:' + esc(lead.email) + '" class="action-btn">Reply via Email</a>' : '')
      + (wa ? '<a href="' + wa + '" target="_blank" rel="noopener" class="action-btn" style="background:var(--green);color:#0d0d0b">WhatsApp</a>' : '')
      + '<button class="action-btn outline" onclick="cycleStatus(' + id + ');$(&quot;leadModal&quot;).hidden=true;">Advance Status</button>'
    + '</div>';

  leadModal.hidden = false;
}

/* ═══════════════════════════════════════════════════════════
   VISITORS PANEL
   ═══════════════════════════════════════════════════════════ */
function renderVisitorsPanel() {
  var visitors = getVisitors();
  var todayV   = visitors.filter(function(v) { return isToday(v.ts); });
  var weekV    = visitors.filter(function(v) { return isThisWeek(v.ts); });
  var directV  = visitors.filter(function(v) { return !v.ref || v.ref === 'direct'; });

  var vt = $('vTotal');  if (vt) vt.textContent = visitors.length;
  var vd = $('vToday');  if (vd) vd.textContent = todayV.length;
  var vw = $('vWeek');   if (vw) vw.textContent = weekV.length;
  var vr = $('vDirect'); if (vr) vr.textContent = directV.length;

  var tbody   = $('visitorsTbody');
  var emptyEl = $('visitorsEmpty');
  if (!tbody) return;

  var recent = sortNewestFirst(visitors).slice(0, 50);
  if (!recent.length) {
    tbody.innerHTML = '';
    if (emptyEl) emptyEl.hidden = false;
    return;
  }
  if (emptyEl) emptyEl.hidden = true;

  tbody.innerHTML = recent.map(function(v, i) {
    return '<tr>'
      + '<td style="color:var(--muted)">' + (i + 1) + '</td>'
      + '<td>' + fmtDate(v.ts) + '</td>'
      + '<td style="font-size:.75rem;color:var(--muted)">' + esc(visitorLocation(v)) + '</td>'
      + '<td style="font-size:.75rem;color:var(--muted)">' + esc(v.page || '/') + '</td>'
      + '<td style="font-size:.75rem;color:var(--muted)">' + esc((v.ref || 'direct').replace(/^https?:\/\//, '').slice(0, 30)) + '</td>'
      + '<td style="font-size:.75rem;color:var(--muted)">' + shortenUA(v.ua) + '</td>'
      + '</tr>';
  }).join('');
}

/* ═══════════════════════════════════════════════════════════
   MARKETING
   ═══════════════════════════════════════════════════════════ */
function renderMarketing() {
  var leads = getLeads();
  var counts = {
    'All Leads': leads.length,
    'New':       leads.filter(function(l) { return l.status === 'new'; }).length,
    'Contacted': leads.filter(function(l) { return l.status === 'contacted'; }).length,
    'Qualified': leads.filter(function(l) { return l.status === 'qualified'; }).length,
    'Closed':    leads.filter(function(l) { return l.status === 'closed'; }).length,
  };
  var maxVal = counts['All Leads'] || 1;
  var colors = ['accent', 'blue', 'accent2', 'green', 'accent'];
  var el     = $('funnelChart');
  if (!el) return;

  el.innerHTML = Object.keys(counts).map(function(label, i) {
    var n   = counts[label];
    var pct = Math.max(n > 0 ? 4 : 0, Math.round((n / maxVal) * 100));
    return '<div class="funnel-row">'
      + '<div class="funnel-label"><span>' + label + '</span><span>' + n + '</span></div>'
      + '<div class="funnel-bar-wrap">'
      + '<div class="funnel-bar ' + colors[i] + '" style="width:' + pct + '%">'
      + (n > 0 ? '<span>' + Math.round((n/maxVal)*100) + '%</span>' : '')
      + '</div></div></div>';
  }).join('');
}

/* ═══════════════════════════════════════════════════════════
   CSV EXPORT
   ═══════════════════════════════════════════════════════════ */
function exportCSV() {
  var leads = getLeads();
  if (!leads.length) { alert('No leads to export.'); return; }

  var headers = ['ID','Date','Name','Email','Phone','Service','Source','Status','Message'];
  var rows = leads.map(function(l) {
    return [l.id, fmtDate(l.ts), l.name||'', l.email||'', l.phone||'',
            l.project||'', l.source||'', l.status||'',
            (l.message||'').replace(/"/g,'""')]
      .map(function(v) { return '"' + v + '"'; }).join(',');
  });

  var csv  = [headers.join(',')].concat(rows).join('\n');
  var blob = new Blob([csv], { type: 'text/csv' });
  var url  = URL.createObjectURL(blob);
  var a    = document.createElement('a');
  a.href     = url;
  a.download = 'modform-leads-' + new Date().toISOString().slice(0,10) + '.csv';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/* ═══════════════════════════════════════════════════════════
   PAID ADS
   ═══════════════════════════════════════════════════════════ */
var CAMPAIGNS_KEY = 'ars_ad_campaigns';

function getCampaigns() {
  try { return JSON.parse(localStorage.getItem(CAMPAIGNS_KEY) || '[]'); } catch(e) { return []; }
}
function saveCampaignsData(arr) {
  try { localStorage.setItem(CAMPAIGNS_KEY, JSON.stringify(arr)); } catch(e) {}
}

function getAdFields(platform) {
  if (platform === 'google') {
    return {
      goal:     $('gGoal')     ? $('gGoal').value     : '',
      type:     $('gType')     ? $('gType').value     : '',
      budget:   $('gBudget')   ? $('gBudget').value   : '',
      location: $('gLocation') ? $('gLocation').value : '',
      keywords: $('gKeywords') ? $('gKeywords').value : '',
      headline: $('gHeadline') ? $('gHeadline').value : '',
    };
  }
  if (platform === 'meta') {
    return {
      goal:      $('mGoal')      ? $('mGoal').value      : '',
      placement: $('mPlacement') ? $('mPlacement').value : '',
      budget:    $('mBudget')    ? $('mBudget').value    : '',
      age:       $('mAge')       ? $('mAge').value       : '',
      interests: $('mInterests') ? $('mInterests').value : '',
      location:  $('mLocation')  ? $('mLocation').value  : '',
    };
  }
  if (platform === 'instagram') {
    return {
      format:   $('iFormat')   ? $('iFormat').value   : '',
      goal:     $('iGoal')     ? $('iGoal').value     : '',
      budget:   $('iBudget')   ? $('iBudget').value   : '',
      duration: $('iDuration') ? $('iDuration').value : '',
      caption:  $('iCaption')  ? $('iCaption').value  : '',
    };
  }
  return {};
}

function buildLaunchURL(platform, fields) {
  if (platform === 'google') {
    return 'https://ads.google.com/aw/campaigns/new?campaignType='
      + encodeURIComponent(fields.type || 'search')
      + '&goal=' + encodeURIComponent(fields.goal || 'leads');
  }
  if (platform === 'meta') {
    return 'https://business.facebook.com/adsmanager/creation?objective='
      + encodeURIComponent(fields.goal || 'LEAD_GENERATION');
  }
  if (platform === 'instagram') {
    return 'https://business.facebook.com/adsmanager/creation?objective='
      + encodeURIComponent(fields.goal === 'leads' ? 'LEAD_GENERATION' : 'LINK_CLICKS');
  }
  return '#';
}

function launchAdCampaign(platform) {
  var fields = getAdFields(platform);
  if (!fields.budget) {
    alert('Please enter a daily budget before launching.');
    return;
  }
  saveAdDraft(platform);
  var url = buildLaunchURL(platform, fields);
  window.open(url, '_blank', 'noopener');
}

function saveAdDraft(platform) {
  var fields  = getAdFields(platform);
  var camps   = getCampaigns();
  var draft   = { id: Date.now(), platform: platform, ts: new Date().toISOString() };
  Object.keys(fields).forEach(function(k) { draft[k] = fields[k]; });
  camps.unshift(draft);
  if (camps.length > 50) camps = camps.slice(0, 50);
  saveCampaignsData(camps);
  renderCampaigns();

  var btn = document.querySelector('.ads-save-btn[data-platform="' + platform + '"]');
  if (btn) {
    var orig = btn.textContent;
    btn.textContent = 'Saved ✓';
    btn.style.color = 'var(--green)';
    btn.style.borderColor = 'var(--green)';
    setTimeout(function() {
      btn.textContent = orig;
      btn.style.color = '';
      btn.style.borderColor = '';
    }, 2000);
  }
}

function renderCampaigns() {
  var camps   = getCampaigns();
  var section = $('campaignsSection');
  var tbody   = $('campaignsTbody');
  if (!section || !tbody) return;

  section.style.display = camps.length ? '' : 'none';
  if (!camps.length) return;

  var PLATFORM_LABELS = { google: 'Google Ads', meta: 'Meta Ads', instagram: 'Instagram' };
  tbody.innerHTML = camps.map(function(c) {
    var label = PLATFORM_LABELS[c.platform] || c.platform;
    var goal  = c.goal || '—';
    var budget= c.budget ? '₹' + c.budget + '/day' : '—';
    var loc   = c.location || c.interests || '—';
    return '<tr>'
      + '<td><strong>' + esc(label) + '</strong></td>'
      + '<td>' + esc(goal) + '</td>'
      + '<td>' + esc(budget) + '</td>'
      + '<td style="max-width:120px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">' + esc(loc) + '</td>'
      + '<td>' + fmtDate(c.ts) + '</td>'
      + '<td><button class="tbl-btn" onclick="relaunchCampaign(' + c.id + ')">Re-launch</button></td>'
      + '</tr>';
  }).join('');
}

function relaunchCampaign(id) {
  var camps = getCampaigns();
  var c = null;
  for (var i = 0; i < camps.length; i++) { if (camps[i].id === id) { c = camps[i]; break; } }
  if (!c) return;
  var url = buildLaunchURL(c.platform, c);
  window.open(url, '_blank', 'noopener');
}

/* Expose to renderMarketing */
var _origRenderMarketing = renderMarketing;
renderMarketing = function() {
  _origRenderMarketing();
  renderCampaigns();
};

/* ═══════════════════════════════════════════════════════════
   LEAD MODAL — with notes field
   ═══════════════════════════════════════════════════════════ */
var _origOpenLeadModal = openLeadModal;
openLeadModal = function(id) {
  _origOpenLeadModal(id);
  var modalBody = $('modalBody');
  if (!modalBody) return;

  /* ── Notes section ── */
  var noteKey = 'ars_note_' + id;
  var savedNote = '';
  try { savedNote = localStorage.getItem(noteKey) || ''; } catch(e) {}

  var noteWrap = document.createElement('div');
  noteWrap.className = 'modal-notes';
  noteWrap.innerHTML = '<p class="modal-label" style="margin-top:1.5rem">Private Notes</p>'
    + '<textarea class="notes-ta" id="leadNoteTA" rows="3" placeholder="Add internal notes about this lead…">' + esc(savedNote) + '</textarea>'
    + '<button class="action-btn outline" id="saveNoteBtn" style="margin-top:.6rem;font-size:.78rem">Save Note</button>'
    + '<span class="note-saved-msg" id="noteSavedMsg" style="font-size:.75rem;color:var(--green);margin-left:.75rem;opacity:0;transition:opacity .3s"></span>';
  modalBody.appendChild(noteWrap);

  var saveNoteBtn = $('saveNoteBtn');
  if (saveNoteBtn) {
    saveNoteBtn.addEventListener('click', function() {
      var val = ($('leadNoteTA') || {}).value || '';
      try { localStorage.setItem(noteKey, val); } catch(e) {}
      var msg = $('noteSavedMsg');
      if (msg) { msg.textContent = '✓ Saved'; msg.style.opacity = '1'; setTimeout(function() { msg.style.opacity = '0'; }, 2000); }
    });
  }

  /* ── Follow-up Reminder section ── */
  var leads = JSON.parse(localStorage.getItem('ars_leads') || '[]');
  var lead  = leads.find(function(l) { return l.id == id; }) || {};
  var reminders = [];
  try { reminders = JSON.parse(localStorage.getItem('ars_reminders') || '[]'); } catch(e) {}
  var existing = reminders.find(function(r) { return r.leadId == id; }) || {};

  var reminderWrap = document.createElement('div');
  reminderWrap.className = 'modal-reminder';
  reminderWrap.innerHTML = '<p class="modal-label" style="margin-top:1.5rem">Follow-up Reminder</p>'
    + '<div class="reminder-row">'
    + '<div class="reminder-field"><label>Callback Date & Time</label>'
    + '<input type="datetime-local" id="reminderDate" value="' + esc(existing.date || '') + '" /></div>'
    + '<div class="reminder-field"><label>Reminder Note</label>'
    + '<input type="text" id="reminderNote" placeholder="e.g. Discuss Vastu plan…" value="' + esc(existing.note || '') + '" /></div>'
    + '</div>'
    + '<div style="display:flex;gap:.6rem;margin-top:.75rem;align-items:center">'
    + '<button class="action-btn outline" id="saveReminderBtn" style="font-size:.78rem">Set Reminder</button>'
    + (existing.date ? '<button class="action-btn" id="clearReminderBtn" style="font-size:.78rem;background:var(--r-dim);color:var(--red);border-color:var(--red)">Clear</button>' : '')
    + '<span id="reminderMsg" style="font-size:.75rem;color:var(--green);opacity:0;transition:opacity .3s"></span>'
    + '</div>';
  modalBody.appendChild(reminderWrap);

  var saveReminderBtn = $('saveReminderBtn');
  if (saveReminderBtn) {
    saveReminderBtn.addEventListener('click', function() {
      var dateVal = ($('reminderDate') || {}).value || '';
      var noteVal = ($('reminderNote') || {}).value || '';
      if (!dateVal) { showToast('Please pick a date & time', 'error'); return; }
      var updated = reminders.filter(function(r) { return r.leadId != id; });
      updated.push({ leadId: id, leadName: lead.name || 'Lead', date: dateVal, note: noteVal });
      try { localStorage.setItem('ars_reminders', JSON.stringify(updated)); } catch(e) {}
      var msg = $('reminderMsg');
      if (msg) { msg.textContent = '✓ Reminder set'; msg.style.opacity = '1'; setTimeout(function() { msg.style.opacity = '0'; }, 2200); }
      showToast('Follow-up reminder set for ' + (lead.name || 'this lead'), 'success');
    });
  }

  var clearReminderBtn = $('clearReminderBtn');
  if (clearReminderBtn) {
    clearReminderBtn.addEventListener('click', function() {
      var updated = reminders.filter(function(r) { return r.leadId != id; });
      try { localStorage.setItem('ars_reminders', JSON.stringify(updated)); } catch(e) {}
      showToast('Reminder cleared', 'info');
      clearReminderBtn.remove();
      var di = $('reminderDate'); if (di) di.value = '';
      var ni = $('reminderNote'); if (ni) ni.value = '';
    });
  }
};

/* ── Render reminders widget in overview ── */
function renderRemindersWidget() {
  var wrap = $('remindersWidget');
  if (!wrap) return;
  var reminders = [];
  try { reminders = JSON.parse(localStorage.getItem('ars_reminders') || '[]'); } catch(e) {}

  var now = new Date();
  var upcoming = reminders
    .filter(function(r) { return r.date; })
    .sort(function(a, b) { return new Date(a.date) - new Date(b.date) });

  if (!upcoming.length) {
    wrap.innerHTML = '<p style="font-size:.82rem;color:var(--dim)">No reminders set.</p>';
    return;
  }

  wrap.innerHTML = upcoming.map(function(r) {
    var d     = new Date(r.date);
    var past  = d < now;
    var label = past ? 'overdue' : 'upcoming';
    var color = past ? 'var(--red)' : 'var(--accent)';
    var dateStr = d.toLocaleDateString('en-IN', { day:'numeric', month:'short', year:'numeric' })
                + ' ' + d.toLocaleTimeString('en-IN', { hour:'2-digit', minute:'2-digit' });
    return '<div class="reminder-item">'
      + '<div class="reminder-item-main">'
      + '<span class="reminder-badge" style="background:' + (past ? 'var(--r-dim)' : 'var(--a-dim)') + ';color:' + color + '">' + label + '</span>'
      + '<strong>' + esc(r.leadName) + '</strong>'
      + (r.note ? '<span class="reminder-item-note">' + esc(r.note) + '</span>' : '')
      + '</div>'
      + '<span class="reminder-item-date">' + dateStr + '</span>'
      + '</div>';
  }).join('');
}

/* ═══════════════════════════════════════════════════════════
   SETTINGS PANEL
   ═══════════════════════════════════════════════════════════ */
function renderSettingsPanel() {
  var cfg = getEmailJsCfg();
  var ejPk = $('ejPublicKey');
  var ejSi = $('ejServiceId');
  var ejTi = $('ejTemplateId');
  if (ejPk && cfg.publicKey)  ejPk.value = cfg.publicKey;
  if (ejSi && cfg.serviceId)  ejSi.value = cfg.serviceId;
  if (ejTi && cfg.templateId) ejTi.value = cfg.templateId;

  var studio = getStudioCfg();
  var stE = $('stEmail');
  var stP = $('stPhone');
  if (stE) stE.value = studio.email;
  if (stP) stP.value = studio.phone;
}

function initSettingsPanel() {
  /* Change password — updates the Supabase Auth user (server-side, bcrypt) */
  var changePassBtn = $('changePassBtn');
  if (changePassBtn) {
    changePassBtn.addEventListener('click', function() {
      var np = ($('newPass') || {}).value || '';
      var cp = ($('confirmPass') || {}).value || '';
      var fb = $('passFeedback');
      var hd = $('hashDisplay');

      if (!np) { if (fb) { fb.textContent = 'Enter a new password.'; fb.className = 'settings-feedback error'; } return; }
      if (np !== cp) { if (fb) { fb.textContent = 'Passwords do not match.'; fb.className = 'settings-feedback error'; } return; }
      if (np.length < 8) { if (fb) { fb.textContent = 'Password must be at least 8 characters.'; fb.className = 'settings-feedback error'; } return; }
      if (!window.ModformDB || !window.ModformDB.updatePassword) {
        if (fb) { fb.textContent = 'Auth service unavailable.'; fb.className = 'settings-feedback error'; }
        return;
      }

      changePassBtn.disabled = true;
      var oldLabel = changePassBtn.textContent;
      changePassBtn.textContent = 'Updating…';

      window.ModformDB.updatePassword(np).then(function() {
        if (fb) { fb.textContent = '✓ Password updated. It is active everywhere.'; fb.className = 'settings-feedback success'; }
        if (hd) hd.style.display = 'none';
        if ($('newPass')) $('newPass').value = '';
        if ($('confirmPass')) $('confirmPass').value = '';
        showToast('Password changed successfully.', 'success');
      }).catch(function(err) {
        var msg = (err && err.message) ? err.message : 'Could not update password.';
        if (fb) { fb.textContent = msg; fb.className = 'settings-feedback error'; }
        showToast('Password change failed.', 'error');
      }).finally(function() {
        changePassBtn.disabled = false;
        changePassBtn.textContent = oldLabel;
      });
    });
  }

  /* Save EmailJS config */
  var saveEmailJsBtn = $('saveEmailJsBtn');
  if (saveEmailJsBtn) {
    saveEmailJsBtn.addEventListener('click', function() {
      var cfg = {
        publicKey:  ($('ejPublicKey') || {}).value  || '',
        serviceId:  ($('ejServiceId') || {}).value  || '',
        templateId: ($('ejTemplateId') || {}).value || '',
      };
      try { localStorage.setItem(EMAILJS_CFG_KEY, JSON.stringify(cfg)); } catch(e) {}
      var fb = $('ejFeedback');
      if (fb) { fb.textContent = '✓ EmailJS keys saved.'; fb.className = 'settings-feedback success'; }
      showToast('EmailJS keys saved.', 'success');
    });
  }

  /* Save studio info */
  var saveStudioBtn = $('saveStudioBtn');
  if (saveStudioBtn) {
    saveStudioBtn.addEventListener('click', function() {
      var cfg = {
        email: ($('stEmail') || {}).value || '',
        phone: ($('stPhone') || {}).value || '',
      };
      try { localStorage.setItem(STUDIO_CFG_KEY, JSON.stringify(cfg)); } catch(e) {}
      var fb = $('stFeedback');
      if (fb) { fb.textContent = '✓ Studio info saved.'; fb.className = 'settings-feedback success'; }
      showToast('Studio info saved.', 'success');
    });
  }

  /* Danger zone */
  var dangerClearLeads = $('dangerClearLeads');
  if (dangerClearLeads) {
    dangerClearLeads.addEventListener('click', function() {
      showConfirm('Delete ALL leads permanently?', function() {
        saveLeads([]);
        renderOverview();
        showToast('All leads deleted.', 'success');
      });
    });
  }

  var dangerClearVisitors = $('dangerClearVisitors');
  if (dangerClearVisitors) {
    dangerClearVisitors.addEventListener('click', function() {
      showConfirm('Delete ALL visitor history permanently?', function() {
        try { localStorage.removeItem(VISITORS_KEY); } catch(e) {}
        renderOverview();
        showToast('Visitor history deleted.', 'success');
      });
    });
  }

  var dangerReset = $('dangerReset');
  if (dangerReset) {
    dangerReset.addEventListener('click', function() {
      showConfirm('Reset EVERYTHING? This deletes all leads, visitors, campaigns, and settings. Cannot be undone.', function() {
        var keys = [LEADS_KEY, VISITORS_KEY, LOCKOUT_KEY, EMAILJS_CFG_KEY, STUDIO_CFG_KEY, 'ars_ad_campaigns'];
        keys.forEach(function(k) { try { localStorage.removeItem(k); } catch(e) {} });
        showToast('Dashboard reset. Logging out…', 'info');
        setTimeout(function() { clearAuth(); showLogin(); }, 1800);
      });
    });
  }
}
