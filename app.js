"use strict";
/* ============================================================ constants */

const GROUPS = [
  {id:"fixed", name:"Fixed costs",     hue:"var(--s1)", note:"Committed before payday"},
  {id:"living",name:"Everyday living", hue:"var(--s2)", note:"Getting through the week"},
  {id:"life",  name:"Lifestyle",       hue:"var(--s3)", note:"Chosen, not required"},
  {id:"save",  name:"Savings & goals", hue:"var(--s4)", note:"Money you kept on purpose"}
];
const GROUP = Object.fromEntries(GROUPS.map(g => [g.id, g]));
const LEFTOVER_HUE = "var(--neutral-flow)";

/* account types keep their own hues (slots 5-8, in that order) so they never
   read as one of the four spending groups */
const ACC_TYPES = [
  {id:"bank",   name:"Bank",           hue:"var(--s5)", note:"where pay lands"},
  {id:"cash",   name:"Cash",           hue:"var(--s6)", note:"in your wallet"},
  {id:"wallet", name:"Digital wallet", hue:"var(--s7)", note:"PayPay, IC cards, apps"},
  {id:"credit", name:"Credit & owing", hue:"var(--s8)", note:"balance you still owe"}
];
const ACC_TYPE = Object.fromEntries(ACC_TYPES.map(t => [t.id, t]));

const DEFAULT_CATS = [
  {id:"rent",      name:"Rent & home",        group:"fixed"},
  {id:"elec",      name:"Electricity",        group:"fixed"},
  {id:"gas",       name:"Gas",                group:"fixed"},
  {id:"water",     name:"Water",              group:"fixed"},
  {id:"phone",     name:"Phone & internet",   group:"fixed"},
  {id:"insure",    name:"Insurance",          group:"fixed"},
  {id:"loan",      name:"Loans & debt",       group:"fixed"},
  {id:"subs",      name:"Subscriptions",      group:"fixed"},
  {id:"tax",       name:"Tax & civic fees",   group:"fixed"},

  {id:"grocery",   name:"Groceries",          group:"living"},
  {id:"konbini",   name:"Convenience store",  group:"living"},
  {id:"transport", name:"Transport",          group:"living"},
  {id:"health",    name:"Health & pharmacy",  group:"living"},
  {id:"household", name:"Household & 100-yen",group:"living"},
  {id:"care",      name:"Personal care",      group:"living"},
  {id:"laundry",   name:"Laundry & cleaning", group:"living"},

  {id:"dining",    name:"Eating out",         group:"life"},
  {id:"cafe",      name:"Cafés & drinks",     group:"life"},
  {id:"shopping",  name:"Shopping & clothes", group:"life"},
  {id:"hobby",     name:"Hobbies",            group:"life"},
  {id:"fun",       name:"Entertainment",      group:"life"},
  {id:"travel",    name:"Travel",             group:"life"},
  {id:"gift",      name:"Gifts & giving",     group:"life"},
  {id:"study",     name:"Learning",           group:"life"},
  {id:"pets",      name:"Pets",               group:"life"},
  {id:"misc",      name:"Unaccounted",        group:"life"},

  {id:"emerg",     name:"Emergency fund",     group:"save"},
  {id:"invest",    name:"Investments",        group:"save"},
  {id:"goal",      name:"Big purchase fund",  group:"save"}
];
const CAT_ALIASES = { util:"elec", home:"household" };

const KEYWORDS = {
  rent:["rent","landlord","condo","apartment","mortgage","housing","yachin","管理費","家賃","dorm","lease"],
  elec:["electric","electricity","power bill","denki","電気","tepco","kepco","chubu electric"],
  gas:["gas bill","city gas","tokyo gas","osaka gas","propane","ガス","gasu"],
  water:["water bill","waterworks","水道","suido","sewer"],
  phone:["internet","wifi","phone","mobile","broadband","docomo","softbank","rakuten mobile","ahamo","povo","ocn","nuro","sim","data plan"],
  insure:["insurance","hoken","保険","premium","policy","nenkin","pension"],
  loan:["loan","repayment","installment","instalment","credit card payment","debt","interest","shakkin"],
  subs:["subscription","netflix","spotify","icloud","youtube premium","adobe","gym","membership","amazon prime","dazn","notion","dropbox","chatgpt","claude"],
  tax:["tax","juminzei","住民税","nhk","ward office","city hall","resident tax","pension payment"],

  grocery:["grocery","groceries","supermarket","aeon","ito yokado","summit","maruetsu","life super","gyomu","business super","seiyu","ok store","hanamasa","市場","market","tesco","big c","makro","carrefour","aldi","costco"],
  konbini:["konbini","convenience","7-eleven","seven eleven","seven-eleven","lawson","family mart","familymart","famima","ministop","daily yamazaki","seicomart","newdays"],
  transport:["taxi","uber","grab","bolt","lyft","fuel","petrol","gasoline","gas station","suica","pasmo","icoca","ic charge","jr","metro","subway","train","shinkansen","bus","parking","toll","etc card","bicycle","highway"],
  health:["pharmacy","clinic","hospital","doctor","dentist","medicine","matsumoto kiyoshi","welcia","sundrug","tsuruha","cocokara","drug store","optician","glasses"],
  household:["daiso","seria","can do","100 yen","100-yen","hyakkin","nitori","ikea","muji","household","cleaning","repair","furniture","hardware","kitchen","tissue","detergent","home center","cainz"],
  care:["haircut","salon","barber","cosmetics","shampoo","skincare","nail","spa","onsen","sento","massage"],
  laundry:["laundry","coin laundry","dry clean","cleaning shop","クリーニング"],

  dining:["restaurant","lunch","dinner","breakfast","brunch","izakaya","ramen","sushi","yakiniku","udon","soba","curry","bento","gyudon","sukiya","yoshinoya","matsuya","saizeriya","ootoya","mcdonald","burger","pizza","kfc","food delivery","uber eats","demae","wolt","foodpanda","doordash","deliveroo"],
  cafe:["cafe","coffee","starbucks","doutor","tully","komeda","excelsior","veloce","kissaten","tea","boba","bubble tea","juice","smoothie","bar","pub","beer","wine","sake"],
  shopping:["uniqlo","gu store","zara","h&m","shopping","clothes","clothing","shoes","mall","amazon","rakuten","mercari","shopee","lazada","don quijote","donki","loft","tokyu hands","electronics","yodobashi","bic camera","apple store"],
  hobby:["hobby","craft","camera","instrument","guitar","art supplies","bookstore","book","manga","kinokuniya","tsutaya","yodobashi hobby","model kit","gacha","figure"],
  fun:["cinema","movie","toho","game","steam","nintendo","playstation","concert","live house","ticket","entertainment","museum","karaoke","club","theme park","disney","usj","arcade"],
  travel:["flight","airline","ana","jal","peach","jetstar","hotel","airbnb","booking","travel","trip","agoda","ryokan","hostel","luggage","tour"],
  gift:["gift","present","donation","charity","otoshidama","goshugi","wedding","omiyage","souvenir","temple","shrine"],
  study:["course","tuition","school","lesson","textbook","exam","udemy","language class","nihongo","certification"],
  pets:["pet","vet","dog","cat","pet food","litter","grooming"],

  emerg:["savings","emergency","save","deposit","chokin"],
  invest:["invest","stock","stocks","fund","nisa","ideco","crypto","bitcoin","etf","gold","bond","portfolio","sbi","rakuten shoken","monex"],
  goal:["goal fund","sinking fund","big purchase","saving for"]
};
const TRANSFER_WORDS = ["charge","chaji","top up","topup","withdraw","atm","transfer","move to","furikomi","送金","チャージ"];

const CURRENCIES = ["JPY","THB","USD","EUR","GBP","SGD","MYR","IDR","PHP","VND","INR","KRW","TWD","CNY","HKD","AUD","CAD","CHF","NZD","AED","SAR","ZAR","BRL","MXN","TRY","PLN","SEK","NOK","DKK","CZK","NGN","KES","EGP"];
const TZ_CUR = {
  "Asia/Tokyo":"JPY","Asia/Bangkok":"THB","Asia/Singapore":"SGD","Asia/Kuala_Lumpur":"MYR","Asia/Jakarta":"IDR",
  "Asia/Manila":"PHP","Asia/Ho_Chi_Minh":"VND","Asia/Seoul":"KRW","Asia/Shanghai":"CNY","Asia/Hong_Kong":"HKD",
  "Asia/Taipei":"TWD","Asia/Kolkata":"INR","Asia/Calcutta":"INR","Asia/Dubai":"AED","Asia/Riyadh":"SAR",
  "Europe/London":"GBP","Europe/Zurich":"CHF","Europe/Stockholm":"SEK","Europe/Oslo":"NOK","Europe/Copenhagen":"DKK",
  "Europe/Warsaw":"PLN","Europe/Prague":"CZK","Europe/Istanbul":"TRY","Africa/Lagos":"NGN","Africa/Nairobi":"KES",
  "Africa/Cairo":"EGP","Africa/Johannesburg":"ZAR","America/New_York":"USD","America/Chicago":"USD",
  "America/Denver":"USD","America/Los_Angeles":"USD","America/Toronto":"CAD","America/Vancouver":"CAD",
  "America/Sao_Paulo":"BRL","America/Mexico_City":"MXN","Australia/Sydney":"AUD","Australia/Melbourne":"AUD",
  "Pacific/Auckland":"NZD"
};
const BASE_SALARY = {JPY:280000,THB:45000,USD:4500,EUR:4000,GBP:3500,SGD:5500,MYR:6000,IDR:9000000,PHP:45000,
  VND:20000000,INR:80000,KRW:3800000,TWD:55000,CNY:15000,HKD:28000,AUD:6500,CAD:5500,CHF:6500,NZD:6000,
  AED:15000,SAR:14000,ZAR:35000,BRL:6000,MXN:25000,TRY:45000,PLN:9000,SEK:38000,NOK:48000,DKK:32000,
  CZK:45000,NGN:800000,KES:150000,EGP:25000};
const ZERO_DEC = new Set(["JPY","KRW","VND","IDR","CLP","ISK"]);

/* ============================================================ helpers */

const state = { ready:false, db:null, sample:false, period:"", config:null, plan:null, months:{},
  filterCat:"", filterAcc:"", search:"", userMovedPeriod:false };

const FALLBACK_CAT = "misc";
const $ = id => document.getElementById(id);
const el = (tag, cls, txt) => { const n = document.createElement(tag); if (cls) n.className = cls; if (txt != null) n.textContent = txt; return n; };
const num = v => { const n = Number(v); return Number.isFinite(n) ? n : 0; };
const uid = () => Math.random().toString(36).slice(2, 9) + Date.now().toString(36).slice(-3);
const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));
const esc = s => String(s).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
const useCap = name => {
  try { return (window.claude && window.claude.use) ? window.claude.use(name) : Promise.resolve(null); }
  catch (e) { return Promise.resolve(null); }
};

const pad2 = n => String(n).padStart(2, "0");
const iso = d => d.getFullYear() + "-" + pad2(d.getMonth() + 1) + "-" + pad2(d.getDate());
const parseISO = s => { const [y, m, d] = String(s).split("-").map(Number); return new Date(y, (m || 1) - 1, d || 1); };
const daysIn = (y, m) => new Date(y, m + 1, 0).getDate();
const today = () => { const d = new Date(); d.setHours(0, 0, 0, 0); return d; };
const dayCount = (a, b) => Math.round((b - a) / 86400000) + 1;

function periodKeyFor(date, startDay) {
  const d = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  if (startDay > 1 && d.getDate() < startDay) d.setMonth(d.getMonth() - 1, 1);
  return d.getFullYear() + "-" + pad2(d.getMonth() + 1);
}
function periodRange(key, startDay) {
  const [y, m] = key.split("-").map(Number);
  if (startDay <= 1) return { start: new Date(y, m - 1, 1), end: new Date(y, m - 1, daysIn(y, m - 1)) };
  const start = new Date(y, m - 1, Math.min(startDay, daysIn(y, m - 1)));
  const nextM = m % 12, nextY = m === 12 ? y + 1 : y;
  const end = new Date(nextY, nextM, Math.min(startDay, daysIn(nextY, nextM)));
  end.setDate(end.getDate() - 1);
  return { start, end };
}
function shiftKey(key, delta) {
  const [y, m] = key.split("-").map(Number);
  const d = new Date(y, m - 1 + delta, 1);
  return d.getFullYear() + "-" + pad2(d.getMonth() + 1);
}
function periodLabel(key, startDay) {
  const { start, end } = periodRange(key, startDay);
  if (startDay <= 1) return start.toLocaleDateString(undefined, { month: "long", year: "numeric" });
  return start.toLocaleDateString(undefined, { day: "numeric", month: "short" }) + " – " +
    end.toLocaleDateString(undefined, { day: "numeric", month: "short" });
}
function periodShort(key, startDay) {
  return periodRange(key, startDay).start.toLocaleDateString(undefined, { month: "short" });
}
/* the date a day-of-month item falls on inside a given period */
function dayInPeriod(day, key) {
  const { start, end } = periodRange(key, state.config.startDay);
  const d = new Date(start.getFullYear(), start.getMonth(), clamp(num(day) || 1, 1, 28));
  if (d < start) d.setMonth(d.getMonth() + 1);
  return d > end ? new Date(end) : d;
}

let fmtCache = {};
function money(v, opts) {
  const o = opts || {};
  const cur = state.config ? state.config.currency : "USD";
  const dec = ZERO_DEC.has(cur) ? 0 : (o.cents ? 2 : 0);
  const k = cur + "|" + dec;
  if (!fmtCache[k]) fmtCache[k] = new Intl.NumberFormat(undefined,
    { style: "currency", currency: cur, minimumFractionDigits: dec, maximumFractionDigits: dec });
  return fmtCache[k].format(v);
}
function moneyCompact(v) {
  const cur = state.config ? state.config.currency : "USD";
  try { return new Intl.NumberFormat(undefined, { style: "currency", currency: cur, notation: "compact", maximumFractionDigits: 1 }).format(v); }
  catch (e) { return money(v); }
}
const pct = (a, b) => (!b ? 0 : (a / b) * 100);
const pctStr = (a, b) => (!b ? "—" : (pct(a, b) < 10 ? pct(a, b).toFixed(1) : String(Math.round(pct(a, b)))) + "%");
function currencySymbol(cur) {
  try {
    const p = new Intl.NumberFormat(undefined, { style: "currency", currency: cur }).formatToParts(0);
    const s = p.find(x => x.type === "currency");
    return s ? s.value : cur;
  } catch (e) { return cur; }
}
function ordinal(n) { const s = ["th", "st", "nd", "rd"], v = n % 100; return n + (s[(v - 20) % 10] || s[v] || s[0]); }

/* ============================================================ defaults, sample, migration */

function guessCurrency() {
  try { const tz = Intl.DateTimeFormat().resolvedOptions().timeZone; if (TZ_CUR[tz]) return TZ_CUR[tz]; } catch (e) {}
  return "USD";
}
function blankConfig() {
  return { currency: guessCurrency(), startDay: 1, reservePct: 20, lastAcc: "" };
}
function defaultAccounts() {
  return [
    { id: "bank1",   name: "Bank account",  type: "bank",   opening: 0 },
    { id: "wallet1", name: "PayPay",        type: "wallet", opening: 0 },
    { id: "cash1",   name: "Cash",          type: "cash",   opening: 0 }
  ];
}
function blankPlan(cur) {
  return {
    accounts: defaultAccounts(),
    incomes: [{ id: uid(), name: "Take-home pay", amount: BASE_SALARY[cur] || 4500, acc: "bank1", day: 25 }],
    fixed: [],
    cats: DEFAULT_CATS.map(c => ({ ...c, budget: 0 }))
  };
}

