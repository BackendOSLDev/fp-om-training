/* HCP Academy lesson page: the practice copy on the left (../hcp-practice/), the lesson rail on the right.
   Same three parts as the FieldPulse lessons: Walk-through (orange boxes), check questions, Knowledge check (on your own, hints counted).
   Progress is saved through FPTrack (walk, check, practice), like FieldPulse. */
(function(){
"use strict";
var MOD = window.MOD, C = window.HCP_CONTENT, G = window.HCP_GUIDES || {}, IDS = MOD.ids;
var E = function(s){ return String(s == null ? "" : s).replace(/[&<>"]/g, function(c){ return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); };
var $ = function(id){ return document.getElementById(id); };
function load(){ try{ return JSON.parse(localStorage.getItem(MOD.key) || "{}") || {}; }catch(e){ return {}; } }
function save(p){ try{ localStorage.setItem(MOD.key, JSON.stringify(p)); }catch(e){} }
function me(){ var m = window.FPTrack && window.FPTrack.me && window.FPTrack.me(); return m && m.id || "anon"; }
function mark(id, part, extra){ var p = load(); p[id] = p[id] || {}; var first = !p[id][part]; p[id][part] = true; save(p);
  if(first || part === "practice") try{ window.FPTrack.event(id, part, extra || {}); }catch(e){} paint(); }
function score(id){ var p = load()[id] || {}; return (p.walk ? 1 : 0) + (p.check ? 1 : 0) + (p.practice ? 1 : 0); }

/* ---------- state ---------- */
var CUR = null, U = null, FR = null, X = null, TIMER = null, BOX = null;
function L(){ return C[CUR]; }
function guide(){ return G[CUR] || null; }
function fresh(mode){ return { mode: mode || "walk", i: 0, max: 0, hints: 0, hintAt: -1, ans: {}, qDone: false, read: 0, kcRes: null, kcDone: false, started: false }; }

/* ---------- the practice copy ---------- */
function H(){ try{ return FR.contentWindow.HCPX; }catch(e){ return null; } }
function hookFrame(){
  var w = FR.contentWindow, d = w.document; if(!d || d.__hx) return; d.__hx = 1;
  d.addEventListener("click", function(e){ var el = e.target.closest("button,a,[data-go],[data-nav],[role=tab],label,tr,li,input");
    if(!el) return; var t = (el.innerText || el.value || el.getAttribute("aria-label") || "").trim().replace(/\s+/g, " ").slice(0, 80);
    X.log.push(t); var lab = el.getAttribute("aria-label"); if(lab) X.log.push(lab); }, true);
}
function makeX(){ return { log: [], seenR: [], base: null,
  get S(){ var h = H(); return h ? h.state : { customers: [], jobs: [] }; }, get H(){ return H(); },
  get doc(){ return FR.contentDocument; }, get win(){ return FR.contentWindow; },
  route: function(){ var h = H(); if(!h) return ""; return h.view + (h.viewArg ? "/" + h.viewArg : ""); },
  seen: function(re){ return this.seenR.some(function(r){ return re.test(r); }); },
  clicked: function(re){ return this.log.some(function(t){ return re.test(t); }); },
  val: function(sel){ var el = this.doc && this.doc.querySelector(sel); return el ? (el.value || "") : ""; },
  text: function(sel){ var el = this.doc && this.doc.querySelector(sel); return el ? el.innerText || "" : ""; },
  has: function(re){ var b = this.doc && this.doc.body; return !!b && re.test(b.innerText); },
  custPicked: function(re){ var d = this.doc; if(!d || !/^new-/.test(this.route())) return false; if(d.querySelector("[data-cust-search], #fCust")) return false;
    var el = d.querySelector(".nj-left") || d.body; return !re || re.test(el.innerText); } }; }
function findAt(at){
  var d = FR.contentDocument; if(!d || !at) return null;
  var vis = function(el){ if(!el) return false; var r = el.getBoundingClientRect(); return r.width > 0 && r.height > 0; };
  if(typeof at === "string"){ var all = d.querySelectorAll(at); for(var i = 0; i < all.length; i++) if(vis(all[i])) return all[i]; return null; }
  var c = d.querySelectorAll(at.sel || "button,a,[role=tab],h1,h2,h3,h4,h5,h6,span,td,label,b,small,div"); var best = null;
  for(var j = 0; j < c.length; j++){ var t = (c[j].innerText || "").trim(); if(t && at.text.test(t) && vis(c[j]) && (!best || t.length < best.innerText.trim().length)) best = c[j]; }
  return best; }
function showBox(el){
  if(!BOX){ BOX = document.createElement("div"); BOX.className = "hx-box"; BOX.innerHTML = "<span>Click here</span>"; $("hx-app").appendChild(BOX); }
  if(!el){ BOX.hidden = true; return; }
  var r = el.getBoundingClientRect(), f = FR.getBoundingClientRect(), a = $("hx-app").getBoundingClientRect();
  BOX.hidden = false; BOX.style.left = (f.left - a.left + r.left - 3) + "px"; BOX.style.top = (f.top - a.top + r.top - 3) + "px";
  BOX.style.width = (r.width + 6) + "px"; BOX.style.height = (r.height + 6) + "px"; }

/* ---------- step engine ---------- */
function stepDone(s){ try{ return !!s.done(X); }catch(e){ return false; } }
function tick(){
  var h = H(); if(!h) return; hookFrame();
  var r = X.route(); if(X.seenR[X.seenR.length - 1] !== r) X.seenR.push(r);
  var g = guide(); if(!g || !U.started){ showBox(null); return; }
  if(U.mode === "walk" || U.mode === "practice"){
    var moved = false;
    while(U.i < g.steps.length && stepDone(g.steps[U.i])){ U.i++; moved = true; }
    if(U.i > U.max) U.max = U.i;
    if(U.mode === "walk"){ var s = g.steps[U.i]; showBox(s && U.i < g.steps.length ? findAt(s.at) : null); }
    else showBox(U.hintAt === U.i && g.steps[U.i] ? findAt(g.steps[U.i].at) : null);
    if(moved){ if(U.mode === "practice" && U.i >= g.steps.length) finishKc(); render(); }
  } }
function startPractice(mode){
  var h = H(); if(!h){ setTimeout(function(){ startPractice(mode); }, 200); return; }
  h.resetAll(); var g = guide(); if(g && g.setup) g.setup(h);
  X = makeX(); X.base = window.HCP_BASE(h); h.go((g && g.start) || "home"); U.started = true; render(); }

/* ---------- finishing ---------- */
function finishWalk(){ if(!U.qDone && !L().qs.length){ mark(CUR, "walk"); mark(CUR, "check"); } }
function finishKc(){ var g = guide(); var res = g && g.kc ? g.kc(X) : [];
  U.kcRes = res; var ok = res.every(function(r){ return r[0]; });
  if(ok && !U.kcDone){ U.kcDone = true; mark(CUR, "practice", { hints: U.hints }); acadKc("done", CUR, "practice", 0, 0, U.hints); } }

/* ---------- rail ---------- */
/* Pro Power Hour clips play here, in a small player, from the start time to the end time of the matching part.
   The player sits outside the rail so rail updates don't restart it. "YouTube" opens the full session in a new tab. */
function secs(t){ var a = t.split(":"); return (+a[0]) * 60 + (+a[1]); }
function clip(x){ var m = /youtube\.com\/watch\?v=([\w-]{11})&t=(\d+)s/.exec(x[1]), r = /plays ([\d:]+) to ([\d:]+)/.exec(x[2] || ""); return m && r ? { id: m[1], s: +m[2], e: secs(r[2]) } : null; }
function vids(l){ var v = (l.vids || []).map(function(x){ var c = clip(x), meta = E(x[2].replace(/^\s*·\s*/, ""));
    if(c) return '<li><button type="button" class="g-vbtn" data-yt="' + c.id + '" data-s="' + c.s + '" data-e="' + c.e + '" data-t="' + E(x[0]) + '" data-u="' + E(x[1]) + '"><span class="g-play" aria-hidden="true"></span>' + E(x[0]) + '</button> <small>' + meta + ' · <a href="' + E(x[1]) + '" target="_blank" rel="noopener">YouTube</a></small></li>';
    return '<li><a href="' + E(x[1]) + '" target="_blank" rel="noopener"><span class="g-play" aria-hidden="true"></span>' + E(x[0]) + "</a> <small>" + meta + "</small></li>"; }).join("");
  var a = (l.help || []).map(function(x){ return '<li><a href="' + E(x[1]) + '" target="_blank" rel="noopener">' + E(x[0]) + "</a> <small>Help article</small></li>"; }).join("");
  var n = l.vnote ? l.vnote : (l.vids && l.vids.length ? "" : "No video shows this step yet. Use the help articles.");
  return '<ul class="g-vids sm">' + v + (n ? '<li class="g-vnote"><small>' + E(n) + "</small></li>" : "") + a + "</ul>"; }
function sit(l, open){ return '<details class="g-sitd"' + (open ? " open" : "") + '><summary>What\'s going on</summary><div class="g-call"><p>' + l.goal + '</p><p class="g-whyl"><b>Why it matters:</b> ' + l.why + "</p>" + vids(l) + "</div></details>"; }
function questions(l){
  var all = true, h = l.qs.map(function(q, qi){ var a = U.ans[qi]; if(a !== q[2]) all = false;
    return '<div class="g-q"><p class="g-qq">' + (qi + 1) + ". " + E(q[0]) + "</p>" + q[1].map(function(o, oi){ var cls = a === oi ? (oi === q[2] ? " ok" : " bad") : "";
      return '<button class="g-opt' + cls + '" data-a="ans" data-q="' + qi + '" data-o="' + oi + '"' + (a === q[2] ? " disabled" : "") + ">" + E(o) + "</button>"; }).join("") +
      (a === q[2] ? '<p class="g-ok">Right. ' + E(q[3]) + "</p>" : a != null ? '<p class="g-bad">Not quite. Try again.</p>' : "") + "</div>"; }).join("");
  if(all && !U.qDone){ U.qDone = true; mark(CUR, "walk"); mark(CUR, "check"); }
  return '<div class="g-qs"><p class="g-ey">Check questions</p>' + h + (all ? '<p class="g-ok"><b>Walk-through and check done.</b> Now the Knowledge check, on your own.</p><button class="g-btn pri" data-a="mode" data-v="practice">Start the Knowledge check</button>' : "") + "</div>"; }
function railWalk(l){
  var g = guide(), out = sit(l, true);
  if(g){ var n = g.steps.length;
    if(!U.started) return out + '<p class="g-why">The orange box shows where to click in the practice copy. Each step moves on by itself once you do it.</p><button class="g-btn pri" data-a="go">Start the walk-through</button>';
    if(U.i < n){ var s = g.steps[U.i]; return out + '<div class="g-prog"><span>Step ' + (U.i + 1) + " of " + n + '</span></div><div class="g-bar"><i style="width:' + Math.round(100 * U.i / n) + '%"></i></div><div class="g-cur"><b class="g-st">' + E(s.t) + '</b><p class="g-do">' + s.do + '</p><p class="g-wait"><span class="g-dot"></span>Click the orange box.</p></div>'; }
    return out + '<div class="g-prog"><span>All ' + n + ' steps done</span></div><div class="g-bar"><i style="width:100%"></i></div>' + questions(l); }
  /* no walk-through in the practice copy yet: read the steps one by one */
  var st = l.steps; out += '<p class="g-why">' + (l.pcls === "p-no" ? "This screen isn't in the practice copy yet, so read the steps." : "Read the steps, then try them in the practice copy on the left.") + "</p>";
  if(U.read < st.length) return out + '<div class="g-prog"><span>Step ' + (U.read + 1) + " of " + st.length + '</span></div><div class="g-bar"><i style="width:' + Math.round(100 * U.read / st.length) + '%"></i></div><div class="g-cur"><p class="g-do">' + st[U.read] + '</p></div><button class="g-btn" data-a="read-next">' + (U.read === st.length - 1 ? "Done reading" : "Next step") + "</button>";
  return out + questions(l); }
function railRead(l){
  return sit(l, false) + '<p class="g-ey">Steps</p><ol class="g-steps">' + l.steps.map(function(s){ return "<li>" + s + "</li>"; }).join("") + "</ol>" +
    (l.watch.length ? '<p class="g-ey">Watch out</p><ul class="g-watch">' + l.watch.map(function(w){ return "<li>" + w + "</li>"; }).join("") + "</ul>" : "") +
    (l.verify.length ? '<div class="g-verify"><b>Check on a live account</b><ul>' + l.verify.map(function(w){ return "<li>" + w + "</li>"; }).join("") + "</ul></div>" : "") +
    '<p class="g-ey">Plan</p><p class="g-plan">' + E(l.badge) + "</p>"; }
function railKc(l){
  var g = guide(), out = sit(l, false) + '<div class="g-task"><small>Your turn</small><p>' + E(l.task) + "</p></div>";
  if(!g){ var done = (load()[CUR] || {}).practice;
    return out + '<p class="g-why">' + E(l.pstat) + ". There's no hands-on check for this lesson yet. Talk it through with your trainer at the start-of-day check, then mark it done.</p>" +
      (done ? '<p class="g-ok"><b>Done.</b></p>' : '<button class="g-btn pri" data-a="kc-talk">I talked it through with my trainer</button>'); }
  if(!U.started) return out + '<p class="g-why">Knowledge check: no orange boxes this time. The practice copy starts from fresh sample data. Stuck? Click Hint. Every hint is saved for your trainer.</p><button class="g-btn pri" data-a="go">Start the Knowledge check</button>';
  var n = g.steps.length, done2 = Math.min(U.i, n);
  out += '<p class="g-why">No orange boxes this time. Stuck? Click Hint. Every hint and every start over is saved for your trainer.</p><div class="g-prog"><span>' + done2 + " of " + n + ' steps done</span></div><div class="g-bar"><i style="width:' + Math.round(100 * done2 / n) + '%"></i></div>';
  if(U.hintAt === U.i && g.steps[U.i]) out += '<div class="g-cur"><b class="g-st">Hint: ' + E(g.steps[U.i].t) + '</b><p class="g-do">' + g.steps[U.i].do + "</p></div>";
  if(U.i >= n){ var res = U.kcRes || [];
    out += '<ul class="g-res">' + res.map(function(r){ return '<li class="' + (r[0] ? "ok" : "bad") + '">' + (r[0] ? "&#10003; " : "&#10007; ") + E(r[1]) + "</li>"; }).join("") + "</ul>";
    out += U.kcDone ? '<p class="g-ok"><b>Knowledge check done' + (U.hints ? " with " + U.hints + " hint" + (U.hints > 1 ? "s" : "") : " on your own") + ".</b></p>" + nextBtn() : '<p class="g-bad">Not there yet. Fix the red items, then click Check again.</p><button class="g-btn" data-a="kc-check">Check again</button>'; }
  return out; }
function nextBtn(){ var nx = window.ACAD_NEXT ? window.ACAD_NEXT(CUR) : null; return nx ? '<button class="g-btn pri" data-a="next">Next lesson</button>' : ""; }
function render(){
  var l = L(), n = IDS.indexOf(CUR) + 1;
  var body = U.mode === "walk" ? railWalk(l) : U.mode === "read" ? railRead(l) : railKc(l);
  var foot = U.mode === "practice" && guide() && U.started && U.i < guide().steps.length ? '<button class="g-btn" data-a="hint">Hint</button><span class="g-sp"></span><button class="g-lk" data-a="restart">Start over</button>'
    : U.mode === "walk" && guide() && U.started ? '<span class="g-sp"></span><button class="g-lk" data-a="restart">Start over</button>' : "";
  $("hx-rail").innerHTML = '<div class="g-head"><div class="g-ey">' + E(window.ACAD_MODNAME[MOD.mod]) + " · Lesson " + n + " of " + IDS.length + "</div><h2>" + E(l.title) + '</h2><p class="g-badge ' + E(l.bcls) + '">' + E(l.badge) + "</p>" +
    '<div class="g-mode" role="group" aria-label="Lesson mode">' + [["walk", "Walk-through"], ["read", "Steps"], ["practice", "Knowledge check"]].map(function(m){ return '<button class="' + (U.mode === m[0] ? "on" : "") + '" data-a="mode" data-v="' + m[0] + '" aria-pressed="' + (U.mode === m[0]) + '">' + m[1] + "</button>"; }).join("") + "</div></div>" +
    '<div class="g-body">' + body + "</div>" + (foot ? '<div class="g-foot">' + foot + "</div>" : ""); }

/* ---------- page shell: lesson menu and progress (same as FieldPulse) ---------- */
function paint(){
  var done = IDS.filter(function(id){ return score(id) === 3; }).length;
  $("ovt").textContent = done + " of " + IDS.length + " lessons done"; $("ovb").style.width = Math.round(100 * done / IDS.length) + "%";
  $("obmenu").innerHTML = '<div class="ob-mg"><b>' + E(window.ACAD_MODNAME[MOD.mod]) + "</b>" + IDS.map(function(id, i){ var s = score(id);
    return '<button data-id="' + id + '" class="' + (id === CUR ? "cur " : "") + (s === 3 ? "dn" : "") + '">' + (i + 1) + ". " + E(C[id].title) + '<span class="tk">' + (s === 3 ? "&#10003; Done" : s + "/3") + "</span></button>"; }).join("") + "</div>"; }
function leaving(){ var g = guide(); if(U && U.mode === "practice" && g && U.started && !U.kcDone) acadKc("left", CUR, "practice", Math.min(U.i, g.steps.length), g.steps.length, U.hints); }
function show(id){ if(IDS.indexOf(id) < 0) id = IDS[0]; if(typeof closeVP === "function") closeVP(); if(CUR) leaving(); CUR = id; U = fresh("walk"); X = makeX();
  try{ window.FPTrack.open(id); }catch(e){} $("crl").textContent = C[id].title; paint(); render(); showBox(null);
  try{ if(location.hash.slice(1) !== id) history.replaceState(null, "", "#" + id); }catch(e){} window.scrollTo(0, 0); }
document.addEventListener("click", function(e){
  var b = e.target.closest("[data-a]"); if(!b || !$("hx-rail").contains(b)) return; var a = b.dataset.a;
  if(a === "mode"){ leaving(); U = fresh(b.dataset.v); X = makeX(); showBox(null); if(b.dataset.v === "read") render(); else render(); }
  else if(a === "go"){ startPractice(U.mode); }
  else if(a === "restart"){ if(U.mode === "practice") acadKc("left", CUR, "practice", U.i, guide().steps.length, U.hints); var m = U.mode; U = fresh(m); startPractice(m); }
  else if(a === "hint"){ if(U.hintAt !== U.i){ U.hintAt = U.i; U.hints++; acadKc("hint", CUR, "practice"); } render(); }
  else if(a === "kc-check"){ finishKc(); render(); }
  else if(a === "kc-talk"){ mark(CUR, "practice", { hints: 0, talked: true }); render(); }
  else if(a === "read-next"){ U.read++; render(); }
  else if(a === "ans"){ U.ans[+b.dataset.q] = +b.dataset.o; render(); }
  else if(a === "next"){ var nx = window.ACAD_NEXT(CUR); if(nx){ if(IDS.indexOf(nx) >= 0) show(nx); else window.ACAD_GO(nx); } }
});
window.addEventListener("beforeunload", leaving);
var mb = $("obmenu"), btn = $("oball");
btn.onclick = function(){ mb.hidden = !mb.hidden; btn.setAttribute("aria-expanded", String(!mb.hidden)); };
mb.onclick = function(e){ var b = e.target.closest("button[data-id]"); if(!b) return; mb.hidden = true; show(b.dataset.id); };
window.addEventListener("hashchange", function(){ var h = location.hash.slice(1); if(h && h !== CUR) show(h); });
FR = $("hx-frame"); FR.addEventListener("load", function(){ try{ FR.contentDocument.__hx = 0; }catch(e){} });
X = makeX(); TIMER = setInterval(tick, 250);
window.addEventListener("resize", function(){ showBox(null); });
/* If the video can't load (for example the claude.ai preview blocks outside players), after 6 seconds the black box
   turns into a clear "Watch on YouTube from A" button, so nobody sees an empty box. The YouTube player answers our
   "listening" message once it has loaded; no answer means it didn't load. */
var VPT = null, VPI = null;
function mmss(n){ n = +n; return Math.floor(n / 60) + ":" + String(n % 60).padStart(2, "0"); }
function closeVP(){ clearTimeout(VPT); clearInterval(VPI); var p = document.getElementById("hx-vp"); if(p) p.remove(); }
function vpFallback(p, d){ clearInterval(VPI); var f = p.querySelector(".vp-f"); if(!f) return;
  f.outerHTML = '<div class="vp-fb"><p>The video can\'t play here.</p><a class="vp-yt" href="' + E(d.u) + '" target="_blank" rel="noopener">Watch on YouTube from ' + mmss(d.s) + '</a><p class="vp-sm">Stop it at ' + mmss(d.e) + ', where this part ends.</p></div>';
  var n = p.querySelector(".vp-n"); if(n) n.remove(); }
function openVP(b){ closeVP(); var d = b.dataset, p = document.createElement("div"); p.id = "hx-vp"; p.setAttribute("role", "dialog"); p.setAttribute("aria-label", "Video");
  var org = location.origin && location.origin !== "null" ? "&origin=" + encodeURIComponent(location.origin) : "";
  var src = "https://www.youtube-nocookie.com/embed/" + d.yt + "?start=" + d.s + "&end=" + d.e + "&autoplay=1&rel=0&modestbranding=1&enablejsapi=1" + org;
  p.innerHTML = '<div class="vp-h"><b>' + E(d.t) + '</b><button type="button" class="vp-x" aria-label="Close video">&times;</button></div>' +
    '<div class="vp-f"><iframe src="' + src + '" title="' + E(d.t) + '" allow="autoplay; encrypted-media; picture-in-picture; fullscreen" allowfullscreen referrerpolicy="strict-origin-when-cross-origin"></iframe></div>' +
    '<p class="vp-n">Plays ' + mmss(d.s) + " to " + mmss(d.e) + ', then stops. Not playing? <a href="' + E(d.u) + '" target="_blank" rel="noopener">Watch it on YouTube</a>.</p>';
  document.body.appendChild(p); p.querySelector(".vp-x").focus();
  var fr = p.querySelector("iframe"); p.__ok = false;
  VPI = setInterval(function(){ try{ fr.contentWindow.postMessage(JSON.stringify({ event: "listening", id: 1 }), "*"); }catch(e){} }, 500);
  VPT = setTimeout(function(){ if(!p.__ok && document.body.contains(p)) vpFallback(p, d); }, 6000); }
window.addEventListener("message", function(e){ if(!/youtube(-nocookie)?\.com$/.test(String(e.origin))) return; var p = document.getElementById("hx-vp"); if(!p) return;
  var f = p.querySelector("iframe"); if(f && e.source === f.contentWindow){ p.__ok = true; clearInterval(VPI); } });
document.addEventListener("click", function(e){ var b = e.target.closest(".g-vbtn"); if(b){ e.preventDefault(); openVP(b); return; } if(e.target.closest(".vp-x")) closeVP(); });
document.addEventListener("keydown", function(e){ if(e.key === "Escape") closeVP(); });
show((location.hash || "").slice(1) || IDS[0]);
window.HXLesson = { state: function(){ return { id: CUR, U: U, X: X }; } };
})();
