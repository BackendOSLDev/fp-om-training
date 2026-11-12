// Receivables module: Invoices list and invoice page, copied from a live Housecall Pro account.
// The Payment and Send invoice windows come from Adil's screenshots of the live windows.
// The Card tab is display only, so nobody types a real card number into a training tool.
window.HCP_MODULES = window.HCP_MODULES || [];
window.HCP_MODULES.push(function (HCP) {
  const { svg, esc, toast } = HCP;
  const D = HCP.data;
  const freshUi = () => ({ tab: "All", query: "", promo: true, tip: true, pay: null, send: null });
  const ui = freshUi();
  const invoices = () => HCP.state.invoices;
  const cust = (i) => HCP.state.customers.find((c) => c.id === i.customerId);
  const money = (n) => "$" + Number(n || 0).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const parse = (s) => { const [y, m, d] = s.split("-").map(Number); return new Date(y, m - 1, d); };
  const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const stamp = (s) => { const d = parse(s); return String(d.getMonth() + 1).padStart(2, "0") + "/" + String(d.getDate()).padStart(2, "0") + "/" + String(d.getFullYear()).slice(2); };
  const total = (i) => i.services.concat(i.materials).reduce((n, r) => n + r.qty * r.price, 0);
  const paidSoFar = (i) => (i.payments || []).reduce((n, p) => n + p.amount, 0);
  const due = (i) => (i.status === "Paid" ? 0 : Math.max(0, total(i) - paidSoFar(i)));
  const isPast = (i) => { const t = new Date(); t.setHours(0, 0, 0, 0); return i.status === "Open" && i.due && parse(i.due) < t; };
  // Our reading of the quick views: we saw the tabs but not the rule behind each.
  const inTab = (i) => ui.tab === "All" || (ui.tab === "Unsent" && !i.sent) || (ui.tab === "Due" && i.status === "Open") || (ui.tab === "Past Due" && isPast(i));

  function tableRows() {
    const q = ui.query.trim().toLowerCase();
    const rows = invoices().filter(inTab).filter((i) => !q || (i.id + " " + (cust(i) ? cust(i).display : "")).toLowerCase().includes(q));
    return rows.map((i) => {
      const c = cust(i);
      const paid = i.status === "Paid";
      return '<tr class="row" data-go="invoice/' + i.id + '"><td><input type="checkbox" aria-label="Select invoice ' + i.id + '" data-soon="Bulk select"></td><td class="inv-num">' + i.id + '</td><td class="inv-num">' + esc(c ? c.display : "") + '</td><td><span class="inv-pill ' + (paid ? "paid" : "open") + '">' + i.status + "</span></td><td>" + money(due(i)) + "</td><td>" + (i.due ? stamp(i.due) + " · " + DAYS[parse(i.due).getDay()] + " 5:00 PM" : "") + "</td><td>" + (i.sent ? stamp(i.sent) + " · 5:00 PM" : '<button class="link" data-inv-send="' + i.id + '">Send invoice</button>') + '</td><td class="inv-num">' + i.id + '</td><td class="inv-act"><button class="link' + (paid ? " off" : "") + '" ' + (paid ? "disabled" : 'data-inv-pay="' + i.id + '"') + "><i>" + svg("card") + "</i>Pay</button></td></tr>";
    }).join("") || '<tr><td colspan="9" class="muted">No invoices found</td></tr>';
  }
  function renderList() {
    return '<div class="el"><div class="el-head"><h1>Invoices</h1><p>' + invoices().length + ' records</p><button class="el-settings" data-soon="Invoice settings" aria-label="Settings">' + svg("gear") + "</button></div>" +
      (ui.promo ? '<section class="inv-promo"><span class="inv-rec">Recommended next step</span><h2>Impress customers with custom invoices</h2><p>Look professional, save time, and get paid faster by customizing your default invoice template and communications.</p><div><button class="pill" data-soon="Invoice customization">Customize my invoice</button><button class="link" data-inv-promo>Dismiss</button></div></section>' : "") +
      (ui.tip ? '<div class="inv-tip"><span>Use this list view to filter, sort, and track your invoices, using quick views such as \'Past due\' to find invoices requiring action.</span><button class="inv-fb" data-soon="Feedback">Give us feedback</button><button class="icon-btn" data-inv-tip aria-label="Close">' + svg("close") + "</button></div>" : "") +
      '<section class="inv-card"><div class="inv-bar"><label class="ep-search"><i>' + svg("search") + '</i><input data-inv-query placeholder="Search invoices" aria-label="Search invoices" value="' + esc(ui.query) + '"></label><button class="inv-ico" data-soon="Filter" aria-label="Filter">' + svg("fields") + '</button><button class="inv-ico" data-soon="Edit columns" aria-label="Edit columns">' + svg("pipeline") + '</button><select class="inv-view" aria-label="Filter view"><option>Filter view: System default</option></select><button class="pill outline" data-soon="Actions">Actions</button></div>' +
      '<div class="el-tabs inv-tabs" role="tablist">' + ["All", "Unsent", "Due", "Past Due"].map((t) => '<button role="tab" aria-selected="' + (ui.tab === t) + '" class="' + (ui.tab === t ? "on" : "") + '" data-inv-tab="' + t + '">' + t + "</button>").join("") + '</div><div class="inv-chip"><span>INVOICE STATUS <b>3 active</b></span></div>' +
      '<div class="inv-table"><table><thead><tr><th></th><th>Invoice #</th><th>Customer name</th><th>Invoice status</th><th>Amount due</th><th>Due date</th><th>Latest send date</th><th>Job #</th><th class="inv-act">Actions</th></tr></thead><tbody id="invRows">' + tableRows() + "</tbody></table></div></section></div>";
  }
  function renderInvoice(id) {
    const i = invoices().find((x) => String(x.id) === String(id));
    if (!i) return '<div class="soon"><h1>Invoice not found</h1></div>';
    const c = cust(i);
    const a = c && c.addresses[0];
    const job = HCP.state.jobs.find((j) => j.id === i.id);
    const rows = (title, list) => (list.length ? '<div class="pv-head"><span>' + title + "</span><span>qty</span><span>unit price</span><span>amount</span></div>" + list.map((r) => '<div class="pv-row"><b>' + esc(r.name) + "</b><span>" + Number(r.qty).toFixed(1) + "</span><span>" + money(r.price) + "</span><b>" + money(r.qty * r.price) + '</b></div><p class="pv-desc">' + esc(r.description || "") + "</p>").join("") : "");
    const paid = i.status === "Paid";
    return '<div class="iv"><header class="iv-head"><button class="iv-back" data-go="invoices" aria-label="Back to invoices">' + svg("chevLeft") + '</button><h1>Invoice #' + i.id + "</h1>" + (job ? '<button class="link" data-go="job/' + i.id + '">Job #' + i.id + " ↗</button>" : '<button class="link" data-soon="This job">Job #' + i.id + " ↗</button>") + '<span></span><button class="iv-ico" data-soon="Print" aria-label="Print">' + svg("printer") + '</button><button class="iv-ico" data-soon="Download PDF" aria-label="Download PDF">' + svg("invoice") + '</button><button class="pill outline' + (paid ? " inv-off" : "") + '" ' + (paid ? "disabled" : 'data-inv-pay="' + i.id + '"') + '>Pay</button><button class="pill" data-inv-send="' + i.id + '">Send</button></header>' +
      '<article class="pv"><div class="pv-top"><h2>' + esc(D.company) + '</h2><dl class="pv-box"><dt>INVOICE</dt><dd>#' + i.id + "</dd><dt>PAYMENT TERMS</dt><dd>Upon receipt</dd><dt class=\"due\">AMOUNT DUE</dt><dd class=\"due\">" + money(due(i)) + '</dd></dl></div><div class="pv-parties"><div><p>' + esc(c ? c.display : "") + "</p><p>" + esc(a ? a.street : "") + "</p><p>" + esc(a ? a.city + ", " + a.state + " " + a.zip : "") + '</p><p class="pv-phone">' + esc(c && c.phones[0] ? c.phones[0].number : "") + '</p></div><div><h6>CONTACT US</h6><p>100 Demo St</p><p>Riverton, NY 10990</p><p class="pv-phone">(555) 010-0100</p><p>office@demoplumbing.example.com</p></div></div><h3>INVOICE</h3>' + rows("Services", i.services) + rows("Materials", i.materials) +
      '<dl class="pv-sum"><dt>Subtotal</dt><dd>' + money(total(i)) + "</dd><dt>Job Total</dt><dd>" + money(total(i)) + '</dd><dt class="big">Amount Due</dt><dd class="big">' + money(due(i)) + '</dd></dl><p class="pv-terms">See our <a data-soon="Terms and conditions" href="#">Terms &amp; Conditions</a></p>' + (paid ? "" : "") + "</article></div>";
  }
  // ---------- payment window ----------
  const OTHER = ["Homeowner financing", "Warranty work", "e-Transfer", "Other credit card processor", "Other payment type"];
  function renderPay() {
    const el = document.getElementById("modal");
    const p = ui.pay;
    if (!p) { el.hidden = true; el.innerHTML = ""; return; }
    const note = '<label class="pay-f"><input data-pay="note" value="' + esc(p.note) + '" placeholder="Payment note" aria-label="Payment note"></label>';
    const body = p.tab === "Card"
      ? '<div class="pay-card"><input disabled placeholder="Name on card" aria-label="Name on card"><input disabled placeholder="Card number" aria-label="Card number"><div><input disabled placeholder="Expiration (MM/YY)" aria-label="Expiration"><input disabled placeholder="CVC" aria-label="CVC"><input disabled placeholder="Postal code" aria-label="Postal code"></div></div><label class="check pay-save"><input type="checkbox" disabled> Save card on file</label><p class="pay-consent">You acknowledge that you have received written or verbal consent from the cardholder to save and charge the card listed above.</p><p class="pay-total">Total: ' + money(Number(p.amount) || 0) + "</p>"
      : p.tab === "Other"
        ? '<div class="pay-radios">' + OTHER.map((o) => '<label><input type="radio" name="payOther" data-pay="other" value="' + o + '"' + (p.other === o ? " checked" : "") + "> " + o + "</label>").join("") + "</div>" + note
        : note;
    const action = p.tab === "Card" ? "Charge card" : "Paid - " + p.tab.toLowerCase();
    el.hidden = false;
    el.innerHTML = '<div class="dialog pay" role="dialog" aria-modal="true" aria-labelledby="payTitle"><h2 id="payTitle">Payment</h2><div class="pay-body"><div class="pay-top"><label class="pay-f"><span>Amount</span><em>$</em><input id="payAmount" data-pay="amount" inputmode="decimal" value="' + esc(p.amount) + '"></label><label class="pay-f"><span>Email receipt</span><input data-pay="email" value="' + esc(p.email) + '"></label></div><div class="pay-tabs" role="tablist">' + ["Card", "Cash", "Check", "Other"].map((t) => '<button role="tab" aria-selected="' + (p.tab === t) + '" class="' + (p.tab === t ? "on" : "") + '" data-pay-tab="' + t + '">' + t + "</button>").join("") + "</div>" + body + '<div class="pay-foot"><label class="check"><input type="checkbox" data-pay="notify"' + (p.notify ? " checked" : "") + '> Notify customer</label><span></span><button class="pill outline" data-pay-cancel>Cancel</button><button class="pill" data-pay-submit>' + action + "</button></div></div></div>";
  }
  function submitPay() {
    const p = ui.pay;
    if (p.tab === "Card") { toast("Card payments are off in the sandbox. Use Cash, Check or Other"); return; }
    if (p.tab === "Other" && !p.other) { toast("Pick a payment type first"); return; }
    const inv = invoices().find((x) => String(x.id) === String(p.id));
    const amount = Number(p.amount);
    if (!(amount > 0) || amount > due(inv) + 0.001) { toast("Enter an amount up to " + money(due(inv))); return; }
    inv.payments = (inv.payments || []).concat({ amount, type: p.tab === "Other" ? p.other : p.tab, note: p.note });
    if (due(inv) <= 0.001) inv.status = "Paid";
    HCP.save();
    ui.pay = null;
    renderPay();
    toast(money(amount) + " payment recorded" + (p.notify ? ". Customer notified (nothing is really sent)" : ""));
    HCP.render();
  }

  // ---------- send invoice window ----------
  function openSend(inv) {
    const c = cust(inv);
    const mobile = c && c.phones.find((x) => x.kind === "Mobile");
    ui.send = { id: inv.id, by: "Email", to: c && c.emails[0] ? c.emails[0] : "", phone: mobile ? mobile.number : "", subject: "Invoice " + inv.id + " due from " + D.company + " - " + money(due(inv)), message: "Hi " + (c ? c.first || c.display : "") + ",\n\nThank you for choosing " + D.company + ". Please see attached invoice due upon receipt." };
    renderSend();
  }
  const sendReady = () => {
    const p = ui.send;
    const email = p.by !== "Text";
    const text = p.by !== "Email";
    return (!email || (p.to.trim() && p.message.trim())) && (!text || p.phone.trim());
  };
  function renderSend() {
    const el = document.getElementById("modal");
    const p = ui.send;
    if (!p) { el.hidden = true; el.innerHTML = ""; return; }
    const field = (key, label, required) => '<label class="pay-f send-f' + (p[key] ? " filled" : "") + '"><span>' + label + (required ? '<b class="send-star"> *</b>' : "") + '</span><input data-send="' + key + '" value="' + esc(p[key]) + '" aria-label="' + label + '"></label>';
    const email = field("to", "To", p.by === "Email" || p.by === "Email & Text") + field("subject", "Subject") + '<label class="pay-f send-f filled send-msg"><span>Message *</span><textarea data-send="message" aria-label="Message">' + esc(p.message) + '</textarea></label><div class="send-att"><small>Attachments</small>invoice-' + p.id + ".pdf</div>";
    const text = field("phone", "To", true) + '<p class="send-note">Invoice due from ' + esc(D.company) + "</p>";
    el.hidden = false;
    el.innerHTML = '<div class="dialog pay send" role="dialog" aria-modal="true" aria-labelledby="sendTitle"><h2 id="sendTitle">Send invoice</h2><div class="pay-body"><div class="send-by"><span>Send by</span>' + ["Email", "Text", "Email & Text"].map((o) => '<label><input type="radio" name="sendBy" data-send-by="' + o + '"' + (p.by === o ? " checked" : "") + "> " + o + "</label>").join("") + "</div>" + (p.by === "Text" ? text : p.by === "Email" ? email : email + field("phone", "To", true)) + '</div><div class="send-foot"><button class="pill outline" data-send-cancel>Cancel</button><button class="pill' + (sendReady() ? "" : " off") + '" id="sendGo" data-send-go' + (sendReady() ? "" : " disabled") + ">Send</button></div></div>";
  }
  function submitSend() {
    const p = ui.send;
    const inv = invoices().find((x) => String(x.id) === String(p.id));
    const d = new Date();
    inv.sent = d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0");
    HCP.save();
    ui.send = null;
    renderSend();
    toast("Invoice sent (nothing is really sent)");
    HCP.render();
  }

  HCP.onClick((e) => {
    const t = (s) => e.target.closest(s);
    let b;
    if ((b = t("[data-inv-send]"))) { openSend(invoices().find((x) => String(x.id) === b.dataset.invSend)); return true; }
    if (t("[data-send-cancel]")) { ui.send = null; renderSend(); return true; }
    if (t("[data-send-go]")) { submitSend(); return true; }
    if ((b = t("[data-inv-pay]"))) {
      const inv = invoices().find((x) => String(x.id) === b.dataset.invPay);
      ui.pay = { id: inv.id, tab: "Card", amount: due(inv).toFixed(2), email: "", note: "", other: "", notify: true };
      renderPay();
      return true;
    }
    if ((b = t("[data-pay-tab]"))) { ui.pay.tab = b.dataset.payTab; renderPay(); return true; }
    if (t("[data-pay-cancel]")) { ui.pay = null; renderPay(); return true; }
    if (t("[data-pay-submit]")) { submitPay(); return true; }
    if ((b = t("[data-inv-tab]"))) { ui.tab = b.dataset.invTab; HCP.render(); return true; }
    if (t("[data-inv-promo]")) { ui.promo = false; HCP.render(); return true; }
    if (t("[data-inv-tip]")) { ui.tip = false; HCP.render(); return true; }
    return false;
  });
  document.addEventListener("input", (e) => {
    const sk = e.target.dataset && e.target.dataset.send;
    if (sk && ui.send) {
      ui.send[sk] = e.target.value;
      e.target.parentElement.classList.toggle("filled", !!e.target.value);
      const go = document.getElementById("sendGo");
      go.disabled = !sendReady();
      go.classList.toggle("off", !sendReady());
      return;
    }
    if (e.target.dataset && e.target.dataset.sendBy && ui.send) { ui.send.by = e.target.dataset.sendBy; renderSend(); return; }
    const k = e.target.dataset && e.target.dataset.pay;
    if (k && ui.pay) { if (e.target.type === "radio" && !e.target.checked) return; ui.pay[k] = e.target.type === "checkbox" ? e.target.checked : e.target.value; return; }
    if (e.target.matches("[data-inv-query]")) { ui.query = e.target.value; document.getElementById("invRows").innerHTML = tableRows(); }
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && ui.pay) { ui.pay = null; renderPay(); }
    if (e.key === "Escape" && ui.send) { ui.send = null; renderSend(); }
  });
  Object.assign(HCP.views, { invoices: renderList, invoice: renderInvoice });
  Object.assign(HCP.navFor, { invoice: "invoices" });
  HCP.afterRender.push(() => {
    const p = document.getElementById("page");
    p.classList.toggle("inv-page", HCP.view === "invoices");
    p.classList.toggle("iv-page", HCP.view === "invoice");
  });
  HCP.onReset.push(() => { Object.assign(ui, freshUi()); renderPay(); renderSend(); });
});
