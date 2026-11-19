/* HCP Academy: guided walk-throughs and knowledge checks, run inside the HCP practice copy (../hcp-practice/).
   Each step: t (title), do (what to do), at (where the orange box goes: a CSS selector, or {text, sel}), done(X) (true once the step is done).
   X helpers: X.S practice data, X.route() current screen, X.seen(re) visited a screen, X.clicked(re) clicked something whose text or label matches,
   X.val(sel) a field's value, X.has(re) the screen shows that text, X.on(re) a selected tab or chip shows that text, X.base what the data was at the start.
   kc: optional extra checks at the end of the knowledge check, as [[ok, message], ...]. All data is made up. */
(function(){
var low = function(s){ return String(s == null ? "" : s).toLowerCase(); };
var cust = function(S, first, last){ return S.customers.filter(function(c){ return low(c.first) === low(first) && low(c.last) === low(last); }); };
var newJobs = function(X, custId){ return X.S.jobs.filter(function(j){ return X.base.jobs.indexOf(j.id) < 0 && (!custId || j.customerId === custId); }); };
var addRosa = function(H){ if(cust(H.state, "Rosa", "Delgado").length) return; H.state.customers.unshift({ id: "c-rosa", first: "Rosa", last: "Delgado", display: "Rosa Delgado", emails: [], phones: [{ kind: "Mobile", number: "(555) 010-0181", note: "" }], company: "", role: "", type: "Homeowner", dns: false, addresses: [{ id: "a-rosa", street: "9 Birch Ln", unit: "", city: "Riverton", state: "NY", zip: "10990" }], notes: "", tags: [], lead: "Google Search", referredBy: "", billsTo: "", notify: true, created: "2026-11-18", terms: "" }); H.save(); };
var nav = function(id, name){ return { t: "Open " + name, do: "Click <b>" + name + "</b> in the left menu.", at: '[data-nav="' + id + '"]', done: function(X){ return X.route().indexOf(id) === 0 || X.seen(new RegExp("^" + id)) || X.clicked(new RegExp("^" + name + "$", "i")); } }; };
var call = function(n){ return { t: "Open practice call " + n, do: "Click <b>Practice calls</b> (bottom right of the practice copy), then go to call " + n + " with <b>Next call</b>.", at: "[data-p-open], [data-p-step='1']",
  done: function(X){ var t = X.doc.querySelector("#practice:not([hidden]) .p-head span"); return !!t && t.textContent.indexOf("Practice call " + n + " ") === 0; } }; };
var pcheck = function(id){ return function(X){ var C = X.win.HCPX_CHECKS, f = C && C[id]; if(!f) return [[false, "Practice call checks are missing. Reload the page."]]; return f({ jobs: X.base.jobs }); }; };
var bookSteps = [
  { t: "Start a new job", do: "Click <b>Create</b> (top left), then <b>Job</b>.", at: "[data-create], [data-new='job']", done: function(X){ return X.route() === "new-job"; } },
  { t: "Pick or add the customer", do: "Search the caller by name or phone. Pick the match, or click <b>+ New customer</b> if they're new.", at: "[data-cust-search], [data-new-cust-in-job]", done: function(X){ return X.custPicked(); } },
  { t: "Fill in the job", do: "Add the job type, business unit, lead source and a private note. Set the schedule if the caller agreed a time.", at: '[data-b="job.jobType"]', done: function(X){ return !!X.val('[data-b="job.jobType"]') || newJobs(X).length > 0; } },
  { t: "Save the job", do: "Click <b>Save job</b>.", at: "[data-save-job]", done: function(X){ return newJobs(X).length > 0; } }
];
window.HCP_GUIDES = {
  "hf-1": { start: "home", steps: [
    { t: "Search first", do: "Type <b>Rosa</b> in <b>Search records</b> at the top and press <b>Enter</b>. She isn't there yet, so you'll make her.", at: 'input[aria-label="Search records"]', done: function(X){ return /rosa/i.test(X.val('input[aria-label="Search records"]')) || X.clicked(/^create$/i); } },
    { t: "Open Create", do: "Click <b>Create</b> (top left).", at: "[data-create]", done: function(X){ return !!X.doc.querySelector("[data-new='customer']") || !!X.doc.querySelector("#custTitle"); } },
    { t: "Pick Customer", do: "Click <b>Customer</b>. The <b>Add new customer</b> window opens.", at: "[data-new='customer']", done: function(X){ return !!X.doc.querySelector("#custTitle"); } },
    { t: "Name and cell number", do: "First name <b>Rosa</b>, last name <b>Delgado</b>. Put <b>(555) 010-0181</b> in <b>Mobile phone</b>.", at: "#cf-first", done: function(X){ return low(X.val('[data-b="cust.first"]')) === "rosa" && low(X.val('[data-b="cust.last"]')) === "delgado" && /0181/.test(X.val('[data-b^="cust.phones."][data-b$=".number"]')); } },
    { t: "Address", do: "Fill in <b>9 Birch Ln</b>, <b>Riverton</b>, <b>NY</b>, <b>10990</b>. The practice copy has plain fields with no suggestions.", at: '[data-b="cust.addresses.0.street"]', done: function(X){ return /9 birch/i.test(X.val('[data-b="cust.addresses.0.street"]')); } },
    { t: "Lead source", do: "Leave the type as <b>Homeowner</b>. Set <b>Lead source</b> to <b>Google Search</b>.", at: '[data-b="cust.lead"]', done: function(X){ return X.val('[data-b="cust.lead"]') === "Google Search"; } },
    { t: "Create the customer", do: "Check <b>Send notifications</b> is ticked, then click <b>Create customer</b>.", at: "[data-save-customer]", done: function(X){ return cust(X.S, "Rosa", "Delgado").length > 0; } }],
    kc: function(X){ var c = cust(X.S, "Rosa", "Delgado")[0]; if(!c) return [[false, "No customer Rosa Delgado yet"]];
      var m = (c.phones || []).filter(function(p){ return p.kind === "Mobile"; })[0], a = (c.addresses || [])[0] || {};
      return [[!!m && /010-?0181/.test(m.number), "Cell number in Mobile"], [/9 birch/i.test(a.street || "") && /riverton/i.test(a.city || ""), "Address 9 Birch Ln, Riverton"], [c.type === "Homeowner", "Type Homeowner"], [c.lead === "Google Search", "Lead source Google Search"], [cust(X.S, "Rosa", "Delgado").length === 1, "Only one Rosa Delgado (no duplicate)"]]; } },
  "hf-2": { start: "home", steps: [
    nav("customers", "Customers"),
    { t: "Open Tom Reyes", do: "Open <b>Tom Reyes</b> with the email <b>tom.reyes@example.com</b> (the one with jobs).", at: '[data-go="customer/c2"]', done: function(X){ return X.route() === "customer/c2"; } },
    { t: "Add an address", do: "Click the <b>+</b> next to the address count.", at: '[data-cp="addr"]', done: function(X){ return /add address/i.test(X.text("#modal")); } },
    { t: "Type the rental", do: "<b>18 Cedar Ct</b>, <b>Locust Hill</b>, <b>NY</b>, <b>10991</b>. Leave <b>Set as billing</b> unticked: bills still go to his home.", at: '[data-cpf="street"]', done: function(X){ return /18 cedar/i.test(X.val('[data-cpf="street"]')) && /locust/i.test(X.val('[data-cpf="city"]')); } },
    { t: "Add it", do: "Click <b>Add</b>.", at: "[data-cp-ok]", done: function(X){ var c = X.S.customers.filter(function(c){ return c.id === "c2"; })[0]; return !!c && c.addresses.some(function(a){ return /18 cedar/i.test(a.street); }); } }],
    kc: function(X){ var c = X.S.customers.filter(function(c){ return c.id === "c2"; })[0]; if(!c) return [[false, "Tom Reyes is missing"]]; var a = c.addresses.filter(function(a){ return /18 cedar/i.test(a.street); })[0];
      return [[!!a, "18 Cedar Ct added to Tom Reyes"], [!a || c.billingAddr !== a.id, "Set as billing left unticked"], [cust(X.S, "Tom", "Reyes").length === X.base.tomCount, "No new Tom Reyes made"]]; } },
  "hf-3": { start: "home", steps: [
    nav("jobs", "Jobs"),
    { t: "Open job #2262", do: "Open job <b>#2262</b> (Northgate Homes).", at: '[data-go="job/2262"]', done: function(X){ return X.route() === "job/2262"; } },
    { t: "Find Job tags", do: "On the left, find <b>Job tags</b>. Check that <b>Contractor</b> is on it. Don't add new tags.", at: { text: /^job tags/i }, done: function(X){ return X.route() === "job/2262" && X.has(/contractor/i); } }],
    kc: function(X){ var j = X.S.jobs.filter(function(j){ return j.id === 2262; })[0]; return [[X.seen(/^job\/2262/), "Opened job #2262"], [!!j && j.tags.length === 1 && j.tags[0] === "Contractor", "Tags left as they were (Contractor only)"]]; } },
  "hf-4": { start: "home", setup: addRosa, steps: [
    nav("customers", "Customers"),
    { t: "Open Rosa Delgado", do: "Open <b>Rosa Delgado</b> and find her <b>Lead source</b> on the Profile tab.", at: '[data-go="customer/c-rosa"]', done: function(X){ return X.route() === "customer/c-rosa"; } },
    { t: "Start a job for her", do: "Click <b>Create</b>, then <b>Job</b>.", at: "[data-create], [data-new='job']", done: function(X){ return X.route() === "new-job"; } },
    { t: "Pick Rosa", do: "Type <b>Rosa</b> in the customer search and pick <b>Rosa Delgado</b>.", at: "[data-cust-search]", done: function(X){ return X.custPicked(/rosa/i); } },
    { t: "Check the lead source", do: "Click the <b>+</b> next to <b>Lead source</b>. Make sure it says <b>Google Search</b> (it comes from her profile).", at: '[data-row-open="lead"], [data-b="job.lead"]', done: function(X){ return X.val('[data-b="job.lead"]') === "Google Search"; } },
    { t: "Save the job", do: "Click <b>Save job</b>.", at: "[data-save-job]", done: function(X){ return newJobs(X, "c-rosa").length > 0; } }],
    kc: function(X){ var j = newJobs(X, "c-rosa")[0]; return [[X.seen(/^customer\/c-rosa/), "Checked Rosa's profile"], [!!j, "New job for Rosa Delgado"], [!!j && j.lead === "Google Search", "Job lead source Google Search"]]; } },
  "hf-5": { start: "home", steps: [
    nav("jobs", "Jobs"),
    { t: "Open job #2260", do: "Open job <b>#2260</b> (Ana Kowalski).", at: '[data-go="job/2260"]', done: function(X){ return X.route() === "job/2260"; } },
    { t: "Read the Fields card", do: "Find the <b>Fields</b> card on the left. Job type should be <b>Maintenance</b> and business unit <b>Plumbing</b>.", at: { text: /^fields$/i }, done: function(X){ return X.route() === "job/2260" && X.has(/maintenance/i); } }],
    kc: function(X){ var j = X.S.jobs.filter(function(j){ return j.id === 2260; })[0]; return [[X.seen(/^job\/2260/), "Opened job #2260"], [!!j && j.jobType === "Maintenance" && j.unit === "Plumbing", "Job type and business unit left right"]]; } },
  "hf-6": { start: "home", steps: [
    nav("team", "Team"),
    { t: "Team Members", do: "Open <b>Team Members</b>. Read each person's <b>Role</b>: Admin, Office staff or Field tech.", at: '[data-nav="team-members"], [data-go="team-members"]', done: function(X){ return X.route() === "team-members"; } },
    { t: "Settings view", do: "Open <b>Settings</b>, then <b>Team &amp; Permissions</b>. Same people, same roles.", at: '[data-go="app-settings"], [data-go="app-settings/team"]', done: function(X){ return X.route() === "app-settings/team"; } }],
    kc: function(X){ return [[X.seen(/^team-members/), "Read the roles on Team Members"], [X.seen(/^app-settings\/team/), "Opened Settings > Team & Permissions"]]; } },
  "hf-7": { start: "home", steps: [
    { t: "Open Settings", do: "Click <b>Settings</b> (left menu, bottom).", at: '[data-go="app-settings"]', done: function(X){ return X.route().indexOf("app-settings") === 0; } },
    { t: "Notifications", do: "Click <b>Notifications</b>. The <b>Customer</b> tab shows the Jobs, Estimates and Invoices messages.", at: '[data-go="app-settings/notifications"]', done: function(X){ return X.route() === "app-settings/notifications"; } },
    nav("customers", "Customers"),
    { t: "One customer", do: "Open <b>Lena Rosati</b> and find <b>Notifications enabled</b> on her profile.", at: '[data-go="customer/c3"]', done: function(X){ return /^customer\//.test(X.route()) && X.has(/notifications enabled/i); } }],
    kc: function(X){ return [[X.seen(/^app-settings\/notifications/), "Looked through Settings > Notifications"], [X.seen(/^customer\//), "Opened a customer's profile"]]; } },
  "hf-8": { start: "home", steps: [
    nav("customers", "Customers"),
    { t: "Manage duplicates", do: "Click <b>Actions</b>, then <b>Manage duplicates</b>.", at: { text: /^(actions|manage duplicates)$/i }, done: function(X){ return /duplicates/.test(X.route()) || X.has(/match customers on/i); } },
    { t: "Open the Tom Reyes group", do: "Match on <b>Name</b>. Open the <b>Tom Reyes</b> group and check both have the same mobile and address.", at: "[data-dup-open]", done: function(X){ return X.clicked(/tom reyes/i) || !!X.doc.querySelector("[data-dup-pick]"); } },
    { t: "Tick both", do: "Tick both <b>Tom Reyes</b> rows.", at: "[data-dup-pick], [data-dup-group]", done: function(X){ return X.doc.querySelectorAll("[data-dup-pick]:checked").length >= 2 || X.clicked(/^merge$/i); } },
    { t: "Merge", do: "Click <b>Merge</b> (upper right), check the pop-up, then <b>Merge Customers</b>.", at: "[data-dup-merge], [data-dup-go]", done: function(X){ return cust(X.S, "Tom", "Reyes").length === 1; } }],
    kc: function(X){ var t = cust(X.S, "Tom", "Reyes"); return [[t.length === 1, "One Tom Reyes left"], [t.length === 1 && t[0].emails.length >= 2, "Both emails kept on the merged record"]]; } },
  "hm1-1": { start: "home", steps: [call(1)].concat(bookSteps), kc: pcheck("new-home") },
  "hm1-2": { start: "home", steps: [call(2)].concat(bookSteps), kc: pcheck("existing") },
  "hm1-3": { start: "home", steps: [call(3)].concat(bookSteps), kc: pcheck("business") },
  "hm1-4": { start: "home", steps: [call(4),
    { t: "Search the caller", do: "Type <b>Dale</b> (or his number, (555) 010-0148) in <b>Search records</b>, press <b>Enter</b>, and open his profile.", at: 'input[aria-label="Search records"]', done: function(X){ return /^customer\//.test(X.route()) && X.has(/whitcomb/i); } },
    { t: "Read the profile", do: "See <b>Do not service</b> next to his name. Don't book. Tell the caller you'll pass it on, and tell your manager.", at: { text: /^do not service$/i }, done: function(X){ return X.has(/do not service/i); } }],
    kc: pcheck("dns") },
  "hm1-5": { start: "home", steps: [
    nav("inbox", "Inbox"),
    { t: "Open Calls", do: "Click <b>Calls</b>. You land on the Voice <b>Call log</b>.", at: '[data-nav="calls"], [data-go="calls"]', done: function(X){ return X.route() === "calls"; } },
    { t: "Missed tab", do: "Click the <b>Missed</b> tab.", at: { text: /^missed/i, sel: "button" }, done: function(X){ return X.clicked(/^missed/i); } },
    { t: "Voicemails tab", do: "Click the <b>Voicemails</b> tab.", at: { text: /^voicemails$/i, sel: "button" }, done: function(X){ return X.clicked(/^voicemails$/i); } },
    { t: "Open the voicemail", do: "Click the voicemail from <b>(555) 010-0190</b> and read it.", at: { text: /\(555\) 010-0190/ }, done: function(X){ return X.has(/water heater is leaking/i); } },
    { t: "Call back", do: "Click <b>Call back</b>.", at: { text: /^call back$/i, sel: "button" }, done: function(X){ return X.clicked(/^call back$/i); } }],
    kc: function(X){ return [[X.clicked(/^voicemails$/i), "Opened the Voicemails tab"], [X.clicked(/^call back$/i), "Called the voicemail back"]]; } },
  "hm1-6": { start: "home", steps: [
    nav("inbox", "Inbox"),
    { t: "Open Calls", do: "Click <b>Calls</b>.", at: '[data-nav="calls"], [data-go="calls"]', done: function(X){ return X.route() === "calls"; } },
    { t: "HCP Assist tab", do: "Click the <b>HCP Assist</b> tab.", at: { text: /^hcp assist$/i, sel: "button" }, done: function(X){ return X.has(/action required/i) && X.has(/calls this month/i); } },
    { t: "Open an Action required call", do: "Open the first <b>Action required</b> call and read the <b>Call notes</b>.", at: "[data-as-open]", done: function(X){ return /call notes/i.test(X.text("#modal")); } },
    { t: "Change the status", do: "After you act, change <b>Status</b> (to To do, In progress or Reviewed) and save. Do the same for the other <b>Action required</b> call.", at: "[data-as-status], [data-as-save], [data-as-open]", done: function(X){ return X.S.calls && X.S.calls.assist.filter(function(a){ return a.status === "Action required"; }).length === 0; } }],
    kc: function(X){ var left = X.S.calls ? X.S.calls.assist.filter(function(a){ return a.status === "Action required"; }).length : 9; return [[left === 0, "Both Action required calls worked (status changed)"]]; } },
  "hm1-7": { start: "home", steps: [
    { t: "Open Create", do: "Click <b>Create</b>, then <b>Lead</b>.", at: "[data-create], [data-new='Lead'], [data-new='lead']", done: function(X){ return X.route() === "new-lead"; } },
    { t: "Pick Sam Chen", do: "Search <b>Sam</b> and pick <b>Sam Chen</b>.", at: "#fCust", done: function(X){ return X.custPicked(/sam chen/i); } },
    { t: "Lead source", do: "Click the <b>+</b> next to <b>Lead source</b> and pick <b>Google Search</b>.", at: '[data-f-row="lead"], [data-f="lead"]', done: function(X){ return X.val('[data-f="lead"]') === "Google Search"; } },
    { t: "Save the lead", do: "Click <b>Save lead</b>. It shows in <b>Leads</b> (left menu).", at: "[data-f-save]", done: function(X){ return ((X.S.extra || {}).leads || []).length > X.base.leads; } }],
    kc: function(X){ var sam = X.S.customers.filter(function(c){ return c.display === "Sam Chen"; })[0], l = ((X.S.extra || {}).leads || []).filter(function(l){ return sam && l.customerId === sam.id; })[0]; return [[!!l, "Lead saved for Sam Chen"], [!!l && l.source === "Google Search", "Lead source Google Search"]]; } },
  "hm1-8": { start: "home", steps: [
    { t: "Start a new job", do: "Click <b>Create</b>, then <b>Job</b>.", at: "[data-create], [data-new='job']", done: function(X){ return X.route() === "new-job"; } },
    { t: "Pick Lena Rosati", do: "Search <b>Lena</b> and pick <b>Lena Rosati</b> (22 Ocean Ave).", at: "[data-cust-search]", done: function(X){ return X.custPicked(/lena rosati/i); } },
    { t: "Schedule and tech", do: "Set <b>tomorrow, 9:00am to 11:00am</b> and add <b>Dana Mills</b> with <b>Edit team</b>. Leave <b>Notify customer</b> ticked.", at: '[data-b="job.sched.date"]', done: function(X){ return !!X.val('[data-b="job.sched.date"]') && /dana mills/i.test(X.text(".nj-team")); } },
    { t: "Job details", do: "Note <b>water heater flush</b>; job type <b>Maintenance</b>; business unit <b>Plumbing</b>; lead source <b>Existing customer</b> (click the + next to Lead source).", at: '[data-b="job.jobType"]', done: function(X){ return X.val('[data-b="job.jobType"]') === "Maintenance" && X.val('[data-b="job.lead"]') === "Existing customer"; } },
    { t: "Save the job", do: "Click <b>Save job</b>.", at: "[data-save-job]", done: function(X){ return newJobs(X, "c3").length > 0; } }],
    kc: function(X){ var j = newJobs(X, "c3")[0], tm = X.H.sched && X.H.sched.today ? X.H.sched.today() : ""; var a = j && j.appt;
      return [[!!j, "New job for Lena Rosati"], [!!a && a.start === 540 && a.end === 660, "9:00am to 11:00am"], [!!a && a.team.indexOf("e3") >= 0, "Dana Mills on the job"], [!!j && j.jobType === "Maintenance" && j.unit === "Plumbing", "Maintenance, Plumbing"], [!!j && j.lead === "Existing customer", "Lead source Existing customer"]]; } },
  "hm1-9": { start: "home", steps: [
    nav("jobs", "Jobs"),
    { t: "Read the columns", do: "Read the columns that show. In Housecall Pro you'd click <b>Edit columns</b> to add <b>Job lead source</b> and <b>Job type</b>; in the practice copy it only explains.", at: '[aria-label="Edit columns"]', done: function(X){ return X.clicked(/edit columns|filter/i); } }],
    kc: function(X){ return [[X.seen(/^jobs/), "Opened the Jobs list"], [X.clicked(/edit columns/i), "Found Edit columns"]]; } }
};
/* what the knowledge check compares against: taken when the check starts */
window.HCP_BASE = function(H){ var S = H.state; return { jobs: S.jobs.map(function(j){ return j.id; }), leads: ((S.extra || {}).leads || []).length, tomCount: S.customers.filter(function(c){ return c.display === "Tom Reyes"; }).length, actionReq: S.calls ? S.calls.assist.filter(function(a){ return a.status === "Action required"; }).length : 2 }; };
})();
