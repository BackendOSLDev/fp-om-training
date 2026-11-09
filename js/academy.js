/* BCB Partners Academy: shared helpers for every page (5-day program, progress, header, search, page start). */
(function(){
"use strict";
var L = window.ACAD_LESSONS || [], BY = {};
L.forEach(function(x){ BY[x.id] = x; });
var DAYS = [
  { id: 'd1', num: '1', name: 'Basics and intake', tasks: 13, checks: 35,
    summary: 'Clean customer records, then taking calls and web requests and booking them as clean jobs.' },
  { id: 'd2', num: '2', name: 'Intake follow-up, scheduling and dispatch', tasks: 13, checks: 27,
    summary: 'Closing the gaps after booking, then putting jobs on the calendar, keeping the board right all day, and closing each job out.' },
  { id: 'd3', num: '3', name: 'Invoicing, payments and estimates', tasks: 15, checks: 45,
    summary: 'Billing every finished job, recording every payment, chasing what is owed, and following every estimate to won or lost.' },
  { id: 'd4', num: '4', name: 'Payroll prep and compliance', tasks: 13, checks: 39,
    summary: 'Keeping FieldPulse and QuickBooks matched, getting hours ready for payroll, logins, and the compliance checks.' },
  { id: 'd5', num: '5', name: 'Review and certification',
    summary: 'Take the final review check, fix your weak spots, get your practice result to Ready, write your reflection, and your certificate unlocks.' }
];
var XTRA = { id: 'x', num: '+', name: 'Owner reporting', tasks: 6, checks: 18,
  summary: 'Giving the owner clear numbers without them having to ask. Extra lessons. They do not count toward the certificate.' };
var REQ = window.FP_REQUIRED || [];

function dayName(d){ return d === 'x' ? 'Extra' : 'Day ' + String(d).slice(1); }
function modShort(m){ return m === 'f' ? 'Foundations' : 'Module ' + m.slice(1); }
function where(x){ return dayName(x.day) + ' · ' + modShort(x.mod) + ', lesson ' + x.n; }
function href(x){ return x.page + '#' + x.id; }

/* lesson_events rows -> per lesson {open, walk, check, practice, read, min, last, score, total, hints} */
function progress(rows){
  var P = {};
  (rows || []).forEach(function(r){
    var x = P[r.lesson_id] = P[r.lesson_id] || { min: 0, last: '' };
    x.open = true;
    if(r.part !== 'open'){ x[r.part] = true; }
    if(r.part === 'check'){ x.score = r.score; x.total = r.total; }
    if(r.part === 'practice' && r.hints != null) x.hints = r.hints;
    x.min = Math.max(x.min, +r.minutes || 0);
    if((r.created_at || '') > x.last) x.last = r.created_at || '';
  });
  return P;
}
function isDone(P, id){ var x = P[id] || {}; return !!(x.walk && x.check && x.practice); }
function summary(P){
  var done = REQ.filter(function(id){ return isDone(P, id); }).length;
  var chk = REQ.filter(function(id){ return P[id] && P[id].check; }).length;
  var extra = L.filter(function(x){ return x.day === 'x' && isDone(P, x.id); }).length;
  var sops = Object.keys(P).filter(function(k){ return k.indexOf('sop-') === 0 && P[k].read; }).length;
  var min = Object.keys(P).reduce(function(a, k){ return a + (P[k].min || 0); }, 0);
  var last = Object.keys(P).reduce(function(a, k){ return P[k].last > a ? P[k].last : a; }, '');
  var next = L.filter(function(x){ return !isDone(P, x.id); })[0] || null;   /* 5-day order, Owner reporting last */
  var nextReq = L.filter(function(x){ return x.day !== 'x' && !isDone(P, x.id); })[0] || null;
  var curDay = nextReq ? nextReq.day : 'd5';
  return { done: done, chk: chk, extra: extra, sops: sops, min: min, last: last, next: next, nextReq: nextReq, curDay: curDay };
}
function fmtMin(m){ m = Math.round(m || 0); return m >= 60 ? Math.floor(m / 60) + ' h ' + (m % 60) + ' min' : m + ' min'; }
function fmtDay(iso){ if(!iso) return '-'; try{ return new Intl.DateTimeFormat('en-US', { timeZone: (window.FP_CONFIG || {}).TIME_ZONE || 'Etc/GMT+4', month: 'short', day: 'numeric', year: 'numeric' }).format(new Date(iso)); }catch(e){ return String(iso).slice(0, 10); } }
function fmtTime(iso){ return iso ? window.FPTrack.fmtTime(iso) : '-'; }

/* practice result shown everywhere: from the saved practice row */
function pracText(pr){
  if(!pr) return 'Not started';
  return pr.result + ' · ' + pr.done + ' of 54';
}

/* the header: who is signed in, admin links, sign out */
function hdr(me){
  var nm = (me && (me.full_name || me.email)) || '';
  var ini = nm.split(/[\s@._-]+/).filter(Boolean).slice(0, 2).map(function(w){ return w[0].toUpperCase(); }).join('') || '?';
  return { name: nm, ini: ini, admin: !!(me && me.role === 'admin'), demo: !window.FPTrack.live,
    signOut: function(){ window.FPTrack.signOut().then(function(){ location.href = 'index.html'; }); return false; } };
}

/* header search over lessons, SOPs and help videos (same scoring as the mockup) */
function search(c){
  var raw = (c.state && c.state.sq) || '', q = raw.trim().toLowerCase();
  var stem = function(w){ return w.replace(/ies$/, 'y').replace(/(ing|es|s|e)$/, ''); };
  var words = q.split(/[^a-z0-9]+/).filter(function(w){ return w.length > 1; }).map(stem);
  var set = function(v){ c.setState({ sq: v }); };
  var base = { sq: raw, setSq: function(e){ set(e.target.value); }, clearSq: function(){ set(''); }, sOpen: false, sNone: false, sGroups: [], sCount: '' };
  if(!words.length) return base;
  var hit = (window.ACAD_IX || []).map(function(r){
    var tw = r.t.toLowerCase().split(/[^a-z0-9]+/).map(stem), sc = 0;
    for(var i = 0; i < words.length; i++){ var w = words[i];
      if(tw.some(function(x){ return x.indexOf(w) === 0; })) sc += 10; else if(r.kw.indexOf(w) >= 0) sc += 2; else return null; }
    return { r: r, sc: sc };
  }).filter(Boolean).sort(function(a, b){ return b.sc - a.sc; });
  var G = [['l', 'Lessons', 5], ['a', 'SOP Library articles', 4], ['v', 'Help center videos', 3]];
  var sGroups = G.map(function(g){
    var all = hit.filter(function(h){ return h.r.k === g[0]; });
    return { name: g[1], n: all.length, items: all.slice(0, g[2]).map(function(h){ return { t: h.r.t, sub: h.r.sub, href: h.r.href, target: g[0] === 'v' ? '_blank' : '_self', open: function(){ if(h.r.k === 'a' && /^library\.html/.test(location.pathname.split('/').pop() || '')) setTimeout(function(){ set(''); }, 0); } }; }) };
  }).filter(function(g){ return g.n; });
  return Object.assign(base, { sOpen: true, sNone: !sGroups.length, sGroups: sGroups, sCount: hit.length + (hit.length === 1 ? ' result' : ' results') + ' for "' + raw.trim() + '"' });
}

/* start a page: sign-in check, load its data, then mount the template */
async function start(Component, opts, load){
  opts = opts || {};
  var app = document.getElementById('app');
  app.innerHTML = '<p class="loading">Loading...</p>';
  var me = null;
  if(opts.auth !== 'none'){ me = await window.FPTrack.page({ admin: opts.auth === 'admin' }); if(!me) return; }
  else { try{ me = await window.FPTrack.init(); }catch(e){ me = null; } }
  var data = null;
  try{ data = load ? await load(me) : null; }
  catch(e){ console.error(e); app.innerHTML = '<p class="loading">Couldn\'t load your progress. Check your internet and reload the page.</p>'; return; }
  app.innerHTML = '';
  window.DC.mount(app, document.getElementById('tpl').textContent, Component, { me: me, data: data });
}

/* next lesson in 5-day order (used by the lesson pages' "Next lesson" button) */
window.ACAD_NEXT = function(id){
  var i = -1; for(var k = 0; k < L.length; k++) if(L[k].id === id) i = k;
  var nx = i >= 0 ? L[i + 1] : null;
  if(!nx) return null;
  if(BY[id].day !== 'x' && nx.day === 'x') return null;   /* Day 4 ends the counted lessons */
  return nx.id;
};
window.ACAD_GO = function(id){ var x = BY[id]; if(x) location.href = href(x); };

window.ACAD = { L: L, BY: BY, DAYS: DAYS, XTRA: XTRA, REQ: REQ, dayName: dayName, modShort: modShort, where: where, href: href,
  progress: progress, isDone: isDone, summary: summary, fmtMin: fmtMin, fmtDay: fmtDay, fmtTime: fmtTime, pracText: pracText,
  hdr: hdr, search: search, start: start };
})();