function sampleState() {
  const cur = guessCurrency();
  const b = BASE_SALARY[cur] || 4500;
  const r = x => Math.round(b * x / 10) * 10;
  const cfg = { currency: cur, startDay: 1, reservePct: 20, lastAcc: "wallet1" };
  /* budgets sit a little above the actual bills, the way a real budget does */
  const budgets = { rent:0.275, elec:0.032, gas:0.018, water:0.014, phone:0.03, insure:0.03, subs:0.022, tax:0.02,
    grocery:0.1, konbini:0.03, transport:0.045, health:0.015, household:0.02, care:0.015, laundry:0.008,
    dining:0.06, cafe:0.02, shopping:0.04, hobby:0.02, fun:0.02, travel:0.025, gift:0.012, study:0.01,
    emerg:0.08, invest:0.1, goal:0.03 };
  const plan = {
    accounts: [
      { id: "bank1",   name: "Bank account", type: "bank",   opening: r(1.6) },
      { id: "wallet1", name: "PayPay",       type: "wallet", opening: r(0.06) },
      { id: "cash1",   name: "Cash",         type: "cash",   opening: r(0.05) }
    ],
    incomes: [{ id: "i1", name: "Take-home pay", amount: b, acc: "bank1", day: 25 }],
    fixed: [
      { id: "f1", name: "Rent",            amount: r(0.26),  cat: "rent",   day: 1,  acc: "bank1", variable: false },
      { id: "f2", name: "Electricity",     amount: r(0.025), cat: "elec",   day: 5,  acc: "bank1", variable: true },
      { id: "f3", name: "Gas",             amount: r(0.015), cat: "gas",    day: 5,  acc: "bank1", variable: true },
      { id: "f4", name: "Water",           amount: r(0.012), cat: "water",  day: 8,  acc: "bank1", variable: true },
      { id: "f5", name: "Phone & internet",amount: r(0.028), cat: "phone",  day: 10, acc: "bank1", variable: false },
      { id: "f6", name: "Streaming & gym", amount: r(0.02),  cat: "subs",   day: 12, acc: "bank1", variable: false }
    ],
    cats: DEFAULT_CATS.map(c => ({ ...c, budget: budgets[c.id] ? r(budgets[c.id]) : 0 }))
  };
  const key = periodKeyFor(today(), 1);
  const { start, end } = periodRange(key, 1);
  const elapsed = clamp(dayCount(start, today()), 1, dayCount(start, end));
  const seeds = [
    [1,"grocery",0.026,"Supermarket","bank1"], [1,"konbini",0.004,"Lawson","wallet1"],
    [2,"cafe",0.005,"Morning coffee","wallet1"], [2,"transport",0.006,"IC card charge","cash1"],
    [3,"dining",0.011,"Lunch out","wallet1"], [4,"household",0.005,"Daiso","cash1"],
    [5,"konbini",0.003,"7-Eleven","wallet1"], [6,"grocery",0.022,"Weekly shop","bank1"],
    [7,"dining",0.016,"Dinner with friends","bank1"], [8,"fun",0.011,"Cinema","wallet1"],
    [9,"health",0.008,"Matsumoto Kiyoshi","wallet1"], [10,"cafe",0.004,"Coffee","cash1"],
    [11,"transport",0.007,"Train","wallet1"], [12,"grocery",0.024,"Groceries","bank1"],
    [13,"household",0.008,"Daiso & cleaning","cash1"], [14,"invest",0.1,"NISA transfer","bank1"],
    [15,"emerg",0.05,"Emergency fund","bank1"], [16,"dining",0.013,"Ramen","cash1"],
    [17,"shopping",0.018,"Uniqlo","bank1"], [18,"konbini",0.004,"FamilyMart","wallet1"],
    [19,"grocery",0.021,"Groceries","bank1"], [20,"gift",0.012,"Birthday gift","bank1"],
    [21,"cafe",0.006,"Cafe with friend","wallet1"], [22,"care",0.013,"Haircut","cash1"],
    [23,"transport",0.006,"IC card charge","wallet1"], [24,"grocery",0.023,"Groceries","bank1"],
    [25,"dining",0.01,"Izakaya","cash1"], [26,"hobby",0.014,"Bookstore","wallet1"],
    [27,"konbini",0.003,"Lawson","wallet1"], [28,"cafe",0.004,"Coffee","wallet1"]
  ];
  const tx = [];
  seeds.forEach((s, i) => {
    if (s[0] > elapsed) return;
    const d = new Date(start); d.setDate(start.getDate() + s[0] - 1);
    tx.push({ id: "s" + i, d: iso(d), a: Math.round(b * s[2]), c: s[1], n: s[3], t: "exp", acc: s[4] });
  });
  /* wallets and cash have to be funded from the bank, or they drift negative */
  const fundWallets = (list, prefix, rangeStart) => {
    const need = { wallet1: 0, cash1: 0 };
    list.forEach(t => { if (t.t === "exp" && need[t.acc] != null) need[t.acc] += t.a; });
    Object.keys(need).forEach((accId, i) => {
      if (need[accId] <= 0) return;
      const d = new Date(rangeStart); d.setDate(rangeStart.getDate() + i);
      list.push({ id: prefix + "_x" + i, d: iso(d), a: Math.ceil(need[accId] * 1.2 / 1000) * 1000,
        t: "xfer", from: "bank1", to: accId, n: accId === "cash1" ? "ATM withdrawal" : "PayPay charge" });
    });
  };
  fundWallets(tx, "s", start);

  const months = {};
  months[key] = { key, tx, skip: [], paid: ["f1", "f5"],
    gotIncome: elapsed >= 25 ? ["i1"] : [],
    billAmt: elapsed >= 5 ? { f2: r(0.028), f3: r(0.013) } : {} };
  const ratios = [0.93, 0.88, 1.02, 0.85, 0.96];
  const varHist = [[0.031, 0.011], [0.036, 0.009], [0.024, 0.014], [0.021, 0.016], [0.02, 0.018]];
  for (let i = 1; i <= 5; i++) {
    const k = shiftKey(key, -i);
    const rg = periodRange(k, 1);
    const n = dayCount(rg.start, rg.end);
    const prior = [];
    seeds.forEach((s, j) => {
      if (s[0] > n) return;
      const d = new Date(rg.start); d.setDate(rg.start.getDate() + s[0] - 1);
      prior.push({ id: "p" + i + "_" + j, d: iso(d), a: Math.round(b * s[2] * ratios[i - 1]), c: s[1], n: s[3], t: "exp", acc: s[4] });
    });
    fundWallets(prior, "p" + i, rg.start);
    months[k] = { key: k, tx: prior, skip: [], paid: ["f1", "f2", "f3", "f4", "f5", "f6"], gotIncome: ["i1"],
      billAmt: { f2: r(varHist[i - 1][0]), f3: r(varHist[i - 1][1]), f4: r(0.012) } };
  }
  return { cfg, plan, months };
}

/* fills in anything an older saved shape is missing; safe to run on every load */
function migrate() {
  const p = state.plan, c = state.config;
  if (!p.accounts || !p.accounts.length) p.accounts = defaultAccounts();
  p.accounts.forEach(a => { if (!ACC_TYPE[a.type]) a.type = "bank"; a.opening = num(a.opening); });
  const firstBank = (p.accounts.find(a => a.type === "bank") || p.accounts[0]).id;

  if (!p.cats || !p.cats.length) p.cats = DEFAULT_CATS.map(x => ({ ...x, budget: 0 }));
  // a v1 plan had "util"/"home" and no "elec": lift it to the fuller category set, keeping budgets
  if (p.cats.some(x => x.id === "util") && !p.cats.some(x => x.id === "elec")) {
    const old = Object.fromEntries(p.cats.map(x => [x.id, num(x.budget)]));
    const defaults = new Set(DEFAULT_CATS.map(x => x.id).concat(Object.keys(CAT_ALIASES)));
    const custom = p.cats.filter(x => !defaults.has(x.id));
    p.cats = DEFAULT_CATS.map(x => ({ ...x, budget: old[x.id] != null ? old[x.id] : 0 })).concat(custom);
    const e = p.cats.find(x => x.id === "elec"); if (e && old.util) e.budget = old.util;
    const h = p.cats.find(x => x.id === "household"); if (h && old.home) h.budget = old.home;
  }
  const fixCat = id => CAT_ALIASES[id] || id;

  (p.incomes || []).forEach(i => { if (!i.acc) i.acc = firstBank; if (i.day == null) i.day = 25; });
  (p.fixed || []).forEach(b => {
    if (!b.acc) b.acc = firstBank;
    if (b.variable == null) b.variable = false;
    b.cat = fixCat(b.cat);
  });
  Object.values(state.months).forEach(m => {
    if (!Array.isArray(m.tx)) m.tx = [];
    if (!Array.isArray(m.skip)) m.skip = [];
    if (!Array.isArray(m.paid)) m.paid = [];
    if (!Array.isArray(m.gotIncome)) m.gotIncome = [];
    if (!m.billAmt || typeof m.billAmt !== "object") m.billAmt = {};
    m.tx.forEach(t => {
      if (t.t !== "xfer" && !t.acc) t.acc = c.lastAcc || firstBank;
      if (t.t === "exp") t.c = fixCat(t.c);
    });
  });
  if (!c.lastAcc || !p.accounts.some(a => a.id === c.lastAcc)) c.lastAcc = firstBank;
}

/* ============================================================ storage */

const writeTimers = new Map(), writeQueues = new Map();
// Storage keys keep the original prefix on purpose: renaming the app must not
// orphan a book that already has real entries in it.
const localKey = p => "salaryflow:" + p;
function localSave(p, o) { try { localStorage.setItem(localKey(p), JSON.stringify(o)); } catch (e) {} }
function localLoad(p) { try { const r = localStorage.getItem(localKey(p)); return r ? JSON.parse(r) : null; } catch (e) { return null; } }
function localAllMonths() {
  const out = {};
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (k && k.startsWith("salaryflow:months/")) { const v = JSON.parse(localStorage.getItem(k)); if (v && v.key) out[v.key] = v; }
    }
  } catch (e) {}
  return out;
}
function persist(path, obj, delay) {
  if (state.sample) return;
  localSave(path, obj);
  if (!state.db) return;
  clearTimeout(writeTimers.get(path));
  writeTimers.set(path, setTimeout(() => {
    const prev = writeQueues.get(path) || Promise.resolve();
    const run = () => state.db.doc(path).set(JSON.parse(JSON.stringify(obj))).catch(err => {
      console.warn("write failed", path, err && err.code);
      if (err && (err.code === "revoked" || err.code === "quota_exceeded")) { state.db = null; renderStorageNote(); }
    });
    writeQueues.set(path, prev.then(run, run));
  }, delay == null ? 400 : delay));
}
const saveConfig = () => persist("config/main", state.config);
const savePlan = () => persist("plan/main", state.plan);
function saveMonth(key) { const m = state.months[key]; if (!m) return; m.key = key; persist("months/" + key, m); }
function monthDoc(key) {
  if (!state.months[key]) state.months[key] = { key, tx: [], skip: [], paid: [], gotIncome: [], billAmt: {} };
  const m = state.months[key];
  if (!Array.isArray(m.tx)) m.tx = [];
  if (!Array.isArray(m.skip)) m.skip = [];
  if (!Array.isArray(m.paid)) m.paid = [];
  if (!Array.isArray(m.gotIncome)) m.gotIncome = [];
  if (!m.billAmt) m.billAmt = {};
  return m;
}

/* ============================================================ lookups & bill amounts */

function catById(id) {
  const real = CAT_ALIASES[id] || id;
  return state.plan.cats.find(c => c.id === real) || { id: real, name: real || "Uncategorised", group: "life", budget: 0 };
}
function accById(id) {
  return state.plan.accounts.find(a => a.id === id) || { id, name: "Unassigned", type: "bank", opening: 0 };
}
function accHue(id) { return (ACC_TYPE[accById(id).type] || ACC_TYPES[0]).hue; }

/* what a bill costs in a given period: the figure you typed, else an estimate from history */
function billAmount(bill, key) {
  const m = state.months[key];
  const entered = m && m.billAmt ? m.billAmt[bill.id] : undefined;
  if (typeof entered === "number") return { v: entered, est: false, known: true };
  if (!bill.variable) return { v: num(bill.amount), est: false, known: true };
  const past = Object.keys(state.months).filter(k => k < key).sort().reverse();
  const vals = [];
  for (const k of past) {
    const v = state.months[k] && state.months[k].billAmt ? state.months[k].billAmt[bill.id] : undefined;
    if (typeof v === "number") { vals.push(v); if (vals.length >= 3) break; }
  }
  if (vals.length) return { v: Math.round(vals.reduce((s, x) => s + x, 0) / vals.length), est: true, known: false };
  return { v: num(bill.amount), est: true, known: false };
}

/* ============================================================ derived model */

function derive(key) {
  const plan = state.plan, cfg = state.config;
  const m = state.months[key] || { tx: [], skip: [], paid: [], gotIncome: [], billAmt: {} };
  const { start, end } = periodRange(key, cfg.startDay);
  const tx = (m.tx || []).slice();
  const skip = new Set(m.skip || []);
  const paid = new Set(m.paid || []);
  const got = new Set(m.gotIncome || []);

  const baseIncome = (plan.incomes || []).reduce((s, i) => s + num(i.amount), 0);
  const extraIncome = tx.filter(t => t.t === "inc").reduce((s, t) => s + num(t.a), 0);
  const income = baseIncome + extraIncome;

  const bills = (plan.fixed || []).filter(b => !skip.has(b.id)).map(b => {
    const a = billAmount(b, key);
    return { ...b, amt: a.v, est: a.est, known: a.known, settled: paid.has(b.id), due: dayInPeriod(b.day, key) };
  });
  const billTotal = bills.reduce((s, b) => s + b.amt, 0);
  const unsettledBills = bills.filter(b => !b.settled).reduce((s, b) => s + b.amt, 0);
  const needAmount = bills.filter(b => b.variable && !b.known);

  const byCat = new Map();
  const bump = (id, v) => byCat.set(id, (byCat.get(id) || 0) + v);
  bills.forEach(b => bump(b.cat, b.amt));
  tx.forEach(t => { if (t.t === "exp") bump(t.c, num(t.a)); });
  const spend = Array.from(byCat.values()).reduce((s, v) => s + v, 0);

  const groups = GROUPS.map(g => {
    const cats = plan.cats.filter(c => c.group === g.id)
      .map(c => ({ id: c.id, name: c.name, total: byCat.get(c.id) || 0, budget: num(c.budget) }));
    if (g.id === "life") {
      byCat.forEach((v, id) => { if (!plan.cats.some(c => c.id === id)) cats.push({ id, name: id || "Uncategorised", total: v, budget: 0 }); });
    }
    return { ...g, cats: cats.sort((a, b) => b.total - a.total),
      total: cats.reduce((s, c) => s + c.total, 0), budget: cats.reduce((s, c) => s + c.budget, 0) };
  });

  const saved = groups.find(g => g.id === "save").total;
  const reserve = income * num(cfg.reservePct) / 100;
  const reserveGap = Math.max(0, reserve - saved);
  const leftover = income - spend;
  const free = leftover - reserveGap;

  const t = today();
  const isCurrent = t >= start && t <= end;
  const isFuture = t < start;
  const totalDays = dayCount(start, end);
  const elapsed = isCurrent ? dayCount(start, t) : (isFuture ? 0 : totalDays);
  const daysLeft = isCurrent ? dayCount(t, end) : (isFuture ? totalDays : 0);

  const incomesDue = (plan.incomes || []).map(i => ({ ...i, got: got.has(i.id), due: dayInPeriod(i.day, key) }));

  return { key, start, end, income, baseIncome, extraIncome, bills, billTotal, unsettledBills, needAmount,
    byCat, spend, groups, saved, reserve, reserveGap, leftover, free, incomesDue,
    isCurrent, isFuture, totalDays, elapsed, daysLeft, tx, paid, skip, got };
}

/* balances count only money that has actually moved: ledger entries, settled
   bills, and income marked received */
