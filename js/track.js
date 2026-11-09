/* FieldPulse OM Training: login and progress tracking.
   Two backends with the same calls: Supabase (real) and Demo (this browser only, when config is blank). */
(function(){
"use strict";
var CFG = window.FP_CONFIG || {}, LIVE = !!(CFG.SUPABASE_URL && CFG.SUPABASE_KEY);
function ls(k, v){ try{ if(v===undefined){ var x = localStorage.getItem(k); return x ? JSON.parse(x) : null; } if(v===null) localStorage.removeItem(k); else localStorage.setItem(k, JSON.stringify(v)); }catch(e){ return null; } }
function esc(s){ return String(s==null?"":s).replace(/[&<>"']/g, function(c){ return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]; }); }

/* ---------- backends ---------- */
function supa(){
  var sb = window.supabase.createClient(CFG.SUPABASE_URL, CFG.SUPABASE_KEY, {auth:{persistSession:true, autoRefreshToken:true, storageKey:"fpom-auth"}});
  function chk(r){ if(r.error) throw r.error; return r.data; }
  async function all(q){ var out = [], from = 0, n = 1000; for(;;){ var d = chk(await q().range(from, from+n-1)); out = out.concat(d); if(d.length<n) return out; from += n; } }
  return {
    live: true,
    async session(){ var d = chk(await sb.auth.getSession()); return d.session ? d.session.user : null; },
    async signIn(email, pw){ var d = chk(await sb.auth.signInWithPassword({email:email, password:pw})); return d.user; },
    async signOut(){ await sb.auth.signOut(); },
    async setPassword(pw){ chk(await sb.auth.updateUser({password:pw})); },
    async profile(uid){ return chk(await sb.from("profiles").select("id,email,full_name,role").eq("id", uid).maybeSingle()); },
    async insert(row){ chk(await sb.from("lesson_events").insert(row)); },
    async myEvents(uid){ return all(function(){ return sb.from("lesson_events").select("lesson_id,part,score,total,hints,minutes,created_at").eq("user_id", uid).order("id"); }); },
    async profiles(){ return all(function(){ return sb.from("profiles").select("id,email,full_name,role,created_at").order("full_name"); }); },
    async events(){ return all(function(){ return sb.from("lesson_events").select("user_id,lesson_id,part,score,total,hints,minutes,created_at").order("id"); }); },
    /* 5-day program: practice result, final check, reflection, certificate */
    async practiceGet(uid){ return chk(await sb.from("practice_results").select("data,done,own,serious,slips,result,updated_at").eq("user_id", uid).maybeSingle()); },
    async practiceSave(row){ chk(await sb.from("practice_results").upsert(row, {onConflict:"user_id"})); },
    async practiceAll(){ return all(function(){ return sb.from("practice_results").select("user_id,done,own,serious,slips,result,updated_at").order("user_id"); }); },
    async finalAdd(row){ chk(await sb.from("final_checks").insert(row)); },
    async finalMine(uid){ return chk(await sb.from("final_checks").select("score,by_day,created_at").eq("user_id", uid).order("id")); },
    async finalAll(){ return all(function(){ return sb.from("final_checks").select("user_id,score,by_day,created_at").order("id"); }); },
    async reflGet(uid){ return chk(await sb.from("reflections").select("r1,r2,r3,updated_at").eq("user_id", uid).maybeSingle()); },
    async reflSave(row){ chk(await sb.from("reflections").upsert(row, {onConflict:"user_id"})); },
    async reflAll(){ return all(function(){ return sb.from("reflections").select("user_id,r1,r2,r3,updated_at").order("user_id"); }); },
    async certMine(uid){ return chk(await sb.from("certificates").select("cert_id,full_name,training,issued_at,status,revoked_at,revoke_reason").eq("user_id", uid).maybeSingle()); },
    async certIssue(){ return chk(await sb.rpc("issue_my_certificate")); },
    async certVerify(id){ var d = chk(await sb.rpc("verify_certificate", {p_id:id})); return Array.isArray(d) ? (d[0] || null) : d; },
    async certsAll(){ return all(function(){ return sb.from("certificates").select("cert_id,user_id,full_name,issued_at,status,revoked_at,revoke_reason").order("issued_at"); }); },
    async certSet(id, status, reason){ return chk(await sb.rpc("admin_set_certificate", {p_id:id, p_status:status, p_reason:reason||null})); }
  };
}
function demo(){
  /* Demo: any email, password "demo". An email with "admin" in it is an admin. Saved in this browser only. */
  var K = "fpdemo:db";
  function db(){ return ls(K) || {users:{}, events:[]}; }
  function put(d){ ls(K, d); }
  function wait(){ return new Promise(function(r){ setTimeout(r, 30); }); }
  return {
    live: false,
    async session(){ var u = ls("fpdemo:me"); return u ? {id:u, email:db().users[u].email} : null; },
    async signIn(email, pw){ await wait(); email = String(email||"").trim().toLowerCase();
      if(!/^[^@\s]+@[^@\s]+$/.test(email) || pw!=="demo") throw new Error("Invalid login credentials");
      var d = db(), id = "demo-"+email; if(!d.users[id]) d.users[id] = {id:id, email:email, full_name:email.split("@")[0], role:/admin/.test(email)?"admin":"trainee", created_at:new Date().toISOString()};
      put(d); ls("fpdemo:me", id); return {id:id, email:email}; },
    async signOut(){ ls("fpdemo:me", null); },
    async setPassword(pw){ await wait(); if(!ls("fpdemo:me")) throw new Error("Not signed in"); },
    async profile(uid){ return db().users[uid] || null; },
    async insert(row){ await wait(); var d = db(), me = ls("fpdemo:me"); if(!me) throw new Error("Not signed in");
      d.events.push(Object.assign({user_id:me, created_at:new Date().toISOString()}, row)); put(d); },
    async myEvents(uid){ return db().events.filter(function(e){ return e.user_id===uid; }); },
    async profiles(){ var d = db(), me = ls("fpdemo:me"); if(!me || d.users[me].role!=="admin") return me ? [d.users[me]] : []; return Object.keys(d.users).map(function(k){ return d.users[k]; }); },
    async events(){ var d = db(), me = ls("fpdemo:me"); if(!me) return []; return d.users[me].role==="admin" ? d.events : d.events.filter(function(e){ return e.user_id===me; }); },
    /* same rules as the database: own rows only, admins read everyone */
    async practiceGet(uid){ return (db().practice||{})[uid] || null; },
    async practiceSave(row){ await wait(); var d = db(), me = ls("fpdemo:me"); if(!me) throw new Error("Not signed in"); d.practice = d.practice||{}; d.practice[me] = Object.assign({user_id:me}, row, {updated_at:new Date().toISOString()}); put(d); },
    async practiceAll(){ var d = db(), me = ls("fpdemo:me"), all = Object.keys(d.practice||{}).map(function(k){ return d.practice[k]; }); return d.users[me] && d.users[me].role==="admin" ? all : all.filter(function(r){ return r.user_id===me; }); },
    async finalAdd(row){ await wait(); var d = db(), me = ls("fpdemo:me"); if(!me) throw new Error("Not signed in"); (d.finals = d.finals||[]).push(Object.assign({user_id:me, created_at:new Date().toISOString()}, row)); put(d); },
    async finalMine(uid){ return (db().finals||[]).filter(function(r){ return r.user_id===uid; }); },
    async finalAll(){ var d = db(), me = ls("fpdemo:me"); return d.users[me] && d.users[me].role==="admin" ? (d.finals||[]) : (d.finals||[]).filter(function(r){ return r.user_id===me; }); },
    async reflGet(uid){ return (db().refl||{})[uid] || null; },
    async reflSave(row){ await wait(); var d = db(), me = ls("fpdemo:me"); if(!me) throw new Error("Not signed in"); d.refl = d.refl||{}; d.refl[me] = Object.assign({user_id:me}, row, {updated_at:new Date().toISOString()}); put(d); },
    async reflAll(){ var d = db(), me = ls("fpdemo:me"), all = Object.keys(d.refl||{}).map(function(k){ return d.refl[k]; }); return d.users[me] && d.users[me].role==="admin" ? all : all.filter(function(r){ return r.user_id===me; }); },
    async certMine(uid){ return ((db().certs)||[]).filter(function(c){ return c.user_id===uid; })[0] || null; },
    async certIssue(){ await wait(); var d = db(), me = ls("fpdemo:me"); if(!me) throw new Error("Not signed in");
      var have = (d.certs||[]).filter(function(c){ return c.user_id===me; })[0]; if(have) return have;
      var p = {}; d.events.forEach(function(e){ if(e.user_id===me && /^(walk|check|practice)$/.test(e.part)) (p[e.lesson_id] = p[e.lesson_id]||{})[e.part] = 1; });
      var n = (window.FP_REQUIRED||[]).filter(function(id){ var x = p[id]||{}; return x.walk && x.check && x.practice; }).length;
      if(n < 50) throw new Error("Not ready: "+n+" of 50 lessons done");
      var pr = (d.practice||{})[me]; if(!pr || pr.result!=="Ready" || pr.done<54 || pr.own<46 || pr.serious>0) throw new Error("Not ready: practice result is not Ready yet");
      d.certs = d.certs||[]; d.certNo = (d.certNo||0)+1;
      var c = {cert_id:"BCB-FP-"+new Date().getFullYear()+"-"+String(d.certNo).padStart(4,"0"), user_id:me, full_name:d.users[me].full_name||d.users[me].email, training:"FieldPulse office operations, 5-day program", issued_at:new Date().toISOString(), status:"active", revoked_at:null, revoke_reason:null};
      d.certs.push(c); put(d); return c; },
    async certVerify(id){ id = String(id||"").trim().toUpperCase(); var c = (db().certs||[]).filter(function(x){ return x.cert_id===id; })[0]; return c ? {cert_id:c.cert_id, full_name:c.full_name, training:c.training, issued_at:c.issued_at, status:c.status, revoked_at:c.revoked_at} : null; },
    async certsAll(){ var d = db(), me = ls("fpdemo:me"); return d.users[me] && d.users[me].role==="admin" ? (d.certs||[]) : (d.certs||[]).filter(function(c){ return c.user_id===me; }); },
    async certSet(id, status, reason){ await wait(); var d = db(), me = ls("fpdemo:me"); if(!me || d.users[me].role!=="admin") throw new Error("Admins only");
      if(status==="revoked" && !String(reason||"").trim()) throw new Error("A reason is required to revoke");
      var c = (d.certs||[]).filter(function(x){ return x.cert_id===id; })[0]; if(!c) throw new Error("No such certificate");
      c.status = status; c.revoked_at = status==="revoked" ? new Date().toISOString() : null; c.revoke_reason = status==="revoked" ? String(reason).trim() : null; put(d); return c; }
  };
}
var B = LIVE && window.supabase ? supa() : demo();

/* ---------- state ---------- */
var ME = null, PROF = null, OUTKEY = null, TIMEKEY = null, OPENKEY = null, PRACKEY = null, FLUSHING = false;
/* each tab queues into its own outbox (no two tabs write the same key); a flush sends every outbox of this user */
var TAB = Math.random().toString(36).slice(2, 10);
function outbox(v){ return ls(OUTKEY, v); }
function outKeys(){ var out = [], base = "fpom-outbox:" + (ME ? ME.id : ""); try{ for(var i = 0; i < localStorage.length; i++){ var k = localStorage.key(i); if(k === base || k.indexOf(base + ":") === 0) out.push(k); } }catch(e){} if(out.indexOf(OUTKEY) < 0) out.push(OUTKEY); return out; }
function pending(){ return outKeys().some(function(k){ return (ls(k) || []).length; }); }
function times(){ return ls(TIMEKEY) || {}; }
function minutesFor(id){ var s = times()[id] || 0; return Math.round(s/6)/10; }
/* one tab sends at a time (the outbox is shared by every tab of this browser) */
function flush(){
  if(!ME || FLUSHING) return Promise.resolve();
  if(navigator.locks && navigator.locks.request) return navigator.locks.request("fpom-flush:" + ME.id, function(){ return flushNow(); }).catch(function(){});
  return flushNow();
}
async function flushNow(){
  if(!ME || FLUSHING) return; FLUSHING = true;
  try{
    /* re-read the outbox every time: rows queued while this loop is sending must not be lost */
    var keys = outKeys();
    for(var ki = 0; ki < keys.length; ki++){ var K = keys[ki];
      for(var q = ls(K) || []; q.length; q = ls(K) || []){
        try{ await B.insert(q[0]); }
        catch(e){ var c = String((e && (e.code || e.status)) || ""); if(!/^(23514|22P02|23502|400)$/.test(c)) throw e; /* the database refused this row for good: drop it so later rows still save */ }
        q = ls(K) || []; q.shift(); ls(K, q.length ? q : null); } }
    await sendPractice();
    setStatus(""); }
  catch(e){ setStatus("Not saved yet. Will retry."); }
  finally{ FLUSHING = false; }
}
/* practice: keep only the newest copy waiting, send one at a time, clear it only if nothing newer arrived meanwhile */
var PRAC_BUSY = null;
function sendPractice(){
  if(PRAC_BUSY) return PRAC_BUSY.then(function(){ return sendPractice(); });
  var row = PRACKEY && ls(PRACKEY); if(!row) return Promise.resolve();
  var sent = JSON.stringify(row);
  PRAC_BUSY = B.practiceSave(row).then(function(){ var now = ls(PRACKEY); if(now && JSON.stringify(now) === sent) ls(PRACKEY, null); }, function(e){ var c = String((e && (e.code || e.status)) || ""); if(/^(23514|22P02|23502|400)$/.test(c)){ var now = ls(PRACKEY); if(now && JSON.stringify(now) === sent) ls(PRACKEY, null); console.error("practice row refused", e); return; } throw e; }).finally(function(){ PRAC_BUSY = null; });
  return PRAC_BUSY.then(function(){ if(ls(PRACKEY)) return sendPractice(); });
}
async function flushDone(){ for(var i = 0; i < 80; i++){ await flush(); if(!pending() && !(PRACKEY && ls(PRACKEY))) return; await new Promise(function(r){ setTimeout(r, 100); }); } }
function queue(row){ var q = outbox() || []; q.push(row); outbox(q); flush(); }
function setStatus(t){ var el = document.getElementById("fpt-status"); if(el) el.textContent = t; }

/* ---------- active-time timer: counts 15s ticks while the tab is visible and the trainee did something in the last 2 minutes ---------- */
var LAST = Date.now();
["click","keydown","pointermove","scroll","touchstart"].forEach(function(ev){ document.addEventListener(ev, function(){ LAST = Date.now(); }, {passive:true, capture:true}); });
function tick(){
  if(!ME || document.visibilityState!=="visible" || Date.now()-LAST>120000) return;
  var st = window.FPGuide && window.FPGuide.state ? window.FPGuide.state() : null; if(!st || !st.id) return;
  var t = times(); t[st.id] = (t[st.id]||0) + 15; ls(TIMEKEY, t);
}

/* ---------- public ---------- */
var T = window.FPTrack = {
  live: B.live,
  esc: esc,
  me: function(){ return PROF; },
  async signIn(email, pw){ var u = await B.signIn(email, pw); return T.init(u); },
  async init(u){
    u = u || await B.session(); if(!u) return null;
    ME = u; PROF = await B.profile(u.id) || {id:u.id, email:u.email, full_name:(u.email||"").split("@")[0], role:"trainee"};
    OUTKEY = "fpom-outbox:"+u.id+":"+TAB; TIMEKEY = "fpom-time:"+u.id; OPENKEY = "fpom-open:"+u.id; PRACKEY = "fpom-prac-pending:"+u.id;
    flush(); return PROF;
  },
  async signOut(){ await B.signOut(); ME = PROF = null; },
  setPassword: function(pw){ return B.setPassword(pw); },
  /* the lesson pages call these */
  open: function(id){ if(!ME) return; var o = ls(OPENKEY) || {}; if(o[id]) return; o[id] = 1; ls(OPENKEY, o); queue({lesson_id:id, part:"open", minutes:0}); },
  event: function(id, part, extra){ if(!ME) return; extra = extra || {};
    queue({lesson_id:id, part:part, score:extra.score==null?null:extra.score, total:extra.total==null?null:extra.total, hints:extra.hints==null?null:extra.hints, minutes:minutesFor(id)}); },
  myEvents: function(){ return ME ? B.myEvents(ME.id) : Promise.resolve([]); },
  profiles: function(){ return B.profiles(); },
  events: function(){ return B.events(); },
  /* 5-day program */
  practiceGet: function(){ return ME ? B.practiceGet(ME.id) : Promise.resolve(null); },
  practiceSave: function(row){ if(!ME) return Promise.resolve(); ls(PRACKEY, row); return sendPractice().then(function(){ setStatus(""); }, function(e){ setStatus("Not saved yet. Will retry."); }); },
  practiceAll: function(){ return B.practiceAll(); },
  finalAdd: function(row){ return B.finalAdd(row); },
  finalMine: function(){ return ME ? B.finalMine(ME.id) : Promise.resolve([]); },
  finalAll: function(){ return B.finalAll(); },
  reflGet: function(){ return ME ? B.reflGet(ME.id) : Promise.resolve(null); },
  reflSave: function(row){ return B.reflSave(row); },
  reflAll: function(){ return B.reflAll(); },
  certMine: function(){ return ME ? B.certMine(ME.id) : Promise.resolve(null); },
  certIssue: function(){ return B.certIssue(); },
  certVerify: function(id){ return B.certVerify(id); },
  certsAll: function(){ return B.certsAll(); },
  certSet: function(id, status, reason){ return B.certSet(id, status, reason); },
  /* new pages: sign-in required; sends to the sign-in page and back */
  async page(opts){
    opts = opts || {}; var p = null; try{ p = await T.init(); }catch(e){}
    if(!p){ location.replace("index.html?next="+encodeURIComponent(location.pathname.split("/").pop()+location.search+location.hash)); return null; }
    if(opts.admin && p.role!=="admin"){ location.replace("home.html"); return null; }
    /* send anything still waiting from an earlier page first, so the numbers shown are current (give up waiting after 8 seconds) */
    await Promise.race([flushDone(), new Promise(function(r){ setTimeout(r, 8000); })]);
    setInterval(flush, 30000);
    return p;
  },
  /* {lessonId:{walk:true,check:true,practice:true}} from saved rows */
  progressFrom: function(rows){ var p = {}; (rows||[]).forEach(function(r){ if(r.part==="open") return; (p[r.lesson_id] = p[r.lesson_id]||{})[r.part] = true; }); return p; },
  fmtTime: function(iso){ if(!iso) return ""; try{ return new Intl.DateTimeFormat("en-US", {timeZone:CFG.TIME_ZONE||"Etc/GMT+4", month:"short", day:"numeric", year:"numeric", hour:"numeric", minute:"2-digit"}).format(new Date(iso))+" "+(CFG.TIME_LABEL||"EDT"); }catch(e){ return iso; } },
  /* lesson pages: send to the login page if not signed in, else seed this module's progress and start the page */
  async gate(mod, start){
    var p = null; try{ p = await T.init(); }catch(e){}
    if(!p){ location.replace("index.html?next="+encodeURIComponent(location.pathname.split("/").pop()+location.hash)); return; }
    mod.key = mod.key+":"+p.id;
    try{ var rows = await T.myEvents(), prog = T.progressFrom(rows), cur = ls(mod.key) || {};
      Object.keys(prog).forEach(function(id){ if(id.indexOf(mod.prefix)!==0) return; cur[id] = Object.assign(cur[id]||{}, prog[id]); });
      var o = ls(OPENKEY) || {}; rows.forEach(function(r){ if(r.part==="open") o[r.lesson_id] = 1; }); ls(OPENKEY, o);
      ls(mod.key, cur); }catch(e){ setStatus("Couldn't load saved progress. Your work still saves."); }
    T.bar();
    start();
    setInterval(tick, 15000); setInterval(flush, 30000);
  },
  /* Academy header bar on the lesson pages: same links as every other page */
  bar: function(){
    var host = document.querySelector(".ob-hdr .in"); if(!host || !PROF) return;
    var nm = PROF.full_name || PROF.email || "", ini = nm.split(/[\s@._-]+/).filter(Boolean).slice(0, 2).map(function(w){ return w[0].toUpperCase(); }).join("") || "?";
    var d = document.createElement("nav"); d.className = "fpt-bar"; d.setAttribute("aria-label", "Main");
    d.innerHTML = '<span id="fpt-status" class="fpt-st" role="status"></span><a class="on" href="home.html">Lessons</a><a href="library.html">SOP Library</a><a href="practice.html">Practice</a><a href="progress.html">My progress</a><a href="certificate.html">Certificate</a>'
      + (PROF.role==="admin" ? '<a href="team.html">Team progress</a><a href="certs.html">Certifications</a>' : "")
      + (B.live ? "" : '<span class="fpt-demo">Demo mode</span>') + '<span class="fpt-who" title="'+esc(nm)+'">'+esc(ini)+'</span><button type="button" id="fpt-out">Sign out</button>';
    host.appendChild(d);
    document.getElementById("fpt-out").onclick = async function(){ await T.signOut(); location.href = "index.html"; };
  }
};
document.addEventListener("visibilitychange", function(){ if(document.visibilityState==="hidden") flush(); });
/* links inside the site open by script (some hosts, like the preview frame, hold back plain link clicks); same result on the real site */
document.addEventListener("click", function(ev){
  if(ev.defaultPrevented || ev.button !== 0 || ev.metaKey || ev.ctrlKey || ev.shiftKey || ev.altKey) return;
  var a = ev.target && ev.target.closest ? ev.target.closest("a[href]") : null; if(!a) return;
  var t = a.getAttribute("target"), raw = a.getAttribute("href") || "";
  if((t && t !== "_self") || a.hasAttribute("download") || /^[a-z][a-z0-9+.-]*:/i.test(raw) || raw.indexOf("//") === 0) return;
  var u; try{ u = new URL(a.href, location.href); }catch(e){ return; }
  if(u.origin !== location.origin) return;
  ev.preventDefault();
  if(u.pathname === location.pathname && u.search === location.search){ if(u.hash !== location.hash) location.hash = u.hash; return; }
  location.assign(u.href);
}, false);
})();
