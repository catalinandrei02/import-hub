// Import Hub v2 checks (CLAUDE.md §7). Usage: node tests/check.js <screenshot-dir>
// Uses Puppeteer (require from ~/node_modules). The db is an in-memory stand-in with sample cars; nothing here touches the real store.
const puppeteer = require(process.env.HOME + "/node_modules/puppeteer");
const path = require("path"), fs = require("fs");

const OUT = process.argv[2]; fs.mkdirSync(OUT, { recursive: true });
const ROOT = path.resolve(__dirname, "..");
const HUB = "file://" + path.join(ROOT, "import-hub.html");
const CALC = "file://" + path.join(ROOT, "calculator-import-canada-romania.html");
const TABS = ["cars","costs","process","docs","contacts","lessons","tpl","search"];

// In-memory stand-in for claude.use("db"), test only.
function mockDb(seed) {
  const store = new Map(Object.entries(seed)); const subs = []; let n = 0; window.__store = store; window.__writes = [];
  const isColl = p => p.split("/").length % 2 === 1;
  function snapDoc(p) { const d = store.get(p); return { id: p.split("/").pop(), exists: !!d, data: () => d ? JSON.parse(JSON.stringify(d)) : undefined, metadata: { fromCache: false, hasPendingWrites: false } }; }
  function emit() { setTimeout(() => subs.forEach(s => s.fire()), 5); }
  function docRef(p) { return {
    id: p.split("/").pop(), path: p,
    get: async () => snapDoc(p),
    set: async d => { window.__writes.push(["set", p]); store.set(p, JSON.parse(JSON.stringify(d))); emit(); },
    update: async d => { window.__writes.push(["update", p]); if (!store.has(p)) throw { code: "not_found" }; store.set(p, Object.assign({}, store.get(p), JSON.parse(JSON.stringify(d)))); emit(); },
    delete: async () => { window.__writes.push(["delete", p]); store.delete(p); emit(); },
    onSnapshot(cb) { const s = { fire: () => cb(snapDoc(p)) }; subs.push(s); setTimeout(s.fire, 20); return () => {}; } }; }
  function collRef(p) { return {
    doc: id => docRef(p + "/" + (id || ("auto" + (++n)))),
    add: async d => { const r = docRef(p + "/auto" + (++n)); await r.set(d); return r; },
    onSnapshot(cb) { const s = { fire: () => { const docs = [...store.keys()].filter(k => k.startsWith(p + "/") && k.split("/").length === p.split("/").length + 1).map(snapDoc); cb({ docs, size: docs.length, empty: !docs.length, docChanges: () => [], metadata: { fromCache: false, hasPendingWrites: false } }); } }; subs.push(s); setTimeout(s.fire, 20); return () => {}; } }; }
  const db = { doc: docRef, collection: collRef };
  window.claude = { use: async name => name === "db" ? db : null };
}
const SEED = {
  "cars/a1": { title: "Audi Q5", year: 2023, trim: "", vin: "WA1EAAFY2P2004677", km: 41000, price: 27890, priceHistory: [{ date: "2026-09-20", price: 29890 }, { date: "2026-10-12", price: 28890 }, { date: "2026-11-02", price: 27890 }], seller: "VW Lauzon Blainville", sellerType: "dealer", contact: "Florence", stock: "H1972", location: "Blainville", url: "https://example.com/a1", status: "offer", acc: "yes", cam: "yes", flags: ["accident", "noexport"], notes: "Test car (sample).", steps: { s0: true, s1: "2026-11-10" }, addedBy: "manual", addedAt: "2026-09-20T10:00:00Z", updatedAt: "2026-11-02T10:00:00Z", offer: 26500, dePrice: 31000 },
  "cars/a2": { title: "Audi Q5", year: 2021, vin: "WA1FAAFY2M2004811", km: 88000, price: 29750, priceHistory: [{ date: "2026-10-01", price: 33000 }, { date: "2026-11-01", price: 29750 }], seller: "Private listing", sellerType: "private", location: "Laval", status: "watching", acc: "yes", cam: "", flags: [], steps: {}, addedBy: "claude", addedAt: "2026-10-01T10:00:00Z", updatedAt: "2026-11-01T10:00:00Z" },
  "cars/a3": { title: "Audi Q5", year: 2021, vin: "WA1FAAFY0M2006217", km: 76000, price: 27999, priceHistory: [{ date: "2026-11-05", price: 27999 }], seller: "AED Gatineau", sellerType: "dealer", location: "Gatineau", status: "watching", acc: "", cam: "", flags: [], steps: {}, addedBy: "manual", addedAt: "2026-11-05T10:00:00Z", updatedAt: "2026-11-05T10:00:00Z", dePrice: 30500 },
  "cars/a4": { title: "Audi Q5", year: 2021, vin: "WA1EAAFY0M2063089", km: 70000, price: 23500, priceHistory: [{ date: "2026-09-01", price: 23500 }], seller: "Honda/Audi Blainville", sellerType: "dealer", location: "Blainville", status: "dropped", acc: "no", cam: "no", flags: ["rust"], steps: {}, addedBy: "manual" },
  "contacts/c1": { name: "Bruno Fortugno", role: "Viamar Scilla, Montreal", phone: "", email: "", notes: "Bookings, quotes" },
  "contacts/c2": { name: "Chris Groumas", role: "GO Transport, Saint-Laurent", phone: "514-312-3884", email: "", notes: "Drop-off warehouse" },
  "config/scan": { lastRun: "2026-11-15T07:00:00Z", found: 3, summary: "Test: 1 mașină nouă, o scădere de preț." },
};