function balancesAsOf(cutoff) {
  const bal = {};
  state.plan.accounts.forEach(a => { bal[a.id] = num(a.opening); });
  /* never count money dated in the future — a salary due on the 25th is not
     held on the 20th, however it is ticked */
  const t = today();
  const cut = !cutoff || cutoff > t ? t : cutoff;
  const within = ds => parseISO(ds) <= cut;
  Object.keys(state.months).forEach(key => {
    const m = state.months[key];
    (m.tx || []).forEach(t => {
      if (!within(t.d)) return;
      const a = num(t.a);
      if (t.t === "inc") { if (bal[t.acc] != null) bal[t.acc] += a; }
      else if (t.t === "xfer") { if (bal[t.from] != null) bal[t.from] -= a; if (bal[t.to] != null) bal[t.to] += a; }
      else if (bal[t.acc] != null) bal[t.acc] -= a;
    });
    const skip = new Set(m.skip || []), paid = new Set(m.paid || []), got = new Set(m.gotIncome || []);
    (state.plan.fixed || []).forEach(b => {
      if (skip.has(b.id) || !paid.has(b.id)) return;
      if (!within(iso(dayInPeriod(b.day, key)))) return;
      if (bal[b.acc] != null) bal[b.acc] -= billAmount(b, key).v;
    });
    (state.plan.incomes || []).forEach(i => {
      if (!got.has(i.id)) return;
      if (!within(iso(dayInPeriod(i.day, key)))) return;
      if (bal[i.acc] != null) bal[i.acc] += num(i.amount);
    });
  });
  return bal;
}

/* ============================================================ hero */

function renderHero(d) {
  $("periodSub").textContent = periodLabel(d.key, state.config.startDay) +
    (d.isCurrent ? " · " + d.daysLeft + (d.daysLeft === 1 ? " day left" : " days left") : "");
  $("curP").textContent = periodShort(d.key, state.config.startDay) + " " + d.start.getFullYear();

  const hero = $("heroNum"), note = $("heroNote"), label = $("heroLabel");
  if (d.isCurrent) {
    const perDay = d.free / Math.max(1, d.daysLeft);
    label.textContent = "Safe to spend · per day";
    hero.textContent = money(Math.max(0, perDay), { cents: Math.abs(perDay) < 100 });
    hero.classList.toggle("warn", perDay < 0);
    const bits = ["<b>" + money(d.free) + "</b> free for the next <b>" + d.daysLeft + "</b> day" + (d.daysLeft === 1 ? "" : "s")];
    if (d.unsettledBills > 0) bits.push("<b>" + money(d.unsettledBills) + "</b> of bills still to go out");
    if (d.reserveGap > 0) bits.push("after setting aside <b>" + money(d.reserveGap) + "</b> toward your " + Math.round(state.config.reservePct) + "% savings goal");
    note.innerHTML = (perDay < 0 ? "You are <b>" + money(-d.free) + "</b> past what this period covers. " : "") + bits.join(", ") + ".";
  } else if (d.isFuture) {
    label.textContent = "Planned · per day";
    hero.textContent = money(Math.max(0, d.free / Math.max(1, d.totalDays)));
    hero.classList.remove("warn");
    note.innerHTML = "Nothing logged yet. On today's plan this period leaves <b>" + money(d.free) + "</b> free across <b>" + d.totalDays + "</b> days.";
  } else {
    label.textContent = "Left over · that period";
    hero.textContent = money(d.leftover);
    hero.classList.toggle("warn", d.leftover < 0);
    note.innerHTML = d.leftover >= 0
      ? "Spent <b>" + money(d.spend) + "</b> of <b>" + money(d.income) + "</b>, keeping " + pctStr(d.leftover, d.income) + " of take-home."
      : "Spent <b>" + money(d.spend) + "</b> against <b>" + money(d.income) + "</b> of income — over by <b>" + money(-d.leftover) + "</b>.";
  }

  $("heroFill").style.width = clamp(pct(d.spend, d.income), 0, 100) + "%";
  $("heroFill").className = d.spend > d.income ? "over" : "";
  const pacer = $("heroPacer");
  if (d.isCurrent && d.totalDays) { pacer.hidden = false; pacer.style.left = clamp(pct(d.elapsed, d.totalDays), 0, 100) + "%"; }
  else pacer.hidden = true;
  $("trackL").textContent = money(d.spend) + " spent";
  $("trackR").textContent = money(d.income) + " in";

  const prev = derive(shiftKey(d.key, -1));
  const tiles = [
    { k: "Take-home", v: d.income, hint: d.extraIncome ? money(d.extraIncome) + " extra income" : state.plan.incomes.length + " source" + (state.plan.incomes.length === 1 ? "" : "s") },
    { k: "Spent", v: d.spend, delta: prev.spend ? d.spend - prev.spend : null, upBad: true, hint: pctStr(d.spend, d.income) + " of take-home" },
    { k: "Saved", v: d.saved, delta: prev.saved ? d.saved - prev.saved : null, upBad: false, hint: pctStr(d.saved, d.income) + " savings rate" },
    { k: d.leftover >= 0 ? "Left over" : "Overspent", v: Math.abs(d.leftover), hint: d.leftover >= 0 ? pctStr(d.leftover, d.income) + " of take-home" : "beyond this period's income" }
  ];
  const box = $("stats");
  box.textContent = "";
  tiles.forEach(t => {
    const s = el("div", "stat");
    s.append(el("div", "k", t.k));
    const v = el("div", "v", money(t.v));
    if (t.k === "Overspent") v.style.color = "var(--crit)";
    s.append(v);
    if (t.delta != null && Math.abs(t.delta) > 0.5) {
      const up = t.delta > 0, good = t.upBad ? !up : up;
      s.append(el("div", "d " + (good ? "down" : "up"), (up ? "▲ " : "▼ ") + money(Math.abs(t.delta)) + " vs last period"));
    } else s.append(el("div", "d", t.hint));
    box.append(s);
  });
}

/* ============================================================ to-do list */

function renderTodo(d) {
  const box = $("todoList");
  box.textContent = "";
  const t = today();
  const items = [];

  d.incomesDue.forEach(i => {
    if (i.got || num(i.amount) <= 0) return;
    items.push({ kind: "income", id: i.id, name: i.name, due: i.due, amt: num(i.amount),
      sub: accById(i.acc).name, accId: i.acc, variable: false, known: true });
  });
  d.bills.forEach(b => {
    if (b.settled && b.known) return;
    items.push({ kind: "bill", id: b.id, name: b.name, due: b.due, amt: b.amt, est: b.est, known: b.known,
      variable: b.variable, cat: b.cat, accId: b.acc, settled: b.settled });
  });
  items.sort((a, b) => a.due - b.due);

  if (!items.length) {
    box.append(el("p", "empty", d.bills.length || d.incomesDue.length
      ? "Nothing outstanding — every bill this period has an amount and a tick."
      : "No recurring bills yet. Add electricity, gas, rent and the like so they are counted automatically."));
    return;
  }

  items.forEach(it => {
    const overdue = it.due < t && d.isCurrent;
    const soon = !overdue && d.isCurrent && dayCount(t, it.due) <= 3 && it.due >= t;
    const row = el("div", "todo" + (overdue ? " over" : soon ? " soon" : ""));

    const dt = el("div", "tdate");
    dt.innerHTML = "<b>" + it.due.getDate() + "</b>" + esc(it.due.toLocaleDateString(undefined, { month: "short" }));
    row.append(dt);

    const mid = el("div");
    mid.append(el("div", "tt", it.name));
    const sub = el("div", "tc");
    if (it.kind === "income") {
      sub.append(el("span", null, "Income into " + accById(it.accId).name));
    } else {
      const c = catById(it.cat), g = GROUP[c.group] || GROUPS[0];
      const sw = el("span", "swatch"); sw.style.background = g.hue; sw.style.width = "7px"; sw.style.height = "7px";
      sub.append(sw, el("span", null, c.name), el("span", null, "· from " + accById(it.accId).name));
      if (it.variable && !it.known) sub.append(el("span", "tag est", "estimate " + money(it.amt)));
      if (it.settled && !it.known) sub.append(el("span", "tag", "paid, amount unknown"));
    }
    if (overdue) sub.append(el("span", "tag late", "overdue"));
    mid.append(sub);
    row.append(mid);

    if (it.kind === "bill" && it.variable) {
      const inp = el("input", "fld");
      inp.type = "number"; inp.inputMode = "decimal"; inp.step = "1"; inp.min = "0";
      inp.placeholder = String(Math.round(it.amt) || 0);
      inp.setAttribute("aria-label", it.name + " amount");
      if (it.known) inp.value = it.amt;
      const saveAmt = markPaid => {
        const v = inp.value === "" ? (markPaid ? it.amt : null) : num(inp.value);
        if (ensureReal()) return;
        const m = monthDoc(state.period);
        if (v != null) m.billAmt[it.id] = v;
        if (markPaid && m.paid.indexOf(it.id) < 0) m.paid.push(it.id);
        saveMonth(state.period); renderAll();
      };
      inp.addEventListener("keydown", e => { if (e.key === "Enter") saveAmt(false); });
      row.append(inp);
      const b = el("button", "btn btn-sm btn-solid", it.settled ? "Save amount" : "Mark paid");
      b.addEventListener("click", () => saveAmt(!it.settled));
      row.append(b);
    } else {
      const amtCell = el("div", null, money(it.amt));
      amtCell.style.fontFamily = "var(--mono)";
      amtCell.style.fontSize = "13px";
      amtCell.style.fontWeight = "500";
      row.append(amtCell);
      const b = el("button", "btn btn-sm " + (it.kind === "income" ? "" : "btn-solid"),
        it.kind === "income" ? "Mark received" : "Mark paid");
      b.addEventListener("click", () => {
        if (ensureReal()) return;
        const m = monthDoc(state.period);
        const list = it.kind === "income" ? m.gotIncome : m.paid;
        if (list.indexOf(it.id) < 0) list.push(it.id);
        saveMonth(state.period); renderAll();
      });
      row.append(b);
    }
    box.append(row);
  });
}

/* ============================================================ net worth */

function renderNetWorth(d) {
  const bal = balancesAsOf(null);
  const accounts = state.plan.accounts.slice().sort(
    (a, b) => ACC_TYPES.findIndex(t => t.id === a.type) - ACC_TYPES.findIndex(t => t.id === b.type));
  const total = accounts.reduce((s, a) => s + (bal[a.id] || 0), 0);

  const tn = $("nwTotal");
  tn.textContent = money(total);
  tn.classList.toggle("neg", total < 0);

  const positives = accounts.filter(a => (bal[a.id] || 0) > 0);
  const posSum = positives.reduce((s, a) => s + bal[a.id], 0);
  const comp = $("nwComp");
  comp.textContent = "";
  comp.style.display = posSum > 0 ? "" : "none";
  positives.forEach(a => {
    const i = el("i");
    i.style.width = (bal[a.id] / posSum * 100) + "%";
    i.style.background = accHue(a.id);
    i.title = a.name + " " + money(bal[a.id]);
    comp.append(i);
  });

  const lg = $("nwLegend");
  lg.textContent = "";
  const typesPresent = ACC_TYPES.filter(t => accounts.some(a => a.type === t.id));
  typesPresent.forEach(t => {
    const s = el("span");
    const sw = el("span", "swatch"); sw.style.background = t.hue;
    const sum = accounts.filter(a => a.type === t.id).reduce((s2, a) => s2 + (bal[a.id] || 0), 0);
    s.append(sw, document.createTextNode(t.name + " " + money(sum)));
    lg.append(s);
  });

  const note = $("nwNote");
  const pendingBills = d.bills.filter(b => !b.settled).reduce((s, b) => s + b.amt, 0);
  const pendingInc = d.incomesDue.filter(i => !i.got).reduce((s, i) => s + num(i.amount), 0);
  const parts = [];
  if (pendingInc > 0) parts.push(money(pendingInc) + " of pay not yet marked received");
  if (pendingBills > 0) parts.push(money(pendingBills) + " of bills not yet marked paid");
  note.textContent = parts.length
    ? "Counts money that has actually moved. Still outstanding: " + parts.join("; ") + "."
    : "Counts money that has actually moved — every bill and payment this period is settled.";

  const box = $("nwAccts");
  box.textContent = "";
  accounts.forEach(a => {
    const row = el("div", "acct");
    const sw = el("span", "swatch"); sw.style.background = accHue(a.id);
    const n = el("div", "an");
    n.append(sw, el("span", null, a.name));
    const t = el("div", "at", (ACC_TYPE[a.type] || {}).name || a.type);
    const v = el("div", "ab" + ((bal[a.id] || 0) < 0 ? " neg" : ""), money(bal[a.id] || 0));
    row.append(n, t, v);
    box.append(row);
  });

  $("nwSub").textContent = accounts.length + " account" + (accounts.length === 1 ? "" : "s") +
    " · pay arrives in " + (accounts.find(a => a.type === "bank") || accounts[0] || { name: "your bank" }).name;

  renderNwTrend(d, total);
}

function renderNwTrend(d, totalNow) {
  const box = $("nwTrendBox"), tip = $("nwTip");
  Array.from(box.children).forEach(n => { if (n !== tip) n.remove(); });
  const keys = [];
  for (let i = 5; i >= 0; i--) keys.push(shiftKey(d.key, -i));
  const t = today();
  const data = keys.map(k => {
    const { end } = periodRange(k, state.config.startDay);
    const cut = end > t ? t : end;
    const bal = balancesAsOf(cut);
    return { k, label: periodShort(k, state.config.startDay),
      v: state.plan.accounts.reduce((s, a) => s + (bal[a.id] || 0), 0), partial: end > t };
  });

  const W = 460, H = 200, L = 52, R = 10, T = 16, B = 28;
  const vals = data.map(x => x.v);
  const hi = Math.max(0, ...vals) * 1.1 || 1;
  const lo = Math.min(0, ...vals) * 1.1;
  const y = v => T + (H - T - B) * (1 - (v - lo) / (hi - lo || 1));
  const band = (W - L - R) / data.length;
  const bw = Math.min(24, band * 0.5);

  const p = ['<svg viewBox="0 0 ' + W + " " + H + '" role="img" aria-label="Total held at the end of each of the last six periods">',
    '<style>.ax{font-family:var(--mono);font-size:10px;fill:var(--ink-3)}</style>'];
  axisTicks(hi, lo).forEach(v => {
    p.push('<line x1="' + L + '" x2="' + (W - R) + '" y1="' + y(v) + '" y2="' + y(v) + '" stroke="var(--rule)" stroke-width="1"></line>');
    p.push('<text class="ax" x="' + (L - 8) + '" y="' + (y(v) + 3.5) + '" text-anchor="end">' + esc(moneyCompact(v)) + "</text>");
  });
  data.forEach((x, i) => {
    const cx = L + band * i + band / 2;
    const zero = y(0), top = y(x.v);
    const h = Math.abs(zero - top);
    const current = i === data.length - 1;
    if (h > 0.5) {
      const r = Math.min(4, h);
      const up = x.v >= 0;
      const yTop = up ? top : zero;
      const yBot = up ? zero : top;
      p.push('<path d="M' + (cx - bw / 2) + "," + yBot + " L" + (cx - bw / 2) + "," + (yTop + r) +
        " Q" + (cx - bw / 2) + "," + yTop + " " + (cx - bw / 2 + r) + "," + yTop +
        " L" + (cx + bw / 2 - r) + "," + yTop + " Q" + (cx + bw / 2) + "," + yTop + " " + (cx + bw / 2) + "," + (yTop + r) +
        " L" + (cx + bw / 2) + "," + yBot + ' Z" fill="' + (x.v < 0 ? "var(--crit)" : current ? "var(--ink)" : "var(--rule-2)") + '"></path>');
    }
    if (current) p.push('<text class="ax" style="fill:var(--ink);font-weight:600;font-size:11px" x="' + cx + '" y="' + (y(x.v) - 8) + '" text-anchor="middle">' + esc(moneyCompact(x.v)) + "</text>");
    p.push('<text class="ax" x="' + cx + '" y="' + (H - 9) + '" text-anchor="middle" style="font-family:var(--sans);font-size:10.5px' + (current ? ";fill:var(--ink-2);font-weight:600" : "") + '">' + esc(x.label) + "</text>");
    p.push('<rect x="' + (L + band * i) + '" y="' + T + '" width="' + band + '" height="' + (H - T - B) + '" fill="transparent" data-i="' + i + '" class="hit"></rect>');
  });
  p.push('<line x1="' + L + '" x2="' + (W - R) + '" y1="' + y(0) + '" y2="' + y(0) + '" stroke="var(--rule-2)" stroke-width="1"></line>');
  p.push("</svg>");
  box.insertAdjacentHTML("afterbegin", p.join(""));

  const svg = box.querySelector("svg");
  svg.querySelectorAll(".hit").forEach(r => {
    r.addEventListener("mousemove", e => {
      const x = data[+r.dataset.i];
      tip.innerHTML = '<span class="tl">' + esc(periodLabel(x.k, state.config.startDay)) + "</span>Held <b>" + money(x.v) + "</b>" +
        (x.partial ? "<br>as of today" : "<br>at period end");
      tip.classList.add("show");
      placeTip(tip, box, e);
    });
    r.addEventListener("mouseleave", () => tip.classList.remove("show"));
  });
}

