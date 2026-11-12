// Estimate pipeline module: Pipeline board and table, Estimates list, estimate page.
// Screens, status names and columns are copied from a live Housecall Pro account.
window.HCP_MODULES = window.HCP_MODULES || [];
window.HCP_MODULES.push(function (HCP) {
  const { svg, esc, toast, notBuilt } = HCP;
  const D = HCP.data;
  const $ = (id) => document.getElementById(id);
  const freshUi = () => ({ tab: "leads", mode: "Board", query: "", drawer: false, emp: "", cust: "", list: "All", listQuery: "" });
  const ui = freshUi();

  const money = (n) => "$" + Number(n || 0).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const estimates = () => HCP.state.estimates;
  const byId = (id) => estimates().find((e) => String(e.id) === String(id));
  const cust = (e) => HCP.state.customers.find((c) => c.id === e.customerId);
  const addrOf = (e) => { const c = cust(e); return c && (c.addresses.find((a) => a.id === e.addressId) || c.addresses[0]); };
  const member = (id) => D.team.find((m) => m.id === id);
  const subtotal = (e) => e.services.concat(e.materials).reduce((n, r) => n + r.qty * r.price, 0);
  const value = (e) => subtotal(e) - (e.discount || 0);
  const parse = (s) => { const [y, m, d] = s.split("-").map(Number); return new Date(y, m - 1, d); };
  const ymd = (d) => d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0");
  const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  function ago(date) {
    const days = Math.max(0, Math.round((parse(ymd(new Date())) - parse(date)) / 86400000));
    if (days === 0) return "today";
    if (days === 1) return "a day";
    if (days < 30) return days + " days";
    const months = Math.round(days / 30);
    return months === 1 ? "a month" : months + " months";
  }
  const agoText = (date) => (ago(date) === "today" ? "today" : ago(date) + " ago");
  const columnOf = (status) => D.estimateColumns.find((c) => c.statuses.includes(status));
  const person = (id) => { const m = member(id); return m ? '<span class="mini-av" style="background:' + m.color + '">' + esc(m.initials) + "</span>" : ""; };
  const statusSelect = (e) => '<select class="ep-status" data-ep-status="' + e.id + '" aria-label="Status for estimate ' + e.id + '">' + D.estimateStatuses.map((s) => "<option" + (s === e.status ? " selected" : "") + ">" + s + "</option>").join("") + "</select>";

  function matches(e) {
    const c = cust(e);
    const q = ui.query.trim();
    if (q && String(e.id) !== q) return false;
    if (ui.emp && e.assignee !== ui.emp) return false;
    if (ui.cust.trim() && !(c ? c.display : "").toLowerCase().includes(ui.cust.trim().toLowerCase())) return false;
    return true;
  }
  const shown = () => estimates().filter(matches);

  // ---------- pipeline ----------
  function card(e) {
    const c = cust(e);
    const m = member(e.assignee);
    return '<article class="ep-card"><button class="ep-open" data-go="estimate/' + e.id + '"><span class="ep-num">Estimate #' + e.id + '</span><b>' + esc(c ? c.display : "") + "</b><span>" + money(value(e)) + '</span></button><div class="ep-who">' + person(e.assignee) + "<span>" + esc(m ? m.name : "") + "</span></div>" + statusSelect(e) + "<p>Status updated <strong>" + (ago(e.updated) === "today" ? "today" : ago(e.updated) + "</strong> ago") + (ago(e.updated) === "today" ? "</strong>" : "") + "</p></article>";
  }
  function board() {
    const list = shown();
    return '<div class="ep-board">' + D.estimateColumns.map((col) => {
      const rows = list.filter((e) => col.statuses.includes(e.status));
      return '<section class="ep-col"><header><h3>' + col.name + "</h3><span>" + rows.length + "</span><p>" + money(rows.reduce((n, e) => n + value(e), 0)) + " total</p></header>" + rows.map(card).join("") + "</section>";
    }).join("") + "</div>";
  }
  function dateTwoLine(date) {
    const d = parse(date);
    return String(d.getMonth() + 1).padStart(2, "0") + "/" + String(d.getDate()).padStart(2, "0") + "/" + d.getFullYear() + "<br>" + DAYS[d.getDay()] + " 9:00PM";
  }
  function table() {
    return '<div class="ep-table"><table><thead><tr><th><input type="checkbox" aria-label="Select all" data-soon="Bulk select"> Estimate #</th><th>Customer</th><th>Created</th><th>Value</th><th>Assignee</th><th>Status</th><th>Status updated</th></tr></thead><tbody>' +
      shown().filter((e) => columnOf(e.status)).map((e) => { const c = cust(e); const m = member(e.assignee); return '<tr><td><input type="checkbox" aria-label="Select estimate ' + e.id + '" data-soon="Bulk select"> <button class="ep-link" data-go="estimate/' + e.id + '">Estimate #' + e.id + "</button></td><td>" + esc(c ? c.display : "") + "</td><td>" + dateTwoLine(e.created) + "</td><td>" + money(value(e)) + '</td><td><span class="ep-who">' + person(e.assignee) + "<span>" + esc(m ? m.name : "") + "</span></span></td><td>" + statusSelect(e) + "</td><td>" + agoText(e.updated) + "</td></tr>"; }).join("") + "</tbody></table></div>";
  }
  function drawer() {
    if (!ui.drawer) return "";
    return '<div class="ep-scrim" data-ep-drawer-close></div><aside class="ep-drawer" role="dialog" aria-modal="true" aria-labelledby="epFilters"><header><button class="icon-btn" data-ep-drawer-close aria-label="Close filters">' + svg("close") + '</button><h2 id="epFilters">Filters</h2></header><div class="ep-drawer-body"><h4>Maintain filters</h4><p>Filters will not be cleared and will stay in every Pipeline visit.</p><button class="pill outline" data-soon="Maintain filters">Maintain filters</button>' +
      '<h4>Employee</h4><select data-ep-filter="emp" aria-label="Employee"><option value="">Employee name</option>' + D.team.map((m) => '<option value="' + m.id + '"' + (ui.emp === m.id ? " selected" : "") + ">" + esc(m.name) + "</option>").join("") + "</select>" +
      '<h4>Job Type</h4><select aria-label="Job type"><option>Job type</option></select><h4>Estimate Tags</h4><input placeholder="Tag name" aria-label="Tag name"><h4>Customer</h4><input data-ep-filter="cust" placeholder="Customer name, email, phone, or address" aria-label="Customer" value="' + esc(ui.cust) + '"><h4>Created date</h4><div class="ep-dates"><input type="date" aria-label="Created from"><span>—</span><input type="date" aria-label="Created to"></div><h4>Scheduled date</h4><select aria-label="Scheduled date"><option></option></select></div></aside>';
  }
  function renderPipeline() {
    const tabs = ["Leads", "Estimates", "Jobs"].map((t) => '<button role="tab" aria-selected="' + (ui.tab === t.toLowerCase()) + '" class="' + (ui.tab === t.toLowerCase() ? "on" : "") + '" data-ep-tab="' + t.toLowerCase() + '">' + t + "</button>").join("");
    const head = '<div class="ep"><div class="ep-head"><h1>Pipeline</h1><div class="ep-tools"><button data-soon="Automations" aria-label="Automations">' + svg("tools") + '</button><button data-soon="Pipeline settings" aria-label="Settings">' + svg("gear") + '</button></div><div class="ep-tabs" role="tablist">' + tabs + "</div></div>";
    if (ui.tab === "leads") return head + '<div class="ep-empty"><h2>Close leads faster</h2><p>Track leads here and automate lead outreach.</p><div><button class="pill" data-soon="Create a lead">Create a lead</button><button class="pill outline" data-soon="Pipeline tour">Tour pipeline</button></div></div></div>';
    return head + '<div class="ep-body"><section class="ep-impact"><div><small>Pipeline</small><b>Last 30 days impact</b></div><div class="ep-tile"><i>' + svg("dollar") + "</i><strong>$18,420</strong><span>Revenue from estimates won with Pipeline automations</span></div><div class=\"ep-tile\"><i>" + svg("report") + '</i><strong>5</strong><span>Estimates won with Pipeline automations</span></div></section>' +
      '<div class="ep-bar"><select aria-label="Search by"><option>Estimate # (exact match)</option></select><label class="ep-search"><i>' + svg("search") + '</i><input data-ep-query placeholder="Search by Estimate # (exact match)" aria-label="Search by estimate number" value="' + esc(ui.query) + '"></label><button class="pill outline" data-ep-drawer-open>Filter</button><button class="link" data-soon="Archived items">View archived items</button><div class="ep-mode">' + ["Board", "Table"].map((m) => '<button class="' + (ui.mode === m ? "on" : "") + '" data-ep-mode="' + m + '">' + m + "</button>").join("") + '</div></div><div id="epView">' + (ui.mode === "Board" ? board() : table()) + "</div></div>" + drawer() + "</div>";
  }

  // ---------- estimates list ----------
  const outcome = (s) => (s === "Approved" ? "Won" : s === "Rejected" ? "Lost" : "Open");
  function renderList() {
    const q = ui.listQuery.trim().toLowerCase();
    const rows = estimates().filter((e) => (ui.list === "All" || outcome(e.status) === ui.list) && (!q || (String(e.id) + " " + (cust(e) ? cust(e).display : "")).toLowerCase().includes(q)));
    const cols = ["Estimate #", "Customer name", "Options count", "Employees", "Estimate status", "Created date", "Scheduled date", "Outcome", "Open value", "Won value", "Lost value", "Estimate lead source", "Estimate tags"];
    const fmt = (date) => { const d = parse(date); return MONTHS[d.getMonth()] + " " + d.getDate() + ", " + d.getFullYear(); };
    return '<div class="el"><div class="el-head"><h1>Estimates</h1><p>' + estimates().length + ' records</p><button class="el-settings" data-soon="Estimates settings" aria-label="Settings">' + svg("gear") + '</button></div><div class="el-card"><div class="el-bar"><label class="ep-search"><i>' + svg("search") + '</i><input data-el-query placeholder="Search" aria-label="Search estimates" value="' + esc(ui.listQuery) + '"></label><button class="icon-btn" data-soon="Filter" aria-label="Filter">' + svg("fields") + '</button><button class="icon-btn" data-soon="Edit columns" aria-label="Edit columns">' + svg("pipeline") + '</button><span></span><button class="pill outline" data-soon="Actions">Actions</button><button class="pill" data-soon="Creating an estimate">Create estimate</button></div><div class="el-tabs" role="tablist">' + ["All", "Open", "Won", "Lost"].map((t) => '<button role="tab" aria-selected="' + (ui.list === t) + '" class="' + (ui.list === t ? "on" : "") + '" data-el-tab="' + t + '">' + t + "</button>").join("") + '</div><div class="el-table"><table><thead><tr><th></th>' + cols.map((c) => "<th>" + c + "</th>").join("") + "</tr></thead><tbody>" +
      rows.map((e) => { const c = cust(e); const m = member(e.assignee); const o = outcome(e.status); return '<tr class="row" data-go="estimate/' + e.id + '"><td><input type="checkbox" aria-label="Select estimate ' + e.id + '" data-soon="Bulk select"></td><td>' + e.id + "</td><td>" + esc(c ? c.display : "") + "</td><td>1</td><td>" + esc(m ? m.name : "") + "</td><td>" + esc(e.status) + "</td><td>" + fmt(e.created) + "</td><td>-</td><td>" + o + "</td><td>" + (o === "Open" ? money(value(e)) : "-") + "</td><td>" + (o === "Won" ? money(value(e)) : "-") + "</td><td>" + (o === "Lost" ? money(value(e)) : "-") + "</td><td>" + esc(e.lead || "-") + "</td><td>-</td></tr>"; }).join("") + '</tbody></table></div><div class="el-pager">1-' + rows.length + " of " + rows.length + " &nbsp; Rows per page &nbsp; Page 1 of 1</div></div></div>";
  }

  // ---------- estimate page ----------
  function lineRows(list, kind) {
    return list.map((r) => '<div class="li"><div class="li-top"><b>' + esc(r.name) + "</b><span><small>Quantity</small>" + r.qty + "</span><span><small>Unit price</small>" + money(r.price) + "</span><span><small>Total price</small>" + money(r.qty * r.price) + '</span><button class="icon-btn small plus" data-soon="Edit ' + kind + '" aria-label="Edit ' + esc(r.name) + '">' + svg("pencil") + "</button></div><p>" + esc(r.description || "") + '</p><div class="li-foot"><span><small>Unit cost</small>$0.00</span></div></div>').join("");
  }
  function renderEstimate(id) {
    const e = byId(id);
    if (!e) return '<div class="soon"><h1>Estimate not found</h1></div>';
    const c = cust(e);
    const a = addrOf(e);
    const m = member(e.assignee);
    const sent = ["Sent", "First Follow-Up", "Second Follow-Up", "Third Follow-Up", "On Hold", "Approved", "Rejected"].includes(e.status);
    const approved = e.status === "Approved";
    const steps = [["Schedule", "calendar", ""], ["OMW", "truck", ""], ["Finish", "stop", ""], ["Send", "send", sent ? "Sent to customer" : ""], ["Approval", "check", approved ? "Approved" : sent ? "Awaiting Approval" : ""], ["Copy to job", "clipboard", ""]];
    const flags = [false, false, false, sent, sent, false];
    const row = (label, icon, body) => '<div class="jp-row' + (body ? " on" : "") + '"><div class="jp-row-head"><i>' + svg(icon) + "</i><span>" + label + '</span><button class="icon-btn small plus" data-soon="' + label + '" aria-label="Add ' + label + '">' + svg("plus") + "</button></div>" + (body ? '<div class="jp-row-body">' + body + "</div>" : "") + "</div>";
    const add = (label) => '<button class="lis-add" data-soon="' + label + '"><span>' + label + "</span><i>" + svg("plus") + "</i></button>";
    const book = (name) => '<button class="link" data-soon="' + name + '">' + name + '<i class="bk">' + svg("bookmark") + "</i></button>";
    return '<div class="eg"><div class="eg-top"><nav class="jp-crumb"><button class="crumb" data-go="estimates">Estimates</button><span>›</span><span>Estimate #' + e.id + '</span></nav><div class="eg-head"><h1>Estimate</h1><div class="eg-options"><button class="on">Option<br>#1</button><button class="link" data-soon="Add option">Add option</button></div><div class="eg-status"><small>Status</small><button class="link" data-go="pipeline">' + esc(e.status) + ' ↗</button></div><button class="pill outline eg-beta" data-soon="Beta view"><i>' + svg("sparkle") + '</i>Try Beta view</button></div></div>' +
      '<div class="eg-grid"><div class="jp-left"><section class="jp-card"><div class="jp-head"><i>' + svg("person") + '</i><span>Customer</span></div><div class="jp-street" aria-hidden="true">Street view</div><div class="jp-cust"><div class="jp-line"><span>' + esc(c ? c.display : "") + '</span><button class="pill outline small-pill" data-soon="View details">View details</button></div><div class="jp-line"><span>' + esc(a ? a.street : "") + (a ? "<br>" + esc(a.city + ", " + a.state + " " + a.zip) : "") + '</span><button class="icon-btn" data-soon="Edit address" aria-label="Edit address">' + svg("pencil") + '</button><button class="icon-btn" data-soon="Map" aria-label="Map">' + svg("place") + '</button></div><div class="jp-line"><span>' + esc(c && c.phones[0] ? c.phones[0].number : "") + '</span><button class="icon-btn" data-soon="Calls" aria-label="Call">' + svg("phone") + '</button><button class="icon-btn" data-soon="Messages" aria-label="Message">' + svg("bubble") + "</button></div>" + (c && c.notify ? '<div class="jp-badges"><span class="notif-on">Notifications on</span></div>' : "") + '<div class="jp-line"><span>No payment method</span><button class="icon-btn" data-soon="Payment methods" aria-label="Add payment method">' + svg("card") + '</button></div><button class="link jp-profile" data-go="customer/' + (c ? c.id : "") + '">Customer Profile</button></div></section>' +
      '<section class="jp-card jp-pad"><div class="jp-title-row"><h3 class="eg-h3"><i>' + svg("shield") + '</i>Service plans</h3></div><p class="eg-muted">Customer has no active service plans.</p><h4 class="eg-h4">Offered with this estimate</h4><button class="link" data-soon="Service plan offer">Add a service plan offer</button></section><section class="jp-map"><span>Map isn\'t in the sandbox</span></section>' + row("Fields", "fields", "") + row("Estimate tags", "tag", "") + row("Private notes", "note", esc(e.notes || "")) + row("Attachments", "attach", "") +
      '</div><div class="jp-right"><div class="eg-steps">' + steps.map(([l, i, sub], n) => '<div class="step' + (flags[n] ? " done" : "") + '"><button class="step-btn" data-soon="' + l + '"><i>' + svg(i) + "</i><b>" + l.toUpperCase() + "</b></button><small>" + sub + "</small></div>").join("") + '</div><button class="jp-acc" data-soon="Made for you"><i>' + svg("sparkle") + '</i><span>Made for you</span><i class="caret">' + svg("chevDown") + "</i></button>" +
      '<section class="jp-card jp-pad eg-opt"><div class="jp-title-row"><h2>Estimate <button class="ep-link big" data-soon="Estimate number">#' + e.id + '</button></h2><button class="pill outline" data-soon="Present">Present</button></div><div class="eg-terms"><b>Expiration date:</b><button class="link" data-soon="Expiration date">' + esc(e.expires) + '</button><b>Customer can approve:</b><button class="link" data-soon="Approval option">Only one option</button></div></section>' +
      '<section class="jp-card jp-pad eg-lines"><div class="jp-title-row"><h2 class="eg-li">Line items</h2></div><div class="people lis-team"><span class="person">' + person(e.assignee) + esc(m ? m.name : "") + '</span><button class="icon-btn small plus" data-soon="Edit team" aria-label="Edit team">' + svg("pencil") + '</button></div><div class="eg-templates"><button class="link" data-soon="Templates">Templates<i class="bk">' + svg("bookmark") + '</i></button></div><div class="lis-head"><h4>Services</h4>' + book("Service Price Book") + "</div>" + lineRows(e.services, "service") + add("Add service") + '<div class="lis-head"><h4>Materials</h4>' + book("Material Price Book") + "</div>" + lineRows(e.materials, "material") + add("Add material") + '<div class="lis-sum"><span>Subtotal</span><span>' + money(subtotal(e)) + "</span></div>" + (e.discount ? '<div class="lis-sum"><span>Discount<small class="eg-sub">Savings (' + money(e.discount) + ")</small></span><span>-" + money(e.discount) + "</span></div>" : "") + add("Add discount") + '<div class="lis-sum"><span>Tax rate<small class="eg-sub">none</small></span><span>$0.00</span></div><div class="lis-sum eg-total"><span>Total</span><span>' + money(value(e)) + "</span></div>" + add("Add deposit") + '<button class="eg-send" data-soon="Send and present estimate">Send and present estimate</button><table class="eg-cost"><thead><tr><th>Cost breakdown</th><th>Total cost</th><th>Profit/Loss</th></tr></thead><tbody><tr><td></td><td>$0.00</td><td>100.00 %</td></tr></tbody></table></section>' +
      '<section class="jp-card jp-pad"><div class="jp-title-row"><h2 class="eg-li">Activity feed</h2></div><div class="feed"><div class="feed-row"><span class="feed-who">' + person(e.assignee) + esc(m ? m.name : "") + "</span><i>" + svg("clipboard") + "</i><span>Estimate created</span><small>" + esc(e.created) + "</small></div></div></section></div></div></div>";
  }

  // ---------- events ----------
  function refreshView() { const v = $("epView"); if (v) v.innerHTML = ui.mode === "Board" ? board() : table(); }
  HCP.onClick((e) => {
    const t = (s) => e.target.closest(s);
    let b;
    if ((b = t("[data-ep-tab]"))) { if (b.dataset.epTab === "jobs") notBuilt("The Jobs pipeline"); else { ui.tab = b.dataset.epTab; HCP.render(); } return true; }
    if ((b = t("[data-ep-mode]"))) { ui.mode = b.dataset.epMode; HCP.render(); return true; }
    if (t("[data-ep-drawer-open]")) { ui.drawer = true; HCP.render(); return true; }
    if (t("[data-ep-drawer-close]")) { ui.drawer = false; HCP.render(); return true; }
    if ((b = t("[data-el-tab]"))) { ui.list = b.dataset.elTab; HCP.render(); return true; }
    return false;
  });
  document.addEventListener("input", (e) => {
    const el = e.target;
    if (el.matches("[data-ep-query]")) { ui.query = el.value; refreshView(); }
    else if (el.matches("[data-el-query]")) { ui.listQuery = el.value; const p = el.selectionStart; HCP.render(); const n = document.querySelector("[data-el-query]"); n.focus(); n.setSelectionRange(p, p); }
    else if (el.matches("[data-ep-filter=cust]")) { ui.cust = el.value; refreshView(); }
  });
  document.addEventListener("change", (e) => {
    const el = e.target;
    if (el.matches("[data-ep-filter=emp]")) { ui.emp = el.value; refreshView(); }
    if (el.matches("[data-ep-status]")) {
      const est = byId(el.dataset.epStatus);
      est.status = el.value;
      est.updated = ymd(new Date());
      HCP.save();
      refreshView();
      toast("Status changed to " + el.value);
    }
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && ui.drawer) { ui.drawer = false; HCP.render(); }
  });

  Object.assign(HCP.views, { pipeline: renderPipeline, estimates: renderList, estimate: renderEstimate });
  Object.assign(HCP.navFor, { estimate: "estimates" });
  HCP.afterRender.push(() => {
    const p = $("page");
    p.classList.toggle("ep-page", HCP.view === "pipeline" || HCP.view === "estimates");
    p.classList.toggle("eg-page", HCP.view === "estimate");
  });
  HCP.onReset.push(() => { Object.assign(ui, freshUi()); });
});
