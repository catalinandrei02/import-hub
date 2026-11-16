// Browser checks (CLAUDE.md §7) against the built site. Run: npm run e2e  [screenshot dir as argv[2], default ./shots]
// Needs Puppeteer in ~/node_modules (Playwright is not installed on this machine).
import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import os from "node:os";
import { createRequire } from "node:module";
const require = createRequire(import.meta.url);
const puppeteer = require(path.join(os.homedir(), "node_modules/puppeteer"));

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), "../..");
const OUT = path.resolve(process.argv[2] || path.join(ROOT, "shots"));
fs.mkdirSync(OUT, { recursive: true });
const ROUTES = ["cars", "costs", "steps", "documents", "contacts", "messages", "search"];
const TYPES = { ".html": "text/html", ".js": "text/javascript", ".css": "text/css", ".svg": "image/svg+xml" };

function serve(dir, port) {
  return new Promise(r => {
    const s = http.createServer((req, res) => {
      let f = path.join(dir, decodeURIComponent(req.url.split("?")[0]));
      if (fs.existsSync(f) && fs.statSync(f).isDirectory()) f = path.join(f, "index.html");
      if (!fs.existsSync(f)) { res.writeHead(404); return res.end(); }
      res.writeHead(200, { "content-type": TYPES[path.extname(f)] || "application/octet-stream" }); fs.createReadStream(f).pipe(res);
    }).listen(port, () => r(s));
  });
}
const sleep = ms => new Promise(r => setTimeout(r, ms));
const report = { errors: [], overflow: [], i18n: [], checks: {} };

const mockSrv = await serve(path.join(ROOT, "dist-mock"), 4181);
const prodSrv = await serve(path.join(ROOT, "dist"), 4182);
const MOCK = "http://localhost:4181/", PROD = "http://localhost:4182/";
const browser = await puppeteer.launch({ headless: "new" });

async function open(base, route, w, scheme, ls = {}) {
  const p = await browser.newPage();
  await p.setViewport({ width: w, height: w < 600 ? 844 : 900 });
  await p.emulateMediaFeatures([{ name: "prefers-color-scheme", value: scheme }]);
  p.on("pageerror", e => report.errors.push(`${w} ${scheme} ${route}: ${e.message}`));
  p.on("console", m => { if (m.type() === "error" && !/fonts\.g|net::ERR/.test(m.text())) report.errors.push(`console ${w} ${scheme} ${route}: ${m.text()}`); });
  await p.evaluateOnNewDocument(o => { try { localStorage.clear(); for (const [k, v] of Object.entries(o)) localStorage.setItem(k, v); } catch {} }, ls);
  await p.goto(base + "#/" + route, { waitUntil: "networkidle0" });
  await p.evaluate(() => document.fonts.ready); await sleep(250);
  return p;
}
const go = async (p, r) => { await p.evaluate(r => { location.hash = "#/" + r; }, r); await sleep(220); };
const setLang = async (p, l) => { await p.select("#lang", l); await sleep(120); };
const setVal = (p, sel, v) => p.$eval(sel, (e, v) => { e.focus(); e.value = v; e.dispatchEvent(new Event("input", { bubbles: true })); e.dispatchEvent(new Event("change", { bubbles: true })); }, v);