function placeTip(tip, box, e) {
  const br = box.getBoundingClientRect();
  tip.style.left = clamp(e.clientX - br.left + 14, 6, Math.max(6, br.width - tip.offsetWidth - 6)) + "px";
  tip.style.top = clamp(e.clientY - br.top - tip.offsetHeight - 10, 4, Math.max(4, br.height - 10)) + "px";
}

/* ============================================================ flow */

function ribbonPath(x0, y0, h0, x1, y1, h1) {
  const cx = (x0 + x1) / 2;
  return "M" + x0 + "," + y0 + " C" + cx + "," + y0 + " " + cx + "," + y1 + " " + x1 + "," + y1 +
    " L" + x1 + "," + (y1 + h1) + " C" + cx + "," + (y1 + h1) + " " + cx + "," + (y0 + h0) + " " + x0 + "," + (y0 + h0) + " Z";
}

function renderFlow(d) {
  const box = $("flowBox"), tip = $("flowTip");
  Array.from(box.children).forEach(n => { if (n !== tip) n.remove(); });

  const wide = box.clientWidth >= 700;
  const VW = wide ? 1000 : 440, H = wide ? 580 : 400;
  const PAD_T = 34, PAD_B = 14, NW = wide ? 13 : 12, GAP = 14, CGAP = 5;
  const col0 = 2, col1 = wide ? 318 : 132, col2 = wide ? 648 : null;
  const FS = wide ? { lab: 13, val: 12 } : { lab: 13.5, val: 12.5 };

  $("flowSub").textContent = "Every " + currencySymbol(state.config.currency) + " of take-home pay, traced to what it paid for";

  const lg = $("flowLegend");
  lg.textContent = "";
  GROUPS.concat([{ name: "Left over", hue: LEFTOVER_HUE }]).forEach(g => {
    const s = el("span"); const sw = el("span", "swatch"); sw.style.background = g.hue;
    s.append(sw, document.createTextNode(g.name)); lg.append(s);
  });

  const income = d.income, outflow = d.spend;
  if (income <= 0 && outflow <= 0) {
    box.append(el("p", "empty", "No income or spending recorded for this period yet."));
    renderInsights(d);
    return;
  }
  const deficit = Math.max(0, outflow - income);
  const leftover = Math.max(0, income - outflow);

  const gNodes = d.groups.filter(g => g.total > 0).map(g => ({
    id: g.id, name: g.name, value: g.total, hue: g.hue, cats: g.cats.filter(c => c.total > 0) }));
  if (leftover > 0) gNodes.push({ id: "left", name: "Left over", value: leftover, hue: LEFTOVER_HUE, cats: [] });

  gNodes.forEach(g => {
    if (!g.cats.length) return;
    const floor = outflow * 0.025;
    const keep = [], rest = [];
    g.cats.forEach((c, i) => { (i < 4 && c.total >= floor ? keep : rest).push(c); });
    if (!keep.length) keep.push(rest.shift());
    const restTotal = rest.reduce((s, c) => s + c.total, 0);
    g.nodes = keep.slice();
    if (restTotal > 0) g.nodes.push({ id: "__other_" + g.id, name: rest.length + " smaller", total: restTotal });
  });

  const srcNodes = [{ id: "inc", name: "Take-home", value: income, hue: "var(--ink)" }];
  if (deficit > 0) srcNodes.push({ id: "def", name: "From reserves", value: deficit, hue: "var(--crit)" });

  const usable = H - PAD_T - PAD_B;
  let catGaps = 0;
  if (col2 != null) gNodes.forEach(g => { const n = (g.nodes || []).length; if (n) catGaps += n - 1; });
  const s0 = (usable - GAP * Math.max(0, srcNodes.length - 1)) / Math.max(1, srcNodes.reduce((s, n) => s + n.value, 0));
  const s1 = (usable - GAP * Math.max(0, gNodes.length - 1)) / Math.max(1, gNodes.reduce((s, n) => s + n.value, 0));
  let s2 = Infinity;
  if (col2 != null) {
    const wc = gNodes.filter(g => (g.nodes || []).length);
    s2 = (usable - GAP * Math.max(0, wc.length - 1) - CGAP * catGaps) / Math.max(1, wc.reduce((s, g) => s + g.value, 0));
  }
  /* units-per-currency. This is a small fraction for any real salary, so it
     must NOT be floored — a floor here makes every node taller than the chart. */
  let K = Math.min(s0, s1, s2);
  if (!Number.isFinite(K) || K <= 0) K = usable / Math.max(1, income);

  const stack = (nodes, gap) => {
    const total = nodes.reduce((s, n) => s + n.value * K, 0) + gap * Math.max(0, nodes.length - 1);
    let y = PAD_T + Math.max(0, (usable - total) / 2);
    nodes.forEach(n => { n._y = y; n._h = Math.max(1.5, n.value * K); y += n._h + gap; });
  };
  stack(srcNodes, GAP);
  stack(gNodes, GAP);

  if (col2 != null) {
    const wc = gNodes.filter(g => (g.nodes || []).length);
    const total = wc.reduce((s, g) => s + g.value * K + CGAP * (g.nodes.length - 1), 0) + GAP * Math.max(0, wc.length - 1);
    let y = PAD_T + Math.max(0, (usable - total) / 2);
    wc.forEach(g => {
      g.nodes.forEach(c => { c._y = y; c._h = Math.max(1.5, c.total * K); y += c._h + CGAP; });
      y += GAP - CGAP;
    });
  }

  const parts = ['<svg viewBox="0 0 ' + VW + " " + H + '" role="img" aria-label="Flow of take-home pay into spending groups and categories">',
    '<style>.nlab{font-family:var(--sans);font-weight:600;fill:var(--ink)}.nval{font-family:var(--mono);fill:var(--ink-2)}' +
    '.halo{paint-order:stroke fill;stroke:var(--surface);stroke-width:3.5px;stroke-linejoin:round}</style>'];

  const srcCursor = new Map(srcNodes.map(n => [n.id, n._y]));
  const gCursor = new Map(gNodes.map(n => [n.id, n._y]));
  const avail = { inc: income, def: deficit };
  gNodes.forEach(g => {
    let need = g.value;
    for (const src of srcNodes) {
      if (need <= 0.0001) break;
      if (g.id === "left" && src.id !== "inc") continue;
      const take = Math.min(need, avail[src.id]);
      if (take <= 0.0001) continue;
      avail[src.id] -= take; need -= take;
      const y0 = srcCursor.get(src.id), y1 = gCursor.get(g.id), h = take * K;
      srcCursor.set(src.id, y0 + h); gCursor.set(g.id, y1 + h);
      parts.push('<path class="rib" d="' + ribbonPath(col0 + NW, y0, h, col1, y1, h) + '" fill="' +
        (src.id === "def" ? "var(--crit)" : g.hue) + '" fill-opacity=".32"></path>');
    }
  });
  if (col2 != null) {
    gNodes.forEach(g => {
      let y0 = g._y;
      (g.nodes || []).forEach(c => {
        const h = c.total * K;
        parts.push('<path class="rib" d="' + ribbonPath(col1 + NW, y0, h, col2, c._y, c._h) + '" fill="' + g.hue + '" fill-opacity=".3"></path>');
        y0 += h;
      });
    });
  }

  const LINE = 13;
  /* lines: [] draws no text at all, so a node too thin to label stays silent
     and its value lives in the tooltip and the Breakdown list instead */
  const node = (x, y, h, hue, lines, right, halo, aria) => {
    const out = ['<g tabindex="0" role="listitem" aria-label="' + esc(aria) + '">',
      '<rect x="' + x + '" y="' + y + '" width="' + NW + '" height="' + h + '" rx="2" fill="' + hue + '"></rect>'];
    if (lines.length) {
      const tx = right ? x + NW + 9 : x;
      /* above-mode stacks upward from just over the bar, so nothing lands on it */
      const first = right ? y + h / 2 - ((lines.length - 1) * LINE) / 2 + 4
        : y - 6 - (lines.length - 1) * LINE;
      const cls = halo ? " halo" : "";
      lines.forEach((ln, i) => {
        out.push('<text class="' + (i === 0 ? "nlab" : "nval") + cls + '" x="' + tx + '" y="' + (first + i * LINE) +
          '" font-size="' + (i === 0 ? FS.lab : FS.val) + '">' + esc(ln) + "</text>");
      });
    }
    out.push("</g>");
    return out.join("");
  };
  /* two lines when the bar is tall enough, one compact line when it isn't */
  const fit = (h, name, value) => h >= 26 ? [name, value] : h >= 11 ? [name + "   " + value] : [];

  parts.push('<g role="list">');
  srcNodes.forEach((n, i) => parts.push(node(col0, n._y, n._h, n.hue, [n.name, money(n.value)], i > 0, i > 0,
    n.name + ": " + money(n.value))));
  gNodes.forEach(g => parts.push(node(col1, g._y, g._h, g.hue,
    fit(g._h, g.name, money(g.value) + "  ·  " + pctStr(g.value, income)), true, true,
    g.name + ": " + money(g.value) + ", " + pctStr(g.value, income) + " of take-home")));

  if (col2 != null) {
    /* label top-to-bottom, skipping any whose text would land on the previous one */
    const flat = [];
    gNodes.forEach(g => (g.nodes || []).forEach(c => flat.push({ c, hue: g.hue })));
    flat.sort((a, b) => a.c._y - b.c._y);
    let lastBottom = -Infinity;
    flat.forEach(item => {
      const c = item.c;
      const two = c._h >= 26;
      const textH = two ? LINE * 2 : LINE;
      const top = c._y + c._h / 2 - textH / 2;
      const room = c._h >= 7 && top >= lastBottom + 4;
      const lines = room ? (two ? [c.name, money(c.total) + "  ·  " + pctStr(c.total, income)]
        : [c.name + "   " + money(c.total)]) : [];
      if (room) lastBottom = top + textH;
      parts.push(node(col2, c._y, c._h, item.hue, lines, true, false,
        c.name + ": " + money(c.total) + ", " + pctStr(c.total, income) + " of take-home"));
    });
  }
  parts.push("</g></svg>");
  box.insertAdjacentHTML("afterbegin", parts.join(""));

  box.querySelectorAll("g[role=listitem]").forEach(g => {
    const aria = g.getAttribute("aria-label");
    const head = aria.split(":")[0], rest = aria.split(":").slice(1).join(":").trim();
    g.addEventListener("mousemove", e => {
      tip.innerHTML = '<span class="tl">' + esc(head) + "</span>" + esc(rest);
      tip.classList.add("show"); placeTip(tip, box, e);
    });
    g.addEventListener("mouseleave", () => tip.classList.remove("show"));
    g.addEventListener("focus", () => { tip.textContent = aria; tip.classList.add("show"); tip.style.left = "10px"; tip.style.top = "6px"; });
    g.addEventListener("blur", () => tip.classList.remove("show"));
  });

  renderInsights(d);
}

function renderInsights(d) {
  const box = $("insights");
  box.textContent = "";
  if (d.income <= 0 && d.spend <= 0) return;
  const lines = [];
  const allCats = [];
  d.groups.forEach(g => g.cats.forEach(c => { if (c.total > 0) allCats.push({ ...c, group: g }); }));
  allCats.sort((a, b) => b.total - a.total);

  if (allCats.length) {
    const top = allCats[0];
    lines.push({ hue: top.group.hue, html: "<b>" + esc(top.name) + "</b> is your largest line this period — <span class='num'>" + money(top.total) + "</span>, " + pctStr(top.total, d.income) + " of take-home." });
  }
  const fixed = d.groups.find(g => g.id === "fixed");
  if (fixed && fixed.total > 0 && d.income > 0) {
    const p = pct(fixed.total, d.income);
    lines.push({ hue: fixed.hue, html: "Fixed costs take <span class='num'>" + pctStr(fixed.total, d.income) + "</span> of your pay, which " +
      (p > 60 ? "leaves very little room to move" : p > 50 ? "is on the heavy side — under 50% gives you more slack" : "leaves healthy room for everything else") + "." });
  }
  if (d.income > 0) {
    const save = d.groups.find(g => g.id === "save");
    lines.push({ hue: save ? save.hue : "var(--s4)", html: d.saved > 0
      ? "You put aside <span class='num'>" + money(d.saved) + "</span> — a <b>" + pctStr(d.saved, d.income) + "</b> savings rate against your " + Math.round(state.config.reservePct) + "% goal" + (pct(d.saved, d.income) >= num(state.config.reservePct) ? " ✓" : ", " + money(d.reserveGap) + " short") + "."
      : "Nothing moved to savings yet this period. Your goal is <span class='num'>" + money(d.reserve) + "</span>." });
  }
  const prev = derive(shiftKey(d.key, -1));
  if (prev.spend > 0 && d.spend > 0 && !d.isFuture) {
    let worst = null;
    allCats.forEach(c => {
      const before = prev.byCat.get(c.id) || 0, diff = c.total - before;
      if (before > 0 && diff > 0 && (!worst || diff > worst.diff)) worst = { name: c.name, diff, before, now: c.total, hue: c.group.hue };
    });
    if (worst && worst.diff > d.income * 0.01)
      lines.push({ hue: worst.hue, html: "<b>" + esc(worst.name) + "</b> climbed <span class='num'>" + money(worst.diff) + "</span> on last period (" + money(worst.before) + " → " + money(worst.now) + ")." });
  }
  if (d.isCurrent && d.elapsed > 2 && d.spend > 0) {
    const projected = d.spend / d.elapsed * d.totalDays;
    lines.push({ hue: "var(--ink-3)", html: "At today's pace this period lands near <span class='num'>" + money(projected) + "</span> of spending — " +
      (projected > d.income ? "about <span class='num'>" + money(projected - d.income) + "</span> more than you earn." : "leaving roughly <span class='num'>" + money(d.income - projected) + "</span>.") });
  }

  lines.slice(0, 4).forEach(l => {
    const row = el("div", "insight");
    const dot = el("span", "dot"); dot.style.background = l.hue;
    const p = el("p"); p.innerHTML = l.html;
    row.append(dot, p); box.append(row);
  });
}

/* ============================================================ categories */

