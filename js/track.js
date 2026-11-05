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
    async profile(uid){ return chk(await sb.from("profiles").select("id,email,full_name,role").eq("id", uid).maybeSingle()); },
    async insert(row){ chk(await sb.from("lesson_events").insert(row)); },
    async myEvents(uid){ return all(function(){ return sb.from("lesson_events").select("lesson_id,part,score,total,hints,minutes,created_at").eq("user_id", uid).order("id"); }); },
    async profiles(){ return all(function(){ return sb.from("profiles").select("id,email,full_name,role,created_at").order("full_name"); }); },
    async events(){ return all(function(){ return sb.from("lesson_events").select("user_id,lesson_id,part,score,total,hints,minutes,created_at").order("id"); }); }
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
    async profile(uid){ return db().users[uid] || null; },
    async insert(row){ await wait(); var d = db(), me = ls("fpdemo:me"); if(!me) throw new Error("Not signed in");
      d.events.push(Object.assign({user_id:me, created_at:new Date().toISOString()}, row)); put(d); },
    async myEvents(uid){ return db().events.filter(function(e){ return e.user_id===uid; }); },
    async profiles(){ var d = db(), me = ls("fpdemo:me"); if(!me || d.users[me].role!=="admin") return me ? [d.users[me]] : []; return Object.keys(d.users).map(function(k){ return d.users[k]; }); },
    async events(){ var d = db(), me = ls("fpdemo:me"); if(!me) return []; return d.users[me].role==="admin" ? d.events : d.events.filter(function(e){ return e.user_id===me; }); }
  };
}
var B = LIVE && window.supabase ? supa() : demo();

/* ---------- state ---------- */
var ME = null, PROF = null, OUTKEY = null, TIMEKEY = null, OPENKEY = null, FLUSHING = false;
function outbox(v){ return ls(OUTKEY, v); }
function times(){ return ls(TIMEKEY) || {}; }
function minutesFor(id){ var s = times()[id] || 0; return Math.round(s/6)/10; }
async function flush(){
  if(!ME || FLUSHING) return; FLUSHING = true;
  try{ var q = outbox() || [];
    while(q.length){ await B.insert(q[0]); q.shift(); outbox(q.length ? q : null); }
    setStatus(""); }
  catch(e){ setStatus("Not saved yet. Will retry."); }
  finally{ FLUSHING = false; }
}
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
    OUTKEY = "fpom-outbox:"+u.id; TIMEKEY = "fpom-time:"+u.id; OPENKEY = "fpom-open:"+u.id;
    flush(); return PROF;
  },
  async signOut(){ await B.signOut(); ME = PROF = null; },
  /* the lesson pages call these */
  open: function(id){ if(!ME) return; var o = ls(OPENKEY) || {}; if(o[id]) return; o[id] = 1; ls(OPENKEY, o); queue({lesson_id:id, part:"open", minutes:0}); },
  event: function(id, part, extra){ if(!ME) return; extra = extra || {};
    queue({lesson_id:id, part:part, score:extra.score==null?null:extra.score, total:extra.total==null?null:extra.total, hints:extra.hints==null?null:extra.hints, minutes:minutesFor(id)}); },
  myEvents: function(){ return ME ? B.myEvents(ME.id) : Promise.resolve([]); },
  profiles: function(){ return B.profiles(); },
  events: function(){ return B.events(); },
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
  /* small signed-in bar in the page header */
  bar: function(){
    var host = document.querySelector(".ob-hdr .in"); if(!host || !PROF) return;
    var d = document.createElement("div"); d.className = "fpt-bar";
    d.innerHTML = (B.live?"":'<span class="fpt-demo">Demo mode</span>')+'<span id="fpt-status" class="fpt-st" role="status"></span><a href="index.html">All modules</a>'+(PROF.role==="admin"?'<a href="admin.html">Progress</a>':"")+'<span class="fpt-who">'+esc(PROF.full_name||PROF.email)+'</span><button type="button" id="fpt-out">Sign out</button>';
    host.appendChild(d);
    document.getElementById("fpt-out").onclick = async function(){ await T.signOut(); location.href = "index.html"; };
  }
};
document.addEventListener("visibilitychange", function(){ if(document.visibilityState==="hidden") flush(); });
})();
