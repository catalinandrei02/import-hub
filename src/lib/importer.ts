// "Add to Import Hub" bookmark: runs on a listing page in the user's Chrome (which can open the sites, VPN included),
// reads the car's details and photo links, and opens Import Hub with the add-car form prefilled.
// The site itself can't read listing pages (they block other origins), so the reading happens in the browser tab.
import type { Car } from "../data/types";
import { decodeVin } from "./vin";

export interface ListingData { u: string; t: string; p: string; k: string; y: string; v: string; s: string; l: string; i: string[] }

/**
 * Self-contained on purpose: its source text becomes the bookmark, so it must not use anything from outside the function.
 * With `base` it opens Import Hub; without, it returns what it found (used by the tests).
 */
export function readListing(base?: string): ListingData | void {
  const doc = document;
  const text = (doc.body && doc.body.innerText) || "";
  const flat = (x: any): any[] => (Array.isArray(x) ? x.flatMap(flat) : x && x["@graph"] ? flat(x["@graph"]) : x ? [x] : []);
  const ld: any[] = [];
  doc.querySelectorAll('script[type="application/ld+json"]').forEach(s => { try { ld.push(...flat(JSON.parse(s.textContent || ""))); } catch { /* skip broken blocks */ } });
  const isCar = (o: any) => /Car|Vehicle|Product|Offer/i.test(String([].concat(o && o["@type"]).join(" ")));
  const v: any = ld.find(o => /Car|Vehicle/i.test(String([].concat(o["@type"]).join(" ")))) || ld.find(isCar) || {};
  const offer: any = [].concat(v.offers || (/Offer/.test(String(v["@type"])) ? v : []))[0] || {};
  const meta = (p: string) => { const m = doc.querySelector(`meta[property="${p}"],meta[name="${p}"]`); return (m && m.getAttribute("content")) || ""; };
  const imgs: string[] = [];
  const add = (u: any) => { const s = typeof u === "string" ? u : u && (u.url || u.contentUrl); if (s && /^https?:/.test(s) && !imgs.includes(s)) imgs.push(s); };
  [].concat(v.image || []).forEach(add);
  add(meta("og:image"));
  Array.from(doc.images)
    .filter(im => (im.naturalWidth || im.width) >= 480 && (im.naturalHeight || im.height) >= 300)
    .sort((a, b) => (b.naturalWidth || b.width) - (a.naturalWidth || a.width))
    .forEach(im => add(im.currentSrc || im.src));
  const vinRe = /\b([A-HJ-NPR-Z0-9]{17})\b/;
  const near = text.match(/(?:VIN|NIV|Vehicle Identification)[^A-Z0-9]{0,12}([A-HJ-NPR-Z0-9]{17})/i);
  const vin = String(v.vehicleIdentificationNumber || (near && near[1]) || (text.match(/\bWA1[A-HJ-NPR-Z0-9]{14}\b/) || [])[0] || (text.match(vinRe) || [])[1] || "").toUpperCase();
  const odo = v.mileageFromOdometer || {};
  const kmText = text.match(/([\d][\d\s.,]{2,9})\s*(km|kilom)/i);
  const title = String(v.name || meta("og:title") || doc.title || "").trim();
  const year = String(v.vehicleModelDate || v.modelDate || v.productionDate || (title.match(/\b(19|20)\d{2}\b/) || [""])[0]);
  const seller = offer.seller || v.seller || {};
  const addr = (seller.address && (seller.address.addressLocality || seller.address.addressRegion)) || "";
  const data = {
    u: location.href.split("#")[0], t: title.slice(0, 120), p: String(offer.price || v.price || meta("product:price:amount") || ""),
    k: String(odo.value || (kmText ? kmText[1] : "")), y: year, v: vin.length === 17 ? vin : "",
    s: String(seller.name || "").slice(0, 80), l: String(addr).slice(0, 60), i: imgs.slice(0, 12),
  };
  if (!base) return data;
  window.open(base + "#/cars?add=" + encodeURIComponent(JSON.stringify(data)), "_blank");
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
  const photos = (Array.isArray(d.i) ? d.i : []).map(u => str(u, 600)).filter(u => /^https?:\/\//i.test(u)).slice(0, 12);
  return {
    title: model, year: year && year > 1990 && year < 2100 ? year : null, vin: vin.length === 17 ? vin : "",
    trim: dv.err || dv.trim === "?" ? "" : dv.trim, price: cleanNum(d.p), km: cleanNum(d.k),
    url: /^https?:\/\//i.test(str(d.u, 600)) ? str(d.u, 600) : "", seller: str(d.s, 80), location: str(d.l, 60), photos,
  };
}