function renderCats(d) {
  const box = $("catList");
  box.textContent = "";
  let any = false;
  d.groups.forEach(g => {
    const rows = g.cats.filter(c => c.total > 0 || c.budget > 0);
    if (!rows.length) return;
    any = true;
    const head = el("div", "grouphead");
    const nm = el("span", "gname");
    const sw = el("span", "swatch"); sw.style.background = g.hue; sw.style.marginRight = "7px";
    nm.append(sw, document.createTextNode(g.name));
    head.append(nm, el("span", "gtot", money(g.total)), el("span", "gpct", pctStr(g.total, d.income)));
    box.append(head);

    rows.forEach(c => {
      const row = el("div", "crow");
      row.tabIndex = 0; row.setAttribute("role", "button");
      const used = c.budget > 0 ? pct(c.total, c.budget) : 0;
      const status = c.budget > 0 ? (used > 100 ? "crit" : used >= 85 ? "warn" : "ok") : "none";
      const name = el("div", "cname");
      const sw2 = el("span", "swatch"); sw2.style.background = g.hue;
      name.append(sw2, el("span", null, c.name));
      row.append(name, el("div", "camt", money(c.total)));

      const meter = el("div", "meter");
      const fill = el("i", status === "none" ? "" : status);
      fill.style.width = clamp(c.budget > 0 ? used : pct(c.total, d.spend || 1), 0, 100) + "%";
      if (c.budget > 0) meter.style.background = "color-mix(in srgb, " +
        (status === "crit" ? "var(--crit)" : status === "warn" ? "var(--warn)" : "var(--ink)") + " 16%, var(--surface-2))";
      meter.append(fill);
      row.append(meter);

      const meta = el("div", "cmeta");
      meta.append(el("span", null, pctStr(c.total, d.income) + " of pay"));
      if (c.budget > 0) {
        meta.append(el("span", null, "· budget " + money(c.budget)));
        const flag = el("span", "flag " + status);
        flag.textContent = status === "crit" ? "✕ over by " + money(c.total - c.budget)
          : status === "warn" ? "! " + money(c.budget - c.total) + " left"
          : "✓ " + money(c.budget - c.total) + " left";
        meta.append(flag);
      } else if (c.total > 0) meta.append(el("span", null, "· no budget set"));
      row.append(meta);

      const act = () => { state.filterCat = state.filterCat === c.id ? "" : c.id; $("lCat").value = state.filterCat; renderLedger(derive(state.period)); };
      row.addEventListener("click", act);
      row.addEventListener("keydown", e => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); act(); } });
      box.append(row);
    });
  });
  if (!any) box.append(el("p", "empty", "Nothing recorded yet. Add an expense on the left, or import a statement."));
}

/* ============================================================ ledger */

function renderLedger(d) {
  const box = $("ledger");
  box.textContent = "";
  $("ledgerSub").textContent = d.tx.length + " entr" + (d.tx.length === 1 ? "y" : "ies") +
    (d.bills.length ? " · " + d.bills.length + " recurring bill" + (d.bills.length === 1 ? "" : "s") : "");

  const todayKey = iso(today());
  const spentToday = d.tx.filter(t => t.t === "exp" && t.d === todayKey).reduce((s, t) => s + num(t.a), 0);
  const meta = $("qaMeta");
  meta.textContent = "";
  meta.append(el("span", null, "Type an amount and a note — the category is guessed, or pick one."));
  if (d.isCurrent) {
    const b = el("b", null, money(spentToday));
    const s = el("span");
    s.append(document.createTextNode("Logged today: "), b);
    meta.append(s);
  }

  const q = state.search.trim().toLowerCase();
  const items = [];
  d.bills.forEach(b => {
    if (state.filterCat && b.cat !== state.filterCat) return;
    if (state.filterAcc && b.acc !== state.filterAcc) return;
    if (q && !(b.name + " " + catById(b.cat).name).toLowerCase().includes(q)) return;
    items.push({ bill: true, id: b.id, d: iso(b.due), a: b.amt, c: b.cat, n: b.name, acc: b.acc,
      settled: b.settled, est: b.est, t: "exp" });
  });
  d.tx.forEach(t => {
    if (state.filterCat && (t.t !== "exp" || t.c !== state.filterCat)) return;
    if (state.filterAcc && !(t.acc === state.filterAcc || t.from === state.filterAcc || t.to === state.filterAcc)) return;
    if (q && !((t.n || "") + " " + (t.t === "exp" ? catById(t.c).name : "")).toLowerCase().includes(q)) return;
    items.push({ ...t });
  });
  items.sort((a, b) => (a.d < b.d ? 1 : a.d > b.d ? -1 : 0));

  if (!items.length) { box.append(el("p", "empty", q || state.filterCat || state.filterAcc ? "Nothing matches that filter." : "No entries yet this period.")); return; }

  const todayStr = iso(today());
  const dayTotals = new Map();
  items.forEach(it => { if (it.t === "exp") dayTotals.set(it.d, (dayTotals.get(it.d) || 0) + num(it.a)); });
  let lastDay = null;

  items.forEach(it => {
    if (it.d !== lastDay) {
      lastDay = it.d;
      const dd = parseISO(it.d);
      const head = el("div", "dayhead");
      head.append(el("span", null, it.d === todayStr ? "Today · " + dd.toLocaleDateString(undefined, { day: "numeric", month: "short" })
        : dd.toLocaleDateString(undefined, { weekday: "short", day: "numeric", month: "short" })));
      head.append(el("span", "dt", dayTotals.get(it.d) ? money(dayTotals.get(it.d)) + " out" : "—"));
      box.append(head);
    }
    const row = el("div", "lrow");
    row.append(el("div", "ld", parseISO(it.d).toLocaleDateString(undefined, { day: "2-digit", month: "short" })));
    const mid = el("div", "lm");
    mid.append(el("div", "lt", it.n || (it.t === "exp" ? catById(it.c).name : "Entry")));
    const sub = el("div", "lc");
    if (it.t === "inc") {
      sub.append(el("span", null, "Income into " + accById(it.acc).name));
    } else if (it.t === "xfer") {
      sub.append(el("span", null, accById(it.from).name + " → " + accById(it.to).name), el("span", "tag", "transfer"));
    } else {
      const c = catById(it.c), g = GROUP[c.group] || GROUPS[2];
      const sw = el("span", "swatch"); sw.style.background = g.hue; sw.style.width = "7px"; sw.style.height = "7px";
      const asw = el("span", "swatch"); asw.style.background = accHue(it.acc); asw.style.width = "7px"; asw.style.height = "7px";
      sub.append(sw, el("span", null, c.name), el("span", null, "·"), asw, el("span", null, accById(it.acc).name));
      if (it.bill) sub.append(el("span", "tag", it.settled ? "bill · paid" : "bill · due"));
      if (it.est) sub.append(el("span", "tag est", "estimate"));
    }
    mid.append(sub);
    row.append(mid);
    row.append(el("div", "la" + (it.t === "inc" ? " inc" : it.t === "xfer" ? " xfer" : ""),
      (it.t === "inc" ? "+" : it.t === "xfer" ? "⇄ " : "") + money(it.a, { cents: it.a % 1 !== 0 })));

    const acts = el("div", "lacts");
    if (it.bill) {
      const b = el("button", "lx");
      b.innerHTML = it.settled ? "☑" : "☐";
      b.title = it.settled ? "Mark as not yet paid" : "Mark as paid";
      b.setAttribute("aria-label", b.title);
      b.addEventListener("click", e => {
        e.stopPropagation();
        if (ensureReal()) return;
        const m = monthDoc(state.period);
        const i = m.paid.indexOf(it.id);
        if (i >= 0) m.paid.splice(i, 1); else m.paid.push(it.id);
        saveMonth(state.period); renderAll();
      });
      acts.append(b);
    } else {
      if (it.t === "exp") {
        const rep = el("button", "lx", "↻");
        rep.title = "Log this again today";
        rep.setAttribute("aria-label", "Log " + (it.n || "this") + " again today");
        rep.addEventListener("click", e => { e.stopPropagation(); repeatTx(it); });
        acts.append(rep);
        row.style.cursor = "pointer";
        row.title = "Click to edit";
        row.addEventListener("click", () => { if (ensureReal()) return; openEditTx(it); });
      }
      const b = el("button", "lx", "×");
      b.title = "Delete entry"; b.setAttribute("aria-label", "Delete " + (it.n || "entry"));
      b.addEventListener("click", e => {
        e.stopPropagation();
        if (ensureReal()) return;
        deleteTx(state.period, it.id);
      });
      acts.append(b);
    }
    row.append(acts);
    box.append(row);
  });
}

/* ============================================================ pace & trend */

function axisTicks(max, min) {
  const lo = min == null ? 0 : min;
  if (max <= lo) return [lo];
  const raw = (max - lo) / 3;
  const mag = Math.pow(10, Math.floor(Math.log10(raw)));
  const step = [1, 2, 2.5, 5, 10].map(m => m * mag).find(s => s >= raw) || mag * 10;
  const out = [];
  for (let v = Math.ceil(lo / step) * step; v <= max + step * 0.001; v += step) out.push(v);
  if (lo < 0 && !out.includes(0)) out.push(0);
  return out;
}

function renderPace(d) {
  const box = $("paceBox"), tip = $("paceTip");
  Array.from(box.children).forEach(n => { if (n !== tip) n.remove(); });
  const lgd = $("paceLegend");
  lgd.textContent = "";
  [["var(--ink)", "Actual, cumulative", false], ["var(--ink-3)", "Steady burn", true]].forEach(p => {
    const s = el("span"); const sw = el("span", "swatch");
    sw.style.height = "3px"; sw.style.width = "14px"; sw.style.borderRadius = "2px";
    sw.style.background = p[2] ? "repeating-linear-gradient(90deg," + p[0] + " 0 4px,transparent 4px 7px)" : p[0];
    s.append(sw, document.createTextNode(p[1])); lgd.append(s);
  });

  const W = 620, H = 220, L = 54, R = 12, T = 14, B = 28;
  const days = d.totalDays;
  const cum = new Array(days).fill(0);
  d.bills.forEach(b => { cum[clamp(dayCount(d.start, b.due) - 1, 0, days - 1)] += b.amt; });
  d.tx.forEach(t => { if (t.t === "exp") cum[clamp(dayCount(d.start, parseISO(t.d)) - 1, 0, days - 1)] += num(t.a); });
  for (let i = 1; i < days; i++) cum[i] += cum[i - 1];

  const upto = d.isCurrent ? clamp(d.elapsed, 1, days) : (d.isFuture ? 0 : days);
  const budget = Math.max(d.income, 1);
  const max = Math.max(budget, cum[days - 1] || 0) * 1.04;
  const x = i => L + (W - L - R) * (days <= 1 ? 0 : i / (days - 1));
  const y = v => T + (H - T - B) * (1 - v / max);

  const p = ['<svg viewBox="0 0 ' + W + " " + H + '" role="img" aria-label="Cumulative spending against a steady burn of take-home pay">',
    '<style>.ax{font-family:var(--mono);font-size:10px;fill:var(--ink-3)}</style>'];
  axisTicks(max).forEach(v => {
    p.push('<line x1="' + L + '" x2="' + (W - R) + '" y1="' + y(v) + '" y2="' + y(v) + '" stroke="var(--rule)" stroke-width="1"></line>');
    p.push('<text class="ax" x="' + (L - 8) + '" y="' + (y(v) + 3.5) + '" text-anchor="end">' + esc(moneyCompact(v)) + "</text>");
  });
  p.push('<line x1="' + x(0) + '" y1="' + y(0) + '" x2="' + x(days - 1) + '" y2="' + y(budget) + '" stroke="var(--ink-3)" stroke-width="2" stroke-linecap="round" stroke-dasharray="5 5"></line>');
  if (upto > 0) {
    const pts = [];
    for (let i = 0; i < upto; i++) pts.push(x(i) + "," + y(cum[i]));
    p.push('<path d="M' + L + "," + y(0) + " L" + pts.join(" L") + " L" + x(upto - 1) + "," + y(0) + ' Z" fill="var(--ink)" fill-opacity=".08"></path>');
    p.push('<polyline points="' + pts.join(" ") + '" fill="none" stroke="var(--ink)" stroke-width="2" stroke-linejoin="round" stroke-linecap="round"></polyline>');
    const lx = x(upto - 1), ly = y(cum[upto - 1]);
    p.push('<circle cx="' + lx + '" cy="' + ly + '" r="4.5" fill="var(--ink)" stroke="var(--surface)" stroke-width="2"></circle>');
    const anchor = lx > W - 120 ? "end" : "start";
    p.push('<text class="ax" style="font-weight:600;fill:var(--ink);font-size:11.5px" x="' + (lx + (anchor === "end" ? -9 : 9)) + '" y="' + (ly - 9) + '" text-anchor="' + anchor + '">' + esc(money(cum[upto - 1])) + "</text>");
  }
  p.push('<line x1="' + L + '" x2="' + (W - R) + '" y1="' + y(0) + '" y2="' + y(0) + '" stroke="var(--rule-2)" stroke-width="1"></line>');
  [0, Math.floor((days - 1) / 2), days - 1].forEach(i => {
    const dt = new Date(d.start); dt.setDate(d.start.getDate() + i);
    p.push('<text class="ax" x="' + x(i) + '" y="' + (H - 9) + '" text-anchor="' + (i === 0 ? "start" : i === days - 1 ? "end" : "middle") + '">' +
      esc(dt.toLocaleDateString(undefined, { day: "numeric", month: "short" })) + "</text>");
  });
  p.push('<rect id="paceHit" x="' + L + '" y="' + T + '" width="' + (W - L - R) + '" height="' + (H - T - B) + '" fill="transparent"></rect>');
  p.push('<line id="paceCross" x1="0" x2="0" y1="' + T + '" y2="' + (H - B) + '" stroke="var(--ink-3)" stroke-width="1" opacity="0"></line>');
  p.push("</svg>");
  box.insertAdjacentHTML("afterbegin", p.join(""));

  const svg = box.querySelector("svg");
  const hit = svg.querySelector("#paceHit"), cross = svg.querySelector("#paceCross");
  hit.addEventListener("mousemove", e => {
    if (upto === 0) return;
    const r = svg.getBoundingClientRect();
    const ux = (e.clientX - r.left) / r.width * W;
    const i = clamp(Math.round((ux - L) / Math.max(1, W - L - R) * (days - 1)), 0, upto - 1);
    cross.setAttribute("x1", x(i)); cross.setAttribute("x2", x(i)); cross.setAttribute("opacity", ".5");
    const dt = new Date(d.start); dt.setDate(d.start.getDate() + i);
    const ideal = budget * (days <= 1 ? 1 : i / (days - 1));
    const diff = cum[i] - ideal;
    tip.innerHTML = '<span class="tl">' + esc(dt.toLocaleDateString(undefined, { day: "numeric", month: "short" })) + "</span>Spent <b>" +
      money(cum[i]) + "</b><br>" + (diff > 0 ? "<b>" + money(diff) + "</b> ahead of steady burn" : "<b>" + money(-diff) + "</b> under steady burn");
    tip.classList.add("show"); placeTip(tip, box, e);
  });
  hit.addEventListener("mouseleave", () => { tip.classList.remove("show"); cross.setAttribute("opacity", "0"); });
}

