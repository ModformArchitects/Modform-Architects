/* ════════════════════════════════════════════════════════════
   EcolineArchitect — Optional Supabase Database Connector
   Fill SUPABASE_URL and SUPABASE_ANON_KEY after creating the tables
   from SUPABASE_SETUP.sql. Until then, the site keeps using localStorage.
   ════════════════════════════════════════════════════════════ */

(function() {
  'use strict';

  var SUPABASE_URL = 'https://ugxaqrrdwnkvxqytbcki.supabase.co';
  var SUPABASE_ANON_KEY = 'sb_publishable_UP_NRB58rbAXE5TqmEWrPw_5cGNoydU';

  var TABLES = {
    leads: 'leads',
    visitors: 'visitors',
    customerProfiles: 'customer_profiles',
  };

  function hasConfig() {
    return Boolean(SUPABASE_URL && SUPABASE_ANON_KEY);
  }

  function baseUrl() {
    return SUPABASE_URL.replace(/\/+$/, '') + '/rest/v1/';
  }

  function headers(extra) {
    var h = {
      apikey: SUPABASE_ANON_KEY,
      Authorization: 'Bearer ' + SUPABASE_ANON_KEY,
      'Content-Type': 'application/json',
    };
    Object.keys(extra || {}).forEach(function(k) { h[k] = extra[k]; });
    return h;
  }

  function failSoft(label, err) {
    if (window.console && console.warn) {
      console.warn('[EcolineDB] ' + label + ' failed:', err);
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

  function insert(table, record) {
    if (!hasConfig() || typeof fetch === 'undefined') return Promise.resolve(null);
    var body = sanitizeRecord(record);
    return fetch(baseUrl() + table, {
      method: 'POST',
      headers: headers({ Prefer: 'return=representation' }),
      body: JSON.stringify(body),
    })
      .then(function(res) {
        if (!res.ok) throw new Error('HTTP ' + res.status);
        return res.json();
      })
      .then(function(rows) { return Array.isArray(rows) ? rows[0] : rows; })
      .catch(function(err) {
        if (table === TABLES.visitors && (body.city || body.region || body.country || body.ip)) {
          var fallback = {
            id: body.id,
            ts: body.ts,
            page: body.page,
            ref: body.ref,
            ua: body.ua,
          };
          return fetch(baseUrl() + table, {
            method: 'POST',
            headers: headers({ Prefer: 'return=representation' }),
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

  function select(table, limit) {
    if (!hasConfig() || typeof fetch === 'undefined') return Promise.resolve([]);
    var url = baseUrl() + table + '?select=*&order=ts.desc&limit=' + encodeURIComponent(limit || 500);
    return fetch(url, { headers: headers() })
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

  function updateById(table, id, patch) {
    if (!hasConfig() || typeof fetch === 'undefined' || !id) return Promise.resolve(null);
    return fetch(baseUrl() + table + '?id=eq.' + encodeURIComponent(id), {
      method: 'PATCH',
      headers: headers({ Prefer: 'return=representation' }),
      body: JSON.stringify(sanitizeRecord(patch)),
    })
      .then(function(res) {
        if (!res.ok) throw new Error('HTTP ' + res.status);
        return res.json();
      })
      .then(function(rows) { return Array.isArray(rows) ? rows[0] : rows; })
      .catch(function(err) { return failSoft('update ' + table, err); });
  }

  function deleteById(table, id) {
    if (!hasConfig() || typeof fetch === 'undefined' || !id) return Promise.resolve(null);
    return fetch(baseUrl() + table + '?id=eq.' + encodeURIComponent(id), {
      method: 'DELETE',
      headers: headers(),
    })
      .then(function(res) {
        if (!res.ok) throw new Error('HTTP ' + res.status);
        return true;
      })
      .catch(function(err) { return failSoft('delete ' + table, err); });
  }

  window.EcolineDB = {
    enabled: hasConfig(),
    tables: TABLES,
    insertLead: function(lead) { return insert(TABLES.leads, lead); },
    insertVisitor: function(visitor) { return insert(TABLES.visitors, visitor); },
    insertCustomerProfile: function(profile) { return insert(TABLES.customerProfiles, profile); },
    fetchLeads: function(limit) { return select(TABLES.leads, limit); },
    fetchVisitors: function(limit) { return select(TABLES.visitors, limit); },
    updateLeadStatus: function(id, status) { return updateById(TABLES.leads, id, { status: status }); },
    deleteLead: function(id) { return deleteById(TABLES.leads, id); },
  };
})();
