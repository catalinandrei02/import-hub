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
const ROUTES = ["cars", "costs", "steps", "documents", "contacts", "search"];
const TYPES = { ".html": "text/html", ".js": "text/javascript", ".css": "text/css", ".svg": "image/svg+xml" };

// A fake listing page for the "Add to Import Hub" bookmark (JSON-LD like the real sites, plus a large photo).
const FAKE_LISTING = `<!doctype html><html><head><title>2021 Audi Q5 Technik | Example Motors</title>
<meta property="og:image" content="http://localhost:4181/fake/og.jpg">
<script type="application/ld+json">{"@context":"https://schema.org","@type":"Car","name":"2021 Audi Q5 Technik 45 TFSI quattro","vehicleIdentificationNumber":"WA1FAAFY2M2007731","mileageFromOdometer":{"@type":"QuantitativeValue","value":"88000","unitCode":"KMT"},"image":["http://localhost:4181/fake/1.jpg","http://localhost:4181/fake/2.jpg"],"offers":{"@type":"Offer","price":"29750.00","priceCurrency":"CAD","seller":{"@type":"AutoDealer","name":"Example Motors","address":{"addressLocality":"Laval"}}}}</script>
</head><body><h1>2021 Audi Q5 Technik</h1><p>VIN: WA1FAAFY2M2007731 · 88 000 km</p></body></html>`;
// Like a CarGurus page: no photos in JSON-LD, a carousel with one loaded photo and lazy ones, the full gallery in a
// page script (escaped slashes, two sizes per photo), "similar cars" further down, and a logo.
const pic = (n, s) => `http:\\/\\/localhost:4181\\/fake\\/2021_audi_q5-pic-${n}-${s}.jpeg`;
const FAKE_CG = `<!doctype html><html><head><title>Used 2021 Audi Q5 for sale in Laval - CarGurus.ca</title>
<meta property="og:image" content="http://localhost:4181/fake/2021_audi_q5-pic-1-1024x768.jpeg">
<script type="application/ld+json">{"@type":"Car","name":"2021 Audi Q5 Technik","vehicleIdentificationNumber":"WA1FAAFY2M2007731","offers":{"price":"29750"}}</script>
</head><body><img src="http://localhost:4181/fake/logo.png" width="600" height="300">
<div class="gallery"><div><img src="http://localhost:4181/fake/2021_audi_q5-pic-1-1024x768.jpeg"></div>
<div><img data-src="http://localhost:4181/fake/2021_audi_q5-pic-2-1024x768.jpeg"></div><div><img data-src="http://localhost:4181/fake/2021_audi_q5-pic-3-1024x768.jpeg"></div></div>
<script>window.__DATA__={"listing":{"pictures":[${[1, 2, 3, 4, 5, 6].map(n => `{"thumb":"${pic(n, "320x240")}","url":"${pic(n, "1024x768")}"}`).join(",")}]},
"pad":"${"x".repeat(4000)}","similar":[{"url":"${pic(90, "1024x768")}"},{"url":"${pic(91, "1024x768")}"}]}</script>
<p>VIN WA1FAAFY2M2007731 · 88 000 km</p></body></html>`;
function serve(dir, port) {
  return new Promise(r => {
    const s = http.createServer((req, res) => {
      if (req.url.startsWith("/fake-cg")) { res.writeHead(200, { "content-type": "text/html" }); return res.end(FAKE_CG); }
      if (req.url.startsWith("/fake-listing")) { res.writeHead(200, { "content-type": "text/html" }); return res.end(FAKE_LISTING); }
      if (req.url.startsWith("/fake/")) { res.writeHead(200, { "content-type": "image/svg+xml" }); return res.end('<svg xmlns="http://www.w3.org/2000/svg" width="800" height="600"><rect width="800" height="600" fill="#8a8a8a"/></svg>'); }
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
  await go(p, "steps"); report.checks.signedOutStepsEmpty = await p.$eval(".empty .big", e => e.textContent.slice(0, 60)).catch(() => null);
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
  await go(p, "costs"); await setVal(p, "#r-cadEur", "0,65"); await sleep(60);
  await p.click('#rates-form [type=submit]'); await sleep(250);
  s = await store(); report.checks.ratesSaved = s["config/costs"]?.cadEur + " @ " + s["config/costs"]?.updatedAt;
  await setVal(p, "#r-insPct", "150"); await sleep(60);
  report.checks.rateValidation = await p.evaluate(() => document.querySelector("#rates-form [type=submit]").disabled && !!document.getElementById("r-insPct-e"));
  await go(p, "search"); await sleep(200);
  report.checks.searchLinks = await p.$$eval(".srtitle[data-site]", a => a.map(x => x.dataset.site + " " + x.href.slice(0, 90)));
  report.checks.searchFoundAll = await p.$$eval(".sres:nth-of-type(2) .sr, .sres .sr button.srtitle", l => l.length);
  await p.click("#s-trim-Progressiv"); await setVal(p, "#s-model", "Audi Q5 Progressiv"); await sleep(150);
  report.checks.searchFoundProgressiv = await p.$$eval("button.srtitle", l => l.map(x => x.textContent.trim()));
  await setVal(p, "#s-model", "Audi Q5"); await sleep(100);
  await p.click("#s-source-facebook"); await setVal(p, "#s-maxPrice", "27500");
  await p.click('#search-form [type=submit]'); await sleep(250);
  s = await store(); report.checks.searchSaved = JSON.stringify({ maxPrice: s["config/search"].maxPrice, sources: s["config/search"].sources, freq: s["config/search"].frequencyDays });
  report.checks.scanUntouched = JSON.stringify(s["config/scan"]).length > 10 && !(await p.evaluate(() => window.__mock.writes.some(w => w[1] === "config/scan")));
  await p.click(".ubtn"); await sleep(120);
  report.checks.avatarOpensMenu = await p.evaluate(() => !!document.querySelector(".upop") && !!document.querySelector(".ubtn"));
  await p.keyboard.press("Escape"); await sleep(80);
  report.checks.menuClosesOnEscape = await p.evaluate(() => !document.querySelector(".upop"));
  await p.close(); }

// 5. "Add to Import Hub" bookmark: run it on a listing page, open the app from it, save the car with its photos
{ const p = await open(MOCK, "cars", 1280, "light");
  await p.click('[data-act="add-car"]'); await sleep(200);
  const href = await p.$eval(".impbox .bm", a => a.getAttribute("href"));
  report.checks.bookmarkHref = href && href.startsWith("javascript:(") ? "ok (" + href.length + " chars)" : href;
  await p.keyboard.press("Escape"); await sleep(100);
  const l = await browser.newPage();
  await l.goto(MOCK + "fake-listing.html", { waitUntil: "load" });
  const opened = await l.evaluate(code => { let u = null; window.open = x => { u = x; return null; }; (0, eval)(decodeURIComponent(code)); return u; }, href.slice("javascript:".length));
  report.checks.bookmarkOpens = opened ? opened.slice(0, 60) + "…" : null;
  await l.close();
  await p.goto(opened, { waitUntil: "networkidle0" }); await sleep(400);
  report.checks.importPrefill = await p.evaluate(() => ["d-vin", "d-year", "d-trim", "d-price", "d-km", "d-seller", "d-location", "d-url"].map(id => document.getElementById(id)?.value).join(" | "));
  report.checks.importPhotos = await p.$eval("#d-photos", e => e.value.split("\n").length);
  report.checks.importBanner = await p.$eval("#car-form .banner", e => e.textContent.trim().slice(0, 40)).catch(() => null);
  report.checks.queryCleared = await p.evaluate(() => !location.hash.includes("add="));
  await p.click('#car-form [type=submit]'); await sleep(300);
  const st = await p.evaluate(() => Object.fromEntries(window.__mock.store));
  const k = Object.keys(st).find(x => st[x].vin === "WA1FAAFY2M2007731" && st[x].seller === "Example Motors");
  report.checks.importSaved = k ? JSON.stringify({ price: st[k].price, km: st[k].km, photos: st[k].photos.length, addedBy: st[k].addedBy }) : null;
  await sleep(300);
  report.checks.cardShowsPhoto = await p.evaluate(() => [...document.querySelectorAll(".car img.cphoto")].filter(i => i.complete && i.naturalWidth > 0).length);
  report.checks.heroShowsPhoto = await p.evaluate(() => !!document.querySelector(".hero-art.hasphoto img"));
  // Same car on a CarGurus-like page: the whole gallery is read, and its photos are added to the saved car with no form.
  const c = await browser.newPage();
  await c.goto(MOCK + "fake-cg.html", { waitUntil: "load" });
  const cg = await c.evaluate(code => { let u = null; window.open = x => { u = x; return null; }; (0, eval)(decodeURIComponent(code)); return u; }, href.slice("javascript:".length));
  await c.close();
  const got = JSON.parse(decodeURIComponent(cg.split("add=")[1])).i;
  report.checks.galleryRead = JSON.stringify({ n: got.length, big: got.every(u => u.includes("1024x768")), similarLeftOut: !got.some(u => /pic-9\d/.test(u)), noLogo: !got.some(u => u.includes("logo")) });
  await p.goto(cg, { waitUntil: "networkidle0" }); await sleep(600);
  const st2 = await p.evaluate(() => Object.fromEntries(window.__mock.store));
  report.checks.photosMerged = JSON.stringify({ photos: st2[k].photos.length, dialog: await p.evaluate(() => !!document.querySelector("#car-form")), toast: await p.evaluate(() => document.querySelector(".toast")?.textContent?.trim().slice(0, 40) || null) });
  await p.screenshot({ path: path.join(OUT, "import-1280-light.png") });
  await p.close(); }

// 6. Chrome extension (extension/, loaded unpacked): opening a car with a listing link and no photos fetches them,
// and the slideshow shows them beside the drawer. Without the extension the slideshow offers the download.
{ const ext = path.join(ROOT, "extension");
  const eb = await puppeteer.launch({ headless: "new", args: [`--disable-extensions-except=${ext}`, `--load-extension=${ext}`] });
  const p = await eb.newPage(); await p.setViewport({ width: 1440, height: 900 });
  p.on("pageerror", e => report.errors.push("ext: " + e.message));
  await p.goto(MOCK + "#/cars", { waitUntil: "networkidle0" }); await sleep(500);
  report.checks.extDetected = await p.evaluate(() => document.documentElement.dataset.importHub === "1");
  await p.click('[data-act="edit-car"][data-id="s3"]'); await sleep(200);
  await setVal(p, "#d-url", MOCK + "fake-cg.html");
  await p.click('#car-form [type=submit]'); await sleep(400);
  await p.click('[data-act="details"][data-id="s3"]');
  const t0 = Date.now();
  await p.waitForFunction(() => (window.__mock.store.get("cars/s3").photos || []).length > 0, { timeout: 45000 }).catch(() => {});
  await sleep(600);
  report.checks.extFetched = JSON.stringify({ photos: await p.evaluate(() => (window.__mock.store.get("cars/s3").photos || []).length), secs: Math.round((Date.now() - t0) / 1000) });
  report.checks.stage = await p.evaluate(() => { const s = document.querySelector(".show.stage"); const r = s?.getBoundingClientRect(); return s ? JSON.stringify({ w: Math.round(r.width), img: !!s.querySelector(".show-main img"), thumbs: s.querySelectorAll(".show-thumbs button").length, count: s.querySelector(".show-count")?.textContent }) : null; });
  await p.click(".show-nav.next"); await sleep(200);
  report.checks.stageNext = await p.$eval(".show-count", e => e.textContent);
  await p.screenshot({ path: path.join(OUT, "slideshow-1440.png") });
  await p.setViewport({ width: 390, height: 844 }); await sleep(300);
  report.checks.inlineShow = await p.evaluate(() => !!document.querySelector("#side .show.inline .show-main img") && !document.querySelector(".show.stage"));
  report.checks.inlineOverflow = await p.evaluate(() => document.getElementById("side").scrollWidth <= document.getElementById("side").clientWidth + 1);
  await p.screenshot({ path: path.join(OUT, "slideshow-390.png") });
  await eb.close(); }
{ const p = await open(MOCK, "cars", 1440, "dark");
  await p.click('[data-act="details"][data-id="s2"]'); await sleep(300);
  report.checks.noExtOffer = await p.evaluate(() => !!document.querySelector('.show.stage a[href$="import-hub-extension.zip"]'));
  await p.screenshot({ path: path.join(OUT, "slideshow-noext-1440-dark.png") });
  await p.close(); }

console.log(JSON.stringify(report, null, 1));
await browser.close(); mockSrv.close(); prodSrv.close();
process.exitCode = report.errors.length || report.overflow.length || report.i18n.length ? 1 : 0;