function renderTrend(d) {
  const box = $("trendBox"), tip = $("trendTip");
  Array.from(box.children).forEach(n => { if (n !== tip) n.remove(); });
  const keys = [];
  for (let i = 5; i >= 0; i--) keys.push(shiftKey(d.key, -i));
  const data = keys.map(k => { const dd = derive(k); return { k, label: periodShort(k, state.config.startDay), spend: dd.spend, income: dd.income, saved: dd.saved }; });

  const W = 620, H = 220, L = 54, R = 12, T = 18, B = 30;
  const max = Math.max(1, ...data.map(x => Math.max(x.spend, x.income))) * 1.08;
  const y = v => T + (H - T - B) * (1 - v / max);
  const band = (W - L - R) / data.length;
  const bw = Math.min(24, band * 0.5);

  const p = ['<svg viewBox="0 0 ' + W + " " + H + '" role="img" aria-label="Total spending for the last six pay periods">',
    '<style>.ax{font-family:var(--mono);font-size:10px;fill:var(--ink-3)}</style>'];
  axisTicks(max).forEach(v => {
    p.push('<line x1="' + L + '" x2="' + (W - R) + '" y1="' + y(v) + '" y2="' + y(v) + '" stroke="var(--rule)" stroke-width="1"></line>');
    p.push('<text class="ax" x="' + (L - 8) + '" y="' + (y(v) + 3.5) + '" text-anchor="end">' + esc(moneyCompact(v)) + "</text>");
  });
  const inc = data[data.length - 1].income;
  if (inc > 0) {
    p.push('<line x1="' + L + '" x2="' + (W - R) + '" y1="' + y(inc) + '" y2="' + y(inc) + '" stroke="var(--ink-3)" stroke-width="1.5" stroke-dasharray="4 4"></line>');
    p.push('<text class="ax" x="' + (W - R) + '" y="' + (y(inc) - 6) + '" text-anchor="end" style="font-family:var(--sans);font-size:10px">take-home</text>');
  }
  data.forEach((x, i) => {
    const cx = L + band * i + band / 2;
    const h = Math.max(0, y(0) - y(x.spend));
    const current = i === data.length - 1;
    if (h > 0) {
      const r = Math.min(4, h);
      p.push('<path d="M' + (cx - bw / 2) + "," + y(0) + " L" + (cx - bw / 2) + "," + (y(x.spend) + r) +
        " Q" + (cx - bw / 2) + "," + y(x.spend) + " " + (cx - bw / 2 + r) + "," + y(x.spend) +
        " L" + (cx + bw / 2 - r) + "," + y(x.spend) + " Q" + (cx + bw / 2) + "," + y(x.spend) + " " + (cx + bw / 2) + "," + (y(x.spend) + r) +
        " L" + (cx + bw / 2) + "," + y(0) + ' Z" fill="' + (current ? "var(--ink)" : "var(--rule-2)") + '"></path>');
    }
    if (current && x.spend > 0)
      p.push('<text class="ax" style="fill:var(--ink);font-weight:600;font-size:11px" x="' + cx + '" y="' + (y(x.spend) - 8) + '" text-anchor="middle">' + esc(moneyCompact(x.spend)) + "</text>");
    p.push('<text class="ax" x="' + cx + '" y="' + (H - 10) + '" text-anchor="middle" style="font-family:var(--sans);font-size:10.5px' + (current ? ";fill:var(--ink-2);font-weight:600" : "") + '">' + esc(x.label) + "</text>");
    p.push('<rect x="' + (L + band * i) + '" y="' + T + '" width="' + band + '" height="' + (H - T - B) + '" fill="transparent" data-i="' + i + '" class="hit"></rect>');
  });
  p.push('<line x1="' + L + '" x2="' + (W - R) + '" y1="' + y(0) + '" y2="' + y(0) + '" stroke="var(--rule-2)" stroke-width="1"></line></svg>');
  box.insertAdjacentHTML("afterbegin", p.join(""));

  box.querySelectorAll(".hit").forEach(r => {
    r.addEventListener("mousemove", e => {
      const x = data[+r.dataset.i];
      tip.innerHTML = '<span class="tl">' + esc(periodLabel(x.k, state.config.startDay)) + "</span>Spent <b>" + money(x.spend) +
        "</b><br>Income <b>" + money(x.income) + "</b><br>Saved <b>" + money(x.saved) + "</b>";
      tip.classList.add("show"); placeTip(tip, box, e);
    });
    r.addEventListener("click", () => { state.userMovedPeriod = true; state.period = data[+r.dataset.i].k; watchPeriod(); renderAll(); });
    r.addEventListener("mouseleave", () => tip.classList.remove("show"));
  });
}

/* ============================================================ quick add */

function guessCat(text) {
  const t = text.toLowerCase();
  let best = null;
  for (const [cat, words] of Object.entries(KEYWORDS)) {
    for (const w of words) if (t.includes(w) && (!best || w.length > best.len)) best = { cat, len: w.length };
  }
  return best ? best.cat : null;
}
function parseQuick(text) {
  const t = text.trim();
  if (!t) return null;
  const m = t.match(/(-?\+?\d[\d.,\s]*)/);
  if (!m) return null;
  const raw = m[1].replace(/\s/g, "");
  const amount = /,\d{1,2}$/.test(raw) && !/\.\d/.test(raw)
    ? parseFloat(raw.replace(/\./g, "").replace(",", "."))
    : parseFloat(raw.replace(/,/g, ""));
  if (!Number.isFinite(amount)) return null;
  const note = (t.slice(0, m.index) + t.slice(m.index + m[1].length)).replace(/\s+/g, " ").trim();
  const income = /^\+/.test(t) || /\b(salary|bonus|refund|income|freelance|reimburse)\b/i.test(note);
  return { amount: Math.abs(amount), note, income };
}
function flash(node) { node.style.outline = "2px solid var(--crit)"; setTimeout(() => { node.style.outline = ""; }, 700); }

/* Sample figures are never written to storage. The moment the user changes
   anything, swap to a real empty book so their edit is actually saved. */
function ensureReal() {
  if (!state.sample) return false;
  state.sample = false;
  state.config = blankConfig();
  state.plan = blankPlan(state.config.currency);
  state.months = {};
  fmtCache = {};
  migrate();
  state.period = periodKeyFor(today(), state.config.startDay);
  saveConfig(); savePlan();
  watchPeriod();
  toast("Sample figures cleared — this is your own book now.");
  return true;
}

let toastTimer = null, toastNode = null;
function toast(msg, undoLabel, undoFn) {
  if (toastNode) toastNode.remove();
  clearTimeout(toastTimer);
  toastNode = el("div", "toast");
  toastNode.setAttribute("role", "status");
  toastNode.append(el("span", null, msg));
  if (undoFn) {
    const b = el("button", null, undoLabel || "Undo");
    b.addEventListener("click", () => { undoFn(); hideToast(); });
    toastNode.append(b);
  }
  const x = el("button", null, "✕");
  x.setAttribute("aria-label", "Dismiss");
  x.style.textDecoration = "none";
  x.addEventListener("click", hideToast);
  toastNode.append(x);
  document.body.append(toastNode);
  toastTimer = setTimeout(hideToast, undoFn ? 8000 : 4000);
}
function hideToast() { clearTimeout(toastTimer); if (toastNode) { toastNode.remove(); toastNode = null; } }

/* removes one ledger entry with a working undo */
function deleteTx(key, id) {
  const m = monthDoc(key);
  const entry = m.tx.find(t => t.id === id);
  if (!entry) return;
  const idx = m.tx.indexOf(entry);
  m.tx = m.tx.filter(t => t.id !== id);
  saveMonth(key); renderAll();
  toast("Deleted “" + (entry.n || "entry") + "”", "Undo", () => {
    const mm = monthDoc(key);
    if (mm.tx.some(t => t.id === id)) return;
    mm.tx.splice(Math.min(idx, mm.tx.length), 0, entry);
    saveMonth(key); renderAll();
  });
}

/* one-tap repeat for the things logged over and over (konbini, Daiso, coffee) */
function repeatTx(tx) {
  ensureReal();
  const dstr = iso(today());
  const key = periodKeyFor(today(), state.config.startDay);
  monthDoc(key).tx.push({ id: uid(), d: dstr, a: num(tx.a), c: tx.c, acc: tx.acc, n: tx.n, t: "exp" });
  saveMonth(key);
  if (key !== state.period) { state.userMovedPeriod = true; state.period = key; watchPeriod(); }
  renderAll();
  toast("Added “" + (tx.n || "entry") + "” " + money(num(tx.a)) + " for today");
}

function addQuick() {
  const parsed = parseQuick($("qaText").value);
  if (!parsed) { $("qaText").focus(); flash($("qaText")); return; }
  const dateVal = $("qaDate").value || iso(today());
  const accBefore = $("qaAcc").value;
  ensureReal();
  const acc = (state.plan.accounts.some(a => a.id === accBefore) ? accBefore : "") || state.config.lastAcc || state.plan.accounts[0].id;
  const chosen = $("qaCat").value;
  const cat = parsed.income ? "" : (chosen || guessCat(parsed.note) || FALLBACK_CAT);
  const key = periodKeyFor(parseISO(dateVal), state.config.startDay);
  const m = monthDoc(key);
  m.tx.push({ id: uid(), d: dateVal, a: parsed.amount, c: cat, acc,
    n: parsed.note || (parsed.income ? "Extra income" : catById(cat).name), t: parsed.income ? "inc" : "exp" });
  saveMonth(key);
  if (acc !== state.config.lastAcc) { state.config.lastAcc = acc; saveConfig(); }
  $("qaText").value = ""; $("qaCat").value = "";
  if (key !== state.period) { state.userMovedPeriod = true; state.period = key; watchPeriod(); }
  renderAll();
  $("qaText").focus();
}

/* ============================================================ sheets */

let sheetSaver = null;
function openSheet(title, buildBody, buttons) {
  $("sheetTitle").textContent = title;
  const body = $("sheetBody");
  body.textContent = "";
  buildBody(body);
  const foot = $("sheetFoot");
  foot.textContent = "";
  (buttons || []).forEach(b => { const btn = el("button", "btn " + (b.primary ? "btn-solid" : ""), b.label); btn.addEventListener("click", b.onClick); foot.append(btn); });
  $("scrim").hidden = false;
  document.body.style.overflow = "hidden";
  setTimeout(() => { const f = body.querySelector("input,select,textarea,button"); if (f) f.focus(); }, 30);
}
function closeSheet() { $("scrim").hidden = true; document.body.style.overflow = ""; sheetSaver = null; }
$("sheetClose").addEventListener("click", closeSheet);
$("scrim").addEventListener("mousedown", e => { if (e.target === $("scrim")) closeSheet(); });
document.addEventListener("keydown", e => { if (e.key === "Escape" && !$("scrim").hidden) closeSheet(); });

function field(parent, label, node, help) {
  const f = el("div", "field");
  const l = el("label", null, label);
  if (help) { const h = el("span", "help", help); l.append(document.createTextNode(" "), h); }
  f.append(l, node); parent.append(f); return node;
}
function input(type, value, attrs) {
  const i = el("input", "fld");
  i.type = type; i.value = value == null ? "" : value;
  Object.entries(attrs || {}).forEach(([k, v]) => i.setAttribute(k, v));
  return i;
}
function select(options, value) {
  const s = el("select", "fld");
  options.forEach(o => { const op = el("option", null, o.label); op.value = o.value; s.append(op); });
  s.value = value; return s;
}
/* one editable item = one card: a full-width name on top, then an auto-fit
   grid of labelled fields that reflows instead of forcing the sheet wider */
function ecard(onRemove, removeTitle) {
  const card = el("div", "ecard");
  const top = el("div", "etop"), grid = el("div", "egrid");
  card.append(top, grid);
  if (onRemove) {
    const x = el("button", "btn btn-sm btn-ghost", "×");
    x.title = removeTitle || "Remove";
    x.setAttribute("aria-label", removeTitle || "Remove");
    x.addEventListener("click", onRemove);
    card._x = x;
  }
  card._top = top; card._grid = grid;
  return card;
}
function efield(parent, label, node) {
  const f = el("div", "efield");
  f.append(el("label", null, label), node);
  parent.append(f);
  return node;
}
function sectionHead(body, title, help) {
  body.append(el("div", "sechead", title));
  if (help) { const p = el("p", "ehelp", help); p.style.marginTop = "-12px"; body.append(p); }
}
/* is any entry, bill or income still pointing at this account? */
function accountInUse(id) {
  if ((state.plan.fixed || []).some(b => b.acc === id)) return true;
  if ((state.plan.incomes || []).some(i => i.acc === id)) return true;
  return Object.values(state.months).some(m => (m.tx || []).some(t => t.acc === id || t.from === id || t.to === id));
}

const accOptions = () => state.plan.accounts.map(a => ({ value: a.id, label: a.name }));
const catOptions = () => {
  const out = [];
  GROUPS.forEach(g => state.plan.cats.filter(c => c.group === g.id).forEach(c => out.push({ value: c.id, label: g.name + " · " + c.name })));
  return out;
};

/* ---------- setup ---------- */

function openSetup() {
  openSheet("Set up", body => {
    const cfg = state.config, plan = state.plan;

    sectionHead(body, "Accounts", "Where your money sits. Starting balance is what each account held the day you began tracking — everything after that comes from your entries.");
    const accWrap = el("div", "listedit");
    const drawAccs = () => {
      accWrap.textContent = "";
      plan.accounts.forEach(a => {
        const card = ecard(() => {
          if (plan.accounts.length <= 1) { toast("Keep at least one account."); return; }
          if (accountInUse(a.id) && !confirm("Entries still point at “" + a.name + "”. Delete it anyway? Those entries stop counting toward net worth.")) return;
          plan.accounts = plan.accounts.filter(z => z !== a);
          drawAccs();
        }, "Remove account");
        const n = input("text", a.name, { placeholder: "Account name" });
        n.addEventListener("input", () => { a.name = n.value; });
        card._top.append(n, card._x);
        const t = select(ACC_TYPES.map(x => ({ value: x.id, label: x.name })), a.type);
        const o = input("number", a.opening, { step: "1", inputmode: "decimal" });
        t.addEventListener("change", () => { a.type = t.value; });
        o.addEventListener("input", () => { a.opening = num(o.value); });
        efield(card._grid, "Kind", t);
        efield(card._grid, "Starting balance", o);
        accWrap.append(card);
      });
      const add = el("button", "btn btn-sm", "+ Add an account");
      add.addEventListener("click", () => { plan.accounts.push({ id: uid(), name: "New account", type: "wallet", opening: 0 }); drawAccs(); });
      accWrap.append(add);
    };
    drawAccs();
    body.append(accWrap);

    sectionHead(body, "Money in", "Your regular pay: how much, where it lands, and the day it arrives. It appears as a tick-off item on that day.");
    const incWrap = el("div", "listedit");
    const drawIncomes = () => {
      incWrap.textContent = "";
      plan.incomes.forEach(inc => {
        const card = ecard(() => { plan.incomes = plan.incomes.filter(i => i !== inc); drawIncomes(); }, "Remove income source");
        const n = input("text", inc.name, { placeholder: "Source" });
        n.addEventListener("input", () => { inc.name = n.value; });
        card._top.append(n, card._x);
        const a = input("number", inc.amount, { step: "1", min: "0", inputmode: "decimal" });
        const ac = select(accOptions(), inc.acc);
        const day = input("number", inc.day, { min: "1", max: "28", inputmode: "numeric" });
        a.addEventListener("input", () => { inc.amount = num(a.value); });
        ac.addEventListener("change", () => { inc.acc = ac.value; });
        day.addEventListener("input", () => { inc.day = clamp(num(day.value) || 1, 1, 28); });
        efield(card._grid, "Take-home amount", a);
        efield(card._grid, "Lands in", ac);
        efield(card._grid, "Arrives on day", day);
        incWrap.append(card);
      });
      const add = el("button", "btn btn-sm", "+ Add income source");
      add.addEventListener("click", () => { plan.incomes.push({ id: uid(), name: "Other income", amount: 0, acc: plan.accounts[0].id, day: 25 }); drawIncomes(); });
      incWrap.append(add);
    };
    drawIncomes();
    body.append(incWrap);

    sectionHead(body, "Basics");
    const row = el("div", "row2");
    const cur = select(CURRENCIES.map(c => ({ value: c, label: c + " · " + currencySymbol(c) })), cfg.currency);
    const startSel = select(Array.from({ length: 28 }, (_, i) => ({ value: String(i + 1), label: i === 0 ? "1st (calendar month)" : ordinal(i + 1) })), String(cfg.startDay));
    const res = input("number", cfg.reservePct, { min: "0", max: "90", step: "1", inputmode: "numeric" });
    const f1 = el("div", "field"); f1.append(el("label", null, "Currency"), cur);
    const f2 = el("div", "field"); f2.append(el("label", null, "Period starts on"), startSel);
    const f3 = el("div", "field"); f3.append(el("label", null, "Savings goal %"), res);
    row.append(f1, f2, f3); body.append(row);
    body.append(el("p", "ehelp", "Set the period to your payday if you think in pay cycles rather than calendar months. The savings goal is held back before 'safe to spend'."));

    sectionHead(body, "Recurring bills", "Counted automatically every period, so don't log them again as expenses. Tick “amount varies” for electricity, gas and water — the page then asks for the real figure on the due day and uses your last three months as an estimate until you type it.");
    const billWrap = el("div", "listedit");
    const drawBills = () => {
      billWrap.textContent = "";
      plan.fixed.forEach(b => {
        const card = ecard(() => { plan.fixed = plan.fixed.filter(z => z !== b); drawBills(); }, "Remove bill");
        const n = input("text", b.name, { placeholder: "Bill name" });
        n.addEventListener("input", () => { b.name = n.value; });
        card._top.append(n, card._x);
        const a = input("number", b.amount, { step: "1", min: "0", inputmode: "decimal" });
        a.title = "For a bill that varies, this is only the estimate used until you type the real figure";
        const day = input("number", b.day, { min: "1", max: "28", inputmode: "numeric" });
        const c = select(catOptions(), b.cat);
        const ac = select(accOptions(), b.acc);
        a.addEventListener("input", () => { b.amount = num(a.value); });
        day.addEventListener("input", () => { b.day = clamp(num(day.value) || 1, 1, 28); });
        c.addEventListener("change", () => { b.cat = c.value; });
        ac.addEventListener("change", () => { b.acc = ac.value; });
        efield(card._grid, b.variable ? "Typical amount" : "Amount", a);
        efield(card._grid, "Due on day", day);
        efield(card._grid, "Category", c);
        efield(card._grid, "Paid from", ac);
        const vWrap = el("label", "echeck");
        const v = el("input"); v.type = "checkbox"; v.checked = !!b.variable;
        v.addEventListener("change", () => { b.variable = v.checked; drawBills(); });
        vWrap.append(v, document.createTextNode("Amount varies each month"));
        card.append(vWrap);
        billWrap.append(card);
      });
      const add = el("button", "btn btn-sm", "+ Add a recurring bill");
      add.addEventListener("click", () => {
        plan.fixed.push({ id: uid(), name: "New bill", amount: 0, cat: "elec", day: 5, acc: plan.accounts[0].id, variable: true });
        drawBills();
      });
      billWrap.append(add);
    };
    drawBills();
    body.append(billWrap);

    sheetSaver = () => {
      cfg.currency = cur.value;
      cfg.startDay = clamp(num(startSel.value) || 1, 1, 28);
      cfg.reservePct = clamp(num(res.value), 0, 90);
      fmtCache = {};
      plan.accounts.forEach(a => { if (!(a.name || "").trim()) a.name = "Account"; });
      plan.incomes = plan.incomes.filter(i => (i.name || "").trim() || num(i.amount) > 0);
      plan.fixed = plan.fixed.filter(b => (b.name || "").trim());
      migrate();
      saveConfig(); savePlan();
      if (!state.userMovedPeriod) state.period = periodKeyFor(today(), cfg.startDay);
      watchPeriod(); closeSheet(); renderAll();
    };
  }, [
    { label: "Cancel", onClick: () => { closeSheet(); renderAll(); } },
    { label: "Save setup", primary: true, onClick: () => sheetSaver && sheetSaver() }
  ]);
}