(async () => {
  const browser = await puppeteer.launch({ headless: "new", args: ["--allow-file-access-from-files"] });
  const report = { errors: [], overflow: [], i18n: [], checks: {} };
  async function open(url, w, scheme, withDb, store) {
    const page = await browser.newPage();
    await page.setViewport({ width: w, height: w < 600 ? 844 : 900, deviceScaleFactor: 1 });
    await page.emulateMediaFeatures([{ name: "prefers-color-scheme", value: scheme }]);
    page.on("pageerror", e => report.errors.push(`${w} ${scheme} ${url.split("/").pop()}: ${e.message}`));
    page.on("console", m => { if (m.type() === "error" && !/fonts\.g|ERR_INTERNET|net::/.test(m.text())) report.errors.push(`console ${w} ${scheme}: ${m.text()}`) });
    await page.evaluateOnNewDocument((fn, seed, ls) => { try { localStorage.clear(); Object.entries(ls || {}).forEach(([k, v]) => localStorage.setItem(k, v)); } catch (e) {} if (fn) eval("(" + fn + ")")(seed); }, withDb ? mockDb.toString() : null, SEED, store || {});
    await page.goto(url, { waitUntil: "networkidle0" });
    await page.evaluate(() => document.fonts && document.fonts.ready);
    await new Promise(r => setTimeout(r, 150));
    return page;
  }
  const clickTab = async (p, k) => { await p.click(`[data-tab="${k}"]`); await new Promise(r => setTimeout(r, 60)); };
  const clickLang = async (p, l) => { await p.click(`[data-lang="${l}"]`); await new Promise(r => setTimeout(r, 60)); };

  // English strings that must not appear in RO/FR (UI dictionaries only)
  const leaks = await (async () => { const p = await open(HUB, 1440, "light", false); const r = await p.evaluate(() => {
    // re-derive leaf strings by switching languages and reading the DOM text per tab is heavier; instead diff tab labels + button labels
    return null; }); await p.close(); return r; })();

  for (const w of [390, 1440]) for (const scheme of ["light", "dark"]) {
    const p = await open(HUB, w, scheme, true, { "hub-car": "a1" });
    const texts = {};
    for (const l of ["ro", "en", "fr"]) { await clickLang(p, l); texts[l] = {};
      for (const k of TABS) { await clickTab(p, k);
        const r = await p.evaluate(() => { const c = document.body.cloneNode(true); c.querySelectorAll("pre,.links,.scene,script,style,dialog").forEach(n => n.remove());
          return { sw: document.documentElement.scrollWidth, vw: window.innerWidth, text: document.body.innerText, clone: c.innerText, bad: /undefined|\[object|NaN|\{n\}|\{v\}|\{d\}/.test(c.innerText) }; });
        if (r.sw > r.vw) report.overflow.push(`${w} ${scheme} ${l} ${k}: scrollWidth ${r.sw} > ${r.vw}`);
        if (r.bad) report.i18n.push(`${w} ${scheme} ${l} ${k}: placeholder/undefined text: ` + (r.clone.match(/.{0,40}(undefined|\[object|NaN|\{n\}|\{v\}|\{d\}).{0,40}/) || [""])[0]);
        texts[l][k] = r.clone;
        if (l === "ro" && (k === "cars" || k === "costs" || k === "process" || k === "search" || k === "tpl"))
          await p.screenshot({ path: path.join(OUT, `hub-${k}-${w}-${scheme}.png`), fullPage: w < 600 ? false : false });
      }
    }
    // Compare leftover strings: lines identical between EN and RO/FR on the same tab that look like English UI copy
    if (w === 1440 && scheme === "light") {
      for (const l of ["ro", "fr"]) for (const k of TABS) {
        const en = new Set(texts.en[k].split("\n").map(s => s.trim()).filter(s => s.length > 3 && /[a-z]{3}/.test(s)));
        const same = texts[l][k].split("\n").map(s => s.trim()).filter(s => en.has(s));
        const allow = /^(Audi Q5|VIN|ACC|RAR|Marlog|Viamar|GO Transport|Bruno|Chris|CarGurus|AutoHebdo|Kijiji|AutoTrader|Facebook|Technik|Progressiv|Komfort|Test|Private listing|VW Lauzon|AED|Honda|Blainville|Laval|Gatineau|WA1|Florence|H1972|Import Hub|Bookings|Drop-off|514|Québec|Contacts|Documents|Messages|Total|Progressiv|Komfort|Inspection|Notes|Model|Dealer|Status|Contact|TVA|Taxe|Taxes|Gatineau|Roosendaal|RAR|Laszlo|OBK|Style|HGrégoire|https?:)/;
        const left = [...new Set(same.filter(s => !allow.test(s) && !/^[\d\s.,€$%:·/+−▼▲≈-]+/.test(s)))];
        if (left.length) report.i18n.push(`${l} ${k} identical to EN: ` + left.slice(0, 8).join(" | "));
      }
    }
    // Detail sheet / side view
    await clickLang(p, "ro"); await clickTab(p, "cars");
    await p.click('[data-act="details"][data-id="a1"]'); await new Promise(r => setTimeout(r, 80));
    const dsw = await p.evaluate(() => [document.documentElement.scrollWidth, innerWidth, document.getElementById("side").scrollWidth, document.getElementById("side").clientWidth]);
    if (dsw[0] > dsw[1] || dsw[2] > dsw[3] + 1) report.overflow.push(`${w} ${scheme} detail: ${dsw}`);
    await p.screenshot({ path: path.join(OUT, `hub-detail-${w}-${scheme}.png`) });
    await p.evaluate(() => document.querySelector('[data-act="close-detail"]').click());
    // Compare
    for (const id of ["a1","a2","a3"]) { await p.$eval(`[data-cmp="${id}"]`, e => e.click()); await new Promise(r => setTimeout(r, 40)); }
    await p.click('[data-act="cmp-show"]'); await new Promise(r => setTimeout(r, 80));
    const csw = await p.evaluate(() => [document.documentElement.scrollWidth, innerWidth, document.querySelectorAll(".cmp th[scope=col]").length]);
    if (csw[0] > csw[1]) report.overflow.push(`${w} ${scheme} compare: ${csw}`);
    report.checks["compareCols_" + w + scheme] = csw[2];
    await p.screenshot({ path: path.join(OUT, `hub-compare-${w}-${scheme}.png`) });
    await p.close();
    // Calculator at the same size, for side by side
    const c = await open(CALC, w, scheme, false); await c.screenshot({ path: path.join(OUT, `calc-${w}-${scheme}.png`) }); await c.close();
  }

  // Costs default with no db (file opened locally): 25,000 CAD + GST
  { const p = await open(HUB, 1440, "light", false, { "hub-tab": "costs" });
    report.checks.costsTotal = await p.evaluate(() => document.querySelector("#side .total").textContent);
    report.checks.noDbBanner = await p.evaluate(() => !!document.querySelector(".banner.warn") && document.querySelector(".banner.warn").textContent);
    report.checks.noDbSaveDisabled = await p.evaluate(() => document.querySelector('#rates-form [type=submit]').disabled);
    await clickTab(p, "cars"); report.checks.noDbAddDisabled = await p.evaluate(() => document.querySelector('[data-act="add-car"]').disabled);
    await clickTab(p, "search"); report.checks.noDbSearchDisabled = await p.evaluate(() => document.querySelector('#search-form [type=submit]').disabled);
    // live recalculation
    await clickTab(p, "costs"); await p.$eval("#c-price", (e, v) => { e.focus(); e.value = v; e.dispatchEvent(new Event("input", { bubbles: true })); }, "26500");
    report.checks.costs26500 = await p.evaluate(() => document.querySelector("#side .total").textContent);
    await p.click("#c-gst"); report.checks.costs26500noGst = await p.evaluate(() => document.querySelector("#side .total").textContent);
    await p.close(); }

  // Round trips through the mock db
  { const p = await open(HUB, 1280, "light", true, { "hub-tab": "cars" });
    const store = () => p.evaluate(() => Object.fromEntries(window.__store));
    // per-car In RO with GST rules
    report.checks.cardLanded = await p.evaluate(() => [...document.querySelectorAll(".car")].map(c => c.querySelector(".ctt").textContent + " = " + c.querySelector("dd.hl").innerText.replace(/\n/g, " ")));
    // add
    await p.click('[data-act="add-car"]'); await p.type("#d-vin", "WA1FAAFY0M2006299"); await p.type("#d-price", "28500"); await p.type("#d-seller", "Test dealer");
    report.checks.vinAutofill = await p.evaluate(() => [document.getElementById("d-trim").value, document.getElementById("d-year").value]);
    await p.select("#d-sellerType", "private"); report.checks.gstFollowsPrivate = await p.evaluate(() => document.getElementById("d-gst").checked === false);
    await p.click('#car-form [type=submit]'); await new Promise(r => setTimeout(r, 120));
    let s = await store(); const newId = Object.keys(s).find(k => k.startsWith("cars/auto"));
    report.checks.added = newId && s[newId].seller === "Test dealer" && s[newId].gst === false && s[newId].priceHistory.length === 1;
    // edit price → append history
    await p.click(`[data-act="edit-car"][data-id="a3"]`); await p.$eval("#d-price", (e, v) => { e.focus(); e.value = v; e.dispatchEvent(new Event("input", { bubbles: true })); }, "26999"); await p.click('#car-form [type=submit]'); await new Promise(r => setTimeout(r, 120));
    s = await store(); report.checks.priceAppended = JSON.stringify(s["cars/a3"].priceHistory) + " keeps dePrice=" + s["cars/a3"].dePrice;
    // delete needs two presses
    await p.click(`[data-act="edit-car"][data-id="${newId.split("/")[1]}"]`); await p.click('[data-act="del-car"]'); await new Promise(r => setTimeout(r, 60));
    const after1 = (await store())[newId] !== undefined; await p.click('[data-act="del-car"]'); await new Promise(r => setTimeout(r, 120));
    report.checks.deleteTwoPress = after1 && (await store())[newId] === undefined;
    // quick status + steps with date + docs
    await p.click('[data-act="details"][data-id="a1"]'); await p.select("#q-status", "inspection"); await new Promise(r => setTimeout(r, 100));
    report.checks.quickStatus = (await store())["cars/a1"].status;
    await clickTab(p, "process"); await p.click("#st-2"); await new Promise(r => setTimeout(r, 120)); await p.click("#st-0"); await new Promise(r => setTimeout(r, 120));
    s = await store(); report.checks.steps = JSON.stringify(s["cars/a1"].steps);
    report.checks.stepDateShown = await p.evaluate(() => [...document.querySelectorAll(".tl .when")].map(e => e.textContent));
    await p.screenshot({ path: path.join(OUT, "hub-steps-ticked-1280.png") });
    await clickTab(p, "docs"); await p.click("#dc-d1_0"); await new Promise(r => setTimeout(r, 120)); report.checks.docs = JSON.stringify((await store())["cars/a1"].docs);
    // templates fill
    await clickTab(p, "tpl"); report.checks.tplOffer = await p.evaluate(() => document.getElementById("tpl-offer").textContent.slice(0, 140));
    await p.click('[data-tpl="offer"][data-tl="fr"]'); report.checks.tplOfferFr = await p.evaluate(() => document.getElementById("tpl-offer").textContent.match(/budget est de [^$]*\$/)[0]);
    // rates
    await clickTab(p, "costs"); await p.$eval("#r-cadEur", (e, v) => { e.focus(); e.value = v; e.dispatchEvent(new Event("input", { bubbles: true })); }, "0,65"); await p.click('#rates-form [type=submit]'); await new Promise(r => setTimeout(r, 120));
    s = await store(); report.checks.ratesSaved = s["config/costs"] && s["config/costs"].cadEur + " at " + s["config/costs"].updatedAt;
    await p.$eval("#r-insPct", (e, v) => { e.focus(); e.value = v; e.dispatchEvent(new Event("input", { bubbles: true })); }, "150"); report.checks.rateValidation = await p.evaluate(() => document.querySelector('#rates-form [type=submit]').disabled && !document.getElementById("r-insPct-e").hidden);
    // search settings
    await clickTab(p, "search"); await p.click("#s-source-facebook"); await p.$eval("#s-maxPrice", (e, v) => { e.focus(); e.value = v; e.dispatchEvent(new Event("input", { bubbles: true })); }, "27500"); await p.click('#search-form [type=submit]'); await new Promise(r => setTimeout(r, 120));
    s = await store(); report.checks.searchSaved = JSON.stringify({ maxPrice: s["config/search"].maxPrice, sources: s["config/search"].sources, freq: s["config/search"].frequencyDays });
    report.checks.writes = await p.evaluate(() => window.__writes.length);
    await p.close(); }

  // Mobile sheet + stale state
  { const p = await open(HUB, 390, "light", true, { "hub-tab": "cars" });
    await p.click('[data-act="details"][data-id="a2"]'); await new Promise(r => setTimeout(r, 80));
    report.checks.mobileSheet = await p.evaluate(() => getComputedStyle(document.getElementById("side")).position);
    await p.screenshot({ path: path.join(OUT, "hub-sheet-390-light.png") });
    await p.close(); }
  console.log(JSON.stringify(report, null, 1));
  await browser.close();
})();
