/* HCP Academy: Practice tasks for Days 1 to 4 (plus Owner reporting as extra), done in the HCP practice copy on the left.
   A task done with no hint counts as on your own ("s"); with a hint it counts as done with a hint ("h"). Saved to the practice row like FieldPulse. */
(function(){
"use strict";
var C = window.HCP_CONTENT, G = window.HCP_GUIDES || {}, PT = window.ACAD_PTASKS || {}, A = window.ACAD;
var DAYS = ["d1", "d2", "d3", "d4", "x"], NT = ["d1", "d2", "d3", "d4"].reduce(function(a, d){ return a + (PT[d] || []).length; }, 0);
var E = function(s){ return String(s == null ? "" : s).replace(/[&<>"]/g, function(c){ return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); };
var $ = function(id){ return document.getElementById(id); };
var ROW = { data: { tasks: {}, slips: {} } }, DAY = "d1", CUR = null, U = null, X = null, FR = $("hx-frame");
function H(){ try{ return FR.contentWindow.HCPX; }catch(e){ return null; } }
function makeX(){ return { log: [], seenR: [], base: null,
  get S(){ var h = H(); return h ? h.state : { customers: [], jobs: [] }; }, get H(){ return H(); }, get doc(){ return FR.contentDocument; }, get win(){ return FR.contentWindow; },
  route: function(){ var h = H(); return h ? h.view + (h.viewArg ? "/" + h.viewArg : "") : ""; },
  seen: function(re){ return this.seenR.some(function(r){ return re.test(r); }); }, clicked: function(re){ return this.log.some(function(t){ return re.test(t); }); },
  val: function(sel){ var el = this.doc && this.doc.querySelector(sel); return el ? (el.value || "") : ""; }, text: function(sel){ var el = this.doc && this.doc.querySelector(sel); return el ? el.innerText || "" : ""; },
  has: function(re){ var b = this.doc && this.doc.body; return !!b && re.test(b.innerText); },
  custPicked: function(re){ var d = this.doc; if(!d || !/^new-/.test(this.route())) return false; if(d.querySelector("[data-cust-search], #fCust")) return false; var el = d.querySelector(".nj-left") || d.body; return !re || re.test(el.innerText); } }; }
function hook(){ var d = FR.contentDocument; if(!d || d.__hx) return; d.__hx = 1;
  d.addEventListener("click", function(e){ var el = e.target.closest("button,a,[data-go],[data-nav],[role=tab],label,tr,li,input"); if(!el) return;
    X.log.push((el.innerText || el.value || el.getAttribute("aria-label") || "").trim().replace(/\s+/g, " ").slice(0, 80)); var lab = el.getAttribute("aria-label"); if(lab) X.log.push(lab); }, true); }
setInterval(function(){ if(!H() || !X) return; hook(); var r = X.route(); if(X.seenR[X.seenR.length - 1] !== r) X.seenR.push(r);
  var g = G[CUR]; if(U && U.started && g && !U.res){ var i = 0; while(i < g.steps.length){ try{ if(!g.steps[i].done(X)) break; }catch(e){ break; } i++; } U.i = i; } }, 300);
function counts(){ var t = ROW.data.tasks || {}, ids = ["d1", "d2", "d3", "d4"].reduce(function(a, d){ return a.concat(PT[d] || []); }, []);
  var done = ids.filter(function(id){ return t[id] === "s" || t[id] === "h"; }).length, own = ids.filter(function(id){ return t[id] === "s"; }).length; return { done: done, own: own }; }
function persist(){ var c = counts(); ROW.done = c.done; ROW.own = c.own; ROW.serious = 0; ROW.result = A.pracResult(ROW);
  window.FPTrack.practiceSave({ done: ROW.done, own: ROW.own, serious: 0, result: ROW.result, data: ROW.data }); }
function status(id){ var v = (ROW.data.tasks || {})[id]; return v === "s" ? ["Done on your own", "ok"] : v === "h" ? ["Done with a hint", "warn"] : ["Not done", ""]; }
function render(){
  var c = counts(), list = PT[DAY] || [];
  $("pt-days").innerHTML = DAYS.map(function(d){ var ids = PT[d] || [], n = ids.filter(function(id){ return status(id)[1]; }).length;
    return '<button class="' + (d === DAY ? "on" : "") + '" data-day="' + d + '">' + (d === "x" ? "Extra" : "Day " + d.slice(1)) + " <small>" + n + "/" + ids.length + "</small></button>"; }).join("");
  $("pt-sum").textContent = "Result: " + A.pracResult(Object.assign({}, ROW, c)) + " · " + c.done + " of " + NT + " tasks (" + c.own + " on your own)";
  var body = '<p class="g-ey">' + (DAY === "x" ? "Owner reporting (extra)" : "Day " + DAY.slice(1) + " · " + E((A.DAYS.filter(function(d){ return d.id === DAY; })[0] || {}).name)) + '</p><ol class="pt-list">' +
    list.map(function(id){ var s = status(id); return '<li><button class="pt-item' + (id === CUR ? " cur" : "") + '" data-task="' + id + '"><span>' + E(C[id].title) + '</span><small class="' + s[1] + '">' + s[0] + "</small></button></li>"; }).join("") + "</ol>";
  if(CUR){ var l = C[CUR], g = G[CUR];
    body += '<div class="g-task"><small>Task</small><p>' + E(l.task) + "</p></div>";
    if(!g) body += '<p class="g-why">' + E(l.pstat) + ". Check my work isn't wired for this task yet. Do it in the practice copy, then mark it done.</p>" + (status(CUR)[1] ? "" : '<button class="g-btn pri" data-a="self">Done on my own</button>');
    else if(!U.started) body += '<p class="g-why">The practice copy starts from fresh sample data. No orange boxes. Hint shows the next step and counts as a hint.</p><button class="g-btn pri" data-a="start">Start the task</button>';
    else { if(U.hint >= 0 && g.steps[U.hint]) body += '<div class="g-cur"><b class="g-st">Hint: ' + E(g.steps[U.hint].t) + '</b><p class="g-do">' + g.steps[U.hint].do + "</p></div>";
      if(U.res) body += '<ul class="g-res">' + U.res.map(function(r){ return '<li class="' + (r[0] ? "ok" : "bad") + '">' + (r[0] ? "&#10003; " : "&#10007; ") + E(r[1]) + "</li>"; }).join("") + "</ul>" +
        (U.res.every(function(r){ return r[0]; }) ? '<p class="g-ok"><b>Task done' + (U.hints ? " with a hint" : " on your own") + ".</b></p>" : '<p class="g-bad">Not there yet. Fix the red items, then check again.</p>');
      body += '<div class="g-foot"><button class="g-btn" data-a="hint">Hint</button><button class="g-btn pri" data-a="check">Check my work</button><span class="g-sp"></span><button class="g-lk" data-a="start">Start over</button></div>'; } }
  $("hx-rail").innerHTML = '<div class="g-head"><div class="g-ey">Practice tasks</div><h2>Housecall Pro practice</h2><div class="g-mode pt-days" id="pt-days2"></div></div><div class="g-body">' + body + "</div>";
  $("pt-days2").innerHTML = $("pt-days").innerHTML; }
function start(){ var h = H(); if(!h){ setTimeout(start, 200); return; } h.resetAll(); var g = G[CUR]; if(g && g.setup) g.setup(h); X = makeX(); X.base = window.HCP_BASE(h); h.go((g && g.start) || "home"); U = { started: true, hint: -1, hints: 0, res: null, i: 0 }; render(); }
document.addEventListener("click", function(e){ var b = e.target.closest("[data-day],[data-task],[data-a]"); if(!b || !$("hx-rail").contains(b)) return;
  if(b.dataset.day){ DAY = b.dataset.day; CUR = null; render(); return; }
  if(b.dataset.task){ CUR = b.dataset.task; U = { started: false, hint: -1, hints: 0, res: null, i: 0 }; render(); return; }
  var a = b.dataset.a, g = G[CUR];
  if(a === "start") start();
  else if(a === "hint"){ U.hint = Math.min(U.i, g.steps.length - 1); U.hints++; render(); }
  else if(a === "check"){ U.res = g.kc ? g.kc(X) : []; if(U.res.every(function(r){ return r[0]; })){ var prev = ROW.data.tasks[CUR]; ROW.data.tasks[CUR] = U.hints ? (prev === "s" ? "s" : "h") : "s"; persist(); } render(); }
  else if(a === "self"){ ROW.data.tasks[CUR] = "s"; persist(); render(); } });
var h0 = document.createElement("div"); h0.id = "pt-days"; h0.hidden = true; document.body.appendChild(h0); var s0 = document.createElement("span"); s0.id = "pt-sum"; $("ovt").replaceWith(s0);
window.FPTrack.practiceGet().then(function(r){ if(r){ ROW = r; ROW.data = ROW.data || {}; ROW.data.tasks = ROW.data.tasks || {}; ROW.data.slips = ROW.data.slips || {}; } X = makeX(); render(); });
})();