/* ---------- budgets ---------- */

function openBudgets() {
  openSheet("Budgets by category", body => {
    const d = derive(state.period);
    const summary = el("p", "help");
    summary.style.fontSize = "12px";
    body.append(summary);
    const update = () => {
      const sum = state.plan.cats.reduce((s, c) => s + num(c.budget), 0);
      summary.innerHTML = "Budgets total <b style='font-family:var(--mono)'>" + money(sum) + "</b> of " + money(d.income) +
        " take-home — " + pctStr(sum, d.income) + (sum > d.income ? " <span style='color:var(--crit)'>(over your income)</span>" : "");
    };
    GROUPS.forEach(g => {
      const sec = el("div");
      const h = el("div", "sechead");
      const sw = el("span", "swatch"); sw.style.background = g.hue; sw.style.marginRight = "7px";
      h.append(sw, document.createTextNode(g.name));
      sec.append(h);
      const list = el("div", "listedit"); list.style.marginTop = "10px";
      state.plan.cats.filter(c => c.group === g.id).forEach(c => {
        const r = el("div", "row3");
        const n = input("text", c.name, { placeholder: "Category" });
        const a = input("number", c.budget, { step: "1", min: "0", inputmode: "decimal", placeholder: "0" });
        const x = el("button", "btn btn-sm btn-ghost", "×");
        x.title = "Remove category";
        n.addEventListener("input", () => { c.name = n.value; });
        a.addEventListener("input", () => { c.budget = num(a.value); update(); });
        x.addEventListener("click", () => {
          if (d.byCat.get(c.id)) { toast("“" + c.name + "” still has spending in it — move or delete those entries first."); return; }
          state.plan.cats = state.plan.cats.filter(z => z !== c); savePlan(); openBudgets();
        });
        r.append(n, a, x); list.append(r);
      });
      const add = el("button", "btn btn-sm", "+ Add category");
      add.addEventListener("click", () => { state.plan.cats.push({ id: uid(), name: "New category", group: g.id, budget: 0 }); savePlan(); openBudgets(); });
      list.append(add); sec.append(list); body.append(sec);
    });
    update();
    sheetSaver = () => { savePlan(); closeSheet(); renderAll(); };
  }, [
    { label: "Suggest from 50/30/20", onClick: () => { suggestBudgets(); openBudgets(); } },
    { label: "Save budgets", primary: true, onClick: () => sheetSaver && sheetSaver() }
  ]);
}

function suggestBudgets() {
  const d = derive(state.period);
  if (!d.income) return;
  const share = { fixed: 0.5, living: 0.2, life: 0.1, save: 0.2 };
  GROUPS.forEach(g => {
    const cats = state.plan.cats.filter(c => c.group === g.id);
    if (!cats.length) return;
    const pot = d.income * share[g.id];
    const spent = cats.map(c => d.byCat.get(c.id) || 0);
    const tot = spent.reduce((s, v) => s + v, 0);
    cats.forEach((c, i) => { c.budget = Math.round(pot * (tot > 0 ? spent[i] / tot : 1 / cats.length) / 10) * 10; });
  });
  savePlan();
}

/* ---------- transfer, reconcile, add bill, edit ---------- */

function openTransfer() {
  openSheet("Move money between accounts", body => {
    const p = el("p", "help");
    p.style.fontSize = "12.5px";
    p.textContent = "Charging PayPay, taking cash out of an ATM, moving to savings — this shifts money without counting as spending.";
    body.append(p);
    const row = el("div", "row2");
    const from = select(accOptions(), state.plan.accounts[0].id);
    const to = select(accOptions(), (state.plan.accounts[1] || state.plan.accounts[0]).id);
    const f1 = el("div", "field"); f1.append(el("label", null, "From"), from);
    const f2 = el("div", "field"); f2.append(el("label", null, "To"), to);
    row.append(f1, f2); body.append(row);
    const amt = field(body, "Amount", input("number", "", { step: "1", min: "0", inputmode: "decimal" }));
    const note = field(body, "Note", input("text", "", { placeholder: "PayPay charge" }));
    const dt = field(body, "Date", input("date", iso(today())));
    sheetSaver = () => {
      const v = num(amt.value);
      if (v <= 0 || from.value === to.value) { flash(amt); return; }
      const key = periodKeyFor(parseISO(dt.value), state.config.startDay);
      monthDoc(key).tx.push({ id: uid(), d: dt.value, a: v, t: "xfer", from: from.value, to: to.value,
        n: note.value || (accById(from.value).name + " → " + accById(to.value).name) });
      saveMonth(key); closeSheet(); renderAll();
    };
  }, [{ label: "Cancel", onClick: closeSheet }, { label: "Move it", primary: true, onClick: () => sheetSaver && sheetSaver() }]);
}

function openReconcile() {
  openSheet("Correct a balance", body => {
    const bal = balancesAsOf(null);
    const p = el("p", "help");
    p.style.fontSize = "12.5px";
    p.textContent = "If an account's real balance differs from what this page worked out, type the real one. The gap is recorded as an adjustment so nothing silently disappears.";
    body.append(p);
    const acc = field(body, "Account", select(state.plan.accounts.map(a => ({ value: a.id, label: a.name + " — " + money(bal[a.id] || 0) })), state.plan.accounts[0].id));
    const real = field(body, "Real balance right now", input("number", "", { step: "1", inputmode: "decimal" }));
    const out = el("p", "help"); out.style.fontSize = "12px"; body.append(out);
    const upd = () => {
      const diff = num(real.value) - (bal[acc.value] || 0);
      out.innerHTML = real.value === "" ? "" : (Math.abs(diff) < 0.5 ? "Already matches — nothing to record."
        : "Records an adjustment of <b style='font-family:var(--mono)'>" + (diff > 0 ? "+" : "") + money(diff) + "</b> against " + esc(accById(acc.value).name) + ".");
    };
    real.addEventListener("input", upd); acc.addEventListener("change", upd);
    sheetSaver = () => {
      const diff = num(real.value) - (bal[acc.value] || 0);
      if (real.value === "" || Math.abs(diff) < 0.5) { closeSheet(); return; }
      const key = state.period;
      const dstr = iso(today());
      monthDoc(key).tx.push(diff > 0
        ? { id: uid(), d: dstr, a: diff, t: "inc", acc: acc.value, n: "Balance correction" }
        : { id: uid(), d: dstr, a: -diff, t: "exp", acc: acc.value, c: FALLBACK_CAT, n: "Balance correction (unrecorded spending)" });
      saveMonth(key); closeSheet(); renderAll();
    };
  }, [{ label: "Cancel", onClick: closeSheet }, { label: "Record it", primary: true, onClick: () => sheetSaver && sheetSaver() }]);
}

function openAddBill() {
  openSheet("Add a recurring bill", body => {
    const name = field(body, "Name", input("text", "", { placeholder: "Electricity" }));
    const row = el("div", "row2");
    const cat = select(catOptions(), "elec");
    const acc = select(accOptions(), state.plan.accounts[0].id);
    const f1 = el("div", "field"); f1.append(el("label", null, "Category"), cat);
    const f2 = el("div", "field"); f2.append(el("label", null, "Paid from"), acc);
    row.append(f1, f2); body.append(row);
    const row2 = el("div", "row2");
    const amt = input("number", "", { step: "1", min: "0", inputmode: "decimal", placeholder: "0" });
    const day = input("number", 5, { min: "1", max: "28" });
    const f3 = el("div", "field"); f3.append(el("label", null, "Typical amount"), amt);
    const f4 = el("div", "field"); f4.append(el("label", null, "Due day of month"), day);
    row2.append(f3, f4); body.append(row2);
    const vWrap = el("label"); vWrap.style.display = "flex"; vWrap.style.gap = "8px"; vWrap.style.alignItems = "center"; vWrap.style.fontSize = "13px";
    const v = el("input"); v.type = "checkbox"; v.checked = true;
    vWrap.append(v, document.createTextNode("Amount changes each month — ask me for it on the due day"));
    body.append(vWrap);
    sheetSaver = () => {
      if (!name.value.trim()) { flash(name); return; }
      state.plan.fixed.push({ id: uid(), name: name.value.trim(), amount: num(amt.value), cat: cat.value,
        acc: acc.value, day: clamp(num(day.value) || 1, 1, 28), variable: v.checked });
      savePlan(); closeSheet(); renderAll();
    };
  }, [{ label: "Cancel", onClick: closeSheet }, { label: "Add bill", primary: true, onClick: () => sheetSaver && sheetSaver() }]);
}

function openEditTx(tx) {
  openSheet("Edit entry", body => {
    const grid = el("div", "egrid");
    const a = efield(grid, "Amount", input("number", tx.a, { step: "0.01", min: "0", inputmode: "decimal" }));
    const dt = efield(grid, "Date", input("date", tx.d));
    body.append(grid);
    const n = field(body, "Note", input("text", tx.n));
    const grid2 = el("div", "egrid");
    const c = efield(grid2, "Category", select(catOptions(), tx.c));
    const ac = efield(grid2, "Paid from", select(accOptions(), tx.acc));
    body.append(grid2);
    const extras = el("div");
    extras.style.display = "flex"; extras.style.gap = "8px"; extras.style.flexWrap = "wrap";
    const dup = el("button", "btn btn-sm", "↻ Log this again today");
    dup.addEventListener("click", () => { closeSheet(); repeatTx(tx); });
    const del = el("button", "btn btn-sm", "Delete this entry");
    del.style.color = "var(--crit)";
    del.addEventListener("click", () => { closeSheet(); deleteTx(state.period, tx.id); });
    extras.append(dup, del);
    body.append(extras);
    sheetSaver = () => {
      const m = monthDoc(state.period);
      const t = m.tx.find(x => x.id === tx.id);
      if (t) {
        t.a = num(a.value); t.n = n.value; t.c = c.value; t.acc = ac.value;
        const newKey = periodKeyFor(parseISO(dt.value), state.config.startDay);
        t.d = dt.value;
        if (newKey !== state.period) { m.tx = m.tx.filter(x => x.id !== tx.id); monthDoc(newKey).tx.push(t); saveMonth(newKey); }
      }
      saveMonth(state.period); closeSheet(); renderAll();
    };
  }, [{ label: "Cancel", onClick: closeSheet }, { label: "Save", primary: true, onClick: () => sheetSaver && sheetSaver() }]);
}

/* ---------- import ---------- */

function detectDelim(line) {
  const counts = { ",": 0, ";": 0, "\t": 0 };
  let q = false;
  for (const ch of line) { if (ch === '"') q = !q; else if (!q && counts[ch] != null) counts[ch]++; }
  const best = Object.entries(counts).sort((a, b) => b[1] - a[1])[0];
  return best[1] > 0 ? best[0] : ",";
}
function parseCSV(text, delim) {
  const rows = []; let row = [], cell = "", q = false;
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (q) { if (ch === '"') { if (text[i + 1] === '"') { cell += '"'; i++; } else q = false; } else cell += ch; }
    else if (ch === '"') q = true;
    else if (ch === delim) { row.push(cell); cell = ""; }
    else if (ch === "\n") { row.push(cell); rows.push(row); row = []; cell = ""; }
    else if (ch !== "\r") cell += ch;
  }
  if (cell.length || row.length) { row.push(cell); rows.push(row); }
  return rows.filter(r => r.some(c => String(c).trim() !== ""));
}
function parseAmount(s) {
  let t = String(s).trim();
  if (!t) return null;
  let neg = /^\(.*\)$/.test(t) || t.startsWith("-");
  t = t.replace(/[()]/g, "").replace(/[^\d.,-]/g, "");
  if (!t) return null;
  const lastC = t.lastIndexOf(","), lastD = t.lastIndexOf(".");
  t = lastC > lastD ? t.replace(/\./g, "").replace(",", ".") : t.replace(/,/g, "");
  const v = parseFloat(t);
  if (!Number.isFinite(v)) return null;
  if (v < 0) neg = true;
  return { value: Math.abs(v), negative: neg };
}
function parseDate(s, order) {
  const t = String(s).trim();
  let m = t.match(/^(\d{4})[-/.](\d{1,2})[-/.](\d{1,2})/);
  if (m) return iso(new Date(+m[1], +m[2] - 1, +m[3]));
  m = t.match(/^(\d{1,2})[-/.](\d{1,2})[-/.](\d{2,4})/);
  if (m) {
    let a = +m[1], b = +m[2], y = +m[3];
    if (y < 100) y += 2000;
    let day = a, mo = b;
    if (order === "mdy" || (order === "auto" && a <= 12 && b > 12)) { day = b; mo = a; }
    return iso(new Date(y, mo - 1, day));
  }
  const d = new Date(t);
  return isNaN(d) ? null : iso(d);
}

