// "Add to Import Hub" bookmark: runs on a listing page in the user's Chrome (which can open the sites, VPN included),
// reads the car's details and photo links, and opens Import Hub with the add-car form prefilled.
// The site itself can't read listing pages (they block other origins), so the reading happens in the browser tab.
import type { Car } from "../data/types";
import { decodeVin } from "./vin";

import { readListing, type ListingData } from "./listingReader";
export { readListing, type ListingData };

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
