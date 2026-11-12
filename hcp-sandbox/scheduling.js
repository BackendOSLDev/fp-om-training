// Scheduling module: Schedule calendar, unscheduled jobs, the "Schedule a time" window.
// Screens, labels and dropdown options are copied from a live Housecall Pro account.
// One behaviour couldn't be checked without changing live data, so it's our best guess:
// dropping an unscheduled job opens the window with the time filled in.
window.HCP_MODULES = window.HCP_MODULES || [];
window.HCP_MODULES.push(function (HCP) {
  const { svg, esc, toast, notBuilt } = HCP;
  const D = HCP.data;
  const PX = 56; // height of one hour
  const DAY_W = 1400; // the dispatch board's width for one day, 6:00am to 11:30pm
  const PER_MIN = 80 / 60; // dispatch board pixels per minute
  const DAY_FROM = 360;
  const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  const DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

  const pad = (n) => String(n).padStart(2, "0");
  const ymd = (d) => d.getFullYear() + "-" + pad(d.getMonth() + 1) + "-" + pad(d.getDate());
  const parse = (s) => { const [y, m, d] = s.split("-").map(Number); return new Date(y, m - 1, d); };
  const addDays = (s, n) => { const d = parse(s); d.setDate(d.getDate() + n); return ymd(d); };
  const today = () => ymd(new Date());
  const clock = (m) => { const h = Math.floor(m / 60) % 24; return { h: h % 12 || 12, mm: pad(m % 60), ap: h < 12 ? "am" : "pm" }; };
  const time = (m) => { const c = clock(m); return c.h + ":" + c.mm + c.ap; };
  const timeUp = (m) => { const c = clock(m); return c.h + ":" + c.mm + " " + c.ap.toUpperCase(); };
  const range = (s, e) => { const c = clock(s); return c.h + ":" + c.mm + "-" + time(e); };
  const money = (n) => "$" + Number(n || 0).toFixed(2);
  const short = (s) => MONTHS[parse(s).getMonth()].slice(0, 3);
  const $ = (id) => document.getElementById(id);

  const jobs = () => HCP.state.jobs;
  const jobById = (id) => jobs().find((j) => String(j.id) === String(id));
  const custOf = (j) => HCP.state.customers.find((c) => c.id === j.customerId);
  const addrOf = (j) => { const c = custOf(j); return c && c.addresses.find((a) => a.id === j.addressId); };
  const member = (id) => D.team.find((e) => e.id === id);
  const members = (ids) => (ids || []).map(member).filter(Boolean);
  const total = (j) => j.services.concat(j.materials).reduce((n, r) => n + Number(r.qty || 0) * Number(r.price || 0), 0);
  const title = (j) => (j.services[0] && j.services[0].name) || j.notes || "";
  const avatar = (e) => '<span class="mini-av" style="background:' + e.color + '">' + esc(e.initials) + "</span>";

  const freshUi = () => ({ anchor: today(), month: today().slice(0, 7), view: "Week", panel: window.innerWidth > 760 ? "calendar" : null, filter: "", unsFilter: "", off: {}, teamOpen: true, menuFor: "", win: null, scroll: 0, dspLeft: 0, dspTop: 0, slot: null });
  const ui = freshUi();
  // Set while the New Call form borrows the dispatch board to pick a time.
  let pick = null;

  function dayList(anchor, view) {
    if (view === "Day") return [anchor];
    const sunday = addDays(anchor, -parse(anchor).getDay());
    const from = view === "Monday-Friday" ? 1 : 0;
    const count = view === "Monday-Friday" ? 5 : 7;
    return Array.from({ length: count }, (_, i) => addDays(sunday, from + i));
  }
  function rangeLabel(days) {
    const a = parse(days[0]);
    const b = parse(days[days.length - 1]);
    if (days.length === 1) return DAYS[a.getDay()] + ", " + MONTHS[a.getMonth()] + " " + a.getDate() + ", " + a.getFullYear();
    if (a.getMonth() === b.getMonth()) return MONTHS[a.getMonth()] + " " + pad(a.getDate()) + "-" + pad(b.getDate()) + ", " + a.getFullYear();
    return short(days[0]) + " " + pad(a.getDate()) + " - " + short(days[days.length - 1]) + " " + pad(b.getDate()) + ", " + b.getFullYear();
  }

  function shown(j) {
    const team = j.appt.team;
    const on = team.length ? team.some((id) => !ui.off[id]) : !ui.off.none;
    if (!on) return false;
    const q = ui.filter.trim().toLowerCase();
    const c = custOf(j);
    return !q || [c ? c.display : ""].concat(j.tags || []).join(" ").toLowerCase().includes(q);
  }

  // Overlapping appointments share the width of the day, side by side.
  function placeEvents(list) {
    const sorted = list.slice().sort((a, b) => a.start - b.start || b.end - a.end);
    const out = [];
    let group = [];
    let groupEnd = -1;
    const flush = () => {
      const cols = [];
      group.forEach((e) => {
        let c = cols.findIndex((end) => end <= e.start);
        if (c < 0) { c = cols.length; cols.push(0); }
        cols[c] = e.end;
        e.col = c;
      });
      group.forEach((e) => { e.cols = cols.length; out.push(e); });
      group = [];
    };
    sorted.forEach((e) => {
      if (group.length && e.start >= groupEnd) { flush(); groupEnd = -1; }
      group.push(e);
      groupEnd = Math.max(groupEnd, e.end);
    });
    if (group.length) flush();
    return out;
  }

  function eventHtml(e, from, inWindow) {
    const j = e.job;
    const c = custOf(j);
    const team = members(e.team);
    const cls = "ev" + (e.cur ? " cur" : inWindow || j.status === "Completed" ? " past" : "");
    const color = team[0] ? team[0].color : "#757575";
    const place = "top:" + (e.start - from) / 60 * PX + "px;height:" + Math.max(24, (e.end - e.start) / 60 * PX) + "px;left:calc((100% - 3px) * " + e.col / e.cols + ");width:calc((100% - 3px) / " + e.cols + ");--c:" + color;
    return '<button class="' + cls + '" data-ev="' + j.id + '"' + (inWindow ? "" : ' data-go="job/' + j.id + '"') + ' style="' + place + '">' +
      '<span class="ev-name"><i>' + svg("wrench") + "</i>" + esc(c ? c.display : "") + "</span>" +
      '<span class="ev-team">' + team.map(avatar).join("") + "</span>" +
      '<span class="ev-time"><i>' + svg("truck") + "</i>" + range(e.start, e.end) + "</span></button>";
  }

  function suggestionBlock(r, i, from, w) {
    const e = member(r.emp);
    return '<button class="ev sug-ev" data-w-pick="' + i + '" style="top:' + (r.start - from) / 60 * PX + "px;height:" + w.duration / 60 * PX + 'px;left:calc(50% + 2px);width:calc(50% - 5px)"><span class="ev-time">' + timeUp(r.start) + " - " + timeUp(r.start + w.duration) + " EST</span>" + avatar(e) + "</button>";
  }

  function calendar(days, inWindow) {
    const w = inWindow ? ui.win : null;
    const entry = (j, a, cur) => ({ job: j, date: a.date, start: a.start, end: a.end, anytime: a.anytime, team: a.team, cur });
    const items = jobs().filter((j) => j.appt && days.includes(j.appt.date) && (w ? j.id !== w.jobId : shown(j))).map((j) => entry(j, j.appt, false));
    if (w && days.includes(w.date)) items.push(entry(jobById(w.jobId), w, true));
    const timed = items.filter((e) => !e.anytime);
    const from = Math.min.apply(null, [390].concat(timed.map((e) => Math.floor(e.start / 60) * 60)));
    const to = Math.max.apply(null, [1410].concat(timed.map((e) => Math.ceil(e.end / 60) * 60)));
    const hours = [];
    for (let m = Math.ceil(from / 60) * 60; m < to; m += 60) hours.push(m);
    const suggested = w && w.tab === "Find" && w.results ? w.results : [];
    const now = new Date();
    const nowM = now.getHours() * 60 + now.getMinutes();
    const cols = "grid-template-columns:var(--gut) repeat(" + days.length + ",minmax(0,1fr))";
    const anytime = items.filter((e) => e.anytime);
    return '<div class="cal-inner" style="--days:' + days.length + '"><div class="cal-head" style="' + cols + '"><div></div>' +
      days.map((d) => { const dt = parse(d); return '<div class="dh"><small>' + DAYS[dt.getDay()].slice(0, 3) + '</small><b class="' + (d === today() ? "today" : "") + '">' + pad(dt.getDate()) + "</b></div>"; }).join("") + "</div>" +
      ('<div class="cal-any" style="' + cols + '"><div class="tz">GMT-05</div>' + days.map((d) => "<div>" + anytime.filter((e) => e.date === d).map((e) => { const c = custOf(e.job); return '<button class="any' + (e.cur ? " cur" : "") + '" data-ev="' + e.job.id + '"' + (inWindow ? "" : ' data-go="job/' + e.job.id + '"') + ">" + esc(c ? c.display : "") + "</button>"; }).join("") + "</div>").join("") + "</div>") +
      '<div class="cal-body"><div class="cal-grid" style="' + cols + ";height:" + (to - from) / 60 * PX + 'px">' +
        '<div class="hours">' + hours.map((m) => '<span style="top:' + ((m - from) / 60 * PX - 8) + 'px">' + clock(m).h + clock(m).ap + "</span>").join("") + "</div>" +
        days.map((d) => '<div class="day" data-day="' + d + '" data-from="' + from + '"><div class="after-hours" style="top:0;height:' + (420 - from) / 60 * PX + 'px"></div><div class="after-hours" style="top:' + (1380 - from) / 60 * PX + 'px;bottom:0"></div>' +
          suggested.map((r, i) => (r.date === d ? suggestionBlock(r, i, from, w) : "")).join("") +
          placeEvents(timed.filter((e) => e.date === d)).map((e) => eventHtml(e, from, inWindow)).join("") +
          (d === today() && nowM >= from && nowM < to ? '<div class="now" style="top:' + (nowM - from) / 60 * PX + 'px"></div>' : "") +
        "</div>").join("") +
      "</div></div></div>";
  }

  // ---------- dispatch board ----------
  const shortName = (name) => { const [a, b] = name.split(" "); return a + (b ? " " + b[0] + "." : ""); };
  function draftEvent(a, days, inRow) {
    const team = members(a.team);
    const left = days.indexOf(a.date) * DAY_W + (a.start - DAY_FROM) * PER_MIN;
    return '<button class="ev dsp-ev cur" data-soon="Editing the scheduling block" data-row="' + inRow + '" style="left:' + left + "px;width:" + (a.end - a.start) * PER_MIN + 'px"><span class="dsp-top"><span class="ev-name"><i>' + svg("wrench") + '</i>New Job</span><span class="ev-team">' + team.map(avatar).join("") + '</span></span><span class="ev-time"><i>' + svg("truck") + "</i>" + range(a.start, a.end) + "</span></button>";
  }
  function boardEvent(j, dayIndex, inRow) {
    const a = j.appt;
    const c = custOf(j);
    const team = members(a.team);
    const color = team[0] ? team[0].color : "#757575";
    const start = Math.max(a.start, DAY_FROM);
    const left = dayIndex * DAY_W + (start - DAY_FROM) * PER_MIN;
    return '<button class="ev dsp-ev' + (j.status === "Completed" ? " past" : "") + '" data-ev="' + j.id + '"' + (pick ? "" : ' data-go="job/' + j.id + '"') + ' data-row="' + inRow + '" style="left:' + left + "px;width:" + Math.max(48, (a.end - start) * PER_MIN) + "px;--c:" + color + '">' +
      '<span class="dsp-top"><span class="ev-name"><i>' + svg("wrench") + "</i>" + esc(c ? c.display : "") + '</span><span class="ev-team">' + team.map(avatar).join("") + "</span></span>" +
      '<span class="ev-time"><i>' + svg("truck") + "</i>" + range(a.start, a.end) + "</span></button>";
  }
  function dispatchBoard(days) {
    const now = new Date();
    const nowM = now.getHours() * 60 + now.getMinutes();
    const todayAt = days.indexOf(today());
    const nowX = todayAt >= 0 && nowM >= DAY_FROM && nowM < 1410 ? todayAt * DAY_W + (nowM - DAY_FROM) * PER_MIN : null;
    const rows = [{ id: "none", name: "Unassigned", color: "#757575" }].concat(D.team).filter((e) => !ui.off[e.id]);
    const labels = [];
    for (let m = DAY_FROM; m < 1410; m += 60) labels.push(m);
    const jobsIn = (id) => jobs().filter((j) => j.appt && !j.appt.anytime && days.includes(j.appt.date) && (id === "none" ? !j.appt.team.length : j.appt.team.includes(id)) && shown(j));
    return '<div class="dsp" id="dsp"><div class="dsp-inner" style="width:' + (91 + days.length * DAY_W) + 'px">' +
      '<div class="dsp-head"><div class="dsp-corner">GMT-05</div>' + days.map((d) => {
        const dt = parse(d);
        return '<div class="dsp-day"><div class="dsp-date"><div><b class="' + (d === today() ? "today" : "") + '">' + pad(dt.getDate()) + "</b><small>" + DAYS[dt.getDay()].slice(0, 3) + '</small></div></div><div class="dsp-hours">' + labels.map((m) => "<span>" + clock(m).h + " " + clock(m).ap + "</span>").join("") + "</div></div>";
      }).join("") + (nowX == null ? "" : '<i class="dsp-now-arrow" style="left:' + (91 + nowX) + 'px"></i>') + "</div>" +
      '<div class="dsp-body">' + days.map((d, i) => '<div class="dsp-bg" style="left:' + (91 + i * DAY_W) + 'px"></div>').join("") +
        (nowX == null ? "" : '<i class="dsp-now" style="left:' + (91 + nowX) + 'px"></i>') +
        rows.map((e) => '<div class="dsp-row"><div class="dsp-res"><small>' + esc(e.id === "none" ? e.name : shortName(e.name)) + '</small><span class="dsp-av" style="background:' + e.color + '">' + (e.id === "none" ? svg("noUser") : esc(e.initials)) + '</span></div><div class="dsp-lane" data-res="' + e.id + '">' +
          jobsIn(e.id).map((j) => boardEvent(j, days.indexOf(j.appt.date), e.id)).join("") +
          (pick && pick.appt && days.includes(pick.appt.date) && (pick.appt.team.includes(e.id) || (e.id === "none" && !pick.appt.team.length)) ? draftEvent(pick.appt, days, e.id) : "") + "</div></div>").join("") +
      "</div></div></div>";
  }
  // Events in a row stack when they overlap, and the row grows to fit, like FullCalendar's resource timeline.
  function layoutBoard() {
    document.querySelectorAll(".dsp-lane").forEach((lane) => {
      const placed = [];
      let bottom = 0;
      [...lane.querySelectorAll(".dsp-ev")].sort((a, b) => a.offsetLeft - b.offsetLeft).forEach((el) => {
        const box = { l: el.offsetLeft, r: el.offsetLeft + el.offsetWidth, h: el.offsetHeight, top: 0 };
        for (;;) {
          const hit = placed.find((p) => p.l < box.r && p.r > box.l && p.top < box.top + box.h + 1 && p.top + p.h + 1 > box.top);
          if (!hit) break;
          box.top = hit.top + hit.h + 1;
        }
        el.style.top = box.top + "px";
        placed.push(box);
        bottom = Math.max(bottom, box.top + box.h);
      });
      lane.parentElement.style.height = Math.max(89, bottom + 6) + "px";
    });
  }
  function placeBoardScroll() {
    const board = $("dsp");
    if (board) { board.scrollLeft = ui.dspLeft; board.scrollTop = ui.dspTop; }
  }
  const aimBoardAtToday = (anchor) => {
    const at = dayList(anchor || ui.anchor, "Week").indexOf(today());
    if (at >= 0) ui.dspLeft = at * DAY_W + 1;
    ui.dspTop = 0;
  };
  function clickLane(lane, e) {
    const x = e.clientX - lane.getBoundingClientRect().left;
    const days = dayList(pick ? pick.anchor : ui.anchor, "Week");
    const at = Math.min(days.length - 1, Math.floor(x / DAY_W));
    const start = DAY_FROM + Math.floor((x - at * DAY_W) / 20) * 15;
    if (pick) { pick.onPick({ date: days[at], start, team: lane.dataset.res === "none" ? [] : [lane.dataset.res] }); return; }
    const ghost = document.createElement("div");
    ghost.className = "ghost dsp-ghost";
    ghost.style.left = at * DAY_W + (start - DAY_FROM) * PER_MIN + "px";
    ghost.textContent = timeUp(start).padStart(8, "0") + " - " + timeUp(start + 60).padStart(8, "0");
    lane.appendChild(ghost);
    ui.slot = { date: days[at], start, team: lane.dataset.res === "none" ? [] : [lane.dataset.res] };
    openSlotMenu(e);
  }

  function navCluster(days) {
    return '<button class="pill outline small-pill" data-cal-nav="today">Today</button>' +
      '<button class="bar-btn" data-cal-nav="-1" aria-label="Previous">' + svg("chevLeft") + "</button>" +
      '<button class="bar-btn" data-cal-nav="1" aria-label="Next">' + svg("chevRight") + "</button>" +
      '<button class="range-btn" data-soon="Date picker"><span>' + rangeLabel(days) + "</span><i>" + svg("chevDown") + "</i></button>";
  }
  const seg = '<div class="seg"><button class="on" aria-label="Calendar view">' + svg("calendar") + '</button><button data-soon="Map view" aria-label="Map view">' + svg("place") + "</button></div>";

  // ---------- Schedule page ----------
  function miniMonth() {
    const [y, m] = ui.month.split("-").map(Number);
    const first = new Date(y, m - 1, 1);
    const count = new Date(y, m, 0).getDate();
    const week = dayList(ui.anchor, ui.view);
    const cells = [];
    for (let i = 0; i < first.getDay(); i++) cells.push("<span></span>");
    for (let d = 1; d <= count; d++) {
      const s = y + "-" + pad(m) + "-" + pad(d);
      cells.push('<button class="' + (s === ui.anchor ? "sel" : week.includes(s) ? "wk" : "") + '" data-mini="' + s + '">' + d + "</button>");
    }
    return '<div class="mini"><div class="mini-head"><b>' + MONTHS[m - 1] + " " + y + '</b><button class="bar-btn" data-mini-step="-1" aria-label="Previous month">' + svg("chevLeft") + '</button><button class="bar-btn" data-mini-step="1" aria-label="Next month">' + svg("chevRight") + "</button></div>" +
      '<div class="mini-grid">' + ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((d) => "<small>" + d + "</small>").join("") + cells.join("") + "</div></div>";
  }
  function teamRows() {
    const row = (id, name, color) => '<label class="team-row"><input type="checkbox" data-team-toggle="' + id + '" style="accent-color:' + color + '"' + (ui.off[id] ? "" : " checked") + "> " + esc(name) + "</label>";
    return row("none", "Unassigned", "#757575") + D.team.map((e) => row(e.id, e.name, e.color)).join("");
  }
  function calendarPanel() {
    const allOn = !ui.off.none && D.team.every((e) => !ui.off[e.id]);
    return miniMonth() +
      '<div class="areas"><div class="areas-head"><span>Areas</span><button class="icon-btn small" data-soon="Areas" aria-label="Edit areas">' + svg("pencil") + "</button></div>" +
      '<input data-sch-filter placeholder="Filter by name or tag" aria-label="Filter by name or tag" value="' + esc(ui.filter) + '"></div>' +
      '<div class="team-head"><label class="team-row"><input type="checkbox" data-team-all' + (allOn ? " checked" : "") + "> Team calendars</label>" +
      '<button class="icon-btn small" data-team-fold aria-label="Show or hide team calendars" aria-expanded="' + ui.teamOpen + '"' + (ui.teamOpen ? ' style="transform:rotate(180deg)"' : "") + ">" + svg("chevDown") + "</button></div>" +
      (ui.teamOpen ? teamRows() : "");
  }
  function unscheduledList() {
    const q = ui.unsFilter.trim().toLowerCase();
    const list = jobs().filter((j) => j.status === "Not scheduled").filter((j) => {
      const c = custOf(j);
      const a = addrOf(j);
      return !q || [c ? c.display : "", a ? a.street + " " + a.city : ""].join(" ").toLowerCase().includes(q);
    });
    return list.map((j) => { const c = custOf(j); return '<button class="uns" draggable="true" data-uns="' + j.id + '" data-ev="' + j.id + '" data-go="job/' + j.id + '"><span class="ev-name"><i>' + svg("wrench") + "</i>" + esc(c ? c.display : "") + '</span><i class="uns-truck">' + svg("truck") + "</i></button>"; }).join("") ||
      '<p class="muted uns-none">No unscheduled jobs</p>';
  }
  function unscheduledPanel() {
    return '<p class="uns-title">Drag and drop on calendar</p>' +
      '<input data-uns-filter placeholder="Filter by name, address or ..." aria-label="Filter unscheduled jobs" value="' + esc(ui.unsFilter) + '">' +
      '<div class="uns-list" id="unsList">' + unscheduledList() + "</div>";
  }
  const mainBoard = (days) => (ui.view === "Dispatch" ? dispatchBoard(days) : calendar(days, false));
  function renderSchedule() {
    const days = dayList(ui.anchor, ui.view);
    const count = jobs().filter((j) => j.status === "Not scheduled").length;
    return '<div class="sch"><div class="sch-actions"><button class="pill outline" data-soon="Bulk actions">Bulk actions</button><button class="pill" data-soon="Optimize by drive time">Optimize by drive time</button></div>' +
      '<div class="sch-bar"><button class="bar-btn lg" data-sch="panel" aria-label="Show or hide side panel">' + svg("menu") + "</button>" +
        '<button class="bar-btn lg uns-btn" data-sch="unscheduled" aria-label="Unscheduled jobs" title="Unscheduled jobs">' + svg("calX") + (count ? '<span class="badge">' + count + "</span>" : "") + "</button>" +
        navCluster(days) +
        '<div class="sch-right">' + seg + '<span class="color-by">Color by:</span><button class="drop-btn" data-sch-menu="color"><span>Employee</span><i>' + svg("chevDown") + "</i></button>" +
          '<button class="drop-btn" data-sch-menu="view"><span>' + ui.view + "</span><i>" + svg("chevDown") + "</i></button>" +
          '<button class="bar-btn lg" data-soon="Calendar settings" aria-label="Calendar settings">' + svg("gear") + "</button></div></div>" +
      '<div class="sch-body">' + (ui.panel ? '<aside class="sch-panel" id="schPanel">' + (ui.panel === "unscheduled" ? unscheduledPanel() : calendarPanel()) + "</aside>" : "") +
        '<div class="cal" id="calWrap">' + mainBoard(days) + "</div></div></div>";
  }

  // ---------- Schedule a time window ----------
  function draftFor(j, over) {
    const a = j.appt;
    const date = a ? a.date : today();
    const start = a && !a.anytime ? a.start : 540;
    const end = a && !a.anytime ? a.end : 600;
    return Object.assign({ jobId: j.id, date, endDate: date, start, end, anytime: a ? !!a.anytime : false, team: a ? a.team.slice() : [], arrival: a ? a.arrival : 240, repeat: "Does not repeat", notify: true, tab: "Schedule", anchor: date, duration: Math.max(15, end - start), emps: a ? a.team.slice() : [], results: null, returnTo: "job/" + j.id, fold: {} }, over || {});
  }
  function openWindow(j, over) {
    ui.win = draftFor(j, over);
    if (over && over.start != null) ui.win.duration = ui.win.end - ui.win.start;
    HCP.go("schedule-job/" + j.id);
  }
  function timeOptions(val, placeholder) {
    let html = placeholder ? '<option value="">' + placeholder + "</option>" : "";
    for (let m = 0; m < 1440; m += 15) html += '<option value="' + m + '"' + (String(m) === String(val) ? " selected" : "") + ">" + time(m) + "</option>";
    return html;
  }
  function teamOptions(ids, placeholder) {
    return '<option value="">' + placeholder + "</option>" + D.team.filter((e) => !ids.includes(e.id)).map((e) => '<option value="' + e.id + '">' + esc(e.name) + "</option>").join("");
  }
  function chips(ids, attr) {
    return members(ids).map((e) => '<span class="person">' + avatar(e) + esc(e.name) + "<button " + attr + '="' + e.id + '" aria-label="Remove ' + esc(e.name) + '">' + svg("close") + "</button></span>").join("");
  }
  function arrivalNote(w) {
    const e = member(w.team[0]);
    if (w.anytime || !w.arrival || !e) return "";
    return esc(e.name) + " of " + esc(D.company) + " is scheduled to arrive between " + time(w.start) + " - " + time(w.start + w.arrival);
  }
  function repeatOptions(w) {
    const d = parse(w.date);
    const nth = ["first", "second", "third", "fourth", "fifth"][Math.floor((d.getDate() - 1) / 7)];
    const day = DAYS[d.getDay()];
    return ["Does not repeat", "Daily", "Every weekday (Monday to Friday)", "Weekly on " + day, "Monthly on the " + nth + " " + day, "Yearly on " + short(w.date) + " " + pad(d.getDate()), "Custom"]
      .map((o) => "<option" + (o === w.repeat ? " selected" : "") + ">" + o + "</option>").join("");
  }
  const fld = (label, control, cls) => '<label class="fld' + (cls ? " " + cls : "") + '"><span>' + label + "</span>" + control + "</label>";
  function scheduleTab(w) {
    const off = w.anytime ? " disabled" : "";
    return '<div class="fld-row">' + fld("Start date", '<input type="date" id="swDate" data-w="date" value="' + w.date + '">') + fld("Start time", '<select id="swStart" data-w="start"' + off + ">" + timeOptions(w.start) + "</select>") + "</div>" +
      '<div class="fld-row">' + fld("End date", '<input type="date" id="swEndDate" data-w="endDate" value="' + w.endDate + '">') + fld("End time", '<select id="swEnd" data-w="end"' + off + ">" + timeOptions(w.end) + "</select>") + "</div>" +
      '<label class="check"><input type="checkbox" data-w="anytime"' + (w.anytime ? " checked" : "") + "> Anytime</label>" +
      '<select data-w-team aria-label="Edit team">' + teamOptions(w.team, "Edit team") + "</select>" +
      '<div class="people" id="swTeam">' + chips(w.team, "data-w-team-del") + "</div>" +
      fld("Arrival window", '<select data-w="arrival">' + D.arrivalWindows.map((a) => '<option value="' + a[1] + '"' + (a[1] === w.arrival ? " selected" : "") + ">" + a[0] + "</option>").join("") + "</select>") +
      '<p class="sw-note" id="swNote">' + arrivalNote(w) + "</p>" +
      '<button class="link" data-soon="Default arrival window">Set as default arrival window</button>' +
      fld("Repeats", '<select id="swRepeat" data-w="repeat">' + repeatOptions(w) + "</select>");
  }
  const durText = (m) => pad(Math.floor(m / 60)) + ":" + pad(m % 60);
  function findTab(w) {
    const res = w.results;
    return fld("Date range", "<select><option>This week</option></select>", "up") +
      fld("Customer availability", "<select><option>All day</option></select>", "up") +
      fld("Duration", '<input data-w-dur value="' + durText(w.duration) + '">', "up") +
      '<p class="sw-note">Duration: ' + Math.floor(w.duration / 60) + " hrs " + w.duration % 60 + " mins</p>" +
      '<div class="fld up"><span>Employees</span><select data-w-emp aria-label="Add employee">' + teamOptions(w.emps, "") + '</select></div><div class="people">' + chips(w.emps, "data-w-emp-del") + "</div>" +
      '<button class="pill purple" data-w-suggest>Get suggestions</button>' +
      (res ? '<p class="sw-count">' + res.length + " results</p>" + res.map((r, i) => {
        const e = member(r.emp);
        return '<button class="sug' + (w.picked === i ? " on" : "") + '" data-w-pick="' + i + '">' + (r.best ? '<span class="sug-tag">Shortest travel</span>' : "") +
          '<span class="sug-drive"><i>' + svg("car") + "</i>" + r.mins + " mins away from " + (r.best ? "previous location" : "office") + "</span>" +
          "<b>" + MONTHS[parse(r.date).getMonth()] + " " + parse(r.date).getDate() + ", " + parse(r.date).getFullYear() + "</b><small>" + timeUp(r.start) + " - " + timeUp(r.start + w.duration) + " EST</small>" + avatar(e) + "</button>";
      }).join("") : "");
  }
  // Drive times are made up: the sandbox has no map.
  function suggestions(w) {
    const staff = w.emps.length ? w.emps : D.team.filter((e) => e.id !== D.team[0].id).map((e) => e.id);
    const out = [];
    const now = new Date();
    const earliest = Math.ceil((now.getHours() * 60 + now.getMinutes()) / 15) * 15;
    for (let i = 0; i < 7 && out.length < 12; i++) {
      const date = addDays(today(), i);
      staff.forEach((emp) => {
        const busy = jobs().filter((j) => j.id !== w.jobId && j.appt && !j.appt.anytime && j.appt.date === date && j.appt.team.includes(emp)).sort((a, b) => a.appt.start - b.appt.start);
        let at = Math.max(480, i === 0 ? earliest : 480);
        while (at + w.duration <= 1200) {
          const hit = busy.find((j) => j.appt.start < at + w.duration && j.appt.end > at);
          if (hit) { at = hit.appt.end; continue; }
          out.push({ date, start: at, emp, mins: 12 + (at + i * 7 + emp.charCodeAt(1)) % 19 });
          at += w.duration;
        }
      });
    }
    const top = out.sort((a, b) => a.date.localeCompare(b.date) || a.start - b.start).slice(0, 5);
    if (top.length) top.reduce((a, b) => (b.mins < a.mins ? b : a)).best = true;
    return top;
  }
  function renderWindow(id) {
    const j = jobById(id);
    if (!j) return '<div class="soon"><h1>Job not found</h1></div>';
    if (!ui.win || String(ui.win.jobId) !== String(id)) ui.win = draftFor(j);
    const w = ui.win;
    const c = custOf(j);
    const a = addrOf(j);
    const services = j.services.reduce((n, r) => n + Number(r.qty || 0) * Number(r.price || 0), 0);
    const foldable = (key, label, body) => '<section class="sw-card"><button class="sw-card-head" data-w-fold="' + key + '" aria-expanded="' + !w.fold[key] + '"><span>' + label + "</span><i" + (w.fold[key] ? "" : ' style="transform:rotate(180deg)"') + ">" + svg("chevDown") + "</i></button>" + (w.fold[key] ? "" : '<div class="sw-card-body">' + body + "</div>") + "</section>";
    const row = (label, icon) => '<div class="sw-row"><i>' + svg(icon) + "</i><span>" + label + '</span><button class="icon-btn small" data-soon="' + label + '" aria-label="Add ' + label + '">' + svg("plus") + "</button></div>";
    return '<div class="sw" role="dialog" aria-modal="true" aria-labelledby="swTitle"><header class="sw-head"><button class="icon-btn" data-w-close aria-label="Close">' + svg("close") + '</button><h1 id="swTitle">Schedule a time for Job #' + j.id + "</h1>" +
      '<label class="check sw-notify"><input type="checkbox" data-w="notify"' + (w.notify ? " checked" : "") + '> Notify customer</label><button class="pill" data-w-save>Save</button></header>' +
      '<div class="sw-body"><div class="sw-left" id="swLeft">' +
        foldable("schedule", "Schedule", '<div class="seg-text"><button class="' + (w.tab === "Schedule" ? "on" : "") + '" data-w-tab="Schedule">Schedule</button><button class="' + (w.tab === "Find" ? "on" : "") + '" data-w-tab="Find">Find a time</button></div>' + (w.tab === "Schedule" ? scheduleTab(w) : findTab(w))) +
        foldable("job", "Job #" + j.id, "<p>" + esc(c ? c.display : "") + "</p><p>" + esc(a ? a.street : "") + "</p><p>" + esc(a ? a.city + " " + a.state + ", " + a.zip : "") + "</p><p>" + esc(c && c.phones[0] ? c.phones[0].number : "") + "</p>" +
          (c && c.notify ? '<span class="notif">Notifications on</span>' : "") + '<hr><p>' + esc(title(j)) + '</p><div class="sw-sub"><b>Services subtotal</b><b>' + money(services) + "</b></div>") +
        row("Customer tags", "tag") + row("Job tags", "tag") + row("Private notes", "note") +
      '</div><div class="sw-right"><div class="sch-bar sw-bar"><i class="bar-ico">' + svg("wrench") + "</i>" + '<span id="swNav" class="sw-nav">' + navCluster(dayList(w.anchor, "Week")) + "</span>" +
        '<div class="sch-right">' + seg + '<button class="drop-btn blue" data-soon="Filter by employee"><span>Filter by employee</span><i>' + svg("chevDown") + '</i></button><button class="drop-btn blue" data-soon="View options"><span>View options</span><i>' + svg("chevDown") + '</i></button><button class="bar-btn lg" data-soon="Calendar settings" aria-label="Calendar settings">' + svg("gear") + "</button></div></div>" +
        '<div class="cal" id="swCal">' + calendar(dayList(w.anchor, "Week"), true) + "</div></div></div></div>";
  }
  function restoreScroll() {
    const body = document.querySelector(".cal-body");
    if (body) body.scrollTop = ui.scroll;
  }
  function refreshCal() {
    const wrap = $("calWrap");
    if (wrap) { wrap.innerHTML = mainBoard(dayList(ui.anchor, ui.view)); layoutBoard(); placeBoardScroll(); restoreScroll(); }
  }
  // Updates everything except the control being used, so a date being typed keeps focus.
  function refreshWin() {
    const w = ui.win;
    const days = dayList(w.anchor, "Week");
    $("swCal").innerHTML = calendar(days, true);
    $("swNav").innerHTML = navCluster(days);
    restoreScroll();
    [["swDate", w.date], ["swEndDate", w.endDate], ["swStart", w.start], ["swEnd", w.end]].forEach(([id, v]) => {
      const el = $(id);
      if (el && el !== document.activeElement) el.value = v;
    });
    if ($("swNote")) $("swNote").textContent = arrivalNote(w);
    if ($("swRepeat")) $("swRepeat").innerHTML = repeatOptions(w);
  }
  function saveWindow() {
    const w = ui.win;
    if (w.endDate !== w.date) { notBuilt("Multi-day scheduling"); return; }
    if (!w.anytime && w.end <= w.start) { toast("End time must be after start time"); return; }
    const j = jobById(w.jobId);
    j.appt = { date: w.date, start: w.anytime ? 0 : w.start, end: w.anytime ? 0 : w.end, anytime: w.anytime, team: w.team.slice(), arrival: w.arrival };
    if (j.status === "Not scheduled") j.status = "Scheduled";
    HCP.save();
    const back = w.returnTo;
    ui.win = null;
    toast(w.notify ? "Schedule saved. Customer notified (nothing is really sent)" : "Schedule saved");
    HCP.go(back);
  }

  // ---------- hover card ----------
  let cardTimer;
  function card() {
    let el = $("schedCard");
    if (!el) {
      el = document.createElement("div");
      el.id = "schedCard";
      el.className = "ev-card";
      el.hidden = true;
      document.body.appendChild(el);
    }
    return el;
  }
  function hideCard() { clearTimeout(cardTimer); card().hidden = true; }
  function showCard(ev) {
    clearTimeout(cardTimer);
    const j = jobById(ev.dataset.ev);
    const isDraft = ev.classList.contains("cur") && ui.win;
    const a = isDraft ? ui.win : j.appt;
    const c = custOf(j);
    const addr = addrOf(j);
    const dt = a && parse(a.date);
    const when = a ? short(a.date) + " " + dt.getDate() + " " + dt.getFullYear() + " " + (a.anytime ? "Anytime" : timeUp(a.start).replace(" ", "") + " - " + timeUp(a.end).replace(" ", "")) : "";
    const el = card();
    el.innerHTML = '<div class="c-row"><i>' + svg("wrench") + '</i><div class="c-main"><button class="link big" data-go="job/' + j.id + '">Job #' + j.id + "</button><small>" + when + '</small></div><button class="link" data-go="job/' + j.id + '">Edit</button></div>' +
      '<div class="c-row"><i>' + svg("calendar") + "</i><div>" + esc(title(j)) + "</div></div>" +
      '<div class="c-row"><i>' + svg("dollar") + "</i><div>" + money(total(j)) + "</div></div>" +
      '<div class="c-row"><i>' + svg("person") + '</i><div class="c-main"><button class="link big" data-go="customer/' + (c ? c.id : "") + '">' + esc(c ? c.display : "") + "</button><small>" + esc(addr ? addr.street : "") + "</small><small>" + esc(addr ? addr.city + " " + addr.state + " " + addr.zip : "") + "</small><small>" + esc(c && c.phones[0] ? c.phones[0].number : "") + '</small></div><div class="c-acts"><button class="icon-btn" data-soon="Messages" aria-label="Message">' + svg("bubble") + '</button><button class="icon-btn" data-soon="Calls" aria-label="Call">' + svg("phone") + "</button></div></div>" +
      (a && a.team.length ? '<div class="c-row"><i>' + svg("clipboard") + '</i><div class="c-team">' + members(a.team).map((e) => "<span>" + avatar(e) + esc(e.name) + "</span>").join("") + "</div></div>" : "") +
      ((j.tags || []).length ? '<div class="c-row"><i>' + svg("tag") + '</i><div class="c-tags">' + j.tags.map((t) => "<span>" + esc(t) + "</span>").join("") + "</div></div>" : "");
    el.hidden = false;
    const r = ev.getBoundingClientRect();
    const w = el.offsetWidth;
    const h = el.offsetHeight;
    let x = r.right + 8;
    if (x + w > window.innerWidth - 8) x = r.left - w - 8;
    el.style.left = Math.max(8, x) + "px";
    el.style.top = Math.max(8, Math.min(r.top, window.innerHeight - h - 8)) + "px";
  }

  // ---------- menus ----------
  function openMenu(html, x, y, corner, kind) {
    const m = $("createMenu");
    m.className = "menu" + (kind ? " " + kind : "");
    m.innerHTML = html;
    m.hidden = false;
    m.style.left = x + "px";
    m.style.top = y + "px";
    if (corner) {
      m.style.left = Math.max(8, x - m.offsetWidth) + "px";
      m.style.top = Math.max(8, y - m.offsetHeight) + "px";
    }
    const r = m.getBoundingClientRect();
    if (r.right > window.innerWidth - 8) m.style.left = Math.max(8, window.innerWidth - 8 - r.width) + "px";
    if (r.bottom > window.innerHeight - 8) m.style.top = Math.max(8, window.innerHeight - 8 - r.height) + "px";
  }
  function clearGhost() {
    document.querySelectorAll(".ghost").forEach((g) => g.remove());
  }
  const slotAt = (day, y) => Number(day.dataset.from) + Math.floor((y - day.getBoundingClientRect().top) / PX * 4) * 15;

  function clickSlot(day, e) {
    const start = slotAt(day, e.clientY);
    const date = day.dataset.day;
    if (ui.win) {
      const length = ui.win.end - ui.win.start;
      Object.assign(ui.win, { date, endDate: date, start, end: Math.min(1425, start + (length > 0 ? length : 60)) });
      refreshWin();
      return;
    }
    const from = Number(day.dataset.from);
    const ghost = document.createElement("div");
    ghost.className = "ghost";
    ghost.style.top = (start - from) / 60 * PX + "px";
    ghost.style.height = PX + "px";
    ghost.textContent = timeUp(start).padStart(8, "0") + " - " + timeUp(start + 60).padStart(8, "0");
    day.appendChild(ghost);
    ui.slot = { date, start, team: [D.team[0].id] };
    openSlotMenu(e);
  }

  function openSlotMenu(e) {
    openMenu('<button data-slot-new="job"><i>' + svg("wrenchPlus") + '</i>Job</button><button data-slot-new="Recurring job"><i>' + svg("repeat") + '</i>Recurring job</button><hr><button data-slot-new="Estimate"><i>' + svg("clipboard") + '</i>Estimate</button><button data-slot-new="Event"><i>' + svg("calendar") + "</i>Event</button>", e.clientX, e.clientY, "up-left");
  }

  HCP.onClick((e) => {
    const t = (s) => e.target.closest(s);
    const menu = $("createMenu");
    let b;
    if (!t("#createMenu")) clearGhost();
    if ((b = t("[data-sch-menu]"))) {
      const name = b.dataset.schMenu;
      if (!menu.hidden && ui.menuFor === name) { menu.hidden = true; return true; }
      ui.menuFor = name;
      const r = b.getBoundingClientRect();
      if (name === "color") openMenu('<button data-sch-color="Area">Area</button><button class="sel" data-sch-color="Employee">Employee</button>', r.left - 30, r.bottom, null, "color");
      else openMenu(D.scheduleViews.map((v) => '<button class="' + (v === ui.view ? "sel" : "") + '" data-sch-view="' + v + '">' + v + "</button>").join("") + '<hr><button data-soon="View by employee"><i>' + svg("box") + "</i>View by employee</button>", r.right + 48 - 206, r.bottom, null, "view");
      return true;
    }
    if ((b = t("[data-sch-view]"))) {
      menu.hidden = true;
      const v = b.dataset.schView;
      if (["Schedule", "Month"].includes(v)) notBuilt(v + " view");
      else { ui.view = v; if (v === "Dispatch") aimBoardAtToday(); HCP.render(); }
      return true;
    }
    if ((b = t("[data-sch-color]"))) {
      menu.hidden = true;
      if (b.dataset.schColor === "Area") notBuilt("Color by area");
      return true;
    }
    if ((b = t("[data-slot-new]"))) {
      menu.hidden = true;
      if (b.dataset.slotNew === "job") {
        const s = ui.slot;
        HCP.startJob({ date: s.date, endDate: s.date, start: String(s.start), end: String(s.start + 60), anytime: false, team: s.team, notify: false }, "schedule");
      } else { clearGhost(); notBuilt(b.dataset.slotNew); }
      return true;
    }
    if ((b = t("[data-sch]"))) {
      if (b.dataset.sch === "panel") ui.panel = ui.panel ? null : "calendar";
      else ui.panel = ui.panel === "unscheduled" ? "calendar" : "unscheduled";
      HCP.render();
      return true;
    }
    if ((b = t("[data-cal-nav]"))) {
      const dir = b.dataset.calNav;
      const target = ui.win || pick || ui;
      const step = !ui.win && !pick && ui.view === "Day" ? 1 : 7;
      target.anchor = dir === "today" ? today() : addDays(target.anchor, Number(dir) * step);
      if (pick) { if (dir === "today") aimBoardAtToday(pick.anchor); pick.refresh(); }
      else if (ui.win) refreshWin();
      else { ui.month = ui.anchor.slice(0, 7); if (dir === "today") aimBoardAtToday(); HCP.render(); }
      return true;
    }
    if ((b = t("[data-mini]"))) { ui.anchor = b.dataset.mini; HCP.render(); return true; }
    if ((b = t("[data-mini-step]"))) {
      const [y, m] = ui.month.split("-").map(Number);
      ui.month = ymd(new Date(y, m - 1 + Number(b.dataset.miniStep), 1)).slice(0, 7);
      $("schPanel").innerHTML = calendarPanel();
      return true;
    }
    if (t("[data-team-fold]")) { ui.teamOpen = !ui.teamOpen; $("schPanel").innerHTML = calendarPanel(); return true; }
    if ((b = t("[data-schedule-job]"))) { openWindow(jobById(b.dataset.scheduleJob)); return true; }

    if (ui.win) {
      const w = ui.win;
      if (t("[data-w-close]")) { const back = w.returnTo; ui.win = null; HCP.go(back); return true; }
      if (t("[data-w-save]")) { saveWindow(); return true; }
      if ((b = t("[data-w-tab]"))) { w.tab = b.dataset.wTab; HCP.render(); return true; }
      if ((b = t("[data-w-fold]"))) { w.fold[b.dataset.wFold] = !w.fold[b.dataset.wFold]; HCP.render(); return true; }
      if ((b = t("[data-w-team-del]"))) { w.team = w.team.filter((id) => id !== b.dataset.wTeamDel); HCP.render(); return true; }
      if ((b = t("[data-w-emp-del]"))) { w.emps = w.emps.filter((id) => id !== b.dataset.wEmpDel); HCP.render(); return true; }
      if (t("[data-w-suggest]")) {
        w.results = suggestions(w);
        w.picked = null;
        if (w.results[0]) { w.anchor = w.results[0].date; ui.scroll = Math.max(0, (w.results[0].start - 390) / 60 * PX - 56); }
        HCP.render();
        return true;
      }
      if ((b = t("[data-w-pick]"))) {
        const r = w.results[Number(b.dataset.wPick)];
        Object.assign(w, { date: r.date, endDate: r.date, start: r.start, end: r.start + w.duration, team: [r.emp], emps: [r.emp], anchor: r.date, anytime: false, picked: Number(b.dataset.wPick) });
        HCP.render();
        return true;
      }
    }
    const day = t(".day");
    if (day && !t(".ev")) { clickSlot(day, e); return true; }
    const lane = t(".dsp-lane");
    if (lane && !t(".ev")) { clickLane(lane, e); return true; }
    return false;
  });

  document.addEventListener("input", (e) => {
    const el = e.target;
    if (el.matches("[data-sch-filter]")) { ui.filter = el.value; refreshCal(); }
    else if (el.matches("[data-uns-filter]")) { ui.unsFilter = el.value; $("unsList").innerHTML = unscheduledList(); }
  });
  document.addEventListener("change", (e) => {
    const el = e.target;
    if (el.matches("[data-team-toggle]")) {
      ui.off[el.dataset.teamToggle] = !el.checked;
      refreshCal();
      $("schPanel").innerHTML = calendarPanel();
      return;
    }
    if (el.matches("[data-team-all]")) {
      ["none"].concat(D.team.map((m) => m.id)).forEach((id) => { ui.off[id] = !el.checked; });
      refreshCal();
      $("schPanel").innerHTML = calendarPanel();
      return;
    }
    const w = ui.win;
    if (!w) return;
    if (el.matches("[data-w-team]") && el.value) { w.team.push(el.value); HCP.render(); return; }
    if (el.matches("[data-w-emp]") && el.value) { w.emps.push(el.value); HCP.render(); return; }
    if (el.matches("[data-w-dur]")) {
      const m = el.value.trim().match(/^(\d{1,2}):(\d{2})$/);
      const mins = m ? Number(m[1]) * 60 + Number(m[2]) : 0;
      if (mins > 0) w.duration = mins;
      else toast("Enter the duration as hours and minutes, like 02:00");
      HCP.render();
      return;
    }
    if (!el.dataset.w) return;
    const key = el.dataset.w;
    if (key === "date") {
      if (!el.value) return;
      w.date = el.value;
      w.endDate = el.value;
      w.anchor = el.value;
    } else if (key === "endDate") {
      if (el.value) w.endDate = el.value;
    } else if (key === "start") {
      const length = w.end - w.start;
      w.start = Number(el.value);
      w.end = Math.min(1425, w.start + length);
    } else if (key === "end") {
      w.end = Number(el.value);
    } else if (key === "arrival") {
      w.arrival = Number(el.value);
    } else if (key === "repeat") {
      if (el.value !== "Does not repeat") { notBuilt("Repeating jobs"); el.value = "Does not repeat"; }
      return;
    } else if (key === "notify") {
      w.notify = el.checked;
      return;
    } else if (key === "anytime") {
      w.anytime = el.checked;
      HCP.render();
      return;
    }
    refreshWin();
  });

  document.addEventListener("dragstart", (e) => {
    const el = e.target.closest && e.target.closest("[data-uns]");
    if (!el) return;
    ui.dragId = el.dataset.uns;
    e.dataTransfer.setData("text/plain", el.dataset.uns);
    e.dataTransfer.effectAllowed = "move";
  });
  document.addEventListener("dragover", (e) => {
    if (ui.dragId && e.target.closest(".day, .dsp-lane")) e.preventDefault();
  });
  document.addEventListener("drop", (e) => {
    const day = e.target.closest(".day");
    const lane = e.target.closest(".dsp-lane");
    if (!ui.dragId || (!day && !lane)) return;
    e.preventDefault();
    const j = jobById(ui.dragId);
    ui.dragId = null;
    let date, start, team;
    if (day) {
      date = day.dataset.day;
      start = slotAt(day, e.clientY);
    } else {
      const x = e.clientX - lane.getBoundingClientRect().left;
      const days = dayList(ui.anchor, "Week");
      const at = Math.min(days.length - 1, Math.floor(x / DAY_W));
      date = days[at];
      start = DAY_FROM + Math.floor((x - at * DAY_W) / 20) * 15;
      team = lane.dataset.res === "none" ? [] : [lane.dataset.res];
    }
    openWindow(j, Object.assign({ date, endDate: date, start, end: start + 60, anchor: date, returnTo: "schedule" }, team ? { team } : {}));
  });
  document.addEventListener("dragend", () => { ui.dragId = null; });

  document.addEventListener("mouseover", (e) => {
    if (!e.target.closest) return;
    const ev = e.target.closest("[data-ev]");
    if (ev) showCard(ev);
    else if (e.target.closest("#schedCard")) clearTimeout(cardTimer);
  });
  document.addEventListener("mouseout", (e) => {
    if (!e.target.closest || !e.target.closest("[data-ev], #schedCard")) return;
    clearTimeout(cardTimer);
    cardTimer = setTimeout(() => { card().hidden = true; }, 180);
  });
  document.addEventListener("focusin", (e) => {
    if (e.target.matches && e.target.matches("[data-ev]")) showCard(e.target);
  });
  document.addEventListener("focusout", (e) => {
    if (e.target.matches && e.target.matches("[data-ev]")) hideCard();
  });
  document.addEventListener("scroll", (e) => {
    if (e.target.classList && e.target.classList.contains("cal-body")) { ui.scroll = e.target.scrollTop; hideCard(); }
    if (e.target.id === "dsp") { ui.dspLeft = e.target.scrollLeft; ui.dspTop = e.target.scrollTop; hideCard(); }
  }, true);
  document.addEventListener("keydown", (e) => {
    const menu = $("createMenu");
    if (e.key === "Escape" && !menu.hidden) {
      menu.hidden = true;
      clearGhost();
    } else if (e.key === "Escape" && ui.win && !e.target.matches("select")) {
      const back = ui.win.returnTo;
      ui.win = null;
      HCP.go(back);
    }
  });

  HCP.sched = {
    timeOptions, teamOptions, chips, avatar, addDays, today,
    setPicker: (p) => { pick = p; },
    weekOf: (anchor) => dayList(anchor, "Week"),
    board: dispatchBoard,
    nav: navCluster,
    aim: aimBoardAtToday,
    people: (j) => (j.appt ? members(j.appt.team) : []),
    at(j, m) {
      const d = parse(j.appt.date);
      return DAYS[d.getDay()].slice(0, 3) + ", " + short(j.appt.date) + " " + d.getDate() + ", " + d.getFullYear() + "<br>" + timeUp(m) + " EST";
    },
    feed(date, m) {
      const d = parse(date);
      return DAYS[d.getDay()].slice(0, 3) + " " + pad(d.getMonth() + 1) + "/" + pad(d.getDate()) + "/" + String(d.getFullYear()).slice(2) + "<br>" + time(m);
    },
    text(j) {
      if (!j.appt) return "";
      const d = parse(j.appt.date);
      return DAYS[d.getDay()].slice(0, 3) + ", " + short(j.appt.date) + " " + d.getDate() + (j.appt.anytime ? " · Anytime" : " · " + range(j.appt.start, j.appt.end));
    },
    team: (j) => (j.appt ? members(j.appt.team).map((e) => e.name).join(", ") : ""),
    stamp(j) {
      if (!j.appt) return "";
      const a = j.appt;
      const d = parse(a.date);
      return DAYS[d.getDay()].slice(0, 3) + ", " + short(a.date) + " " + d.getDate() + ", " + d.getFullYear() + "<br>" + (a.anytime ? "Anytime" : timeUp(a.start) + " - " + timeUp(a.end) + " EST" + (a.arrival ? "<br><em>arrive by " + timeUp(a.start + a.arrival) + "</em>" : ""));
    },
  };

  Object.assign(HCP.views, { schedule: renderSchedule, "schedule-job": renderWindow });
  Object.assign(HCP.navFor, { "schedule-job": "schedule" });
  HCP.afterRender.push(() => {
    hideCard();
    $("page").classList.toggle("flush", HCP.view === "schedule");
    if (HCP.view !== "schedule-job") ui.win = null;
    layoutBoard();
    placeBoardScroll();
    restoreScroll();
  });
  HCP.onReset.push(() => { Object.assign(ui, freshUi()); });
});
