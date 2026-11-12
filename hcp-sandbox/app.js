(function () {
  const DATA = window.HCP_DATA;
  const KEY = "hcp-sandbox-v2";

  const ICONS = {
    home: '<path d="M4 11l8-7 8 7v9h-5v-6H9v6H4z"/>',
    calendar: '<rect x="4" y="5" width="16" height="16" rx="1"/><path d="M4 10h16M8 3v4M16 3v4"/>',
    pipeline: '<rect x="3" y="5" width="18" height="15"/><path d="M3 9h18M9 9v11M15 9v11"/>',
    person: '<circle cx="12" cy="8" r="3.5"/><path d="M5 20c0-4 3-6 7-6s7 2 7 6z"/>',
    target: '<path d="M14 3.5A9 9 0 1 0 20.5 10"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1.5"/><path d="M12 12l8-8"/>',
    clipboard: '<rect x="4" y="5" width="16" height="16" rx="1"/><path d="M9 3h6v4H9z"/>',
    wrench: '<path d="M4 7l3-3 3 3-1 2 10 10-2 2L7 11 5 11z"/><path d="M14 9l3-5 3 3-5 3"/>',
    wrenchPlus: '<path d="M8 6l3-3 3 3-1 2 8 8-2 2-8-8-2 0z"/><path d="M15 8l3-4 3 3-4 3"/><path d="M5 15v6M2 18h6"/>',
    invoice: '<path d="M6 3h8l5 5v13H6z"/><path d="M14 3v5h5"/><path d="M12.5 11.5h-2a1.25 1.25 0 0 0 0 2.5h1a1.25 1.25 0 0 1 0 2.5h-2M11 10.5v7"/>',
    shield: '<path d="M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6z"/><path d="M15.5 10.5A4 4 0 0 0 8.7 10M8.5 13.5a4 4 0 0 0 6.8.5"/>',
    order: '<path d="M6 21H5V4h13v7"/><path d="M8 8h7M8 12h3"/><path d="M12 14h9l-1 4h-7z"/><circle cx="14" cy="21" r=".8"/><circle cx="19" cy="21" r=".8"/>',
    chat: '<path d="M4 4h16v13H9l-5 4z"/><path d="M8 9h8M8 13h6"/>',
    dollar: '<circle cx="12" cy="12" r="9"/><path d="M15 9a2.5 2 0 0 0-2.5-1.5h-1a2.25 2.25 0 0 0 0 4.5h1a2.25 2.25 0 0 1 0 4.5h-1A2.5 2 0 0 1 9 15M12 6v12"/>',
    megaphone: '<path d="M3 10v4h4l8 4V6l-8 4z"/><path d="M6 14l1 5h3l-1-4M18 8l2-1M18 12h3M18 16l2 1"/>',
    report: '<rect x="4" y="4" width="16" height="16"/><path d="M8.5 16v-3M12 16V9M15.5 16v-5"/>',
    team: '<circle cx="9" cy="8" r="3"/><path d="M3 20c0-4 2.5-6 6-6s6 2 6 6z"/><path d="M15 5.5a3 3 0 0 1 0 5M17 14c2.500.5 4 2.500 4 6h-3"/>',
    tools: '<path d="M4 20L15 9M9 4l-5 5 2 2 5-5zM14 14l6 6M20 4l-3 3-2-1-1-2 3-3"/><path d="M17 7a4 4 0 0 1-3 3"/>',
    grid: '<g fill="currentColor" stroke="none"><circle cx="5" cy="5" r="2"/><circle cx="12" cy="5" r="2"/><circle cx="19" cy="5" r="2"/><circle cx="5" cy="12" r="2"/><circle cx="12" cy="12" r="2"/><circle cx="19" cy="12" r="2"/><circle cx="5" cy="19" r="2"/><circle cx="12" cy="19" r="2"/><circle cx="19" cy="19" r="2"/></g>',
    gear: '<circle cx="12" cy="12" r="3"/><path d="M12 3l1.500 2.500 3-.5 1 3 2.500 1.500-1 3 1 3-2.500 1.500-1 3-3-.5L12 21l-1.500-2.500-3 .5-1-3L4 14.500l1-3-1-3 2.500-1.500 1-3 3 .5z"/>',
    plus: '<path d="M12 4v16M4 12h16"/>',
    chevDown: '<path d="M6 9l6 6 6-6"/>',
    chevRight: '<path d="M9 6l6 6-6 6"/>',
    close: '<path d="M6 6l12 12M18 6L6 18"/>',
    check: '<path d="M5 12l5 5 9-10"/>',
    pencil: '<path d="M4 20l1-4L16 5l3 3L8 19z"/>',
    collapse: '<path d="M4 4v16M20 12H9M13 7l-5 5 5 5"/>',
    search: '<circle cx="10" cy="10" r="6"/><path d="M15 15l6 6" stroke-width="2.200"/>',
    pin: '<path d="M12 18c-3-3.500-6-6-6-9.500a6 6 0 0 1 12 0c0 3.500-3 6-6 9.500z"/><circle cx="12" cy="8.500" r="2"/><path d="M8 19c-1 .4-2 1-2 1.500C6 21.500 9 22 12 22s6-.5 6-1.500c0-.5-1-1.100-2-1.500"/>',
    bell: '<path d="M6 17V11a6 6 0 0 1 12 0v6l2 2H4z"/><path d="M10 21h4"/>',
    checklist: '<path d="M3 7l2 2 3-3M3 16l2 2 3-3M11 8h10M11 17h10"/>',
    history: '<path d="M4 12a8 8 0 1 0 2.500-5.800L4 8.500M4 4v4.500h4.500"/><path d="M13 8l-3 5h4l-2 4"/>',
    bookmark: '<rect x="4" y="4" width="16" height="16"/><path d="M12 4h7v8l-3.500-2-3.500 2z" fill="currentColor"/>',
    personPlus: '<circle cx="9" cy="8" r="3.500"/><path d="M2 20c0-4 3-6 7-6s7 2 7 6zM18 6v6M15 9h6"/>',
    bubble: '<path d="M5 4h14a1 1 0 0 1 1 1v11a1 1 0 0 1-1 1H10l-5 4V5a1 1 0 0 1 0-1z"/><path d="M8 9h8M8 13h6"/>',
    menu: '<path d="M4 7h16M4 12h16M4 17h16"/>',
    calX: '<rect x="4" y="5" width="16" height="16" rx="1"/><path d="M8 3v4M16 3v4M9.500 12l5 5M14.500 12l-5 5"/>',
    chevLeft: '<path d="M15 6l-6 6 6 6"/>',
    truck: '<path d="M2 7h12v10H2zM14 10h4l4 4v3h-8z" fill="currentColor"/><circle cx="7" cy="18" r="2" fill="#fff"/><circle cx="18" cy="18" r="2" fill="#fff"/>',
    place: '<path d="M12 22c-4-5-7-8.500-7-12.500a7 7 0 0 1 14 0c0 4-3 7.500-7 12.500z" fill="currentColor"/><circle cx="12" cy="9.500" r="2.500" fill="#fff" stroke="none"/>',
    phone: '<path d="M5 3h4l2 5-2.500 1.500a12 12 0 0 0 6 6L16 13l5 2v4a2 2 0 0 1-2 2C10 21 3 14 3 5a2 2 0 0 1 2-2z"/>',
    car: '<path d="M4 16v-4l2-5h12l2 5v4zM4 12h16M6 16v3M18 16v3"/><circle cx="7.500" cy="14" r=".6"/><circle cx="16.500" cy="14" r=".6"/>',
    tag: '<path d="M3 12V4h8l10 10-8 8z" fill="currentColor"/><circle cx="7.500" cy="8.500" r="1.500" fill="#fff" stroke="none"/>',
    note: '<path d="M4 5h16v10l-5 5H4z" fill="currentColor"/>',
    attach: '<path d="M8 12V7a4 4 0 0 1 8 0v10a5 5 0 0 1-10 0V9"/><path d="M12 8v8"/>',
    fields: '<path d="M4 6h3M4 12h3M4 18h3M10 6h10M10 12h10M10 18h10" stroke-width="3"/>',
    repeat: '<path d="M4 11a7 7 0 0 1 12-5l3 3M20 4v5h-5M20 13a7 7 0 0 1-12 5l-3-3M4 20v-5h5"/>',
    box: '<rect x="4" y="4" width="16" height="16" rx="2"/>',
    mail: '<rect x="3" y="5.500" width="18" height="13" rx="1" fill="currentColor"/><path d="M4 7l8 6 8-6" stroke="#fff"/>',
    dots: '<g fill="currentColor" stroke="none"><circle cx="12" cy="5" r="1.800"/><circle cx="12" cy="12" r="1.800"/><circle cx="12" cy="19" r="1.800"/></g>',
    noUser: '<circle cx="12" cy="12" r="8.500"/><path d="M6 6l12 12M12 8a2.500 2.500 0 0 1 2.300 3.500M8 17c.5-2 2-3 4-3"/>',
    undo: '<path d="M9 7L4 12l5 5M4 12h11a5 5 0 0 1 5 5v1"/>',
    help: '<circle cx="12" cy="12" r="9"/><path d="M9.500 9.500a2.500 2.500 0 1 1 4 2c-1 .7-1.500 1.200-1.500 2.500M12 17h.01"/>',
    play: '<path d="M9 6.500v11l9-5.500z" fill="currentColor"/>',
    stop: '<rect x="7.500" y="7.500" width="9" height="9" fill="currentColor"/>',
    send: '<path d="M4 5l17 7-17 7 2-7z" fill="currentColor"/>',
    card: '<rect x="3" y="5.500" width="18" height="13" rx="2"/><path d="M3 10h18" stroke-width="2.500"/>',
    sparkle: '<path d="M11 3l1.800 5.200L18 10l-5.200 1.800L11 17l-1.800-5.200L4 10l5.200-1.800zM18.500 15l.8 2.200 2.200.8-2.200.8-.8 2.200-.8-2.200-2.200-.8 2.200-.8z" fill="currentColor"/>',
    printer: '<path d="M7 8V4h10v4M7 17H4v-6a3 3 0 0 1 3-3h10a3 3 0 0 1 3 3v6h-3"/><rect x="7" y="14" width="10" height="6"/>',
  };
  const svg = (name) => '<svg viewBox="0 0 24 24" aria-hidden="true">' + ICONS[name] + "</svg>";
  const esc = (t) => String(t == null ? "" : t).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));

  const clone = (o) => JSON.parse(JSON.stringify(o));
  const fresh = () => ({
    collapsed: false, setupClosed: false, tourDismissed: false, hiddenTasks: [],
    customers: clone(DATA.customers), jobs: clone(DATA.jobs), estimates: clone(DATA.estimates), invoices: clone(DATA.invoices),
    practice: { open: false, index: 0, base: {} },
  });
  let state = load();
  let view = "home";
  let viewArg = "";
  let slide = 0;
  const clickHandlers = [];
  let toastTimer;

  function load() {
    try { return Object.assign(fresh(), JSON.parse(localStorage.getItem(KEY)) || {}); }
    catch (e) { return fresh(); }
  }
  function save() {
    try { localStorage.setItem(KEY, JSON.stringify(state)); } catch (e) {}
  }

  function toast(msg) {
    const el = document.getElementById("toast");
    el.textContent = msg;
    el.hidden = false;
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => { el.hidden = true; }, 2600);
  }
  // Anything we have no screenshot of says so, so nobody takes it for real HCP behaviour.
  const notBuilt = (name) => toast(name + " isn't in the sandbox yet");

  function findNav(id) {
    return DATA.nav.flat().find((n) => n.id === id);
  }

  function renderNav() {
    const current = HCP.navFor[view] || view;
    const rows = DATA.nav.map((group) => group.map((n) =>
      '<button class="nav-row' + (current === n.id ? " on" : "") + '" data-nav="' + n.id + '" title="' + esc(n.label) + '"' + (current === n.id ? ' aria-current="page"' : "") + ">" +
        "<i>" + svg(n.icon) + "</i>" +
        (n.dot ? '<span class="dot"></span>' : "") +
        '<span class="t">' + esc(n.label) + "</span>" +
        (n.menu ? '<i class="chev">' + svg("chevDown") + "</i>" : "") +
        (n.arrow ? '<i class="chev">' + svg("chevRight") + "</i>" : "") +
      "</button>").join("")).join('<div class="nav-sep"></div>');
    document.getElementById("nav").innerHTML =
      '<button class="create" data-create aria-haspopup="menu"><i>' + svg("plus") + "</i><span>Create</span></button>" + rows;
  }

  function renderFoot() {
    const u = DATA.user;
    document.getElementById("foot").innerHTML =
      '<button class="foot-settings" data-soon="Settings"><i>' + svg("gear") + "</i><span>Settings</span></button>" +
      '<button class="foot-user" data-soon="Your profile"><span class="avatar">' + esc(u.initials) + "</span>" +
        "<div><b>" + esc(u.name) + "</b><small>" + esc(u.role) + "</small></div><i>" + svg("chevRight") + "</i></button>";
  }

  function renderChrome() {
    document.getElementById("shell").classList.toggle("collapsed", state.collapsed);
    document.querySelector(".collapse").innerHTML = svg("collapse");
    document.querySelector(".search-icon").innerHTML = svg("search");
    const n = DATA.counts;
    document.getElementById("topIcons").innerHTML =
      '<button class="top-icon" data-soon="Map" aria-label="Map">' + svg("pin") + "</button>" +
      '<button class="top-icon" data-soon="Notifications" aria-label="Notifications">' + svg("bell") + '<span class="badge">' + n.notifications + "</span></button>" +
      '<button class="top-icon" data-soon="Tasks" aria-label="Tasks">' + svg("checklist") + "</button>" +
      '<button class="top-icon" data-soon="Recent activity" aria-label="Recent activity">' + svg("history") + "</button>";
    document.getElementById("chat").innerHTML = "<i>" + svg("bubble") + '</i><span class="badge">' + n.chat + "</span>";
  }

  function art(name) {
    if (name === "Invoices") {
      return '<svg class="art" viewBox="0 0 110 60" style="stroke-width:1.500"><path d="M8 10h22" stroke="#0d6ebd" stroke-width="4"/><path d="M8 20h90M8 27h80M8 34h60M8 48h30" stroke="#ddd" stroke-width="2"/><path d="M78 48h20" stroke="#0d6ebd" stroke-width="7"/></svg>';
    }
    const row = (y, on) => '<circle cx="12" cy="' + y + '" r="4" ' + (on ? 'fill="#0d6ebd" stroke="#0d6ebd"' : 'stroke="#bbb"') + '/><path d="M22 ' + y + 'h' + (on ? 70 : 54) + '" stroke="#ccc" stroke-width="3"/>';
    return '<svg class="art" viewBox="0 0 110 60">' + row(10, true) + row(24, true) + row(38, false) + row(52, false) + "</svg>";
  }

  function renderHome() {
    const h = DATA.home;
    const name = h.tourSlides[slide % h.tourSlides.length];
    const tasks = h.tasks.filter((t) => !state.hiddenTasks.includes(t.id));
    return '<section class="setup' + (state.setupClosed ? " closed" : "") + '">' +
      '<div class="setup-head"><h1>Hi ' + esc(DATA.user.first) + "! Let's get you set up in minutes.</h1>" +
        '<div class="progress"><div class="bar"><b style="width:' + h.progress + '%"></b></div><span>' + h.progress + "%</span>" +
        '<button class="setup-toggle" data-action="setup" aria-label="Show or hide setup" aria-expanded="' + !state.setupClosed + '">' + svg("chevDown") + "</button></div></div>" +
      '<div class="setup-body">' +
        (state.tourDismissed ? "" :
        '<div class="tour"><div class="tour-copy">' +
          '<div class="chips"><span class="chip rec">Recommended</span><span class="chip">2 minutes</span></div>' +
          "<h2>Take a tour of Housecall Pro</h2>" +
          "<p>A fast look at the tools that will help you book jobs, manage schedules, and get paid faster.</p>" +
          '<div class="tour-actions"><button class="pill" data-soon="The tour">Start tour</button><button class="link" data-action="dismiss-tour">Dismiss</button></div>' +
        '</div><div class="tour-art" id="tourArt">' + art(name) + "<span>" + esc(name) + "</span></div></div>") +
        (tasks.length ? '<div class="tasks">' + tasks.map((t) =>
          '<div class="task"><i>' + svg(t.icon) + "</i><b>" + esc(t.label) + "</b>" +
          '<button class="link" data-soon="Tutorials">Watch tutorial</button>' +
          '<button class="x" data-hide-task="' + t.id + '" aria-label="Hide ' + esc(t.label) + '">' + svg("close") + "</button></div>").join("") + "</div>" : "") +
      "</div>" +
      '<div class="help"><div><h3>Need help with any of these items?</h3><p>Our AI team can guide you through each onboarding task with simple, step-by-step instructions.</p></div>' +
        '<button class="pill" data-soon="Ask AI team">Ask AI team</button></div>' +
      "</section>" +
      '<div class="below"><div></div><div></div><div></div><div></div></div>';
  }

  function renderSoon(n) {
    return '<div class="soon"><h1>' + esc(n.label) + "</h1><p>This screen isn't in the sandbox yet.</p></div>";
  }

  function render() {
    renderChrome();
    renderNav();
    renderFoot();
    const n = findNav(HCP.navFor[view] || view);
    const custom = HCP.views[view];
    document.getElementById("page").innerHTML = view === "home" ? renderHome() : custom ? custom(viewArg) : renderSoon(n);
    document.title = (view === "home" ? "Home" : n.label) + " · HCP Sandbox";
    HCP.afterRender.forEach((fn) => fn());
  }

  function parseRoute(route) {
    const [id, arg] = String(route).split("/");
    return HCP.views[id] || findNav(id) ? { id, arg: arg || "" } : { id: "home", arg: "" };
  }

  function showView(route) {
    const r = parseRoute(route);
    view = r.id;
    viewArg = r.arg;
    const hash = r.arg ? r.id + "/" + r.arg : r.id;
    if (location.hash.slice(1) !== hash) location.hash = hash;
    render();
    document.getElementById("page").scrollTop = 0;
  }

  const HCP = {
    data: DATA, svg, esc, toast, notBuilt, save, render, go: showView,
    get state() { return state; },
    get view() { return view; },
    views: {}, navFor: {}, afterRender: [], onReset: [],
    onClick: (fn) => clickHandlers.push(fn),
  };

  document.addEventListener("click", (e) => {
    if (clickHandlers.some((fn) => fn(e))) return;
    const nav = e.target.closest("[data-nav]");
    if (nav) {
      const n = findNav(nav.dataset.nav);
      if (n.menu || n.arrow) notBuilt(n.label);
      else showView(n.id);
      return;
    }
    const soon = e.target.closest("[data-soon]");
    if (soon) { notBuilt(soon.dataset.soon); return; }
    const hide = e.target.closest("[data-hide-task]");
    if (hide) { state.hiddenTasks.push(hide.dataset.hideTask); save(); render(); return; }
    const act = e.target.closest("[data-action]");
    if (!act) return;
    const a = act.dataset.action;
    if (a === "collapse") state.collapsed = !state.collapsed;
    if (a === "setup") state.setupClosed = !state.setupClosed;
    if (a === "dismiss-tour") state.tourDismissed = true;
    if (a === "reset") { state = fresh(); view = "home"; viewArg = ""; location.hash = "home"; HCP.onReset.forEach((fn) => fn()); toast("Sandbox reset"); }
    save();
    render();
  });

  document.getElementById("search").addEventListener("keydown", (e) => {
    if (e.key === "Enter") notBuilt("Search");
  });
  window.addEventListener("hashchange", () => showView(location.hash.slice(1)));

  // The real tour card cycles its illustration on its own.
  setInterval(() => {
    const el = document.getElementById("tourArt");
    if (!el) return;
    slide += 1;
    const name = DATA.home.tourSlides[slide % DATA.home.tourSlides.length];
    el.innerHTML = art(name) + "<span>" + esc(name) + "</span>";
  }, 4000);

  (window.HCP_MODULES || []).forEach((m) => m(HCP));
  const start = parseRoute(location.hash.slice(1));
  view = start.id;
  viewArg = start.arg;
  render();
})();
