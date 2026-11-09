/* BCB Partners Academy: shared helpers for every page (5-day program, progress, header, search, page start). */
(function(){
"use strict";
var L = window.ACAD_LESSONS || [], BY = {};
L.forEach(function(x){ BY[x.id] = x; });
var DAYS = [
  { id: 'd1', num: '1', name: 'Basics and intake', tasks: 13, checks: 35,
    summary: 'Clean customer records, then taking calls and web requests and booking them as clean jobs.',
    start: ['How the 5 days work: Days 1 to 4 teach the work, Day 5 reviews it and unlocks the certificate.', 'How each day is graded, and what the certificate needs.', 'Where to get help: Hint, the SOP Library, the help videos and your trainer.'] },
  { id: 'd2', num: '2', name: 'Intake follow-up, scheduling and dispatch', tasks: 13, checks: 27,
    summary: 'Closing the gaps after booking, then putting jobs on the calendar, keeping the board right all day, and closing each job out.',
    start: ['Your Day 1 grade, and any hints or slips.', 'Recap: a clean customer record, and a call booked as a clean job.', 'Today: finishing intake, then scheduling, dispatch and closing jobs out.'] },
  { id: 'd3', num: '3', name: 'Invoicing, payments and estimates', tasks: 15, checks: 45,
    summary: 'Billing every finished job, recording every payment, chasing what is owed, and following every estimate to won or lost.',
    start: ['Your Day 2 grade, and any hints or slips.', 'Recap: keeping the dispatch board right and closing a job out.', 'Today: invoices, payments, unpaid balances and estimates.'] },
  { id: 'd4', num: '4', name: 'Payroll prep and compliance', tasks: 13, checks: 39,
    summary: 'Keeping FieldPulse and QuickBooks matched, getting hours ready for payroll, logins, and the compliance checks.',
    start: ['Your Day 3 grade, and any hints or slips.', 'Recap: billing every finished job and following every estimate.', 'Today: QuickBooks matching, hours for payroll, logins and compliance.'] },
  { id: 'd5', num: '5', name: 'Review and certification',
    summary: 'Take the final review check, fix your weak spots, get your practice result to Ready, write your reflection, and your certificate unlocks.',
    start: ['Your Day 4 grade, and all four day grades side by side.', 'What the final check covers, and what a Ready practice result needs.', 'Today: the final check, your weak spots, the reflection and the certificate.'] }
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
    /* a Hint in the knowledge check is saved the moment it is clicked (an "open" row with hints) */
    if(r.part === 'open' && +r.hints > 0 && (x.hAt == null || (r.created_at || '') < x.hAt)) x.hAt = r.created_at || '';
    /* first finished try of the knowledge check */
    if(r.part === 'practice' && (x.pAt == null || (r.created_at || '') < x.pAt)){ x.pAt = r.created_at || ''; x.hints1 = +r.hints || 0; }
    x.min = Math.max(x.min, +r.minutes || 0);
    if((r.created_at || '') > x.last) x.last = r.created_at || '';
  });
  /* the knowledge check needed a hint if the first finished try used one, or a hint was clicked before it was first finished */
  Object.keys(P).forEach(function(k){ var x = P[k]; x.hinted = (x.hints1 || 0) > 0 || (x.hAt != null && x.pAt != null && x.hAt <= x.pAt); });
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

/* Day grade (Days 1 to 4), worked out the same way for everyone from what is already saved:
   the 3 lesson parts, hints on the first try of each knowledge check, the day's practice tasks (on your own or with a hint)
   and serious slips in that day's practice. The certificate rule does not change: it still uses the totals. */
var GRADE_RULE = { hints: 2 };
var GRADE_TEXT = 'Pass = every lesson and practice task of the day done, at most 2 knowledge checks needed a hint before they were first finished, at most 2 practice tasks needed a hint, and no serious slips. ' +
  'Pass with coaching = all done and no serious slips, but more hints than that. Redo = a serious slip in that day\'s practice: start that day over in Practice tasks. ' +
  'The certificate still looks at the totals: all 50 lessons and a Ready practice result (at most 8 practice tasks with a hint across Days 1 to 4, no serious slips).';
var GRADE_COLOR = { 'Pass': 'var(--ok)', 'Pass with coaching': 'var(--warn)', 'Redo': 'var(--red)', 'In progress': 'var(--paper)', 'Not started': 'var(--faint)' };
function dayGrade(P, pr, d){
  var les = L.filter(function(x){ return x.day === d; });
  var ids = (window.ACAD_PTASKS || {})[d] || [];
  var data = (pr && pr.data && typeof pr.data === 'object') ? pr.data : {}, tasks = (data.tasks && typeof data.tasks === 'object') ? data.tasks : {};
  var sl = (data.slips && Array.isArray(data.slips[String(d).slice(1)])) ? data.slips[String(d).slice(1)] : [];
  var lesDone = les.filter(function(x){ return isDone(P, x.id); }).length;
  var kc = les.filter(function(x){ return P[x.id] && P[x.id].practice; });
  var kcHint = kc.filter(function(x){ return P[x.id].hinted; }).length;
  var tDone = ids.filter(function(id){ return tasks[id] === 's' || tasks[id] === 'h'; }).length;
  var tHint = ids.filter(function(id){ return tasks[id] === 'h'; }).length;
  var serious = sl.filter(function(x){ return x && x.s; }).length;
  var started = les.some(function(x){ return P[x.id]; }) || tDone > 0 || sl.length > 0;
  var g = !started ? 'Not started' : serious ? 'Redo' : (lesDone < les.length || tDone < ids.length) ? 'In progress'
    : (kcHint <= GRADE_RULE.hints && tHint <= GRADE_RULE.hints) ? 'Pass' : 'Pass with coaching';
  var dd = DAYS.filter(function(x){ return x.id === d; })[0] || {};
  return { d: d, day: dayName(d), name: dd.name || '', grade: g, color: GRADE_COLOR[g],
    les: lesDone + ' of ' + les.length, kc: kc.length + ' done · ' + kcHint + ' with a hint',
    tasks: tDone + ' of ' + ids.length + ' · ' + tHint + ' with a hint', serious: serious,
    n: { lesDone: lesDone, les: les.length, kc: kc.length, kcHint: kcHint, tDone: tDone, tasks: ids.length, tHint: tHint, serious: serious } };
}
function grades(P, pr){ return ['d1', 'd2', 'd3', 'd4'].map(function(d){ return dayGrade(P, pr, d); }); }

/* the day plan: a 15-minute start-of-day check with the trainer, then self-paced work */
function agenda(d, P, pr){
  var D = DAYS.filter(function(x){ return x.id === d; })[0]; if(!D) return [];
  var start = { when: 'Start of day', t: 'Start-of-day check', who: 'With your trainer · 15 min', d: D.start || [] };
  if(d === 'd5') return [start,
    { when: 'Then', t: 'Final check, review, practice and reflection', who: 'On your own', d: ['The five steps below, in order.'] },
    { when: 'End of day', t: 'Results 1:1', who: 'With your trainer', d: ['Your trainer goes over your four day grades, your final check and your reflection.'] }];
  var nL = L.filter(function(x){ return x.day === d; }).length, G = dayGrade(P || {}, pr, d);
  return [start,
    { when: 'Then', t: nL + ' lessons · ' + D.checks + ' check questions', who: 'On your own', d: ['Each lesson: the walk-through, its check questions (retry as often as you need), then the knowledge check on your own.', 'Help videos and articles are inside each lesson.'] },
    { when: 'Then', t: D.tasks + ' practice tasks', who: 'On your own', d: ['The same work again in the practice copy of FieldPulse, with no orange boxes.'] },
    { when: 'End of day', t: 'Your day grade: ' + G.grade, who: 'On your own', d: ['See it on My progress. Your trainer sees it too and goes over it at the next start-of-day check.'], color: G.color }];
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
  progress: progress, isDone: isDone, summary: summary, dayGrade: dayGrade, grades: grades, agenda: agenda, GRADE_TEXT: GRADE_TEXT, GRADE_COLOR: GRADE_COLOR, fmtMin: fmtMin, fmtDay: fmtDay, fmtTime: fmtTime, pracText: pracText,
  hdr: hdr, search: search, start: start };
})();
