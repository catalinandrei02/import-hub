// Daily run through the Chrome extension (no buyer API exists, see CLAUDE.md §8), started by whoever has the site open
// in Chrome with the extension, or by "Check now":
//  1. auto-search (if Search settings are on and due): reads ONE CarGurus.ca search page, applies the filters,
//     adds up to MAX_NEW new matching cars (with all their photos) as "watching", addedBy "claude" (= found automatically);
//  2. price check (if due): re-reads every active car with a link, appends price changes to priceHistory (never rewritten),
//     flags listings with no price as `gone`, adds photos if missing. Status and steps are never touched.
// Results go to config/prices (shared), shown by PriceCheckBar.vue.
import { reactive } from "vue";
import { addDoc, canWrite, queue, state } from "../data/store";
import type { Car, PriceRun, SearchSettings } from "../data/types";
import { extVersion, hasExtension, readWithExtension, searchWithExtension } from "./extension";
import { findSaved, parseImport, MAX_PHOTOS } from "./importer";
import type { SearchHit } from "./listingReader";
import { carName, safeUrl } from "./cars";
import { decodeVin } from "./vin";

export const DUE_MS = 20 * 3600 * 1000;
export const MAX_NEW = 8;
const ACTIVE = new Set(["watching", "contacted", "offer", "inspection"]);
export const run = reactive({ running: false, phase: "" as "" | "search" | "prices", done: 0, total: 0 });

export const checkable = (cars: Car[]) => cars.filter(c => ACTIVE.has(c.status || "watching") && !!safeUrl(c.url));
export function isDue(p: PriceRun | null, now = Date.now()) { return !p?.lastRun || now - Date.parse(p.lastRun) > DUE_MS; }

// ---- auto-search --------------------------------------------------------------------------------
/** CarGurus.ca search pages per model (ids checked on cargurus.ca, Nov 2026). Location comes from the browser (VPN). */
const CG: Record<string, string> = {
  "audi q5": "https://www.cargurus.ca/Cars/l-Used-Audi-Q5-d1988",
  "audi q5 sportback": "https://www.cargurus.ca/Cars/l-Used-Audi-Q5-Sportback-d3140",
};
// Test build (npm run dev:mock / e2e): local fake pages shaped like CarGurus.ca instead of the real site.
const MOCK = import.meta.env.MODE === "mock";
export const searchUrl = (s: SearchSettings) => (MOCK ? location.origin + "/fake-srp.html" : CG[String(s.model || "").trim().toLowerCase().replace(/\s+/g, " ")] || null);
export const searchOn = (s: SearchSettings) => !!s.enabled && (!Array.isArray(s.sources) || s.sources.includes("cargurus"));
export const searchNeedsUpdate = () => hasExtension.value && extVersion.value !== "" && extVersion.value < "1.3.0";
export function isSearchDue(p: PriceRun | null, s: SearchSettings, now = Date.now()) {
  if (!searchOn(s) || !searchUrl(s)) return false;
  const days = [1, 3, 7].includes(+s.frequencyDays) ? +s.frequencyDays : 7;
  return !p?.searchRun || now - Date.parse(p.searchRun) > days * 86400_000 - 4 * 3600_000;
}
const yes = (o: string[], re: RegExp) => o.some(x => re.test(x));
export const ACC_RE = /adaptive cruise/i, CAM_RE = /360|surround[- ]?view|top[- ]?view|bird'?s[- ]?eye|area view/i;

/** Why a search result is skipped ("" = keep). Pure, unit-tested. */
export function skipReason(h: SearchHit, s: SearchSettings): string {
  const year = +(h.t.match(/\b(19|20)\d{2}\b/) || [0])[0];
  if (s.yearMin && year && year < s.yearMin) return "year";
  if (s.yearMax && year && year > s.yearMax) return "year";
  if (s.maxPrice && h.p && h.p > s.maxPrice) return "price";
  if (s.maxKm && h.k && h.k > s.maxKm) return "km";
  if (s.radiusKm && h.d != null && h.d * 1.609 > s.radiusKm * 1.15) return "distance"; // CarGurus distance looks like miles
  if (s.trims?.length) {
    const dv = h.v.length === 17 ? decodeVin(h.v) : null;
    const text = h.t + " " + (dv && !dv.err ? dv.trim : "");
    if (!s.trims.some(tr => new RegExp("\\b" + tr + "\\b", "i").test(text))) return "trim";
  }
  if (s.mustAcc && !yes(h.o, ACC_RE)) return "acc";
  if (s.must360 && !yes(h.o, CAM_RE)) return "cam";
  if (h.st === "private" ? s.privates === false : s.dealers === false) return "seller";
  const ex = String(s.exclude || "").split("\n").map(x => x.trim().toLowerCase()).filter(Boolean);
  if (h.s && ex.some(x => h.s.toLowerCase().includes(x))) return "excluded";
  return "";
}

export const detailUrl = (h: SearchHit) => (MOCK ? location.origin + "/fake-cgr-details/" : "https://www.cargurus.ca/details/") + h.id;