function openImport() {
  openSheet("Import transactions", body => {
    const intro = el("p", "help");
    intro.style.fontSize = "12.5px";
    intro.innerHTML = "Export a CSV from your bank or PayPay, then drop the file in or paste the rows. Nothing leaves this page.";
    body.append(intro);
    const fileIn = input("file", null, { accept: ".csv,.txt,text/csv" });
    field(body, "CSV file", fileIn);
    const ta = el("textarea", "fld");
    ta.placeholder = "date,description,amount\n2026-09-03,Daiso,-480\n2026-09-04,Lawson,-320";
    field(body, "…or paste rows", ta);
    const stage = el("div");
    body.append(stage);
    let rows = null, header = null;

    const analyse = text => {
      if (!text.trim()) { stage.textContent = ""; return; }
      const all = parseCSV(text, detectDelim(text.split("\n")[0]));
      if (!all.length) { stage.textContent = ""; return; }
      const first = all[0].map(c => String(c).trim());
      const looksHeader = first.some(c => /date|description|amount|detail|narrative|debit|credit|memo|payee|particulars|内容|金額|日付/i.test(c)) ||
        first.every(c => parseAmount(c) === null || /[a-z]{3,}/i.test(c));
      header = looksHeader ? first : first.map((_, i) => "Column " + (i + 1));
      rows = looksHeader ? all.slice(1) : all;
      drawMap();
    };

    const drawMap = () => {
      stage.textContent = "";
      if (!rows || !rows.length) return;
      const guess = re => header.findIndex(h => re.test(h));
      let iDate = guess(/date|日付/i);
      let iDesc = guess(/desc|detail|narrative|memo|payee|particular|reference|name|内容|店/i);
      let iAmt = guess(/amount|value|sum|debit|withdraw|金額/i);
      if (iDate < 0) iDate = header.findIndex((_, i) => parseDate(rows[0][i], "auto"));
      if (iAmt < 0) iAmt = header.findIndex((_, i) => parseAmount(rows[0][i]) !== null && !parseDate(rows[0][i], "auto"));
      if (iDesc < 0) iDesc = header.findIndex((_, i) => i !== iDate && i !== iAmt);

      const opts = header.map((h, i) => ({ value: String(i), label: h }));
      const grid = el("div", "row2");
      const dSel = select(opts, String(Math.max(0, iDate)));
      const nSel = select(opts, String(Math.max(0, iDesc)));
      const aSel = select(opts, String(Math.max(0, iAmt)));
      const oSel = select([{ value: "auto", label: "Detect automatically" }, { value: "dmy", label: "Day first (31/12/2026)" }, { value: "mdy", label: "Month first (12/31/2026)" }], "auto");
      const sSel = select([{ value: "neg", label: "Negative = money out" }, { value: "pos", label: "All rows are expenses" }, { value: "posinc", label: "Positive = money out" }], "neg");
      const accSel = select(accOptions(), state.config.lastAcc || state.plan.accounts[0].id);
      [["Date column", dSel], ["Description column", nSel], ["Amount column", aSel], ["Date format", oSel], ["Sign convention", sSel], ["These rows belong to", accSel]].forEach(([l, n]) => {
        const f = el("div", "field"); f.append(el("label", null, l), n); grid.append(f);
      });
      stage.append(el("div", "sechead", "Map the columns"), grid);
      const previewBox = el("div", "scrollx"); previewBox.style.marginTop = "14px";
      const countLine = el("p", "help"); countLine.style.fontSize = "12px";
      stage.append(previewBox, countLine);

      const build = () => {
        const out = [];
        rows.forEach(r => {
          const dv = parseDate(r[+dSel.value], oSel.value);
          const av = parseAmount(r[+aSel.value]);
          if (!dv || !av) return;
          let isExpense = sSel.value === "neg" ? av.negative : sSel.value === "posinc" ? !av.negative : true;
          const note = String(r[+nSel.value] || "").trim() || "Imported";
          out.push({ d: dv, a: av.value, n: note, t: isExpense ? "exp" : "inc",
            c: isExpense ? (guessCat(note) || FALLBACK_CAT) : "", acc: accSel.value });
        });
        return out;
      };
      const refresh = () => {
        const parsed = build();
        previewBox.textContent = "";
        const t = el("table", "prev");
        const tr = el("tr");
        ["Date", "Description", "Category", "Amount"].forEach(h => tr.append(el("th", null, h)));
        const thead = el("thead"); thead.append(tr); t.append(thead);
        const tb = el("tbody");
        parsed.slice(0, 7).forEach(p => {
          const r = el("tr");
          r.append(el("td", null, p.d), el("td", "t", p.n.length > 30 ? p.n.slice(0, 29) + "…" : p.n),
            el("td", "t", p.t === "inc" ? "Income" : catById(p.c).name));
          const a = el("td", null, (p.t === "inc" ? "+" : "") + money(p.a, { cents: true }));
          if (p.t === "inc") a.style.color = "var(--good-text)";
          r.append(a); tb.append(r);
        });
        t.append(tb); previewBox.append(t);
        countLine.innerHTML = "<b>" + parsed.length + "</b> of " + rows.length + " rows understood." +
          (parsed.length < rows.length ? " Rows without a readable date and amount are skipped." : "");
        sheetSaver = () => {
          if (!parsed.length) { closeSheet(); return; }
          const touched = new Set();
          parsed.forEach(p => { const k = periodKeyFor(parseISO(p.d), state.config.startDay); monthDoc(k).tx.push({ id: uid(), ...p }); touched.add(k); });
          touched.forEach(k => saveMonth(k));
          state.config.lastAcc = accSel.value; saveConfig();
          closeSheet(); renderAll();
        };
      };
      [dSel, nSel, aSel, oSel, sSel, accSel].forEach(s => s.addEventListener("change", refresh));
      refresh();
    };

    ta.addEventListener("input", () => analyse(ta.value));
    fileIn.addEventListener("change", () => {
      const f = fileIn.files && fileIn.files[0];
      if (!f) return;
      const rd = new FileReader();
      rd.onload = () => { ta.value = String(rd.result).slice(0, 2000000); analyse(ta.value); };
      rd.readAsText(f);
    });
    sheetSaver = null;
  }, [
    { label: "Cancel", onClick: closeSheet },
    { label: "Import", primary: true, onClick: () => { if (sheetSaver) sheetSaver(); else closeSheet(); } }
  ]);
}

/* ---------- export ---------- */

function buildCSV() {
  const rows = [["period", "date", "type", "category", "group", "note", "amount", "account", "from", "to", "currency"]];
  const cur = state.config.currency;
  Object.keys(state.months).sort().forEach(k => {
    const m = state.months[k];
    (m.tx || []).forEach(t => {
      if (t.t === "xfer") { rows.push([k, t.d, "transfer", "", "", t.n || "", t.a, "", accById(t.from).name, accById(t.to).name, cur]); return; }
      const c = catById(t.c);
      rows.push([k, t.d, t.t === "inc" ? "income" : "expense", t.t === "inc" ? "" : c.name,
        t.t === "inc" ? "" : (GROUP[c.group] || {}).name || "", t.n || "", t.a, accById(t.acc).name, "", "", cur]);
    });
    const skip = new Set(m.skip || []), paid = new Set(m.paid || []);
    (state.plan.fixed || []).filter(b => !skip.has(b.id)).forEach(b => {
      const c = catById(b.cat);
      rows.push([k, iso(dayInPeriod(b.day, k)), paid.has(b.id) ? "bill (paid)" : "bill (due)", c.name,
        (GROUP[c.group] || {}).name || "", b.name, billAmount(b, k).v, accById(b.acc).name, "", "", cur]);
    });
    const got = new Set(m.gotIncome || []);
    (state.plan.incomes || []).filter(i => got.has(i.id)).forEach(i => {
      rows.push([k, iso(dayInPeriod(i.day, k)), "salary (received)", "", "", i.name, i.amount, accById(i.acc).name, "", "", cur]);
    });
  });
  return rows.map(r => r.map(v => (/[",\n]/.test(String(v)) ? '"' + String(v).replace(/"/g, '""') + '"' : String(v))).join(",")).join("\n");
}

async function doExport() {
  const csv = buildCSV();
  const name = "oscar-" + iso(today()) + ".csv";
  let dl = null;
  try { dl = await useCap("downloads"); } catch (e) {}
  if (dl) { try { await dl.save({ filename: name, data: csv }); return; } catch (e) {} }
  // Standalone build: the browser can save the file directly. Inside the
  // Artifact viewer this path is skipped, because page-initiated downloads
  // are blocked there and the copy-out sheet below is the working route.
  if (!(window.claude && window.claude.use)) {
    try {
      const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8" });
      const href = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = href; a.download = name; a.style.display = "none";
      document.body.appendChild(a); a.click(); a.remove();
      setTimeout(() => URL.revokeObjectURL(href), 4000);
      toast("Exported " + name);
      return;
    } catch (e) {}
  }
  openSheet("Export", body => {
    const p = el("p", "help"); p.style.fontSize = "12.5px";
    p.textContent = "Select all and copy — this is every entry in the page, as CSV.";
    body.append(p);
    const ta = el("textarea", "fld"); ta.value = csv; ta.style.minHeight = "280px";
    body.append(ta);
    setTimeout(() => { ta.focus(); ta.select(); }, 40);
  }, [{ label: "Done", primary: true, onClick: closeSheet }]);
}

/* ============================================================ wiring */

function fillSelects() {
  const qa = $("qaCat"), lf = $("lCat"), qaA = $("qaAcc"), lfA = $("lAcc");
  const keep = { qa: qa.value, lf: lf.value, qaA: qaA.value, lfA: lfA.value };
  qa.textContent = ""; lf.textContent = "";
  qa.append(new Option("Auto category", ""));
  lf.append(new Option("All categories", ""));
  GROUPS.forEach(g => {
    const a = el("optgroup"), b = el("optgroup");
    a.label = g.name; b.label = g.name;
    state.plan.cats.filter(c => c.group === g.id).forEach(c => { a.append(new Option(c.name, c.id)); b.append(new Option(c.name, c.id)); });
    if (a.children.length) { qa.append(a); lf.append(b); }
  });
  qa.value = keep.qa; lf.value = keep.lf || state.filterCat;

  qaA.textContent = ""; lfA.textContent = "";
  lfA.append(new Option("All accounts", ""));
  state.plan.accounts.forEach(a => { qaA.append(new Option(a.name, a.id)); lfA.append(new Option(a.name, a.id)); });
  qaA.value = keep.qaA && state.plan.accounts.some(a => a.id === keep.qaA) ? keep.qaA : (state.config.lastAcc || state.plan.accounts[0].id);
  lfA.value = keep.lfA || state.filterAcc;
}

function renderStorageNote() {
  const n = $("storageNote");
  if (state.sample) n.textContent = "Sample figures — nothing is saved until you start with your own money.";
  else if (state.db) n.textContent = "Saved to this page. Your entries come back whenever you open it.";
  else n.textContent = "Saved in this browser only. Export a CSV now and then to keep a copy.";
}

function renderAll() {
  if (!state.ready) return;
  const d = derive(state.period);
  fillSelects();
  $("sampleBar").hidden = !state.sample;
  renderHero(d);
  renderTodo(d);
  renderNetWorth(d);
  renderFlow(d);
  renderCats(d);
  renderLedger(d);
  renderPace(d);
  renderTrend(d);
  renderStorageNote();
  $("nextP").disabled = state.period >= shiftKey(periodKeyFor(today(), state.config.startDay), 1);
}

let resizeTimer;
window.addEventListener("resize", () => {
  clearTimeout(resizeTimer);
  resizeTimer = setTimeout(() => {
    if (!state.ready) return;
    const d = derive(state.period);
    renderFlow(d); renderPace(d); renderTrend(d); renderNwTrend(d, 0);
  }, 180);
});

$("prevP").addEventListener("click", () => { state.userMovedPeriod = true; state.period = shiftKey(state.period, -1); watchPeriod(); renderAll(); });
$("nextP").addEventListener("click", () => { state.userMovedPeriod = true; state.period = shiftKey(state.period, 1); watchPeriod(); renderAll(); });
$("curP").addEventListener("click", () => { state.userMovedPeriod = false; state.period = periodKeyFor(today(), state.config.startDay); watchPeriod(); renderAll(); });
/* every sheet that edits data leaves sample mode BEFORE it opens, so the
   sheet never holds references to objects ensureReal is about to replace */
const realThen = fn => () => { ensureReal(); fn(); };
$("btnSetup").addEventListener("click", realThen(openSetup));
$("btnEditCats").addEventListener("click", realThen(openBudgets));
$("btnImport").addEventListener("click", realThen(openImport));
$("btnExport").addEventListener("click", doExport);
$("btnTransfer").addEventListener("click", realThen(openTransfer));
$("btnReconcile").addEventListener("click", realThen(openReconcile));
$("btnAddBill").addEventListener("click", realThen(openAddBill));
$("qaAdd").addEventListener("click", addQuick);
$("qaText").addEventListener("keydown", e => { if (e.key === "Enter") addQuick(); });
document.addEventListener("keydown", e => {
  if (e.key !== "n" && e.key !== "/") return;
  const t = e.target;
  if (t && (t.tagName === "INPUT" || t.tagName === "SELECT" || t.tagName === "TEXTAREA")) return;
  if (!$("scrim").hidden) return;
  e.preventDefault();
  $("qaText").focus();
  $("qaText").scrollIntoView({ block: "center", behavior: "smooth" });
});
$("lSearch").addEventListener("input", e => { state.search = e.target.value; renderLedger(derive(state.period)); });
$("lCat").addEventListener("change", e => { state.filterCat = e.target.value; renderLedger(derive(state.period)); });
$("lAcc").addEventListener("change", e => { state.filterAcc = e.target.value; renderLedger(derive(state.period)); });
$("btnStartReal").addEventListener("click", () => { ensureReal(); hideToast(); renderAll(); openSetup(); });

/* ============================================================ boot */

let unsubActive = null;
function watchPeriod() {
  if (!state.db) return;
  if (unsubActive) { unsubActive(); unsubActive = null; }
  const key = state.period;
  unsubActive = state.db.doc("months/" + key).onSnapshot(snap => {
    if (!snap.exists) return;
    const v = snap.data();
    state.months[key] = { key, tx: v.tx || [], skip: v.skip || [], paid: v.paid || [], gotIncome: v.gotIncome || [], billAmt: v.billAmt || {} };
    if (state.ready) { migrate(); renderAll(); }
  }, err => console.warn("month watch", err.code));
}

function boot() {
  const cfg = localLoad("config/main"), plan = localLoad("plan/main");
  if (cfg && plan) {
    state.config = { ...blankConfig(), ...cfg };
    state.plan = plan;
    state.months = localAllMonths();
    state.sample = false;
  } else {
    const s = sampleState();
    state.config = s.cfg; state.plan = s.plan; state.months = s.months; state.sample = true;
  }
  migrate();
  state.period = periodKeyFor(today(), state.config.startDay);
  $("qaDate").value = iso(today());
  state.ready = true;
  renderAll();

  useCap("db").then(db => {
    if (!db) { renderStorageNote(); return; }
    state.db = db;
    let sawConfig = false;

    db.doc("config/main").onSnapshot(snap => {
      if (snap.exists) {
        sawConfig = true;
        state.sample = false;
        state.config = { ...blankConfig(), ...snap.data() };
        fmtCache = {};
        if (!state.userMovedPeriod) state.period = periodKeyFor(today(), state.config.startDay);
        migrate(); watchPeriod(); renderAll();
      } else if (!sawConfig) {
        const lc = localLoad("config/main"), lp = localLoad("plan/main");
        if (lc && lp) {
          state.config = { ...blankConfig(), ...lc };
          state.plan = lp;
          state.months = localAllMonths();
          state.sample = false;
          migrate(); saveConfig(); savePlan();
          Object.keys(state.months).forEach(saveMonth);
          renderAll();
        }
      }
    }, err => console.warn("config watch", err.code));

    db.doc("plan/main").onSnapshot(snap => {
      if (!snap.exists) return;
      const v = snap.data();
      state.plan = { accounts: v.accounts || [], incomes: v.incomes || [], fixed: v.fixed || [], cats: v.cats || [] };
      state.sample = false;
      migrate(); renderAll();
    }, err => console.warn("plan watch", err.code));

    db.collection("months").orderBy("key", "desc").limit(24).onSnapshot(snap => {
      if (!snap.docs.length) return;
      snap.docs.forEach(doc => {
        const v = doc.data();
        state.months[doc.id] = { key: doc.id, tx: v.tx || [], skip: v.skip || [], paid: v.paid || [], gotIncome: v.gotIncome || [], billAmt: v.billAmt || {} };
      });
      state.sample = false;
      migrate(); renderAll();
    }, err => console.warn("months watch", err.code));

    watchPeriod();
    renderStorageNote();
  }).catch(() => renderStorageNote());
}

const start = data => {
  boot();
  if (data && data.period) {
    state.userMovedPeriod = true;
    state.period = data.period;
    state.filterCat = data.filterCat || "";
    state.filterAcc = data.filterAcc || "";
    state.search = data.search || "";
    $("lSearch").value = state.search;
    watchPeriod(); renderAll();
  }
};
let booted = false;
try {
  const hot = window.claude && window.claude.hot;
  if (hot) {
    hot.snapshot(() => ({ period: state.period, filterCat: state.filterCat, filterAcc: state.filterAcc, search: state.search }));
    booted = true;
    hot.ready ? hot.ready(d => start(d || {})) : start(hot.data || {});
  }
} catch (e) {}
if (!booted) start({});
