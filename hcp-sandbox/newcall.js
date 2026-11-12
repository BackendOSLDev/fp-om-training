// Intake module: the New Call form. Layout and labels come from the screenshots in Housecall Pro's
// public help article "Customer Intake: Setup Guide" (help article 6266173), because the account we can
// open has no intake flow set up. Request guide questions, reminders and FAQs are sample content.
window.HCP_MODULES = window.HCP_MODULES || [];
window.HCP_MODULES.push(function (HCP) {
  const { svg, esc, toast, notBuilt } = HCP;
  const D = HCP.data;
  const $ = (id) => document.getElementById(id);
  const toNum = (v) => Number(String(v).replace(/[^0-9.]/g, "")) || 0;
  const money = (n) => "$" + Number(n || 0).toFixed(2);
  const pad = (n) => String(n).padStart(2, "0");
  const today = () => { const d = new Date(); return d.getFullYear() + "-" + pad(d.getMonth() + 1) + "-" + pad(d.getDate()); };
  const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  const clock = (m) => { const h = Math.floor(m / 60) % 24; return (h % 12 || 12) + ":" + pad(m % 60) + " " + (h < 12 ? "AM" : "PM"); };

  const blankContact = () => ({ first: "", last: "", email: "", mobile: "", display: "", home: "", company: "", work: "", role: "", type: "Homeowner", street: "", unit: "", city: "", state: "", zip: "", addressNotes: "", notes: "", billsTo: "", lead: "", tags: [], notify: true });
  const blankLine = () => ({ name: "", qty: "1.00", price: "$0.00", description: "" });
  let call = null;

  function blankCall(from) {
    return { from, step: "request", tab: "flow", customerId: "", contact: blankContact(), custQuery: "", addr: "", addrOpen: false, showAll: false, notes: "", answers: {}, unit: "", jobType: "", tags: [], lead: "", services: [blankLine()], materials: [], appt: null, anchor: today(), showReminders: true, remindersOpen: true, faqOpen: {}, faqQuery: "", profile: false, more: false, saveOpen: false, leadWarn: false };
  }
  HCP.startCall = () => {
    call = blankCall(location.hash.slice(1) || "home");
    HCP.go("new-call");
  };

  function setPath(path, value) {
    const parts = path.split(".");
    let o = call;
    parts.slice(0, -1).forEach((p) => { o = o[p]; });
    o[parts[parts.length - 1]] = value;
  }
  function draw() {
    const m = $("ncMain");
    const top = m ? m.scrollTop : 0;
    HCP.render();
    const n = $("ncMain");
    if (n) n.scrollTop = top;
  }
  const lineTotal = (r) => toNum(r.qty) * toNum(r.price);
  const callTotal = () => call.services.concat(call.materials).reduce((n, r) => n + lineTotal(r), 0);
  const nameOf = () => { const c = call.contact; return c.display || (c.first + " " + c.last).trim(); };
  const addressText = () => { const c = call.contact; return [c.street, c.unit, c.city, [c.state, c.zip].filter(Boolean).join(" ")].filter(Boolean).join(", "); };
  const customers = () => HCP.state.customers;
  const addrLine = (a) => (a ? [a.street, a.unit, a.city, a.state, a.zip].filter(Boolean).join(", ") : "");

  const field = (key, label, cls) => {
    const v = key.split(".").reduce((o, k) => o[k], call);
    return '<label class="nc-f' + (cls ? " " + cls : "") + '"><input data-nc="' + key + '" value="' + esc(v) + '" placeholder=" " autocomplete="off"><span>' + label + "</span></label>";
  };
  const pick = (key, label, list) => {
    const v = key.split(".").reduce((o, k) => o[k], call);
    return '<label class="nc-f"><select data-nc="' + key + '" aria-label="' + label + '"><option value="">' + label + "</option>" + list.map((o) => "<option" + (o === v ? " selected" : "") + ">" + esc(o) + "</option>").join("") + "</select></label>";
  };
  const tagField = (scope, label) => {
    const tags = scope === "tags" ? call.tags : call.contact.tags;
    return '<div><label class="nc-f"><input data-nc-tag="' + scope + '" placeholder=" " autocomplete="off"><span>' + label + '</span></label><div class="tags">' + tags.map((t, i) => '<span class="tag">' + esc(t) + '<button data-nc-tag-del="' + scope + "." + i + '" aria-label="Remove ' + esc(t) + '">' + svg("close") + "</button></span>").join("") + "</div></div>";
  };

  // ---------- customer search ----------
  function customerResults() {
    const q = call.custQuery.trim().toLowerCase();
    if (!q) return "";
    const rows = customers().filter((c) => (c.display + " " + c.first + " " + c.last + " " + c.company + " " + c.phones.map((p) => p.number).join(" ")).toLowerCase().includes(q)).slice(0, 8);
    return '<div class="nc-drop"><button class="nc-create" data-nc-create>CREATE CUSTOMER "' + esc(call.custQuery.trim().toUpperCase()) + '"</button>' + rows.map((c) => '<button class="nc-res" data-nc-cust="' + c.id + '"><span>' + esc(c.display) + (c.dns ? ' <em class="status s-dns">Do not service</em>' : "") + "</span><span>" + esc(addrLine(c.addresses[0])) + "</span></button>").join("") + "</div>";
  }
  function useCustomer(c) {
    const a = c.addresses[0] || {};
    Object.assign(call.contact, { first: c.first, last: c.last, display: c.display, email: c.emails[0] || "", mobile: (c.phones[0] || {}).number || "", company: c.company, role: c.role, type: c.type, street: a.street || "", unit: a.unit || "", city: a.city || "", state: a.state || "", zip: a.zip || "", notes: c.notes, lead: c.lead, tags: c.tags.slice(), notify: c.notify });
    call.customerId = c.id;
    call.custQuery = "";
    call.addr = addressText();
  }
  function createFromQuery() {
    const [first, ...rest] = call.custQuery.trim().split(/\s+/);
    Object.assign(call.contact, blankContact(), { first, last: rest.join(" ") });
    call.customerId = "new";
    call.custQuery = "";
    call.step = "contact";
    call.tab = "flow";
  }

  // ---------- steps ----------
  function sideCards() {
    const a = call.appt;
    const when = a ? MONTHS[Number(a.date.slice(5, 7)) - 1] + " " + Number(a.date.slice(8)) + " at " + clock(a.start) + " - " + clock(a.end) : "";
    const card = (step, icon, label, extra, body) => '<div class="nc-step' + (call.step === step ? " on" : "") + '"><button class="nc-step-head" data-nc-step="' + step + '"><i>' + svg(icon) + "</i><b>" + label + "</b>" + extra + "</button>" + (body ? '<div class="nc-step-body">' + esc(body) + "</div>" : "") + "</div>";
    const undo = a ? '<span class="nc-undo" role="button" tabindex="0" data-nc-undo aria-label="Clear schedule">' + svg("undo") + "</span>" : "";
    return card("request", "wrench", "Request", '<span id="ncAmt" class="nc-amt">' + money(callTotal()) + "</span>") + '<i class="nc-link"></i>' + card("schedule", "calendar", "Schedule", undo, when) + '<i class="nc-link"></i>' + card("contact", "person", "Contact", "", nameOf());
  }
  function faqPanel() {
    const q = call.faqQuery.trim().toLowerCase();
    const rows = D.faqs.map((f, i) => [f, i]).filter(([f]) => !q || (f.q + " " + f.a).toLowerCase().includes(q));
    return '<div class="nc-faq-search"><i>' + svg("search") + '</i><input data-nc-faq-search placeholder="Search" aria-label="Search FAQs" value="' + esc(call.faqQuery) + '"><button class="icon-btn" data-nc-faq-clear aria-label="Clear search">' + svg("close") + "</button></div>" +
      '<div id="ncFaqs">' + rows.map(([f, i]) => '<div class="nc-faq"><button data-nc-faq="' + i + '" aria-expanded="' + !!call.faqOpen[i] + '"><span>' + esc(f.q) + "</span><i" + (call.faqOpen[i] ? ' style="transform:rotate(180deg)"' : "") + ">" + svg("chevDown") + "</i></button>" + (call.faqOpen[i] ? "<p>" + esc(f.a) + "</p>" : "") + "</div>").join("") + "</div>";
  }
  function guideRows() {
    return D.requestGuide.filter((g) => !g.showFor || [].concat(call.answers[g.showFor.id] || []).includes(g.showFor.answer)).map((g) => {
      if (g.type === "reminder") return '<div class="g-rem"><div>' + esc(g.title) + "</div><div>" + esc(g.note) + "</div></div>";
      const val = call.answers[g.id];
      const control = g.type === "text"
        ? '<input class="g-text" data-nc="answers.' + g.id + '" value="' + esc(val || "") + '" aria-label="' + esc(g.q) + '">'
        : '<div class="g-pills">' + g.options.map((o) => '<button class="' + ([].concat(val || []).includes(o) ? "on" : "") + '" data-nc-ans="' + g.id + '" data-val="' + esc(o) + '" data-multi="' + (g.type === "multi") + '">' + esc(o) + "</button>").join("") + "</div>";
      return '<div class="g-row"><div class="g-q">' + esc(g.q) + (g.hint ? "<small>" + esc(g.hint) + "</small>" : "") + "</div>" + control + "</div>";
    }).join("");
  }
  function lineRows(key, kind) {
    return call[key].map((r, i) => '<div class="nc-line"><i class="nc-grip"></i><label class="nc-f nc-name"><input list="ncBook-' + kind + '" data-nc-name="' + key + "." + i + '" data-kind="' + kind + '" value="' + esc(r.name) + '" placeholder=" " autocomplete="off"><span>Item name</span></label>' +
      '<label class="nc-f"><input data-nc-num="' + key + "." + i + '.qty" value="' + esc(r.qty) + '" placeholder=" "><span>Qty</span></label><label class="nc-f"><input data-nc-num="' + key + "." + i + '.price" value="' + esc(r.price) + '" placeholder=" "><span>Unit price</span></label>' +
      '<b data-amt="' + key + "." + i + '">' + money(lineTotal(r)) + '</b><button class="icon-btn small" data-nc-line-del="' + key + "." + i + '" aria-label="Remove item">' + svg("close") + "</button>" +
      '<label class="nc-f nc-desc"><input data-nc="' + key + "." + i + '.description" value="' + esc(r.description) + '" placeholder=" "><span>Description (optional)</span></label></div>').join("");
  }
  function requestStep() {
    const book = (kind) => '<datalist id="ncBook-' + kind + '">' + D.priceBook.filter((p) => p.kind === kind).map((p) => '<option value="' + esc(p.name) + '">').join("") + "</datalist>";
    return '<h2 class="nc-h">Request</h2><section class="nc-card"><h3>Request description</h3><label class="nc-f nc-area"><textarea data-nc="notes" placeholder=" ">' + esc(call.notes) + "</textarea><span>Private notes</span></label>" +
      '<h3>Request guide</h3><div class="guide">' + guideRows() + "</div>" +
      '<div class="nc-grid2">' + pick("unit", "Business unit", D.businessUnits) + pick("jobType", "Job type", D.jobTypes) + tagField("tags", "Tags (press enter)") + pick("lead", "Lead source", D.leadSources) + "</div>" +
      '<h3>Line items</h3><div class="nc-lines"><div class="nc-lines-head"><span>Services</span><button class="link" data-soon="Service Price Book">SERVICE PRICE BOOK</button></div>' + lineRows("services", "service") +
      (call.materials.length ? '<div class="nc-lines-head"><span>Materials</span><button class="link" data-soon="Material Price Book">MATERIAL PRICE BOOK</button></div>' + lineRows("materials", "material") : "") +
      '<div class="nc-add"><button class="link" data-nc-line-add="services">+ SERVICES ITEM</button><button class="link" data-nc-line-add="materials">+ MATERIALS ITEM</button></div>' +
      '<div class="nc-sums"><div><span>Subtotal</span><b id="ncSub">' + money(callTotal()) + '</b></div><div><label class="nc-f nc-tax"><select aria-label="Tax rate"><option>Tax rate</option></select></label><b>$0.00</b></div><div class="big"><span>Total</span><b id="ncTot">' + money(callTotal()) + "</b></div></div></div>" +
      '<p class="nc-thanks">Thank you for doing business with us.</p>' + book("service") + book("material") + "</section>";
  }
  function scheduleStep() {
    const days = HCP.sched.weekOf(call.anchor);
    return '<div class="nc-h-row"><h2 class="nc-h">Schedule</h2><label class="nc-switch"><span>Show reminders</span><input type="checkbox" data-nc-show-rem' + (call.showReminders ? " checked" : "") + "><i></i></label></div>" +
      (call.showReminders ? '<section class="nc-rem"><button class="nc-rem-head" data-nc-rem-fold aria-expanded="' + call.remindersOpen + '"><i>' + svg("note") + "</i><b>Reminder</b><em" + (call.remindersOpen ? ' style="transform:rotate(180deg)"' : "") + ">" + svg("chevDown") + "</em></button>" + (call.remindersOpen ? D.scheduleReminders.map(([a, b]) => "<div><span>" + esc(a) + "</span><span>" + esc(b) + "</span></div>").join("") : "") + "</section>" : "") +
      '<section class="nc-board"><div class="nc-board-bar"><i>' + svg("wrench") + '</i><span class="nc-board-nav">' + HCP.sched.nav(days) + '</span><span class="nc-board-right"><span>Color by</span><button class="drop-btn blue" data-soon="Color by"><span>Employee</span><i>' + svg("chevDown") + '</i></button><button class="drop-btn blue" data-soon="Calendar view"><span>Dispatch</span><i>' + svg("chevDown") + "</i></button></span></div>" + HCP.sched.board(days) + "</section>";
  }
  function contactStep() {
    const c = call.contact;
    const all = call.showAll;
    return '<h2 class="nc-h">Contact</h2><section class="nc-card"><div class="nc-card-top"><h4><i>' + svg("person") + '</i>Contact info</h4><label class="nc-switch"><span>Show all fields</span><input type="checkbox" data-nc-show-all' + (all ? " checked" : "") + "><i></i></label></div>" +
      '<div class="nc-grid2">' + field("contact.first", "First name") + field("contact.last", "Last name") + field("contact.email", "Email") + field("contact.mobile", "Mobile phone") +
      (all ? '<div><button class="pill outline nc-mini" data-soon="Another email">+ EMAIL</button></div><div></div>' + field("contact.display", "Display name") + field("contact.home", "Home phone") + field("contact.company", "Company") + field("contact.work", "Work phone") + field("contact.role", "Role") + '<div><button class="pill outline nc-mini" data-soon="Another phone">+ PHONE</button></div><div class="nc-radios">' + ["Homeowner", "Business"].map((t) => '<label><input type="radio" name="ncType" data-nc="contact.type" value="' + t + '"' + (c.type === t ? " checked" : "") + "> " + t + "</label>").join("") + "</div><div></div>" : "") +
      "</div><hr>" +
      '<h4><i>' + svg("place") + '</i>Address</h4><div class="nc-addr">' + field("contact.street", "Street", "wide") + field("contact.unit", "Unit") + field("contact.city", "City") + field("contact.state", "State") + field("contact.zip", "Zip") + field("contact.addressNotes", "Address notes", "full") + "</div>" +
      (all ? '<button class="pill outline nc-mini nc-addr-add" data-soon="Another address">+ ADDRESS</button>' : "") + "<hr>" +
      '<h4><i>' + svg("note") + '</i>Notes</h4><div class="nc-grid2">' + field("contact.notes", "Customer notes") + field("contact.billsTo", "This customer bills to") + pick("contact.lead", "Lead source", D.leadSources) + tagField("contact.tags", "Customer tags (press enter)") + "</div>" +
      (all ? '<hr><label class="check"><input type="checkbox" data-nc-notify' + (c.notify ? " checked" : "") + "> Receive notifications</label>" : "") + "</section>";
  }
  function profileView() {
    const c = call.contact;
    return '<nav class="nc-tabs">' + ["Profile", "Estimates", "Jobs", "Invoices"].map((t, i) => (i === 0 ? '<button class="on">' + t.toUpperCase() + "</button>" : '<button data-soon="' + t + ' tab">' + t.toUpperCase() + "</button>")).join("") + '</nav><div class="nc-profile"><section class="nc-card"><h3>Summary</h3><dl class="kv"><dt>Lifetime value</dt><dd>$0.00</dd><dt>Outstanding balance</dt><dd>$0.00</dd></dl><h3>Contact info</h3><dl class="kv"><dt>Contact</dt><dd>' + esc(nameOf()) + "</dd><dt>Phone</dt><dd>" + esc(c.mobile || "-") + "</dd><dt>Email</dt><dd>" + esc(c.email || "-") + '</dd></dl></section><section class="nc-card"><div class="nc-map">Map isn\'t in the sandbox</div><h3>' + (addressText() ? "1 address" : "No addresses") + "</h3><p>" + esc(addressText()) + "</p></section></div>";
  }
  function barHtml() {
    const c = call.contact;
    const name = call.customerId
      ? '<div class="nc-who"><i>' + svg("person") + "</i><span>" + esc(nameOf() || "New customer") + "</span></div>"
      : '<div class="nc-cust-wrap"><i>' + svg("person") + '</i><input id="ncCustInput" data-nc-cust-search placeholder="Customer name" aria-label="Customer name" value="' + esc(call.custQuery) + '" autocomplete="off"><div id="ncCustDrop">' + customerResults() + "</div></div>";
    const right = call.customerId
      ? (c.mobile ? '<span class="nc-meta"><i>' + svg("phone") + "</i>" + esc(c.mobile) + "</span>" : "") + (c.email ? '<span class="nc-meta"><i>' + svg("mail") + "</i>" + esc(c.email) + "</span>" : '<span class="nc-meta"><i>' + svg("mail") + "</i></span>") +
        (call.customerId === "new" ? "" : '<button class="link nc-prof" data-nc-profile>' + (call.profile ? "HIDE PROFILE" : "SHOW PROFILE") + '<i' + (call.profile ? ' style="transform:rotate(180deg)"' : "") + ">" + svg("chevDown") + "</i></button>") + '<span class="nc-more-wrap"><button class="icon-btn" data-nc-more aria-label="More">' + svg("dots") + "</button>" + (call.more ? '<div class="nc-pop"><button data-nc-detach>Detach customer</button></div>' : "") + "</span>"
      : "";
    return name + '<label class="nc-addr-bar"><i>' + svg("place") + '</i><input data-nc-addr placeholder="Address lookup" aria-label="Address lookup" value="' + esc(call.addr) + '" autocomplete="off"></label>' + right;
  }
  function renderCall() {
    if (!call) call = blankCall("home");
    HCP.sched.setPicker(call.step === "schedule" && !call.profile && call.tab !== "x" ? picker : null);
    const main = call.step === "request" ? requestStep() : call.step === "schedule" ? scheduleStep() : contactStep();
    const can = !!call.customerId;
    return '<div class="nc" role="dialog" aria-modal="true" aria-labelledby="ncTitle"><header class="nc-head"><button class="icon-btn" data-nc-close aria-label="Close">' + svg("close") + '</button><h1 id="ncTitle">New Call</h1><button class="link nc-cancel" data-nc-close>CANCEL</button><span class="nc-save-wrap"><button class="pill nc-save' + (can ? "" : " off") + '" data-nc-save-open' + (can ? "" : " disabled") + ">SAVE AS...</button>" + (call.saveOpen ? '<div class="nc-pop">' + ["Job", "Estimate", "Lead"].map((t) => '<button data-nc-save="' + t + '">' + t + "</button>").join("") + "</div>" : "") + "</span></header>" +
      '<div class="nc-bar">' + barHtml() + "</div>" +
      (call.addrOpen ? '<div class="nc-strip"><div class="nc-strip-top"><button class="link" data-nc-addr-use>USE THIS ADDRESS</button><button class="link" data-nc-addr-close>CLOSE</button></div><div class="nc-map">Map isn\'t in the sandbox</div></div>' : "") +
      (call.profile ? '<div class="nc-prof-body" id="ncMain">' + profileView() + "</div>" :
      '<div class="nc-body"><aside class="nc-side"><div class="nc-tab-row"><button class="' + (call.tab === "flow" ? "on" : "") + '" data-nc-tab="flow">INTAKE FLOW</button><button class="' + (call.tab === "faq" ? "on" : "") + '" data-nc-tab="faq">FAQ</button></div><div class="nc-side-body">' + (call.tab === "faq" ? faqPanel() : sideCards()) + '</div><button class="nc-feedback" data-soon="Feedback"><i>' + svg("bubble") + "</i>GIVE US FEEDBACK<em>" + svg("chevDown") + '</em></button></aside><main class="nc-main" id="ncMain">' + main + "</main></div>") +
      (call.leadWarn ? '<div class="modal"><div class="dialog small-dialog" role="alertdialog" aria-modal="true"><h2>Scheduling information will be lost</h2><p>Saving request guide as a lead won\'t include your scheduling information. Are you sure you want to save this as lead anyway?</p><div><button class="pill outline" data-nc-lead-cancel>CANCEL</button><button class="pill" data-nc-lead-save>SAVE</button></div></div></div>' : "") + "</div>";
  }
  const picker = {
    get anchor() { return call.anchor; },
    set anchor(v) { call.anchor = v; },
    get appt() { return call.appt; },
    onPick(p) { call.appt = { date: p.date, start: p.start, end: p.start + 60, team: p.team }; draw(); },
    refresh: () => draw(),
  };

  // ---------- saving ----------
  function saveCustomer() {
    const c = call.contact;
    const address = c.street.trim() ? { street: c.street.trim(), unit: c.unit, city: c.city, state: c.state, zip: c.zip } : null;
    const phones = c.mobile.trim() ? [{ kind: "Mobile", number: c.mobile.trim(), note: "" }] : [];
    const uid = (p) => p + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
    if (call.customerId === "new") {
      const saved = { id: uid("c"), first: c.first.trim(), last: c.last.trim(), display: c.display.trim() || (c.first + " " + c.last).trim(), emails: c.email.trim() ? [c.email.trim()] : [], phones, company: c.company, role: c.role, type: c.type, dns: false, addresses: address ? [Object.assign({ id: uid("a") }, address)] : [], notes: c.notes, tags: c.tags, lead: c.lead, referredBy: "", billsTo: "", notify: c.notify };
      customers().unshift(saved);
      return { customer: saved, addressId: saved.addresses[0] ? saved.addresses[0].id : "" };
    }
    const saved = customers().find((x) => x.id === call.customerId);
    Object.assign(saved, { first: c.first, last: c.last, display: c.display, emails: c.email.trim() ? [c.email.trim()] : [], company: c.company, role: c.role, type: c.type, notes: c.notes, lead: c.lead, tags: c.tags, notify: c.notify });
    if (phones.length) saved.phones = phones.concat(saved.phones.slice(1));
    let match = address && saved.addresses.find((a) => a.street === address.street);
    if (address && !match) { match = Object.assign({ id: uid("a") }, address); saved.addresses.unshift(match); }
    return { customer: saved, addressId: match ? match.id : "" };
  }
  function saveJob() {
    const { customer, addressId } = saveCustomer();
    const id = Math.max.apply(null, HCP.state.jobs.map((x) => x.id)) + 1;
    const lines = (list) => list.filter((r) => r.name.trim()).map((r) => ({ name: r.name.trim(), description: r.description, qty: toNum(r.qty), price: toNum(r.price) }));
    const guide = D.requestGuide.filter((g) => g.type !== "reminder" && [].concat(call.answers[g.id] || []).join("").trim()).map((g) => ({ q: g.q, a: [].concat(call.answers[g.id]).join(", ") }));
    const a = call.appt;
    HCP.state.jobs.unshift({ id, customerId: customer.id, addressId, status: a ? "Scheduled" : "Not scheduled", appt: a ? { date: a.date, start: a.start, end: a.end, anytime: false, team: a.team, arrival: 240 } : null, created: today(), jobType: call.jobType, unit: call.unit, lead: call.lead, tags: call.tags, notes: call.notes, guide, services: lines(call.services), materials: lines(call.materials) });
    HCP.save();
    call = null;
    toast("Job saved");
    HCP.go("job/" + id);
  }

  // ---------- events ----------
  HCP.onClick((e) => {
    if (HCP.view !== "new-call" || !call) return false;
    const t = (s) => e.target.closest(s);
    let b;
    const hadPop = call.saveOpen || call.more;
    if (hadPop && !t("[data-nc-save-open]") && !t("[data-nc-more]") && !t(".nc-pop")) { call.saveOpen = false; call.more = false; draw(); return true; }
    if (t("[data-nc-close]")) { const back = call.from; call = null; HCP.go(back); return true; }
    if ((b = t("[data-nc-tab]"))) { call.tab = b.dataset.ncTab; draw(); return true; }
    if (t("[data-nc-undo]")) { call.appt = null; draw(); return true; }
    if ((b = t("[data-nc-step]"))) { call.step = b.dataset.ncStep; call.profile = false; if (call.step === "schedule") HCP.sched.aim(call.anchor); HCP.render(); const m = $("ncMain"); if (m) m.scrollTop = 0; return true; }
    if ((b = t("[data-nc-cust]"))) { useCustomer(customers().find((c) => c.id === b.dataset.ncCust)); draw(); return true; }
    if (t("[data-nc-create]")) { createFromQuery(); draw(); return true; }
    if ((b = t("[data-nc-ans]"))) {
      const id = b.dataset.ncAns;
      const v = b.dataset.val;
      if (b.dataset.multi === "true") {
        const cur = [].concat(call.answers[id] || []);
        call.answers[id] = cur.includes(v) ? cur.filter((x) => x !== v) : cur.concat(v);
      } else call.answers[id] = call.answers[id] === v ? "" : v;
      draw();
      return true;
    }
    if ((b = t("[data-nc-line-add]"))) { call[b.dataset.ncLineAdd].push(blankLine()); draw(); return true; }
    if ((b = t("[data-nc-line-del]"))) { const [k, i] = b.dataset.ncLineDel.split("."); call[k].splice(Number(i), 1); draw(); return true; }
    if ((b = t("[data-nc-tag-del]"))) { const [scope, sub, idx] = b.dataset.ncTagDel.split("."); const list = sub === "tags" ? call.contact.tags : call.tags; list.splice(Number(sub === "tags" ? idx : sub), 1); if (scope) draw(); return true; }
    if ((b = t("[data-nc-faq]"))) { const i = b.dataset.ncFaq; call.faqOpen[i] = !call.faqOpen[i]; draw(); return true; }
    if (t("[data-nc-faq-clear]")) { call.faqQuery = ""; draw(); return true; }
    if (t("[data-nc-rem-fold]")) { call.remindersOpen = !call.remindersOpen; draw(); return true; }
    if (t("[data-nc-profile]")) { call.profile = !call.profile; draw(); return true; }
    if (t("[data-nc-more]")) { call.more = !call.more; draw(); return true; }
    if (t("[data-nc-detach]")) { Object.assign(call, { customerId: "", contact: blankContact(), more: false, profile: false, addr: "" }); draw(); return true; }
    if (t("[data-nc-addr-close]")) { call.addrOpen = false; draw(); return true; }
    if (t("[data-nc-addr-use]")) {
      const [street, city, rest] = call.addr.split(",").map((x) => x.trim());
      const [state, zip] = (rest || "").split(/\s+/);
      Object.assign(call.contact, { street: street || "", city: city || "", state: state || "", zip: zip || "" });
      call.addrOpen = false;
      draw();
      return true;
    }
    if (t("[data-nc-save-open]")) { call.saveOpen = !call.saveOpen; draw(); return true; }
    if ((b = t("[data-nc-save]"))) {
      call.saveOpen = false;
      const kind = b.dataset.ncSave;
      if (kind === "Job") saveJob();
      else if (kind === "Lead" && call.appt) { call.leadWarn = true; draw(); }
      else { notBuilt("Saving as " + (kind === "Lead" ? "a lead" : "an estimate")); draw(); }
      return true;
    }
    if (t("[data-nc-lead-cancel]")) { call.leadWarn = false; draw(); return true; }
    if (t("[data-nc-lead-save]")) { call.leadWarn = false; notBuilt("Saving as a lead"); draw(); return true; }
    return false;
  });
  function refreshTotals() {
    call.services.concat([]).forEach((r, i) => { const el = document.querySelector('[data-amt="services.' + i + '"]'); if (el) el.textContent = money(lineTotal(r)); });
    call.materials.forEach((r, i) => { const el = document.querySelector('[data-amt="materials.' + i + '"]'); if (el) el.textContent = money(lineTotal(r)); });
    ["ncAmt", "ncSub", "ncTot"].forEach((id) => { if ($(id)) $(id).textContent = money(callTotal()); });
  }
  document.addEventListener("input", (e) => {
    if (HCP.view !== "new-call" || !call) return;
    const el = e.target;
    if (el.dataset.nc) { if (el.type === "radio" && !el.checked) return; setPath(el.dataset.nc, el.value); return; }
    if (el.dataset.ncNum) { setPath(el.dataset.ncNum, el.value); refreshTotals(); return; }
    if (el.dataset.ncName) {
      setPath(el.dataset.ncName + ".name", el.value);
      const p = D.priceBook.find((x) => x.kind === el.dataset.kind && x.name === el.value);
      if (p) { const [k, i] = el.dataset.ncName.split("."); Object.assign(call[k][Number(i)], { price: money(p.price), description: p.description }); draw(); }
      return;
    }
    if (el.matches("[data-nc-cust-search]")) { call.custQuery = el.value; $("ncCustDrop").innerHTML = customerResults(); return; }
    if (el.matches("[data-nc-addr]")) { call.addr = el.value; return; }
    if (el.matches("[data-nc-faq-search]")) { call.faqQuery = el.value; const pos = el.selectionStart; draw(); const n = document.querySelector("[data-nc-faq-search]"); n.focus(); n.setSelectionRange(pos, pos); return; }
  });
  document.addEventListener("change", (e) => {
    if (HCP.view !== "new-call" || !call) return;
    const el = e.target;
    if (el.matches("[data-nc-show-all]")) { call.showAll = el.checked; draw(); }
    if (el.matches("[data-nc-show-rem]")) { call.showReminders = el.checked; draw(); }
    if (el.matches("[data-nc-notify]")) call.contact.notify = el.checked;
  });
  document.addEventListener("keydown", (e) => {
    if (HCP.view !== "new-call" || !call) return;
    const el = e.target;
    if (e.key === "Enter" && el.matches("[data-nc-tag]") && el.value.trim()) {
      e.preventDefault();
      (el.dataset.ncTag === "tags" ? call.tags : call.contact.tags).push(el.value.trim());
      draw();
      const again = document.querySelector('[data-nc-tag="' + el.dataset.ncTag + '"]');
      if (again) again.focus();
    } else if (e.key === "Enter" && el.matches("[data-nc-addr]") && el.value.trim()) {
      e.preventDefault();
      call.addrOpen = true;
      draw();
    } else if ((e.key === "Enter" || e.key === " ") && el.matches("[data-nc-undo]")) {
      e.preventDefault();
      call.appt = null;
      draw();
    }
  });

  HCP.views["new-call"] = renderCall;
  HCP.navFor["new-call"] = "jobs";
  HCP.afterRender.push(() => { if (HCP.view !== "new-call") HCP.sched.setPicker(null); });
  HCP.onReset.push(() => { call = null; });
});
