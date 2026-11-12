// Jobs and customers module: Create menu, new customer, New job, Customers and Jobs lists, job page, practice calls.
// New job and the job page are matched to a live Housecall Pro account. The Customers pages and the
// add-customer dialog follow HCP's help articles and haven't been compared with the live screens.
window.HCP_MODULES = window.HCP_MODULES || [];
window.HCP_MODULES.push(function (HCP) {
  const { svg, esc, toast, notBuilt } = HCP;
  const D = HCP.data;
  const ui = { line: null, confirmClose: false, jobFold: {}, job: null, jobFrom: "", cust: null, afterCust: null, custQuery: "", jobTab: "All", listQuery: "", error: "", results: {} };

  const digits = (t) => String(t || "").replace(/\D/g, "");
  const money = (n) => "$" + Number(n || 0).toFixed(2);
  const custById = (id) => HCP.state.customers.find((c) => c.id === id);
  const uid = (p) => p + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
  const line = (a) => a ? [a.street, a.unit, a.city, a.state, a.zip].filter(Boolean).join(", ") : "";
  const options = (list, val, ph) => (ph ? '<option value="">' + esc(ph) + "</option>" : "") +
    list.map((o) => "<option" + (o === val ? " selected" : "") + ">" + esc(o) + "</option>").join("");

  function setPath(path, value) {
    const parts = path.split(".");
    let o = ui;
    parts.slice(0, -1).forEach((p) => { o = o[p]; });
    o[parts[parts.length - 1]] = value;
  }
  function refocus(id) {
    const el = id && document.getElementById(id);
    if (el) el.focus();
  }

  // ---------- Create menu ----------
  function toggleCreateMenu(btn) {
    const menu = document.getElementById("createMenu");
    if (!menu.hidden) { menu.hidden = true; return; }
    const r = btn.getBoundingClientRect();
    menu.className = "menu";
    menu.style.left = r.left + "px";
    menu.style.top = r.bottom + 4 + "px";
    menu.innerHTML = [["job", "Job", "wrench"], ["Recurring Job", "Recurring Job", "repeat"], ["Estimate", "Estimate", "clipboard"], ["Event", "Event", "calendar"], ["customer", "Customer", "person"], ["Intake", "Intake", "phone"], ["Lead", "Lead", "target"]]
      .map(([id, label, icon]) => '<button data-new="' + id + '"><i>' + svg(icon) + "</i>" + label + (label === "Recurring Job" ? '<span class="menu-new">New</span>' : "") + "</button>").join("");
    menu.hidden = false;
  }

  // ---------- customer form ----------
  function blankCustomer() {
    return { first: "", last: "", display: "", emails: [""], phones: [{ kind: "Mobile", number: "", note: "" }], company: "", role: "", type: "Homeowner", dns: false, addresses: [{ street: "", unit: "", city: "", state: "", zip: "" }], notes: "", tags: [], tagText: "", lead: "", referredBy: "", billsTo: "", notify: true };
  }
  function openCustomer(afterCust) {
    ui.cust = blankCustomer();
    ui.afterCust = afterCust || null;
    ui.error = "";
    renderModal();
    refocus("cf-first");
  }
  const custOptions = (val, ph) => '<option value="">' + ph + "</option>" + HCP.state.customers.map((c) => '<option value="' + c.id + '"' + (c.id === val ? " selected" : "") + ">" + esc(c.display) + "</option>").join("");
  function tagChips(tags, scope) {
    return tags.map((t, i) => '<span class="tag">' + esc(t) + '<button data-tag-del="' + scope + "." + i + '" aria-label="Remove ' + esc(t) + '">' + svg("close") + "</button></span>").join("");
  }
  function renderModal() {
    const c = ui.cust;
    const el = document.getElementById("modal");
    if (!c) { el.hidden = true; el.innerHTML = ""; return; }
    el.hidden = false;
    el.innerHTML = '<div class="dialog" role="dialog" aria-modal="true" aria-labelledby="custTitle">' +
      '<div class="dialog-head"><h2 id="custTitle">Add new customer</h2><button class="icon-btn" data-close-modal aria-label="Close">' + svg("close") + "</button></div>" +
      '<div class="dialog-body">' +
      '<div class="sec-title">Contact info</div><div class="fields">' +
        '<label>First name<input id="cf-first" data-b="cust.first" value="' + esc(c.first) + '"></label>' +
        '<label>Last name<input data-b="cust.last" value="' + esc(c.last) + '"></label>' +
        '<label class="wide">Display name <small>Shown on invoices</small><input data-b="cust.display" value="' + esc(c.display) + '"></label>' +
        c.emails.map((m, i) => '<label class="wide">Email<input type="email" data-b="cust.emails.' + i + '" value="' + esc(m) + '"></label>').join("") +
        '<div class="wide"><button class="link" data-add="email">+ Email</button></div>' +
        c.phones.map((p, i) => '<div class="wide phone-row"><label>Type<select data-b="cust.phones.' + i + '.kind">' + options(["Mobile", "Home", "Work"], p.kind) + "</select></label>" +
          '<label>Phone<input type="tel" data-b="cust.phones.' + i + '.number" value="' + esc(p.number) + '"></label>' +
          '<label>Note<input data-b="cust.phones.' + i + '.note" value="' + esc(p.note) + '"></label></div>').join("") +
        '<div class="wide"><button class="link" data-add="phone">+ Phone</button></div>' +
        '<label>Company<input data-b="cust.company" value="' + esc(c.company) + '"></label>' +
        '<label>Role<input data-b="cust.role" value="' + esc(c.role) + '"></label>' +
        '<div class="wide radios"><span>Customer type</span>' + ["Homeowner", "Business"].map((t) => '<label><input type="radio" name="ctype" data-b="cust.type" value="' + t + '"' + (c.type === t ? " checked" : "") + "> " + t + "</label>").join("") + "</div>" +
        '<label class="wide check"><input type="checkbox" data-b="cust.dns"' + (c.dns ? " checked" : "") + "> Do not service</label>" +
      "</div>" +
      '<div class="sec-title">Address</div><div class="fields">' +
        c.addresses.map((a, i) => '<label class="wide">Street<input data-b="cust.addresses.' + i + '.street" value="' + esc(a.street) + '"></label>' +
          '<label>Unit<input data-b="cust.addresses.' + i + '.unit" value="' + esc(a.unit) + '"></label>' +
          '<label>City<input data-b="cust.addresses.' + i + '.city" value="' + esc(a.city) + '"></label>' +
          '<label>State<input data-b="cust.addresses.' + i + '.state" value="' + esc(a.state) + '"></label>' +
          '<label>Zip<input data-b="cust.addresses.' + i + '.zip" value="' + esc(a.zip) + '"></label>').join("") +
        '<div class="wide"><button class="link" data-add="address">+ Address</button></div>' +
      "</div>" +
      '<div class="sec-title">Notes</div><div class="fields">' +
        '<label class="wide">Customer notes <small>Internal only</small><textarea data-b="cust.notes">' + esc(c.notes) + "</textarea></label>" +
        '<div class="wide"><label>Customer tags<input id="cf-tag" data-tag-input="cust" placeholder="Type a tag and press Enter"></label><div class="tags">' + tagChips(c.tags, "cust") + "</div></div>" +
        '<label>This customer bills to<select data-b="cust.billsTo">' + custOptions(c.billsTo, "None") + "</select></label>" +
        '<label>Lead source<select data-b="cust.lead">' + options(D.leadSources, c.lead, "Select") + "</select></label>" +
      "</div>" +
      '<div class="sec-title">Referred by</div><div class="fields">' +
        '<label class="wide">Referred by<select data-b="cust.referredBy">' + custOptions(c.referredBy, "Search customers") + "</select></label>" +
      "</div>" +
      (ui.error ? '<p class="form-error" role="alert">' + esc(ui.error) + "</p>" : "") +
      "</div>" +
      '<div class="dialog-foot"><label class="check"><input type="checkbox" data-b="cust.notify"' + (c.notify ? " checked" : "") + '> Send notifications</label><button class="pill" data-save-customer>Create Customer</button></div>' +
      "</div>";
  }
  function saveCustomer() {
    const c = ui.cust;
    if (!c.first.trim() && !c.last.trim() && !c.company.trim()) {
      ui.error = "Add a name or a company first.";
      renderModal();
      return;
    }
    const name = (c.first + " " + c.last).trim();
    const saved = {
      id: uid("c"), first: c.first.trim(), last: c.last.trim(), display: c.display.trim() || name || c.company.trim(),
      emails: c.emails.map((m) => m.trim()).filter(Boolean),
      phones: c.phones.filter((p) => p.number.trim()),
      company: c.company.trim(), role: c.role.trim(), type: c.type, dns: c.dns,
      addresses: c.addresses.filter((a) => a.street.trim()).map((a) => Object.assign({ id: uid("a") }, a)),
      notes: c.notes, tags: c.tags, lead: c.lead, referredBy: c.referredBy, billsTo: c.billsTo, notify: c.notify,
    };
    HCP.state.customers.unshift(saved);
    HCP.save();
    const after = ui.afterCust;
    ui.cust = null;
    renderModal();
    toast("Customer created");
    if (after === "job" && ui.job) {
      pickCustomer(saved);
      HCP.render();
    } else if (after === "list") {
      HCP.go("customer/" + saved.id);
    } else {
      HCP.render();
    }
  }

  // ---------- new job ----------
  const blankSched = () => ({ date: "", endDate: "", start: "", end: "", anytime: false, team: [], notify: false });
  function blankJob(customerId) {
    const c = customerId && custById(customerId);
    return { customerId: c ? c.id : "", addressId: c && c.addresses[0] ? c.addresses[0].id : "", confirmed: !!c, editAddress: false, template: "", services: [], materials: [], notes: "", checklist: "", jobType: "", unit: "", callback: false, tags: [], lead: c ? c.lead : "", attachments: 0, sched: blankSched(), open: {} };
  }
  HCP.startJob = (sched, from) => {
    ui.job = blankJob();
    if (sched) ui.job.sched = sched;
    ui.jobFrom = from;
    ui.custQuery = "";
    HCP.go("new-job");
  };
  function pickCustomer(c) {
    const j = ui.job;
    j.customerId = c.id;
    j.addressId = c.addresses[0] ? c.addresses[0].id : "";
    j.confirmed = c.addresses.length < 2;
    j.lead = j.lead || c.lead;
    ui.custQuery = "";
  }
  function customerMatches(q) {
    const t = q.trim().toLowerCase();
    if (!t) return [];
    const d = digits(t);
    return HCP.state.customers.filter((c) => {
      const hay = [c.display, c.first + " " + c.last, c.company].concat(c.emails, c.addresses.map(line)).join(" ").toLowerCase();
      return hay.includes(t) || (d.length >= 3 && c.phones.some((p) => digits(p.number).includes(d)));
    }).slice(0, 6);
  }
  function custResultsHtml() {
    const rows = customerMatches(ui.custQuery);
    if (!ui.custQuery.trim()) return "";
    return '<div class="dropdown">' + rows.map((c) =>
      '<button data-pick-cust="' + c.id + '"><b>' + esc(c.display) + "</b>" + (c.dns ? ' <span class="status s-dns">Do not service</span>' : "") + "<small>" + esc(line(c.addresses[0])) + (c.phones[0] ? " · " + esc(c.phones[0].number) : "") + "</small></button>").join("") +
      (rows.length ? "" : '<div class="none">No customers found</div>') + "</div>";
  }
  function customerCard() {
    const j = ui.job;
    const c = custById(j.customerId);
    if (!c) {
      return '<section class="jp-card nj-card"><div class="nj-title"><i>' + svg("person") + "</i><h3>Customer</h3></div>" +
        '<div class="nj-card-body nj-cust"><div class="search-wrap"><input id="jobCust" data-cust-search placeholder="Name, email, phone, or address" value="' + esc(ui.custQuery) + '" autocomplete="off"><div id="custResults">' + custResultsHtml() + "</div></div>" +
        '<button class="link new-cust" data-new-cust-in-job>+ New customer</button></div></section>';
    }
    const addr = c.addresses.find((a) => a.id === j.addressId);
    const picking = !j.confirmed || j.editAddress;
    return '<section class="jp-card nj-card"><div class="nj-title"><i>' + svg("person") + '</i><h3>Customer</h3><button class="icon-btn small" data-clear-cust aria-label="Change customer">' + svg("close") + '</button></div><div class="nj-card-body">' +
      '<p class="strong">' + esc(c.display) + (c.dns ? ' <span class="status s-dns">Do not service</span>' : "") + "</p>" +
      (c.phones[0] ? "<p>" + esc(c.phones[0].number) + "</p>" : "") +
      (c.notes ? '<p class="muted">' + esc(c.notes) + "</p>" : "") +
      (picking
        ? '<label class="block">Service address<select data-job-address>' + c.addresses.map((a) => '<option value="' + a.id + '"' + (a.id === j.addressId ? " selected" : "") + ">" + esc(line(a)) + "</option>").join("") + "</select></label>" +
          '<button class="pill small" data-confirm-address>Save</button>'
        : '<p class="addr">' + esc(line(addr) || "No address on file") + (c.addresses.length > 1 ? '<button class="icon-btn small" data-edit-address aria-label="Change service address">' + svg("pencil") + "</button>" : "") + "</p>") +
      "</div></section>";
  }
  function itemsSection(kind, title, key) {
    const book = (kind === "service" ? "Service" : "Material") + " Price Book";
    return '<div class="lis-head"><h4>' + title + '</h4><button class="link" data-soon="' + book + '">' + book + '<i class="bk">' + svg("bookmark") + "</i></button></div>" +
      ui.job[key].map((r, i) => '<div class="li"><div class="li-top"><b>' + esc(r.name) + "</b><span><small>Quantity</small>" + r.qty + "</span><span><small>Unit price</small>" + money(r.price) + "</span><span><small>Total price</small>" + money(r.qty * r.price) + '</span><button class="icon-btn small plus" data-item-del="' + key + "." + i + '" aria-label="Remove ' + esc(r.name) + '">' + svg("close") + "</button></div><p>" + esc(r.description) + "</p></div>").join("") +
      '<button class="lis-add" data-line-add="' + kind + '"><span>Add ' + kind + "</span><i>" + svg("plus") + "</i></button>";
  }
  const jobTotal = (j) => j.services.concat(j.materials).reduce((n, r) => n + Number(r.qty || 0) * Number(r.price || 0), 0);
  function rowCard(key, label, icon, body, hasValue) {
    const open = ui.job.open[key] || hasValue;
    return '<div class="nj-row' + (open ? " on" : "") + '"><div class="nj-row-head"><i>' + svg(icon) + "</i><span>" + label + '</span><button class="icon-btn small plus" data-row-open="' + key + '" aria-label="Add ' + label + '">' + svg("plus") + "</button></div>" + (open ? '<div class="nj-row-body">' + body + "</div>" : "") + "</div>";
  }
  function scheduleCard() {
    const s = ui.job.sched;
    const off = s.anytime ? " disabled" : "";
    const dated = (label, dateKey, timeKey) => '<div class="when"><span>' + label + '</span><input type="date" aria-label="' + label + ' date" data-b="job.sched.' + dateKey + '" value="' + esc(s[dateKey]) + '"><select aria-label="' + label + ' time" data-b="job.sched.' + timeKey + '"' + off + ">" + HCP.sched.timeOptions(s[timeKey], "Time") + "</select></div>";
    return '<section class="jp-card nj-card"><div class="nj-title"><i>' + svg("calendar") + '</i><h3>Schedule</h3><button class="icon-btn" data-soon="Reset schedule" aria-label="Reset schedule">' + svg("undo") + '</button><button class="icon-btn" data-soon="Edit schedule" aria-label="Edit schedule">' + svg("pencil") + '</button></div><div class="nj-card-body nj-sched">' + dated("From", "date", "start") + dated("To", "endDate", "end") +
      '<p class="tz-line">Timezone: EST</p><label class="check nj-any"><input type="checkbox" data-b="job.sched.anytime"' + (s.anytime ? " checked" : "") + "> Anytime</label>" +
      '<div class="nj-team"><i>' + svg("clipboard") + '</i><div><select data-job-team aria-label="Edit team">' + HCP.sched.teamOptions(s.team, "Edit team") + '</select><div class="people">' + HCP.sched.chips(s.team, "data-job-team-del") + "</div></div></div>" +
      '<label class="check"><input type="checkbox" data-b="job.sched.notify"' + (s.notify ? " checked" : "") + "> Notify customer</label></div></section>";
  }
  function renderNewJob() {
    if (!ui.job) ui.job = blankJob();
    const j = ui.job;
    return '<div class="nj" role="dialog" aria-modal="true" aria-labelledby="njTitle"><header class="nj-head"><button class="icon-btn" data-close-job aria-label="Close">' + svg("close") + '</button><h1 id="njTitle">New job</h1><button class="icon-btn nj-caret" data-soon="Job type menu" aria-label="More">' + svg("chevDown") + "</button>" +
      '<select class="nj-template" data-job-template aria-label="Job Template">' + options(D.jobTemplates, j.template, "Job Template") + "</select>" +
      '<button class="icon-btn help-btn" data-soon="Help" aria-label="Help">' + svg("help") + "</button>" +
      '<button class="pill' + (j.customerId ? "" : " off") + '" data-save-job>Save job</button></header>' +
      '<div class="nj-body"><div class="nj-left">' + customerCard() + scheduleCard() +
        rowCard("checklist", "Checklists", "checklist", '<select data-b="job.checklist" aria-label="Checklist">' + options(D.checklists, j.checklist, "Add a checklist") + "</select>", j.checklist) +
        '<div class="nj-row"><div class="nj-row-head"><i>' + svg("attach") + '</i><span>Attachments</span><button class="icon-btn small plus" data-soon="Attachments" aria-label="Add attachment">' + svg("plus") + "</button></div></div>" +
        '<section class="jp-card nj-card"><div class="nj-title"><i>' + svg("fields") + '</i><h3>Fields</h3></div><div class="nj-card-body stack">' +
          '<label class="block">Job type<select data-b="job.jobType">' + options(D.jobTypes, j.jobType, "Select") + "</select></label>" +
          '<label class="block">Business unit<select data-b="job.unit">' + options(D.businessUnits, j.unit, "Select") + "</select></label>" +
          '<label class="check"><input type="checkbox" data-b="job.callback"' + (j.callback ? " checked" : "") + "> Callback</label>" +
          ["Billing type", "Customer Type", "Property type"].map((f) => '<select aria-label="' + f + '"><option>' + f + "</option></select>").join("") + "</div></section>" +
        rowCard("tags", "Tags", "tag", '<input id="jf-tag" data-tag-input="job" placeholder="Type a tag and press Enter" aria-label="Tags"><div class="tags">' + tagChips(j.tags, "job") + "</div>", j.tags.length) +
        rowCard("lead", "Lead source", "target", '<select data-b="job.lead" aria-label="Lead source">' + options(D.leadSources, j.lead, "Select") + "</select>", j.lead) +
      '</div><div class="nj-right">' +
        '<section class="jp-card nj-card nj-note"><div class="nj-title"><i>' + svg("note") + '</i><h3>Private notes</h3><div class="note-seg"><button class="on">This job</button><button data-soon="Customer notes">Customer</button></div></div><div class="nj-card-body"><textarea data-b="job.notes" aria-label="Private notes" placeholder="Add a private note here">' + esc(j.notes) + "</textarea></div></section>" +
        '<section class="jp-card nj-lines"><div class="jp-title-row"><h2>Line items</h2><div class="view-seg"><button class="on" aria-label="List view">' + svg("menu") + '</button><button data-soon="Detailed view" aria-label="Detailed view">' + svg("fields") + "</button></div></div>" +
          itemsSection("service", "Services", "services") + itemsSection("material", "Materials", "materials") +
          '<div class="lis-sum"><span>Subtotal</span><span>' + money(jobTotal(j)) + '</span></div><div class="lis-sum"><span>Tax rate</span><span>$0.00</span><button class="icon-btn small plus" data-soon="Tax rate" aria-label="Edit tax rate">' + svg("pencil") + '</button></div><div class="lis-sum big"><span>Total</span><span id="jobTotal">' + money(jobTotal(j)) + "</span></div></section>" +
      "</div></div></div>" + (ui.confirmClose ? closeDialog() : "");
  }
  function closeDialog() {
    return '<div class="modal"><div class="dialog small-dialog" role="alertdialog" aria-modal="true" aria-labelledby="delTitle"><h2 id="delTitle">Delete job?</h2><p>Are you sure you want to delete this job? This action cannot be undone.</p><div><button class="pill outline" data-close-keep>Keep</button><button class="pill danger" data-close-delete>Delete</button></div></div></div>';
  }

  // ---------- line item window ----------
  const toNum = (v) => Number(String(v).replace(/[^0-9.]/g, "")) || 0;
  const fixed = (v) => toNum(v).toFixed(2);
  function renderLine() {
    const el = document.getElementById("modal");
    if (!ui.line) { if (!ui.cust) { el.hidden = true; el.innerHTML = ""; } return; }
    const l = ui.line;
    const noun = l.kind === "service" ? "Service" : "Material";
    el.hidden = false;
    el.innerHTML = '<div class="dialog line-dialog" role="dialog" aria-modal="true" aria-labelledby="lineTitle"><h2 id="lineTitle">Line item</h2><div class="line-body">' +
      '<label class="fld line-name"><span>' + noun + ' name</span><input id="lineName" data-line-name value="' + esc(l.name) + '" placeholder="Search item" autocomplete="off"></label>' +
      (l.picked ? '<div class="line-row"><label class="fld"><span>Qty</span><input inputmode="decimal" data-line="qty" value="' + esc(fixed(l.qty)) + '"></label><label class="fld"><span>Unit price</span><input inputmode="decimal" data-line="price" value="' + esc(money(toNum(l.price))) + '"></label><label class="check"><input type="checkbox" data-line="taxable"' + (l.taxable ? " checked" : "") + "> Taxable</label></div>" +
        '<label class="fld line-desc"><span>Description (optional)</span><textarea data-line="description">' + esc(l.description) + "</textarea></label><h3>For internal reporting only</h3>" +
        '<label class="fld line-cost"><span>Unit cost</span><input inputmode="decimal" data-line="cost" value="' + esc(money(toNum(l.cost))) + '"></label>'
      : '<div class="line-list" id="lineList">' + lineList() + "</div>") +
      '</div><div class="line-foot"><span>‹ &nbsp;1/1&nbsp; › &nbsp;+</span><button class="pill outline" data-line-cancel>Cancel</button><button class="pill' + (l.picked ? "" : " off") + '" data-line-save>Save</button></div></div>';
  }
  function lineList() {
    const l = ui.line;
    const q = l.name.trim().toLowerCase();
    const rows = D.priceBook.filter((p) => p.kind === l.kind && (!q || (p.name + " " + p.description).toLowerCase().includes(q)));
    return "<h4>Favorites</h4><p class=\"muted\">No Results found</p><h4>Frequently used items</h4>" +
      rows.map((p) => '<button class="line-opt" data-line-pick="' + esc(p.name) + '"><small>' + esc(p.name.toUpperCase()) + "</small><b>" + esc(p.name) + "</b><span>" + esc(p.description) + "</span><em>" + money(p.price) + '</em><i class="line-star" aria-hidden="true">☆</i></button>').join("") +
      (rows.length ? "" : '<p class="muted">No items found. Press Enter to add it as a custom item.</p>');
  }
  function pickLine(fields) {
    Object.assign(ui.line, { picked: true }, fields);
    renderLine();
  }
  function saveLine() {
    const l = ui.line;
    if (!l.picked) return;
    ui.job[l.kind === "service" ? "services" : "materials"].push({ name: l.name.trim(), description: l.description, qty: toNum(l.qty), price: toNum(l.price) });
    ui.line = null;
    renderLine();
    HCP.render();
  }
  function saveJob() {
    const j = ui.job;
    if (!j.customerId) { toast("Add a customer first"); refocus("jobCust"); return; }
    if (!j.confirmed) { toast("Save the service address first"); return; }
    const s = j.sched;
    let appt = null;
    if (s.date || s.start !== "" || s.end !== "") {
      if (!s.date || (!s.anytime && (s.start === "" || s.end === ""))) { toast("Finish the schedule first, or clear it"); return; }
      if (s.endDate && s.endDate !== s.date) { notBuilt("Multi-day scheduling"); return; }
      if (!s.anytime && Number(s.end) <= Number(s.start)) { toast("End time must be after start time"); return; }
      appt = { date: s.date, start: s.anytime ? 0 : Number(s.start), end: s.anytime ? 0 : Number(s.end), anytime: s.anytime, team: s.team, arrival: 240 };
    }
    const id = Math.max.apply(null, HCP.state.jobs.map((x) => x.id)) + 1;
    HCP.state.jobs.unshift({ id, customerId: j.customerId, addressId: j.addressId, status: appt ? "Scheduled" : "Not scheduled", appt, created: HCP.sched.today(), jobType: j.jobType, unit: j.unit, lead: j.lead, tags: j.tags, notes: j.notes, checklist: j.checklist, services: j.services, materials: j.materials });
    HCP.save();
    ui.job = null;
    toast("Job saved");
    HCP.go("job/" + id);
  }

  // ---------- lists and detail ----------
  function statusPill(s) {
    const cls = { Scheduled: "s-sch", "Not scheduled": "s-uns", "In Progress": "s-go", Completed: "s-done" }[s] || "s-sch";
    return '<span class="status ' + cls + '">' + esc(s) + "</span>";
  }
  function renderCustomers() {
    const q = ui.listQuery.trim().toLowerCase();
    const list = q ? customerMatches(q) : HCP.state.customers;
    return '<div class="page-head"><h1>Customers</h1><button class="pill" data-new-cust-in-list>New customer</button></div>' +
      '<input class="list-search" data-list-search value="' + esc(ui.listQuery) + '" placeholder="Search customers" aria-label="Search customers">' +
      '<div class="table" id="custTable">' + custTable(list) + "</div>";
  }
  function custTable(list) {
    return "<table><thead><tr><th>Name</th><th>Address</th><th>Phone</th><th>Email</th><th>Type</th><th>Lead source</th></tr></thead><tbody>" +
      list.map((c) => '<tr class="row" data-go="customer/' + c.id + '" tabindex="0"><td><b>' + esc(c.display) + "</b>" + (c.dns ? ' <span class="status s-dns">Do not service</span>' : "") + "</td><td>" + esc(line(c.addresses[0])) + "</td><td>" + esc(c.phones[0] ? c.phones[0].number : "") + "</td><td>" + esc(c.emails[0] || "") + "</td><td>" + esc(c.type) + "</td><td>" + esc(c.lead) + "</td></tr>").join("") +
      (list.length ? "" : '<tr><td colspan="6" class="muted">No customers found</td></tr>') + "</tbody></table>";
  }
  function renderCustomer(id) {
    const c = custById(id);
    if (!c) return '<div class="soon"><h1>Customer not found</h1></div>';
    const jobs = HCP.state.jobs.filter((j) => j.customerId === c.id);
    return '<div class="page-head"><div><button class="crumb" data-go="customers">Customers</button><h1>' + esc(c.display) + (c.dns ? ' <span class="status s-dns">Do not service</span>' : "") + '</h1></div><button class="pill" data-new-job-for="' + c.id + '">New job</button></div>' +
      '<div class="job-grid"><div class="job-col"><div class="card"><div class="card-head"><h3>Contact info</h3></div><dl class="kv"><dt>Name</dt><dd>' + esc((c.first + " " + c.last).trim() || "-") + "</dd><dt>Company</dt><dd>" + esc([c.company, c.role].filter(Boolean).join(", ") || "-") + "</dd><dt>Type</dt><dd>" + esc(c.type) + "</dd>" +
        c.phones.map((p) => "<dt>" + esc(p.kind) + "</dt><dd>" + esc(p.number) + (p.note ? ' <span class="muted">' + esc(p.note) + "</span>" : "") + "</dd>").join("") +
        c.emails.map((m) => "<dt>Email</dt><dd>" + esc(m) + "</dd>").join("") +
        "<dt>Lead source</dt><dd>" + esc(c.lead || "-") + "</dd><dt>Notifications</dt><dd>" + (c.notify ? "On" : "Off") + "</dd></dl></div>" +
        '<div class="card"><div class="card-head"><h3>Notes</h3></div><p>' + esc(c.notes || "No notes") + '</p><div class="tags">' + c.tags.map((t) => '<span class="tag">' + esc(t) + "</span>").join("") + "</div></div></div>" +
      '<div class="job-col"><div class="card"><div class="card-head"><h3>Addresses</h3></div>' + (c.addresses.map((a) => "<p>" + esc(line(a)) + "</p>").join("") || '<p class="muted">No address on file</p>') + "</div>" +
        '<div class="card"><div class="card-head"><h3>Jobs</h3></div>' + (jobs.map((j) => '<button class="job-link" data-go="job/' + j.id + '"><span>Job #' + j.id + "</span>" + statusPill(j.status) + "</button>").join("") || '<p class="muted">No jobs yet</p>') + "</div></div></div>";
  }
  function renderJobs() {
    const tab = ui.jobTab;
    const list = HCP.state.jobs.filter((j) => tab === "All" || j.status === tab);
    return '<div class="page-head"><h1>Jobs</h1><button class="pill" data-new="job">New job</button></div>' +
      '<div class="tabs" role="tablist">' + D.jobTabs.map((t) => '<button role="tab" aria-selected="' + (t === tab) + '" class="' + (t === tab ? "on" : "") + '" data-job-tab="' + t + '">' + t + "</button>").join("") + "</div>" +
      '<div class="table"><table><thead><tr><th>Job #</th><th>Customer</th><th>Status</th><th>Schedule</th><th>Employee</th><th>Job type</th><th>Lead source</th><th>Amount</th></tr></thead><tbody>' +
      list.map((j) => { const c = custById(j.customerId); return '<tr class="row" data-go="job/' + j.id + '" tabindex="0"><td><b>' + j.id + "</b></td><td>" + esc(c ? c.display : "") + "</td><td>" + statusPill(j.status) + "</td><td>" + esc(HCP.sched.text(j) || "-") + "</td><td>" + esc(HCP.sched.team(j) || "-") + "</td><td>" + esc(j.jobType || "-") + "</td><td>" + esc(j.lead || "-") + "</td><td>" + money(jobTotal(j)) + "</td></tr>"; }).join("") +
      (list.length ? "" : '<tr><td colspan="8" class="muted">No jobs here</td></tr>') + "</tbody></table></div>";
  }
  // Laid out from a live Housecall Pro job page.
  function activityFeed(j) {
    const S = HCP.sched;
    const a = j.appt;
    const rows = [];
    if (a && j.status === "Completed") rows.push(["Job finished", "stop", a.date, a.end]);
    if (a && (j.status === "Completed" || j.status === "In Progress")) rows.push(["Job started", "play", a.date, a.start]);
    if (a) rows.push(["Job scheduled", "calendar", S.addDays(a.date, -1), 615]);
    rows.push(["Job created", "wrench", j.created || (a ? S.addDays(a.date, -1) : S.today()), 600]);
    const u = D.user;
    return rows.map(([text, icon, date, m]) => '<div class="feed-row"><span class="feed-who"><span class="mini-av" style="background:#9e9e9e">' + esc(u.initials) + "</span>" + esc(u.name) + '</span><i>' + svg(icon) + "</i><span>" + text + "</span><small>" + S.feed(date, m) + "</small></div>").join("");
  }
  function jobLines(j) {
    const row = (r, key) => '<div class="li"><div class="li-top"><b>' + esc(r.name) + '</b><span><small>Quantity</small>' + r.qty + "</span><span><small>Unit price</small>" + money(r.price) + "</span><span><small>Total price</small>" + money(r.qty * r.price) + '</span><button class="icon-btn small plus" data-soon="Edit ' + key + '" aria-label="Edit ' + esc(r.name) + '">' + svg("pencil") + "</button></div><p>" + esc(r.description) + '</p><div class="li-foot"><span><small>Unit cost</small>$0.00</span><span>Commissionable</span></div></div>';
    const section = (title, list, key, book, add) => '<div class="lis-head"><h4>' + title + '</h4><button class="link" data-soon="' + book + '">' + book + '<i class="bk">' + svg("bookmark") + "</i></button></div>" + list.map((r) => row(r, key)).join("") + '<button class="lis-add" data-soon="' + add + '"><span>' + add + "</span><i>" + svg("plus") + "</i></button>";
    const team = HCP.sched.people(j);
    return '<section class="jp-card jp-pad"><div class="jp-title-row"><h2>Line items</h2></div>' +
      '<div class="people lis-team">' + team.map((e) => '<span class="person">' + HCP.sched.avatar(e) + esc(e.name) + "</span>").join("") + '<button class="icon-btn small plus" data-soon="Edit team" aria-label="Edit team">' + svg("pencil") + "</button></div>" +
      section("Services", j.services, "service", "Service Price Book", "Add service") + section("Materials", j.materials, "material", "Material Price Book", "Add material") +
      '<div class="lis-sum"><span>Subtotal</span><span>' + money(jobTotal(j)) + "</span></div>" +
      '<button class="lis-add" data-soon="Add discount"><span>Add discount</span><i>' + svg("plus") + "</i></button>" +
      '<div class="lis-sum"><span>Tax rate</span><span>$0.00</span></div>' +
      '<div class="lis-sum big"><span>Total</span><span>' + money(jobTotal(j)) + "</span></div>" +
      '<button class="lis-add" data-soon="Add deposit"><span>Add deposit</span><i>' + svg("plus") + "</i></button>" +
      '<div class="lis-head"><h4>Service plan</h4></div><button class="lis-add" data-soon="Add service plan"><span>Add service plan</span><i>' + svg("plus") + "</i></button></section>";
  }
  function renderJob(id) {
    const j = HCP.state.jobs.find((x) => String(x.id) === String(id));
    if (!j) return '<div class="soon"><h1>Job not found</h1></div>';
    const c = custById(j.customerId);
    const addr = c && c.addresses.find((a) => a.id === j.addressId);
    const name = c ? c.display : "";
    const S = HCP.sched;
    const stage = { Scheduled: 1, "In Progress": 3, Completed: 4 }[j.status] || 0;
    const a = j.appt;
    const subs = [S.stamp(j), a && stage > 1 ? S.at(j, a.start) : "", a && stage > 2 ? S.at(j, a.start + 10) : "", a && stage > 3 ? S.at(j, a.end) : "", "", ""];
    const steps = [["Schedule", "calendar"], ["OMW", "truck"], ["Start", "play"], ["Finish", "stop"], ["Invoice", "send"], ["Pay", "card"]].map(([l, icon], i) => {
      const done = i < stage;
      const act = i === 0 ? 'data-schedule-job="' + j.id + '"' : 'data-soon="' + l + '"';
      return '<div class="step' + (done ? " done" : "") + '"><button class="undo" data-soon="Undo"' + (done ? "" : " hidden") + ">UNDO</button><button class=\"step-btn\" " + act + "><i>" + svg(icon) + "</i><b>" + l.toUpperCase() + "</b></button><small>" + subs[i] + "</small></div>";
    }).join("");
    const fold = (key) => ui.jobFold[key];
    const caret = (key) => '<i class="caret"' + (fold(key) ? "" : ' style="transform:rotate(180deg)"') + ">" + svg("chevDown") + "</i>";
    const bar = (label, icon, body, cls) => '<div class="jp-row' + (body ? " on" : "") + '"><div class="jp-row-head"><i>' + svg(icon) + "</i><span>" + label + '</span><button class="icon-btn small plus" data-soon="' + label + '" aria-label="Add ' + label + '">' + svg("plus") + "</button></div>" + (body ? '<div class="jp-row-body">' + body + "</div>" : "") + "</div>";
    const box = (label, value) => '<div class="ro' + (value ? " has" : "") + '">' + (value ? "<small>" + label + "</small>" + esc(value) : label) + "</div>";
    const pick = (label) => '<div class="ro pick">' + label + "<i>" + svg("chevDown") + "</i></div>";
    const accordion = (label, icon, plus) => '<button class="jp-acc" data-soon="' + label + '">' + (icon ? "<i>" + svg(icon) + "</i>" : "") + "<span>" + label + '</span><i class="caret">' + svg(plus ? "plus" : "chevDown") + "</i></button>";
    const contact = c && c.phones[0]
      ? '<div class="jp-line"><span>' + esc(c.phones[0].number) + '</span><button class="icon-btn" data-soon="Calls" aria-label="Call">' + svg("phone") + '</button><button class="icon-btn" data-soon="Messages" aria-label="Message">' + svg("bubble") + "</button></div>"
      : c && c.emails[0] ? '<div class="jp-line"><span>' + esc(c.emails[0]) + "</span></div>" : "";
    return '<div class="jp-sticky"><div><b>JOB #' + j.id + " • Job for " + esc(name) + "</b></div></div>" +
      '<nav class="jp-crumb"><button class="crumb" data-go="jobs">Jobs</button><span>›</span><span>Job #' + j.id + "</span></nav>" +
      '<div class="jp-top"><h1>Job for ' + esc(name) + '</h1><button class="icon-btn jp-pen" data-soon="Job name" aria-label="Edit job name">' + svg("pencil") + '</button><button class="icon-btn jp-opt" data-soon="Job options" aria-label="Job options">' + svg("tools") + "</button></div>" +
      '<div class="jp-sub"><span>Job #' + j.id + "</span>" + statusPill(j.status) + '<button class="link" data-soon="Pipeline">Open in pipeline</button></div>' +
      '<div class="jp-grid"><div class="jp-left">' +
        '<section class="jp-card"><button class="jp-head" data-job-fold="customer"><i>' + svg("person") + "</i><span>Customer</span>" + caret("customer") + "</button>" +
          (fold("customer") ? "" : '<div class="jp-street" aria-hidden="true">Street view</div><div class="jp-cust">' +
            '<div class="jp-line"><span>' + esc(name) + '</span><button class="pill outline small-pill" data-soon="View details">View details</button></div>' +
            '<div class="jp-line"><span>' + esc(addr ? addr.street + (addr.unit ? ", " + addr.unit : "") : "No address on file") + (addr ? "<br>" + esc(addr.city + ", " + addr.state + " " + addr.zip) : "") + '</span><button class="icon-btn" data-soon="Edit address" aria-label="Edit address">' + svg("pencil") + '</button><button class="icon-btn" data-soon="Map" aria-label="Show on map">' + svg("place") + "</button></div>" + contact +
            '<div class="jp-badges">' + (c && c.notify ? '<span class="notif-on">Notifications on</span>' : "") + (c && c.dns ? '<span class="status s-dns">Do not service</span>' : "") + "</div>" +
            '<div class="jp-line"><span>No payment method</span><button class="icon-btn" data-soon="Payment methods" aria-label="Add payment method">' + svg("card") + "</button></div>" +
            '<button class="link jp-profile" data-go="customer/' + (c ? c.id : "") + '">Customer profile</button></div>') + "</section>" +
        '<section class="jp-map"><div class="jp-map-tabs"><button class="on" data-soon="Map">Map</button><button data-soon="Hybrid map">Hybrid</button></div><span>Map isn\'t in the sandbox</span></section>' +
        '<button class="link jp-loc" data-soon="Location">LOCATION ON</button>' +
        bar("Checklists", "checklist", j.checklist ? esc(j.checklist) : "") + bar("Tasks", "clipboard", "") +
        '<section class="jp-card jp-pad"><div class="jp-fields-head"><i>' + svg("fields") + '</i><span>Fields</span></div><div class="stack">' + box("Job type", j.jobType) + box("Business unit", j.unit) + '<label class="check"><input type="checkbox" disabled> Callback</label>' + pick("Billing type") + pick("Customer Type") + pick("Property type") + "</div></section>" +
        bar("Job tags", "tag", (j.tags || []).map((t) => '<span class="tag">' + esc(t) + "</span>").join("")) +
        bar("Private notes", "note", esc(j.notes || "")) + bar("Photo reports", "report", "") + bar("Attachments", "attach", "") + bar("Lead source", "target", esc(j.lead || "")) +
      '</div><div class="jp-right"><div class="jp-steps">' + steps + "</div>" +
        accordion("Made for you", "sparkle") + accordion("Summary of work", "", true) +
        ((j.guide || []).length ? '<section class="jp-card jp-pad"><div class="jp-title-row"><h2>Request guide</h2></div><dl class="kv jp-guide">' + j.guide.map((g) => "<dt>" + esc(g.q) + "</dt><dd>" + esc(g.a) + "</dd>").join("") + "</dl></section>" : "") +
        '<section class="jp-card"><button class="jp-big-head" data-job-fold="field"><h2>Field tech status</h2>' + caret("field") + "</button>" +
          (fold("field") ? "" : '<div class="jp-table"><table><thead><tr><th>Employee name</th><th>Status</th><th>Total travel time</th><th>Total time on job</th><th>Total labor cost</th></tr></thead><tbody>' +
            (S.people(j).map((e) => "<tr><td><span class=\"tech\">" + S.avatar(e) + esc(e.name) + "</span></td><td>Assigned</td><td></td><td></td><td>$0.00</td></tr>").join("") || '<tr><td colspan="5" class="muted">No employees assigned</td></tr>') + "</tbody></table></div>") + "</section>" +
        '<section class="jp-card jp-pad"><div class="jp-title-row"><h2>Invoice #' + j.id + '</h2><div><button class="pill" data-soon="Send invoice">SEND INVOICE</button><button class="icon-btn" data-soon="Print" aria-label="Print">' + svg("printer") + '</button></div></div><div class="jp-inv"><span>Due:</span><button class="link" data-soon="Invoice due date">Upon receipt</button><span>Auto invoice:</span><button class="link" data-soon="Auto invoice">Off</button></div><button class="link jp-msg" data-soon="Invoice message">+ INVOICE MESSAGE</button></section>' +
        '<section class="jp-card jp-pad"><div class="jp-title-row"><h2>Estimates</h2><button class="pill outline" data-soon="Estimate">+ ESTIMATE</button></div></section>' +
        jobLines(j) +
        accordion("Commissions") + accordion("Job inputs") +
        '<section class="jp-card jp-pad"><div class="jp-title-row"><h2>Purchase orders <small class="count">0</small></h2><button class="pill outline" data-soon="Purchase orders">Create purchase order</button></div></section>' +
        accordion("Job costing breakdown") +
        '<section class="jp-card jp-pad"><div class="jp-title-row"><h2>Activity feed</h2></div><div class="feed">' + activityFeed(j) + "</div></section>" +
      "</div></div>";
  }

  // ---------- practice calls ----------
  const pState = () => HCP.state.practice;
  const newJobsFor = (base, customerId) => HCP.state.jobs.filter((j) => j.customerId === customerId && !base.jobs.includes(j.id));
  function named(first, last) {
    return HCP.state.customers.filter((c) => c.first.toLowerCase() === first && c.last.toLowerCase() === last);
  }
  function jobChecks(job, noteRe, noteText, jobType) {
    return [
      [job.jobType === jobType, "Job type is " + jobType],
      [job.unit === "Plumbing", "Business unit is Plumbing"],
      [noteRe.test(job.notes || ""), "Private notes mention " + noteText],
    ];
  }
  const CHECKS = {
    "new-home": (base) => {
      const found = named("maya", "torres");
      const c = found[0];
      if (!c) return [[false, "Create a customer named Maya Torres"]];
      const job = newJobsFor(base, c.id)[0];
      return [
        [found.length === 1, "Only one customer record for Maya"],
        [c.phones.some((p) => p.kind === "Mobile" && digits(p.number).endsWith("0100142")), "Mobile number is (555) 010-0142"],
        [c.addresses.some((a) => /18 linden/i.test(a.street)), "Address is 18 Linden St"],
        [c.type === "Homeowner", "Customer type is Homeowner"],
        [c.lead === "Google Search", "Lead source is Google Search"],
        [!!job, "A job is saved for Maya"],
      ].concat(job ? jobChecks(job, /sink/i, "the sink", "Repair") : []);
    },
    existing: (base) => {
      const found = named("ana", "kowalski");
      const c = found[0];
      if (!c) return [[false, "Ana Kowalski's record is missing. Click Reset and try again."]];
      const job = newJobsFor(base, c.id)[0];
      const mill = job && c.addresses.find((a) => a.id === job.addressId);
      return [
        [found.length === 1, "You used Ana's existing record, with no duplicate"],
        [!!job, "A job is saved on Ana's record"],
      ].concat(job ? [[!!mill && /mill/i.test(mill.street), "Service address is the rental on Mill Ln"]].concat(jobChecks(job, /water heater|leak/i, "the leak", "Repair")) : []);
    },
    business: (base) => {
      const found = named("luis", "ortega");
      const c = found[0];
      if (!c) return [[false, "Create a customer for Luis Ortega"]];
      const job = newJobsFor(base, c.id)[0];
      return [
        [c.type === "Business", "Customer type is Business"],
        [/harbor landing/i.test(c.company), "Company is Harbor Landing Apartments"],
        [c.phones.some((p) => p.kind === "Work" && digits(p.number).endsWith("0100177")), "Work number is (555) 010-0177"],
        [c.addresses.some((a) => /300 herb hill/i.test(a.street)), "Address is 300 Herb Hill Rd"],
        [c.lead === "Referral", "Lead source is Referral"],
        [!!job, "A job is saved for Luis"],
      ].concat(job ? jobChecks(job, /7c/i, "unit 7C", "Diagnostic") : []);
    },
    dns: (base) => {
      const c = named("dale", "whitcomb")[0];
      if (!c) return [[false, "Dale Whitcomb's record is missing. Click Reset and try again."]];
      return [[newJobsFor(base, c.id).length === 0, "No job booked: Dale's profile says Do not service"]];
    },
  };
  function baseline() {
    return { jobs: HCP.state.jobs.map((j) => j.id) };
  }
  function renderPractice() {
    const p = pState();
    const shell = document.getElementById("shell");
    shell.classList.toggle("practicing", p.open);
    const el = document.getElementById("practice");
    el.hidden = !p.open;
    document.getElementById("practiceOpen").hidden = p.open;
    if (!p.open) { el.innerHTML = ""; return; }
    const i = p.index;
    const call = D.practice[i];
    if (!p.base[call.id]) { p.base[call.id] = baseline(); HCP.save(); }
    const res = ui.results[call.id];
    const pass = res && res.every((r) => r[0]);
    el.innerHTML = '<div class="p-head"><span>Practice call ' + (i + 1) + " of " + D.practice.length + '</span><button class="icon-btn small" data-p-close aria-label="Close practice">' + svg("close") + "</button></div>" +
      '<h2>' + esc(call.title) + "</h2>" +
      '<blockquote>' + esc(call.call) + "</blockquote>" +
      "<ol>" + call.steps.map((s) => "<li>" + esc(s) + "</li>").join("") + "</ol>" +
      '<button class="pill" data-p-check>Check my work</button>' +
      (res ? '<ul class="p-results">' + res.map((r) => '<li class="' + (r[0] ? "ok" : "bad") + '"><i>' + svg(r[0] ? "check" : "close") + "</i>" + esc(r[1]) + "</li>").join("") + "</ul>" +
        '<p class="p-sum" role="status">' + (pass ? "All correct." : "Not there yet. Fix the red items and check again.") + "</p>" : "") +
      '<div class="p-nav"><button class="link" data-p-step="-1"' + (i === 0 ? " disabled" : "") + ">Back</button>" +
        (i < D.practice.length - 1 ? '<button class="link" data-p-step="1">Next call</button>' : "") + "</div>" +
      '<p class="p-note">Practice only. This panel isn\'t part of Housecall Pro.</p>';
  }

  // ---------- events ----------
  HCP.onClick((e) => {
    const t = (s) => e.target.closest(s);
    const menu = document.getElementById("createMenu");
    let b;
    if ((b = t("[data-create]"))) { toggleCreateMenu(b); return true; }
    if (!menu.hidden && !t("#createMenu") && !t("[data-sch-menu]")) menu.hidden = true;
    if ((b = t("[data-new]"))) {
      menu.hidden = true;
      if (b.dataset.new === "customer") openCustomer(null);
      else if (b.dataset.new === "job") { HCP.startJob(null, "jobs"); refocus("jobCust"); }
      else if (b.dataset.new === "Intake") HCP.startCall();
      else notBuilt(b.dataset.new);
      return true;
    }
    if ((b = t("[data-new-job-for]"))) { ui.job = blankJob(b.dataset.newJobFor); ui.jobFrom = "customer/" + b.dataset.newJobFor; HCP.go("new-job"); return true; }
    if (t("[data-new-cust-in-job]")) { openCustomer("job"); return true; }
    if (t("[data-new-cust-in-list]")) { openCustomer("list"); return true; }
    if (t("[data-close-modal]")) { ui.cust = null; renderModal(); return true; }
    if (t("[data-save-customer]")) { saveCustomer(); return true; }
    if ((b = t("[data-add]"))) {
      const c = ui.cust;
      if (b.dataset.add === "email") c.emails.push("");
      if (b.dataset.add === "phone") c.phones.push({ kind: "Mobile", number: "", note: "" });
      if (b.dataset.add === "address") c.addresses.push({ street: "", unit: "", city: "", state: "", zip: "" });
      renderModal();
      return true;
    }
    if ((b = t("[data-pick-cust]"))) { pickCustomer(custById(b.dataset.pickCust)); HCP.render(); return true; }
    if (t("[data-clear-cust]")) { ui.job.customerId = ""; ui.job.addressId = ""; ui.job.confirmed = false; ui.job.editAddress = false; HCP.render(); refocus("jobCust"); return true; }
    if (t("[data-confirm-address]")) { ui.job.confirmed = true; ui.job.editAddress = false; HCP.render(); return true; }
    if (t("[data-edit-address]")) { ui.job.editAddress = true; HCP.render(); return true; }
    if (t("[data-save-job]")) { saveJob(); return true; }
    if (t("[data-close-job]")) { ui.confirmClose = true; HCP.render(); return true; }
    if (t("[data-close-keep]")) { ui.confirmClose = false; HCP.render(); return true; }
    if (t("[data-close-delete]")) { const back = ui.jobFrom || "jobs"; ui.confirmClose = false; ui.job = null; HCP.go(back); return true; }
    if ((b = t("[data-line-add]"))) { ui.line = { kind: b.dataset.lineAdd, name: "", picked: false, qty: 1, price: 0, taxable: false, description: "", cost: 0 }; renderLine(); refocus("lineName"); return true; }
    if ((b = t("[data-line-pick]"))) { const p = D.priceBook.find((x) => x.name === b.dataset.linePick); pickLine({ name: p.name, price: p.price, description: p.description }); return true; }
    if (t("[data-line-cancel]")) { ui.line = null; renderLine(); return true; }
    if (t("[data-line-save]")) { saveLine(); return true; }
    if ((b = t("[data-row-open]"))) { const k = b.dataset.rowOpen; ui.job.open[k] = !ui.job.open[k]; HCP.render(); return true; }
    if ((b = t("[data-job-team-del]"))) { ui.job.sched.team = ui.job.sched.team.filter((id) => id !== b.dataset.jobTeamDel); HCP.render(); return true; }
    if ((b = t("[data-item-del]"))) {
      const [key, i] = b.dataset.itemDel.split(".");
      ui.job[key].splice(Number(i), 1);
      HCP.render();
      return true;
    }
    if ((b = t("[data-tag-del]"))) {
      const [scope, i] = b.dataset.tagDel.split(".");
      ui[scope].tags.splice(Number(i), 1);
      if (scope === "cust") renderModal(); else HCP.render();
      return true;
    }
    if ((b = t("[data-job-tab]"))) { ui.jobTab = b.dataset.jobTab; HCP.render(); return true; }
    if ((b = t("[data-job-fold]"))) { const k = b.dataset.jobFold; ui.jobFold[k] = !ui.jobFold[k]; HCP.render(); return true; }
    // A row opens its record, but buttons and checkboxes inside the row keep their own click.
    if ((b = t("[data-go]")) && !(b.matches("tr") && t("button, input, select, a"))) { HCP.go(b.dataset.go); return true; }
    if (t("[data-p-open]")) { pState().open = true; HCP.save(); renderPractice(); return true; }
    if (t("[data-p-close]")) { pState().open = false; HCP.save(); renderPractice(); return true; }
    if ((b = t("[data-p-step]"))) { pState().index += Number(b.dataset.pStep); HCP.save(); renderPractice(); return true; }
    if (t("[data-p-check]")) {
      const call = D.practice[pState().index];
      ui.results[call.id] = CHECKS[call.id](pState().base[call.id]);
      renderPractice();
      return true;
    }
    return false;
  });
  document.addEventListener("input", (e) => {
    const el = e.target;
    if (el.dataset.b) {
      const value = el.type === "checkbox" ? el.checked : el.type === "number" ? Number(el.value) : el.value;
      if (el.type === "radio" && !el.checked) return;
      setPath(el.dataset.b, value);
      return;
    }
    if (el.matches("[data-cust-search]")) {
      ui.custQuery = el.value;
      document.getElementById("custResults").innerHTML = custResultsHtml();
    } else if (el.matches("[data-line-name]")) {
      ui.line.name = el.value;
      if (!ui.line.picked) document.getElementById("lineList").innerHTML = lineList();
    } else if (el.dataset.line) {
      ui.line[el.dataset.line] = el.type === "checkbox" ? el.checked : el.value;
    } else if (el.matches("[data-list-search]")) {
      ui.listQuery = el.value;
      const q = el.value.trim();
      document.getElementById("custTable").innerHTML = custTable(q ? customerMatches(q) : HCP.state.customers);
    }
  });
  document.addEventListener("change", (e) => {
    const el = e.target;
    if (el.matches("[data-job-address]")) ui.job.addressId = el.value;
    if (el.matches("[data-job-team]") && el.value) { ui.job.sched.team.push(el.value); HCP.render(); }
    if (el.matches("[data-job-template]")) {
      ui.job.template = el.value;
      if (el.value) notBuilt("Job templates");
    }
  });
  document.addEventListener("keydown", (e) => {
    const el = e.target;
    if (e.key === "Escape" && ui.line) { ui.line = null; renderLine(); return; }
    if (e.key === "Escape" && ui.cust) { ui.cust = null; renderModal(); return; }
    if (e.key === "Enter" && el.matches("[data-tag-input]")) {
      e.preventDefault();
      const val = el.value.trim();
      if (!val) return;
      const scope = el.dataset.tagInput;
      ui[scope].tags.push(val);
      if (scope === "cust") { renderModal(); refocus("cf-tag"); } else { HCP.render(); refocus("jf-tag"); }
    } else if (e.key === "Enter" && el.matches("[data-line-name]") && !ui.line.picked && el.value.trim()) {
      e.preventDefault();
      pickLine({ name: el.value.trim() });
    } else if (e.key === "Enter" && el.matches("tr.row")) {
      HCP.go(el.dataset.go);
    }
  });

  // ---------- register ----------
  Object.assign(HCP.views, {
    customers: renderCustomers,
    customer: renderCustomer,
    jobs: renderJobs,
    job: renderJob,
    "new-job": renderNewJob,
  });
  Object.assign(HCP.navFor, { customer: "customers", job: "jobs", "new-job": "jobs" });
  HCP.afterRender.push(renderPractice);
  HCP.afterRender.push(() => document.getElementById("page").classList.toggle("grey", HCP.view === "job"));
  // The real job page swaps its big title for a slim bar once you scroll.
  document.addEventListener("scroll", (e) => {
    if (e.target.id === "page") e.target.classList.toggle("jp-scrolled", e.target.scrollTop > 110);
  }, true);
  HCP.onReset.push(() => {
    Object.assign(ui, { line: null, confirmClose: false, jobFold: {}, job: null, jobFrom: "", cust: null, afterCust: null, custQuery: "", jobTab: "All", listQuery: "", error: "", results: {} });
    renderModal();
  });
});
