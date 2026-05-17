/* ════════════════════════════════════════════════════════════
   Modform Architects — Supabase Database + Auth Connector
   - Public site uses the anon key for INSERT-only operations
     (lead form, visitor log, customer profile capture).
   - Admin dashboard signs in via Supabase Auth and uses the
     resulting JWT for SELECT / UPDATE / DELETE.
   The plain admin password never lives in source code.
   ════════════════════════════════════════════════════════════ */

(function() {
  'use strict';

  var SUPABASE_URL      = 'https://ugxaqrrdwnkvxqytbcki.supabase.co';
  var SUPABASE_ANON_KEY = 'sb_publishable_UP_NRB58rbAXE5TqmEWrPw_5cGNoydU';
  var SESSION_KEY       = 'modform_admin_session';

  var TABLES = {
    leads: 'leads',
    visitors: 'visitors',
    customerProfiles: 'customer_profiles',
  };

  function hasConfig() {
    return Boolean(SUPABASE_URL && SUPABASE_ANON_KEY);
  }

  function restUrl() {
    return SUPABASE_URL.replace(/\/+$/, '') + '/rest/v1/';
  }

  function authUrl() {
    return SUPABASE_URL.replace(/\/+$/, '') + '/auth/v1/';
  }

  function failSoft(label, err) {
    if (window.console && console.warn) {
      console.warn('[ModformDB] ' + label + ' failed:', err);
    }
    return null;
  }

  function sanitizeRecord(record) {
    var clean = {};
    Object.keys(record || {}).forEach(function(key) {
      var value = record[key];
      if (value !== undefined && value !== null) clean[key] = value;
    });
    return clean;
  }

  /* ── Session storage ─────────────────────────────────────── */
  function readSession() {
    try {
      var raw = sessionStorage.getItem(SESSION_KEY);
      if (!raw) return null;
      var s = JSON.parse(raw);
      if (!s || !s.access_token) return null;
      return s;
    } catch (e) { return null; }
  }

  function writeSession(s) {
    try {
      if (s) sessionStorage.setItem(SESSION_KEY, JSON.stringify(s));
      else sessionStorage.removeItem(SESSION_KEY);
    } catch (e) {}
  }

  function sessionExpired(s) {
    if (!s || !s.expires_at) return false;
    return Math.floor(Date.now() / 1000) >= Number(s.expires_at) - 30;
  }

  function getSession() {
    var s = readSession();
    if (!s) return null;
    if (sessionExpired(s)) return null;
    return s;
  }

  function refreshSession() {
    var s = readSession();
    if (!s || !s.refresh_token) return Promise.resolve(null);
    return fetch(authUrl() + 'token?grant_type=refresh_token', {
      method: 'POST',
      headers: {
        apikey: SUPABASE_ANON_KEY,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ refresh_token: s.refresh_token }),
    }).then(function(res) {
      return res.json().then(function(data) {
        if (!res.ok) throw new Error((data && (data.msg || data.error_description)) || 'refresh failed');
        var fresh = {
          access_token: data.access_token,
          refresh_token: data.refresh_token || s.refresh_token,
          expires_at: data.expires_at || (Math.floor(Date.now() / 1000) + (data.expires_in || 3600)),
          user: data.user || s.user,
        };
        writeSession(fresh);
        return fresh;
      });
    }).catch(function(err) {
      writeSession(null);
      return failSoft('refreshSession', err);
    });
  }

  /* ── Public-form headers (anon, insert-only) ─────────────── */
  function publicHeaders(extra) {
    var h = {
      apikey: SUPABASE_ANON_KEY,
      Authorization: 'Bearer ' + SUPABASE_ANON_KEY,
      'Content-Type': 'application/json',
    };
    Object.keys(extra || {}).forEach(function(k) { h[k] = extra[k]; });
    return h;
  }

  /* ── Admin headers (JWT) ─────────────────────────────────── */
  function adminHeaders(extra) {
    var s = getSession();
    if (!s) return null;
    var h = {
      apikey: SUPABASE_ANON_KEY,
      Authorization: 'Bearer ' + s.access_token,
      'Content-Type': 'application/json',
    };
    Object.keys(extra || {}).forEach(function(k) { h[k] = extra[k]; });
    return h;
  }

  /* ── Auth API ────────────────────────────────────────────── */
  function signInAdmin(email, password) {
    if (!hasConfig() || typeof fetch === 'undefined') {
      return Promise.reject(new Error('Auth is not configured.'));
    }
    return fetch(authUrl() + 'token?grant_type=password', {
      method: 'POST',
      headers: {
        apikey: SUPABASE_ANON_KEY,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email: email, password: password }),
    }).then(function(res) {
      return res.json().then(function(data) {
        if (!res.ok) {
          var msg = (data && (data.error_description || data.msg || data.error)) || ('HTTP ' + res.status);
          throw new Error(msg);
        }
        var session = {
          access_token: data.access_token,
          refresh_token: data.refresh_token,
          expires_at: data.expires_at || (Math.floor(Date.now() / 1000) + (data.expires_in || 3600)),
          user: data.user,
        };
        writeSession(session);
        return session;
      });
    });
  }

  function signOutAdmin() {
    var s = readSession();
    writeSession(null);
    if (!s || !s.access_token) return Promise.resolve(true);
    return fetch(authUrl() + 'logout', {
      method: 'POST',
      headers: {
        apikey: SUPABASE_ANON_KEY,
        Authorization: 'Bearer ' + s.access_token,
      },
    }).then(function() { return true; }).catch(function() { return true; });
  }

  function updatePassword(newPassword) {
    var s = getSession();
    if (!s) return Promise.reject(new Error('Not signed in.'));
    return fetch(authUrl() + 'user', {
      method: 'PUT',
      headers: {
        apikey: SUPABASE_ANON_KEY,
        Authorization: 'Bearer ' + s.access_token,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ password: newPassword }),
    }).then(function(res) {
      return res.json().then(function(data) {
        if (!res.ok) {
          var msg = (data && (data.msg || data.error_description || data.error)) || ('HTTP ' + res.status);
          throw new Error(msg);
        }
        return data;
      });
    });
  }

  /* ── Public INSERT (anon) ────────────────────────────────── */
  function insertPublic(table, record) {
    if (!hasConfig() || typeof fetch === 'undefined') return Promise.resolve(null);
    var body = sanitizeRecord(record);
    return fetch(restUrl() + table, {
      method: 'POST',
      headers: publicHeaders({ Prefer: 'return=representation' }),
      body: JSON.stringify(body),
    })
      .then(function(res) {
        if (!res.ok) throw new Error('HTTP ' + res.status);
        return res.json();
      })
      .then(function(rows) { return Array.isArray(rows) ? rows[0] : rows; })
      .catch(function(err) {
        if (table === TABLES.visitors && (body.city || body.region || body.country || body.ip)) {
          var fallback = { id: body.id, ts: body.ts, page: body.page, ref: body.ref, ua: body.ua };
          return fetch(restUrl() + table, {
            method: 'POST',
            headers: publicHeaders({ Prefer: 'return=representation' }),
            body: JSON.stringify(sanitizeRecord(fallback)),
          })
            .then(function(res) {
              if (!res.ok) throw new Error('HTTP ' + res.status);
              return res.json();
            })
            .then(function(rows) { return Array.isArray(rows) ? rows[0] : rows; })
            .catch(function(innerErr) { return failSoft('insert ' + table, innerErr); });
        }
        return failSoft('insert ' + table, err);
      });
  }

  /* ── Admin SELECT / UPDATE / DELETE (JWT required) ───────── */
  function adminSelect(table, limit) {
    if (!hasConfig() || typeof fetch === 'undefined') return Promise.resolve([]);
    var headers = adminHeaders();
    if (!headers) return Promise.resolve([]);
    var url = restUrl() + table + '?select=*&order=ts.desc&limit=' + encodeURIComponent(limit || 500);
    return fetch(url, { headers: headers })
      .then(function(res) {
        if (!res.ok) throw new Error('HTTP ' + res.status);
        return res.json();
      })
      .then(function(rows) { return Array.isArray(rows) ? rows : []; })
      .catch(function(err) {
        failSoft('select ' + table, err);
        return [];
      });
  }

  function adminUpdateById(table, id, patch) {
    if (!hasConfig() || typeof fetch === 'undefined' || !id) return Promise.resolve(null);
    var headers = adminHeaders({ Prefer: 'return=representation' });
    if (!headers) return Promise.resolve(null);
    return fetch(restUrl() + table + '?id=eq.' + encodeURIComponent(id), {
      method: 'PATCH',
      headers: headers,
      body: JSON.stringify(sanitizeRecord(patch)),
    })
      .then(function(res) {
        if (!res.ok) throw new Error('HTTP ' + res.status);
        return res.json();
      })
      .then(function(rows) { return Array.isArray(rows) ? rows[0] : rows; })
      .catch(function(err) { return failSoft('update ' + table, err); });
  }

  function adminDeleteById(table, id) {
    if (!hasConfig() || typeof fetch === 'undefined' || !id) return Promise.resolve(null);
    var headers = adminHeaders();
    if (!headers) return Promise.resolve(null);
    return fetch(restUrl() + table + '?id=eq.' + encodeURIComponent(id), {
      method: 'DELETE',
      headers: headers,
    })
      .then(function(res) {
        if (!res.ok) throw new Error('HTTP ' + res.status);
        return true;
      })
      .catch(function(err) { return failSoft('delete ' + table, err); });
  }

  window.ModformDB = {
    enabled: hasConfig(),
    tables: TABLES,

    /* Auth */
    signInAdmin: signInAdmin,
    signOutAdmin: signOutAdmin,
    updatePassword: updatePassword,
    getSession: getSession,
    refreshSession: refreshSession,
    isAuthenticated: function() { return Boolean(getSession()); },
    currentUserEmail: function() {
      var s = getSession();
      return s && s.user && s.user.email ? s.user.email : '';
    },

    /* Public (anon) inserts */
    insertLead:            function(lead)    { return insertPublic(TABLES.leads, lead); },
    insertVisitor:         function(visitor) { return insertPublic(TABLES.visitors, visitor); },
    insertCustomerProfile: function(profile) { return insertPublic(TABLES.customerProfiles, profile); },

    /* Admin (JWT) reads + writes */
    fetchLeads:       function(limit)        { return adminSelect(TABLES.leads, limit); },
    fetchVisitors:    function(limit)        { return adminSelect(TABLES.visitors, limit); },
    updateLeadStatus: function(id, status)   { return adminUpdateById(TABLES.leads, id, { status: status }); },
    deleteLead:       function(id)           { return adminDeleteById(TABLES.leads, id); },
  };
})();
