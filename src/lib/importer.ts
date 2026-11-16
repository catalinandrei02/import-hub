// "Add to Import Hub" bookmark: runs on a listing page in the user's Chrome (which can open the sites, VPN included),
// reads the car's details and photo links, and opens Import Hub with the add-car form prefilled.
// The site itself can't read listing pages (they block other origins), so the reading happens in the browser tab.
import type { Car } from "../data/types";
import { decodeVin } from "./vin";

import { readListing, type ListingData } from "./listingReader";
export { readListing, type ListingData };

/** Most photos kept per car. */
export const MAX_PHOTOS = 40;

const bareUrl = (u?: string) => String(u || "").split(/[?#]/)[0].replace(/\/$/, "").toLowerCase();
/** The saved car that is the same listing: same VIN, or same link (ignoring query and hash). */
export function findSaved<C extends Partial<Car>>(cars: C[], c: Partial<Car>): C | undefined {
  return cars.find(x => (!!c.vin && c.vin.length === 17 && x.vin === c.vin) || (!!c.url && !!x.url && bareUrl(x.url) === bareUrl(c.url)));
}

/** The bookmark's href for this site. */
export function bookmarkletHref(base: string): string {
  return "javascript:(" + readListing.toString() + ")(" + JSON.stringify(base) + ");void 0";
}

/** "27,999.00 $" → 27999; "88 000 km" → 88000. */
export function cleanNum(x: unknown): number | null {
  const s = String(x ?? "").trim().replace(/[.,]\d{1,2}(?!\d)\s*$/, "").replace(/[^\d]/g, "");
  return s ? Number(s) : null;
}

/** "PROGRESSIV QUATTRO 19 PCS" → "Progressiv" (Audi Canada trim names), when there is no VIN to decode. */
const trimFrom = (s: string) => { const m = s.match(/\b(progressiv|technik|komfort)\b/i); return m ? m[1][0].toUpperCase() + m[1].slice(1).toLowerCase() : ""; };

/** Adaptive cruise control / 360° camera in an equipment or options list (EN + FR). */
export const ACC_RE = /adaptive cruise|r[ée]gulateur (de vitesse )?adaptatif|cruise control adaptatif|acc\b.*(stop|go)/i;
export const CAM_RE = /360|surround[- ]?view|top[- ]?view|bird'?s[- ]?eye|area view|vision p[ée]riph[ée]rique|cam[ée]ra (panoramique|p[ée]rim[ée]trique)/i;

/** Turns the bookmark's payload into a prefilled car (not saved yet). */
export function parseImport(raw: string): Partial<Car> | null {
  let d: Partial<ListingData>;
  try { d = JSON.parse(raw); } catch { return null; }
  if (!d || typeof d !== "object") return null;
  const str = (x: unknown, n = 200) => String(x ?? "").slice(0, n).trim();
  const vin = str(d.v, 17).toUpperCase();
  const dv = decodeVin(vin);
  const year = cleanNum(d.y) || (dv.err || dv.year === "?" ? null : dv.year);
  const title = str(d.t).replace(/\b(19|20)\d{2}\b/, "").replace(/\s{2,}/g, " ").trim();
  const model = /Q5/i.test(title) ? "Audi Q5" : title.split(/[|–—-]/)[0].trim().slice(0, 40) || "Audi Q5";
  const photos = (Array.isArray(d.i) ? d.i : []).map(u => str(u, 600)).filter(u => /^https?:\/\//i.test(u)).slice(0, MAX_PHOTOS);
  return {
    title: model, year: year && year > 1990 && year < 2100 ? year : null, vin: vin.length === 17 ? vin : "",
    trim: dv.err || dv.trim === "?" ? trimFrom(str(d.tr) + " " + str(d.t)) : dv.trim, price: cleanNum(d.p), km: cleanNum(d.k),
    url: /^https?:\/\//i.test(str(d.u, 600)) ? str(d.u, 600) : "", seller: str(d.s, 80), location: str(d.l, 60), photos,
    ...(d.st === "private" || d.st === "dealer" ? { sellerType: d.st } : {}),
    ...extras(d),
  };
}

/** Equipment, Carfax links, CarGurus history and what they tell us (ACC / 360° / accident flag). Never invents: only "yes". */
export function extras(d: Partial<ListingData>): Partial<Car> {
  const out: Partial<Car> = {};
  const eq = (Array.isArray(d.eq) ? d.eq : []).map(x => String(x).slice(0, 80).trim()).filter(Boolean).slice(0, 150);
  if (eq.length) {
    out.equipment = eq;
    if (eq.some(x => ACC_RE.test(x))) out.acc = "yes";
    if (eq.some(x => CAM_RE.test(x))) out.cam = "yes";
  }
  const cf = (Array.isArray(d.cf) ? d.cf : []).map(u => String(u).slice(0, 600)).filter(u => /^https:\/\/([\w-]+\.)*carfax\.(ca|com)\//i.test(u)).slice(0, 5);
  if (cf.length) out.carfax = cf.map((url, i) => ({ id: "auto" + i + Date.now().toString(36), kind: "link" as const, url, addedAt: new Date().toISOString(), addedBy: "auto" }));
  // The site's own price history (CarGurus), oldest first, as {date, price}.
  const ph = (Array.isArray(d.ph) ? d.ph : []).map(x => ({ date: String(x[0]).slice(0, 10), price: cleanNum(x[1]) }))
    .filter((x): x is { date: string; price: number } => /^\d{4}-\d{2}-\d{2}$/.test(x.date) && !!x.price).sort((a, b) => a.date.localeCompare(b.date));
  if (ph.length) out.priceHistory = ph;
  if (typeof d.dl === "number" && d.dl >= 0 && d.dl < 5000) out.listedSince = new Date(Date.now() - d.dl * 86400_000).toISOString().slice(0, 10);
  if (d.h && typeof d.h === "object") {
    out.history = { damaged: !!d.h.damaged, accidents: !!d.h.accidents, scrapped: !!d.h.scrapped, imported: !!d.h.imported, exported: !!d.h.exported, source: "CarGurus" };
  }
  return out;
}

/**
 * Adds the site's dated price points to ours without rewriting any existing entry: points on dates we don't have are
 * inserted, and an inserted point is skipped when it only repeats the price just before it.
 */
export function mergeHistory(ours: { date: string; price: number }[] = [], site: { date: string; price: number }[] = []) {
  const have = new Set(ours.map(p => p.date));
  const all = [...ours.map(p => ({ ...p, mine: true })), ...site.filter(p => !have.has(p.date)).map(p => ({ ...p, mine: false }))]
    .sort((a, b) => a.date.localeCompare(b.date));
  const out: { date: string; price: number; mine: boolean }[] = [];
  for (const p of all) { const prev = out[out.length - 1]; if (!p.mine && prev && prev.price === p.price) continue; out.push(p); }
  return out.map(({ date, price }) => ({ date, price }));
}

/** What a re-read listing adds to a saved car without overwriting anything the family set. */
export function mergeExtras(car: Partial<Car>, x: Partial<Car>): Record<string, unknown> {
  const upd: Record<string, unknown> = {};
  if (x.equipment?.length && !car.equipment?.length) upd.equipment = x.equipment;
  if (x.acc === "yes" && !car.acc) upd.acc = "yes";
  if (x.cam === "yes" && !car.cam) upd.cam = "yes";
  const have = new Set((car.carfax || []).map(c => c.url));
  const newCf = (x.carfax || []).filter(c => !have.has(c.url));
  if (newCf.length) upd.carfax = [...(car.carfax || []), ...newCf];
  if (x.history && JSON.stringify(x.history) !== JSON.stringify(car.history)) upd.history = x.history;
  if (x.priceHistory?.length) { const m = mergeHistory(car.priceHistory as any, x.priceHistory as any); if (m.length !== (car.priceHistory || []).length) upd.priceHistory = m; }
  if (x.listedSince && x.listedSince !== car.listedSince) upd.listedSince = x.listedSince;
  return upd;
}
