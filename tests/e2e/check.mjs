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
<div><img data-src="http://localhost:4181/fake/2021_audi_q5-pic-2-152x114.jpeg"></div><div><img data-src="http://localhost:4181/fake/2021_audi_q5-pic-3-152x114.jpeg"></div></div>
<script>window.__DATA__={"listing":{"pictures":[${Array.from({ length: 28 }, (_, k) => k + 1).map(n => `{"thumb":"${pic(n, "320x240")}","url":"${pic(n, "1024x768")}"}`).join(",")}]},
"pad":"${"x".repeat(20000)}","similar":[{"url":"${pic(90, "1024x768")}"},{"url":"${pic(91, "1024x768")}"}]}</script>
<p>VIN WA1FAAFY2M2007731 · 88 000 km</p></body></html>`;
// Shaped like the real pages (checked Nov 2026): CarGurus keeps everything in window.__remixContext (no JSON-LD),
// AutoTrader.ca in __NEXT_DATA__ with photos at 1280 px that also exist at 1920 px. Both show a misleading "100 km".
const remix = { state: { loaderData: { "routes/($intl).details.$listingId": {
  data: { listing: { vin: { value: "WA1EAAFYXN2102045" }, mileage: { value: 61250 }, vehicleHistory: { damaged: true, hasMultipleAccident: false },
    options: [{ label: "Adaptive Cruise Control", category: "OPTIONS" }, { label: "Heated Seats", category: "OPTIONS" }, { label: "Navigation System", category: "OPTIONS" }] }, seller: { name: "Gurus Audi", sellerType: "DEALER", address: { city: "Brossard" } } },
  leadForm: { listing: { price: 33995, yearMakeModelTrim: "2022 Audi Q5 Progressiv 45 TFSI quattro", city: "Brossard" } },
  history: { priceHistory: [["2026-05-06", "$36,500"], ["2026-09-29", "$34,995"], ["2026-11-10", "$33,995"]], daysOnCarGurus: 194 },
  listingImages: Array.from({ length: 32 }, (_, k) => ({ url: `http://localhost:4181/fake/2022_audi_q5-pic-${k + 1}-1024x768.jpeg`, width: 960, height: 721 })),
} } } };
const FAKE_CGR = `<!doctype html><html><head><title>2022 Audi Q5 Progressiv - $33,995 - CarGurus</title>
<meta property="og:image" content="http://localhost:4181/fake/2022_audi_q5-pic-1-1024x768.jpeg"></head>
<body><p>Within 100 km of you</p><img src="http://localhost:4181/fake/2022_audi_q5-pic-1-296x222.jpeg">
<script>window.__remixContext = ${JSON.stringify(remix)};</script></body></html>`;
const next = { props: { pageProps: { listingDetails: {
  title: "2023 Audi Q5 45 TFSI", prices: { public: { price: "$ 36,895" } }, location: { city: "LAVAL" },
  vehicle: { mileageInKmRaw: 28669, modelYear: 2023, make: "Audi", model: "Q5", modelVersionInput: "PROGRESSIV QUATTRO 19 PCS" },
  seller: { isDealer: true, companyName: "Example Audi Laval" },
  images: Array.from({ length: 26 }, (_, k) => `http://localhost:4181/fake/at-${k + 1}/1280x960.webp`),
} } } };
const FAKE_AT = `<!doctype html><html><head><title>2023 Audi Q5 | $ 36,895 | 28,669 km | AutoTrader.ca</title></head>
<body><p>Free delivery within 100 km</p><script id="__NEXT_DATA__" type="application/json">${JSON.stringify(next)}</script></body></html>`;
// A CarGurus.ca search page (Remix data, like the real one): 8 results against the default Search settings
// (Technik, 2021–2024, ≤ 28,000 $, ≤ 120,000 km, ACC + 360°, excluded "VW Lauzon Blainville"): 2 new matches.
const hit = (id, o) => ({ type: "LISTING_USED_STANDARD", data: { id, yearMakeModelTrim: "2022 Audi Q5 45 TFSI quattro Technik", vin: "WA1FAAFY0N20" + String(id).padStart(5, "0"),
  priceDto: { current: 27500 }, mileage: { value: 60000, unit: "KILOMETERS" }, distance: 20, sellerDto: { serviceProviderName: "Good Dealer" },
  options: ["Adaptive Cruise Control", "360-Degree Camera", "Heated Seats"], pictureData: { url: `http://localhost:4181/fake/srp-${id}-1024x768.jpeg` }, ...o } });
