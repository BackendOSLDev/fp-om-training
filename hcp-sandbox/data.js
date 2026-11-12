// Demo seed data. Every company, person and number here is fictional.
// Nav labels and order are copied from the live Housecall Pro sidebar (hcp/screens/home-nav-*.webp).

// Seed appointments land in the week the sandbox is first opened. 0 is that week's Sunday.
const seedDay = (n) => {
  const d = new Date();
  d.setDate(d.getDate() - d.getDay() + n);
  return d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0");
};

window.HCP_DATA = {
  user: { first: "Demo", name: "Demo User", role: "Admin", initials: "DU" },
  company: "Demo Plumbing",
  counts: { notifications: 11, chat: 97 },

  team: [
    { id: "e0", name: "Demo User", initials: "DU", color: "#c0370c" },
    { id: "e1", name: "Michael Ortiz", initials: "MO", color: "#0089d1" },
    { id: "e2", name: "Francisco Diaz", initials: "FD", color: "#004d41" },
    { id: "e3", name: "Dana Mills", initials: "DM", color: "#5d4037" },
  ],
  scheduleViews: ["Schedule", "Dispatch", "Day", "Week", "Monday-Friday", "Month"],
  arrivalWindows: [["None", 0], ["15 minutes", 15], ["30 minutes", 30], ["1 hour", 60], ["2 hours", 120], ["3 hours", 180], ["4 hours", 240]],

  // Each group is split by a divider. `menu: true` rows have a chevron in the real app;
  // their sub-items aren't copied until we have a screenshot of them.
  nav: [
    [
      { id: "home", label: "Home", icon: "home" },
      { id: "schedule", label: "Schedule", icon: "calendar" },
      { id: "pipeline", label: "Pipeline", icon: "pipeline" },
    ],
    [
      { id: "customers", label: "Customers", icon: "person" },
      { id: "leads", label: "Leads", icon: "target" },
      { id: "estimates", label: "Estimates", icon: "clipboard" },
      { id: "jobs", label: "Jobs", icon: "wrench" },
      { id: "invoices", label: "Invoices", icon: "invoice" },
      { id: "service-plans", label: "Service plans", icon: "shield" },
      { id: "purchase-orders", label: "Purchase orders", icon: "order" },
    ],
    [
      { id: "inbox", label: "Inbox", icon: "chat", menu: true, dot: true },
      { id: "money", label: "Money", icon: "dollar", menu: true },
      { id: "marketing", label: "Marketing", icon: "megaphone", menu: true },
      { id: "reporting", label: "Reporting", icon: "report", menu: true },
      { id: "team", label: "Team", icon: "team", menu: true },
    ],
    [
      { id: "price-book", label: "Price book", icon: "tools" },
      { id: "my-apps", label: "My Apps", icon: "grid", arrow: true },
    ],
  ],

  // Field options are practice values. Every real account sets up its own.
  leadSources: ["Google Search", "Google Local Services", "Facebook", "Referral", "Existing customer", "Yard sign"],
  jobTypes: ["Repair", "Install", "Diagnostic", "Maintenance"],
  businessUnits: ["Plumbing", "HVAC"],
  jobTemplates: ["Drain cleaning", "Water heater install"],
  checklists: ["Job Completion Debrief"],
  jobTabs: ["All", "Scheduled", "Not scheduled", "In Progress", "Completed"],

  priceBook: [
    { kind: "service", name: "Service call", description: "Trip and first-hour diagnosis", price: 129 },
    { kind: "service", name: "Drain cleaning", description: "Clear one fixture drain", price: 245 },
    { kind: "service", name: "Main line cable clean", description: "Clear main sewer line", price: 325 },
    { kind: "service", name: "Faucet replacement", description: "Labor to replace one faucet", price: 185 },
    { kind: "service", name: "Water heater flush", description: "Flush and inspect tank", price: 160 },
    { kind: "service", name: "Leak repair", description: "Find and repair one leak", price: 295 },
    { kind: "material", name: "Kitchen faucet", description: "Standard single-handle", price: 140 },
    { kind: "material", name: "Supply line", description: "Braided, 20 inch", price: 18 },
    { kind: "material", name: "Wax ring kit", description: "Toilet reset kit", price: 12 },
    { kind: "material", name: "Shutoff valve", description: "Quarter-turn", price: 26 },
  ],

  customers: [
    { id: "c1", first: "Ana", last: "Kowalski", display: "Ana Kowalski", emails: ["ana.k@example.com"], phones: [{ kind: "Mobile", number: "(555) 010-0119", note: "" }], company: "", role: "", type: "Homeowner", dns: false, addresses: [{ id: "a1", street: "77 Harbor Rd", unit: "", city: "Riverton", state: "NY", zip: "10990" }, { id: "a2", street: "12 Mill Ln", unit: "Rental", city: "Riverton", state: "NY", zip: "10990" }], notes: "Owns a rental on Mill Ln.", tags: ["Repeat"], lead: "Google Search", referredBy: "", billsTo: "", notify: true },
    { id: "c2", first: "Tom", last: "Reyes", display: "Tom Reyes", emails: ["tom.reyes@example.com"], phones: [{ kind: "Mobile", number: "(555) 010-0127", note: "" }], company: "", role: "", type: "Homeowner", dns: false, addresses: [{ id: "a3", street: "5 Pine St", unit: "", city: "Locust Hill", state: "NY", zip: "10991" }], notes: "", tags: [], lead: "Facebook", referredBy: "", billsTo: "", notify: true },
    { id: "c3", first: "Lena", last: "Rosati", display: "Lena Rosati", emails: ["lena.r@example.com"], phones: [{ kind: "Mobile", number: "(555) 010-0133", note: "" }, { kind: "Home", number: "(555) 010-0134", note: "After 5 PM" }], company: "", role: "", type: "Homeowner", dns: false, addresses: [{ id: "a4", street: "22 Ocean Ave", unit: "", city: "Bayview", state: "NY", zip: "10992" }], notes: "Side door. Dog in the yard.", tags: [], lead: "Referral", referredBy: "", billsTo: "", notify: true },
    { id: "c4", first: "Dale", last: "Whitcomb", display: "Dale Whitcomb", emails: [], phones: [{ kind: "Mobile", number: "(555) 010-0148", note: "" }], company: "", role: "", type: "Homeowner", dns: true, addresses: [{ id: "a5", street: "40 Forest Ave", unit: "", city: "Riverton", state: "NY", zip: "10990" }], notes: "Two unpaid invoices. Owner set Do not service.", tags: [], lead: "Google Search", referredBy: "", billsTo: "", notify: false },
    { id: "c5", first: "Priya", last: "Natarajan", display: "Northgate Homes", emails: ["priya@northgate.example.com"], phones: [{ kind: "Work", number: "(555) 010-0152", note: "" }], company: "Northgate Homes", role: "Project manager", type: "Business", dns: false, addresses: [{ id: "a6", street: "12 Valley Rd", unit: "", city: "Riverton", state: "NY", zip: "10990" }], notes: "", tags: ["Contractor"], lead: "Referral", referredBy: "", billsTo: "", notify: true },
    { id: "c6", first: "Sam", last: "Chen", display: "Sam Chen", emails: ["sam.chen@example.com"], phones: [{ kind: "Mobile", number: "(555) 010-0166", note: "" }], company: "", role: "", type: "Homeowner", dns: false, addresses: [{ id: "a7", street: "3 Elm St", unit: "", city: "Bayview", state: "NY", zip: "10992" }], notes: "", tags: [], lead: "Google Local Services", referredBy: "", billsTo: "", notify: true },
  ],

  jobs: [
    { id: 2264, customerId: "c6", addressId: "a7", status: "Scheduled", appt: { date: seedDay(4), start: 480, end: 600, anytime: false, team: ["e1"], arrival: 120 }, jobType: "Repair", unit: "Plumbing", lead: "Google Local Services", tags: [], notes: "Disposal humming, not spinning.", services: [{ name: "Service call", description: "Trip and first-hour diagnosis", qty: 1, price: 129 }], materials: [] },
    { id: 2263, customerId: "c3", addressId: "a4", status: "Scheduled", appt: { date: seedDay(5), start: 840, end: 960, anytime: false, team: ["e2"], arrival: 120 }, jobType: "Repair", unit: "Plumbing", lead: "Referral", tags: [], notes: "Bathroom faucet drip.", services: [{ name: "Faucet replacement", description: "Labor to replace one faucet", qty: 1, price: 185 }], materials: [] },
    { id: 2262, customerId: "c5", addressId: "a6", status: "In Progress", appt: { date: seedDay(3), start: 600, end: 720, anytime: false, team: ["e2"], arrival: 120 }, jobType: "Install", unit: "Plumbing", lead: "Referral", tags: ["Contractor"], notes: "Remodel rough-in.", services: [], materials: [] },
    { id: 2261, customerId: "c2", addressId: "a3", status: "Completed", appt: { date: seedDay(2), start: 480, end: 600, anytime: false, team: ["e1"], arrival: 120 }, jobType: "Install", unit: "Plumbing", lead: "Facebook", tags: [], notes: "Kitchen faucet replaced.", services: [{ name: "Faucet replacement", description: "Labor to replace one faucet", qty: 1, price: 185 }], materials: [{ name: "Kitchen faucet", description: "Standard single-handle", qty: 1, price: 140 }] },
    { id: 2260, customerId: "c1", addressId: "a1", status: "Not scheduled", appt: null, jobType: "Maintenance", unit: "Plumbing", lead: "Existing customer", tags: ["Repeat"], notes: "Wants a water heater flush sometime this month.", services: [{ name: "Water heater flush", description: "Flush and inspect tank", qty: 1, price: 160 }], materials: [] },
    { id: 2259, customerId: "c3", addressId: "a4", status: "Scheduled", appt: { date: seedDay(1), start: 540, end: 780, anytime: false, team: ["e3"], arrival: 240 }, jobType: "Repair", unit: "Plumbing", lead: "Referral", tags: [], notes: "Leak under the kitchen sink.", services: [{ name: "Leak repair", description: "Find and repair one leak", qty: 1, price: 295 }], materials: [] },
    { id: 2258, customerId: "c6", addressId: "a7", status: "Not scheduled", appt: null, jobType: "Repair", unit: "Plumbing", lead: "Google Local Services", tags: [], notes: "Slow kitchen drain.", services: [{ name: "Drain cleaning", description: "Clear one fixture drain", qty: 1, price: 245 }], materials: [] },
    { id: 2257, customerId: "c2", addressId: "a3", status: "Not scheduled", appt: null, jobType: "Repair", unit: "Plumbing", lead: "Facebook", tags: [], notes: "Toilet keeps running.", services: [{ name: "Service call", description: "Trip and first-hour diagnosis", qty: 1, price: 129 }], materials: [] },
    { id: 2256, customerId: "c1", addressId: "a2", status: "Scheduled", appt: { date: seedDay(3), start: 780, end: 1020, anytime: false, team: ["e1", "e3"], arrival: 240 }, jobType: "Repair", unit: "Plumbing", lead: "Existing customer", tags: [], notes: "Main line backing up at the rental.", services: [{ name: "Main line cable clean", description: "Clear main sewer line", qty: 1, price: 325 }], materials: [] },
    { id: 2255, customerId: "c5", addressId: "a6", status: "Scheduled", appt: { date: seedDay(1), start: 600, end: 720, anytime: false, team: ["e1"], arrival: 120 }, jobType: "Diagnostic", unit: "Plumbing", lead: "Referral", tags: ["Contractor"], notes: "No hot water in the model unit.", services: [{ name: "Service call", description: "Trip and first-hour diagnosis", qty: 1, price: 129 }], materials: [] },
  ],

  // Status names and board columns are copied from the live Pipeline. Which statuses sit in which column is our reading of it.
  estimateStatuses: ["Requested", "Scheduled", "In Progress", "Completed", "Sent", "First Follow-Up", "Second Follow-Up", "Third Follow-Up", "On Hold", "Approved", "Rejected", "Archived", "Canceled"],
  estimateColumns: [
    { name: "Unscheduled", statuses: ["Requested"] },
    { name: "Scheduled", statuses: ["Scheduled"] },
    { name: "In Progress", statuses: ["In Progress"] },
    { name: "Completed", statuses: ["Completed"] },
    { name: "Created on Job", statuses: [] },
    { name: "Sent", statuses: ["Sent", "First Follow-Up", "Second Follow-Up", "Third Follow-Up"] },
    { name: "On Hold", statuses: ["On Hold"] },
    { name: "Approved", statuses: ["Approved"] },
    { name: "Rejected", statuses: ["Rejected"] },
  ],
  estimates: [
    { id: 318, customerId: "c1", status: "Requested", assignee: "e1", created: seedDay(-2), updated: seedDay(-1), expires: "Dec 15, 2026", lead: "Existing customer", notes: "", discount: 0, services: [], materials: [] },
    { id: 317, customerId: "c6", status: "Requested", assignee: "e3", created: seedDay(-4), updated: seedDay(-3), expires: "Dec 15, 2026", lead: "Google Local Services", notes: "", discount: 0, services: [], materials: [] },
    { id: 316, customerId: "c2", status: "Scheduled", assignee: "e1", created: seedDay(-9), updated: seedDay(-6), expires: "Dec 10, 2026", lead: "Facebook", notes: "", discount: 0, services: [{ name: "Water heater flush", description: "Flush and inspect tank", qty: 1, price: 160 }], materials: [] },
    { id: 315, customerId: "c5", status: "In Progress", assignee: "e2", created: seedDay(-20), updated: seedDay(-12), expires: "Dec 1, 2026", lead: "Referral", notes: "Remodel, phase two.", discount: 0, services: [{ name: "Main line cable clean", description: "Clear main sewer line", qty: 1, price: 325 }], materials: [] },
    { id: 314, customerId: "c3", status: "Completed", assignee: "e3", created: seedDay(-35), updated: seedDay(-30), expires: "Nov 30, 2026", lead: "Referral", notes: "", discount: 0, services: [{ name: "Leak repair", description: "Find and repair one leak", qty: 2, price: 295 }], materials: [{ name: "Shutoff valve", description: "Quarter-turn", qty: 2, price: 26 }] },
    { id: 313, customerId: "c1", status: "Sent", assignee: "e1", created: seedDay(-1), updated: seedDay(0), expires: "Nov 30, 2026", lead: "Existing customer", notes: "", discount: 400, services: [{ name: "Faucet replacement", description: "Labor to replace one faucet", qty: 4, price: 185 }, { name: "Drain cleaning", description: "Clear one fixture drain", qty: 2, price: 245 }], materials: [{ name: "Kitchen faucet", description: "Standard single-handle", qty: 4, price: 140 }] },
    { id: 312, customerId: "c6", status: "First Follow-Up", assignee: "e2", created: seedDay(-8), updated: seedDay(-2), expires: "Nov 30, 2026", lead: "Google Local Services", notes: "", discount: 0, services: [{ name: "Leak repair", description: "Find and repair one leak", qty: 1, price: 295 }], materials: [] },
    { id: 311, customerId: "c2", status: "Third Follow-Up", assignee: "e1", created: seedDay(-16), updated: seedDay(-1), expires: "Nov 28, 2026", lead: "Facebook", notes: "", discount: 0, services: [{ name: "Faucet replacement", description: "Labor to replace one faucet", qty: 2, price: 185 }], materials: [] },
    { id: 310, customerId: "c3", status: "On Hold", assignee: "e3", created: seedDay(-40), updated: seedDay(-25), expires: "Nov 20, 2026", lead: "Referral", notes: "Waiting on the insurance claim.", discount: 0, services: [{ name: "Main line cable clean", description: "Clear main sewer line", qty: 1, price: 325 }], materials: [] },
    { id: 309, customerId: "c5", status: "Approved", assignee: "e2", created: seedDay(-28), updated: seedDay(-14), expires: "Nov 15, 2026", lead: "Referral", notes: "", discount: 0, services: [{ name: "Drain cleaning", description: "Clear one fixture drain", qty: 6, price: 245 }], materials: [] },
    { id: 308, customerId: "c6", status: "Rejected", assignee: "e1", created: seedDay(-50), updated: seedDay(-45), expires: "Oct 30, 2026", lead: "Google Search", notes: "", discount: 0, services: [{ name: "Water heater flush", description: "Flush and inspect tank", qty: 1, price: 160 }], materials: [] },
  ],

  invoices: [
    { id: 2264, customerId: "c6", status: "Open", due: null, sent: null, services: [{ name: "Service call", description: "Trip and first-hour diagnosis", qty: 1, price: 129 }], materials: [] },
    { id: 2261, customerId: "c2", status: "Paid", due: seedDay(2), sent: seedDay(2), services: [{ name: "Faucet replacement", description: "Labor to replace one faucet", qty: 1, price: 185 }], materials: [{ name: "Kitchen faucet", description: "Standard single-handle", qty: 1, price: 140 }] },
    { id: 2252, customerId: "c3", status: "Open", due: seedDay(-3), sent: seedDay(-3), services: [{ name: "Leak repair", description: "Find and repair one leak", qty: 1, price: 295 }], materials: [] },
    { id: 2251, customerId: "c1", status: "Paid", due: null, sent: null, services: [{ name: "Water heater flush", description: "Flush and inspect tank", qty: 1, price: 160 }], materials: [] },
    { id: 2249, customerId: "c5", status: "Open", due: seedDay(-12), sent: seedDay(-12), services: [{ name: "Main line cable clean", description: "Clear main sewer line", qty: 2, price: 325 }], materials: [] },
    { id: 2247, customerId: "c6", status: "Open", due: seedDay(9), sent: seedDay(1), services: [{ name: "Drain cleaning", description: "Clear one fixture drain", qty: 1, price: 245 }], materials: [] },
    { id: 2245, customerId: "c2", status: "Paid", due: seedDay(-20), sent: seedDay(-20), services: [{ name: "Service call", description: "Trip and first-hour diagnosis", qty: 1, price: 129 }], materials: [] },
  ],

  // Sample New Call content. Every real account writes its own questions, reminders and FAQs.
  requestGuide: [
    { id: "property", q: "Is the property residential or commercial?", type: "single", options: ["Residential", "Commercial"] },
    { id: "age", q: "What is the approximate age of the property?", type: "single", options: ["Less than 5 years old", "6 to 10 years old", "11 to 20 years old", "21 to 50 years old", "Over 50 years old", "Not sure"] },
    { id: "own", q: "Do you own or rent the property?", type: "single", options: ["Own", "Rent"] },
    { type: "reminder", title: "Renters", note: "Confirm the owner has approved the work.", showFor: { id: "own", answer: "Rent" } },
    { id: "work", q: "What type of work do you need done?", type: "single", options: ["Drain", "Leak", "Water heater", "Fixture"] },
    { id: "issue", q: "Tell us more about your issue", type: "text" },
    { id: "status", q: "Choose the appropriate status for this project:", type: "single", options: ["Ready to Hire", "Planning and Budgeting"] },
    { id: "insurance", q: "Is this request covered by an insurance claim?", type: "single", options: ["Yes", "No"] },
    { id: "areas", q: "Which areas are affected?", hint: "Select all that apply", type: "multi", options: ["Kitchen", "Bathrooms", "Basement", "Outside"] },
    { type: "reminder", title: "Reminder", note: "Note every affected area so the tech brings the right parts." },
  ],
  scheduleReminders: [["Scheduling Reminder", "Please do not schedule between 12-1"], ["Service FYI", "We no longer offer backflow testing"]],
  faqs: [
    { q: "What types of payment do you accept?", a: "Cash, check and all major credit cards." },
    { q: "Are there any seasonal promotions available?", a: "Ask a manager for this month's offers." },
  ],

  // Practice calls for the rail. The rules are a generic starting point, not a client SOP.
  practice: [
    {
      id: "new-home", title: "New homeowner",
      call: "Hi, this is Maya Torres. I've never used you before, I found you on Google. My kitchen sink is backed up. I'm at 18 Linden St, Riverton, NY 10990. My cell is (555) 010-0142.",
      steps: ["Search first, so you don't make a duplicate.", "Create the customer: name, mobile, address, lead source.", "Create the job: job type, business unit and a note about the problem. Then Save job."],
    },
    {
      id: "existing", title: "Existing customer, second address",
      call: "It's Ana Kowalski, (555) 010-0119. The water heater at my rental on Mill Ln is leaking. Can you send someone out?",
      steps: ["Search by the phone number.", "Use the customer who's already there, and pick the right address.", "Create the job with the job type, business unit and a note, then Save job."],
    },
    {
      id: "business", title: "New business customer",
      call: "This is Luis Ortega, I manage Harbor Landing Apartments. Another property manager referred me. Unit 7C at 300 Herb Hill Rd, Riverton, NY 10990 has no hot water. Please find out what's wrong. My work number is (555) 010-0177.",
      steps: ["Search first.", "Create a Business customer with the company name.", "Create the job and put the unit number in the notes."],
    },
    {
      id: "dns", title: "Check the customer first",
      call: "Dale Whitcomb here, (555) 010-0148. My toilet keeps running. Can you get someone here tomorrow?",
      steps: ["Search by the phone number and read the customer's profile.", "Decide whether this job should be booked.", "When you've decided, click Check my work."],
    },
  ],

  home: {
    progress: 33,
    tourSlides: ["Checklists", "Invoices"],
    tasks: [
      { id: "estimate", label: "Create an estimate", icon: "clipboard" },
      { id: "job", label: "Schedule a job", icon: "wrenchPlus" },
      { id: "plan", label: "Customize your service plan templates", icon: "bookmark" },
      { id: "invite", label: "Invite your team", icon: "personPlus" },
    ],
  },
};