export function hitToCar(h: SearchHit, photos: string[], now: string): Omit<Car, "_id"> {
  const dv = h.v.length === 17 ? decodeVin(h.v) : null;
  const year = +(h.t.match(/\b(19|20)\d{2}\b/) || [0])[0] || (dv && !dv.err && dv.year !== "?" ? +dv.year : null);
  const trim = (h.t.match(/\b(Progressiv|Technik|Komfort)\b/i) || [])[1] || (dv && !dv.err && dv.trim !== "?" ? dv.trim : "");
  return {
    title: /Q5 Sportback/i.test(h.t) ? "Audi Q5 Sportback" : /Q5/i.test(h.t) ? "Audi Q5" : h.t.replace(/\b(19|20)\d{2}\b/, "").trim().slice(0, 40),
    year: year || null, trim, vin: h.v.length === 17 ? h.v : "", km: h.k, price: h.p,
    priceHistory: h.p ? [{ date: now.slice(0, 10), price: h.p }] : [],
    seller: h.s, sellerType: h.st === "private" ? "private" : "dealer", location: h.l, url: detailUrl(h),
    status: "watching", acc: yes(h.o, ACC_RE) ? "yes" : "", cam: yes(h.o, CAM_RE) ? "yes" : "", flags: [], notes: "",
    steps: {}, docs: {}, photos: (photos.length ? photos : h.i ? [h.i] : []).slice(0, MAX_PHOTOS),
    addedBy: "claude", addedAt: now, updatedAt: now,
  };
}

// ---- the daily run --------------------------------------------------------------------------------
export async function runDaily(opts: { search: boolean; prices: boolean }): Promise<PriceRun | null> {
  if (run.running || !hasExtension.value || !canWrite.value) return null;
  const by = (state.user?.name || "").trim().split(/\s+/)[0].slice(0, 30);
  const now = new Date().toISOString(), today = now.slice(0, 10);
  const res: PriceRun = { ...(state.prices || {}), by };
  run.running = true;
  try {
    // Claim the run first, so someone else opening the site now doesn't start a second one.
    await queue("config/prices", b => b.set("config/prices", { ...res, ...(opts.prices ? { lastRun: now } : {}), ...(opts.search ? { searchRun: now } : {}) }));
    const s = state.search;
    if (opts.search && searchOn(s) && searchUrl(s) && !searchNeedsUpdate()) {
      Object.assign(run, { phase: "search", done: 0, total: 1 });
      Object.assign(res, { searchRun: now, found: [], blocked: false, searchTotal: null });
      const data = await searchWithExtension(searchUrl(s)!);
      if (!data || data.blocked) res.blocked = true;
      else {
        res.searchTotal = data.total;
        const fresh = data.hits.filter(h => !skipReason(h, s) && !findSaved(state.cars, { vin: h.v, url: detailUrl(h) }));
        const take = fresh.slice(0, MAX_NEW);
        Object.assign(run, { done: 0, total: take.length });
        for (const h of take) {
          const d = await readWithExtension(detailUrl(h)); // all the photos, and the city
          const p = d ? parseImport(JSON.stringify(d)) : null;
          const car = hitToCar(h, p?.photos || [], new Date().toISOString());
          if (!car.location && p?.location) car.location = p.location;
          const id = await addDoc("cars", car);
          res.found!.push({ id, title: [car.year, car.title, car.trim].filter(Boolean).join(" "), price: (car.price as number | null | undefined) ?? null });
          run.done++;
        }
      }
    }
    if (opts.prices) {
      const cars = checkable(state.cars).filter(c => !res.found?.some(f => f.id === c._id));
      Object.assign(run, { phase: "prices", done: 0, total: cars.length });
      Object.assign(res, { lastRun: now, checked: 0, errors: 0, changes: [], gone: [] });
      for (const c of cars) {
        const d = await readWithExtension(safeUrl(c.url)!);
        run.done++;
        if (!d) { res.errors!++; continue; }
        res.checked!++;
        const p = parseImport(JSON.stringify(d));
        const upd: Record<string, unknown> = {};
        if (!p?.price) {
          if (!c.gone) { upd.gone = today; res.gone!.push({ id: c._id, title: carName(c) }); }
        } else {
          if (c.gone) upd.gone = "";
          if (p.price !== c.price) {
            const h = Array.isArray(c.priceHistory) ? [...c.priceHistory] : [];
            if (!h.length && c.price) h.push({ date: (c.addedAt || now).slice(0, 10), price: c.price }); // keep the old price on record
            h.push({ date: today, price: p.price });
            Object.assign(upd, { price: p.price, priceHistory: h });
            res.changes!.push({ id: c._id, title: carName(c), from: c.price ?? null, to: p.price });
          }
          if (!c.photos?.length && p.photos?.length) upd.photos = p.photos.slice(0, MAX_PHOTOS);
        }
        if (Object.keys(upd).length) await queue("cars/" + c._id, b => b.update("cars/" + c._id, { ...upd, updatedAt: new Date().toISOString() }));
      }
    }
    await queue("config/prices", b => b.set("config/prices", JSON.parse(JSON.stringify(res))));
    return res;
  } finally { Object.assign(run, { running: false, phase: "" }); }
}

/** Old name, kept for the "Check now" button: everything that's switched on. */
export const runPriceCheck = () => runDaily({ search: searchOn(state.search), prices: true });
