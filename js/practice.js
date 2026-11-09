/* Practice tasks: the 5-day program practice (Days 1 to 4 count, Owner reporting is extra). Saved to your account. */
function bcbPractice(HOST, SAVED){
 if(!HOST || HOST.dataset.ready) return; HOST.dataset.ready = "1";
 HOST.innerHTML = "<div class=\"sbx-bar\"><b>Practice tasks</b><span>Days 1 to 4: 54 tasks. Each day starts with a fresh sample company.</span></div><div id=\"px\"></div>";
/* ===== Practice FieldPulse: made-up company data ("Summit Ridge Plumbing"). Nothing here is a real customer. ===== */
const PDAYS = [
  {k:"11-02", lab:"Mon, Nov 2", sh:"Mon 2"},
  {k:"11-03", lab:"Tue, Nov 3", sh:"Tue 3"},
  {k:"11-04", lab:"Wed, Nov 4", sh:"Wed 4"},
  {k:"11-05", lab:"Thu, Nov 5", sh:"Thu 5"},
  {k:"11-06", lab:"Fri, Nov 6", sh:"Fri 6"},
  {k:"11-09", lab:"Mon, Nov 9", sh:"Mon 9"}
];
const TODAY = "11-04";
const DLAB = Object.fromEntries(PDAYS.map(d => [d.k, d.lab]));
const WIN_BEFORE = 1, WIN_AFTER = 1;   // company default arrival window: 1 hour before to 1 hour after the start time
const WHOURS = [6,6.5,7,7.5,8,8.5,9,9.5,10,10.5,11,11.5,12,12.5,13,13.5,14,14.5,15,15.5,16,16.5,17,17.5,18,18.5,19,19.5,20];
const HOURS = [7,7.5,8,8.5,9,9.5,10,10.5,11,11.5,12,12.5,13,13.5,14,14.5,15,15.5,16,16.5,17,17.5,18];
function fmtH(h){ if(h==null||h==="") return ""; h=+h; const hh=Math.floor(h), mm=Math.round((h-hh)*60); const ap=hh>=12?"PM":"AM"; const h12=((hh+11)%12)+1; return `${h12}:${String(mm).padStart(2,"0")} ${ap}`; }
function money(n){ n=+n||0; return (n<0?"-":"")+"$"+Math.abs(n).toLocaleString("en-US",{minimumFractionDigits:2,maximumFractionDigits:2}); }
function dlab(k){ return DLAB[k] || (k ? (()=>{const [m,d]=k.split("-"); return `${["","Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"][+m]} ${+d}, 2026`;})() : "-"); }
function dnum(k){ if(!k) return 0; const [m,d]=k.split("-").map(Number); return m*31+d; }
function daysPast(k){ return dnum(TODAY)-dnum(k); }

const LEAD_SOURCES = ["Real Estate","Word of Mouth","Direct Mail","Out of Home","Advertising","Google Search","Google Ads","Social Media","Facebook","Instagram","Referral","Yelp","Purchased Leads","Angie's List","HomeAdvisor","Thumbtack","Porch","Lowe's","Home Depot","Amazon","Paid"];
const CUST_TAGS = ["VIP","Property Manager","Do Not Service","Warranty Customer","COI Required"];
const CUST_STATUSES = ["Lead","Opportunity","Current Customer","Lost","Other","Inactive"];
const TEAMS = ["Service","New Construction","Septic"];
const CUST_TEAMS = ["Service","New Construction","Septic","New Construction/Septic","Service/Septic","Service/New Construction/Septic"];
const JOB_TAGS = ["Flag: Commercial","Flag: Do Not Service","Flag: Emergency / After Hours","Flag: Follow-Up Needed","Flag: Google Review Left","Flag: Office Review Needed","Flag: Owner-Supplied Parts","Flag: Real Estate Transaction","Flag: Same Day","Flag: Senior Discount","Type: Callback / Warranty","Type: Inspection","Type: Installation","Type: Membership Visit","Type: New Construction","Type: Remodel","Type: Septic","Type: Service Call"];
const JOB_STATUSES = ["New","On The Way","In Progress","Completed","Canceled","Payment Received","Admin"];
const CLOSED_ST = ["Completed","Canceled","Payment Received","Admin"];
const JOB_WORKFLOWS = {"Default Workflow":JOB_STATUSES, "Service":["New","Completed"], "Construction":["New","Pending","Completed","Admin"]};
const JOB_CF = [["gate","Gate / Access Code","text"],["permit","Permit Number","text"],["coi","COI Required","bool"],["own","Owner or Tenant",["Not Confirmed","Owner","Tenant","Property Manager"]],["septic","Septic System Type",["Not Septic / N/A","Unknown - Confirm On Site","Conventional Gravity","Pressure Distribution","Drip","Aerobic Treatment Unit (ATU)","Enhanced Treatment / Other Specialty"]],["zone","Service Area Zone",["Not Set","Standard Service Area","Extended Service Area","Outer Extended Service Area"]],["tax","Tax Code","text"]];
const COMM_TPLS = ["Appointment Confirmation","24 Hour Reminder","On my way","Payment Template","Overdue Invoice Reminder","Review Request","Membership Benefits"];
const COMPANY = "Summit Ridge Plumbing LLC";
const EST_STATUSES = ["Draft","Sent","Follow Up Sent","Accepted","Lost","Rejected","Completed"];
const INV_STATUSES = ["Invoice Draft","Invoiced","Sent","Partially Paid","Paid","Void"];
const PAY_METHODS = ["Cash","Check","Credit Card","Bank Transfer","Other"];
const ITEMS = [
  ["Diagnostic / service call",125],["Drain cleaning - sink",225],["Drain cleaning - main line",395],["Main line camera inspection",395],
  ["Water heater flush",189],["Thermocouple replace",310],["50 gal gas water heater install",2650],["Tankless water heater install",4850],
  ["Toilet replace",890],["Toilet rebuild kit",245],["Faucet replace",295],["Faucet cartridge replace",285],["Garbage disposal install",480],
  ["Shut-off valve replace",260],["Water softener install",2200],["Water softener repair",340],["Shower valve replace",640],["Outdoor spigot replace",210]
];
const ITEM_PRICE = Object.fromEntries(ITEMS);
const JOB_TEMPLATES = {
  "Service Call - Evaluation": {title:"Service Call - Evaluation", desc:"$49 Evaluation (up to 10 min on site). Over 10 min = $99 Extended Evaluation.", tags:["Type: Service Call"], len:2, notes:"Ask: What is the problem? Where is it, inside or outside? How long has it been going on? Gate code or pets?"},
  "Emergency / After-Hours Call": {title:"Emergency / After-Hours Call", desc:"$300 Emergency Dispatch Fee. No water, no working toilet, active leak, or main line backup.", tags:["Flag: Emergency / After Hours"], len:2},
  "Commercial Plumbing Inspection": {title:"Commercial Plumbing Inspection", desc:"$400 full commercial plumbing inspection. Includes water heater flush and diagnostic with recommendations.", tags:["Type: Inspection","Flag: Commercial"], len:3},
  "Septic Service Call - Alarm / Issue": {title:"Septic Service Call - Alarm / Issue", desc:"$500 septic service call to troubleshoot an alarm or issue. Does not include a full inspection.", tags:["Type: Septic"], len:2},
  "Septic - Conventional Gravity Inspection": {title:"Septic - Conventional Gravity Inspection", desc:"$250 septic inspection, conventional gravity system.", tags:["Type: Septic","Type: Inspection"], len:3},
  "Septic - Pressure/Drip/ATU Inspection": {title:"Septic - Pressure/Drip/ATU Inspection", desc:"$450 septic inspection: pressure distribution, drip, ATU, enhanced treatment, or other specialty system.", tags:["Type: Septic","Type: Inspection"], len:3},
  "Septic - Property Sale Inspection": {title:"Septic - Property Sale Inspection", desc:"$550 real estate transfer septic inspection, any system type.", tags:["Type: Septic","Type: Inspection","Flag: Real Estate Transaction"], len:3}
};
const SUBTASK_TEMPLATES = {
  "Closeout checklist": ["Photos before and after","Customer walk-through done","Area cleaned up","Invoice reviewed with customer"],
  "Install checklist": ["Permit number noted","Old unit hauled away","Gas and water tested"]
};
const VENDORS = ["Ridge Supply Co.","Valley Plumbing Supply","Metro Pipe & Fittings"];

function pfresh(){
  const W = {
    users:{
      u1:{name:"Pat Moreno", role:"Admin", admin:true, teams:["Service","New Construction","Septic"], st:"Activated", color:"#6a5acd"},
      u2:{name:"You", role:"Team Manager", admin:true, teams:["Service","Septic"], st:"Activated", color:"#0b7dda", me:true},
      u3:{name:"Lisa Grant", role:"Team Manager", teams:["Service"], st:"Activated", color:"#c2185b"},
      u4:{name:"Carlos Diaz", role:"Service Agent", teams:["Service"], skills:["Plumbing - Journeyman","Plumbing - Commercial"], st:"Activated", color:"#2e7d32", tech:true},
      u5:{name:"Ben Foster", role:"Service Agent", teams:["Service","Septic"], skills:["Plumbing - Journeyman","Septic - Journeyman"], st:"Activated", color:"#ef6c00", tech:true},
      u6:{name:"Mike Turner", role:"Service Agent", teams:["Service","New Construction"], skills:["Plumbing - Journeyman"], st:"Activated", color:"#1565c0", tech:true},
      u7:{name:"Jake Wilson", role:"Service Agent", teams:["Septic"], skills:["Septic - Apprentice"], st:"Activated", color:"#8d6e63", tech:true},
      u8:{name:"Sam Ortiz", role:"Limited Agent", teams:["Service"], skills:["Plumbing - Apprentice"], st:"Activated", color:"#00897b", tech:true},
      u9:{name:"Ridge Subcontractors", role:"Assignment User", teams:[], st:"Activated", color:"#757575"}
    },
    cust:{
      c1:{first:"Grace",last:"Kim",phone:"(555) 201-0101",email:"grace.kim@example.com",addr:"210 Maple St",city:"Brookfield",zip:"53005",st:"Current Customer",type:"Residential",ls:"Google Search",tags:["VIP"],jobNotes:"",contacts:[],locs:[{name:"Home",addr:"210 Maple St, Brookfield",star:true}],cards:[],created:"03-14"},
      c2:{first:"Dana",last:"Ruiz",phone:"(555) 201-0102",email:"dana.ruiz@example.com",addr:"15 Birch Rd",city:"Brookfield",zip:"53005",st:"Current Customer",type:"Residential",ls:"",tags:[],jobNotes:"",contacts:[],locs:[],cards:[],created:"09-22"},
      c3:{first:"Linda",last:"Park",phone:"(555) 201-0103",email:"lpark@example.com",addr:"88 Cedar Ln",city:"Elm Grove",zip:"53122",st:"Current Customer",type:"Residential",ls:"Referral",tags:[],jobNotes:"Side door. Ring twice.",contacts:[],locs:[],cards:[],created:"05-02"},
      c4:{first:"Linda",last:"Parks",phone:"(555) 201-0103",email:"",addr:"88 Cedar Lane",city:"Elm Grove",zip:"53122",st:"Current Customer",type:"Residential",ls:"",tags:[],jobNotes:"",contacts:[],locs:[],cards:[],created:"11-02"},
      c5:{first:"Robert",last:"Hayes",phone:"(555) 201-0105",email:"rhayes@example.com",addr:"5 Hill St",city:"Brookfield",zip:"53005",st:"Current Customer",type:"Residential",ls:"Yelp",tags:[],jobNotes:"",contacts:[],locs:[],cards:[],created:"02-11"},
      c6:{first:"Robert",last:"Hayes",phone:"(555) 201-0188",email:"bob.hayes@example.com",addr:"912 River Rd",city:"Waukesha",zip:"53186",st:"Current Customer",type:"Residential",ls:"Facebook",tags:[],jobNotes:"",contacts:[],locs:[],cards:[],created:"08-19"},
      c7:{first:"Maria",last:"Lopez",phone:"(555) 201-0107",email:"mlopez@example.com",addr:"77 Oak Ave",city:"Brookfield",zip:"53005",st:"Current Customer",type:"Residential",ls:"Word of Mouth",tags:[],jobNotes:"Gate code 4512. Dog in the yard, call on arrival.",contacts:[],locs:[],cards:[],created:"01-08"},
      c8:{first:"Peter",last:"Shaw",phone:"(555) 201-0108",email:"peter.shaw@example.com",addr:"31 Willow Ct",city:"New Berlin",zip:"53151",st:"Current Customer",type:"Residential",ls:"Google Ads",tags:[],jobNotes:"",contacts:[],locs:[],cards:[{brand:"Visa",last4:"4417"}],created:"06-30"},
      c9:{first:"Rita",last:"Gomez",phone:"(555) 201-0109",email:"rita.g@example.com",addr:"9 Spruce Way",city:"Elm Grove",zip:"53122",st:"Current Customer",type:"Residential",ls:"Facebook",tags:[],jobNotes:"",contacts:[],locs:[],cards:[],created:"10-29"},
      c10:{first:"Tom",last:"Baker",phone:"(555) 201-0110",email:"tbaker@example.com",addr:"64 Ash St",city:"Waukesha",zip:"53186",st:"Current Customer",type:"Residential",ls:"Social Media",tags:[],jobNotes:"",contacts:[],locs:[],cards:[],created:"10-12"},
      c11:{first:"Lakeside",last:"Property Mgmt",company:"Lakeside Property Mgmt",phone:"(555) 201-0111",email:"ap@lakeside.example",addr:"400 Lake Shore Dr",city:"Pewaukee",zip:"53072",st:"Current Customer",type:"Commercial",ls:"Referral",tags:["Property Manager"],jobNotes:"Check in at the office first.",contacts:[],locs:[],cards:[],created:"01-20",qb:"failed"},
      c12:{first:"Alan",last:"Brooks",phone:"(555) 201-0112",email:"abrooks@example.com",addr:"12 Fir St",city:"Brookfield",zip:"53005",st:"Current Customer",type:"Residential",ls:"Google Search",tags:[],jobNotes:"",contacts:[],locs:[],cards:[],created:"07-07"},
      c13:{first:"Nora",last:"Fields",phone:"(555) 201-0113",email:"nfields@example.com",addr:"3 Elm Ct",city:"Elm Grove",zip:"53122",st:"Current Customer",type:"Residential",ls:"Google Search",tags:[],jobNotes:"",contacts:[],locs:[],cards:[],created:"10-02"},
      c14:{first:"Owen",last:"Price",phone:"(555) 201-0114",email:"oprice@example.com",addr:"27 Pine Ridge",city:"New Berlin",zip:"53151",st:"Current Customer",type:"Residential",ls:"Advertising",tags:[],jobNotes:"",contacts:[],locs:[],cards:[],created:"09-15"},
      c15:{first:"Ruth",last:"Daniels",phone:"(555) 201-0115",email:"rdaniels@example.com",addr:"150 Valley Rd",city:"Brookfield",zip:"53005",st:"Current Customer",type:"Residential",ls:"Google Search",tags:[],jobNotes:"",contacts:[],locs:[],cards:[],created:"08-01"},
      c17:{first:"Carla",last:"Dunn",phone:"(555) 201-0117",email:"",addr:"5 Lake View Dr",city:"Brookfield",zip:"53005",st:"Current Customer",type:"Residential",ls:"",tags:[],jobNotes:"",contacts:[],locs:[],cards:[],created:"11-03"},
      c16:{first:"Sunset",last:"Apartments",company:"Sunset Apartments LLC",phone:"(555) 201-0116",email:"office@sunset.example",addr:"800 Sunset Blvd",city:"Waukesha",zip:"53186",st:"Current Customer",type:"Commercial",ls:"",tags:["Property Manager"],jobNotes:"",contacts:[],locs:[],cards:[],created:"04-04"}
    },
    jobs:{},
    est:{},
    inv:{},
    templates:Object.keys(JOB_TEMPLATES),
    booking:[
      {id:"b1",name:"Hannah Cole",email:"hannah.cole@example.com",phone:"(555) 201-0140",addr:"18 Lark St, Brookfield",desc:"Water heater makes a popping noise",at:"Nov 3, 9:12 PM",done:false,dismissed:false},
      {id:"b2",name:"Peter Shaw",email:"petershaw77@example.com",phone:"(555) 201-0108",addr:"31 Willow Ct, New Berlin",desc:"Slow drain in the basement",at:"Nov 4, 6:40 AM",done:false,dismissed:false},
      {id:"b3",name:"test test",email:"test@test.com",phone:"",addr:"-",desc:"TEST TEST TEST",at:"Nov 1, 2:57 AM",done:false,dismissed:false}
    ],
    comms:[
      {to:"c1",kind:"Email",what:"Invoice #2036",at:"Nov 2, 4:10 PM",st:"Delivered"},
      {to:"c1",kind:"SMS",what:"Job On the Way (#1030)",at:"Nov 2, 8:41 AM",st:"Delivered"},
      {to:"c14",kind:"SMS",what:"Job New Appointment Confirmation (#1036)",at:"Nov 2, 3:05 PM",st:"Delivered"},
      {to:"c10",kind:"Email",what:"Job New Appointment Confirmation (#1047)",at:"Oct 30, 11:20 AM",st:"Delivered"},
      {to:"c13",kind:"Email",what:"Estimate #3015",at:"Oct 27, 1:15 PM",st:"Opened"},
      {to:"c5",kind:"Email",what:"Estimate #3017",at:"Oct 22, 10:02 AM",st:"Opened"}
    ],
    triggers:[
      ["Job status changes to 'On The Way'","SMS: Job On the Way","Automatically Sent"],
      ["Job is newly created","SMS: Job New Appointment Confirmation","Prompts Confirmation Prior to Sending"],
      ["Job is newly created","Email: Job New Appointment Confirmation","Prompts Confirmation Prior to Sending"],
      ["Job status changes to 'In Progress'","SMS: Arrived","Automatically Sent"]
    ],
    qb:[
      {id:"q1",type:"Customer",rec:"Lakeside Property Mgmt",ref:"c11",st:"Failed",err:"Another customer with this name already exists in QuickBooks.",res:"Check the name, then click Sync with QuickBooks on the customer.",rev:"Opened",at:"Nov 3, 11:02 PM"},
      {id:"q2",type:"Invoice",rec:"#2040",ref:"2040",st:"Failed",err:"The customer on this invoice has not synced.",res:"Sync the customer first, then sync the invoice again.",rev:"Opened",at:"Nov 3, 11:02 PM"},
      {id:"q3",type:"Item",rec:"Water softener install",ref:"item",st:"Failed",err:"No income account is set for this item.",res:"An Admin or the bookkeeper sets the account.",rev:"Opened",at:"Nov 3, 11:01 PM"},
      {id:"q4",type:"Payment",rec:"Payment on #2037",ref:"2037",st:"Success",err:"",res:"",rev:"Closed",at:"Nov 3, 11:00 PM"}
    ],
    ts:[],
    reports:[
      {id:"r1",name:"Owner weekly - Jobs",tab:"jobs",cols:["id","customer","title","status","date","tech"],filters:{},group:null,widget:false},
      {id:"r2",name:"Owner weekly - Payments",tab:"payments",cols:["invoice","customer","method","amount","date","by"],filters:{},group:null,widget:false},
      {id:"r3",name:"Open invoices (widget)",tab:"invoices",cols:["id","customer","status","due","amountDue"],filters:{status:["Invoiced","Sent","Partially Paid"]},group:null,widget:true}
    ],
    dash:[{type:"Default",w:"Jobs Completed"},{type:"Default",w:"New Estimates"},{type:"Default",w:"Payments Collected"},{type:"Custom",w:"Open invoices (widget)"}],
    dashRange:"This Week",
    views:[],
    estViews:[],
    pos:[{id:"PO-1007",vendor:"Ridge Supply Co.",job:"1036",total:1840,st:"Ordered",note:"50 gal water heater"}],
    nextJob:1060, nextEst:3030, nextInv:2060, nextCust:20, nextPay:500, nextPO:1008, nextTs:200
  };
  const J = (id,c,title,st,date,s,e,users,extra) => { W.jobs[id] = Object.assign({id,c,title,st,date,s,e,users,tags:[],notes:"",fnotes:"",win:"",visits:[],subtasks:[],archived:false,created:"10-30"}, extra||{}); };
  J("1030","c1","Water heater flush","Completed","11-02",9,11,["u4"],{tags:["Type: Service Call"]});
  J("1031","c8","Kitchen sink clog","Completed","11-02",13,15,["u5"],{tags:["Type: Service Call"]});
  J("1032","c2","Toilet running","Completed","11-03",8,10,["u6"],{tags:["Type: Service Call"]});
  J("1033","c12","Garbage disposal install","In Progress","11-03",10,12,["u4"],{tags:["Type: Installation"],subtasks:[{series:"Closeout",items:[{n:"Photos before and after",req:true,done:true},{n:"Customer walk-through done",req:true,done:false},{n:"Area cleaned up",req:true,done:true}]}]});
  J("1034","c3","Leak under sink","Completed","11-02",14,16,["u6"],{tags:["Type: Service Call"]});
  J("1035","c2","Faucet replace","New","11-06",9,11,["u5"],{tags:["Flag: Emergency / After Hours"]});
  J("1036","c14","Water heater install","New","11-05",8,12,["u4"],{tags:["Type: Installation"]});
  J("1037","c13","Main line camera","Completed","11-03",13,15,["u5"],{tags:["Type: Service Call"]});
  J("1038","c15","Repipe bathroom","In Progress","11-04",8,12,["u4"],{tags:["Type: Installation"]});
  J("1045","c9","Dishwasher hookup","New","11-05",10,12,["u6"],{created:"11-03"});
  J("1047","c10","Shower valve replace","New","11-06",13,15,["u5"]);
  J("1049","c4","Annual drain service","New","11-06",8,10,["u6"]);
  J("1050","c5","Outdoor spigot replace","New","",null,null,[]);
  J("1051","c16","Unit 3 leak","New","",null,null,[]);
  J("1052","c13","Water softener (needs estimate)","New","11-04",14,16,["u5"]);
  J("1053","c11","Unit 12 shut-off valve","New","11-09",9,11,["u4"]);
  J("1054","c11","Unit 5 toilet","Completed","11-03",15,17,["u6"],{tags:["Type: Service Call"]});
  J("1055","c6","Shut-off valve replace","New","11-06",10,12,["u7"]);
  J("1058","c17","Leaky shower","New","11-06",15,17,["u5"],{created:"11-03",fnotes:"Made by Ben in the app. Grace Kim referred her."});
  J("1056","c12","Bathroom remodel","In Progress","11-02",8,16,["u4","u5"],{tags:["Type: Installation"]});
  J("1029","c7","Toilet rebuild","Completed","10-28",9,10,["u5"]);
  J("1001","c7","Toilet replace","Completed","10-02",9,12,["u4"]);
  J("1002","c3","Water heater replace","Completed","10-05",8,12,["u4"]);
  J("1006","c9","Shower valve replace","Completed","10-12",9,12,["u6"]);
  J("1028","c16","Unit 8 drain","Completed","10-27",10,12,["u6"]);
  J("1027","c2","Water pressure check","Completed","10-26",13,14,["u4"]);

  const E = (id,c,title,st,by,created,sent,opts,extra) => { W.est[id] = Object.assign({id,c,title,st,by,created,sent,opts,addons:[],notes:"",inotes:"",job:"",exp:"12-04",reminder:null,files:[]}, extra||{}); };
  const O = (name,...items) => ({name, items:items.map(([n,q]) => ({n, q:q||1, p:ITEM_PRICE[n]||0}))});
  E("3001","c7","Toilet replace","Accepted","u4","10-01","10-01",[O("Option 1",["Toilet replace"])],{job:"1001",inv:"2001"});
  E("3002","c3","Water heater","Accepted","u4","10-03","10-03",[O("Option 1",["50 gal gas water heater install"])],{job:"1002",inv:"2002"});
  E("3003","c5","Spigot","Lost","u4","10-05","10-05",[O("Option 1",["Outdoor spigot replace"])]);
  E("3004","c13","Disposal","Lost","u5","10-06","10-06",[O("Option 1",["Garbage disposal install"])]);
  E("3005","c15","Faucet","Lost","u5","10-08","10-08",[O("Option 1",["Faucet replace"])]);
  E("3006","c9","Shower valve","Accepted","u6","10-09","10-09",[O("Option 1",["Shower valve replace"])],{job:"1006",inv:"2006"});
  E("3007","c10","Toilet","Lost","u6","10-12","10-12",[O("Option 1",["Toilet replace"])]);
  E("3012","c14","Water heater install","Sent","u4","10-26","10-26",[O("Option 1",["50 gal gas water heater install"])],{job:"1036"});
  E("3014","c12","Bathroom remodel","Accepted","u6","10-20","10-20",[O("Option 1",["Shower valve replace"],["Toilet replace"],["Faucet replace"])],{job:"1056"});
  E("3015","c13","Water softener","Sent","u4","10-27","10-27",[O("Option 1",["Water softener install"])]);
  E("3016","c15","Repipe","Accepted","u5","10-21","10-21",[O("Option 1",["Shut-off valve replace",4])],{job:"1038"});
  E("3017","c5","Sewer line camera and repair","Sent","u5","10-22","10-22",[O("Option 1",["Main line camera inspection"])]);
  E("3018","c1","Tankless upgrade","Accepted","u4","10-28","10-28",[O("Option 1",["Tankless water heater install"])],{files:["Signed estimate #3018.pdf"]});
  E("3019","c8","Drain camera","Sent","u6","10-30","10-30",[O("Option 1",["Main line camera inspection"])]);
  E("3020","c2","Toilet replace","Lost","u6","10-15","10-15",[O("Option 1",["Toilet replace"])]);
  E("3021","c10","Shower remodel","Draft","u4","11-03","",[O("Option 1",["Shower valve replace"],["Faucet replace"])]);
  E("3022","c11","Unit 5 boiler check","Follow Up Sent","u5","10-19","10-19",[O("Option 1",["Diagnostic / service call"])]);

  const I = (id,c,job,st,date,due,items,pays,extra) => { W.inv[id] = Object.assign({id,c,job,st,date,due,items:items.map(([n,q,p]) => ({n,q:q||1,p:p!=null?p:(ITEM_PRICE[n]||0)})),pays:pays||[],notes:"",inotes:"",progress:[],qb:"ok"}, extra||{}); };
  const P = (id,method,amt,date,by,fp,note) => ({id,method,amt,date,by,fp:!!fp,note:note||"",refunds:[]});
  I("2001","c7","1001","Paid","10-02","10-02",[["Toilet replace"]],[P("p11","Check",890,"10-09","u1",false,"Check #4410")],{fromEst:"3001"});
  I("2002","c3","1002","Paid","10-05","10-05",[["50 gal gas water heater install"]],[P("p12","Credit Card",2650,"10-05","u4",true)],{fromEst:"3002"});
  I("2006","c9","1006","Paid","10-12","10-12",[["Shower valve replace"]],[P("p13","Credit Card",640,"10-12","u6",true)],{fromEst:"3006"});
  I("2036","c1","1030","Sent","11-02","11-02",[["Water heater flush",1,189],["Thermocouple replace",1,311]],[]);
  W.inv["2036"].items.push({n:"Shut-off valve replace",q:1,p:200});
  I("2037","c3","1034","Paid","11-02","11-02",[["Faucet cartridge replace"]],[P("p1","Credit Card",285,"11-02","u6",true)]);
  I("2039","c8","1020","Paid","10-30","10-30",[["Water heater flush"]],[P("p2","Credit Card",189,"10-30","u5",true),P("p3","Credit Card",189,"10-30","u5",true)]);
  I("2040","c11","1054","Invoiced","11-03","12-03",[["Toilet rebuild kit"],["Diagnostic / service call"]],[],{qb:"failed"});
  I("2041","c15","1038","Sent","09-30","10-05",[["Shut-off valve replace",4],["Diagnostic / service call"]],[]);
  I("2042","c5","1012","Invoiced","08-21","09-20",[["Outdoor spigot replace"],["Diagnostic / service call"]],[]);
  I("2043","c14","1022","Sent","10-25","10-25",[["Toilet replace"]],[]);
  I("2044","c14","1022","Invoiced","10-25","10-25",[["Toilet replace"]],[],{dupOf:"2043"});
  I("2045","c16","1028","Partially Paid","07-31","08-30",[["Drain cleaning - main line",2],["Water softener install"]],[P("p4","Check",1000,"08-15","u1",false,"Check #5521")]);
  I("2046","c2","1027","Invoice Draft","10-26","",[["Diagnostic / service call"],["Faucet cartridge replace"]],[]);
  I("2047","c13","1019","Void","10-10","10-10",[["Water softener repair"]],[]);
  I("2048","c11","1054","Invoiced","11-03","12-03",[["Toilet replace"]],[]);
  I("2050","c12","1056","Invoiced","11-02","12-02",[["Shower valve replace"],["Toilet replace"],["Faucet replace"],["Tankless water heater install"]],[]);
  I("2051","c7","1029","Paid","10-28","10-28",[["Toilet rebuild kit"]],[P("p5","Cash",245,"10-28","u5",false)]);
  I("2052","c9","1011","Paid","11-03","11-03",[["Diagnostic / service call"],["Faucet replace"]],[P("p6","Credit Card",420,"11-03","u6",true)]);
  I("2053","c13","1037","Paid","11-03","11-03",[["Main line camera inspection"]],[P("p7","Credit Card",395,"11-03","u5",true)]);
  I("2054","c10","1009","Paid","11-02","11-02",[["Diagnostic / service call"]],[P("p8","Cash",125,"11-02","u4",false)]);
  I("2055","c5","1008","Paid","11-04","11-04",[["Faucet cartridge replace"]],[P("p9","Credit Card",285,"11-04","u4",true)]);
  W.jobs["1037"].noInvoiceFix = false;

  const T = (user,date,ci,co,type,job) => { const id="t"+(W.nextTs++); W.ts.push({id,user,date,ci,co,type:type||"General",job:job||""}); };
  // ci/co are hours of the same day; co null = still clocked in
  [["u4",["11-02",7,15.5],["11-03",7,16],["11-04",7,null]],
   ["u5",["11-02",7.05,null]],
   ["u6",["11-02",7,15.5],["11-03",6.75,19.5],["11-04",7.25,null]],
   ["u7",["11-02",7,15],["11-03",7,15]],
   ["u8",["11-02",8,16.5],["11-03",8,16.75]]
  ].forEach(([u,...days]) => days.forEach(([d,ci,co]) => T(u,d,ci,co)));
  return W;
}

/* helpers on the world */
function cname(W,id){ const c=W.cust[id]; if(!c) return "-"; return c.company || `${c.first} ${c.last}`.trim(); }
function uname(W,id){ return (W.users[id]||{}).name || "-"; }
function techs(W){ return Object.keys(W.users).filter(k => W.users[k].tech && W.users[k].st==="Activated" && W.users[k].role!=="Assignment User"); }
function invTotal(i){ return i.items.reduce((a,x)=>a+x.q*x.p,0); }
function invPaid(i){ return i.pays.reduce((a,p)=>a+p.amt-(p.refunds||[]).reduce((b,r)=>b+r.amt,0),0); }
function invDue(i){ if(i.st==="Void"||i.st==="Invoice Draft") return i.st==="Invoice Draft"?invTotal(i):0; return Math.max(0, Math.round((invTotal(i)-invPaid(i))*100)/100); }
function estTotal(e){ const o=e.opts[0]; return o? o.items.reduce((a,x)=>a+x.q*x.p,0):0; }
function jobInvoices(W,jid){ return Object.values(W.inv).filter(i => i.job===jid && i.st!=="Void"); }
function jobInvStatus(W,j){ return jobInvoices(W,j.id).length ? "Invoiced" : "Not Yet Invoiced"; }
function tsHours(t){ if(t.co==null){ return null; } return Math.round((t.co-t.ci)*100)/100; }

/* ===== engine: state, events, small UI helpers ===== */
let W = pfresh();          // the practice world
let U = {};                // ui state
let EV = [];               // what the trainee did (used to check tasks)
let DAY = 1;               // current practice day
let ROOT = null;
const E = s => String(s ?? "").replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));

function resetUI(){ U = {r:{p:"dash"}, modal:null, menu:null, form:{}, pf:{}, q:"", qf:"Name", sel:null, snack:null, hint:false, tsDay:"11-02", tsMode:"Team", tsTab:"Day", tsType:"General", schedDay:TODAY, showUnassigned:false, rep:{tab:"jobs"}, jobsView:"Open", jobsFilter:{st:[],inv:"Any",asg:"Any",sch:"Any"}, showJobFilters:false, estTab:"Estimates", estFilter:{st:[],by:""}, showEstFilters:false, invTab:"Invoices", setSec:"users", setTab:"Users", jobTab:"Info", invRecTab:"Info", estRecTab:"Info"}; }
resetUI();

function log(k, d){ EV.push(Object.assign({k, t:EV.length}, d||{})); }
function did(k, f){ return EV.some(e => e.k===k && (!f || f(e))); }
function lastEv(k, f){ for(let i=EV.length-1;i>=0;i--){ const e=EV[i]; if(e.k===k && (!f||f(e))) return e; } return null; }
let SLIPS = [];
function slip(text, serious){ SLIPS.push({text, serious:!!serious, day:DAY}); log("slip",{text,serious:!!serious}); toast((serious?"Serious slip: ":"Slip: ")+text, "bad"); }
function toast(text, kind){ kind = kind||"ok"; if(U.snack && U.snack.kind==="bad" && kind!=="bad" && Date.now()-U.snack.at<400) return; U.snack = {text, kind, at:Date.now()}; }

function go(p, extra){ U.r = Object.assign({p}, extra||{}); U.menu = null; log("nav",{p, id:(extra||{}).id, tab:(extra||{}).tab}); }
function openModal(kind, data, form){ U.modal = Object.assign({kind}, data||{}); U.form = Object.assign({}, form||{}); U.menu = null; }
function closeModal(){ U.modal = null; U.form = {}; }
function fv(k, d){ const v = U.form[k]; return v===undefined ? d : v; }
function pv(k, d){ const v = U.pf[k]; return v===undefined ? d : v; }

/* collect every input with data-f before an action re-renders the screen */
function collect(){
  if(!ROOT) return;
  ROOT.querySelectorAll("[data-f]").forEach(el => {
    const k = el.dataset.f, store = k.startsWith("m.") ? U.form : U.pf;
    if(el.type==="checkbox") store[k] = el.checked;
    else if(el.type==="radio"){ if(el.checked) store[k] = el.value; }
    else if(el.tagName==="SELECT" && el.multiple) store[k] = [...el.selectedOptions].map(o=>o.value);
    else store[k] = el.value;
  });
}

/* icons */
const IP = {
 dash:"M4 13h6V4H4zM14 20h6v-9h-6zM4 20h6v-4H4zM14 4v4h6V4z", cust:"M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM4 20c1-4 4-6 8-6s7 2 8 6",
 cal:"M4 6h16v14H4zM4 10h16M8 3v4M16 3v4", work:"M4 8h16v11H4zM9 8V5h6v3", sales:"M6 3h9l4 4v14H6zM9 12h7M9 16h7",
 mgmt:"M4 6h16M4 12h16M4 18h10", search:"M11 4a7 7 0 1 0 0 14 7 7 0 0 0 0-14zM20 20l-4-4", bell:"M6 16V11a6 6 0 0 1 12 0v5l2 2H4zM10 20a2 2 0 0 0 4 0",
 down:"M6 9l6 6 6-6", chev:"M9 6l6 6-6 6", left:"M15 6l-6 6 6 6", plus:"M12 5v14M5 12h14", x:"M6 6l12 12M18 6L6 18", check:"M5 12l5 5 9-10",
 star:"M12 4l2.4 5 5.6.6-4.2 3.8 1.2 5.6-5-2.9-5 2.9 1.2-5.6L4 9.6 9.6 9z", hour:"M7 3h10M7 21h10M8 3c0 5 8 5 8 9s-8 4-8 9M16 3c0 5-8 5-8 9", filter:"M4 5h16l-6 8v6l-4-2v-4z",
 gear:"M12 9a3 3 0 1 0 0 6 3 3 0 0 0 0-6z", edit:"M4 20h4L19 9l-4-4L4 16z", card:"M3 6h18v12H3zM3 10h18", pin:"M12 21s7-6 7-12a7 7 0 0 0-14 0c0 6 7 12 7 12z",
 clock:"M12 4a8 8 0 1 0 0 16 8 8 0 0 0 0-16zM12 8v4l3 2", file:"M6 3h9l4 4v14H6z", grip:"M9 6h.1M9 12h.1M9 18h.1M15 6h.1M15 12h.1M15 18h.1",
 gear2:"M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z",
 pause:"M9 5v14M15 5v14", house:"M3 11l9-7 9 7v9H5v-9", spark:"M11 3l1.7 4.6L17 9.3l-4.3 1.7L11 15.6 9.3 11 5 9.3l4.3-1.7zM18 14l.8 2 2 .8-2 .8-.8 2-.8-2-2-.8 2-.8z", refresh:"M20 11a8 8 0 1 0-2.3 5.7M20 4v7h-7",
 note:"M5 4h14v10l-6 6H5zM13 20v-6h6", pluscirc:"M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18zM12 8v8M8 12h8", help:"M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18zM9.5 9a2.5 2.5 0 1 1 3.5 2.3c-.6.3-1 .8-1 1.5V14M12 17h.01",
 up:"M6 15l6-6 6 6", dollar:"M12 3v18M16 7.5c-.8-1.2-2.2-2-4-2-2.2 0-4 1.2-4 3s1.8 2.6 4 3 4 1.3 4 3-1.8 3-4 3c-1.8 0-3.3-.8-4.2-2", wrench:"M14.7 6.3a4 4 0 0 0-5.4 5.2L3 17.8V21h3.2l6.3-6.3a4 4 0 0 0 5.2-5.4l-2.6 2.6-2.4-.6-.6-2.4z",
 sync:"M4 12a8 8 0 0 1 13.7-5.7L20 9M20 4v5h-5M20 12a8 8 0 0 1-13.7 5.7L4 15M4 20v-5h5", ext:"M14 4h6v6M20 4l-9 9M18 14v6H4V6h6", tag:"M3 12V4h8l9 9-8 8zM7.5 7.5h.01",
 mail:"M3 6h18v12H3zM3 6l9 7 9-7", xcirc:"M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18zM9 9l6 6M15 9l-6 6", dcirc:"M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18zM12 7v10M14.5 9c-.5-.7-1.4-1.2-2.5-1.2-1.4 0-2.5.8-2.5 1.8s1.1 1.6 2.5 1.8 2.5.9 2.5 1.9-1.1 1.8-2.5 1.8c-1.1 0-2.1-.5-2.6-1.3",
 bill:"M4 6h16v12H4zM7 10h6M7 14h4M16 13l1.5 1.5L20 12", loader:"M12 3v3M12 18v3M3 12h3M18 12h3M5.6 5.6l2.1 2.1M16.3 16.3l2.1 2.1M5.6 18.4l2.1-2.1M16.3 7.7l2.1-2.1",
 send:"M3 11l18-8-8 18-2-8z", list:"M8 6h13M8 12h13M8 18h13M3.5 6h.01M3.5 12h.01M3.5 18h.01", map:"M9 4L3 6v14l6-2 6 2 6-2V4l-6 2zM9 4v14M15 6v14",
 sort:"M8 9l4-4 4 4M8 15l4 4 4-4", check2:"M4 12l5 5 11-11", hourglass:"M7 3h10M7 21h10M8 3c0 5 8 5 8 9s-8 4-8 9M16 3c0 5-8 5-8 9", truck:"M3 7h11v9H3zM14 10h4l3 3v3h-7M7 18.5a1.5 1.5 0 1 0 0-.01M17 18.5a1.5 1.5 0 1 0 0-.01",
 play:"M7 5l12 7-12 7z", ban:"M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18zM5.6 5.6l12.8 12.8",
 phone:"M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2z", phonex:"M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2zM15 3l6 6M21 3l-6 6",
 vm:"M6.5 9a3.5 3.5 0 1 0 0 7 3.5 3.5 0 0 0 0-7zM17.5 9a3.5 3.5 0 1 0 0 7 3.5 3.5 0 0 0 0-7zM6.5 16h11", idcard:"M4 5h16v14H4zM8 10a2 2 0 1 0 4 0 2 2 0 0 0-4 0M7 16c.5-1.5 1.7-2.5 3-2.5s2.5 1 3 2.5M15 10h3M15 13h3",
 arrowr:"M4 12h15M13 6l6 6-6 6", useradd:"M10 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM3 21c.8-4 3.5-6 7-6 1.3 0 2.5.3 3.5.8M18 14v6M15 17h6", chat:"M4 5h16v11H9l-5 4z",
 usercirc:"M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18zM12 7a3 3 0 1 0 0 6 3 3 0 0 0 0-6zM6.5 18c1.2-2 3.2-3 5.5-3s4.3 1 5.5 3", dots:"M12 5h.01M12 12h.01M12 19h.01",
 clip:"M20 11l-8 8a5 5 0 0 1-7-7l8-8a3.5 3.5 0 0 1 5 5l-8 8a2 2 0 0 1-3-3l7-7", trash:"M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13", hash:"M5 9h14M5 15h14M10 4L8 20M16 4l-2 16",
 info:"M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18zM12 11v6M12 7.5h.01", swap:"M4 8h14l-3-3M20 16H6l3 3", user:"M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM4 21c1-4 4-6 8-6s7 2 8 6", building:"M5 21V4h10v17M15 9h4v12M8 7h1M11 7h1M8 10h1M11 10h1M8 13h1M11 13h1M8 16h1M11 16h1M3 21h18",
 spark2:"M4 5h16v11H9l-5 4zM9 10h6", flag:"M5 21V4h11l-2 4 2 4H5", lock:"M6 11h12v9H6zM8 11V8a4 4 0 0 1 8 0v3"
};
const ic = (k,s=16) => `<svg width="${s}" height="${s}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="${IP[k]||""}"/></svg>`;

/* small builders */
function sel(f, opts, cur, attrs){ return `<select data-f="${f}" ${attrs||""}>${opts.map(o => { const [v,l] = Array.isArray(o)?o:[o,o]; return `<option value="${E(v)}" ${String(v)===String(cur)?"selected":""}>${E(l)}</option>`; }).join("")}</select>`; }
function inp(f, cur, attrs){ return `<input data-f="${f}" value="${E(cur??"")}" ${attrs||""}>`; }
function chk(f, cur, label, attrs){ return `<label class="fp-chk"><input type="checkbox" data-f="${f}" ${cur?"checked":""} ${attrs||""}> <span>${label}</span></label>`; }
function fld(label, control, req){ return `<div class="fp-fld"><label>${E(label)}${req?' <b class="req">*</b>':""}</label>${control}</div>`; }
function btn(a, label, cls, ds, hk){ return `<button class="fp-btn ${cls||""}" data-a="${a}" ${ds||""} ${hk?`data-hk="${hk}"`:""}>${label}</button>`; }
const hrOpts = () => [["",""]].concat(HOURS.map(h => [String(h), fmtH(h)]));
const whrOpts = () => [["",""]].concat(WHOURS.map(h => [String(h), fmtH(h)]));
/* arrival window follows the start time until someone changes it by hand */
function winAuto(){ if(U.form["m.wlock"]) return; const s = U.form["m.s"]; if(s==null || s==="") return; const p = U.form["m.wprev"], ws = U.form["m.ws"], we = U.form["m.we"];
  const untouched = ws==null || ws==="" || (p!=null && p!=="" && +ws===+p-WIN_BEFORE && +we===+p+WIN_AFTER);
  if(untouched){ U.form["m.ws"] = String(+s-WIN_BEFORE); U.form["m.we"] = String(+s+WIN_AFTER); } U.form["m.wprev"] = String(s); }
function ddiff(a, b){ const [am,ad] = a.split("-").map(Number), [bm,bd] = b.split("-").map(Number); return Math.round((Date.UTC(2026,am-1,ad)-Date.UTC(2026,bm-1,bd))/864e5); }
function winLabel(ws, we){ return ws==null || ws==="" || we==null || we==="" ? "" : fmtH(+ws)+" - "+fmtH(+we); }
const dayOpts = () => [["","No date"]].concat(PDAYS.map(d => [d.k, d.lab]));
const ST_COL = {"Invoice Draft":"amber","Invoiced":"sky","Sent":"sky","Partially Paid":"lime","Paid":"green","Void":"red","Draft":"teal","Follow Up Sent":"yellow","Accepted":"green","Lost":"red2","Rejected":"red","Completed":"black","New":"jgreen","On The Way":"jpurple","In Progress":"jamber","Canceled":"jred","Payment Received":"jteal","Admin":"jroyal","Pending":"jgold"};
const ST_IC = {"Invoice Draft":"file","Invoiced":"loader","Sent":"mail","Partially Paid":"bill","Paid":"dcirc","Void":"xcirc","Draft":"file","Follow Up Sent":"mail","Accepted":"check2","Lost":"ban","Rejected":"xcirc","Completed":"check2","New":"house","On The Way":"truck","In Progress":"play","Canceled":"xcirc","Payment Received":"dcirc","Admin":"spark","Pending":"pause"};
function stPill(s, kind){ return `<span class="fp-sp ${kind||"out"} c-${ST_COL[s]||"grey"}">${kind==="fill"?"":ic(ST_IC[s]||"file",13)}${E(s)}${kind==="fill"?`<span class="ar">${ic("sort",12)}</span>`:""}</span>`; }
function chips(list, cur, act, ds){ const ci = list.indexOf(cur); return `<div class="fp-chips" role="group" aria-label="Status">${list.map((s,i) => `<button class="fp-chip ${s===cur?"on c-"+(ST_COL[s]||"grey"):i<ci?"past":"next"}" data-a="${act}" data-v="${E(s)}" ${ds||""} data-hk="chip-${E(s)}">${ic(ST_IC[s]||"file",14)}${E(s)}</button>`).join("")}</div>`; }
function topTabs(items, sub){ return `<div class="fp-ltabs top${sub?" sub":""}" role="tablist">${items.map(t => typeof t==="string" ? `<button data-a="na-tab" data-v="${E(t)}">${E(t)}</button>` : `<button class="${t.on?"on":""} ${t.cls||""}" data-a="${t.a||"na-tab"}" data-v="${E(t.v??t.l)}" ${t.hk?`data-hk="${t.hk}"`:""} ${t.ds||""}>${t.i?ic(t.i,16):""}${E(t.l)}</button>`).join("")}${sub?"":`<span class="sp"></span>`}</div>`; }
function createBtn(a, label, ds, hk){ return `<button class="fp-btn green cr" data-a="${a}" ${ds||""} ${hk?`data-hk="${hk}"`:""}><span class="pc">${ic("plus",13)}</span>${label}</button>`; }
function toolSearch(f, q, ph, extra){ return `<div class="fp-search big">${ic("search",17)}<input data-in="${f}" data-f="p.${f}" value="${E(q||"")}" placeholder="${E(ph)}" aria-label="${E(ph)}" ${extra||""}></div>`; }
function menuBtn(id, label, cls, hk){ return `<div class="fp-mwrap"><button class="fp-btn ${cls||"green"}" data-a="menu" data-v="${id}" data-hk="${hk||id}">${label} ${ic("down",14)}</button>${U.menu===id?renderMenu(id):""}</div>`; }
function tagBox(f, tags, list, allowAdd){
  const q = (U.form[f+".q"]||"").trim();
  const opts = list.filter(t => !tags.includes(t) && t.toLowerCase().includes(q.toLowerCase()));
  const exact = list.some(t => t.toLowerCase()===q.toLowerCase());
  return `<div class="fp-tags" data-hk="${f}">${tags.map(t => `<span class="fp-tag">${E(t)} <button data-a="tag-rm" data-f2="${f}" data-v="${E(t)}" aria-label="Remove ${E(t)}">×</button></span>`).join("")}
    <input class="fp-tagin" data-in="tagq" data-f="${f}.q" value="${E(U.form[f+".q"]||"")}" placeholder="Add Tags">
    ${U.form[f+".open"] ? `<div class="fp-dd">${opts.slice(0,8).map(t => `<button data-a="tag-add" data-f2="${f}" data-v="${E(t)}" data-hk="tag-${E(t)}">${E(t)}</button>`).join("")}${q && !exact && allowAdd ? `<button class="new" data-a="tag-new" data-f2="${f}" data-v="${E(q)}">Create new tag "${E(q)}"</button>`:""}${!opts.length && !q ? `<span class="muted">No more tags</span>`:""}</div>`:""}
  </div>`;
}

/* ===== screens of the practice copy ===== */
const NAV = [
  {p:"dash", l:"Pulse Dashboard", i:"logo"},
  {p:"customers", l:"Customers", i:"cust", t:"pu"},
  {p:"schedule", l:"Schedule", i:"cal", t:"bl"},
  {g:"Work", i:"work", t:"or", kids:[["na","Projects"],["jobs","Jobs"],["na","Subtasks"],["na","Agreements"]]},
  {g:"Sales", i:"sales", t:"gr", kids:[["estimates","Estimates"],["invoices","Invoices"],["na","Material Lists"],["pos","Purchase Orders"],["na","Pricebooks"],["na","Variant Proposals"],["na","Dynamic Proposals"],["fppay","FP Payments"]]},
  {g:"Management", i:"mgmt", t:"rd", kids:[["team","Team Members"],["na","Internal Activity"],["comms","Communications"],["ts","Timesheets"],["na","Forms"],["na","Assets"],["na","HighLevel"],["rep","Reporting"],["booking","Booking Requests"]]},
  {p:"settings", l:"Company Settings", i:"gear2", t:"gy"}
];
const FPLOGO = `<svg width="22" height="22" viewBox="0 0 24 24" aria-hidden="true"><path fill="#00034d" d="M5 3h14l-3 4H5zM5 10h11l-3 4H5zM8 17h11l-3 4H5z"/></svg>`;
const TITLES = {dash:"Pulse Dashboard",customers:"Customers",customer:"Customer Record",jobs:"Jobs",job:"Job Record",schedule:"Team Schedule",estimates:"Estimates",estimate:"Estimate Record",invoices:"Invoices",invoice:"Invoice Record",preview:"Preview",fppay:"FP Payments",pos:"Purchase Orders",team:"Team Members",user:"User Record",ts:"Team Timesheets",tsm:"Timesheets",rep:"Reporting",booking:"Booking Requests",comms:"Communications",settings:"Administration",na:"Not in this practice"};

function renderSide(){
  const cur = U.r.p;
  const map = {customer:"customers",job:"jobs",estimate:"estimates",invoice:"invoices",preview:U.r.kind==="inv"?"invoices":"estimates",user:"team",tsm:"ts"};
  const on = map[cur] || cur;
  const ico = n => n.i==="logo" ? `<i class="fp-ico logo">${FPLOGO}</i>` : `<i class="fp-ico t-${n.t}">${ic(n.i,15)}</i>`;
  let h = `<div class="fp-me"><span class="fp-av">YO</span><b>You</b></div><nav class="fp-nav" aria-label="Practice app menu">`;
  NAV.forEach(n => {
    if(n.p){ h += `<button class="fp-ni top ${n.p==="dash"?"dash":""} ${on===n.p?"on":""}" data-a="go" data-v="${n.p}" data-hk="nav-${n.p}">${ico(n)}<span>${n.l}</span></button>`; }
    else {
      h += `<div class="fp-ng"><span class="fp-ni grp">${ico(n)}<span>${n.g}</span><span class="chev">${ic("up",14)}</span></span>`;
      n.kids.forEach(([p,l]) => { h += `<button class="fp-ni sub ${on===p && (p!=="na"||U.r.label===l)?"on":""}" data-a="go" data-v="${p}" data-label="${l}" data-hk="nav-${p==="na"?l:p}">${l}</button>`; });
      h += `</div>`;
    }
  });
  return h + `</nav>`;
}

function renderTop(){
  const back = ["customer","job","estimate","invoice","user","tsm","preview"].includes(U.r.p);
  const gear = ["customers","jobs","estimates","invoices","customer","job","estimate","invoice","team"].includes(U.r.p);
  const t = U.r.p==="dash" ? `<span class="fp-dlogo">${FPLOGO.replace('#00034d','#fff')}</span><b class="fp-title up">PULSE DASHBOARD</b>` : `<b class="fp-title">${E(TITLES[U.r.p]||"")}</b>${gear?`<span class="fp-tg">${ic("gear2",19)}</span>`:""}`;
  return `${back?`<button class="fp-back" data-a="back" aria-label="Back">${ic("left",20)}</button>`:""}${t}
   <span class="fp-prac" title="Practice date: Wed, Nov 4, 2:15 PM">PRACTICE COPY</span>
   <span class="fp-co" aria-hidden="true">${E(COMPANY)}${ic("down",16)}</span><span class="fp-ticons"><i class="sep"></i><span aria-hidden="true" class="ti">${["search","spark","bell"].map(k=>ic(k,19)).join("")}</span><button class="fp-phone" data-a="eng-open" data-hk="eng-open" aria-label="Open Engage" title="Engage">${ic("phone",19)}</button><span aria-hidden="true" class="ti">${["refresh","note","pluscirc","help"].map(k=>ic(k,19)).join("")}</span><i class="sep"></i><span class="fp-av sm">YO</span><span class="nm">You</span>${ic("down",16)}</span>`;
}

/* ---------- dashboard ---------- */
function scrDash(){
  const all = Object.values(W.jobs).filter(j => !j.archived), today = all.filter(j => j.date===TODAY);
  const done = today.filter(j => CLOSED_ST.includes(j.st) && j.st!=="Canceled").length, tot = today.length || 1;
  const pct = Math.min(1, done/tot), ang = Math.PI*(1.25 - 1.5*pct), R = 80, cx = 100, cy = 100;
  const arc = `M ${cx+R*Math.cos(Math.PI*1.25)} ${cy-R*Math.sin(Math.PI*1.25)} A ${R} ${R} 0 ${pct>2/3?1:0} 1 ${cx+R*Math.cos(ang)} ${cy-R*Math.sin(ang)}`;
  const stat = (n,l) => `<div><b>${n}</b> ${l}</div>`;
  const nJobs = all.filter(j=>j.created===TODAY).length, nEst = Object.values(W.est).filter(e=>e.created===TODAY).length, nInv = Object.values(W.inv).filter(i=>i.date===TODAY).length;
  const nPay = allPays().filter(p=>p.date===TODAY).length, nCust = Object.values(W.cust).filter(c=>c.created===TODAY).length;
  const days = PDAYS.slice(0,5), sales = days.map(d => Object.values(W.inv).filter(i=>i.date===d.k).reduce((a,i)=>a+i.items.reduce((x,y)=>x+y.q*y.p,0),0) + Object.values(W.est).filter(e=>e.created===d.k).reduce((a,e)=>a+estTotal(e),0));
  const mx = Math.max(1, ...sales);
  const card = (t, body, cls) => `<section class="fp-dcard ${cls||""}"><div class="dh">${E(t)}</div><div class="db">${body}</div></section>`;
  const jt = (today.length ? today : all.filter(j=>j.date && !CLOSED_ST.includes(j.st)).slice(0,6)).slice(0,7).map(j => `<button class="fp-djr" data-a="open-job" data-v="${j.id}"><span class="t">${E(dlab(j.date))}, ${fmtH(j.s)}<small>→${fmtH(j.e)}</small></span><span class="fp-dsi c-${ST_COL[j.st]||"grey"}">${ic(ST_IC[j.st]||"cal",13)}</span><span class="ti">${E(j.title)}</span>${avs(j.users)}<span class="cu">${E(cname(W,j.c))}<small>${E((W.cust[j.c]||{}).addr||"")}</small></span></button>`).join("");
  const techs = Object.entries(W.users).filter(([k,u])=>u.tech).slice(0,5).map(([k,u]) => `<div class="fp-dts"><span class="fp-av sm" style="background:${u.color}">${E(u.name.split(" ").map(x=>x[0]).join("").slice(0,2))}</span><span class="n">${E(u.name)}</span><i></i><span class="v">${money(0)}</span></div>`).join("");
  const custs = Object.entries(W.cust).slice(-8).reverse().map(([id,c]) => `<button class="fp-dlr" data-a="open-cust" data-v="${id}"><span>${E(cname(W,id))}</span><span class="lk">${E(c.email||"-")}</span><span>${E(c.st||"")}</span></button>`).join("");
  const ests = Object.values(W.est).slice(-6).reverse().map(e => `<button class="fp-dlr e" data-a="open-est" data-v="${e.id}"><span>${E(e.id)}</span>${stPill(e.st)}<span>${E(e.title)}</span><span>${E(cname(W,e.c))}</span><span>${E(dlab(e.created))}</span><span>${money(estTotal(e))}</span></button>`).join("");
  const custom = W.dash.filter(w=>w.type==="Custom").map(w => { const r = W.reports.find(x=>x.name===w.w); return card(w.w+" (custom)", r ? `<p class="fp-dcv"><small>${E(r.tab)} report</small><b>${repRows(r.tab,{filters:r.filters,range:"This Year"}).length} rows</b></p>` : `<p class="muted">Pick a widget</p>`, "sm"); }).join("");
  return `<div class="fp-dtop"><div class="fp-qc">${[["cust","Create Customer","t-or","cust-new"],["work","Create Job","t-bl","job-new"],["file","Create Estimate","t-pu","est-new"],["sales","Create Invoice","t-gr","na-tab"]].map(([i,l,t,a])=>`<button data-a="${a}"><i class="fp-ico ${t}">${ic(i,14)}</i>${l}</button>`).join("")}</div>
   <div class="fp-qc r"><button data-a="dash-config" data-hk="dash-config"><i class="fp-ico t-or">${ic("spark",14)}</i>Configure Dashboard</button><span class="fp-dh">${ic("house",17)} Default Homepage: <b>Dashboard</b> ${ic("down",15)}</span></div></div>
  <div class="fp-dgrid">
   ${card("Overview - Today", `<div class="fp-ovw"><svg viewBox="0 0 200 175" class="g" role="img" aria-label="${done} of ${today.length} jobs completed today"><path d="M ${cx+R*Math.cos(Math.PI*1.25)} ${cy-R*Math.sin(Math.PI*1.25)} A ${R} ${R} 0 1 1 ${cx+R*Math.cos(-Math.PI*0.25)} ${cy-R*Math.sin(-Math.PI*0.25)}" fill="none" stroke="#e6e6e6" stroke-width="14" stroke-linecap="round"/>${done?`<path d="${arc}" fill="none" stroke="#64b5e3" stroke-width="14" stroke-linecap="round"/>`:""}<text x="100" y="104" text-anchor="middle" class="gn">${done}/${today.length}</text><text x="100" y="126" text-anchor="middle" class="gl">Jobs Completed Today</text></svg><div class="st"><div class="td">${ic("left",16)} Today</div>${stat(nJobs,"New Jobs Created")}${stat(nEst,"New Estimate Created")}${stat(nInv,"New Invoice Created")}${stat(nPay,"New Payments Collected")}${stat(nCust,"New Customers Created")}</div></div>`)}
   ${card("Invoice & Estimate Sales - Default", `<div class="fp-bars">${sales.map((v,i)=>`<div class="b"><span class="v">${v?money(v):""}</span><i style="height:${Math.round(100*v/mx)}%"></i><small>${E(days[i].sh)}</small></div>`).join("")}</div>`)}
   ${card("Jobs - Today", `<div class="fp-djl">${jt || '<p class="muted">No jobs today.</p>'}</div>`)}
   ${card("Team Member Sales - This Week", techs)}
   ${card("Customers - Recent 20", `<div class="fp-dl">${custs}</div>`)}
   ${card("Estimate - Recent 10", `<div class="fp-dl">${ests}</div>`)}
   ${custom}
  </div>`;
}

/* ---------- customers ---------- */
function custMatch(c, q, f){
  if(!q) return true; q = q.toLowerCase();
  const v = {Name:`${c.first} ${c.last} ${c.company||""}`, Address:c.addr, City:c.city, State:"WI", "Zip Code":c.zip, Phone:c.phone, "Phone 2":""}[f] || "";
  return v.toLowerCase().replace(/[^a-z0-9 ]/g,"").includes(q.replace(/[^a-z0-9 ]/g,"")) || (f==="Phone" && v.replace(/\D/g,"").includes(q.replace(/\D/g,"")) && q.replace(/\D/g,"").length>2);
}
function custRows(){
  const rows = Object.keys(W.cust).filter(id => custMatch(W.cust[id], U.q.trim(), U.qf)).sort((a,b) => cname(W,a).localeCompare(cname(W,b)));
  if(!rows.length) return `<tr><td colspan="7" class="muted">No customers match.</td></tr>`;
  return rows.map(id => { const c = W.cust[id]; return `<tr class="cl" data-a="open-cust" data-v="${id}" data-hk="cust-${id}"><td>${E(cname(W,id))}</td><td>-</td><td class="lk">${E(c.email||"")}</td><td class="lk">${E(c.phone)}</td><td>${E(c.addr)}, ${E(c.city)}</td><td>${E(c.ls||"-")}</td><td class="ok">Yes</td></tr>`; }).join("");
}
function scrCustomers(){
  return topTabs(["Recent",{l:"All",on:true,a:"noop"},"By Status","By Pipeline Status","By Tags","Leads","Import Customers","Export"]) + `
  <div class="fp-tool">${toolSearch("custq",U.q,"Search for customers",'data-hk="cust-search"')}
  <select class="fp-tsel" data-ch="custqf" data-f="p.qf" aria-label="Search field" data-hk="cust-search-field">${["Name","Address","City","State","Zip Code","Phone","Phone 2"].map(o=>`<option ${o===U.qf?"selected":""}>${o}</option>`).join("")}</select>
  <button class="fp-btn wt" data-a="noop">${ic("filter",17)} Show Filters</button><button class="fp-btn wt" data-a="noop">${ic("plus",17)} Expand Fields</button><button class="fp-btn wt sq" data-a="noop" aria-label="Bulk edit">${ic("edit",16)}</button>
  <span class="sp"></span>${createBtn("cust-new","Create Customer","","btn-create-customer")}</div>
  <div class="fp-tw"><table class="fp-t lv"><thead><tr><th>Contact</th><th>Assigned To</th><th>Email</th><th>Phone</th><th>Address</th><th>Lead Source</th><th>Synced</th></tr></thead><tbody id="cust-rows">${custRows()}</tbody></table></div>`;
}
function qbBox(rec, a, hk){
  return `<div class="fp-qbx"><span class="qbl"><b>qb</b><span>INTUIT<br><i>quickbooks</i></span></span><div class="qbb">${rec.qb==="failed"?btn(a,`${ic("sync",15)} Re-Sync`,"wt2",`data-v="${rec.id}"`,hk):btn("qb-ok",`${ic("sync",15)} Re-Sync`,"wt2")}${btn("qb-ok",`${ic("ext",15)} Open`,"wt2")}</div>${rec.qb==="failed"?`<span class="fp-qbw">Not synced to QuickBooks</span>`:""}</div>`;
}
function shortName(u){ const x = W.users[u]; if(!x) return "-"; const p = x.name.split(" "); return p.length>1 ? `${p[0]} ${p[1][0]}.` : x.name; }
function kv(rows){ return `<dl class="fp-kv lv">${rows.filter(Boolean).map(([k,v,hk])=>`<dt>${E(k)}:</dt><dd ${hk?`data-hk="${hk}"`:""}>${v}</dd>`).join("")}</dl>`; }
function scrCustomer(){
  const id = U.r.id, c = W.cust[id];
  if(!c) return `<p>This customer was merged or removed. ${btn("go","Back to Customers","","data-v=\"customers\"")}</p>`;
  const jobs = Object.values(W.jobs).filter(j => j.c===id && !j.archived);
  const invs = Object.values(W.inv).filter(i => i.c===id);
  const ests = Object.values(W.est).filter(e => e.c===id);
  const due = invs.reduce((a,i)=>a+invDue(i),0), paid = invs.reduce((a,i)=>a+invPaid(i),0);
  return topTabs([{l:"Info",on:true,a:"noop"},"Related Customers","Comments","Projects","Jobs","Material Lists","Estimates","Invoices","Recurring Billing","Files","Forms"]) + `<div class="fp-rec">
  <div class="fp-rcard"><div class="fp-rtop"><div class="fp-rtl"><div><h1>${E(cname(W,id))}</h1><small>${E(c.st)}</small></div>${qbBox(Object.assign({id},c),"qb-sync-cust","btn-qb-sync-cust")}</div>
   <div class="r"><div class="fp-rbtns">${btn("job-new",`${ic("wrench",15)} Create Job`,"wt",`data-c="${id}"`,"btn-cust-createjob")}${btn("est-new-cust",`${ic("file",15)} Create Estimate`,"wt",`data-c="${id}"`)}${menuBtn("custact",`${ic("wrench",15)} Actions`,"green","btn-cust-actions")}${btn("cust-edit",`${ic("edit",15)} Edit`,"blue",`data-v="${id}"`,"btn-cust-edit")}</div>
   <div class="fp-amts"><span>Amount Due<b>${money(due)}</b></span><span>Amount Paid<b>${money(paid)}</b></span></div></div></div>
   <h3 class="fp-sh">Info</h3><div class="fp-two plain">${kv([["Display Name",`<b>${E(cname(W,id))}</b>`],["Account Type",`<b>${E(c.type)}</b>`],["Phone",`<b>${E(c.phone)}</b>`],["Email",`<b>${E(c.email||"-")}</b>`],["Address",`<b>${E(c.addr)}<br>${E(c.city)}, WI ${E(c.zip)}</b>`]])}
   ${kv([["Tax Exempt",`<b>${c.tax?"Yes":"No"}</b>`],["Saved Payment Methods",(c.cards.length?c.cards.map(k=>`<b>${E(k.brand)} ending ${E(k.last4)}</b>`).join("<br>"):"")+`<br>${btn("card-new","+ Add New Payment Method","link",`data-v="${id}"`,"btn-addcard")}`]])}</div></div>
  <div class="fp-rcard"><h3 class="fp-sh">Workflow</h3><div class="fp-two plain">${kv([["Assigned To","<b>-</b>"],["Pipeline Status","<b>-</b>"],["Tags",c.tags.length?c.tags.map(t=>`<span class="fp-tag">${E(t)}</span>`).join(" "):`<span class="fp-addtag">${ic("tag",13)} Add Tag</span>`]])}
   ${kv([["Lead Source",c.ls?`<b>${E(c.ls)}</b>`:'<span class="warn">Not set</span>',"cust-ls"]])}</div></div>
  <div class="fp-rcard"><h3 class="fp-sh">Additional Contacts <span><span class="fp-imp">${ic("ext",15)} Import Contacts</span>${btn("contact-new",`${ic("plus",15)} Add Contact`,"gout",`data-v="${id}"`,"btn-addcontact")}</span></h3>
     ${c.contacts.length?`<table class="fp-t sm"><thead><tr><th>Name</th><th>Phone</th><th>Email</th></tr></thead><tbody>${c.contacts.map(k=>`<tr><td>${E(k.name)}</td><td>${E(k.phone||"-")}</td><td>${E(k.email||"-")}</td></tr>`).join("")}</tbody></table>`:`<p class="fp-none">No Contacts Found</p>`}</div>
  <div class="fp-rcard"><h3 class="fp-sh">Locations <span><span class="fp-imp">${ic("ext",15)} Import Locations</span>${btn("loc-new",`${ic("plus",15)} Add Location`,"gout",`data-v="${id}"`,"btn-addloc")}</span></h3>
     <table class="fp-t sm"><thead><tr><th>Location Name</th><th>Address</th><th>Contact</th><th></th></tr></thead><tbody>${(c.locs.length?c.locs:[{name:"Main Location",addr:`${c.addr}, ${c.city}`,star:true}]).map((l,i)=>`<tr><td>${E(l.name)}</td><td>${E(l.addr)}</td><td>${E(l.rel||"")}</td><td class="r"><button class="fp-star ${l.star?"on":""}" data-a="loc-star" data-v="${id}" data-i="${i}" aria-label="Make main location">${ic("star",16)}</button></td></tr>`).join("")}</tbody></table></div>
  <div class="fp-rcard"><h3 class="fp-sh">Customer History</h3><div class="fp-two plain">${kv([["Notes",'<span class="muted">Add Notes</span>']])}${kv([["Job Notes",c.jobNotes?`<b>${E(c.jobNotes)}</b>`:'<span class="muted">Add Job Notes</span>',"cust-jobnotes"]])}</div></div>
  <div class="fp-rcard"><h3 class="fp-sh">Jobs (${jobs.length})</h3>${jobs.length?`<table class="fp-t sm"><tbody>${jobs.map(j=>`<tr class="cl" data-a="open-job" data-v="${j.id}"><td class="lk">#${j.id}</td><td>${E(j.title)}</td><td>${stPill(j.st)}</td><td>${j.date?dlab(j.date):"Unscheduled"}</td></tr>`).join("")}</tbody></table>`:'<p class="muted">No jobs.</p>'}</div>
  <div class="fp-two"><div class="fp-rcard"><h3 class="fp-sh">Invoices (${invs.length})</h3>${invs.map(i=>`<p><button class="lnk" data-a="open-inv" data-v="${i.id}">#${i.id}</button> ${stPill(i.st)} ${money(invTotal(i))}</p>`).join("")||'<p class="muted">None.</p>'}</div>
  <div class="fp-rcard"><h3 class="fp-sh">Estimates (${ests.length})</h3>${ests.map(e=>`<p><button class="lnk" data-a="open-est" data-v="${e.id}">#${e.id}</button> ${stPill(e.st)} ${E(e.title)}</p>`).join("")||'<p class="muted">None.</p>'}</div></div>
  </div>`;
}

/* ---------- jobs ---------- */
function jobList(view){
  let L = Object.values(W.jobs).filter(j => !j.archived);
  const v = W.views.find(x => x.name===view);
  const f = v ? v.f : null;
  if(view==="Open") L = L.filter(j => !CLOSED_ST.includes(j.st));
  if(view==="Closed") L = L.filter(j => CLOSED_ST.includes(j.st));
  if(view==="Unassigned") L = L.filter(j => !j.users.length && j.st!=="Canceled");
  if(view==="Unscheduled") L = L.filter(j => !j.date && j.st!=="Canceled");
  if(view==="Unassigned & Unscheduled") L = L.filter(j => !j.users.length && !j.date && j.st!=="Canceled");
  const ff = f || ((U.showJobFilters || U.jfApplied) ? U.jobsFilter : null);
  if(ff){
    if(ff.st && ff.st.length) L = L.filter(j => ff.st.includes(j.st));
    if(ff.inv && ff.inv!=="Any") L = L.filter(j => jobInvStatus(W,j)===ff.inv);
    if(ff.t){ const t = ff.t.toLowerCase(); L = L.filter(j => j.title.toLowerCase().includes(t)); }
    if(ff.u && ff.u!=="Any") L = L.filter(j => j.users.includes(ff.u));
    if(ff.sd && ff.sd!=="Any"){ const n = ff.sd==="Last 15 Days" ? 15 : 30; L = L.filter(j => { if(!j.date) return false; const d = ddiff(TODAY, j.date); return d>=0 && d<n; }); }
  }
  const q = (pv("p.jobq","")||"").trim().toLowerCase(); if(q) L = L.filter(j => (`#${j.id} ${j.title} ${cname(W,j.c)}`).toLowerCase().includes(q));
  return L.sort((a,b) => b.id.localeCompare(a.id));
}
function avs(users){ return `<span class="fp-avs">${users.map(u=>{ const x=W.users[u]||{name:"?",color:"#999"}; return `<span class="fp-av xs" style="background:${x.color}" title="${E(x.name)}">${E(x.name.split(" ").map(s=>s[0]).join("").slice(0,2))}</span>`; }).join("")||'<span class="muted">-</span>'}</span>`; }
function scrJobs(){
  const views = ["Open","All","Closed","Unassigned","Unscheduled","Unassigned & Unscheduled"].concat(W.views.map(v=>v.name));
  const L = U.jobsView==="Templates" ? [] : jobList(U.jobsView);
  const f = U.jobsFilter;
  let h = topTabs([{l:"Jobs",on:U.jobsView!=="Templates",a:"jobs-view",v:"Open"},"By Status","List By Status","Recurring","Tasks","Recurring Tasks","By Tags",{l:"Templates",on:U.jobsView==="Templates",a:"jobs-view",v:"Templates",hk:"jv-Templates"}]);
  if(U.jobsView==="Templates") return h + `<div class="fp-tw"><table class="fp-t lv"><thead><tr><th>Template</th><th>Title</th><th>Tags</th><th>Length</th></tr></thead><tbody>${Object.entries(JOB_TEMPLATES).map(([n,t])=>`<tr><td><b>${E(n)}</b></td><td>${E(t.title)}</td><td>${t.tags.map(E).join(", ")}</td><td>${t.len} hours</td></tr>`).join("")}</tbody></table></div>`;
  h += topTabs(views.map(v=>({l:v,on:U.jobsView===v,a:"jobs-view",v,hk:"jv-"+v})).concat([{l:"Manage Views",a:"na-tab",cls:"mv"}]), true);
  h += `<div class="fp-tool">${toolSearch("jobq",pv("p.jobq",""),"Search for job")}<button class="fp-btn wt ${U.showJobFilters?"on":""}" data-a="jobs-filters" data-hk="btn-job-filters">${ic("filter",17)} Filters${(()=>{ const n = (U.showJobFilters||U.jfApplied) ? f.st.length+(f.inv!=="Any")+((f.sd||"Any")!=="Any")+(!!f.t)+((f.u||"Any")!=="Any") : 0; return n?`<span class="bdg">${n}</span>`:""; })()}</button><button class="fp-btn wt" data-a="noop">${ic("plus",17)} Expand Fields</button><button class="fp-btn wt sq" data-a="noop" aria-label="Bulk edit">${ic("edit",16)}</button><span class="sp"></span>${createBtn("job-new","Create Job","","btn-createjob")}</div>`;
  if(U.showJobFilters){
    h += `<div class="fp-card pad fp-filt" data-hk="job-filter-panel"><h3 class="fp-sh">Apply Filters</h3><div class="fp-fgrid">
      <div><b>Status</b><div class="fp-msel">${JOB_STATUSES.map(s=>chk("p.jf.st."+s, f.st.includes(s), E(s), `data-ch="jf"`)).join("")}</div></div>
      <div>${fld("Job Title Contains", inp("p.jf.t", f.t||"", 'data-ch="jf"'))}${fld("Assigned Team Member(s)", sel("p.jf.u",[["Any","Select your options"]].concat(techs(W).map(u=>[u,uname(W,u)])),f.u||"Any",'data-ch="jf"'))}${fld("Invoice Status", sel("p.jf.inv",["Any","Not Yet Invoiced","Invoiced"],f.inv,'data-ch="jf" data-hk="jf-inv"'))}${fld("Job Start Date", sel("p.jf.sd",["Any","Last 15 Days","Last 30 Days"],f.sd||"Any",'data-ch="jf" data-hk="jf-sd"'))}</div>
    </div><div class="fp-row">${btn("jobs-applyf","Apply Filters","green")}${btn("jobs-saveview","Save Filters As New View","wt","","btn-saveview")}${btn("jobs-clearf","Clear All","wt2")}</div></div>`;
  }
  h += `<div class="fp-tw"><table class="fp-t lv"><thead><tr><th>Job</th><th>Time</th><th>Status</th><th>Job Title</th><th>Assigned To</th><th>Customer</th></tr></thead><tbody>
  ${L.map(j=>`<tr class="cl" data-a="open-job" data-v="${j.id}" data-hk="job-${j.id}"><td>#${j.id}</td><td>${j.date?`${dlab(j.date)}, ${fmtH(j.s)}<small class="sub">&rarr;${fmtH(j.e)}</small>`:"Unscheduled"}</td><td>${stPill(j.st)}</td><td>${E(j.title)}</td><td>${avs(j.users)}</td><td>${E(cname(W,j.c))}<small class="sub">${E((W.cust[j.c]||{}).addr||"")}</small></td></tr>`).join("")||`<tr><td colspan="6" class="muted">No jobs in this view.</td></tr>`}
  </tbody></table></div><div class="fp-foot">${L.length} jobs</div>`;
  return h;
}
function scrJob(){
  const j = W.jobs[U.r.id]; if(!j) return `<p>Job not found.</p>`;
  const c = W.cust[j.c] || {};
  const invs = jobInvoices(W,j.id), ests = Object.values(W.est).filter(e=>e.job===j.id);
  let h = topTabs([{l:"Info",on:U.jobTab==="Info",a:"job-tab",v:"Info",hk:"tab-Info"},"Comments","Job Costing",{l:"Subtasks",on:U.jobTab==="Subtasks",a:"job-tab",v:"Subtasks",hk:"tab-Subtasks"},"Material Lists","Estimates","Invoices","Files","Timesheets","Forms","Purchase Orders","Assets"]) + `<div class="fp-rec">
   <div class="fp-rcard"><div class="fp-rtop"><div class="fp-rtl"><div><h1>${E(j.title)} <span class="muted fp-small">#${j.id}</span></h1>${j.archived?'<span class="fp-sp out c-red">Archived</span>':""}</div></div>
   <div class="r"><div class="fp-rbtns">${btn("comm-open",`${ic("send",15)} Customer Communication`,"wt",`data-v="${U.r.id}" data-k="job"`,"btn-custcomm")}${menuBtn("jobact",`${ic("wrench",15)} Actions`,"green","btn-job-actions")}${btn("job-edit",`${ic("edit",15)} Edit`,"blue",`data-v="${j.id}"`,"btn-job-edit")}</div></div></div>
   <div class="fp-cbar"><button class="lnk b" data-a="open-cust" data-v="${j.c}" data-hk="job-custlink">${E(cname(W,j.c))}</button><span>${E(c.phone||"")}</span><span>${E(c.email||"")}</span></div>
   ${chips(JOB_STATUSES, j.st, "job-st", `data-id="${j.id}"`)}`;
  if(U.jobTab==="Subtasks"){
    h += `</div><div class="fp-rcard"><div class="fp-row">${btn("na-tab",`${ic("plus",14)} Create New`,"green")}${btn("sub-new",`${ic("plus",14)} Create New Series`,"blue",`data-v="${j.id}"`,"btn-newseries")}${btn("na-tab","Print List","blue")}</div>`;
    if(!j.subtasks.length) h += `<p class="fp-none">There are no subtasks for this job!</p>`;
    j.subtasks.forEach((s,si) => { h += `<h4>${E(s.series)}</h4>` + s.items.map((it,ii)=>`<div class="fp-sub">${stPill(it.done?"Completed":"New").replace("New","Open")} ${E(it.n)} ${it.req?'<span class="req">Required</span>':""}</div>`).join(""); });
    return h + `</div></div>`;
  }
  h += `<div class="fp-two plain">${kv([["Scheduled Date/Time",`<b>${j.date?`${dlab(j.date)}, ${fmtH(j.s)} - ${fmtH(j.e)}`:"Unscheduled"}</b>`],["Customer Arrival Window",`<b>${E(j.win||"Unscheduled")}</b>`],["Travel Time","<b>0 Minutes</b>"],["Location Name","<b>Main Location</b>"],["Location",`<b>${E(c.addr||"")}${c.city?", "+E(c.city):""}</b>`],["Assigned Team Members",`<b>${j.users.map(u=>E(uname(W,u))).join(", ")||"Unassigned"}</b>`],["Tags",(j.tags.map(t=>`<span class="fp-tag bl">${E(t)}</span>`).join(" ")||"")+` <span class="fp-addtag">${ic("tag",13)} Add Tag</span>`]])}<div class="fp-map" aria-hidden="true"></div></div></div>
   <div class="fp-rcard"><div class="fp-two plain">${kv([["Job Notes",`<b>${E(j.notes||"-")}</b>`]])}${kv([["Field Notes",j.fnotes?`<b>${E(j.fnotes)}</b>`:'<span class="muted">Add Field Notes</span>']])}</div></div>
   <div class="fp-rcard"><h3 class="fp-sh">Source <span>${btn("na-tab",(j.calls||[]).length?"Manage Linked Engage Calls":"+ Link Engage Call to Record","wt2")}</span></h3>${(j.calls||[]).length?j.calls.map(k=>`<p>${k.primary?ic("star",13)+" ":""}Main Line · ${E(k.date.replace(", 2026",""))}, ${E(k.time)}${k.primary&&k.ls?` · Lead Source: <b>${E(k.ls)}</b>`:""}</p>`).join(""):'<p class="fp-none">No Engage calls linked.</p>'}</div>
   <div class="fp-rcard"><div class="fp-two plain">${kv(JOB_CF.filter((x,i)=>i%2===0).map(([k,l,t])=>[l,`<b>${E((j.cf||{})[k]||(t==="bool"?"False":Array.isArray(t)?t[0]:"-"))}</b>`]))}${kv(JOB_CF.filter((x,i)=>i%2===1).map(([k,l,t])=>[l,`<b>${E((j.cf||{})[k]||(t==="bool"?"False":Array.isArray(t)?t[0]:"-"))}</b>`]))}</div></div>
   <div class="fp-rcard"><h3 class="fp-sh">Invoices and Estimates</h3>${invs.map(i=>`<p><button class="lnk" data-a="open-inv" data-v="${i.id}">Invoice #${i.id}</button> ${stPill(i.st)}</p>`).join("")}${ests.map(e=>`<p><button class="lnk" data-a="open-est" data-v="${e.id}">Estimate #${e.id}</button> ${stPill(e.st)}</p>`).join("")}${!invs.length&&!ests.length?'<p class="fp-none">None yet.</p>':""}</div>
   <div class="fp-rcard"><h3 class="fp-sh">Site Visits <span>${btn("visit-new",`${ic("plus",15)} Add Site Visit`,"gout",`data-v="${j.id}"`,"btn-addvisit")}</span></h3>${j.visits.map(v=>`<p><b>${E(v.name)}</b> ${dlab(v.date)} ${fmtH(v.s)} - ${fmtH(v.e)} · ${v.users.map(u=>E(uname(W,u))).join(", ")}</p>`).join("")||'<p class="fp-none">No extra visits.</p>'}</div></div>`;
  return h;
}

/* ---------- schedule (dispatch view) ---------- */
function scrSchedule(){
  const day = U.schedDay, rows = Object.keys(W.users).filter(k => W.users[k].tech && W.users[k].st==="Activated");
  const span = 11; // 7am..6pm
  const blocks = [];
  Object.values(W.jobs).forEach(j => { if(j.archived||j.st==="Canceled"||j.date!==day) return; j.users.forEach(u => blocks.push({u, id:j.id, s:j.s, e:j.e, t:`#${j.id} ${cname(W,j.c)}`, em:j.tags.includes("Flag: Emergency / After Hours")})); j.visits.forEach(v => { if(v.date===day) v.users.forEach(u => blocks.push({u,id:j.id,s:v.s,e:v.e,t:`#${j.id} ${v.name}`,visit:true})); }); });
  Object.values(W.jobs).forEach(j => j.visits.forEach(v => { if(v.date===day && j.date!==day) v.users.forEach(u => blocks.push({u,id:j.id,s:v.s,e:v.e,t:`#${j.id} ${v.name}`,visit:true})); }));
  const un = Object.values(W.jobs).filter(j => !j.archived && !CLOSED_ST.includes(j.st) && (!j.users.length || !j.date));
  let h = `<div class="fp-ltabs top">${[["List","list"],["Calendar","cal"],["Dispatch","list"],["Map","map"]].map(([v,i])=>`<button class="${v==="Dispatch"?"on":""}" data-a="${v==="Dispatch"?"noop":"sched-other"}">${ic(i,16)}${v}</button>`).join("")}<span class="sp"></span><span class="fp-cj">${createBtn("job-new","Create Job")}<span class="dd">${ic("down",16)}</span></span></div>
  ${topTabs([{l:"Day",on:true,a:"noop"},"Week","Month"],true)}
  <div class="fp-bar"><div class="fp-days">${PDAYS.map(d=>`<button class="${d.k===day?"on":""}" data-a="sched-day" data-v="${d.k}" data-hk="sd-${d.k}">${d.sh}</button>`).join("")}</div>
   <button class="fp-btn ghost ${U.showUnassigned?"on":""}" data-a="sched-un" title="Show Unassigned Jobs" aria-label="Show Unassigned Jobs" data-hk="btn-hourglass">${ic("hour",16)}</button>
   ${U.sel?`<span class="fp-selnote">Picked #${E(U.sel)}. Now click a tech and time, or drag it. <button class="lnk" data-a="sched-unpick">Cancel</button></span>`:""}</div>
  <div class="fp-sched ${U.showUnassigned?"withun":""}">`;
  if(U.showUnassigned) h += `<div class="fp-un" data-hk="un-panel"><b>Unassigned Jobs</b>${un.map(j=>`<button class="fp-unjob ${U.sel===j.id?"on":""}" draggable="true" data-drag="${j.id}" data-a="sched-pick" data-v="${j.id}" data-hk="un-${j.id}">#${j.id} ${E(cname(W,j.c))}<small>${E(j.title)}${j.date?` · ${dlab(j.date)}`:""}</small></button>`).join("")||'<p class="muted">None.</p>'}</div>`;
  h += `<div class="fp-board"><div class="fp-brow head"><span class="who"></span><div class="cells">${Array.from({length:span},(_,i)=>`<span>${fmtH(7+i).replace(":00","")}</span>`).join("")}</div></div>`;
  rows.forEach(u => {
    h += `<div class="fp-brow"><span class="who">${E(uname(W,u))}</span><div class="cells">${Array.from({length:span},(_,i)=>`<button class="cell" data-a="sched-drop" data-u="${u}" data-h="${7+i}" data-drop="1" aria-label="${E(uname(W,u))} ${fmtH(7+i)}" data-hk="cell-${u}-${7+i}"></button>`).join("")}
      ${blocks.filter(b=>b.u===u).map(b=>`<button class="blk ${b.visit?"v":""} ${b.em?"em":""} ${U.sel===b.id?"on":""}" style="left:${(b.s-7)/span*100}%;width:${Math.max(4,(b.e-b.s)/span*100)}%" draggable="true" data-drag="${b.id}" data-a="sched-pick" data-v="${b.id}" title="${E(b.t)}">${b.em?`<i class="tdot" title="Flag: Emergency / After Hours"></i>`:""}${E(b.t)}</button>`).join("")}</div></div>`;
  });
  return h + `</div></div><p class="muted fp-small fp-tip">Tip: drag a job onto a tech and time, or click the job and then click the spot. FieldPulse asks you to confirm.</p>`;
}

/* ---------- estimates ---------- */
function estList(){
  let L = Object.values(W.est);
  const f = U.estFilter;
  if(U.showEstFilters || U.estTab==="By Status"){ if(f.st.length) L = L.filter(e => f.st.includes(e.st)); if(f.by) L = L.filter(e => e.by===f.by); }
  const q=(pv("p.estq","")||"").trim().toLowerCase(); if(q) L = L.filter(e => (`${e.id} ${e.title} ${cname(W,e.c)}`).toLowerCase().includes(q));
  return L.sort((a,b)=>b.id.localeCompare(a.id));
}
function scrEstimates(){
  const L = estList(), f = U.estFilter;
  let h = topTabs(["Estimates","By Status","Templates"].concat(W.estViews.map(v=>v.name)).map(t=>({l:t,on:U.estTab===t,a:"est-tab",v:t,hk:"et-"+t})))
  + `<div class="fp-tool">${toolSearch("estq",pv("p.estq",""),"Search for estimate")}<span class="sp"></span><button class="fp-btn wt ${U.showEstFilters?"on":""}" data-a="est-filters" data-hk="btn-est-filters">${ic("filter",17)} ${U.showEstFilters?"Hide":"Show"} Filters</button><button class="fp-btn wt sq" data-a="noop" aria-label="Bulk edit">${ic("edit",16)}</button><span class="sp"></span>${createBtn("est-new","Create Estimate")}</div>`;
  if(U.showEstFilters || U.estTab==="By Status"){
    h += `<div class="fp-card pad fp-filt"><div class="fp-fgrid"><div><b>Status</b>${EST_STATUSES.map(s=>chk("p.ef.st."+s, f.st.includes(s), E(s), `data-ch="ef"`)).join("")}</div>
    <div>${fld("Team Member", sel("p.ef.by",[["","Any"]].concat(Object.keys(W.users).filter(u=>W.users[u].tech).map(u=>[u,uname(W,u)])),f.by,'data-ch="ef" data-hk="ef-by"'))}</div></div>
    <div class="fp-row">${btn("est-saveview","Save Filter","blue","","btn-est-saveview")}</div></div>`;
  }
  h += `<div class="fp-tw"><table class="fp-t lv"><thead><tr><th>Number ${ic("filter",11)}</th><th>Status</th><th>Title</th><th>Team Member</th><th>Customer</th><th>Project/Job</th><th>Sent Date</th><th>Expiration Date</th><th>Amount</th><th>Amount Due</th><th>Synced <span class="exp">Export</span></th></tr></thead><tbody>
  ${L.map(e=>`<tr class="cl" data-a="open-est" data-v="${e.id}" data-hk="est-${e.id}"><td>${e.id}</td><td>${stPill(e.st,"fill")}</td><td class="el">${E(e.title)}</td><td>${E(shortName(e.by))}</td><td>${E(cname(W,e.c))}</td><td>-<small class="sub">${e.job?"#"+e.job:""}</small></td><td>${e.sent?dlab(e.sent):"-"}</td><td>${e.exp?dlab(e.exp):"-"}</td><td>${money(estTotal(e))}</td><td>${money(estTotal(e))}</td><td>Yes</td></tr>`).join("")}</tbody></table></div><div class="fp-foot">${L.length} estimates</div>`;
  return h;
}
function optTable(o){ return `<table class="fp-t sm li"><thead><tr><th>Item</th><th>Unit Price</th><th>Quantity</th><th>Price</th></tr></thead><tbody>${o.items.map(x=>`<tr><td>${E(x.n)}</td><td>${money(x.p)}</td><td>${x.q}</td><td>${money(x.q*x.p)}</td></tr>`).join("")||'<tr><td colspan="4" class="muted">No items.</td></tr>'}</tbody></table><p class="fp-tot">Total ${money(o.items.reduce((a,x)=>a+x.q*x.p,0))}</p>`; }
function scrEstimate(){
  const e = W.est[U.r.id]; if(!e) return `<p>Estimate not found.</p>`;
  let h = topTabs([{l:"Info",on:U.estRecTab==="Info",a:"est-rtab",v:"Info"},"Cost Basis","Comments",{l:"Files",on:U.estRecTab==="Files",a:"est-rtab",v:"Files"},"Forms","Material Lists","Orders"]) + `<div class="fp-rec"><div class="fp-rcard">
   <div class="fp-rtop"><div class="fp-rtl"><div><h1>Estimate ${e.id}</h1><small>Created: ${dlab(e.created)}</small></div>${qbBox(e,"noop","")}</div>
   <div class="r"><div class="fp-rbtns">${btn("est-convert",`${ic("file",15)} Convert to Invoice`,"wt",`data-v="${e.id}"`,"btn-convert")}${btn("preview",`${ic("file",15)} View Estimate`,"wt",`data-k="est" data-v="${e.id}"`,"btn-viewest")}${menuBtn("estact",`${ic("wrench",15)} Actions`,"green","btn-est-actions")}${btn("est-edit",`${ic("edit",15)} Edit`,"blue",`data-v="${e.id}"`)}</div></div></div>
   ${chips(EST_STATUSES, e.st, "est-st", `data-id="${e.id}"`)}
   <div class="fp-two plain">${kv([["Estimate Title",`<b>${E(e.title)}</b>`],["Customer",`<button class="lnk b" data-a="open-cust" data-v="${e.c}">${E(cname(W,e.c))}</button>`],["Job",e.job?`<button class="lnk b" data-a="open-job" data-v="${e.job}">#${e.job}</button>`:"<b>-</b>"],["Author",`<b>${E(shortName(e.by))}</b>`],["Tags",`<span class="fp-addtag">${ic("tag",13)} Add Tag</span>`]])}
   ${kv([["Expiration Date",`<b>${dlab(e.exp)}</b>`],["Estimate Date",`<b>${dlab(e.created)}</b>`],e.reminder?["Reminder",`<b>${dlab(e.reminder.date)}: ${E(e.reminder.note)}</b>`]:null])}</div></div>`;
  if(U.estRecTab==="Files") return h + `<div class="fp-rcard"><h3 class="fp-sh">Files</h3>${e.files.map(f=>`<p>${ic("file")} ${E(f)}</p>`).join("")||'<p class="fp-none">No files.</p>'}</div></div>`;
  e.opts.forEach(o => { h += `<div class="fp-rcard"><h3 class="fp-sh it">${E(o.name)}</h3>${optTable(o)}</div>`; });
  if(e.addons.length) h += `<div class="fp-rcard"><h3 class="fp-sh it">Add-On Options</h3>${optTable({items:e.addons})}</div>`;
  return h + `<div class="fp-rcard"><div class="fp-two plain">${kv([["Notes (appears on estimate)",`<b>${E(e.notes||"-")}</b>`]])}${kv([["Internal Notes",`<b>${E(e.inotes||"-")}</b>`]])}</div></div></div>`;
}

/* ---------- invoices ---------- */
function scrInvoices(){
  const q=(pv("p.invq","")||"").trim().toLowerCase();
  let L = Object.values(W.inv).filter(i => !q || (`${i.id} ${cname(W,i.c)} ${i.job}`).toLowerCase().includes(q)).sort((a,b)=>b.id.localeCompare(a.id));
  return topTabs([{l:"Invoices",on:true,a:"noop"},"By Status","Payments","Item List","Inventory","Recurring Billing","Templates"]) + `
  <div class="fp-tool">${toolSearch("invq",pv("p.invq",""),"Search for invoice")}<span class="sp"></span><button class="fp-btn wt" data-a="noop">${ic("filter",17)} Show Filters</button><button class="fp-btn wt sq" data-a="noop" aria-label="Bulk edit">${ic("edit",16)}</button><span class="sp"></span>${createBtn("na-tab","Create Invoice")}</div>
  <div class="fp-tw"><table class="fp-t lv"><thead><tr><th>Number ${ic("filter",11)}</th><th>Status</th><th>Title</th><th>Team Member</th><th>Customer</th><th>Project/Job</th><th>Invoiced Date</th><th>Due Date</th><th>Amount</th><th>Amount Due</th><th>Synced <span class="exp">Export</span></th></tr></thead><tbody>
  ${L.map(i=>`<tr class="cl" data-a="open-inv" data-v="${i.id}" data-hk="inv-${i.id}"><td>${i.id}</td><td>${stPill(i.st,"fill")}</td><td class="el">${E((W.jobs[i.job]||{}).title||"")}</td><td>${E(shortName((W.jobs[i.job]||{users:[]}).users[0]))}</td><td>${E(cname(W,i.c))}</td><td>-<small class="sub">#${E(i.job)}</small></td><td>${dlab(i.date)}</td><td>${i.due?dlab(i.due):"-"}</td><td>${money(invTotal(i))}</td><td>${money(invDue(i))}</td><td>${i.qb==="failed"?'<span class="bad">No</span>':"Yes"}</td></tr>`).join("")}</tbody></table></div>`;
}
function scrInvoice(){
  const i = W.inv[U.r.id]; if(!i) return `<p>Invoice not found.</p>`;
  const tabs = topTabs([{l:"Info",on:U.invRecTab==="Info",a:"inv-tab",v:"Info",hk:"itab-Info"},"Cost Basis","Comments",{l:"Payments",on:U.invRecTab==="Payments",a:"inv-tab",v:"Payments",hk:"itab-Payments"},"Files","Forms","Material Lists","Orders"]);
  if(U.invRecTab==="Payments"){
    let h = tabs + `<div class="fp-tool">${toolSearch("payq","","Search for payments")}<span class="sp"></span><button class="fp-btn wt" data-a="noop">${ic("filter",17)} Show Filters</button><span class="sp"></span>${btn("pay-mark",`${ic("dollar",16)} Record Payment`,"green cr",`data-v="${i.id}"`,"btn-recordpay")}</div>`;
    h += `<div class="fp-tw"><table class="fp-t lv"><thead><tr><th>Number</th><th>Method</th><th>Amount</th><th>Payment Status</th><th>Notes</th><th>Payment Date</th><th></th></tr></thead><tbody>${i.pays.length?i.pays.map(p=>`<tr class="cl" data-a="pay-open" data-v="${i.id}" data-p="${p.id}" data-hk="pay-${p.id}"><td>${E(p.id.replace("p",""))}</td><td>${p.fp?"FieldPulse Payments":E(p.method)}</td><td>${money(p.amt)}</td><td>${p.refunds.length?'<span class="fp-ptx red">Refunded</span>':'<span class="fp-ptx green">Paid</span>'}</td><td>${E(p.note||"-")}</td><td>${dlab(p.date)}</td><td class="lk">Open</td></tr>${p.refunds.map(r=>`<tr class="refund"><td></td><td>Refund</td><td>-${money(r.amt)}</td><td></td><td>${E(r.reason)}</td><td>${dlab(r.date)}</td><td></td></tr>`).join("")}`).join(""):`<tr><td colspan="7" class="fp-none">No payments yet.</td></tr>`}</tbody></table></div>`;
    return h + `<p class="fp-tot">Paid ${money(invPaid(i))} · Amount due ${money(invDue(i))}</p>`;
  }
  const open = !["Paid","Void","Invoice Draft"].includes(i.st);
  let h = tabs + `<div class="fp-rec"><div class="fp-rcard"><div class="fp-rtop"><div class="fp-rtl"><div><h1>Invoice ${i.id}</h1><small>Created: ${dlab(i.date)}</small></div>${qbBox(i,"qb-sync-inv","btn-qb-sync-inv")}</div>
   <div class="r"><div class="fp-rbtns">${i.st==="Invoice Draft"?btn("inv-finalize","Finalize Invoice","green",`data-v="${i.id}"`,"btn-finalize"):""}${open?btn("pay-take",`<span class="dl">$</span> Payment`,"wt pay",`data-v="${i.id}"`,"btn-payment"):""}${btn("preview",`${ic("file",15)} Preview`,"wt",`data-k="inv" data-v="${i.id}"`,"btn-inv-preview")}${menuBtn("invact",`${ic("wrench",15)} Actions`,"green","btn-inv-actions")}${btn("inv-edit",`${ic("edit",15)} Edit`,"blue",`data-v="${i.id}"`,"btn-inv-edit")}</div></div></div>
   ${chips(INV_STATUSES, i.st, "inv-st", `data-id="${i.id}"`)}
   <div class="fp-two plain">${kv([["Invoice Title",`<b>${E((W.jobs[i.job]||{}).title||"Invoice")}</b>`],["Customer",`<button class="lnk b" data-a="open-cust" data-v="${i.c}">${E(cname(W,i.c))}</button>`],["Job",`<button class="lnk b" data-a="open-job" data-v="${i.job}">${E((W.jobs[i.job]||{}).title||"")} #${E(i.job)}</button>`],["Author",`<b>${E(shortName((W.jobs[i.job]||{users:[]}).users[0]))}</b> <span class="fp-chv">${ic("down",12)}</span>`],["Commission Recipient(s)",`<b>${E(shortName((W.jobs[i.job]||{users:[]}).users[0]))}</b> <span class="fp-gg">${ic("gear2",15)}</span>`],["Tags",`<span class="fp-addtag">${ic("tag",13)} Add Tag</span>`]])}
   ${kv([["Due Date",`<b>${i.due?dlab(i.due):"-"}</b>`],["Invoiced Date",`<b>${dlab(i.date)}</b>`],["Location",`<b>${E((W.cust[i.c]||{}).addr||"")}${(W.cust[i.c]||{}).city?", "+E(W.cust[i.c].city):""}</b>`]])}</div></div>
   <div class="fp-rcard"><div class="fp-lih"><span class="img">${ic("file",22)}</span><div><i class="t">${E((W.jobs[i.job]||{}).title||"Services")}</i><i class="d">Work done on job #${E(i.job)}</i></div></div>${optTable({items:i.items})}</div>
   <div class="fp-rcard"><div class="fp-two plain"><div>${kv([["Notes (appears on invoice)",`<b data-hk="inv-notes">${E(i.notes||"-")}</b>`],["Internal Notes",`<b>${E(i.inotes||"-")}</b>`]])}</div>
   <table class="fp-totb"><tr><td>Amount Due</td><td>${money(invDue(i))}</td></tr><tr><td>Amount Paid</td><td>${money(invPaid(i))}</td></tr><tr><td>Subtotal</td><td>${money(invTotal(i))}</td></tr><tr><td>Tax (0%)</td><td>$0.00</td></tr><tr><td>Total Amount ${i.st==="Paid"?'<span class="stamp">PAID</span>':""}</td><td>${money(invTotal(i))}</td></tr></table></div></div>
   ${i.progress.length?`<div class="fp-rcard"><h3 class="fp-sh">Progress Invoices</h3>${i.progress.map(p=>`<p>${E(p.label)}: amount due shown ${money(p.amt)} · ${E(p.how)}</p>`).join("")}</div>`:""}</div>`;
  return h;
}

/* ---------- preview / send screen ---------- */
function scrPreview(){
  const k = U.r.kind, id = U.r.id, rec = k==="est" ? W.est[id] : W.inv[id];
  if(!rec) return `<p>Not found.</p>`;
  const c = W.cust[rec.c] || {};
  const tot = k==="est" ? estTotal(rec) : invDue(rec);
  const pr = pv("p.sv.pr", false), mode = pv("p.sv.mode","Email");
  return `<div class="fp-bar">${btn("back",`${ic("left",14)} Back To ${k==="est"?"Estimate":"Invoice"}`,"ghost","","btn-backto")}<span style="flex:1"></span>${btn("sv-email","Email To Customer","green","","btn-emailcust")}</div>
  <div class="fp-prev"><div class="fp-doc"><h2>${k==="est"?"Estimate":"Invoice"} #${id}</h2><p>Summit Ridge Plumbing (practice)</p><p><b>${E(cname(W,rec.c))}</b><br>${E(c.addr||"")}</p>
    ${k==="est"?rec.opts.map(o=>`<h4>${E(o.name)}</h4>${optTable(o)}`).join(""):optTable({items:rec.items})}${rec.notes?`<p><i>${E(rec.notes)}</i></p>`:""}</div>
   <div class="fp-send"><div class="fp-ltabs">${["SMS","Email"].map(m=>`<button class="${mode===m?"on":""}" data-a="sv-mode" data-v="${m}">${m} ${k==="est"?"Estimate":"Invoice"}</button>`).join("")}</div>
    ${mode==="Email"?`<div class="fp-grid2">${fld("From Name", inp("p.sv.fn", pv("p.sv.fn","You")))}${fld("From Email", inp("p.sv.fe", pv("p.sv.fe","office@summitridge.example")))}</div>`+fld("To", inp("p.sv.to", pv("p.sv.to", c.email||"")))+`<div class="fp-grid2">${fld("CC", inp("p.sv.cc2", pv("p.sv.cc2","")))}${fld("BCC", inp("p.sv.bcc", pv("p.sv.bcc","")))}</div>`+fld("Subject", inp("p.sv.subj", pv("p.sv.subj", `${k==="est"?"Estimate":"Invoice"} #${id} from Summit Ridge Plumbing`)))+fld("Body", `<textarea data-f="p.sv.body" rows="3">${E(pv("p.sv.body","Hi, please see the attached. Thank you!"))}</textarea>`):fld("Phone", inp("p.sv.ph", pv("p.sv.ph", c.phone||"")))}
    ${chk("p.sv.url", pv("p.sv.url",true), "Attach Dynamic URL Link")}
    ${chk("p.sv.pdf", pv("p.sv.pdf",true), `Attach ${k==="est"?"Estimate":"Invoice"} PDF`)}
    <div class="fp-sendopts">${chk("p.sv.sig", pv("p.sv.sig",false), "Include Signature Request", 'data-hk="sv-sig"')}
    ${chk("p.sv.pr", pr, "Include Payment Request", 'data-ch="redraw" data-hk="sv-pr"')}
    ${pr?`${chk("p.sv.cc", pv("p.sv.cc",true), "Credit/Debit Card")}${chk("p.sv.ach", pv("p.sv.ach",true), "Bank Transfer (ACH)")}<div class="fp-row">${fld("Payment Request Amount", inp("p.sv.amt", pv("p.sv.amt", k==="est"?"":"100"), 'inputmode="decimal" data-hk="sv-amt"'))}${fld("Type", sel("p.sv.unit",["$","%"],pv("p.sv.unit",k==="est"?"$":"%"),'data-hk="sv-unit"'))}</div>`:""}
    ${chk("p.sv.voice", pv("p.sv.voice",false), "Attach Voiceover Audio Recording")}</div>
    ${mode==="Email"?chk("p.sv.sms", pv("p.sv.sms",false), "Simultaneously Send SMS To Customer", 'data-hk="sv-sms"'):""}
    <div class="fp-row">${btn("sv-send","Send","green",`data-k="${k}" data-v="${id}"`,"btn-send")}${btn("back","Cancel","ghost")}</div></div></div>`;
}

/* ---------- payments, POs, team ---------- */
function allPays(){ const out=[]; Object.values(W.inv).forEach(i => i.pays.forEach(p => out.push(Object.assign({inv:i.id, c:i.c}, p)))); return out; }
function scrFPPay(){
  const L = allPays().filter(p=>p.fp).sort((a,b)=>b.date.localeCompare(a.date));
  return `<div class="fp-tool"><span class="sp"></span></div><div class="fp-tw"><table class="fp-t lv"><thead><tr><th>Date</th><th>Customer</th><th>Invoice</th><th>Amount</th><th>Refunded</th><th></th></tr></thead><tbody>
  ${L.map(p=>`<tr><td>${dlab(p.date)}</td><td>${E(cname(W,p.c))}</td><td><button class="lnk" data-a="open-inv" data-v="${p.inv}">#${p.inv}</button></td><td>${money(p.amt)}</td><td>${p.refunds.length?money(p.refunds.reduce((a,r)=>a+r.amt,0)):"-"}</td><td>${btn("refund-open","Refund","wt2 sm",`data-v="${p.inv}" data-p="${p.id}"`,"fprefund-"+p.id)}</td></tr>`).join("")}</tbody></table></div>`;
}
function scrPOs(){
  return `<div class="fp-tool"><p class="muted" style="margin:0">Purchase orders are what you send a supplier to buy parts. They are not the customer's PO number.</p><span class="sp"></span>${createBtn("po-new","Create Purchase Order")}</div>
  <div class="fp-tw"><table class="fp-t lv"><thead><tr><th>PO</th><th>Vendor</th><th>Job</th><th>Total</th><th>Status</th><th>Note</th></tr></thead><tbody>${W.pos.map(p=>`<tr><td>${E(p.id)}</td><td>${E(p.vendor)}</td><td>#${E(p.job||"-")}</td><td>${money(p.total)}</td><td>${E(p.st)}</td><td>${E(p.note)}</td></tr>`).join("")}</tbody></table></div>`;
}
function scrTeam(){
  return `<div class="fp-ltabs top"><button class="on" data-a="noop">List</button><button data-a="na-tab">Map</button><span class="sp"></span>${createBtn("user-new","Add Team Member","","btn-adduser")}</div>
  <div class="fp-tool"><div class="fp-search big sm">${ic("search",17)}<input placeholder="Search..." aria-label="Search team members" data-f="p.teamq"></div><button class="fp-btn wt" data-a="noop">${ic("filter",17)} Filters</button></div>
  <div class="fp-ulist">${Object.keys(W.users).filter(u=>{const q=(pv("p.teamq","")||"").toLowerCase(); return !q || W.users[u].name.toLowerCase().includes(q);}).map((u,i)=>{const x=W.users[u]; const em=x.email||(x.name.toLowerCase().replace(/[^a-z]+/g,".").replace(/^\.|\.$/g,"")+"@summitridge.example"); const ph=x.phone||(x.tech||x.admin?"(555) 300-01"+String(10+i):"-"); return `<button class="fp-urow" data-a="open-user" data-v="${u}" data-hk="user-${u}"><span class="fp-av md" style="background:${x.color}">${E(x.name.split(" ").map(s=>s[0]).join("").slice(0,2))}</span><span class="nm"><b>${E(x.name)}</b><small>${E(x.role)}${x.st!=="Activated"?" · Deactivated":""}</small></span><span class="ph">${E(ph)}</span><span class="em">${E(em)}</span><span class="tm">${E(x.teams.join(", ")||"-")}</span><span class="sk">${(x.skills||[]).map(k=>`<i class="sk-${k.startsWith("Septic")?"s":k.includes("Apprentice")?"a":k.includes("Commercial")?"c":"j"}">${E(k)}</i>`).join("")}</span>${ic("down",16)}</button>`;}).join("")}</div>`;
}
function scrUser(){
  const x = W.users[U.r.id]; if(!x) return "";
  const open = Object.values(W.jobs).filter(j => j.users.includes(U.r.id) && !CLOSED_ST.includes(j.st));
  return `<div class="fp-rec"><div class="fp-rcard"><div class="fp-rtop"><div class="fp-rtl"><span class="fp-av lg" style="background:${x.color}">${E(x.name.split(" ").map(s=>s[0]).join("").slice(0,2))}</span><div><h1>${E(x.name)}</h1><small>${E(x.role)} · ${x.st==="Activated"?"Active":"Deactivated"}</small></div></div><div class="r"><div class="fp-rbtns">${btn("user-edit",`${ic("edit",15)} Edit`,"blue",`data-v="${U.r.id}"`,"btn-user-edit")}</div></div></div>
  ${kv([["Teams",`<b>${E(x.teams.join(", ")||"-")}</b>`]])}</div>
  <div class="fp-rcard"><h3 class="fp-sh">Open jobs (${open.length})</h3>${open.map(j=>`<p><button class="lnk" data-a="open-job" data-v="${j.id}">#${j.id}</button> ${E(j.title)} · ${j.date?dlab(j.date):"Unscheduled"}</p>`).join("")||'<p class="fp-none">None.</p>'}</div></div>`;
}

/* ---------- timesheets ---------- */
const NOWH = 14.25;
function tsOpenOf(u){ return W.ts.find(t => t.user===u && t.co==null); }
function tsDur(t){ if(t.co!=null) return t.co-t.ci; const days = (dnum(TODAY)-dnum(t.date)); return days*24 + NOWH - t.ci; }
function hm(h){ const m = Math.round(h*60); return `${Math.floor(m/60)} hrs ${m%60} min`; }
function scrTS(){
  const tabs = topTabs([["Day","Day"],["Weekly","Weekly"]].map(([t])=>({l:t,on:U.tsTab===t,a:"ts-tab",v:t,hk:"tst-"+t})).concat(["Weeks","Months"])) + topTabs([{l:"Overview",on:true,a:"noop"},"Dispatch","Map"],true) + `
   <div class="fp-tool"><div class="fp-seg">${["My","Team"].map(m=>`<button class="${U.tsMode===m?"on":""}" data-a="ts-mode" data-v="${m}" data-hk="tsm-${m}">${m}</button>`).join("")}</div>
   <div class="fp-seg">${["General","Job Tracking"].map(m=>`<button class="${U.tsType===m?"on":""}" data-a="ts-type" data-v="${m}">${m}</button>`).join("")}</div>
   <span class="sp"></span><button class="fp-btn wt" data-a="noop">${ic("clock",17)} Log Backdated Time</button></div>`;
  const people = Object.keys(W.users).filter(u => W.users[u].tech && W.users[u].role!=="Assignment User");
  if(U.tsMode==="My") return tabs + `<div class="fp-card pad"><p class="muted">You haven't logged any time this week. Switch to Team to see your techs.</p></div>`;
  if(U.tsType!=="General") return tabs + `<div class="fp-card pad"><p class="muted">No job tracking entries in this practice. Switch back to General.</p></div>`;
  if(U.tsTab==="Weekly"){
    const days = PDAYS.slice(0,5);
    return tabs + `<div class="fp-card"><div class="fp-tw"><table class="fp-t"><thead><tr><th>Team member</th>${days.map(d=>`<th>${d.sh}</th>`).join("")}<th>Total</th></tr></thead><tbody>
    ${people.map(u=>{ let tot=0; const cells = days.map(d=>{ const es=W.ts.filter(t=>t.user===u&&t.date===d.k); if(!es.length) return "<td>-</td>"; const open=es.some(t=>t.co==null); const hrs=es.filter(t=>t.co!=null).reduce((a,t)=>a+(t.co-t.ci),0); tot+=hrs; return `<td>${open?'<span class="warn">Open</span> ':""}${hrs?hrs.toFixed(2):""}</td>`; }).join(""); return `<tr class="cl" data-a="ts-member" data-v="${u}"><td class="lnk">${E(uname(W,u))}</td>${cells}<td><b>${tot.toFixed(2)}</b></td></tr>`; }).join("")}
    </tbody></table></div><div class="fp-foot">${btn("ts-export","EXPORT","blue","","btn-ts-export")}</div></div>`;
  }
  const d = U.tsDay;
  return tabs + `<div class="fp-days ln">${PDAYS.slice(0,5).map(x=>`<button class="${x.k===d?"on":""}" data-a="ts-day" data-v="${x.k}" data-hk="tsd-${x.k}">${x.sh}</button>`).join("")}</div><div class="fp-tsgrp">Service</div>
   <div class="fp-card ts">${people.map(u=>{ const open=tsOpenOf(u) && dnum(tsOpenOf(u).date)<=dnum(d); const today=W.ts.filter(t=>t.user===u&&t.date===d&&t.co!=null).reduce((a,t)=>a+(t.co-t.ci),0) + (d===TODAY && open && tsOpenOf(u).date===TODAY ? NOWH-tsOpenOf(u).ci : 0);
     return `<button class="fp-tsrow" data-a="ts-member" data-v="${u}" data-hk="tsu-${u}"><span class="fp-av sm" style="background:${W.users[u].color}">${E(W.users[u].name.split(" ").map(s=>s[0]).join(""))}</span><span><b>${E(uname(W,u))}</b><small class="${open?"ok":""}">${open?"Clocked In":"Clocked Out"}</small></span><span class="r ${open?"ok":""}">${today?hm(today):"0 min"}<small>Total today</small></span><span class="fp-clk ${open?"on":""}">${ic("clock",18)}</span></button>`; }).join("")}</div>`;
}
function scrTSMember(){
  const u = U.r.id, d = U.tsDay, open = tsOpenOf(u);
  const es = W.ts.filter(t => t.user===u && (t.date===d || (t.co==null && dnum(t.date)<=dnum(d))));
  return `<div class="fp-days">${PDAYS.slice(0,5).map(x=>`<button class="${x.k===d?"on":""}" data-a="ts-day" data-v="${x.k}">${x.sh}</button>`).join("")}</div>
  <h2>Timesheets for ${E(uname(W,u))}</h2>
  ${open && dnum(open.date)<=dnum(d) ? `<div class="fp-green"><b>Clocked In</b> since ${dlab(open.date)}, ${fmtH(open.ci)}</div>`:""}
  <div class="fp-card pad">${es.length?es.map(t=>`<button class="fp-entry" data-a="ts-entry" data-v="${t.id}" data-hk="entry-${t.id}"><span>${t.co==null?'<b class="ok">Working</b>':`<b>${hm(t.co-t.ci)}</b>`}</span><small>${dlab(t.date)}, ${fmtH(t.ci)} Clock In${t.co!=null?` · ${fmtH(t.co)} Clock Out`:""}</small></button>`).join(""):`<p class="muted">You haven't logged any time today!</p>`}</div>`;
}

/* ===== reporting, booking, communications, settings ===== */
const RCOLS = {
  jobs:[["id","Job #"],["customer","Customer"],["title","Title"],["status","Status"],["date","Start Date"],["tech","Assigned"],["custLS","Customer Lead Source"],["invStatus","Invoice Status"]],
  estimates:[["id","Estimate #"],["customer","Customer"],["title","Title"],["status","Status"],["creator","Estimate Creator"],["sent","Invoiced Date"],["total","Estimate Total"]],
  invoices:[["id","Invoice #"],["customer","Customer"],["status","Status"],["date","Invoice Date"],["due","Due Date"],["total","Invoice Total"],["amountPaid","Amount Paid"],["amountDue","Amount Due"]],
  payments:[["invoice","Invoice #"],["customer","Customer"],["method","Method"],["amount","Amount"],["date","Payment Date"],["by","User"]],
  timesheets:[["user","User"],["date","Clock In Date"],["clockIn","Clock In Time"],["clockOut","Clock Out Time"],["dur","Duration Decimal"],["type","Timesheet Type"],["job","Parent Job"]]
};
const RNUM = ["total","amountPaid","amountDue","amount","dur"];
const RDATE = {jobs:["Start Date"],estimates:["Invoiced Date","Created Date"],invoices:["Due Date","Invoice Date"],payments:["Payment Date"],timesheets:["Clock In Time"]};
const RRANGE = {"This Week (Nov 2 - Nov 8)":["11-02","11-08"],"Last 30 Days":["10-05","11-04"],"This Year":["01-01","12-31"]};
const RLAB = [["This Week (Nov 2 - Nov 8)","This Week (Nov 2 - Nov 8)"],["Last 30 Days","Last 30 Days"],["This Year","Jan 1 to today (shortcut)"]];
const RTABS = [["dashboards","Dashboards"],["jobs","Jobs"],["estimates","Estimates"],["invoices","Invoices"],["payments","Payments"],["timesheets","Timesheets"]];
function repRaw(tab){
  if(tab==="jobs") return Object.values(W.jobs).filter(j=>!j.archived).map(j=>({id:"#"+j.id,customer:cname(W,j.c),title:j.title,status:j.st,date:j.date,tech:j.users.map(u=>uname(W,u)).join(", "),custLS:(W.cust[j.c]||{}).ls||"",invStatus:jobInvStatus(W,j),_d:{"Start Date":j.date}}));
  if(tab==="estimates") return Object.values(W.est).map(e=>({converted:!!e.inv,id:e.id,customer:cname(W,e.c),title:e.title,status:e.st,creator:uname(W,e.by),sent:e.sent,total:estTotal(e),_d:{"Invoiced Date":e.sent,"Created Date":e.created}}));
  if(tab==="invoices") return Object.values(W.inv).map(i=>({id:i.id,customer:cname(W,i.c),status:i.st,date:i.date,due:i.due,total:invTotal(i),amountPaid:invPaid(i),amountDue:invDue(i),_d:{"Due Date":i.due,"Invoice Date":i.date}}));
  if(tab==="payments") return allPays().map(p=>({invoice:p.inv,customer:cname(W,p.c),method:p.method,amount:p.amt-(p.refunds||[]).reduce((a,r)=>a+r.amt,0),date:p.date,by:uname(W,p.by),_d:{"Payment Date":p.date}}));
  if(tab==="timesheets") return W.ts.map(t=>({user:uname(W,t.user),date:t.date,clockIn:fmtH(t.ci),clockOut:t.co==null?"":fmtH(t.co%24),dur:t.co==null?"":Math.round((t.co-t.ci)*100)/100,type:t.type,job:t.job,_d:{"Clock In Time":t.date}}));
  return [];
}
function passFilter(r, filters){
  for(const [k,f] of Object.entries(filters||{})){
    if(!f) continue;
    if(f.vals){ const v = r[k]===""||r[k]==null ? "(Blanks)" : String(r[k]); if(!f.vals.includes(v)) return false; }
    if(f.op && f.op!=="Any" && f.val!==""){ const n=+r[k], x=+f.val; if(r[k]===""||isNaN(n)) return false; if(f.op==="Greater Than" && !(n>x)) return false; if(f.op==="Less Than" && !(n<x)) return false; }
  }
  return true;
}
function repRows(tab, o){
  const [a,b] = RRANGE[o.range||"This Year"] || RRANGE["This Year"];
  const dt = o.dateType || RDATE[tab]?.[0];
  return repRaw(tab).filter(r => { const d = r._d ? r._d[dt] : ""; if(o.range && o.range!=="This Year" && (!d || d<a || d>b)) return false; return passFilter(r, o.filters); });
}
function rcell(k, v){ if(RNUM.includes(k) && v!=="" && v!=null) return k==="dur" ? (+v).toFixed(2) : money(v); if(["date","sent","due"].includes(k)) return v?dlab(v):""; return E(v); }
function scrRep(){
  const R = U.rep; const tab = R.tab;
  const LIVE_RT = ["dashboards","Users","jobs","Material Lists","estimates","invoices","payments","timesheets","Commissions","Forms","Projects","Maintenance Agreements"];
  let h = `<div class="fp-ltabs top">${LIVE_RT.map(k=>{ const x = RTABS.find(y=>y[0]===k); return x ? `<button class="${tab===k?"on":""}" data-a="rep-tab" data-v="${k}" data-hk="rt-${k}">${x[1]}</button>` : `<button data-a="na-tab">${k}</button>`; }).join("")}${RTABS.filter(x=>!LIVE_RT.includes(x[0])).map(([k,l])=>`<button class="${tab===k?"on":""}" data-a="rep-tab" data-v="${k}" data-hk="rt-${k}">${l}</button>`).join("")}</div>`;
  if(tab==="dashboards") return h + `<div class="fp-card pad"><p>Custom dashboards live on the Pulse Dashboard. ${btn("go","Open Pulse Dashboard","link",'data-v="dash"')}</p></div>`;
  const subs = tab==="payments" ? ["Raw Data","Reports"] : ["Raw Data"];
  const xsub = {jobs:["Recurring Jobs","Reports","Technician","Tasks","Recurring Tasks","Site Visits","Cost"]}[tab]||[];
  h += `<div class="fp-ltabs top sub">${subs.map(s=>`<button class="${(R.sub||"Raw Data")===s?"on":""}" data-a="rep-sub" data-v="${s}" data-hk="rs-${s}">${s}</button>`).join("")}${xsub.map(s=>`<button data-a="na-tab">${s}</button>`).join("")}</div>`;
  if(tab==="payments" && R.sub==="Reports"){
    const kind = pv("p.pr.kind","Company"), rtype = pv("p.pr.type","Amount of Payments"), ivl = pv("p.pr.int","Weekly"), range = pv("p.pr.range","This Week (Nov 2 - Nov 8)");
    const rows = repRows("payments",{range});
    const cnt = rtype==="Number of Payments";
    const teamOf = n => { const u = Object.values(W.users).find(x=>x.name===n); return (u && u.teams && u.teams[0]) || "No Team"; };
    const grp = r => kind==="By User" ? r.by : kind==="By Team" ? teamOf(r.by) : "Company";
    const bucket = d => { if(!d) return "-"; if(ivl==="Daily") return d; if(ivl==="Monthly") return d.slice(0,2); const [m,dd]=d.split("-").map(Number); const t=new Date(2026,m-1,dd); t.setDate(t.getDate()-t.getDay()); return String(t.getMonth()+1).padStart(2,"0")+"-"+String(t.getDate()).padStart(2,"0"); };
    const blab = k => ivl==="Monthly" ? (["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"][+k-1]||k) : ivl==="Weekly" ? "Week of "+dlab(k) : dlab(k);
    const g={}, cols=new Set(); rows.forEach(r=>{ const k=grp(r), c=bucket(r.date); cols.add(c); g[k]=g[k]||{_t:0}; const v=cnt?1:r.amount; g[k][c]=(g[k][c]||0)+v; g[k]._t+=v; });
    const cl=[...cols].sort(), fmt=v=>cnt?String(v||0):money(v||0);
    const head = kind==="By User" ? "User" : kind==="By Team" ? "Team" : "Company";
    const body = rows.length ? `<table class="fp-t sm"><thead><tr><th>${head}</th>${cl.map(c=>`<th>${E(blab(c))}</th>`).join("")}<th>Total</th></tr></thead><tbody>${Object.entries(g).sort((a,b)=>b[1]._t-a[1]._t).map(([k,v])=>`<tr><td>${E(k)}</td>${cl.map(c=>`<td>${fmt(v[c])}</td>`).join("")}<td><b>${fmt(v._t)}</b></td></tr>`).join("")}</tbody></table>` : `<p class="muted">No payments in this range.</p>`;
    return h + `<div class="fp-bar">${fld("Report Type", sel("p.pr.type",["Number of Payments","Amount of Payments"],rtype,'data-ch="pr" data-hk="pr-type"'))}${fld("Time Interval", sel("p.pr.int",["Daily","Weekly","Monthly"],ivl,'data-ch="pr" data-hk="pr-int"'))}${fld("Group By", sel("p.pr.kind",["Company","By Team","By User"],kind,'data-ch="pr" data-hk="pr-kind"'))}${fld("Dates", sel("p.pr.range",RLAB,range,'data-ch="pr"'))}</div><div class="fp-card pad">${body}</div>`;
  }
  const cols = R.cols || RCOLS[tab].map(c=>c[0]);
  h += `<div class="fp-bar">${fld("Date Type", sel("p.rd.dt", RDATE[tab], pv("p.rd.dt",RDATE[tab][0]), 'data-hk="rd-dt"'))}${fld("Date Range", sel("p.rd.range", RLAB, pv("p.rd.range","This Week (Nov 2 - Nov 8)"), 'data-hk="rd-range"'))}${btn("rep-load", R.loaded?"Apply":"Load Data","blue","","btn-loaddata")}</div>`;
  if(!R.loaded) return h + `<p class="muted">Pick the dates and click Load Data.</p>`;
  const rows = repRows(tab,{range:R.range, dateType:R.dateType, filters:R.filters});
  const mine = W.reports.filter(r=>r.tab===tab);
  h += `<div class="fp-bar"><div class="fp-mwrap">${btn("menu",`Select Report ${ic("down",13)}`,"link",'data-v="selrep"',"btn-selectreport")}${U.menu==="selrep"?`<div class="fp-menu">${mine.map(r=>`<button data-a="rep-open" data-v="${r.id}" data-hk="rep-${E(r.name)}">${E(r.name)}${r.widget?" (widget)":""}</button>`).join("")||'<span class="muted">No saved reports yet.</span>'}</div>`:""}</div>
    <div class="fp-mwrap">${btn("menu","Save","link",'data-v="saverep"',"btn-saverep")}${U.menu==="saverep"?`<div class="fp-menu"><button data-a="rep-save" data-v="new" data-hk="btn-saverep-new">Save Report as New</button><button data-a="rep-save" data-v="widget" data-hk="btn-saverep-widget">Save Report as Widget</button></div>`:""}</div>
    ${btn("rep-reset","Reset","link")}<span style="flex:1"></span>
    ${btn("rep-panel","Filters","ghost "+(R.panel==="filters"?"on":""),'data-v="filters"',"btn-rep-filters")}${btn("rep-panel","Columns","ghost "+(R.panel==="columns"?"on":""),'data-v="columns"',"btn-rep-columns")}${tab==="estimates"?btn("rep-quick","Quick Reports","ghost","","btn-quickreports"):""}${btn("rep-export","Export CSV","ghost","","btn-export")}</div>
    ${R.reportName?`<p class="muted">Report: <b>${E(R.reportName)}</b></p>`:""}`;
  h += `<div class="fp-rep ${R.panel?"withp":""}"><div class="fp-repmain">`;
  h += `<div class="fp-group" data-drop="group" data-hk="groupbar">${R.group?`Grouped by <b>${E((RCOLS[tab].find(c=>c[0]===R.group)||[])[1])}</b> <button class="lnk" data-a="rep-ungroup">Remove</button>`:`Drag a column here to group your data <span class="fp-small">(or use the practice shortcut)</span>`}
    <select data-ch="rep-group" data-f="p.rd.group" aria-label="Group by" data-hk="group-select"><option value="">Group by...</option>${RCOLS[tab].filter(c=>cols.includes(c[0])).map(c=>`<option value="${c[0]}">${c[1]}</option>`).join("")}</select></div>`;
  if(R.pivot){ h += `<div class="fp-card pad"><h3>Quick Report: ${E(R.pivot.field)} by ${E(R.pivot.by)}</h3>${pivotTable(rows,R.pivot)}</div>`; }
  const heads = RCOLS[tab].filter(c=>cols.includes(c[0]));
  if(R.group){
    const g = {}; rows.forEach(r => { const k = r[R.group]===""||r[R.group]==null?"(Blanks)":String(r[R.group]); (g[k]=g[k]||[]).push(r); });
    h += `<div class="fp-card">${Object.keys(g).sort((a,b)=>g[b].length-g[a].length).map(k=>`<details class="fp-grp"><summary><b>${E(k)}</b> (${g[k].length})</summary><table class="fp-t sm"><tbody>${g[k].map(r=>`<tr>${heads.map(c=>`<td>${rcell(c[0],r[c[0]])}</td>`).join("")}</tr>`).join("")}</tbody></table></details>`).join("")}</div>`;
  } else {
    h += `<div class="fp-card"><div class="fp-tw"><table class="fp-t sm"><thead><tr>${heads.map(c=>`<th draggable="true" data-dragcol="${c[0]}">${c[1]}</th>`).join("")}</tr></thead><tbody>${rows.map(r=>`<tr>${heads.map(c=>`<td>${rcell(c[0],r[c[0]])}</td>`).join("")}</tr>`).join("")||`<tr><td class="muted" colspan="${heads.length}">No rows.</td></tr>`}</tbody></table></div></div>`;
  }
  h += `<p class="muted fp-small">${rows.length} rows</p></div>`;
  if(R.panel==="columns") h += `<div class="fp-rpanel" data-hk="col-panel"><b>Columns</b>${RCOLS[tab].map(c=>chk("p.rc."+c[0], cols.includes(c[0]), c[1], `data-ch="rep-cols" data-hk="col-${c[0]}"`)).join("")}</div>`;
  if(R.panel==="filters"){
    h += `<div class="fp-rpanel" data-hk="filter-panel"><b>Filters</b>`;
    const groups = tab==="jobs" ? [["Job",RCOLS.jobs.filter(c=>c[0]!=="custLS")],["Customer",RCOLS.jobs.filter(c=>c[0]==="custLS")]] : [[null,RCOLS[tab]]];
    groups.forEach(([gname, cs]) => {
      if(gname) h += `<div class="fp-fgh">${gname}</div>`;
      cs.forEach(([k,l]) => {
        const open = R.fopen===k, f = (R.filters||{})[k];
        h += `<div class="fp-fitem"><button class="fp-fhead" data-a="rep-fopen" data-v="${k}" data-hk="f-${k}">${ic(open?"down":"chev",13)} ${l}${f?' <span class="dot"></span>':""}</button>`;
        if(open){
          if(RNUM.includes(k)) h += `<div class="fp-fbody">${sel("p.rf.op",["Any","Greater Than","Less Than"],(f&&f.op)||"Any",'data-hk="fop-'+k+'"')}${inp("p.rf.val",(f&&f.val)||"",'inputmode="decimal" aria-label="Value" data-hk="fval-'+k+'"')}${btn("rep-fapply","Apply","blue sm",`data-v="${k}"`,"fapply-"+k)}</div>`;
          else { const vals = [...new Set(repRaw(tab).map(r => r[k]===""||r[k]==null?"(Blanks)":String(r[k])))].sort((a,b)=>a==="(Blanks)"?-1:b==="(Blanks)"?1:a.localeCompare(b));
            const on = f ? f.vals : vals;
            h += `<div class="fp-fbody">${chk("p.rf.all", on.length===vals.length, "(Select All)", `data-ch="rep-fall" data-v="${k}" data-hk="fall-${k}"`)}${vals.map(v=>chk("p.rf.v."+v, on.includes(v), E(v), `data-ch="rep-fval" data-v="${k}" data-val="${E(v)}" data-hk="fv-${k}-${E(v)}"`)).join("")}</div>`; }
        }
        h += `</div>`;
      });
    });
    h += `</div>`;
  }
  return h + `</div>`;
}
function pivotTable(rows, pv){
  const keyOf = {"Estimate Creator":"creator","Status":"status","Customer":"customer"}[pv.by];
  const g = {}; rows.forEach(r => { const k = r[keyOf]||"(Blanks)"; (g[k]=g[k]||[]).push(r); });
  const val = list => {
    if(pv.field==="Count") return String(list.length);
    if(pv.field==="Total") return money(list.reduce((a,r)=>a+(+r.total||0),0));
    const sent = list.filter(r=>r.status!=="Draft"), won = sent.filter(r=>r.converted);
    return sent.length ? `${Math.round(100*won.length/sent.length)}% (${won.length} of ${sent.length})` : "-";
  };
  return `<table class="fp-t sm"><thead><tr><th>${E(pv.by)}</th><th>${E(pv.field)}</th></tr></thead><tbody>${Object.keys(g).sort().map(k=>`<tr><td>${E(k)}</td><td>${val(g[k])}</td></tr>`).join("")}</tbody></table>`;
}

function scrBooking(){
  const L = W.booking.filter(b => !b.dismissed);
  return `<div class="fp-tool"><span class="sp"></span></div><div class="fp-tw"><table class="fp-t lv"><thead><tr><th>Name</th><th>Email</th><th>Phone</th><th>Address</th><th>Description</th><th>Requested At</th><th></th></tr></thead><tbody>
  ${L.map(b=>`<tr><td>${E(b.name)}</td><td>${E(b.email)}</td><td>${E(b.phone)}</td><td>${E(b.addr)}</td><td>${E(b.desc)}</td><td>${E(b.at)}</td><td class="fp-nowrap">${b.done?'<span class="ok">Created</span>':`<div class="fp-mwrap">${btn("menu","Create New","blue sm",`data-v="bk-${b.id}"`,"bk-new-"+b.id)}${U.menu==="bk-"+b.id?`<div class="fp-menu right"><button data-a="bk-create" data-v="${b.id}" data-k="cust" data-hk="bk-cust-${b.id}">Customer</button><button data-a="bk-create" data-v="${b.id}" data-k="job" data-hk="bk-job-${b.id}">Job</button><button data-a="bk-create" data-v="${b.id}" data-k="both" data-hk="bk-both-${b.id}">Customer &amp; Job</button></div>`:""}</div>`} <button class="fp-x" data-a="bk-dismiss" data-v="${b.id}" aria-label="Dismiss request" data-hk="bk-x-${b.id}">${ic("x",14)}</button></td></tr>`).join("")||'<tr><td colspan="7" class="muted">No requests.</td></tr>'}</tbody></table></div>`;
}
function scrComms(){
  return `<div class="fp-tool"><p class="muted" style="margin:0">Every email and text FieldPulse sent to customers.</p></div><div class="fp-tw"><table class="fp-t lv"><thead><tr><th>Sent</th><th>Customer</th><th>Type</th><th>Message</th><th>Status</th></tr></thead><tbody>
  ${W.comms.map(m=>`<tr><td>${E(m.at)}</td><td>${E(cname(W,m.to))}</td><td>${E(m.kind)}</td><td>${E(m.what)}</td><td>${E(m.st)}</td></tr>`).join("")}</tbody></table></div>`;
}
const SETS = [["general","General",["General","Billing Summary"]],["users","User Accounts",["Users","Teams","Tags","Sign in with Google","Two-Factor Authentication"]],["features","Features & Plugins",["Features & Plugins"]],["customers","Customers",["Lead Source","Tags","Custom Fields"]],["einv","Estimates & Invoices",["General","Advanced","Preview Settings","PDF Emails","Estimate Custom Status","Invoice Custom Status","Item List","Payments","QuickBooks","File Library","Themes","Custom Fields","Tags"]],["commission","Commission",["Commission"]],["projects","Projects",["Projects"]],["jobs","Jobs",["Custom Status"]],["agreements","Maintenance Agreements",["Maintenance Agreements"]],["assets","Assets",["Assets"]],["comm","Customer Communications",["Email Templates","SMS Templates","Email Settings","Automatic Triggers","Notification Settings","Engage"]],["forms","Custom Forms",["Custom Forms"]],["timesheets","Timesheets",["Timesheets"]],["booking","Booking Portal",["Booking Portal"]],["portal","Customer Portal",["Customer Portal"]],["review","Review",["Review Setup","Triggers"]],["orders","Orders",["Orders"]],["matlists","Material Lists",["Material Lists"]],["pricebook","Pricebook",["Pricebook"]]];
function scrSettings(){
  const s = SETS.find(x=>x[0]===U.setSec) || SETS.find(x=>x[0]==="users");
  if(!s[2].includes(U.setTab)) U.setTab = s[2][0];
  let h = `<div class="fp-ltabs top">${SETS.map(x=>`<button class="${x[0]===s[0]?"on":""}" data-a="set-sec" data-v="${x[0]}" data-hk="set-${x[0]}">${x[1]}</button>`).join("")}</div>
  <div class="fp-ltabs top sub">${s[2].map(t=>`<button class="${U.setTab===t?"on":""}" data-a="set-tab" data-v="${t}" data-hk="settab-${t}">${t}</button>`).join("")}</div>
  <div class="fp-note">Practice: you can look at settings. Only an Admin changes them, so ask your manager.</div>`;
  const t = U.setTab;
  if(t==="Users"){ const act = Object.keys(W.users).filter(u=>pv("p.showdeact",false)||W.users[u].st==="Activated"); const seats = Object.keys(W.users).filter(u=>W.users[u].st==="Activated" && W.users[u].role!=="Assignment User").length;
    h += `<div class="fp-card pad"><div class="fp-seat">Using ${seats} of ${seats} Full User Seats</div><p class="muted">Create a new team member user account by clicking the green action button or editing existing users by selecting their names.</p>${chk("p.showdeact",pv("p.showdeact",false),"Show Deactivated Users",'data-ch="redraw"')}${["Admin","Team Manager","Service Agent","Limited Agent","Assignment User"].map(r=>{ const L = act.filter(u=>W.users[u].role===r); return L.length ? `<h4 class="fp-rolehd">${r.toUpperCase()}</h4>${L.map(u=>`<div class="fp-uacc"><span class="fp-av md" style="background:${W.users[u].color}">${E(W.users[u].name.split(" ").map(x=>x[0]).join("").slice(0,2))}</span><div><b>${E(uname(W,u))}</b><small class="fp-rolepill">${E(r)}${W.users[u].admin&&r!=="Admin"?" · Company Admin":""}</small></div><div class="tms"><small>TEAMS</small><div>${W.users[u].teams.map(t=>`<span class="fp-tm">${E(t)}</span>`).join("")||"-"}</div></div></div>`).join("")}` : ""; }).join("")}</div>`; }
  else if(t==="Teams") h += `<div class="fp-card"><table class="fp-t"><thead><tr><th>Team</th><th>Managers</th><th>Members</th></tr></thead><tbody>${TEAMS.map(tm=>`<tr><td><b>${tm}</b></td><td>${Object.keys(W.users).filter(u=>W.users[u].teams.includes(tm)&&["Team Manager","Admin"].includes(W.users[u].role)).map(u=>E(uname(W,u))).join(", ")}</td><td>${Object.keys(W.users).filter(u=>W.users[u].teams.includes(tm)&&!["Team Manager","Admin"].includes(W.users[u].role)).map(u=>E(uname(W,u))).join(", ")||"-"}</td></tr>`).join("")}</tbody></table>
     <p class="pad muted">Roles: Admin (sees and changes everything, including Company Settings), Team Manager (sees their own teams; can also be made Company Admin), Service Agent, Limited Agent (mobile app only, own jobs), Assignment User (gets job details by email only).</p></div>`;
  else if(t==="Lead Source") h += `<div class="fp-card pad"><ol>${LEAD_SOURCES.map(l=>`<li>${E(l)}</li>`).join("")}</ol>${btn("admin-only","+ Create New","ghost")}</div>`;
  else if(t==="Tags") h += `<div class="fp-card pad"><h3>Customer tags</h3><p>${CUST_TAGS.map(t=>`<span class="fp-tag">${E(t)}</span>`).join(" ")}</p><h3>Job tags</h3><p>${JOB_TAGS.map(t=>`<span class="fp-tag">${E(t)}</span>`).join(" ")}</p></div>`;
  else if(t==="Advanced") h += `<div class="fp-card pad"><h3>Advanced Invoice Settings</h3><p class="muted">These settings are company-advanced settings related to invoices.</p><dl class="fp-kv"><dt>Enable Bill to Parent</dt><dd>No</dd><dt>Enable Invoice Cost Basis</dt><dd>Yes</dd><dt>Enable Automatic Markup</dt><dd>Yes</dd><dt>Disabled Estimates If Expired</dt><dd>No</dd><dt>Separate Estimate/Invoice Number Sequences</dt><dd>Yes</dd><dt>Lock Invoices Once Finalized</dt><dd>No</dd><dt>Lock Estimates Once Converted to an Invoice</dt><dd>Yes</dd><dt>Lock Invoices Once Fully Paid</dt><dd>Yes</dd></dl><p class="muted fp-small">With QuickBooks connected, Keep an Estimate Record is on by default and doesn't show here.</p></div>`;
  else if(t==="Custom Fields") h += `<div class="fp-card pad"><h3>Custom Fields for Invoice Records</h3><p class="muted">Create custom text fields for your invoice records and choose which roles can view the field.</p><p class="muted">No custom fields yet.</p>${btn("admin-only","Create New","ghost")}</div>`;
  else if(t==="QuickBooks"){ if(!U.qbStat) h += `<div class="fp-card pad"><div class="fp-qbh"><h3>QuickBooks Invoice Settings</h3>${btn("qb-stat",`${ic("file",14)} QuickBooks Online Statistic`,"wt2","","btn-qbstat")}</div><p class="muted">Connect your FieldPulse account to QuickBooks to automatically sync invoices, payment records, and customers. Once an invoice is marked as 'Invoiced' or 'Paid', FieldPulse sends it to QuickBooks.</p><dl class="fp-kv"><dt>Enable QuickBooks Accounting Integration</dt><dd><b>Yes</b></dd><dt>Enable Automatic Deposit Invoices</dt><dd>No</dd><dt>Default Customer Name</dt><dd>Company/First Name</dd><dt>Default Sales Account</dt><dd>Sales</dd></dl><p class="muted fp-small">Only an Admin or the bookkeeper changes these.</p></div>`;
    else { const cnt = k => W.qb.filter(q=>!k || q.type===k).length; h += `<div class="fp-card"><div class="pad fp-qbh"><span class="fp-seg">${btn("qb-back",`${ic("left",13)} FieldPulse`,"ghost sm")}<b>QuickBooks</b></span><span class="muted">Last Sync Date: Nov 3, 11:02 PM</span></div><div class="pad fp-qbchips"><b>Total</b>${[["All",""],["Customer","Customer"],["Invoice/Estimate","Invoice"],["Item","Item"],["Payment","Payment"]].map(([l,k])=>`<span>${l} <i>${cnt(k)}</i></span>`).join("")}</div><div class="fp-tw"><table class="fp-t sm"><thead><tr><th>Record Name</th><th>Type</th><th>Last Sync Date</th><th>Last Sync Status</th><th>Error Message</th><th>Resolution</th><th>Review Status</th></tr></thead><tbody>
     ${W.qb.map(q=>`<tr><td>${q.ref==="item"?E(q.rec):`<button class="lnk" data-a="qb-open" data-v="${q.id}" data-hk="qb-${q.id}">${E(q.rec)}</button>`}</td><td>${E(q.type)}</td><td>${E(q.at)}</td><td><span class="fp-qbst ${q.st==="Failed"?"bad":"ok"}">${E(q.st)}</span></td><td>${E(q.err)}</td><td>${E(q.res)}</td><td><select data-ch="qb-rev" data-v="${q.id}" aria-label="Review status" data-hk="qbrev-${q.id}">${["Opened","Closed"].map(o=>`<option ${q.rev===o?"selected":""}>${o}</option>`).join("")}</select></td></tr>`).join("")}</tbody></table></div></div>`; } }
  else if(t==="Custom Status") h += `<div class="fp-card pad"><h3>Job workflow</h3><p>${JOB_STATUSES.join(" → ")}</p><h3>Estimate workflow</h3><p>${EST_STATUSES.join(", ")}</p><h3>Invoice workflow</h3><p>${INV_STATUSES.join(", ")}</p></div>`;
  else if(t==="Email Settings") h += `<div class="fp-card pad"><dl class="fp-kv"><dt>From address</dt><dd>Designated Email Address: office@summitridge.example</dd><dt>From name</dt><dd>Summit Ridge Plumbing</dd><dt>Reply-to</dt><dd>office@summitridge.example</dd><dt>CC</dt><dd>User's email</dd><dt>BCC</dt><dd>notifications@summitridge.example (its own inbox)</dd></dl></div>`;
  else if(t==="Triggers") h += `<div class="fp-card"><div class="pad"><h3>Communication Triggers</h3><p class="muted">Review and feedback requests that send when something happens on a job.</p></div><table class="fp-t"><thead><tr><th>Choose Trigger</th><th>Choose Trigger Action</th><th>Choose Communication Template</th></tr></thead><tbody><tr><td>When job status is updated to 'Completed'</td><td>Prompts Confirmation Prior to Sending</td><td>Third Party Reviews</td></tr></tbody></table></div>`;
  else if(t==="Review Setup") h += `<div class="fp-card pad"><dl class="fp-kv"><dt>Enable 3rd Party Review Requests Email</dt><dd>On</dd><dt>3rd Party Review Sites</dt><dd>Google (on), Yelp (off), Facebook (off)</dd><dt>Enable Internal Feedback Scores Email</dt><dd>Off</dd></dl><p class="muted">Only an Admin changes these settings.</p></div>`;
  else if(t==="Automatic Triggers") h += `<div class="fp-card"><table class="fp-t"><thead><tr><th>When</th><th>Send</th><th>How</th></tr></thead><tbody>${W.triggers.map(r=>`<tr><td>${E(r[0])}</td><td>${E(r[1])}</td><td>${E(r[2])}</td></tr>`).join("")}</tbody></table></div>`;
  else if(t==="Email Templates"||t==="SMS Templates") h += `<div class="fp-card"><div class="pad"><h3>Customer ${t==="SMS Templates"?"SMS":"Email"} Templates</h3><p class="muted">Create custom templates that are automatically inserted into your customer communications.</p></div>${["Overdue Invoice Reminder","Invoicing Error","Review Request","Membership Benefits","Payment Template","On my way","24 Hour Reminder","Appointment Confirmation"].map(n=>`<div class="fp-tplrow"><b>${n}${t==="SMS Templates"?" - SMS":""}</b><small>${n==="Appointment Confirmation"?"Appointment Confirmation with "+E(COMPANY):n==="24 Hour Reminder"?"Appointment Reminder with "+E(COMPANY):n}</small></div>`).join("")}</div>`;
  else if(!["Users","Teams","Lead Source","Tags","Advanced","Custom Fields","QuickBooks","Custom Status","Email Settings","Automatic Triggers","Email Templates","SMS Templates","Triggers","Review Setup"].includes(t)) h += `<div class="fp-card pad"><h3>${E(t)}</h3><p class="muted">This settings page isn't part of the practice. In your company's FieldPulse, only an Admin changes it.</p></div>`;
  return h;
}
const NA_PAGES = {
  "Projects": {tabs:["All","Active","Completed"], create:"Create Project", cols:["Project","Customer","Status","Start Date","End Date"], rows:[["Lakeside Unit Repipes","Lakeside Property Mgmt","Active","Nov 2, 2026","Dec 18, 2026"],["Sunset Apartments Water Heaters","Sunset Apartments LLC","Active","Oct 19, 2026","Nov 20, 2026"]]},
  "Subtasks": {tabs:["Open","Completed","All"], create:"Create Subtask", cols:["Subtask","Job","Assigned To","Due Date","Status"], rows:[["Photos before and after","#1033 Garbage disposal install","Carlos Diaz","Nov 3, 2026","Completed"],["Customer walk-through done","#1033 Garbage disposal install","Carlos Diaz","Nov 3, 2026","Open"],["Invoice reviewed with customer","#1033 Garbage disposal install","Carlos Diaz","Nov 3, 2026","Open"]]},
  "Agreements": {tabs:["Active","Pending","Expired","All"], create:"Create Agreement", cols:["Agreement","Customer","Plan","Start","Renewal","Status"], rows:[["Annual drain service","Linda Parks","Yearly","Jan 5, 2026","Jan 5, 2027","Active"],["Water heater care","Grace Kim","Yearly","Mar 2, 2026","Mar 2, 2027","Active"]]},
  "Material Lists": {tabs:["All","Draft","Ordered"], create:"Create Material List", cols:["Material List","Job","Items","Created","Status"], rows:[["Repipe bathroom","#1038 Repipe bathroom","14","Nov 2, 2026","Draft"]]},
  "Pricebooks": {tabs:["Items","Services","Categories"], create:"Create Item", cols:["Item","Category","Price","Taxable"], rows:ITEMS.slice(0,12).map(([n,p])=>[n,"Plumbing",money(p),"Yes"])},
  "Variant Proposals": {tabs:["All","Sent","Accepted"], create:"Create Variant Proposal", cols:["Proposal","Customer","Options","Status","Created"], rows:[["Water heater options","Owen Price","3","Sent","Nov 3, 2026"]]},
  "Dynamic Proposals": {tabs:["All","Sent","Accepted"], create:"Create Dynamic Proposal", cols:["Proposal","Customer","Status","Created"], rows:[["Whole home repipe","Alan Brooks","Draft","Nov 2, 2026"]]},
  "Internal Activity": {tabs:["All","Jobs","Customers","Estimates","Invoices"], cols:["When","Who","What"], rows:[["Nov 4, 2:02 PM","Lisa Grant","Moved job #1050 to Thu, Nov 5"],["Nov 4, 1:40 PM","Pat Moreno","Created estimate #2051"],["Nov 4, 11:15 AM","Carlos Diaz","Marked job #1038 In Progress"]]},
  "Forms": {tabs:["Form Templates","Submitted Forms"], create:"Create Form", cols:["Form","Used On","Fields","Last Edited"], rows:[["Job Completion Debrief","Jobs","18","Oct 28, 2026"],["Plumbing Inspection","Jobs","24","Oct 21, 2026"],["Septic Inspection","Jobs","31","Oct 21, 2026"]]},
  "Assets": {tabs:["All","Water Heaters","Softeners","Septic"], create:"Create Asset", cols:["Asset","Customer","Location","Installed","Warranty"], rows:[["50 gal gas water heater","Grace Kim","210 Maple St","Mar 2, 2021","Mar 2, 2027"],["Water softener","Nora Fields","3 Elm Ct","Jun 14, 2024","Jun 14, 2029"]]},
  "HighLevel": {note:"HighLevel opens in its own website, outside FieldPulse. It is not part of this practice."}
};
function scrNA(){
  const L = U.r.label || "This screen", P = NA_PAGES[L];
  if(!P) return `<div class="fp-card pad fp-na"><h2>${E(L)}</h2><p class="muted">There is nothing here yet in this practice company.</p><p><button class="lnk" data-a="back">Go back</button></p></div>`;
  if(P.note) return `<div class="fp-card pad fp-na"><h2>${E(L)}</h2><p class="muted">${E(P.note)}</p></div>`;
  return topTabs(P.tabs.map((t,i)=>({l:t, on:i===0, a:"noop"}))) + `<div class="fp-tool">${toolSearch("naq","","Search for "+L.toLowerCase())}<button class="fp-btn wt" data-a="noop">${ic("filter",17)} Filters</button><span class="sp"></span>${P.create?createBtn("noop",P.create):""}</div>
   <div class="fp-tw"><table class="fp-t lv"><thead><tr>${P.cols.map(c=>`<th>${E(c)}</th>`).join("")}</tr></thead><tbody>${P.rows.map(r=>`<tr>${r.map(c=>`<td>${E(c)}</td>`).join("")}</tr>`).join("")}</tbody></table></div>`;
}

/* ===== menus and pop-up windows ===== */
function renderMenu(id){
  const M = (groups) => `<div class="fp-menu wide${groups.length>2?" c3":""}">${groups.map(([g,items]) => `<div class="fp-mg"><b>${g}</b>${items.map(([a,l,ds,hk]) => `<button data-a="${a}" ${ds||""} data-hk="${hk||("m-"+l)}">${l}</button>`).join("")}</div>`).join("")}</div>`;
  const r = U.r;
  if(id==="custact") return M([["Related",[["na-menu","Create Project"],["job-new","Create Job",`data-c="${r.id}"`],["na-menu","Create Material List"],["est-new-cust","Create Estimate",`data-c="${r.id}"`],["cust-createinv","Create Invoice"],["na-menu","Create Purchase Order"],["na-menu","Create Form"],["na-menu","Create Maintenance Agreement"],["na-menu","Create Asset"]]],["Update",[["na-menu","Add Comment"],["na-menu","Attach File/Photo"],["comm-open","Send Customer Communication",`data-v="${r.id}" data-k="${id==="custact"?"cust":"job"}"`,"m-sendcomm"],["merge-open","Merge Customers",`data-v="${r.id}"`,"m-merge"],["na-menu","Update Subscriber Notifications"]]],["Basic",[["na-menu","Create Related Customer"],["na-menu","Copy Customer Portal Link"],["na-menu","Generate a PDF of all outstanding invoices"],["archive","Archive Customer"],["na-menu","Set a Reminder"]]]]);
  if(id==="jobact") return M([["Related",[["sub-new","Create Subtask",`data-v="${r.id}"`],["na-menu","Create Material list"],["est-new","Create Estimate",`data-j="${r.id}"`,"m-createest"],["inv-new","Create Invoice",`data-v="${r.id}"`,"m-createinv"],["po-new","Create Purchase Order",`data-j="${r.id}"`],["na-menu","Create Form"],["na-menu","Create Maintenance Agreement"],["na-menu","Connect to Maintenance Agreement"],["na-menu","Create Asset"],["na-menu","Create Project"]]],["Update",[["na-menu","Add Comment"],["na-menu","Attach File/Photo"],["comm-open","Send Customer Communication",`data-v="${r.id}" data-k="${id==="custact"?"cust":"job"}"`,"m-sendcomm"],["visit-new","Add Site Visit",`data-v="${r.id}"`],["na-menu","Hide Job"],["na-menu","Generate Job Report"],["na-menu","Generate Asset Report"],["na-menu","Clock In"]]],["Basic",[["job-dup","Duplicate",`data-v="${r.id}"`],["na-menu","Create Next Occurrence"],["na-menu","Print"],["na-menu","Export as PDF with files"],["job-archive","Archive Job",`data-v="${r.id}"`,"m-archivejob"],["na-menu","Set a Reminder"]]]]);
  if(id==="estact") return M([["Related",[["est-createjob","Create Job",`data-v="${r.id}"`,"m-est-createjob"],["na-menu","Create Material List"],["na-menu","Create Project"],["na-menu","Create Maintenance Agreement"],["na-menu","Create Form"],["na-menu","Purchase Order"],["na-menu","Create Dynamic Proposal"]]],["PDFs",[["preview","View Estimate",`data-k="est" data-v="${r.id}"`],["preview","Send to Customer",`data-k="est" data-v="${r.id}"`,"m-sendest"],["na-menu","Generate Work Order PDF"],["preview","Send Signature Request",`data-k="est" data-v="${r.id}" data-sig="1"`]]],["Update",[["na-menu","Add Comment"],["na-menu","Attach File/Photo"]]],["Basic",[["est-dup","Duplicate",`data-v="${r.id}"`],["rem-open","Set a Reminder",`data-v="${r.id}"`,"m-reminder"],["est-lost","Lost Estimate",`data-v="${r.id}"`,"m-lost"],["est-convert","Convert to Invoice",`data-v="${r.id}"`],["archive","Archive Estimate"]]]]);
  if(id==="invact") return M([["Related",[["open-job","Create Job",`data-v="${(W.inv[r.id]||{}).job}"`],["na-menu","Create Material List"],["na-menu","Create Project"],["na-menu","Create Maintenance Agreement"],["na-menu","Connect Maintenance Agreement"],["na-menu","Create Form"],["na-menu","Purchase Order"],["na-menu","Create Dynamic Proposal"]]],["PDFs",[["preview","View Invoice",`data-k="inv" data-v="${r.id}"`],["preview","Send to Customer",`data-k="inv" data-v="${r.id}"`],["prog-open","Generate Progress Invoice",`data-v="${r.id}"`,"m-progress"],["na-menu","Generate Work Order PDF"],["na-menu","Generate Invoice Receipt"],["preview","PDF",`data-k="inv" data-v="${r.id}"`]]],["Update",[["na-menu","Add Comment"],["na-menu","Attach File/Photo"],["pay-take","Payment",`data-v="${r.id}"`]]],["Basic",[["inv-dup","Duplicate",`data-v="${r.id}"`],["na-menu","Set a Reminder"],["inv-void","Void Invoice",`data-v="${r.id}"`,"m-void"],["archive","Archive Invoice"]]]]);
  return "";
}

function custOptions(){ return Object.keys(W.cust).sort((a,b)=>cname(W,a).localeCompare(cname(W,b))).map(id=>[id, `${cname(W,id)} - ${W.cust[id].addr}`]); }
function userChecks(prefix, cur, attrs){ const L = [...new Set(techs(W).concat(["u9"]).concat(cur))]; return `<div class="fp-uchk">${L.map(u=>chk(`${prefix}${u}`, cur.includes(u), E(uname(W,u))+(W.users[u].st!=="Activated"?" (deactivated)":""), `data-hk="u-${u}" ${attrs||""}`)).join("")}</div>`; }
function pickedUsers(prefix){ return Object.keys(W.users).filter(u => U.form[prefix+u]); }
function itemPicker(label){
  const q = (U.form["m.iq"]||"").trim();
  const L = ITEMS.filter(([n]) => n.toLowerCase().includes(q.toLowerCase())).slice(0,8);
  return `<div class="fp-picker" data-hk="item-picker"><input data-in="itemq" data-f="m.iq" value="${E(q)}" placeholder="Search item list" aria-label="Search item list">
   ${L.map(([n,p])=>`<button data-a="item-pick" data-v="${E(n)}" data-hk="item-${E(n)}">${E(n)} <span class="muted">${money(p)}</span></button>`).join("")}
   ${q && !ITEMS.some(([n])=>n.toLowerCase()===q.toLowerCase()) ? `<button class="new" data-a="item-new" data-v="${E(q)}">Create new item "${E(q)}"</button>`:""}
   ${U.modal.picked?`<div class="fp-row"><span>Picked: <b>${E(U.modal.picked)}</b></span>${fld("Qty", inp("m.iqty", fv("m.iqty","1"), 'inputmode="numeric" style="width:60px"'))}${btn("item-add", label, "green sm","","btn-additem-confirm")}</div>`:""}
   ${btn("item-close","Close","ghost sm")}</div>`;
}

function renderModal(){
  const m = U.modal; if(!m) return "";
  const wrap = (title, body, foot, wide) => `<div class="fp-ov" role="dialog" aria-modal="true" aria-label="${E(title)}"><div class="fp-md ${wide?"wide":""}"><div class="fp-mh"><h2>${E(title)}</h2><button class="fp-x" data-a="modal-close" aria-label="Close">${ic("x",18)}</button></div><div class="fp-mb">${body}</div><div class="fp-mf">${foot}</div></div></div>`;
  const k = m.kind;
  if(k==="cust"){
    const title = m.id ? "Edit Customer" : "Create Customer";
    const ty = fv("m.type","Residential");
    const seg = `<div class="fp-seg2" role="group" aria-label="Account Type" data-hk="f-type">${["Residential","Commercial"].map(t=>`<button type="button" class="${ty===t?"on":""}" data-a="set-f" data-f2="m.type" data-v="${t}">${ic(t==="Residential"?"user":"building",15)} ${t}</button>`).join("")}</div>`;
    const users = [["",""]].concat(Object.keys(W.users).filter(u=>W.users[u].st==="Activated").map(u=>[u,uname(W,u)]));
    return `<div class="fp-ov fp-pg" role="dialog" aria-modal="true" aria-label="${title}"><div class="fp-page">
     <div class="fp-pgh"><button class="fp-pgb" data-a="modal-close" aria-label="Back">${ic("left",16)}</button><b>${title}</b></div>
     <div class="fp-pgt">${["Info","Related Customers","Comments","Projects","Jobs","Estimates","Invoices","Files","Forms","Recurring","Purchase Orders"].map((t,i)=>`<span class="${i?"":"on"}">${t}</span>`).join("")}</div>
     <div class="fp-pgb2"><h2 class="fp-pgh2">${m.id?"Edit customer":"Create a new customer"}</h2>${btn("cust-save",`${ic("check",15)} Save Customer`,"green","","btn-savecust")}</div>
     <div class="fp-pgbody">
      <section class="fp-pgc"><h3>General</h3><div class="fp-grid2">
       ${fld("Status", sel("m.st",CUST_STATUSES,fv("m.st","Current Customer"),'data-hk="f-status"'))}
       ${fld("Account Type", seg)}
       ${fld("Assigned To", sel("m.asg",users,fv("m.asg","")))}
       ${fld("Lead Source", sel("m.ls",[["",""]].concat(LEAD_SOURCES),fv("m.ls",""),'data-hk="f-ls"'))}
       ${fld("Pipeline Status", sel("m.pipe",[["","No pipeline statuses set up"]],fv("m.pipe","")))}
       <div></div>
       ${fld("Price Tier", sel("m.tier",[["","No price tiers set up"]],fv("m.tier","")))}
       <div class="fp-swrow">${chk("m.tax",fv("m.tax",false),"Tax Exempt",'data-hk="f-tax" class="fp-sw"')}</div></div></section>
      <section class="fp-pgc"><h3>Primary Contact</h3><div class="fp-grid2">
       ${fld("Company Name",inp("m.company",fv("m.company","")))}${fld("Display Name",inp("m.display",fv("m.display",""),'placeholder="Fills in from the name"'),true)}
       ${fld("First Name",inp("m.first",fv("m.first",""),'data-hk="f-first"'),true)}${fld("Last Name",inp("m.last",fv("m.last","")))}
       ${fld("Email",inp("m.email",fv("m.email","")))}${fld("Phone",inp("m.phone",fv("m.phone",""),'data-hk="f-phone"'))}
       ${fld("Alternate Email",inp("m.email2",fv("m.email2","")))}${fld("Alternate Phone",inp("m.phone2",fv("m.phone2","")))}</div>
       ${m.id?`<div class="fp-rowr">${btn("cust-edit-contact",`${ic("plus",13)} Additional Contact`,"ghost sm",`data-v="${m.id}"`,"btn-edit-addcontact")}</div>`:`<div class="fp-rowr"><button class="lnk" data-a="na-tab" data-v="Additional Contact (save the customer first)">${ic("plus",13)} Additional Contact</button></div>`}</section>
      <section class="fp-pgc"><h3>Address</h3><div class="fp-grid2">
       ${fld("Address Line 1",inp("m.addr",fv("m.addr",""),'data-hk="f-addr"'))}${fld("Address Line 2",inp("m.addr2",fv("m.addr2","")))}</div><div class="fp-grid3">
       ${fld("City",inp("m.city",fv("m.city","")))}${fld("State",inp("m.state",fv("m.state","")))}${fld("Zip Code",inp("m.zip",fv("m.zip","")))}</div>
       ${m.id?`<div class="fp-rowr">${btn("cust-edit-loc",`${ic("plus",13)} Additional Location`,"ghost sm",`data-v="${m.id}"`,"btn-edit-addloc")}</div>`:`<div class="fp-rowr"><button class="lnk" data-a="na-tab" data-v="Additional Location (save the customer first)">${ic("plus",13)} Additional Location</button></div>`}</section>
      <section class="fp-pgc"><h3>Billing</h3><div class="fp-swrow r">${chk("m.sepbill",fv("m.sepbill",false),"Use Separate Billing Address",'data-ch="redraw" class="fp-sw"')}</div>${fv("m.sepbill",false)?fld("Billing Address",inp("m.baddr",fv("m.baddr",""))):""}</section>
      <section class="fp-pgc"><h3>Tags</h3>${fld("Add Tags", tagBox("m.tags", fv("m.tags",[]), CUST_TAGS, true))}</section>
      <section class="fp-pgc"><h3>Estimate &amp; Invoice Due Dates</h3><div class="fp-grid2">${fld("Default Estimate Net Expiration Date (Days)",inp("m.estdays",fv("m.estdays",""),'inputmode="numeric"'))}${fld("Default Invoice Net Due Date (Days)",inp("m.invdays",fv("m.invdays",""),'inputmode="numeric"'))}</div></section>
      <section class="fp-pgc"><h3>Additional Fields</h3><div class="fp-grid2">${fld("Team", sel("m.team",[["",""]].concat(CUST_TEAMS),fv("m.team","")))}${fld("Blanket PO#",inp("m.bpo",fv("m.bpo","")))}${fld("Service Requested",inp("m.svc",fv("m.svc","")))}</div></section>
      <section class="fp-pgc"><h3>Notes</h3>${fld("Job Notes",`<textarea data-f="m.jobNotes" rows="3" data-hk="f-jobnotes">${E(fv("m.jobNotes",""))}</textarea>`)}<p class="muted fp-small">Job Notes show on every job for this customer.</p></section>
      <div class="fp-pgend">${btn("cust-save",`${ic("check",15)} Save Customer`,"green")}</div>
     </div></div></div>`;
  }
  if(k==="sendcomm"){
    const c = m.k==="job" ? W.jobs[m.id].c : m.id, ch = fv("m.cch","Email"), t = fv("m.ctpl","");
    if(!t){
      const q = (fv("m.ctq","")||"").toLowerCase();
      const L = ["Empty Form (No Template)"].concat(COMM_TPLS).filter(x=>!q || x.toLowerCase().includes(q));
      return `<div class="fp-ov" role="dialog" aria-modal="true" aria-label="Select a Template"><div class="fp-md"><div class="fp-mh"><h2>Select an ${ch==="SMS"?"SMS":"Email"} Template ${ic("gear2",15)}</h2><button class="fp-x" data-a="modal-close" aria-label="Close">${ic("x",18)}</button></div><div class="fp-mb">
       <div class="fp-ltabs">${["Email","SMS"].map(x=>`<button class="${ch===x?"on":""}" data-a="set-f" data-f2="m.cch" data-v="${x}" data-hk="ctab-${x}">${x}</button>`).join("")}</div>
       <div class="fp-search">${ic("search",15)}<input data-f="m.ctq" data-in="redraw" value="${E(fv("m.ctq",""))}" placeholder="Search..." aria-label="Search templates"></div>
       <div class="fp-tpllist">${L.map(x=>`<button data-a="set-f" data-f2="m.ctpl" data-v="${E(x)}" data-hk="ct-${E(x)}">${E(ch==="SMS"&&x!=="Empty Form (No Template)"?x+" - SMS":x)}</button>`).join("")}</div></div></div></div>`;
    }
    const tn = t==="Empty Form (No Template)" ? "" : t;
    return wrap(`${ch==="SMS"?"Send SMS":"Send Email"}`, `<p class="fp-small"><button class="lnk" data-a="set-f" data-f2="m.ctpl" data-v="">${ic("left",12)} Pick another template</button></p>
      ${fld("To", `<input readonly value="${E(ch==="SMS"?(W.cust[c].phone||""):(W.cust[c].email||""))}" aria-label="To">`)}
      ${ch==="Email"?fld("Subject", inp("m.csubj", fv("m.csubj", tn ? tn+(m.k==="job"?" #"+m.id:"") : ""))):""}
      ${fld(ch==="SMS"?"Message":"Body", `<textarea data-f="m.cbody" rows="4">${E(fv("m.cbody", tn ? "Hi "+(W.cust[c].first||"")+", this is "+COMPANY+". "+(/confirm/i.test(tn)?"Your appointment is booked. We'll see you then.":"Please see the details.") : ""))}</textarea>`)}
      ${m.err?`<p class="bad">${E(m.err)}</p>`:""}`, btn("modal-close","Cancel","ghost")+btn("comm-send","Send","green","","btn-commsend"));
  }
  if(k==="contact") return wrap("Additional Contact", fld("Name",inp("m.cname",fv("m.cname",""),'data-hk="f-cname"'))+fld("Email",inp("m.cemail",fv("m.cemail","")))+fld("Phone",inp("m.cphone",fv("m.cphone","")))+fld("Notes",inp("m.cnotes",fv("m.cnotes",""))), btn("modal-close","Cancel","ghost")+btn("contact-save","Save New Contact","green","","btn-savecontact"));
  if(k==="loc"){ const c = W.cust[m.id]; return wrap("Additional Location", fld("Address",inp("m.laddr",fv("m.laddr",""),'data-hk="f-laddr"'))+fld("Location Name",inp("m.lname",fv("m.lname",""),'data-hk="f-lname"'))+fld("Related Contacts", sel("m.lrel",[["",""],`${c.first} ${c.company?"":c.last}`.trim()].concat(c.contacts.map(x=>x.name)),fv("m.lrel",""),'data-hk="f-lrel"')), btn("modal-close","Cancel","ghost")+btn("loc-save","Save New Location","green","","btn-saveloc")); }
  if(k==="card") return wrap("Add New Payment Method", `<div class="fp-seg">${["Card","Bank Account"].map(t=>`<button class="${fv("m.ptype","Card")===t?"on":""}" data-a="ptype" data-v="${t}">${t}</button>`).join("")}</div>
     ${fv("m.ptype","Card")==="Card"?fld("Card number",inp("m.cnum",fv("m.cnum",""),'inputmode="numeric" placeholder="Practice: type 4242 4242 4242 4242" data-hk="f-cnum"'))+`<div class="fp-grid2">${fld("Expiry",inp("m.cexp",fv("m.cexp",""),'placeholder="MM/YY"'))}${fld("CVC",inp("m.ccvc",fv("m.ccvc",""),'inputmode="numeric"'))}</div>`:`<p class="muted">Bank account (ACH) is not turned on for this company.</p>`}
     ${chk("m.consent",fv("m.consent",false),"I confirm that I have obtained consent to store this payment information.",'data-hk="f-consent"')}
     ${m.err?`<p class="bad">${E(m.err)}</p>`:""}<p class="muted fp-small">Practice copy: never type a real card number here or anywhere in notes.</p>`, btn("modal-close","Cancel","ghost")+btn("card-save","Save Payment Method","green","","btn-savecard"));
  if(k==="merge"){
    const q = (fv("m.mq","")||"").trim().toLowerCase(), c1 = m.id;
    const res = q ? Object.keys(W.cust).filter(id => id!==c1 && (cname(W,id).toLowerCase().includes(q) || W.cust[id].phone.replace(/\D/g,"").includes(q.replace(/\D/g,"")||"zz"))) : [];
    const c2 = fv("m.m2","");
    const col = id => { const c = W.cust[id]; return c ? `<b>${E(cname(W,id))}</b><br>${E(c.phone)}<br>${E(c.addr)}, ${E(c.city)}<br>Lead source: ${E(c.ls||"-")}<br>Jobs: ${Object.values(W.jobs).filter(j=>j.c===id).length}` : '<span class="muted">Search for a customer</span>'; };
    return wrap("Merge Customers", `<div class="fp-merge"><div><h4>Customer 1</h4>${col(c1)}</div>
      <div><h4>New customer</h4><p class="muted">Use source properties from:</p>${["Customer 1","Customer 2"].map((o,i)=>`<label class="fp-chk"><input type="radio" name="msrc" data-f="m.src" value="${i+1}" ${fv("m.src","1")===String(i+1)?"checked":""}> ${o}</label>`).join("")}</div>
      <div><h4>Customer 2</h4>${inp("m.mq",fv("m.mq",""),'data-in="mergeq" placeholder="Search customers" aria-label="Search customer 2" data-hk="f-merge-search"')}
        ${res.slice(0,6).map(id=>`<button class="fp-pick ${c2===id?"on":""}" data-a="merge-pick" data-v="${id}" data-hk="mp-${id}">${E(cname(W,id))} <small>${E(W.cust[id].phone)}</small></button>`).join("")}<div>${c2?col(c2):""}</div></div></div>`,
      btn("modal-close","Close","ghost")+btn("merge-save","Save Customers","green","","btn-mergesave"), true);
  }
  if(k==="job"){
    const cm = fv("m.cmode", "existing"), cid = fv("m.cust",""), cu = W.cust[cid];
    const _len = (+fv("m.e","")-+fv("m.s",""))>0 ? (+fv("m.e","")-+fv("m.s","")) : 2;
    const slots = m.slots ? `<div class="fp-slots" data-hk="slots"><b>Open times</b>${m.slots.map((s,i)=>`<button data-a="slot-pick" data-v="${i}" data-hk="slot-${i}">${dlab(s.d)} ${fmtH(s.s)} - ${fmtH(s.e)} · ${E(uname(W,s.u))} <u>Select</u></button>`).join("")}</div>` : (m.avail ? `<div class="fp-slots" data-hk="avail-panel"><b>Find Availability</b><span class="muted">Time Slot Duration: ${_len} hour${_len===1?"":"s"} · Skill tags and team come from the template</span><button class="fp-btn green" data-a="suggest-times" data-hk="btn-suggest">Suggest Times</button></div>` : "");
    const cc = fv("m.cc","");
    const title = m.id ? "Update Job" : "Create Job";
    const custBlock = (cm==="existing"||m.id) ?
      `<div class="fp-grid2">${fld("Customer Name", sel("m.cust",[["",""]].concat(custOptions()),cid,'data-hk="f-cust" data-ch="job-cust"'),true)}${fld("Location", `<div class="fp-ro">${cu?E((cu.addr||"")+(cu.city?", "+cu.city:"")):'<span class="muted">Pick a customer</span>'}</div>`)}
        ${fld("Contact", `<div class="fp-ro">${cu?E(cname(W,cid)):""}</div>`)}<div>${m.id?"":`<button class="lnk g" data-a="job-cmode" data-v="new" data-hk="cmode-new">${ic("plus",13)} Create New Customer</button>`}</div></div>` :
      `<p><button class="lnk" data-a="job-cmode" data-v="existing" data-hk="cmode-existing">Pick a saved customer instead</button></p><div class="fp-grid2">${fld("First Name",inp("m.nfirst",fv("m.nfirst",""),'data-hk="f-nfirst"'),true)}${fld("Last Name",inp("m.nlast",fv("m.nlast","")))}${fld("Phone",inp("m.nphone",fv("m.nphone","")))}${fld("Email",inp("m.nemail",fv("m.nemail","")))}${fld("Service Address",inp("m.naddr",fv("m.naddr","")))}${fld("Account Type",sel("m.ntype",["Residential","Commercial"],fv("m.ntype","Residential")))}${fld("Lead Source",sel("m.nls",[["",""]].concat(LEAD_SOURCES),fv("m.nls",""),'data-hk="f-nls"'))}</div>`;
    return `<div class="fp-ov fp-pg" role="dialog" aria-modal="true" aria-label="${title}"><div class="fp-page">
     <div class="fp-pgh"><button class="fp-pgb" data-a="modal-close" aria-label="Back">${ic("left",16)}</button><b>${title}</b></div>
     <div class="fp-pgt">${["Info","Comments","Subtasks","Estimates","Invoices","Files","Timesheets","Forms","Purchase Orders"].map((t,i)=>`<span class="${i?"":"on"}">${t}</span>`).join("")}</div>
     <div class="fp-pgb2"><div class="fp-pgl">${m.id?"":`<label class="fp-imp">${ic("sales",15)} Import Template ${sel("m.tpl",[["",""]].concat(W.templates),fv("m.tpl",""),'data-ch="job-tpl" data-hk="f-tpl" aria-label="Import Template"')}</label><button class="lnk" data-a="na-tab">Create recurring job</button><button class="lnk" data-a="na-tab">Create recurring task</button><button class="lnk" data-a="na-tab">Create Task</button><button class="lnk" data-a="na-tab">Create Template</button>`}</div>${btn("job-save",`${ic("check",15)} Save Job`,"blue","","btn-savejob")}</div>
     <div class="fp-pgbody">
      <section class="fp-pgc"><h3>General</h3>${custBlock}
       <div class="fp-grid2">${fld("Job Title/Description", inp("m.title",fv("m.title",""),'data-hk="f-title"'),true)}${fld("Job Subtitle", inp("m.sub",fv("m.sub",""),'placeholder="Enter short notes"'))}</div>
       <div class="fp-grid2"><div class="fp-fld"><label>Assigned Users To Job <button class="lnk sm" data-a="find-avail">${ic("cal",13)} Find Availability</button></label>${userChecks("m.u.", pickedUsers("m.u."), 'data-ch="pick-user"')}</div><div class="fp-fld"><label>Job Tags</label>${tagBox("m.tags", fv("m.tags",[]), JOB_TAGS, true)}</div></div>
       <div class="fp-grid2">${fld("Status Workflow", sel("m.wf",["Default Workflow"],"Default Workflow"))}${fld("Status Action Flow", sel("m.af",[""],""))}</div>
      </section>
      <section class="fp-pgc"><h3>Dates</h3>
       <div class="fp-drow">${fld("Date", sel("m.date",dayOpts(),fv("m.date",""),'data-hk="f-date"'))}${fld("Start Time", sel("m.s",hrOpts(),fv("m.s",""),'data-hk="f-start" data-ch="job-start"'))}${fld("End Time", sel("m.e",hrOpts(),fv("m.e",""),'data-hk="f-end"'))}
        <div class="fp-dact"><button class="lnk" data-a="job-cleardates">${ic("x",13)} Clear Dates</button><button class="lnk" data-a="find-avail" data-hk="btn-findavail">${ic("cal",13)} Find Availability</button><button class="lnk" data-a="na-tab">${ic("pin",13)} Find By Map</button><button class="lnk" data-a="check-conflict" data-hk="btn-checkconf">${ic("info",13)} Check scheduling conflicts</button>${cc?`<small class="ok">${E(cc)}</small>`:""}</div></div>${slots}
       <div class="fp-drow fp-win" data-hk="f-win">${fld("Customer Arrival Window", `<div class="fp-ro">${fv("m.date","")?dlab(fv("m.date","")):"No date"}</div>`)}${fld("Start Time", sel("m.ws",whrOpts(),fv("m.ws",""),'data-hk="f-win-start" aria-label="Arrival window start"'))}${fld("End Time", sel("m.we",whrOpts(),fv("m.we",""),'data-hk="f-win-end" aria-label="Arrival window end"'))}
        <div class="fp-dact"><button class="lnk" data-a="win-clear">${ic("x",13)} Clear Dates</button><button class="lnk" data-a="win-insert" data-hk="btn-win-insert">${ic("wrench",13)} Insert Job Date/Time</button></div></div>
      </section>
      <section class="fp-pgc"><h3>Source</h3><button class="fp-btn wt2" data-a="na-tab">${ic("plus",13)} Link Engage Call to Record</button></section>
      <section class="fp-pgc"><h3>Additional Fields</h3><div class="fp-grid2">${JOB_CF.map(([k,l,t])=>fld(l, t==="text" ? inp("m.cf."+k,fv("m.cf."+k,"")) : t==="bool" ? sel("m.cf."+k,["False","True"],fv("m.cf."+k,"False")) : sel("m.cf."+k,t,fv("m.cf."+k,t[0])))).join("")}</div></section>
      <section class="fp-pgc"><h3>Notes and Files</h3><div class="fp-grid2">${fld("Notes", `<textarea data-f="m.notes" rows="3" data-hk="f-notes" placeholder="Sample Notes">${E(fv("m.notes",""))}</textarea>`)}${fld("Field Notes", `<textarea data-f="m.fnotes" rows="3">${E(fv("m.fnotes",""))}</textarea>`)}</div></section>
     </div></div></div>`;
  }
  if(k==="confirm-send") return wrap("Send confirmation?", `<p>This company's Automatic Triggers send a confirmation when a job is created. They are set to <b>Prompts Confirmation Prior to Sending</b>.</p><p>Send the Job New Appointment Confirmation to <b>${E(cname(W,W.jobs[m.id].c))}</b> by text and email?</p>${W.jobs[m.id].win?`<p class="fp-small">Arrival window in the message: <b>${E(W.jobs[m.id].win)}</b></p>`:""}`, btn("conf-no","Don't Send","ghost","","btn-conf-no")+btn("conf-yes","Send","green","","btn-conf-yes"));
  if(k==="conflict") return wrap("Scheduling Conflicts", `<p>There are scheduling conflicts with current assigned team member for selected date.</p><p class="warn">${E(m.msg)}</p>`, btn("conflict-back","Close","ghost","","btn-conflict-back"));
  if(k==="visit") return wrap("Add Site Visit", fld("Site visit name",inp("m.vname",fv("m.vname",""),'data-hk="f-vname"'))+`<div class="fp-grid3">${fld("Date", sel("m.date",dayOpts(),fv("m.date",""),'data-hk="f-date"'))}${fld("Start Time", sel("m.s",hrOpts(),fv("m.s",""),'data-hk="f-start" data-ch="job-start"'))}${fld("End Time", sel("m.e",hrOpts(),fv("m.e",""),'data-hk="f-end"'))}</div><h4>Team members</h4>${userChecks("m.u.", pickedUsers("m.u."), 'data-ch="pick-user"')}`+`<div class="fp-grid3 fp-win" data-hk="f-win"><div class="fp-wl"><b>Customer Arrival Window</b><small>What the customer is told</small></div>${fld("Start", sel("m.ws",whrOpts(),fv("m.ws",""),'aria-label="Arrival window start"'))}${fld("End", sel("m.we",whrOpts(),fv("m.we",""),'aria-label="Arrival window end"'))}</div>${btn("win-insert","Insert Site Visit Date/Time","ghost sm")}`+fld("Notes", inp("m.notes",fv("m.notes","")))+fld("Field Notes", inp("m.fnotes",fv("m.fnotes",""))), btn("modal-close","Cancel","ghost")+btn("visit-save","Save","green","","btn-savevisit"), true);
  if(k==="series") return wrap("Create New Series", fld("Series name", inp("m.sname",fv("m.sname",""),'data-hk="f-sname"'))+`<div class="fp-row">${sel("m.stpl",Object.keys(SUBTASK_TEMPLATES),fv("m.stpl","Closeout checklist"),'aria-label="Subtask template" data-hk="f-stpl"')}${btn("series-insert","+ Insert Template","ghost","","btn-inserttpl")}</div>
    ${(m.items||[]).length?`<ul>${m.items.map(x=>`<li>${E(x)}</li>`).join("")}</ul>`:'<p class="muted">No subtasks yet.</p>'}${chk("m.sreq",fv("m.sreq",false),"Subtask Required",'data-hk="f-sreq"')}`, btn("modal-close","Cancel","ghost")+btn("series-save","Submit","green","","btn-seriessubmit"));
  if(k==="sched") { const j = W.jobs[m.id]; const len = (j.s!=null&&j.e!=null)?(j.e-j.s):2; return wrap("Schedule job", `<p>Are you sure you want to schedule the job for the following date/time and team members?</p><div class="fp-two plain">${kv([["Start",`<b>${dlab(U.schedDay)}, ${fmtH(m.h)}</b>`],["End",`<b>${dlab(U.schedDay)}, ${fmtH(m.h+len)}</b>`],["Team Members",`<b>${E(uname(W,m.u))}</b>`]])}</div>`, btn("modal-close","No","ghost")+btn("sched-yes","Yes","green","","btn-sched-yes")); }
  if(k==="est"){
    const o = m.opts[m.oi] || m.opts[0];
    return wrap(m.id?`Edit Estimate #${m.id}`:"Create Estimate", `
     ${m.id||m.job?"":fld("Customer", sel("m.cust",[["",""]].concat(custOptions()),fv("m.cust",""),'data-hk="f-estcust"'))}
     ${m.job?`<p>Job <b>#${m.job}</b> · ${E(cname(W,W.jobs[m.job].c))}</p>`:""}
     <div class="fp-grid2">${fld("Title", inp("m.title",fv("m.title",""),'data-hk="f-esttitle"'))}${fld("Expiration Date", sel("m.exp",[["12-04","Dec 4, 2026"],["11-19","Nov 19, 2026"],["01-04","Jan 4, 2027"]],fv("m.exp","12-04")))}</div>
     <div class="fp-otabs">${m.opts.map((x,i)=>i===m.oi?`<button class="on" data-a="opt-ren" data-hk="btn-optrename" title="Click the name to rename this option">${E(x.name)} ${ic("edit",11)}</button>`:`<button data-a="opt-sel" data-v="${i}" data-hk="opt-${i}">${E(x.name)}</button>`).join("")}${btn("opt-add","+ Add Estimate Option","link","","btn-addoption")}</div>
     ${m.ren?`<div class="fp-row">${inp("m.oname",fv("m.oname",o.name),'aria-label="Option name" data-hk="f-oname"')}${btn("opt-apply","Apply","blue sm","","btn-optapply")}</div>`:""}
     <table class="fp-t sm"><tbody>${o.items.map((x,i)=>`<tr><td>${E(x.n)}</td><td>${x.q}</td><td>${money(x.p*x.q)}</td><td><button class="lnk" data-a="opt-rmitem" data-v="${i}">Remove</button></td></tr>`).join("")||'<tr><td class="muted">No items yet.</td></tr>'}</tbody></table>
     ${m.pick==="opt"?itemPicker("Add to Estimate"):btn("item-open","Add Item","blue sm",'data-v="opt"',"btn-additem")}
     <h4>Add-On Options</h4>${m.addons?`<table class="fp-t sm"><tbody>${m.addons.map(x=>`<tr><td>${E(x.n)}</td><td>${money(x.p)}</td></tr>`).join("")||'<tr><td class="muted">No add-ons yet.</td></tr>'}</tbody></table>${m.pick==="addon"?itemPicker("Add to Estimate"):btn("item-open","Add Item","ghost sm",'data-v="addon"')}`:btn("addon-create","Create Add-On Options","ghost sm")}
     ${fld("Estimate Notes (customer sees)", `<textarea data-f="m.notes" rows="2">${E(fv("m.notes",""))}</textarea>`)}${fld("Internal Notes", `<textarea data-f="m.inotes" rows="2">${E(fv("m.inotes",""))}</textarea>`)}`,
     btn("modal-close","Cancel","ghost")+btn("est-save","Save Estimate","green","","btn-saveest"), true);
  }
  if(k==="inv") return wrap(m.id?`Edit Invoice #${m.id}`:`Create Invoice (Job #${m.job})`, `
     <table class="fp-t sm"><tbody>${m.items.map((x,i)=>`<tr><td>${E(x.n)}</td><td>${x.q}</td><td>${money(x.p*x.q)}</td><td><button class="lnk" data-a="inv-rmitem" data-v="${i}">Remove</button></td></tr>`).join("")||'<tr><td class="muted">No items yet.</td></tr>'}</tbody></table>
     ${m.pick?itemPicker("Add to Invoice"):`<div class="fp-row">${btn("item-open","Add Item","blue sm",'data-v="inv"',"btn-additem")}${btn("item-open","Pricebook","ghost sm",'data-v="inv"')}</div>`}
     ${fld("Due Date", sel("m.due",[["","Upon receipt"],["11-04","Nov 4, 2026"],["11-19","Nov 19, 2026"],["12-04","Dec 4, 2026"]],fv("m.due",""),'data-hk="f-due"'))}
     ${fld("Invoice Notes (customer sees)", `<textarea data-f="m.notes" rows="2" data-hk="f-invnotes">${E(fv("m.notes",""))}</textarea>`)}${fld("Internal Notes", `<textarea data-f="m.inotes" rows="2">${E(fv("m.inotes",""))}</textarea>`)}`,
     btn("modal-close","Cancel","ghost")+btn("inv-save","Save Invoice","green","","btn-saveinv"), true);
  if(k==="markpay"||k==="takepay"){
    const id = m.id, i = W.inv[id];
    const L = [["pay-take","Take Payment","card","t-bl","m-takepay"],["pay-req","Request Payment","mail","t-gr","m-reqpay"],["pay-mark","Mark Payment","file","t-pu","m-markpay"]];
    const left = `<div class="pl">${L.map(([a,l,icn,t,hk])=>`<button class="${(a==="pay-take"&&k==="takepay")||(a==="pay-mark"&&k==="markpay")?"on":""}" data-a="${a}" data-v="${id}" data-hk="${hk}"><i class="fp-ico sm ${t}">${ic(icn,12)}</i>${l}</button>`).join("")}</div>`;
    let title, body, foot;
    if(k==="markpay"){
      const meth = fv("m.method","");
      title = "Mark Payment";
      body = fld("Method", `<div class="fp-segm" role="group" aria-label="Method" data-hk="f-method">${PAY_METHODS.map(x=>`<button class="${meth===x?"on":""}" data-a="pm-method" data-v="${x}" data-hk="pm-${x}">${x}</button>`).join("")}</div>`)
        + `<div class="fp-grid2">${fld("Amount", inp("m.amt",fv("m.amt",""),'inputmode="decimal" data-hk="f-amt"'), true)}${fld("Date", `<div class="fp-date">${sel("m.pdate",PDAYS.slice(0,3).map(d=>[d.k,d.lab]),fv("m.pdate",TODAY))}${ic("cal",16)}</div>`)}</div>`
        + fld("Notes", `<textarea data-f="m.pnote" rows="4" data-hk="f-pnote">${E(fv("m.pnote",""))}</textarea>`);
      foot = `<button class="fp-btn txt" data-a="modal-close">Cancel</button>${btn("markpay-save","Save",meth?"blue wide":"wide dis","","btn-savepay")}`;
    } else {
      title = "FieldPulse Payment";
      body = fld("Amount ($)", `<input value="${money(invDue(i)).replace("$","").replace(/,/g,"")}" readonly aria-label="Amount">`, true)
        + `<div class="fp-cardf" aria-hidden="true"><span>Card number</span><span>MM / YY</span><span>CVC</span></div>`
        + fld("Notes", `<textarea rows="3" readonly></textarea>`)
        + `<p class="muted fp-small">This runs a credit card through FieldPulse Payments for <b>${money(invDue(i))}</b>. Use Mark Payment for cash or a check.</p>`;
      foot = `<span class="fp-tog" aria-hidden="true"><i></i>Save Payment Method</span><span class="sp"></span><button class="fp-btn txt" data-a="modal-close">Cancel</button>${btn("takepay-run","Charge Card","blue wide")}`;
    }
    return `<div class="fp-ov pp" role="dialog" aria-modal="true" aria-label="Payment"><div class="fp-pp">${left}<div class="pr"><div class="ph"><h2>${title}</h2><button class="fp-x" data-a="modal-close" aria-label="Close">${ic("x",18)}</button></div><div class="pb">${body}</div><div class="pf">${foot}</div></div></div></div>`;
  }
  if(k==="payedit"){ const i = W.inv[m.inv], p = i.pays.find(x=>x.id===m.p); const left = p.amt - p.refunds.reduce((a,r)=>a+r.amt,0);
    return wrap("Edit Payment", `<dl class="fp-kv"><dt>Method</dt><dd>${E(p.method)}${p.fp?" (FieldPulse Payments)":""}</dd><dt>Amount</dt><dd>${money(p.amt)}</dd><dt>Date</dt><dd>${dlab(p.date)}</dd><dt>Notes</dt><dd>${E(p.note||"-")}</dd>${p.refunds.length?`<dt>Refunded</dt><dd>${money(p.amt-left)}</dd>`:""}</dl>`,
      (p.fp && left>0 ? btn("refund-open","Refund","ghost",`data-v="${m.inv}" data-p="${m.p}"`,"btn-refund") : "") + btn("modal-close","Cancel","ghost") + btn("modal-close","Save","green")); }
  if(k==="refund") return wrap("Refund Payin", fld("Refund amount", inp("m.ramt",fv("m.ramt",""),'inputmode="decimal" data-hk="f-ramt"'))+fld("Reason", sel("m.rreason",["","Duplicate","Requested by customer","Fraudulent","Other"],fv("m.rreason",""),'data-hk="f-rreason"'))+`<p class="muted fp-small">The refund shows as its own line under the payment.</p>`, btn("modal-close","Cancel","ghost")+btn("refund-save","Refund","green","","btn-refund-confirm"));
  if(k==="progress"){ const pm=fv("m.pmode","Set Amount"); return wrap("Send Progress Invoice", `<p>Invoice #${m.id} total ${money(invTotal(W.inv[m.id]))}</p>`+fld("Amount Due Displayed", sel("m.pmode",["Remaining Balance","Set Amount","Percentage Of Total"],pm,'data-hk="f-pmode"'))+(pm==="Remaining Balance"?"":fld(pm==="Set Amount"?"Amount Due":"Percentage of Total Amount", inp("m.pval",fv("m.pval",""),'inputmode="decimal" data-hk="f-pval"'))), btn("modal-close","Cancel","ghost")+btn("prog-save","Save","green",'data-v="next"',"btn-prog-save")); }
  if(k==="progpdf") return wrap("Progress Invoice PDF", `<div class="fp-card pad"><p><b>Invoice #${m.id}</b> &middot; ${E(m.label)}</p><p>Amount due now: <b>${money(m.amt)}</b>${m.pct!=null?` (${m.pct}% of ${money(invTotal(W.inv[m.id]))})`:""}</p><p class="muted">PDF Display Options</p></div>`, btn("modal-close","Discard","ghost")+btn("prog-send","Save","ghost",'data-v="save"',"btn-prog-pdfsave")+btn("prog-send","Email To Customer","green",'data-v="email"',"btn-prog-email"));
  if(k==="reminder") return wrap("Set a Reminder", fld("Remind me on", sel("m.rdate",PDAYS.slice(3).map(d=>[d.k,d.lab]),fv("m.rdate","11-05"),'data-hk="f-rdate"'))+fld("Reminder Title", inp("m.rnote",fv("m.rnote",""))), btn("modal-close","Cancel","ghost")+btn("rem-save","Submit","green","","btn-saverem"));
  if(k==="convert") return wrap("Convert to Invoice", `<p>Convert estimate #${m.id} to an invoice?</p><p class="muted">Company setting "Keep an Estimate Record when Converting to an Invoice" is <b>Yes</b>, so the estimate stays.</p>`, btn("modal-close","Cancel","ghost")+btn("convert-yes","Convert","green"));
  if(k==="po") return wrap("Create Purchase Order", fld("Vendor", sel("m.vendor",VENDORS,fv("m.vendor",VENDORS[0])))+fld("Job", inp("m.pjob",fv("m.pjob",m.job||"")))+fld("Note", inp("m.pnote",fv("m.pnote",""),'data-hk="f-ponote"'))+fld("Total", inp("m.ptotal",fv("m.ptotal",""),'inputmode="decimal"')), btn("modal-close","Cancel","ghost")+btn("po-save","Create","green"));
  if(k==="user"){ const x = W.users[m.id];
    return wrap("Edit Team Member", `<h4>Basic Information</h4><p><b>${E(x.name)}</b></p><h4>Roles and Team Assignment</h4><p>Role: ${E(x.role)}${x.admin?" · Assign as Company Admin: On":""}</p><details><summary>User Feature Permissions</summary><p class="muted fp-small">Ability to Make FieldPulse Payments · Ability to Make FieldPulse Refunds · Hide Unit Cost · Job visibility · Reporting access (read only in practice)</p></details>
      <h4>User Account Administration</h4>${fld("User Status", sel("m.ust",["Activated","Deactivated"],fv("m.ust",x.st),'data-hk="f-ustatus"'))}`, btn("modal-close","Cancel","ghost")+btn("user-save","Save","green","","btn-saveuser")); }
  if(k==="timelog"){ const t = W.ts.find(x=>x.id===m.id);
    return wrap("Time Log", `<p>Duration <b>${hm(tsDur(t))}</b> ${t.co==null?'<span class="warn">(still clocked in)</span>':""}</p>
      <h4>Clock In</h4><div class="fp-grid2">${fld("Date", sel("m.cid",[[t.date,dlab(t.date)]],t.date))}${fld("Time", sel("m.cit",hrOpts().slice(1),fv("m.cit",String(t.ci))))}</div>
      <h4>Clock Out</h4><div class="fp-grid2">${fld("Date", sel("m.cod",PDAYS.slice(0,3).map(d=>[d.k,d.lab]),fv("m.cod",t.co==null?TODAY:t.date),'data-hk="f-cod"'))}${fld("Time", sel("m.cot",hrOpts().slice(1).concat([["14.25","2:15 PM (now)"]]),fv("m.cot",t.co==null?"14.25":String(t.co%24)),'data-hk="f-cot"'))}</div>
      ${fld("Notes", inp("m.tnotes",fv("m.tnotes","")))}`, btn("ts-delete","Delete","danger","","btn-ts-delete")+`<span style="flex:1"></span>`+btn("modal-close","Cancel","ghost")+btn("ts-save","Save","green","","btn-ts-save")); }
  if(k==="repsave") return wrap(m.widget?"Save Report as Widget":"Save Report as New", fld(m.widget?"Widget title":"Report name", inp("m.rname",fv("m.rname",""),'data-hk="f-rname"')), btn("modal-close","Cancel","ghost")+btn("repsave-yes",m.widget?"Save Widget":"Save Report","green","","btn-repsave-yes"));
  if(k==="quick") return wrap("Quick Reports", fld("Primary field", sel("m.qf",["Conversion Rate","Count","Total"],fv("m.qf","Count"),'data-hk="f-qf"'))+fld("Group by", sel("m.qb",["Estimate Creator","Status","Customer"],fv("m.qb","Status"),'data-hk="f-qb"')), btn("modal-close","Cancel","ghost")+btn("quick-yes","Configure Pivot Table","green","","btn-pivot"));
  if(k==="dash"){
    const widgets = W.reports.filter(r=>r.widget).map(r=>r.name);
    return wrap("Configure Dashboard", W.dash.map((w,i)=>`<div class="fp-grid2">${fld(`Widget ${i+1} Type`, sel(`m.w${i}t`,["Default","Custom"],fv(`m.w${i}t`,w.type),`data-ch="redraw" data-hk="f-w${i}t"`))}${fld("Widget", sel(`m.w${i}`, fv(`m.w${i}t`,w.type)==="Custom"?[["",""]].concat(widgets):["Jobs Completed","New Estimates","Payments Collected","New Customers","Open Jobs"], fv(`m.w${i}`,w.w), `data-hk="f-w${i}"`))}</div>`).join("")+fld("Date Range", sel("m.drange",["Today","This Week","This Month"],fv("m.drange",W.dashRange))), btn("modal-close","Cancel","ghost")+btn("dash-save","Save Dashboard","green","","btn-savedash"), true);
  }
  if(k==="newuser") return wrap("Add Team Member", `<div class="fp-grid2">${fld("First Name",inp("m.nuf",fv("m.nuf",""),'data-hk="f-nuf"'),true)}${fld("Last Name",inp("m.nul",fv("m.nul","")))}${fld("Email",inp("m.nue",fv("m.nue",""),'data-hk="f-nue"'),true)}${fld("Role",sel("m.nur",["","Team Manager","Service Agent","Limited Agent","Assignment User"],fv("m.nur",""),'data-hk="f-nur"'))}</div>${fld("Teams Assigned as Team Member",sel("m.nut",[""].concat(TEAMS),fv("m.nut",""),'data-hk="f-nut"'))}${m.err?`<p class="bad">${E(m.err)}</p>`:""}`, btn("modal-close","Cancel","ghost")+btn("user-create","Save","green","","btn-createuser"));
  if(k==="viewname") return wrap(m.est?"Save Filter":"Save Filters As New View", fld("View name", inp("m.vn",fv("m.vn",""),'data-hk="f-viewname"')), btn("modal-close","Cancel","ghost")+btn("view-save","Save","green","","btn-saveviewname"));
  return "";
}

/* ===== what each click does ===== */
const HIST = [];
function nav(p, extra){ HIST.push(U.r); go(p, extra); }
function samePerson(a, b){ const A=W.cust[a], B=W.cust[b]; if(!A||!B) return false; const ph = A.phone.replace(/\D/g,"")===B.phone.replace(/\D/g,""); const ad = A.addr.toLowerCase().replace(/(lane|ln|street|st|road|rd)\.?$/,"").trim().split(" ").slice(0,2).join(" ")===B.addr.toLowerCase().replace(/(lane|ln|street|st|road|rd)\.?$/,"").trim().split(" ").slice(0,2).join(" "); return ph && ad; }
function findDupOf(first,last,phone,email,skip){ const p=(phone||"").replace(/\D/g,""); return Object.keys(W.cust).find(id => id!==skip && ((p.length>6 && W.cust[id].phone.replace(/\D/g,"")===p) || (email && W.cust[id].email && W.cust[id].email.toLowerCase()===email.toLowerCase()) || (`${W.cust[id].first} ${W.cust[id].last}`.toLowerCase()===`${first} ${last}`.toLowerCase().trim() && last))); }
function newCust(d){ const id = "c"+(W.nextCust++); W.cust[id] = Object.assign({first:"",last:"",phone:"",email:"",addr:"",city:"",zip:"",st:"Current Customer",type:"Residential",ls:"",tags:[],jobNotes:"",contacts:[],locs:[],cards:[],created:TODAY}, d); return id; }
function conflictFor(users, date, s, e, skipJob){
  for(const u of users){ for(const j of Object.values(W.jobs)){ if(j.archived||j.st==="Canceled"||j.id===skipJob) continue;
    const slots = [{d:j.date,s:j.s,e:j.e,u:j.users,n:`#${j.id}`}].concat(j.visits.map(v=>({d:v.date,s:v.s,e:v.e,u:v.users,n:`#${j.id} ${v.name}`})));
    for(const x of slots){ if(x.d===date && x.u.includes(u) && s<x.e && e>x.s) return `${uname(W,u)} already has ${x.n} from ${fmtH(x.s)} to ${fmtH(x.e)} on ${dlab(date)}.`; } } }
  return null;
}
function openAvail(len){ const out=[]; ["11-05","11-06","11-09"].forEach(d => techs(W).filter(u=>u!=="u8").forEach(u => { for(let h=8; h+len<=17; h++){ if(!conflictFor([u],d,h,h+len)){ out.push({d,u,s:h,e:h+len}); break; } } })); return out.sort((a,b)=>a.d.localeCompare(b.d)||a.s-b.s).slice(0,6); }
function addComm(c, kind, what){ W.comms.unshift({to:c, kind, what, at:"Nov 4, 2:15 PM", st:"Delivered"}); }

function act(a, ds){
  const v = ds.v;
  switch(a){
  case "noop": return;
  case "na-tab": { if(U.modal || !v){ toast("That part of FieldPulse is not set up in this practice.","rk"); return; } nav("na",{label:v}); return; }
  case "qb-ok": toast("This record is already synced with QuickBooks.","rk"); return;
  case "go": HIST.length=0; go(v, v==="na"?{label:ds.label}:{}); if(v==="jobs"){ U.jobsView="Open"; U.showJobFilters=false; U.jobsFilter={st:[],inv:"Any",sd:"Any"}; U.jfApplied=false; } if(v==="estimates"){ U.estTab="Estimates"; U.showEstFilters=false; U.estFilter={st:[],by:""}; } if(v==="customers"){ U.q=""; U.qf="Name"; } if(v==="rep" && !U.rep.tab) U.rep={tab:"jobs"}; return;
  case "back": { if(U.r.p==="preview"){ U.pf = {}; } const prev = HIST.pop(); if(prev) U.r = prev; else go("dash"); U.menu=null; return; }
  case "menu": U.menu = U.menu===v ? null : v; return;
  case "modal-close": closeModal(); return;
  case "archive": toast("Archiving is not part of this practice. Ask your manager before you archive anything.","rk"); U.menu=null; return;
  case "na-menu": toast("Not part of this practice.","rk"); U.menu=null; return;
  case "admin-only": toast("Only an Admin changes settings. Ask your manager.","rk"); return;
  case "sched-other": toast("This practice uses the Dispatch view.","rk"); return;
  case "open-cust": nav("customer",{id:v}); log("open-cust",{id:v}); return;
  case "open-job": nav("job",{id:v}); U.jobTab="Info"; log("open-job",{id:v}); return;
  case "open-est": nav("estimate",{id:v}); U.estRecTab="Info"; log("open-est",{id:v}); return;
  case "open-inv": nav("invoice",{id:v}); U.invRecTab="Info"; log("open-inv",{id:v}); return;
  case "open-user": nav("user",{id:v}); return;

  /* customers */
  case "cust-new": openModal("cust",{}, {"m.tags":[],"m.st":"Current Customer","m.type":"Residential"}); return;
  case "cust-edit": { const c = W.cust[v]; openModal("cust",{id:v},{"m.st":c.st,"m.type":c.type,"m.ls":c.ls,"m.tax":!!c.tax,"m.first":c.first,"m.last":c.last,"m.email":c.email,"m.phone":c.phone,"m.addr":c.addr,"m.city":c.city,"m.tags":c.tags.slice(),"m.jobNotes":c.jobNotes,"m.company":c.company||"","m.display":c.display||"","m.email2":c.email2||"","m.phone2":c.phone2||"","m.addr2":c.addr2||"","m.state":c.state||"","m.zip":c.zip||"","m.asg":c.asg||"","m.estdays":c.estdays||"","m.invdays":c.invdays||"","m.team":c.team||"","m.bpo":c.bpo||"","m.svc":c.svc||""}); return; }
  case "comm-open": openModal("sendcomm",{id:v,k:ds.k||"job"},{"m.cch":"Email","m.ctpl":""}); return;
  case "comm-send": { const f=U.form, t=f["m.ctpl"], ch=f["m.cch"]||"Email"; if(!t){ U.modal.err="Pick a template."; return; }
    const m=U.modal, c = m.k==="job" ? W.jobs[m.id].c : m.id, tag = m.k==="job" ? ` (#${m.id})` : "", name = t==="Empty Form (No Template)" ? (f["m.csubj"]||"Message") : t;
    if(ch==="Email" && !(f["m.csubj"]||"").trim()){ U.modal.err="Add a subject."; return; }
    addComm(c, ch, name+tag);
    log("comm-send",{k:m.k,id:m.id,c,tpl:t,sms:ch==="SMS",email:ch==="Email"}); if(/confirm/i.test(t) && m.k==="job") log("confirm-sent",{id:m.id,manual:true});
    closeModal(); toast("Sent."); return; }
  case "set-f": if(ds.f2) U.form[ds.f2] = v; return;
  case "cust-save": {
    const f = U.form; if(!(f["m.first"]||"").trim()){ toast("First Name is required.","bad"); return; }
    const d = {first:f["m.first"].trim(), last:(f["m.last"]||"").trim(), email:(f["m.email"]||"").trim(), phone:(f["m.phone"]||"").trim(), addr:(f["m.addr"]||"").trim(), city:(f["m.city"]||"").trim(), st:f["m.st"]||"Current Customer", type:f["m.type"]||"Residential", ls:f["m.ls"]||"", tax:!!f["m.tax"], tags:(f["m.tags"]||[]).slice(), jobNotes:f["m.jobNotes"]||""};
    ["company","display","email2","phone2","addr2","state","zip","asg","estdays","invdays","team","bpo","svc"].forEach(k => { if(f["m."+k]!=null) d[k] = String(f["m."+k]).trim(); });
    if(!d.display) d.display = (d.company || (d.first+" "+d.last)).trim();
    if(U.modal.id){ const before = Object.assign({}, W.cust[U.modal.id]); Object.assign(W.cust[U.modal.id], d); log("cust-edit",{id:U.modal.id, before, after:d}); if(before.ls!==d.ls) log("ls-set",{id:U.modal.id, ls:d.ls}); closeModal(); toast("Customer saved."); return; }
    const dup = findDupOf(d.first,d.last,d.phone,d.email);
    const id = newCust(d); log("cust-create",{id, d, dup}); if(dup) slip(`Made a second record for ${cname(W,dup)}. Search before you create.`, true);
    if(U.modal.bk){ const b = W.booking.find(x=>x.id===U.modal.bk); if(b) b.done=true; }
    closeModal(); nav("customer",{id}); toast("Customer created."); return;
  }
  case "contact-new": openModal("contact",{id:v}); return;
  case "cust-edit-contact": closeModal(); openModal("contact",{id:v}); return;
  case "cust-edit-loc": closeModal(); openModal("loc",{id:v}); return;
  case "contact-save": { const f=U.form; if(!(f["m.cname"]||"").trim()){ toast("Add a name.","bad"); return; } W.cust[U.modal.id].contacts.push({name:f["m.cname"].trim(),email:f["m.cemail"]||"",phone:f["m.cphone"]||"",notes:f["m.cnotes"]||""}); log("contact-add",{id:U.modal.id,name:f["m.cname"].trim()}); closeModal(); toast("Contact saved."); return; }
  case "loc-new": openModal("loc",{id:v}); return;
  case "loc-save": { const f=U.form, c=W.cust[U.modal.id]; if(!(f["m.laddr"]||"").trim()){ toast("Add an address.","bad"); return; } if(!c.locs.length) c.locs.push({name:"Primary",addr:`${c.addr}, ${c.city}`,star:true}); c.locs.push({name:(f["m.lname"]||"").trim()||"Location",addr:f["m.laddr"].trim(),rel:f["m.lrel"]||"",star:false}); log("loc-add",{id:U.modal.id,name:f["m.lname"]||"",addr:f["m.laddr"],rel:f["m.lrel"]||""}); closeModal(); toast("Location saved."); return; }
  case "loc-star": { const c=W.cust[v]; if(!c.locs.length) c.locs.push({name:"Primary",addr:`${c.addr}, ${c.city}`,star:true}); c.locs.forEach((l,i)=>l.star = i===+ds.i); log("loc-star",{id:v,i:+ds.i}); return; }
  case "card-new": openModal("card",{id:v},{"m.ptype":"Card"}); return;
  case "ptype": U.form["m.ptype"]=v; return;
  case "card-save": { const f=U.form; const n=(f["m.cnum"]||"").replace(/\D/g,""); if(n.length<12){ U.modal.err="Type the card number in the secure form."; return; } if(!f["m.consent"]){ U.modal.err="Tick the consent box first."; return; } W.cust[U.modal.id].cards.push({brand:"Visa",last4:n.slice(-4)}); log("card-add",{id:U.modal.id}); closeModal(); toast("Payment method saved."); return; }
  case "merge-open": openModal("merge",{id:v},{"m.src":"1"}); return;
  case "merge-pick": U.form["m.m2"]=v; return;
  case "merge-save": {
    const c1 = U.modal.id, c2 = U.form["m.m2"]; if(!c2){ toast("Pick Customer 2 first.","bad"); return; }
    const ok = samePerson(c1,c2);
    const src = U.form["m.src"]==="2" ? Object.assign({}, W.cust[c2]) : null;
    Object.values(W.jobs).forEach(j=>{ if(j.c===c2) j.c=c1; }); Object.values(W.inv).forEach(i=>{ if(i.c===c2) i.c=c1; }); Object.values(W.est).forEach(e=>{ if(e.c===c2) e.c=c1; });
    if(src){ ["first","last","phone","email","addr","city","ls","type"].forEach(k=>{ if(src[k]) W.cust[c1][k]=src[k]; }); }
    if(!W.cust[c1].ls && W.cust[c2].ls) W.cust[c1].ls = W.cust[c2].ls;
    const name2 = cname(W,c2); delete W.cust[c2];
    log("merge",{keep:c1, gone:c2, ok}); if(!ok) slip(`Merged two different people (${cname(W,c1)} and ${name2}). Different phone and address means different customers.`, true);
    closeModal(); toast("Customers merged."); return;
  }
  case "qb-sync-cust": { const c=W.cust[v]; c.qb="ok"; const q=W.qb.find(x=>x.ref===v); if(q) q.st="Success"; log("qb-sync",{ref:v}); toast("Synced with QuickBooks."); return; }
  case "qb-sync-inv": { const i=W.inv[v]; const custOk = W.cust[i.c].qb!=="failed"; if(!custOk){ toast("Sync failed: the customer has not synced yet. Fix the customer first.","bad"); log("qb-sync-fail",{ref:v}); return; } i.qb="ok"; const q=W.qb.find(x=>x.ref===v); if(q) q.st="Success"; log("qb-sync",{ref:v}); toast("Invoice synced with QuickBooks."); return; }
  case "qb-open": { const q=W.qb.find(x=>x.id===v); if(q.type==="Customer") nav("customer",{id:q.ref}); else if(q.type==="Invoice"||q.type==="Payment") nav("invoice",{id:q.ref}); return; }
  case "cust-createinv": toast("Make invoices from the job: open the job, then Actions > Create Invoice.","rk"); U.menu=null; return;

  /* jobs */
  case "jobs-view": U.jobsView=v; log("jobs-view",{v}); return;
  case "jobs-filters": U.showJobFilters=!U.showJobFilters; return;
  case "jobs-applyf": U.jfApplied=true; U.showJobFilters=false; log("job-filter-apply",{f:JSON.parse(JSON.stringify(U.jobsFilter))}); return;
  case "jobs-clearf": U.jobsFilter={st:[],inv:"Any",sd:"Any"}; U.jfApplied=false; return;
  case "jobs-saveview": openModal("viewname",{}); return;
  case "est-saveview": openModal("viewname",{est:true}); return;
  case "view-save": { const n=(U.form["m.vn"]||"").trim(); if(!n){ toast("Give the view a name.","bad"); return; }
    if(U.modal.est){ W.estViews.push({name:n, f:JSON.parse(JSON.stringify(U.estFilter))}); log("est-view-save",{name:n,f:U.estFilter}); U.estTab=n; }
    else { W.views.push({name:n, f:JSON.parse(JSON.stringify(U.jobsFilter))}); log("view-save",{name:n,f:JSON.parse(JSON.stringify(U.jobsFilter))}); U.jobsView=n; U.showJobFilters=false; }
    closeModal(); toast("View saved."); return; }
  case "job-new": { const f={"m.tags":[],"m.cmode":"existing"}; if(ds.c){ f["m.cust"]=ds.c; } openModal("job",{from:ds.from||(ds.c?"cust":"jobs")}, f); U.menu=null; log("job-form",{from:ds.from||(ds.c?"cust":"jobs"),c:ds.c||""}); return; }
  case "job-cmode": U.form["m.cmode"]=v; return;
  case "job-edit": { const j=W.jobs[v]; const f={"m.cust":j.c,"m.title":j.title,"m.tags":j.tags.slice(),"m.date":j.date,"m.s":j.s==null?"":String(j.s),"m.e":j.e==null?"":String(j.e),"m.ws":j.ws==null?"":String(j.ws),"m.we":j.we==null?"":String(j.we),"m.wprev":j.s==null?"":String(j.s),"m.wlock":true,"m.sub":j.sub||"","m.cf.gate":(j.cf||{}).gate||"","m.cf.permit":(j.cf||{}).permit||"","m.cf.coi":(j.cf||{}).coi||"False","m.cf.own":(j.cf||{}).own||"Not Confirmed","m.cf.septic":(j.cf||{}).septic||"Not Septic / N/A","m.cf.zone":(j.cf||{}).zone||"Not Set","m.cf.tax":(j.cf||{}).tax||"","m.notes":j.notes,"m.fnotes":j.fnotes,"m.cmode":"existing"}; j.users.forEach(u=>f["m.u."+u]=true); openModal("job",{id:v},f); return; }
  case "find-avail": { U.modal.avail = true; U.modal.slots = null; log("find-avail"); return; }
  case "suggest-times": { const len = (+U.form["m.e"]-+U.form["m.s"])>0 ? (+U.form["m.e"]-+U.form["m.s"]) : 2; U.modal.slots = openAvail(len); log("suggest-times"); return; }
  case "slot-pick": { const s=U.modal.slots[+v]; U.form["m.date"]=s.d; U.form["m.s"]=String(s.s); U.form["m.e"]=String(s.e); Object.keys(W.users).forEach(u=>delete U.form["m.u."+u]); U.form["m.u."+s.u]=true; winAuto(); log("slot-pick",{s}); return; }
  case "job-cleardates": ["m.date","m.s","m.e","m.ws","m.we"].forEach(k=>U.form[k]=""); U.form["m.cc"]=""; return;
  case "win-clear": U.form["m.ws"]=""; U.form["m.we"]=""; return;
  case "check-conflict": { const f=U.form, users=pickedUsers("m.u."); if(!f["m.date"]||f["m.s"]===""||f["m.s"]==null||f["m.e"]===""||f["m.e"]==null||!users.length){ U.form["m.cc"]="Pick a date, times and a team member first."; return; } const cf=conflictFor(users,f["m.date"],+f["m.s"],+f["m.e"],U.modal.id); if(cf){ const m=U.modal; m._form=Object.assign({},f); openModal("conflict",{msg:cf,back:m}); U.form=m._form; } else U.form["m.cc"]="You don't have any conflicts."; log("check-conflict",{cf:!!cf}); return; }
  case "win-insert": { const s=U.form["m.s"]; if(s==null||s===""){ toast("Set the start time first.","bad"); return; } U.form["m.ws"]=String(+s-WIN_BEFORE); U.form["m.we"]=String(+s+WIN_AFTER); log("win-insert",{s:+s}); return; }
  case "job-save": return saveJob(false);
  case "conflict-back": U.modal = U.modal.back; U.form = U.modal._form || U.form; return;
  case "conflict-save": { const back = U.modal.back; U.form = back._form; U.modal = back; slip("Saved over a scheduling conflict. Pick another time or tech.", false); return back.kind==="visit" ? saveVisit(true) : saveJob(true); }
  case "conf-yes": { const j=W.jobs[U.modal.id]; addComm(j.c,"SMS",`Job New Appointment Confirmation (#${j.id})`); addComm(j.c,"Email",`Job New Appointment Confirmation (#${j.id})`); log("confirm-sent",{id:j.id}); closeModal(); toast("Confirmation sent."); return; }
  case "conf-no": log("confirm-skipped",{id:U.modal.id}); closeModal(); return;
  case "job-st": { const j=W.jobs[ds.id]; if(v==="Completed" && j.subtasks.some(s=>s.items.some(i=>i.req&&!i.done))){ toast("All required subtasks must be completed in order to complete the job.","bad"); log("job-st-blocked",{id:j.id}); return; } const from=j.st; j.st=v; log("job-st",{id:j.id,from,to:v}); if(v==="On The Way"){ addComm(j.c,"SMS",`Job On the Way (#${j.id})`); } toast(`Status changed to ${v}.`); return; }
  case "job-tab": U.jobTab=v; log("job-tab",{id:U.r.id,v}); return;
  case "job-archive": { W.jobs[v].archived=true; log("job-archive",{id:v}); slip("Archived a job. To cancel, click the canceled status instead.", false); U.menu=null; return; }
  case "job-dup": toast("Duplicating is not part of this practice.","rk"); U.menu=null; return;
  case "visit-new": openModal("visit",{id:v},{"m.vname":"Site Visit #"+(W.jobs[v].visits.length+2)}); return;
  case "visit-save": return saveVisit(false);
  case "sub-new": openModal("series",{id:v,items:[]},{"m.stpl":"Closeout checklist"}); return;
  case "series-insert": U.modal.items = (U.modal.items||[]).concat(SUBTASK_TEMPLATES[U.form["m.stpl"]]||[]); log("series-insert",{tpl:U.form["m.stpl"]}); return;
  case "series-save": { if(!U.modal.items.length){ toast("Insert a template first.","bad"); return; } const j=W.jobs[U.modal.id]; const req=!!U.form["m.sreq"]; j.subtasks.push({series:(U.form["m.sname"]||"").trim()||U.form["m.stpl"], tpl:U.form["m.stpl"], items:U.modal.items.map(n=>({n,req,done:false}))}); log("series-add",{id:j.id,tpl:U.form["m.stpl"],req}); closeModal(); toast("Subtasks added."); return; }

  /* schedule */
  case "sched-day": U.schedDay=v; log("sched-day",{v}); return;
  case "sched-un": U.showUnassigned=!U.showUnassigned; log("sched-un",{on:U.showUnassigned}); return;
  case "sched-pick": U.sel = U.sel===v ? null : v; return;
  case "sched-unpick": U.sel=null; return;
  case "sched-drop": if(!U.sel){ toast("Pick a job first (click it or drag it).","rk"); return; } openModal("sched",{id:U.sel,u:ds.u,h:+ds.h}); return;
  case "sched-yes": { const j=W.jobs[U.modal.id]; const len=(j.s!=null&&j.e!=null)?(j.e-j.s):2; const c = conflictFor([U.modal.u],U.schedDay,U.modal.h,U.modal.h+len,j.id); const was={date:j.date,s:j.s,users:j.users.slice()};
    j.date=U.schedDay; j.s=U.modal.h; j.e=U.modal.h+len; j.users=[U.modal.u]; log("sched-move",{id:j.id,was,date:j.date,s:j.s,u:U.modal.u}); if(c) slip("Put a job on top of another one. "+c, false); U.sel=null; closeModal(); toast("Job scheduled."); return; }

  /* estimates */
  case "est-tab": U.estTab=v; { const sv=W.estViews.find(x=>x.name===v); if(sv){ U.estFilter=JSON.parse(JSON.stringify(sv.f)); } } log("est-tab",{v}); return;
  case "est-filters": U.showEstFilters=!U.showEstFilters; return;
  case "est-rtab": U.estRecTab=v; return;
  case "est-new": case "est-new-cust": { const job = ds.j||""; openModal("est",{job, opts:[{name:"Option 1",items:[]}], oi:0},{"m.cust":ds.c||(job?W.jobs[job].c:""),"m.title":job?W.jobs[job].title:""}); U.menu=null; log("est-form",{job}); return; }
  case "est-edit": { const e=W.est[v]; openModal("est",{id:v,opts:JSON.parse(JSON.stringify(e.opts)),addons:e.addons.length?JSON.parse(JSON.stringify(e.addons)):null,oi:0},{"m.title":e.title,"m.exp":e.exp,"m.notes":e.notes,"m.inotes":e.inotes}); return; }
  case "opt-sel": if(U.modal.oi===+v){ U.modal.ren=true; U.form["m.oname"]=U.modal.opts[U.modal.oi].name; return; } U.modal.oi=+v; U.modal.ren=false; return;
  case "opt-add": U.modal.opts.push({name:`Option ${U.modal.opts.length+1}`,items:[]}); U.modal.oi=U.modal.opts.length-1; log("opt-add"); return;
  case "opt-ren": U.modal.ren=true; U.form["m.oname"]=U.modal.opts[U.modal.oi].name; return;
  case "opt-apply": { const n=(U.form["m.oname"]||"").trim(); if(n) U.modal.opts[U.modal.oi].name=n; U.modal.ren=false; return; }
  case "opt-rmitem": U.modal.opts[U.modal.oi].items.splice(+v,1); return;
  case "addon-create": U.modal.addons=[]; return;
  case "item-open": U.modal.pick=v; U.modal.picked=null; U.form["m.iq"]=""; U.form["m.iqty"]="1"; return;
  case "item-close": U.modal.pick=null; U.modal.picked=null; return;
  case "item-pick": U.modal.picked=v; return;
  case "item-new": slip(`Made a new item "${v}". Ask your manager before adding items; each item carries its QuickBooks account.`, false); U.modal.picked=v; ITEM_PRICE[v]=ITEM_PRICE[v]||0; return;
  case "item-add": { const n=U.modal.picked; if(!n) return; const q=Math.max(1,parseInt(U.form["m.iqty"]||"1",10)||1); const it={n,q,p:ITEM_PRICE[n]||0};
    if(U.modal.pick==="opt") U.modal.opts[U.modal.oi].items.push(it); else if(U.modal.pick==="addon") U.modal.addons.push(it); else U.modal.items.push(it);
    log("item-add",{n,where:U.modal.pick}); U.modal.picked=null; U.modal.pick=null; U.form["m.iq"]=""; return; }
  case "est-save": {
    const m=U.modal, f=U.form; const c = m.id ? W.est[m.id].c : (m.job ? W.jobs[m.job].c : f["m.cust"]); if(!c){ toast("Pick a customer.","bad"); return; }
    if(!m.opts.some(o=>o.items.length)){ toast("Add at least one item.","bad"); return; }
    if(m.id){ Object.assign(W.est[m.id],{title:f["m.title"]||W.est[m.id].title,exp:f["m.exp"],opts:m.opts,addons:m.addons||[],notes:f["m.notes"]||"",inotes:f["m.inotes"]||""}); log("est-edit",{id:m.id}); closeModal(); return; }
    const id=String(W.nextEst++); W.est[id]={id,c,title:(f["m.title"]||"").trim()||"Estimate",st:"Draft",by:"u2",created:TODAY,sent:"",opts:m.opts,addons:m.addons||[],notes:f["m.notes"]||"",inotes:f["m.inotes"]||"",job:m.job||"",exp:f["m.exp"]||"12-04",reminder:null,files:[]};
    log("est-create",{id,job:m.job,opts:m.opts.length,addons:(m.addons||[]).length}); closeModal(); nav("estimate",{id}); toast("Estimate saved as Draft."); return; }
  case "est-st": { const e=W.est[ds.id]; const from=e.st; e.st=v; if(v==="Sent"&&!e.sent) e.sent=TODAY; log("est-st",{id:e.id,from,to:v}); toast(`Status changed to ${v}.`); return; }
  case "est-lost": { const e=W.est[v]; const from=e.st; e.st="Lost"; log("est-st",{id:v,from,to:"Lost",via:"action"}); U.menu=null; toast("Marked as Lost."); return; }
  case "rem-open": openModal("reminder",{id:v},{"m.rdate":"11-05"}); return;
  case "rem-save": W.est[U.modal.id].reminder={date:U.form["m.rdate"],note:U.form["m.rnote"]||""}; log("reminder",{id:U.modal.id,date:U.form["m.rdate"]}); closeModal(); toast("Reminder set."); return;
  case "est-convert": openModal("convert",{id:v}); log("convert-open",{id:v}); return;
  case "convert-yes": { const e=W.est[U.modal.id]; const id=String(W.nextInv++); W.inv[id]={id,c:e.c,job:e.job||"",st:"Invoice Draft",date:TODAY,due:"",items:JSON.parse(JSON.stringify(e.opts[0].items)),pays:[],notes:"",inotes:"",progress:[],qb:"ok",fromEst:e.id}; e.inv=id; log("est-convert",{id:e.id,inv:id}); closeModal(); nav("invoice",{id}); toast("Converted. The estimate record was kept."); return; }
  case "est-createjob": { const e=W.est[v]; openModal("job",{fromEst:v},{"m.cust":e.c,"m.title":e.title,"m.tags":[],"m.cmode":"existing"}); U.menu=null; return; }
  case "est-dup": toast("Duplicating is not part of this practice.","rk"); U.menu=null; return;

  /* send / preview */
  case "preview": U.pf = {}; if(ds.sig) U.pf["p.sv.sig"]=true; nav("preview",{kind:ds.k,id:v}); log("preview",{kind:ds.k,id:v}); return;
  case "sv-mode": U.pf["p.sv.mode"]=v; return;
  case "sv-email": U.pf["p.sv.mode"]="Email"; log("email-open",{id:U.r.id}); toast("Check the recipient, subject and body, then Send.","rk"); return;
  case "sv-send": {
    const k=ds.k, id=v, rec = k==="est"?W.est[id]:W.inv[id];
    const s = {sig:!!U.pf["p.sv.sig"], pr:!!U.pf["p.sv.pr"], amt:U.pf["p.sv.amt"]||"", unit:U.pf["p.sv.unit"]||"$", sms:!!U.pf["p.sv.sms"], mode:U.pf["p.sv.mode"]||"Email"};
    if(s.pr && !(+s.amt>0)){ toast("Enter the payment request amount.","bad"); return; }
    if(k==="est"){ if(["Draft"].includes(rec.st)) rec.st="Sent"; rec.sent=rec.sent||TODAY; rec.sentWith=s; addComm(rec.c, s.mode, `Estimate #${id}${s.sig?" + signature request":""}${s.pr?" + payment request":""}`); }
    else { if(["Invoiced","Invoice Draft"].includes(rec.st)) rec.st="Sent"; rec.sentWith=s; addComm(rec.c, s.mode, `Invoice #${id}${s.pr?" + payment link":""}`); }
    if(s.sms && s.mode==="Email") addComm(rec.c,"SMS",`${k==="est"?"Estimate":"Invoice"} #${id} link`);
    log("send",Object.assign({kind:k,id},s)); HIST.pop(); U.r={p:k==="est"?"estimate":"invoice",id}; U.pf={}; toast("Sent to the customer."); return; }

  /* invoices */
  case "inv-new": { const j=W.jobs[v]; openModal("inv",{job:v,items:[]},{"m.due":""}); U.menu=null; log("inv-form",{job:v}); return; }
  case "inv-edit": { const i=W.inv[v]; openModal("inv",{id:v,items:JSON.parse(JSON.stringify(i.items))},{"m.due":i.due,"m.notes":i.notes,"m.inotes":i.inotes}); return; }
  case "inv-rmitem": U.modal.items.splice(+v,1); return;
  case "inv-save": { const m=U.modal,f=U.form; if(!m.items.length){ toast("Add at least one item.","bad"); return; }
    if(m.id){ const i=W.inv[m.id]; const before=i.notes; Object.assign(i,{items:m.items,due:f["m.due"]||"",notes:f["m.notes"]||"",inotes:f["m.inotes"]||""}); log("inv-edit",{id:m.id,notes:i.notes,before}); closeModal(); toast("Invoice saved."); return; }
    const j=W.jobs[m.job]; const id=String(W.nextInv++); W.inv[id]={id,c:j.c,job:j.id,st:"Invoice Draft",date:TODAY,due:f["m.due"]||"",items:m.items,pays:[],notes:f["m.notes"]||"",inotes:f["m.inotes"]||"",progress:[],qb:"ok"};
    log("inv-create",{id,job:j.id,items:m.items.length}); closeModal(); nav("invoice",{id}); toast("Invoice saved as Invoice Draft."); return; }
  case "inv-finalize": { const i=W.inv[v]; i.st="Invoiced"; log("inv-finalize",{id:v}); toast("Finalized. Status is now Invoiced."); return; }
  case "inv-st": { const i=W.inv[ds.id]; if(v==="Void") return voidInv(i.id); const from=i.st; if(INV_STATUSES.indexOf(v)<INV_STATUSES.indexOf(from) && i.pays.length){ slip("Moved a paid invoice back to an earlier status. That removes its payments in FieldPulse.", true); } i.st=v; log("inv-st",{id:i.id,from,to:v}); toast(`Status changed to ${v}.`); return; }
  case "inv-void": U.menu=null; return voidInv(v);
  case "inv-tab": U.invRecTab=v; log("inv-tab",{id:U.r.id,v}); return;
  case "inv-dup": toast("Duplicating is not part of this practice.","rk"); U.menu=null; return;
  case "pay-mark": { if(U.modal && U.modal.kind==="markpay") return; const i=W.inv[v]; openModal("markpay",{id:v},{"m.method":"","m.amt":invDue(i).toFixed(2),"m.pdate":TODAY}); U.menu=null; log("markpay-open",{id:v}); return; }
  case "pay-take": if(U.modal && U.modal.kind==="takepay") return; openModal("takepay",{id:v}); U.menu=null; log("takepay-open",{id:v}); return;
  case "takepay-run": { const i=W.inv[U.modal.id]; const amt=invDue(i); i.pays.push({id:"p"+(W.nextPay++),method:"Credit Card",amt,date:TODAY,by:"u2",fp:true,note:"",refunds:[]}); setPaidStatus(i); log("takepay",{id:i.id,amt}); if(i.id==="2036") slip("Ran a card for a check payment. Use Mark Payment for checks.", false); closeModal(); toast("Card charged."); return; }
  case "pm-method": U.form["m.method"]=v; return;
  case "pay-req": toast("Request Payment is not part of this practice. To send a pay link, use Send to Customer and turn on Include Payment Request.","rk"); return;
  case "markpay-save": { const i=W.inv[U.modal.id], f=U.form; if(!f["m.method"]){ toast("Pick a method first.","bad"); return; } const amt=Math.round((+String(f["m.amt"]).replace(/[$,]/g,""))*100)/100; if(!(amt>0)){ toast("Enter the amount.","bad"); return; }
    const p={id:"p"+(W.nextPay++),method:f["m.method"],amt,date:f["m.pdate"]||TODAY,by:"u2",fp:false,note:(f["m.pnote"]||"").trim(),refunds:[]}; i.pays.push(p); setPaidStatus(i);
    log("markpay",{id:i.id,method:p.method,amt,note:p.note}); closeModal(); U.invRecTab="Payments"; toast("Payment saved."); return; }
  case "pay-open": openModal("payedit",{inv:v,p:ds.p}); log("pay-open",{inv:v,p:ds.p}); return;
  case "refund-open": { const i=W.inv[v], p=i.pays.find(x=>x.id===ds.p); if(!p.fp){ toast("Refunds only work on FieldPulse Payments. Ask the bookkeeper about cash or check refunds.","rk"); return; } openModal("refund",{inv:v,p:ds.p},{"m.ramt":String(p.amt-p.refunds.reduce((a,r)=>a+r.amt,0))}); log("refund-open",{inv:v,p:ds.p,from:U.r.p}); return; }
  case "refund-save": { const i=W.inv[U.modal.inv], p=i.pays.find(x=>x.id===U.modal.p), f=U.form; const amt=+String(f["m.ramt"]).replace(/[$,]/g,""); const left=p.amt-p.refunds.reduce((a,r)=>a+r.amt,0);
    if(!(amt>0) || amt>left+0.001){ toast(`Enter an amount up to ${money(left)}.`,"bad"); return; } if(!(f["m.rreason"]||"").trim()){ toast("Pick a reason.","bad"); return; }
    p.refunds.push({amt,reason:f["m.rreason"].trim(),date:TODAY}); log("refund",{inv:i.id,p:p.id,amt,reason:f["m.rreason"]}); closeModal(); toast("Refund sent."); return; }
  case "prog-open": openModal("progress",{id:v},{"m.pmode":"Set Amount"}); U.menu=null; log("prog-open",{id:v}); return;
  case "prog-save": { const i=W.inv[U.modal.id], f=U.form; const mode=f["m.pmode"]||"Set Amount"; const paid=invPaid(i);
    let val=0, amt=0; if(mode==="Remaining Balance"){ amt=Math.round((invTotal(i)-paid)*100)/100; } else { val=+String(f["m.pval"]||"").replace(/[$,%]/g,""); if(!(val>0)){ toast("Enter the amount or percent.","bad"); return; } amt = mode==="Percentage Of Total" ? Math.round(invTotal(i)*val)/100 : val; }
    openModal("progpdf",{id:i.id, amt, pct:mode==="Percentage Of Total"?val:null, label:`Stage ${i.progress.length+1}`}); return; }
  case "prog-send": { const m=U.modal, i=W.inv[m.id];
    i.progress.push({label:m.label, amt:m.amt, pct:m.pct, how:v==="email"?"Emailed":"Saved to record"}); if(v==="email") addComm(i.c,"Email",`Progress invoice #${i.id} (${money(m.amt)})`);
    log("progress",{id:i.id,amt:m.amt,pct:m.pct,how:v}); closeModal(); toast(v==="email"?"Progress invoice emailed.":"Saved to the record."); return; }

  /* POs, team, timesheets */
  case "po-new": openModal("po",{job:ds.j||""}); U.menu=null; return;
  case "po-save": { const f=U.form; const id="PO-"+(W.nextPO++); W.pos.push({id,vendor:f["m.vendor"],job:f["m.pjob"]||"",total:+f["m.ptotal"]||0,st:"Draft",note:f["m.pnote"]||""}); log("po-create",{id,note:f["m.pnote"]||""}); if(/7781/.test(f["m.pnote"]||"")) slip("Put the customer's PO number on a Purchase Order. Purchase Orders are for buying parts from vendors.", false); closeModal(); toast("Purchase order created."); return; }
  case "user-new": openModal("newuser",{}); return;
  case "user-create": { const f=U.form; if(!(f["m.nuf"]||"").trim()||!(f["m.nue"]||"").trim()){ U.modal.err="First name and email are required."; return; } if(!f["m.nur"]){ U.modal.err="Pick a role."; return; } const id="u"+(Object.keys(W.users).length+10); W.users[id]={name:`${f["m.nuf"].trim()} ${(f["m.nul"]||"").trim()}`.trim(),email:f["m.nue"].trim(),role:f["m.nur"],teams:f["m.nut"]?[f["m.nut"]]:[],st:"Activated",color:"#5c6bc0",tech:["Service Agent","Limited Agent"].includes(f["m.nur"])}; log("user-create",{id,role:f["m.nur"],team:f["m.nut"]||""}); closeModal(); toast("Team member added."); return; }
  case "user-edit": openModal("user",{id:v},{"m.ust":W.users[v].st}); return;
  case "user-save": { const u=U.modal.id, x=W.users[u]; const from=x.st; x.st=U.form["m.ust"]; log("user-st",{u,from,to:x.st}); if(x.st==="Deactivated" && u!=="u7") slip(`Deactivated ${x.name}, who still works here.`, true); closeModal(); toast("Saved."); return; }
  case "ts-tab": U.tsTab=v; log("ts-tab",{v}); return;
  case "ts-mode": U.tsMode=v; log("ts-mode",{v}); return;
  case "ts-type": U.tsType=v; return;
  case "ts-day": U.tsDay=v; return;
  case "ts-member": nav("tsm",{id:v}); log("ts-member",{u:v}); return;
  case "ts-entry": { const t=W.ts.find(x=>x.id===v); openModal("timelog",{id:v},{"m.cit":String(t.ci),"m.cod":t.co==null?TODAY:t.date,"m.cot":t.co==null?"14.25":String(t.co)}); log("ts-open",{id:v}); return; }
  case "ts-save": { const t=W.ts.find(x=>x.id===U.modal.id), f=U.form; const ci=+f["m.cit"], cot=+f["m.cot"], cod=f["m.cod"]; const co=(dnum(cod)-dnum(t.date))*24+cot;
    if(co<=ci){ toast("Clock Out must be after Clock In.","bad"); return; } const was=t.co; t.ci=ci; t.co=co; log("ts-save",{id:t.id,user:t.user,was,co,date:t.date,cod,cot});
    if(was==null && co-ci>16) slip(`Saved a ${Math.round(co-ci)} hour shift. Check the clock-out time before you save.`, true); closeModal(); toast("Time saved."); return; }
  case "ts-delete": { const id=U.modal.id; W.ts=W.ts.filter(x=>x.id!==id); log("ts-delete",{id}); slip("Deleted a time entry. Fix the clock-out time instead.", true); closeModal(); return; }
  case "ts-export": log("ts-export",{tab:U.tsTab}); toast("Timesheet export downloaded (practice)."); return;

  /* reporting */
  case "rep-tab": U.rep={tab:v}; U.pf={}; log("rep-tab",{v}); return;
  case "rep-sub": U.rep.sub=v; log("rep-sub",{tab:U.rep.tab,v}); return;
  case "rep-load": U.rep.loaded=true; U.rep.range=U.pf["p.rd.range"]||"This Week (Nov 2 - Nov 8)"; U.rep.dateType=U.pf["p.rd.dt"]||RDATE[U.rep.tab][0]; log("rep-load",{tab:U.rep.tab,range:U.rep.range,dt:U.rep.dateType}); return;
  case "rep-panel": U.rep.panel = U.rep.panel===v ? null : v; U.rep.fopen=null; return;
  case "rep-fopen": U.rep.fopen = U.rep.fopen===v ? null : v; delete U.pf["p.rf.op"]; delete U.pf["p.rf.val"]; return;
  case "rep-fapply": { const op=U.pf["p.rf.op"]||"Any", val=U.pf["p.rf.val"]||""; U.rep.filters=Object.assign({},U.rep.filters); if(op==="Any"||val==="") delete U.rep.filters[v]; else U.rep.filters[v]={op,val}; log("rep-filter",{tab:U.rep.tab,col:v,f:U.rep.filters[v]}); return; }
  case "rep-ungroup": U.rep.group=null; return;
  case "rep-reset": U.rep={tab:U.rep.tab,loaded:U.rep.loaded,range:U.rep.range,dateType:U.rep.dateType}; return;
  case "rep-quick": openModal("quick",{},{"m.qf":"Count","m.qb":"Status"}); return;
  case "quick-yes": U.rep.pivot={field:U.form["m.qf"],by:U.form["m.qb"]}; log("pivot",{tab:U.rep.tab,field:U.rep.pivot.field,by:U.rep.pivot.by}); closeModal(); return;
  case "rep-save": U.menu=null; openModal("repsave",{widget:v==="widget"}); return;
  case "repsave-yes": { const n=(U.form["m.rname"]||"").trim(); if(!n){ toast("Give it a name.","bad"); return; } const R=U.rep; const id="r"+(W.reports.length+1)+"x";
    W.reports.push({id,name:n,tab:R.tab,cols:R.cols||RCOLS[R.tab].map(c=>c[0]),filters:JSON.parse(JSON.stringify(R.filters||{})),group:R.group||null,range:R.range,dateType:R.dateType,pivot:R.pivot||null,widget:!!U.modal.widget});
    const wid=!!U.modal.widget; R.reportName=n; R.reportId=id; log("rep-save",{id,name:n,tab:R.tab,widget:!!U.modal.widget,filters:JSON.parse(JSON.stringify(R.filters||{})),group:R.group||null,cols:(R.cols||RCOLS[R.tab].map(c=>c[0])).slice(),pivot:R.pivot||null,dt:R.dateType}); closeModal(); toast(wid?"Widget saved.":"Report saved."); return; }
  case "rep-open": { const r=W.reports.find(x=>x.id===v); U.rep={tab:r.tab,loaded:true,range:r.range||U.rep.range||"This Week (Nov 2 - Nov 8)",dateType:r.dateType,cols:r.cols.slice(),filters:JSON.parse(JSON.stringify(r.filters||{})),group:r.group,pivot:r.pivot,reportName:r.name,reportId:r.id}; U.menu=null; log("rep-open",{id:v,name:r.name}); return; }
  case "rep-export": log("rep-export",{tab:U.rep.tab,report:U.rep.reportId||null,name:U.rep.reportName||null,range:U.rep.range}); toast("CSV downloaded (practice)."); return;

  /* booking, dashboard, settings */
  case "bk-dismiss": { const b=W.booking.find(x=>x.id===v); b.dismissed=true; log("bk-dismiss",{id:v}); if(v!=="b3") slip(`Dismissed a real request from ${b.name}. Only dismiss junk or test requests.`, false); return; }
  case "bk-create": { const b=W.booking.find(x=>x.id===v); U.menu=null; const [first,...rest]=b.name.split(" "); const match=Object.keys(W.cust).find(id=>W.cust[id].email && W.cust[id].email.toLowerCase()===b.email.toLowerCase());
    log("bk-create",{id:v,kind:ds.k,match});
    if(ds.k==="cust"){ if(match){ toast(`Email matches ${cname(W,match)}. Using that record.`); nav("customer",{id:match}); b.done=true; return; } openModal("cust",{bk:v},{"m.first":first,"m.last":rest.join(" "),"m.email":b.email,"m.phone":b.phone,"m.addr":b.addr.split(",")[0],"m.city":(b.addr.split(",")[1]||"").trim(),"m.tags":[]}); return; }
    if(match){ openModal("job",{bk:v},{"m.cmode":"existing","m.cust":match,"m.title":b.desc,"m.tags":[]}); toast(`Email matches ${cname(W,match)}.`); return; }
    openModal("job",{bk:v},{"m.cmode":"new","m.nfirst":first,"m.nlast":rest.join(" "),"m.nphone":b.phone,"m.nemail":b.email,"m.naddr":b.addr,"m.title":b.desc,"m.tags":[]}); return; }
  case "dash-config": { const f={"m.drange":W.dashRange}; W.dash.forEach((w,i)=>{ f[`m.w${i}t`]=w.type; f[`m.w${i}`]=w.w; }); openModal("dash",{},f); log("dash-open"); return; }
  case "dash-save": { W.dash = W.dash.map((w,i)=>({type:U.form[`m.w${i}t`],w:U.form[`m.w${i}`]||w.w})); W.dashRange=U.form["m.drange"]; log("dash-save",{dash:W.dash.slice()}); closeModal(); toast("Dashboard saved."); return; }
  case "set-sec": U.setSec=v; U.setTab=(SETS.find(x=>x[0]===v)||SETS[0])[2][0]; log("settings",{sec:v,tab:U.setTab}); return;
  case "qb-stat": U.qbStat=true; return;
  case "qb-back": U.qbStat=false; return;
  case "set-tab": U.qbStat=false; U.setTab=v; log("settings",{sec:U.setSec,tab:v}); return;

  /* tags */
  case "tag-add": { const f=ds.f2; const L=(U.form[f]||[]).slice(); if(!L.includes(v)) L.push(v); U.form[f]=L; U.form[f+".q"]=""; U.form[f+".open"]=false; log("tag-add",{v}); return; }
  case "tag-new": { const f=ds.f2; const L=(U.form[f]||[]).slice(); L.push(v); U.form[f]=L; U.form[f+".q"]=""; U.form[f+".open"]=false; (f==="m.tags" && U.modal.kind==="job" ? JOB_TAGS : CUST_TAGS).push(v); slip(`Made a new company tag "${v}". Pick from the list, or ask your manager.`, false); return; }
  case "tag-rm": { const f=ds.f2; U.form[f]=(U.form[f]||[]).filter(t=>t!==v); log("tag-rm",{v}); return; }
  }
}
function setPaidStatus(i){ const due=invDue(i); i.st = due<=0.001 ? "Paid" : "Partially Paid"; }
function voidInv(id){ const i=W.inv[id]; if(i.pays.length) slip(`Voided invoice #${id}, which has payments. Ask your manager first.`, true); const from=i.st; i.st="Void"; log("inv-void",{id,from}); toast(`Invoice #${id} voided.`); return; }
function saveJob(force){
  const m=U.modal, f=U.form; const users=pickedUsers("m.u.");
  let c = f["m.cust"];
  if(!m.id && f["m.cmode"]==="new"){ if(!(f["m.nfirst"]||"").trim()){ toast("First Name is required for the new customer.","bad"); return; } }
  else if(!c){ toast("Pick the customer.","bad"); return; }
  const date=f["m.date"]||"", s=f["m.s"]===""||f["m.s"]==null?null:+f["m.s"], e=f["m.e"]===""||f["m.e"]==null?null:+f["m.e"];
  if(date && (s==null||e==null||e<=s)){ toast("Set a Start Time and an End Time after it.","bad"); return; }
  if(!force && date && users.length){ const cf=conflictFor(users,date,s,e,m.id); if(cf){ m._form=Object.assign({},f); openModal("conflict",{msg:cf,back:m}); U.form=m._form; return; } }
  if(!m.id && f["m.cmode"]==="new"){ const d={first:f["m.nfirst"].trim(),last:(f["m.nlast"]||"").trim(),phone:f["m.nphone"]||"",email:f["m.nemail"]||"",addr:(f["m.naddr"]||"").split(",")[0],city:((f["m.naddr"]||"").split(",")[1]||"").trim(),type:f["m.ntype"]||"Residential",ls:f["m.nls"]||""};
    const dup=findDupOf(d.first,d.last,d.phone,d.email); c=newCust(d); log("cust-create",{id:c,d,dup,viaJob:true}); if(dup) slip(`Made a second record for ${cname(W,dup)}. Search before you create.`, true); }
  const vals={c,title:(f["m.title"]||"").trim()||"Job",users,tags:(f["m.tags"]||[]).slice(),date,s,e,ws:f["m.ws"]===""||f["m.ws"]==null?null:+f["m.ws"],we:f["m.we"]===""||f["m.we"]==null?null:+f["m.we"],win:winLabel(f["m.ws"],f["m.we"]),notes:f["m.notes"]||"",fnotes:f["m.fnotes"]||"",sub:f["m.sub"]||"",cf:{gate:f["m.cf.gate"]||"",permit:f["m.cf.permit"]||"",coi:f["m.cf.coi"]||"False",own:f["m.cf.own"]||"Not Confirmed",septic:f["m.cf.septic"]||"Not Septic / N/A",zone:f["m.cf.zone"]||"Not Set",tax:f["m.cf.tax"]||""}};
  if(m.id){ const j=W.jobs[m.id]; const before={date:j.date,s:j.s,e:j.e,users:j.users.slice(),tags:j.tags.slice(),notes:j.notes}; Object.assign(j,vals); log("job-edit",{id:j.id,before,after:Object.assign({},vals)}); closeModal(); toast("Job saved."); return; }
  const id=String(W.nextJob++); W.jobs[id]=Object.assign({id,st:"New",visits:[],subtasks:[],archived:false,created:TODAY,tpl:f["m.tpl"]||"",fromEst:m.fromEst||""},vals);
  if(m.fromEst){ W.est[m.fromEst].job=id; }
  if(m.bk){ const b=W.booking.find(x=>x.id===m.bk); if(b) b.done=true; }
  log("job-create",{id,c,tpl:f["m.tpl"]||"",from:m.from||"",bk:m.bk||"",fromEst:m.fromEst||"",vals:Object.assign({},vals)});
  closeModal(); HIST.push(U.r); U.r={p:"job",id}; U.jobTab="Info";
  openModal("confirm-send",{id}); return;
}
function saveVisit(force){
  const m=U.modal, f=U.form; const users=pickedUsers("m.u."); const date=f["m.date"], s=+f["m.s"], e=+f["m.e"];
  if(!(f["m.vname"]||"").trim()){ toast("Give the visit a name.","bad"); return; }
  if(!date || !(e>s)){ toast("Set the date and times.","bad"); return; } if(!users.length){ toast("Assign a team member.","bad"); return; }
  if(!force){ const cf=conflictFor(users,date,s,e); if(cf){ m._form=Object.assign({},f); openModal("conflict",{msg:cf,back:m}); U.form=m._form; return; } }
  const j=W.jobs[m.id]; const v={name:f["m.vname"].trim(),date,s,e,users,ws:f["m.ws"]===""||f["m.ws"]==null?null:+f["m.ws"],we:f["m.we"]===""||f["m.we"]==null?null:+f["m.we"],win:winLabel(f["m.ws"],f["m.we"]),notes:f["m.notes"]||"",fnotes:f["m.fnotes"]||""}; j.visits.push(v); log("visit-add",{id:j.id,v,forced:!!force}); closeModal(); toast("Site visit saved."); return;
}

/* ===== the 5-day program: tasks, checks, drawer ===== */
const C_ = id => W.cust[id] || {};
const findCust = (first,last) => Object.keys(W.cust).find(id => (W.cust[id].first||"").toLowerCase()===first.toLowerCase() && (W.cust[id].last||"").toLowerCase()===last.toLowerCase());
const createdJobs = () => EV.filter(e=>e.k==="job-create").map(e=>W.jobs[e.id]).filter(Boolean);
const digits = s => String(s||"").replace(/\D/g,"");
const evAfter = (k, t, f) => EV.some(e => e.k===k && e.t>t && (!f||f(e)));

const PROGRAM = [
 {d:1, title:"Basics and customers", read:["f-1","f-2","f-3","f-4","f-5","f-6","f-7","m7-4"], tasks:[
  {id:"d1-roles", les:"f-5", t:"Know the team", b:"In this practice you are a Team Manager with Company Admin turned on, so you can open settings. Open Company Settings > User Accounts > Teams. Then answer the two questions.",
   hint:"Company Settings > User Accounts > Teams", hk:["nav-settings","set-users","settab-Teams"],
   q:[{q:"Which teams is Ben Foster on?", o:["Service and Septic","New Construction only","No team"], a:0},{q:"Which role can be put on jobs but can't log in?", o:["Limited Agent","Assignment User","Service Agent"], a:1}],
   check:() => did("settings", e=>e.tab==="Teams")},
  {id:"d1-texts", les:"f-6", t:"Know how texts go out", b:"Open the Automatic Triggers list, then the Communications log. Answer the questions.",
   hint:"Company Settings > Customer Communications > Automatic Triggers, then Management > Communications", hk:["nav-settings","set-comm","settab-Automatic Triggers","nav-comms"],
   q:[{q:"Which message waits for someone to confirm before it sends?", o:["The On the Way text","The new appointment confirmation","The Arrived text"], a:1},{q:"What was the last message FieldPulse sent to Grace Kim?", o:["Invoice #2036 email","On the Way text","Estimate email"], a:0}],
   check:() => did("settings", e=>e.tab==="Automatic Triggers") && did("nav", e=>e.p==="comms")},
  {id:"d1-newcust", les:"f-1", t:"Create a new customer", b:"New caller: Omar Haddad, (555) 201-0150, 18 Pine St, Brookfield. Residential. He found you on social media. He has not booked yet, so he is a Lead. Search first, then create him.",
   hint:"Customers > Create Customer. Set Status, Account Type and Lead Source, then Save Customer.", hk:["nav-customers","btn-create-customer","f-status","f-type","f-ls","f-first","f-phone","f-addr","btn-savecust"],
   check:() => { const id = findCust("Omar","Haddad"); const c = C_(id); return !!id && c.st==="Lead" && c.type==="Residential" && c.ls==="Social Media" && digits(c.phone).endsWith("2010150") && /18 pine/i.test(c.addr) && !c.tax; }},
  {id:"d1-loc", les:"f-2", t:"Add a contact and a second address", b:"Grace Kim owns a rental at 40 Lake Dr, Brookfield. First add her tenant Tom Lee, (555) 201-0160, as an Additional Contact. Then add the rental as an Additional Location named Rental, with Tom Lee as the Related Contact.",
   hint:"Customers > Grace Kim > Edit > Additional Contact, then Edit > Additional Location (the record page has the same buttons)", hk:["nav-customers","cust-c1","btn-cust-edit","btn-edit-addcontact","btn-edit-addloc","btn-addcontact","btn-addloc","f-lname","f-lrel"],
   check:() => { const c = C_("c1"); return (c.contacts||[]).some(x=>/tom lee/i.test(x.name)) && (c.locs||[]).some(l=>/40 lake/i.test(l.addr) && /rental/i.test(l.name) && /tom lee/i.test(l.rel||"")); }},
  {id:"d1-tags", les:"f-3", t:"Fix the tags on a job", b:"Job #1035 (Dana Ruiz, Fri) has the Flag: Emergency / After Hours tag by mistake. Take it off and add Flag: Office Review Needed from the list. Don't type a new tag.",
   hint:"Work > Jobs > #1035 > Edit > Job Tags", hk:["nav-jobs","job-1035","btn-job-edit","m.tags","tag-Flag: Office Review Needed","btn-savejob"],
   check:() => { const j = W.jobs["1035"]; return j.tags.includes("Flag: Office Review Needed") && !j.tags.includes("Flag: Emergency / After Hours"); }},
  {id:"d1-ls", les:"f-4", t:"Give a customer a lead source", b:"Dana Ruiz has no lead source. She told you she found you on Google Search. Fix it on her customer record.",
   hint:"Customers > Dana Ruiz > Edit > Lead Source", hk:["nav-customers","cust-c2","btn-cust-edit","f-ls","btn-savecust"],
   check:() => C_("c2").ls==="Google Search"},
  {id:"d1-merge", les:"f-7", t:"Merge a duplicate customer", b:"Linda Park has two records (Linda Park and Linda Parks, same phone). Your manager said OK: keep Linda Park and merge the other one into it. Careful: the two Robert Hayes records are two different people.",
   hint:"Customers > Linda Park > Actions > Update > Merge Customers. Search Linda Parks under Customer 2, then Save Customers.", hk:["nav-customers","cust-c3","btn-cust-actions","m-merge","f-merge-search","mp-c4","btn-mergesave"],
   check:() => !!W.cust.c3 && !W.cust.c4 && W.jobs["1049"].c==="c3"},
  {id:"d1-inbox", les:"m7-4", t:"Know where emails come from", b:"Open Company Settings > Customer Communications > Email Settings and see who FieldPulse emails come from and where copies go. Then answer.",
   hint:"Company Settings > Customer Communications > Email Settings", hk:["nav-settings","set-comm","settab-Email Settings"],
   q:[{q:"Where should automatic notifications go?", o:["The main customer inbox","Their own inbox, so they don't bury customer emails","Nowhere"], a:1},{q:"At an inbox check, every message ends up as...", o:["Read","Done, Waiting (with a follow-up date) or Escalated","Deleted"], a:1}],
   check:() => did("settings", e=>e.tab==="Email Settings")}
 ]},
 {d:2, title:"Calls and booking", read:["m1-1","m1-2","m1-3","m1-4","m1-5","m1-6","m1-7","m1-8","m1-9","m2-1"], tasks:[
  {id:"d2-search", les:"m1-1", t:"Find a caller before you make anything", b:"A caller says: \"This is Maria Lopez, 77 Oak Ave.\" Search Customers, open her record and read the Job Notes.",
   hint:"Customers > Search for customers (Name or Address) > open her > Job Notes", hk:["nav-customers","cust-search","cust-search-field","cust-c7","cust-jobnotes"],
   q:[{q:"What does the tech need to know?", o:["Gate code 4512, dog in the yard, call on arrival","Side door, ring twice","Check in at the office first"], a:0}],
   check:() => did("search") && did("open-cust", e=>e.id==="c7")},
  {id:"d2-book", les:"m1-2", t:"Book a job and create the customer together", b:"New caller: Kevin Brooks, (555) 201-0170, 12 Elm St, Brookfield. Residential. Found you on Yelp. Water heater is leaking. Book it for Thu, Nov 5, 10:00 AM to 12:00 PM with Ben Foster, creating him as a new customer in the job form.",
   hint:"Work > Jobs > Create Job > Create new customer. Fill the customer, title, Ben Foster and the times.", hk:["nav-jobs","btn-createjob","cmode-new","f-nfirst","f-nls","f-title","u-u5","f-date","f-start","f-end","btn-savejob"],
   check:() => { const id = findCust("Kevin","Brooks"); if(!id) return false; const j = Object.values(W.jobs).find(x=>x.c===id); return !!j && j.date==="11-05" && j.s===10 && j.e===12 && j.users.includes("u5") && C_(id).ls==="Yelp"; }},
  {id:"d2-missed", les:"m1-3", t:"Return a missed call", phone:true, b:"Your phone system shows two missed calls (see below). Search Customers by phone and open the caller who already has a record.",
   hint:"Customers > set the search field to Phone > type the number", hk:["nav-customers","cust-search-field","cust-search","cust-c9"],
   q:[{q:"Can FieldPulse send an automatic text to a missed caller?", o:["Yes, with Engage","No, not with or without Engage","Yes, always"], a:1}],
   check:() => did("search", e=>e.f==="Phone") && did("open-cust", e=>e.id==="c9")},
  {id:"d2-calls", les:"m1-9", t:"Know how call reviews work", b:"Read lesson M1-9, then answer. (Call recordings live in the phone system, not in this practice copy.)",
   hint:"Lesson M1-9: Review call recordings weekly", hk:[],
   q:[{q:"Which calls do you review each week?", o:["Only booked calls","5 per person: booked, not booked and missed-then-returned","Only complaints"], a:1},{q:"The same miss shows up twice. What do you fix?", o:["The person only","The call script or the training","Nothing"], a:1}],
   check:() => true},
  {id:"d2-emerg", les:"m1-4", t:"Book an emergency so it stands out", b:"Grace Kim has a burst pipe at home. Book an emergency job from the \"Emergency / After-Hours Call\" template for today, Wed Nov 4, 3:00 PM to 5:00 PM, with Carlos Diaz. Then look at it on the Schedule (Dispatch).",
   hint:"Work > Jobs > Create Job > Import Template: Emergency / After-Hours Call. Then Schedule.", hk:["nav-jobs","btn-createjob","f-tpl","f-cust","u-u4","f-date","f-start","f-end","btn-savejob","nav-schedule"],
   check:() => { const e = EV.find(x=>x.k==="job-create" && x.tpl==="Emergency / After-Hours Call"); if(!e) return false; const j = W.jobs[e.id]; return j.c==="c1" && j.date==="11-04" && j.s===15 && j.users.includes("u4") && j.tags.includes("Flag: Emergency / After Hours") && evAfter("nav", e.t, x=>x.p==="schedule"); }},
  {id:"d2-web", les:"m1-5", t:"Work a web request", b:"Open Booking Requests. Make Hannah Cole's customer and job together (Customer & Job). Then open her customer record and set the Lead Source to Website.",
   hint:"Management > Booking Requests > Create New > Customer & Job. Then Customers > Hannah Cole > Edit.", hk:["nav-booking","bk-new-b1","bk-both-b1","btn-savejob","btn-conf-yes"],
   check:() => { const id = findCust("Hannah","Cole"); return !!id && C_(id).ls==="Google Search" && Object.values(W.jobs).some(j=>j.c===id); }},
  {id:"d2-web2", les:"m1-5", t:"Don't make a duplicate from a web request", b:"Peter Shaw's request uses a new email, so FieldPulse won't match it. He is already a customer. Book the job on his existing record: \"Slow drain in the basement\", Fri Nov 6, 1:00 to 3:00 PM, Mike Turner.",
   hint:"Customers > search Peter Shaw > Create Job (don't use Create New on the request)", hk:["nav-customers","cust-search","cust-c8","btn-cust-createjob","u-u6","btn-savejob"],
   check:() => Object.values(W.jobs).some(j=>j.c==="c8" && /drain/i.test(j.title) && j.date==="11-06" && j.users.includes("u6") && j.created===TODAY) && Object.keys(W.cust).filter(id=>/peter/i.test(W.cust[id].first)&&/shaw/i.test(W.cust[id].last)).length===1},
  {id:"d2-report", les:"m1-6", t:"Catch jobs with no lead source", b:"Reporting > Jobs > Raw Data. Set the dates from Jan 1 to today and Load Data. In Filters, open Customer Lead Source (Customer group), untick (Select All) and tick (Blanks). Save it as a new report.",
   hint:"Management > Reporting > Jobs > Raw Data > Load Data > Filters > Customer Lead Source > (Blanks) > Save > Save Report as New", hk:["nav-rep","rt-jobs","rd-range","btn-loaddata","btn-rep-filters","f-custLS","fall-custLS","fv-custLS-(Blanks)","btn-saverep","btn-saverep-new"],
   q:[{q:"Which customer has the most jobs with no lead source?", o:["Dana Ruiz","Sunset Apartments LLC","Linda Parks"], a:0}],
   check:() => did("rep-save", e=>e.tab==="jobs" && e.filters.custLS && e.filters.custLS.vals && e.filters.custLS.vals.length===1 && e.filters.custLS.vals[0]==="(Blanks)")},
  {id:"d2-outside", les:"m1-8", t:"Fix a job made outside the office", msg:"New jobs channel, 7:52 AM. Ben: \"Made a job for Carla Dunn in the app, leaky shower Fri 3 PM. Grace Kim sent her our way.\"", b:"Ben made job #1058 for Carla Dunn in the app with no lead source. Open Carla's customer record and set her real lead source. (Grace Kim referred her.)",
   hint:"Customers > Carla Dunn > Edit > Lead Source: Referral", hk:["nav-customers","cust-c17","btn-cust-edit","f-ls","btn-savecust"],
   q:[{q:"What do you do after it's fixed?", o:["Nothing","Reply in the same thread so Ben knows it's handled","Delete his message"], a:1}],
   check:() => C_("c17").ls==="Referral"},
  {id:"d2-card", les:"m1-7", t:"Save a card on file", b:"Owen Price wants a card on file and said yes to storing it. Add it with the practice number 4242 4242 4242 4242. Tick the consent box.",
   hint:"Customers > Owen Price > Saved Payment Methods > + Add New Payment Method", hk:["nav-customers","cust-c14","btn-addcard","f-cnum","f-consent","btn-savecard"],
   check:() => (C_("c14").cards||[]).length>0},
  {id:"d2-tpl", les:"m2-1", t:"Book from a template", b:"Book a drain cleaning for Ruth Daniels from the Service Call - Evaluation template. Click Find Availability and pick an open time. Check the arrival window is 2 hours.",
   hint:"Work > Jobs > Create Job > Import Template: Drain Cleaning > Find Availability > Suggest Times > Select a time > Customer Arrival Window", hk:["nav-jobs","btn-createjob","f-tpl","f-cust","btn-findavail","btn-suggest","slot-0","f-win","btn-savejob"],
   check:() => { const e = EV.find(x=>x.k==="job-create" && x.tpl==="Service Call - Evaluation" && x.c==="c15"); if(!e) return false; const j = W.jobs[e.id]; return j.ws!=null && j.we-j.ws===2 && j.tags.includes("Type: Service Call") && EV.some(x=>x.k==="slot-pick" && x.t<e.t); }}
 ]},
 {d:3, title:"Scheduling and invoicing", read:["m2-2","m2-3","m2-4","m2-5","m2-6","m3-1","m3-2","m3-3","m3-4","m3-10","m7-3"], tasks:[
  {id:"d3-visit", les:"m2-2", t:"Add a second visit", b:"Job #1038 (Ruth Daniels repipe) needs a return trip Mon, Nov 9, 9:00 to 11:00 AM with Carlos Diaz. Add a site visit. If FieldPulse warns about a conflict, move it to 1:00 to 3:00 PM instead.",
   hint:"Work > Jobs > #1038 > Add Site Visit", hk:["nav-jobs","job-1038","btn-addvisit","f-vname","f-date","f-start","f-end","u-u4","btn-savevisit","btn-conflict-back"],
   check:() => W.jobs["1038"].visits.some(v=>v.date==="11-09" && v.users.includes("u4") && v.s>=11)},
  {id:"d3-confirm", les:"m2-3", t:"Check a confirmation went out", b:"Rita Gomez's job #1045 was booked yesterday. Check the Communications log for a confirmation. You then called her and she confirmed, so write \"Confirmed by phone\" in the job's Notes.",
   hint:"Management > Communications. Then Work > Jobs > #1045 > Edit > Notes", hk:["nav-comms","nav-jobs","job-1045","btn-job-edit","f-notes","btn-savejob"],
   q:[{q:"Did FieldPulse send Rita a confirmation?", o:["Yes, by text","No, nothing went out","Yes, by email"], a:1}],
   check:() => did("nav", e=>e.p==="comms") && /confirm/i.test(W.jobs["1045"].notes)},
  {id:"d3-move", les:"m2-4", t:"Reschedule a job", b:"Rita can't do Thursday now. Move job #1045 to Fri, Nov 6, 2:00 to 4:00 PM. Keep Mike Turner on it.",
   hint:"Work > Jobs > #1045 > Edit > Date, Start Time, End Time > Save Job", hk:["nav-jobs","job-1045","btn-job-edit","f-date","f-start","f-end","btn-savejob"],
   check:() => { const j = W.jobs["1045"]; return j.date==="11-06" && j.s===14 && j.e===16 && j.users.includes("u6"); }},
  {id:"d3-cancel", les:"m2-4", t:"Cancel a job the right way", b:"Tom Baker canceled job #1047. He found someone cheaper. Cancel the job and write the reason in the job Notes.",
   hint:"Work > Jobs > #1047 > click Canceled in the status bar. Then Edit > Notes.", hk:["nav-jobs","job-1047","chip-Canceled","btn-job-edit","f-notes"],
   check:() => W.jobs["1047"].st==="Canceled" && (W.jobs["1047"].notes||"").trim().length>3 && !W.jobs["1047"].archived},
  {id:"d3-dispatch", les:"m2-5", t:"Put a waiting job on the board", b:"On Schedule (Dispatch), go to Thu 5, click the hourglass to show Unassigned Jobs, and put #1050 on Mike Turner at 8:00 AM.",
   hint:"Schedule > Thu 5 > hourglass > drag #1050 (or click it, then click Mike at 8 AM) > Yes", hk:["nav-schedule","sd-11-05","btn-hourglass","un-1050","cell-u6-8","btn-sched-yes"],
   check:() => { const j = W.jobs["1050"]; return j.date==="11-05" && j.s===8 && j.users.length===1 && j.users[0]==="u6"; }},
  {id:"d3-view", les:"m2-5", t:"Save a view for stalled jobs", b:"On the Jobs list, open Filters. Tick the open statuses (New, On The Way, In Progress), set Job Start Date to Last 15 Days, and save it as a new view called Stalled jobs.",
   hint:"Work > Jobs > Filters > Status: New, On The Way, In Progress > Job Start Date: Last 15 Days > Save Filters As New View", hk:["nav-jobs","btn-job-filters","btn-saveview","f-viewname","btn-saveviewname"],
   check:() => did("view-save", e=>e.f.sd==="Last 15 Days" && ["New","On The Way","In Progress"].every(s=>e.f.st.includes(s)))},
  {id:"d3-why", les:"m2-6", t:"Find why a job won't close", b:"Carlos says he can't close job #1033. Open its Subtasks tab and find out why.",
   hint:"Work > Jobs > #1033 > Subtasks", hk:["nav-jobs","job-1033","tab-Subtasks"],
   q:[{q:"What is still open?", o:["Customer walk-through done","Area cleaned up","Photos before and after"], a:0}],
   check:() => did("job-tab", e=>e.id==="1033" && e.v==="Subtasks")},
  {id:"d3-closeout", les:"m2-6", t:"Add a closeout list", b:"Job #1036 (water heater install) needs the Closeout checklist. Create a new series, insert the template, tick the box to require the subtasks before Completed, and submit.",
   hint:"Work > Jobs > #1036 > Subtasks > Create New Series > + Insert Template > Subtask Required > Submit", hk:["nav-jobs","job-1036","tab-Subtasks","btn-newseries","f-stpl","btn-inserttpl","f-sreq","btn-seriessubmit"],
   check:() => W.jobs["1036"].subtasks.some(s=>s.tpl==="Closeout checklist" && s.items.every(i=>i.req))},
  {id:"d3-inv", les:"m3-1", t:"Create an invoice from a job", b:"Job #1031 (Peter Shaw, kitchen sink clog) is done but has no invoice. Create the invoice from the job, add the item \"Drain cleaning - sink\", save it, then Finalize it.",
   hint:"Work > Jobs > All > #1031 > Actions > Create Invoice > Add Item > Save Invoice > Finalize Invoice", hk:["nav-jobs","jv-All","job-1031","btn-job-actions","m-createinv","btn-additem","item-Drain cleaning - sink","btn-additem-confirm","btn-saveinv","btn-finalize"],
   check:() => Object.values(W.inv).some(i=>i.job==="1031" && i.st!=="Invoice Draft" && i.st!=="Void" && i.items.some(x=>x.n==="Drain cleaning - sink"))},
  {id:"d3-send", les:"m3-2", t:"Send the invoice with a pay link", b:"Send that new invoice to Peter by email. Turn on Include Payment Request for the full amount, and tick Simultaneously Send SMS To Customer.",
   hint:"Invoice > Preview > Email To Customer > Include Payment Request > Simultaneously Send SMS To Customer > Send", hk:["btn-inv-preview","btn-emailcust","sv-pr","sv-amt","sv-sms","btn-send"],
   check:() => did("send", e=>e.kind==="inv" && W.inv[e.id] && W.inv[e.id].job==="1031" && e.pr && e.sms)},
  {id:"d3-noinv", les:"m3-3", t:"Find finished jobs with no invoice", b:"On the Jobs list, click All first (the Open view hides finished jobs). Then open Filters. Tick Completed under Status, set Invoice Status to Not Yet Invoiced, and save it as a new view.",
   hint:"Work > Jobs > All > Filters > Status: Completed > Invoice Status: Not Yet Invoiced > Save Filters As New View", hk:["nav-jobs","jv-All","btn-job-filters","jf-inv","btn-saveview","btn-saveviewname"],
   q:[{dyn:"noinv"}],
   check:() => did("view-save", e=>e.f.st.includes("Completed") && e.f.inv==="Not Yet Invoiced")},
  {id:"d3-check", les:"m3-4", t:"Record a check payment", b:"Grace Kim mailed check #1188 for $350.00 toward invoice #2036. Record it with Mark Payment, and put the check number in Notes.",
   hint:"Sales > Invoices > #2036 > Payment > Mark Payment > Method: Check", hk:["nav-invoices","inv-2036","btn-payment","m-markpay","f-method","f-amt","f-pnote","btn-savepay"],
   check:() => W.inv["2036"].pays.some(p=>p.method==="Check" && Math.abs(p.amt-350)<0.01 && /1188/.test(p.note))},
  {id:"d3-review", les:"m3-10", t:"Know when review requests go out", b:"Open the review request trigger in Company Settings > Review > Triggers. Then answer.",
   hint:"Company Settings > Review > Triggers", hk:["nav-settings","set-review","settab-Triggers"],
   q:[{q:"When does this company's review request go out?", o:["When the job is booked","When the job is set to Completed","When the estimate is sent"], a:1},{q:"A paid customer complained about a mess. Do you ask for a review?", o:["Yes, right away","No, skip it","Only by text"], a:1}],
   check:() => did("settings", e=>e.tab==="Triggers")},
  {id:"d3-permit", les:"m7-3", t:"Record a permit on a job", b:"Job #1036 (water heater install) needs a permit. Put BP-2291 in the job's Permit Number field under Additional Fields.",
   hint:"Work > Jobs > #1036 > Edit > Additional Fields > Permit Number > Save Job", hk:["nav-jobs","job-1036","btn-job-edit","btn-savejob"],
   check:() => /BP-2291/i.test((W.jobs["1036"].cf||{}).permit||"")}
 ]},
 {d:4, title:"Getting paid and estimates", read:["m3-5","m3-6","m3-7","m3-8","m3-9","m4-1","m4-2","m4-3","m4-4","m4-5","m7-1","m7-6"], tasks:[
  {id:"d4-chase", les:"m3-5", t:"Build the unpaid invoices list", b:"Reporting > Invoices > Raw Data. Date Type: Due Date. Date Range: start before the oldest unpaid invoice, end today. Load Data. In Filters, set Status to only Invoiced, Sent and Partially Paid, and Amount Due Greater Than 0. Save it as a new report.",
   hint:"Reporting > Invoices > Raw Data > Filters > Status and Amount Due > Save > Save Report as New", hk:["nav-rep","rt-invoices","rd-dt","rd-range","btn-loaddata","btn-rep-filters","f-status","f-amountDue","btn-saverep","btn-saverep-new"],
   q:[{q:"Who owes the most on an invoice that is more than 60 days past due?", o:["Sunset Apartments LLC","Robert Hayes","Ruth Daniels"], a:0}],
   check:() => did("rep-save", e=>{ if(e.tab!=="invoices") return false; const s = e.filters.status && e.filters.status.vals; const a = e.filters.amountDue; return !!s && ["Invoiced","Partially Paid"].every(x=>s.includes(x)) && !["Invoice Draft","Void","Paid"].some(x=>s.includes(x)) && a && a.op==="Greater Than" && +a.val===0; })},
  {id:"d4-void", les:"m3-6", t:"Void a duplicate invoice", b:"Invoice #2044 is a duplicate of #2043 (Owen Price). Open #2044, check its Payments tab first, then void it.",
   hint:"Sales > Invoices > #2044 > Payments tab (check it has none) > Info tab > Actions > Void Invoice (or Void in the status bar)", hk:["nav-invoices","inv-2044","itab-Payments","itab-Info","btn-inv-actions","m-void"],
   check:() => W.inv["2044"].st==="Void" && W.inv["2043"].st!=="Void" && EV.some(e=>e.k==="inv-tab" && e.id==="2044" && e.v==="Payments" && EV.some(x=>x.k==="inv-void" && x.id==="2044" && x.t>e.t))},
  {id:"d4-refund", les:"m3-7", t:"Refund a double charge", b:"Peter Shaw was charged twice on invoice #2039. Your manager OK'd refunding one $189.00 card payment. Add a reason.",
   hint:"Sales > Invoices > #2039 > Payments > click a payment > Refund", hk:["nav-invoices","inv-2039","itab-Payments","pay-p3","btn-refund","f-ramt","f-rreason","btn-refund-confirm"],
   check:() => { const L = W.inv["2039"].pays.flatMap(p=>p.refunds); return L.length===1 && Math.abs(L[0].amt-189)<0.01; }},
  {id:"d4-progress", les:"m3-8", t:"Bill a stage of a big job", b:"Alan Brooks's remodel (invoice #2050) is billed in stages. Send stage 1 for 50% of the total by email.",
   hint:"Sales > Invoices > #2050 > Actions > Generate Progress Invoice > Percentage Of Total > Save > Email To Customer", hk:["nav-invoices","inv-2050","btn-inv-actions","m-progress","f-pmode","f-pval","btn-prog-save","btn-prog-email"],
   check:() => W.inv["2050"].progress.some(p=>p.how==="Emailed" && Math.abs(p.amt - invTotal(W.inv["2050"])/2) < 0.02)},
  {id:"d4-po", les:"m3-9", t:"Add a customer's PO number", b:"Lakeside Property Mgmt sent PO 7781 for invoice #2048. There is no PO field yet, so put \"PO 7781\" in the Invoice Notes.",
   hint:"Sales > Invoices > #2048 > Edit > Invoice Notes", hk:["nav-invoices","inv-2048","btn-inv-edit","f-invnotes","btn-saveinv"],
   q:[{q:"Where does a customer's PO number NOT go?", o:["The invoice notes","The Purchase Orders page","A PO field your Admin adds"], a:1}],
   check:() => /7781/.test(W.inv["2048"].notes)},
  {id:"d4-coi", les:"m7-1", t:"Tag a customer who needs a COI", b:"Lakeside Property Mgmt needs a certificate of insurance before every job. Add the COI Required customer tag from the list.",
   hint:"Customers > Lakeside Property Mgmt > Edit > Tags: COI Required", hk:["nav-customers","cust-c11","btn-cust-edit","m.tags","tag-COI Required","btn-savecust"],
   q:[{q:"Where is the COI's expiry date tracked?", o:["FieldPulse reminds you","On the COIs tab of the compliance tracker (TPL-04)","On the invoice"], a:1}],
   check:() => (C_("c11").tags||[]).includes("COI Required")},
  {id:"d4-est", les:"m4-1", t:"Build an estimate with options", b:"Nora Fields wants choices on her water softener (job #1052). From the job, create an estimate with two options: \"Repair\" with Water softener repair, and \"Replace\" with Water softener install. Save it.",
   hint:"Work > Jobs > #1052 > Actions > Create Estimate > click the option tab name to rename it > Apply > Add Item > + Add Estimate Option > Save Estimate", hk:["nav-jobs","job-1052","btn-job-actions","m-createest","btn-additem","btn-addoption","btn-optrename","btn-saveest"],
   check:() => Object.values(W.est).some(e=>e.job==="1052" && e.opts.length>=2 && e.opts.some(o=>/repair/i.test(o.name) && o.items.some(x=>x.n==="Water softener repair")) && e.opts.some(o=>/replace/i.test(o.name) && o.items.some(x=>x.n==="Water softener install")))},
  {id:"d4-send", les:"m4-2", t:"Send an estimate and ask for a deposit", b:"Send estimate #3021 (Tom Baker) by email with a signature request and a 25% deposit.",
   hint:"Sales > Estimates > #3021 > View Estimate > Email To Customer > Include Signature Request > Include Payment Request 25 % > Send", hk:["nav-estimates","est-3021","btn-viewest","btn-emailcust","sv-sig","sv-pr","sv-amt","sv-unit","btn-send"],
   check:() => did("send", e=>e.kind==="est" && e.id==="3021" && e.sig && e.pr && +e.amt===25 && e.unit==="%")},
  {id:"d4-follow", les:"m4-3", t:"Follow up on open estimates", b:"Open Estimates > By Status and filter to Sent estimates for Carlos Diaz. You called Nora Fields about #3015: set it to Follow Up Sent and set a reminder for Mon, Nov 9.",
   hint:"Sales > Estimates > By Status > Show Filters > Status: Sent, Team Member: Carlos Diaz. Then #3015 > status bar, and Actions > Set a Reminder.", hk:["nav-estimates","et-By Status","ef-by","est-3015","chip-Follow Up Sent","btn-est-actions","m-reminder","f-rdate","btn-saverem"],
   check:() => did("est-filter", e=>e.f.by==="u4" && e.f.st.includes("Sent")) && W.est["3015"].st==="Follow Up Sent" && (W.est["3015"].reminder||{}).date==="11-09"},
  {id:"d4-won", les:"m4-4", t:"Mark estimates won and lost", b:"Owen Price said yes to #3012 by phone. Robert Hayes went with another company on #3017 (your manager says use Lost).",
   hint:"Estimate > click Accepted (or Lost) in the status bar, or Actions > Lost Estimate", hk:["nav-estimates","est-3012","chip-Accepted","est-3017","chip-Lost"],
   check:() => W.est["3012"].st==="Accepted" && W.est["3017"].st==="Lost"},
  {id:"d4-sold", les:"m4-5", t:"Book the sold work", b:"Filter Estimates to Accepted. Find the one with no job (a '-' in Project/Job). Create a job for it from the estimate.",
   hint:"Sales > Estimates > Show Filters > Accepted. Open the one with '-' > Actions > Create Job", hk:["nav-estimates","btn-est-filters","est-3018","btn-est-actions","m-est-createjob","btn-savejob"],
   q:[{q:"Before you click Convert to Invoice, which setting should your manager confirm is on?", o:["Keep an Estimate Record when Converting to an Invoice","Lock invoices once finalized","Tax Exempt"], a:0}],
   check:() => !!W.est["3018"].job && !!W.jobs[W.est["3018"].job]},
  {id:"d4-tax", les:"m7-6", t:"Handle a tax-exempt request", b:"Sunset Apartments says they shouldn't pay sales tax. Open their customer record and look at the Tax Exempt setting. Don't change it. Then answer.",
   hint:"Customers > Sunset Apartments LLC", hk:["nav-customers","cust-c16"],
   q:[{q:"What do you do?", o:["Turn on Tax Exempt now","Take the tax off their next invoice by hand","Get their exemption certificate on file and check with the tax filer first"], a:2}],
   check:() => did("open-cust", e=>e.id==="c16") && !C_("c16").tax}
 ]},
 {d:5, title:"Books, payroll and reports", read:["m5-1","m5-2","m5-3","m5-4","m5-5","m5-6","m5-7","m6-1","m6-2","m6-3","m6-4","m6-5","m6-6","m7-2","m7-5"], tasks:[
  {id:"d5-qb", les:"m5-1", t:"Fix QuickBooks sync errors", b:"Open the QuickBooks Online Statistic page. Fix the first failure in the chain (the customer), then sync the invoice again. Set both fixed rows to Closed.",
   hint:"Company Settings > Estimates & Invoices > QuickBooks > QuickBooks Online Statistic. Open the customer > Sync with QuickBooks. Then invoice #2040 > Re-Sync. Then Review Status: Closed.", hk:["nav-settings","set-einv","settab-QuickBooks","btn-qbstat","qb-q1","btn-qb-sync-cust","qb-q2","btn-qb-sync-inv","qbrev-q1","qbrev-q2"],
   q:[{q:"Which error goes to the bookkeeper?", o:["The Water softener install item with no income account","Invoice #2040","The Lakeside customer"], a:0}],
   check:() => C_("c11").qb!=="failed" && W.inv["2040"].qb!=="failed" && W.qb.find(q=>q.id==="q1").rev==="Closed" && W.qb.find(q=>q.id==="q2").rev==="Closed"},
  {id:"d5-final", les:"m5-2", t:"Finalize a draft so it can sync", b:"Dana Ruiz's invoice #2046 is ready but still a draft. Finalize it.",
   hint:"Sales > Invoices > #2046 > Finalize Invoice", hk:["nav-invoices","inv-2046","btn-finalize"],
   q:[{q:"Do draft invoices go to QuickBooks?", o:["Yes","No, only once finalized","Only if paid"], a:1}],
   check:() => W.inv["2046"].st==="Invoiced"},
  {id:"d5-ts", les:"m5-3", t:"Fix a missing clock-out before payroll", b:"Timesheets > Team > Weekly. One tech never clocked out on Monday. He says he left at 4:30 PM. Open his Monday entry, set Clock Out to Mon, Nov 2, 4:30 PM and save. Then EXPORT the week.",
   hint:"Management > Timesheets > Team > Weekly > click the tech > click the Working entry > Time Log > Clock Out > Save. Then Weekly > EXPORT.", hk:["nav-ts","tsm-Team","tst-Weekly","btn-ts-save","f-cod","f-cot","btn-ts-export"],
   check:() => { const t = W.ts.find(x=>x.user==="u5" && x.date==="11-02"); const s = lastEv("ts-save", e=>e.user==="u5"); return !!t && Math.abs(t.co-16.5)<0.01 && !!s && evAfter("ts-export", s.t); }},
  {id:"d5-long", les:"m5-4", t:"Pull long shifts", b:"Reporting > Timesheets > Raw Data, This Week, Load Data. Filter Duration Decimal to Greater Than 8 and save it as a new report.",
   hint:"Reporting > Timesheets > Raw Data > Filters > Duration Decimal > Greater Than 8 > Apply > Save", hk:["nav-rep","rt-timesheets","btn-loaddata","btn-rep-filters","f-dur","fop-dur","fval-dur","fapply-dur","btn-saverep","btn-saverep-new"],
   q:[{q:"Who had the longest shift this week?", o:["Mike Turner","Carlos Diaz","Sam Ortiz"], a:0}],
   check:() => did("rep-save", e=>e.tab==="timesheets" && e.filters.dur && e.filters.dur.op==="Greater Than" && +e.filters.dur.val===8)},
  {id:"d5-leaver", les:"m5-5", t:"Close out a leaver", b:"Jake Wilson left yesterday. Your Admin asked you to do this with them: deactivate his login, then move his open job #1055 to Mike Turner (untick Jake).",
   hint:"Team Members > Jake Wilson > Edit > User Status: Deactivated > Save. Then #1055 > Edit > assign Mike.", hk:["nav-team","user-u7","btn-user-edit","f-ustatus","btn-saveuser","nav-jobs","job-1055","btn-job-edit","u-u6","btn-savejob"],
   check:() => W.users.u7.st==="Deactivated" && W.jobs["1055"].users.length===1 && W.jobs["1055"].users[0]==="u6"},
  {id:"d5-rep", les:"m6-1", t:"Build a saved report", b:"Reporting > Jobs > Raw Data, Jan 1 to today, Load Data. Group by Status (drag the Status column into the bar; the Group by list is a practice shortcut), then save it as \"Jobs by status\".",
   hint:"Reporting > Jobs > Raw Data > group bar > Save > Save Report as New", hk:["nav-rep","rt-jobs","rd-range","btn-loaddata","groupbar","group-select","btn-saverep","btn-saverep-new"],
   check:() => did("rep-save", e=>e.tab==="jobs" && e.group==="status" && !e.widget)},
  {id:"d5-widget", les:"m6-2", t:"Put a report on the dashboard", b:"In Reporting, open a Raw Data tab and click Load Data. Save a report as a widget (Save > Save Report as Widget). Then go to Pulse Dashboard > Configure Dashboard, set one widget to Custom with your new widget, and Save Dashboard.",
   hint:"Reporting > Raw Data > Save > Save Report as Widget. Then Pulse Dashboard > Configure Dashboard > Widget Type: Custom", hk:["nav-rep","btn-saverep","btn-saverep-widget","nav-dash","dash-config","f-w0t","f-w0","btn-savedash"],
   check:() => { const names = EV.filter(e=>e.k==="rep-save" && e.widget).map(e=>e.name); return names.length && W.dash.some(w=>w.type==="Custom" && names.includes(w.w)); }},
  {id:"d5-pay", les:"m6-3", t:"Payments by person", b:"Reporting > Payments > Reports. Set Group By to By User for This Week. This groups payments by person.",
   hint:"Reporting > Payments > Reports > Group By: By User", hk:["nav-rep","rt-payments","rs-Reports","pr-kind"],
   q:[{q:"Which user has the most payments this week?", o:["Mike Turner","Carlos Diaz","Ben Foster"], a:0}],
   check:() => did("pr", e=>e.kind==="By User")},
  {id:"d5-close", les:"m6-4", t:"Estimate close rate", b:"Reporting > Estimates > Raw Data, Date Type Invoiced Date, Jan 1 to today, Load Data. Click Quick Reports: Conversion Rate, grouped by Estimate Creator.",
   hint:"Reporting > Estimates > Raw Data > Quick Reports > Conversion Rate by Estimate Creator > Configure Pivot Table", hk:["nav-rep","rt-estimates","rd-range","btn-loaddata","btn-quickreports","f-qf","f-qb","btn-pivot"],
   q:[{q:"Whose close rate is highest?", o:["Carlos Diaz","Ben Foster","Mike Turner"], a:0}],
   check:() => did("pivot", e=>e.tab==="estimates" && e.field==="Conversion Rate" && e.by==="Estimate Creator")},
  {id:"d5-ls", les:"m6-5", t:"Jobs by lead source", b:"Reporting > Jobs > Raw Data, Jan 1 to today, Load Data. Group by Customer Lead Source and save the report.",
   hint:"Reporting > Jobs > Raw Data > drag Customer Lead Source into the group bar (or the practice shortcut) > Save > Save Report as New", hk:["nav-rep","rt-jobs","rd-range","btn-loaddata","group-select","btn-saverep","btn-saverep-new"],
   q:[{q:"Which group has the most jobs?", o:["(Blanks), no lead source","Google Search","Referral"], a:0}],
   check:() => did("rep-save", e=>e.tab==="jobs" && e.group==="custLS")},
  {id:"d5-owner", les:"m6-6", t:"Send the owner their numbers", b:"Reporting > Payments > Raw Data. Click Load Data, then open the saved report \"Owner weekly - Payments\" from Select Report and click Export CSV.",
   hint:"Reporting > Payments > Raw Data > Load Data > Select Report > Owner weekly - Payments > Export CSV", hk:["nav-rep","rt-payments","btn-loaddata","btn-selectreport","rep-Owner weekly - Payments","btn-export"],
   q:[{q:"Who decides which numbers the owner gets?", o:["The owner, through your manager","You pick them","The techs"], a:0}],
   check:() => did("rep-export", e=>e.name==="Owner weekly - Payments")},
  {id:"d5-hire", les:"m5-6", t:"Set up a new tech's login", b:"Dylan Shore starts Monday as a tech. Add him as a team member: email dylan.shore@example.com, role Service Agent, team Service.",
   hint:"Management > Team Members > Add Team Member", hk:["nav-team","btn-adduser","f-nuf","f-nue","f-nur","f-nut","btn-createuser"],
   check:() => Object.values(W.users).some(u=>/dylan/i.test(u.name) && u.role==="Service Agent" && u.teams.includes("Service"))},
  {id:"d5-hiring", les:"m5-7", t:"Know the hiring basics", b:"Read lesson M5-7, then answer. (Hiring lives outside FieldPulse.)",
   hint:"Lesson M5-7: Help run the hiring pipeline", hk:[],
   q:[{q:"When do references and checks happen?", o:["After the offer","Before any offer","Only if the owner asks"], a:1}],
   check:() => true},
  {id:"d5-license", les:"m7-2", t:"Know what to do when a license lapses", b:"Read lesson M7-2, then answer.",
   hint:"Lesson M7-2: Track licenses and certifications", hk:[],
   q:[{q:"A tech's certification lapsed today. What do you do the same day?", o:["Nothing until it's renewed","Remove their skill tag and tell the dispatcher","Deactivate their login"], a:1}],
   check:() => true},
  {id:"d5-warranty", les:"m7-5", t:"Save a warranty registration", b:"You registered the new water heater from job #1036 with the manufacturer. Save the confirmation number WR-55810 in the job's Notes.",
   hint:"Work > Jobs > #1036 > Edit > Notes", hk:["nav-jobs","job-1036","btn-job-edit","f-notes","btn-savejob"],
   check:() => /WR-55810/.test(W.jobs["1036"].notes)}
 ]}
];
(function(){
  const DAYOF = {"f-1": 1, "f-2": 1, "f-3": 1, "f-4": 1, "f-5": 1, "f-6": 1, "f-7": 1, "m1-1": 1, "m1-2": 1, "m1-3": 1, "m1-4": 1, "m1-5": 1, "m1-6": 2, "m1-7": 2, "m1-8": 2, "m1-9": 2, "m2-1": 2, "m2-2": 2, "m2-3": 2, "m2-4": 2, "m2-5": 2, "m2-6": 2, "m3-1": 3, "m3-2": 3, "m3-3": 3, "m3-4": 3, "m3-5": 3, "m3-6": 3, "m3-7": 3, "m3-8": 3, "m3-9": 3, "m3-10": 3, "m4-1": 3, "m4-2": 3, "m4-3": 3, "m4-4": 3, "m4-5": 3, "m5-1": 4, "m5-2": 4, "m5-3": 4, "m5-4": 4, "m5-5": 4, "m5-6": 4, "m5-7": 4, "m6-1": 5, "m6-2": 5, "m6-3": 5, "m6-4": 5, "m6-5": 5, "m6-6": 5, "m7-1": 4, "m7-2": 4, "m7-3": 4, "m7-4": 4, "m7-5": 4, "m7-6": 4}, ORDER = ["f-1", "f-2", "f-3", "f-4", "f-5", "f-6", "f-7", "m1-1", "m1-2", "m1-3", "m1-4", "m1-5", "m1-6", "m1-7", "m1-8", "m1-9", "m2-1", "m2-2", "m2-3", "m2-4", "m2-5", "m2-6", "m3-1", "m3-2", "m3-3", "m3-4", "m3-5", "m3-6", "m3-7", "m3-8", "m3-9", "m3-10", "m4-1", "m4-2", "m4-3", "m4-4", "m4-5", "m5-1", "m5-2", "m5-3", "m5-4", "m5-5", "m5-6", "m5-7", "m6-1", "m6-2", "m6-3", "m6-4", "m6-5", "m6-6", "m7-1", "m7-2", "m7-3", "m7-4", "m7-5", "m7-6"];
  const TITLE = {1:"Basics and intake", 2:"Intake follow-up, scheduling and dispatch", 3:"Invoicing, payments and estimates", 4:"Payroll prep and compliance", 5:"Owner reporting (extra)"};
  const all = PROGRAM.flatMap(d => d.tasks);
  const NP = [1,2,3,4,5].map(n => ({d:n, title:TITLE[n], read:ORDER.filter(id => DAYOF[id]===n), tasks:all.filter(t => DAYOF[t.les]===n).sort((a,b) => ORDER.indexOf(a.les)-ORDER.indexOf(b.les))}));
  PROGRAM.length = 0; NP.forEach(x => PROGRAM.push(x));
  PROGRAM.forEach(d => d.tasks.forEach(t => Object.assign(t,{day:d.d})));
})();
const ALLTASKS = PROGRAM.filter(d => d.d <= 4).flatMap(d => d.tasks);
const TOTAL_TASKS = ALLTASKS.length;
const LESSON_TASK = {}; ALLTASKS.forEach(t => { if(!LESSON_TASK[t.les]) LESSON_TASK[t.les] = t; });

/* dynamic questions */
function dynQ(name){
  if(name==="noinv"){ const n = Object.values(W.jobs).filter(j=>!j.archived && j.st==="Completed" && jobInvStatus(W,j)==="Not Yet Invoiced").length; const o=[...new Set([n, n+2, n>0?n-1:n+1])].sort((x,y)=>x-y); return {q:"How many jobs are on your new view right now?", o:o.map(String), a:o.indexOf(n)}; }
  return null;
}
function taskQs(t){ return (t.q||[]).map(q => q.dyn ? dynQ(q.dyn) : q); }

/* progress for this page load */
let PROG = {tasks:{}, slips:{}};          // saved across reloads (via course storage)
let ANS = {};                               // answers this session: {taskId:{qi:{i,ok}}}
let HINTED = {};                            // taskId -> true when hint was opened
let CUR = 0;                                // index of current task in the day
let PVIEW = "day";                          // "day" | "results"
function dayTasks(d){ return (PROGRAM.find(x=>x.d===d)||PROGRAM[0]).tasks; }
function qsOk(t){ const qs = taskQs(t); return qs.every((q,i) => ANS[t.id] && ANS[t.id][i] && ANS[t.id][i].ok); }
function evaluate(){
  let changed = false;
  dayTasks(DAY).forEach(t => {
    if(PROG.tasks[t.id]) return;
    let ok = false; try{ ok = t.check() && qsOk(t); }catch(e){ ok = false; }
    if(ok){ PROG.tasks[t.id] = HINTED[t.id] ? "h" : "s"; changed = true; if(t===dayTasks(DAY)[CUR]) toast("Task done. Nice work.","ok"); }
  });
  const sl = SLIPS.filter(s=>s.day===DAY).map(s=>({t:s.text,s:s.serious}));
  if(JSON.stringify(PROG.slips[DAY]||[]) !== JSON.stringify(sl)){ PROG.slips[DAY] = sl; changed = true; }
  if(changed && window.FPCourse) window.FPCourse.savePractice(PROG);
}
function startDay(d, fresh){
  DAY = d; W = pfresh(); EV = []; resetUI(); HIST.length = 0; ANS = {}; HINTED = {}; CUR = 0; PVIEW = "day";
  /* saved slips stay with the day: only "Start Day over" clears them (a reload or day switch must not wipe a serious slip) */
  if(fresh) SLIPS = SLIPS.filter(s=>s.day!==d);
  if(fresh){ dayTasks(d).forEach(t => delete PROG.tasks[t.id]); PROG.slips[d] = []; if(window.FPCourse) window.FPCourse.savePractice(PROG); }
  const firstOpen = dayTasks(d).findIndex(t=>!PROG.tasks[t.id]); CUR = firstOpen<0 ? 0 : firstOpen;
}

/* rating */
function rating(){
  const vals = ALLTASKS.map(t=>PROG.tasks[t.id]);
  const done = vals.filter(Boolean).length, own = vals.filter(v=>v==="s").length;
  const serious = Object.entries(PROG.slips||{}).filter(([d]) => +d <= 4).flatMap(([d, L]) => L).filter(s=>s.s).length;
  const slips = Object.entries(PROG.slips||{}).filter(([d]) => +d <= 4).flatMap(([d, L]) => L).length;
  let r = "Not ready yet";
  if(done===TOTAL_TASKS && own>=Math.ceil(TOTAL_TASKS*0.85) && serious===0) r = "Ready";
  else if(done>=Math.ceil(TOTAL_TASKS*0.9) && serious<=1) r = "Ready with coaching";
  return {done, own, hint:done-own, serious, slips, r};
}

/* ---------- drawer ---------- */
function renderDrawer(){
  const P = PROGRAM.find(x=>x.d===DAY), L = P.tasks, t = L[CUR];
  const done = L.filter(x=>PROG.tasks[x.id]).length;
  const st = PROG.tasks[t.id];
  const lt = window.FPCourse ? window.FPCourse.lessonTitle(t.les) : t.les;
  let h = `<div class="px-dh"><div class="px-dt"><b>${DAY===5?"Extra":"Day "+DAY}: ${E(P.title)}</b><span>${done} of ${L.length}</span></div>
    <div class="px-prog"><i style="width:${Math.round(100*done/L.length)}%"></i></div>
    <div class="px-dots">${L.map((x,i)=>`<button class="px-dot ${PROG.tasks[x.id]==="s"?"s":PROG.tasks[x.id]==="h"?"h":""} ${i===CUR?"cur":""}" data-a="px-task" data-v="${i}" aria-label="Task ${i+1}${PROG.tasks[x.id]?" done":""}"></button>`).join("")}</div></div>
  <div class="px-task"><small class="muted">Task ${CUR+1} of ${L.length} · <button class="lnk" data-a="px-lesson" data-v="${t.les}">Lesson: ${E(lt)}</button>${window.FPCourse&&window.FPCourse.lessonSop(t.les)?` · SOP ${E(window.FPCourse.lessonSop(t.les))}`:""}</small>
    <h3>${E(t.t)}</h3><p class="px-brief">${E(t.b)}</p>`;
  if(t.msg) h += `<div class="px-phone"><b>Message</b><div>${E(t.msg)}</div></div>`;
  if(t.phone) h += `<div class="px-phone"><b>Your phone system (outside FieldPulse)</b><div>Missed: (555) 201-0109 · Wed 8:12 AM · no voicemail</div><div>Missed: (555) 201-0199 · Wed 9:40 AM · voicemail: "need a quote for a new toilet"</div></div>`;
  taskQs(t).forEach((q,qi) => {
    const a = (ANS[t.id]||{})[qi];
    h += `<div class="px-q"><p>${E(q.q)}</p><div class="px-opts">${q.o.map((o,oi)=>`<button class="${a&&a.i===oi?(a.ok?"right":"wrong"):""}" data-a="px-ans" data-q="${qi}" data-v="${oi}">${E(o)}</button>`).join("")}</div>${a&&!a.ok?`<small class="bad">Not quite. Look again in the app.</small>`:""}</div>`;
  });
  if(st) h += `<div class="px-done">${st==="s"?"Done on your own.":"Done, with a hint."}</div>`;
  else {
    h += `<p class="muted fp-small">Do it in the app on the left. This ticks itself when it's done.</p>`;
    h += HINTED[t.id] ? `<div class="px-path"><b>Where:</b> ${E(t.hint)}</div>` : `<button class="px-hintb" data-a="px-hint">Show me where (counts as a hint)</button>`;
  }
  h += `</div><div class="px-df"><div class="fp-row">${CUR>0?btn("px-prev","Back","ghost"):""}<span style="flex:1"></span>${CUR<L.length-1?btn("px-next", st?"Next task":"Skip for now", st?"green":"ghost"):btn("px-summary","Day summary","green")}</div>
   <small class="muted">Slips today: ${(PROG.slips[DAY]||[]).length}</small> <button class="lnk fp-small" data-a="px-restart">Start ${DAY===5?"Extra":"Day "+DAY} over</button></div>`;
  return h;
}

/* ---------- results / certificate ---------- */
function renderResults(){
  const R = rating();
  const tone = R.r==="Ready" ? "r-ok" : R.r==="Ready with coaching" ? "r-warn" : "r-bad";
  let h = `<div class="px-cert"><div class="px-ey">FieldPulse office manager practice · Days 1 to 4 · ${TOTAL_TASKS} tasks · Owner reporting is extra and not counted</div>
   <h2>Result: <span class="px-rb ${tone}">${E(R.r)}</span></h2>
   <div class="px-stats"><div><small>Done</small><b>${R.done}/${TOTAL_TASKS}</b></div><div><small>On their own</small><b>${R.own}</b></div><div><small>With a hint</small><b>${R.hint}</b></div><div><small>Slips</small><b>${R.slips}</b></div><div><small>Serious slips</small><b>${R.serious}</b></div></div>
   <div class="fp-tw"><table class="fp-t sm"><thead><tr><th>Day</th><th>Done</th><th>On own</th><th>Slips</th></tr></thead><tbody>${PROGRAM.map(d=>{ const v=d.tasks.map(t=>PROG.tasks[t.id]); return `<tr><td>${d.d===5?"Extra":"Day "+d.d}: ${E(d.title)}</td><td>${v.filter(Boolean).length}/${d.tasks.length}</td><td>${v.filter(x=>x==="s").length}</td><td>${(PROG.slips[d.d]||[]).length}</td></tr>`; }).join("")}</tbody></table></div>`;
  const miss = ALLTASKS.filter(t=>!PROG.tasks[t.id]), hinted = ALLTASKS.filter(t=>PROG.tasks[t.id]==="h");
  if(miss.length) h += `<details ${miss.length<=10?"open":""}><summary><b>Not done yet (${miss.length})</b></summary><ul>${miss.map(t=>`<li>Day ${t.day}: ${E(t.t)}</li>`).join("")}</ul></details>`;
  if(hinted.length) h += `<h3>Coach on these (used a hint)</h3><ul>${hinted.map(t=>`<li>Day ${t.day}: ${E(t.t)}</li>`).join("")}</ul>`;
  const sl = Object.entries(PROG.slips||{}).flatMap(([d,L])=>L.map(s=>`${+d===5?"Extra":"Day "+d}: ${s.s?"Serious: ":""}${s.t}`));
  if(sl.length) h += `<h3>Slips</h3><ul>${sl.map(s=>`<li>${E(s)}</li>`).join("")}</ul>`;
  h += `<p class="px-rule">How the result works: Ready = all ${TOTAL_TASKS} tasks done, at least ${Math.ceil(TOTAL_TASKS*0.85)} on their own, and no serious slips. Ready with coaching = at least ${Math.ceil(TOTAL_TASKS*0.9)} done and at most 1 serious slip. Anything less = Not ready yet. Serious slips: a duplicate customer, merging two different people, voiding an invoice with payments, moving a paid invoice back, deleting a time entry, saving a huge shift, deactivating the wrong person.</p>
   
   <div class="fp-row">${btn("px-copy","Copy results","green")}${btn("px-download","Download results","ghost")}${btn("px-back","Back to practice","ghost")}</div></div>`;
  return h;
}
function resultsText(){
  const R = rating();
  let s = `FieldPulse OM practice results\nResult: ${R.r}\nDone ${R.done}/${TOTAL_TASKS}, on own ${R.own}, with hint ${R.hint}, slips ${R.slips} (serious ${R.serious})\n`;
  PROGRAM.forEach(d => { const v=d.tasks.map(t=>PROG.tasks[t.id]); s += `${d.d===5?"Extra":"Day "+d.d} ${d.title}: ${v.filter(Boolean).length}/${d.tasks.length} done, ${v.filter(x=>x==="s").length} on own, ${(PROG.slips[d.d]||[]).length} slips\n`; });
  const sl = Object.entries(PROG.slips||{}).flatMap(([d,L])=>L.map(x=>`${+d===5?"Extra":"Day "+d}: ${x.s?"Serious: ":""}${x.t}`)); if(sl.length) s += "Slips:\n" + sl.map(x=>"- "+x).join("\n") + "\n";
  return s;
}

/* ===== render, events, and the hook into the course page ===== */
function renderMain(){
  const p = U.r.p;
  return ({dash:scrDash,customers:scrCustomers,customer:scrCustomer,jobs:scrJobs,job:scrJob,schedule:scrSchedule,estimates:scrEstimates,estimate:scrEstimate,invoices:scrInvoices,invoice:scrInvoice,preview:scrPreview,fppay:scrFPPay,pos:scrPOs,team:scrTeam,user:scrUser,ts:scrTS,tsm:scrTSMember,rep:scrRep,booking:scrBooking,comms:scrComms,settings:scrSettings,na:scrNA}[p]||scrDash)();
}
let LASTR = "";
function pxRender(){
  if(!ROOT) return;
  const ae = document.activeElement, focusF = ae && ROOT.contains(ae) && ae.dataset ? ae.dataset.f : null, caret = focusF && typeof ae.selectionStart==="number" ? ae.selectionStart : null;
  const rk = JSON.stringify(U.r)+"|"+(U.invRecTab||"")+(U.jobTab||"")+(U.estRecTab||""); const mainScroll = ROOT.querySelector(".fp-main") && LASTR===rk ? ROOT.querySelector(".fp-main").scrollTop : 0; LASTR = rk;
  const days = PROGRAM.map(d => { const n=d.tasks.filter(t=>PROG.tasks[t.id]).length; return `<button class="${DAY===d.d&&PVIEW==="day"?"on":""}" data-a="px-day" data-v="${d.d}"><b>${d.d===5?"Extra":"Day "+d.d}</b><span>${E(d.title)}</span><small>${n}/${d.tasks.length}</small></button>`; }).join("");
  const R = rating();
  let h = `<div class="px-days" role="group" aria-label="Practice days">${days}<button class="${PVIEW==="results"?"on":""}" data-a="px-results"><b>Result</b><span>${E(R.r)}</span><small>${R.done}/${TOTAL_TASKS}</small></button></div>`;
  if(PVIEW==="results"){ ROOT.innerHTML = h + renderResults(); return; }
  const P = PROGRAM.find(x=>x.d===DAY);
  h += `<p class="px-read">Read first: ${P.read.map(id=>`<button class="lnk" data-a="px-lesson" data-v="${id}">${E(window.FPCourse?window.FPCourse.lessonTitle(id):id)}</button>`).join(" · ")}</p>`;
  h += `<div class="fp-frame"><aside class="fp-side">${renderSide()}</aside><div class="fp-mainwrap"><header class="fp-top">${renderTop()}</header><div class="fp-main">${renderMain()}</div></div>${renderEngage()}<aside class="px-drawer" aria-label="Practice task">${renderDrawer()}</aside></div>`;
  h += renderModal();
  if(U.snack && Date.now()-U.snack.at < 4500) h += `<div class="fp-snack s-${U.snack.kind}" role="status">${E(U.snack.text)}</div>`;
  ROOT.innerHTML = h;
  const m = ROOT.querySelector(".fp-main"); if(m) m.scrollTop = mainScroll;
  // hint highlight
  const t = dayTasks(DAY)[CUR];
  if(t && HINTED[t.id] && !PROG.tasks[t.id]) t.hk.forEach(k => ROOT.querySelectorAll(`[data-hk="${CSS.escape(k)}"]`).forEach(el => el.classList.add("px-hl")));
  if(focusF){ const el = ROOT.querySelector(`[data-f="${CSS.escape(focusF)}"]`); if(el){ el.focus(); if(caret!=null && el.setSelectionRange){ try{ el.setSelectionRange(caret,caret); }catch(e){} } } }
}
let snackTimer = null;
function after(){
  evaluate(); pxRender();
  clearTimeout(snackTimer); if(U.snack) snackTimer = setTimeout(() => { U.snack = null; const s = ROOT && ROOT.querySelector(".fp-snack"); if(s) s.remove(); }, 4600);
}
function pxAct(a, ds){
  const L = dayTasks(DAY);
  switch(a){
    case "px-day": startDay(+ds.v, false); return true;
    case "px-results": PVIEW = "results"; return true;
    case "px-back": PVIEW = "day"; return true;
    case "px-task": CUR = +ds.v; return true;
    case "px-prev": CUR = Math.max(0, CUR-1); return true;
    case "px-next": CUR = Math.min(L.length-1, CUR+1); return true;
    case "px-summary": PVIEW = "results"; return true;
    case "px-hint": HINTED[L[CUR].id] = true; return true;
    case "px-ans": { const t = L[CUR], q = taskQs(t)[+ds.q]; ANS[t.id] = ANS[t.id]||{}; ANS[t.id][+ds.q] = {i:+ds.v, ok:+ds.v===q.a}; return true; }
    case "px-restart": startDay(DAY, true); toast(`${DAY===5?"Extra":"Day "+DAY} started over with fresh practice data.`,"ok"); return true;
    case "px-lesson": if(window.FPCourse) window.FPCourse.openLesson(ds.v); return "leave";
    case "px-copy": { const txt = resultsText(); (navigator.clipboard ? navigator.clipboard.writeText(txt) : Promise.reject()).then(()=>{ toast("Results copied.","ok"); after(); }, ()=>{ toast("Couldn't copy. Use Download instead.","bad"); after(); }); return false; }
    case "px-download": { if(window.FPCourse) window.FPCourse.download("fieldpulse-practice-results.txt", resultsText()); return false; }
  }
  return null;
}
function onClick(e){
  const b = e.target.closest("[data-a]");
  if(!b || !ROOT.contains(b)){ if(U.menu && !e.target.closest(".fp-menu")){ U.menu=null; pxRender(); } return; }
  const ds = Object.assign({}, b.dataset), a = ds.a;
  { const hEl = e.target.closest("[data-hk]"); if(hEl && ROOT.contains(hEl)) log("hk",{key:hEl.dataset.hk}); }
  if(b.tagName==="A") e.preventDefault();
  collect();
  if(a!=="menu" && !b.closest(".fp-menu") && !b.closest(".fp-mwrap")) U.menu = null;
  const r = pxAct(a, ds);
  if(r==="leave") return;
  if(r===null && engAct(a, ds)===null) act(a, ds);
  after();
}
function onInput(e){
  const el = e.target; if(!el.dataset || !el.dataset.in) return;
  collect();
  if(el.dataset.in==="custq"){ U.q = el.value; log("search",{f:U.qf,q:el.value}); const tb = ROOT.querySelector("#cust-rows"); if(tb){ tb.innerHTML = custRows(); evaluate(); return; } }
  if(el.dataset.in==="tagq"){ U.form[el.dataset.f.replace(/\.q$/,"")+".open"] = true; }
  after();
}
function onChange(e){
  const el = e.target; if(!el.dataset) return;
  if(el.dataset.hk) log("hk",{key:el.dataset.hk,v:el.type==="checkbox"?el.checked:el.value});
  const c = el.dataset.ch; if(!c) return;
  collect();
  if(c==="custqf"){ U.qf = el.value; }
  else if(c==="jf"){ U.jobsFilter = {st:JOB_STATUSES.filter(s=>U.pf["p.jf.st."+s]), inv:U.pf["p.jf.inv"]||"Any", sd:U.pf["p.jf.sd"]||"Any", t:(U.pf["p.jf.t"]||"").trim(), u:U.pf["p.jf.u"]||"Any"}; log("job-filter",{f:JSON.parse(JSON.stringify(U.jobsFilter))}); }
  else if(c==="ef"){ U.estFilter = {st:EST_STATUSES.filter(s=>U.pf["p.ef.st."+s]), by:U.pf["p.ef.by"]||""}; log("est-filter",{f:JSON.parse(JSON.stringify(U.estFilter))}); }
  else if(c==="pr"){ log("pr",{kind:U.pf["p.pr.kind"],type:U.pf["p.pr.type"],int:U.pf["p.pr.int"],range:U.pf["p.pr.range"]}); }
  else if(c==="rep-group"){ if(el.value){ U.rep.group = el.value; log("rep-group",{tab:U.rep.tab,g:el.value}); } }
  else if(c==="rep-cols"){ U.rep.cols = RCOLS[U.rep.tab].map(x=>x[0]).filter(k=>U.pf["p.rc."+k]); }
  else if(c==="rep-fall" || c==="rep-fval"){
    const col = el.dataset.v, tab = U.rep.tab;
    const vals = [...new Set(repRaw(tab).map(r => r[col]===""||r[col]==null?"(Blanks)":String(r[col])))];
    let on = ((U.rep.filters||{})[col] || {vals:vals.slice()}).vals.slice();
    if(c==="rep-fall") on = el.checked ? vals.slice() : [];
    else { const v = el.dataset.val; on = el.checked ? [...new Set(on.concat([v]))] : on.filter(x=>x!==v); }
    U.rep.filters = Object.assign({}, U.rep.filters); if(on.length===vals.length) delete U.rep.filters[col]; else U.rep.filters[col] = {vals:on};
    log("rep-filter",{tab,col,f:U.rep.filters[col]||null});
  }
  else if(c==="qb-rev"){ const q = W.qb.find(x=>x.id===el.dataset.v); q.rev = el.value; log("qb-rev",{id:q.id,v:el.value}); }
  else if(c==="job-tpl"){ const t = JOB_TEMPLATES[el.value]; if(t){ const cur = (U.form["m.title"]||"").trim(); if(!cur || Object.values(JOB_TEMPLATES).some(x=>x.title.trim()===cur)) U.form["m.title"] = t.title; U.form["m.tags"] = [...new Set((U.form["m.tags"]||[]).concat(t.tags))]; if(U.form["m.s"]) U.form["m.e"] = String(+U.form["m.s"]+t.len); if(t.notes && !(U.form["m.notes"]||"").trim()) U.form["m.notes"] = t.notes; log("tpl",{tpl:el.value}); } }
  else if(c==="pick-user"){ const m = U.modal; if(m && (m.kind==="job"||m.kind==="visit") && el.checked){ const f = U.form, u = el.dataset.f.split(".").pop(); if(f["m.date"] && f["m.s"]!=="" && f["m.s"]!=null && f["m.e"]!=="" && f["m.e"]!=null){ const cf = conflictFor([u], f["m.date"], +f["m.s"], +f["m.e"], m.kind==="job"?m.id:null); if(cf){ m._form = Object.assign({}, f); openModal("conflict",{msg:cf, back:m}); U.form = m._form; log("conflict-pick",{u}); } } } }
  else if(c==="job-start"){ winAuto(); const t = JOB_TEMPLATES[U.form["m.tpl"]]; if(t && U.form["m.s"] && !U.form["m.e"]) U.form["m.e"] = String(+U.form["m.s"]+t.len); }
  // "redraw" just re-renders with collected values
  after();
}
function onDrag(e){
  const d = e.target.closest && e.target.closest("[data-drag],[data-dragcol]"); if(!d) return;
  if(d.dataset.drag){ U.sel = d.dataset.drag; e.dataTransfer.setData("text/plain","job:"+d.dataset.drag); }
  if(d.dataset.dragcol){ e.dataTransfer.setData("text/plain","col:"+d.dataset.dragcol); }
  e.dataTransfer.effectAllowed = "move";
}
function onOver(e){ if(e.target.closest && e.target.closest("[data-drop]")) e.preventDefault(); }
function onDrop(e){
  const z = e.target.closest && e.target.closest("[data-drop]"); if(!z) return; e.preventDefault();
  const v = e.dataTransfer.getData("text/plain")||"";
  collect();
  if(z.dataset.drop==="group" && v.startsWith("col:")){ U.rep.group = v.slice(4); log("rep-group",{tab:U.rep.tab,g:U.rep.group}); after(); return; }
  if(v.startsWith("job:") && z.dataset.u){ U.sel = v.slice(4); act("sched-drop", Object.assign({}, z.dataset)); after(); }
}
function onKey(e){ if(e.key==="Escape" && (U.modal||U.menu)){ U.modal=null; U.menu=null; pxRender(); } }

window.FPPractice = {
  mount(el){ if(ROOT) return; ROOT = el; el.addEventListener("click", onClick); el.addEventListener("input", onInput); el.addEventListener("change", onChange); el.addEventListener("dragstart", onDrag); el.addEventListener("dragover", onOver); el.addEventListener("drop", onDrop); document.addEventListener("keydown", onKey); },
  show(dayArg, taskId){
    if(taskId){ const t = ALLTASKS.find(x=>x.id===taskId); if(t){ if(t.day!==DAY || !W) startDay(t.day,false); CUR = dayTasks(t.day).indexOf(t); PVIEW="day"; } }
    else if(dayArg && +dayArg!==DAY) startDay(+dayArg,false);
    pxRender();
  },
  load(p){ PROG = {tasks:Object.assign({}, (p&&p.tasks)||{}), slips:Object.assign({}, (p&&p.slips)||{})}; SLIPS = []; Object.keys(PROG.slips).forEach(d => (PROG.slips[d]||[]).forEach(x => SLIPS.push({text:x.t, serious:!!x.s, day:+d}))); const f = dayTasks(DAY).findIndex(t=>!PROG.tasks[t.id]); CUR = f<0?0:f; if(ROOT) pxRender(); },
  taskFor(lessonId){ const t = LESSON_TASK[lessonId]; return t ? {id:t.id, day:t.day, title:t.t} : null; },
  summary(p){ const tasks = (p&&p.tasks)||{}; const n = ALLTASKS.filter(t=>tasks[t.id]).length; return `${n}/${TOTAL_TASKS}`; },
  total: TOTAL_TASKS
};
startDay(1,false);

/* ===== Engage (FieldPulse phone and text add-on), copied from a live look-only check of an Engage account, Nov 4 2026 ===== */
const ENG_TAGS = [["New Customer - Booked","green"],["Existing Customer - Booked","green"],["Lead Inquiry - Not yet booked","yellow"],["Not Booked - Distance","red"],["Not Booked - Full schedule","red"],["Not Booked - Service not offered","red"],["Canceled Appointment","red"],["Business Call","purple"],["Caller hung up","grey"],["Payment Call","green2"],["Technician Call","grey"],["Spam","orange"]];
const ENG_SETTINGS = ["Phone Lines","Voicemail Settings","Hold Settings","Working Hours","Notifications","Audio Devices","Ring Duration","Audio Samples","Call Attribution","Transcripts and Summaries","Tags","Blocked Contacts","Reporting","A2P 10DLC","SIP","Diagnostics"];
function engData(){
  const T = (who, text) => ({who, text});
  return {
    lines:[["Main Line","+15552010100"],["Ben Foster","+15552010131"],["Carlos Diaz","+15552010132"]],
    convs:[
      {id:"e1", num:"(555) 201-0172", c:null, when:"2:09 PM", unread:true, tags:[], ev:[
        {id:"e1c1", type:"call", dir:"in", date:"Nov 4, 2026", time:"2:09 PM", dur:"3 mins, 12 secs", by:"You", ls:"Word of Mouth", sum:"Maria Lopez called from a new cell about a backed-up kitchen sink. She picked 8 to 10 tomorrow and was told about the $89 service fee.", tr:[
          T(1,"Thank you for calling Summit Ridge Plumbing. How can I help you today?"),
          T(2,"Hi, this is Maria Lopez on Oak Avenue. I'm calling from my new cell. Our kitchen sink is backed up and won't drain."),
          T(1,"Sorry to hear that, Maria. Let me pull up your account."),
          T(2,"Can someone come out tomorrow morning?"),
          T(1,"I have 8 to 10 or 10 to 12 tomorrow. Which works better?"),
          T(2,"8 to 10, please. How much will it cost?"),
          T(1,"There's an $89 service fee for the visit. The tech will give you the price on site before doing any work."),
          T(2,"Okay, that's fine. Book it.")]}]},
      {id:"e2", num:"(555) 201-0101", c:"c1", when:"Yesterday", tags:["Payment Call"], ev:[{id:"e2c1", type:"call", dir:"out", date:"Nov 3, 2026", time:"4:40 PM", dur:"1 min, 5 secs", by:"You", ls:"Google Search", tr:[T(1,"Hi Grace, calling about invoice 2036."),T(2,"I'll mail a check this week.")]}]},
      {id:"e3", num:"(555) 201-0199", c:null, when:"9:40 AM", tags:[], ev:[{id:"e3c1", type:"call", dir:"in", missed:true, vm:"Hi, I need a quote for a new toilet. Please call me back.", date:"Nov 4, 2026", time:"9:40 AM", dur:"0 secs", by:"", ls:"", tr:[]}]},
      {id:"e4", num:"(555) 201-0109", c:"c9", when:"8:12 AM", tags:[], ev:[{id:"e4c1", type:"call", dir:"in", missed:true, date:"Nov 4, 2026", time:"8:12 AM", dur:"0 secs", by:"", ls:"", tr:[]}]},
      {id:"e5", num:"(555) 201-0115", c:"c15", when:"Mon", tags:["Existing Customer - Booked"], ev:[{id:"e5s1", type:"sms", dir:"in", date:"Nov 2, 2026", time:"10:02 AM", text:"Thanks, see you Thursday."}]}
    ]
  };
}
const _engPfresh = pfresh;
pfresh = function(){ const w = _engPfresh(); w.eng = engData(); return w; };
function ENGW(){ if(!W.eng) W.eng = engData(); return W.eng; }
function engConv(id){ return ENGW().convs.find(c=>c.id===id); }
function engName(cv){ return cv.c && W.cust[cv.c] ? cname(W,cv.c) : cv.num; }
function engLast(cv){ const e = cv.ev[cv.ev.length-1]; if(!e) return ""; if(e.type==="note") return `<b>Note:</b> ${E(e.text)}`; if(e.type==="sms") return `<b>${e.dir==="in"?"Received":"Sent"}:</b> ${E(e.text)}`; return e.missed ? `<b class="r">Missed:</b> ${e.vm?"Voicemail":"Inbound Call"}` : `<b>${e.dir==="in"?"Received":"Sent"}:</b> ${e.dir==="in"?"Inbound":"Outbound"} Call`; }
function engTagPill(t){ const c = (ENG_TAGS.find(x=>x[0]===t)||[t,"grey"])[1]; return `<span class="eg-tag t-${c}">${E(t)}</span>`; }

function renderEngage(){
  const G = U.eng; if(!G || !G.open) return ""; if(U.modal && U.modal.kind==="job") return "";
  const D = ENGW();
  const tab = G.tab || "conv";
  const rail = [["conv","Conversations","spark2"],["calls","Calls","phone"],["vm","Voicemails","vm"],["cust","Customers","idcard"],["set","Settings","gear2"]];
  let h = `<div class="eg" role="dialog" aria-label="Engage"><div class="eg-top"><button class="eg-close" data-a="eng-close" data-hk="eng-close">${ic("arrowr",20)}<small>Close</small></button><span class="eg-logo">${FPLOGO.replace('#00034d','#fff')}</span><b class="eg-name">ENGAGE</b>
   <span class="eg-r"><span class="eg-dnd">${ic("ban",15)} Do Not Disturb <i></i></span><button data-a="eng-addc" aria-label="Add contact">${ic("useradd",19)}</button><button data-a="eng-dial" data-hk="eng-dial" aria-label="New call">${ic("phone",19)}</button><button data-a="eng-newmsg" aria-label="New message">${ic("chat",19)}</button><i class="sep"></i>${ic("usercirc",22)}${ic("down",14)}</span></div>
   <div class="eg-body ${tab==="set"?"set":""}"><nav class="eg-rail">${rail.map(([k,l,i])=>`<button class="${tab===k?"on":""}" data-a="eng-tab" data-v="${k}" data-hk="etab-${k}">${ic(i,20)}<span>${l}</span></button>`).join("")}</nav>`;
  if(tab==="set") return h + engSettings() + `</div>${engModal()}</div>`;
  h += `<section class="eg-list">${engList(tab)}</section>`;
  const cv = engConv(G.sel);
  h += cv ? engThread(cv) + engProfile(cv) : `<section class="eg-empty" aria-hidden="true"></section>`;
  return h + `</div>${engModal()}</div>`;
}
function engList(tab){
  const D = ENGW(), G = U.eng;
  const title = {conv:"Conversations",calls:"Calls",vm:"Voicemails",cust:"Customers"}[tab];
  let h = `<h2>${title}</h2>`;
  if(tab==="cust"){
    h += `<div class="eg-search">${ic("search",15)}<input placeholder="Search by name or phone" aria-label="Search customers" data-f="e.cq" data-in="engq" data-hk="ecust-search" value="${E(pv("e.cq",""))}"></div><div class="eg-seg3"><button class="on">Recent</button><button>All</button><button>Assigned</button></div><div class="eg-items">`;
    const q = (pv("e.cq","")||"").toLowerCase();
    Object.keys(W.cust).filter(id=>!q || cname(W,id).toLowerCase().includes(q) || W.cust[id].phone.replace(/\D/g,"").includes(q.replace(/\D/g,"")||"#")).slice(0,14).forEach(id => { const c = W.cust[id];
      h += `<div class="eg-ci"><span class="fp-av sm g">${E(cname(W,id).split(" ").map(s=>s[0]).join("").slice(0,2))}</span><div><b>${E(cname(W,id))}</b> <span class="eg-st">${E(c.st)}</span><small>${E(c.email||"")}</small><small>${E(c.phone)}</small></div><span class="eg-ib">${ic("phone",13)}</span><span class="eg-ib">${ic("chat",13)}</span></div>`; });
    return h + `</div>`;
  }
  h += `<div class="eg-sr"><div class="eg-search">${ic("search",15)}<input placeholder="Search by name, ..." aria-label="Search"></div><button class="eg-sq" aria-label="Filter">${ic("filter",15)}</button><button class="eg-sq" aria-label="More">${ic("dots",15)}</button></div>
   <div class="eg-seg3"><button>All</button><button class="on">Main</button><button>Selected ${ic("down",12)}</button></div>
   <button class="eg-blk on">All ${title}</button><button class="eg-blk">Follow up</button><div class="eg-items">`;
  if(tab==="conv"){
    D.convs.forEach(cv => { h += `<button class="eg-it ${G.sel===cv.id?"sel":""} ${cv.unread?"un":""}" data-a="eng-sel" data-v="${cv.id}" data-hk="econv-${cv.id}"><span class="t"><b>${E(engName(cv))}</b><small>${E(cv.when)} <span class="eg-dots">${ic("dots",13)}</span></small></span><span class="l">${engLast(cv)}</span><small>Main Line</small>${cv.tags.length?`<span class="tg">${cv.tags.map(engTagPill).join("")}</span>`:""}</button>`; });
  } else {
    const L = D.convs.flatMap(cv => cv.ev.filter(e=>e.type==="call" && (tab==="calls" || e.vm)).map(e=>({cv,e})));
    L.forEach(({cv,e}) => { h += `<button class="eg-it call" data-a="eng-sel" data-v="${cv.id}" data-hk="${tab}-${e.id}"><span class="ci ${e.missed?"m":e.dir}">${ic(tab==="vm"?"vm":e.missed?"phonex":"phone",14)}</span><span class="t"><b class="${e.missed?"r":""}">${E(engName(cv))}</b><small>${E(e.date.replace(", 2026",""))}</small></span><span class="l">${E(cv.num.replace(/\D/g,"").replace(/^/,"+1"))} <span class="eg-ib">${ic("phone",12)}</span><span class="eg-ib">${ic("chat",12)}</span><small class="d">${e.missed?(tab==="vm"?"0 secs":"Missed"):E(e.dur.replace("mins","min").replace(", "," "))}</small></span><small>Main Line${e.by?" · "+E(e.by):""}</small></button>`; });
  }
  return h + `</div><div class="eg-fab">${tab==="conv"?`<button data-a="eng-newmsg">${ic("plus",15)} New Message</button>`:`<button data-a="eng-dial">${ic("grip",15)} New Call</button>`}</div>`;
}
function engThread(cv){
  const G = U.eng, mode = G.comp || "sms";
  let h = `<section class="eg-th"><div class="eg-thh"><h2>${E(engName(cv))}</h2><span class="sp"></span><button class="eg-btn" data-a="noop">${ic("filter",15)} Filter</button><div class="eg-mw"><button class="eg-sq b" data-a="eng-more" data-hk="eng-more" aria-label="More options">${ic("dots",16)}</button>${G.more?engMore(cv):""}</div></div>
   ${cv.tags.length?`<div class="eg-ttags">${cv.tags.map(engTagPill).join("")}</div>`:""}<div class="eg-msgs">`;
  let lastDate = "";
  cv.ev.forEach(e => {
    if(e.date!==lastDate){ h += `<div class="eg-day">${E(e.date.replace(/^(\w+) (\d+), (\d+)$/,"$1 $2, $3"))}</div>`; lastDate = e.date; }
    if(e.type==="call") h += `<div class="eg-cl ${e.missed?"m":""}">${ic(e.missed?"phonex":"phone",14)} ${e.missed?"Missed Call":e.dir==="in"?"Inbound Call":"Outbound Call"} - ${E(e.time)} <button class="eg-ext" data-a="eng-calld" data-v="${cv.id}" data-e="${e.id}" data-hk="ecall-${e.id}" title="Open Call Log Details" aria-label="Open Call Log Details">${ic("ext",14)}</button></div>${e.vm?`<div class="eg-bub in vm">${ic("vm",14)} Voicemail: ${E(e.vm)}</div>`:""}`;
    else if(e.type==="sms") h += `<div class="eg-bub ${e.dir}">${E(e.text)}<small>${E(e.time)}</small></div>`;
    else if(e.type==="note") h += `<div class="eg-bub note"><b>Internal note</b>${E(e.text)}<small>${E(e.time)} · You</small></div>`;
  });
  h += `</div><div class="eg-comp"><div class="eg-ctabs"><button class="${mode==="sms"?"on":""}" data-a="eng-comp" data-v="sms" data-hk="ecomp-sms">SMS</button><button class="${mode==="note"?"on":""}" data-a="eng-comp" data-v="note" data-hk="ecomp-note">Note</button></div>
   <div class="eg-from">From: <span class="eg-sel">Main Line ${ic("down",14)}</span></div>
   <div class="eg-box ${mode}"><textarea data-f="e.msg" data-in="engmsg" rows="3" placeholder="${mode==="note"?"Enter an internal note":"Type a message or drag and drop a file"}" data-hk="e-${mode}" aria-label="${mode==="note"?"Internal note":"Message"}">${E(pv("e.msg",""))}</textarea><div class="eg-boxf">${mode==="sms"?ic("clip",16):""}<span class="sp"></span><button data-a="eng-send" data-hk="e-send-${mode}" aria-label="Send">${ic("send",16)}</button></div></div></div></section>`;
  return h;
}
function engMore(cv){
  return `<div class="eg-menu" role="menu"><button data-a="noop">${ic("check2",14)} Mark as Read for Everyone</button><button data-a="noop">${ic("star",14)} Star</button><button data-a="eng-mnew">${ic("useradd",14)} Create new customer</button><button data-a="eng-mlink">${ic("idcard",14)} Add to Existing Customer as a New Contact</button><button data-a="noop">${ic("ban",14)} Block Contact</button><button class="r" data-a="noop">${ic("trash",14)} Archive</button>
   <div class="eg-mtag">${ic("tag",14)} Tags</div><div class="eg-tsearch">Search or create tag...</div>${ENG_TAGS.map(([t,c])=>`<button class="eg-tagopt" data-a="eng-tag" data-v="${E(t)}" data-hk="etag-${E(t)}"><i class="d t-${c}"></i>${E(t)}${cv.tags.includes(t)?` <span class="ok">${ic("check2",13)}</span>`:""}</button>`).join("")}</div>`;
}
function engProfile(cv){
  const G = U.eng, c = cv.c ? W.cust[cv.c] : null;
  const link = !!pv("e.link", false);
  const pm = c && G.pmenu ? `<div class="eg-menu pm"><div class="eg-mh2">Primary</div><button data-a="eng-openprof">Open Full Profile</button><div class="eg-mh2">Related</div><button data-a="na-tab">Create Project</button><button data-a="job-new" data-c="${cv.c}" data-from="eng" data-hk="epm-createjob">Create Job</button><button data-a="na-tab">Create Estimate</button><button data-a="na-tab">Create Invoice</button></div>` : "";
  let h = `<aside class="eg-pf"><div class="eg-pfh"><h3>Profile Info</h3><span class="eg-pfr">${c?`<span class="eg-mw"><button class="eg-sq" data-a="eng-pmenu" data-hk="ep-menu" aria-label="Profile actions">${ic("down",15)}</button>${pm}</span>`:""}<button class="eg-pfs" data-a="eng-save" data-hk="ep-save">Update/Save</button></span></div><div class="eg-pfb">`;
  const F = (icn,label,req,ctrl,hk) => `<div class="eg-f" ${hk?`data-hk="${hk}"`:""}><label>${ic(icn,14)} ${label}${req?' <b class="req">*</b>':""}</label>${ctrl}</div>`;
  const I = (f,v,ph,x) => `<input data-f="${f}" value="${E(v??"")}" placeholder="${E(ph||"")}" ${x||""}>`;
  const phone = `<div class="eg-ph"><span>+1</span>${I("e.ph",pv("e.ph",cv.num),"Phone number",'readonly')}<button class="eg-ib" data-a="eng-callback" data-hk="ep-call" aria-label="Call back">${ic("phone",13)}</button><span class="eg-ib">${ic("chat",13)}</span></div>`;
  if(!c){
    h += `<label class="eg-chk" data-hk="ep-link"><input type="checkbox" data-f="e.link" data-ch="redraw" ${link?"checked":""}> Link contact to existing customer</label>`;
    if(!link) h += F("idcard","Display Name",true,I("e.dn",pv("e.dn",""),""));
    const ph2 = `<div class="eg-ph"><span>+1</span><input placeholder="Phone number" aria-label="Phone 2"><span class="eg-ib dim">${ic("phone",13)}</span><span class="eg-ib dim">${ic("chat",13)}</span></div>`;
    const em = (f,v) => `<div class="eg-em">${I(f,v,"")}<span class="eg-ib">${ic("mail",13)}</span></div>`;
    h += F("idcard","First Name",true,I("e.fn",pv("e.fn",""),"",'data-hk="ep-first"')) + F("idcard","Last Name",false,I("e.ln",pv("e.ln",""),"",'data-hk="ep-last"')) + F("phone","Phone",true,phone) + (link?"":F("phone","Phone 2",false,ph2)) + F("mail","Email",false,em("e.em",pv("e.em",""))) + (link?"":F("mail","Email 2",false,em("e.em2",pv("e.em2",""))));
    if(link){ const q = (pv("e.cq2","")||"").toLowerCase(), pick = pv("e.lc","");
      h += F("useradd","Customer",true,`<div class="eg-csel" data-hk="ep-cust">${pick?`<div class="eg-picked">${E(cname(W,pick))} <button data-a="eng-unpick" aria-label="Clear">${ic("x",12)}</button></div>`:`<input data-f="e.cq2" data-in="engcq" value="${E(pv("e.cq2",""))}" placeholder="Search customers" aria-label="Search customers">${q.length>=2?`<div class="eg-dd">${Object.keys(W.cust).filter(id=>cname(W,id).toLowerCase().includes(q)).slice(0,6).map(id=>`<button data-a="eng-pick" data-v="${id}" data-hk="epick-${id}">${E(cname(W,id))}<small>${E(W.cust[id].addr)} · ${E(W.cust[id].phone)}</small></button>`).join("")||'<span class="muted">No match</span>'}</div>`:""}`}</div>`); }
    else h += F("loader","Status",false,`<div class="eg-dsel">Current Customer ${ic("down",14)}</div>`) + F("file","Account Type",false,`<div class="eg-dsel">Residential ${ic("down",14)}</div>`) + F("useradd","Assigned To",false,`<div class="eg-dsel">Unassigned ${ic("down",14)}</div>`) + F("tag","Lead Source",false,`<select class="eg-nsel" data-f="e.ls"><option value="">Select...</option>${LEAD_SOURCES.map(x=>`<option ${pv("e.ls","")===x?"selected":""}>${E(x)}</option>`).join("")}</select>`) + F("pin","+ Address",false,I("e.ad",pv("e.ad",""),""))
      + `<label class="eg-chk n"><input type="checkbox" disabled> Use Separate Billing Address</label>` + F("note","Notes",false,I("e.nt",pv("e.nt",""),"")) + F("note","Job Notes",false,I("e.jn",pv("e.jn",""),""))
      + `<div class="eg-last"><span>LAST JOB</span><button data-a="na-tab">${ic("plus",14)} Create Job</button></div><p class="eg-none">No Job found.</p><div class="eg-last"><span>LAST ESTIMATE/INVOICE</span><button data-a="na-tab">${ic("plus",14)} Create Invoice</button></div><p class="eg-none">No Estimate/Invoice found.</p>`;
  } else {
    if(c.contacts.length) h += F("useradd","Contact",false,`<select class="eg-nsel" data-f="e.ctc" aria-label="Contact"><option>${E(cname(W,cv.c))} - Customer</option>${c.contacts.map(k=>`<option ${k.phone===cv.num?"selected":""}>${E(k.name)} - Additional Contact</option>`).join("")}</select>`);
    h += F("idcard","Display Name",true,`<input value="${E(cname(W,cv.c))}" readonly>`) + F("idcard","First Name",true,`<input value="${E(c.first)}" readonly>`) + F("idcard","Last Name",false,`<input value="${E(c.last)}" readonly>`) + F("phone","Phone",true,`<div class="eg-ph"><span>+1</span><input value="${E(c.phone)}" readonly><button class="eg-ib" data-a="eng-callback" data-hk="ep-call" aria-label="Call back">${ic("phone",13)}</button><span class="eg-ib">${ic("chat",13)}</span></div>`)
      + F("phone","Phone 2",false,`<div class="eg-ph"><span>+1</span><input placeholder="Phone number" readonly><span class="eg-ib dim">${ic("phone",13)}</span><span class="eg-ib dim">${ic("chat",13)}</span></div>`)
      + F("mail","Email",false,`<input value="${E(c.email||"")}" readonly>`) + F("spark","Status",false,`<div class="eg-dsel">${E(c.st)} ${ic("down",14)}</div>`) + F("file","Account Type",false,`<div class="eg-dsel">${E(c.type)} ${ic("down",14)}</div>`)
      + F("tag","Lead Source",false,`<div class="eg-dsel">${E(c.ls||"Select...")} ${ic("down",14)}</div>`) + F("pin","Address",false,`<div class="eg-ro">${E(c.addr)}, ${E(c.city)}</div>`)
      + F("note","Job Notes",false,`<div class="eg-ro jn" data-hk="ep-jobnotes">${E(c.jobNotes||"")}</div>`);
    const jobs = Object.values(W.jobs).filter(j=>j.c===cv.c && !j.archived).sort((a,b)=>b.id.localeCompare(a.id));
    h += `<div class="eg-last"><span>LAST JOB</span><button data-a="job-new" data-c="${cv.c}" data-from="eng" data-hk="ep-createjob">${ic("plus",14)} Create Job</button></div>${jobs[0]?`<p class="eg-lj"><button class="lnk" data-a="eng-openjob" data-v="${jobs[0].id}">#${jobs[0].id} ${E(jobs[0].title)}</button><small>${jobs[0].date?dlab(jobs[0].date)+", "+fmtH(jobs[0].s):"Unscheduled"}</small></p>`:'<p class="eg-none">No Job found.</p>'}
     <div class="eg-last"><span>LAST ESTIMATE/INVOICE</span><button data-a="na-tab">${ic("plus",14)} Create Invoice</button></div>`;
  }
  return h + `</div></aside>`;
}
function engSettings(){
  const s = U.eng.set || "Tags";
  let h = `<section class="eg-setl"><h2>Settings</h2>${ENG_SETTINGS.map(x=>`<button class="${s===x?"on":""}" data-a="eng-set" data-v="${E(x)}">${E(x)}</button>`).join("")}</section><section class="eg-setm">`;
  if(s==="Tags") h += `<div class="eg-seth"><h2>Tags</h2><button class="eg-dk" data-a="admin-only">${ic("plus",14)} Create Tag</button></div><p class="eg-sub">Created Tags</p><div class="eg-tgrid"><div>${engTagPill("Outside Business Hours")}<span class="eg-sys">${ic("lock",12)} SYSTEM</span></div>${ENG_TAGS.map(([t])=>`<div>${engTagPill(t)}<span class="eg-ed">${ic("edit",14)}<b>${ic("trash",14)}</b></span></div>`).join("")}</div><p class="muted fp-small">Practice: each company makes its own tags. System tags (lock icon) are added by Engage. Only an Admin adds tags.</p>`;
  else if(s==="Call Attribution") h += `<h2>Call Attribution</h2><p class="eg-sub">Choose how you want to link calls from Engage to your company records.</p><p><span class="eg-tog on"></span> Enable Call-to-Record attribution</p><p><b>How would you like to link calls to records?</b></p><p>(•) Manual<br>( ) Automatic - any record created within a call window or after the call on the same day will be automatically linked to the call.</p>`;
  else if(s==="Phone Lines") h += `<h2>Phone Lines</h2>${ENGW().lines.map(([n,p])=>`<p class="eg-line">${ic("phone",14)} <b>${E(n)}</b><small>${E(p)}</small></p>`).join("")}`;
  else h += `<h2>${E(s)}</h2><p class="muted">Not part of this practice. Only an Admin changes Engage settings.</p>`;
  return h + `</section>`;
}
function engModal(){
  const M = U.eng.modal; if(!M) return "";
  if(M.k==="dial") return `<div class="eg-ov"><div class="eg-md sm"><div class="eg-mh"><h3>New Call</h3><button data-a="eng-mclose" aria-label="Close">${ic("x",18)}</button></div><div class="eg-dial"><div class="eg-num">Enter a phone number</div><div class="eg-keys">${["1","2 ABC","3 DEF","4 GHI","5 JKL","6 MNO","7 PQRS","8 TUV","9 WXYZ","×","0 +","+"].map(k=>`<span><b>${k.split(" ")[0]}</b><small>${k.split(" ")[1]||""}</small></span>`).join("")}</div><p><b>${ic("phone",14)} Calling from</b></p><div class="eg-dsel">Main Line ${ic("down",14)}</div><button class="eg-call" data-a="eng-callnow">${ic("phone",14)} Call</button></div></div></div>`;
  if(M.k==="calld"){ const cv = engConv(M.c), e = cv.ev.find(x=>x.id===M.e);
    return `<div class="eg-ov"><div class="eg-md"><div class="eg-mh"><h3>Call Log Details</h3><button data-a="eng-mclose" data-hk="ecalld-close" aria-label="Close">${ic("x",18)}</button></div><div class="eg-mb">
     <div class="eg-card"><dl class="eg-dl"><dt>${ic("hash",14)} Call ID</dt><dd>pr-${E(e.id)}-7f3a</dd><dt>${ic("idcard",14)} Name</dt><dd>${E(engName(cv))}</dd><dt>${ic("phone",14)} Phone Number</dt><dd>${E(cv.num.replace(/\D/g,"").replace(/^/,"+1"))}<span class="eg-icons">${["phone","chat","flag","ban"].map(k=>`<span class="eg-ib">${ic(k,12)}</span>`).join("")}</span></dd><dt>${ic("info",14)} Call Info</dt><dd>${e.dir==="in"?"Inbound":"Outbound"} · ${E(e.date.replace(", 2026",""))} at ${E(e.time)} · ${E(e.dur)}</dd><dt>${ic("swap",14)} Phone Line Used</dt><dd>Main Line · +15552010100</dd><dt>${ic("user",14)} Lead Source</dt><dd>${E(e.ls||"-")}</dd></dl></div>
     ${e.missed?"":`<div class="eg-card"><div class="eg-ch"><b>Recording</b><span><button data-a="noop">${ic("ext",13)} Copy link</button><button data-a="noop">${ic("down",13)} Download</button></span></div><div class="eg-player">${ic("play",14)}<i></i><small>0:00 / ${E(e.dur.split(",")[0].replace(/\s?mins?/," min"))}</small></div></div>`}
     ${e.sum?`<div class="eg-card"><b>Summary</b><p class="fp-small" style="margin:6px 0 0">${E(e.sum)}</p></div>`:""}${e.tr.length?`<div class="eg-card"><div class="eg-ch"><b>Transcript</b><span><button data-a="noop">Copy</button><button data-a="noop">Export</button></span></div><div class="eg-tr">${e.tr.map(t=>`<div class="s${t.who}"><small>SPEAKER ${t.who}</small>${E(t.text)}</div>`).join("")}</div><p class="eg-sft">Show full transcript</p></div>`:""}
     <div class="eg-card"><b>Call Notes</b><textarea class="eg-cn" rows="3" placeholder="Type a note about this call" aria-label="Call notes" readonly>${cv.ev.filter(x=>x.type==="note").map(x=>x.text).join("\n")}</textarea><div class="eg-r2"><button class="eg-pfs" data-a="noop">Save</button></div></div>
     <div class="eg-card"><b>Tags</b><div class="eg-ctg">${cv.tags.map(engTagPill).join("")}<button class="eg-addtag" data-a="eng-more-from-d" data-hk="eng-addtag">+ Tag</button></div></div>
     ${cv.c?`<div class="eg-card"><div class="eg-ch"><b>Related Records</b><button class="eg-btn sm" data-a="eng-relopen" data-v="${cv.id}" data-e="${e.id}" data-hk="erel-add">${e.rel?"Manage Related Records":"+ Add Related Records"}</button></div>${e.rel?e.rel.ids.map(id=>`<p class="eg-relp">${id===e.rel.primary?ic("star",13):""} Job #${E(id)} ${E((W.jobs[id]||{}).title||"")}</p>`).join(""):'<p class="muted fp-small">No records linked to this call.</p>'}</div>`:""}</div>
     <div class="eg-mf"><button class="eg-btn" data-a="eng-mclose">Close</button><button class="eg-dk" data-a="noop">Redirect to Call Details</button></div></div></div>`; }
  if(M.k==="rel"){ const cv = engConv(M.c), e = cv.ev.find(x=>x.id===M.e); const jobs = Object.values(W.jobs).filter(j=>j.c===cv.c && !j.archived).sort((a,b)=>b.id.localeCompare(a.id)); const sel = M.sel||[];
    return `<div class="eg-ov"><div class="eg-md"><div class="eg-mh"><h3>Link Records to Engage</h3><button data-a="eng-relclose" aria-label="Close">${ic("x",18)}</button></div><div class="eg-mb">
     <div class="eg-rtabs">${["Projects","Jobs","Invoices","Estimates","Maintenance Agreements"].map(t=>`<button class="${t==="Jobs"?"on":""}" data-a="${t==="Jobs"?"noop":"na-tab"}">${t}</button>`).join("")}</div>
     <div class="eg-search">${ic("search",15)}<input placeholder="Search ${E(cname(W,cv.c))}'s jobs" aria-label="Search jobs"></div>
     <table class="eg-rt"><thead><tr><th></th><th>Job</th><th>Title</th><th>Date</th></tr></thead><tbody>${jobs.map((j,i)=>`<tr><td><input type="checkbox" data-a="eng-reltick" data-v="${j.id}" ${sel.includes(j.id)?"checked":""} data-hk="${i===0?"erel-newest":"erel-j-"+j.id}" aria-label="Link job ${j.id}"></td><td>#${E(j.id)}</td><td>${E(j.title)}</td><td>${j.date?dlab(j.date):"Unscheduled"}</td></tr>`).join("")||'<tr><td colspan="4" class="muted">No jobs for this customer.</td></tr>'}</tbody></table>
     <p class="eg-sub">Choose Primary Record</p>${sel.length?sel.map(id=>`<div class="eg-prow"><button class="eg-star ${M.primary===id?"on":""}" data-a="eng-relstar" data-v="${id}" data-hk="${jobs[0]&&id===jobs[0].id?"erel-star-newest":"erel-star-"+id}" aria-label="Make job ${id} primary">${ic("star",16)}</button> Job #${E(id)} ${E((W.jobs[id]||{}).title||"")}</div>`).join(""):'<p class="muted fp-small">Tick a record above first.</p>'}</div>
     <div class="eg-mf"><button class="eg-btn" data-a="eng-relclose">Cancel</button><button class="eg-dk" data-a="eng-relsave" data-hk="erel-save">Save</button></div></div></div>`; }
  return "";
}
function engAct(a, ds){
  const G = U.eng || (U.eng = {open:false});
  switch(a){
    case "eng-open": U.eng = {open:true, tab:"conv", sel:G.sel||null, comp:"sms"}; U.menu=null; log("eng-open",{}); return true;
    case "eng-close": G.open = false; G.more=false; G.modal=null; log("eng-close",{}); return true;
    case "eng-tab": G.tab = ds.v; G.more=false; log("eng-tab",{v:ds.v}); return true;
    case "eng-sel": { const cv = engConv(ds.v); if(cv){ cv.unread=false; } if(G.sel!==ds.v){ U.pf["e.link"]=false; U.pf["e.lc"]=""; U.pf["e.cq2"]=""; U.pf["e.msg"]=""; ["e.fn","e.ln","e.dn","e.em","e.ls","e.ad"].forEach(k=>delete U.pf[k]); } G.sel = ds.v; G.more=false; if(G.tab!=="conv"&&G.tab!=="calls"&&G.tab!=="vm") G.tab="conv"; log("eng-sel",{v:ds.v}); return true; }
    case "eng-more": G.more = !G.more; return true;
    case "eng-comp": G.comp = ds.v; return true;
    case "eng-calld": G.modal = {k:"calld", c:ds.v, e:ds.e}; log("eng-calld",{c:ds.v,e:ds.e}); return true;
    case "eng-mclose": G.modal = null; return true;
    case "eng-dial": G.modal = {k:"dial"}; return true;
    case "eng-callnow": toast("Calling is not part of this practice.","rk"); return true;
    case "eng-callback": { const cv = engConv(G.sel); log("eng-callback",{c:G.sel}); if(cv){ cv.ev.push({id:cv.id+"o"+cv.ev.length, type:"call", dir:"out", date:"Nov 4, 2026", time:"2:16 PM", dur:"0 mins, 40 secs", by:"You", ls:"", tr:[]}); cv.when="2:16 PM"; } toast("Practice call placed. No answer, so you left a voicemail.","rk"); return true; }
    case "eng-newmsg": case "eng-addc": toast("Use the conversation that's already open in this practice.","rk"); return true;
    case "eng-set": G.set = ds.v; return true;
    case "eng-pmenu": G.pmenu = !G.pmenu; return true;
    case "eng-openprof": { const cv = engConv(G.sel); if(cv&&cv.c){ G.open=false; G.pmenu=false; HIST.push(U.r); go("customer",{id:cv.c}); } return true; }
    case "eng-more-from-d": G.modal=null; G.more=true; return true;
    case "eng-relopen": { const cv = engConv(ds.v), e = cv.ev.find(x=>x.id===ds.e); G.modal = {k:"rel", c:ds.v, e:ds.e, sel:e.rel?e.rel.ids.slice():[], primary:e.rel?e.rel.primary:null}; log("eng-relopen",{c:ds.v,e:ds.e}); return true; }
    case "eng-relclose": { const M = G.modal; G.modal = M ? {k:"calld", c:M.c, e:M.e} : null; return true; }
    case "eng-reltick": { const M = G.modal; M.sel = M.sel.includes(ds.v) ? M.sel.filter(x=>x!==ds.v) : M.sel.concat([ds.v]); if(!M.sel.includes(M.primary)) M.primary = M.sel.length===1 ? null : M.primary; return true; }
    case "eng-relstar": G.modal.primary = ds.v; return true;
    case "eng-relsave": { const M = G.modal; if(!M.sel.length){ toast("Tick a record first.","bad"); return true; } if(!M.primary){ toast("Choose a primary record (the star).","bad"); return true; }
      const cv = engConv(M.c), e = cv.ev.find(x=>x.id===M.e); e.rel = {ids:M.sel.slice(), primary:M.primary}; M.sel.forEach(id=>{ const j=W.jobs[id]; if(j){ j.calls = (j.calls||[]).filter(x=>x.e!==e.id).concat([{e:e.id, conv:cv.id, primary:id===M.primary, time:e.time, date:e.date, ls:e.ls}]); } });
      log("eng-relink",{c:cv.id,e:e.id,ids:M.sel.slice(),primary:M.primary}); G.modal = {k:"calld", c:M.c, e:M.e}; toast("Call linked."); return true; }
    case "eng-pick": U.pf["e.lc"] = ds.v; U.pf["e.cq2"] = ""; log("eng-pick",{c:ds.v}); return true;
    case "eng-unpick": U.pf["e.lc"] = ""; return true;
    case "eng-mnew": G.more=false; U.pf["e.link"]=false; toast("Fill in Profile Info, then click Update/Save.","rk"); return true;
    case "eng-mlink": G.more=false; U.pf["e.link"]=true; return true;
    case "eng-openjob": G.open=false; HIST.push(U.r); go("job",{id:ds.v}); U.jobTab="Info"; return true;
    case "eng-tag": { G.pmenu=false; const cv = engConv(G.sel); if(!cv) return true; const t = ds.v; cv.tags = cv.tags.includes(t) ? cv.tags.filter(x=>x!==t) : cv.tags.concat([t]); log("eng-tag",{c:cv.id,t,on:cv.tags.includes(t)}); G.more=false; toast(cv.tags.includes(t)?`Tagged ${t}.`:`Removed ${t}.`); return true; }
    case "eng-send": { const cv = engConv(G.sel); const txt = (U.pf["e.msg"]||"").trim(); if(!cv||!txt){ toast("Type something first.","bad"); return true; }
      if(G.comp==="note"){ cv.ev.push({id:cv.id+"n"+cv.ev.length, type:"note", date:"Nov 4, 2026", time:"2:15 PM", text:txt}); log("eng-note",{c:cv.id,text:txt}); toast("Note added."); }
      else { cv.ev.push({id:cv.id+"s"+cv.ev.length, type:"sms", dir:"out", date:"Nov 4, 2026", time:"2:15 PM", text:txt}); log("eng-sms",{c:cv.id,text:txt}); toast("Text sent (practice, nothing really sent)."); }
      cv.when = "2:15 PM"; U.pf["e.msg"] = ""; return true; }
    case "eng-save": { const cv = engConv(G.sel); if(!cv) return true; if(cv.c){ toast("Saved."); return true; }
      const fn = (U.pf["e.fn"]||"").trim(), ln = (U.pf["e.ln"]||"").trim();
      if(U.pf["e.link"]){ const lc = U.pf["e.lc"]; if(!lc){ toast("Pick the Customer to link to.","bad"); return true; } if(!fn){ toast("First Name is required.","bad"); return true; }
        W.cust[lc].contacts.push({name:`${fn} ${ln}`.trim(), phone:cv.num, email:U.pf["e.em"]||""}); cv.c = lc; log("eng-link",{c:cv.id,cust:lc,name:`${fn} ${ln}`.trim()}); toast(`Linked to ${cname(W,lc)}.`); return true; }
      if(!fn){ toast("First Name is required.","bad"); return true; }
      const d = {first:fn,last:ln,phone:cv.num,email:U.pf["e.em"]||"",addr:(U.pf["e.ad"]||"").split(",")[0],city:"",type:"Residential",ls:U.pf["e.ls"]||""};
      const dup = findDupOf(d.first,d.last,d.phone,d.email); const id = newCust(d); cv.c = id; log("cust-create",{id,d,dup,viaEngage:true}); log("eng-newcust",{c:cv.id,cust:id,dup});
      if(dup) slip(`Made a second record for ${cname(W,dup)}. Search before you create.`, true); else toast("Customer created."); return true; }
  }
  return null;
}


(function(HOST){
  const TITLES = {"f-1": "Create a new customer", "f-2": "Add a second contact or service address", "f-3": "Use tags the right way", "f-4": "Give every customer a lead source", "f-5": "Know the users, roles and teams", "f-6": "Know how texts and emails go out", "f-7": "Merge duplicate customers", "m1-1": "Take a new call and capture the details", "m1-2": "Book a job and create the customer at the same time", "m1-3": "Return missed calls and voicemails", "m1-4": "Book an emergency call so it stands out", "m1-5": "Work web requests from the Booking Portal", "m1-6": "Catch jobs with no lead source", "m1-7": "Save a card on file when you book", "m1-8": "Log jobs the owner or techs take outside the office", "m1-9": "Review call recordings weekly", "m2-1": "Book a job from a template", "m2-2": "Add a second visit to a job", "m2-3": "Confirm the appointment", "m2-4": "Reschedule or cancel a job", "m2-5": "Keep the dispatch board current and catch stalled jobs", "m2-6": "Check that finished jobs are closed out", "m3-1": "Create an invoice from a job", "m3-2": "Send an invoice with a pay link", "m3-3": "Find finished jobs with no invoice", "m3-4": "Record a check or cash payment", "m3-5": "Chase unpaid invoices", "m3-6": "Void an invoice the right way", "m3-7": "Refund a payment", "m3-8": "Bill a deposit or a progress payment", "m3-9": "Bill a property-management or commercial account", "m3-10": "Ask for a review after every paid job", "m4-1": "Build an estimate with options", "m4-2": "Send an estimate and ask for a deposit", "m4-3": "Follow up on open estimates", "m4-4": "Mark an estimate won or lost", "m4-5": "Book the sold work", "m5-1": "Check QuickBooks sync errors", "m5-2": "Keep records ready to sync", "m5-3": "Review team timesheets before payroll", "m5-4": "Pull a timesheet report for the pay period", "m5-5": "Close out a leaver's login", "m5-6": "Set up a new hire's FieldPulse login", "m5-7": "Help run the hiring pipeline", "m7-1": "Track customer insurance certificates (COIs)", "m7-2": "Track licenses and certifications", "m7-3": "Track permits from flag to close", "m7-4": "Manage the shared inboxes", "m7-5": "Register manufacturer warranties on installs", "m7-6": "Keep sales tax right", "m6-1": "Build a saved report", "m6-2": "Put a report on the dashboard", "m6-3": "Pull payments by person and day", "m6-4": "Pull the estimate close rate", "m6-5": "Pull jobs by lead source", "m6-6": "Send the owner their numbers"};
  window.FPCourse = {
    _L: TITLES,
    lessonTitle(id){ return TITLES[id] || id; },
    lessonSop(){ return ""; },
    openLesson(id){ const x = window.ACAD && window.ACAD.BY[id]; if(x) location.href = window.ACAD.href(x); },
    savePractice(p){ try{ const R = rating(); window.FPTrack.practiceSave({ data: p, done: R.done, own: R.own, serious: R.serious, slips: R.slips, result: R.r }); }catch(e){ console.error(e); } },
    download(name, text){ const a = document.createElement("a"); a.href = URL.createObjectURL(new Blob([text], { type: "text/plain" })); a.download = name; document.body.appendChild(a); a.click(); a.remove(); }
  };
  /* the results text and file say whose results they are and when */
  const _rt = resultsText;
  resultsText = function(){ const me = (window.FPTrack && window.FPTrack.me()) || {};
    return "Trainee: " + (me.full_name || me.email || "") + (me.email && me.full_name ? " (" + me.email + ")" : "") + "\nDate: " + (window.FPTrack ? window.FPTrack.fmtTime(new Date().toISOString()) : new Date().toISOString()) + "\n" + _rt(); };
  const _dl = window.FPCourse.download;
  window.FPCourse.download = function(name, text){ const me = (window.FPTrack && window.FPTrack.me()) || {}; const slug = String(me.full_name || me.email || "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""); _dl(slug ? name.replace(/\.txt$/, "-" + slug + ".txt") : name, text); };
  const root = HOST.querySelector("#px");
  window.FPPractice.mount(root);
  window.FPPractice.load(SAVED && SAVED.tasks ? SAVED : { tasks: {}, slips: {} });
  let d0 = 1; try { d0 = [1, 2, 3, 4].find((d) => dayTasks(d).some((t) => !PROG.tasks[t.id])) || 1; } catch (e) {}
  window.FPPractice.show(d0);
  /* read-only handle for the automated test that solves every task */
  window.__acadPractice = { dayTasks: (d) => dayTasks(d), get DAY(){ return DAY; }, get PROGRAM(){ return PROGRAM; }, get PROG(){ return PROG; }, rating: () => rating(), get U(){ return U; }, get TOTAL(){ return TOTAL_TASKS; } };
})(HOST);

}