// 1. Every route × width × theme × language
for (const w of [390, 1440]) for (const scheme of ["light", "dark"]) {
  const p = await open(MOCK, "cars", w, scheme, { "hub-car": "s1" });
  const texts = {};
  for (const l of ["ro", "en", "fr"]) {
    await setLang(p, l); texts[l] = {};
    for (const r of ROUTES) {
      await go(p, r);
      const x = await p.evaluate(() => { const c = document.body.cloneNode(true); c.querySelectorAll("pre,.links,script,style,dialog,canvas,select").forEach(n => n.remove());
        return { sw: document.documentElement.scrollWidth, vw: innerWidth, text: c.innerText }; });
      if (x.sw > x.vw) report.overflow.push(`${w} ${scheme} ${l} ${r}: ${x.sw} > ${x.vw}`);
      const bad = x.text.match(/.{0,30}(undefined|\[object|NaN|\{n\}|\{v\}|\{d\}|\{f\}).{0,30}/);
      if (bad) report.i18n.push(`${w} ${scheme} ${l} ${r}: ${bad[0]}`);
      texts[l][r] = x.text;
      if (l === "ro") await p.screenshot({ path: path.join(OUT, `${r}-${w}-${scheme}.png`) });
    }
  }
  if (w === 1440 && scheme === "dark") {
    const allow = /^(Audi Q5|Import Hub|VIN|ACC|RAR|GST|Marlog|Viamar|CarGurus|AutoHebdo|Kijiji|AutoTrader|Facebook|Technik|Progressiv|Komfort|Sample|Contacts|Documents|Messages|Notes|Total|TVA|Taxe|Taxes|Roosendaal|https?:|FR|EN|RO|Exemplu|Shipping line|Drop-off|Bookings|Blainville|Laval|Gatineau|Montréal|Dealer|Status|Contact|Inspection|Model|Région|Region)/;
    for (const l of ["ro", "fr"]) for (const r of ROUTES) {
      const en = new Set(texts.en[r].split("\n").map(s => s.trim()).filter(s => s.length > 3 && /[a-z]{3}/.test(s)));
      const same = [...new Set(texts[l][r].split("\n").map(s => s.trim()).filter(s => en.has(s) && !allow.test(s) && !/^[\d\s.,€$%:·/+−▼▲≈()-]+/.test(s)))];
      if (same.length) report.i18n.push(`${l} ${r} same as EN: ${same.slice(0, 6).join(" | ")}`);
    }
  }
  // drawer + compare
  await go(p, "cars");
  await p.click('[data-act="details"][data-id="s1"]'); await sleep(200);
  const d = await p.evaluate(() => { const s = document.getElementById("side"); return { pos: getComputedStyle(s).position, sw: document.documentElement.scrollWidth, vw: innerWidth, ssw: s.scrollWidth, scw: s.clientWidth }; });
  if (d.sw > d.vw || d.ssw > d.scw + 1) report.overflow.push(`${w} ${scheme} drawer: ${JSON.stringify(d)}`);
  report.checks[`drawer_${w}_${scheme}`] = d.pos;
  await p.screenshot({ path: path.join(OUT, `drawer-${w}-${scheme}.png`) });
  await p.click('[data-act="close-detail"]'); await sleep(150);
  for (const id of ["s1", "s2", "s3"]) { await p.$eval(`[data-cmp="${id}"]`, e => e.click()); await sleep(60); }
  await p.click('[data-act="cmp-show"]'); await sleep(150);
  const c = await p.evaluate(() => ({ cols: document.querySelectorAll(".cmp th[scope=col]").length, sw: document.documentElement.scrollWidth, vw: innerWidth }));
  if (c.sw > c.vw) report.overflow.push(`${w} ${scheme} compare: ${c.sw}`);
  report.checks[`compareCols_${w}_${scheme}`] = c.cols;
  await p.screenshot({ path: path.join(OUT, `compare-${w}-${scheme}.png`), fullPage: true });
  await p.close();
}

// 2. Costs default: 25,000 CAD + GST ≈ 27,028 €
{ const p = await open(MOCK, "costs", 1440, "dark");
  report.checks.costsSide = await p.$eval("#side .total", e => e.textContent);
  report.checks.costsHero = await p.$eval(".pillform output", e => e.textContent);
  await setVal(p, "#c-price", "26500"); await sleep(80);
  report.checks.costs26500 = await p.$eval("#side .total", e => e.textContent);
  await p.click("#c-gst"); await sleep(80);
  report.checks.costs26500noGst = await p.$eval("#side .total", e => e.textContent);
  await p.close(); }

// 3. Production build, signed out: renders, sign-in banner, writes disabled
{ const p = await open(PROD, "cars", 390, "dark"); await sleep(1500);
  report.checks.signedOutBanner = await p.$eval(".banner", e => e.textContent.trim().slice(0, 60)).catch(() => null);
  report.checks.signedOutHasSignIn = await p.evaluate(() => [...document.querySelectorAll("button")].some(b => /Google/.test(b.textContent)));
  report.checks.signedOutHeroAddDisabled = await p.$eval(".pillform .cta", e => e.disabled);
  await go(p, "costs"); report.checks.signedOutCosts = await p.$eval("#side .total", e => e.textContent);
  report.checks.signedOutSaveDisabled = await p.$eval("#rates-form [type=submit]", e => e.disabled);
  await go(p, "search"); report.checks.signedOutSearchDisabled = await p.$eval("#search-form [type=submit]", e => e.disabled);
  await p.screenshot({ path: path.join(OUT, "signedout-390-dark.png") });
  await p.close(); }

// 4. Round trips through the mock store
{ const p = await open(MOCK, "cars", 1280, "dark");
  const store = () => p.evaluate(() => Object.fromEntries(window.__mock.store));
  report.checks.cardLanded = await p.$$eval(".car", cs => cs.map(c => c.querySelector(".ctt").textContent + " = " + c.querySelector(".rate").innerText.replace(/\n/g, " ")));
  await setVal(p, "#hero-vin", "WA1FAAFY0M2006299"); await sleep(80);
  report.checks.heroVinChips = await p.$$eval(".hero .chip", cs => cs.map(c => c.textContent));
  await p.click(".pillform .cta"); await sleep(200);
  report.checks.dialogPrefill = await p.evaluate(() => [document.getElementById("d-vin").value, document.getElementById("d-trim").value, document.getElementById("d-year").value]);
  await setVal(p, "#d-price", "28500"); await setVal(p, "#d-seller", "Test dealer");
  await p.select("#d-sellerType", "private"); await sleep(50);
  report.checks.gstFollowsPrivate = await p.$eval("#d-gst", e => !e.checked);
  await p.click('#car-form [type=submit]'); await sleep(250);
  let s = await store(); const newKey = Object.keys(s).find(k => k.startsWith("cars/new"));
  report.checks.added = !!newKey && s[newKey].seller === "Test dealer" && s[newKey].gst === false && s[newKey].priceHistory.length === 1 && s[newKey].addedBy === "manual";
  await p.click('[data-act="edit-car"][data-id="s3"]'); await sleep(200); await setVal(p, "#d-price", "26999");
  await p.click('#car-form [type=submit]'); await sleep(250);
  s = await store(); report.checks.priceAppended = JSON.stringify(s["cars/s3"].priceHistory) + " dePrice=" + s["cars/s3"].dePrice;
  const newId = newKey.split("/")[1];
  await p.click(`[data-act="edit-car"][data-id="${newId}"]`); await sleep(200);
  await p.click('[data-act="del-car"]'); await sleep(100); const still = !!(await store())[newKey];
  await p.click('[data-act="del-car"]'); await sleep(250);
  report.checks.deleteTwoPress = still && !(await store())[newKey];
  await p.click('[data-act="details"][data-id="s1"]'); await sleep(200);
  await p.select("#q-status", "inspection"); await sleep(150);
  report.checks.quickStatus = (await store())["cars/s1"].status;
  await p.click('[data-act="close-detail"]'); await sleep(100);
  await go(p, "steps"); await p.click("#st-2"); await sleep(200); await p.click("#st-0"); await sleep(200);
  report.checks.steps = JSON.stringify((await store())["cars/s1"].steps);
  report.checks.stepDates = await p.$$eval(".tl .when", e => e.map(x => x.textContent));
  await go(p, "documents"); await p.click("#dc-d1_0"); await sleep(200);
  report.checks.docs = JSON.stringify((await store())["cars/s1"].docs);
  await go(p, "messages");
  report.checks.tplOffer = await p.$eval("#tpl-offer", e => e.textContent.slice(0, 120));
  await p.click('[data-tpl="offer"][data-tl="fr"]'); await sleep(80);
  report.checks.tplOfferFr = await p.$eval("#tpl-offer", e => (e.textContent.match(/budget est de [^$]*\$/) || [""])[0]);
  await go(p, "costs"); await setVal(p, "#r-cadEur", "0,65"); await sleep(60);
  await p.click('#rates-form [type=submit]'); await sleep(250);
  s = await store(); report.checks.ratesSaved = s["config/costs"]?.cadEur + " @ " + s["config/costs"]?.updatedAt;
  await setVal(p, "#r-insPct", "150"); await sleep(60);
  report.checks.rateValidation = await p.evaluate(() => document.querySelector("#rates-form [type=submit]").disabled && !!document.getElementById("r-insPct-e"));
  await go(p, "search"); await p.click("#s-source-facebook"); await setVal(p, "#s-maxPrice", "27500");
  await p.click('#search-form [type=submit]'); await sleep(250);
  s = await store(); report.checks.searchSaved = JSON.stringify({ maxPrice: s["config/search"].maxPrice, sources: s["config/search"].sources, freq: s["config/search"].frequencyDays });
  report.checks.scanUntouched = JSON.stringify(s["config/scan"]).length > 10 && !(await p.evaluate(() => window.__mock.writes.some(w => w[1] === "config/scan")));
  await p.close(); }

console.log(JSON.stringify(report, null, 1));
await browser.close(); mockSrv.close(); prodSrv.close();
process.exitCode = report.errors.length || report.overflow.length || report.i18n.length ? 1 : 0;