const srp = { state: { loaderData: { "routes/($intl).Cars.$seoPath": { search: { totalListings: 275, tiles: [
  hit(91001), hit(91002, { priceDto: { current: 26900 } }),
  hit(91003, { yearMakeModelTrim: "2019 Audi Q5 Technik" }), hit(91004, { priceDto: { current: 31000 } }),
  hit(91005, { yearMakeModelTrim: "2022 Audi Q5 Progressiv", vin: "WA1EAAFY0N2091005" }), hit(91006, { options: ["Adaptive Cruise Control"] }),
  hit(91007, { sellerDto: { serviceProviderName: "VW Lauzon Blainville" } }), hit(91008, { vin: "WA1FAAFY2M2004811" }),
  { type: "SEO_PRECISION_TILE", data: {} },
] } } } } };
const FAKE_SRP = `<!doctype html><html><head><title>Used Audi Q5 for Sale - CarGurus.ca</title></head><body>
<script>window.__remixContext = ${JSON.stringify(srp)};</script></body></html>`;
// Shaped like HGregoire (checked Nov 2026): no usable JSON-LD, equipment as <h4> + <ul> groups, price only as text,
// "Kilométrage" label, photos with the size in the path (/by-size/<car>/1120x630/<n>.JPG, 448x252 in the carousel).
const ph = (n, sz) => `http://localhost:4181/fake/photos/by-size/820640/${sz}/${n}.JPG`;
const FAKE_DEALER = `<!doctype html><html lang="fr"><head><title>Audi Q5 2023 Progressiv AWD usagée à vendre chez Example Dealer</title>
<meta property="og:site_name" content="Example Dealer"><meta property="og:image" content="${ph(1, "1120x630")}">
<script type="application/ld+json">{ broken json </script></head><body>
<nav><h4>Options de financement</h4><ul><li><a href="/fin">Financement</a></li><li><a href="/loc">Location</a></li></ul></nav>
<h1>2023 Audi Q5 PROGRESSIV</h1><h2>27 992 $</h2>
<div class="gallery"><div><img src="${ph(1, "1120x630")}"></div>${[2, 3, 4, 5, 6].map(n => `<div><img data-src="${ph(n, "448x252")}"></div>`).join("")}</div>
<div class="info"><h4>Informations sur le véhicule</h4><dl><dt>Kilométrage</dt><dd>96 038km</dd></dl><p>NIV : WA1EAAFY4P2000123</p></div>
<div class="vdp-info-inline"><h4>Confort</h4><ul><li>Air climatisé</li><li>Sièges chauffants</li><li>Régulateur de vitesse adaptatif</li></ul></div>
<div class="vdp-info-inline"><h4>Sécurité</h4><ul><li>Freins ABS</li><li>Caméra 360°</li></ul></div>
<p><a href="https://vhr.carfax.ca/?id=EXAMPLE123">Rapport Carfax</a> <a href="https://www.carfax.ca/">Carfax</a></p>
</body></html>`;
function serve(dir, port) {
  return new Promise(r => {
    const s = http.createServer((req, res) => {
      if (req.url.startsWith("/fake-cgr")) { res.writeHead(200, { "content-type": "text/html; charset=utf-8" }); return res.end(FAKE_CGR); }
      if (req.url.startsWith("/fake-dealer")) { res.writeHead(200, { "content-type": "text/html; charset=utf-8" }); return res.end(FAKE_DEALER); }
      if (req.url.startsWith("/fake-srp")) { res.writeHead(200, { "content-type": "text/html; charset=utf-8" }); return res.end(FAKE_SRP); }
      if (req.url.startsWith("/fake-gone")) { res.writeHead(200, { "content-type": "text/html" }); return res.end("<!doctype html><title>Listing not found - CarGurus</title><p>This listing is no longer available.</p>"); }
      if (req.url.startsWith("/fake-at")) { res.writeHead(200, { "content-type": "text/html; charset=utf-8" }); return res.end(FAKE_AT); }
      if (req.url.startsWith("/fake-cg")) { res.writeHead(200, { "content-type": "text/html; charset=utf-8" }); return res.end(FAKE_CG); }
      if (req.url.startsWith("/fake-listing")) { res.writeHead(200, { "content-type": "text/html; charset=utf-8" }); return res.end(FAKE_LISTING); }
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
const setLang = async (p, l) => { await p.select(await p.$("#gate-lang") ? "#gate-lang" : "#lang", l); await sleep(120); };
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
        // Hero content clipped at the edges (the hero hides overflow, so scrollWidth can't see it).
        const clipped = [...document.querySelectorAll(".h2-text > *, .h2-bar-c > *")].filter(e => { const b = e.getBoundingClientRect(); return b.width && (b.left < -1 || b.right > innerWidth + 1); }).map(e => e.className || e.tagName);
        return { sw: document.documentElement.scrollWidth, vw: innerWidth, text: c.innerText, clipped }; });
      if (x.sw > x.vw) report.overflow.push(`${w} ${scheme} ${l} ${r}: ${x.sw} > ${x.vw}`);
      if (x.clipped.length) report.overflow.push(`${w} ${scheme} ${l} ${r} hero clipped: ${x.clipped.join(",")}`);
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

// 3. Production build, signed out: only the login screen, on every route, both widths and themes; no site content.
for (const [w, scheme] of [[390, "dark"], [1440, "light"]]) {
  const p = await open(PROD, "cars", w, scheme); await sleep(1500);
  const look = () => p.evaluate(() => ({ gate: !!document.querySelector(".gate"), mode: document.querySelector(".gate")?.dataset.mode, header: !!document.querySelector(".app, header nav"), cars: !!document.querySelector(".car, .hero"), sw: document.documentElement.scrollWidth, vw: innerWidth }));
  const seen = [];
  for (const r of ["cars", "costs", "steps", "documents", "contacts", "search"]) { await go(p, r); const l = await look(); seen.push(l.gate && !l.header && !l.cars ? l.mode : "LEAK " + r + " " + JSON.stringify(l)); if (l.sw > l.vw) report.overflow.push(`gate ${w} ${scheme} ${r}`); }
  report.checks[`gate_${w}_${scheme}`] = [...new Set(seen)].join(",");
  report.checks[`gateEmail_${w}`] = await p.evaluate(() => !!document.getElementById("g-email") && !!document.querySelector('[data-act="email-submit"]'));
  report.checks[`gateSignIn_${w}`] = await p.$eval('[data-act="sign-in"]', e => e.textContent.trim()).catch(() => null);
  await setLang(p, "en"); report.checks[`gateEn_${w}`] = await p.$eval('[data-act="sign-in"]', e => e.textContent.trim()).catch(() => null); await setLang(p, "ro");
  await p.screenshot({ path: path.join(OUT, `gate-${w}-${scheme}.png`) });
  await p.close();
}
// 4. Round trips through the mock store
{ const p = await open(MOCK, "cars", 1280, "dark");
  const store = () => p.evaluate(() => Object.fromEntries(window.__mock.store));
  report.checks.filterDefaultAll = await p.$eval('[data-filter="all"]', e => e.getAttribute("aria-pressed"));
  report.checks.cardLanded = await p.$$eval(".car", cs => cs.map(c => c.querySelector(".ctt").textContent + " = " + c.querySelector(".rate").innerText.replace(/\n/g, " ")));
  // The bar takes listing links only; a car without a link is added from the header button.
  await setVal(p, "#hero-vin", "WA1FAAFY0M2006299"); await p.click(".pillform .cta"); await sleep(200);
  report.checks.barLinkOnly = await p.evaluate(() => (document.querySelector(".toast")?.textContent || "").slice(0, 30) + " | dialog " + !!document.querySelector("#car-form"));
  await p.click('[data-act="add-car"]'); await sleep(200);
  await setVal(p, "#d-vin", "WA1FAAFY0M2006299"); await sleep(100);
  report.checks.dialogPrefill = await p.evaluate(() => [document.getElementById("d-vin").value, document.getElementById("d-trim").value, document.getElementById("d-year").value]);
  await setVal(p, "#d-price", "28500"); await setVal(p, "#d-seller", "Test dealer");
  await p.select("#d-sellerType", "private"); await sleep(50);
  report.checks.gstFollowsPrivate = await p.$eval("#d-gst", e => !e.checked);
  await p.click('#car-form [type=submit]'); await sleep(250);
  let s = await store(); const newKey = Object.keys(s).find(k => k.startsWith("cars/new"));
  report.checks.added = !!newKey && s[newKey].seller === "Test dealer" && s[newKey].gst === false && s[newKey].priceHistory.length === 1 && s[newKey].addedBy === "manual";
  await p.click('[data-act="edit-car"][data-id="s3"]'); await sleep(200); await setVal(p, "#d-price", "26999");
  await p.click('#car-form [type=submit]'); await sleep(250);
  s = await store(); report.checks.priceAppended = JSON.stringify(s["cars/s3"].priceHistory);
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

// 4b. View counts: each opening of a car's details counts once per person; cards and details show them
{ const p = await open(MOCK, "cars", 1280, "light");
  for (let k = 0; k < 2; k++) { await p.click('[data-act="details"][data-id="s1"]'); await sleep(250); await p.keyboard.press("Escape"); await sleep(250); }
  await p.click('[data-act="details"][data-id="s1"]'); await sleep(300);
  const v = await p.evaluate(() => window.__mock.store.get("views/s1"));
  report.checks.viewsStored = JSON.stringify({ total: v?.total, me: v?.byUser?.["mock-user"]?.n, name: v?.byUser?.["mock-user"]?.name });
  report.checks.viewsDetail = await p.$eval('#side [data-sec="views"]', e => e.innerText.replace(/\s+/g, " ").slice(0, 80)).catch(() => null);
  await p.keyboard.press("Escape"); await sleep(250);
  report.checks.viewsChip = await p.$eval('[data-act="details"][data-id="s1"]', b => b.closest(".car").querySelector(".chip.views")?.textContent).catch(() => null);
  await p.close(); }

// 4d. Not a member yet: the login screen sends a request by itself (no code to copy) and opens once approved
{ const p = await open(MOCK + "?deny", "cars", 390, "dark"); await sleep(500);
  report.checks.denyGate = await p.evaluate(() => [document.querySelector(".gate")?.dataset.mode, document.querySelector('[data-req="sent"]')?.textContent.trim().slice(0, 40), !!document.querySelector(".gate-code")].join(" | "));
  report.checks.denyRequest = await p.evaluate(() => JSON.stringify(window.__mock.store.get("requests/mock-user")?.name));
  await p.evaluate(() => { window.__mock.store.set("members/mock-user", { name: "Test", role: "member" }); window.__mock.emit(); });
  await p.waitForSelector(".car", { timeout: 5000 }).catch(() => {});
  report.checks.denyOpensOnApproval = await p.evaluate(() => !document.querySelector(".gate") && document.querySelectorAll(".car").length);
  await p.click(".ubtn"); await sleep(150);
  report.checks.memberMenu = await p.evaluate(() => [...document.querySelectorAll(".upop .uitem")].map(e => e.textContent.trim()).join(",") + " / " + document.querySelector('[data-role="me"]').textContent);
  await p.close(); }

// 4e. Carfax per car: add a link, upload a PDF, open it, delete it (two presses) and its pieces go too
{ const p = await open(MOCK, "cars", 1280, "light");
  const pdf = path.join(OUT, "carfax-test.pdf");
  fs.writeFileSync(pdf, "%PDF-1.4\n1 0 obj<</Type/Catalog>>endobj\ntrailer<</Root 1 0 R>>\n%%EOF\n" + "x".repeat(2000));
  await p.click('[data-act="details"][data-id="s2"]'); await sleep(300);
  await setVal(p, "#cfx-link", "https://www.carfax.ca/example-report"); await p.click('[data-act="add-carfax-link"]'); await sleep(300);
  const inp = await p.$("#cfx-file"); await inp.uploadFile(pdf); await sleep(800);
  let st = await p.evaluate(() => Object.fromEntries(window.__mock.store));
  const cf = st["cars/s2"].carfax || []; const pdfItem = cf.find(x => x.kind === "pdf");
  const fileKeys = Object.keys(st).filter(k => pdfItem && k.startsWith("files/" + pdfItem.fileId));
  report.checks.carfaxStored = JSON.stringify({ items: cf.map(x => x.kind).sort(), pdfSize: pdfItem?.size, fileDocs: fileKeys.length, by: pdfItem?.addedBy });
  report.checks.carfaxList = await p.$$eval('[data-sec="carfax"] .cfx li', ls => ls.map(l => l.dataset.kind + ":" + l.querySelector(".cfx-t a, .cfx-t .link").textContent.trim()).join(" | "));
  report.checks.carfaxOpens = await p.evaluate(async () => {
    let got = null; const fake = { location: { set href(u) { got = u; } }, close() {} }; window.open = () => fake;
    document.querySelector('[data-act="open-pdf"]').click();
    for (let i = 0; i < 40 && !got; i++) await new Promise(r => setTimeout(r, 50));
    if (!got) return null; const b = await (await fetch(got)).blob(); return b.type + " " + b.size;
  });
  const del = '[data-kind="pdf"] [data-act="del-carfax"]';
  await p.click(del); await sleep(150); await p.click(del); await sleep(500);
  st = await p.evaluate(() => Object.fromEntries(window.__mock.store));
  report.checks.carfaxDeleted = JSON.stringify({ left: (st["cars/s2"].carfax || []).map(x => x.kind), fileDocs: Object.keys(st).filter(k => k.startsWith("files/")).length });
  await p.keyboard.press("Escape"); await sleep(250);
  report.checks.carfaxChip = await p.$eval('[data-act="details"][data-id="s2"]', b => [...b.closest(".car").querySelectorAll(".chip")].some(c => /Carfax/.test(c.textContent)));
  await p.close(); }

// 4f. Email accounts on the login screen (test version starts signed out with "?signedout")
{ const p = await open(MOCK + "?signedout", "cars", 390, "dark"); await sleep(400);
  const msg = () => p.$eval(".gate-msg", e => e.textContent.trim().slice(0, 40)).catch(() => null);
  report.checks.emailForm = await p.evaluate(() => [!!document.querySelector('[data-act="sign-in"]'), !!document.getElementById("g-email"), document.querySelectorAll(".gate-tabs button").length].join(","));
  await setVal(p, "#g-email", "someone@example.test"); await setVal(p, "#g-pass", "nope"); await p.click('[data-act="email-submit"]'); await sleep(200);
  const wrong = await msg();
  await p.click('[data-act="forgot"]'); await sleep(200); const reset = await msg();
  await p.click('[data-tab="up"]'); await sleep(100); await setVal(p, "#g-pass", "secret123"); await p.click('[data-act="email-submit"]'); await sleep(200);
  const noName = await msg();
  const over = await p.evaluate(() => document.documentElement.scrollWidth <= innerWidth); if (!over) report.overflow.push("gate email 390");
  await p.screenshot({ path: path.join(OUT, "gate-email-390.png") });
  await setVal(p, "#g-name", "Maria Pop"); await p.click('[data-act="email-submit"]'); await sleep(600);
  report.checks.emailFlow = JSON.stringify({ wrong, reset, noName, inAfterSignUp: await p.evaluate(() => !document.querySelector(".gate") && document.querySelectorAll(".car").length), name: await p.evaluate(() => document.querySelector(".ubtn")?.getAttribute("aria-label")) });
  report.checks.emailNotStored = await p.evaluate(() => !JSON.stringify([...window.__mock.store]).includes("example.test"));
  await p.close(); }

// 4c. Admin page (avatar menu): approve a request, change a role, remove a member (two presses), add by code
{ const p = await open(MOCK, "cars", 1280, "light");
  const store = () => p.evaluate(() => Object.fromEntries(window.__mock.store));
  report.checks.adminBadge = await p.$eval(".udot", e => e.textContent).catch(() => null);
  const hdr0 = await p.$eval("header", e => e.getBoundingClientRect().height).catch(() => 0);
  await p.click(".ubtn"); await sleep(150);
  report.checks.menuFloats = await p.evaluate(h0 => { const u = document.querySelector(".upop"); return getComputedStyle(u).position + " header " + (Math.round(document.querySelector("header").getBoundingClientRect().height) === Math.round(h0) ? "unchanged" : "MOVED") + " role " + document.querySelector('[data-role="me"]').textContent; }, hdr0);
  await p.click('[data-act="admin"]'); await sleep(400);
  report.checks.adminRoute = await p.evaluate(() => location.hash + " " + document.querySelectorAll('[data-sec="members"] .arow').length + " members, " + document.querySelectorAll('[data-sec="requests"] .arow').length + " request");
  await p.click('[data-act="approve"]'); await sleep(300);
  let s = await store();
  report.checks.adminApproved = JSON.stringify({ member: s["members/SampleRequestLaszlo00000002"], requestGone: !s["requests/SampleRequestLaszlo00000002"] });
  await p.click('[data-id="SampleMemberAna0000000001"] [data-act="role"]'); await sleep(300);
  s = await store(); report.checks.adminRole = s["members/SampleMemberAna0000000001"].role;
  await p.click('[data-id="SampleMemberAna0000000001"] [data-act="remove"]'); await sleep(150);
  s = await store(); const still = !!s["members/SampleMemberAna0000000001"];
  await p.click('[data-id="SampleMemberAna0000000001"] [data-act="remove"]'); await sleep(300);
  s = await store(); report.checks.adminRemoveTwoPress = still && !s["members/SampleMemberAna0000000001"];
  await setVal(p, "#a-code", "NewPersonCode0000000000003"); await setVal(p, "#a-name", "Maria Pop"); await p.click('[data-act="add-member"]'); await sleep(300);
  s = await store(); report.checks.adminAdded = JSON.stringify(s["members/NewPersonCode0000000000003"]);
  report.checks.adminSelfNoActions = await p.evaluate(() => !document.querySelector('[data-id="mock-user"] [data-act]'));
  for (const [w, scheme] of [[390, "dark"], [1440, "light"]]) {
    await p.setViewport({ width: w, height: 900 }); await p.emulateMediaFeatures([{ name: "prefers-color-scheme", value: scheme }]); await sleep(200);
    const o = await p.evaluate(() => document.documentElement.scrollWidth <= innerWidth); if (!o) report.overflow.push(`admin ${w} ${scheme}`);
    await p.screenshot({ path: path.join(OUT, `admin-${w}-${scheme}.png`), fullPage: true });
  }
  for (const l of ["en", "fr"]) { await setLang(p, l); report.checks["admin_" + l] = await p.$eval('[data-sec="requests"] .label', e => e.textContent.trim()); }
  await setLang(p, "ro");
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
  report.checks.heroShowsPhoto = await p.evaluate(() => !!document.querySelector(".hero2:not(.nophoto) .h2-media img"));
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
  // "Just give it the link": hero box takes a link, the form fills itself in through the extension.
  await p.setViewport({ width: 1440, height: 900 }); await p.keyboard.press("Escape"); await sleep(300);
  await setVal(p, "#hero-vin", MOCK + "fake-cg.html?utm=x"); await p.click(".pillform .cta");
  await p.waitForFunction(() => document.getElementById("d-price")?.value, { timeout: 45000 }).catch(() => {});
  report.checks.linkFill = await p.evaluate(() => ["d-vin", "d-year", "d-trim", "d-price", "d-km"].map(id => document.getElementById(id)?.value).join(" | ") + " | photos " + document.getElementById("d-photos").value.split("\n").filter(Boolean).length);
  report.checks.linkMsg = await p.$eval(".fillmsg", e => e.className + ": " + e.textContent.trim().slice(0, 30)).catch(() => null);
  report.checks.linkDup = await p.evaluate(() => !!document.querySelector(".dupbanner")); // s3 already has this link
  report.checks.noGermany = await p.evaluate(() => !document.getElementById("d-dePrice"));
  await p.screenshot({ path: path.join(OUT, "linkfill-1440.png") });
  await p.click('[data-act="open-dup"]'); await sleep(300);
  report.checks.dupOpens = await p.evaluate(() => !!document.querySelector("#side") && !document.querySelector("#car-form"));
  // Real-site shapes: CarGurus (Remix) and AutoTrader.ca (Next.js), each through the link box.
  // A dealer site (HGregoire shape) through the link box, saved: equipment, ACC/360, Carfax link, big photos, price, km.
  await p.keyboard.press("Escape"); await sleep(300);
  await setVal(p, "#hero-vin", MOCK + "fake-dealer.html"); await p.click(".pillform .cta");
  await p.waitForFunction(() => document.getElementById("d-price")?.value, { timeout: 45000 }).catch(() => {});
  report.checks.fill_dealer = await p.evaluate(() => ["d-vin", "d-year", "d-trim", "d-price", "d-km", "d-seller"].map(id => document.getElementById(id)?.value).join(" | "));
  await p.click('#car-form [type=submit]'); await sleep(500);
  report.checks.dealerSaved = await p.evaluate(() => { const c = [...window.__mock.store].map(([, v]) => v).find(v => v.vin === "WA1EAAFY4P2000123"); return c ? JSON.stringify({ eq: c.equipment?.length, acc: c.acc, cam: c.cam, carfax: (c.carfax || []).map(x => x.url.split("?")[0]), photos: c.photos.length, sizes: [...new Set(c.photos.map(u => u.split("/").slice(-2, -1)[0]))] }) : null; });
  for (const [name, page] of [["cargurus", "fake-cgr.html"], ["autotrader", "fake-at.html"]]) {
    await p.keyboard.press("Escape"); await sleep(300);
    await setVal(p, "#hero-vin", MOCK + page); await p.click(".pillform .cta");
    await p.waitForFunction(() => document.getElementById("d-price")?.value, { timeout: 45000 }).catch(() => {});
    report.checks["fill_" + name] = await p.evaluate(() => ["d-title", "d-vin", "d-year", "d-trim", "d-price", "d-km", "d-seller", "d-sellerType", "d-location"].map(id => document.getElementById(id)?.value).join(" | ")
      + " | photos " + document.getElementById("d-photos").value.split("\n").filter(Boolean).length + " " + [...new Set(document.getElementById("d-photos").value.split("\n").map(u => (u.match(/(\d+x\d+)\.\w+$/) || [, "?"])[1]))].join("/"));
    await p.keyboard.press("Escape"); await sleep(200);
  }
  // Daily price check through the extension: one price changed (CarGurus shape), one listing gone; history appended.
  await p.goto(MOCK + "#/cars", { waitUntil: "networkidle0" }); await sleep(500);
  await p.evaluate(base => {
    const st = window.__mock.store;
    for (const [k, v] of st) if (k.startsWith("cars/") && ["watching", "contacted", "offer", "inspection"].includes(v.status || "watching")) st.set(k, { ...v, url: base + "fake-gone.html?" + k });
    const s3 = st.get("cars/s3"); st.set("cars/s3", { ...s3, url: base + "fake-cgr.html", price: 34995, status: "watching" });
    window.__mock.emit();
  }, MOCK);
  await sleep(300);
  const before = await p.evaluate(() => (window.__mock.store.get("cars/s3").priceHistory || []).length);
  await p.click('[data-act="check-prices"]');
  await p.waitForFunction(() => { const c = window.__mock.store.get("config/prices"); return c && c.checked > 0 && !document.querySelector(".pb-bar"); }, { timeout: 120000 }).catch(() => {});
  await sleep(400);
  const pr = await p.evaluate(() => ({ c: window.__mock.store.get("config/prices"), s3: window.__mock.store.get("cars/s3"), gone: [...window.__mock.store].filter(([k, v]) => k.startsWith("cars/") && v.gone).length }));
  const found = await p.evaluate(() => { const c = window.__mock.store.get("config/prices"); const cars = [...window.__mock.store].filter(([k, v]) => k.startsWith("cars/") && v.addedBy === "claude" && String(v.vin).startsWith("WA1FAAFY0N2091")).map(([, v]) => v);
    return { found: (c.found || []).map(f => f.title + " " + f.price), total: c.searchTotal, blocked: c.blocked, added: cars.map(v => [v.vin.slice(-5), v.price, v.km, v.acc, v.cam, v.status, v.photos.length, v.location, v.url.split("/").pop()].join("/")) }; });
  report.checks.autoSearch = JSON.stringify(found);
  report.checks.cgHistory = await p.evaluate(() => { const c = window.__mock.store.get("cars/s3"); return JSON.stringify({ hist: (c.priceHistory || []).map(x => x.date.slice(5) + ":" + x.price), listedSince: c.listedSince }); });
  report.checks.priceCheck = JSON.stringify({ checked: pr.c?.checked, changes: (pr.c?.changes || []).map(x => x.from + "→" + x.to), gone: pr.c?.gone?.length, carsMarkedGone: pr.gone, s3: pr.s3.price, historyAdded: (pr.s3.priceHistory || []).length - before, statusKept: pr.s3.status });
  report.checks.priceBar = await p.$eval('[data-sec="prices"]', e => e.innerText.replace(/\s+/g, " ").slice(0, 120)).catch(() => null);
  report.checks.goneChip = await p.evaluate(() => document.querySelectorAll(".car .chip.bad").length > 0);
  await p.screenshot({ path: path.join(OUT, "pricecheck-1440.png") });
  await eb.close(); }
{ const p = await open(MOCK, "cars", 1440, "dark");
  await p.click('[data-act="details"][data-id="s2"]'); await sleep(300);
  report.checks.noExtOffer = await p.evaluate(() => !!document.querySelector('.show.stage a[href$="import-hub-extension.zip"]'));
  await p.keyboard.press("Escape"); await sleep(200);
  await p.click('[data-act="add-car"]'); await sleep(200);
  report.checks.addNoExt = await p.evaluate(() => [!!document.getElementById("d-link"), !!document.querySelector('#car-form a[href$="import-hub-extension.zip"]'), !!document.querySelector("#car-form .impbox")].join(","));
  await p.screenshot({ path: path.join(OUT, "add-noext-1440-dark.png") });
  await p.screenshot({ path: path.join(OUT, "slideshow-noext-1440-dark.png") });
  await p.close(); }

console.log(JSON.stringify(report, null, 1));
await browser.close(); mockSrv.close(); prodSrv.close();
process.exitCode = report.errors.length || report.overflow.length || report.i18n.length ? 1 : 0;
